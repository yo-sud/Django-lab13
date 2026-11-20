from rest_framework import serializers

from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    """Categoría compacta, reutilizable dentro del producto."""

    class Meta:
        model = Category
        fields = ['id', 'name', 'description']
        read_only_fields = ['id']


class ProductSerializer(serializers.ModelSerializer):
    # Lectura: la categoría va anidada, así el listado no exige otra petición.
    category = CategorySerializer(read_only=True)
    # Escritura: el cliente envía sólo el id de la categoría.
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True,
    )
    # URL absoluta de la imagen, lista para usar en una etiqueta <img>.
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'description',
            'price',
            'stock',
            'image',
            'image_url',
            'category',
            'category_id',
        ]
        read_only_fields = ['id']

    def get_image_url(self, obj):
        if not obj.image:
            return None
        request = self.context.get('request')
        if request is not None:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url
