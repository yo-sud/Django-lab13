"""CORS mínimo para el frontend de la tienda (Vite)."""

from django.http import HttpResponse

ALLOWED_ORIGINS = {
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
}


class CorsMiddleware:
    """Responde el preflight y etiqueta las respuestas de origenes permitidos."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.method == 'OPTIONS':
            response = HttpResponse()
            response['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Content-Type'
        else:
            response = self.get_response(request)

        origin = request.headers.get('Origin')
        if origin in ALLOWED_ORIGINS:
            response['Access-Control-Allow-Origin'] = origin
            response['Vary'] = 'Origin'
        return response
