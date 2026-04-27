import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DigiLib.settings')

app = Celery('DigiLib')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
