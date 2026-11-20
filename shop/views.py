"""API HTTP de la tienda. Cuerpos JSON, respuestas JSON, sin DRF."""

import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .domain import DomainError
from .impl import get_cart


def _body(request):
    try:
        return json.loads(request.body or b'{}')
    except json.JSONDecodeError:
        raise DomainError('El cuerpo debe ser JSON válido')


def products(request):
    cart = get_cart()
    return JsonResponse({
        'products': [
            {'sku': p.sku, 'name': p.name, 'price': str(p.price), 'stock': p.stock}
            for p in cart.catalog.all()
        ]
    })


@csrf_exempt
def cart_items(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)
    try:
        payload = _body(request)
        qty = get_cart().add_from_payload(payload)
        return JsonResponse({'sku': payload.get('sku'), 'qty': qty})
    except DomainError as err:
        return JsonResponse({'error': str(err)}, status=400)


@csrf_exempt
def cart_coupon(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)
    try:
        body = _body(request)
        return JsonResponse({'coupon': get_cart().apply_coupon(body.get('code'))})
    except DomainError as err:
        return JsonResponse({'error': str(err)}, status=400)


@csrf_exempt
def cart_checkout(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)
    try:
        return JsonResponse(get_cart().checkout())
    except DomainError as err:
        return JsonResponse({'error': str(err)}, status=400)


def cart_summary(request):
    return JsonResponse(get_cart().summary())
