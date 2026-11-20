# Laboratorio 12 — Django REST + React: catálogo de productos

Proyecto construido sobre el laboratorio anterior de cuestionarios. Mantiene la API de exámenes y añade un **catálogo de productos con categorías**, consumido por el frontend React.

## Reparto entre servidor y cliente

```
Navegador (React, puerto 5173)
  └─ pages/  →  services/  →  services/apiClient.js  →  Axios
                                      │
                                      │  http://127.0.0.1:8000/api
                                      ▼
Django REST Framework (puerto 8000)
  └─ config/urls.py (DefaultRouter)
       ├─ /products/    → ProductViewSet → ProductSerializer (categoría anidada)
       └─ /categories/  → CategoryViewSet → CategorySerializer
```

- **Servidor**: decide el modelo, expone el CRUD, anida la categoría en cada producto, filtra por `?category=<id>` y sirve las imágenes desde `/media/`.
- **Cliente**: no contiene reglas de negocio; sólo pinta datos. Ningún componente importa Axios: todo pasa por `services/productService.js` y `services/categoryService.js`, que comparten la única instancia de `services/apiClient.js`.

## Estructura

```
lab-s08-ajax/
├── README.md
├── docs/
│   ├── diagrama-catalogo.md
│   └── capturas/
│       ├── catalogo-todos.png
│       ├── catalogo-filtrado-bebidas.png
│       └── formulario-producto.png
├── django-quiz/                 # Backend Django
│   ├── config/                  # settings, urls (router de la API)
│   ├── catalog/                 # app del catálogo
│   │   ├── models.py            # Category, Product
│   │   ├── admin.py             # listados, filtros y búsqueda
│   │   ├── serializers.py       # categoría anidada + category_id escribible
│   │   ├── views.py             # CategoryViewSet, ProductViewSet
│   │   ├── migrations/
│   │   └── management/commands/seed_catalog.py
│   ├── quiz/                    # API de exámenes del laboratorio anterior
│   ├── static/
│   └── requirements.txt
└── react-frontend/              # Frontend React + Vite
    ├── .env.example             # VITE_API_URL
    └── src/
        ├── services/            # apiClient.js, productService.js, categoryService.js
        ├── client/              # código heredado de exámenes
        ├── components/          # ProductCard.jsx
        ├── pages/               # CatalogPage.jsx, ProductFormPage.jsx, exámenes
        └── App.jsx
```

## Cómo levantarlo

### Backend

```bash
cd lab-s08-ajax/django-quiz
python -m venv .venv
.venv\Scripts\activate          # en Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_catalog   # 3 categorías y 8 productos con imagen
python manage.py runserver
```

La API queda en `http://127.0.0.1:8000/` y el administrador en `/admin/`.
Las imágenes generadas se guardan en `django-quiz/media/products/` y se sirven en `/media/` cuando `DEBUG = True`.

### Frontend

```bash
cd lab-s08-ajax/react-frontend
npm install
cp .env.example .env            # ajusta VITE_API_URL si el backend no está en :8000
npm run dev
```

El catálogo se abre en `http://localhost:5173/`. Pruebas: `npm test`. Build: `npm run build`.

### CORS

Sólo se permiten `http://localhost:5173` y `http://127.0.0.1:5173`. No se usa el comodín `*` porque la API emplea autenticación por token.

## Tabla de la API del catálogo

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/products/` | Lista de productos con la categoría anidada. Acepta `?category=<id>` y `?search=<texto>` |
| `POST` | `/api/products/` | Crea un producto; envía `category_id` |
| `GET` | `/api/products/{id}/` | Obtiene un producto |
| `PUT` | `/api/products/{id}/` | Modifica un producto |
| `DELETE` | `/api/products/{id}/` | Elimina un producto |
| `GET` | `/api/categories/` | Lista de categorías para el filtro y el formulario |
| `POST` | `/api/categories/` | Crea una categoría |
| `GET` | `/api/categories/{id}/` | Obtiene una categoría |
| `PUT` | `/api/categories/{id}/` | Modifica una categoría |
| `DELETE` | `/api/categories/{id}/` | Elimina una categoría |

Los recursos de exámenes (`/api/exams/`, `/api/questions/`, `/api/options/`) siguen disponibles. El esquema OpenAPI está en `/api/schema/` y la documentación interactiva en `/api/docs/`.

## Diagrama del catálogo

Ver [docs/diagrama-catalogo.md](docs/diagrama-catalogo.md).

## Capturas

Catálogo completo (imagen, precio, existencias y categoría con su descripción):

![Catálogo con todos los productos](docs/capturas/catalogo-todos.png)

Catálogo filtrado por la categoría **Bebidas**, cargada desde el API:

![Catálogo filtrado por categoría](docs/capturas/catalogo-filtrado-bebidas.png)

Formulario de alta con la lista desplegable de categorías del API:

![Formulario de producto](docs/capturas/formulario-producto.png)

## Observaciones

- `ProductSerializer` expone `category` anidado en lectura y `category_id` en escritura: una sola petición devuelve todo lo que pinta la tarjeta.
- El `ProductViewSet` usa `select_related('category')` para no generar una consulta adicional por producto.
- El filtro se resuelve en el servidor (`?category=<id>`) y se vuelve a pedir al cambiar el selector; las opciones del selector nunca están escritas a mano.
- Tras borrar un producto se actualiza el estado local de React, sin `window.location.reload()`.
- El repositorio base no importaba los modelos en `quiz/serializers.py` y no tenía migraciones; ambos se corrigieron para que el proyecto arranque.
