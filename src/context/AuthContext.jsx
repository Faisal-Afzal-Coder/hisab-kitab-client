import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hisab_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [business, setBusiness] = useState(() => {
    const saved = localStorage.getItem('hisab_business');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const [brothers, setBrothers] = useState([]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('hisab_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          setBusiness(res.data.business);
          localStorage.setItem('hisab_user', JSON.stringify(res.data.user));
          localStorage.setItem('hisab_business', JSON.stringify(res.data.business));

          // Also load brothers list
          const bRes = await api.get('/auth/brothers');
          setBrothers(bRes.data.brothers || []);
        } catch (err) {
          console.error('[Auth Error]:', err);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('hisab_token', res.data.token);
    localStorage.setItem('hisab_user', JSON.stringify(res.data.user));
    localStorage.setItem('hisab_business', JSON.stringify(res.data.business));
    setUser(res.data.user);
    setBusiness(res.data.business);

    // Refresh brothers
    try {
      const bRes = await api.get('/auth/brothers');
      setBrothers(bRes.data.brothers || []);
    } catch (e) {}

    return res.data;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    localStorage.setItem('hisab_token', res.data.token);
    localStorage.setItem('hisab_user', JSON.stringify(res.data.user));
    localStorage.setItem('hisab_business', JSON.stringify(res.data.business));
    setUser(res.data.user);
    setBusiness(res.data.business);
    return res.data;
  };

  // 1-Click Quick Brother Switcher for collaborative joint business operations!
  const switchBrother = async (brotherIndex) => {
    try {
      const res = await api.post('/auth/switch-brother', { brotherIndex });
      localStorage.setItem('hisab_token', res.data.token);
      localStorage.setItem('hisab_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      console.error('Error switching brother:', err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('hisab_token');
    localStorage.removeItem('hisab_user');
    localStorage.removeItem('hisab_business');
    setUser(null);
    setBusiness(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        brothers,
        loading,
        login,
        register,
        logout,
        switchBrother,
        setBusiness,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
