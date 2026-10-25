import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp, 
  where,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../firebase/config';

/**
 * Initial Simulated Sensor Hardware Profiles
 */
export const INITIAL_SENSORS = [
  {
    id: 'SENSOR-WL-01',
    name: 'Mithi River Water Level Sensor',
    type: 'water-level',
    unit: 'cm',
    location: 'Mithi River Basin - BKC Bridge, Mumbai',
    lat: 19.0607,
    lng: 72.8685,
    normalRange: { min: 40, max: 120 },
    threshold: 150,
    currentValue: 68,
    status: 'NORMAL',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'SENSOR-TMP-02',
    name: 'Sanjay Gandhi Forest Thermal Node',
    type: 'temperature',
    unit: '°C',
    location: 'Borivali East Ridge - Tower 3, Mumbai',
    lat: 19.2183,
    lng: 72.9128,
    normalRange: { min: 24, max: 36 },
    threshold: 45,
    currentValue: 31.2,
    status: 'NORMAL',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'SENSOR-SMK-03',
    name: 'Chembur Industrial Smoke Detector',
    type: 'smoke',
    unit: 'Index (0-100)',
    location: 'Mahul Petrochemical Belt - Chembur, Mumbai',
    lat: 19.0178,
    lng: 72.8988,
    normalRange: { min: 5, max: 35 },
    threshold: 65,
    currentValue: 22,
    status: 'NORMAL',
    lastUpdated: new Date().toISOString()
  }
];

// Local state cache for development / offline / preview mode
let localReadings = [];
let localAlerts = [];
let localListeners = new Set();

const notifyLocalListeners = () => {
  localListeners.forEach(listener => listener({
    readings: [...localReadings],
    alerts: [...localAlerts]
  }));
};

/**
 * Record a simulated sensor reading
 */
export const recordSensorReading = async (readingData) => {
  const reading = {
    ...readingData,
    isSimulated: true,
    timestamp: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      const readingsRef = collection(db, 'sensorReadings');
      const docRef = await addDoc(readingsRef, reading);
      return { id: docRef.id, ...reading };
    } catch (err) {
      console.warn('[Firestore] Error recording sensor reading:', err.message);
    }
  }

  // Local fallback
  const mockReading = {
    id: 'read_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    ...reading,
    timestamp: new Date().toISOString()
  };
  localReadings.unshift(mockReading);
  if (localReadings.length > 100) localReadings.pop(); // Cap at 100 for memory
  notifyLocalListeners();
  return mockReading;
};

/**
 * Trigger and record a threshold alert
 */
export const recordSensorAlert = async (alertData) => {
  const alertRecord = {
    ...alertData,
    isSimulated: true,
    status: 'ACTIVE',
    createdAt: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      const alertsRef = collection(db, 'sensorAlerts');
      const docRef = await addDoc(alertsRef, alertRecord);
      return { id: docRef.id, ...alertRecord };
    } catch (err) {
      console.warn('[Firestore] Error recording sensor alert:', err.message);
    }
  }

  const mockAlert = {
    id: 'alert_' + Date.now(),
    ...alertRecord,
    createdAt: new Date().toISOString()
  };
  localAlerts.unshift(mockAlert);
  notifyLocalListeners();
  return mockAlert;
};

/**
 * Acknowledge or resolve an alert
 */
export const acknowledgeAlert = async (alertId, notes = 'Acknowledged by operator') => {
  if (isFirebaseConfigured && db) {
    try {
      const alertRef = doc(db, 'sensorAlerts', alertId);
      await updateDoc(alertRef, {
        status: 'ACKNOWLEDGED',
        acknowledgedAt: serverTimestamp(),
        adminNotes: notes
      });
      return true;
    } catch (err) {
      console.warn('[Firestore] Error acknowledging alert:', err);
    }
  }

  // Local fallback
  localAlerts = localAlerts.map(a => 
    a.id === alertId ? { ...a, status: 'ACKNOWLEDGED', acknowledgedAt: new Date().toISOString(), adminNotes: notes } : a
  );
  notifyLocalListeners();
  return true;
};

/**
 * Subscribe to real-time sensor readings
 */
export const subscribeSensorReadings = (callback, maxItems = 25) => {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, 'sensorReadings'),
        orderBy('timestamp', 'desc'),
        limit(maxItems)
      );
      return onSnapshot(q, (snapshot) => {
        const readings = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
          timestamp: d.data().timestamp?.toDate ? d.data().timestamp.toDate().toISOString() : d.data().timestamp
        }));
        callback(readings);
      }, (error) => {
        console.warn('[Firestore] Readings listener error, falling back to local cache:', error.message);
        callback(localReadings.slice(0, maxItems));
      });
    } catch (err) {
      console.warn('[Firestore] Read subscription setup error:', err.message);
    }
  }

  // Local subscription
  const localCallback = ({ readings }) => callback(readings.slice(0, maxItems));
  localListeners.add(localCallback);
  callback(localReadings.slice(0, maxItems));
  return () => localListeners.delete(localCallback);
};

/**
 * Subscribe to real-time sensor alerts
 */
export const subscribeSensorAlerts = (callback) => {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, 'sensorAlerts'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      return onSnapshot(q, (snapshot) => {
        const alerts = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate().toISOString() : d.data().createdAt
        }));
        callback(alerts);
      }, (error) => {
        console.warn('[Firestore] Alerts listener error, falling back to local cache:', error.message);
        callback(localAlerts);
      });
    } catch (err) {
      console.warn('[Firestore] Alert subscription setup error:', err.message);
    }
  }

  const localCallback = ({ alerts }) => callback(alerts);
  localListeners.add(localCallback);
  callback(localAlerts);
  return () => localListeners.delete(localCallback);
};
