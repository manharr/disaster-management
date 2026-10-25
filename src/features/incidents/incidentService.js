import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  where, 
  onSnapshot, 
  serverTimestamp, 
  updateDoc, 
  doc 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../firebase/config';

// Incident Categories
export const INCIDENT_CATEGORIES = [
  { value: 'floods', label: 'Flood & Water Inundation' },
  { value: 'fires', label: 'Fire & Wildfire Hazard' },
  { value: 'road_accidents', label: 'Road & Highway Accident' },
  { value: 'medical', label: 'Medical Emergency & Mass Casualty' },
  { value: 'building_damage', label: 'Building Structural Damage / Collapse' },
  { value: 'severe_weather', label: 'Severe Storm / Cyclone / Weather' },
  { value: 'other', label: 'Other Disaster / Emergency' }
];

export const STATUS_STAGES = [
  'Reported',
  'Under Review',
  'Verified',
  'Assigned',
  'In Progress',
  'Resolved'
];

// Seed initial demonstration incidents
export const INITIAL_INCIDENTS = [
  {
    id: 'inc_sample_1',
    referenceNumber: 'INC-2026-0041',
    reporterId: 'citizen_demo_id',
    reporterName: 'Ananya Sharma',
    reporterEmail: 'citizen@emergency.local',
    category: 'floods',
    title: 'Severe Water Inundation near Low-Lying Riverbank Colony',
    description: 'Mithi River overflowed embankment following continuous heavy monsoon rain. Water level rising inside residential ground floors.',
    location: 'Kranti Nagar Embankment, Kurla West, Mumbai',
    latitude: 19.0688,
    longitude: 72.8797,
    reportedSeverity: 'High',
    priority: 'Critical',
    verificationState: 'Verified',
    status: 'In Progress',
    assignedTeamId: 'TEAM-FL-01',
    assignedTeamName: 'Rapid Flood Rescue Alpha',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    statusHistory: [
      { status: 'Reported', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), changedBy: 'Citizen', note: 'Emergency report logged via citizen portal.' },
      { status: 'Under Review', timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), changedBy: 'Admin Dispatcher', note: 'Cross-referenced with Mithi river sensor.' },
      { status: 'Verified', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), changedBy: 'Admin Dispatcher', note: 'Confirmed with local ward officer.' },
      { status: 'Assigned', timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(), changedBy: 'Admin Dispatcher', note: 'Assigned Rapid Flood Rescue Alpha.' },
      { status: 'In Progress', timestamp: new Date(Date.now() - 1800000).toISOString(), changedBy: 'TEAM-FL-01', note: 'Inflatable rescue boats deployed on site.' }
    ],
    progressNotes: [
      { author: 'TEAM-FL-01 Lead', timestamp: new Date(Date.now() - 1500000).toISOString(), note: 'Inflatable dinghies operational. 14 residents safely relocated to municipal school shelter.' }
    ]
  },
  {
    id: 'inc_sample_2',
    referenceNumber: 'INC-2026-0042',
    reporterId: 'citizen_demo_id',
    reporterName: 'Ananya Sharma',
    reporterEmail: 'citizen@emergency.local',
    category: 'fires',
    title: 'Commercial Complex Electrical Fire Spark',
    description: 'Dense smoke emanating from basement transformer room. Building security attempting initial containment.',
    location: 'MIDC Road No. 11, Andheri East, Mumbai',
    latitude: 19.1197,
    longitude: 72.8710,
    reportedSeverity: 'Critical',
    priority: 'High',
    verificationState: 'Verified',
    status: 'Assigned',
    assignedTeamId: 'TEAM-FR-02',
    assignedTeamName: 'Hazard & Fire Strike Unit',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    statusHistory: [
      { status: 'Reported', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), changedBy: 'Citizen', note: 'Reported via web portal.' },
      { status: 'Verified', timestamp: new Date(Date.now() - 3600000 * 1.2).toISOString(), changedBy: 'Admin Dispatcher', note: 'Verified by CCTV operations room.' },
      { status: 'Assigned', timestamp: new Date(Date.now() - 3600000).toISOString(), changedBy: 'Admin Dispatcher', note: 'Dispatched Fire Unit.' }
    ],
    progressNotes: []
  },
  {
    id: 'inc_sample_3',
    referenceNumber: 'INC-2026-0043',
    reporterId: 'citizen_other_id',
    reporterName: 'Rohan Mehra',
    reporterEmail: 'rohan@example.com',
    category: 'road_accidents',
    title: 'Multiple Vehicle Collision on Expressway Flyover',
    description: 'Collision involving 3 vehicles. Traffic blocked on northbound lanes.',
    location: 'Western Express Highway Flyover, Bandra East, Mumbai',
    latitude: 19.0596,
    longitude: 72.8445,
    reportedSeverity: 'Medium',
    priority: 'Medium',
    verificationState: 'Pending Review',
    status: 'Reported',
    assignedTeamId: null,
    assignedTeamName: null,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    statusHistory: [
      { status: 'Reported', timestamp: new Date(Date.now() - 1800000).toISOString(), changedBy: 'Citizen', note: 'Initial incident filing.' }
    ],
    progressNotes: []
  }
];

