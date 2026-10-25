import React from 'react';
import { Users, BookOpen, CheckCircle, HelpCircle, ShieldCheck } from 'lucide-react';

export const GroupResponsibilitiesPage = () => {
  const members = [
    {
      role: 'Member 1',
      title: 'Citizen Emergency Portal & Incident Tracking Specialist',
      tasks: [
        'Citizen authentication workflow and form input validation.',
        'Emergency incident reporting module with category, severity, and location.',
        'Geospatial coordinate capturing (GPS and demo coordinates).',
        'Incident tracking page with interactive status progress timeline and audit trail.'
      ],
      vivaQuestions: [
        {
          q: 'How does the system ensure citizens only access their own private reports?',
          a: 'Firestore queries use where("reporterId", "==", auth.currentUser.uid), and backend security rules reject reads where request.auth.uid != resource.data.reporterId.'
        },
        {
          q: 'What is the incident status lifecycle?',
          a: 'Reported → Under Review → Verified → Assigned → In Progress → Resolved (or Rejected with reason).'
        }
      ]
    },
    {
      role: 'Member 2',
      title: 'IoT Sensor Simulator & Telemetry Engine Specialist',
      tasks: [
        'Dedicated IoTSimulator service with realistic physics modeling.',
        'Simulated virtual sensors: Water-level (cm), Temperature (°C), and Smoke (intensity index).',
        'Configurable transmission intervals (3s to 30s) and scenario triggers (Flood, Wildfire).',
        'Threshold detection engine with alert debouncing to avoid alert flooding.'
      ],
      vivaQuestions: [
        {
          q: 'How do you prevent duplicate alert flooding when a sensor remains above threshold?',
          a: 'An alert-state machine tracks if the sensor is already alerted; subsequent elevated ticks are suppressed until the reading falls below threshold and rises again.'
        },
        {
          q: 'Why use a software simulator instead of physical hardware for this academic project?',
          a: 'It allows reproducible disaster demonstration scenarios (e.g. rising floods) on standard laptops without expensive, hazardous, or uncalibrated physical hardware.'
        }
      ]
    },
    {
      role: 'Member 3',
      title: 'Cloud Architecture, Firestore Data Model & Security Specialist',
      tasks: [
        'Centralized Firebase configuration and fallback detection module.',
        'Cloud Firestore NoSQL collection design (users, incidents, teams, sensorReadings, sensorAlerts).',
        'Declarative Firestore Security Rules (firestore.rules) enforcing RBAC.',
        'Serverless hosting configuration (firebase.json) and environment templates (.env.example).'
      ],
      vivaQuestions: [
        {
          q: 'Why use Firestore onSnapshot listeners instead of traditional polling or a Socket.IO server?',
          a: 'Firestore real-time listeners provide managed WebSocket connections directly from Google Cloud BaaS, eliminating the need to manage custom Socket.IO servers.'
        },
        {
          q: 'How is administrative privilege prevented during public registration?',
          a: 'Firestore security rules reject user creation if role == "admin". Admin privileges must be provisioned through a trusted administrative procedure or console.'
        }
      ]
    },
    {
      role: 'Member 4',
      title: 'Admin Command Center, Response Team & Analytics Specialist',
      tasks: [
        'Administrator Command Center with verified metrics and pending dispatch queues.',
        'Response team dispatching and on-site tactical progress note logging.',
        'Real-time analytics engine calculating distributions directly from Firestore records.',
        'Leaflet OpenStreetMap integration with custom markers and automated testing.'
      ],
      vivaQuestions: [
        {
          q: 'How do first responders update rescue operations without modifying unrelated data?',
          a: 'Firestore security rules restrict response teams to only update incidents matching their assigned teamId, permitting changes only to status and progressNotes.'
        },
        {
          q: 'How are dashboard analytics calculated without hardcoded data?',
          a: 'Aggregations are computed dynamically in React state by reducing active Firestore incident and sensor arrays upon real-time snapshot emission.'
        }
      ]
    }
  ];

  return (
    <div className="content-body" style={{ maxWidth: '950px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.4rem', color: '#0f172a' }}>Engineering Team Responsibilities & Architecture Guide</h1>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
          Modular ownership breakdown across frontend, telemetry, database security, and deployment.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {members.map((m, idx) => (
          <div key={idx} className="card">
            <div className="card-header">
              <div className="card-title">
                <Users size={18} color="#2563eb" />
                <span>{m.role}: {m.title}</span>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
                Key Responsibilities & Deliverables
              </h4>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
                {m.tasks.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.85rem' }}>
              <h4 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#1e3a8a', letterSpacing: '0.04em', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HelpCircle size={15} />
                <span>Technical Implementation & Architecture FAQ</span>
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {m.vivaQuestions.map((vq, i) => (
                  <div key={i} style={{ borderBottom: i < m.vivaQuestions.length - 1 ? '1px solid #e2e8f0' : 'none', paddingBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                      Q: {vq.q}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: '3px', lineHeight: 1.5 }}>
                      <strong>A:</strong> {vq.a}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
