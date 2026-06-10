'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClientClient } from '@/lib/supabase/client';
import {
  Plus, Edit2, Trash2, X, Save, Loader2, AlertCircle, CheckCircle, Megaphone,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type AnnType = 'info' | 'warning' | 'success' | 'urgent';

interface Announcement {
  id: string;
  title_en: string;
  title_fr: string;
  content_en: string;
  content_fr: string;
  type: AnnType;
  show_on_home: boolean;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

type FormData = Omit<Announcement, 'id' | 'created_at'>;

const EMPTY_FORM: FormData = {
  title_en: '', title_fr: '', content_en: '', content_fr: '',
  type: 'info', show_on_home: false, is_active: true, expires_at: null,
};

const TYPE_BADGE: Record<AnnType, string> = {
  info: 'bg-blue-100 text-blue-700',
  warning: 'bg-yellow-100 text-yellow-700',
  success: 'bg-green-100 text-green-700',
  urgent: 'bg-red-100 text-red-700',
};

const TYPE_SWATCH: Record<AnnType, string> = {
  info: 'bg-blue-500',
  warning: 'bg-yellow-400',
  success: 'bg-green-500',
  urgent: 'bg-red-500',
};

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!on)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition ${on ? 'bg-[#C9A84C]' : 'bg-gray-200'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${on ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminAnnouncementsPage() {
  const supabase = createClientClient();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Delete confirm state (per row)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ─── Load ──────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const { data, error } = await supabase
        .from('cms_announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      setAnnouncements(data || []);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  // ─── Open modal ───────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSaveError('');
    setSaveSuccess(false);
    setModalOpen(true);
  };

  const openEdit = (ann: Announcement) => {
    setEditingId(ann.id);
    setForm({
      title_en: ann.title_en,
      title_fr: ann.title_fr,
      content_en: ann.content_en,
      content_fr: ann.content_fr,
      type: ann.type,
      show_on_home: ann.show_on_home,
      is_active: ann.is_active,
      expires_at: ann.expires_at ?? null,
    });
    setSaveError('');
    setSaveSuccess(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSaveError('');
    setSaveSuccess(false);
  };

  // ─── Save ─────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.title_en.trim()) { setSaveError('Title (English) is required.'); return; }
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const payload = {
        title_en: form.title_en.trim(),
        title_fr: form.title_fr.trim(),
        content_en: form.content_en.trim(),
        content_fr: form.content_fr.trim(),
        type: form.type,
        show_on_home: form.show_on_home,
        is_active: form.is_active,
        expires_at: form.expires_at || null,
      };

      if (editingId) {
        const { error } = await supabase.from('cms_announcements').update(payload).eq('id', editingId);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from('cms_announcements').insert([payload]);
        if (error) throw new Error(error.message);
      }

      setSaveSuccess(true);
      await load();
      setTimeout(() => { closeModal(); }, 800);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const { error } = await supabase.from('cms_announcements').delete().eq('id', id);
      if (error) throw new Error(error.message);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch { /* row will stay, user can retry */ }
    finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const setField = <K extends keyof FormData>(k: K, v: FormData[K]) => {
    setForm(f => ({ ...f, [k]: v }));
  };

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return d; }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628] font-heading">Announcements Manager</h1>
          <p className="text-gray-500 text-sm mt-1">Create and manage site-wide announcements and notifications.</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-[#0A1628] text-white font-bold px-4 py-2 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition text-sm">
          <Plus className="w-4 h-4" /> Add Announcement
        </button>
      </div>

      {/* Load error */}
      {loadError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2 text-red-700 text-sm mb-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {loadError}
          <button onClick={load} className="ml-auto font-semibold hover:underline text-xs">Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-[#C9A84C]" />
            <span className="ml-2 text-gray-400 text-sm">Loading announcements...</span>
          </div>
        ) : announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
              <Megaphone className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-500 font-semibold mb-1">No announcements yet</p>
            <p className="text-gray-400 text-sm mb-4">Create your first announcement to get started.</p>
            <button onClick={openAdd}
              className="flex items-center gap-2 bg-[#0A1628] text-white font-bold px-4 py-2 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition text-sm">
              <Plus className="w-4 h-4" /> Create Announcement
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Title (EN)', 'Type', 'Show on Home', 'Active', 'Expires', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {announcements.map(ann => (
                  <tr key={ann.id} className="hover:bg-gray-50/60 transition">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#0A1628] truncate max-w-[200px]">{ann.title_en || <span className="text-gray-300 italic">No title</span>}</p>
                      {ann.title_fr && <p className="text-xs text-gray-400 truncate max-w-[200px]">{ann.title_fr}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${TYPE_BADGE[ann.type]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${TYPE_SWATCH[ann.type]}`} />
                        {ann.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${ann.show_on_home ? 'text-green-600' : 'text-gray-400'}`}>
                        {ann.show_on_home ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${ann.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                        {ann.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{formatDate(ann.expires_at)}</td>
                    <td className="px-4 py-3">
                      {confirmDeleteId === ann.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-red-600 font-semibold">Delete?</span>
                          <button onClick={() => handleDelete(ann.id)} disabled={deleting}
                            className="text-xs font-bold text-white bg-red-500 px-2.5 py-1 rounded-lg hover:bg-red-600 transition disabled:opacity-50">
                            {deleting ? '...' : 'Confirm'}
                          </button>
                          <button onClick={() => setConfirmDeleteId(null)}
                            className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100 transition">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(ann)}
                            className="p-1.5 text-[#0A1628] hover:bg-[#0A1628]/10 rounded-lg transition" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setConfirmDeleteId(ann.id)}
                            className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal ─────────────────────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />

          {/* Panel */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-lg font-bold text-[#0A1628] font-heading">
                {editingId ? 'Edit Announcement' : 'New Announcement'}
              </h2>
              <button onClick={closeModal} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
              {/* Titles */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Title (English) *</label>
                  <input value={form.title_en} onChange={e => setField('title_en', e.target.value)}
                    placeholder="Announcement title..."
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Title (Français)</label>
                  <input value={form.title_fr} onChange={e => setField('title_fr', e.target.value)}
                    placeholder="Titre de l'annonce..."
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full" />
                </div>
              </div>

              {/* Content */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Content (English)</label>
                  <textarea value={form.content_en} onChange={e => setField('content_en', e.target.value)}
                    rows={4} placeholder="Full announcement content in English..."
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Content (Français)</label>
                  <textarea value={form.content_fr} onChange={e => setField('content_fr', e.target.value)}
                    rows={4} placeholder="Contenu complet en français..."
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full resize-none" />
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Type</label>
                <div className="flex flex-wrap gap-2">
                  {(['info', 'warning', 'success', 'urgent'] as AnnType[]).map(t => (
                    <button key={t} type="button" onClick={() => setField('type', t)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition capitalize ${
                        form.type === t
                          ? TYPE_BADGE[t] + ' border-current ring-2 ring-offset-1 ring-current'
                          : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                      }`}>
                      <span className={`w-2 h-2 rounded-full ${TYPE_SWATCH[t]}`} />
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles + Expiry */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm font-semibold text-gray-700">Show on Home</p>
                  <Toggle on={form.show_on_home} onChange={v => setField('show_on_home', v)} />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm font-semibold text-gray-700">Active</p>
                  <Toggle on={form.is_active} onChange={v => setField('is_active', v)} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Expires At (optional)</label>
                  <input type="date" value={form.expires_at || ''}
                    onChange={e => setField('expires_at', e.target.value || null)}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full" />
                </div>
              </div>

              {/* Error / success */}
              {saveError && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {saveError}
                </div>
              )}
              {saveSuccess && (
                <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" /> Saved successfully!
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
              <button onClick={closeModal}
                className="px-4 py-2 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving || saveSuccess}
                className="flex items-center gap-2 bg-[#0A1628] text-white font-bold px-5 py-2 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition disabled:opacity-50 text-sm">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
