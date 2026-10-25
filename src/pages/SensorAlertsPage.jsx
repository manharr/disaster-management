import React, { useState, useEffect } from 'react';
import { subscribeSensorAlerts, subscribeSensorReadings, acknowledgeAlert } from '../features/sensors/sensorService';
import { BellRing, CheckCircle, AlertTriangle, ShieldAlert, Clock, Filter, Eye } from 'lucide-react';

export const SensorAlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [readings, setReadings] = useState([]);
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    const unsubAlerts = subscribeSensorAlerts(setAlerts);
    const unsubReadings = subscribeSensorReadings(setReadings, 50);

    return () => {
      unsubAlerts();
      unsubReadings();
    };
  }, []);

  const handleAcknowledge = async (alertId) => {
    await acknowledgeAlert(alertId, 'Verified and acknowledged by central dispatcher.');
  };

  const filteredReadings = readings.filter(r => {
    if (filterType === 'ALL') return true;
    return r.sensorType === filterType;
  });

  return (
    <div className="content-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Sensor Alerts & Telemetry History</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Autonomous safety threshold detection records and historical telemetry stream.
          </p>
        </div>
      </div>

      {/* Threshold Breach Alerts Feed */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <div className="card-title">
            <BellRing size={20} color="#dc2626" />
            <span>Active Threshold Breach Alerts ({alerts.filter(a => a.status === 'ACTIVE').length})</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Debounced State Machine Protection Enabled
          </span>
        </div>

        {alerts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔔</div>
            <h3>No safety threshold alerts triggered</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              All simulated sensors are operating within nominal thresholds. To trigger a demonstration alert, go to the IoT Simulator and click <strong>Trigger Rising Water Scenario</strong>.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {alerts.map(alert => {
              const isActive = alert.status === 'ACTIVE';
              return (
                <div 
                  key={alert.id}
                  style={{
                    background: isActive ? '#fef2f2' : '#f8fafc',
                    border: `1px solid ${isActive ? '#fca5a5' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    padding: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{ background: isActive ? '#dc2626' : '#94a3b8', color: 'white', padding: '6px', borderRadius: '50%', marginTop: '2px' }}>
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                          [{alert.sensorId}] {alert.sensorName}
                        </span>
                        <span className={`badge ${isActive ? 'badge-priority-critical' : 'badge-status-resolved'}`}>
                          {alert.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '2px' }}>
                        {alert.message}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                        Location: {alert.simulatedLocation} • Triggered: {alert.createdAt ? new Date(alert.createdAt).toLocaleString() : 'Recent'}
                      </div>
                      {alert.adminNotes && (
                        <div style={{ fontSize: '0.75rem', color: '#047857', marginTop: '2px', fontWeight: 500 }}>
                          ✓ {alert.adminNotes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    {isActive ? (
                      <button 
                        onClick={() => handleAcknowledge(alert.id)}
                        className="btn btn-outline btn-sm"
                        style={{ borderColor: '#dc2626', color: '#dc2626' }}
                      >
                        Acknowledge Alert
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={14} />
                        <span>Acknowledged</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Historical Sensor Telemetry Log */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Clock size={20} color="#1e3a8a" />
            <span>Historical Sensor Reading Stream</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className={`btn btn-sm ${filterType === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterType('ALL')}
            >
              All Types
            </button>
            <button 
              className={`btn btn-sm ${filterType === 'water-level' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterType('water-level')}
            >
              Water Level
            </button>
            <button 
              className={`btn btn-sm ${filterType === 'temperature' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterType('temperature')}
            >
              Temperature
            </button>
            <button 
              className={`btn btn-sm ${filterType === 'smoke' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterType('smoke')}
            >
              Smoke
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Logged At</th>
                <th>Device ID</th>
                <th>Type</th>
                <th>Value</th>
                <th>Threshold</th>
                <th>State</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {filteredReadings.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>
                    No telemetry records available for this filter.
                  </td>
                </tr>
              ) : (
                filteredReadings.map((r, idx) => (
                  <tr key={r.id || idx}>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {r.timestamp ? new Date(r.timestamp).toLocaleTimeString() : 'Recent'}
                    </td>
                    <td style={{ fontWeight: 700, color: '#1e3a8a' }}>{r.sensorId}</td>
                    <td style={{ textTransform: 'capitalize' }}>{r.sensorType}</td>
                    <td style={{ fontWeight: 700, color: r.status === 'CRITICAL' ? '#dc2626' : '#0f172a' }}>
                      {r.readingValue} {r.unit}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{r.threshold} {r.unit}</td>
                    <td>
                      <span className={`badge ${r.status === 'CRITICAL' ? 'badge-priority-critical' : 'badge-priority-low'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{r.simulatedLocation}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
