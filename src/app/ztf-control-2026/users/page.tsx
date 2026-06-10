'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock, ShieldCheck, Shield, UserPlus, RefreshCw, Trash2,
  Copy, Check, AlertCircle, Eye, EyeOff, X,
} from 'lucide-react';
import { createClientClient } from '@/lib/supabase/client';

type AdminUser = {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  role: 'super_admin' | 'sub_admin';
  permissions: string[];
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
};

const ALL_PERMISSIONS: { key: string; label: string; superAdminOnly?: boolean }[] = [
  { key: 'home_settings', label: 'Home & Settings' },
  { key: 'schools_programs', label: 'Schools & Programs' },
  { key: 'faculty_management', label: 'Faculty Management' },
  { key: 'admissions', label: 'Admissions' },
  { key: 'gallery_media', label: 'Gallery & Media' },
  { key: 'blog_management', label: 'Blog Management' },
  { key: 'contact_messages', label: 'Contact Messages' },
  { key: 'admin_users', label: 'Admin Users', superAdminOnly: true },
];

function fmt(date: string | null) {
  if (!date) return 'Never';
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function generatePassword() {
  const part1 = Math.random().toString(36).slice(2, 8);
  const part2 = Math.random().toString(36).slice(2, 8).toUpperCase();
  return part1 + part2 + '!1';
}

function AccessDenied() {
  const router = useRouter();
  const [count, setCount] = useState(3);

  useEffect(() => {
    const t = setInterval(() => setCount(c => c - 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (count <= 0) router.push('/ztf-control-2026');
  }, [count, router]);

  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
        <Lock className="w-10 h-10 text-red-500" />
      </div>
      <h1 className="text-2xl font-bold text-[#0A1628] font-heading mb-3">Access Denied</h1>
      <p className="text-gray-500 max-w-sm mb-4">
        This section is restricted to super administrators only.
      </p>
      <p className="text-sm text-gray-400">
        Redirecting in <span className="font-bold text-[#0A1628]">{count}</span>…
      </p>
    </div>
  );
}

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [subAdmins, setSubAdmins] = useState<AdminUser[]>([]);
  const [accessDenied, setAccessDenied] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', permissions: [] as string[] });
  const [tempPassword, setTempPassword] = useState(generatePassword());
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [createStatus, setCreateStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [createError, setCreateError] = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState<Record<string, boolean>>({});
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const supabase = createClientClient();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setAccessDenied(true); setLoading(false); return; }

      const { data: adminData } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!adminData || adminData.role !== 'super_admin') {
        setAccessDenied(true);
        setLoading(false);
        return;
      }
      setCurrentUser(adminData);

      const { data: subs } = await supabase
        .from('admin_users')
        .select('*')
        .eq('role', 'sub_admin')
        .order('created_at', { ascending: false });

      setSubAdmins(subs || []);
    } catch {
      setAccessDenied(true);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const togglePermission = (key: string) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter(p => p !== key)
        : [...prev.permissions, key],
    }));
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim()) return;
    setCreateStatus('saving');
    setCreateError('');
    try {
      const { error } = await supabase.from('admin_users').insert({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        role: 'sub_admin',
        permissions: form.permissions,
        is_active: true,
        user_id: null,
      });
      if (error) throw error;
      setCreateStatus('success');
      await load();
    } catch (err: unknown) {
      setCreateStatus('error');
      setCreateError(err instanceof Error ? err.message : 'Failed to create sub-admin.');
    }
  };

  const resetModal = () => {
    setShowCreateModal(false);
    setCreateStatus('idle');
    setCreateError('');
    setForm({ full_name: '', email: '', permissions: [] });
    setTempPassword(generatePassword());
    setShowPassword(false);
    setCopied(false);
  };

  const toggleActive = async (admin: AdminUser) => {
    setTogglingId(admin.id);
    const newVal = !admin.is_active;
    await supabase.from('admin_users').update({ is_active: newVal }).eq('id', admin.id);
    setSubAdmins(prev => prev.map(a => a.id === admin.id ? { ...a, is_active: newVal } : a));
    setTogglingId(null);
  };

  const sendResetPassword = async (admin: AdminUser) => {
    await supabase.auth.resetPasswordForEmail(admin.email, {
      redirectTo: `${window.location.origin}/ztf-control-2026/login`,
    });
    setResetEmailSent(prev => ({ ...prev, [admin.id]: true }));
    setTimeout(() => setResetEmailSent(prev => { const n = { ...prev }; delete n[admin.id]; return n; }), 5000);
  };

  const deleteAdmin = async (id: string) => {
    setDeletingId(id);
    await supabase.from('admin_users').delete().eq('id', id);
    setSubAdmins(prev => prev.filter(a => a.id !== id));
    setDeleteConfirm(null);
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-300" />
      </div>
    );
  }

  if (accessDenied) return <AccessDenied />;

  const maxReached = subAdmins.length >= 2;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0A1628] font-heading">Admin Users</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage administrator accounts and permissions.</p>
      </div>

      {/* Current User Card */}
      {currentUser && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#0A1628] rounded-2xl flex items-center justify-center text-[#C9A84C] font-bold text-xl flex-shrink-0">
                {currentUser.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-[#0A1628] text-lg font-heading">{currentUser.full_name}</p>
                  <span className="text-xs bg-[#C9A84C]/20 text-[#0A1628] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Super Admin
                  </span>
                  <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-0.5 rounded-full">Your Account</span>
                </div>
                <p className="text-gray-500 text-sm">{currentUser.email}</p>
                <p className="text-gray-400 text-xs mt-0.5">Last login: {fmt(currentUser.last_login_at)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-admins section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-[#0A1628] font-heading">Sub-Administrators</h2>
            <p className="text-gray-400 text-xs mt-0.5">{subAdmins.length}/2 sub-admins created</p>
          </div>
          {!maxReached && (
            <button
              onClick={() => { resetModal(); setShowCreateModal(true); }}
              className="flex items-center gap-1.5 bg-[#0A1628] text-white font-bold text-sm px-4 py-2 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition"
            >
              <UserPlus className="w-4 h-4" /> Create Sub-Admin
            </button>
          )}
        </div>

        {maxReached && (
          <div className="mx-6 mt-5 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              Maximum of 2 sub-administrators reached. Delete an existing sub-admin to add a new one.
            </p>
          </div>
        )}

        {subAdmins.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Shield className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="font-semibold text-gray-500">No sub-admins yet.</p>
            <p className="text-sm mt-1">Create a sub-admin to delegate access.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide hidden md:table-cell">Permissions</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Last Login</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wide">Active</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {subAdmins.map(admin => {
                  const permLabels = (admin.permissions || [])
                    .map(p => ALL_PERMISSIONS.find(x => x.key === p)?.label || p)
                    .join(', ');
                  return (
                    <tr key={admin.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center text-[#0A1628] font-bold text-sm flex-shrink-0">
                            {admin.full_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-[#0A1628]">{admin.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 hidden sm:table-cell">{admin.email}</td>
                      <td className="px-6 py-4 text-gray-400 text-xs hidden md:table-cell max-w-xs">
                        {permLabels
                          ? (permLabels.length > 60 ? permLabels.slice(0, 60) + '…' : permLabels)
                          : <span className="italic">None</span>}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs hidden lg:table-cell">{fmt(admin.last_login_at)}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => toggleActive(admin)}
                          disabled={togglingId === admin.id}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                            admin.is_active ? 'bg-green-400' : 'bg-gray-200'
                          } ${togglingId === admin.id ? 'opacity-50' : ''}`}
                          title={admin.is_active ? 'Deactivate' : 'Activate'}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                              admin.is_active ? 'translate-x-[18px]' : 'translate-x-[3px]'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => sendResetPassword(admin)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
                              resetEmailSent[admin.id]
                                ? 'border-green-300 text-green-600 bg-green-50'
                                : 'border-gray-200 text-gray-600 hover:border-[#C9A84C]'
                            }`}
                          >
                            {resetEmailSent[admin.id] ? '✓ Email Sent' : 'Reset Password'}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(admin.id)}
                            className="text-red-400 hover:text-red-600 transition p-1.5 rounded-lg hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="font-bold text-[#0A1628]">Delete Sub-Admin?</p>
                <p className="text-gray-500 text-sm">This removes their admin record. Their auth account (if exists) must be removed separately from Supabase Dashboard.</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:border-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteAdmin(deleteConfirm)}
                disabled={deletingId === deleteConfirm}
                className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition disabled:opacity-50"
              >
                {deletingId === deleteConfirm ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Sub-Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            {/* Modal header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-[#0A1628] font-heading text-lg">Create Sub-Administrator</h3>
              <button onClick={resetModal} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {createStatus === 'success' ? (
              <div className="px-6 py-10 text-center">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Check className="w-7 h-7 text-green-500" />
                </div>
                <h4 className="font-bold text-[#0A1628] font-heading text-lg mb-2">Sub-admin Record Created</h4>
                <p className="text-gray-500 text-sm mb-4">
                  The admin_users record has been saved. To enable login, go to{' '}
                  <strong>Supabase Dashboard &rarr; Authentication</strong> and create an auth user with the same email, then link the <code className="bg-gray-100 px-1 rounded">user_id</code>.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-left">
                  <p className="text-xs text-amber-700">
                    <strong>Temporary password:</strong> <code className="bg-amber-100 px-1 rounded font-mono">{tempPassword}</code><br />
                    Use this when creating the auth user in Supabase Dashboard.
                  </p>
                </div>
                <button
                  onClick={resetModal}
                  className="bg-[#0A1628] text-white font-bold px-6 py-2.5 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="px-6 py-5 space-y-4 overflow-y-auto max-h-[70vh]">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Full Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    required
                    value={form.full_name}
                    onChange={e => setForm(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="e.g. John Doe"
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Email <span className="text-red-400">*</span></label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="admin@example.com"
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Temporary Password</label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      readOnly
                      value={tempPassword}
                      className="border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 outline-none w-full pr-20 font-mono"
                    />
                    <div className="absolute right-2 flex gap-1">
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 transition"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={copyPassword}
                        className="p-1.5 text-gray-400 hover:text-gray-600 transition"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTempPassword(generatePassword())}
                    className="text-xs text-[#C9A84C] hover:underline mt-1"
                  >
                    Regenerate password
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Permissions</label>
                  <div className="space-y-2">
                    {ALL_PERMISSIONS.map(perm => (
                      <label
                        key={perm.key}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition cursor-pointer ${
                          perm.superAdminOnly
                            ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                            : form.permissions.includes(perm.key)
                            ? 'border-[#C9A84C] bg-[#C9A84C]/5'
                            : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          disabled={perm.superAdminOnly}
                          checked={perm.superAdminOnly ? false : form.permissions.includes(perm.key)}
                          onChange={() => !perm.superAdminOnly && togglePermission(perm.key)}
                          className="rounded accent-[#C9A84C]"
                        />
                        <span className="text-sm font-medium text-[#0A1628]">
                          {perm.label}
                          {perm.superAdminOnly && (
                            <span className="ml-2 text-xs text-gray-400">(Super Admin only)</span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {createStatus === 'error' && (
                  <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {createError || 'An error occurred. Please try again.'}
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                  <p className="text-xs text-blue-600">
                    <strong>Note:</strong> This creates the admin_users record. For login access, create the auth user in{' '}
                    <strong>Supabase Dashboard &rarr; Authentication</strong> using the same email and temporary password above, then update the <code>user_id</code> field.
                  </p>
                </div>

                <div className="flex gap-2 pt-2 pb-2">
                  <button
                    type="button"
                    onClick={resetModal}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:border-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createStatus === 'saving'}
                    className="flex-1 bg-[#0A1628] text-white font-bold px-4 py-2.5 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition disabled:opacity-50 text-sm"
                  >
                    {createStatus === 'saving' ? 'Creating…' : 'Create Sub-Admin'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
