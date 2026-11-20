"""URL configuration for Django Quiz API."""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from quiz.views import ExamViewSet, QuestionViewSet, OptionViewSet
from catalog.views import CategoryViewSet, ProductViewSet

router = DefaultRouter()
router.register('exams', ExamViewSet, basename='exam')
router.register('questions', QuestionViewSet, basename='question')
router.register('options', OptionViewSet, basename='option')
router.register('categories', CategoryViewSet, basename='category')
router.register('products', ProductViewSet, basename='product')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='docs'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

