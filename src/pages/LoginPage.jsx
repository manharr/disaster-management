import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, DEMO_PROFILES } from '../features/auth/AuthContext';
import { ShieldCheck, User, Lock, Mail, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

export const LoginPage = () => {
  const { loginUser, registerUser, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('citizen');
  const [teamId, setTeamId] = useState('TEAM-FL-01');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Please provide your full name.');
        await registerUser({ email, password, name, role, teamId });
      } else {
        await loginUser(email, password);
      }
      navigate(role === 'admin' ? '/admin' : role === 'response_team' ? '/team' : '/citizen');
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (roleKey) => {
    switchDemoRole(roleKey);
    navigate(roleKey === 'admin' ? '/admin' : roleKey === 'response_team' ? '/team' : '/citizen');
  };

  return (
    <div className="content-body" style={{ maxWidth: '440px', margin: '2rem auto' }}>
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'inline-flex', background: '#eff6ff', padding: '10px', borderRadius: '50%', color: '#1e3a8a', marginBottom: '0.5rem' }}>
            <ShieldCheck size={26} />
          </div>
          <h2 style={{ fontSize: '1.2rem', color: '#0f172a' }}>
            {isRegister ? 'Citizen / Team Registration' : 'Account Sign In'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
            Cloud-Based Disaster Management & Emergency Response System
          </p>
        </div>

        {/* Demo Fast Login Pills */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.65rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Info size={13} color="#3b82f6" />
            <span>Select Demo Persona</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <button 
              type="button" 
              onClick={() => handleQuickDemo('citizen')} 
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem', padding: '6px 4px' }}
            >
              Citizen
            </button>
            <button 
              type="button" 
              onClick={() => handleQuickDemo('admin')} 
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem', padding: '6px 4px' }}
            >
              Admin
            </button>
            <button 
              type="button" 
              onClick={() => handleQuickDemo('response_team')} 
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem', padding: '6px 4px' }}
            >
              Rescue Team
            </button>
          </div>
        </div>

        {errorMsg && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '0.75rem', borderRadius: '6px', color: '#dc2626', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Full Name <span className="required">*</span></label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="e.g. Priya Sharma"
                  required 
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address <span className="required">*</span></label>
            <input 
              type="email" 
              className="form-input" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="user@emergency.local"
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password <span className="required">*</span></label>
            <input 
              type="password" 
              className="form-input" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••"
              required 
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="form-label">Registering Role</label>
              <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
                <option value="citizen">Citizen (General Public)</option>
                <option value="response_team">Response Team Field Operative</option>
              </select>
              <div className="form-hint" style={{ color: '#b45309' }}>
                * Public registration cannot grant Administrator role. Administrators are provisioned securely via Firebase Console.
              </div>
            </div>
          )}

          {isRegister && role === 'response_team' && (
            <div className="form-group">
              <label className="form-label">Assign To Team</label>
              <select className="form-select" value={teamId} onChange={e => setTeamId(e.target.value)}>
                <option value="TEAM-FL-01">TEAM-FL-01: Rapid Flood Rescue Alpha</option>
                <option value="TEAM-FR-02">TEAM-FR-02: Hazard & Fire Strike Unit</option>
                <option value="TEAM-MED-03">TEAM-MED-03: Paramedic Emergency Corps</option>
                <option value="TEAM-STR-04">TEAM-STR-04: Urban Structural Safety</option>
              </select>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : (isRegister ? 'Complete Registration' : 'Sign In')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
          <button 
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg('');
            }}
          >
            {isRegister ? 'Already have an account? Sign In' : 'New user? Register as Citizen'}
          </button>
        </div>
      </div>
    </div>
  );
};
