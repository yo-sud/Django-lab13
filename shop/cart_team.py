"""Carrito del equipo: reglas de cantidad, existencias e importes con Decimal."""

from decimal import Decimal

from .domain import COUPONS, CartLine, DomainError, IGV_RATE, money


class Cart:
    def __init__(self, catalog, coupons=None):
        self.catalog = catalog
        self.coupons = dict(coupons or COUPONS)
        self._lines = {}
        self._coupon = None

    def _qty(self, sku):
        line = self._lines.get(sku)
        return line.qty if line else 0

    def _validate_qty(self, qty):
        if not isinstance(qty, int) or isinstance(qty, bool) or qty <= 0:
            raise DomainError('La cantidad debe ser un entero positivo')

    # ── Pasos 3 y 4: líneas y existencias ─────────────────────
    def add(self, sku, qty):
        self._validate_qty(qty)
        product = self.catalog.get(sku)
        already = self._qty(sku)
        available = product.stock - already
        if qty > available:
            raise DomainError(
                f'Existencias insuficientes para {sku}: quedan {available}'
            )
        if sku in self._lines:
            self._lines[sku].qty += qty
        else:
            # No se guarda el precio: se consulta al catálogo al calcular.
            self._lines[sku] = CartLine(sku, qty, None)
        return self._qty(sku)

    def remove(self, sku, qty):
        self._validate_qty(qty)
        line = self._lines.get(sku)
        if line is None:
            raise DomainError(f'El carrito no contiene {sku}')
        if qty > line.qty:
            raise DomainError(f'No hay {qty} unidades de {sku} en el carrito')
        remaining = line.qty - qty
        if remaining <= 0:
            del self._lines[sku]
            return 0
        line.qty = remaining
        return remaining

    def _unit_price(self, line):
        return self.catalog.get(line.sku).price

    def lines(self):
        return [
            {
                'sku': line.sku,
                'qty': line.qty,
                'unit_price': str(self._unit_price(line)),
                'line_total': str(money(self._unit_price(line) * line.qty)),
            }
            for line in self._lines.values()
        ]

    def checkout(self):
        # 1) validar todo antes de tocar nada
        for line in self._lines.values():
            if line.qty > self.catalog.stock(line.sku):
                raise DomainError(f'Existencias insuficientes para {line.sku}')
        # 2) descontar del catálogo
        for line in self._lines.values():
            self.catalog.decrease_stock(line.sku, line.qty)
        # 3) resumen y carrito vacío
        result = self.summary()
        self._lines.clear()
        self._coupon = None
        return result

    # ── Pasos 6, 7 y 8: importes, cupón y payload ─────────────
    def subtotal(self):
        return sum(
            (
                money(self._unit_price(line) * line.qty)
                for line in self._lines.values()
            ),
            Decimal('0.00'),
        )

    def discount(self):
        if self._coupon is None:
            return Decimal('0.00')
        subtotal = self.subtotal()
        return min(money(subtotal * self._coupon.percent / Decimal('100')), subtotal)

    def igv(self):
        return money((self.subtotal() - self.discount()) * IGV_RATE)

    def total(self):
        return money(self.subtotal() - self.discount() + self.igv())

    def summary(self):
        return {
            'lines': self.lines(),
            'subtotal': str(self.subtotal()),
            'discount': str(self.discount()),
            'igv': str(self.igv()),
            'total': str(self.total()),
            'coupon': self._coupon.code if self._coupon else None,
        }

    def apply_coupon(self, code):
        if not isinstance(code, str):
            raise DomainError('El cupón debe ser texto')
        normalized = code.strip().upper()
        coupon = self.coupons.get(normalized)
        if coupon is None:
            raise DomainError(f'Cupón no válido: {code}')
        # Un solo cupón: el nuevo reemplaza al anterior.
        self._coupon = coupon
        return coupon.code

    def add_from_payload(self, payload):
        if not isinstance(payload, dict):
            raise DomainError('El cuerpo debe ser un diccionario')
        sku = payload.get('sku')
        if not isinstance(sku, str) or not sku:
            raise DomainError('El sku debe ser texto')
        return self.add(sku, payload.get('qty', 1))