let localIncidents = [...INITIAL_INCIDENTS];
let incidentListeners = new Set();

const notifyIncidentListeners = () => {
  incidentListeners.forEach(listener => listener([...localIncidents]));
};

// Generate an academic standard reference code
export const generateReferenceNumber = () => {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `INC-${year}-${randomSuffix}`;
};

/**
 * Record an audit log entry in Firestore or local memory
 */
export const recordAuditLog = async (action, details, actor) => {
  const logEntry = {
    action,
    details,
    actor: actor || 'System / Admin',
    timestamp: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      await addDoc(collection(db, 'auditLogs'), logEntry);
    } catch (e) {
      console.warn('[Firestore] Audit log write skipped:', e.message);
    }
  }
};

/**
 * Create a new Emergency Incident
 */
export const createIncident = async (incidentInput, user) => {
  const refNum = generateReferenceNumber();
  const timestamp = new Date().toISOString();

  const newRecord = {
    referenceNumber: refNum,
    reporterId: user.uid,
    reporterName: user.displayName || user.email?.split('@')[0] || 'Anonymous Citizen',
    reporterEmail: user.email || 'citizen@local',
    category: incidentInput.category,
    title: incidentInput.title.trim(),
    description: incidentInput.description.trim(),
    location: incidentInput.location.trim(),
    latitude: incidentInput.latitude ? Number(incidentInput.latitude) : null,
    longitude: incidentInput.longitude ? Number(incidentInput.longitude) : null,
    reportedSeverity: incidentInput.reportedSeverity || 'Medium',
    priority: 'Pending Review',
    verificationState: 'Pending Review',
    status: 'Reported',
    rejectionReason: null,
    assignedTeamId: null,
    assignedTeamName: null,
    createdAt: isFirebaseConfigured ? serverTimestamp() : timestamp,
    updatedAt: isFirebaseConfigured ? serverTimestamp() : timestamp,
    statusHistory: [
      {
        status: 'Reported',
        timestamp: timestamp,
        changedBy: user.displayName || 'Citizen',
        note: 'Emergency incident reported via citizen portal.'
      }
    ],
    progressNotes: []
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, 'incidents'), newRecord);
      await recordAuditLog('INCIDENT_CREATED', `Incident ${refNum} created by citizen ${user.email}`, user.email);
      return { id: docRef.id, ...newRecord, createdAt: timestamp, updatedAt: timestamp };
    } catch (err) {
      console.warn('[Firestore] Create incident error, falling back to local memory:', err.message);
    }
  }

  // Local memory store
  const mockCreated = {
    id: 'inc_' + Date.now(),
    ...newRecord,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  localIncidents.unshift(mockCreated);
  notifyIncidentListeners();
  await recordAuditLog('INCIDENT_CREATED', `Incident ${refNum} created locally`, user.email);
  return mockCreated;
};

/**
 * Review & Verify an incident (Administrator)
 */
