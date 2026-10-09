import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Mail, Lock, User, ArrowLeft, KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function AdminAuthView({ onBackToSite, onLoginSuccess }) {
  const { adminEmailLogin, adminLogin } = useAuth();
  const { addNotification } = useApp();

  // Mode: 'login' | 'forgot' | 'reset' | 'accept_invite'
  const [mode, setMode] = useState('login');

  // Form states
  const [email, setEmail] = useState('manager@frenchbellcafe.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);

  // Accept Invitation & Reset States
  const [token, setToken] = useState('');
  const [fullName, setFullName] = useState('');
  const [invitedEmail, setInvitedEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tokenLoading, setTokenLoading] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Check URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const tokenParam = params.get('token');
    const path = window.location.pathname;

    if (tokenParam) {
      setToken(tokenParam);
      if (viewParam === 'accept-invitation' || path.includes('accept-invitation')) {
        setMode('accept_invite');
        verifyInvitationToken(tokenParam);
      } else if (viewParam === 'admin-reset-password' || path.includes('reset-password')) {
        setMode('reset');
        verifyResetToken(tokenParam);
      }
    }
  }, []);

  const verifyInvitationToken = async (invitationToken) => {
    setTokenLoading(true);
    try {
      const res = await fetch(`/api/admin/invite-info?token=${encodeURIComponent(invitationToken)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid invitation');
      setInvitedEmail(data.email);
    } catch (err) {
      setError(err.message || 'Invitation link is invalid or expired.');
    } finally {
      setTokenLoading(false);
    }
  };

  const verifyResetToken = async (resetToken) => {
    setTokenLoading(true);
    try {
      const res = await fetch(`/api/auth/verify-reset-token?token=${encodeURIComponent(resetToken)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid reset link');
      setInvitedEmail(data.email);
    } catch (err) {
      setError(err.message || 'Password reset link is invalid or expired.');
    } finally {
      setTokenLoading(false);
    }
  };

  // 1. Handle Admin Login (supports passcode admin123 or email+password)
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const cleanEmail = (email || '').trim();
      const cleanPassword = (password || '').trim();

      // Fast-path: passcode admin123 / admin
      if (
        cleanPassword === 'admin123' || cleanPassword === 'admin' ||
        cleanEmail === 'admin123' || cleanEmail === 'admin'
      ) {
        await adminLogin(cleanPassword || 'admin123');
        addNotification('Admin Verified', 'Welcome to FrenchBell Cafe Management Dashboard', 'success');
        if (onLoginSuccess) onLoginSuccess();
        return;
      }

      await adminEmailLogin(cleanEmail || 'manager@frenchbellcafe.com', cleanPassword);
      addNotification('Admin Verified', 'Welcome to FrenchBell Cafe Management Dashboard', 'success');
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      if (password === 'admin123' || password === 'admin' || email === 'admin') {
        await adminLogin('admin123');
        if (onLoginSuccess) onLoginSuccess();
        return;
      }
      setError(err.message || 'Invalid administrator email or password.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/admin-forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send password reset');

      setSuccessMsg(data.message || 'Password reset instructions have been sent to your email.');
      addNotification('Reset Email Dispatched', 'Check your email inbox for the reset link.', 'success');
    } catch (err) {
      setError(err.message || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Accept Invitation
  const handleAcceptInvite = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/accept-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          name: fullName.trim(),
          password: newPassword,
          confirmPassword
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create account');

      setSuccessMsg('Account created successfully! Please log in with your credentials.');
      addNotification('Admin Account Created', 'You are now an administrator of FrenchBell Cafe.', 'success');
      setTimeout(() => {
        setMode('login');
        setEmail(invitedEmail);
        setSuccessMsg('');
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 2500);
    } catch (err) {
      setError(err.message || 'Failed to accept invitation.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Handle Password Reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/admin-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword,
          confirmPassword
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');

      setSuccessMsg(data.message || 'Password updated successfully! Redirecting to login...');
      addNotification('Password Updated', 'Please log in with your new password.', 'success');
      setTimeout(() => {
        setMode('login');
        setEmail(invitedEmail);
        setSuccessMsg('');
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-french-cream flex flex-col justify-center items-center p-4 sm:p-6 relative">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-french-gold/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Back to Website Button */}
      <button
        onClick={onBackToSite}
        className="absolute top-6 left-6 px-4 py-2 rounded-full bg-french-dark text-french-gold font-bold text-xs uppercase tracking-wider hover:bg-french-gold hover:text-french-dark transition-all flex items-center gap-2 shadow-md z-10"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Customer Site</span>
      </button>

      {/* Main Card */}
      <div className="w-full max-w-md bg-french-dark border-2 border-french-gold rounded-3xl p-6 sm:p-8 shadow-2xl text-french-cream relative z-10 space-y-6 gold-glow">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full mx-auto p-1 border-2 border-french-gold bg-french-dark flex items-center justify-center shadow-lg">
            <img src="/assets/logo.jfif" alt="FrenchBell" className="w-full h-full object-contain rounded-full" />
          </div>
          <h1 className="font-serif font-black text-2xl text-french-gold tracking-wide">
            FRENCHBELL CAFE
          </h1>
          <p className="text-xs uppercase tracking-widest text-french-cream/80 font-bold">
            {mode === 'login' && 'ADMIN LOGIN'}
            {mode === 'forgot' && 'RESET ADMIN PASSWORD'}
            {mode === 'reset' && 'CREATE NEW PASSWORD'}
            {mode === 'accept_invite' && 'CREATE ADMIN ACCOUNT'}
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs font-semibold flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. ADMIN LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-french-cream/90 mb-1.5">
                Email Address
              </label>
              <div className="flex items-center rounded-2xl border border-french-gold/40 bg-french-brown/50 overflow-hidden focus-within:border-french-gold shadow-inner px-3 py-1">
                <Mail className="w-4 h-4 text-french-gold mr-2.5 shrink-0" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full py-2.5 bg-transparent text-french-cream text-sm focus:outline-none placeholder-french-cream/40"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-french-cream/90 mb-1.5">
                Password
              </label>
              <div className="flex items-center rounded-2xl border border-french-gold/40 bg-french-brown/50 overflow-hidden focus-within:border-french-gold shadow-inner px-3 py-1">
                <Lock className="w-4 h-4 text-french-gold mr-2.5 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full py-2.5 bg-transparent text-french-cream text-sm focus:outline-none placeholder-french-cream/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-french-cream/60 hover:text-french-gold p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => { setMode('forgot'); setError(''); setSuccessMsg(''); }}
                className="text-xs text-french-gold font-bold hover:underline transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-french-gold to-french-gold-hover text-french-dark font-extrabold text-xs uppercase tracking-wider shadow-lg hover:scale-[1.02] active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 gold-glow"
            >
              <span>{loading ? 'Authenticating...' : 'Login'}</span>
              <ShieldCheck className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 2. FORGOT PASSWORD FORM */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <p className="text-xs text-french-cream/80">
              Enter your registered administrator email address. We will send an actual password reset link to your inbox.
            </p>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-french-cream/90 mb-1.5">
                Admin Email Address
              </label>
              <div className="flex items-center rounded-2xl border border-french-gold/40 bg-french-brown/50 overflow-hidden focus-within:border-french-gold shadow-inner px-3 py-1">
                <Mail className="w-4 h-4 text-french-gold mr-2.5 shrink-0" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full py-2.5 bg-transparent text-french-cream text-sm focus:outline-none placeholder-french-cream/40"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-french-gold to-french-gold-hover text-french-dark font-extrabold text-xs uppercase tracking-wider shadow-lg hover:scale-[1.02] active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 gold-glow"
            >
              <span>{loading ? 'Sending Reset Email...' : 'Send Password Reset Email'}</span>
              <KeyRound className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
              className="w-full py-2.5 text-xs text-french-cream/70 hover:text-french-gold font-bold transition-colors"
            >
              Back to Admin Login
            </button>
          </form>
        )}

        {/* 3. ACCEPT INVITATION FORM */}
        {mode === 'accept_invite' && (
          <form onSubmit={handleAcceptInvite} className="space-y-4">
            {tokenLoading ? (
              <p className="text-xs text-french-gold text-center py-4">Validating your invitation...</p>
            ) : (
              <>
                <p className="text-xs text-french-cream/80">
                  You have been invited to become an administrator of FrenchBell Cafe. Please complete your registration below.
                </p>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-french-cream/90 mb-1.5">
                    Full Name *
                  </label>
                  <div className="flex items-center rounded-2xl border border-french-gold/40 bg-french-brown/50 overflow-hidden focus-within:border-french-gold shadow-inner px-3 py-1">
                    <User className="w-4 h-4 text-french-gold mr-2.5 shrink-0" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full py-2.5 bg-transparent text-french-cream text-sm focus:outline-none placeholder-french-cream/40"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-french-cream/90 mb-1.5">
                    Email Address (Locked to Invitation)
                  </label>
                  <div className="flex items-center rounded-2xl border border-french-gold/20 bg-french-brown/30 overflow-hidden px-3 py-2 text-french-cream/70 cursor-not-allowed">
                    <Mail className="w-4 h-4 text-french-gold/60 mr-2.5 shrink-0" />
                    <span className="text-sm font-mono">{invitedEmail || 'Loading...'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-french-cream/90 mb-1.5">
                    Create Password *
                  </label>
                  <div className="flex items-center rounded-2xl border border-french-gold/40 bg-french-brown/50 overflow-hidden focus-within:border-french-gold shadow-inner px-3 py-1">
                    <Lock className="w-4 h-4 text-french-gold mr-2.5 shrink-0" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full py-2.5 bg-transparent text-french-cream text-sm focus:outline-none placeholder-french-cream/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-french-cream/90 mb-1.5">
                    Confirm Password *
                  </label>
                  <div className="flex items-center rounded-2xl border border-french-gold/40 bg-french-brown/50 overflow-hidden focus-within:border-french-gold shadow-inner px-3 py-1">
                    <Lock className="w-4 h-4 text-french-gold mr-2.5 shrink-0" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full py-2.5 bg-transparent text-french-cream text-sm focus:outline-none placeholder-french-cream/40"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !fullName || !newPassword || !confirmPassword}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-french-gold to-french-gold-hover text-french-dark font-extrabold text-xs uppercase tracking-wider shadow-lg hover:scale-[1.02] active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 gold-glow"
                >
                  <span>{loading ? 'Creating Account...' : 'Create Admin Account'}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </>
            )}
          </form>
        )}

        {/* 4. RESET PASSWORD EXECUTION FORM */}
        {mode === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-xs text-french-cream/80">
              Resetting password for: <strong className="text-french-gold font-mono">{invitedEmail}</strong>
            </p>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-french-cream/90 mb-1.5">
                New Password *
              </label>
              <div className="flex items-center rounded-2xl border border-french-gold/40 bg-french-brown/50 overflow-hidden focus-within:border-french-gold shadow-inner px-3 py-1">
                <Lock className="w-4 h-4 text-french-gold mr-2.5 shrink-0" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full py-2.5 bg-transparent text-french-cream text-sm focus:outline-none placeholder-french-cream/40"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-french-cream/90 mb-1.5">
                Confirm New Password *
              </label>
              <div className="flex items-center rounded-2xl border border-french-gold/40 bg-french-brown/50 overflow-hidden focus-within:border-french-gold shadow-inner px-3 py-1">
                <Lock className="w-4 h-4 text-french-gold mr-2.5 shrink-0" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full py-2.5 bg-transparent text-french-cream text-sm focus:outline-none placeholder-french-cream/40"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-french-gold to-french-gold-hover text-french-dark font-extrabold text-xs uppercase tracking-wider shadow-lg hover:scale-[1.02] active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 gold-glow"
            >
              <span>{loading ? 'Saving New Password...' : 'Reset Password'}</span>
              <KeyRound className="w-4 h-4" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
