from django.core.management.base import BaseCommand
from quiz.models import Exam, Question, Option


class Command(BaseCommand):
    help = 'Seed the database with sample exams and questions'

    def handle(self, *args, **options):
        Exam.objects.all().delete()

        exam1 = Exam.objects.create(
            title='Fundamentos de Python',
            description='Evaluación de conceptos básicos de Python.',
        )
        Question.objects.create(exam=exam1, text='¿Cuál es la salida de print(2 ** 3)?')
        q2 = Question.objects.create(exam=exam1, text='¿Qué keyword se usa para definir una función?')
        q3 = Question.objects.create(exam=exam1, text='¿Cómo se crea una lista en Python?')

        Option.objects.create(question=q2, text='function', is_correct=False)
        Option.objects.create(question=q2, text='def', is_correct=True)
        Option.objects.create(question=q2, text='func', is_correct=False)
        Option.objects.create(question=q2, text='define', is_correct=False)

        Option.objects.create(question=q3, text='(1, 2, 3)', is_correct=False)
        Option.objects.create(question=q3, text='[1, 2, 3]', is_correct=True)
        Option.objects.create(question=q3, text='{1, 2, 3}', is_correct=False)

        exam2 = Exam.objects.create(
            title='Bases de Datos SQL',
            description='Preguntas sobre SQL y modelado de datos.',
        )
        q5 = Question.objects.create(exam=exam2, text='¿Qué comando se usa para consultar datos?')
        q6 = Question.objects.create(exam=exam2, text='¿Qué es una clave foránea?')

        Option.objects.create(question=q5, text='GET', is_correct=False)
        Option.objects.create(question=q5, text='SELECT', is_correct=True)
        Option.objects.create(question=q5, text='FETCH', is_correct=False)

        Option.objects.create(question=q6, text='Un índice único', is_correct=False)
        Option.objects.create(question=q6, text='Un campo que referencia otra tabla', is_correct=True)
        Option.objects.create(question=q6, text='Una restricción NOT NULL', is_correct=False)

        exam3 = Exam.objects.create(
            title='Redes de Computadoras',
            description='Conceptos fundamentales de redes.',
        )
        q8 = Question.objects.create(exam=exam3, text='¿Qué protocolo se usa para navegar web?')
        q9 = Question.objects.create(exam=exam3, text='¿Cuántos bytes tiene un IPv4?')

        Option.objects.create(question=q8, text='FTP', is_correct=False)
        Option.objects.create(question=q8, text='HTTP', is_correct=True)
        Option.objects.create(question=q8, text='SMTP', is_correct=False)

        Option.objects.create(question=q9, text='16', is_correct=False)
        Option.objects.create(question=q9, text='32', is_correct=True)
        Option.objects.create(question=q9, text='64', is_correct=False)

        self.stdout.write(
            self.style.SUCCESS(
                f'Created {Exam.objects.count()} exams with questions and options.'
            )
        )
