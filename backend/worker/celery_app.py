"""
Celery app for Multi-Agent Research Platform
"""
import os
from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'research_platform.settings')

app = Celery('research_platform')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    """Debug task for testing"""
    print(f'Request: {self.request!r}')
    return 'Debug task completed successfully!'

@app.task
def process_document(document_id):
    """Process uploaded document"""
    print(f'Processing document {document_id}...')
    # Simulate document processing
    import time
    time.sleep(2)
    print(f'Document {document_id} processed successfully!')
    return f'Document {document_id} processed'

@app.task
def ai_analysis_task(document_id, agent_type='claude'):
    """Run AI analysis on document"""
    print(f'Running {agent_type} analysis on document {document_id}...')
    # Simulate AI analysis
    import time
    time.sleep(3)
    result = {
        'document_id': document_id,
        'agent': agent_type,
        'analysis': f'AI analysis completed by {agent_type}',
        'confidence': 0.85,
        'insights': [
            'Key finding 1',
            'Key finding 2', 
            'Key finding 3'
        ]
    }
    print(f'AI analysis completed for document {document_id}')
    return result

@app.task
def health_check_task():
    """Worker health check task"""
    return {
        'status': 'healthy',
        'service': 'research-platform-worker',
        'message': 'Worker is running and ready to process tasks! 🚀'
    } 