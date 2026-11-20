"""Punto de selección de la implementación según SHOP_MODE.

- SHOP_MODE=team (por defecto) usa shop.cart_team.Cart.
- SHOP_MODE=ai usa shop.cart_ai.Cart.

Las pruebas importan ``Cart`` desde aquí, así el mismo test suite corre
contra los dos carritos sin cambiar una línea de las pruebas.
"""

import os

from .domain import COUPONS, Catalog, DomainError, IGV_RATE, money

MODE = os.environ.get('SHOP_MODE', 'team').strip().lower()

if MODE == 'ai':
    from .cart_ai import Cart
elif MODE == 'team':
    from .cart_team import Cart
else:
    raise DomainError(f'SHOP_MODE no reconocido: {MODE}')

# Carrito compartido por las vistas HTTP de laboratorio.
CART = Cart(Catalog())


def get_cart():
    return CART


def reset_cart():
    global CART
    CART = Cart(Catalog())
    return CART
