"""Importes con Decimal y redondeo ROUND_HALF_UP."""

from decimal import Decimal

from django.test import SimpleTestCase

from shop.domain import Catalog, money
from shop.impl import Cart


class TotalsTests(SimpleTestCase):
    def setUp(self):
        self.cart = Cart(Catalog())

    def test_money_uses_half_up(self):
        self.assertEqual(money(Decimal('0.845')), Decimal('0.85'))
        self.assertEqual(money(0.845), Decimal('0.85'))

    def test_totals_mousepad_bienvenida10(self):
        self.cart.add('MP-001', 1)
        self.cart.apply_coupon('BIENVENIDA10')
        self.assertEqual(self.cart.subtotal(), Decimal('20.00'))
        self.assertEqual(self.cart.discount(), Decimal('2.00'))
        self.assertEqual(self.cart.igv(), Decimal('3.24'))
        self.assertEqual(self.cart.total(), Decimal('21.24'))

    def test_totals_mousepad_premium_rounding(self):
        self.cart.add('MP-005', 1)
        self.cart.apply_coupon('BIENVENIDA10')
        self.assertEqual(self.cart.subtotal(), Decimal('26.75'))
        self.assertEqual(self.cart.discount(), Decimal('2.68'))
        self.assertEqual(self.cart.igv(), Decimal('4.33'))
        self.assertEqual(self.cart.total(), Decimal('28.40'))

    def test_igv_is_applied_after_discount(self):
        self.cart.add('MP-001', 1)
        self.cart.apply_coupon('BIENVENIDA10')
        self.assertEqual(self.cart.igv(), money((self.cart.subtotal() - self.cart.discount()) * Decimal('0.18')))

    def test_summary_exposes_string_totals(self):
        self.cart.add('MP-001', 1)
        self.cart.apply_coupon('BIENVENIDA10')
        self.assertEqual(self.cart.summary()['total'], '21.24')
