package com.mach33.research.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class InMemoryResearchStatementService {
    
    private final Map<Long, ResearchStatementDto> statements = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(1);
    
    /**
     * Create a new research statement
     */
    public ResearchStatementDto createStatement(String originalStatement, String sessionId, String type) {
        ResearchStatementDto statement = new ResearchStatementDto();
        statement.id = idGenerator.getAndIncrement();
        statement.originalStatement = originalStatement;
        statement.sessionId = sessionId;
        statement.type = type;
        statement.status = "DRAFT";
        statement.createdAt = LocalDateTime.now();
        statement.refinementCount = 0;
        statement.subquestions = new ArrayList<>();
        
        statements.put(statement.id, statement);
        return statement;
    }
    
    /**
     * Refine an existing research statement
     */
    public ResearchStatementDto refineStatement(Long statementId, String refinedStatement, String refinementNotes) {
        ResearchStatementDto statement = statements.get(statementId);
        if (statement == null) {
            throw new RuntimeException("Research statement not found with id: " + statementId);
        }
        
        statement.refinedStatement = refinedStatement;
        statement.refinementNotes = refinementNotes;
        statement.status = "REFINED";
        statement.lastRefinedAt = LocalDateTime.now();
        statement.refinementCount++;
        
        return statement;
    }
    
    /**
     * Add subquestions to a research statement
     */
    public ResearchStatementDto addSubquestions(Long statementId, List<String> subquestions) {
        ResearchStatementDto statement = statements.get(statementId);
        if (statement == null) {
            throw new RuntimeException("Research statement not found with id: " + statementId);
        }
        
        statement.subquestions.addAll(subquestions);
        return statement;
    }
    
    /**
     * Generate subquestions using AI (placeholder for now)
     */
    public List<String> generateSubquestions(String researchStatement) {
        // Simple rule-based generation for now
        if (researchStatement.toLowerCase().contains("impact") || researchStatement.toLowerCase().contains("effect")) {
            return Arrays.asList(
                "What are the direct effects of " + extractMainTopic(researchStatement) + "?",
                "What are the indirect consequences?",
                "How can these impacts be measured?",
                "What factors influence the magnitude of impact?"
            );
        } else if (researchStatement.toLowerCase().contains("relationship") || researchStatement.toLowerCase().contains("correlation")) {
            return Arrays.asList(
                "What is the nature of this relationship?",
                "Is this relationship causal or correlational?",
                "What variables might mediate this relationship?",
                "How strong is this relationship?"
            );
        } else {
            return Arrays.asList(
                "What are the key components of " + extractMainTopic(researchStatement) + "?",
                "What existing research addresses this topic?",
                "What methodologies are most appropriate for investigating this?",
                "What are the potential limitations of this research?"
            );
        }
    }
    
    /**
     * Extract main topic from research statement (simple implementation)
     */
    private String extractMainTopic(String statement) {
        String[] words = statement.split(" ");
        if (words.length > 3) {
            return String.join(" ", Arrays.copyOfRange(words, 0, Math.min(4, words.length)));
        }
        return statement;
    }
    
    /**
     * Get all statements for a session
     */
    public List<ResearchStatementDto> getStatementsBySession(String sessionId) {
        return statements.values().stream()
                .filter(s -> sessionId.equals(s.sessionId))
                .sorted((a, b) -> b.createdAt.compareTo(a.createdAt))
                .collect(Collectors.toList());
    }
    
    /**
     * Get statements by type for a session
     */
    public List<ResearchStatementDto> getStatementsByType(String sessionId, String type) {
        return statements.values().stream()
                .filter(s -> sessionId.equals(s.sessionId) && type.equals(s.type))
                .sorted((a, b) -> b.createdAt.compareTo(a.createdAt))
                .collect(Collectors.toList());
    }
    
    /**
     * Get the current active statement for a session
     */
    public Optional<ResearchStatementDto> getActiveStatement(String sessionId) {
        return statements.values().stream()
                .filter(s -> sessionId.equals(s.sessionId) && "ACTIVE".equals(s.status))
                .max(Comparator.comparing(s -> s.createdAt));
    }
    
    /**
     * Update statement status
     */
    public ResearchStatementDto updateStatus(Long statementId, String status) {
        ResearchStatementDto statement = statements.get(statementId);
        if (statement == null) {
            throw new RuntimeException("Research statement not found with id: " + statementId);
        }
        
        statement.status = status;
        return statement;
    }
    
    /**
     * Search statements by content
     */
    public List<ResearchStatementDto> searchStatements(String sessionId, String searchTerm) {
        String lowerSearchTerm = searchTerm.toLowerCase();
        return statements.values().stream()
                .filter(s -> sessionId.equals(s.sessionId))
                .filter(s -> 
                    (s.originalStatement != null && s.originalStatement.toLowerCase().contains(lowerSearchTerm)) ||
                    (s.refinedStatement != null && s.refinedStatement.toLowerCase().contains(lowerSearchTerm))
                )
                .sorted((a, b) -> b.createdAt.compareTo(a.createdAt))
                .collect(Collectors.toList());
    }
    
    /**
     * Get statement statistics for a session
     */
    public StatementStatistics getStatementStatistics(String sessionId) {
        List<ResearchStatementDto> sessionStatements = getStatementsBySession(sessionId);
        
        StatementStatistics stats = new StatementStatistics();
        stats.totalStatements = sessionStatements.size();
        stats.exploratoryCount = sessionStatements.stream().mapToInt(s -> "EXPLORATORY".equals(s.type) ? 1 : 0).sum();
        stats.specificCount = sessionStatements.stream().mapToInt(s -> "SPECIFIC".equals(s.type) ? 1 : 0).sum();
        stats.hypothesisCount = sessionStatements.stream().mapToInt(s -> "HYPOTHESIS".equals(s.type) ? 1 : 0).sum();
        stats.activeCount = sessionStatements.stream().mapToInt(s -> "ACTIVE".equals(s.status) ? 1 : 0).sum();
        stats.refinedCount = sessionStatements.stream().mapToInt(s -> "REFINED".equals(s.status) ? 1 : 0).sum();
        
        return stats;
    }
    
    /**
     * DTO for research statements
     */
    public static class ResearchStatementDto {
        public Long id;
        public String originalStatement;
        public String refinedStatement;
        public String sessionId;
        public String type;
        public String status;
        public LocalDateTime createdAt;
        public LocalDateTime lastRefinedAt;
        public List<String> subquestions;
        public String refinementNotes;
        public Integer refinementCount;
    }
    
    /**
     * Statistics class
     */
    public static class StatementStatistics {
        public long totalStatements;
        public long exploratoryCount;
        public long specificCount;
        public long hypothesisCount;
        public long activeCount;
        public long refinedCount;
    }
} 