# Cloud Firestore Database Schema & Data Dictionary

**Project Title:** Cloud-Based Disaster Management & Emergency Response System  
**Description:** A cloud-based platform for reporting emergency incidents, managing disaster information, coordinating response teams, and tracking the status of rescue operations.

---

## 1. Cloud Firestore Collections

### Collection: `users`
Stores user profile information associated with Firebase Authentication UIDs.
```json
{
  "uid": "string (Firebase Auth UID)",
  "name": "string (e.g., Ananya Sharma)",
  "email": "string (e.g., citizen@emergency.local)",
  "role": "string ('citizen' | 'admin' | 'response_team')",
  "teamId": "string (optional, for response team members, e.g., 'TEAM-FL-01')",
  "createdAt": "serverTimestamp",
  "updatedAt": "serverTimestamp"
}
```

### Collection: `incidents`
Stores all citizen-reported and emergency incident records.
```json
{
  "id": "string (Firestore Document ID)",
  "referenceNumber": "string (e.g., 'INC-2026-0041')",
  "reporterId": "string (UID of citizen)",
  "reporterName": "string",
  "reporterEmail": "string",
  "category": "string ('floods' | 'fires' | 'road_accidents' | 'medical' | 'building_damage' | 'severe_weather' | 'other')",
  "title": "string",
  "description": "string",
  "location": "string (Address description)",
  "latitude": "number (optional, e.g., 28.6139)",
  "longitude": "number (optional, e.g., 77.2090)",
  "reportedSeverity": "string ('Low' | 'Medium' | 'High' | 'Critical')",
  "priority": "string ('Pending Review' | 'Low' | 'Medium' | 'High' | 'Critical')",
  "verificationState": "string ('Pending Review' | 'Verified' | 'Rejected')",
  "status": "string ('Reported' | 'Under Review' | 'Verified' | 'Assigned' | 'In Progress' | 'Resolved' | 'Rejected')",
  "rejectionReason": "string (null or explanation if rejected)",
  "assignedTeamId": "string (optional, e.g., 'TEAM-FL-01')",
  "assignedTeamName": "string (optional)",
  "createdAt": "serverTimestamp",
  "updatedAt": "serverTimestamp",
  "statusHistory": [
    {
      "status": "string",
      "timestamp": "ISO8601 string",
      "changedBy": "string (Actor display name)",
      "note": "string"
    }
  ],
  "progressNotes": [
    {
      "author": "string",
      "timestamp": "ISO8601 string",
      "note": "string"
    }
  ]
}
```

### Collection: `teams`
Stores specialized disaster response and rescue units.
```json
{
  "id": "string (e.g., 'TEAM-FL-01')",
  "name": "string (e.g., 'Rapid Flood Rescue Alpha')",
  "specialty": "string ('Flood Rescue & Water Evacuation')",
  "leadName": "string (e.g., 'Commander Rajesh Sharma')",
  "contact": "string",
  "memberCount": "number",
  "status": "string ('Available' | 'Dispatched' | 'Off-duty')",
  "activeIncidents": "number",
  "createdAt": "serverTimestamp"
}
```

### Collection: `sensorDevices`
Metadata for simulated virtual IoT hardware nodes.
```json
{
  "id": "string (e.g., 'SENSOR-WL-01')",
  "name": "string (e.g., 'Flood Gauge Alpha')",
  "type": "string ('water-level' | 'temperature' | 'smoke')",
  "unit": "string ('cm' | '°C' | 'Index (0-100)')",
  "location": "string (Simulated site)",
  "lat": "number",
  "lng": "number",
  "normalRange": { "min": "number", "max": "number" },
  "threshold": "number",
  "currentValue": "number",
  "status": "string ('NORMAL' | 'WARNING' | 'CRITICAL')"
}
```

### Collection: `sensorReadings`
Continuous time-series telemetry packet stream.
```json
{
  "sensorId": "string (e.g., 'SENSOR-WL-01')",
  "sensorName": "string",
  "sensorType": "string ('water-level' | 'temperature' | 'smoke')",
  "readingValue": "number",
  "unit": "string",
  "simulatedLocation": "string",
  "lat": "number",
  "lng": "number",
  "status": "string ('NORMAL' | 'WARNING' | 'CRITICAL')",
  "threshold": "number",
  "isSimulated": true,
  "timestamp": "serverTimestamp"
}
```

### Collection: `sensorAlerts`
Autonomous safety threshold breach incidents.
```json
{
  "sensorId": "string",
  "sensorName": "string",
  "sensorType": "string",
  "readingValue": "number",
  "unit": "string",
  "threshold": "number",
  "simulatedLocation": "string",
  "severity": "string ('HIGH' | 'CRITICAL')",
  "status": "string ('ACTIVE' | 'ACKNOWLEDGED')",
  "message": "string",
  "isSimulated": true,
  "createdAt": "serverTimestamp",
  "adminNotes": "string (optional)"
}
```

### Collection: `auditLogs`
Immutable administrative event trail for auditability.
```json
{
  "action": "string (e.g., 'INCIDENT_VERIFIED', 'TEAM_ASSIGNED')",
  "details": "string",
  "actor": "string (email of admin or user)",
  "timestamp": "serverTimestamp"
}
```

---

## 2. Quota Management & Billing Safety

1. **Configurable Ingestion Interval:** Default simulator frequency is set to 10 seconds. In eco mode, it runs at 30 seconds to prevent unnecessary Firestore writes.
2. **Cap on Real-Time Queries:** Listeners query with `limit(15)` or `limit(25)` documents to ensure minimal read costs.
3. **Controlled Simulation Loops:** React cleanup hooks prevent duplicate timers when navigating between pages.
