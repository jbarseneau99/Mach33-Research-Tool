"""
URL configuration for research_platform project.
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
import os

@api_view(['GET'])
def health_check(request):
    """Health check endpoint for Cloud Run"""
    return Response({
        'status': 'healthy',
        'service': 'research-platform-api',
        'version': '1.0.0',
        'environment': os.environ.get('ENVIRONMENT', 'development'),
        'message': 'Multi-Agent Research Platform API is running! 🚀'
    })

@api_view(['GET'])
def api_info(request):
    """API information endpoint"""
    return Response({
        'name': 'Multi-Agent Research Platform API',
        'version': '1.0.0',
        'description': 'API for AI-powered research platform',
        'endpoints': {
            'health': '/api/health/',
            'info': '/api/info/',
            'admin': '/admin/',
        },
        'ai_agents': {
            'claude': 'Ready for integration',
            'chatgpt': 'Ready for integration', 
            'grok': 'Ready for integration'
        },
        'features': [
            'Document processing',
            'AI agent orchestration',
            'Research workflow management',
            'Real-time collaboration'
        ]
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health_check'),
    path('api/info/', api_info, name='api_info'),
    path('api/', api_info, name='api_root'),  # Default API endpoint
] 