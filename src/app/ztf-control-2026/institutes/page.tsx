'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClientClient } from '@/lib/supabase/client';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Building2,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Institute {
  id: string;
  code_en: string;
  code_fr: string;
  name_en: string;
  name_fr: string;
  description_en: string;
  description_fr: string;
  icon: string;
  color_class: string;
  is_standalone: boolean;
  display_order: number;
  is_active: boolean;
  updated_at?: string;
}

type FormData = Omit<Institute, 'id' | 'updated_at'>;

const EMPTY_FORM: FormData = {
  code_en: '',
  code_fr: '',
  name_en: '',
  name_fr: '',
  description_en: '',
  description_fr: '',
  icon: '🏛️',
  color_class: '#C9A84C',
  is_standalone: false,
  display_order: 0,
  is_active: true,
};

const ICON_OPTIONS = ['🏛️', '🌱', '🔬', '💊', '⚖️', '💼', '🏥', '🎓', '📚', '🔧', '🌿', '⚙️'];

const COLOR_SWATCHES = [
  { label: 'Gold',   value: '#C9A84C' },
  { label: 'Blue',   value: '#3B82F6' },
  { label: 'Green',  value: '#10B981' },
  { label: 'Red',    value: '#EF4444' },
  { label: 'Teal',   value: '#14B8A6' },
  { label: 'Purple', value: '#8B5CF6' },
];

