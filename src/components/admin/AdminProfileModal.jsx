import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { User, Mail, Shield, Calendar, Clock, Lock, KeyRound, LogOut, CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function AdminProfileModal({ onClose, onLogout }) {
  const { user, token, logout } = useAuth();
  const handleLogout = () => {
    logout();
    if (onLogout) onLogout();
    if (onClose) onClose();
  };
  const { addNotification } = useApp();

  const [name, setName] = useState(user?.name || '');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);

  // Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setNameLoading(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: name.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update name');

      setNameSuccess(true);
      addNotification('Profile Saved', 'Admin name updated successfully.', 'success');
      setTimeout(() => setNameSuccess(false), 3000);
    } catch (err) {
      addNotification('Error', err.message, 'error');
    } finally {
      setNameLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess(false);

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPassError('Password must be at least 6 characters long');
      return;
    }

    setPassLoading(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');

      setPassSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      addNotification('Password Changed', 'Your admin password was updated successfully.', 'success');
    } catch (err) {
      setPassError(err.message || 'Failed to update password');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-french-dark/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-french-dark border-2 border-french-gold rounded-3xl p-6 sm:p-8 shadow-2xl text-french-cream space-y-6 max-h-[90vh] overflow-y-auto gold-glow">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-french-gold/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-french-gold text-french-dark flex items-center justify-center font-bold font-serif text-lg shadow">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <h3 className="font-serif font-black text-xl text-french-gold">
                Admin Profile
              </h3>
              <span className="text-[11px] text-french-cream/70 font-mono">
                {user?.email}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-french-brown text-french-cream/70 hover:text-french-cream transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-french-brown/50 border border-french-gold/30 text-xs">
          <div>
            <span className="text-[10px] text-french-cream/60 uppercase font-bold block">Account Status</span>
            <span className="font-bold text-emerald-400 uppercase inline-flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{user?.status || 'Active'}</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] text-french-cream/60 uppercase font-bold block">Access Level</span>
            <span className="font-bold text-french-gold inline-flex items-center gap-1 mt-0.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Cafe Administrator</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] text-french-cream/60 uppercase font-bold block">Joined Date</span>
            <span className="font-mono text-french-cream/90 mt-0.5 block">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active Member'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-french-cream/60 uppercase font-bold block">Last Login</span>
            <span className="font-mono text-french-cream/90 mt-0.5 block">
              {user?.last_login ? new Date(user.last_login).toLocaleTimeString() : 'Current Session'}
            </span>
          </div>
        </div>

        {/* Change Name Form */}
        <form onSubmit={handleUpdateName} className="space-y-3 p-4 rounded-2xl bg-french-brown/30 border border-french-gold/20">
          <label className="block text-xs font-bold uppercase tracking-wider text-french-cream">
            Display Name
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-french-gold/40 bg-french-dark text-french-cream text-xs font-semibold focus:outline-none focus:border-french-gold"
            />
            <button
              type="submit"
              disabled={nameLoading}
              className="px-4 py-2.5 rounded-xl bg-french-gold hover:bg-french-gold-hover text-french-dark font-extrabold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
            >
              {nameLoading ? 'Saving...' : (nameSuccess ? 'Saved!' : 'Update Name')}
            </button>
          </div>
        </form>

        {/* Change Password Form */}
        <form onSubmit={handleChangePassword} className="space-y-3 p-4 rounded-2xl bg-french-brown/30 border border-french-gold/20">
          <div className="flex items-center gap-1.5 text-french-gold text-xs font-bold uppercase tracking-wider">
            <KeyRound className="w-4 h-4" />
            <span>Change Admin Password</span>
          </div>

          {passError && (
            <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
              <span>{passError}</span>
            </div>
          )}

          {passSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <span>Password updated successfully!</span>
            </div>
          )}

          <div className="space-y-2">
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current Password"
              className="w-full px-3.5 py-2 rounded-xl border border-french-gold/40 bg-french-dark text-french-cream text-xs placeholder-french-cream/40 focus:outline-none focus:border-french-gold"
            />
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password (min 6 characters)"
              className="w-full px-3.5 py-2 rounded-xl border border-french-gold/40 bg-french-dark text-french-cream text-xs placeholder-french-cream/40 focus:outline-none focus:border-french-gold"
            />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm New Password"
              className="w-full px-3.5 py-2 rounded-xl border border-french-gold/40 bg-french-dark text-french-cream text-xs placeholder-french-cream/40 focus:outline-none focus:border-french-gold"
            />
          </div>

          <button
            type="submit"
            disabled={passLoading || !currentPassword || !newPassword}
            className="w-full py-2.5 rounded-xl bg-french-gold/20 hover:bg-french-gold hover:text-french-dark text-french-gold border border-french-gold/40 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
          >
            {passLoading ? 'Updating Password...' : 'Save New Password'}
          </button>
        </form>

        {/* Logout Footer */}
        <div className="pt-2 flex justify-between items-center border-t border-french-gold/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-french-cream/70 hover:text-french-cream text-xs font-bold"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Administrator</span>
          </button>
        </div>

      </div>
    </div>
  );
}
