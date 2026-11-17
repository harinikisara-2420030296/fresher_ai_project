import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { syncUserWithBackend, fetchCurrentUser } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('fresher_ai_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and check existing session
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('fresher_ai_token');
      if (savedToken) {
        try {
          const res = await fetchCurrentUser();
          if (res?.success && res.data) {
            setUser(res.data);
            setToken(savedToken);
          } else {
            // Token expired or invalid
            localStorage.removeItem('fresher_ai_token');
            setToken(null);
            setUser(null);
          }
        } catch (err) {
          console.warn('Session restoration failed:', err.message);
          // If in offline mode, restore cached user
          const cachedUser = localStorage.getItem('fresher_ai_cached_user');
          if (cachedUser) {
            try {
              setUser(JSON.parse(cachedUser));
            } catch (e) {
              setUser(null);
            }
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
      throw new Error('Firebase Auth is not configured. Please use Demo Student Sign In.');
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const syncPayload = {
        firebaseUid: result.user.uid,
        name: result.user.displayName || 'Fresher Candidate',
        email: result.user.email,
        photoURL: result.user.photoURL || ''
      };

      // Set token first for api interceptor
      localStorage.setItem('fresher_ai_token', idToken);
      setToken(idToken);

      const syncRes = await syncUserWithBackend(syncPayload);
      const userData = syncRes.data;

      setUser(userData);
      localStorage.setItem('fresher_ai_cached_user', JSON.stringify(userData));
      return userData;
    } catch (err) {
      localStorage.removeItem('fresher_ai_token');
      setToken(null);
      setUser(null);
      throw err;
    }
  };

  const signInAsDemo = async () => {
    const demoUid = 'demo_user_harini_123';
    const demoToken = `mock_token_${demoUid}`;

    localStorage.setItem('fresher_ai_token', demoToken);
    setToken(demoToken);

    const demoPayload = {
      firebaseUid: demoUid,
      name: 'Kisara Harini',
      email: 'harini.kisara@college.edu',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    };

    try {
      const syncRes = await syncUserWithBackend(demoPayload);
      const userData = syncRes.data;
      setUser(userData);
      localStorage.setItem('fresher_ai_cached_user', JSON.stringify(userData));
      return userData;
    } catch (err) {
      console.warn('Backend sync failed, using offline demo user state:', err.message);
      const fallbackUser = {
        _id: 'demo_user_db_id',
        firebaseUid: demoUid,
        name: 'Kisara Harini',
        email: 'harini.kisara@college.edu',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        coins: 3590,
        resume: {
          fileName: 'Harini_Kisara_Resume.pdf',
          text: 'Experienced in React, Node.js, Express, MongoDB, and REST APIs.',
          uploadedAt: new Date().toISOString()
        }
      };
      setUser(fallbackUser);
      localStorage.setItem('fresher_ai_cached_user', JSON.stringify(fallbackUser));
      return fallbackUser;
    }
  };

  const signInCustom = async (name, email) => {
    const safeName = name?.trim() || 'Kisara Harini';
    const safeEmail = email?.trim() || 'harini.kisara@college.edu';
    const safeUid = `user_${safeEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const token = `mock_token_${safeUid}`;

    localStorage.setItem('fresher_ai_token', token);
    setToken(token);

    const payload = {
      firebaseUid: safeUid,
      name: safeName,
      email: safeEmail,
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    };

    try {
      const syncRes = await syncUserWithBackend(payload);
      const userData = syncRes.data;
      setUser(userData);
      localStorage.setItem('fresher_ai_cached_user', JSON.stringify(userData));
      return userData;
    } catch (err) {
      console.warn('Backend sync note, using client user state:', err.message);
      const fallbackUser = {
        _id: `id_${safeUid}`,
        firebaseUid: safeUid,
        name: safeName,
        email: safeEmail,
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        coins: 1000,
        resume: {
          fileName: `${safeName.replace(/\s+/g, '_')}_Resume.pdf`,
          text: `Resume of ${safeName}. Proficient in JavaScript, React, Node.js, and Full-Stack Engineering.`,
          uploadedAt: new Date().toISOString()
        }
      };
      setUser(fallbackUser);
      localStorage.setItem('fresher_ai_cached_user', JSON.stringify(fallbackUser));
      return fallbackUser;
    }
  };

  const logout = async () => {
    try {
      if (auth) {
        await fbSignOut(auth);
      }
    } catch (e) {
      // Ignore signOut errors
    }
    localStorage.removeItem('fresher_ai_token');
    localStorage.removeItem('fresher_ai_cached_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await fetchCurrentUser();
      if (res?.success && res.data) {
        setUser(res.data);
        localStorage.setItem('fresher_ai_cached_user', JSON.stringify(res.data));
      }
    } catch (err) {
      console.warn('Failed to refresh user profile:', err.message);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      signInWithGoogle,
      signInAsDemo,
      signInCustom,
      logout,
      refreshUser,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

