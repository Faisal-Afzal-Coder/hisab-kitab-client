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
        loading,
        login,
        register,
        logout,
        setBusiness,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
