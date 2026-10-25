import React, { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { subscribeTeamIncidents, addProgressNote, updateIncidentStatus } from '../features/incidents/incidentService';
import { UserCheck, MapPin, Send, CheckCircle2, Clock, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

export const ResponseTeamDashboard = () => {
  const { currentUser } = useAuth();
  const currentTeamId = currentUser?.teamId || 'TEAM-FL-01';
  const [teamIncidents, setTeamIncidents] = useState([]);
  
  // Note inputs per incident
  const [noteInputs, setNoteInputs] = useState({});
  const [submittingNote, setSubmittingNote] = useState({});

  useEffect(() => {
    const unsub = subscribeTeamIncidents(currentTeamId, setTeamIncidents);
    return () => unsub();
  }, [currentTeamId]);

  const handleNoteChange = (incId, text) => {
    setNoteInputs(prev => ({ ...prev, [incId]: text }));
  };

  const handlePostNote = async (incidentId) => {
    const text = noteInputs[incidentId];
    if (!text || !text.trim()) return;

    setSubmittingNote(prev => ({ ...prev, [incidentId]: true }));
    try {
      await addProgressNote(incidentId, text.trim(), currentUser?.displayName || 'Rescue Operative');
      setNoteInputs(prev => ({ ...prev, [incidentId]: '' }));
    } finally {
      setSubmittingNote(prev => ({ ...prev, [incidentId]: false }));
    }
  };

  const handleSetStatus = async (incidentId, newStatus) => {
    await updateIncidentStatus(incidentId, newStatus, currentUser, `Team marked status as ${newStatus}`);
  };

  return (
    <div className="content-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Field Response Operations Portal</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Unit: <strong>{currentUser?.teamName || 'Rapid Flood Rescue Alpha'}</strong> [{currentTeamId}]
          </p>
        </div>

        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '6px 14px', borderRadius: '20px', color: '#065f46', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Activity size={16} />
          <span>Field Operative Active</span>
        </div>
      </div>

      {teamIncidents.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No Incidents Currently Assigned</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '460px', margin: '0 auto' }}>
            All operations assigned to unit {currentTeamId} are resolved or central dispatch has not assigned any active incidents.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {teamIncidents.map(inc => {
            const isResolved = inc.status === 'Resolved';
            return (
              <div key={inc.id || inc.referenceNumber} className="card" style={{ borderLeft: `4px solid ${isResolved ? '#059669' : '#2563eb'}` }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
                      <span className="badge badge-status-reported">{inc.referenceNumber}</span>
                      <span className={`badge badge-priority-${(inc.priority || 'high').toLowerCase()}`}>
                        Priority: {inc.priority || 'High'}
                      </span>
                      <span className={`badge badge-status-${inc.status.toLowerCase().replace(' ', '-')}`}>
                        {inc.status}
                      </span>
                    </div>
                    <h2 style={{ fontSize: '1.3rem', color: '#0f172a' }}>{inc.title}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
                      <MapPin size={14} color="#dc2626" />
                      <span>{inc.location}</span>
                      {inc.latitude && inc.longitude && (
                        <span style={{ color: '#3b82f6' }}>({inc.latitude}, {inc.longitude})</span>
                      )}
                    </div>
                  </div>

                  {/* Operational Status Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {inc.status !== 'In Progress' && !isResolved && (
                      <button 
                        onClick={() => handleSetStatus(inc.id, 'In Progress')}
                        className="btn btn-primary btn-sm"
                      >
                        Start Operations (In Progress)
                      </button>
                    )}
                    {!isResolved && (
                      <button 
                        onClick={() => handleSetStatus(inc.id, 'Resolved')}
                        className="btn btn-success btn-sm"
                      >
                        <CheckCircle2 size={14} />
                        <span>Mark Resolved</span>
                      </button>
                    )}
                    {isResolved && (
                      <span style={{ color: '#059669', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={16} />
                        <span>Rescue Operation Concluded</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Citizen Situation Report */}
                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', fontSize: '0.88rem', color: '#334155', marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '2px', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    On-Scene Threat Report
                  </div>
                  <div>{inc.description}</div>
                </div>

                {/* Notes Stream */}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.85rem', color: '#1e3a8a', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                    Field Situation Progress Notes ({inc.progressNotes?.length || 0})
                  </h4>

                  {(!inc.progressNotes || inc.progressNotes.length === 0) ? (
                    <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                      No on-site field notes posted yet. Post real-time tactical updates below.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                      {inc.progressNotes.map((pn, i) => (
                        <div key={i} style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '0.65rem 0.85rem', borderRadius: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>
                            <span>{pn.author}</span>
                            <span>{new Date(pn.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#0c4a6e', marginTop: '2px' }}>
                            {pn.note}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Progress Note Box */}
                  {!isResolved && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Log on-site tactical update: e.g. Rescue dinghies in water, 12 residents evacuated to school shelter..." 
                        value={noteInputs[inc.id] || ''} 
                        onChange={e => handleNoteChange(inc.id, e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handlePostNote(inc.id)}
                        style={{ fontSize: '0.85rem' }}
                      />
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handlePostNote(inc.id)}
                        disabled={submittingNote[inc.id]}
                        style={{ flexShrink: 0 }}
                      >
                        <Send size={14} />
                        <span>Log Note</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
