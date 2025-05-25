package com.mach33.research.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class FileBasedResearchStatementService {
    
    private final Map<Long, ResearchStatementDto> statements = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(1);
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String dataDir = "/tmp/research-data";
    private final String statementsFile = dataDir + "/statements.json";
    
    public FileBasedResearchStatementService() {
        // Create data directory
        new File(dataDir).mkdirs();
        loadFromFile();
    }
    
    private void loadFromFile() {
        try {
            File file = new File(statementsFile);
            if (file.exists()) {
                List<ResearchStatementDto> loadedStatements = objectMapper.readValue(
                    file, new TypeReference<List<ResearchStatementDto>>() {}
                );
                
                for (ResearchStatementDto stmt : loadedStatements) {
                    statements.put(stmt.getId(), stmt);
                    if (stmt.getId() >= idGenerator.get()) {
                        idGenerator.set(stmt.getId() + 1);
                    }
                }
                System.out.println("Loaded " + loadedStatements.size() + " statements from file");
            }
        } catch (IOException e) {
            System.err.println("Error loading statements from file: " + e.getMessage());
        }
    }
    
    private void saveToFile() {
        try {
            List<ResearchStatementDto> statementsList = new ArrayList<>(statements.values());
            objectMapper.writeValue(new File(statementsFile), statementsList);
        } catch (IOException e) {
            System.err.println("Error saving statements to file: " + e.getMessage());
        }
    }
    
    public ResearchStatementDto createStatement(String originalStatement, String sessionId, String type) {
        ResearchStatementDto statement = new ResearchStatementDto();
        statement.setId(idGenerator.getAndIncrement());
        statement.setOriginalStatement(originalStatement);
        statement.setSessionId(sessionId);
        statement.setType(type);
        statement.setStatus("DRAFT");
        statement.setCreatedAt(LocalDateTime.now());
        statement.setSubquestions(new ArrayList<>());
        statement.setRefinementCount(0);
        
        statements.put(statement.getId(), statement);
        saveToFile();
        return statement;
    }
    
    public ResearchStatementDto refineStatement(Long statementId, String refinedStatement, String refinementNotes) {
        ResearchStatementDto statement = statements.get(statementId);
        if (statement != null) {
            statement.setRefinedStatement(refinedStatement);
            statement.setRefinementNotes(refinementNotes);
            statement.setStatus("REFINED");
            statement.setLastRefinedAt(LocalDateTime.now());
            statement.setRefinementCount(statement.getRefinementCount() + 1);
            saveToFile();
        }
        return statement;
    }
    
    public ResearchStatementDto addSubquestions(Long statementId, List<String> subquestions) {
        ResearchStatementDto statement = statements.get(statementId);
        if (statement != null) {
            statement.getSubquestions().addAll(subquestions);
            saveToFile();
        }
        return statement;
    }
    
    public List<String> generateSubquestions(String researchStatement) {
        // AI-powered subquestion generation (placeholder)
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
    
    private String extractMainTopic(String statement) {
        String[] words = statement.split(" ");
        if (words.length > 3) {
            return String.join(" ", Arrays.copyOfRange(words, 0, Math.min(4, words.length)));
        }
        return statement;
    }
    
    public List<ResearchStatementDto> getStatementsBySession(String sessionId) {
        return statements.values().stream()
            .filter(s -> sessionId.equals(s.getSessionId()))
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .collect(Collectors.toList());
    }
    
    public List<ResearchStatementDto> getStatementsByType(String sessionId, String type) {
        return statements.values().stream()
            .filter(s -> sessionId.equals(s.getSessionId()) && type.equals(s.getType()))
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .collect(Collectors.toList());
    }
    
    public Optional<ResearchStatementDto> getActiveStatement(String sessionId) {
        return statements.values().stream()
            .filter(s -> sessionId.equals(s.getSessionId()) && "ACTIVE".equals(s.getStatus()))
            .findFirst();
    }
    
    public ResearchStatementDto updateStatus(Long statementId, String status) {
        ResearchStatementDto statement = statements.get(statementId);
        if (statement != null) {
            statement.setStatus(status);
            saveToFile();
        }
        return statement;
    }
    
    public List<ResearchStatementDto> searchStatements(String sessionId, String searchTerm) {
        String lowerSearchTerm = searchTerm.toLowerCase();
        return statements.values().stream()
            .filter(s -> sessionId.equals(s.getSessionId()))
            .filter(s -> s.getOriginalStatement().toLowerCase().contains(lowerSearchTerm) ||
                        (s.getRefinedStatement() != null && s.getRefinedStatement().toLowerCase().contains(lowerSearchTerm)))
            .collect(Collectors.toList());
    }
    
    public StatementStatistics getStatementStatistics(String sessionId) {
        List<ResearchStatementDto> sessionStatements = getStatementsBySession(sessionId);
        
        StatementStatistics stats = new StatementStatistics();
        stats.totalStatements = sessionStatements.size();
        stats.exploratoryCount = sessionStatements.stream().mapToLong(s -> "EXPLORATORY".equals(s.getType()) ? 1 : 0).sum();
        stats.specificCount = sessionStatements.stream().mapToLong(s -> "SPECIFIC".equals(s.getType()) ? 1 : 0).sum();
        stats.hypothesisCount = sessionStatements.stream().mapToLong(s -> "HYPOTHESIS".equals(s.getType()) ? 1 : 0).sum();
        stats.activeCount = sessionStatements.stream().mapToLong(s -> "ACTIVE".equals(s.getStatus()) ? 1 : 0).sum();
        stats.refinedCount = sessionStatements.stream().mapToLong(s -> "REFINED".equals(s.getStatus()) ? 1 : 0).sum();
        
        return stats;
    }
    
    // DTO Classes
    public static class ResearchStatementDto {
        private Long id;
        private String originalStatement;
        private String refinedStatement;
        private String sessionId;
        private String type;
        private String status;
        private LocalDateTime createdAt;
        private LocalDateTime lastRefinedAt;
        private List<String> subquestions;
        private String refinementNotes;
        private int refinementCount;
        
        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getOriginalStatement() { return originalStatement; }
        public void setOriginalStatement(String originalStatement) { this.originalStatement = originalStatement; }
        
        public String getRefinedStatement() { return refinedStatement; }
        public void setRefinedStatement(String refinedStatement) { this.refinedStatement = refinedStatement; }
        
        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }
        
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        
        public LocalDateTime getLastRefinedAt() { return lastRefinedAt; }
        public void setLastRefinedAt(LocalDateTime lastRefinedAt) { this.lastRefinedAt = lastRefinedAt; }
        
        public List<String> getSubquestions() { return subquestions; }
        public void setSubquestions(List<String> subquestions) { this.subquestions = subquestions; }
        
        public String getRefinementNotes() { return refinementNotes; }
        public void setRefinementNotes(String refinementNotes) { this.refinementNotes = refinementNotes; }
        
        public int getRefinementCount() { return refinementCount; }
        public void setRefinementCount(int refinementCount) { this.refinementCount = refinementCount; }
    }
    
    public static class StatementStatistics {
        public long totalStatements;
        public long exploratoryCount;
        public long specificCount;
        public long hypothesisCount;
        public long activeCount;
        public long refinedCount;
    }
} 