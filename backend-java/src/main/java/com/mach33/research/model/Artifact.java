package com.mach33.research.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "artifacts")
public class Artifact {
    
    public enum ArtifactType {
        RESEARCH_STATEMENT("research_statement"),
        CLAIM("claim"),
        EVIDENCE("evidence"),
        HYPOTHESIS("hypothesis"),
        QUESTION("question");
        
        private final String value;
        
        ArtifactType(String value) {
            this.value = value;
        }
        
        public String getValue() {
            return value;
        }
    }
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private ResearchSession session;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ArtifactType artifactType;
    
    @NotBlank
    @Size(max = 255)
    @Column(nullable = false)
    private String title;
    
    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_message_id")
    private ChatMessage sourceMessage;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(nullable = false)
    private Double confidenceScore = 0.0;
    
    // Constructors
    public Artifact() {}
    
    public Artifact(ResearchSession session, ArtifactType artifactType, String title, String content) {
        this.session = session;
        this.artifactType = artifactType;
        this.title = title;
        this.content = content;
    }
    
    public Artifact(ResearchSession session, ArtifactType artifactType, String title, String content, 
                   ChatMessage sourceMessage, Double confidenceScore) {
        this.session = session;
        this.artifactType = artifactType;
        this.title = title;
        this.content = content;
        this.sourceMessage = sourceMessage;
        this.confidenceScore = confidenceScore;
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public ResearchSession getSession() {
        return session;
    }
    
    public void setSession(ResearchSession session) {
        this.session = session;
    }
    
    public ArtifactType getArtifactType() {
        return artifactType;
    }
    
    public void setArtifactType(ArtifactType artifactType) {
        this.artifactType = artifactType;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public ChatMessage getSourceMessage() {
        return sourceMessage;
    }
    
    public void setSourceMessage(ChatMessage sourceMessage) {
        this.sourceMessage = sourceMessage;
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
    
    public Double getConfidenceScore() {
        return confidenceScore;
    }
    
    public void setConfidenceScore(Double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }
    
    @Override
    public String toString() {
        return String.format("Artifact{id=%s, type=%s, title='%s'}", 
                           id, artifactType, title);
    }
} 