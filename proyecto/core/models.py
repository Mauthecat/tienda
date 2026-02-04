from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.text import slugify

# ==========================================
# 1. USUARIOS Y CLIENTES
# ==========================================

class User(AbstractUser):
    """
    Extendemos el usuario base de Django.
    Ya incluye: username, password, first_name, last_name, email, is_staff, date_joined.
    Agregamos lo que falta según tu diagrama.
    """
    email = models.EmailField(unique=True) # Forzamos que sea único
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="Teléfono")

    def __str__(self):
        return self.username

class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    street_address = models.CharField(max_length=255, verbose_name="Calle y Número")
    city = models.CharField(max_length=100, verbose_name="Ciudad")
    state = models.CharField(max_length=100, verbose_name="Región/Estado")
    zip_code = models.CharField(max_length=20, verbose_name="Código Postal")
    is_default = models.BooleanField(default=False, verbose_name="Es dirección principal")

    class Meta:
        verbose_name_plural = "Addresses"

    def __str__(self):
        return f"{self.street_address}, {self.city}"

# ==========================================
# 2. CATÁLOGO DE PRODUCTOS
# ==========================================

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True) # URL amigable
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='subcategories')

    class Meta:
        verbose_name_plural = "Categories"

    def save(self, *args, **kwargs):
        # Generar slug automáticamente si no existe (ej: "Aros Plata" -> "aros-plata")
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        full_path = [self.name]
        k = self.parent
        while k is not None:
            full_path.append(k.name)
            k = k.parent
        return ' -> '.join(full_path[::-1])

class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    sku = models.CharField(max_length=50, unique=True, verbose_name="Código SKU")
    name = models.CharField(max_length=200, verbose_name="Nombre")
    description = models.TextField(blank=True, verbose_name="Descripción")
    # DecimalField es OBLIGATORIO para dinero (Float pierde centavos en matemáticas)
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio")
    stock = models.PositiveIntegerField(default=0)
    discount_percent = models.PositiveIntegerField(default=0, verbose_name="% Descuento")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sku} - {self.name}"

    @property
    def final_price(self):
        # Propiedad calculada para usar en el frontend
        if self.discount_percent > 0:
            return self.price * (1 - self.discount_percent / 100)
        return self.price

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/', verbose_name="Imagen")
    is_main = models.BooleanField(default=False, verbose_name="Es portada")

    def __str__(self):
        return f"Img: {self.product.name}"

# ==========================================
# 3. VENTAS Y PEDIDOS
# ==========================================

class Order(models.Model):
    class StatusChoices(models.TextChoices):
        PENDING = 'pendiente', 'Pendiente'
        PAID = 'pagado', 'Pagado'
        SHIPPED = 'enviado', 'Enviado'
        DELIVERED = 'entregado', 'Entregado'
        CANCELED = 'cancelado', 'Cancelado'

    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name='orders')
    # Usamos PROTECT para no borrar la orden si se borra la dirección del usuario
    shipping_address = models.ForeignKey(Address, on_delete=models.PROTECT, null=True) 
    status = models.CharField(max_length=20, choices=StatusChoices.choices, default=StatusChoices.PENDING)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Orden #{self.id} - {self.user.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    # Guardamos el precio al momento de la compra para historial
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    def save(self, *args, **kwargs):
        # Si no se especifica precio, usar el actual del producto
        if not self.unit_price:
            self.unit_price = self.product.final_price if hasattr(self.product, 'final_price') else self.product.price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"

# ==========================================
# 4. ENVÍOS Y PAGOS
# ==========================================

class Shipment(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='shipment')
    tracking_number = models.CharField(max_length=100, blank=True)
    courier = models.CharField(max_length=50, verbose_name="Transportista (Starken/Chilexpress)")
    shipped_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Envío #{self.order.id}"

class Payment(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    payment_method = models.CharField(max_length=50) # Ej: Webpay
    transaction_id = models.CharField(max_length=100, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20) # Ej: Aprobado
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Pago {self.transaction_id}"

# ==========================================
# 5. INTERACCIÓN
# ==========================================

class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product') # Evita duplicados (no puedes dar like 2 veces)