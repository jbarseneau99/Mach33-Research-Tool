package com.mach33.research.controller;

import com.mach33.research.service.InMemoryResearchStatementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/research-statements")
@CrossOrigin(origins = "*")
public class ResearchStatementController {
    
    @Autowired
    private InMemoryResearchStatementService researchStatementService;
    
    /**
     * Create a new research statement
     */
    @PostMapping
    public ResponseEntity<InMemoryResearchStatementService.ResearchStatementDto> createStatement(@RequestBody CreateStatementRequest request) {
        try {
            InMemoryResearchStatementService.ResearchStatementDto statement = researchStatementService.createStatement(
                request.originalStatement,
                request.sessionId,
                request.type.toUpperCase()
            );
            return ResponseEntity.ok(statement);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get all statements for a session
     */
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<InMemoryResearchStatementService.ResearchStatementDto>> getStatementsBySession(@PathVariable String sessionId) {
        try {
            if (researchStatementService == null) {
                System.err.println("ERROR: researchStatementService is null - dependency injection failed");
                return ResponseEntity.status(500).build();
            }
            List<InMemoryResearchStatementService.ResearchStatementDto> statements = researchStatementService.getStatementsBySession(sessionId);
            return ResponseEntity.ok(statements);
        } catch (Exception e) {
            System.err.println("ERROR in getStatementsBySession: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * Get statements by type for a session
     */
    @GetMapping("/session/{sessionId}/type/{type}")
    public ResponseEntity<List<InMemoryResearchStatementService.ResearchStatementDto>> getStatementsByType(
            @PathVariable String sessionId, 
            @PathVariable String type) {
        try {
            List<InMemoryResearchStatementService.ResearchStatementDto> statements = researchStatementService.getStatementsByType(sessionId, type.toUpperCase());
            return ResponseEntity.ok(statements);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get the active statement for a session
     */
    @GetMapping("/session/{sessionId}/active")
    public ResponseEntity<InMemoryResearchStatementService.ResearchStatementDto> getActiveStatement(@PathVariable String sessionId) {
        return researchStatementService.getActiveStatement(sessionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Refine a research statement
     */
    @PutMapping("/{statementId}/refine")
    public ResponseEntity<InMemoryResearchStatementService.ResearchStatementDto> refineStatement(
            @PathVariable Long statementId,
            @RequestBody RefineStatementRequest request) {
        try {
            InMemoryResearchStatementService.ResearchStatementDto statement = researchStatementService.refineStatement(
                statementId,
                request.refinedStatement,
                request.refinementNotes
            );
            return ResponseEntity.ok(statement);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Add subquestions to a statement
     */
    @PostMapping("/{statementId}/subquestions")
    public ResponseEntity<InMemoryResearchStatementService.ResearchStatementDto> addSubquestions(
            @PathVariable Long statementId,
            @RequestBody AddSubquestionsRequest request) {
        try {
            InMemoryResearchStatementService.ResearchStatementDto statement = researchStatementService.addSubquestions(statementId, request.subquestions);
            return ResponseEntity.ok(statement);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Generate subquestions for a statement
     */
    @PostMapping("/generate-subquestions")
    public ResponseEntity<List<String>> generateSubquestions(@RequestBody GenerateSubquestionsRequest request) {
        List<String> subquestions = researchStatementService.generateSubquestions(request.researchStatement);
        return ResponseEntity.ok(subquestions);
    }
    
    /**
     * Update statement status
     */
    @PutMapping("/{statementId}/status")
    public ResponseEntity<InMemoryResearchStatementService.ResearchStatementDto> updateStatus(
            @PathVariable Long statementId,
            @RequestBody UpdateStatusRequest request) {
        try {
            InMemoryResearchStatementService.ResearchStatementDto statement = researchStatementService.updateStatus(statementId, request.status.toUpperCase());
            return ResponseEntity.ok(statement);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Search statements by content
     */
    @GetMapping("/session/{sessionId}/search")
    public ResponseEntity<List<InMemoryResearchStatementService.ResearchStatementDto>> searchStatements(
            @PathVariable String sessionId,
            @RequestParam String q) {
        List<InMemoryResearchStatementService.ResearchStatementDto> statements = researchStatementService.searchStatements(sessionId, q);
        return ResponseEntity.ok(statements);
    }
    
    /**
     * Get statement statistics for a session
     */
    @GetMapping("/session/{sessionId}/statistics")
    public ResponseEntity<Map<String, Object>> getStatementStatistics(@PathVariable String sessionId) {
        try {
            if (researchStatementService == null) {
                System.err.println("ERROR: researchStatementService is null in statistics endpoint");
                return ResponseEntity.status(500).build();
            }
            InMemoryResearchStatementService.StatementStatistics stats = researchStatementService.getStatementStatistics(sessionId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("totalStatements", stats.totalStatements);
            response.put("exploratoryCount", stats.exploratoryCount);
            response.put("specificCount", stats.specificCount);
            response.put("hypothesisCount", stats.hypothesisCount);
            response.put("activeCount", stats.activeCount);
            response.put("refinedCount", stats.refinedCount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("ERROR in getStatementStatistics: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * Test endpoint to verify service injection
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> test() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("controller", "ResearchStatementController");
        response.put("serviceInjected", researchStatementService != null);
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }
    
    // Request DTOs
    public static class CreateStatementRequest {
        public String originalStatement;
        public String sessionId;
        public String type;
    }
    
    public static class RefineStatementRequest {
        public String refinedStatement;
        public String refinementNotes;
    }
    
    public static class AddSubquestionsRequest {
        public List<String> subquestions;
    }
    
    public static class GenerateSubquestionsRequest {
        public String researchStatement;
    }
    
    public static class UpdateStatusRequest {
        public String status;
    }
} 