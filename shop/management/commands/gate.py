"""Compuerta de aceptación: rechaza carritos que violan las reglas de la tienda."""

import json
from collections import Counter

from django.core.management.base import BaseCommand

from shop.audit import compare_totals, declared_totals, load_cart, replay
from shop.cart_ai import Cart as AICart
from shop.cart_team import Cart as TeamCart
from shop.domain import Catalog, DomainError

SAMPLE_CART = {
    'id': 'carrito-del-equipo',
    'items': [{'sku': 'MP-001', 'qty': 1, 'client_price': '1.00'}],
    'coupons': [],
    'declared': {'subtotal': '20.00', 'discount': '0.00', 'igv': '3.60', 'total': '23.60'},
}
FORBIDDEN_ITEM_FIELDS = ('price', 'client_price')


def inspect(cart):
    problems = []
    quantities = Counter()

    for item in cart.get('items', []):
        for field in FORBIDDEN_ITEM_FIELDS:
            if field in item:
                problems.append(f'CLIENT_PRICE:{item["sku"]}:{field}')
        qty = item.get('qty')
        if not isinstance(qty, int) or qty <= 0:
            problems.append(f'INVALID_QTY:{item.get("sku")}:{qty}')
        else:
            quantities[item['sku']] += qty

    for sku, qty in quantities.items():
        try:
            stock = Catalog().stock(sku)
        except DomainError:
            problems.append(f'UNKNOWN_SKU:{sku}')
            continue
        if qty > stock:
            problems.append(f'STOCK_EXCEEDED:{sku}:{qty}>{stock}')

    coupons = cart.get('coupons', [])
    if len(coupons) > 1:
        problems.append(f'STACKED_COUPON:{"+".join(coupons)}')

    trusted = replay(cart, TeamCart)
    mismatch = 'error' in trusted or compare_totals(declared_totals(cart), trusted)
    if mismatch:
        problems.append(f'TOTAL_MISMATCH:{trusted}')

    return sorted(set(problems))


class Command(BaseCommand):
    help = 'Verifica reglas antes del cobro. Salida 0 = aceptar, 1 = rechazar.'

    def add_arguments(self, parser):
        parser.add_argument('carts', nargs='*')
        parser.add_argument('--modo', choices=['team', 'ai'], default='team')
        parser.add_argument('--json', dest='as_json', action='store_true')

    def handle(self, *args, **options):
        carts = [load_cart(path) for path in options['carts']] or [SAMPLE_CART]
        # El modo elige qué implementación se está presentando a la compuerta.
        implementation = AICart if options['modo'] == 'ai' else TeamCart
        results = []
        rejected = False

        for cart in carts:
            problems = inspect(cart)
            if options['modo'] == 'ai' and not problems:
                current = replay(cart, implementation)
                if compare_totals(declared_totals(cart), current):
                    problems.append('IMPLEMENTATION_MISMATCH')
            verdict = 'RECHAZAR' if problems else 'ACEPTAR'
            rejected = rejected or bool(problems)
            results.append({
                'cart': cart['id'],
                'modo': options['modo'],
                'verdict': verdict,
                'problems': problems,
            })

        if options['as_json']:
            self.stdout.write(json.dumps({
                'exit_code': 1 if rejected else 0,
                'results': results,
            }, ensure_ascii=False, indent=2))
        else:
            for result in results:
                self.stdout.write(
                    f"{result['cart']} [{result['modo']}]: {result['verdict']} "
                    f"{'; '.join(result['problems']) or '-'}"
                )

        if rejected:
            raise SystemExit(1)
