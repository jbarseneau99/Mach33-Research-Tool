import React, { useState, useEffect } from 'react';
import './App.css';
import ResearchStatementManager from './components/ResearchStatementManager';

function App() {
  const [apiStatus, setApiStatus] = useState('Checking...');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [currentSession, setCurrentSession] = useState(null);
  const [statementStats, setStatementStats] = useState(null);

  useEffect(() => {
    const checkAPI = async () => {
      try {
        const response = await fetch('/api/health');
        if (response.ok) {
          setApiStatus('Connected ✅');
        } else {
          setApiStatus('Disconnected ❌');
        }
      } catch (error) {
        setApiStatus('Disconnected ❌');
      }
    };

    checkAPI();
  }, []);

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const startNewSession = () => {
    const sessionId = `session-${Date.now()}`;
    setCurrentSession({
      id: sessionId,
      name: 'New Research Session',
      created: new Date().toLocaleString(),
      status: 'Active'
    });
    setActiveSection('chat');
    loadStatementStats(sessionId);
  };

  const loadStatementStats = async (sessionId) => {
    try {
      const response = await fetch(`/api/research-statements/session/${sessionId}/statistics`);
      if (response.ok) {
        const stats = await response.json();
        setStatementStats(stats);
      }
    } catch (error) {
      console.error('Error loading statement statistics:', error);
    }
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
            <div className="chat-interface">
              <div className="chat-header">
                <h2>Research Chat</h2>
                <div className="active-agents">
                  <span className="agent claude">Claude</span>
                  <span className="agent chatgpt">ChatGPT</span>
                  <span className="agent grok">Grok</span>
                </div>
              </div>
              
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
              
              <div className="chat-messages">
                <div className="message system">
                  <div className="message-content">
                    Welcome to your research session! Start by creating a research statement above, then ask questions and the AI agents will collaborate to help you.
                  </div>
                </div>
              </div>
              
              <div className="chat-input">
                <input 
                  type="text" 
                  placeholder="Ask your research question..."
                  className="message-input"
                />
                <button className="send-btn">Send</button>
              </div>
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