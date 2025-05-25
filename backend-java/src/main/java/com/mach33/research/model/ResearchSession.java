package com.mach33.research.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "research_sessions")
public class ResearchSession {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @NotBlank
    @Size(max = 255)
    @Column(nullable = false)
    private String title = "New Research Session";
    
    @Column(columnDefinition = "TEXT")
    private String researchQuestion;
    
    @Size(max = 50)
    @Column(nullable = false)
    private String methodology = "inquiry_cycle";
    
    @Column(nullable = false)
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    // Relationships
    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ChatMessage> messages = new ArrayList<>();
    
    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Artifact> artifacts = new ArrayList<>();
    
    // Constructors
    public ResearchSession() {}
    
    public ResearchSession(String title, String researchQuestion, String methodology) {
        this.title = title;
        this.researchQuestion = researchQuestion;
        this.methodology = methodology;
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getResearchQuestion() {
        return researchQuestion;
    }
    
    public void setResearchQuestion(String researchQuestion) {
        this.researchQuestion = researchQuestion;
    }
    
    public String getMethodology() {
        return methodology;
    }
    
    public void setMethodology(String methodology) {
        this.methodology = methodology;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public List<ChatMessage> getMessages() {
        return messages;
    }
    
    public void setMessages(List<ChatMessage> messages) {
        this.messages = messages;
    }
    
    public List<Artifact> getArtifacts() {
        return artifacts;
    }
    
    public void setArtifacts(List<Artifact> artifacts) {
        this.artifacts = artifacts;
    }
    
    // Helper methods
    public void addMessage(ChatMessage message) {
        messages.add(message);
        message.setSession(this);
    }
    
    public void addArtifact(Artifact artifact) {
        artifacts.add(artifact);
        artifact.setSession(this);
    }
    
    @Override
    public String toString() {
        return String.format("ResearchSession{id=%s, title='%s', methodology='%s'}", 
                           id, title, methodology);
    }
} 