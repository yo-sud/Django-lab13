# Django Quiz API - Laboratorio S08 (Ajax)

## Backend

```bash
cd django-quiz
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations quiz
python manage.py migrate
python manage.py seed_quiz
python manage.py runserver
```

La API estará disponible en `http://127.0.0.1:8000/`

## Frontend

```bash
cd react-frontend
npm install
npm run dev
```

El frontend estará disponible en `http://localhost:5173/`

## CORS

El backend permite solo los siguientes orígenes:
- `http://localhost:5173`
- `http://127.0.0.1:5173`

Usar el comodín `*` está **prohibido** porque la API usa autenticación por token y el navegador rechaza credenciales con origen comodín.

## Estructura

```
lab-s08-ajax/
├── django-quiz/           # Backend Django
│   ├── config/            # Configuración Django (settings, urls)
│   ├── quiz/              # App de Django (models, views, serializers)
│   │   ├── management/commands/
│   │   │   └── seed_quiz.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── admin.py
│   ├── manage.py
│   └── requirements.txt
└── react-frontend/        # Frontend React + Vite
    ├── src/
    │   ├── client/        # Cliente API, CORS, hooks
    │   │   ├── api.js
    │   │   ├── api.test.js
    │   │   ├── cors.js
    │   │   ├── cors.test.js
    │   │   ├── useExams.js
    │   │   └── useExams.test.js
    │   ├── pages/
    │   │   ├── ExamList.jsx
    │   │   └── ExamCreate.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```
