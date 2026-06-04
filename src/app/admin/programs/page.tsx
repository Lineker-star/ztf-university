'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClientClient } from '@/lib/supabase/client';
import {
  Plus, X, Save, Trash2, Edit2, Download, CheckSquare, Square,
  Search, Loader2, CheckCircle, AlertCircle, RefreshCw,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Institute { id: string; code_en: string; name_en: string; }
interface School { id: string; institute_id: string; name_en: string; name_fr: string; }
interface Field { id: string; school_id: string; name_en: string; name_fr: string; }

interface OtherFee { name: string; amount: string; }

interface Program {
  id: string;
  school_id: string;
  field_id?: string;
  name_en: string;
  name_fr: string;
  level: string;
  duration_years: string;
  entry_requirement_en: string;
  entry_requirement_fr: string;
  description_en: string;
  description_fr: string;
  tuition_fee_xaf: number;
  registration_fee_xaf: number;
  other_fees_json: OtherFee[];
  is_online: boolean;
  is_active: boolean;
  school?: { name_en: string; name_fr: string; institute_id?: string };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LEVELS = [
  { value: 'BTS', label: 'BTS', desc: '2 years' },
  { value: 'HND', label: 'HND', desc: '2 years' },
  { value: 'Licence', label: 'Licence / BSc', desc: '3 years' },
  { value: 'BTech', label: 'BTech', desc: '3 years' },
  { value: 'Master1', label: 'Master 1', desc: '1 year' },
  { value: 'Master2', label: 'Master 2', desc: '1 year' },
  { value: 'MSc', label: 'MSc', desc: '2 years' },
  { value: 'MTech', label: 'MTech', desc: '2 years' },
  { value: 'Certificate', label: 'Certificate', desc: 'variable' },
  { value: 'Vocational', label: 'Vocational', desc: 'variable' },
];

const LEVEL_COLORS: Record<string, string> = {
  BTS: 'bg-blue-100 text-blue-800', HND: 'bg-blue-100 text-blue-800',
  Licence: 'bg-green-100 text-green-800', BTech: 'bg-green-100 text-green-800',
  Master1: 'bg-purple-100 text-purple-800', Master2: 'bg-purple-100 text-purple-800',
  MSc: 'bg-purple-100 text-purple-800', MTech: 'bg-purple-100 text-purple-800',
  Certificate: 'bg-gray-100 text-gray-700', Vocational: 'bg-gray-100 text-gray-700',
};

const DURATIONS = ['0.5', '1', '1.5', '2', '3', '4'];

const inputCls = 'border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full';
const textareaCls = 'border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full resize-none';

function fmtXAF(n: number) {
  return n ? n.toLocaleString('fr-CM') + ' XAF' : '—';
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminProgramsPage() {
  const supabase = createClientClient();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterInstitute, setFilterInstitute] = useState('all');
  const [filterSchool, setFilterSchool] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [search, setSearch] = useState('');

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Program | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Bulk fee modal
  const [showBulkFee, setShowBulkFee] = useState(false);
  const [bulkFee, setBulkFee] = useState('');
  const [bulkSaving, setBulkSaving] = useState(false);

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState<Omit<Program, 'id' | 'school'>>({
    school_id: '', field_id: '', name_en: '', name_fr: '', level: 'BTS', duration_years: '2',
    entry_requirement_en: '', entry_requirement_fr: '', description_en: '', description_fr: '',
    tuition_fee_xaf: 0, registration_fee_xaf: 35000, other_fees_json: [], is_online: false, is_active: true,
  });
  const [formFields, setFormFields] = useState<Field[]>([]);

  // ─── Load ──────────────────────────────────────────────────────────────────

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [progRes, instRes, schRes, fldRes] = await Promise.all([
        supabase.from('cms_programs').select('*, school:school_id(name_en, name_fr)').order('name_en'),
        supabase.from('cms_institutes').select('id, code_en, name_en').order('display_order'),
        supabase.from('cms_schools').select('id, institute_id, name_en, name_fr').order('name_en'),
        supabase.from('cms_fields').select('id, school_id, name_en, name_fr').order('name_en'),
      ]);
      setPrograms((progRes.data || []).map((p: Program) => ({
        ...p,
        other_fees_json: Array.isArray(p.other_fees_json) ? p.other_fees_json : [],
      })));
      setInstitutes(instRes.data || []);
      setSchools(schRes.data || []);
      setFields(fldRes.data || []);
    } catch { /* non-fatal */ }
    finally { setLoading(false); }
  }, []); // eslint-disable-line

  useEffect(() => { loadAll(); }, [loadAll]);

  // ─── Filtered programs ────────────────────────────────────────────────────

  const filtered = programs.filter(p => {
    if (filterLevel !== 'all' && p.level !== filterLevel) return false;
    if (filterSchool !== 'all' && p.school_id !== filterSchool) return false;
    if (filterInstitute !== 'all') {
      const sch = schools.find(s => s.id === p.school_id);
      if (!sch || sch.institute_id !== filterInstitute) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return p.name_en.toLowerCase().includes(q) || p.name_fr.toLowerCase().includes(q);
    }
    return true;
  });

  // ─── Open modal ───────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditing(null);
    setForm({ school_id: '', field_id: '', name_en: '', name_fr: '', level: 'BTS', duration_years: '2', entry_requirement_en: '', entry_requirement_fr: '', description_en: '', description_fr: '', tuition_fee_xaf: 0, registration_fee_xaf: 35000, other_fees_json: [], is_online: false, is_active: true });
    setFormFields([]);
    setShowModal(true);
    setSaveMsg('');
  };

  const openEdit = (p: Program) => {
    setEditing(p);
    setForm({
      school_id: p.school_id, field_id: p.field_id || '', name_en: p.name_en, name_fr: p.name_fr,
      level: p.level, duration_years: p.duration_years, entry_requirement_en: p.entry_requirement_en || '', entry_requirement_fr: p.entry_requirement_fr || '',
      description_en: p.description_en || '', description_fr: p.description_fr || '',
      tuition_fee_xaf: p.tuition_fee_xaf || 0, registration_fee_xaf: p.registration_fee_xaf || 35000,
      other_fees_json: p.other_fees_json || [], is_online: p.is_online, is_active: p.is_active,
    });
    setFormFields(fields.filter(f => f.school_id === p.school_id));
    setShowModal(true);
    setSaveMsg('');
  };

  // ─── Save ─────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.name_en || !form.school_id) { setSaveMsg('Name and school are required.'); return; }
    setSaving(true); setSaveMsg('');
    try {
      const payload = { ...form, field_id: form.field_id || null, updated_at: new Date().toISOString() };
      if (editing) {
        await supabase.from('cms_programs').update(payload).eq('id', editing.id);
      } else {
        await supabase.from('cms_programs').insert({ ...payload, created_at: new Date().toISOString() });
      }
      setSaveMsg('Saved!');
      await loadAll();
      setTimeout(() => { setShowModal(false); setSaveMsg(''); }, 1000);
    } catch (e) {
      setSaveMsg('Error: ' + (e instanceof Error ? e.message : 'unknown'));
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('cms_programs').delete().eq('id', id);
    setDeleteId(null);
    await loadAll();
  };

  const handleBulkFee = async () => {
    if (!bulkFee || selectedIds.size === 0) return;
    setBulkSaving(true);
    await supabase.from('cms_programs').update({ tuition_fee_xaf: parseInt(bulkFee) }).in('id', Array.from(selectedIds));
    setShowBulkFee(false); setBulkFee(''); setSelectedIds(new Set());
    setBulkSaving(false);
    await loadAll();
  };

  const handleExport = async () => {
    const XLSX = await import('xlsx');
    const data = filtered.map(p => ({
      'Name EN': p.name_en, 'Name FR': p.name_fr,
      'School': p.school?.name_en || '', 'Level': p.level,
      'Duration (yr)': p.duration_years, 'Tuition (XAF)': p.tuition_fee_xaf,
      'Registration (XAF)': p.registration_fee_xaf,
      'Online': p.is_online ? 'Yes' : 'No', 'Active': p.is_active ? 'Yes' : 'No',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Programs');
    XLSX.writeFile(wb, `ZTF_Programs_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const totalFees = form.tuition_fee_xaf + form.registration_fee_xaf + form.other_fees_json.reduce((s, f) => s + (parseInt(f.amount) || 0), 0);

  const filteredSchools = filterInstitute !== 'all' ? schools.filter(s => s.institute_id === filterInstitute) : schools;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628] font-heading">Programs & Fees</h1>
          <p className="text-gray-500 text-sm mt-1">{programs.length} programs total</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadAll} className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
          <button onClick={handleExport} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 font-semibold text-sm px-3 py-2 rounded-xl hover:bg-gray-50 transition">
            <Download className="w-4 h-4" /> Export Excel
          </button>
          <button onClick={openAdd} className="flex items-center gap-1.5 bg-[#0A1628] text-white font-bold text-sm px-4 py-2 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition">
            <Plus className="w-4 h-4" /> Add Program
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-wrap gap-3">
        <select value={filterInstitute} onChange={e => { setFilterInstitute(e.target.value); setFilterSchool('all'); }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#C9A84C] outline-none">
          <option value="all">All Institutes</option>
          {institutes.map(i => <option key={i.id} value={i.id}>{i.code_en}</option>)}
        </select>
        <select value={filterSchool} onChange={e => setFilterSchool(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#C9A84C] outline-none">
          <option value="all">All Schools</option>
          {filteredSchools.map(s => <option key={s.id} value={s.id}>{s.name_en}</option>)}
        </select>
        <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#C9A84C] outline-none">
          <option value="all">All Levels</option>
          {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search programs..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-[#C9A84C] outline-none" />
        </div>
        {selectedIds.size > 0 && (
          <button onClick={() => setShowBulkFee(true)}
            className="flex items-center gap-1.5 bg-[#C9A84C] text-[#0A1628] font-bold text-sm px-3 py-2 rounded-xl hover:bg-[#0A1628] hover:text-white transition">
            Update Fees ({selectedIds.size})
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 w-8">
                  <input type="checkbox" className="accent-[#C9A84C]"
                    checked={selectedIds.size === filtered.length && filtered.length > 0}
                    onChange={e => setSelectedIds(e.target.checked ? new Set(filtered.map(p => p.id)) : new Set())} />
                </th>
                {['Program', 'School', 'Level', 'Duration', 'Tuition', 'Online', 'Active', ''].map(h => (
                  <th key={h} className="text-left px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={9} className="text-center py-10 text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-10 text-gray-400">
                  {programs.length === 0 ? 'No programs yet. Add your first program.' : 'No results match your filters.'}
                </td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className={`hover:bg-gray-50 transition ${selectedIds.has(p.id) ? 'bg-[#C9A84C]/5' : ''}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox" className="accent-[#C9A84C]" checked={selectedIds.has(p.id)}
                      onChange={() => setSelectedIds(prev => { const n = new Set(prev); n.has(p.id) ? n.delete(p.id) : n.add(p.id); return n; })} />
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-semibold text-[#0A1628] truncate max-w-[200px]">{p.name_en}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[200px]">{p.name_fr}</p>
                  </td>
                  <td className="px-3 py-3 text-gray-500 text-xs max-w-[140px] truncate">{p.school?.name_en || '—'}</td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${LEVEL_COLORS[p.level] || 'bg-gray-100 text-gray-600'}`}>{p.level}</span>
                  </td>
                  <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{p.duration_years} yr</td>
                  <td className="px-3 py-3 text-gray-700 font-semibold whitespace-nowrap">{fmtXAF(p.tuition_fee_xaf)}</td>
                  <td className="px-3 py-3">
                    {p.is_online ? <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">Online</span> : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-[#C9A84C] hover:bg-[#C9A84C]/10 rounded-lg transition"><Edit2 className="w-4 h-4" /></button>
                      {deleteId === p.id ? (
                        <span className="flex gap-1 items-center">
                          <button onClick={() => handleDelete(p.id)} className="text-xs bg-red-600 text-white px-2 py-1 rounded-lg font-bold hover:bg-red-700 transition">Delete</button>
                          <button onClick={() => setDeleteId(null)} className="text-xs border border-gray-200 px-2 py-1 rounded-lg text-gray-500 hover:bg-gray-50 transition">Cancel</button>
                        </span>
                      ) : (
                        <button onClick={() => setDeleteId(p.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-6">
            {/* Modal header */}
            <div className="bg-[#0A1628] rounded-t-2xl px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold font-heading">{editing ? 'Edit Program' : 'Add New Program'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">

              {/* School + Field */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">School *</label>
                  <select value={form.school_id}
                    onChange={e => {
                      setForm(f => ({ ...f, school_id: e.target.value, field_id: '' }));
                      setFormFields(fields.filter(f => f.school_id === e.target.value));
                    }}
                    className={inputCls}>
                    <option value="">Select school...</option>
                    {schools.map(s => <option key={s.id} value={s.id}>{s.name_en}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Field (optional)</label>
                  <select value={form.field_id || ''} onChange={e => setForm(f => ({ ...f, field_id: e.target.value }))} className={inputCls} disabled={!form.school_id}>
                    <option value="">Select field...</option>
                    {formFields.map(f => <option key={f.id} value={f.id}>{f.name_en}</option>)}
                  </select>
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Program Name (English) *</label>
                  <input value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} className={inputCls} placeholder="e.g. Business Administration" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Program Name (Français)</label>
                  <input value={form.name_fr} onChange={e => setForm(f => ({ ...f, name_fr: e.target.value }))} className={inputCls} placeholder="e.g. Administration des Affaires" />
                </div>
              </div>

              {/* Level + Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Level</label>
                  <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))} className={inputCls}>
                    {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label} ({l.desc})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Duration (years)</label>
                  <select value={form.duration_years} onChange={e => setForm(f => ({ ...f, duration_years: e.target.value }))} className={inputCls}>
                    {DURATIONS.map(d => <option key={d} value={d}>{d} year{parseFloat(d) !== 1 ? 's' : ''}</option>)}
                  </select>
                </div>
              </div>

              {/* Entry Requirements */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Entry Requirements (EN)</label>
                  <textarea value={form.entry_requirement_en} onChange={e => setForm(f => ({ ...f, entry_requirement_en: e.target.value }))} rows={3} className={textareaCls} placeholder="BEPC, BAC, or equivalent..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Entry Requirements (FR)</label>
                  <textarea value={form.entry_requirement_fr} onChange={e => setForm(f => ({ ...f, entry_requirement_fr: e.target.value }))} rows={3} className={textareaCls} placeholder="BEPC, BAC ou équivalent..." />
                </div>
              </div>

              {/* Description */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Description (EN)</label>
                  <textarea value={form.description_en} onChange={e => setForm(f => ({ ...f, description_en: e.target.value }))} rows={3} className={textareaCls} placeholder="Program description..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Description (FR)</label>
                  <textarea value={form.description_fr} onChange={e => setForm(f => ({ ...f, description_fr: e.target.value }))} rows={3} className={textareaCls} placeholder="Description du programme..." />
                </div>
              </div>

              {/* Fees */}
              <div className="bg-[#C9A84C]/5 border border-[#C9A84C]/20 rounded-xl p-4 space-y-4">
                <h4 className="font-bold text-[#0A1628] text-sm">Fee Structure</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Tuition Fee (XAF)</label>
                    <input type="number" value={form.tuition_fee_xaf} onChange={e => setForm(f => ({ ...f, tuition_fee_xaf: parseInt(e.target.value) || 0 }))} className={inputCls} placeholder="350000" min={0} />
                    <p className="text-xs text-gray-400 mt-1">{form.tuition_fee_xaf.toLocaleString('fr-CM')} XAF</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Registration Fee (XAF)</label>
                    <input type="number" value={form.registration_fee_xaf} onChange={e => setForm(f => ({ ...f, registration_fee_xaf: parseInt(e.target.value) || 0 }))} className={inputCls} placeholder="35000" min={0} />
                    <p className="text-xs text-gray-400 mt-1">{form.registration_fee_xaf.toLocaleString('fr-CM')} XAF</p>
                  </div>
                </div>

                {/* Other fees */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Other Fees</label>
                  {form.other_fees_json.map((fee, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input value={fee.name} onChange={e => setForm(f => ({ ...f, other_fees_json: f.other_fees_json.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x) }))}
                        placeholder="Fee name (e.g. Library Fee)" className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#C9A84C] outline-none flex-1" />
                      <input type="number" value={fee.amount} onChange={e => setForm(f => ({ ...f, other_fees_json: f.other_fees_json.map((x, idx) => idx === i ? { ...x, amount: e.target.value } : x) }))}
                        placeholder="5000" className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#C9A84C] outline-none w-28" />
                      <button onClick={() => setForm(f => ({ ...f, other_fees_json: f.other_fees_json.filter((_, idx) => idx !== i) }))}
                        className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button onClick={() => setForm(f => ({ ...f, other_fees_json: [...f.other_fees_json, { name: '', amount: '' }] }))}
                    className="flex items-center gap-1.5 text-sm text-[#0A1628] font-semibold border border-dashed border-gray-300 px-3 py-1.5 rounded-xl hover:border-[#C9A84C] transition">
                    <Plus className="w-3.5 h-3.5" /> Add Fee
                  </button>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between pt-2 border-t border-[#C9A84C]/20">
                  <span className="text-sm font-bold text-gray-700">Total Fees</span>
                  <span className="text-lg font-bold text-[#C9A84C]">{totalFees.toLocaleString('fr-CM')} XAF</span>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-6">
                {[
                  { label: 'Online Program', value: form.is_online, key: 'is_online' as const },
                  { label: 'Active', value: form.is_active, key: 'is_active' as const },
                ].map(t => (
                  <label key={t.key} className="flex items-center gap-2 cursor-pointer">
                    <button type="button" onClick={() => setForm(f => ({ ...f, [t.key]: !f[t.key] }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${t.value ? 'bg-[#C9A84C]' : 'bg-gray-200'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${t.value ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className="text-sm font-semibold text-gray-700">{t.label}</span>
                  </label>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div>
                  {saveMsg && (
                    <span className={`flex items-center gap-1.5 text-sm font-semibold ${saveMsg === 'Saved!' ? 'text-green-600' : 'text-red-500'}`}>
                      {saveMsg === 'Saved!' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      {saveMsg}
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowModal(false)} className="border border-gray-200 text-gray-600 font-bold px-4 py-2 rounded-xl text-sm hover:bg-gray-50 transition">Cancel</button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 bg-[#0A1628] text-white font-bold px-5 py-2 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition text-sm disabled:opacity-50">
                    <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Program'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BULK FEE MODAL */}
      {showBulkFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowBulkFee(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-[#0A1628] font-heading mb-3">Update Tuition Fee</h3>
            <p className="text-sm text-gray-500 mb-4">Set tuition fee for {selectedIds.size} selected program{selectedIds.size !== 1 ? 's' : ''}.</p>
            <input type="number" value={bulkFee} onChange={e => setBulkFee(e.target.value)} placeholder="350000" className={inputCls + ' mb-4'} />
            <div className="flex gap-3">
              <button onClick={handleBulkFee} disabled={bulkSaving}
                className="flex-1 bg-[#0A1628] text-white font-bold py-2.5 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition text-sm disabled:opacity-50">
                {bulkSaving ? 'Updating...' : 'Update All'}
              </button>
              <button onClick={() => setShowBulkFee(false)} className="flex-1 border border-gray-200 text-gray-600 font-bold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
