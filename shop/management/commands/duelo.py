"""Corre el mismo test suite contra el carrito del equipo y contra el de la IA."""

import os
import re
import subprocess
import sys
from collections import defaultdict

from django.core.management.base import BaseCommand


def run(mode):
    env = dict(os.environ, SHOP_MODE=mode)
    process = subprocess.run(
        [sys.executable, 'manage.py', 'test', '--verbosity', '1'],
        env=env,
        cwd=os.getcwd(),
        capture_output=True,
        text=True,
    )
    output = process.stdout + process.stderr
    ran = re.search(r'Ran (\d+) tests?', output)
    failed = re.findall(r'^(?:FAIL|ERROR): (\S+)', output, flags=re.MULTILINE)
    return {
        'mode': mode,
        'tests': int(ran.group(1)) if ran else 0,
        'failures': len(failed),
        'names': failed,
        'summary': next((line for line in output.splitlines() if line.startswith('FAILED ')), 'OK'),
    }


class Command(BaseCommand):
    help = 'Duelo de implementaciones: same tests, dos carritos.'

    def add_arguments(self, parser):
        parser.add_argument('--modo', choices=['both', 'team', 'ai'], default='both')

    def handle(self, *args, **options):
        modes = ['team', 'ai'] if options['modo'] == 'both' else [options['modo']]
        results = [run(mode) for mode in modes]

        self.stdout.write('| Implementación | Pruebas | Fallos | Resumen |')
        self.stdout.write('|---|---:|---:|---|')
        for result in results:
            self.stdout.write(
                f"| {result['mode']} | {result['tests']} | {result['failures']} | {result['summary']} |"
            )

        if options['modo'] == 'ai' or options['modo'] == 'both':
            grouped = defaultdict(list)
            for result in results:
                if result['mode'] != 'ai':
                    continue
                for name in result['names']:
                    grouped[name.split('.')[1] if '.' in name else name].append(name)
            self.stdout.write('\nPruebas fallidas de la IA agrupadas por archivo:')
            for test_file in sorted(grouped):
                self.stdout.write(f"\n{test_file}:")
                for name in grouped[test_file]:
                    self.stdout.write(f'  - {name}')
