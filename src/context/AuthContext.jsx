import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('fb_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('fb_token') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('fb_token', token);
    } else {
      localStorage.removeItem('fb_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('fb_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('fb_user');
    }
  }, [user]);

  const login = async (phone, password) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      setToken(data.token);
      setUser(data.user);
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const register = async (name, phone, email, password) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      setToken(data.token);
      setUser(data.user);
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('fb_token');
    localStorage.removeItem('fb_user');
  };

  const isAdmin = user && user.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
