import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const INACTIVITY_LIMIT_MS = 30 * 60 * 1000; // 30 minutes

export const AuthProvider = ({ children }) => {
  const { showToast } = useToast?.() || { showToast: () => {} };

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('adminToken');
    const lastActive = localStorage.getItem('adminLastActivityTime');
    if (!token) return false;
    if (lastActive && Date.now() - Number(lastActive) > INACTIVITY_LIMIT_MS) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminLastActivityTime');
      return false;
    }
    return true;
  });

  const lastRecordedActivityRef = useRef(Date.now());

  const logout = useCallback((message = "Admin session ended") => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminLastActivityTime');
    setIsAuthenticated(false);
    if (showToast) {
      showToast(message, "info");
    }
  }, [showToast]);

  const login = (token) => {
    const now = Date.now();
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminLastActivityTime', now.toString());
    lastRecordedActivityRef.current = now;
    setIsAuthenticated(true);
    if (showToast) {
      showToast("Admin authenticated successfully", "success");
    }
  };

  const recordActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastRecordedActivityRef.current > 5000) {
      lastRecordedActivityRef.current = now;
      localStorage.setItem('adminLastActivityTime', now.toString());
    }
  }, []);

  // 30-Minute Inactivity Monitor
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkExpiration = () => {
      const storedTime = Number(localStorage.getItem('adminLastActivityTime')) || lastRecordedActivityRef.current;
      if (Date.now() - storedTime >= INACTIVITY_LIMIT_MS) {
        logout("Admin session expired due to inactivity. Please log in again.");
      }
    };

    checkExpiration();

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    const handleInteraction = () => {
      recordActivity();
    };

    events.forEach(eventName => {
      window.addEventListener(eventName, handleInteraction, { passive: true });
    });

    const intervalId = setInterval(checkExpiration, 10000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkExpiration();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const handleStorageChange = (e) => {
      if (e.key === 'adminToken' && !e.newValue) {
        setIsAuthenticated(false);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      events.forEach(eventName => {
        window.removeEventListener(eventName, handleInteraction);
      });
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated, logout, recordActivity]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, recordActivity }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
