from rest_framework import serializers
from .models import Product, ProductImage, Category

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_main']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']

class ProductSerializer(serializers.ModelSerializer):
    # Incluimos las imágenes anidadas para que React las reciba juntas
    images = ProductImageSerializer(many=True, read_only=True)
    category = CategorySerializer(read_only=True)
    
    # Campo extra para obtener la URL de la foto principal directamente
    main_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'sku', 'price', 'discount_percent', 'final_price', 'description', 'category', 'images', 'main_image']

    def get_main_image(self, obj):
        # Busca la imagen marcada como 'is_main', si no, devuelve la primera, si no, None
        main_img = obj.images.filter(is_main=True).first()
        if not main_img:
            main_img = obj.images.first()
        if main_img:
            return main_img.image.url
        return None