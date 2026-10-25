import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { subscribeCitizenIncidents } from '../features/incidents/incidentService';
import { 
  AlertTriangle, 
  FileText, 
  CheckCircle, 
  Clock, 
  PlusCircle, 
  ArrowRight,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

export const CitizenDashboard = () => {
  const { currentUser } = useAuth();
  const [myIncidents, setMyIncidents] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeCitizenIncidents(currentUser.uid, setMyIncidents);
    return () => unsub();
  }, [currentUser]);

  const activeReports = myIncidents.filter(i => i.status !== 'Resolved' && i.status !== 'Rejected');
  const resolvedReports = myIncidents.filter(i => i.status === 'Resolved');
  const underReviewReports = myIncidents.filter(i => i.status === 'Reported' || i.status === 'Under Review');

  return (
    <div className="content-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', color: '#0f172a' }}>Citizen Emergency Dashboard</h1>
          <p style={{ color: '#64748b', fontSize: '0.82rem' }}>
            Logged in as <strong>{currentUser?.displayName || 'Citizen'}</strong> ({currentUser?.email})
          </p>
        </div>
        <Link to="/report" className="btn btn-danger btn-sm">
          <PlusCircle size={15} />
          <span>Report Incident</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <FileText size={24} />
          </div>
          <div>
            <div className="stat-value">{myIncidents.length}</div>
            <div className="stat-label">Total Submitted</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <Clock size={24} />
          </div>
          <div>
            <div className="stat-value">{underReviewReports.length}</div>
            <div className="stat-label">Pending Verification</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="stat-value">{activeReports.length}</div>
            <div className="stat-label">Active / In Progress</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon emerald">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="stat-value">{resolvedReports.length}</div>
            <div className="stat-label">Resolved Operations</div>
          </div>
        </div>
      </div>

      {/* Recent Incidents Section */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <ShieldAlert size={20} color="#1e3a8a" />
            <span>My Submitted Emergency Incidents</span>
          </div>
          <Link to="/my-incidents" className="btn btn-outline btn-sm">
            <span>View All</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {myIncidents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No incidents reported yet</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
              You have not submitted any emergency incident reports.
            </p>
            <Link to="/report" className="btn btn-primary btn-sm">
              Submit Your First Incident
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ref #</th>
                  <th>Category</th>
                  <th>Incident Title</th>
                  <th>Location</th>
                  <th>Reported</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {myIncidents.slice(0, 5).map(inc => (
                  <tr key={inc.id || inc.referenceNumber}>
                    <td style={{ fontWeight: 700, color: '#1e3a8a' }}>{inc.referenceNumber}</td>
                    <td style={{ textTransform: 'capitalize' }}>{inc.category.replace('_', ' ')}</td>
                    <td style={{ fontWeight: 600 }}>{inc.title}</td>
                    <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{inc.location}</td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {new Date(inc.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`badge badge-status-${inc.status.toLowerCase().replace(' ', '-')}`}>
                        {inc.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/tracking?ref=${inc.referenceNumber}`} className="btn btn-outline btn-sm" style={{ padding: '3px 8px', fontSize: '0.75rem' }}>
                        Track
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
