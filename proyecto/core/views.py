import json
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, redirect
from .models import Product, Order, OrderItem, Favorite, Address, Shipment, ContactMessage
from datetime import timedelta
from django.utils import timezone
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
            'category__name': product.category.name if product.category else "Sin categoría",
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


@csrf_exempt
def create_payment(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            amount = int(data.get('amount', 0))
            email = data.get('email', 'cliente@policromica.cl')
            cart_items = data.get('cart', [])
            shipping_data = data.get('shipping', {})
            
            nombre_cliente = f"{shipping_data.get('nombre', '')} {shipping_data.get('apellido', '')}".strip() or 'Cliente Invitado'
            user, created = User.objects.get_or_create(
                email=email,
                defaults={'username': email, 'first_name': nombre_cliente}
            )

            address = Address.objects.create(
                user=user,
                street_address=shipping_data.get('direccion', 'Sin dirección'),
                city=shipping_data.get('ciudad', 'Sin ciudad'),
                state='N/A',
                zip_code='0000000',
            )

            order = Order.objects.create(
                user=user,
                shipping_address=address,
                total_amount=amount,
                status=Order.StatusChoices.PENDING
            )

            for item in cart_items:
                try:
                    product = Product.objects.get(id=item['id'])
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


@csrf_exempt
def payment_confirm(request):
    if request.method == 'POST':
        token = request.POST.get('token')
        if token:
            api_key = os.environ.get("FLOW_API_KEY")
            secret_key = os.environ.get("FLOW_SECRET_KEY")
            
            params = {"apiKey": api_key, "token": token}
            sorted_params = sorted(params.items(), key=lambda x: x[0])
            to_sign = "".join([f"{key}{value}" for key, value in sorted_params])
            params["s"] = hmac.new(secret_key.encode(), to_sign.encode(), hashlib.sha256).hexdigest()
            
            res = requests.get("https://sandbox.flow.cl/api/payment/getStatus", params=params)
            
            if res.status_code == 200:
                flow_data = res.json()
                status = flow_data.get('status')
                order_id_str = flow_data.get('commerceOrder', '')
                
                if status == 2 and order_id_str.startswith('POLI-'):
                    order_id = int(order_id_str.replace('POLI-', ''))
                    try:
                        order = Order.objects.get(id=order_id)
                        
                        if order.status != Order.StatusChoices.PAID:
                            order.status = Order.StatusChoices.PAID
                            order.save()
                            
                            for item in order.items.all():
                                product = item.product
                                if product.stock >= item.quantity:
                                    product.stock -= item.quantity
                                else:
                                    product.stock = 0
                                product.save()
                                
                    except Order.DoesNotExist:
                        pass
                        
            return JsonResponse({'status': 'ok'}, status=200)
    return JsonResponse({'error': 'Método no permitido'}, status=400)


@csrf_exempt
def payment_final_redirect(request):
    if request.method == 'POST':
        token = request.POST.get('token')
        frontend_url = "https://policromica.vercel.app/checkout/status"
        
        if token:
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

# NUEVA FUNCIÓN: REINTENTAR PAGO DE ORDEN EXISTENTE
@csrf_exempt
def retry_payment(request):
    """Recibe un ID de orden existente, verifica que esté PENDIENTE y genera un nuevo token de Flow"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            order_id = data.get('order_id')
            email = data.get('email')

            if not order_id or not email:
                return JsonResponse({'error': 'Faltan datos'}, status=400)

            # Buscamos la orden asegurándonos que pertenezca al usuario y esté PENDIENTE
            order = Order.objects.get(id=order_id, user__email=email, status=Order.StatusChoices.PENDING)
            
            # Verificamos si la orden ya expiró (más de 6 horas)
            expiration_threshold = timezone.now() - timedelta(hours=6)
            if order.created_at < expiration_threshold:
                return JsonResponse({'error': 'Esta orden ha expirado por inactividad. Por favor, realiza un nuevo pedido.'}, status=400)

            commerce_order = f"POLI-{order.id}"
            amount = int(order.total_amount)

            api_key = os.environ.get("FLOW_API_KEY")
            secret_key = os.environ.get("FLOW_SECRET_KEY")
            api_url = "https://sandbox.flow.cl/api"

            params = {
                "apiKey": api_key,
                "commerceOrder": commerce_order,
                "subject": f"Reintento Pago Pedido {commerce_order} en Policrómica",
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
                return JsonResponse({'error': 'Error reintentando pago con Flow', 'details': response.text}, status=400)

        except Order.DoesNotExist:
            return JsonResponse({'error': 'Orden no encontrada o ya pagada'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
            
    return JsonResponse({'error': 'Método no permitido'}, status=405)


# --- FUNCIONES PARA EL PERFIL, AJUSTES Y RASTREO ---

@csrf_exempt
def get_user_profile(request):
    """Obtiene los datos del perfil para editarlos"""
    email = request.GET.get('email')
    if not email:
        return JsonResponse({'error': 'Faltan datos'}, status=400)
    try:
        user = User.objects.get(email=email)
        address = user.addresses.first()
        return JsonResponse({
            'nombre': user.first_name,
            'telefono': user.phone or '',
            'direccion': address.street_address if address else '',
            'ciudad': address.city if address else '',
        }, status=200)
    except User.DoesNotExist:
        return JsonResponse({'error': 'Usuario no encontrado'}, status=404)

@csrf_exempt
def update_user_profile(request):
    """Guarda los cambios del perfil en la BD"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            if not email:
                return JsonResponse({'error': 'Faltan datos'}, status=400)
            
            user = User.objects.get(email=email)
            user.first_name = data.get('nombre', user.first_name)
            user.phone = data.get('telefono', user.phone)
            user.save()
            
            addr_str = data.get('direccion')
            city_str = data.get('ciudad')
            
            if addr_str or city_str:
                address = user.addresses.first()
                if address:
                    address.street_address = addr_str or address.street_address
                    address.city = city_str or address.city
                    address.save()
                else:
                    Address.objects.create(
                        user=user,
                        street_address=addr_str or 'Sin dirección',
                        city=city_str or 'Sin ciudad',
                        state='N/A',
                        zip_code='0000000'
                    )
            return JsonResponse({'success': True, 'mensaje': 'Datos guardados'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Método no permitido'}, status=405)


@csrf_exempt
def get_user_orders(request):
    email = request.GET.get('email')
    if not email:
        return JsonResponse([], safe=False)
    
    orders = Order.objects.filter(user__email=email).order_by('-created_at')
    data = []
    
    # Lógica para determinar si la orden expiró
    expiration_threshold = timezone.now() - timedelta(hours=6)

    for o in orders:
        is_pending = o.status == Order.StatusChoices.PENDING
        is_expired = is_pending and o.created_at < expiration_threshold

        data.append({
            'id': o.id, # Necesitamos el ID crudo para el reintento
            'order_number': f"POLI-{o.id}",
            'status': o.get_status_display(),
            'total': float(o.total_amount),
            'date': o.created_at.strftime("%d/%m/%Y"),
            'raw_status': o.status, # 'pendiente', 'pagado', etc.
            'is_expired': is_expired
        })
    return JsonResponse(data, safe=False)

@csrf_exempt
def track_order(request):
    """Devuelve los datos completos del pedido para la vista de Envios"""
    order_code = request.GET.get('code', '').upper().replace('POLI-', '')
    try:
        # Seleccionamos también el usuario y la dirección
        order = Order.objects.select_related('user', 'shipping_address').get(id=order_code)
        
        courier = "Pendiente de asignación"
        tracking_number = "N/A"
        
        # Revisamos si el admin ya le asignó un código de envío (Shipment)
        if hasattr(order, 'shipment'):
            courier = order.shipment.courier or courier
            tracking_number = order.shipment.tracking_number or tracking_number

        address_str = f"{order.shipping_address.street_address}, {order.shipping_address.city}" if order.shipping_address else "Retiro en tienda / No especificada"

        # Verificamos si la orden ya expiró (más de 6 horas)
        expiration_threshold = timezone.now() - timedelta(hours=6)
        is_expired = order.status == Order.StatusChoices.PENDING and order.created_at < expiration_threshold

        return JsonResponse({
            'success': True,
            'id': order.id,
            'email': order.user.email, # Necesitamos esto para el reintento desde el track
            'order_number': f"POLI-{order.id}",
            'status': order.get_status_display(),
            'total': float(order.total_amount),
            'date': order.created_at.strftime("%d/%m/%Y"),
            'customer_name': order.user.first_name or order.user.username,
            'address': address_str,
            'courier': courier,
            'tracking_number': tracking_number,
            'raw_status': order.status,
            'is_expired': is_expired
        })
    except (Order.DoesNotExist, ValueError):
        return JsonResponse({'success': False, 'error': 'Pedido no encontrado'})
    
@csrf_exempt
def get_favorites(request):
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
            'category__name': product.category.name if product.category else "Sin categoría",
            'image': image_url,
        })

    return JsonResponse(products_list, safe=False)

@csrf_exempt
def toggle_favorite(request):
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

@csrf_exempt
def submit_contact_message(request):
    """Guarda un mensaje de contacto en la base de datos"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            nombre = data.get('nombre')
            email = data.get('email')
            asunto = data.get('asunto')
            mensaje = data.get('mensaje')

            if not all([nombre, email, asunto, mensaje]):
                return JsonResponse({'error': 'Todos los campos son obligatorios'}, status=400)

            ContactMessage.objects.create(
                name=nombre,
                email=email,
                subject=asunto,
                message=mensaje
            )
            return JsonResponse({'success': True, 'mensaje': 'Mensaje guardado con éxito'}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Método no permitido'}, status=405)