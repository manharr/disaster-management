import React from 'react';
import { 
  Cpu, 
  Code2, 
  Cloud, 
  Database, 
  Activity, 
  BellRing
} from 'lucide-react';

export const WorkflowVisualizer = ({ activeStep = 0 }) => {
  const iotSteps = [
    { title: 'Simulated Sensor', desc: 'Virtual Water/Temp/Smoke', icon: Cpu },
    { title: 'JS Generation', desc: 'IoTSimulator engine', icon: Code2 },
    { title: 'Firebase SDK', desc: 'Client API pipeline', icon: Cloud },
    { title: 'Cloud Firestore', desc: 'Telemetry collection', icon: Database },
    { title: 'Real-Time Sync', desc: 'onSnapshot feed', icon: Activity },
    { title: 'Threshold Alert', desc: 'Safety breach trigger', icon: BellRing }
  ];

  return (
    <div className="card" style={{ marginBottom: '1.25rem', background: '#ffffff' }}>
      <div className="card-header" style={{ paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
        <div className="card-title" style={{ fontSize: '0.88rem' }}>
          <Activity size={16} color="#2563eb" />
          <span>IoT Telemetry & Cloud Synchronization Pipeline</span>
        </div>
        <span className="simulation-tag">Active Pipeline</span>
      </div>

      <div style={{ padding: '0.25rem 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.65rem' }}>
          {iotSteps.map((step, idx) => {
            const IconComponent = step.icon;
            const isHighlight = idx === activeStep;
            return (
              <div 
                key={idx}
                style={{
                  background: isHighlight ? '#eff6ff' : '#f8fafc',
                  border: `1px solid ${isHighlight ? '#bfdbfe' : '#e2e8f0'}`,
                  borderRadius: '6px',
                  padding: '0.65rem 0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  transition: 'all 0.15s ease'
                }}
              >
                <div 
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: isHighlight ? '#2563eb' : '#e2e8f0',
                    color: isHighlight ? '#ffffff' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.4rem'
                  }}
                >
                  <IconComponent size={15} />
                </div>
                <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase' }}>
                  Step {idx + 1}
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', margin: '1px 0' }}>
                  {step.title}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  {step.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
