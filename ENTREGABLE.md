# Entregable — El carrito revisado por pruebas (4-C24-A)

## Pedido atendido

Completar el laboratorio de la tienda: leer reglas, ejecutar la suite inicial, implementar el carrito del equipo, responder las preguntas de dominio, verificar importes con `Decimal`, aplicar cupones, validar la API y dejar constancia de la auditoría. En este último turno se ajustó además que el carrito del equipo **no guarde precio**: la línea conserva `sku`, `qty` y un marcador `None`; el precio se consulta al catálogo al pintar y al sumar. El catálogo del laboratorio 12 también quedó integrado en este mismo repositorio, bajo `lab-s08-ajax/`.

## 1. Reglas de la tienda y estado inicial

Mis palabras para la tabla del README:

- **Dinero**: todo importe es `Decimal` y se redondea a dos decimales con `ROUND_HALF_UP` mediante `money`. Nada de `float` ni `round()` para cobros.
- **Precio**: lo pone el servidor según el `sku`. El cliente manda `sku` y `qty`; si manda `price`, se ignora y la compuerta lo rechaza.
- **Existencias**: `add` compara lo que ya hay más lo nuevo contra el stock; `remove` nunca deja negativos y borra la línea al llegar a cero; `checkout` vuelve a mirar todo antes de descontar.
- **Cupón**: uno solo por carrito; aplicar otro sustituye al anterior. El código se limpia (sin espacios, mayúsculas) y el descuento no pasa del subtotal.
- **IGV**: 18 % calculado sobre `subtotal - descuento`.
- **Repetibilidad**: repetir una acción (doble clic, reintento) debe dar el mismo resultado que hacerla una vez.

Resumen copiado del estado inicial (`python manage.py test`, carrito del equipo aún sin implementar):

```text
Ran 30 tests in 0.011s
FAILED (errors=24)
```

Pasaban 6 pruebas: las 4 de `shop/tests/test_audit.py`, `test_money_uses_half_up` de `test_totals.py` y `test_add_from_payload_source_never_reads_price` de `test_api.py`. Pasan porque **no ejecutan los métodos pendientes**: las de auditoría sólo leen los JSON de `carts/`, validan los cuatro campos declarados, el catálogo puro y el helper `money`; la de `test_totals` llama directamente a `money`; y la de API lee el código fuente de un método que todavía no menciona `price`.

## 2. Dominio, `_qty` y precio

- **Catálogo de datos puros**: `shop/domain.py` usa `dataclasses`, `Decimal` y `DomainError`, sin importar `django.db.models`, sin request y sin sesión. Así las reglas se prueban con `SimpleTestCase`, sin base de datos ni migraciones, y el mismo carrito sirve para HTTP, consola o tests. El modelo de Django existe sólo para el administrador y el listado.
- **`_qty`**: guarda la cantidad acumulada de un `sku` dentro del carrito (0 si no está). Se usa para sumar al agregar, para saber cuánto queda al quitar y para comprobar `ya_agregado + nuevo <= stock`.
- **Precio**: `add(sku, qty)` no acepta precio y `add_from_payload` ignora cualquier campo `price`/`client_price`. La línea no guarda el precio del cliente: `_unit_price()` hace `self.catalog.get(line.sku).price` cada vez que se pinta o se suma. Por eso el precio no puede ser manipulado desde fuera.
- **`SHOP_MODE`**: `shop/impl.py` lee la variable (por defecto `team`), importa `shop.cart_team.Cart` o `shop.cart_ai.Cart` y expone ese `Cart` a pruebas y vistas. El mismo test suite corre contra las dos implementaciones sin cambiar tests.

## 3. Cantidades y `remove`

`_validate_qty` exige entero positivo (y no booleano). `add` valida, mira lo ya acumulado y crea o incrementa la línea; `remove` valida, exige que exista la línea, rechaza quitar más de lo que hay, resta y **borra la línea cuando la cantidad llega a cero** para que no queden carritos con `qty=0` que ensucien el resumen.

Si quedara una cantidad negativa, `line_total` y el subtotal saldrían negativos, el IGV sería negativo y el total podría convertirse en un abono; además el descuento tope no tendría sentido. Por eso se rechaza antes de modificar el estado.

## 4. Existencias y `checkout`

`add` compara `qty` contra `stock - _qty(sku)`, así dos adiciones separadas no pueden sobrepasar el stock. `checkout` hace tres fases: valida **todas** las líneas, descuenta las existencias del catálogo, calcula el resumen, limpia líneas y cupón, y devuelve el resumen. Validar todo antes de restar evita que un pago a medias deje unos productos descontados y otros no.

El pago comprueba otra vez porque `add` no reserva nada: entre agregar y pagar puede cambiar el stock (otro cliente, administrador o carga de datos). En un sistema real, dos clientes pagando simultáneamente las últimas unidades podrían pasar ambos la validación y vender de más si no hay transacción con bloqueo de fila (`select_for_update`) o un `UPDATE ... WHERE stock >= qty`. Este laboratorio usa un catálogo en memoria de un solo proceso, así que la concurrencia queda como explicación, no como escenario probado.

