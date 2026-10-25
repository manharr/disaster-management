import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { subscribeCitizenIncidents } from '../features/incidents/incidentService';
import { FileText, Search, ExternalLink, PlusCircle, Filter } from 'lucide-react';

export const MyIncidentsPage = () => {
  const { currentUser } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeCitizenIncidents(currentUser.uid, setIncidents);
    return () => unsub();
  }, [currentUser]);

  const filtered = incidents.filter(inc => {
    const matchesStatus = 
      statusFilter === 'ALL' ? true :
      statusFilter === 'ACTIVE' ? (inc.status !== 'Resolved' && inc.status !== 'Rejected') :
      statusFilter === 'RESOLVED' ? inc.status === 'Resolved' : true;

    const matchesSearch = 
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.location.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="content-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>My Submitted Incidents</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Track and monitor the status of your reported emergencies.
          </p>
        </div>
        <Link to="/report" className="btn btn-danger">
          <PlusCircle size={18} />
          <span>Report New Incident</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className={`btn btn-sm ${statusFilter === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setStatusFilter('ALL')}
            >
              All Reports ({incidents.length})
            </button>
            <button 
              className={`btn btn-sm ${statusFilter === 'ACTIVE' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setStatusFilter('ACTIVE')}
            >
              Active Operations
            </button>
            <button 
              className={`btn btn-sm ${statusFilter === 'RESOLVED' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setStatusFilter('RESOLVED')}
            >
              Resolved
            </button>
          </div>

          <div style={{ position: 'relative', width: '260px' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by ref # or keyword..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.2rem', fontSize: '0.85rem' }}
            />
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No matching incident records found</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            Try adjusting your search query or submit a new emergency report.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference #</th>
                <th>Category</th>
                <th>Title</th>
                <th>Location</th>
                <th>Reported Date</th>
                <th>Assigned Unit</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inc => (
                <tr key={inc.id || inc.referenceNumber}>
                  <td style={{ fontWeight: 700, color: '#1e3a8a' }}>{inc.referenceNumber}</td>
                  <td style={{ textTransform: 'capitalize' }}>{inc.category.replace('_', ' ')}</td>
                  <td style={{ fontWeight: 600 }}>{inc.title}</td>
                  <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{inc.location}</td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {new Date(inc.createdAt).toLocaleString()}
                  </td>
                  <td style={{ fontSize: '0.82rem', color: inc.assignedTeamName ? '#1e40af' : '#94a3b8' }}>
                    {inc.assignedTeamName || 'Pending Dispatch'}
                  </td>
                  <td>
                    <span className={`badge badge-status-${inc.status.toLowerCase().replace(' ', '-')}`}>
                      {inc.status}
                    </span>
                  </td>
                  <td>
                    <Link 
                      to={`/tracking?ref=${inc.referenceNumber}`}
                      className="btn btn-outline btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <span>Track</span>
                      <ExternalLink size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
