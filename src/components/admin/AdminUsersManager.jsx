import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Users, UserPlus, Mail, ShieldCheck, Clock, RefreshCw, XCircle,
  AlertTriangle, Trash2, CheckCircle2, MoreVertical, Ban, Send, Eye
} from 'lucide-react';

export default function AdminUsersManager() {
  const { token, user: currentAdmin } = useAuth();
  const { addNotification } = useApp();

  const [admins, setAdmins] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Invite Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');

  // Confirmation Modal State
  const [confirmDialog, setConfirmDialog] = useState(null);

  // Fetch admin team & invitations
  const fetchAdminData = () => {
    setLoading(true);
    fetch('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setAdmins(data.admins || []);
          setInvitations(data.invitations || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  // Handle Send Invitation
  const handleSendInvite = async (e) => {
    e.preventDefault();
    setInviteError('');
    setInviteLoading(true);

    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: inviteEmail.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send invitation');

      addNotification('Invitation Sent', `Invitation sent to ${inviteEmail.trim()}`, 'success');
      setInviteEmail('');
      setShowInviteModal(false);
      fetchAdminData();
    } catch (err) {
      setInviteError(err.message || 'Failed to send invitation.');
    } finally {
      setInviteLoading(false);
    }
  };

  // Handle Resend Invitation
  const handleResendInvite = async (invitationId, email) => {
    try {
      const res = await fetch(`/api/admin/invitations/${invitationId}/resend`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend invitation');

      addNotification('Invitation Resent', `Fresh invitation sent to ${email}`, 'success');
      fetchAdminData();
    } catch (err) {
      addNotification('Error', err.message, 'error');
    }
  };

  // Handle Cancel Invitation
  const handleCancelInvite = async (invitationId, email) => {
    try {
      const res = await fetch(`/api/admin/invitations/${invitationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel invitation');

      addNotification('Invitation Cancelled', `Pending invitation for ${email} cancelled`, 'info');
      fetchAdminData();
    } catch (err) {
      addNotification('Error', err.message, 'error');
    }
  };

  // Handle Suspend Admin (With Last Admin Protection)
  const handleToggleSuspend = async (admin) => {
    try {
      const res = await fetch(`/api/admin/users/${admin.id}/suspend`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update administrator status');

      addNotification('Status Updated', data.message, 'info');
      fetchAdminData();
    } catch (err) {
      addNotification('Action Prohibited', err.message, 'error');
    } finally {
      setConfirmDialog(null);
    }
  };

  // Handle Remove Admin (With Last Admin Protection)
  const handleRemoveAdmin = async (admin) => {
    try {
      const res = await fetch(`/api/admin/users/${admin.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove administrator');

      addNotification('Admin Removed', data.message, 'info');
      fetchAdminData();
    } catch (err) {
      addNotification('Action Prohibited', err.message, 'error');
    } finally {
      setConfirmDialog(null);
    }
  };

  const activeAdminsCount = admins.filter(a => a.status === 'active').length;

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="p-6 rounded-3xl bg-french-dark text-french-cream border border-french-gold/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-french-gold text-xs font-bold uppercase tracking-widest mb-1.5">
            <ShieldCheck className="w-4 h-4 text-french-gold" />
            <span>Administrator Directory & Access</span>
          </div>
          <h2 className="font-serif font-black text-2xl text-french-cream">
            ADMIN USERS
          </h2>
          <p className="text-xs text-french-cream/80 mt-1 max-w-xl">
            Manage authorized cafe administrators. All active administrators share full operational access. Only existing administrators can invite new members.
          </p>
        </div>

        <button
          onClick={() => { setShowInviteModal(true); setInviteError(''); setInviteEmail(''); }}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-french-gold to-french-gold-hover text-french-dark font-extrabold text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 gold-glow"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Invite Admin</span>
        </button>
      </div>

      {/* Active Administrators Table */}
      <div className="bg-french-card border border-french-gold/30 rounded-3xl overflow-hidden shadow-lg space-y-3">
        <div className="p-5 border-b border-french-gold/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-serif font-bold text-lg text-french-dark">
              Active Administrators ({admins.length})
            </h3>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 border border-emerald-500/30 uppercase">
              {activeAdminsCount} Active
            </span>
          </div>
          <button
            onClick={fetchAdminData}
            className="p-1.5 rounded-xl hover:bg-french-cream text-french-muted hover:text-french-dark transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-french-dark text-french-gold uppercase tracking-wider font-extrabold text-[11px]">
              <tr>
                <th className="p-4">Administrator</th>
                <th className="p-4">Email Address</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-french-gold/15 text-french-dark font-medium">
              {admins.map((adm) => {
                const isCurrent = adm.id === currentAdmin?.id;
                const isSuspended = adm.status === 'suspended';

                return (
                  <tr key={adm.id} className="hover:bg-french-cream/60 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-french-dark text-french-gold flex items-center justify-center font-bold font-serif text-xs border border-french-gold/40 shadow-sm">
                          {adm.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-serif font-bold text-sm text-french-dark block">
                            {adm.name}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-bold text-french-gold uppercase">
                              (You)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-mono text-french-muted">
                      {adm.email}
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase inline-flex items-center gap-1 ${
                        isSuspended
                          ? 'bg-red-500/20 text-red-700 border border-red-500/40'
                          : 'bg-emerald-500/20 text-emerald-800 border border-emerald-500/40'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isSuspended ? 'bg-red-500' : 'bg-emerald-500'}`} />
                        <span>{isSuspended ? 'Suspended' : 'Active'}</span>
                      </span>
                    </td>

                    <td className="p-4 text-french-muted">
                      {adm.created_at ? new Date(adm.created_at).toLocaleDateString() : 'Initial Setup'}
                    </td>

                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setConfirmDialog({
                            type: isSuspended ? 'unsuspend' : 'suspend',
                            admin: adm,
                            title: isSuspended ? `Reactivate ${adm.name}?` : `Suspend ${adm.name}?`,
                            message: isSuspended
                              ? `Are you sure you want to restore administrator access for ${adm.email}?`
                              : `Are you sure you want to suspend administrator access for ${adm.email}? They will no longer be able to log in.`,
                            onConfirm: () => handleToggleSuspend(adm)
                          });
                        }}
                        className={`px-3 py-1 rounded-xl font-bold text-[11px] uppercase transition-all ${
                          isSuspended
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-amber-500/20 hover:bg-amber-500 text-amber-900 border border-amber-500/40'
                        }`}
                      >
                        {isSuspended ? 'Reactivate' : 'Suspend'}
                      </button>

                      <button
                        onClick={() => {
                          setConfirmDialog({
                            type: 'remove',
                            admin: adm,
                            title: `Remove Administrator ${adm.name}?`,
                            message: `This will permanently delete ${adm.email} from administrator accounts. This action requires confirmation.`,
                            onConfirm: () => handleRemoveAdmin(adm)
                          });
                        }}
                        className="px-3 py-1 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-600 hover:text-white font-bold text-[11px] uppercase transition-all border border-red-500/30"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Invitations Table */}
      <div className="bg-french-card border border-french-gold/30 rounded-3xl overflow-hidden shadow-lg space-y-3">
        <div className="p-5 border-b border-french-gold/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-french-gold" />
            <h3 className="font-serif font-bold text-lg text-french-dark">
              Pending Invitations ({invitations.length})
            </h3>
          </div>
          <span className="text-xs text-french-muted">
            Tokens expire automatically after 72 hours
          </span>
        </div>

        {invitations.length === 0 ? (
          <div className="p-8 text-center text-french-muted text-xs">
            No pending administrator invitations. Click "+ Invite Admin" above to send one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-french-dark text-french-gold uppercase tracking-wider font-extrabold text-[11px]">
                <tr>
                  <th className="p-4">Invited Email</th>
                  <th className="p-4">Invited By</th>
                  <th className="p-4">Sent At</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-french-gold/15 text-french-dark font-medium">
                {invitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-french-cream/60 transition-colors">
                    <td className="p-4 font-mono font-bold text-french-dark">
                      {inv.email}
                    </td>

                    <td className="p-4 text-french-muted">
                      {inv.invited_by_name || inv.invited_by || 'Admin'}
                    </td>

                    <td className="p-4 text-french-muted">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-900 border border-amber-500/40 inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span>Pending</span>
                      </span>
                    </td>

                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleResendInvite(inv.id, inv.email)}
                        className="px-3 py-1 rounded-xl bg-french-gold/20 hover:bg-french-gold hover:text-french-dark text-french-dark font-bold text-[11px] uppercase transition-all border border-french-gold/40"
                      >
                        Resend Invitation
                      </button>

                      <button
                        onClick={() => {
                          setConfirmDialog({
                            type: 'cancel_invite',
                            title: `Cancel Invitation for ${inv.email}?`,
                            message: `This will invalidate the invitation link sent to ${inv.email}.`,
                            onConfirm: () => handleCancelInvite(inv.id, inv.email)
                          });
                        }}
                        className="px-3 py-1 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-600 hover:text-white font-bold text-[11px] uppercase transition-all border border-red-500/30"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-french-dark/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-french-dark border-2 border-french-gold rounded-3xl p-6 sm:p-7 shadow-2xl text-french-cream space-y-5 gold-glow">
            <div className="flex items-center justify-between pb-3 border-b border-french-gold/30">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-french-gold" />
                <h3 className="font-serif font-black text-xl text-french-gold">
                  Invite New Administrator
                </h3>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-french-cream/60 hover:text-french-cream p-1"
              >
                ✕
              </button>
            </div>

            {inviteError && (
              <div className="p-3 rounded-2xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{inviteError}</span>
              </div>
            )}

            <form onSubmit={handleSendInvite} className="space-y-4">
              <p className="text-xs text-french-cream/80 leading-relaxed">
                Enter the personal email address of the person you wish to invite. A secure single-use invitation link with 72-hour validity will be sent directly to their email.
              </p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-french-cream/90 mb-1.5">
                  Email Address *
                </label>
                <div className="flex items-center rounded-2xl border border-french-gold/40 bg-french-brown/50 overflow-hidden focus-within:border-french-gold shadow-inner px-3 py-1">
                  <Mail className="w-4 h-4 text-french-gold mr-2.5 shrink-0" />
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="e.g. rahul@gmail.com"
                    className="w-full py-2.5 bg-transparent text-french-cream text-sm focus:outline-none placeholder-french-cream/40"
                    autoFocus
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-french-brown/70 hover:bg-french-brown text-french-cream font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={inviteLoading || !inviteEmail}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-french-gold to-french-gold-hover text-french-dark font-extrabold text-xs uppercase tracking-wider shadow-lg hover:scale-102 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 gold-glow"
                >
                  <span>{inviteLoading ? 'Sending Invitation...' : 'Send Invitation'}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-french-dark/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm bg-french-dark border-2 border-red-500/70 rounded-3xl p-6 shadow-2xl text-french-cream space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-serif font-black text-lg text-french-cream">
                {confirmDialog.title}
              </h3>
            </div>

            <p className="text-xs text-french-cream/80 leading-relaxed">
              {confirmDialog.message}
            </p>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="flex-1 py-2.5 rounded-2xl bg-french-brown/70 hover:bg-french-brown text-french-cream font-bold text-xs uppercase tracking-wider transition-colors"
              >
                No, Cancel
              </button>

              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="flex-1 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg"
              >
                Yes, Proceed
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
