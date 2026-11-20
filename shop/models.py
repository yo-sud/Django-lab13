from django.db import models


class Product(models.Model):
    """Sólo para el administrador y el listado HTTP.

    El carrito NO usa este modelo: trabaja con el catálogo de datos puros
    definido en shop/domain.py.
    """

    sku = models.CharField(max_length=32, unique=True)
    name = models.CharField(max_length=120)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField()

    class Meta:
        ordering = ['sku']

    def __str__(self):
        return f'{self.sku} - {self.name}'
