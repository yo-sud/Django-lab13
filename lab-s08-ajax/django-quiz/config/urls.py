"""URL configuration for Django Quiz API."""
from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from quiz.views import ExamViewSet, QuestionViewSet, OptionViewSet

router = DefaultRouter()
router.register('exams', ExamViewSet, basename='exam')
router.register('questions', QuestionViewSet, basename='question')
router.register('options', OptionViewSet, basename='option')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='docs'),
]
