"""Carrito generado por la IA. Contiene cinco defectos deliberados.

Se guarda tal cual como estado original para el duelo y la auditoría.
Los comentarios FIX n..marcan cada defecto; se corrigen uno por uno en el paso 13.
"""

from .domain import COUPONS, CartLine, DomainError, IGV_RATE, money  # noqa: F401


class Cart:
    def __init__(self, catalog, coupons=None):
        self.catalog = catalog
        self.coupons = dict(coupons or COUPONS)
        self._lines = {}
        self._coupons = []          # FIX 5: lista en vez de un solo cupón

    def _qty(self, sku):
        line = self._lines.get(sku)
        return line.qty if line else 0

    def add(self, sku, qty, client_price=None):
        product = self.catalog.get(sku)
        if not isinstance(qty, int) or qty <= 0:
            raise DomainError('La cantidad debe ser un entero positivo')
        # FIX 3: compara sólo qty contra stock, ignora lo ya agregado.
        if qty > product.stock:
            raise DomainError(f'Existencias insuficientes para {sku}')
        # FIX 2: acepta el precio que llegue del cliente.
        unit_price = client_price if client_price is not None else product.price
        self._lines[sku] = CartLine(sku, self._qty(sku) + qty, unit_price)
        return self._qty(sku)

    def remove(self, sku, qty):
        if not isinstance(qty, int) or qty <= 0:
            raise DomainError('La cantidad debe ser un entero positivo')
        line = self._lines.get(sku)
        if line is None:
            raise DomainError(f'El carrito no contiene {sku}')
        # FIX 4: permite que la cantidad quede negativa.
        line.qty -= qty
        if line.qty == 0:
            del self._lines[sku]
        return line.qty if line else 0

    def lines(self):
        return [
            {
                'sku': line.sku,
                'qty': line.qty,
                'unit_price': str(line.unit_price),
                'line_total': str(round(float(line.unit_price) * line.qty, 2)),
            }
            for line in self._lines.values()
        ]

    def subtotal(self):
        # FIX 1: flotantes y round() en vez de Decimal y ROUND_HALF_UP.
        return round(sum(float(line.unit_price) * line.qty for line in self._lines.values()), 2)

    def discount(self):
        # FIX 5: suma los descuentos de todos los cupones aplicados.
        subtotal = self.subtotal()
        total = 0.0
        for coupon in self._coupons:
            total += round(subtotal * float(coupon.percent) / 100, 2)
        return round(total, 2)

    def igv(self):
        return round((self.subtotal() - self.discount()) * float(IGV_RATE), 2)

    def total(self):
        return round(self.subtotal() - self.discount() + self.igv(), 2)

    def summary(self):
        return {
            'lines': self.lines(),
            'subtotal': f'{self.subtotal():.2f}',
            'discount': f'{self.discount():.2f}',
            'igv': f'{self.igv():.2f}',
            'total': f'{self.total():.2f}',
            'coupon': self._coupons[-1].code if self._coupons else None,
        }

    def apply_coupon(self, code):
        if not isinstance(code, str):
            raise DomainError('El cupón debe ser texto')
        normalized = code.strip().upper()
        coupon = self.coupons.get(normalized)
        if coupon is None:
            raise DomainError(f'Cupón no válido: {code}')
        # FIX 5: acumula en vez de reemplazar.
        self._coupons.append(coupon)
        return coupon.code

    def add_from_payload(self, payload):
        if not isinstance(payload, dict):
            raise DomainError('El cuerpo debe ser un diccionario')
        sku = payload.get('sku')
        if not isinstance(sku, str) or not sku:
            raise DomainError('El sku debe ser texto')
        # FIX 2: lee el precio del cliente.
        return self.add(sku, payload.get('qty', 1), payload.get('price'))

    def checkout(self):
        for line in self._lines.values():
            if line.qty > self.catalog.stock(line.sku):
                raise DomainError(f'Existencias insuficientes para {line.sku}')
        for line in self._lines.values():
            self.catalog.decrease_stock(line.sku, line.qty)
        result = self.summary()
        self._lines.clear()
        self._coupons.clear()
        return result
