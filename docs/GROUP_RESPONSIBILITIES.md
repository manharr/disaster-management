# Academic Group Task Allocation & Viva Defense Guide

**Project Title:** Cloud-Based Disaster Management & Emergency Response System  
**Description:** A cloud-based platform for reporting emergency incidents, managing disaster information, coordinating response teams, and tracking the status of rescue operations.

---

## 1. Suggested Task Allocation for Four Students

### Member 1: Citizen Registration, Login, Incident Reporting & Tracking
- **Code Ownership:**
  - `src/pages/CitizenDashboard.jsx`
  - `src/pages/ReportIncidentPage.jsx`
  - `src/pages/MyIncidentsPage.jsx`
  - `src/pages/IncidentTrackingPage.jsx`
  - `src/features/incidents/incidentService.js` (Creation & Citizen Queries)
- **Primary Deliverables:**
  - Citizen emergency incident reporting form with validation.
  - Category selection (Floods, Fires, Accidents, Medical, Structural, Severe Weather, Other).
  - Geolocation coordinate capturing (GPS + Demo coordinates).
  - Incident tracking timeline demonstrating the 6-stage lifecycle.
- **Viva Defense Topics:**
  - Form validation techniques.
  - Incident reference code generation algorithms.
  - Client-side geolocation APIs and coordinate formatting.
  - Query filtering by `reporterId` to ensure data privacy.

---

### Member 2: IoT Simulator, Sensor Readings, Thresholds & Alerts
- **Code Ownership:**
  - `src/features/sensors/IoTSimulator.js`
  - `src/features/sensors/sensorService.js`
  - `src/pages/IoTSensorMonitoringPage.jsx`
  - `src/pages/SensorAlertsPage.jsx`
- **Primary Deliverables:**
  - In-browser virtual IoT sensor simulator for Water-Level, Temperature, and Smoke sensors.
  - Configurable telemetry transmission intervals (3s to 30s) and timer cleanup to avoid memory leaks.
  - Demonstration scenario triggers (Surge Flood Scenario and Wildfire Scenario).
  - Threshold detection engine with alert debouncing to prevent alert storms.
- **Viva Defense Topics:**
  - Virtual sensor modeling vs. physical IoT hardware in academic simulations.
  - Physics random walk simulation algorithms.
  - State machine design for alert suppression and reset.
  - Ingestion frequency optimization to preserve cloud quotas.

---

### Member 3: Firebase Setup, Firestore Data Model, Security Rules & Cloud Integration
- **Code Ownership:**
  - `src/firebase/config.js`
  - `firestore.rules`
  - `firestore.indexes.json`
  - `firebase.json`
  - `.env.example`
  - `docs/DATABASE.md`
  - `docs/DEPLOYMENT.md`
- **Primary Deliverables:**
  - Centralized Firebase configuration module with fallback detection.
  - NoSQL collection architecture (`users`, `incidents`, `teams`, `sensorReadings`, `sensorAlerts`, `auditLogs`).
  - Production-ready declarative Firestore Security Rules enforcing RBAC.
  - Secure administrator provisioning procedures.
- **Viva Defense Topics:**
  - NoSQL document data modeling vs. relational schemas.
  - Declarative security rules syntax and functions in Cloud Firestore.
  - Protection against self-elevation of roles during public registration.
  - Real-time `onSnapshot` listeners vs. HTTP polling or custom WebSockets.

---

### Member 4: Admin Dashboard, Response Team Management, Analytics & Deployment
- **Code Ownership:**
  - `src/pages/AdminDashboard.jsx`
  - `src/pages/IncidentManagementPage.jsx`
  - `src/pages/TeamManagementPage.jsx`
  - `src/pages/AnalyticsPage.jsx`
  - `src/pages/ResponseTeamDashboard.jsx`
  - `src/components/IncidentMap.jsx`
  - `docs/TESTING.md`
- **Primary Deliverables:**
  - Central Command Administrator dashboard with live KPI counters.
  - Incident verification, rejection with recorded reason, and specialized unit dispatching.
  - Field response operations dashboard for tactical status updates and progress notes.
  - Live analytics engine calculating distributions directly from Firestore records.
  - Leaflet OpenStreetMap integration with interactive markers.
- **Viva Defense Topics:**
  - Dispatching workflows and audit logging.
  - Real-time state reduction for analytics calculation without hardcoded mock data.
  - Leaflet cartography integration and marker projection.
  - Vite production bundle optimization and deployment to Firebase Hosting.

---

## 2. Comprehensive Viva Questions & Model Answers

### Q1: What makes this both a Cloud Computing and an IoT project?
**Answer:** The project combines Cloud Computing (Backend-as-a-Service using Cloud Firestore, serverless authentication, declarative database security rules, and real-time push listeners) with IoT concepts (software-simulated sensor transducers generating structured telemetry packets, threshold breach safety detection, and alert debouncing).

### Q2: Why did you not connect to physical hardware?
**Answer:** As specified for this academic project, software-based IoT simulation runs reproducibly on standard laptops without physical hardware costs, calibration drifts, or safety hazards, while demonstrating the exact telemetry ingestion pipeline (Sensor → Generator → SDK → Cloud Database → Real-Time Alert).

### Q3: How do you prevent multiple simulation tabs from flooding Firestore?
**Answer:** The simulator module uses a controlled singleton pattern, bounded timer intervals (defaulting to 10 seconds), and explicit React cleanup on unmount. Furthermore, alert debouncing suppresses repeated writes when values remain continuously above threshold.

### Q4: How is data protected if security rules run on the cloud?
**Answer:** Firestore evaluates `firestore.rules` on Google's cloud servers for every incoming read and write request. Rules inspect `request.auth` and document attributes to ensure citizens only read their own reports and only verified administrators can update priorities or dispatch teams.
