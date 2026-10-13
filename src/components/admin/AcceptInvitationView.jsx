import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Lock,
  User,
  Mail,
  ArrowRight,
  Clock,
  XCircle,
  Loader2
} from 'lucide-react';

export default function AcceptInvitationView({ onGoToLogin, onGoToSite }) {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [inviteData, setInviteData] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null); // 'invalid' | 'expired' | 'cancelled' | 'accepted' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  // Form inputs
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    setToken(tokenParam || '');

    if (!tokenParam) {
      setErrorStatus('invalid');
      setErrorMessage('No invitation token found in the URL. Please use the complete link from your invitation email.');
      setLoading(false);
      return;
    }

    // Verify token with backend
    fetch(`/api/admin/invite-info?token=${encodeURIComponent(tokenParam)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to verify invitation token.');
        }
        setInviteData(data);
        setErrorStatus(null);
      })
      .catch((err) => {
        const msg = err.message || '';
        if (msg.includes('cancelled')) {
          setErrorStatus('cancelled');
        } else if (msg.includes('expired')) {
          setErrorStatus('expired');
        } else if (msg.includes('accepted') || msg.includes('already')) {
          setErrorStatus('accepted');
        } else {
          setErrorStatus('invalid');
        }
        setErrorMessage(msg || 'This invitation is invalid or has expired.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Please enter your full name.');
      return;
    }

    if (!password) {
      setFormError('Please enter a secure password.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/accept-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          name: name.trim(),
          password,
          confirmPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to accept invitation.');
      }

      setSuccess(true);
    } catch (err) {
      setFormError(err.message || 'Unable to accept invitation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-french-dark text-french-cream flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      
      {/* Decorative background glow */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-french-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-french-gold/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg bg-french-card border-2 border-french-gold/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-french-dark">
        
        {/* Header with Logo */}
        <div className="text-center space-y-2 border-b border-french-gold/25 pb-4">
          <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-french-gold p-1 bg-french-dark shadow-md flex items-center justify-center">
            <img src="/assets/logo.jfif" alt="FrenchBell Cafe" className="w-full h-full object-contain rounded-full" />
          </div>
          <div className="flex items-center justify-center gap-1.5 text-french-gold text-xs font-bold uppercase tracking-widest pt-1">
            <ShieldCheck className="w-4 h-4 text-french-gold" />
            <span>Administrator Onboarding</span>
          </div>
          <h2 className="font-serif font-black text-2xl text-french-dark tracking-wide uppercase">
            Accept Admin Invitation
          </h2>
          <p className="text-xs text-french-muted max-w-sm mx-auto">
            You have been invited to join the FrenchBell Cafe administrative team.
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-french-gold animate-spin mx-auto" />
            <p className="text-xs font-semibold text-french-muted">
              Verifying your invitation token...
            </p>
          </div>
        )}

        {/* Error States: Invalid, Expired, Cancelled, Already Used */}
        {!loading && errorStatus && (
          <div className="py-6 space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center bg-red-100 text-red-600 border border-red-200">
              {errorStatus === 'expired' && <Clock className="w-7 h-7" />}
              {errorStatus === 'cancelled' && <XCircle className="w-7 h-7" />}
              {errorStatus === 'accepted' && <CheckCircle2 className="w-7 h-7" />}
              {errorStatus === 'invalid' && <AlertCircle className="w-7 h-7" />}
            </div>

            <div className="space-y-1">
              <h3 className="font-serif font-black text-lg text-french-dark">
                {errorStatus === 'expired' && 'Invitation Expired'}
                {errorStatus === 'cancelled' && 'Invitation Cancelled'}
                {errorStatus === 'accepted' && 'Invitation Already Accepted'}
                {errorStatus === 'invalid' && 'Invalid Invitation Link'}
              </h3>
              <p className="text-xs text-french-muted leading-relaxed max-w-sm mx-auto">
                {errorMessage}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onGoToSite}
                className="flex-1 py-3 rounded-2xl bg-french-cream border border-french-gold/40 text-french-dark font-bold text-xs uppercase tracking-wider hover:bg-french-gold/20 transition-all"
              >
                Go to Cafe Website
              </button>
              <button
                type="button"
                onClick={onGoToLogin}
                className="flex-1 py-3 rounded-2xl bg-french-dark text-french-gold font-bold text-xs uppercase tracking-wider hover:bg-french-gold hover:text-french-dark transition-all shadow"
              >
                Admin Sign-In
              </button>
            </div>
          </div>
        )}

        {/* Success State */}
        {!loading && success && (
          <div className="py-6 space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center bg-emerald-100 text-emerald-600 border border-emerald-300">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-serif font-black text-xl text-french-dark">
                Welcome to the FrenchBell Team!
              </h3>
              <p className="text-xs text-french-muted max-w-sm mx-auto leading-relaxed">
                Your administrator account has been created successfully. You can now log in using your email (<strong className="text-french-dark">{inviteData?.email}</strong>) and your new password.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onGoToLogin}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-french-gold via-french-gold-hover to-[#C09C2E] text-french-dark font-extrabold text-xs uppercase tracking-wider shadow-lg hover:scale-102 transition-all flex items-center justify-center gap-2 gold-glow"
              >
                <span>Proceed to Admin Sign-In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Active Form */}
        {!loading && !errorStatus && !success && inviteData && (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {formError && (
              <div className="p-3.5 rounded-2xl bg-red-100 border border-red-300 text-red-800 text-xs font-semibold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Email (Locked & bound to invitation) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-french-dark mb-1">
                Your Email Address (Locked)
              </label>
              <div className="flex items-center rounded-2xl border border-french-gold/30 bg-french-cream/80 px-3.5 py-2.5 text-french-dark text-xs font-mono shadow-inner">
                <Mail className="w-4 h-4 text-french-gold mr-2.5 shrink-0" />
                <span className="font-bold">{inviteData.email}</span>
                <span className="ml-auto text-[10px] text-french-muted font-sans font-semibold uppercase">Bound</span>
              </div>
              <span className="text-[10px] text-french-muted mt-1 block">
                This administrator account is bound to {inviteData.email} and cannot be modified.
              </span>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-french-dark mb-1">
                Full Name *
              </label>
              <div className="flex items-center rounded-2xl border border-french-gold/40 bg-white px-3.5 py-2 focus-within:border-french-gold focus-within:ring-2 focus-within:ring-french-gold/20 shadow-sm">
                <User className="w-4 h-4 text-french-gold mr-2.5 shrink-0" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Nair"
                  className="w-full bg-transparent text-french-dark text-xs font-medium focus:outline-none"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-french-dark mb-1">
                Set Administrator Password *
              </label>
              <div className="flex items-center rounded-2xl border border-french-gold/40 bg-white px-3.5 py-2 focus-within:border-french-gold focus-within:ring-2 focus-within:ring-french-gold/20 shadow-sm">
                <Lock className="w-4 h-4 text-french-gold mr-2.5 shrink-0" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-transparent text-french-dark text-xs font-medium focus:outline-none"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-french-dark mb-1">
                Confirm Password *
              </label>
              <div className="flex items-center rounded-2xl border border-french-gold/40 bg-white px-3.5 py-2 focus-within:border-french-gold focus-within:ring-2 focus-within:ring-french-gold/20 shadow-sm">
                <Lock className="w-4 h-4 text-french-gold mr-2.5 shrink-0" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type your password"
                  className="w-full bg-transparent text-french-dark text-xs font-medium focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-french-gold via-french-gold-hover to-[#C09C2E] text-french-dark font-extrabold text-xs uppercase tracking-wider shadow-lg hover:scale-102 active:scale-98 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 gold-glow"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Activating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Accept Invitation & Join</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onGoToSite}
                className="w-full py-2.5 text-center text-xs text-french-muted hover:text-french-dark font-medium transition-colors"
              >
                Cancel and return to cafe
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
