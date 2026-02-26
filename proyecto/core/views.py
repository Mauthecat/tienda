import json
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, redirect
from .models import Product, Order, OrderItem
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


# --- ACTUALIZADO: CREA LA ORDEN EN LA BD ANTES DE PAGAR ---
@csrf_exempt
def create_payment(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            amount = int(data.get('amount', 0))
            email = data.get('email', 'cliente@policromica.cl')
            
            # 1. Buscamos al usuario o le creamos una cuenta "fantasma" para asociar el pedido
            user, created = User.objects.get_or_create(
                email=email,
                defaults={'username': email, 'first_name': 'Cliente Invitado'}
            )

            # 2. CREAMOS LA ORDEN REAL EN LA BASE DE DATOS
            order = Order.objects.create(
                user=user,
                total_amount=amount,
                status=Order.StatusChoices.PENDING
            )
            
            # El número de orden para Flow y para el cliente (Ej: POLI-15)
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
    """Aquí se actualiza la BD a PAGADO cuando Flow avisa en secreto"""
    if request.method == 'POST':
        token = request.POST.get('token')
        if token:
            # En producción, aquí haríamos un GET a Flow para verificar el token 
            # y cambiaríamos order.status = 'pagado'
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

            # Enviamos al cliente a React con su número de orden real
            return redirect(f"{frontend_url}?token={token}&order={order_id}")
        
        return redirect(frontend_url)
    return redirect("https://policromica.vercel.app")


# --- NUEVAS FUNCIONES PARA EL PERFIL Y RASTREO ---

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