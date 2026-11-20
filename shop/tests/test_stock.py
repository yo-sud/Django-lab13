"""Existencias: acumulación en add y revalidación en checkout."""

from django.test import SimpleTestCase

from shop.domain import Catalog, DomainError
from shop.impl import Cart


class StockTests(SimpleTestCase):
    def setUp(self):
        self.cart = Cart(Catalog())

    def test_add_accumulates_and_checks_total_available(self):
        self.cart.add('KB-002', 3)          # quedan 4 en el catálogo
        with self.assertRaises(DomainError):
            self.cart.add('KB-002', 2)      # 3 + 2 supera las 4 existencias
        self.assertEqual(self.cart._qty('KB-002'), 3)

    def test_checkout_decrements_stock_and_clears_cart(self):
        self.cart.add('MP-001', 2)
        result = self.cart.checkout()
        self.assertEqual(self.cart.catalog.stock('MP-001'), 8)
        self.assertEqual(self.cart.lines(), [])
        self.assertEqual(result['total'], '47.20')

    def test_checkout_revalidates_before_changing_anything(self):
        self.cart.add('MP-001', 5)
        self.cart.catalog.decrease_stock('MP-001', 7)   # ahora quedan 3
        before = self.cart.summary()
        with self.assertRaises(DomainError):
            self.cart.checkout()
        self.assertEqual(self.cart.catalog.stock('MP-001'), 3)
        self.assertEqual(self.cart._qty('MP-001'), 5)
        self.assertEqual(self.cart.summary(), before)

    def test_checkout_returns_summary_with_totals(self):
        self.cart.add('MP-001', 1)
        result = self.cart.checkout()
        self.assertEqual(result['subtotal'], '20.00')
        self.assertEqual(result['igv'], '3.60')
        self.assertEqual(result['total'], '23.60')
