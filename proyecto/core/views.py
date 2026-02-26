from django.http import JsonResponse
from .models import Product

# --- Función 1: Bienvenida (La que te faltaba) ---
def api_home(request):
    return JsonResponse({"mensaje": "¡El Backend está vivo!"})

# --- Función 2: Productos (La que arreglamos antes) ---
def get_products(request):
    # Obtenemos solo los productos activos
    products_queryset = Product.objects.filter(is_active=True)
    
    products_list = []
    
    for product in products_queryset:
        # Lógica para sacar la imagen principal
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