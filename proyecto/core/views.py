import json
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, redirect
# IMPORTANTE: Ahora importamos Address para la dirección de envío
from .models import Product, Order, OrderItem, Favorite, Address
import hmac
import hashlib
import uuid
import requests
import os
from urllib.parse import urlencode

User = get_user_model()

def api_home(request):
    return JsonResponse({"mensaje": "¡El Backend está vivo!"})

def get_products(request):
    products_queryset = Product.objects.filter(is_active=True)
    products_list = []
    for product in products_queryset:
        main_image_obj = product.images.filter(is_main=True).first()
        if not main_image_obj:
            main_image_obj = product.images.first()
            
        image_url = main_image_obj.image.url if main_image_obj else None
        all_images = [img.image.url for img in product.images.all()]
        products_list.append({
            'id': product.id,
            'name': product.name,
            'price': float(product.price),
            'stock': product.stock,
            'category__name': product.category.name if product.category else "Sin categoría", # <-- LÍNEA NUEVA
            'main_image': image_url,
            'all_images': all_images,
            'description': product.description
        })
    return JsonResponse(products_list, safe=False)

@csrf_exempt
def register_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            nombre = data.get('nombre')
            email = data.get('email')
            password = data.get('password')

            if User.objects.filter(email=email).exists():
                return JsonResponse({'error': 'Este correo ya está registrado.'}, status=400)

            user = User.objects.create_user(username=email, email=email, password=password, first_name=nombre)
            return JsonResponse({'mensaje': '¡Cuenta creada con éxito!'}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Método no permitido'}, status=405)


# --- ACTUALIZADO: AHORA GUARDA DIRECCIÓN Y PRODUCTOS ---
@csrf_exempt
def create_payment(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            amount = int(data.get('amount', 0))
            email = data.get('email', 'cliente@policromica.cl')
            cart_items = data.get('cart', [])
            shipping_data = data.get('shipping', {})
            
            # 1. Buscamos al usuario o le creamos una cuenta "fantasma"
            nombre_cliente = f"{shipping_data.get('nombre', '')} {shipping_data.get('apellido', '')}".strip() or 'Cliente Invitado'
            user, created = User.objects.get_or_create(
                email=email,
                defaults={'username': email, 'first_name': nombre_cliente}
            )

            # 2. Guardamos su dirección de envío
            address = Address.objects.create(
                user=user,
                street_address=shipping_data.get('direccion', 'Sin dirección'),
                city=shipping_data.get('ciudad', 'Sin ciudad'),
                state='N/A', # Dejamos N/A por si más adelante quieres pedir región
                zip_code='0000000',
            )

            # 3. Creamos la Orden vinculando la dirección
            order = Order.objects.create(
                user=user,
                shipping_address=address,
                total_amount=amount,
                status=Order.StatusChoices.PENDING
            )

            # 4. Guardamos cada producto que estaba en el carrito
            for item in cart_items:
                try:
                    product = Product.objects.get(id=item['id'])
                    # La base de datos (models.py) calcula el unit_price automáticamente al guardar
                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        quantity=item['quantity']
                    )
                except Product.DoesNotExist:
                    continue
            
            commerce_order = f"POLI-{order.id}"

            api_key = os.environ.get("FLOW_API_KEY")
            secret_key = os.environ.get("FLOW_SECRET_KEY")
            api_url = "https://sandbox.flow.cl/api"

            params = {
                "apiKey": api_key,
                "commerceOrder": commerce_order,
                "subject": f"Pedido {commerce_order} en Policrómica",
                "currency": "CLP",
                "amount": amount,
                "email": email,
                "urlConfirmation": "https://tienda-backend-fn64.onrender.com/api/payment/confirm/", 
                "urlReturn": "https://tienda-backend-fn64.onrender.com/api/payment/final-redirect/", 
            }

            sorted_params = sorted(params.items(), key=lambda x: x[0])
            to_sign = "".join([f"{key}{value}" for key, value in sorted_params])
            signature = hmac.new(secret_key.encode(), to_sign.encode(), hashlib.sha256).hexdigest()
            params["s"] = signature

            encoded_body = urlencode(params)
            response = requests.post(f"{api_url}/payment/create", data=encoded_body, headers={'Content-Type':'application/x-www-form-urlencoded'})
            
            if response.status_code == 200:
                flow_data = response.json()
                payment_url = f"{flow_data['url']}?token={flow_data['token']}"
                return JsonResponse({'url': payment_url}, status=200)
            else:
                return JsonResponse({'error': 'Error comunicando con Flow', 'details': response.text}, status=400)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Método no permitido'}, status=405)


# --- ACTUALIZADO: CIERRE DE COMPRA Y DESCUENTO DE STOCK ---
@csrf_exempt
def payment_confirm(request):
    """Flow avisa en secreto que se pagó. Aquí descontamos stock."""
    if request.method == 'POST':
        token = request.POST.get('token')
        if token:
            api_key = os.environ.get("FLOW_API_KEY")
            secret_key = os.environ.get("FLOW_SECRET_KEY")
            
            # 1. Le preguntamos a Flow el estado real del token
            params = {"apiKey": api_key, "token": token}
            sorted_params = sorted(params.items(), key=lambda x: x[0])
            to_sign = "".join([f"{key}{value}" for key, value in sorted_params])
            params["s"] = hmac.new(secret_key.encode(), to_sign.encode(), hashlib.sha256).hexdigest()
            
            res = requests.get("https://sandbox.flow.cl/api/payment/getStatus", params=params)
            
            if res.status_code == 200:
                flow_data = res.json()
                status = flow_data.get('status') # Flow Status: 2 es Pagado
                order_id_str = flow_data.get('commerceOrder', '') # Ej: "POLI-15"
                
                # 2. Si realmente se pagó y es nuestra orden...
                if status == 2 and order_id_str.startswith('POLI-'):
                    order_id = int(order_id_str.replace('POLI-', ''))
                    try:
                        order = Order.objects.get(id=order_id)
                        
                        # Evitamos ejecutar esto dos veces si Flow manda doble aviso
                        if order.status != Order.StatusChoices.PAID:
                            order.status = Order.StatusChoices.PAID
                            order.save()
                            
                            # 3. ¡Descontar Stock en los productos!
                            for item in order.items.all():
                                product = item.product
                                if product.stock >= item.quantity:
                                    product.stock -= item.quantity
                                else:
                                    product.stock = 0 # Prevenir stock negativo
                                product.save()
                                
                    except Order.DoesNotExist:
                        pass
                        
            return JsonResponse({'status': 'ok'}, status=200)
    return JsonResponse({'error': 'Método no permitido'}, status=400)


@csrf_exempt
def payment_final_redirect(request):
    """Redirige a React y averigua el número de orden usando el Token"""
    if request.method == 'POST':
        token = request.POST.get('token')
        frontend_url = "https://policromica.vercel.app/checkout/status"
        
        if token:
            # Le preguntamos a Flow qué orden le corresponde a este token
            api_key = os.environ.get("FLOW_API_KEY")
            secret_key = os.environ.get("FLOW_SECRET_KEY")
            params = {"apiKey": api_key, "token": token}
            sorted_params = sorted(params.items(), key=lambda x: x[0])
            to_sign = "".join([f"{key}{value}" for key, value in sorted_params])
            params["s"] = hmac.new(secret_key.encode(), to_sign.encode(), hashlib.sha256).hexdigest()
            
            res = requests.get(f"https://sandbox.flow.cl/api/payment/getStatus", params=params)
            order_id = ""
            if res.status_code == 200:
                order_id = res.json().get('commerceOrder', '')

            return redirect(f"{frontend_url}?token={token}&order={order_id}")
        
        return redirect(frontend_url)
    return redirect("https://policromica.vercel.app")


# --- FUNCIONES PARA EL PERFIL Y RASTREO ---

@csrf_exempt
def get_user_orders(request):
    """Devuelve el historial de pedidos de un correo"""
    email = request.GET.get('email')
    if not email:
        return JsonResponse([], safe=False)
    
    orders = Order.objects.filter(user__email=email).order_by('-created_at')
    data = []
    for o in orders:
        data.append({
            'order_number': f"POLI-{o.id}",
            'status': o.get_status_display(),
            'total': float(o.total_amount),
            'date': o.created_at.strftime("%d/%m/%Y")
        })
    return JsonResponse(data, safe=False)

@csrf_exempt
def track_order(request):
    """Busca una orden por su código POLI-XXX"""
    order_code = request.GET.get('code', '').upper().replace('POLI-', '')
    try:
        order = Order.objects.get(id=order_code)
        return JsonResponse({
            'success': True,
            'order_number': f"POLI-{order.id}",
            'status': order.get_status_display(),
            'total': float(order.total_amount),
            'date': order.created_at.strftime("%d/%m/%Y")
        })
    except (Order.DoesNotExist, ValueError):
        return JsonResponse({'success': False, 'error': 'Pedido no encontrado'})
    
@csrf_exempt
def get_favorites(request):
    """Obtiene los favoritos de un usuario"""
    email = request.GET.get('email')
    if not email:
        return JsonResponse([], safe=False)
    
    favorites = Favorite.objects.filter(user__email=email).select_related('product')
    products_list = []
    
    for fav in favorites:
        product = fav.product
        main_image_obj = product.images.filter(is_main=True).first()
        if not main_image_obj:
            main_image_obj = product.images.first()
            
        image_url = main_image_obj.image.url if main_image_obj else None
        
        products_list.append({
            'id': product.id,
            'name': product.name,
            'price': float(product.price),
            'stock': product.stock,
            'image': image_url,
        })

    return JsonResponse(products_list, safe=False)

@csrf_exempt
def toggle_favorite(request):
    """Agrega o quita un producto de favoritos (Interruptor)"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            product_id = data.get('product_id')
            
            if not email or not product_id:
                return JsonResponse({'error': 'Faltan datos'}, status=400)

            user = User.objects.get(email=email)
            product = Product.objects.get(id=product_id)
            
            fav, created = Favorite.objects.get_or_create(user=user, product=product)
            
            if not created:
                fav.delete()
                return JsonResponse({'status': 'removed'}, status=200)
                
            return JsonResponse({'status': 'added'}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Método no permitido'}, status=405)