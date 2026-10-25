import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { ReportIncidentPage } from './pages/ReportIncidentPage';
import { MyIncidentsPage } from './pages/MyIncidentsPage';
import { IncidentTrackingPage } from './pages/IncidentTrackingPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { IncidentManagementPage } from './pages/IncidentManagementPage';
import { TeamManagementPage } from './pages/TeamManagementPage';
import { IoTSensorMonitoringPage } from './pages/IoTSensorMonitoringPage';
import { SensorAlertsPage } from './pages/SensorAlertsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ResponseTeamDashboard } from './pages/ResponseTeamDashboard';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { GroupResponsibilitiesPage } from './pages/GroupResponsibilitiesPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Sidebar />
          <div className="main-content">
            <Header />
            <Routes>
              {/* Universal Overview */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Citizen Routes */}
              <Route path="/citizen" element={<CitizenDashboard />} />
              <Route path="/report" element={<ReportIncidentPage />} />
              <Route path="/my-incidents" element={<MyIncidentsPage />} />
              <Route path="/tracking" element={<IncidentTrackingPage />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/incidents" element={<IncidentManagementPage />} />
              <Route path="/admin/teams" element={<TeamManagementPage />} />

              {/* IoT Telemetry Routes */}
              <Route path="/sensors" element={<IoTSensorMonitoringPage />} />
              <Route path="/sensor-alerts" element={<SensorAlertsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />

              {/* Response Team Routes */}
              <Route path="/team" element={<ResponseTeamDashboard />} />

              {/* Academic Documentation & Viva */}
              <Route path="/architecture" element={<ArchitecturePage />} />
              <Route path="/group" element={<GroupResponsibilitiesPage />} />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
