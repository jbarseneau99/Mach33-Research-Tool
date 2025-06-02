import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import 'antd/dist/reset.css';
import './App.css';
import ResearchStatementManager from './components/ResearchStatementManager';
import EvidenceManager from './components/EvidenceManager';
import ChatInterface from './components/ChatInterface';
import AISettingsModal from './components/AISettingsModal';
import SessionConfigModal from './components/SessionConfigModal';
import ArtifactInspectionModal from './components/ArtifactInspectionModal';
import LoginModal from './components/LoginModal';
import SystemAdministrationModal from './components/SystemAdministrationModal';
import UserProfileModal from './components/UserProfileModal';
import ResearchDocumentDemo from './components/ResearchDocumentDemo';
import MethodologyManager from './components/MethodologyManager';
import OntologyManager from './components/OntologyManager';
import ReferenceSettings from './components/ReferenceSettings';
import KnowledgeGraph from './components/KnowledgeGraph';
import EnhancedKnowledgeGraph from './components/EnhancedKnowledgeGraph';
import SuperEnhancedKnowledgeGraph from './components/SuperEnhancedKnowledgeGraph';
import { 
  PlusIcon, 
  Cog6ToothIcon, 
  Squares2X2Icon, 
  ChatBubbleLeftRightIcon, 
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ArrowsPointingOutIcon,
  PuzzlePieceIcon,
  CheckCircleIcon,
  StarIcon,
  LightBulbIcon,
  ClipboardDocumentListIcon,
  UserCircleIcon,
  SparklesIcon,
  BoltIcon,
  AdjustmentsHorizontalIcon,
  SignalIcon,
  ShareIcon,
  GlobeAltIcon,
  RocketLaunchIcon,
  DocumentTextIcon,
  BeakerIcon,
  TrashIcon,
  QuestionMarkCircleIcon,
  AcademicCapIcon,
  DocumentDuplicateIcon,
  TagIcon,
  BookOpenIcon,
  LinkIcon,
  CircleStackIcon,
  LanguageIcon,
  ArrowPathIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import AgentOrchestrationModal from './components/AgentOrchestrationModal';
import ResearchDashboard from './components/ResearchDashboard';
import AgentBuilderModal from './components/AgentBuilderModal';
import AgentConfigModal from './components/AgentConfigModal';
import SessionShareModal from './components/SessionShareModal';
import ResearchReports from './components/ResearchReports';
import AgentManager from './components/AgentManager';

// Import new robust authentication system
import tokenManager from './utils/tokenManager';
import apiClient from './utils/apiClient';
import websocketService from './services/websocketService';

// Theme Context
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [currentSession, setCurrentSession] = useState(null);
  const [allSessions, setAllSessions] = useState([]);
  const [statementStats, setStatementStats] = useState(null);
  const [evidenceStats, setEvidenceStats] = useState(null);
  const [sessionStats, setSessionStats] = useState(null);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('app-theme');
    return savedTheme || 'dark';
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [showSessionSettings, setShowSessionSettings] = useState(false);
  const [agentStatus, setAgentStatus] = useState([]);
  const [agentStatusLoading, setAgentStatusLoading] = useState(false);
  const [activeArtifactTab, setActiveArtifactTab] = useState('analysis');
  const [artifactData, setArtifactData] = useState(null);
  const [artifactStats, setArtifactStats] = useState(null);
  const [showArtifactInspector, setShowArtifactInspector] = useState(false);
  const [inspectorArtifactType, setInspectorArtifactType] = useState('all');
  
  // Authentication state
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSystemAdmin, setShowSystemAdmin] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showDocumentEditor, setShowDocumentEditor] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);

  // Mention tracking state
  const [userMentions, setUserMentions] = useState(0);

  // Agent Orchestration state
  const [showAgentOrchestration, setShowAgentOrchestration] = useState(false);

  // Agent Builder state
  const [showAgentBuilder, setShowAgentBuilder] = useState(false);

  // Agent Config Modal state
  const [showAgentConfig, setShowAgentConfig] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);

  // Session delete confirmation state
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);

  // Multi-user session sharing state
  const [showSessionShare, setShowSessionShare] = useState(false);
  const [sessionToShare, setSessionToShare] = useState(null);

  // Session participants state
  const [sessionParticipants, setSessionParticipants] = useState([]);

  // Methodology state management
  const [methodologySettings, setMethodologySettings] = useState({
    'sequential-round-robin': {
      enforceOrder: true,
      skipInactiveAgents: false,
      timeout: 30
    },
    'random-round-robin': {
      ensureAllParticipate: true,
      allowRepeats: false,
      timeout: 30
    },
    'free-discussion': {
      allowInterruptions: true,
      moderationLevel: 'light',
      timeout: 60
    }
  });

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
  };

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Debug: Log when modal state changes
  useEffect(() => {
    console.log('showNewSessionModal state changed to:', showNewSessionModal);
  }, [showNewSessionModal]);

  // Function to get short model name
  const getShortModelName = (agent) => {
    if (!agent.model) return agent.provider || "AI Agent";
    
    const model = agent.model.toLowerCase();
    if (model.includes('gpt-4')) return 'GPT-4';
    if (model.includes('gpt-3.5')) return 'GPT-3.5';
    if (model.includes('claude')) return 'Claude';
    if (model.includes('grok')) return 'Grok';
    if (model.includes('gemini')) return 'Gemini';
    
    // Fallback to provider name
    return agent.provider || "AI Agent";
  };

  const checkAPI = async () => {
    try {
      await apiClient.get('/health');
      console.log('API Connected ✅');
    } catch (error) {
      console.log('API Disconnected ❌');
    }
  };

  const loadAgentStatus = async () => {
    try {
      setAgentStatusLoading(true);
      console.log('🔍 Loading agent status...');
      const agents = await apiClient.get('/chat/agents');
      console.log('✅ Agent status loaded:', agents);
      
      // Add null safety check
      const safeAgents = agents || [];
      setAgentStatus(safeAgents);
      
      // Log the status for debugging with null safety
      const onlineCount = safeAgents.filter(agent => agent.configured && agent.status === "online").length;
      console.log(`📊 Agent Status: ${onlineCount}/${safeAgents.length} agents online`);
      
    } catch (error) {
      console.error('❌ Error loading agent status:', error);
      // Fallback to default agent list
      setAgentStatus([
        { type: 'CLAUDE', name: 'Claude', configured: false, status: 'not_configured' },
        { type: 'CHATGPT', name: 'ChatGPT', configured: false, status: 'not_configured' },
        { type: 'GROK', name: 'Grok', configured: false, status: 'not_configured' }
      ]);
    } finally {
      setAgentStatusLoading(false);
    }
  };

  // Manual refresh function for user-triggered refresh
  const refreshAgentStatus = async () => {
    console.log('🔄 Manual agent status refresh triggered');
    await loadAgentStatus();
  };

  // Enhanced agent status loading with retry
  const loadAgentStatusWithRetry = async (maxRetries = 3, delay = 2000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${maxRetries}: Loading agent status...`);
        await loadAgentStatus();
        
        // Check if we got valid data
        if (agentStatus.length > 0 && agentStatus.some(agent => agent.status === 'online')) {
          console.log('✅ Successfully loaded agent status with online agents');
          return;
        }
        
        if (attempt < maxRetries) {
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        console.error(`❌ Attempt ${attempt} failed:`, error);
        if (attempt === maxRetries) {
          console.error('🚫 All attempts failed, using fallback');
        }
      }
    }
  };

  useEffect(() => {
    // Setup token event listeners
    const removeTokenListener = tokenManager.addListener((event, data) => {
      switch (event) {
        case 'token_cleared':
          console.log('🔄 Token cleared, redirecting to login');
          setCurrentUser(null);
          setShowLoginModal(true);
          break;
        case 'token_refreshed':
          console.log('✅ Token refreshed successfully');
          break;
        case 'token_refresh_failed':
          console.error('❌ Token refresh failed:', data.error);
          setCurrentUser(null);
          setShowLoginModal(true);
          break;
        default:
          break;
      }
    });

    // Setup auth required event listener
    const handleAuthRequired = (event) => {
      console.log('🚫 Authentication required:', event.detail);
      setCurrentUser(null);
      setShowLoginModal(true);
    };
    window.addEventListener('auth_required', handleAuthRequired);

    // Handle user mentions
    const handleUserMention = (event) => {
      const { mentionedUser, message } = event.detail;
      console.log('👤 User mentioned:', mentionedUser, 'in message:', message);
      
      if (currentUser && (mentionedUser === currentUser.username || mentionedUser === currentUser.fullName)) {
        setUserMentions(prev => prev + 1);
        console.log('🔔 You were mentioned! Total mentions:', userMentions + 1);
      }
    };
    window.addEventListener('userMentioned', handleUserMention);

    // Handle mention clearing when user reads chat
    const handleMentionsRead = () => {
      console.log('📖 Mentions marked as read');
      setUserMentions(0);
    };
    window.addEventListener('mentionsRead', handleMentionsRead);

    // Restore session from localStorage on app load
    const restoreSession = () => {
      const savedSession = localStorage.getItem('currentSession');
      
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);
          setCurrentSession(session);
          loadStatementStats(session.id);
          loadEvidenceStats(session.id);
          setActiveSection('session'); // Auto-switch to session view
          console.log('Restored session:', session.id);
        } catch (error) {
          console.error('Error restoring session:', error);
          localStorage.removeItem('currentSession');
        }
      }
    };

    // Restore theme from localStorage
    const restoreTheme = () => {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      } else {
        // Default to dark theme for modern look
        const defaultTheme = 'dark';
        setTheme(defaultTheme);
        document.documentElement.setAttribute('data-theme', defaultTheme);
        localStorage.setItem('theme', defaultTheme);
      }
    };

    // Check for existing authentication
    const checkAuth = async () => {
      const token = tokenManager.getToken();
      const savedUser = localStorage.getItem('currentUser');
      
      console.log('🔍 DEBUG: Checking auth - Token exists:', !!token, 'User exists:', !!savedUser);
      console.log('🔍 DEBUG: authLoading state:', authLoading);
      
      if (token && savedUser) {
        try {
          // Validate token with backend using new API client
          const validationResult = await apiClient.post('/auth/validate');
          
          if (validationResult.valid) {
            const user = JSON.parse(savedUser);
            setCurrentUser(user);
            setAuthLoading(false);
            console.log('✅ Token validated, restored user session:', user.username);
            
            // Only load data after authentication is confirmed with enhanced agent loading
            setTimeout(async () => {
              checkAPI();
              await loadAgentStatusWithRetry(); // Use retry version
              restoreSession();
              loadAllSessionsFromBackend(); // Load sessions from backend for authenticated user
              
              // Setup periodic agent status refresh (every 30 seconds)
              const agentRefreshInterval = setInterval(loadAgentStatus, 30000);
              
              // Store interval for cleanup
              window.agentRefreshInterval = agentRefreshInterval;
            }, 500); // Increased delay
            return;
          }
          
          // Token validation failed
          console.warn('⚠️ Token validation failed, clearing auth data');
          tokenManager.clearToken();
          localStorage.removeItem('currentUser');
          setAuthLoading(false);
          setShowLoginModal(true);
          
        } catch (error) {
          console.error('❌ Error validating token:', error);
          // Clear invalid auth data
          tokenManager.clearToken();
          localStorage.removeItem('currentUser');
          setAuthLoading(false);
          setShowLoginModal(true);
        }
      } else {
        console.log('🚫 No valid auth found, showing login modal');
        setAuthLoading(false);
        setShowLoginModal(true);
      }
    };

    // Initialize app
    const initializeApp = async () => {
      restoreTheme();
      loadAISettings();
      loadAllSessions();
      await checkAuth(); // This will trigger API calls only if authenticated
    };
    
    initializeApp();

    // Listen for agent changes from ChatInterface
    const handleAgentChange = (event) => {
      console.log('Agent changed to:', event.detail.agent);
    };
    window.addEventListener('agentChanged', handleAgentChange);

    // Cleanup function
    return () => {
      removeTokenListener();
      window.removeEventListener('auth_required', handleAuthRequired);
      window.removeEventListener('userMentioned', handleUserMention);
      window.removeEventListener('mentionsRead', handleMentionsRead);
      window.removeEventListener('agentChanged', handleAgentChange);
      
      // Cleanup agent refresh interval
      if (window.agentRefreshInterval) {
        clearInterval(window.agentRefreshInterval);
        delete window.agentRefreshInterval;
      }
      
      tokenManager.cleanup();
      apiClient.cleanup();
    };
  }, []); // Empty dependency array since this is initialization code

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setShowSystemAdmin(false);
    setShowUserProfile(false);
    
    // Clear mentions when user navigates to session/chat
    if (section === 'session' || section === 'chat') {
      setUserMentions(0);
    }
    
    if (section === 'users' && currentUser?.role === 'ADMIN') {
      setShowSystemAdmin(true);
    } else if (section === 'profile') {
      setShowUserProfile(true);
    }
  };

  const loadStatementStats = async (sessionId) => {
    try {
      const response = await apiClient.get(`/research-statements/session/${sessionId}/statistics`);
      if (response && response.ok) {
        const stats = await response.json();
        setStatementStats(stats);
      }
    } catch (error) {
      console.error('Error loading statement statistics:', error);
    }
  };

  const loadEvidenceStats = async (sessionId) => {
    try {
      const response = await apiClient.get(`/evidence/session/${sessionId}/statistics`);
      if (response && response.ok) {
        const stats = await response.json();
        setEvidenceStats(stats);
      }
    } catch (error) {
      console.error('Error loading evidence statistics:', error);
    }
  };

  const loadSessionStats = async (sessionId) => {
    try {
      const response = await apiClient.get(`/chat/session/${sessionId}/stats`);
      if (response && response.ok) {
        const stats = await response.json();
        setSessionStats(stats);
      }
    } catch (error) {
      console.error('Error loading session statistics:', error);
    }
  };

  const clearSession = () => {
    setCurrentSession(null);
    setStatementStats(null);
    setEvidenceStats(null);
    setSessionStats(null);
    localStorage.removeItem('currentSession');
    setActiveSection('dashboard');
    console.log('Session cleared');
  };

  const loadAISettings = () => {
    console.log('🔄 App.js: Loading AI Settings...');
    const savedSettings = localStorage.getItem('aiSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        console.log('✅ App.js: Loaded AI settings:', parsedSettings);
        // Settings are loaded but not stored in state since they're only used in modals
      } catch (error) {
        console.error('❌ App.js: Error loading AI settings:', error);
      }
    } else {
      console.log('ℹ️ App.js: No AI settings found');
    }
  };

  const loadAllSessions = () => {
    const savedSessions = localStorage.getItem('allSessions');
    if (savedSessions) {
      try {
        const sessions = JSON.parse(savedSessions);
        // Add null safety check
        const safeSessions = Array.isArray(sessions) ? sessions : [];
        setAllSessions(safeSessions);
      } catch (error) {
        console.error('Error loading sessions:', error);
        setAllSessions([]);
      }
    } else {
      // Ensure we always have an array even if no saved sessions
      setAllSessions([]);
    }
  };

  const loadAllSessionsFromBackend = async () => {
    try {
      console.log('🔄 Loading sessions from backend...');
      
      // Load both owned sessions and shared sessions in parallel
      const [backendSessions, sharedSessions] = await Promise.all([
        apiClient.get('/sessions'),
        apiClient.get('/sessions/shared')
      ]);
      
      // Add null checks for the responses
      const safeBackendSessions = backendSessions || [];
      const safeSharedSessions = sharedSessions || [];
      
      console.log('📡 Backend returned', safeBackendSessions.length, 'owned sessions and', safeSharedSessions.length, 'shared sessions');
      
      // Convert owned sessions to frontend format
      const ownedSessions = safeBackendSessions.map(session => ({
        id: session.sessionId,
        name: session.title,
        description: session.description,
        researchFocus: '', // Not stored in backend yet
        researchMethodology: session.methodology,
        tags: [], // Not stored in backend yet
        created: new Date(session.createdAt).toLocaleString(),
        lastAccessed: new Date(session.lastActivity || session.updatedAt).toLocaleString(),
        status: session.status === 'active' ? 'Active' : session.status,
        messageCount: 0, // TODO: Get from backend
        statementCount: 0, // TODO: Get from backend
        evidenceCount: 0, // TODO: Get from backend
        userId: session.userId,
        isShared: false // Mark as owned session
      }));
      
      // Convert shared sessions to frontend format
      const sharedSessionsList = safeSharedSessions.map(session => ({
        id: session.sessionId,
        name: session.title,
        description: session.description,
        researchFocus: '', // Not stored in backend yet
        researchMethodology: session.methodology,
        tags: [], // Not stored in backend yet
        created: new Date(session.createdAt).toLocaleString(),
        lastAccessed: new Date(session.lastActivity || session.updatedAt).toLocaleString(),
        status: session.status === 'active' ? 'Active' : session.status,
        messageCount: 0, // TODO: Get from backend
        statementCount: 0, // TODO: Get from backend
        evidenceCount: 0, // TODO: Get from backend
        userId: session.userId,
        isShared: true, // Mark as shared session
        sharedBy: session.metadata?.sharedBy || 'Unknown', // Add sharer name
        sharedByUsername: session.metadata?.sharedByUsername || 'unknown' // Add sharer username
      }));
      
      // Combine both owned and shared sessions
      const allSessions = [...ownedSessions, ...sharedSessionsList];
      
      // Sort all sessions by lastActivity/updatedAt to get the most recent first
      if (allSessions && allSessions.length > 0) {
        allSessions.sort((a, b) => {
          const dateA = new Date(a.lastAccessed);
          const dateB = new Date(b.lastAccessed);
          return dateB - dateA;
        });
      }
      
      console.log('🔄 Combined', (allSessions || []).length, 'sessions (', ownedSessions.length, 'owned +', sharedSessionsList.length, 'shared)');
      setAllSessions(allSessions || []);
      // Also save to localStorage as backup
      localStorage.setItem('allSessions', JSON.stringify(allSessions || []));
      console.log('✅ Loaded', (allSessions || []).length, 'sessions from backend');
      console.log('📋 All sessions stored in state:', (allSessions || []).map(s => `${s.id}: ${s.name} ${s.isShared ? '(shared)' : ''}`));
      
      // Auto-select the most recent session if no current session is selected
      if (!currentSession && allSessions && allSessions.length > 0) {
        const mostRecentSession = allSessions[0]; // Already sorted by most recent
        console.log('🎯 Auto-selecting most recent session:', mostRecentSession.id, mostRecentSession.isShared ? '(shared)' : '(owned)');
        
        // Set current session directly without calling saveSessionToStorage
        // to avoid overwriting the allSessions array due to React state timing
        setCurrentSession(mostRecentSession);
        localStorage.setItem('currentSession', JSON.stringify(mostRecentSession));
        setActiveSection('session');
        
        // Load stats for the selected session
        loadStatementStats(mostRecentSession.id);
        loadEvidenceStats(mostRecentSession.id);
        loadSessionStats(mostRecentSession.id);
        console.log('✅ Auto-selected session without overwriting allSessions');
      }
    } catch (error) {
      console.error('❌ Error loading sessions from backend:', error);
      console.log('📁 Falling back to localStorage sessions');
      loadAllSessions(); // Fallback to localStorage
    }
  };

  const saveSessionToStorage = (session) => {
    console.log('💾 Saving session to storage:', session.id);
    console.log('📋 Current allSessions before save:', (allSessions || []).length, 'sessions:', (allSessions || []).map(s => s.id));
    
    // Avoid overwriting if allSessions is empty due to React state timing
    if (!allSessions || allSessions.length === 0) {
      console.log('⚠️ allSessions is empty, skipping save to avoid overwriting. Using direct state update instead.');
      setCurrentSession(session);
      localStorage.setItem('currentSession', JSON.stringify(session));
      return;
    }
    
    const updatedSessions = [session, ...(allSessions || []).filter(s => s.id !== session.id)];
    console.log('📋 Updated sessions after processing:', updatedSessions.length, 'sessions:', updatedSessions.map(s => s.id));
    setAllSessions(updatedSessions);
    localStorage.setItem('allSessions', JSON.stringify(updatedSessions));
    console.log('✅ Sessions saved to localStorage and state updated');
  };

  const createNewSession = async (sessionData) => {
    try {
      // Create session via backend API
      const backendSession = await apiClient.post('/sessions', {
        title: sessionData.name,
        description: sessionData.description,
        methodology: sessionData.researchMethodology || 'Round Robin'
      });

      // Convert backend session format to frontend format
      const newSession = {
        id: backendSession.sessionId,
        name: backendSession.title,
        description: backendSession.description,
        researchFocus: sessionData.researchFocus || '',
        researchMethodology: backendSession.methodology,
        tags: sessionData.tags || [],
        created: new Date(backendSession.createdAt).toLocaleString(),
        lastAccessed: new Date().toLocaleString(),
        status: 'Active',
        messageCount: 0,
        statementCount: 0,
        evidenceCount: 0,
        userId: backendSession.userId // Store the user association
      };
      
      setCurrentSession(newSession);
      saveSessionToStorage(newSession);
      localStorage.setItem('currentSession', JSON.stringify(newSession));
      
      setActiveSection('session'); // Switch to session view instead of chat
      loadStatementStats(newSession.id);
      loadEvidenceStats(newSession.id);
      loadSessionStats(newSession.id);
      console.log('✅ Created new session:', newSession.id, 'for user:', backendSession.userId);
      
      // Reload all sessions to include the new one
      loadAllSessionsFromBackend();
    } catch (error) {
      console.error('❌ Error creating session:', error);
      // Fallback to local storage creation
      const localSession = {
        ...sessionData,
        id: `session-${Date.now()}`,
        lastAccessed: new Date().toLocaleString(),
        status: 'Active',
        messageCount: 0,
        statementCount: 0,
        evidenceCount: 0
      };
      
      setCurrentSession(localSession);
      saveSessionToStorage(localSession);
      localStorage.setItem('currentSession', JSON.stringify(localSession));
      
      setActiveSection('session');
      loadStatementStats(localSession.id);
      loadEvidenceStats(localSession.id);
      loadSessionStats(localSession.id);
      console.log('📁 Created local session (error fallback):', localSession.id);
    }
  };

  const switchToSession = (session) => {
    const updatedSession = {
      ...session,
      lastAccessed: new Date().toLocaleString()
    };
    
    setCurrentSession(updatedSession);
    saveSessionToStorage(updatedSession);
    localStorage.setItem('currentSession', JSON.stringify(updatedSession));
    
    setActiveSection('session'); // Switch to session view
    loadStatementStats(session.id);
    loadEvidenceStats(session.id);
    loadSessionStats(session.id);
    console.log('Switched to session:', session.id);
  };

  const deleteSession = async (sessionId) => {
    try {
      console.log('🗑️ Deleting session from database:', sessionId);
      
      // Call backend API to delete session and all related data
      const response = await apiClient.delete(`/sessions/${sessionId}`);
      
      if (response.success) {
        console.log('✅ Session deleted from database:', response.deletionResults);
        
        // Update local state only after successful backend deletion
        const updatedSessions = (allSessions || []).filter(session => session.id !== sessionId);
    setAllSessions(updatedSessions);
    localStorage.setItem('allSessions', JSON.stringify(updatedSessions));
    
        // Clear current session if it's the one being deleted
    if (currentSession && currentSession.id === sessionId) {
      clearSession();
        }
        
        console.log('✅ Session deleted successfully from both database and local storage');
      } else {
        console.error('❌ Failed to delete session from database:', response.error);
        throw new Error(response.message || 'Failed to delete session from database');
      }
      
    } catch (error) {
      console.error('❌ Error deleting session:', error);
      
      // Still remove from local storage if backend deletion fails (for UX)
      // But show a warning to the user
      const updatedSessions = (allSessions || []).filter(session => session.id !== sessionId);
      setAllSessions(updatedSessions);
      localStorage.setItem('allSessions', JSON.stringify(updatedSessions));
      
      if (currentSession && currentSession.id === sessionId) {
        clearSession();
      }
      
      // You could show a toast notification here about the partial deletion
      console.warn('⚠️ Session removed from local storage but may still exist in database');
    }
  };

  const updateSessionSettings = (updatedSession) => {
    // Update current session if it's the one being edited
    if (currentSession && currentSession.id === updatedSession.id) {
      setCurrentSession(updatedSession);
      localStorage.setItem('currentSession', JSON.stringify(updatedSession));
    }
    
    // Update in all sessions list
    saveSessionToStorage(updatedSession);
    
    console.log('Session settings updated:', updatedSession.id);
  };

  // Load artifact data for current session
  const loadArtifactData = useCallback(async () => {
    if (!currentSession?.id) return;
    
    try {
      console.log(`🔍 Loading artifacts for session: ${currentSession.id}`);
      
      // Load comprehensive artifact statistics (new enhanced API)
      try {
        const comprehensiveStats = await apiClient.get(`/chat/session/${currentSession.id}/artifacts/comprehensive-stats`);
        console.log('📊 Comprehensive artifact stats loaded:', comprehensiveStats);
        
        // Set the comprehensive stats data
        setArtifactStats({
          // Basic counts (now using snake_case from backend)
          research_questions: comprehensiveStats.research_questions || 0,
          hypotheses: comprehensiveStats.hypotheses || 0,
          claims: comprehensiveStats.claims || 0,
          evidence: comprehensiveStats.evidence || 0,
          findings: comprehensiveStats.findings || 0,
          named_entities: comprehensiveStats.named_entities || 0,
          concepts: comprehensiveStats.concepts || 0,
          references: comprehensiveStats.references || 0,
          citations: comprehensiveStats.citations || 0,
          total_artifacts: comprehensiveStats.total_artifacts || 0,
          
          // Enhanced metrics from comprehensive stats
          qualityMetrics: comprehensiveStats.qualityMetrics || {},
          agentBreakdown: comprehensiveStats.agentBreakdown || {},
          confidenceStats: comprehensiveStats.confidenceStats || {},
          temporalStats: comprehensiveStats.temporalStats || {},
          relationshipStats: comprehensiveStats.relationshipStats || {},
          extractionProgress: comprehensiveStats.extractionProgress || {},
          
          // Metadata (now using snake_case from backend)
          last_updated: comprehensiveStats.last_updated || new Date().toISOString(),
          session_id: currentSession.id,
          fallback: false,
          comprehensive: true
        });
        
      } catch (comprehensiveError) {
        console.warn('Failed to load comprehensive stats, falling back to basic stats:', comprehensiveError.message);
        
        // Fallback to basic stats if comprehensive stats fail
        try {
          const basicStats = await apiClient.get(`/chat/session/${currentSession.id}/artifacts/stats`);
          console.log('📊 Basic artifact stats loaded (fallback):', basicStats);
          setArtifactStats({
            ...basicStats,
            comprehensive: false,
            fallback: true
          });
        } catch (basicError) {
          console.error('Failed to load basic artifact stats:', basicError.message);
          // Set empty stats with error indicators
          setArtifactStats({
            research_questions: 0,
            hypotheses: 0,
            claims: 0,
            evidence: 0,
            findings: 0,
            named_entities: 0,
            concepts: 0,
            references: 0,
            citations: 0,
            total_artifacts: 0,
            error: true,
            comprehensive: false,
            fallback: true
          });
        }
      }

      // Load full artifact data for display
      try {
        const artifactData = await apiClient.get(`/chat/session/${currentSession.id}/artifacts`);
        console.log('📋 Artifact data loaded:', artifactData);
        setArtifactData(artifactData);
      } catch (dataError) {
        console.error('Failed to load artifact data:', dataError.message);
        setArtifactData(null);
      }

    } catch (error) {
      console.error('Error loading artifacts:', error);
      
      // Set error state for artifact stats
      setArtifactStats({
        research_questions: 0,
        hypotheses: 0,
        claims: 0,
        evidence: 0,
        findings: 0,
        named_entities: 0,
        concepts: 0,
        references: 0,
        citations: 0,
        total_artifacts: 0,
        error: true,
        errorMessage: error.message,
        comprehensive: false,
        fallback: true
      });
      
      setArtifactData(null);
    }
  }, [currentSession?.id]);

  // Load session participants
  const loadSessionParticipants = useCallback(async (sessionId) => {
    if (!sessionId) return;
    
    try {
      console.log('🔄 Loading participants for session:', sessionId);
      
      const participants = await apiClient.get(`/sessions/${sessionId}/participants`);
      console.log('👥 Loaded participants:', participants);
      
      // Enrich participants with user details
      const enrichedParticipants = await Promise.all(
        participants.map(async (participant) => {
          try {
            // For now, we'll use the participant data as-is
            // In the future, we could fetch full user details from a users API
            return {
              ...participant,
              isOnline: Math.random() > 0.5, // Mock online status for now
              lastSeen: new Date() // Mock last seen time
            };
          } catch (error) {
            console.warn('Could not enrich participant data:', error);
            return {
              ...participant,
              isOnline: false,
              lastSeen: null
            };
          }
        })
      );
      
      setSessionParticipants(enrichedParticipants);
      console.log('✅ Participants loaded and enriched:', enrichedParticipants);
      
    } catch (error) {
      console.error('❌ Error loading session participants:', error);
      setSessionParticipants([]);
    }
  }, []);

  // Load artifacts when session changes
  useEffect(() => {
    // Only load artifacts if we have both a session and an authenticated user
    if (currentSession && currentUser) {
      loadArtifactData();
      loadSessionParticipants(currentSession.id);
    } else {
      console.log('🚫 Skipping artifact loading - missing session or user');
      // Clear artifact data when no session or user
      setArtifactData(null);
      setArtifactStats(null);
      setSessionParticipants([]);
    }
  }, [currentSession, currentUser, loadArtifactData, loadSessionParticipants]);

  // Open artifact inspector modal
  const openArtifactInspector = (artifactType = 'all') => {
    setInspectorArtifactType(artifactType);
    setShowArtifactInspector(true);
  };

  // Function to refresh artifacts (called from ChatInterface)
  const refreshArtifacts = () => {
    if (currentSession && currentSession.id) {
      console.log('🔄 Refreshing artifacts for session:', currentSession.id);
      loadArtifactData();
    } else {
      console.log('🚫 Cannot refresh artifacts: no active session');
    }
  };

  // Enhanced refresh with loading state
  const refreshArtifactsWithLoading = async () => {
    if (!currentSession?.id) return;
    
    try {
      // Add loading indicator to artifact stats
      setArtifactStats(prev => ({
        ...prev,
        loading: true
      }));
      
      console.log('🔄 Manual refresh triggered for artifacts...');
      await loadArtifactData();
      
      // Remove loading indicator
      setArtifactStats(prev => ({
        ...prev,
        loading: false
      }));
      
      console.log('✅ Manual artifact refresh completed');
    } catch (error) {
      console.error('❌ Error during manual artifact refresh:', error);
      setArtifactStats(prev => ({
        ...prev,
        loading: false,
        error: true,
        errorMessage: error.message
      }));
    }
  };

  // Authentication functions
  const handleLoginSuccess = (user, token) => {
    console.log('🎉 Login successful, setting user:', user);
    
    // Set token using the new token manager
    if (token) {
      tokenManager.setToken(token);
      console.log('✅ Token set in token manager');
    }
    
    setCurrentUser(user);
    setAuthLoading(false);
    setShowLoginModal(false);
    setShowUserDropdown(false);
    console.log('✅ User logged in:', user.username);
    
    // Load data after successful login
    setTimeout(() => {
      checkAPI();
      loadAgentStatus();
      loadAllSessionsFromBackend(); // Load user's sessions from backend
    }, 100);
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Starting logout process...');
      
      // Call backend logout endpoint to blacklist token
      try {
        const logoutResponse = await apiClient.post('/auth/logout', {});
        console.log('✅ Server-side logout successful:', logoutResponse);
        
        // Follow cleanup instructions from server
        if (logoutResponse.cleanup) {
          const cleanup = logoutResponse.cleanup;
          
          if (cleanup.clearLocalStorage) {
            localStorage.clear();
            console.log('🧹 LocalStorage cleared');
          }
          
          if (cleanup.clearSessionStorage) {
            sessionStorage.clear();
            console.log('🧹 SessionStorage cleared');
          }
          
          if (cleanup.clearIndexedDB) {
            // Clear IndexedDB if needed
            try {
              const databases = await indexedDB.databases();
              await Promise.all(
                databases.map(db => {
                  return new Promise((resolve, reject) => {
                    const deleteReq = indexedDB.deleteDatabase(db.name);
                    deleteReq.onsuccess = () => resolve();
                    deleteReq.onerror = () => reject(deleteReq.error);
                  });
                })
              );
              console.log('🧹 IndexedDB cleared');
            } catch (e) {
              console.warn('⚠️ Could not clear IndexedDB:', e);
            }
          }
        }
      } catch (error) {
        console.warn('⚠️ Server-side logout failed, proceeding with client-side cleanup:', error);
        // Continue with client-side cleanup even if server logout fails
      }
      
      // Clear token manager
      tokenManager.clearToken();
      console.log('🧹 Token manager cleared');
      
      // Reset application state
      setCurrentUser(null);
      setAuthLoading(false);
      setShowUserDropdown(false);
      setShowSystemAdmin(false);
      setShowUserProfile(false);
      
      // Clear all data
      setAllSessions([]);
      setCurrentSession(null);
      setStatementStats(null);
      setEvidenceStats(null);
      setSessionStats(null);
      setArtifactData(null);
      setArtifactStats(null);
      setActiveSection('dashboard');
      setActiveArtifactTab('analysis');
      setShowSessionSettings(false);
      setShowArtifactInspector(false);
      setInspectorArtifactType('all');
      
      console.log('✅ Logout completed successfully');
      
    } catch (error) {
      console.error('❌ Error during logout:', error);
      
      // Force cleanup even if there are errors
      tokenManager.clearToken();
      localStorage.clear();
      sessionStorage.clear();
      
      setCurrentUser(null);
      setAuthLoading(false);
      setShowUserDropdown(false);
      
      console.log('🔧 Force cleanup completed');
    }
  };

  const handleShowDocumentEditor = (document) => {
    setCurrentDocument(document);
    setShowDocumentEditor(true);
  };

  const handleSaveDocument = (document) => {
    console.log('Saving document:', document);
    // TODO: Add API call to save document to backend
    // For now, just close the editor
    setShowDocumentEditor(false);
    setCurrentDocument(null);
  };

  const handleCloseDocumentEditor = () => {
    setShowDocumentEditor(false);
    setCurrentDocument(null);
  };

  const handleSystemAdmin = () => {
    if (currentUser?.role === 'ADMIN') {
      setShowSystemAdmin(true);
      setShowUserDropdown(false);
    }
  };

  const handleAgentChange = (agentType) => {
    console.log('🔄 Agent changed to:', agentType);
    // Optionally dispatch event for other components to listen to
    window.dispatchEvent(new CustomEvent('agentChanged', { 
      detail: { agent: agentType } 
    }));
  };

  // Handle delete session with confirmation
  const handleDeleteSessionClick = (event, session) => {
    event.stopPropagation(); // Prevent session selection when clicking delete
    setSessionToDelete(session);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteSession = async () => {
    if (sessionToDelete) {
      await deleteSession(sessionToDelete.id);
      console.log('Session deleted:', sessionToDelete.id);
    }
    setShowDeleteConfirmation(false);
    setSessionToDelete(null);
  };

  const cancelDeleteSession = () => {
    setShowDeleteConfirmation(false);
    setSessionToDelete(null);
  };

  // Session sharing handlers
  const handleShareSessionClick = (event, session) => {
    if (event) {
      event.stopPropagation(); // Prevent session switching only if event exists
    }
    setSessionToShare(session);
    setShowSessionShare(true);
  };

  const handleCloseSessionShare = () => {
    setShowSessionShare(false);
    setSessionToShare(null);
  };


  // Methodology management
  const handleMethodologyChange = (methodologyId, settings) => {
    console.log('🎯 Methodology changed:', methodologyId, settings);
    setMethodologySettings(prev => ({
      ...prev,
      [methodologyId]: settings
    }));
    
    // TODO: Phase 2 - Persist to backend and apply to current session
    // if (currentSession) {
    //   updateSessionMethodology(currentSession.id, methodologyId, settings);
    // }
    
    // TODO: Phase 3 - Real-time methodology switching
    // websocketService.broadcastMethodologyChange(currentSession.sessionId, methodologyId, settings);
  };

  // WebSocket connection and participant updates
  useEffect(() => {
    if (currentSession && currentUser) {
      // Connect to WebSocket
      websocketService.connect().then(() => {
        // Subscribe to participant updates for current session
        websocketService.subscribeToParticipants(
          currentSession.sessionId, 
          (participantUpdate) => {
            console.log('👥 Participant update:', participantUpdate);
            // You could update UI here based on participant changes
            // For example, refresh all sessions when participants change
            if (participantUpdate.type === 'user_joined' || participantUpdate.type === 'user_left') {
              loadAllSessionsFromBackend();
            }
          }
        );

        // Notify others that this user is online in this session
        websocketService.notifyUserPresence(
          currentSession.sessionId, 
          currentUser.id, 
          'online'
        );
      }).catch(error => {
        console.error('Failed to connect WebSocket for participants:', error);
      });

      // Cleanup on session change or component unmount
      return () => {
        if (currentSession) {
          websocketService.notifyUserPresence(
            currentSession.sessionId, 
            currentUser.id, 
            'offline'
          );
          websocketService.unsubscribeFromChat(currentSession.sessionId);
        }
      };
    }
  }, [currentSession, currentUser]);

  // Show loading screen while checking authentication
  if (authLoading) {
    console.log('🔄 DEBUG: Showing loading screen, authLoading =', authLoading);
    return (
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <div className="app-container login-only">
          {/* Always show header with theme toggle */}
          <header className="top-bar" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', height: '64px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px', height: '100%'}}>
              <img src="/33fg_Logo.png" alt="Mach33" style={{height: '32px', width: 'auto', display: 'inline-block'}} />
              <span style={{fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)', display: 'inline-block', lineHeight: '32px'}}>Multi-Agent Research Platform</span>
            </div>
            
            <div className="header-right">
              {/* Theme Toggle - Always Available */}
              <button 
                className="action-btn theme-toggle"
                onClick={toggleTheme}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              >
                {theme === 'dark' ? (
                  <LightBulbIcon className="action-icon" />
                ) : (
                  <MoonIcon className="action-icon" />
                )}
                <span className="action-text">{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
            </div>
          </header>

          {/* Loading content */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            flex: 1,
            background: 'var(--bg-primary)'
          }}>
            <div style={{ 
              textAlign: 'center', 
              color: 'var(--text-primary)',
              fontSize: '18px'
            }}>
              <div style={{ marginBottom: '20px' }}>
                <img 
                  src="/33fg_Logo.png" 
                  alt="Mach33" 
                  style={{ height: '60px', opacity: 0.8 }}
                />
              </div>
              <div>Loading...</div>
            </div>
          </div>
        </div>
      </ThemeContext.Provider>
    );
  }

  // If user is not authenticated, show login modal with header
  if (!currentUser) {
    console.log('🚫 DEBUG: No current user, showing login modal. currentUser =', currentUser);
    return (
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <div className="app-container login-only">
          {/* Always show header with theme toggle */}
          <header className="top-bar" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', height: '64px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px', height: '100%'}}>
              <img src="/33fg_Logo.png" alt="Mach33" style={{height: '32px', width: 'auto', display: 'inline-block'}} />
              <span style={{fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)', display: 'inline-block', lineHeight: '32px'}}>Multi-Agent Research Platform</span>
            </div>
            
            <div className="header-right">
              {/* Theme Toggle - Always Available */}
              <button 
                className="action-btn theme-toggle"
                onClick={toggleTheme}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              >
                {theme === 'dark' ? (
                  <LightBulbIcon className="action-icon" />
                ) : (
                  <MoonIcon className="action-icon" />
                )}
                <span className="action-text">{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
              
              {/* Login Button for Non-Authenticated Users */}
              <button 
                className="action-btn login"
                onClick={() => setShowLoginModal(true)}
                title="Sign in to your account"
              >
                <UserCircleIcon className="action-icon" />
                <span className="action-text">Sign In</span>
              </button>
            </div>
          </header>

          {/* Login Modal */}
          <LoginModal 
            isOpen={true}
            onClose={() => {}} // Prevent closing when not authenticated
            onLoginSuccess={handleLoginSuccess}
          />
        </div>
      </ThemeContext.Provider>
    );
  }

  console.log('✅ DEBUG: User authenticated, showing main app. currentUser =', currentUser?.username);
  console.log('🔍 DEBUG: authLoading =', authLoading, 'currentUser =', !!currentUser, 'theme =', theme);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`app-container ${!currentUser ? 'login-only' : ''}`}>
        {/* Always show header with theme toggle */}
        <header className="top-bar" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', height: '64px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px', height: '100%'}}>
            <img src="/33fg_Logo.png" alt="Mach33" style={{height: '32px', width: 'auto', display: 'inline-block'}} />
            <span style={{fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)', display: 'inline-block', lineHeight: '32px'}}>Multi-Agent Research Platform</span>
          </div>
          
          <div className="header-right">
            {/* Theme Toggle - Always Available */}
            <button 
              className="action-btn theme-toggle"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? (
                <LightBulbIcon className="action-icon" />
              ) : (
                <MoonIcon className="action-icon" />
              )}
              <span className="action-text">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            
            {/* Authenticated User Features */}
            {currentUser && (
              <>
                <button 
                  className="action-btn new-session"
                  onClick={() => setShowNewSessionModal(true)}
                  title="Create new research session"
                >
                  <SparklesIcon className="action-icon" />
                  <span className="action-text">New Session</span>
                </button>
                
                <div className="user-profile-section">
                  <div className="user-dropdown-container">
                    <button 
                      className="user-profile-btn"
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      title={`${currentUser.fullName || currentUser.username} - ${currentUser.roleDisplayName}`}
                    >
                      <div className="user-avatar">
                        {currentUser.role === 'ADMIN' ? (
                          <ShieldCheckIcon className="user-icon admin" />
                        ) : (
                          <UserCircleIcon className="user-icon" />
                        )}
                      </div>
                      <div className="user-info">
                        <span className="user-name">{currentUser.fullName || currentUser.username}</span>
                        <span className="user-role">{currentUser.roleDisplayName}</span>
                      </div>
                    </button>
                    
                    {showUserDropdown && (
                      <div className="user-dropdown">
                        <div className="dropdown-header">
                          <div className="user-details">
                            <strong>{currentUser.fullName || currentUser.username}</strong>
                            <span>{currentUser.email}</span>
                            <span className="role-badge">{currentUser.roleDisplayName}</span>
                          </div>
                        </div>
                        <div className="dropdown-actions">
                          <button 
                            className="dropdown-item profile"
                            onClick={() => {
                              setShowUserProfile(true);
                              setShowUserDropdown(false);
                            }}
                          >
                            <UserCircleIcon className="dropdown-icon" />
                            Profile
                          </button>
                          {currentUser.role === 'ADMIN' && (
                            <button 
                              className="dropdown-item admin"
                              onClick={handleSystemAdmin}
                            >
                              <ShieldCheckIcon className="dropdown-icon" />
                              System Administration
                            </button>
                          )}
                          <button 
                            className="dropdown-item logout"
                            onClick={handleLogout}
                          >
                            <ArrowRightOnRectangleIcon className="dropdown-icon" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <button 
                  className="action-btn settings"
                  onClick={() => setShowSettings(true)}
                  title="AI Agent Configuration"
                >
                  <AdjustmentsHorizontalIcon className="action-icon" />
                  <span className="action-text">Settings</span>
                </button>

                <div className="connection-status" title="Platform Status">
                  <SignalIcon className="status-icon" />
                </div>
              </>
            )}
            
            {/* Login Button for Non-Authenticated Users */}
            {!currentUser && (
              <button 
                className="action-btn login"
                onClick={() => setShowLoginModal(true)}
                title="Sign in to your account"
              >
                <UserCircleIcon className="action-icon" />
                <span className="action-text">Sign In</span>
              </button>
            )}
          </div>
        </header>

        {currentUser && (
          <div className="main-layout">
            {/* Left Sidebar */}
            <aside className="left-sidebar">
              {/* Main Navigation */}
              <div className="main-navigation">
                <div className="nav-header" style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                  <h3>Research Tools</h3>
                </div>
                <div className="nav-items">
                  <button 
                    className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
                    onClick={() => handleSectionChange('dashboard')}
                    title="Research Intelligence Dashboard - Analytics, Insights & Knowledge Graph"
                  >
                    <Squares2X2Icon className="nav-icon" />
                    <span className="nav-name">Research Dashboard</span>
                  </button>
                  <button 
                    className={`nav-item ${activeSection === 'agents' ? 'active' : ''}`}
                    onClick={() => handleSectionChange('agents')}
                    title="AI Agents - Configure and manage research agents"
                  >
                    <BoltIcon className="nav-icon" />
                    <span className="nav-name">AI Agents</span>
                  </button>
                  <button 
                    className={`nav-item ${activeSection === 'ontologies' ? 'active' : ''}`}
                    onClick={() => handleSectionChange('ontologies')}
                    title="Research Ontologies - Abstract theoretical frameworks for discourse"
                  >
                    <BookOpenIcon className="nav-icon" />
                    <span className="nav-name">Ontologies</span>
                  </button>
                  <button 
                    className={`nav-item ${activeSection === 'methodologies' ? 'active' : ''}`}
                    onClick={() => handleSectionChange('methodologies')}
                    title="Research Methodologies - Concrete implementations with specific rules"
                  >
                    <AdjustmentsHorizontalIcon className="nav-icon" />
                    <span className="nav-name">Methodologies</span>
                  </button>
                  {currentSession && (
                    <button 
                      className={`nav-item ${activeSection === 'session' ? 'active' : ''}`}
                      onClick={() => handleSectionChange('session')}
                      title="Current Session Chat"
                    >
                      <ChatBubbleLeftRightIcon className="nav-icon" />
                      <span className="nav-name">Session Chat</span>
                    </button>
                  )}
                  {currentSession && (
                    <button 
                      className={`nav-item ${activeSection === 'knowledge-graph' ? 'active' : ''}`}
                      onClick={() => handleSectionChange('knowledge-graph')}
                      title="Knowledge Graph - Visualize Research Artifacts"
                    >
                      <ShareIcon className="nav-icon" />
                      <span className="nav-name">Knowledge Graph</span>
                    </button>
                  )}
                  {currentSession && (
                    <button 
                      className={`nav-item ${activeSection === 'enhanced-knowledge-graph' ? 'active' : ''}`}
                      onClick={() => handleSectionChange('enhanced-knowledge-graph')}
                      title="Enhanced Knowledge Graph - Interactive Force-Directed Visualization"
                    >
                      <GlobeAltIcon className="nav-icon" />
                      <span className="nav-name">Enhanced Graph</span>
                    </button>
                  )}
                  {currentSession && (
                    <button 
                      className={`nav-item ${activeSection === 'super-enhanced-knowledge-graph' ? 'active' : ''}`}
                      onClick={() => handleSectionChange('super-enhanced-knowledge-graph')}
                      title="Super Enhanced Knowledge Graph - Advanced Interactive Network Visualization"
                    >
                      <RocketLaunchIcon className="nav-icon" />
                      <span className="nav-name">Super Graph</span>
                    </button>
                  )}
                  <button 
                    className="nav-item"
                    onClick={() => setShowAgentOrchestration(true)}
                    title="Agent Orchestration - Build Research Methodologies"
                  >
                    <RocketLaunchIcon className="nav-icon" />
                    <span className="nav-name">Methodology Builder</span>
                  </button>
                  <button 
                    className={`nav-item ${activeSection === 'documents' ? 'active' : ''}`}
                    onClick={() => handleSectionChange('documents')}
                    title="Research Documents"
                  >
                    <Squares2X2Icon className="nav-icon" />
                    <span className="nav-name">Research Documents</span>
                  </button>
                  <button 
                    className={`nav-item ${activeSection === 'research-reports' ? 'active' : ''}`}
                    onClick={() => handleSectionChange('research-reports')}
                    title="Research Reports - Create comprehensive reports from artifacts"
                  >
                    <DocumentTextIcon className="nav-icon" />
                    <span className="nav-name">Research Reports</span>
                  </button>
                  <button 
                    className={`nav-item ${activeSection === 'references' ? 'active' : ''}`}
                    onClick={() => handleSectionChange('references')}
                    title="Reference Requirements Settings"
                  >
                    <Cog6ToothIcon className="nav-icon" />
                    <span className="nav-name">Reference Settings</span>
                  </button>
                </div>
              </div>

              {/* Recent Sessions */}
              <div className="main-navigation">
                <div className="nav-header" style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                  <h3>Recent Sessions</h3>
                    <button 
                    className="nav-action-btn"
                      onClick={() => {
                        console.log('New session button clicked, setting showNewSessionModal to true');
                        setShowNewSessionModal(true);
                      }}
                      title="Create new session"
                    >
                    <PlusIcon className="nav-action-icon" />
                    </button>
                </div>

                {(allSessions || []).length > 0 ? (
                  <div className="nav-items">
                    {(allSessions || []).slice(0, 10).map((session) => {
                      const isCurrent = currentSession && currentSession.id === session.id;
                      
                      return (
                        <div 
                          key={session.id} 
                          className={`nav-item clickable ${isCurrent ? 'active' : ''}`}
                          onClick={() => switchToSession(session)}
                          title={`Switch to session: ${session.name}`}
                        >
                          <ChatBubbleLeftRightIcon className="nav-icon" />
                          <span className="nav-label">
                            <div className="session-name" title={session.name || 'Untitled Session'}>
                              {(session.name || 'Untitled Session').length > 35 ? (session.name || 'Untitled Session').substring(0, 35) + '...' : (session.name || 'Untitled Session')}
                            </div>
                            <div className="session-meta">
                              {new Date(session.created).toLocaleDateString()} • {session.status}
                            </div>
                          </span>
                          <div className="nav-item-actions">
                            {session.isShared && (
                              <span className="nav-badge shared" title={`Owned by ${session.sharedBy}`}>
                                Owner: {session.sharedByUsername || 'Unknown'}
                              </span>
                            )}
                            {!session.isShared && (
                              <button 
                                className="nav-delete-btn"
                                onClick={(e) => handleDeleteSessionClick(e, session)}
                                title={`Delete session: ${session.name}`}
                              >
                                <TrashIcon className="nav-delete-icon" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="nav-empty-state">
                    <BeakerIcon className="nav-empty-icon" />
                    <p>No research sessions yet</p>
                    <button 
                      className="nav-empty-action"
                      onClick={() => setShowNewSessionModal(true)}
                    >
                      <PlusIcon className="nav-empty-action-icon" />
                      Create Your First Session
                    </button>
                  </div>
                )}
              </div>

            </aside>

            {/* Main Content Area */}
            <main className="main-content">
              {activeSection === 'dashboard' && (
                <div className="dashboard-layout">
                  <ResearchDashboard 
                    currentSession={currentSession}
                    allSessions={allSessions}
                  />
                </div>
              )}

              {activeSection === 'agents' && (
                <div className="agents-layout">
                  <AgentManager 
                    agentStatus={agentStatus}
                    onAgentConfigure={(agent) => {
                      setSelectedAgent(agent);
                      setShowAgentConfig(true);
                    }}
                    onCreateAgent={() => setShowAgentBuilder(true)}
                  />
                </div>
              )}

              {activeSection === 'ontologies' && (
                <div className="ontologies-layout">
                  <OntologyManager 
                    currentSession={currentSession}
                    onOntologyChange={handleMethodologyChange}
                  />
                </div>
              )}

              {activeSection === 'methodologies' && (
                <div className="methodologies-layout">
                  <MethodologyManager 
                    currentSession={currentSession}
                    onMethodologyChange={handleMethodologyChange}
                  />
                </div>
              )}

              {activeSection === 'session' && currentSession && (
                <div className="session-workspace">
                  <ChatInterface
                    sessionId={currentSession.id}
                    sessionName={currentSession.name}
                    sessionDescription={currentSession.description}
                    onAgentChange={handleAgentChange}
                    currentSession={currentSession}
                    onStatsUpdate={(stats) => console.log('Stats updated:', stats)}
                    onArtifactsUpdate={refreshArtifacts}
                    onShowSessionSettings={() => setShowSessionSettings(true)}
                    onShowStatements={() => handleSectionChange('statements')}
                    onShowEvidence={() => handleSectionChange('evidence')}
                    statementStats={statementStats}
                    evidenceStats={evidenceStats}
                    onShowDocumentEditor={handleShowDocumentEditor}
                  />
                </div>
              )}

              {activeSection === 'statements' && currentSession && (
                <div className="statements-workspace">
                  <div className="workspace-header">
                    <h2>Research Statements</h2>
                    <button 
                      className="back-to-session-btn"
                      onClick={() => handleSectionChange('session')}
                    >
                      ← Back to Chat
                    </button>
                  </div>
                  <ResearchStatementManager 
                    sessionId={currentSession.id}
                    onStatementCreated={(statement) => {
                      console.log('New research statement created:', statement);
                      loadStatementStats(currentSession.id);
                    }}
                  />
                </div>
              )}

              {activeSection === 'evidence' && currentSession && (
                <div className="evidence-workspace">
                  <div className="workspace-header">
                    <h2>Evidence Management</h2>
                    <button 
                      className="back-to-session-btn"
                      onClick={() => handleSectionChange('session')}
                    >
                      ← Back to Chat
                    </button>
                  </div>
                  <EvidenceManager 
                    sessionId={currentSession.id}
                    onEvidenceCreated={(evidence) => {
                      console.log('New evidence created:', evidence);
                      loadEvidenceStats(currentSession.id);
                    }}
                  />
                </div>
              )}

              {activeSection === 'documents' && (
                <div className="documents-panel">
                  <h2>Document Library</h2>
                  <div className="upload-area">
                    <div className="upload-box">
                      <DocumentTextIcon className="upload-icon" />
                      <p>Drag and drop documents here or click to upload</p>
                      <button className="upload-btn">Choose Files</button>
                    </div>
                  </div>
                  <div className="document-list">
                    <p>No documents uploaded yet</p>
                  </div>
                </div>
              )}

              {activeSection === 'research-reports' && (
                <ResearchReports sessionId={currentSession?.id} />
              )}

              {activeSection === 'references' && (
                <div className="references-panel">
                  <ReferenceSettings 
                    onSettingsChange={(newRequirement) => {
                      console.log('Reference requirement changed to:', newRequirement);
                      // Optionally refresh any relevant data or show notification
                    }}
                  />
                </div>
              )}

              {activeSection === 'knowledge-graph' && currentSession && (
                <div className="knowledge-graph-panel">
                  <KnowledgeGraph sessionId={currentSession.id} />
                </div>
              )}

              {activeSection === 'enhanced-knowledge-graph' && currentSession && (
                <div className="enhanced-knowledge-graph-panel">
                  <EnhancedKnowledgeGraph sessionId={currentSession.id} />
                </div>
              )}

              {activeSection === 'super-enhanced-knowledge-graph' && currentSession && (
                <div className="super-enhanced-knowledge-graph-panel">
                  <SuperEnhancedKnowledgeGraph sessionId={currentSession.id} />
                </div>
              )}
            </main>

            {/* Right Sidebar - Research Artifacts */}
            <aside className="artifacts-sidebar">
              {currentSession ? (
                <div className="artifacts-container">
                  {/* Participants */}
                  <div className="main-navigation">
                    <div className="nav-header" style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                      <h3>Participants</h3>
                      <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
                        <span className="participants-count">
                          {1 + (sessionParticipants || []).filter(p => !p.isOwner).length + (agentStatus || []).filter(agent => agent.configured && agent.status === "online").length} online
                        </span>
                        <button 
                          onClick={() => handleShareSessionClick(null, currentSession)}
                          title="Share this session"
                          className="participants-share-btn"
                        >
                          <ShareIcon style={{width: "12px", height: "12px"}} />
                          Share
                        </button>
                        <button 
                          className={`refresh-btn ${agentStatusLoading ? 'loading' : ''}`}
                          onClick={refreshAgentStatus}
                          disabled={agentStatusLoading}
                          title="Refresh agent status"
                          style={{
                            background: "rgba(59, 130, 246, 0.1)",
                            border: "1px solid rgba(59, 130, 246, 0.3)",
                            borderRadius: "6px",
                            color: "#60a5fa",
                            cursor: agentStatusLoading ? "not-allowed" : "pointer",
                            padding: "4px 8px",
                            fontSize: "12px",
                            opacity: agentStatusLoading ? 0.6 : 1
                          }}
                        >
                          {agentStatusLoading ? "⟳" : "🔄"}
                        </button>
                      </div>
                    </div>
                    <div className="nav-items">
                      {/* User - Always Online */}
                      <div className="nav-item participant-item">
                        <div className="participant-status-circle online"></div>
                        <div className="participant-text">
                          {currentUser ? `${currentUser.fullName || currentUser.username}` : "You"}
                          {userMentions > 0 && (
                            <span 
                              className="mention-chip has-mentions" 
                              title={`You have ${userMentions} unread mention${userMentions > 1 ? "s" : ""}`}
                              onClick={() => setUserMentions(0)}
                            >
                              @
                            </span>
                          )} <span className="participant-model-inline">- Human User</span>
                        </div>
                        <div className={`participant-role-chip ${(currentUser?.roleDisplayName || "user").toLowerCase()}`}>
                          {currentUser?.roleDisplayName || "user"}
                        </div>
                      </div>
                      
                      {/* Other Human Participants */}
                      {(sessionParticipants || []).filter(p => !p.isOwner && p.userId !== currentUser?.id).map((participant) => (
                        <div key={participant.userId} className="nav-item participant-item">
                          <div className={`participant-status-circle ${participant.isOnline ? "online" : "offline"}`}></div>
                          <div className="participant-text">
                            {participant.fullName || participant.username || `User ${participant.userId}`}
                            <span className="participant-model-inline">- Human User</span>
                          </div>
                          <div className={`participant-role-chip ${(participant.permission || "viewer").toLowerCase()}`}>
                            {participant.permission || "viewer"}
                          </div>
                        </div>
                      ))}
                      
                      {/* AI Agents - Dynamic Status */}
                      {(agentStatus || []).map((agent) => (
                        <div 
                          key={agent.type || agent.name} 
                          className={`nav-item participant-item ${!agent.configured || agent.status !== "online" ? "disabled" : "clickable"}`}
                          onClick={() => {
                            if (agent.configured && agent.status === "online" && agent.type) {
                              // Open Agent Config Modal with selected agent
                              setSelectedAgent(agent);
                              setShowAgentConfig(true);
                            }
                          }}
                          title={agent.configured && agent.status === "online" ? `Click to configure ${agent.name}` : `${agent.name} needs configuration`}
                        >
                          <div className={`participant-status-circle ${agent.configured && agent.status === "online" ? "online" : "offline"}`}></div>
                          <div className="participant-text">
                            {agent.name || "Unknown Agent"} <span className="participant-model-inline">- {getShortModelName(agent)}</span>
                          </div>
                          <div className={`participant-role-chip ${(agent.epistemicRole || "researcher").toLowerCase()}`}>
                            {agent.epistemicRole || "researcher"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Session Context Header */}
                  <div className="artifacts-header">
                    <div className="artifacts-title-section">
                      <h3>Research Artifacts</h3>
                      <button 
                        className={`refresh-btn ${artifactStats?.loading ? 'loading' : ''}`}
                        onClick={refreshArtifactsWithLoading}
                        disabled={artifactStats?.loading}
                        title="Refresh artifact statistics"
                      >
                        <ArrowPathIcon className={`refresh-icon ${artifactStats?.loading ? 'spinning' : ''}`} />
                      </button>
                    </div>
                    <div className="session-context">
                      <span className="session-name">{currentSession.name}</span>
                      <span className="session-id">ID: {currentSession.id}</span>
                      {artifactStats?.comprehensive && (
                        <span className="stats-mode">Enhanced Stats</span>
                      )}
                      {artifactStats?.fallback && (
                        <span className="stats-mode fallback">Basic Mode</span>
                      )}
                      {artifactStats?.error && (
                        <span className="stats-mode error">Error</span>
                      )}
                    </div>
                  </div>

                  {/* Artifact Tabs */}
                  <div className="artifact-tabs">
                    <button 
                      className={`artifact-tab ${activeArtifactTab === 'analysis' ? 'active' : ''}`}
                      onClick={() => setActiveArtifactTab('analysis')}
                    >
                      <ChartBarIcon className="tab-icon" />
                      <span className="tab-label">Analysis</span>
                    </button>
                    <button 
                      className={`artifact-tab ${activeArtifactTab === 'research' ? 'active' : ''}`}
                      onClick={() => setActiveArtifactTab('research')}
                    >
                      <BeakerIcon className="tab-icon" />
                      <span className="tab-label">Research</span>
                    </button>
                    <button 
                      className={`artifact-tab ${activeArtifactTab === 'linguistics' ? 'active' : ''}`}
                      onClick={() => setActiveArtifactTab('linguistics')}
                    >
                      <LanguageIcon className="tab-icon" />
                      <span className="tab-label">Linguistics</span>
                    </button>
                    <button 
                      className={`artifact-tab ${activeArtifactTab === 'synthesis' ? 'active' : ''}`}
                      onClick={() => setActiveArtifactTab('synthesis')}
                    >
                      <PuzzlePieceIcon className="tab-icon" />
                      <span className="tab-label">Synthesis</span>
                    </button>
                  </div>

                  {/* Artifact Content */}
                  <div className="artifact-content">
                    {/* Analysis Tab */}
                    {activeArtifactTab === 'analysis' && (
                      <div className="artifact-section">
                        <div className="main-navigation">
                          <div className="nav-header" style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                            <h3>Extraction Statistics</h3>
                            <span className="artifacts-count">{artifactStats?.total_artifacts || 0}</span>
                            </div>
                          <div className="nav-items">
                            <div className="nav-item clickable" onClick={() => openArtifactInspector('all')}>
                              <CircleStackIcon className="nav-icon" />
                              <span className="nav-label">Total Artifacts</span>
                              <span className="nav-badge">{artifactStats?.total_artifacts || 0}</span>
                            </div>
                            <div className="nav-item clickable" onClick={() => openArtifactInspector('research_questions')}>
                              <QuestionMarkCircleIcon className="nav-icon" />
                              <span className="nav-label">Research Questions</span>
                              <span className="nav-badge">{artifactStats?.research_questions || 0}</span>
                            </div>
                            <div className="nav-item clickable" onClick={() => openArtifactInspector('hypotheses')}>
                              <LightBulbIcon className="nav-icon" />
                              <span className="nav-label">Hypotheses</span>
                              <span className="nav-badge">{artifactStats?.hypotheses || 0}</span>
                            </div>
                            <div className="nav-item clickable" onClick={() => openArtifactInspector('claims')}>
                              <AcademicCapIcon className="nav-icon" />
                              <span className="nav-label">Claims</span>
                              <span className="nav-badge">{artifactStats?.claims || 0}</span>
                            </div>
                            <div className="nav-item clickable" onClick={() => openArtifactInspector('evidence')}>
                              <DocumentDuplicateIcon className="nav-icon" />
                              <span className="nav-label">Evidence</span>
                              <span className="nav-badge">{artifactStats?.evidence || 0}</span>
                            </div>
                            <div className="nav-item clickable" onClick={() => openArtifactInspector('findings')}>
                              <CheckCircleIcon className="nav-icon" />
                              <span className="nav-label">Findings</span>
                              <span className="nav-badge">{artifactStats?.findings || 0}</span>
                            </div>
                            <div className="nav-item clickable" onClick={() => openArtifactInspector('concepts')}>
                              <TagIcon className="nav-icon" />
                              <span className="nav-label">Concepts</span>
                              <span className="nav-badge">{artifactStats?.concepts || 0}</span>
                            </div>
                            <div className="nav-item clickable" onClick={() => openArtifactInspector('named_entities')}>
                              <TagIcon className="nav-icon" />
                              <span className="nav-label">Named Entities</span>
                              <span className="nav-badge">{artifactStats?.named_entities || 0}</span>
                            </div>
                            <div className="nav-item clickable" onClick={() => openArtifactInspector('references')}>
                              <BookOpenIcon className="nav-icon" />
                              <span className="nav-label">References</span>
                              <span className="nav-badge">{artifactStats?.references || 0}</span>
                            </div>
                            <div className="nav-item clickable" onClick={() => openArtifactInspector('citations')}>
                              <LinkIcon className="nav-icon" />
                              <span className="nav-label">Citations</span>
                              <span className="nav-badge">{artifactStats?.citations || 0}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Quality Metrics */}
                        {artifactStats?.comprehensive && artifactStats?.qualityMetrics && (
                          <div className="main-navigation">
                            <div className="nav-header">
                              <h3>Quality Metrics</h3>
                              </div>
                            <div className="nav-items">
                              <div className="nav-item">
                                <CheckCircleIcon className="nav-icon" />
                                <span className="nav-label">Avg Confidence</span>
                                <span className="nav-badge">
                                  {Math.round((artifactStats.qualityMetrics.averageConfidence || 0) * 100)}%
                                </span>
                              </div>
                              <div className="nav-item">
                                <StarIcon className="nav-icon" />
                                <span className="nav-label">Quality Score</span>
                                <span className="nav-badge">
                                  {Math.round((artifactStats.qualityMetrics.qualityScore || 0) * 100)}%
                                </span>
                              </div>
                              <div className="nav-item">
                                <ChartBarIcon className="nav-icon" />
                                <span className="nav-label">Completeness</span>
                                <span className="nav-badge">
                                  {Math.round((artifactStats.qualityMetrics.completeness || 0) * 100)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Research Tab */}
                    {activeArtifactTab === 'research' && (
                      <div className="artifact-section">
                        <div className="main-navigation">
                          <div className="nav-header">
                            <h3>Research Framework</h3>
                            </div>
                          <div className="nav-items">
                            <div className="nav-item clickable" onClick={() => openArtifactInspector('research_questions')}>
                              <QuestionMarkCircleIcon className="nav-icon" />
                              <span className="nav-label">Research Questions</span>
                              <span className="nav-badge">{artifactStats?.research_questions || 0}</span>
                            </div>
                            <div className="nav-item clickable" onClick={() => openArtifactInspector('hypotheses')}>
                              <LightBulbIcon className="nav-icon" />
                              <span className="nav-label">Hypotheses</span>
                              <span className="nav-badge">{artifactStats?.hypotheses || 0}</span>
                            </div>
                            <div className="nav-item clickable" onClick={() => openArtifactInspector('findings')}>
                              <CheckCircleIcon className="nav-icon" />
                              <span className="nav-label">Findings</span>
                              <span className="nav-badge">{artifactStats?.findings || 0}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="main-navigation">
                          <div className="nav-header">
                            <h3>Evidence & Support</h3>
                            </div>
                          <div className="nav-items">
                            <div className="nav-item clickable" onClick={() => openArtifactInspector('claims')}>
                              <AcademicCapIcon className="nav-icon" />
                              <span className="nav-label">Claims</span>
                              <span className="nav-badge">{artifactStats?.claims || 0}</span>
                            </div>
                            <div className="nav-item clickable" onClick={() => openArtifactInspector('evidence')}>
                              <DocumentDuplicateIcon className="nav-icon" />
                              <span className="nav-label">Evidence</span>
                              <span className="nav-badge">{artifactStats?.evidence || 0}</span>
                            </div>
                            <div className="nav-item clickable" onClick={() => openArtifactInspector('citations')}>
                              <LinkIcon className="nav-icon" />
                              <span className="nav-label">Citations</span>
                              <span className="nav-badge">{artifactStats?.citations || 0}</span>
                            </div>
                            <div className="nav-item clickable" onClick={() => openArtifactInspector('references')}>
                              <BookOpenIcon className="nav-icon" />
                              <span className="nav-label">References</span>
                              <span className="nav-badge">{artifactStats?.references || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Linguistics Tab */}
                    {activeArtifactTab === 'linguistics' && (
                      <div className="artifact-section">
                        <div className="main-navigation">
                          <div className="nav-header">
                            <h3>Linguistic Analysis</h3>
                          </div>
                          <div className="nav-items">
                            <div className="nav-item clickable" onClick={() => openArtifactInspector('named_entities')}>
                              <TagIcon className="nav-icon" />
                              <span className="nav-label">Named Entities</span>
                              <span className="nav-badge">{artifactStats?.named_entities || 0}</span>
                            </div>
                            <div className="nav-item clickable" onClick={() => openArtifactInspector('concepts')}>
                              <LanguageIcon className="nav-icon" />
                              <span className="nav-label">Concepts</span>
                              <span className="nav-badge">{artifactStats?.concepts || 0}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="main-navigation">
                          <div className="nav-header">
                            <h3>Content Analysis</h3>
                          </div>
                          <div className="nav-items">
                            <div className="nav-item">
                              <CircleStackIcon className="nav-icon" />
                              <span className="nav-label">Key Terms</span>
                              <span className="nav-badge">{artifactStats?.key_terms || 0}</span>
                            </div>
                            <div className="nav-item">
                              <BookOpenIcon className="nav-icon" />
                              <span className="nav-label">Definitions</span>
                              <span className="nav-badge">{artifactStats?.definitions || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Synthesis Tab */}
                    {activeArtifactTab === 'synthesis' && (
                      <div className="artifact-section">
                        <div className="main-navigation">
                          <div className="nav-header">
                            <h3>Knowledge Integration</h3>
                          </div>
                          <div className="nav-items">
                            <div className="nav-item">
                              <ArrowsPointingOutIcon className="nav-icon" />
                              <span className="nav-label">Connections</span>
                              <span className="nav-badge">{artifactStats?.connections || evidenceStats?.linkedCount || 0}</span>
                            </div>
                            <div className="nav-item">
                              <PuzzlePieceIcon className="nav-icon" />
                              <span className="nav-label">Relationships</span>
                              <span className="nav-badge">{artifactStats?.relationships || 0}</span>
                            </div>
                            <div className="nav-item">
                              <ChartBarIcon className="nav-icon" />
                              <span className="nav-label">Patterns</span>
                              <span className="nav-badge">{artifactStats?.patterns || 0}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="main-navigation">
                          <div className="nav-header">
                            <h3>Research Outcomes</h3>
                          </div>
                          <div className="nav-items">
                            <div className="nav-item clickable" onClick={() => openArtifactInspector('findings')}>
                              <CheckCircleIcon className="nav-icon" />
                              <span className="nav-label">Key Findings</span>
                              <span className="nav-badge">{artifactStats?.findings || 0}</span>
                            </div>
                            <div className="nav-item">
                              <StarIcon className="nav-icon" />
                              <span className="nav-label">Insights</span>
                              <span className="nav-badge">{artifactStats?.insights || 0}</span>
                            </div>
                            <div className="nav-item">
                              <LightBulbIcon className="nav-icon" />
                              <span className="nav-label">Conclusions</span>
                              <span className="nav-badge">{artifactStats?.conclusions || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="artifact-actions">
                    <button className="action-btn primary" onClick={() => openArtifactInspector('all')}>
                      View All
                    </button>
                    <button className="action-btn" onClick={refreshArtifactsWithLoading}>
                      Refresh
                    </button>
                    <button className="action-btn">
                      Export
                    </button>
                    <button className="action-btn">
                      Report
                    </button>
                  </div>
                </div>
              ) : (
                <div className="no-session-artifacts">
                  <ClipboardDocumentListIcon className="no-session-icon" />
                  <h3>No Session Selected</h3>
                  <p>Select a session to view research artifacts</p>
                  <button 
                    className="start-session-btn"
                    onClick={() => setShowNewSessionModal(true)}
                  >
                    Start New Session
                  </button>
                </div>
              )}
            </aside>
          </div>
        )}

        {/* AI Settings Modal */}
        <AISettingsModal 
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onSave={(settings) => {
            console.log('AI Settings saved from main app:', settings);
          }}
        />

        {/* New Session Modal */}
        <SessionConfigModal 
          isOpen={showNewSessionModal}
          onClose={() => setShowNewSessionModal(false)}
          onCreateSession={createNewSession}
        />

        {/* Session Settings Modal */}
        <SessionConfigModal 
          isOpen={showSessionSettings}
          onClose={() => setShowSessionSettings(false)}
          onUpdateSession={updateSessionSettings}
          editSession={currentSession}
          mode="edit"
        />

        {/* Artifact Inspection Modal */}
        {showArtifactInspector && currentSession && (
          <ArtifactInspectionModal
            isOpen={showArtifactInspector}
            onClose={() => setShowArtifactInspector(false)}
            sessionId={currentSession.id}
            artifactType={inspectorArtifactType}
            artifactData={artifactData}
          />
        )}

        {/* Login Modal */}
        <LoginModal 
          isOpen={!currentUser || showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLoginSuccess}
        />

        {/* User Management Modal */}
        {showSystemAdmin && (
          <SystemAdministrationModal
            isOpen={showSystemAdmin}
            onClose={() => setShowSystemAdmin(false)}
            currentUser={currentUser}
          />
        )}

        {/* User Profile Modal */}
        <UserProfileModal
          isOpen={showUserProfile}
          onClose={() => setShowUserProfile(false)}
          currentUser={currentUser}
          onUserUpdate={(updatedUser) => {
            setCurrentUser(updatedUser);
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          }}
        />

        {/* Research Document Editor Modal */}
        {showDocumentEditor && currentDocument && (
          <div className="modal-overlay research-documents-modal">
            <div className="modal-container large-modal">
              <ResearchDocumentDemo
                document={currentDocument}
                sessionId={currentSession?.id}
                onSave={handleSaveDocument}
                onClose={handleCloseDocumentEditor}
              />
            </div>
          </div>
        )}

        {/* Agent Orchestration Modal */}
        {showAgentOrchestration && (
          <AgentOrchestrationModal
            isOpen={showAgentOrchestration}
            onClose={() => setShowAgentOrchestration(false)}
            sessionId={currentSession?.id}
          />
        )}

        {/* Session Delete Confirmation Modal */}
        {showDeleteConfirmation && sessionToDelete && (
          <div className="modal-overlay session-delete-confirmation">
            <div className="modal-container">
              <h3>Confirm Deletion</h3>
              <p>Are you sure you want to delete the session "{sessionToDelete.name}"?</p>
              <div className="button-container">
                <button className="action-btn primary" onClick={confirmDeleteSession}>
                  Delete
                </button>
                <button className="action-btn" onClick={cancelDeleteSession}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Agent Builder Modal */}
        <AgentBuilderModal
          isOpen={showAgentBuilder}
          onClose={() => setShowAgentBuilder(false)}
          onSave={(agent) => {
            console.log('New agent created:', agent);
            // You can add additional logic here to handle the saved agent
          }}
        />

        {/* Agent Config Modal */}
        <AgentConfigModal
          isOpen={showAgentConfig}
          onClose={() => {
            setShowAgentConfig(false);
            setSelectedAgent(null);
          }}
          selectedAgent={selectedAgent}
          onSave={(agentType, config) => {
            console.log('Agent config saved:', agentType, config);
            // You can add additional logic here to handle the saved config
          }}
        />

        {/* Session Share Modal */}
        {showSessionShare && (
          <SessionShareModal
            isOpen={showSessionShare}
            onClose={handleCloseSessionShare}
            session={sessionToShare}
            onSessionUpdated={() => {
              loadAllSessionsFromBackend();
            }}
          />
        )}
      </div>
    </ThemeContext.Provider>
  );
}

export default App; 