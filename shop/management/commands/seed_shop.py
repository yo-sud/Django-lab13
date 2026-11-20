from django.core.management.base import BaseCommand

from shop.domain import PRODUCTS
from shop.models import Product


class Command(BaseCommand):
    help = 'Carga el catálogo de la tienda en la base de datos.'

    def handle(self, *args, **options):
        for product in PRODUCTS.values():
            Product.objects.update_or_create(
                sku=product.sku,
                defaults={
                    'name': product.name,
                    'price': product.price,
                    'stock': product.stock,
                },
            )
        self.stdout.write(self.style.SUCCESS(f'Catálogo cargado: {len(PRODUCTS)} productos.'))
