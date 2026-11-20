"""Pruebas de auditoría: pasan desde el inicio, sin importar el carrito."""

from decimal import Decimal
from pathlib import Path

from django.test import SimpleTestCase

from shop.audit import declared_totals, load_cart
from shop.domain import Catalog, money

CARTS_DIR = Path(__file__).resolve().parents[2] / 'carts'


class AuditHarnessTests(SimpleTestCase):
    def test_six_carts_are_readable(self):
        carts = sorted(CARTS_DIR.glob('cart-*.json'))
        self.assertEqual(len(carts), 6)
        for path in carts:
            cart = load_cart(path)
            self.assertIn('items', cart)
            self.assertIn('declared', cart)

    def test_declared_totals_have_four_fields(self):
        cart = load_cart(CARTS_DIR / 'cart-01.json')
        totals = declared_totals(cart)
        self.assertEqual(set(totals), {'subtotal', 'discount', 'igv', 'total'})

    def test_money_uses_half_up(self):
        self.assertEqual(money(Decimal('0.845')), Decimal('0.85'))

    def test_catalog_is_pure_data(self):
        catalog = Catalog()
        self.assertEqual(catalog.stock('MP-001'), 10)
        self.assertFalse(hasattr(catalog, 'objects'))
