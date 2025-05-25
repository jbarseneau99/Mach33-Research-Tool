package com.mach33.research.service;

import com.mach33.research.model.ResearchStatement;
import com.mach33.research.repository.ResearchStatementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Arrays;

@Service
@Transactional
public class ResearchStatementService {
    
    @Autowired
    private ResearchStatementRepository researchStatementRepository;
    
    /**
     * Create a new research statement
     */
    public ResearchStatement createStatement(String originalStatement, String sessionId, ResearchStatement.StatementType type) {
        ResearchStatement statement = new ResearchStatement(originalStatement, sessionId, type);
        return researchStatementRepository.save(statement);
    }
    
    /**
     * Refine an existing research statement
     */
    public ResearchStatement refineStatement(Long statementId, String refinedStatement, String refinementNotes) {
        Optional<ResearchStatement> optionalStatement = researchStatementRepository.findById(statementId);
        if (optionalStatement.isPresent()) {
            ResearchStatement statement = optionalStatement.get();
            statement.setRefinedStatement(refinedStatement);
            statement.setRefinementNotes(refinementNotes);
            statement.setStatus(ResearchStatement.StatementStatus.REFINED);
            return researchStatementRepository.save(statement);
        }
        throw new RuntimeException("Research statement not found with id: " + statementId);
    }
    
    /**
     * Add subquestions to a research statement
     */
    public ResearchStatement addSubquestions(Long statementId, List<String> subquestions) {
        Optional<ResearchStatement> optionalStatement = researchStatementRepository.findById(statementId);
        if (optionalStatement.isPresent()) {
            ResearchStatement statement = optionalStatement.get();
            statement.getSubquestions().addAll(subquestions);
            return researchStatementRepository.save(statement);
        }
        throw new RuntimeException("Research statement not found with id: " + statementId);
    }
    
    /**
     * Generate subquestions using AI (placeholder for now)
     */
    public List<String> generateSubquestions(String researchStatement) {
        // TODO: Integrate with AI service to generate intelligent subquestions
        // For now, return some example subquestions based on common research patterns
        
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
        // Simple extraction - in a real implementation, this would use NLP
        String[] words = statement.split(" ");
        if (words.length > 3) {
            return String.join(" ", Arrays.copyOfRange(words, 0, Math.min(4, words.length)));
        }
        return statement;
    }
    
    /**
     * Get all statements for a session
     */
    public List<ResearchStatement> getStatementsBySession(String sessionId) {
        return researchStatementRepository.findBySessionIdOrderByCreatedAtDesc(sessionId);
    }
    
    /**
     * Get statements by type for a session
     */
    public List<ResearchStatement> getStatementsByType(String sessionId, ResearchStatement.StatementType type) {
        return researchStatementRepository.findBySessionIdAndTypeOrderByCreatedAtDesc(sessionId, type);
    }
    
    /**
     * Get the current active statement for a session
     */
    public Optional<ResearchStatement> getActiveStatement(String sessionId) {
        return researchStatementRepository.findFirstBySessionIdAndStatusOrderByCreatedAtDesc(sessionId, ResearchStatement.StatementStatus.ACTIVE);
    }
    
    /**
     * Update statement status
     */
    public ResearchStatement updateStatus(Long statementId, ResearchStatement.StatementStatus status) {
        Optional<ResearchStatement> optionalStatement = researchStatementRepository.findById(statementId);
        if (optionalStatement.isPresent()) {
            ResearchStatement statement = optionalStatement.get();
            statement.setStatus(status);
            return researchStatementRepository.save(statement);
        }
        throw new RuntimeException("Research statement not found with id: " + statementId);
    }
    
    /**
     * Search statements by content
     */
    public List<ResearchStatement> searchStatements(String sessionId, String searchTerm) {
        return researchStatementRepository.searchByContent(sessionId, searchTerm);
    }
    
    /**
     * Get statement statistics for a session
     */
    public StatementStatistics getStatementStatistics(String sessionId) {
        StatementStatistics stats = new StatementStatistics();
        stats.totalStatements = researchStatementRepository.countBySessionId(sessionId);
        stats.exploratoryCount = researchStatementRepository.countBySessionIdAndType(sessionId, ResearchStatement.StatementType.EXPLORATORY);
        stats.specificCount = researchStatementRepository.countBySessionIdAndType(sessionId, ResearchStatement.StatementType.SPECIFIC);
        stats.hypothesisCount = researchStatementRepository.countBySessionIdAndType(sessionId, ResearchStatement.StatementType.HYPOTHESIS);
        stats.activeCount = researchStatementRepository.countBySessionIdAndStatus(sessionId, ResearchStatement.StatementStatus.ACTIVE);
        stats.refinedCount = researchStatementRepository.countBySessionIdAndStatus(sessionId, ResearchStatement.StatementStatus.REFINED);
        return stats;
    }
    
    /**
     * Inner class for statement statistics
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