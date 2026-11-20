from django.db.models import Count
from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter

from .models import Exam, Option, Question
from .serializers import ExamSerializer, OptionSerializer, QuestionSerializer


class ExamViewSet(viewsets.ModelViewSet):
    """CRUD completo para exámenes: GET lista, POST crea, DELETE borra."""
    queryset = Exam.objects.annotate(question_count=Count('questions')).order_by('id')
    serializer_class = ExamSerializer


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.select_related('exam').prefetch_related('options').all()
    serializer_class = QuestionSerializer
    filterset_fields = ['exam']
    search_fields = ['text']
    filter_backends = [DjangoFilterBackend, SearchFilter]


class OptionViewSet(viewsets.ModelViewSet):
    queryset = Option.objects.select_related('question').all()
    serializer_class = OptionSerializer

    def perform_destroy(self, instance):
        if instance.is_correct and instance.question.options.filter(is_correct=True).count() == 1:
            from rest_framework import serializers
            raise serializers.ValidationError(
                {'detail': 'Cada pregunta debe conservar exactamente una opción correcta.'}
            )
        instance.delete()
