from django.contrib import admin
from django.urls import path
from core.views import get_products, api_home # Importamos ambas funciones
from django.conf import settings
from django.conf.urls.static import static
urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Ruta para los productos (la que usa axios en App.jsx)
    path('api/products/', get_products, name='get_products'),
    
    # Ruta para probar si funciona (Home)
    path('', api_home, name='home'), 
]
if settings.DEBUG:
    # Esto permite ver las fotos subidas (media) en localhost
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    # Esto es para los estáticos (CSS/JS del admin)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)