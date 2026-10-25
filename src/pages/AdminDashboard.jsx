import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { subscribeAllIncidents } from '../features/incidents/incidentService';
import { IoTSimulator } from '../features/sensors/IoTSimulator';
import { subscribeSensorAlerts, subscribeSensorReadings } from '../features/sensors/sensorService';
import { IncidentMap } from '../components/IncidentMap';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  Cpu, 
  Activity, 
  BellRing, 
  ArrowRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';

export const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [readings, setReadings] = useState([]);
  const [simState, setSimState] = useState(IoTSimulator.getState());

  useEffect(() => {
    const unsubIncidents = subscribeAllIncidents(setIncidents);
    const unsubAlerts = subscribeSensorAlerts(setAlerts);
    const unsubReadings = subscribeSensorReadings(setReadings, 20);
    const unsubSim = IoTSimulator.subscribe(setSimState);

    return () => {
      unsubIncidents();
      unsubAlerts();
      unsubReadings();
      unsubSim();
    };
  }, []);

  // Compute operational statistics from actual records
  const totalIncidents = incidents.length;
  const pendingReports = incidents.filter(i => i.status === 'Reported' || i.status === 'Under Review').length;
  const verifiedIncidents = incidents.filter(i => i.verificationState === 'Verified').length;
  const highPriorityIncidents = incidents.filter(i => i.priority === 'High' || i.priority === 'Critical').length;
  const assignedIncidents = incidents.filter(i => i.status === 'Assigned').length;
  const inProgressIncidents = incidents.filter(i => i.status === 'In Progress').length;
  const resolvedIncidents = incidents.filter(i => i.status === 'Resolved').length;

  const activeSensorsCount = simState.sensors.length;
  const totalReadings = simState.totalReadingsGenerated;
  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE').length;

  return (
    <div className="content-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', color: '#0f172a' }}>Command & Dispatch Center</h1>
          <p style={{ color: '#64748b', fontSize: '0.82rem' }}>
            Disaster Management Authority & Central Coordination Grid
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/incidents" className="btn btn-primary btn-sm">
            <FileCheck size={16} />
            <span>Manage Incidents ({pendingReports} Pending)</span>
          </Link>
          <Link to="/sensors" className="btn btn-secondary btn-sm">
            <Cpu size={16} />
            <span>IoT Telemetry Panel</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <ShieldAlert size={22} />
          </div>
          <div>
            <div className="stat-value">{totalIncidents}</div>
            <div className="stat-label">Total Incidents</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <Clock size={22} />
          </div>
          <div>
            <div className="stat-value">{pendingReports}</div>
            <div className="stat-label">Pending Verification</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <CheckCircle size={22} />
          </div>
          <div>
            <div className="stat-value">{verifiedIncidents}</div>
            <div className="stat-label">Verified Reports</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="stat-value">{highPriorityIncidents}</div>
            <div className="stat-label">High / Critical Priority</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon cyan">
            <Users size={22} />
          </div>
          <div>
            <div className="stat-value">{assignedIncidents + inProgressIncidents}</div>
            <div className="stat-label">Assigned / In Progress</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon emerald">
            <CheckCircle size={22} />
          </div>
          <div>
            <div className="stat-value">{resolvedIncidents}</div>
            <div className="stat-label">Resolved Operations</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <Cpu size={22} />
          </div>
          <div>
            <div className="stat-value">{activeSensorsCount}</div>
            <div className="stat-label">Active IoT Devices</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <Activity size={22} />
          </div>
          <div>
            <div className="stat-value">{totalReadings}</div>
            <div className="stat-label">Total Sensor Readings</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">
            <BellRing size={22} />
          </div>
          <div>
            <div className="stat-value">{activeAlerts}</div>
            <div className="stat-label">Active Sensor Alerts</div>
          </div>
        </div>
      </div>

      {/* Active Sensor Alerts Banner if any */}
      {activeAlerts > 0 && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="pulse-alert" style={{ background: '#dc2626', color: 'white', padding: '8px', borderRadius: '50%' }}>
              <BellRing size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#991b1b', fontSize: '0.95rem' }}>
                {activeAlerts} Simulated Sensor Safety Threshold Breach(es) Active
              </div>
              <div style={{ fontSize: '0.8rem', color: '#b91c1c' }}>
                Automated threshold detection triggered alerts requiring response verification.
              </div>
            </div>
          </div>
          <Link to="/sensor-alerts" className="btn btn-danger btn-sm">
            Review Alerts
          </Link>
        </div>
      )}

      {/* Pending Incidents Requiring Dispatch Action */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div className="card-title">
            <AlertTriangle size={20} color="#d97706" />
            <span>Incidents Awaiting Dispatch Verification ({pendingReports})</span>
          </div>
          <Link to="/admin/incidents" className="btn btn-outline btn-sm">
            <span>View All Incidents</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {incidents.filter(i => i.status === 'Reported' || i.status === 'Under Review').length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: '#059669', fontSize: '0.9rem' }}>
            ✓ All incoming reports have been verified or addressed. No pending verification queue.
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ref #</th>
                  <th>Category</th>
                  <th>Title</th>
                  <th>Reported Severity</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {incidents.filter(i => i.status === 'Reported' || i.status === 'Under Review').slice(0, 5).map(inc => (
                  <tr key={inc.id || inc.referenceNumber}>
                    <td style={{ fontWeight: 700, color: '#1e3a8a' }}>{inc.referenceNumber}</td>
                    <td style={{ textTransform: 'capitalize' }}>{inc.category.replace('_', ' ')}</td>
                    <td style={{ fontWeight: 600 }}>{inc.title}</td>
                    <td>
                      <span className={`badge badge-priority-${inc.reportedSeverity.toLowerCase()}`}>
                        {inc.reportedSeverity}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{inc.location}</td>
                    <td>
                      <span className={`badge badge-status-${inc.status.toLowerCase().replace(' ', '-')}`}>
                        {inc.status}
                      </span>
                    </td>
                    <td>
                      <Link to="/admin/incidents" className="btn btn-primary btn-sm" style={{ padding: '3px 8px', fontSize: '0.75rem' }}>
                        Review / Assign
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Incident & IoT Sensor Map */}
      <IncidentMap incidents={incidents} sensors={simState.sensors} />
    </div>
  );
};