export const verifyIncident = async (incidentId, priority, adminUser, reviewNote = 'Incident verified.') => {
  const timestamp = new Date().toISOString();
  const statusHistoryEntry = {
    status: 'Verified',
    timestamp,
    changedBy: adminUser.displayName || 'Administrator',
    note: reviewNote
  };

  if (isFirebaseConfigured && db) {
    try {
      const incidentRef = doc(db, 'incidents', incidentId);
      await updateDoc(incidentRef, {
        status: 'Verified',
        verificationState: 'Verified',
        priority: priority || 'High',
        updatedAt: serverTimestamp()
      });
      await recordAuditLog('INCIDENT_VERIFIED', `Incident ${incidentId} marked Verified with priority ${priority}`, adminUser.email);
      return true;
    } catch (e) {
      console.warn('[Firestore] Verify error:', e.message);
    }
  }

  localIncidents = localIncidents.map(inc => {
    if (inc.id === incidentId) {
      return {
        ...inc,
        status: 'Verified',
        verificationState: 'Verified',
        priority: priority || 'High',
        updatedAt: timestamp,
        statusHistory: [...(inc.statusHistory || []), statusHistoryEntry]
      };
    }
    return inc;
  });
  notifyIncidentListeners();
  return true;
};

/**
 * Reject an incident with recorded reason (Administrator)
 */
export const rejectIncident = async (incidentId, rejectionReason, adminUser) => {
  const timestamp = new Date().toISOString();
  const statusHistoryEntry = {
    status: 'Rejected',
    timestamp,
    changedBy: adminUser.displayName || 'Administrator',
    note: `Rejected: ${rejectionReason}`
  };

  if (isFirebaseConfigured && db) {
    try {
      const incidentRef = doc(db, 'incidents', incidentId);
      await updateDoc(incidentRef, {
        status: 'Rejected',
        verificationState: 'Rejected',
        rejectionReason,
        updatedAt: serverTimestamp()
      });
      await recordAuditLog('INCIDENT_REJECTED', `Incident ${incidentId} rejected. Reason: ${rejectionReason}`, adminUser.email);
      return true;
    } catch (e) {
      console.warn('[Firestore] Reject error:', e.message);
    }
  }

  localIncidents = localIncidents.map(inc => {
    if (inc.id === incidentId) {
      return {
        ...inc,
        status: 'Rejected',
        verificationState: 'Rejected',
        rejectionReason,
        updatedAt: timestamp,
        statusHistory: [...(inc.statusHistory || []), statusHistoryEntry]
      };
    }
    return inc;
  });
  notifyIncidentListeners();
  return true;
};

/**
 * Assign a Response Team to an Incident (Administrator)
 */
export const assignTeamToIncident = async (incidentId, team, adminUser, note = 'Response team dispatched.') => {
  const timestamp = new Date().toISOString();
  const statusHistoryEntry = {
    status: 'Assigned',
    timestamp,
    changedBy: adminUser.displayName || 'Administrator',
    note: `Assigned to ${team.name}. ${note}`
  };

  if (isFirebaseConfigured && db) {
    try {
      const incidentRef = doc(db, 'incidents', incidentId);
      await updateDoc(incidentRef, {
        status: 'Assigned',
        assignedTeamId: team.id,
        assignedTeamName: team.name,
        updatedAt: serverTimestamp()
      });
      await recordAuditLog('TEAM_ASSIGNED', `Assigned team ${team.name} to incident ${incidentId}`, adminUser.email);
      return true;
    } catch (e) {
      console.warn('[Firestore] Team assignment error:', e.message);
    }
  }

  localIncidents = localIncidents.map(inc => {
    if (inc.id === incidentId) {
      return {
        ...inc,
        status: 'Assigned',
        assignedTeamId: team.id,
        assignedTeamName: team.name,
        updatedAt: timestamp,
        statusHistory: [...(inc.statusHistory || []), statusHistoryEntry]
      };
    }
    return inc;
  });
  notifyIncidentListeners();
  return true;
};

/**
 * Update Progress Notes (Response Team or Admin)
 */
