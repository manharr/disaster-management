import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { INCIDENT_CATEGORIES, createIncident } from '../features/incidents/incidentService';
import { 
  AlertTriangle, 
  Send, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Navigation
} from 'lucide-react';

export const ReportIncidentPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    category: 'floods',
    title: '',
    description: '',
    location: '',
    latitude: '',
    longitude: '',
    reportedSeverity: 'High'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUseDemoLocation = () => {
    // Mumbai demo location coordinates
    setFormData(prev => ({
      ...prev,
      location: 'Kurla West near Mithi River Embankment, Mumbai',
      latitude: '19.0688',
      longitude: '72.8797'
    }));
  };

  const handleGetDeviceLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData(prev => ({
            ...prev,
            latitude: pos.coords.latitude.toFixed(4),
            longitude: pos.coords.longitude.toFixed(4)
          }));
        },
        () => {
          handleUseDemoLocation();
        }
      );
    } else {
      handleUseDemoLocation();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.title.trim()) {
      setErrorMessage('Please enter an incident title.');
      return;
    }
    if (!formData.description.trim()) {
      setErrorMessage('Please describe the emergency incident.');
      return;
    }
    if (!formData.location.trim()) {
      setErrorMessage('Please specify the location or address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const citizenUser = currentUser || {
        uid: 'anonymous_' + Date.now(),
        email: 'anonymous@emergency.local',
        displayName: 'Anonymous Citizen'
      };

      const result = await createIncident(formData, citizenUser);
      setSuccessResult(result);
    } catch (err) {
      setErrorMessage('Failed to submit incident: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="content-body" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.35rem', color: '#0f172a' }}>Report an Emergency Incident</h1>
        <p style={{ color: '#64748b', fontSize: '0.82rem' }}>
          Submit emergency details directly to Central Command and first responders.
        </p>
      </div>

      {successResult ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
          <div style={{ display: 'inline-flex', background: '#ecfdf5', color: '#059669', padding: '16px', borderRadius: '50%', marginBottom: '1rem' }}>
            <CheckCircle2 size={48} />
          </div>
          <h2 style={{ fontSize: '1.5rem', color: '#065f46', marginBottom: '0.5rem' }}>
            Emergency Report Successfully Logged
          </h2>
          <div style={{ fontSize: '1rem', color: '#1e3a8a', fontWeight: 700, marginBottom: '0.75rem' }}>
            Reference Number: <span style={{ background: '#eff6ff', padding: '4px 12px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>{successResult.referenceNumber}</span>
          </div>
          <p style={{ color: '#475569', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
            Your report has been broadcast to the Disaster Management Authority command queue with status <strong>"Reported"</strong>. Response teams will be assigned upon dispatcher verification.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              className="btn btn-primary"
              onClick={() => navigate(`/tracking?ref=${successResult.referenceNumber}`)}
            >
              Track Real-Time Status
            </button>
            <button 
              className="btn btn-outline"
              onClick={() => {
                setSuccessResult(null);
                setFormData({
                  category: 'floods',
                  title: '',
                  description: '',
                  location: '',
                  latitude: '',
                  longitude: '',
                  reportedSeverity: 'High'
                });
              }}
            >
              Submit Another Report
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          {errorMessage && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '0.75rem 1rem', borderRadius: '8px', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Incident Category <span className="required">*</span></label>
                <select 
                  className="form-select" 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange}
                >
                  {INCIDENT_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Reported Severity <span className="required">*</span></label>
                <select 
                  className="form-select" 
                  name="reportedSeverity" 
                  value={formData.reportedSeverity} 
                  onChange={handleChange}
                >
                  <option value="Low">Low - Minor Inconvenience / Non-urgent</option>
                  <option value="Medium">Medium - Threat to Property / Blockade</option>
                  <option value="High">High - Active Danger / Structural Risk</option>
                  <option value="Critical">Critical - Immediate Threat to Human Life</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Incident Title / Brief Summary <span className="required">*</span></label>
              <input 
                type="text" 
                className="form-input" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                placeholder="e.g. Severe waterlogging trapped 5 households near Bridge 3"
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Incident Description <span className="required">*</span></label>
              <textarea 
                className="form-textarea" 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                placeholder="Describe current conditions, trapped individuals, observed hazards, or emergency access obstructions..."
                required 
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Incident Location / Address <span className="required">*</span></label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    type="button" 
                    onClick={handleUseDemoLocation}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                  >
                    Demo Coords
                  </button>
                  <button 
                    type="button" 
                    onClick={handleGetDeviceLocation}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.72rem', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    <Navigation size={12} />
                    <span>Current GPS</span>
                  </button>
                </div>
              </div>
              <input 
                type="text" 
                className="form-input" 
                name="location" 
                value={formData.location} 
                onChange={handleChange} 
                placeholder="e.g. Gate 4, Sector 15 Riverside Enclave"
                required 
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Latitude (Optional for Map)</label>
                <input 
                  type="number" 
                  step="any"
                  className="form-input" 
                  name="latitude" 
                  value={formData.latitude} 
                  onChange={handleChange} 
                  placeholder="e.g. 28.6139"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Longitude (Optional for Map)</label>
                <input 
                  type="number" 
                  step="any"
                  className="form-input" 
                  name="longitude" 
                  value={formData.longitude} 
                  onChange={handleChange} 
                  placeholder="e.g. 77.2090"
                />
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', fontSize: '0.8rem', color: '#64748b', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
              <Info size={16} color="#3b82f6" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Simulation Disclaimer:</strong> This portal is an academic engineering simulation. It demonstrates Cloud Computing and IoT telemetry ingestion. Do not report real-world emergencies through this demonstration software.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={() => navigate('/citizen')}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-danger"
                disabled={isSubmitting}
              >
                <Send size={15} />
                <span>{isSubmitting ? 'Transmitting to Cloud...' : 'Transmit Report'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
