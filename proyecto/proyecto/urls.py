from django.contrib import admin
from django.urls import path
from django.http import JsonResponse # <--- Importa esto
from django.conf import settings
from django.conf.urls.static import static
from core.views import get_products

# Una vista simple que responde un JSON de bienvenida
def home_view(request):
    return JsonResponse({"mensaje": "¡El Backend de Django está vivo!", "estado": "OK"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/products/', get_products, name='get_products'),
    
    # Agregamos la ruta vacía ('') para el Home
    path('', home_view), 
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)