## 5. Float contra Decimal

Salida copiada de `scripts/decimal_check.py`:

```text
0.1 + 0.2 = 0.30000000000000004
Decimal("0.1") + Decimal("0.2") = 0.3
round(0.845, 2) = 0.84
Decimal("0.845").quantize(Decimal("0.01"), ROUND_HALF_UP) = 0.85
```

`0.845` no existe exactamente en binario: se almacena como un valor ligeramente menor, y `round()` aplica además redondeo al par, dando `0.84`. `Decimal("0.845")` nace desde texto, conserva el valor decimal exacto, y `quantize(..., ROUND_HALF_UP)` aplica la regla de la tienda: mitad hacia arriba, `0.85`.

## 6. Importes

`subtotal = sum(money(precio * qty))`; `discount = min(money(subtotal * porcentaje / 100), subtotal)`; `igv = money((subtotal - descuento) * 0.18)`; `total = money(subtotal - descuento + igv)`. `summary` devuelve esos cuatro valores como texto de dos decimales.

Cálculo a mano para `MP-001` (mousepad, S/ 20.00) con `BIENVENIDA10`:

- Subtotal: `20.00`
- Descuento: `20.00 × 10 % = 2.00`
- Base del IGV: `20.00 - 2.00 = 18.00`
- IGV: `18.00 × 18 % = 3.24`
- Total: `20.00 - 2.00 + 3.24 = 21.24`

Coincide con `shop.tests.test_totals.TotalsTests.test_totals_mousepad_bienvenida10`.

## 7. Cupón

`apply_coupon` exige texto, hace `strip().upper()`, busca en `self.coupons` y guarda **un único** objeto en `self._coupon`. Aplicar `VOLVER5` después de `BIENVENIDA10` sustituye el primero; aplicar dos veces el mismo código deja el mismo descuento. Un doble clic no acumula porque no hay lista de cupones: el segundo clic pisa el primero. El descuento además está topado por `min(..., subtotal)`.

## 8. Payload de la API

`add_from_payload` comprueba que el cuerpo sea `dict`, que `sku` sea texto no vacío y usa `qty` por defecto 1. Nunca lee `price`: el texto de la función no contiene esa palabra (lo verifica `test_add_from_payload_source_never_reads_price`). Si el precio viniera del cliente, alguien podría enviar `{"sku":"MP-001","qty":1,"price":"0.01"}` y cobrar S/ 0.01 por un producto de S/ 20.00; por eso `gate` marca `CLIENT_PRICE` como infracción.

## 9. Llamadas manuales a la API

El puerto 8000 ya estaba ocupado por el catálogo del laboratorio anterior, así que el servidor de la tienda se levantó en 8010:

```bash
python manage.py runserver 127.0.0.1:8010 --noreload
```

Petición 1 — agregar producto:

```powershell
Invoke-RestMethod "http://127.0.0.1:8010/api/cart/items/" -Method Post -ContentType "application/json" -Body '{"sku":"MP-001","qty":1}'
```

```json
{"sku":"MP-001","qty":1}
```

Petición 2 — aplicar cupón:

```powershell
Invoke-RestMethod "http://127.0.0.1:8010/api/cart/coupon/" -Method Post -ContentType "application/json" -Body '{"code":"BIENVENIDA10"}'
```

```json
{"coupon":"BIENVENIDA10"}
```

Petición 3 — pagar:

```powershell
Invoke-RestMethod "http://127.0.0.1:8010/api/cart/checkout/" -Method Post
```

```json
{"lines":[{"sku":"MP-001","qty":1,"unit_price":"20.00","line_total":"20.00"}],"subtotal":"20.00","discount":"2.00","igv":"3.24","total":"21.24","coupon":"BIENVENIDA10"}
```

Resumen posterior (`GET /api/cart/`): líneas vacías, importes `0.00` y `coupon: null`, que confirma que el carrito se vació.

Suite completa final:

```text
Ran 30 tests in 0.004s
OK
Found 30 test(s).
```

## Verificación adicional y revisión del cambio

```text
| Implementación | Pruebas | Fallos | Resumen |
|---|---:|---:|---|
| team | 30 | 0 | OK |
| ai   | 30 | 10 | FAILED (failures=8, errors=2) |
```

`python manage.py gate --modo team` → `carrito-del-equipo [team]: ACEPTAR -` (código 0). Antes de implementar, el mismo comando ni terminaba: `NotImplementedError` en `Cart.add`. `python manage.py gate --modo ai` → `RECHAZAR IMPLEMENTATION_MISMATCH`, porque el carrito de la IA calcula `2.67` de descuento donde la regla dice `2.68`.

**Pregunta de revisión aplicada**: ¿el diff mantiene las seis reglas con cualquier secuencia de acciones y devuelve 0 en la compuerta? Se acepta porque las 30 pruebas pasan, la compuerta dice `ACEPTAR`, el precio del cliente no entra en el carrito y el doble clic de cupón sigue siendo idempotente.
