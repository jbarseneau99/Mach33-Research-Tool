package com.mach33.research.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "research_statements")
public class ResearchStatement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 1000)
    private String originalStatement;
    
    @Column(length = 1000)
    private String refinedStatement;
    
    @Column(nullable = false)
    private String sessionId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatementType type;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatementStatus status;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column
    private LocalDateTime lastRefinedAt;
    
    @ElementCollection
    @CollectionTable(name = "research_subquestions", joinColumns = @JoinColumn(name = "statement_id"))
    @Column(name = "subquestion", length = 500)
    private List<String> subquestions = new ArrayList<>();
    
    @Column(length = 2000)
    private String refinementNotes;
    
    @Column
    private Integer refinementCount = 0;
    
    // Constructors
    public ResearchStatement() {}
    
    public ResearchStatement(String originalStatement, String sessionId, StatementType type) {
        this.originalStatement = originalStatement;
        this.sessionId = sessionId;
        this.type = type;
        this.status = StatementStatus.DRAFT;
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getOriginalStatement() {
        return originalStatement;
    }
    
    public void setOriginalStatement(String originalStatement) {
        this.originalStatement = originalStatement;
    }
    
    public String getRefinedStatement() {
        return refinedStatement;
    }
    
    public void setRefinedStatement(String refinedStatement) {
        this.refinedStatement = refinedStatement;
        this.lastRefinedAt = LocalDateTime.now();
        this.refinementCount++;
    }
    
    public String getSessionId() {
        return sessionId;
    }
    
    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
    
    public StatementType getType() {
        return type;
    }
    
    public void setType(StatementType type) {
        this.type = type;
    }
    
    public StatementStatus getStatus() {
        return status;
    }
    
    public void setStatus(StatementStatus status) {
        this.status = status;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getLastRefinedAt() {
        return lastRefinedAt;
    }
    
    public void setLastRefinedAt(LocalDateTime lastRefinedAt) {
        this.lastRefinedAt = lastRefinedAt;
    }
    
    public List<String> getSubquestions() {
        return subquestions;
    }
    
    public void setSubquestions(List<String> subquestions) {
        this.subquestions = subquestions;
    }
    
    public void addSubquestion(String subquestion) {
        this.subquestions.add(subquestion);
    }
    
    public String getRefinementNotes() {
        return refinementNotes;
    }
    
    public void setRefinementNotes(String refinementNotes) {
        this.refinementNotes = refinementNotes;
    }
    
    public Integer getRefinementCount() {
        return refinementCount;
    }
    
    public void setRefinementCount(Integer refinementCount) {
        this.refinementCount = refinementCount;
    }
    
    // Enums
    public enum StatementType {
        EXPLORATORY,
        SPECIFIC,
        HYPOTHESIS,
        RESEARCH_QUESTION
    }
    
    public enum StatementStatus {
        DRAFT,
        ACTIVE,
        REFINED,
        COMPLETED,
        ARCHIVED
    }
} 