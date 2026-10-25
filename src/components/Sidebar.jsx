import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { 
  LayoutDashboard, 
  AlertCircle, 
  FileText, 
  ShieldCheck, 
  Users, 
  Cpu, 
  BarChart3, 
  MapPin, 
  Layers,
  UserCheck
} from 'lucide-react';

export const Sidebar = () => {
  const { currentUser } = useAuth();
  const role = currentUser?.role || 'citizen';

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <ShieldCheck size={20} />
        </div>
        <div>
          <div className="sidebar-title">Disaster Response</div>
          <span className="sidebar-role-badge">
            {role === 'admin' ? 'Administrator' : role === 'response_team' ? 'Rescue Unit' : 'Citizen'}
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {/* Universal Command Center / Overview */}
        <div className="nav-section-title">Navigation</div>
        <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={16} />
          <span>Dashboard</span>
        </NavLink>

        {/* Citizen Specific Links */}
        {role === 'citizen' && (
          <>
            <NavLink to="/report" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <AlertCircle size={16} />
              <span>Report Incident</span>
            </NavLink>
            <NavLink to="/my-incidents" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <FileText size={16} />
              <span>My Incidents</span>
            </NavLink>
            <NavLink to="/tracking" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <MapPin size={16} />
              <span>Track Status</span>
            </NavLink>
          </>
        )}

        {/* Admin Specific Links */}
        {role === 'admin' && (
          <>
            <NavLink to="/admin/incidents" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <FileText size={16} />
              <span>Incident Queue</span>
            </NavLink>
            <NavLink to="/admin/teams" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Users size={16} />
              <span>Rescue Teams</span>
            </NavLink>
          </>
        )}

        {/* Response Team Specific Links */}
        {role === 'response_team' && (
          <NavLink to="/team" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <UserCheck size={16} />
            <span>Assigned Tasks</span>
          </NavLink>
        )}

        {/* Telemetry & Analytics (Relevant to all) */}
        <div className="nav-section-title">Telemetry & System</div>
        <NavLink to="/sensors" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Cpu size={16} />
          <span>IoT Sensors</span>
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <BarChart3 size={16} />
          <span>Analytics</span>
        </NavLink>
        <NavLink to="/architecture" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Layers size={16} />
          <span>Architecture</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-widget">
          <div className="avatar-circle">
            {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {currentUser?.displayName || 'Guest User'}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
              {currentUser?.email || 'Demo Session'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
