from __future__ import absolute_import
import os
from celery import Celery
from django.conf import settings

#import sys
#sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
#print (sys.path)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', "leonardo.annotator.settings")
app = Celery('leonardoAnnotator')

app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
#app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)


@app.task(bind=True)
def debug_task(self):
    print('Request: {0!r}'.format(self.request))