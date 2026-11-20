from .models import Exam, Option, Question
from django.contrib import admin

@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'created_at')
    search_fields = ('title',)

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'text', 'exam')
    list_filter = ('exam',)

@admin.register(Option)
class OptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'text', 'question', 'is_correct')
