"""Carrito del equipo. Estado inicial: pendiente de implementar."""

from .domain import COUPONS, CartLine, DomainError, IGV_RATE, money  # noqa: F401


class Cart:
    def __init__(self, catalog, coupons=None):
        self.catalog = catalog
        self.coupons = dict(coupons or COUPONS)
        self._lines = {}
        self._coupon = None

    # ── Pendiente: pasos 3 y 4 ──────────────────────────────
    def _qty(self, sku):
        raise NotImplementedError

    def add(self, sku, qty):
        raise NotImplementedError

    def remove(self, sku, qty):
        raise NotImplementedError

    def lines(self):
        raise NotImplementedError

    def checkout(self):
        raise NotImplementedError

    # ── Pendiente: pasos 6, 7 y 8 ───────────────────────────
    def subtotal(self):
        raise NotImplementedError

    def discount(self):
        raise NotImplementedError

    def igv(self):
        raise NotImplementedError

    def total(self):
        raise NotImplementedError

    def summary(self):
        raise NotImplementedError

    def apply_coupon(self, code):
        raise NotImplementedError

    def add_from_payload(self, payload):
        raise NotImplementedError
