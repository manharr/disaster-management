import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../../firebase/config';

// Pre-configured academic demonstration profiles
export const DEMO_PROFILES = {
  citizen: {
    uid: 'citizen_demo_id',
    email: 'citizen@emergency.local',
    displayName: 'Ananya Sharma (Citizen)',
    role: 'citizen',
    phone: '+91-98765-11001',
    address: 'Kurla West, Mumbai'
  },
  admin: {
    uid: 'admin_demo_id',
    email: 'admin@emergency.local',
    displayName: 'Central Command Admin',
    role: 'admin',
    department: 'Disaster Management Authority'
  },
  response_team: {
    uid: 'team_demo_id',
    email: 'response@emergency.local',
    displayName: 'Commander Rajesh (Rescue Alpha)',
    role: 'response_team',
    teamId: 'TEAM-FL-01',
    teamName: 'Rapid Flood Rescue Alpha'
  }
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Start with default demo user as Citizen
  const [currentUser, setCurrentUser] = useState(DEMO_PROFILES.citizen);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Monitor Firebase Auth state when Firebase is active
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch role from Firestore users collection
          let userRole = 'citizen';
          let userDocData = {};

          if (db) {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              userDocData = userDocSnap.data();
              userRole = userDocData.role || 'citizen';
            }
          }

          setCurrentUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || userDocData.name || firebaseUser.email?.split('@')[0],
            role: userRole,
            teamId: userDocData.teamId || null,
            ...userDocData
          });
        } catch (err) {
          console.warn('[Auth] Error fetching user profile from Firestore:', err.message);
          setCurrentUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
            role: 'citizen'
          });
        }
      } else {
        // Fallback or logged out
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Register with Email & Password
   * Security enforcement: Public registration is locked to citizen or response_team, never admin!
   */
  const registerUser = async ({ email, password, name, role = 'citizen', teamId = null }) => {
    setAuthError(null);
    const safeRole = role === 'admin' ? 'citizen' : role; // Prevent self-elevation

    if (isFirebaseConfigured && auth) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });

        if (db) {
          // Create profile record in Firestore
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            name,
            email,
            role: safeRole,
            teamId: safeRole === 'response_team' ? teamId : null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }

        return userCredential.user;
      } catch (err) {
        setAuthError(err.message);
        throw err;
      }
    }

    // Local / Offline Registration
    const mockUser = {
      uid: 'user_' + Date.now(),
      email,
      displayName: name,
      role: safeRole,
      teamId: safeRole === 'response_team' ? teamId : null
    };
    setCurrentUser(mockUser);
    return mockUser;
  };

  /**
   * Log In with Email & Password
   */
  const loginUser = async (email, password) => {
    setAuthError(null);
    if (isFirebaseConfigured && auth) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
      } catch (err) {
        setAuthError(err.message);
        throw err;
      }
    }

    // Local matching for convenience
    if (email.includes('admin')) {
      setCurrentUser(DEMO_PROFILES.admin);
      return DEMO_PROFILES.admin;
    } else if (email.includes('team') || email.includes('response')) {
      setCurrentUser(DEMO_PROFILES.response_team);
      return DEMO_PROFILES.response_team;
    } else {
      const citizenUser = {
        uid: 'user_' + Date.now(),
        email,
        displayName: email.split('@')[0],
        role: 'citizen'
      };
      setCurrentUser(citizenUser);
      return citizenUser;
    }
  };

  /**
   * Log Out
   */
  const logoutUser = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await firebaseSignOut(auth);
      } catch (e) {
        console.warn('[Auth] Sign out error:', e.message);
      }
    }
    setCurrentUser(null);
  };

  /**
   * Quick Role Switcher for Academic Viva / Project Demonstrations
   */
  const switchDemoRole = (roleKey) => {
    if (DEMO_PROFILES[roleKey]) {
      setCurrentUser(DEMO_PROFILES[roleKey]);
      console.log(`[Auth Demo] Switched active role to: ${roleKey}`);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      authError,
      registerUser,
      loginUser,
      logoutUser,
      switchDemoRole,
      isCloudActive: isFirebaseConfigured
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
