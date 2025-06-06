import React, { useState, useEffect } from 'react';
import './App.css';
import ResearchStatementManager from './components/ResearchStatementManager';
import EvidenceManager from './components/EvidenceManager';
import ChatInterface from './components/ChatInterface';
import { apiCall } from './config';

function App() {
  const [apiStatus, setApiStatus] = useState('Checking...');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [currentSession, setCurrentSession] = useState(null);
  const [statementStats, setStatementStats] = useState(null);
  const [evidenceStats, setEvidenceStats] = useState(null);

  useEffect(() => {
    const checkAPI = async () => {
      try {
        const response = await apiCall('/health');
        if (response.ok) {
          setApiStatus('Connected ✅');
        } else {
          setApiStatus('Disconnected ❌');
        }
      } catch (error) {
        setApiStatus('Disconnected ❌');
      }
    };

    // Restore session from localStorage on app load
    const restoreSession = () => {
      const savedSession = localStorage.getItem('currentSession');
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);
          setCurrentSession(session);
          loadStatementStats(session.id);
          loadEvidenceStats(session.id);
          console.log('Restored session:', session.id);
        } catch (error) {
          console.error('Error restoring session:', error);
          localStorage.removeItem('currentSession');
        }
      }
    };

    checkAPI();
    restoreSession();
  }, []);

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const startNewSession = () => {
    const sessionId = `session-${Date.now()}`;
    const newSession = {
      id: sessionId,
      name: 'New Research Session',
      created: new Date().toLocaleString(),
      status: 'Active'
    };
    
    setCurrentSession(newSession);
    // Save session to localStorage
    localStorage.setItem('currentSession', JSON.stringify(newSession));
    
    setActiveSection('chat');
    loadStatementStats(sessionId);
    loadEvidenceStats(sessionId);
    console.log('Started new session:', sessionId);
  };

  const loadStatementStats = async (sessionId) => {
    try {
      const response = await apiCall(`/research-statements/session/${sessionId}/statistics`);
      if (response.ok) {
        const stats = await response.json();
        setStatementStats(stats);
      }
    } catch (error) {
      console.error('Error loading statement statistics:', error);
    }
  };

  const loadEvidenceStats = async (sessionId) => {
    try {
      const response = await apiCall(`/evidence/session/${sessionId}/statistics`);
      if (response.ok) {
        const stats = await response.json();
        setEvidenceStats(stats);
      }
    } catch (error) {
      console.error('Error loading evidence statistics:', error);
    }
  };

  const clearSession = () => {
    setCurrentSession(null);
    setStatementStats(null);
    setEvidenceStats(null);
    localStorage.removeItem('currentSession');
    setActiveSection('dashboard');
    console.log('Session cleared');
  };

  return (
    <div className="app-container">
      {/* Top Bar */}
      <header className="top-bar">
        <div className="header-left">
          <img src="/33fg_Logo.png" alt="Mach33" className="logo" />
          <h1>Multi-Agent Research Platform</h1>
        </div>
        <div className="header-center">
          {currentSession && (
            <div className="current-session">
              <span className="session-name">{currentSession.name}</span>
              <span className="session-status">{currentSession.status}</span>
            </div>
          )}
        </div>
        <div className="header-right">
          <div className="api-status">{apiStatus}</div>
          <button className="settings-btn">⚙️</button>
        </div>
      </header>

      <div className="main-layout">
        {/* Left Sidebar */}
        <aside className="left-sidebar">
          <nav className="nav-menu">
            <button 
              className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleSectionChange('dashboard')}
            >
              📊 Dashboard
            </button>
            <button 
              className="nav-item new-session-btn"
              onClick={startNewSession}
            >
              🔬 New Research Session
            </button>
            <button 
              className={`nav-item ${activeSection === 'chat' ? 'active' : ''}`}
              onClick={() => handleSectionChange('chat')}
            >
              💬 Research Chat
            </button>
            <button 
              className={`nav-item ${activeSection === 'documents' ? 'active' : ''}`}
              onClick={() => handleSectionChange('documents')}
            >
              📚 Documents
            </button>
            <button 
              className={`nav-item ${activeSection === 'agents' ? 'active' : ''}`}
              onClick={() => handleSectionChange('agents')}
            >
              🤖 AI Agents
            </button>
          </nav>

          <div className="session-history">
            <h3>Recent Sessions</h3>
            {currentSession ? (
              <div className="session-item active">
                <div className="session-name">{currentSession.name}</div>
                <div className="session-time">{currentSession.created}</div>
              </div>
            ) : (
              <div className="no-sessions">No active sessions</div>
            )}
          </div>
        </aside>

        {/* Main Content Panel */}
        <main className="main-content">
          {activeSection === 'dashboard' && (
            <div className="dashboard">
              <h2>Research Dashboard</h2>
              <div className="dashboard-grid">
                <div className="dashboard-card">
                  <h3>Active Sessions</h3>
                  <div className="metric">{currentSession ? '1' : '0'}</div>
                </div>
                <div className="dashboard-card">
                  <h3>Documents Processed</h3>
                  <div className="metric">0</div>
                </div>
                <div className="dashboard-card">
                  <h3>AI Interactions</h3>
                  <div className="metric">0</div>
                </div>
                <div className="dashboard-card">
                  <h3>Research Artifacts</h3>
                  <div className="metric">0</div>
                </div>
              </div>
              
              <div className="quick-actions">
                <h3>Quick Actions</h3>
                <button className="action-btn primary" onClick={startNewSession}>
                  Start New Research Session
                </button>
                <button className="action-btn">Upload Document</button>
                <button className="action-btn">View Reports</button>
              </div>
            </div>
          )}

          {activeSection === 'chat' && (
            <div className="chat-section">
              {/* Research Statement Management */}
              {currentSession && (
                <ResearchStatementManager 
                  sessionId={currentSession.id}
                  onStatementCreated={(statement) => {
                    console.log('New research statement created:', statement);
                    loadStatementStats(currentSession.id);
                  }}
                />
              )}

              {/* Evidence Management */}
              {currentSession && (
                <EvidenceManager 
                  sessionId={currentSession.id}
                  onEvidenceCreated={(evidence) => {
                    console.log('New evidence created:', evidence);
                    loadEvidenceStats(currentSession.id);
                  }}
                />
              )}
              
              {/* AI Chat Interface */}
              {currentSession && (
                <ChatInterface sessionId={currentSession.id} />
              )}
              
              {!currentSession && (
                <div className="no-session-message">
                  <p>Please start a new session to begin chatting with AI agents.</p>
                  <button onClick={startNewSession} className="btn-primary">
                    Start New Session
                  </button>
                </div>
              )}
            </div>
          )}

          {activeSection === 'documents' && (
            <div className="documents-panel">
              <h2>Document Library</h2>
              <div className="upload-area">
                <div className="upload-box">
                  <div className="upload-icon">📄</div>
                  <p>Drag and drop documents here or click to upload</p>
                  <button className="upload-btn">Choose Files</button>
                </div>
              </div>
              <div className="document-list">
                <p>No documents uploaded yet</p>
              </div>
            </div>
          )}

          {activeSection === 'agents' && (
            <div className="agents-panel">
              <h2>AI Agents</h2>
              <div className="agents-grid">
                <div className="agent-card">
                  <h3>Claude (Anthropic)</h3>
                  <div className="agent-status online">Online</div>
                  <p>Advanced reasoning and analysis</p>
                </div>
                <div className="agent-card">
                  <h3>ChatGPT (OpenAI)</h3>
                  <div className="agent-status online">Online</div>
                  <p>Conversational AI and research assistance</p>
                </div>
                <div className="agent-card">
                  <h3>Grok (xAI)</h3>
                  <div className="agent-status online">Online</div>
                  <p>Real-time information and analysis</p>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar */}
        <aside className="right-sidebar">
          <div className="research-context">
            <h3>Research Context</h3>
            {currentSession ? (
              <div className="context-info">
                <div className="context-item">
                  <label>Session:</label>
                  <span>{currentSession.name}</span>
                </div>
                <div className="context-item">
                  <label>Status:</label>
                  <span>{currentSession.status}</span>
                </div>
                <div className="context-item">
                  <label>Created:</label>
                  <span>{currentSession.created}</span>
                </div>
                <div className="context-item">
                  <label>Session ID:</label>
                  <span style={{fontSize: '0.8em', color: '#666'}}>{currentSession.id}</span>
                </div>
                <button 
                  onClick={clearSession}
                  style={{
                    marginTop: '10px',
                    padding: '5px 10px',
                    background: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8em'
                  }}
                >
                  Clear Session
                </button>
              </div>
            ) : (
              <p>No active session</p>
            )}
          </div>

          <div className="artifacts-panel">
            <h3>Research Statements</h3>
            <div className="artifact-types">
              <div className="artifact-type">
                <span className="artifact-label">Total Statements</span>
                <span className="artifact-count">{statementStats?.totalStatements || 0}</span>
              </div>
              <div className="artifact-type">
                <span className="artifact-label">Exploratory</span>
                <span className="artifact-count">{statementStats?.exploratoryCount || 0}</span>
              </div>
              <div className="artifact-type">
                <span className="artifact-label">Specific</span>
                <span className="artifact-count">{statementStats?.specificCount || 0}</span>
              </div>
              <div className="artifact-type">
                <span className="artifact-label">Hypotheses</span>
                <span className="artifact-count">{statementStats?.hypothesisCount || 0}</span>
              </div>
              <div className="artifact-type">
                <span className="artifact-label">Active</span>
                <span className="artifact-count">{statementStats?.activeCount || 0}</span>
              </div>
              <div className="artifact-type">
                <span className="artifact-label">Refined</span>
                <span className="artifact-count">{statementStats?.refinedCount || 0}</span>
              </div>
            </div>
          </div>

          <div className="artifacts-panel">
            <h3>Evidence Artifacts</h3>
            <div className="artifact-types">
              <div className="artifact-type">
                <span className="artifact-label">Total Evidence</span>
                <span className="artifact-count">{evidenceStats?.totalEvidence || 0}</span>
              </div>
              <div className="artifact-type">
                <span className="artifact-label">Primary</span>
                <span className="artifact-count">{evidenceStats?.primaryCount || 0}</span>
              </div>
              <div className="artifact-type">
                <span className="artifact-label">Secondary</span>
                <span className="artifact-count">{evidenceStats?.secondaryCount || 0}</span>
              </div>
              <div className="artifact-type">
                <span className="artifact-label">Tertiary</span>
                <span className="artifact-count">{evidenceStats?.tertiaryCount || 0}</span>
              </div>
              <div className="artifact-type">
                <span className="artifact-label">Avg Reliability</span>
                <span className="artifact-count">{evidenceStats ? Math.round(evidenceStats.averageReliability * 100) + '%' : '0%'}</span>
              </div>
              <div className="artifact-type">
                <span className="artifact-label">Linked</span>
                <span className="artifact-count">{evidenceStats?.linkedCount || 0}</span>
              </div>
            </div>
          </div>

          <div className="quick-tools">
            <h3>Tools</h3>
            <button className="tool-btn">Export Session</button>
            <button className="tool-btn">Generate Report</button>
            <button className="tool-btn">Save Notes</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App; 