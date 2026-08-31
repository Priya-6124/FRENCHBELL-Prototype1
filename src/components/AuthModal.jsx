import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { X, Lock, Phone, User, Mail, ShieldCheck } from 'lucide-react';

export default function AuthModal({ onClose }) {
  const { login, register, loading } = useAuth();
  const { addNotification } = useApp();
  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      if (isRegister) {
        await register(name, phone, email, password);
        addNotification('Account Created 🎉', 'Welcome to French Bell Cafe!', 'success');
      } else {
        await login(phone, password);
        addNotification('Welcome Back 🔔', 'Logged in successfully!', 'success');
      }
      if (onClose) onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Authentication error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-french-dark/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-french-card border border-french-gold/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-french-cream text-french-dark hover:bg-french-gold/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-full overflow-hidden border border-french-gold p-0.5 bg-french-dark shadow-md">
            <img src="/assets/logo.jfif" alt="French Bell Cafe" className="w-full h-full object-contain rounded-full" />
          </div>
          <h3 className="font-serif font-extrabold text-2xl text-french-dark">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h3>
          <p className="text-xs text-french-muted">
            {isRegister ? 'Join French Bell for rewards & fast checkout' : 'Sign in to your account'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-french-dark mb-1">
                Full Name *
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-french-gold" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60 text-sm focus:outline-none focus:border-french-gold"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-french-dark mb-1">
              Mobile Phone / Admin Email *
            </label>
            <div className="relative flex items-center">
              <Phone className="absolute left-3.5 w-4 h-4 text-french-gold" />
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit phone or admin email"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60 text-sm focus:outline-none focus:border-french-gold font-medium"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-french-dark mb-1">
                Email Address (Optional)
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-french-gold" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60 text-sm focus:outline-none focus:border-french-gold"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-french-dark mb-1">
              Password *
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-french-gold" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-french-gold/30 bg-french-cream/60 text-sm focus:outline-none focus:border-french-gold"
              />
            </div>
          </div>

          {/* Quick Credential Hint for Demo Testing */}
          <div className="p-3 rounded-xl bg-french-gold/10 border border-french-gold/30 text-[11px] text-french-dark space-y-1">
            <span className="font-bold block text-french-gold">Demo Quick Sign-In Credentials:</span>
            <p>• Admin: <code className="bg-french-dark text-french-gold px-1 rounded">admin@frenchbell.com</code> / <code className="bg-french-dark text-french-gold px-1 rounded">admin123</code></p>
            <p>• Customer: <code className="bg-french-dark text-french-gold px-1 rounded">9123456789</code> / <code className="bg-french-dark text-french-gold px-1 rounded">customer123</code></p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-french-dark text-french-gold font-extrabold uppercase tracking-wider hover:bg-french-gold hover:text-french-dark transition-all gold-glow"
          >
            {loading ? 'Authenticating...' : (isRegister ? 'Create Account' : 'Sign In ➔')}
          </button>
        </form>

        {/* Toggle Login/Register */}
        <div className="text-center text-xs text-french-muted pt-2 border-t border-french-gold/20">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button onClick={() => setIsRegister(false)} className="font-bold text-french-gold hover:underline">
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account yet?{' '}
              <button onClick={() => setIsRegister(true)} className="font-bold text-french-gold hover:underline">
                Register Now
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
