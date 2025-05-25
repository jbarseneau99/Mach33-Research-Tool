package com.mach33.research.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class InMemoryEvidenceService {
    
    private final Map<Long, EvidenceDto> evidence = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(1);
    
    /**
     * Create a new evidence item
     */
    public EvidenceDto createEvidence(String content, String sessionId, String type, String source) {
        EvidenceDto evidenceItem = new EvidenceDto();
        evidenceItem.id = idGenerator.getAndIncrement();
        evidenceItem.content = content;
        evidenceItem.sessionId = sessionId;
        evidenceItem.type = type; // PRIMARY, SECONDARY, TERTIARY
        evidenceItem.source = source;
        evidenceItem.reliabilityScore = calculateInitialReliability(type, source);
        evidenceItem.createdAt = LocalDateTime.now();
        evidenceItem.linkedClaims = new ArrayList<>();
        evidenceItem.tags = new ArrayList<>();
        evidenceItem.status = "ACTIVE";
        
        evidence.put(evidenceItem.id, evidenceItem);
        return evidenceItem;
    }
    
    /**
     * Link evidence to a claim/statement
     */
    public EvidenceDto linkToClaim(Long evidenceId, Long claimId, String linkType) {
        EvidenceDto evidenceItem = evidence.get(evidenceId);
        if (evidenceItem == null) {
            throw new RuntimeException("Evidence not found with id: " + evidenceId);
        }
        
        ClaimLink link = new ClaimLink();
        link.claimId = claimId;
        link.linkType = linkType; // SUPPORTS, CONTRADICTS, NEUTRAL, PARTIAL
        link.strength = calculateLinkStrength(evidenceItem, linkType);
        link.createdAt = LocalDateTime.now();
        
        evidenceItem.linkedClaims.add(link);
        return evidenceItem;
    }
    
    /**
     * Update reliability score based on verification
     */
    public EvidenceDto updateReliability(Long evidenceId, double newScore, String reason) {
        EvidenceDto evidenceItem = evidence.get(evidenceId);
        if (evidenceItem == null) {
            throw new RuntimeException("Evidence not found with id: " + evidenceId);
        }
        
        evidenceItem.reliabilityScore = Math.max(0.0, Math.min(1.0, newScore));
        evidenceItem.reliabilityReason = reason;
        evidenceItem.lastVerifiedAt = LocalDateTime.now();
        
        return evidenceItem;
    }
    
    /**
     * Add tags to evidence
     */
    public EvidenceDto addTags(Long evidenceId, List<String> tags) {
        EvidenceDto evidenceItem = evidence.get(evidenceId);
        if (evidenceItem == null) {
            throw new RuntimeException("Evidence not found with id: " + evidenceId);
        }
        
        evidenceItem.tags.addAll(tags);
        return evidenceItem;
    }
    
    /**
     * Extract evidence from text using simple patterns
     */
    public List<String> extractPotentialEvidence(String text) {
        List<String> potentialEvidence = new ArrayList<>();
        
        // Simple pattern matching for evidence indicators
        String[] evidencePatterns = {
            "according to", "research shows", "studies indicate", "data reveals",
            "evidence suggests", "findings show", "analysis demonstrates",
            "statistics show", "survey results", "experiment showed"
        };
        
        String lowerText = text.toLowerCase();
        String[] sentences = text.split("\\. ");
        
        for (String sentence : sentences) {
            String lowerSentence = sentence.toLowerCase();
            for (String pattern : evidencePatterns) {
                if (lowerSentence.contains(pattern)) {
                    potentialEvidence.add(sentence.trim());
                    break;
                }
            }
        }
        
        return potentialEvidence;
    }
    
    /**
     * Get all evidence for a session
     */
    public List<EvidenceDto> getEvidenceBySession(String sessionId) {
        return evidence.values().stream()
                .filter(e -> sessionId.equals(e.sessionId))
                .sorted((a, b) -> b.createdAt.compareTo(a.createdAt))
                .collect(Collectors.toList());
    }
    
    /**
     * Get evidence by type
     */
    public List<EvidenceDto> getEvidenceByType(String sessionId, String type) {
        return evidence.values().stream()
                .filter(e -> sessionId.equals(e.sessionId) && type.equals(e.type))
                .sorted((a, b) -> b.reliabilityScore.compareTo(a.reliabilityScore))
                .collect(Collectors.toList());
    }
    
    /**
     * Get evidence linked to a specific claim
     */
    public List<EvidenceDto> getEvidenceForClaim(String sessionId, Long claimId) {
        return evidence.values().stream()
                .filter(e -> sessionId.equals(e.sessionId))
                .filter(e -> e.linkedClaims.stream().anyMatch(link -> claimId.equals(link.claimId)))
                .sorted((a, b) -> b.reliabilityScore.compareTo(a.reliabilityScore))
                .collect(Collectors.toList());
    }
    
    /**
     * Search evidence by content
     */
    public List<EvidenceDto> searchEvidence(String sessionId, String searchTerm) {
        String lowerSearchTerm = searchTerm.toLowerCase();
        return evidence.values().stream()
                .filter(e -> sessionId.equals(e.sessionId))
                .filter(e -> 
                    e.content.toLowerCase().contains(lowerSearchTerm) ||
                    e.source.toLowerCase().contains(lowerSearchTerm) ||
                    e.tags.stream().anyMatch(tag -> tag.toLowerCase().contains(lowerSearchTerm))
                )
                .sorted((a, b) -> b.reliabilityScore.compareTo(a.reliabilityScore))
                .collect(Collectors.toList());
    }
    
    /**
     * Get evidence statistics
     */
    public EvidenceStatistics getEvidenceStatistics(String sessionId) {
        List<EvidenceDto> sessionEvidence = getEvidenceBySession(sessionId);
        
        EvidenceStatistics stats = new EvidenceStatistics();
        stats.totalEvidence = sessionEvidence.size();
        stats.primaryCount = sessionEvidence.stream().mapToInt(e -> "PRIMARY".equals(e.type) ? 1 : 0).sum();
        stats.secondaryCount = sessionEvidence.stream().mapToInt(e -> "SECONDARY".equals(e.type) ? 1 : 0).sum();
        stats.tertiaryCount = sessionEvidence.stream().mapToInt(e -> "TERTIARY".equals(e.type) ? 1 : 0).sum();
        stats.averageReliability = sessionEvidence.stream()
                .mapToDouble(e -> e.reliabilityScore)
                .average()
                .orElse(0.0);
        stats.linkedCount = sessionEvidence.stream()
                .mapToInt(e -> e.linkedClaims.isEmpty() ? 0 : 1)
                .sum();
        
        return stats;
    }
    
    /**
     * Calculate initial reliability score based on type and source
     */
    private double calculateInitialReliability(String type, String source) {
        double baseScore = 0.5;
        
        // Adjust based on evidence type
        switch (type.toUpperCase()) {
            case "PRIMARY":
                baseScore = 0.8;
                break;
            case "SECONDARY":
                baseScore = 0.6;
                break;
            case "TERTIARY":
                baseScore = 0.4;
                break;
        }
        
        // Adjust based on source indicators
        String lowerSource = source.toLowerCase();
        if (lowerSource.contains("peer-reviewed") || lowerSource.contains("journal")) {
            baseScore += 0.15;
        } else if (lowerSource.contains("government") || lowerSource.contains("official")) {
            baseScore += 0.1;
        } else if (lowerSource.contains("news") || lowerSource.contains("media")) {
            baseScore += 0.05;
        } else if (lowerSource.contains("blog") || lowerSource.contains("opinion")) {
            baseScore -= 0.1;
        }
        
        return Math.max(0.0, Math.min(1.0, baseScore));
    }
    
    /**
     * Calculate link strength between evidence and claim
     */
    private double calculateLinkStrength(EvidenceDto evidenceItem, String linkType) {
        double baseStrength = evidenceItem.reliabilityScore;
        
        switch (linkType.toUpperCase()) {
            case "SUPPORTS":
                return baseStrength;
            case "CONTRADICTS":
                return baseStrength * 0.9; // Slightly lower for contradictory evidence
            case "PARTIAL":
                return baseStrength * 0.7;
            case "NEUTRAL":
                return baseStrength * 0.5;
            default:
                return baseStrength * 0.6;
        }
    }
    
    /**
     * DTO for evidence items
     */
    public static class EvidenceDto {
        public Long id;
        public String content;
        public String sessionId;
        public String type; // PRIMARY, SECONDARY, TERTIARY
        public String source;
        public Double reliabilityScore;
        public String reliabilityReason;
        public LocalDateTime createdAt;
        public LocalDateTime lastVerifiedAt;
        public List<ClaimLink> linkedClaims;
        public List<String> tags;
        public String status;
    }
    
    /**
     * DTO for claim links
     */
    public static class ClaimLink {
        public Long claimId;
        public String linkType; // SUPPORTS, CONTRADICTS, NEUTRAL, PARTIAL
        public Double strength;
        public LocalDateTime createdAt;
    }
    
    /**
     * Statistics class
     */
    public static class EvidenceStatistics {
        public long totalEvidence;
        public long primaryCount;
        public long secondaryCount;
        public long tertiaryCount;
        public double averageReliability;
        public long linkedCount;
    }
} 