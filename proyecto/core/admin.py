from django.contrib import admin
from .models import User, Category, Product, ProductImage, Order, OrderItem, Address, Shipment, Payment, ContactMessage

# 1. Configuración para ver las imágenes DENTRO del producto
class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1  # Cuántos espacios vacíos muestra por defecto

# 2. Configuración del Producto
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'sku', 'price', 'stock', 'active_status') # Qué columnas ver en la lista
    search_fields = ('name', 'sku') # Barra de búsqueda
    list_filter = ('category',) # Filtro lateral
    inlines = [ProductImageInline] # Aquí metemos las imágenes

    # Pequeño truco para mostrar íconos o texto custom
    def active_status(self, obj):
        return obj.is_active
    active_status.boolean = True # Muestra un check verde si es True

# 3. Configuración de Categorías
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'parent')
    prepopulated_fields = {'slug': ('name',)} # Rellena el slug automáticamente al escribir el nombre

# 4. Configuración de Órdenes (Para verlas claritas)
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    readonly_fields = ('unit_price',) # Para que nadie cambie el precio histórico por error
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'status', 'total_amount', 'created_at')
    list_filter = ('status', 'created_at')
    inlines = [OrderItemInline] # Ver los items dentro de la orden

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('subject', 'name', 'email', 'created_at', 'is_read')
    list_filter = ('is_read', 'created_at')
    search_fields = ('name', 'email', 'subject')
    list_editable = ('is_read',) # Permite marcar como leído desde la lista

# 5. Registros simples para el resto
admin.site.register(User)
admin.site.register(Address)
admin.site.register(Shipment)
admin.site.register(Payment)