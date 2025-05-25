package com.mach33.research.repository;

import com.mach33.research.model.ResearchStatement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResearchStatementRepository extends JpaRepository<ResearchStatement, Long> {
    
    /**
     * Find all research statements for a specific session
     */
    List<ResearchStatement> findBySessionIdOrderByCreatedAtDesc(String sessionId);
    
    /**
     * Find research statements by type for a session
     */
    List<ResearchStatement> findBySessionIdAndTypeOrderByCreatedAtDesc(String sessionId, ResearchStatement.StatementType type);
    
    /**
     * Find research statements by status for a session
     */
    List<ResearchStatement> findBySessionIdAndStatusOrderByCreatedAtDesc(String sessionId, ResearchStatement.StatementStatus status);
    
    /**
     * Find the most recent active research statement for a session
     */
    Optional<ResearchStatement> findFirstBySessionIdAndStatusOrderByCreatedAtDesc(String sessionId, ResearchStatement.StatementStatus status);
    
    /**
     * Find research statements that have been refined
     */
    @Query("SELECT rs FROM ResearchStatement rs WHERE rs.sessionId = :sessionId AND rs.refinementCount > 0 ORDER BY rs.lastRefinedAt DESC")
    List<ResearchStatement> findRefinedStatementsBySession(@Param("sessionId") String sessionId);
    
    /**
     * Find research statements with subquestions
     */
    @Query("SELECT rs FROM ResearchStatement rs WHERE rs.sessionId = :sessionId AND SIZE(rs.subquestions) > 0 ORDER BY rs.createdAt DESC")
    List<ResearchStatement> findStatementsWithSubquestions(@Param("sessionId") String sessionId);
    
    /**
     * Count statements by type for a session
     */
    long countBySessionIdAndType(String sessionId, ResearchStatement.StatementType type);
    
    /**
     * Count statements by status for a session
     */
    long countBySessionIdAndStatus(String sessionId, ResearchStatement.StatementStatus status);
    
    /**
     * Search research statements by content
     */
    @Query("SELECT rs FROM ResearchStatement rs WHERE rs.sessionId = :sessionId AND " +
           "(LOWER(rs.originalStatement) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(rs.refinedStatement) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "ORDER BY rs.createdAt DESC")
    List<ResearchStatement> searchByContent(@Param("sessionId") String sessionId, @Param("searchTerm") String searchTerm);
    
    /**
     * Count all statements for a session
     */
    long countBySessionId(String sessionId);
} 