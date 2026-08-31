import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { X, Phone, ShieldCheck, ArrowRight, CheckCircle2, Sparkles, MessageSquare } from 'lucide-react';

export default function AuthModal({ onClose }) {
  const { sendOtp, verifyOtp, adminLogin, loading, lastGeneratedOtp } = useAuth();
  const { addNotification } = useApp();

  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'admin'
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [simulatedSmsOtp, setSimulatedSmsOtp] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [adminPasscode, setAdminPasscode] = useState('');

  const otpInputsRef = useRef([]);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      const generatedCode = await sendOtp(cleanPhone);
      setSimulatedSmsOtp(generatedCode);
      setStep('otp');
      setCountdown(30);
      setOtp(['', '', '', '']);
      setTimeout(() => {
        if (otpInputsRef.current[0]) otpInputsRef.current[0].focus();
      }, 150);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 3) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto submit when all 4 digits filled
    if (index === 3 && value) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 4) {
        submitVerification(fullOtp);
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const submitVerification = async (enteredOtp) => {
    setError('');
    const fullOtp = enteredOtp || otp.join('');
    if (fullOtp.length !== 4) {
      setError('Please enter complete 4-digit OTP');
      return;
    }

    try {
      await verifyOtp(phone, fullOtp, name);
      addNotification('Welcome to French Bell! 🔔', `Logged in as ${name || 'Foodie'}`, 'success');
      if (onClose) onClose();
    } catch (err) {
      setError(err.message || 'Invalid OTP code. Please try again.');
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await adminLogin(adminPasscode);
      addNotification('Admin Mode Activated 🛡️', 'Welcome French Bell Operations Manager', 'success');
      if (onClose) onClose();
    } catch (err) {
      setError(err.message || 'Invalid admin passcode');
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
              alt="French Bell Cafe"
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          
          <h3 className="font-serif font-extrabold text-2xl text-french-gold">
            {step === 'admin' ? 'Operations Access' : 'French Bell Cafe'}
          </h3>
          <p className="text-xs text-french-cream/80 mt-0.5">
            {step === 'admin'
              ? 'Cafe Manager & KOT Operations Terminal'
              : 'Login with Mobile Number to start ordering delicious food 🔔'}
          </p>
        </div>

        {/* Modal Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          
          {error && (
            <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 text-xs font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: MOBILE NUMBER ENTRY */}
          {step === 'phone' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-french-dark mb-1.5">
                  Your Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Sharma"
                  className="w-full px-4 py-3 rounded-2xl border border-french-gold/30 bg-french-cream/70 text-french-dark text-sm focus:outline-none focus:border-french-gold shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-french-dark mb-1.5">
                  Mobile Number *
                </label>
                <div className="flex items-center rounded-2xl border border-french-gold/30 bg-french-cream/70 overflow-hidden focus-within:border-french-gold shadow-inner">
                  <span className="px-3.5 py-3 text-sm font-bold text-french-dark/80 bg-french-gold/10 border-r border-french-gold/20">
                    🇮🇳 +91
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
                  We'll send a quick 4-digit OTP to verify your mobile number.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length < 10}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-french-gold via-french-gold-hover to-[#C09C2E] text-french-dark font-extrabold text-sm uppercase tracking-wider shadow-lg hover:scale-[1.02] active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 gold-glow"
              >
                <span>{loading ? 'Sending OTP...' : 'Get OTP Code'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => { setStep('admin'); setError(''); }}
                  className="text-xs text-french-muted hover:text-french-gold font-semibold transition-colors underline"
                >
                  Admin / Operations Passcode Login
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: 4-DIGIT OTP VERIFICATION */}
          {step === 'otp' && (
            <div className="space-y-5">
              {/* Simulated SMS Alert Banner */}
              {simulatedSmsOtp && (
                <div
                  onClick={() => {
                    const digits = simulatedSmsOtp.split('');
                    setOtp(digits);
                    submitVerification(simulatedSmsOtp);
                  }}
                  className="p-3.5 rounded-2xl bg-french-dark text-french-cream border border-french-gold/40 shadow-lg cursor-pointer hover:border-french-gold transition-all animate-bounce"
                >
                  <div className="flex items-center justify-between text-xs text-french-gold font-bold mb-1">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>SIMULATED SMS NOTIFICATION</span>
                    </span>
                    <span className="text-[10px] bg-french-gold/20 px-2 py-0.5 rounded-full">Tap to Autofill ⚡</span>
                  </div>
                  <p className="text-xs text-french-cream/90 font-mono">
                    "Your French Bell verification code is <strong className="text-french-gold font-black text-sm">{simulatedSmsOtp}</strong>. Valid for 10 mins."
                  </p>
                </div>
              )}

              <div className="text-center">
                <p className="text-xs text-french-muted">
                  Enter 4-digit code sent to <strong className="text-french-dark font-mono">+91 {phone}</strong>
                </p>
                <button
                  onClick={() => setStep('phone')}
                  className="text-[11px] text-french-gold font-bold hover:underline mt-0.5"
                >
                  Change Number
                </button>
              </div>

              {/* 4 Pin Inputs */}
              <div className="flex justify-center items-center gap-3">
                {[0, 1, 2, 3].map((idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputsRef.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[idx]}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e.target.value ? null : e)}
                    className="w-13 h-14 sm:w-14 sm:h-16 text-center font-mono font-black text-2xl rounded-2xl border-2 border-french-gold/30 bg-french-cream text-french-dark focus:border-french-gold focus:ring-2 focus:ring-french-gold/20 focus:outline-none shadow-sm transition-all"
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
                    className="text-french-gold font-bold hover:underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: ADMIN ACCESS */}
          {step === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-french-dark mb-1.5">
                  Admin Passcode
                </label>
                <input
                  type="password"
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  placeholder="Enter manager passcode (e.g. admin123)"
                  className="w-full px-4 py-3 rounded-2xl border border-french-gold/30 bg-french-cream/70 text-french-dark text-sm focus:outline-none focus:border-french-gold shadow-inner"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !adminPasscode}
                className="w-full py-3.5 rounded-2xl bg-french-dark text-french-gold border border-french-gold font-extrabold text-sm uppercase tracking-wider shadow-lg hover:bg-french-gold hover:text-french-dark transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Enter Admin Operations</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => { setStep('phone'); setError(''); }}
                  className="text-xs text-french-muted hover:text-french-gold font-semibold transition-colors underline"
                >
                  ← Back to Customer Mobile Login
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
