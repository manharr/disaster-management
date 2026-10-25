import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { subscribeAllIncidents } from '../features/incidents/incidentService';
import { IoTSimulator } from '../features/sensors/IoTSimulator';
import { subscribeSensorReadings, subscribeSensorAlerts } from '../features/sensors/sensorService';
import { IncidentMap } from '../components/IncidentMap';
import { 
  ShieldAlert, 
  Cpu, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  ArrowRight,
  BellRing,
  MapPin,
  Clock,
  Plus
} from 'lucide-react';

export const LandingPage = () => {
  const { currentUser } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [readings, setReadings] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [simState, setSimState] = useState(IoTSimulator.getState());

  useEffect(() => {
    const unsubIncidents = subscribeAllIncidents(setIncidents);
    const unsubReadings = subscribeSensorReadings(setReadings, 10);
    const unsubAlerts = subscribeSensorAlerts(setAlerts);
    const unsubSim = IoTSimulator.subscribe(setSimState);

    return () => {
      unsubIncidents();
      unsubReadings();
      unsubAlerts();
      unsubSim();
    };
  }, []);

  const pendingCount = incidents.filter(i => i.status === 'Reported' || i.status === 'Under Review').length;
  const activeAlertsCount = alerts.filter(a => a.status === 'ACTIVE').length;

  return (
    <div className="content-body">
      {/* Sleek Command Center Header */}
      <div className="hero-banner">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 500, marginBottom: '0.65rem', color: '#93c5fd' }}>
          <MapPin size={13} color="#93c5fd" />
          <span>Mumbai Metropolitan Disaster Command & IoT Telemetry Grid</span>
        </div>
        <h1 className="hero-title">Cloud-Based Disaster Management & Emergency Response System</h1>
        <p className="hero-description">
          A cloud-based platform for reporting emergency incidents, managing disaster information, coordinating response teams, and tracking the status of rescue operations.
        </p>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <Link to="/report" className="btn btn-danger">
            <Plus size={15} />
            <span>Report Incident</span>
          </Link>
          <Link to="/sensors" className="btn btn-secondary">
            <Cpu size={15} />
            <span>IoT Sensors</span>
          </Link>
          <Link to="/admin/incidents" className="btn btn-outline" style={{ background: 'transparent', color: 'white', borderColor: 'rgba(255,255,255,0.25)' }}>
            <span>Incident Queue</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* KPI Status Strip */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon red">
            <ShieldAlert size={18} />
          </div>
          <div>
            <div className="stat-value">{incidents.length}</div>
            <div className="stat-label">Total Incidents</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <AlertTriangle size={18} />
          </div>
          <div>
            <div className="stat-value">{pendingCount}</div>
            <div className="stat-label">Pending Review</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <Cpu size={18} />
          </div>
          <div>
            <div className="stat-value">{simState.sensors.length}</div>
            <div className="stat-label">Mumbai IoT Nodes</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <Activity size={18} />
          </div>
          <div>
            <div className="stat-value">{simState.totalReadingsGenerated}</div>
            <div className="stat-label">Telemetry Packets</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon cyan">
            <CheckCircle size={18} />
          </div>
          <div>
            <div className="stat-value">{activeAlertsCount}</div>
            <div className="stat-label">Active Alerts</div>
          </div>
        </div>
      </div>

      {/* Active Sensor Alerts Banner if any */}
      {activeAlertsCount > 0 && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: '#dc2626', color: 'white', padding: '5px', borderRadius: '50%' }}>
              <BellRing size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#991b1b', fontSize: '0.85rem' }}>
                {activeAlertsCount} IoT Safety Threshold Breach(es) Active
              </div>
              <div style={{ fontSize: '0.75rem', color: '#b91c1c' }}>
                Simulated sensor values exceeded safety thresholds.
              </div>
            </div>
          </div>
          <Link to="/sensors" className="btn btn-danger btn-sm">
            Inspect Sensor Telemetry
          </Link>
        </div>
      )}

      {/* Main Operations Split: Active Incidents Table & Mumbai Map */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-header">
          <div className="card-title">
            <ShieldAlert size={17} color="#1e3a8a" />
            <span>Active Emergency Queue (Mumbai Metropolitan Region)</span>
          </div>
          <Link to={currentUser?.role === 'admin' ? '/admin/incidents' : '/report'} className="btn btn-outline btn-sm">
            <span>{currentUser?.role === 'admin' ? 'Manage Incidents' : 'New Report'}</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ref #</th>
                <th>Category</th>
                <th>Title</th>
                <th>Mumbai Location</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {incidents.slice(0, 5).map(inc => (
                <tr key={inc.id || inc.referenceNumber}>
                  <td style={{ fontWeight: 600, color: '#1e3a8a' }}>{inc.referenceNumber}</td>
                  <td style={{ textTransform: 'capitalize' }}>{inc.category.replace('_', ' ')}</td>
                  <td style={{ fontWeight: 500, maxWidth: '280px' }}>{inc.title}</td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{inc.location}</td>
                  <td>
                    <span className={`badge badge-priority-${inc.reportedSeverity.toLowerCase()}`}>
                      {inc.reportedSeverity}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-status-${inc.status.toLowerCase().replace(' ', '-')}`}>
                      {inc.status}
                    </span>
                  </td>
                  <td>
                    <Link to={`/tracking?ref=${inc.referenceNumber}`} className="btn btn-outline btn-sm" style={{ padding: '2px 8px', fontSize: '0.72rem' }}>
                      Track
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Geospatial Map */}
      <IncidentMap incidents={incidents} sensors={simState.sensors} />
    </div>
  );
};
