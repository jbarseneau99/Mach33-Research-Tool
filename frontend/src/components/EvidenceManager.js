import React, { useState, useEffect } from 'react';
import './EvidenceManager.css';

const EvidenceManager = ({ sessionId, onEvidenceCreated }) => {
  const [evidence, setEvidence] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(null);
  const [showReliabilityForm, setShowReliabilityForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedEvidence, setExtractedEvidence] = useState([]);
  
  // Form states
  const [newEvidence, setNewEvidence] = useState({
    content: '',
    type: 'PRIMARY',
    source: ''
  });
  
  const [linkData, setLinkData] = useState({
    claimId: '',
    linkType: 'SUPPORTS'
  });
  
  const [reliabilityData, setReliabilityData] = useState({
    score: 0.5,
    reason: ''
  });
  
  const [extractText, setExtractText] = useState('');

  useEffect(() => {
    if (sessionId) {
      loadEvidence();
    }
  }, [sessionId]);

  const loadEvidence = async () => {
    try {
      const response = await fetch(`/api/evidence/session/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setEvidence(data);
      }
    } catch (error) {
      console.error('Error loading evidence:', error);
    }
  };

  const createEvidence = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/evidence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newEvidence,
          sessionId
        }),
      });
      
      if (response.ok) {
        const evidenceItem = await response.json();
        setEvidence([evidenceItem, ...evidence]);
        setNewEvidence({ content: '', type: 'PRIMARY', source: '' });
        setShowCreateForm(false);
        
        if (onEvidenceCreated) {
          onEvidenceCreated(evidenceItem);
        }
      }
    } catch (error) {
      console.error('Error creating evidence:', error);
    } finally {
      setLoading(false);
    }
  };

  const linkToClaim = async (evidenceId) => {
    setLoading(true);
    
    try {
      const response = await fetch(`/api/evidence/${evidenceId}/link-claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(linkData),
      });
      
      if (response.ok) {
        const updatedEvidence = await response.json();
        setEvidence(evidence.map(e => e.id === evidenceId ? updatedEvidence : e));
        setShowLinkForm(null);
        setLinkData({ claimId: '', linkType: 'SUPPORTS' });
      }
    } catch (error) {
      console.error('Error linking evidence:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReliability = async (evidenceId) => {
    setLoading(true);
    
    try {
      const response = await fetch(`/api/evidence/${evidenceId}/reliability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reliabilityData),
      });
      
      if (response.ok) {
        const updatedEvidence = await response.json();
        setEvidence(evidence.map(e => e.id === evidenceId ? updatedEvidence : e));
        setShowReliabilityForm(null);
        setReliabilityData({ score: 0.5, reason: '' });
      }
    } catch (error) {
      console.error('Error updating reliability:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractEvidence = async () => {
    if (!extractText.trim()) return;
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/evidence/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: extractText }),
      });
      
      if (response.ok) {
        const extracted = await response.json();
        setExtractedEvidence(extracted);
      }
    } catch (error) {
      console.error('Error extracting evidence:', error);
    } finally {
      setLoading(false);
    }
  };

  const createFromExtracted = async (content) => {
    const evidenceItem = {
      content,
      type: 'SECONDARY',
      source: 'Extracted from text'
    };
    
    try {
      const response = await fetch('/api/evidence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...evidenceItem,
          sessionId
        }),
      });
      
      if (response.ok) {
        const newEvidenceItem = await response.json();
        setEvidence([newEvidenceItem, ...evidence]);
        setExtractedEvidence(extractedEvidence.filter(e => e !== content));
        
        if (onEvidenceCreated) {
          onEvidenceCreated(newEvidenceItem);
        }
      }
    } catch (error) {
      console.error('Error creating evidence from extracted:', error);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'PRIMARY': return '#27ae60';
      case 'SECONDARY': return '#3498db';
      case 'TERTIARY': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  const getReliabilityColor = (score) => {
    if (score >= 0.8) return '#27ae60';
    if (score >= 0.6) return '#f39c12';
    if (score >= 0.4) return '#e67e22';
    return '#e74c3c';
  };

  const getLinkTypeColor = (linkType) => {
    switch (linkType) {
      case 'SUPPORTS': return '#27ae60';
      case 'CONTRADICTS': return '#e74c3c';
      case 'PARTIAL': return '#f39c12';
      case 'NEUTRAL': return '#95a5a6';
      default: return '#95a5a6';
    }
  };

  return (
    <div className="evidence-manager">
      <div className="evidence-header">
        <h3>Evidence Management</h3>
        <div className="header-actions">
          <button 
            className="btn-secondary"
            onClick={() => setShowCreateForm(true)}
            disabled={loading}
          >
            + Add Evidence
          </button>
        </div>
      </div>

      {/* Evidence Extraction */}
      <div className="evidence-extraction">
        <h4>Extract Evidence from Text</h4>
        <div className="extraction-form">
          <textarea
            value={extractText}
            onChange={(e) => setExtractText(e.target.value)}
            placeholder="Paste text here to automatically extract potential evidence..."
            rows={4}
          />
          <button 
            onClick={extractEvidence}
            disabled={loading || !extractText.trim()}
            className="btn-primary"
          >
            {loading ? 'Extracting...' : 'Extract Evidence'}
          </button>
        </div>
        
        {extractedEvidence.length > 0 && (
          <div className="extracted-evidence">
            <h5>Extracted Evidence ({extractedEvidence.length} items):</h5>
            {extractedEvidence.map((item, index) => (
              <div key={index} className="extracted-item">
                <p>{item}</p>
                <button 
                  onClick={() => createFromExtracted(item)}
                  className="btn-small"
                >
                  Add as Evidence
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Evidence Form */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h4>Add Evidence</h4>
              <button onClick={() => setShowCreateForm(false)}>×</button>
            </div>
            <form onSubmit={createEvidence}>
              <div className="form-group">
                <label>Evidence Content:</label>
                <textarea
                  value={newEvidence.content}
                  onChange={(e) => setNewEvidence({...newEvidence, content: e.target.value})}
                  placeholder="Enter the evidence content..."
                  required
                  rows={4}
                />
              </div>
              <div className="form-group">
                <label>Evidence Type:</label>
                <select
                  value={newEvidence.type}
                  onChange={(e) => setNewEvidence({...newEvidence, type: e.target.value})}
                >
                  <option value="PRIMARY">Primary (Direct observation/data)</option>
                  <option value="SECONDARY">Secondary (Analysis/interpretation)</option>
                  <option value="TERTIARY">Tertiary (Summary/compilation)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Source:</label>
                <input
                  type="text"
                  value={newEvidence.source}
                  onChange={(e) => setNewEvidence({...newEvidence, source: e.target.value})}
                  placeholder="Source of the evidence (journal, website, etc.)"
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateForm(false)}>Cancel</button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Add Evidence'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Evidence List */}
      <div className="evidence-list">
        {evidence.map((item) => (
          <div key={item.id} className="evidence-card">
            <div className="evidence-meta">
              <span 
                className="evidence-type" 
                style={{ backgroundColor: getTypeColor(item.type) }}
              >
                {item.type}
              </span>
              <div 
                className="reliability-score"
                style={{ backgroundColor: getReliabilityColor(item.reliabilityScore) }}
              >
                {Math.round(item.reliabilityScore * 100)}% reliable
              </div>
              <span className="evidence-date">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <div className="evidence-content">
              <p>{item.content}</p>
              <div className="evidence-source">
                <strong>Source:</strong> {item.source}
              </div>
            </div>
            
            {item.linkedClaims && item.linkedClaims.length > 0 && (
              <div className="linked-claims">
                <h5>Linked Claims:</h5>
                {item.linkedClaims.map((link, index) => (
                  <div key={index} className="claim-link">
                    <span 
                      className="link-type"
                      style={{ backgroundColor: getLinkTypeColor(link.linkType) }}
                    >
                      {link.linkType}
                    </span>
                    <span className="claim-id">Claim #{link.claimId}</span>
                    <span className="link-strength">
                      {Math.round(link.strength * 100)}% strength
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {item.tags && item.tags.length > 0 && (
              <div className="evidence-tags">
                {item.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            )}
            
            <div className="evidence-actions">
              <button onClick={() => setShowLinkForm(item.id)}>Link to Claim</button>
              <button onClick={() => setShowReliabilityForm(item.id)}>Update Reliability</button>
            </div>
          </div>
        ))}
      </div>

      {/* Link to Claim Form */}
      {showLinkForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h4>Link Evidence to Claim</h4>
              <button onClick={() => setShowLinkForm(null)}>×</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); linkToClaim(showLinkForm); }}>
              <div className="form-group">
                <label>Claim ID:</label>
                <input
                  type="number"
                  value={linkData.claimId}
                  onChange={(e) => setLinkData({...linkData, claimId: e.target.value})}
                  placeholder="Enter the ID of the claim/statement"
                  required
                />
              </div>
              <div className="form-group">
                <label>Link Type:</label>
                <select
                  value={linkData.linkType}
                  onChange={(e) => setLinkData({...linkData, linkType: e.target.value})}
                >
                  <option value="SUPPORTS">Supports</option>
                  <option value="CONTRADICTS">Contradicts</option>
                  <option value="PARTIAL">Partially Supports</option>
                  <option value="NEUTRAL">Neutral</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowLinkForm(null)}>Cancel</button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Linking...' : 'Link Evidence'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Reliability Form */}
      {showReliabilityForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h4>Update Reliability Score</h4>
              <button onClick={() => setShowReliabilityForm(null)}>×</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); updateReliability(showReliabilityForm); }}>
              <div className="form-group">
                <label>Reliability Score (0-1):</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={reliabilityData.score}
                  onChange={(e) => setReliabilityData({...reliabilityData, score: parseFloat(e.target.value)})}
                />
                <span className="score-display">{Math.round(reliabilityData.score * 100)}%</span>
              </div>
              <div className="form-group">
                <label>Reason for Update:</label>
                <textarea
                  value={reliabilityData.reason}
                  onChange={(e) => setReliabilityData({...reliabilityData, reason: e.target.value})}
                  placeholder="Explain why you're updating the reliability score..."
                  rows={3}
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowReliabilityForm(null)}>Cancel</button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Reliability'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvidenceManager; 