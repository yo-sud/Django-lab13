"""Datos puros de la tienda: sin ORM, sin request, sin sesión.

El carrito recibe un ``Catalog`` de este módulo. Así las reglas se pueden
probar con unittest y no dependen de Django ni de la base de datos.
"""

from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP

CENT = Decimal('0.01')
IGV_RATE = Decimal('0.18')


class DomainError(ValueError):
    """Regla de negocio incumplida."""


def money(value):
    """Todo importe se redondea a 2 decimales con ROUND_HALF_UP."""
    return Decimal(str(value)).quantize(CENT, rounding=ROUND_HALF_UP)


@dataclass(frozen=True)
class Product:
    sku: str
    name: str
    price: Decimal
    stock: int


@dataclass(frozen=True)
class Coupon:
    code: str
    percent: Decimal


@dataclass
class CartLine:
    sku: str
    qty: int
    unit_price: Decimal


PRODUCTS = {
    'MP-001': Product('MP-001', 'Mousepad grande', Decimal('20.00'), 10),
    'MP-005': Product('MP-005', 'Mousepad premium', Decimal('26.75'), 8),
    'KB-002': Product('KB-002', 'Teclado mecánico', Decimal('120.00'), 4),
    'MS-003': Product('MS-003', 'Mouse inalámbrico', Decimal('45.50'), 6),
    'US-004': Product('US-004', 'Cable USB-C', Decimal('12.00'), 20),
}

COUPONS = {
    'BIENVENIDA10': Coupon('BIENVENIDA10', Decimal('10')),
    'VOLVER5': Coupon('VOLVER5', Decimal('5')),
}


class Catalog:
    """Catálogo de datos puros; ``decrease_stock`` devuelve un objeto nuevo."""

    def __init__(self, products=None):
        self._products = dict(products or PRODUCTS)

    def get(self, sku):
        try:
            return self._products[sku]
        except KeyError:
            raise DomainError(f'SKU desconocido: {sku}')

    def all(self):
        return list(self._products.values())

    def decrease_stock(self, sku, qty):
        product = self.get(sku)
        if qty > product.stock:
            raise DomainError(f'Existencias insuficientes para {sku}')
        self._products[sku] = Product(
            product.sku, product.name, product.price, product.stock - qty
        )

    def stock(self, sku):
        return self.get(sku).stock
