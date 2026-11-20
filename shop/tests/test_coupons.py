"""Reglas del cupón: normalización, uno solo y tope al subtotal."""

from decimal import Decimal

from django.test import SimpleTestCase

from shop.domain import Catalog, DomainError
from shop.impl import Cart


class CouponTests(SimpleTestCase):
    def setUp(self):
        self.cart = Cart(Catalog())
        self.cart.add('MP-001', 1)

    def test_code_is_normalized(self):
        self.assertEqual(self.cart.apply_coupon('  bienvenida10 '), 'BIENVENIDA10')
        self.assertEqual(self.cart.discount().quantize(Decimal('0.01')), Decimal('2.00'))

    def test_second_coupon_replaces_the_first(self):
        self.cart.apply_coupon('BIENVENIDA10')
        self.cart.apply_coupon('VOLVER5')
        self.assertEqual(self.cart.summary()['coupon'], 'VOLVER5')
        self.assertEqual(str(self.cart.discount()), '1.00')

    def test_double_click_same_coupon_does_not_accumulate(self):
        self.cart.apply_coupon('BIENVENIDA10')
        self.cart.apply_coupon('BIENVENIDA10')
        self.assertEqual(str(self.cart.discount()), '2.00')

    def test_invalid_coupon_is_rejected(self):
        with self.assertRaises(DomainError):
            self.cart.apply_coupon('NO-VALIDO')
