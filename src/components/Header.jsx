import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { isFirebaseConfigured } from '../firebase/config';
import { 
  ShieldAlert, 
  Cloud, 
  CloudOff, 
  User, 
  LogOut, 
  Info, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

export const Header = () => {
  const { currentUser, logoutUser, switchDemoRole } = useAuth();
  const [showConfigModal, setShowConfigModal] = useState(false);

  return (
    <>
      <header className="top-header">
        <Link to="/" className="header-brand">
          <div style={{ background: '#1e3a8a', color: 'white', padding: '5px', borderRadius: '6px', display: 'flex' }}>
            <ShieldAlert size={18} />
          </div>
          <div>
            <h1>Cloud-Based Disaster Management & Emergency Response System</h1>
            <div className="subtext">Central Command & Telemetry Ingestion Network</div>
          </div>
        </Link>

        <div className="header-actions">
          {/* Cloud Database Connection Indicator */}
          <button 
            onClick={() => setShowConfigModal(true)}
            className="btn btn-sm"
            style={{
              background: isFirebaseConfigured ? '#ecfdf5' : '#fffbeb',
              border: `1px solid ${isFirebaseConfigured ? '#a7f3d0' : '#fde68a'}`,
              color: isFirebaseConfigured ? '#065f46' : '#92400e',
              cursor: 'pointer',
              fontSize: '0.72rem',
              padding: '3px 8px'
            }}
            title="Click to view Cloud Firestore status"
          >
            {isFirebaseConfigured ? (
              <>
                <Cloud size={13} style={{ color: '#059669' }} />
                <span>Cloud Firestore: Connected</span>
              </>
            ) : (
              <>
                <CloudOff size={13} style={{ color: '#d97706' }} />
                <span>Local Preview Mode</span>
              </>
            )}
          </button>

          {/* Active Persona Switcher */}
          {currentUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#f1f5f9', padding: '2px 4px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, paddingLeft: '4px', textTransform: 'uppercase' }}>Role:</span>
              <button 
                onClick={() => switchDemoRole('citizen')}
                className={`btn btn-sm ${currentUser.role === 'citizen' ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '2px 7px', fontSize: '0.72rem', borderRadius: '4px' }}
              >
                Citizen
              </button>
              <button 
                onClick={() => switchDemoRole('admin')}
                className={`btn btn-sm ${currentUser.role === 'admin' ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '2px 7px', fontSize: '0.72rem', borderRadius: '4px' }}
              >
                Admin
              </button>
              <button 
                onClick={() => switchDemoRole('response_team')}
                className={`btn btn-sm ${currentUser.role === 'response_team' ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '2px 7px', fontSize: '0.72rem', borderRadius: '4px' }}
              >
                Rescue Team
              </button>
            </div>
          )}

          {/* User Profile & Logout */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{currentUser.displayName}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'capitalize' }}>{currentUser.role.replace('_', ' ')}</div>
              </div>
              <button 
                onClick={logoutUser} 
                className="btn btn-outline btn-sm"
                title="Sign out"
                style={{ padding: '6px' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              <User size={14} />
              <span>Login / Register</span>
            </Link>
          )}
        </div>
      </header>

      {/* Cloud Configuration Modal */}
      {showConfigModal && (
        <div className="modal-backdrop" onClick={() => setShowConfigModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="card-header">
              <div className="card-title">
                <Cloud size={20} color="#1e3a8a" />
                <span>Cloud Computing & Database Configuration</span>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => setShowConfigModal(false)}>✕</button>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              {isFirebaseConfigured ? (
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1rem', borderRadius: '8px', color: '#065f46', display: 'flex', gap: '0.75rem' }}>
                  <CheckCircle2 size={24} style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700 }}>Cloud Firestore Active & Connected</div>
                    <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                      All emergency incident reports, response team dispatches, and simulated IoT telemetry are persisting directly to Google Cloud Firestore.
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '1rem', borderRadius: '8px', color: '#92400e', display: 'flex', gap: '0.75rem' }}>
                  <AlertTriangle size={24} style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700 }}>Local Simulation Preview Mode</div>
                    <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                      Firebase credentials are not yet defined in <code>.env</code>. The application is running with local state preview mode so all features (IoT simulation, threshold alerts, role dispatch) are 100% interactive for testing.
                    </div>
                  </div>
                </div>
              )}
            </div>

            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: '#0f172a' }}>To connect your live Firebase project:</h4>
            <ol style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
              <li>Create a Firebase Project at <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>console.firebase.google.com</a>.</li>
              <li>Enable <strong>Cloud Firestore</strong> and <strong>Firebase Authentication</strong> (Email/Password).</li>
              <li>Register a Web App in Project Settings and copy your Firebase SDK config.</li>
              <li>Create a <code>.env</code> file in the project root with the variables shown in <code>.env.example</code>:
                <pre style={{ background: '#0f172a', color: '#93c5fd', padding: '0.75rem', borderRadius: '6px', marginTop: '0.5rem', overflowX: 'auto', fontSize: '0.75rem' }}>
{`VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=disaster-system.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=disaster-system
VITE_FIREBASE_STORAGE_BUCKET=disaster-system.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef`}
                </pre>
              </li>
              <li>Deploy security rules with <code>firebase deploy --only firestore:rules</code>.</li>
            </ol>

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button className="btn btn-primary btn-sm" onClick={() => setShowConfigModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
