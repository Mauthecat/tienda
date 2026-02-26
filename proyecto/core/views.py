import json
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt
from .models import Product
import hmac
import hashlib
import uuid
import requests
import os
from urllib.parse import urlencode

# Obtenemos tu modelo de Usuario personalizado
User = get_user_model()

# --- Función 1: Bienvenida ---
def api_home(request):
    return JsonResponse({"mensaje": "¡El Backend está vivo!"})

# --- Función 2: Productos ---
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

# --- Función 3: NUEVA - Registro de Usuarios ---
@csrf_exempt  # Permite que React envíe datos sin bloqueo temporal
def register_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            nombre = data.get('nombre')
            email = data.get('email')
            password = data.get('password')

            # 1. Validar que el email no exista ya
            if User.objects.filter(email=email).exists():
                return JsonResponse({'error': 'Este correo ya está registrado.'}, status=400)

            # 2. Crear el usuario de forma segura (encripta la clave automáticamente)
            user = User.objects.create_user(
                username=email,  # Usamos el email como nombre de usuario internamente
                email=email,
                password=password,
                first_name=nombre
            )
            return JsonResponse({'mensaje': '¡Cuenta creada con éxito!'}, status=201)
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
            
    return JsonResponse({'error': 'Método no permitido'}, status=405)

# --- Función 4: Crear link de pago en Flow ---
@csrf_exempt
def create_payment(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            # React nos enviará el monto total y el correo del cliente
            amount = int(data.get('amount', 0))
            email = data.get('email', 'cliente@policromica.cl')

            # 1. Configuración de Flow Sandbox
            api_key = os.environ.get("FLOW_API_KEY")
            secret_key = os.environ.get("FLOW_SECRET_KEY")
            api_url = "https://sandbox.flow.cl/api"

            # 2. Generamos un número de orden único temporal
            commerce_order = str(uuid.uuid4())[:20] 

            # 3. Preparamos los datos exigidos por Flow
            params = {
                "apiKey": api_key,
                "commerceOrder": commerce_order,
                "subject": "Compra en Policrómica",
                "currency": "CLP",
                "amount": amount,
                "email": email,
                # urlConfirmation: La ruta oculta donde Flow le avisa a Django que el pago fue exitoso
                "urlConfirmation": "https://tienda-backend-fn64.onrender.com/api/payment/confirm/", 
                # urlReturn: A donde vuelve el cliente después de pagar
                "urlReturn": "https://policromica.vercel.app/checkout/status", 
            }

            # 4. Firmamos los parámetros (Seguridad estricta de Flow)
            sorted_params = sorted(params.items(), key=lambda x: x[0])
            to_sign = "".join([f"{key}{value}" for key, value in sorted_params])
            signature = hmac.new(secret_key.encode(), to_sign.encode(), hashlib.sha256).hexdigest()
            params["s"] = signature

            # 5. Enviamos la petición a Flow
            encoded_body = urlencode(params)
            response = requests.post(f"{api_url}/payment/create", data=encoded_body, headers={'Content-Type':'application/x-www-form-urlencoded'})
            
            if response.status_code == 200:
                flow_data = response.json()
                # Unimos la URL base con el Token único para redirigir al cliente
                payment_url = f"{flow_data['url']}?token={flow_data['token']}"
                return JsonResponse({'url': payment_url}, status=200)
            else:
                return JsonResponse({'error': 'Error comunicando con Flow', 'details': response.text}, status=400)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
            
    return JsonResponse({'error': 'Método no permitido'}, status=405)


# --- Función 5: Recibir la confirmación secreta de Flow ---
@csrf_exempt
def payment_confirm(request):
    """Flow enviará un POST aquí cuando el cliente pague exitosamente"""
    if request.method == 'POST':
        # Flow nos envía un token para que verifiquemos el estado real del pago
        token = request.POST.get('token')
        
        if token:
            print(f"¡Pago recibido en Flow! Token: {token}")
            # En el futuro, aquí usaremos el token para marcar la Order como 'Pagado' en la Base de Datos
            return JsonResponse({'status': 'ok'}, status=200)
            
    return JsonResponse({'error': 'Método no permitido'}, status=400)