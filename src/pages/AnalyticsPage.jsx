import React, { useState, useEffect } from 'react';
import { subscribeAllIncidents } from '../features/incidents/incidentService';
import { subscribeSensorAlerts, subscribeSensorReadings } from '../features/sensors/sensorService';
import { BarChart3, PieChart, Activity, ShieldAlert, Cpu, BellRing, Layers } from 'lucide-react';

export const AnalyticsPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [readings, setReadings] = useState([]);

  useEffect(() => {
    const unsubInc = subscribeAllIncidents(setIncidents);
    const unsubAlerts = subscribeSensorAlerts(setAlerts);
    const unsubReadings = subscribeSensorReadings(setReadings, 100);

    return () => {
      unsubInc();
      unsubAlerts();
      unsubReadings();
    };
  }, []);

  // Compute Category Distribution
  const categoryCounts = incidents.reduce((acc, inc) => {
    const cat = inc.category || 'other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  // Compute Status Distribution
  const statusCounts = incidents.reduce((acc, inc) => {
    const status = inc.status || 'Reported';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Compute Priority Distribution
  const priorityCounts = incidents.reduce((acc, inc) => {
    const prio = inc.priority || 'Pending';
    acc[prio] = (acc[prio] || 0) + 1;
    return acc;
  }, {});

  // Compute Sensor Alerts by Type
  const alertsByType = alerts.reduce((acc, a) => {
    const t = a.sensorType || 'unknown';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="content-body">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Operational Analytics & Intelligence</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Real-time aggregations calculated directly from Cloud Firestore incident records and IoT telemetry.
        </p>
      </div>

      {/* Top Level Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <ShieldAlert size={22} />
          </div>
          <div>
            <div className="stat-value">{incidents.length}</div>
            <div className="stat-label">Total Incidents</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon emerald">
            <Activity size={22} />
          </div>
          <div>
            <div className="stat-value">
              {incidents.length > 0 ? Math.round(((statusCounts['Resolved'] || 0) / incidents.length) * 100) : 0}%
            </div>
            <div className="stat-label">Resolution Rate</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <Cpu size={22} />
          </div>
          <div>
            <div className="stat-value">{readings.length}</div>
            <div className="stat-label">Ingested Readings</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">
            <BellRing size={22} />
          </div>
          <div>
            <div className="stat-value">{alerts.length}</div>
            <div className="stat-label">Threshold Alerts</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        {/* Incidents by Category */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <PieChart size={18} color="#1e3a8a" />
              <span>Incidents by Category</span>
            </div>
          </div>

          {incidents.length === 0 ? (
            <div className="empty-state">No incident data available</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {Object.entries(categoryCounts).map(([cat, count]) => {
                const percent = Math.round((count / incidents.length) * 100);
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{cat.replace('_', ' ')}</span>
                      <span style={{ color: '#64748b' }}>{count} ({percent}%)</span>
                    </div>
                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, height: '100%', background: '#2563eb', borderRadius: '4px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Incidents by Workflow Status */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <BarChart3 size={18} color="#1e3a8a" />
              <span>Incidents by Operational Status</span>
            </div>
          </div>

          {incidents.length === 0 ? (
            <div className="empty-state">No status data available</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {Object.entries(statusCounts).map(([status, count]) => {
                const percent = Math.round((count / incidents.length) * 100);
                return (
                  <div key={status}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                      <span className={`badge badge-status-${status.toLowerCase().replace(' ', '-')}`}>
                        {status}
                      </span>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>{count} ({percent}%)</span>
                    </div>
                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, height: '100%', background: '#059669', borderRadius: '4px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Priority & IoT Alerts Grid */}
      <div className="grid-2">
        {/* Priority Breakdown */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Layers size={18} color="#1e3a8a" />
              <span>Admin Priority Breakdown</span>
            </div>
          </div>

          {incidents.length === 0 ? (
            <div className="empty-state">No priority data available</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {['Critical', 'High', 'Medium', 'Low', 'Pending Review'].map(prio => {
                const count = priorityCounts[prio] || 0;
                const percent = incidents.length > 0 ? Math.round((count / incidents.length) * 100) : 0;
                return (
                  <div key={prio}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                      <span className={`badge badge-priority-${prio.toLowerCase().replace(' ', '-')}`}>
                        {prio}
                      </span>
                      <span style={{ color: '#64748b' }}>{count} ({percent}%)</span>
                    </div>
                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${percent}%`, 
                          height: '100%', 
                          background: prio === 'Critical' ? '#dc2626' : prio === 'High' ? '#d97706' : '#3b82f6',
                          borderRadius: '4px' 
                        }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sensor Alerts Breakdown */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <BellRing size={18} color="#dc2626" />
              <span>Sensor Threshold Alerts by Node Type</span>
            </div>
          </div>

          {alerts.length === 0 ? (
            <div className="empty-state">
              No threshold alerts recorded yet. Run an IoT scenario to populate.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {Object.entries(alertsByType).map(([type, count]) => {
                const percent = Math.round((count / alerts.length) * 100);
                return (
                  <div key={type}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{type} Sensor</span>
                      <span style={{ color: '#64748b' }}>{count} alerts ({percent}%)</span>
                    </div>
                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, height: '100%', background: '#dc2626', borderRadius: '4px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
