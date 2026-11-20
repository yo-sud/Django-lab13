"""Compara lo que declara un carrito con lo que calcula cada implementación."""

from django.core.management.base import BaseCommand

from shop.audit import compare_totals, declared_totals, load_cart, replay, summarize
from shop.cart_ai import Cart as AICart
from shop.cart_team import Cart as TeamCart
from shop.impl import MODE, Cart


class Command(BaseCommand):
    help = 'Audita carritos declarados; --replay usa la implementación contraria.'

    def add_arguments(self, parser):
        parser.add_argument('carts', nargs='+')
        parser.add_argument('--replay', action='store_true')
        parser.add_argument('--json', dest='as_json', action='store_true')
        parser.add_argument('--strict', action='store_true')

    def handle(self, *args, **options):
        other = TeamCart if MODE == 'ai' else AICart
        findings = []

        for path in options['carts']:
            cart = load_cart(path)
            current = summarize(cart, Cart)
            declared = declared_totals(cart)
            cart_findings = []

            if 'error' in current:
                cart_findings.append({
                    'kind': 'IMPLEMENTATION_ERROR',
                    'detail': current['error'],
                })
            else:
                mismatch = compare_totals(declared, current)
                if mismatch:
                    cart_findings.append({
                        'kind': 'TOTAL_MISMATCH',
                        'fields': mismatch,
                        'declared': declared,
                        'calculated': current,
                    })

            if options['replay']:
                replayed = replay(cart, other)
                replay_mismatch = 'error' in replayed or compare_totals(current, replayed)
                if replay_mismatch:
                    cart_findings.append({
                        'kind': 'REPLAY_MISMATCH',
                        'current': current,
                        'reference': replayed,
                    })

            findings.append({'cart': cart['id'], 'findings': cart_findings})

        if options['as_json']:
            import json
            self.stdout.write(json.dumps(findings, ensure_ascii=False, indent=2))
        else:
            for entry in findings:
                if not entry['findings']:
                    self.stdout.write(f"{entry['cart']}: SIN HALLAZGOS")
                for finding in entry['findings']:
                    self.stdout.write(f"{entry['cart']}: {finding['kind']} {finding}")

        if options['strict'] and any(entry['findings'] for entry in findings):
            raise SystemExit(1)
