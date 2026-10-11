import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('fb_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('fb_token') || null);
  const [loading, setLoading] = useState(false);
  const [lastGeneratedOtp, setLastGeneratedOtp] = useState(null);

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

  // Send Mobile OTP (Customer Auth via Real SMS Provider)
  const sendOtp = async (phone) => {
    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      if (!cleanPhone || cleanPhone.length !== 10) {
        throw new Error('Please enter a valid 10-digit mobile number.');
      }

      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send verification code.');
      }

      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Verify Mobile OTP (Customer Auth)
  const verifyOtp = async (phone, enteredOtp, name = '', whatsapp_opt_in = true) => {
    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      const cleanOtp = String(enteredOtp).trim();

      if (!cleanOtp || cleanOtp.length < 4) {
        throw new Error('Please enter a valid verification code.');
      }

      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          otp: cleanOtp,
          name: name.trim(),
          whatsapp_opt_in: !!whatsapp_opt_in
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'The verification code is incorrect. Please try again.');
      }

      setToken(data.token);
      setUser(data.user);
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Update Customer Profile
  const updateProfile = async ({ name, whatsapp_opt_in }) => {
    setLoading(true);
    try {
      if (!token) throw new Error('Authentication required.');

      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, whatsapp_opt_in })
      });
      const data = await res.json();
      if (!res.ok || !data.user) {
        throw new Error(data.error || 'Failed to update profile.');
      }

      setUser(data.user);
      setLoading(false);
      return data.user;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Admin Email & Password Authentication
  const adminEmailLogin = async (email, password) => {
    setLoading(true);
    try {
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPassword = (password || '').trim();

      if (!cleanEmail || !cleanPassword) {
        throw new Error('Please enter both admin email and password.');
      }

      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid administrator email address or password.');
      }

      setToken(data.token);
      setUser(data.user);
      setLoading(false);
      return data.user;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Admin Forgot Password
  const adminForgotPassword = async (email) => {
    setLoading(true);
    try {
      const cleanEmail = (email || '').trim().toLowerCase();
      if (!cleanEmail) throw new Error('Email address is required.');

      const res = await fetch('/api/auth/admin-forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Password reset request failed.');
      }
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Admin Reset Password
  const adminResetPassword = async (email, resetToken, newPassword, confirmPassword) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/admin-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: resetToken.trim(),
          newPassword,
          confirmPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password.');
      }
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const adminLogin = async (emailOrPasscode, maybePassword) => {
    if (maybePassword) {
      return adminEmailLogin(emailOrPasscode, maybePassword);
    }
    // If single argument, treat as email or prompt
    return adminEmailLogin(emailOrPasscode, '');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('fb_token');
    localStorage.removeItem('fb_user');
  };

  const isAdmin = user && user.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAdmin,
      loading,
      sendOtp,
      verifyOtp,
      updateProfile,
      adminEmailLogin,
      adminForgotPassword,
      adminResetPassword,
      adminLogin,
      logout,
      lastGeneratedOtp
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
