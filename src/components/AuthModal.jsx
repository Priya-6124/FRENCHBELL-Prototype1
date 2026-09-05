import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  X,
  Phone,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Mail,
  Lock,
  RefreshCw,
  KeyRound,
  Sparkles,
  MessageSquare
} from 'lucide-react';

export default function AuthModal({ onClose }) {
  const {
    sendOtp,
    verifyOtp,
    adminEmailLogin,
    adminForgotPassword,
    adminResetPassword,
    loading,
    lastGeneratedOtp
  } = useAuth();
  const { addNotification } = useApp();

  // Active view: 'customer_phone' | 'customer_otp' | 'admin_login' | 'admin_forgot' | 'admin_reset'
  const [view, setView] = useState('customer_phone');

  // Customer state
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);
  const [otp, setOtp] = useState(['', '', '', '']); // 4-digit OTP
  const [simulatedSmsOtp, setSimulatedSmsOtp] = useState('');
  const [countdown, setCountdown] = useState(30);

  // Admin state
  const [adminEmail, setAdminEmail] = useState('manager@frenchbellcafe.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const otpInputsRef = useRef([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (view === 'customer_otp' && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [view, countdown]);

  // Handle Customer Phone Submission
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMessage('');

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      setError('Please enter a valid mobile number.');
      return;
    }

    try {
      const generatedCode = await sendOtp(cleanPhone);
      setSimulatedSmsOtp(generatedCode);
      setView('customer_otp');
      setCountdown(30);
      setOtp(['', '', '', '']);
      setTimeout(() => {
        if (otpInputsRef.current[0]) otpInputsRef.current[0].focus();
      }, 150);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    }
  };

  // Handle 4-digit OTP input change
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 3) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto submit when all 4 digits are entered
    if (index === 3 && value) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 4) {
        submitVerification(fullOtp);
      }
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!pastedData) return;

    const digits = pastedData.split('');
    const newOtp = [...otp];
    digits.forEach((digit, i) => {
      if (i < 4) newOtp[i] = digit;
    });
    setOtp(newOtp);

    if (newOtp.join('').length === 4) {
      submitVerification(newOtp.join(''));
    } else {
      const nextIndex = Math.min(digits.length, 3);
      otpInputsRef.current[nextIndex]?.focus();
    }
  };

  // Handle backspace navigation
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Verify Customer OTP
  const submitVerification = async (enteredOtp) => {
    setError('');
    const fullOtp = enteredOtp || otp.join('');
    if (fullOtp.length !== 4) {
      setError('Please enter the complete 4-digit OTP');
      return;
    }

    try {
      const res = await verifyOtp(phone, fullOtp, name, whatsappOptIn);
      const displayName = res.user?.name || name || 'Foodie';
      addNotification('Welcome to FrenchBell Cafe', `Logged in as ${displayName}`, 'success');
      if (onClose) onClose();
    } catch (err) {
      setError(err.message || 'The OTP is incorrect. Please try again.');
    }
  };

  // Admin Login Submission
  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!adminEmail || !adminPassword) {
      setError('Please enter both admin email and password');
      return;
    }

    try {
      await adminEmailLogin(adminEmail, adminPassword);
      addNotification('Admin Portal Verified', 'Welcome, FrenchBell Operations Manager', 'success');
      if (onClose) onClose();
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    }
  };

  // Admin Forgot Password Request
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!adminEmail) {
      setError('Please enter your admin email address');
      return;
    }

    try {
      const res = await adminForgotPassword(adminEmail);
      setSuccessMessage(res.message || 'Verification reset code sent to your email.');
      if (res.resetToken) {
        setResetToken(res.resetToken);
      }
      setView('admin_reset');
    } catch (err) {
      setError(err.message || 'Could not find admin account with that email.');
    }
  };

  // Admin Reset Password Submission
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!resetToken || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const res = await adminResetPassword(adminEmail, resetToken, newPassword, confirmPassword);
      setSuccessMessage(res.message || 'Password updated successfully. Please login.');
      setView('admin_login');
      setAdminPassword('');
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please check your token.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-french-dark/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-french-card border border-french-gold/35 rounded-3xl overflow-hidden shadow-2xl">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-french-dark/60 text-french-cream border border-french-gold/30 hover:bg-french-gold hover:text-french-dark transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Banner with Cafe Logo */}
        <div className="p-6 bg-gradient-to-b from-french-dark via-[#24130A] to-french-brown text-french-cream text-center border-b border-french-gold/20 relative">
          <div className="w-16 h-16 rounded-full mx-auto mb-3 bg-french-gold/20 p-1 border border-french-gold shadow-lg flex items-center justify-center">
            <img
              src="/assets/logo.jfif"
              alt="FrenchBell Cafe"
              className="w-full h-full object-contain rounded-full"
            />
          </div>

          <h3 className="font-serif font-extrabold text-2xl text-french-gold">
            {view.startsWith('admin') ? 'Staff & Manager Portal' : 'FrenchBell Cafe'}
          </h3>
          <p className="text-xs text-french-cream/80 mt-1">
            {view.startsWith('admin')
              ? 'Secured management terminal for orders and kitchen operations'
              : 'Sign in with your mobile number for seamless ordering'}
          </p>
        </div>

        {/* Modal Form Body */}
        <div className="p-6 sm:p-8 space-y-5">

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs font-semibold flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* VIEW 1: CUSTOMER PHONE & OPTIONAL NAME */}
          {view === 'customer_phone' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-french-dark mb-1.5">
                  Your Full Name <span className="text-french-muted font-normal text-[11px]">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-4 py-3 rounded-2xl border border-french-gold/30 bg-french-cream/70 text-french-dark text-sm focus:outline-none focus:border-french-gold shadow-inner"
                />
                <span className="text-[11px] text-french-muted mt-1 block">
                  If left blank, you will be assigned a friendly foodie profile.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-french-dark mb-1.5">
                  Mobile Number *
                </label>
                <div className="flex items-center rounded-2xl border border-french-gold/30 bg-french-cream/70 overflow-hidden focus-within:border-french-gold shadow-inner">
                  <span className="px-3.5 py-3 text-sm font-bold text-french-dark/80 bg-french-gold/10 border-r border-french-gold/20">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10-digit mobile"
                    className="w-full px-4 py-3 bg-transparent text-french-dark font-mono font-bold text-sm tracking-widest focus:outline-none"
                    autoFocus
                    required
                  />
                </div>
                <span className="text-[11px] text-french-muted mt-1 block">
                  We'll send a 4-digit OTP verification code.
                </span>
              </div>

              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="whatsapp-optin"
                  checked={whatsappOptIn}
                  onChange={(e) => setWhatsappOptIn(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-french-gold accent-french-gold focus:ring-french-gold"
                />
                <label htmlFor="whatsapp-optin" className="text-xs text-french-muted leading-tight cursor-pointer">
                  Receive order confirmation, live tracking updates, and exclusive deals on WhatsApp.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length < 10}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-french-gold via-french-gold-hover to-[#C09C2E] text-french-dark font-extrabold text-sm uppercase tracking-wider shadow-lg hover:scale-[1.02] active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 gold-glow"
              >
                <span>{loading ? 'Sending Code...' : 'Get 4-Digit OTP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center border-t border-french-gold/15">
                <button
                  type="button"
                  onClick={() => { setView('admin_login'); setError(''); setSuccessMessage(''); }}
                  className="text-xs text-french-muted hover:text-french-gold font-semibold transition-colors underline flex items-center justify-center gap-1.5 mx-auto"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin & Operations Login</span>
                </button>
              </div>
            </form>
          )}

          {/* VIEW 2: 4-DIGIT OTP VERIFICATION */}
          {view === 'customer_otp' && (
            <div className="space-y-5">
              {/* Simulated SMS Alert Banner in development */}
              {simulatedSmsOtp && (
                <div
                  onClick={() => {
                    const digits = simulatedSmsOtp.split('');
                    setOtp(digits);
                    submitVerification(simulatedSmsOtp);
                  }}
                  className="p-3.5 rounded-2xl bg-french-dark text-french-cream border border-french-gold/40 shadow-lg cursor-pointer hover:border-french-gold transition-all"
                >
                  <div className="flex items-center justify-between text-xs text-french-gold font-bold mb-1">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>SMS CODE SIMULATOR</span>
                    </span>
                    <span className="text-[10px] bg-french-gold/20 px-2 py-0.5 rounded-full font-sans">
                      Tap to Autofill
                    </span>
                  </div>
                  <p className="text-xs text-french-cream/90 font-mono">
                    "FrenchBell verification code is <strong className="text-french-gold font-black text-sm">{simulatedSmsOtp}</strong>. Valid for 5 mins."
                  </p>
                </div>
              )}

              <div className="text-center">
                <p className="text-xs text-french-muted">
                  Enter 4-digit code sent to <strong className="text-french-dark font-mono">+91 {phone}</strong>
                </p>
                <button
                  onClick={() => { setView('customer_phone'); setError(''); }}
                  className="text-[11px] text-french-gold font-bold hover:underline mt-0.5"
                >
                  Change Mobile Number
                </button>
              </div>

              {/* 4 Individual Pin Inputs */}
              <div className="flex justify-center items-center gap-3 sm:gap-4" onPaste={handleOtpPaste}>
                {[0, 1, 2, 3].map((idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputsRef.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[idx]}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-13 h-15 sm:w-14 sm:h-16 text-center font-mono font-black text-2xl sm:text-3xl rounded-2xl border-2 border-french-gold/40 bg-french-cream text-french-dark focus:border-french-gold focus:ring-2 focus:ring-french-gold/20 focus:outline-none shadow-md transition-all"
                  />
                ))}
              </div>

              <button
                onClick={() => submitVerification()}
                disabled={loading || otp.join('').length < 4}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-french-gold via-french-gold-hover to-[#C09C2E] text-french-dark font-extrabold text-sm uppercase tracking-wider shadow-lg hover:scale-[1.02] active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 gold-glow"
              >
                <span>{loading ? 'Verifying...' : 'Verify & Continue'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <div className="text-center text-xs text-french-muted">
                {countdown > 0 ? (
                  <span>Resend code in <strong className="font-mono text-french-dark">{countdown}s</strong></span>
                ) : (
                  <button
                    onClick={handleSendOtp}
                    className="text-french-gold font-bold hover:underline inline-flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Resend OTP Code</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* VIEW 3: ADMIN EMAIL & PASSWORD LOGIN */}
          {view === 'admin_login' && (
            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-french-dark mb-1.5">
                  Manager Email Address
                </label>
                <div className="flex items-center rounded-2xl border border-french-gold/30 bg-french-cream/70 overflow-hidden focus-within:border-french-gold shadow-inner px-3 py-1">
                  <Mail className="w-4 h-4 text-french-muted mr-2 flex-shrink-0" />
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="manager@frenchbellcafe.com"
                    className="w-full py-2 bg-transparent text-french-dark text-sm focus:outline-none"
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-french-dark">
                    Admin Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setView('admin_forgot'); setError(''); setSuccessMessage(''); }}
                    className="text-[11px] text-french-gold hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="flex items-center rounded-2xl border border-french-gold/30 bg-french-cream/70 overflow-hidden focus-within:border-french-gold shadow-inner px-3 py-1">
                  <Lock className="w-4 h-4 text-french-muted mr-2 flex-shrink-0" />
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full py-2 bg-transparent text-french-dark text-sm focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !adminEmail || !adminPassword}
                className="w-full py-3.5 rounded-2xl bg-french-dark text-french-gold border border-french-gold font-extrabold text-sm uppercase tracking-wider shadow-lg hover:bg-french-gold hover:text-french-dark transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{loading ? 'Authenticating...' : 'Sign In as Admin'}</span>
              </button>

              <div className="pt-2 text-center border-t border-french-gold/15">
                <button
                  type="button"
                  onClick={() => { setView('customer_phone'); setError(''); setSuccessMessage(''); }}
                  className="text-xs text-french-muted hover:text-french-gold font-semibold transition-colors underline"
                >
                  Return to Customer Mobile Login
                </button>
              </div>
            </form>
          )}

          {/* VIEW 4: ADMIN FORGOT PASSWORD */}
          {view === 'admin_forgot' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div className="text-center mb-2">
                <KeyRound className="w-8 h-8 text-french-gold mx-auto mb-1" />
                <h4 className="font-bold text-french-dark text-sm">Reset Admin Password</h4>
                <p className="text-xs text-french-muted">
                  Enter your registered admin email address to receive a 6-digit recovery code.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-french-dark mb-1.5">
                  Registered Email
                </label>
                <div className="flex items-center rounded-2xl border border-french-gold/30 bg-french-cream/70 overflow-hidden focus-within:border-french-gold shadow-inner px-3 py-1">
                  <Mail className="w-4 h-4 text-french-muted mr-2 flex-shrink-0" />
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="manager@frenchbellcafe.com"
                    className="w-full py-2 bg-transparent text-french-dark text-sm focus:outline-none"
                    autoFocus
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !adminEmail}
                className="w-full py-3.5 rounded-2xl bg-french-gold text-french-dark font-extrabold text-sm uppercase tracking-wider shadow-lg hover:bg-french-gold-hover transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Sending Code...' : 'Send Recovery Code'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => { setView('admin_login'); setError(''); }}
                  className="text-xs text-french-muted hover:text-french-gold font-semibold transition-colors underline"
                >
                  Back to Admin Sign In
                </button>
              </div>
            </form>
          )}

          {/* VIEW 5: ADMIN RESET PASSWORD */}
          {view === 'admin_reset' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-french-dark mb-1.5">
                  6-Digit Recovery Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="e.g. 849201"
                  className="w-full px-4 py-3 rounded-2xl border border-french-gold/30 bg-french-cream/70 text-french-dark text-sm font-mono tracking-widest focus:outline-none focus:border-french-gold shadow-inner"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-french-dark mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-4 py-3 rounded-2xl border border-french-gold/30 bg-french-cream/70 text-french-dark text-sm focus:outline-none focus:border-french-gold shadow-inner"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-french-dark mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-4 py-3 rounded-2xl border border-french-gold/30 bg-french-cream/70 text-french-dark text-sm focus:outline-none focus:border-french-gold shadow-inner"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !resetToken || !newPassword || !confirmPassword}
                className="w-full py-3.5 rounded-2xl bg-french-dark text-french-gold border border-french-gold font-extrabold text-sm uppercase tracking-wider shadow-lg hover:bg-french-gold hover:text-french-dark transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{loading ? 'Updating...' : 'Set New Password'}</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => { setView('admin_login'); setError(''); }}
                  className="text-xs text-french-muted hover:text-french-gold font-semibold transition-colors underline"
                >
                  Cancel & Back to Sign In
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
