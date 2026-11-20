"""La API sólo acepta sku y cantidad; el precio lo fija el servidor."""

import inspect

from django.test import SimpleTestCase

from shop.domain import Catalog, DomainError
from shop.impl import Cart


class ApiPayloadTests(SimpleTestCase):
    def setUp(self):
        self.cart = Cart(Catalog())

    def test_non_dict_body_is_rejected(self):
        with self.assertRaises(DomainError):
            self.cart.add_from_payload(['MP-001', 1])

    def test_non_text_sku_is_rejected(self):
        with self.assertRaises(DomainError):
            self.cart.add_from_payload({'sku': 123, 'qty': 1})

    def test_missing_sku_is_rejected(self):
        with self.assertRaises(DomainError):
            self.cart.add_from_payload({'qty': 1})

    def test_client_price_is_never_used(self):
        self.cart.add_from_payload({'sku': 'MP-001', 'qty': 1, 'price': '0.01'})
        lines = self.cart.lines()
        self.assertEqual(lines[0]['unit_price'], '20.00')
        self.assertEqual(self.cart.summary()['total'], '23.60')

    def test_add_from_payload_source_never_reads_price(self):
        source = inspect.getsource(Cart.add_from_payload).lower()
        self.assertNotIn('price', source)
