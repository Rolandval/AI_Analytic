from celery import Celery
import os

# Встановлюємо налаштування для Celery
CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.getenv('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')

# Створюємо екземпляр Celery
celery_app = Celery(
    'ai_analytic',
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND,
    include=['tasks']  # Тут вказуємо модулі, де знаходяться наші таски
)

# Налаштування Celery
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='Europe/Kiev',
    enable_utc=True,
)

# Налаштування для Celery Beat (планувальник задач)
celery_app.conf.beat_schedule = {
    'process-files-every-hour': {
        'task': 'tasks.process_files',
        'schedule': 3600.0,  # Кожну годину
    },
}

if __name__ == '__main__':
    celery_app.start()