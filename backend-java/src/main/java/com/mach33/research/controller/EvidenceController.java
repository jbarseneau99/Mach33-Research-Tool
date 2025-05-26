package com.mach33.research.controller;

import com.mach33.research.service.InMemoryEvidenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/evidence")
@CrossOrigin(origins = "*")
public class EvidenceController {
    
    private final InMemoryEvidenceService evidenceService;
    
    public EvidenceController(InMemoryEvidenceService evidenceService) {
        this.evidenceService = evidenceService;
    }
    
    /**
     * Create a new evidence item
     */
    @PostMapping
    public ResponseEntity<InMemoryEvidenceService.EvidenceDto> createEvidence(@RequestBody CreateEvidenceRequest request) {
        try {
            InMemoryEvidenceService.EvidenceDto evidence = evidenceService.createEvidence(
                request.content,
                request.sessionId,
                request.type.toUpperCase(),
                request.source
            );
            return ResponseEntity.ok(evidence);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get all evidence for a session
     */
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<InMemoryEvidenceService.EvidenceDto>> getEvidenceBySession(@PathVariable String sessionId) {
        try {
            if (evidenceService == null) {
                System.err.println("ERROR: evidenceService is null - dependency injection failed");
                return ResponseEntity.status(500).build();
            }
            List<InMemoryEvidenceService.EvidenceDto> evidence = evidenceService.getEvidenceBySession(sessionId);
            return ResponseEntity.ok(evidence);
        } catch (Exception e) {
            System.err.println("ERROR in getEvidenceBySession: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * Get evidence by type for a session
     */
    @GetMapping("/session/{sessionId}/type/{type}")
    public ResponseEntity<List<InMemoryEvidenceService.EvidenceDto>> getEvidenceByType(
            @PathVariable String sessionId, 
            @PathVariable String type) {
        List<InMemoryEvidenceService.EvidenceDto> evidence = evidenceService.getEvidenceByType(sessionId, type.toUpperCase());
        return ResponseEntity.ok(evidence);
    }
    
    /**
     * Get evidence linked to a specific claim
     */
    @GetMapping("/session/{sessionId}/claim/{claimId}")
    public ResponseEntity<List<InMemoryEvidenceService.EvidenceDto>> getEvidenceForClaim(
            @PathVariable String sessionId,
            @PathVariable Long claimId) {
        List<InMemoryEvidenceService.EvidenceDto> evidence = evidenceService.getEvidenceForClaim(sessionId, claimId);
        return ResponseEntity.ok(evidence);
    }
    
    /**
     * Link evidence to a claim
     */
    @PostMapping("/{evidenceId}/link-claim")
    public ResponseEntity<InMemoryEvidenceService.EvidenceDto> linkToClaim(
            @PathVariable Long evidenceId,
            @RequestBody LinkClaimRequest request) {
        try {
            InMemoryEvidenceService.EvidenceDto evidence = evidenceService.linkToClaim(
                evidenceId,
                request.claimId,
                request.linkType.toUpperCase()
            );
            return ResponseEntity.ok(evidence);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Update reliability score
     */
    @PutMapping("/{evidenceId}/reliability")
    public ResponseEntity<InMemoryEvidenceService.EvidenceDto> updateReliability(
            @PathVariable Long evidenceId,
            @RequestBody UpdateReliabilityRequest request) {
        try {
            InMemoryEvidenceService.EvidenceDto evidence = evidenceService.updateReliability(
                evidenceId,
                request.score,
                request.reason
            );
            return ResponseEntity.ok(evidence);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Add tags to evidence
     */
    @PostMapping("/{evidenceId}/tags")
    public ResponseEntity<InMemoryEvidenceService.EvidenceDto> addTags(
            @PathVariable Long evidenceId,
            @RequestBody AddTagsRequest request) {
        try {
            InMemoryEvidenceService.EvidenceDto evidence = evidenceService.addTags(evidenceId, request.tags);
            return ResponseEntity.ok(evidence);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Extract potential evidence from text
     */
    @PostMapping("/extract")
    public ResponseEntity<List<String>> extractEvidence(@RequestBody ExtractEvidenceRequest request) {
        List<String> potentialEvidence = evidenceService.extractPotentialEvidence(request.text);
        return ResponseEntity.ok(potentialEvidence);
    }
    
    /**
     * Search evidence by content
     */
    @GetMapping("/session/{sessionId}/search")
    public ResponseEntity<List<InMemoryEvidenceService.EvidenceDto>> searchEvidence(
            @PathVariable String sessionId,
            @RequestParam String q) {
        List<InMemoryEvidenceService.EvidenceDto> evidence = evidenceService.searchEvidence(sessionId, q);
        return ResponseEntity.ok(evidence);
    }
    
    /**
     * Get evidence statistics for a session
     */
    @GetMapping("/session/{sessionId}/statistics")
    public ResponseEntity<Map<String, Object>> getEvidenceStatistics(@PathVariable String sessionId) {
        InMemoryEvidenceService.EvidenceStatistics stats = evidenceService.getEvidenceStatistics(sessionId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("totalEvidence", stats.totalEvidence);
        response.put("primaryCount", stats.primaryCount);
        response.put("secondaryCount", stats.secondaryCount);
        response.put("tertiaryCount", stats.tertiaryCount);
        response.put("averageReliability", stats.averageReliability);
        response.put("linkedCount", stats.linkedCount);
        
        return ResponseEntity.ok(response);
    }
    
    // Request DTOs
    public static class CreateEvidenceRequest {
        public String content;
        public String sessionId;
        public String type; // PRIMARY, SECONDARY, TERTIARY
        public String source;
    }
    
    public static class LinkClaimRequest {
        public Long claimId;
        public String linkType; // SUPPORTS, CONTRADICTS, NEUTRAL, PARTIAL
    }
    
    public static class UpdateReliabilityRequest {
        public double score;
        public String reason;
    }
    
    public static class AddTagsRequest {
        public List<String> tags;
    }
    
    public static class ExtractEvidenceRequest {
        public String text;
    }
} 