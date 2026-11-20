from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.filters import SearchFilter

from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    """CRUD de categorías para alimentar el filtro del catálogo."""

    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    search_fields = ['name']
    filter_backends = [SearchFilter]


class ProductViewSet(viewsets.ModelViewSet):
    """CRUD de productos con la categoría anidada en cada respuesta."""

    queryset = Product.objects.select_related('category').all()
    serializer_class = ProductSerializer
    filterset_fields = ['category']
    search_fields = ['name', 'description']
    filter_backends = [DjangoFilterBackend, SearchFilter]
