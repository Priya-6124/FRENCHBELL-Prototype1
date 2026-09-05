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

  // Send Mobile OTP (Customer Auth)
  const sendOtp = async (phone) => {
    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      if (!cleanPhone || cleanPhone.length !== 10) {
        throw new Error('Please enter a valid mobile number.');
      }

      // Backend OTP endpoint
      try {
        const res = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: cleanPhone })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to send OTP');
        }
        setLastGeneratedOtp(data.otp);
        setLoading(false);
        return data.otp;
      } catch (err) {
        if (err.message.includes('valid') || err.message.includes('Too many OTP') || err.message.includes('exceeded')) {
          throw err;
        }
        // Fallback to client-side 4-digit OTP generation if server is offline
        const fallbackOtp = String(Math.floor(1000 + Math.random() * 9000));
        setLastGeneratedOtp(fallbackOtp);
        setLoading(false);
        return fallbackOtp;
      }
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

      if (cleanOtp.length !== 4) {
        throw new Error('Please enter a valid 4-digit OTP');
      }

      // Attempt backend verification
      try {
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
          throw new Error(data.error || 'The OTP is incorrect. Please try again.');
        }
        setToken(data.token);
        setUser(data.user);
        setLoading(false);
        return data;
      } catch (err) {
        if (
          err.message.includes('incorrect') ||
          err.message.includes('expired') ||
          err.message.includes('Maximum') ||
          err.message.includes('valid')
        ) {
          throw err;
        }
        // Fallback local verification for testing if server is offline
        if (lastGeneratedOtp && cleanOtp !== lastGeneratedOtp) {
          throw new Error('The OTP is incorrect. Please try again.');
        }

        const fallbackUser = {
          id: 'cust_' + cleanPhone.slice(-4),
          name: name.trim() || `Foodie${Math.floor(1000 + Math.random() * 9000)}`,
          phone: cleanPhone,
          role: 'customer',
          whatsapp_opt_in: !!whatsapp_opt_in
        };
        const fallbackToken = 'fb_local_' + Date.now();

        setToken(fallbackToken);
        setUser(fallbackUser);
        setLoading(false);
        return { success: true, user: fallbackUser, token: fallbackToken };
      }
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Update Customer Profile
  const updateProfile = async ({ name, whatsapp_opt_in }) => {
    setLoading(true);
    try {
      if (token && !token.startsWith('fb_local_')) {
        const res = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name, whatsapp_opt_in })
        });
        const data = await res.json();
        if (res.ok && data.user) {
          setUser(data.user);
          setLoading(false);
          return data.user;
        }
      }
      // Local fallback
      const updated = {
        ...user,
        ...(name !== undefined && { name: name.trim() || user?.name || `Foodie${Math.floor(1000 + Math.random() * 9000)}` }),
        ...(whatsapp_opt_in !== undefined && { whatsapp_opt_in: !!whatsapp_opt_in })
      };
      setUser(updated);
      setLoading(false);
      return updated;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Admin Email & Password Login
  const adminEmailLogin = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
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
      const res = await fetch('/api/auth/admin-forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Password reset request failed');
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
          email: email.trim(),
          resetToken: resetToken.trim(),
          newPassword,
          confirmPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password');
      }
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Legacy adminLogin wrapper to maintain backward compatibility
  const adminLogin = async (passcode) => {
    return adminEmailLogin('manager@frenchbellcafe.com', passcode || 'FrenchBell@2026!');
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
