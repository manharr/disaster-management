import React from 'react';
import { WorkflowVisualizer } from '../components/WorkflowVisualizer';
import { Cloud, Cpu, Database, ShieldCheck, Activity, Layers, Server } from 'lucide-react';

export const ArchitecturePage = () => {
  return (
    <div className="content-body" style={{ maxWidth: '950px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.4rem', color: '#0f172a' }}>
          Cloud-Based Disaster Management & Emergency Response System
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
          A cloud-based platform for reporting emergency incidents, managing disaster information, coordinating response teams, and tracking the status of rescue operations.
        </p>
      </div>

      {/* Visual Pipeline */}
      <WorkflowVisualizer activeStep={2} />

      {/* Dual Technology Pillars */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        {/* Pillar 1: Cloud Computing */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Cloud size={20} color="#2563eb" />
              <span>Cloud Computing Concepts Demonstrated</span>
            </div>
          </div>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.88rem', color: '#334155', lineHeight: 1.7 }}>
            <li>
              <strong>Backend-as-a-Service (BaaS):</strong> Utilizes Google Cloud Firestore and Firebase Auth, removing the need for maintaining fragile custom backend servers.
            </li>
            <li>
              <strong>Real-Time Data Synchronization:</strong> Leverages Firestore <code>onSnapshot</code> push listeners to stream live dashboard updates and threshold alerts without polling.
            </li>
            <li>
              <strong>NoSQL Document Store:</strong> Structured collections (<code>incidents</code>, <code>sensorReadings</code>, <code>sensorAlerts</code>, <code>teams</code>, <code>users</code>) offering horizontal elasticity and dynamic schemas.
            </li>
            <li>
              <strong>Cloud Declarative Security Rules:</strong> Role-based access control (RBAC) enforced directly at the database layer (<code>firestore.rules</code>), restricting citizen vs admin vs response team permissions.
            </li>
            <li>
              <strong>Serverless Static Edge Hosting:</strong> Configured for deployment across global CDN edge nodes via Firebase Hosting (<code>firebase.json</code>).
            </li>
          </ul>
        </div>

        {/* Pillar 2: IoT Telemetry */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Cpu size={20} color="#7c3aed" />
              <span>Internet of Things (IoT) Concepts Demonstrated</span>
            </div>
          </div>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.88rem', color: '#334155', lineHeight: 1.7 }}>
            <li>
              <strong>Virtual Transducers:</strong> Software-simulated Water-Level (cm), Temperature (°C), and Smoke Intensity Index (0-100) devices.
            </li>
            <li>
              <strong>Telemetry Data Packet Modeling:</strong> Standardized payload structure containing Sensor ID, Type, Reading Value, Metric Unit, Timestamp, Simulated Coordinates, and Status.
            </li>
            <li>
              <strong>Threshold Safety Triggering:</strong> Configurable upper safety bounds that trigger emergency alerts when physics values cross danger levels.
            </li>
            <li>
              <strong>Alert Debouncing & State Machine:</strong> Prevents alert storms by recording an alert on threshold breach, suppressing redundant alerts while elevated, and resetting upon return to normal.
            </li>
            <li>
              <strong>Configurable Ingestion Intervals:</strong> Demonstrates real-world IoT transmission policies (3s presentation mode to 30s eco/quota mode).
            </li>
          </ul>
        </div>
      </div>

      {/* Database Schema Overview */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <div className="card-title">
            <Database size={20} color="#1e3a8a" />
            <span>Cloud Firestore Collection Schema</span>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Collection</th>
                <th>Primary Keys & References</th>
                <th>Core Document Attributes</th>
                <th>Access Policy (RBAC)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 700, color: '#1e3a8a' }}>users</td>
                <td><code>uid</code> (Auth UID)</td>
                <td>email, name, role ('citizen' | 'admin' | 'response_team'), teamId</td>
                <td>Owner read/write; Admin full; Self-role-escalation blocked</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, color: '#1e3a8a' }}>incidents</td>
                <td><code>id</code>, <code>referenceNumber</code></td>
                <td>category, title, description, location, lat/lng, severity, priority, status, assignedTeamId, statusHistory, progressNotes</td>
                <td>Citizen creates/reads own; Admin verifies/assigns; Assigned team updates</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, color: '#1e3a8a' }}>teams</td>
                <td><code>teamId</code> (e.g. TEAM-FL-01)</td>
                <td>name, specialty, leadName, contact, memberCount, status</td>
                <td>Public/Team read; Admin creates/manages</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, color: '#1e3a8a' }}>sensorDevices</td>
                <td><code>deviceId</code> (e.g. SENSOR-WL-01)</td>
                <td>name, type, unit, threshold, normalRange, location, lat/lng</td>
                <td>Read accessible; Admin configurable</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, color: '#1e3a8a' }}>sensorReadings</td>
                <td><code>readingId</code> (Auto-ID)</td>
                <td>sensorId, sensorType, readingValue, unit, timestamp, status, isSimulated</td>
                <td>Simulator append; Authenticated read</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, color: '#1e3a8a' }}>sensorAlerts</td>
                <td><code>alertId</code> (Auto-ID)</td>
                <td>sensorId, readingValue, threshold, severity, status, createdAt, adminNotes</td>
                <td>Authenticated read; Admin acknowledge</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, color: '#1e3a8a' }}>auditLogs</td>
                <td><code>logId</code> (Auto-ID)</td>
                <td>action, details, actor, timestamp</td>
                <td>Admin read-only; Immutable append</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