export const addProgressNote = async (incidentId, noteText, author) => {
  const timestamp = new Date().toISOString();
  const newNote = {
    timestamp,
    author: author || 'Response Unit',
    note: noteText
  };

  if (isFirebaseConfigured && db) {
    try {
      const incidentRef = doc(db, 'incidents', incidentId);
      // In Firestore, push note to array or update
      await updateDoc(incidentRef, {
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.warn('[Firestore] Progress note error:', e.message);
    }
  }

  localIncidents = localIncidents.map(inc => {
    if (inc.id === incidentId) {
      return {
        ...inc,
        updatedAt: timestamp,
        progressNotes: [...(inc.progressNotes || []), newNote]
      };
    }
    return inc;
  });
  notifyIncidentListeners();
  return true;
};

/**
 * Update Incident Status (e.g. In Progress, Resolved)
 */
export const updateIncidentStatus = async (incidentId, newStatus, user, note = '') => {
  const timestamp = new Date().toISOString();
  const statusHistoryEntry = {
    status: newStatus,
    timestamp,
    changedBy: user.displayName || user.email || 'Team',
    note: note || `Status updated to ${newStatus}`
  };

  if (isFirebaseConfigured && db) {
    try {
      const incidentRef = doc(db, 'incidents', incidentId);
      await updateDoc(incidentRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      await recordAuditLog('STATUS_CHANGE', `Incident ${incidentId} set to ${newStatus}`, user.email);
      return true;
    } catch (e) {
      console.warn('[Firestore] Update status error:', e.message);
    }
  }

  localIncidents = localIncidents.map(inc => {
    if (inc.id === incidentId) {
      return {
        ...inc,
        status: newStatus,
        updatedAt: timestamp,
        statusHistory: [...(inc.statusHistory || []), statusHistoryEntry]
      };
    }
    return inc;
  });
  notifyIncidentListeners();
  return true;
};

/**
 * Subscribe to all incidents (Real-time listener for Administrators)
 */
export const subscribeAllIncidents = (callback) => {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'incidents'), orderBy('createdAt', 'desc'));
      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map(d => ({
            id: d.id,
            ...d.data(),
            createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate().toISOString() : d.data().createdAt,
            updatedAt: d.data().updatedAt?.toDate ? d.data().updatedAt.toDate().toISOString() : d.data().updatedAt
          }));
          callback(list);
        } else {
          callback(localIncidents);
        }
      }, (err) => {
        console.warn('[Firestore] All incidents listener error, using local state:', err.message);
        callback(localIncidents);
      });
    } catch (e) {
      console.warn('[Firestore] Incident query setup error:', e.message);
    }
  }

  incidentListeners.add(callback);
  callback([...localIncidents]);
  return () => incidentListeners.delete(callback);
};

/**
 * Subscribe to Citizen's own incidents
 */
export const subscribeCitizenIncidents = (citizenUid, callback) => {
  if (isFirebaseConfigured && db && citizenUid) {
    try {
      const q = query(
        collection(db, 'incidents'),
        where('reporterId', '==', citizenUid),
        orderBy('createdAt', 'desc')
      );
      return onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate().toISOString() : d.data().createdAt,
          updatedAt: d.data().updatedAt?.toDate ? d.data().updatedAt.toDate().toISOString() : d.data().updatedAt
        }));
        callback(list);
      }, (err) => {
        console.warn('[Firestore] Citizen incidents listener error, filtering local:', err.message);
        const filtered = localIncidents.filter(inc => inc.reporterId === citizenUid);
        callback(filtered);
      });
    } catch (e) {
      console.warn('[Firestore] Query error:', e.message);
    }
  }

  const listener = (all) => {
    const userList = all.filter(inc => inc.reporterId === citizenUid || inc.reporterId === 'citizen_demo_id');
    callback(userList);
  };
  incidentListeners.add(listener);
  const initial = localIncidents.filter(inc => inc.reporterId === citizenUid || inc.reporterId === 'citizen_demo_id');
  callback(initial);
  return () => incidentListeners.delete(listener);
};

/**
 * Subscribe to Response Team's assigned incidents
 */
export const subscribeTeamIncidents = (teamId, callback) => {
  if (isFirebaseConfigured && db && teamId) {
    try {
      const q = query(
        collection(db, 'incidents'),
        where('assignedTeamId', '==', teamId)
      );
      return onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));
        callback(list);
      }, (err) => {
        console.warn('[Firestore] Team incidents listener error:', err.message);
        const filtered = localIncidents.filter(inc => inc.assignedTeamId === teamId);
        callback(filtered);
      });
    } catch (e) {
      console.warn('[Firestore] Team query error:', e.message);
    }
  }

  const listener = (all) => {
    const list = all.filter(inc => inc.assignedTeamId === teamId);
    callback(list);
  };
  incidentListeners.add(listener);
  const initial = localIncidents.filter(inc => inc.assignedTeamId === teamId);
  callback(initial);
  return () => incidentListeners.delete(listener);
};
