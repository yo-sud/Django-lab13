# Laboratorio 13 — Catálogo Django/React y carrito auditado

Este repositorio reúne dos entregables:

1. **Carrito revisado por pruebas (4-C24-A)**, en la raíz: `shop/cart_team.py` (entrega del equipo) y `shop/cart_ai.py` (versión generada por IA, con cinco defectos deliberados). Las mismas pruebas corren contra ambos según la variable `SHOP_MODE`. El desarrollo completo está en [ENTREGABLE.md](ENTREGABLE.md).
2. **Catálogo Django REST + React del laboratorio 12**, en [`lab-s08-ajax/`](lab-s08-ajax/README.md): modelos `Category`/`Product`, serializadores anidados, ViewSets, filtro por categoría, capa de servicios Axios, diagrama y capturas.

## Parte 1 — Carrito revisado por pruebas

## Arranque

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_shop
python manage.py test
```

El estado inicial del laboratorio tiene **casi todas las pruebas fallando a propósito**: los métodos del carrito del equipo están pendientes y la versión de la IA contiene los cinco defectos. Las pruebas que pasan desde el principio son las de `shop/tests/test_audit.py`, que sólo validan el arnés de auditoría, los carritos declarados y el helper `money`.

Para correr el mismo test suite contra la IA, en PowerShell:

```powershell
$env:SHOP_MODE = "ai"
python manage.py test
```

## Tabla de reglas de la tienda

| Regla | Enunciado |
|---|---|
| R1 — Dinero | Todo importe se calcula con `Decimal` y se redondea a 2 decimales con `ROUND_HALF_UP` mediante el helper `money`. Nunca se usa `float` ni `round()` para importes. |
| R2 — Precio | El precio lo fija el servidor desde el catálogo. El cliente envía `sku` y `qty`; cualquier campo `price` o `client_price` se ignora y la compuerta lo rechaza. |
| R3 — Existencias | `add` valida la cantidad acumulada contra el stock; `remove` nunca deja cantidades negativas y borra la línea al llegar a cero; `checkout` vuelve a validar todas las líneas antes de descontar nada. |
| R4 — Cupón | Hay un solo cupón por carrito: aplicar otro reemplaza al anterior. El código se normaliza (sin espacios y en mayúsculas) y el descuento nunca supera el subtotal. |
| R5 — Impuesto | El IGV es 18 % y se calcula sobre `subtotal - descuento`. |
| R6 — Repetibilidad | Repetir una acción (doble clic en cupón, reintento de pago) debe dar el mismo resultado que ejecutarla una sola vez. |

## Arquitectura

- `shop/domain.py`: catálogo de **datos puros** (`dataclasses`), `Decimal`, `money` y excepciones de dominio. No importa modelos de Django.
- `shop/cart_team.py`: implementación correcta que se completa en los pasos 3, 4, 6, 7 y 8.
- `shop/cart_ai.py`: implementación de la IA con los cinco fallos; se repara en el paso 13.
- `shop/impl.py`: lee `SHOP_MODE` y expone el `Cart` activo más el carrito HTTP compartido.
- `shop/audit.py` y los comandos `audit_cart`, `duelo`, `gate`: auditoría, comparación y compuerta.

## Tabla de la API

| Método | Ruta | Cuerpo | Respuesta |
|---|---|---|---|
| `GET` | `/api/products/` | — | Lista de sku, nombre, precio y existencias |
| `POST` | `/api/cart/items/` | `{"sku": "MP-001", "qty": 1}` | `{"sku": ..., "qty": ...}` |
| `POST` | `/api/cart/coupon/` | `{"code": "BIENVENIDA10"}` | `{"coupon": "BIENVENIDA10"}` |
| `POST` | `/api/cart/checkout/` | — | Resumen con subtotal, descuento, IGV y total |
| `GET` | `/api/cart/` | — | Resumen del carrito actual |

Ejemplos con `Invoke-RestMethod`:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/cart/items/ -Method Post -ContentType application/json -Body '{"sku":"MP-001","qty":1}'
Invoke-RestMethod http://127.0.0.1:8000/api/cart/coupon/ -Method Post -ContentType application/json -Body '{"code":"BIENVENIDA10"}'
Invoke-RestMethod http://127.0.0.1:8000/api/cart/checkout/ -Method Post
```

## Herramientas de verificación

```bash
python manage.py duelo                       # tabla equipo vs IA
python manage.py duelo --modo ai             # fallos de la IA agrupados por archivo
python manage.py audit_cart carts/*.json
python manage.py audit_cart carts/*.json --replay
python manage.py audit_cart carts/*.json --replay --json --strict
python manage.py gate                        # carrito del equipo
python manage.py gate --modo ai              # compuerta sobre la IA
python manage.py gate carts/cart-03.json --json
```

`AGENTS.md` describe cómo debe trabajar un agente de IA sobre este repositorio.

## Parte 2 — Catálogo del laboratorio 12

El backend está en `lab-s08-ajax/django-quiz/` y el frontend en `lab-s08-ajax/react-frontend/`. Para levantarlo:

```bash
cd lab-s08-ajax/django-quiz
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_catalog
python manage.py runserver
```

```bash
cd lab-s08-ajax/react-frontend
npm install
cp .env.example .env
npm run dev
```

El detalle de arquitectura, la tabla de endpoints, el diagrama y las capturas están en [lab-s08-ajax/README.md](lab-s08-ajax/README.md). Los dos entregables se subieron juntos a este repositorio (`Django-lab13`).