// ─── Toggle Component ─────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        checked ? 'bg-[#C9A84C]' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InstitutesPage() {
  const supabase = createClientClient();

  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // ── Load ────────────────────────────────────────────────────────────────────

  const loadInstitutes = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('cms_institutes')
      .select('*')
      .order('display_order', { ascending: true });
    if (err) setError(err.message);
    else setInstitutes(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { loadInstitutes(); }, [loadInstitutes]);

  // ── Form helpers ────────────────────────────────────────────────────────────

  function openAddForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  }

  function openEditForm(inst: Institute) {
    setEditingId(inst.id);
    setForm({
      code_en: inst.code_en,
      code_fr: inst.code_fr,
      name_en: inst.name_en,
      name_fr: inst.name_fr,
      description_en: inst.description_en ?? '',
      description_fr: inst.description_fr ?? '',
      icon: inst.icon ?? '🏛️',
      color_class: inst.color_class ?? '#C9A84C',
      is_standalone: inst.is_standalone ?? false,
      display_order: inst.display_order ?? 0,
      is_active: inst.is_active ?? true,
    });
    setFormOpen(true);
  }

  function clearForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormOpen(false);
  }

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  // ── Save ────────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!form.code_en.trim() || !form.name_en.trim()) {
      setError('Code EN and Name EN are required.');
      return;
    }
    setSaving(true);
    setError(null);
    if (editingId) {
      const { error: err } = await supabase
        .from('cms_institutes')
        .update(form)
        .eq('id', editingId);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { error: err } = await supabase
        .from('cms_institutes')
        .insert([form]);
      if (err) { setError(err.message); setSaving(false); return; }
    }
    setSaving(false);
    clearForm();
    loadInstitutes();
  }

  // ── Toggle active ───────────────────────────────────────────────────────────

  async function toggleActive(inst: Institute) {
    await supabase
      .from('cms_institutes')
      .update({ is_active: !inst.is_active })
      .eq('id', inst.id);
    setInstitutes(prev =>
      prev.map(i => i.id === inst.id ? { ...i, is_active: !i.is_active } : i)
    );
  }

  // ── Delete ──────────────────────────────────────────────────────────────────

  async function handleDelete(id: string) {
    const { error: err } = await supabase.from('cms_institutes').delete().eq('id', id);
    if (err) { setError(err.message); return; }
    setDeleteConfirmId(null);
    if (editingId === id) clearForm();
    loadInstitutes();
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0A1628]">Institutes Manager</h1>
        <p className="text-sm text-gray-500 mt-1">Manage academic institutes / faculties</p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <X className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Two-panel layout */}
      <div className="flex gap-6 items-start">

        {/* ── LEFT PANEL ─────────────────────────────────────────────────────── */}
        <div className="w-[40%] flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#0A1628]" />
              <span className="font-bold text-[#0A1628] text-base">Institutes</span>
              <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full">
                {institutes.length}
              </span>
            </div>
            <button
              onClick={openAddForm}
              className="flex items-center gap-1.5 bg-[#0A1628] text-white font-bold px-4 py-2 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition text-sm"
            >
              <Plus className="w-4 h-4" />
              Add New
            </button>
          </div>

          {/* List */}
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
              Loading institutes…
            </div>
          ) : institutes.length === 0 ? (
            <div className="text-center py-14 px-6">
              <div className="text-4xl mb-3">🏛️</div>
              <p className="text-gray-500 text-sm">
                No institutes yet. Add your first institute using the form.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {institutes.map(inst => (
                <li
                  key={inst.id}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition group ${
                    editingId === inst.id ? 'bg-amber-50 border-l-2 border-[#C9A84C]' : ''
                  }`}
                >
                  {/* Drag hint */}
                  <span className="text-gray-300 text-lg select-none cursor-grab">⠿</span>

                  {/* Icon */}
                  <span
                    className="text-xl w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0"
                    style={{ backgroundColor: (inst.color_class ?? '#C9A84C') + '22' }}
                  >
                    {inst.icon || '🏛️'}
                  </span>

                  {/* Info */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => openEditForm(inst)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0A1628] text-sm">{inst.code_en}</span>
                      <span className="text-gray-300 text-xs">|</span>
                      <span className="text-gray-600 text-sm truncate">{inst.name_en}</span>
                    </div>
                    {inst.is_standalone && (
                      <span className="text-xs text-purple-600 font-medium">Standalone</span>
                    )}
                  </div>

                  {/* Active toggle */}
                  <Toggle checked={inst.is_active} onChange={() => toggleActive(inst)} />

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => openEditForm(inst)}
                      className="border border-gray-200 text-gray-600 font-bold px-3 py-1.5 rounded-xl text-xs hover:bg-gray-50 transition"
                    >
                      Edit
                    </button>
                    {deleteConfirmId === inst.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(inst.id)}
                          className="bg-red-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs hover:bg-red-700 transition"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="border border-gray-200 text-gray-500 px-2 py-1.5 rounded-xl text-xs hover:bg-gray-50 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(inst.id)}
                        className="bg-red-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs hover:bg-red-700 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── RIGHT PANEL ────────────────────────────────────────────────────── */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {!formOpen ? (
            <div className="flex flex-col items-center justify-center py-24 text-center px-8">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <Pencil className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">Select an institute to edit</p>
              <p className="text-gray-400 text-xs mt-1">or click &quot;+ Add New&quot; to create one</p>
            </div>
          ) : (
            <>
              {/* Form header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-[#0A1628] text-base">
                  {editingId ? `Edit: ${form.code_en || '—'}` : 'Add Institute'}
                </h2>
                <button onClick={clearForm} className="text-gray-400 hover:text-gray-600 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form body */}
              <div className="px-6 py-5 space-y-5 max-h-[calc(100vh-260px)] overflow-y-auto">

                {/* Code row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Code EN
                    </label>
                    <input
                      type="text"
                      value={form.code_en}
                      onChange={e => setField('code_en', e.target.value)}
                      placeholder="HIACOMST"
                      className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Code FR
                    </label>
                    <input
                      type="text"
                      value={form.code_fr}
                      onChange={e => setField('code_fr', e.target.value)}
                      placeholder="ISASCOMT"
                      className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full"
                    />
                  </div>
                </div>

                {/* Name EN */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Name EN
                  </label>
                  <textarea
                    rows={3}
                    value={form.name_en}
                    onChange={e => setField('name_en', e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full resize-none"
                  />
                </div>

                {/* Name FR */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Name FR
                  </label>
                  <textarea
                    rows={3}
                    value={form.name_fr}
                    onChange={e => setField('name_fr', e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full resize-none"
                  />
                </div>

                {/* Short Desc EN */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Short Description EN
                  </label>
                  <textarea
                    rows={2}
                    value={form.description_en}
                    onChange={e => setField('description_en', e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full resize-none"
                  />
                </div>

                {/* Short Desc FR */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Short Description FR
                  </label>
                  <textarea
                    rows={2}
                    value={form.description_fr}
                    onChange={e => setField('description_fr', e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full resize-none"
                  />
                </div>

                {/* Icon */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Icon
                  </label>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={e => setField('icon', e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full mb-2"
                    placeholder="Paste an emoji or select below"
                  />
                  <div className="flex flex-wrap gap-2">
                    {ICON_OPTIONS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setField('icon', emoji)}
                        className={`w-10 h-10 text-xl flex items-center justify-center rounded-xl border-2 transition ${
                          form.icon === emoji
                            ? 'border-[#C9A84C] bg-amber-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Border Color */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Border Color
                  </label>
                  <div className="flex items-center gap-3 flex-wrap">
                    {COLOR_SWATCHES.map(swatch => (
                      <button
                        key={swatch.value}
                        type="button"
                        onClick={() => setField('color_class', swatch.value)}
                        title={swatch.label}
                        className={`w-8 h-8 rounded-full border-4 transition ${
                          form.color_class === swatch.value
                            ? 'border-gray-800 scale-110'
                            : 'border-white shadow'
                        }`}
                        style={{ backgroundColor: swatch.value }}
                      />
                    ))}
                    <span className="text-xs text-gray-400 font-mono">{form.color_class}</span>
                  </div>
                </div>

                {/* Toggles row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                    <span className="text-sm font-medium text-gray-700">Standalone School</span>
                    <Toggle checked={form.is_standalone} onChange={v => setField('is_standalone', v)} />
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                    <span className="text-sm font-medium text-gray-700">Is Active</span>
                    <Toggle checked={form.is_active} onChange={v => setField('is_active', v)} />
                  </div>
                </div>

                {/* Display Order */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={form.display_order}
                    onChange={e => setField('display_order', parseInt(e.target.value) || 0)}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-32"
                  />
                </div>
              </div>

              {/* Form footer */}
              <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#0A1628] text-white font-bold px-6 py-2.5 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving…
                    </span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save Institute
                    </>
                  )}
                </button>
                <button
                  onClick={clearForm}
                  className="border border-gray-200 text-gray-600 font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-gray-100 transition"
                >
                  Clear Form
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
