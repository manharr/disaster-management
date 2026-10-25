import React, { useState, useEffect } from 'react';
import { subscribeTeams, createTeam, updateTeamStatus } from '../features/teams/teamService';
import { Users, PlusCircle, Phone, ShieldCheck, Activity, CheckCircle, AlertCircle } from 'lucide-react';

export const TeamManagementPage = () => {
  const [teams, setTeams] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: '',
    specialty: 'Flood Rescue & Water Evacuation',
    leadName: '',
    contact: '',
    memberCount: 6,
    status: 'Available'
  });

  useEffect(() => {
    const unsub = subscribeTeams(setTeams);
    return () => unsub();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newTeam.name.trim() || !newTeam.leadName.trim()) {
      alert('Please fill in team name and commander name.');
      return;
    }
    await createTeam(newTeam);
    setShowCreateModal(false);
    setNewTeam({
      name: '',
      specialty: 'Flood Rescue & Water Evacuation',
      leadName: '',
      contact: '',
      memberCount: 6,
      status: 'Available'
    });
  };

  const handleToggleStatus = async (teamId, currentStatus) => {
    const nextStatus = currentStatus === 'Available' ? 'Dispatched' : currentStatus === 'Dispatched' ? 'Off-duty' : 'Available';
    await updateTeamStatus(teamId, nextStatus);
  };

  return (
    <div className="content-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Response Team Management</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Register, dispatch, and track specialized disaster response and rescue units.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <PlusCircle size={18} />
          <span>Register New Team</span>
        </button>
      </div>

      {/* Teams Grid */}
      <div className="grid-2">
        {teams.map(team => (
          <div key={team.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase' }}>
                    {team.id}
                  </span>
                  <h3 style={{ fontSize: '1.15rem', color: '#0f172a', margin: '2px 0' }}>{team.name}</h3>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{team.specialty}</div>
                </div>

                <span 
                  className={`badge ${team.status === 'Available' ? 'badge-status-resolved' : team.status === 'Dispatched' ? 'badge-status-in-progress' : 'badge-status-reported'}`}
                  style={{ textTransform: 'capitalize' }}
                >
                  {team.status}
                </span>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#64748b' }}>Team Commander:</span>
                  <span style={{ fontWeight: 600 }}>{team.leadName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#64748b' }}>Direct Comms:</span>
                  <span style={{ fontWeight: 600, color: '#1e3a8a' }}>{team.contact}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Operatives on Duty:</span>
                  <span style={{ fontWeight: 600 }}>{team.memberCount} Personnel</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Status: <strong>{team.status}</strong>
              </span>
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => handleToggleStatus(team.id, team.status)}
              >
                Cycle Status ({team.status === 'Available' ? 'Dispatch' : team.status === 'Dispatched' ? 'Set Off-duty' : 'Set Available'})
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleCreateSubmit}>
              <div className="card-header">
                <div className="card-title">
                  <Users size={20} color="#1e3a8a" />
                  <span>Register Response Unit</span>
                </div>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowCreateModal(false)}>✕</button>
              </div>

              <div className="form-group">
                <label className="form-label">Team Unit Name <span className="required">*</span></label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={newTeam.name} 
                  onChange={e => setNewTeam(prev => ({ ...prev, name: e.target.value }))} 
                  placeholder="e.g. NDRF Sector 4 Inundation Evacuation Unit"
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Operational Specialty</label>
                <select 
                  className="form-select" 
                  value={newTeam.specialty} 
                  onChange={e => setNewTeam(prev => ({ ...prev, specialty: e.target.value }))}
                >
                  <option value="Flood Rescue & Water Evacuation">Flood Rescue & Water Evacuation</option>
                  <option value="Fire Suppression & Chemical Hazard">Fire Suppression & Chemical Hazard</option>
                  <option value="Trauma & Medical Evacuation">Trauma & Medical Evacuation</option>
                  <option value="Building Collapse & Structural Safety">Building Collapse & Structural Safety</option>
                  <option value="Severe Storm & Debris Clearance">Severe Storm & Debris Clearance</option>
                </select>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Team Leader / Lead Officer <span className="required">*</span></label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={newTeam.leadName} 
                    onChange={e => setNewTeam(prev => ({ ...prev, leadName: e.target.value }))} 
                    placeholder="e.g. Major S. K. Nair"
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact / Comms Line</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={newTeam.contact} 
                    onChange={e => setNewTeam(prev => ({ ...prev, contact: e.target.value }))} 
                    placeholder="+91-98765-XXXXX"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Number of Deployed Personnel</label>
                <input 
                  type="number" 
                  min="2"
                  max="50"
                  className="form-input" 
                  value={newTeam.memberCount} 
                  onChange={e => setNewTeam(prev => ({ ...prev, memberCount: Number(e.target.value) }))} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Response Team</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
