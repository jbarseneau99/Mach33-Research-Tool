import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../utils/apiClient';
import './Modal.css';

const SessionShareModal = ({ isOpen, onClose, session }) => {
  const [activeTab, setActiveTab] = useState('share');
  const [participants, setParticipants] = useState([]);
  const [shareData, setShareData] = useState({
    targetUserId: '',
    permission: 'read'
  });
  const [inviteLink, setInviteLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const sessionId = session?.sessionId;
  const sessionName = session?.name || session?.title;

  const loadParticipants = useCallback(async () => {
    try {
      const participants = await apiClient.get(`/sessions/${sessionId}/participants`);
      setParticipants(participants);
    } catch (error) {
      console.error('Failed to load participants:', error);
    }
  }, [sessionId]);

  useEffect(() => {
    if (isOpen && sessionId) {
      loadParticipants();
    }
  }, [isOpen, sessionId, loadParticipants]);

  const handleShareWithUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await apiClient.post(`/sessions/${sessionId}/share`, shareData);
      if (response.success) {
        setMessage('Session shared successfully!');
        setShareData({ targetUserId: '', permission: 'read' });
        loadParticipants();
      } else {
        setMessage('Failed to share session: ' + response.message);
      }
    } catch (error) {
      setMessage('Error sharing session: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvite = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await apiClient.post(`/sessions/${sessionId}/invite`, {
        permission: shareData.permission
      });
      if (response.success) {
        const fullUrl = `${window.location.origin}/join/${response.inviteCode}`;
        setInviteLink(fullUrl);
        setMessage('Invite link generated successfully!');
      } else {
        setMessage('Failed to generate invite link');
      }
    } catch (error) {
      setMessage('Error generating invite: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveParticipant = async (userId) => {
    if (window.confirm('Are you sure you want to remove this participant?')) {
      try {
        const response = await apiClient.delete(`/sessions/${sessionId}/share/${userId}`);
        if (response.success) {
          setMessage('Participant removed successfully');
          loadParticipants();
        } else {
          setMessage('Failed to remove participant');
        }
      } catch (error) {
        setMessage('Error removing participant: ' + error.message);
      }
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage('Copied to clipboard!');
    } catch (error) {
      setMessage('Failed to copy to clipboard');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay session-share-modal">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Share Session: {sessionName}</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-tabs">
          <button 
            className={`tab-btn ${activeTab === 'share' ? 'active' : ''}`}
            onClick={() => setActiveTab('share')}
          >
            Share with User
          </button>
          <button 
            className={`tab-btn ${activeTab === 'invite' ? 'active' : ''}`}
            onClick={() => setActiveTab('invite')}
          >
            Invite Link
          </button>
          <button 
            className={`tab-btn ${activeTab === 'participants' ? 'active' : ''}`}
            onClick={() => setActiveTab('participants')}
          >
            Participants ({participants.length})
          </button>
        </div>

        <div className="modal-content">
          {message && (
            <div className={`message ${message.includes('Error') || message.includes('Failed') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          {activeTab === 'share' && (
            <div className="share-tab">
              <form onSubmit={handleShareWithUser}>
                <div className="form-group">
                  <label>User ID:</label>
                  <input
                    type="text"
                    value={shareData.targetUserId}
                    onChange={(e) => setShareData({...shareData, targetUserId: e.target.value})}
                    placeholder="Enter user ID"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Permission Level:</label>
                  <select
                    value={shareData.permission}
                    onChange={(e) => setShareData({...shareData, permission: e.target.value})}
                  >
                    <option value="read">Read Only</option>
                    <option value="write">Read & Write</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <button type="submit" disabled={loading} className="primary-btn">
                  {loading ? 'Sharing...' : 'Share Session'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'invite' && (
            <div className="invite-tab">
              <div className="form-group">
                <label>Permission Level for Invite:</label>
                <select
                  value={shareData.permission}
                  onChange={(e) => setShareData({...shareData, permission: e.target.value})}
                >
                  <option value="read">Read Only</option>
                  <option value="write">Read & Write</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button onClick={handleGenerateInvite} disabled={loading} className="primary-btn">
                {loading ? 'Generating...' : 'Generate Invite Link'}
              </button>

              {inviteLink && (
                <div className="invite-link-container">
                  <label>Invite Link:</label>
                  <div className="invite-link-box">
                    <input type="text" value={inviteLink} readOnly />
                    <button onClick={() => copyToClipboard(inviteLink)} className="copy-btn">
                      Copy
                    </button>
                  </div>
                  <p className="help-text">
                    Share this link with others to give them access to the session.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'participants' && (
            <div className="participants-tab">
              <div className="participants-list">
                {participants.map((participant) => (
                  <div key={participant.userId} className="participant-item">
                    <div className="participant-info">
                      <strong>{participant.userId}</strong>
                      <span className={`permission-badge ${participant.permission}`}>
                        {participant.permission}
                      </span>
                      {participant.isOwner && <span className="owner-badge">Owner</span>}
                    </div>
                    <div className="participant-meta">
                      <span>Joined: {new Date(participant.joinedAt).toLocaleDateString()}</span>
                      <span className={`status ${participant.status}`}>{participant.status}</span>
                    </div>
                    {!participant.isOwner && (
                      <button 
                        onClick={() => handleRemoveParticipant(participant.userId)}
                        className="remove-btn"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="secondary-btn">Close</button>
        </div>
      </div>
    </div>
  );
};

export default SessionShareModal; 