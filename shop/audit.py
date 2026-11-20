"""Utilidades compartidas por los comandos de auditoría y compuerta."""

import json
from pathlib import Path

from .domain import Catalog, DomainError

TOTAL_FIELDS = ('subtotal', 'discount', 'igv', 'total')
# La auditoría sólo reenvía datos puros: nunca el precio que declare el cliente.
REPLAY_FIELDS = ('sku', 'qty')


def load_cart(path):
    with Path(path).open(encoding='utf-8') as handle:
        return json.load(handle)


def declared_totals(cart):
    return {key: str(cart['declared'][key]) for key in TOTAL_FIELDS}


def replay(cart, cart_class):
    """Recalcula el carrito con otra implementación y sólo sku/cantidad/cupón."""
    instance = cart_class(Catalog())
    try:
        for item in cart['items']:
            instance.add(item['sku'], item['qty'])
        for item in cart.get('removed', []):
            instance.remove(item['sku'], item['qty'])
        for code in cart.get('coupons', []):
            instance.apply_coupon(code)
        return instance.summary()
    except DomainError as err:
        return {'error': str(err)}


def summarize(cart, cart_class):
    """Recalcula el carrito con la implementación actual (puede usar precio del cliente)."""
    instance = cart_class(Catalog())
    try:
        for item in cart['items']:
            item_clean = {key: item.get(key) for key in REPLAY_FIELDS}
            if 'price' in item or 'client_price' in item:
                item_clean['price'] = item.get('client_price', item.get('price'))
            instance.add_from_payload(item_clean)
        for item in cart.get('removed', []):
            instance.remove(item['sku'], item['qty'])
        for code in cart.get('coupons', []):
            instance.apply_coupon(code)
        return instance.summary()
    except DomainError as err:
        return {'error': str(err)}


def compare_totals(left, right):
    if 'error' in left or 'error' in right:
        return None
    return [key for key in TOTAL_FIELDS if left.get(key) != right.get(key)]
