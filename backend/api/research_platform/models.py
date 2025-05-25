from django.db import models
from django.contrib.auth.models import User
import uuid

class ResearchSession(models.Model):
    """Research session model for organizing conversations and artifacts"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, default="New Research Session")
    research_question = models.TextField(blank=True, null=True)
    methodology = models.CharField(max_length=50, default="inquiry_cycle")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"{self.title} ({self.created_at.strftime('%Y-%m-%d')})"

class ChatMessage(models.Model):
    """Chat message model for storing conversation history"""
    ROLE_CHOICES = [
        ('user', 'User'),
        ('claude', 'Claude'),
        ('chatgpt', 'ChatGPT'),
        ('grok', 'Grok'),
        ('system', 'System'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(ResearchSession, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True)  # For storing AI response metadata
    
    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"{self.role}: {self.content[:50]}..."

class Artifact(models.Model):
    """Basic artifact model for research claims, evidence, etc."""
    ARTIFACT_TYPES = [
        ('research_statement', 'Research Statement'),
        ('claim', 'Claim'),
        ('evidence', 'Evidence'),
        ('hypothesis', 'Hypothesis'),
        ('question', 'Question'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(ResearchSession, on_delete=models.CASCADE, related_name='artifacts')
    artifact_type = models.CharField(max_length=20, choices=ARTIFACT_TYPES)
    title = models.CharField(max_length=255)
    content = models.TextField()
    source_message = models.ForeignKey(ChatMessage, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confidence_score = models.FloatField(default=0.0)  # AI confidence in artifact extraction
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.artifact_type}: {self.title}" 