from django.contrib import admin
from django.urls import path
from core.views import (
    get_products, 
    api_home, 
    register_user, 
    create_payment, 
    payment_confirm, 
    payment_final_redirect, 
    get_user_orders, 
    track_order, 
    get_favorites, 
    toggle_favorite
)
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Ruta para los productos (la que usa axios en App.jsx)
    path('api/products/', get_products, name='get_products'),
    
    # === NUEVAS RUTAS PARA INICIAR SESIÓN (JWT) ===
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Ruta para probar si funciona (Home)
    path('', api_home, name='home'),
    path('api/register/', register_user, name='register_user'),
    path('api/payment/create/', create_payment, name='create_payment'),
    path('api/payment/confirm/', payment_confirm, name='payment_confirm'),
    path('api/payment/final-redirect/', payment_final_redirect, name='payment_final_redirect'),
    path('api/orders/', get_user_orders, name='get_user_orders'),
    path('api/track/', track_order, name='track_order'),
    path('api/favorites/', get_favorites, name='get_favorites'),
    path('api/favorites/toggle/', toggle_favorite, name='toggle_favorite'),
]

if settings.DEBUG:
    # Esto permite ver las fotos subidas (media) en localhost
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    # Esto es para los estáticos (CSS/JS del admin)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)