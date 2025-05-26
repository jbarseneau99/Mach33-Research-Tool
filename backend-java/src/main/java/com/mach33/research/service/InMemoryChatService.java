package com.mach33.research.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class InMemoryChatService {
    
    private final Map<Long, ChatMessageDto> messages = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(1);
    
    /**
     * Send a message and get AI agent response
     */
    public ChatMessageDto sendMessage(String content, String sessionId, String agentType) {
        // Store user message
        ChatMessageDto userMessage = new ChatMessageDto();
        userMessage.id = idGenerator.getAndIncrement();
        userMessage.content = content;
        userMessage.sessionId = sessionId;
        userMessage.sender = "USER";
        userMessage.agentType = null;
        userMessage.timestamp = LocalDateTime.now();
        userMessage.messageType = "TEXT";
        userMessage.metadata = new HashMap<>();
        
        messages.put(userMessage.id, userMessage);
        
        // Generate AI response
        ChatMessageDto aiResponse = generateAIResponse(content, sessionId, agentType);
        messages.put(aiResponse.id, aiResponse);
        
        return aiResponse;
    }
    
    /**
     * Generate AI agent response (mock implementation for now)
     */
    private ChatMessageDto generateAIResponse(String userMessage, String sessionId, String agentType) {
        ChatMessageDto response = new ChatMessageDto();
        response.id = idGenerator.getAndIncrement();
        response.sessionId = sessionId;
        response.sender = "AI";
        response.agentType = agentType != null ? agentType.toUpperCase() : "CLAUDE";
        response.timestamp = LocalDateTime.now();
        response.messageType = "TEXT";
        response.metadata = new HashMap<>();
        
        // Mock AI responses based on agent type
        response.content = generateMockResponse(userMessage, response.agentType);
        
        // Add metadata
        response.metadata.put("confidence", 0.85);
        response.metadata.put("processingTime", "1.2s");
        response.metadata.put("model", getModelName(response.agentType));
        
        return response;
    }
    
    /**
     * Generate mock responses for different AI agents
     */
    private String generateMockResponse(String userMessage, String agentType) {
        String lowerMessage = userMessage.toLowerCase();
        
        switch (agentType) {
            case "CLAUDE":
                if (lowerMessage.contains("research") || lowerMessage.contains("study")) {
                    return "I'd be happy to help with your research question. Based on current literature, there are several key considerations to explore. Let me break this down systematically and suggest some evidence-based approaches.";
                } else if (lowerMessage.contains("evidence") || lowerMessage.contains("data")) {
                    return "For evidence evaluation, I recommend examining the source credibility, methodology, and potential biases. Would you like me to help analyze specific evidence or suggest research methodologies?";
                } else {
                    return "I understand your question. Let me provide a thoughtful analysis based on available information and research best practices.";
                }
                
            case "CHATGPT":
                if (lowerMessage.contains("research") || lowerMessage.contains("study")) {
                    return "Great research question! I can help you explore this topic from multiple angles. Let's start by identifying the key variables and potential research methodologies that would be most appropriate.";
                } else if (lowerMessage.contains("evidence") || lowerMessage.contains("data")) {
                    return "When evaluating evidence, it's important to consider the quality of sources, sample sizes, and research design. I can help you assess the strength of different types of evidence.";
                } else {
                    return "That's an interesting question! Let me help you think through this systematically and provide some insights based on current knowledge.";
                }
                
            case "GROK":
                if (lowerMessage.contains("research") || lowerMessage.contains("study")) {
                    return "Yo! That's a solid research question. Let me dig into the latest data and trends. I've got access to real-time info that might give you some fresh perspectives on this topic.";
                } else if (lowerMessage.contains("evidence") || lowerMessage.contains("data")) {
                    return "Evidence time! I love digging through data. Let me check what's trending and what the latest research is saying about this. Real-time insights coming up!";
                } else {
                    return "Interesting question! Let me tap into the latest information and give you a fresh take on this. I'll keep it real and data-driven.";
                }
                
            default:
                return "I'm here to help with your research question. Could you provide more details about what specific aspect you'd like to explore?";
        }
    }
    
    /**
     * Get model name for agent type
     */
    private String getModelName(String agentType) {
        switch (agentType) {
            case "CLAUDE": return "Claude-3.5-Sonnet";
            case "CHATGPT": return "GPT-4";
            case "GROK": return "Grok-2";
            default: return "Unknown";
        }
    }
    
    /**
     * Get chat history for a session
     */
    public List<ChatMessageDto> getChatHistory(String sessionId) {
        return messages.values().stream()
                .filter(m -> sessionId.equals(m.sessionId))
                .sorted(Comparator.comparing(m -> m.timestamp))
                .collect(Collectors.toList());
    }
    
    /**
     * Get available AI agents
     */
    public List<Map<String, Object>> getAvailableAgents() {
        List<Map<String, Object>> agents = new ArrayList<>();
        
        Map<String, Object> claude = new HashMap<>();
        claude.put("type", "CLAUDE");
        claude.put("name", "Claude");
        claude.put("provider", "Anthropic");
        claude.put("model", "Claude-3.5-Sonnet");
        claude.put("status", "online");
        claude.put("capabilities", Arrays.asList("reasoning", "analysis", "research", "writing"));
        claude.put("description", "Advanced reasoning and analysis");
        agents.add(claude);
        
        Map<String, Object> chatgpt = new HashMap<>();
        chatgpt.put("type", "CHATGPT");
        chatgpt.put("name", "ChatGPT");
        chatgpt.put("provider", "OpenAI");
        chatgpt.put("model", "GPT-4");
        chatgpt.put("status", "online");
        chatgpt.put("capabilities", Arrays.asList("conversation", "research", "coding", "analysis"));
        chatgpt.put("description", "Conversational AI and research assistance");
        agents.add(chatgpt);
        
        Map<String, Object> grok = new HashMap<>();
        grok.put("type", "GROK");
        grok.put("name", "Grok");
        grok.put("provider", "xAI");
        grok.put("model", "Grok-2");
        grok.put("status", "online");
        grok.put("capabilities", Arrays.asList("real-time", "analysis", "humor", "research"));
        grok.put("description", "Real-time information and analysis");
        agents.add(grok);
        
        return agents;
    }
    
    /**
     * Get agent status
     */
    public Map<String, Object> getAgentStatus(String agentType) {
        Map<String, Object> status = new HashMap<>();
        status.put("type", agentType.toUpperCase());
        status.put("status", "online");
        status.put("responseTime", "1.2s");
        status.put("availability", 99.9);
        status.put("lastActive", LocalDateTime.now().toString());
        return status;
    }
    
    /**
     * Generate research insights from conversation
     */
    public Map<String, Object> generateInsights(String sessionId) {
        List<ChatMessageDto> sessionMessages = getChatHistory(sessionId);
        
        Map<String, Object> insights = new HashMap<>();
        insights.put("totalMessages", sessionMessages.size());
        insights.put("userMessages", sessionMessages.stream().mapToLong(m -> "USER".equals(m.sender) ? 1 : 0).sum());
        insights.put("aiMessages", sessionMessages.stream().mapToLong(m -> "AI".equals(m.sender) ? 1 : 0).sum());
        
        // Count agent usage
        Map<String, Long> agentUsage = sessionMessages.stream()
                .filter(m -> "AI".equals(m.sender))
                .collect(Collectors.groupingBy(m -> m.agentType, Collectors.counting()));
        insights.put("agentUsage", agentUsage);
        
        // Extract key topics (simple keyword extraction)
        List<String> allContent = sessionMessages.stream()
                .map(m -> m.content.toLowerCase())
                .collect(Collectors.toList());
        
        List<String> keyTopics = extractKeyTopics(allContent);
        insights.put("keyTopics", keyTopics);
        
        insights.put("generatedAt", LocalDateTime.now().toString());
        
        return insights;
    }
    
    /**
     * Simple keyword extraction for topics
     */
    private List<String> extractKeyTopics(List<String> content) {
        String[] researchKeywords = {
            "research", "study", "analysis", "evidence", "data", "methodology",
            "hypothesis", "theory", "findings", "results", "conclusion", "literature"
        };
        
        List<String> topics = new ArrayList<>();
        String allText = String.join(" ", content);
        
        for (String keyword : researchKeywords) {
            if (allText.contains(keyword)) {
                topics.add(keyword);
            }
        }
        
        return topics.stream().distinct().limit(10).collect(Collectors.toList());
    }
    
    /**
     * DTO for chat messages
     */
    public static class ChatMessageDto {
        public Long id;
        public String content;
        public String sessionId;
        public String sender; // USER, AI
        public String agentType; // CLAUDE, CHATGPT, GROK
        public LocalDateTime timestamp;
        public String messageType; // TEXT, IMAGE, FILE
        public Map<String, Object> metadata;
    }
} 