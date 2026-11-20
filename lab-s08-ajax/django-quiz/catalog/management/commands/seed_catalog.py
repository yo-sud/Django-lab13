"""Carga datos de ejemplo del catálogo: 3 categorías y 8 productos con imagen."""

from io import BytesIO
from pathlib import Path

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from PIL import Image, ImageDraw

from catalog.models import Category, Product

CATEGORIES = [
    {
        'name': 'Bebidas',
        'description': 'Líquidos listos para consumir, fríos o calientes.',
    },
    {
        'name': 'Snacks',
        'description': 'Productos salados y dulces para consumir entre comidas.',
    },
    {
        'name': 'Panadería',
        'description': 'Panes y bollería elaborados diariamente.',
    },
]

PRODUCTS = [
    {'name': 'Agua mineral 500 ml', 'price': '1.50', 'stock': 40, 'category': 'Bebidas', 'color': (86, 156, 214)},
    {'name': 'Refresco de naranja', 'price': '2.75', 'stock': 25, 'category': 'Bebidas', 'color': (240, 165, 30)},
    {'name': 'Café en grano 250 g', 'price': '7.90', 'stock': 12, 'category': 'Bebidas', 'color': (110, 70, 45)},
    {'name': 'Té verde 20 bolsitas', 'price': '3.20', 'stock': 30, 'category': 'Bebidas', 'color': (105, 165, 95)},
    {'name': 'Patatas fritas 150 g', 'price': '2.40', 'stock': 18, 'category': 'Snacks', 'color': (225, 185, 60)},
    {'name': 'Galletas de chocolate', 'price': '3.10', 'stock': 22, 'category': 'Snacks', 'color': (150, 100, 65)},
    {'name': 'Pan integral 500 g', 'price': '2.90', 'stock': 15, 'category': 'Panadería', 'color': (175, 130, 85)},
    {'name': 'Croissant de mantequilla', 'price': '1.80', 'stock': 9, 'category': 'Panadería', 'color': (222, 180, 110)},
]


def make_image(name, color):
    """Genera una imagen PNG sencilla para que el producto tenga foto real."""
    image = Image.new('RGB', (640, 480), color)
    draw = ImageDraw.Draw(image)
    draw.rectangle([0, 360, 640, 480], fill=(250, 250, 250))
    draw.text((24, 400), name[:38], fill=(35, 35, 35))
    buffer = BytesIO()
    image.save(buffer, format='PNG')
    return ContentFile(buffer.getvalue(), name=f"{slugify(name)}.png")


class Command(BaseCommand):
    help = 'Carga tres categorías y ocho productos con imagen en el catálogo.'

    def handle(self, *args, **options):
        media_dir = Path(settings.MEDIA_ROOT) / 'products'
        media_dir.mkdir(parents=True, exist_ok=True)

        for item in CATEGORIES:
            Category.objects.update_or_create(
                name=item['name'],
                defaults={'description': item['description']},
            )

        for item in PRODUCTS:
            category = Category.objects.get(name=item['category'])
            filename = f"{slugify(item['name'])}.png"
            image_path = media_dir / filename
            if not image_path.exists():
                image_path.write_bytes(make_image(item['name'], item['color']).read())

            Product.objects.update_or_create(
                name=item['name'],
                defaults={
                    'description': f"{item['name']} de la categoría {category.name}.",
                    'price': item['price'],
                    'stock': item['stock'],
                    'category': category,
                    'image': f'products/{filename}',
                },
            )

        self.stdout.write(
            self.style.SUCCESS(
                f'Catálogo cargado: {len(CATEGORIES)} categorías y {len(PRODUCTS)} productos.'
            )
        )
