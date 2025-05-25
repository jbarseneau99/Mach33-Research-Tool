package com.mach33.research.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {
    
    public enum Role {
        USER("user"),
        CLAUDE("claude"),
        CHATGPT("chatgpt"),
        GROK("grok"),
        SYSTEM("system");
        
        private final String value;
        
        Role(String value) {
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
    private Role role;
    
    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> metadata;
    
    // Constructors
    public ChatMessage() {}
    
    public ChatMessage(ResearchSession session, Role role, String content) {
        this.session = session;
        this.role = role;
        this.content = content;
    }
    
    public ChatMessage(ResearchSession session, Role role, String content, Map<String, Object> metadata) {
        this.session = session;
        this.role = role;
        this.content = content;
        this.metadata = metadata;
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
    
    public Role getRole() {
        return role;
    }
    
    public void setRole(Role role) {
        this.role = role;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public Map<String, Object> getMetadata() {
        return metadata;
    }
    
    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }
    
    @Override
    public String toString() {
        return String.format("ChatMessage{id=%s, role=%s, content='%s'}", 
                           id, role, content.length() > 50 ? content.substring(0, 50) + "..." : content);
    }
} 