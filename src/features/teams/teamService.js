import { 
  collection, 
  addDoc, 
  onSnapshot, 
  serverTimestamp, 
  updateDoc, 
  doc 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../firebase/config';

export const INITIAL_TEAMS = [
  {
    id: 'TEAM-FL-01',
    name: 'Rapid Flood Rescue Alpha',
    specialty: 'Flood Rescue & Water Evacuation',
    leadName: 'Commander Rajesh Sharma',
    contact: '+91-98765-43210',
    memberCount: 6,
    status: 'Available',
    activeIncidents: 0
  },
  {
    id: 'TEAM-FR-02',
    name: 'Hazard & Fire Strike Unit',
    specialty: 'Fire Suppression & Chemical Hazard',
    leadName: 'Capt. Sunita Rao',
    contact: '+91-98765-43211',
    memberCount: 8,
    status: 'Available',
    activeIncidents: 0
  },
  {
    id: 'TEAM-MED-03',
    name: 'Paramedic Emergency Medical Corps',
    specialty: 'Trauma & Medical Evacuation',
    leadName: 'Dr. Amit Patel',
    contact: '+91-98765-43212',
    memberCount: 5,
    status: 'Available',
    activeIncidents: 0
  },
  {
    id: 'TEAM-STR-04',
    name: 'Urban Search & Structural Safety',
    specialty: 'Building Collapse & Debris Clearance',
    leadName: 'Eng. Vikram Sethi',
    contact: '+91-98765-43213',
    memberCount: 7,
    status: 'Available',
    activeIncidents: 0
  }
];

let localTeams = [...INITIAL_TEAMS];
let teamListeners = new Set();

const notifyTeamListeners = () => {
  teamListeners.forEach(listener => listener([...localTeams]));
};

export const subscribeTeams = (callback) => {
  if (isFirebaseConfigured && db) {
    try {
      const q = collection(db, 'teams');
      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const teams = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          callback(teams);
        } else {
          // If empty in Firestore, seed or return initial
          callback(localTeams);
        }
      }, (err) => {
        console.warn('[Firestore] Teams listener error:', err.message);
        callback(localTeams);
      });
    } catch (err) {
      console.warn('[Firestore] Teams subscription error:', err.message);
    }
  }

  teamListeners.add(callback);
  callback([...localTeams]);
  return () => teamListeners.delete(callback);
};

export const createTeam = async (teamData) => {
  const newTeam = {
    ...teamData,
    activeIncidents: 0,
    createdAt: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, 'teams'), newTeam);
      return { id: docRef.id, ...newTeam };
    } catch (err) {
      console.warn('[Firestore] Create team error:', err.message);
    }
  }

  const mockTeam = {
    id: 'TEAM-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
    ...newTeam,
    createdAt: new Date().toISOString()
  };
  localTeams.push(mockTeam);
  notifyTeamListeners();
  return mockTeam;
};

export const updateTeamStatus = async (teamId, status) => {
  if (isFirebaseConfigured && db) {
    try {
      const teamRef = doc(db, 'teams', teamId);
      await updateDoc(teamRef, { status, updatedAt: serverTimestamp() });
      return true;
    } catch (err) {
      console.warn('[Firestore] Update team status error:', err.message);
    }
  }

  localTeams = localTeams.map(t => t.id === teamId ? { ...t, status } : t);
  notifyTeamListeners();
  return true;
};
