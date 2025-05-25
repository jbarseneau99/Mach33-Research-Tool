"""
Tests for the Research Platform API
"""
import pytest
from django.test import TestCase, Client
from django.urls import reverse
import json

class APITestCase(TestCase):
    def setUp(self):
        self.client = Client()

    def test_health_check(self):
        """Test health check endpoint"""
        response = self.client.get('/api/health/')
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertEqual(data['status'], 'healthy')
        self.assertEqual(data['service'], 'research-platform-api')

    def test_api_info(self):
        """Test API info endpoint"""
        response = self.client.get('/api/info/')
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertEqual(data['name'], 'Multi-Agent Research Platform API')
        self.assertIn('endpoints', data)
        self.assertIn('ai_agents', data)

    def test_api_root(self):
        """Test API root endpoint"""
        response = self.client.get('/api/')
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertIn('name', data)

@pytest.mark.django_db
def test_health_endpoint():
    """Pytest version of health check"""
    client = Client()
    response = client.get('/api/health/')
    assert response.status_code == 200
    
    data = response.json()
    assert data['status'] == 'healthy' 