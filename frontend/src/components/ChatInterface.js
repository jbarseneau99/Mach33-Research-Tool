import React, { useState, useEffect, useRef } from 'react';
import './ChatInterface.css';
import { apiCall } from '../config';

const ChatInterface = ({ sessionId }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('CLAUDE');
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mockMode, setMockMode] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (sessionId) {
      loadChatHistory();
      loadAgents();
    }
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatHistory = async () => {
    try {
      if (mockMode) {
        // Mock chat history
        setMessages([
          {
            id: 1,
            content: "Welcome to your research session! I'm here to help with your research questions.",
            sender: "AI",
            agentType: "CLAUDE",
            timestamp: new Date().toISOString(),
            metadata: { model: "Claude-3.5-Sonnet" }
          }
        ]);
        return;
      }

      const response = await apiCall(`/chat/session/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        console.log('Chat API not available, switching to mock mode');
        setMockMode(true);
        loadChatHistory();
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      console.log('Switching to mock mode');
      setMockMode(true);
      loadChatHistory();
    }
  };

  const loadAgents = async () => {
    try {
      if (mockMode) {
        setAgents([
          { type: 'CLAUDE', name: 'Claude', status: 'online', provider: 'Anthropic' },
          { type: 'CHATGPT', name: 'ChatGPT', status: 'online', provider: 'OpenAI' },
          { type: 'GROK', name: 'Grok', status: 'online', provider: 'xAI' }
        ]);
        return;
      }

      const response = await apiCall('/chat/agents');
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
      }
    } catch (error) {
      console.error('Error loading agents:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      content: inputMessage,
      sender: 'USER',
      timestamp: new Date().toISOString(),
      sessionId: sessionId
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      if (mockMode) {
        // Mock AI response
        setTimeout(() => {
          const aiResponse = {
            id: Date.now() + 1,
            content: generateMockResponse(inputMessage, selectedAgent),
            sender: 'AI',
            agentType: selectedAgent,
            timestamp: new Date().toISOString(),
            metadata: { 
              model: getModelName(selectedAgent),
              confidence: 0.85,
              processingTime: '1.2s'
            }
          };
          setMessages(prev => [...prev, aiResponse]);
          setLoading(false);
        }, 1500);
        return;
      }

      const response = await apiCall('/chat/message', {
        method: 'POST',
        body: JSON.stringify({
          content: inputMessage,
          sessionId: sessionId,
          agentType: selectedAgent
        }),
      });

      if (response.ok) {
        const aiResponse = await response.json();
        setMessages(prev => [...prev, aiResponse]);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'AI',
        agentType: selectedAgent,
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const generateMockResponse = (userMessage, agentType) => {
    const lowerMessage = userMessage.toLowerCase();
    
    switch (agentType) {
      case 'CLAUDE':
        if (lowerMessage.includes('research') || lowerMessage.includes('study')) {
          return "I'd be happy to help with your research question. Based on current literature, there are several key considerations to explore. Let me break this down systematically and suggest some evidence-based approaches.";
        }
        return "I understand your question. Let me provide a thoughtful analysis based on available information and research best practices.";
        
      case 'CHATGPT':
        if (lowerMessage.includes('research') || lowerMessage.includes('study')) {
          return "Great research question! I can help you explore this topic from multiple angles. Let's start by identifying the key variables and potential research methodologies that would be most appropriate.";
        }
        return "That's an interesting question! Let me help you think through this systematically and provide some insights based on current knowledge.";
        
      case 'GROK':
        if (lowerMessage.includes('research') || lowerMessage.includes('study')) {
          return "Yo! That's a solid research question. Let me dig into the latest data and trends. I've got access to real-time info that might give you some fresh perspectives on this topic.";
        }
        return "Interesting question! Let me tap into the latest information and give you a fresh take on this. I'll keep it real and data-driven.";
        
      default:
        return "I'm here to help with your research question. Could you provide more details about what specific aspect you'd like to explore?";
    }
  };

  const getModelName = (agentType) => {
    switch (agentType) {
      case 'CLAUDE': return 'Claude-3.5-Sonnet';
      case 'CHATGPT': return 'GPT-4';
      case 'GROK': return 'Grok-2';
      default: return 'Unknown';
    }
  };

  const getAgentColor = (agentType) => {
    switch (agentType) {
      case 'CLAUDE': return '#8B5CF6';
      case 'CHATGPT': return '#10B981';
      case 'GROK': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h2>Research Chat {mockMode && <span style={{color: '#f39c12', fontSize: '12px'}}>(Demo Mode)</span>}</h2>
        <div className="active-agents">
          {agents.map(agent => (
            <span 
              key={agent.type}
              className={`agent ${agent.type.toLowerCase()} ${selectedAgent === agent.type ? 'selected' : ''}`}
              onClick={() => setSelectedAgent(agent.type)}
              style={{ 
                backgroundColor: selectedAgent === agent.type ? getAgentColor(agent.type) : '#f3f4f6',
                color: selectedAgent === agent.type ? 'white' : '#374151'
              }}
            >
              {agent.name}
            </span>
          ))}
        </div>
      </div>
      
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="message system">
            <div className="message-content">
              Welcome to your research session! Start by creating a research statement above, then ask questions and the AI agents will collaborate to help you.
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.sender.toLowerCase()} ${message.isError ? 'error' : ''}`}>
            <div className="message-header">
              <span className="message-sender">
                {message.sender === 'AI' ? (
                  <span style={{ color: getAgentColor(message.agentType) }}>
                    {message.agentType} {message.metadata?.model && `(${message.metadata.model})`}
                  </span>
                ) : (
                  'You'
                )}
              </span>
              <span className="message-time">
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
            <div className="message-content">
              {message.content}
            </div>
            {message.metadata && (
              <div className="message-metadata">
                {message.metadata.confidence && (
                  <span className="confidence">
                    Confidence: {Math.round(message.metadata.confidence * 100)}%
                  </span>
                )}
                {message.metadata.processingTime && (
                  <span className="processing-time">
                    {message.metadata.processingTime}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="message ai loading">
            <div className="message-header">
              <span className="message-sender" style={{ color: getAgentColor(selectedAgent) }}>
                {selectedAgent} is thinking...
              </span>
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form className="chat-input" onSubmit={sendMessage}>
        <input 
          type="text" 
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Ask ${selectedAgent} a research question...`}
          className="message-input"
          disabled={loading}
        />
        <button 
          type="submit" 
          className="send-btn"
          disabled={loading || !inputMessage.trim()}
        >
          {loading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatInterface; 