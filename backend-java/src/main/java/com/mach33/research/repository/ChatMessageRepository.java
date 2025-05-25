package com.mach33.research.repository;

import com.mach33.research.model.ChatMessage;
import com.mach33.research.model.ResearchSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {
    
    // Find messages by session, ordered by timestamp
    List<ChatMessage> findBySessionOrderByTimestampAsc(ResearchSession session);
    
    // Find messages by session ID
    List<ChatMessage> findBySessionIdOrderByTimestampAsc(UUID sessionId);
    
    // Find messages by role
    List<ChatMessage> findByRoleOrderByTimestampDesc(ChatMessage.Role role);
    
    // Find recent messages in a session
    @Query("SELECT m FROM ChatMessage m WHERE m.session.id = :sessionId AND m.timestamp >= :since ORDER BY m.timestamp ASC")
    List<ChatMessage> findRecentMessagesInSession(@Param("sessionId") UUID sessionId, @Param("since") LocalDateTime since);
    
    // Count messages in a session
    long countBySessionId(UUID sessionId);
    
    // Find last message in a session
    @Query("SELECT m FROM ChatMessage m WHERE m.session.id = :sessionId ORDER BY m.timestamp DESC LIMIT 1")
    ChatMessage findLastMessageInSession(@Param("sessionId") UUID sessionId);
    
    // Search messages by content
    @Query("SELECT m FROM ChatMessage m WHERE LOWER(m.content) LIKE LOWER(CONCAT('%', :searchTerm, '%')) ORDER BY m.timestamp DESC")
    List<ChatMessage> searchMessagesByContent(@Param("searchTerm") String searchTerm);
} 