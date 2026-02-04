from django.http import JsonResponse
# 1. ESTA ES LA IMPORTACIÓN CLAVE 👇
# Le dice a Python: "De la misma carpeta (.), archivo models, trae la clase Product"
from .models import Product 

def api_home(request):
    return JsonResponse({"mensaje": "¡El Backend está vivo en Render!"})

def get_products(request):
    # Obtenemos solo los productos activos
    products_queryset = Product.objects.filter(is_active=True)
    
    products_list = []
    
    # Recorremos cada producto para armar el paquetito de datos
    for product in products_queryset:
        
        # LOGICA DE IMAGEN (Adaptada a tus modelos):
        # Buscamos en la tabla relacionada 'images' (definida en related_name='images')
        # Tratamos de sacar la que tenga is_main=True, si no, sacamos la primera que encontremos.
        main_image_obj = product.images.filter(is_main=True).first()
        if not main_image_obj:
            main_image_obj = product.images.first()
            
        # Si encontramos imagen, sacamos su URL, si no, mandamos None
        image_url = main_image_obj.image.url if main_image_obj else None

        products_list.append({
            'id': product.id,
            'name': product.name,
            'price': float(product.price), # Convertimos Decimal a Float para JSON
            'category__name': product.category.name if product.category else "Sin categoría",
            'main_image': image_url, # Aquí va la URL de la imagen real
            'description': product.description
        })

    return JsonResponse(products_list, safe=False)