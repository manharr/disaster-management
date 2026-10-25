import React, { useState, useEffect } from 'react';
import { IoTSimulator } from '../features/sensors/IoTSimulator';
import { subscribeSensorReadings } from '../features/sensors/sensorService';
import { WorkflowVisualizer } from '../components/WorkflowVisualizer';
import { 
  Play, 
  Square, 
  RotateCcw, 
  AlertTriangle, 
  Waves, 
  Flame, 
  Activity, 
  Cpu, 
  Clock, 
  MapPin, 
  CheckCircle,
  Database
} from 'lucide-react';

export const IoTSensorMonitoringPage = () => {
  const [simState, setSimState] = useState(IoTSimulator.getState());
  const [recentReadings, setRecentReadings] = useState([]);
  const [selectedInterval, setSelectedInterval] = useState(IoTSimulator.intervalSeconds);

  useEffect(() => {
    const unsubSim = IoTSimulator.subscribe(setSimState);
    const unsubReadings = subscribeSensorReadings(setRecentReadings, 15);

    return () => {
      unsubSim();
      unsubReadings();
    };
  }, []);

  const handleToggleSimulation = () => {
    if (simState.isRunning) {
      IoTSimulator.stop();
    } else {
      IoTSimulator.start();
    }
  };

  const handleIntervalChange = (e) => {
    const sec = Number(e.target.value);
    setSelectedInterval(sec);
    IoTSimulator.setIntervalSeconds(sec);
  };

  const handleScenario = (scenario) => {
    IoTSimulator.setScenario(scenario);
    if (!simState.isRunning) {
      IoTSimulator.start();
    }
  };

  const handleReset = () => {
    IoTSimulator.resetScenario();
  };

  const getSensorIcon = (type) => {
    switch (type) {
      case 'water-level': return Waves;
      case 'temperature': return Flame;
      case 'smoke': return Activity;
      default: return Cpu;
    }
  };

  return (
    <div className="content-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', color: '#0f172a' }}>IoT Sensor Telemetry Simulator</h1>
          <p style={{ color: '#64748b', fontSize: '0.82rem' }}>
            Virtual sensor simulation engine modeling telemetry streaming and safety threshold alerts.
          </p>
        </div>

        {/* Global Simulator Switch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button 
            className={`btn ${simState.isRunning ? 'btn-danger' : 'btn-success'}`}
            onClick={handleToggleSimulation}
          >
            {simState.isRunning ? (
              <>
                <Square size={14} />
                <span>Stop Engine</span>
              </>
            ) : (
              <>
                <Play size={14} />
                <span>Start Engine</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Simulator Control Panel */}
      <div className="card" style={{ marginBottom: '1.5rem', background: '#ffffff' }}>
        <div className="card-header">
          <div className="card-title">
            <Cpu size={20} color="#1e3a8a" />
            <span>Simulator Engine Configuration</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
            <span style={{ color: '#64748b' }}>Status:</span>
            <span style={{ fontWeight: 700, color: simState.isRunning ? '#059669' : '#dc2626' }}>
              {simState.isRunning ? '● RUNNING' : '○ PAUSED'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Interval Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Clock size={16} color="#64748b" />
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
              Telemetry Frequency:
            </label>
            <select 
              className="form-select" 
              value={selectedInterval} 
              onChange={handleIntervalChange}
              style={{ width: 'auto', padding: '0.4rem 0.75rem' }}
            >
              <option value={3}>Fast (3 Seconds) - Presentation</option>
              <option value={5}>Medium (5 Seconds)</option>
              <option value={10}>Standard (10 Seconds) - Default</option>
              <option value={30}>Eco (30 Seconds) - Quota Saver</option>
            </select>
          </div>

          {/* Scenario Triggers */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button 
              className={`btn btn-sm ${simState.activeScenario === 'RISING_WATER' ? 'btn-danger' : 'btn-outline'}`}
              onClick={() => handleScenario('RISING_WATER')}
            >
              <Waves size={14} />
              <span>🌊 Surge Flood Scenario</span>
            </button>
            <button 
              className={`btn btn-sm ${simState.activeScenario === 'WILDFIRE' ? 'btn-danger' : 'btn-outline'}`}
              onClick={() => handleScenario('WILDFIRE')}
            >
              <Flame size={14} />
              <span>🔥 Wildfire & Smoke Scenario</span>
            </button>
            <button 
              className="btn btn-outline btn-sm"
              onClick={handleReset}
            >
              <RotateCcw size={14} />
              <span>Reset Baseline</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visual Workflow Banner */}
      <WorkflowVisualizer activeStep={simState.isRunning ? 3 : 0} />

      {/* Virtual Sensor Hardware Gauges */}
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#0f172a' }}>
        Virtual Hardware Telemetry Nodes ({simState.sensors.length})
      </h2>

      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        {simState.sensors.map(sensor => {
          const IconComponent = getSensorIcon(sensor.type);
          const percentOfThreshold = Math.min(100, Math.round((sensor.currentValue / sensor.threshold) * 100));
          const isCritical = sensor.status === 'CRITICAL';
          const isWarning = sensor.status === 'WARNING';

          return (
            <div key={sensor.id} className={`sensor-card ${isCritical ? 'alert-state pulse-alert' : ''}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ background: isCritical ? '#fee2e2' : '#eff6ff', color: isCritical ? '#dc2626' : '#2563eb', padding: '8px', borderRadius: '8px' }}>
                    <IconComponent size={22} />
                  </div>
                  <div>
                    <span className="simulation-tag">{sensor.id}</span>
                    <h3 style={{ fontSize: '1.05rem', color: '#0f172a', margin: '2px 0' }}>{sensor.name}</h3>
                  </div>
                </div>

                <span className={`badge ${isCritical ? 'badge-priority-critical' : isWarning ? 'badge-priority-high' : 'badge-priority-low'}`}>
                  {sensor.status}
                </span>
              </div>

              {/* Gauge Value Display */}
              <div className="sensor-gauge-value" style={{ color: isCritical ? '#dc2626' : '#0f172a' }}>
                {sensor.currentValue} <span style={{ fontSize: '1.1rem', fontWeight: 500, color: '#64748b' }}>{sensor.unit}</span>
              </div>

              {/* Threshold Progress Bar */}
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>
                  <span>Safety Threshold: <strong>{sensor.threshold} {sensor.unit}</strong></span>
                  <span>{percentOfThreshold}%</span>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${percentOfThreshold}%`, 
                      height: '100%', 
                      background: isCritical ? '#dc2626' : isWarning ? '#d97706' : '#059669',
                      transition: 'width 0.5s ease-out'
                    }} 
                  />
                </div>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                <MapPin size={12} color="#94a3b8" />
                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{sensor.location}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Stream of Ingested Readings */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Database size={20} color="#1e3a8a" />
            <span>Real-Time Cloud Telemetry Ingestion Log</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Packets Ingested: <strong>{simState.totalReadingsGenerated}</strong>
          </span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Packet Timestamp</th>
                <th>Sensor Node</th>
                <th>Sensor Type</th>
                <th>Telemetry Value</th>
                <th>Threshold Limit</th>
                <th>State</th>
                <th>Simulated Flag</th>
              </tr>
            </thead>
            <tbody>
              {recentReadings.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>
                    No telemetry packets recorded yet. Click <strong>Start Simulator</strong> to stream readings.
                  </td>
                </tr>
              ) : (
                recentReadings.map((reading, idx) => (
                  <tr key={reading.id || idx}>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {reading.timestamp ? new Date(reading.timestamp).toLocaleTimeString() : 'Just now'}
                    </td>
                    <td style={{ fontWeight: 700, color: '#1e3a8a' }}>{reading.sensorId}</td>
                    <td style={{ textTransform: 'capitalize' }}>{reading.sensorType}</td>
                    <td style={{ fontWeight: 700, color: reading.status === 'CRITICAL' ? '#dc2626' : '#0f172a' }}>
                      {reading.readingValue} {reading.unit}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{reading.threshold} {reading.unit}</td>
                    <td>
                      <span className={`badge ${reading.status === 'CRITICAL' ? 'badge-priority-critical' : 'badge-priority-low'}`}>
                        {reading.status}
                      </span>
                    </td>
                    <td>
                      <span className="simulation-tag">SIMULATED: TRUE</span>
                    </td>
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
