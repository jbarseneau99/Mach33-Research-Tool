package com.mach33.research.repository;

import com.mach33.research.model.ResearchSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ResearchSessionRepository extends JpaRepository<ResearchSession, UUID> {
    
    // Find active sessions
    List<ResearchSession> findByIsActiveTrueOrderByUpdatedAtDesc();
    
    // Find sessions by methodology
    List<ResearchSession> findByMethodologyOrderByUpdatedAtDesc(String methodology);
    
    // Find sessions created after a certain date
    List<ResearchSession> findByCreatedAtAfterOrderByUpdatedAtDesc(LocalDateTime date);
    
    // Search sessions by title or research question
    @Query("SELECT s FROM ResearchSession s WHERE " +
           "LOWER(s.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(s.researchQuestion) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "ORDER BY s.updatedAt DESC")
    List<ResearchSession> searchSessions(@Param("searchTerm") String searchTerm);
    
    // Count active sessions
    long countByIsActiveTrue();
    
    // Find recent sessions (last 7 days)
    @Query("SELECT s FROM ResearchSession s WHERE s.createdAt >= :weekAgo ORDER BY s.updatedAt DESC")
    List<ResearchSession> findRecentSessions(@Param("weekAgo") LocalDateTime weekAgo);
} 