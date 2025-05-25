import React, { useState, useEffect } from 'react';
import './ResearchStatementManager.css';
import { apiCall } from '../config';

const ResearchStatementManager = ({ sessionId, onStatementCreated }) => {
  const [statements, setStatements] = useState([]);
  const [activeStatement, setActiveStatement] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showRefineForm, setShowRefineForm] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [newStatement, setNewStatement] = useState({
    originalStatement: '',
    type: 'EXPLORATORY'
  });
  
  const [refinementData, setRefinementData] = useState({
    refinedStatement: '',
    refinementNotes: ''
  });
  
  const [generatedSubquestions, setGeneratedSubquestions] = useState([]);

  useEffect(() => {
    if (sessionId) {
      loadStatements();
      loadActiveStatement();
    }
  }, [sessionId]);

  const loadStatements = async () => {
    try {
      const response = await apiCall(`/research-statements/session/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setStatements(data);
      }
    } catch (error) {
      console.error('Error loading statements:', error);
    }
  };

  const loadActiveStatement = async () => {
    try {
      const response = await fetch(`/api/research-statements/session/${sessionId}/active`);
      if (response.ok) {
        const data = await response.json();
        setActiveStatement(data);
      }
    } catch (error) {
      console.error('Error loading active statement:', error);
    }
  };

  const createStatement = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await apiCall('/research-statements', {
        method: 'POST',
        body: JSON.stringify({
          ...newStatement,
          sessionId
        }),
      });
      
      if (response.ok) {
        const statement = await response.json();
        setStatements([statement, ...statements]);
        setNewStatement({ originalStatement: '', type: 'EXPLORATORY' });
        setShowCreateForm(false);
        
        // Set as active if it's the first statement
        if (!activeStatement) {
          await updateStatementStatus(statement.id, 'ACTIVE');
          setActiveStatement(statement);
        }
        
        if (onStatementCreated) {
          onStatementCreated(statement);
        }
      }
    } catch (error) {
      console.error('Error creating statement:', error);
    } finally {
      setLoading(false);
    }
  };

  const refineStatement = async (statementId) => {
    setLoading(true);
    
    try {
      const response = await fetch(`/api/research-statements/${statementId}/refine`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(refinementData),
      });
      
      if (response.ok) {
        const updatedStatement = await response.json();
        setStatements(statements.map(s => s.id === statementId ? updatedStatement : s));
        setShowRefineForm(null);
        setRefinementData({ refinedStatement: '', refinementNotes: '' });
      }
    } catch (error) {
      console.error('Error refining statement:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSubquestions = async (statement) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/research-statements/generate-subquestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          researchStatement: statement.refinedStatement || statement.originalStatement
        }),
      });
      
      if (response.ok) {
        const subquestions = await response.json();
        setGeneratedSubquestions(subquestions);
      }
    } catch (error) {
      console.error('Error generating subquestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSubquestions = async (statementId, subquestions) => {
    try {
      const response = await fetch(`/api/research-statements/${statementId}/subquestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subquestions }),
      });
      
      if (response.ok) {
        const updatedStatement = await response.json();
        setStatements(statements.map(s => s.id === statementId ? updatedStatement : s));
        setGeneratedSubquestions([]);
      }
    } catch (error) {
      console.error('Error adding subquestions:', error);
    }
  };

  const updateStatementStatus = async (statementId, status) => {
    try {
      const response = await fetch(`/api/research-statements/${statementId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (response.ok) {
        const updatedStatement = await response.json();
        setStatements(statements.map(s => s.id === statementId ? updatedStatement : s));
        
        if (status === 'ACTIVE') {
          setActiveStatement(updatedStatement);
        }
      }
    } catch (error) {
      console.error('Error updating statement status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return '#27ae60';
      case 'REFINED': return '#3498db';
      case 'COMPLETED': return '#9b59b6';
      case 'ARCHIVED': return '#95a5a6';
      default: return '#f39c12';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'EXPLORATORY': return '#e74c3c';
      case 'SPECIFIC': return '#3498db';
      case 'HYPOTHESIS': return '#9b59b6';
      case 'RESEARCH_QUESTION': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  return (
    <div className="research-statement-manager">
      <div className="statement-header">
        <h3>Research Statements</h3>
        <button 
          className="btn-primary"
          onClick={() => setShowCreateForm(true)}
          disabled={loading}
        >
          + New Statement
        </button>
      </div>

      {/* Active Statement Display */}
      {activeStatement && (
        <div className="active-statement">
          <h4>Current Research Focus</h4>
          <div className="statement-card active">
            <div className="statement-meta">
              <span className="statement-type" style={{ backgroundColor: getTypeColor(activeStatement.type) }}>
                {activeStatement.type}
              </span>
              <span className="statement-status" style={{ backgroundColor: getStatusColor(activeStatement.status) }}>
                {activeStatement.status}
              </span>
            </div>
            <p className="statement-text">
              {activeStatement.refinedStatement || activeStatement.originalStatement}
            </p>
            {activeStatement.subquestions && activeStatement.subquestions.length > 0 && (
              <div className="subquestions">
                <h5>Research Subquestions:</h5>
                <ul>
                  {activeStatement.subquestions.map((q, index) => (
                    <li key={index}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Statement Form */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h4>Create Research Statement</h4>
              <button onClick={() => setShowCreateForm(false)}>×</button>
            </div>
            <form onSubmit={createStatement}>
              <div className="form-group">
                <label>Research Statement:</label>
                <textarea
                  value={newStatement.originalStatement}
                  onChange={(e) => setNewStatement({...newStatement, originalStatement: e.target.value})}
                  placeholder="Enter your research statement or question..."
                  required
                  rows={4}
                />
              </div>
              <div className="form-group">
                <label>Type:</label>
                <select
                  value={newStatement.type}
                  onChange={(e) => setNewStatement({...newStatement, type: e.target.value})}
                >
                  <option value="EXPLORATORY">Exploratory</option>
                  <option value="SPECIFIC">Specific</option>
                  <option value="HYPOTHESIS">Hypothesis</option>
                  <option value="RESEARCH_QUESTION">Research Question</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateForm(false)}>Cancel</button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Statement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Statements List */}
      <div className="statements-list">
        {statements.map((statement) => (
          <div key={statement.id} className="statement-card">
            <div className="statement-meta">
              <span className="statement-type" style={{ backgroundColor: getTypeColor(statement.type) }}>
                {statement.type}
              </span>
              <span className="statement-status" style={{ backgroundColor: getStatusColor(statement.status) }}>
                {statement.status}
              </span>
              <span className="statement-date">
                {new Date(statement.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <p className="statement-text">
              {statement.refinedStatement || statement.originalStatement}
            </p>
            
            {statement.refinedStatement && statement.originalStatement !== statement.refinedStatement && (
              <details className="original-statement">
                <summary>Original Statement</summary>
                <p>{statement.originalStatement}</p>
              </details>
            )}
            
            {statement.subquestions && statement.subquestions.length > 0 && (
              <div className="subquestions">
                <h5>Subquestions ({statement.subquestions.length}):</h5>
                <ul>
                  {statement.subquestions.map((q, index) => (
                    <li key={index}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="statement-actions">
              <button onClick={() => setShowRefineForm(statement.id)}>Refine</button>
              <button onClick={() => generateSubquestions(statement)}>Generate Subquestions</button>
              {statement.status !== 'ACTIVE' && (
                <button onClick={() => updateStatementStatus(statement.id, 'ACTIVE')}>
                  Set Active
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Refine Statement Form */}
      {showRefineForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h4>Refine Research Statement</h4>
              <button onClick={() => setShowRefineForm(null)}>×</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); refineStatement(showRefineForm); }}>
              <div className="form-group">
                <label>Refined Statement:</label>
                <textarea
                  value={refinementData.refinedStatement}
                  onChange={(e) => setRefinementData({...refinementData, refinedStatement: e.target.value})}
                  placeholder="Enter the refined version of your research statement..."
                  required
                  rows={4}
                />
              </div>
              <div className="form-group">
                <label>Refinement Notes:</label>
                <textarea
                  value={refinementData.refinementNotes}
                  onChange={(e) => setRefinementData({...refinementData, refinementNotes: e.target.value})}
                  placeholder="Explain what changes you made and why..."
                  rows={3}
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowRefineForm(null)}>Cancel</button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Refining...' : 'Refine Statement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generated Subquestions */}
      {generatedSubquestions.length > 0 && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h4>Generated Subquestions</h4>
              <button onClick={() => setGeneratedSubquestions([])}>×</button>
            </div>
            <div className="subquestions-preview">
              <p>AI-generated subquestions for your research:</p>
              <ul>
                {generatedSubquestions.map((q, index) => (
                  <li key={index}>{q}</li>
                ))}
              </ul>
            </div>
            <div className="form-actions">
              <button onClick={() => setGeneratedSubquestions([])}>Cancel</button>
              <button 
                onClick={() => {
                  const statement = statements.find(s => showRefineForm === s.id) || activeStatement;
                  if (statement) {
                    addSubquestions(statement.id, generatedSubquestions);
                  }
                }}
              >
                Add These Subquestions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchStatementManager; 