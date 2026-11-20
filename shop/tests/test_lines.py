"""Líneas del carrito: alta, baja y validación de cantidades."""

from django.test import SimpleTestCase

from shop.domain import Catalog, DomainError
from shop.impl import Cart


class CartLineTests(SimpleTestCase):
    def setUp(self):
        self.cart = Cart(Catalog())

    def test_add_creates_line_with_server_price(self):
        qty = self.cart.add('MP-001', 2)
        self.assertEqual(qty, 2)
        lines = self.cart.lines()
        self.assertEqual(len(lines), 1)
        self.assertEqual(lines[0]['sku'], 'MP-001')
        self.assertEqual(lines[0]['unit_price'], '20.00')

    def test_add_rejects_zero_quantity(self):
        with self.assertRaises(DomainError):
            self.cart.add('MP-001', 0)

    def test_add_rejects_negative_quantity(self):
        with self.assertRaises(DomainError):
            self.cart.add('MP-001', -1)

    def test_add_rejects_non_integer_quantity(self):
        with self.assertRaises(DomainError):
            self.cart.add('MP-001', '2')

    def test_remove_reduces_quantity(self):
        self.cart.add('MP-001', 3)
        self.assertEqual(self.cart.remove('MP-001', 1), 2)

    def test_remove_deletes_line_at_zero(self):
        self.cart.add('MP-001', 1)
        self.cart.remove('MP-001', 1)
        self.assertEqual(self.cart.lines(), [])

    def test_remove_rejects_removing_more_than_present(self):
        self.cart.add('MP-001', 2)
        with self.assertRaises(DomainError):
            self.cart.remove('MP-001', 3)

    def test_unknown_sku_is_rejected(self):
        with self.assertRaises(DomainError):
            self.cart.add('NO-EXISTE', 1)
