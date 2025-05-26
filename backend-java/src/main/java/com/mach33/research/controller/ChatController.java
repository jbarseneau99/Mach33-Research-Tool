package com.mach33.research.controller;

import com.mach33.research.service.InMemoryChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {
    
    private final InMemoryChatService chatService;
    
    public ChatController(InMemoryChatService chatService) {
        this.chatService = chatService;
    }
    
    /**
     * Send a message to AI agents
     */
    @PostMapping("/message")
    public ResponseEntity<InMemoryChatService.ChatMessageDto> sendMessage(@RequestBody SendMessageRequest request) {
        try {
            InMemoryChatService.ChatMessageDto message = chatService.sendMessage(
                request.content,
                request.sessionId,
                request.agentType
            );
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get chat history for a session
     */
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<InMemoryChatService.ChatMessageDto>> getChatHistory(@PathVariable String sessionId) {
        try {
            List<InMemoryChatService.ChatMessageDto> messages = chatService.getChatHistory(sessionId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            System.err.println("ERROR in getChatHistory: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * Get available AI agents
     */
    @GetMapping("/agents")
    public ResponseEntity<List<Map<String, Object>>> getAvailableAgents() {
        List<Map<String, Object>> agents = chatService.getAvailableAgents();
        return ResponseEntity.ok(agents);
    }
    
    /**
     * Get agent status
     */
    @GetMapping("/agents/{agentType}/status")
    public ResponseEntity<Map<String, Object>> getAgentStatus(@PathVariable String agentType) {
        Map<String, Object> status = chatService.getAgentStatus(agentType);
        return ResponseEntity.ok(status);
    }
    
    /**
     * Generate research insights from conversation
     */
    @PostMapping("/session/{sessionId}/insights")
    public ResponseEntity<Map<String, Object>> generateInsights(@PathVariable String sessionId) {
        try {
            Map<String, Object> insights = chatService.generateInsights(sessionId);
            return ResponseEntity.ok(insights);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Simple test endpoint
     */
    @GetMapping("/ping")
    public ResponseEntity<Map<String, Object>> ping() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("controller", "ChatController");
        response.put("message", "Chat controller is working");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }
    
    // Request DTOs
    public static class SendMessageRequest {
        public String content;
        public String sessionId;
        public String agentType; // CLAUDE, CHATGPT, GROK, AUTO
    }
} 