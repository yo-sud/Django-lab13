# Instrucciones para agentes de IA en este repositorio

1. Trabaja **un método por turno**. No toques otros archivos del carrito.
2. Recibe como contexto únicamente el archivo del carrito que vas a cambiar y su archivo de pruebas (`shop/tests/test_*.py`).
3. Respeta las seis reglas de `README.md`, en especial: Decimal de principio a fin, precio sólo del servidor, cantidades y existencias válidas con cualquier secuencia de acciones, y repetibilidad.
4. Criterio de terminado: `python manage.py gate` devuelve código **0**. Si devuelve 1, el cambio no está listo.
5. Antes de proponer un diff, ejecuta `python manage.py test shop.tests.<archivo>` con el `SHOP_MODE` correspondiente.
6. Registra en `ENTREGABLE.md` el pedido, el diff propuesto, el veredicto de la compuerta antes y después, y qué pregunta de revisión aplicaste para aceptarlo o rechazarlo.
7. Nombres de ramas y commits: una sola oración descriptiva en español por commit.
