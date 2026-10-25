import React, { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { 
  subscribeAllIncidents, 
  verifyIncident, 
  rejectIncident, 
  assignTeamToIncident, 
  updateIncidentStatus 
} from '../features/incidents/incidentService';
import { subscribeTeams } from '../features/teams/teamService';
import { 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  UserCheck, 
  RefreshCw, 
  Filter, 
  Search,
  Eye,
  AlertTriangle
} from 'lucide-react';

export const IncidentManagementPage = () => {
  const { currentUser } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [activeIncident, setActiveIncident] = useState(null);
  const [modalMode, setModalMode] = useState(null); // 'VERIFY' | 'REJECT' | 'ASSIGN' | 'STATUS' | 'DETAILS'
  const [priorityInput, setPriorityInput] = useState('High');
  const [reviewNote, setReviewNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [newStatusInput, setNewStatusInput] = useState('In Progress');

  useEffect(() => {
    const unsubInc = subscribeAllIncidents(setIncidents);
    const unsubTeams = subscribeTeams(setTeams);
    return () => {
      unsubInc();
      unsubTeams();
    };
  }, []);

  const filtered = incidents.filter(inc => {
    const matchesStatus = statusFilter === 'ALL' ? true : inc.status === statusFilter;
    const matchesSearch = 
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleOpenModal = (incident, mode) => {
    setActiveIncident(incident);
    setModalMode(mode);
    setPriorityInput(incident.priority !== 'Pending Review' ? incident.priority : 'High');
    setReviewNote('');
    setRejectionReason('');
    setSelectedTeamId(teams[0]?.id || '');
    setNewStatusInput(incident.status);
  };

  const handleCloseModal = () => {
    setActiveIncident(null);
    setModalMode(null);
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!activeIncident) return;
    await verifyIncident(activeIncident.id, priorityInput, currentUser, reviewNote || 'Incident verified by command dispatcher.');
    handleCloseModal();
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      alert('Please state a reason for rejecting this emergency report.');
      return;
    }
    await rejectIncident(activeIncident.id, rejectionReason, currentUser);
    handleCloseModal();
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    const team = teams.find(t => t.id === selectedTeamId);
    if (!team) return;
    await assignTeamToIncident(activeIncident.id, team, currentUser, reviewNote);
    handleCloseModal();
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    await updateIncidentStatus(activeIncident.id, newStatusInput, currentUser, reviewNote);
    handleCloseModal();
  };

  return (
    <div className="content-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Incident Command & Dispatch Management</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Review, verify, prioritize, and dispatch specialized emergency teams.
          </p>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['ALL', 'Reported', 'Under Review', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Rejected'].map(s => (
              <button 
                key={s}
                className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setStatusFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search reference or title..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.2rem', fontSize: '0.85rem' }}
            />
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Reference #</th>
              <th>Category</th>
              <th>Title</th>
              <th>Reported Severity</th>
              <th>Admin Priority</th>
              <th>Status</th>
              <th>Assigned Unit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  No incident records match the current filter.
                </td>
              </tr>
            ) : (
              filtered.map(inc => (
                <tr key={inc.id || inc.referenceNumber}>
                  <td style={{ fontWeight: 700, color: '#1e3a8a' }}>{inc.referenceNumber}</td>
                  <td style={{ textTransform: 'capitalize' }}>{inc.category.replace('_', ' ')}</td>
                  <td style={{ fontWeight: 600, maxWidth: '240px' }}>{inc.title}</td>
                  <td>
                    <span className={`badge badge-priority-${inc.reportedSeverity.toLowerCase()}`}>
                      {inc.reportedSeverity}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-priority-${(inc.priority || 'medium').toLowerCase()}`}>
                      {inc.priority || 'Pending'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-status-${inc.status.toLowerCase().replace(' ', '-')}`}>
                      {inc.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: inc.assignedTeamName ? '#1e40af' : '#94a3b8' }}>
                    {inc.assignedTeamName || 'None'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button 
                        onClick={() => handleOpenModal(inc, 'DETAILS')}
                        className="btn btn-outline btn-sm"
                        title="View Full Details"
                        style={{ padding: '4px 6px' }}
                      >
                        <Eye size={14} />
                      </button>

                      {inc.status === 'Reported' || inc.status === 'Under Review' ? (
                        <>
                          <button 
                            onClick={() => handleOpenModal(inc, 'VERIFY')}
                            className="btn btn-success btn-sm"
                            title="Verify Report"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          >
                            Verify
                          </button>
                          <button 
                            onClick={() => handleOpenModal(inc, 'REJECT')}
                            className="btn btn-danger btn-sm"
                            title="Reject Report"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          >
                            Reject
                          </button>
                        </>
                      ) : null}

                      {inc.status === 'Verified' ? (
                        <button 
                          onClick={() => handleOpenModal(inc, 'ASSIGN')}
                          className="btn btn-primary btn-sm"
                          title="Assign Response Unit"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        >
                          Assign Unit
                        </button>
                      ) : null}

                      {inc.status === 'Assigned' || inc.status === 'In Progress' ? (
                        <button 
                          onClick={() => handleOpenModal(inc, 'STATUS')}
                          className="btn btn-outline btn-sm"
                          title="Update Status"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        >
                          Status
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Action Modals */}
      {modalMode && activeIncident && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            {/* 1. VERIFY MODAL */}
            {modalMode === 'VERIFY' && (
              <form onSubmit={handleVerifySubmit}>
                <div className="card-header">
                  <div className="card-title">
                    <CheckCircle size={20} color="#059669" />
                    <span>Verify Incident #{activeIncident.referenceNumber}</span>
                  </div>
                  <button type="button" className="btn btn-outline btn-sm" onClick={handleCloseModal}>✕</button>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{activeIncident.title}</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{activeIncident.location}</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Assign Priority <span className="required">*</span></label>
                  <select className="form-select" value={priorityInput} onChange={e => setPriorityInput(e.target.value)}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical (Immediate Deployment)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Verification Notes</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={reviewNote} 
                    onChange={e => setReviewNote(e.target.value)} 
                    placeholder="e.g. Confirmed with municipal warden and cross-referenced river sensor."
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-outline" onClick={handleCloseModal}>Cancel</button>
                  <button type="submit" className="btn btn-success">Confirm Verification</button>
                </div>
              </form>
            )}

            {/* 2. REJECT MODAL */}
            {modalMode === 'REJECT' && (
              <form onSubmit={handleRejectSubmit}>
                <div className="card-header">
                  <div className="card-title">
                    <XCircle size={20} color="#dc2626" />
                    <span>Reject Emergency Report #{activeIncident.referenceNumber}</span>
                  </div>
                  <button type="button" className="btn btn-outline btn-sm" onClick={handleCloseModal}>✕</button>
                </div>

                <div style={{ marginBottom: '1rem', background: '#fee2e2', padding: '0.75rem', borderRadius: '6px', color: '#991b1b', fontSize: '0.85rem' }}>
                  Rejection is recorded permanently in the incident audit trail and visible to the reporting citizen.
                </div>

                <div className="form-group">
                  <label className="form-label">Mandatory Rejection Reason <span className="required">*</span></label>
                  <textarea 
                    className="form-textarea" 
                    value={rejectionReason} 
                    onChange={e => setRejectionReason(e.target.value)} 
                    placeholder="State reason: e.g. Duplicate report of INC-2026-0041, insufficient or false location, non-emergency issue."
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-outline" onClick={handleCloseModal}>Cancel</button>
                  <button type="submit" className="btn btn-danger">Confirm Rejection</button>
                </div>
              </form>
            )}

            {/* 3. ASSIGN TEAM MODAL */}
            {modalMode === 'ASSIGN' && (
              <form onSubmit={handleAssignSubmit}>
                <div className="card-header">
                  <div className="card-title">
                    <UserCheck size={20} color="#2563eb" />
                    <span>Assign Response Team to #{activeIncident.referenceNumber}</span>
                  </div>
                  <button type="button" className="btn btn-outline btn-sm" onClick={handleCloseModal}>✕</button>
                </div>

                <div className="form-group">
                  <label className="form-label">Select Response Unit <span className="required">*</span></label>
                  <select className="form-select" value={selectedTeamId} onChange={e => setSelectedTeamId(e.target.value)}>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.specialty}) - Status: {t.status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Dispatch Instructions / Note</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={reviewNote} 
                    onChange={e => setReviewNote(e.target.value)} 
                    placeholder="e.g. Approach from Sector 12 North Gate due to flooded main road."
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-outline" onClick={handleCloseModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Dispatch Unit</button>
                </div>
              </form>
            )}

            {/* 4. UPDATE STATUS MODAL */}
            {modalMode === 'STATUS' && (
              <form onSubmit={handleStatusSubmit}>
                <div className="card-header">
                  <div className="card-title">
                    <RefreshCw size={20} color="#1e3a8a" />
                    <span>Update Incident Status</span>
                  </div>
                  <button type="button" className="btn btn-outline btn-sm" onClick={handleCloseModal}>✕</button>
                </div>

                <div className="form-group">
                  <label className="form-label">Target Status Stage</label>
                  <select className="form-select" value={newStatusInput} onChange={e => setNewStatusInput(e.target.value)}>
                    <option value="In Progress">In Progress (Active Rescue)</option>
                    <option value="Resolved">Resolved (Operation Concluded)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Operational Note</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={reviewNote} 
                    onChange={e => setReviewNote(e.target.value)} 
                    placeholder="e.g. Water receded, all evacuees transferred to emergency relief center."
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-outline" onClick={handleCloseModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Update Status</button>
                </div>
              </form>
            )}

            {/* 5. FULL DETAILS MODAL */}
            {modalMode === 'DETAILS' && (
              <div>
                <div className="card-header">
                  <div className="card-title">
                    <ShieldAlert size={20} color="#1e3a8a" />
                    <span>Incident Details #{activeIncident.referenceNumber}</span>
                  </div>
                  <button type="button" className="btn btn-outline btn-sm" onClick={handleCloseModal}>✕</button>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.15rem', color: '#0f172a' }}>{activeIncident.title}</h3>
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{activeIncident.location}</div>
                </div>

                <div className="grid-3" style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Category</div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{activeIncident.category}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Priority</div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{activeIncident.priority}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Status</div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{activeIncident.status}</div>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Description</div>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', marginTop: '4px' }}>
                    {activeIncident.description}
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                  <button type="button" className="btn btn-primary btn-sm" onClick={handleCloseModal}>Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
