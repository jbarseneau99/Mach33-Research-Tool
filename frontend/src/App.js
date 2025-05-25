import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [apiStatus, setApiStatus] = useState('Checking...');

  useEffect(() => {
    // Try to connect to API
    const checkAPI = async () => {
      try {
        // This will be the actual API URL once deployed
        const response = await fetch('/api/health');
        if (response.ok) {
          setApiStatus('Connected ✅');
        } else {
          setApiStatus('API not ready yet 🔄');
        }
      } catch (error) {
        setApiStatus('API not ready yet 🔄');
      }
    };

    checkAPI();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🔬 Multi-Agent Research Platform</h1>
        <div className="welcome-card">
          <h2>Hello World! 🌍</h2>
          <p>Your research platform is now live on Google Cloud Run!</p>
          
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Frontend:</span>
              <span className="status-value">Running ✅</span>
            </div>
            <div className="status-item">
              <span className="status-label">API:</span>
              <span className="status-value">{apiStatus}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Worker:</span>
              <span className="status-value">Ready 🚀</span>
            </div>
          </div>

          <div className="features">
            <h3>🤖 AI Agents Ready:</h3>
            <ul>
              <li>Claude (Anthropic)</li>
              <li>ChatGPT (OpenAI)</li>
              <li>Grok (xAI)</li>
            </ul>
          </div>

          <div className="next-steps">
            <h3>🎯 Next Steps:</h3>
            <ol>
              <li>Add AI service API keys</li>
              <li>Build document upload interface</li>
              <li>Implement research workflows</li>
              <li>Deploy advanced features</li>
            </ol>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App; 