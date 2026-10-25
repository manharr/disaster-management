import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { ShieldAlert, Cpu } from 'lucide-react';

// Fix default Leaflet icon paths in React/Vite environments
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored icons for emergency incidents vs IoT sensors
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background-color: ${color}; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.35);"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
};

const incidentIcon = createCustomIcon('#dc2626');
const sensorIcon = createCustomIcon('#2563eb');

export const IncidentMap = ({ incidents = [], sensors = [] }) => {
  // Center of Mumbai Metropolitan Region
  const defaultCenter = [19.0760, 72.8777];
  const validIncidents = incidents.filter(i => i.latitude && i.longitude && !isNaN(i.latitude) && !isNaN(i.longitude));

  return (
    <div className="card" style={{ padding: '1rem', marginTop: '1rem' }}>
      <div className="card-header" style={{ marginBottom: '0.75rem' }}>
        <div className="card-title">
          <ShieldAlert size={20} color="#dc2626" />
          <span>Geospatial Incident & IoT Sensor Map</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#dc2626', display: 'inline-block' }}></span>
            <span>Emergency Incident</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#2563eb', display: 'inline-block' }}></span>
            <span>Simulated IoT Sensor</span>
          </div>
        </div>
      </div>

      <div className="map-container" style={{ position: 'relative' }}>
        <MapContainer 
          center={defaultCenter} 
          zoom={11} 
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%', zIndex: 10 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Incident Markers */}
          {validIncidents.map(inc => (
            <Marker 
              key={inc.id || inc.referenceNumber} 
              position={[Number(inc.latitude), Number(inc.longitude)]}
              icon={incidentIcon}
            >
              <Popup>
                <div style={{ padding: '4px', maxWidth: '240px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>
                    {inc.referenceNumber}
                  </div>
                  <h4 style={{ fontSize: '0.9rem', margin: '4px 0', color: '#0f172a' }}>{inc.title}</h4>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '6px' }}>{inc.location}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', borderTop: '1px solid #e2e8f0', paddingTop: '4px' }}>
                    <span>Status: <strong>{inc.status}</strong></span>
                    <span>Priority: <strong>{inc.priority}</strong></span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Sensor Markers */}
          {sensors.map(s => (
            <Marker
              key={s.id}
              position={[s.lat, s.lng]}
              icon={sensorIcon}
            >
              <Popup>
                <div style={{ padding: '4px', maxWidth: '240px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
                    [Simulated IoT] {s.id}
                  </div>
                  <h4 style={{ fontSize: '0.9rem', margin: '4px 0', color: '#0f172a' }}>{s.name}</h4>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '6px' }}>{s.location}</div>
                  <div style={{ background: '#eff6ff', padding: '6px', borderRadius: '4px', fontSize: '0.8rem' }}>
                    <div>Reading: <strong>{s.currentValue} {s.unit}</strong></div>
                    <div>Threshold: {s.threshold} {s.unit}</div>
                    <div style={{ color: s.status === 'CRITICAL' ? '#dc2626' : '#059669', fontWeight: 700 }}>
                      State: {s.status}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.5rem', textAlign: 'right' }}>
        Interactive Leaflet Map with OpenStreetMap Cartography. Incidents without coordinates are safely omitted.
      </div>
    </div>
  );
};
