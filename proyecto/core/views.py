import json
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt
from .models import Product

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