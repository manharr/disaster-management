import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { subscribeAllIncidents, STATUS_STAGES } from '../features/incidents/incidentService';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldAlert, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  FileText
} from 'lucide-react';

export const IncidentTrackingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const refParam = searchParams.get('ref') || '';

  const [searchInput, setSearchInput] = useState(refParam);
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);

  useEffect(() => {
    const unsub = subscribeAllIncidents(setIncidents);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (refParam && incidents.length > 0) {
      const match = incidents.find(i => i.referenceNumber?.toLowerCase() === refParam.toLowerCase());
      if (match) setSelectedIncident(match);
    } else if (!refParam && incidents.length > 0 && !selectedIncident) {
      // Default to first incident
      setSelectedIncident(incidents[0]);
    }
  }, [refParam, incidents]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setSearchParams({ ref: searchInput.trim() });
    const match = incidents.find(i => i.referenceNumber?.toLowerCase() === searchInput.trim().toLowerCase());
    setSelectedIncident(match || null);
  };

  const getWorkflowStepIndex = (status) => {
    const idx = STATUS_STAGES.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  const activeIndex = selectedIncident ? getWorkflowStepIndex(selectedIncident.status) : 0;
  const isRejected = selectedIncident?.status === 'Rejected';

  return (
    <div className="content-body" style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.35rem', color: '#0f172a' }}>Live Incident Tracking</h1>
        <p style={{ color: '#64748b', fontSize: '0.82rem' }}>
          Real-time rescue lifecycle status, dispatcher verification, and on-site responder notes.
        </p>
      </div>

      {/* Reference Number Lookup Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Enter reference number (e.g. INC-2026-0041)..." 
              value={searchInput} 
              onChange={e => setSearchInput(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '10px' }} />
          </div>
          <button type="submit" className="btn btn-primary">
            Track Incident
          </button>
        </form>
      </div>

      {selectedIncident ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main Status Header Card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge badge-status-reported" style={{ marginBottom: '0.35rem' }}>
                  {selectedIncident.referenceNumber}
                </span>
                <h2 style={{ fontSize: '1.35rem', color: '#0f172a' }}>{selectedIncident.title}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
                  <MapPin size={14} color="#dc2626" />
                  <span>{selectedIncident.location}</span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Current Stage</div>
                <span className={`badge badge-status-${selectedIncident.status.toLowerCase().replace(' ', '-')}`} style={{ fontSize: '0.85rem', padding: '4px 10px' }}>
                  {selectedIncident.status}
                </span>
              </div>
            </div>

            {/* Workflow Progress Stepper */}
            <div style={{ margin: '1.5rem 0' }}>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                Incident Lifecycle Progress
              </h4>

              {isRejected ? (
                <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', padding: '1rem', borderRadius: '8px', color: '#991b1b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem' }}>
                    <AlertCircle size={20} />
                    <span>Report Rejected by Administrator</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                    <strong>Recorded Reason:</strong> {selectedIncident.rejectionReason || 'Duplicate or invalid emergency submission.'}
                  </div>
                </div>
              ) : (
                <div className="workflow-stepper">
                  {STATUS_STAGES.map((stage, idx) => {
                    const isCompleted = idx < activeIndex;
                    const isCurrent = idx === activeIndex;
                    return (
                      <div key={stage} className={`workflow-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''}`}>
                        <div className="step-node">
                          {isCompleted ? '✓' : idx + 1}
                        </div>
                        <div className="step-text">{stage}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Metadata Grid */}
            <div className="grid-3" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Category</div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', textTransform: 'capitalize' }}>
                  {selectedIncident.category.replace('_', ' ')}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Reported Severity</div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  {selectedIncident.reportedSeverity}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Assigned Response Unit</div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e40af' }}>
                  {selectedIncident.assignedTeamName || 'Pending Dispatch'}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.4rem' }}>Citizen Statement</h4>
              <p style={{ fontSize: '0.9rem', color: '#1e293b', background: '#ffffff', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                {selectedIncident.description}
              </p>
            </div>
          </div>

          {/* Timeline of Status History & Notes */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Clock size={18} color="#1e3a8a" />
                <span>Audit Trail & Operational Timeline</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
              {(selectedIncident.statusHistory || []).map((hist, index) => (
                <div key={index} style={{ display: 'flex', gap: '1rem', borderLeft: '2px solid #3b82f6', paddingLeft: '1rem', position: 'relative' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6', position: 'absolute', left: '-6px', top: '4px' }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>{hist.status}</span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(hist.timestamp).toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Actor: {hist.changedBy}</div>
                    {hist.note && (
                      <div style={{ fontSize: '0.82rem', color: '#334155', background: '#f8fafc', padding: '6px 10px', borderRadius: '4px', marginTop: '4px' }}>
                        {hist.note}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Response Team Progress Notes */}
            {selectedIncident.progressNotes && selectedIncident.progressNotes.length > 0 && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#1e3a8a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserCheck size={16} />
                  <span>On-Site Responders Progress Updates</span>
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedIncident.progressNotes.map((pn, idx) => (
                    <div key={idx} style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '0.75rem', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#0369a1', fontWeight: 600, marginBottom: '2px' }}>
                        <span>{pn.author}</span>
                        <span>{new Date(pn.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#0c4a6e' }}>
                        {pn.note}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card empty-state">
          <div className="empty-state-icon">🔎</div>
          <h3>Incident Not Found</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            No incident matches reference number "{searchInput}".
          </p>
        </div>
      )}
    </div>
  );
};
