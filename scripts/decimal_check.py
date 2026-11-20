"""Comparación pedida en el paso 5 del laboratorio."""

from decimal import Decimal, ROUND_HALF_UP

print('0.1 + 0.2 =', 0.1 + 0.2)
print('Decimal("0.1") + Decimal("0.2") =', Decimal('0.1') + Decimal('0.2'))
print('round(0.845, 2) =', round(0.845, 2))
print(
    'Decimal("0.845").quantize(Decimal("0.01"), ROUND_HALF_UP) =',
    Decimal('0.845').quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
)
