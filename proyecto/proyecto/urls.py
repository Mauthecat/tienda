from django.contrib import admin
from django.urls import path
from core.views import get_products, api_home # Importamos ambas funciones

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Ruta para los productos (la que usa axios en App.jsx)
    path('api/products/', get_products, name='get_products'),
    
    # Ruta para probar si funciona (Home)
    path('', api_home, name='home'), 
]
# ... el resto de static settings igual ...