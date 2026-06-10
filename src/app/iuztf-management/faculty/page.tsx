'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Plus, X, Save, Trash2, Edit2, Upload, User, ChevronDown,
  AlertTriangle, CheckCircle, Tag, FileText
} from 'lucide-react';
import { createClientClient } from '@/lib/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────

type Qualification = { degree: string; institution: string; year: string };

type Faculty = {
  id: string;
  full_name: string;
  title: string | null;
  role: string;
  school_id: string | null;
  institute_id: string | null;
  bio_en: string | null;
  bio_fr: string | null;
  photo_url: string | null;
  qualifications: Qualification[];
  specializations: string[];
  research_interests: string[];
  publications_count: number | null;
  experience_years: number | null;
  email: string | null;
  linkedin_url: string | null;
  cv_url: string | null;
  is_featured: boolean;
  display_order: number | null;
  is_active: boolean;
  created_at: string;
};

type School = { id: string; name_en: string };
type Institute = { id: string; name_en: string };

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLES = [
  'President', 'Rector', 'Vice-Rector', 'Director',
  'HOD', 'Lecturer', 'Admin Staff', 'Support Staff',
];

const TITLE_PREFIXES = ['Prof.', 'Dr.', 'Mr.', 'Mrs.', 'Rev.', 'Pastor'];

const FILTER_TABS = [
  { key: 'all',       label: 'All' },
  { key: 'rectorate', label: 'Rectorate' },
  { key: 'directors', label: 'Directors' },
  { key: 'hod',       label: 'HOD' },
  { key: 'lecturers', label: 'Lecturers' },
  { key: 'admin',     label: 'Admin' },
  { key: 'support',   label: 'Support' },
];

const ROLE_FILTER_MAP: Record<string, string[]> = {
  all:       ROLES,
  rectorate: ['President', 'Rector', 'Vice-Rector'],
  directors: ['Director'],
  hod:       ['HOD'],
  lecturers: ['Lecturer'],
  admin:     ['Admin Staff'],
  support:   ['Support Staff'],
};

const ROLE_BADGE: Record<string, string> = {
  President:    'bg-[#C9A84C] text-[#0A1628]',
  Rector:       'bg-[#C9A84C] text-[#0A1628]',
  'Vice-Rector':'bg-[#C9A84C]/80 text-[#0A1628]',
  Director:     'bg-purple-100 text-purple-700',
  HOD:          'bg-blue-100 text-blue-700',
  Lecturer:     'bg-gray-100 text-gray-700',
  'Admin Staff':'bg-green-100 text-green-700',
  'Support Staff':'bg-orange-100 text-orange-700',
};

// ─── Upload helper ────────────────────────────────────────────────────────────

const uploadFile = async (file: File, path: string, bucket = 'cms-uploads'): Promise<string> => {
  const supabase = createClientClient();
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
};

const genUUID = () => crypto.randomUUID();

// ─── Blank form ───────────────────────────────────────────────────────────────

const blankForm = (): Omit<Faculty, 'id' | 'created_at'> => ({
  full_name: '',
  title: 'Dr.',
  role: 'Lecturer',
  school_id: null,
  institute_id: null,
  bio_en: '',
  bio_fr: '',
  photo_url: null,
  qualifications: [],
  specializations: [],
  research_interests: [],
  publications_count: null,
  experience_years: null,
  email: '',
  linkedin_url: '',
  cv_url: null,
  is_featured: false,
  display_order: null,
  is_active: true,
});

// ─── Tag Input ────────────────────────────────────────────────────────────────

function TagInput({ tags, onChange, placeholder }: { tags: string[]; onChange: (t: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState('');
  const commit = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) onChange([...tags, val]);
    setInput('');
  };
  return (
    <div className="border border-gray-200 rounded-xl px-3 py-2 flex flex-wrap gap-1.5 focus-within:border-[#C9A84C]">
      {tags.map(t => (
        <span key={t} className="flex items-center gap-1 bg-[#0A1628]/10 text-[#0A1628] text-xs font-semibold px-2 py-1 rounded-lg">
          {t}
          <button type="button" onClick={() => onChange(tags.filter(x => x !== t))} className="hover:text-red-500 transition">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit(); } }}
        onBlur={commit}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] text-sm outline-none bg-transparent"
      />
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmDelete({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-[#0A1628]">Delete Faculty Member</h3>
            <p className="text-sm text-gray-500 mt-0.5">This cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-5">
          Are you sure you want to delete <span className="font-semibold text-[#0A1628]">{name}</span>?
        </p>
        <div className="flex gap-2">
          <button onClick={onConfirm}
            className="flex-1 bg-red-600 text-white font-bold py-2 rounded-xl hover:bg-red-700 transition text-sm">
            Delete
          </button>
          <button onClick={onCancel}
            className="flex-1 border border-gray-200 text-gray-600 font-bold py-2 rounded-xl hover:bg-gray-50 transition text-sm">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminFacultyPage() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [panelOpen, setPanelOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Faculty | null>(null);
  const [form, setForm] = useState(blankForm());
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Faculty | null>(null);
  const [specInput, setSpecInput] = useState('');
  const [researchInput, setResearchInput] = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

  // ── Load data ──────────────────────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const supabase = createClientClient();
        const [{ data: fac }, { data: sch }, { data: inst }] = await Promise.all([
          supabase.from('cms_faculty').select('*').order('display_order', { ascending: true }).order('full_name'),
          supabase.from('cms_schools').select('id, name_en').order('name_en'),
          supabase.from('cms_institutes').select('id, name_en').order('name_en'),
        ]);
        if (fac) setFaculty(fac as Faculty[]);
        if (sch) setSchools(sch as School[]);
        if (inst) setInstitutes(inst as Institute[]);
      } catch (e) {
        console.error('Load error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filtered = faculty.filter(f => ROLE_FILTER_MAP[activeTab]?.includes(f.role));

  // ── Panel helpers ──────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditTarget(null);
    setForm(blankForm());
    setPhotoFile(null);
    setPhotoPreview(null);
    setCvFile(null);
    setSaveMsg(null);
    setPanelOpen(true);
  };

  const openEdit = (f: Faculty) => {
    setEditTarget(f);
    setForm({
      full_name: f.full_name,
      title: f.title,
      role: f.role,
      school_id: f.school_id,
      institute_id: f.institute_id,
      bio_en: f.bio_en || '',
      bio_fr: f.bio_fr || '',
      photo_url: f.photo_url,
      qualifications: f.qualifications || [],
      specializations: f.specializations || [],
      research_interests: f.research_interests || [],
      publications_count: f.publications_count,
      experience_years: f.experience_years,
      email: f.email || '',
      linkedin_url: f.linkedin_url || '',
      cv_url: f.cv_url,
      is_featured: f.is_featured,
      display_order: f.display_order,
      is_active: f.is_active,
    });
    setPhotoFile(null);
    setPhotoPreview(f.photo_url);
    setCvFile(null);
    setSaveMsg(null);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setEditTarget(null);
    setSaveMsg(null);
  };

  // ── Photo upload ───────────────────────────────────────────────────────────

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  // ── Active toggle (inline) ─────────────────────────────────────────────────

  const toggleActive = async (f: Faculty) => {
    try {
      const supabase = createClientClient();
      await supabase.from('cms_faculty').update({ is_active: !f.is_active }).eq('id', f.id);
      setFaculty(prev => prev.map(x => x.id === f.id ? { ...x, is_active: !x.is_active } : x));
    } catch { /* silent */ }
  };

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.full_name.trim()) { setSaveMsg({ type: 'error', text: 'Full name is required.' }); return; }
    setSaving(true);
    setSaveMsg(null);
    try {
      const supabase = createClientClient();

      let photo_url = form.photo_url;
      if (photoFile) {
        photo_url = await uploadFile(photoFile, `faculty/${genUUID()}.jpg`);
      }

      let cv_url = form.cv_url;
      if (cvFile) {
        cv_url = await uploadFile(cvFile, `cv/${genUUID()}.pdf`);
      }

      const payload = {
        ...form,
        photo_url,
        cv_url,
        bio_en: form.bio_en || null,
        bio_fr: form.bio_fr || null,
        email: form.email || null,
        linkedin_url: form.linkedin_url || null,
      };

      if (editTarget) {
        const { data, error } = await supabase
          .from('cms_faculty')
          .update(payload)
          .eq('id', editTarget.id)
          .select()
          .single();
        if (error) throw error;
        setFaculty(prev => prev.map(x => x.id === editTarget.id ? (data as Faculty) : x));
      } else {
        const { data, error } = await supabase
          .from('cms_faculty')
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        setFaculty(prev => [...prev, data as Faculty]);
      }

      setSaveMsg({ type: 'success', text: editTarget ? 'Updated successfully!' : 'Faculty member added!' });
      setTimeout(() => closePanel(), 1500);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Save failed.';
      setSaveMsg({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async (f: Faculty) => {
    try {
      const supabase = createClientClient();
      await supabase.from('cms_faculty').delete().eq('id', f.id);
      setFaculty(prev => prev.filter(x => x.id !== f.id));
    } catch { /* silent */ }
    setDeleteTarget(null);
  };

  // ── Qualifications builder ─────────────────────────────────────────────────

  const addQual = () => {
    setForm(f => ({ ...f, qualifications: [...f.qualifications, { degree: '', institution: '', year: '' }] }));
  };
  const updateQual = (i: number, field: keyof Qualification, value: string) => {
    setForm(f => {
      const q = [...f.qualifications];
      q[i] = { ...q[i], [field]: value };
      return { ...f, qualifications: q };
    });
  };
  const removeQual = (i: number) => {
    setForm(f => ({ ...f, qualifications: f.qualifications.filter((_, idx) => idx !== i) }));
  };

  // ── Initials fallback ──────────────────────────────────────────────────────

  const initials = (name: string) =>
    name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  const getSchoolName = (id: string | null) => schools.find(s => s.id === id)?.name_en;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628] font-heading">Faculty & Staff</h1>
          <p className="text-gray-500 text-sm mt-1">{faculty.length} members total</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-[#0A1628] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition text-sm">
          <Plus className="w-4 h-4" /> Add Person
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTER_TABS.map(tab => {
          const count = faculty.filter(f => ROLE_FILTER_MAP[tab.key]?.includes(f.role)).length;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                activeTab === tab.key
                  ? 'bg-[#0A1628] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-[#C9A84C] hover:text-[#0A1628]'
              }`}>
              {tab.label}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
              <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto mb-3" />
              <div className="h-4 bg-gray-200 rounded mb-2 mx-4" />
              <div className="h-3 bg-gray-100 rounded mx-8" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <User className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p className="font-semibold">No faculty found in this category.</p>
          <button onClick={openAdd} className="mt-4 text-sm text-[#C9A84C] font-bold hover:underline">Add the first one</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(f => (
            <div key={f.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center text-center group hover:shadow-md transition-all relative">
              {/* Active indicator dot */}
              <div className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full ${f.is_active ? 'bg-green-400' : 'bg-gray-300'}`} title={f.is_active ? 'Active' : 'Inactive'} />

              {/* Photo */}
              <div className="w-20 h-20 rounded-full overflow-hidden mb-3 ring-2 ring-gray-100 flex-shrink-0">
                {f.photo_url ? (
                  <Image src={f.photo_url} alt={f.full_name} width={80} height={80} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full bg-[#0A1628] flex items-center justify-center text-white font-bold text-lg">
                    {initials(f.full_name)}
                  </div>
                )}
              </div>

              {/* Name */}
              <p className="font-bold text-[#0A1628] text-sm leading-snug mb-1 line-clamp-2">
                {f.title && <span className="text-gray-400 font-normal">{f.title} </span>}
                {f.full_name}
              </p>

              {/* Role badge */}
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full mb-1.5 ${ROLE_BADGE[f.role] || 'bg-gray-100 text-gray-600'}`}>
                {f.role}
              </span>

              {/* School */}
              {f.school_id && (
                <p className="text-[11px] text-gray-400 mb-2 line-clamp-1">{getSchoolName(f.school_id)}</p>
              )}

              {/* Active toggle */}
              <button onClick={() => toggleActive(f)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg mb-3 transition ${
                  f.is_active ? 'bg-green-50 text-green-700 hover:bg-red-50 hover:text-red-600' : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-700'
                }`}>
                {f.is_active ? 'Active' : 'Inactive'}
              </button>

              {/* Actions */}
              <div className="flex gap-2 w-full opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(f)}
                  className="flex-1 flex items-center justify-center gap-1 bg-[#0A1628] text-white text-xs font-bold py-1.5 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition">
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => setDeleteTarget(f)}
                  className="flex-1 flex items-center justify-center gap-1 bg-red-50 text-red-600 text-xs font-bold py-1.5 rounded-xl hover:bg-red-600 hover:text-white transition">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── SLIDE PANEL ── */}
      {panelOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={closePanel} />

          {/* Panel */}
          <div className="fixed top-0 right-0 h-full w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
              <h2 className="font-bold text-[#0A1628] text-lg">
                {editTarget ? `Edit: ${editTarget.full_name}` : 'Add Faculty Member'}
              </h2>
              <button onClick={closePanel} className="p-2 hover:bg-gray-100 rounded-xl transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Photo</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-gray-100 flex-shrink-0">
                    {photoPreview ? (
                      <Image src={photoPreview} alt="Preview" width={80} height={80} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full bg-[#0A1628] flex items-center justify-center text-white font-bold text-lg">
                        {form.full_name ? initials(form.full_name) : <User className="w-7 h-7 text-white/50" />}
                      </div>
                    )}
                  </div>
                  <div>
                    <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    <button type="button" onClick={() => photoInputRef.current?.click()}
                      className="flex items-center gap-2 border border-gray-200 text-gray-600 text-sm font-bold px-4 py-2 rounded-xl hover:border-[#C9A84C] hover:text-[#0A1628] transition">
                      <Upload className="w-4 h-4" /> Upload Photo
                    </button>
                    {photoFile && <p className="text-xs text-gray-400 mt-1">{photoFile.name}</p>}
                  </div>
                </div>
              </div>

              {/* Name row */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Prefix</label>
                  <div className="relative">
                    <select value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      className="border border-gray-200 rounded-xl px-3 py-3 text-sm focus:border-[#C9A84C] outline-none w-full appearance-none">
                      <option value="">—</option>
                      {TITLE_PREFIXES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Full Name *</label>
                  <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                    placeholder="e.g. Jean-Pierre Mbarga"
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full" />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Role</label>
                <div className="relative">
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full appearance-none">
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* School + Institute */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">School</label>
                  <div className="relative">
                    <select value={form.school_id || ''} onChange={e => setForm(f => ({ ...f, school_id: e.target.value || null }))}
                      className="border border-gray-200 rounded-xl px-3 py-3 text-sm focus:border-[#C9A84C] outline-none w-full appearance-none">
                      <option value="">None</option>
                      {schools.map(s => <option key={s.id} value={s.id}>{s.name_en}</option>)}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Institute</label>
                  <div className="relative">
                    <select value={form.institute_id || ''} onChange={e => setForm(f => ({ ...f, institute_id: e.target.value || null }))}
                      className="border border-gray-200 rounded-xl px-3 py-3 text-sm focus:border-[#C9A84C] outline-none w-full appearance-none">
                      <option value="">None</option>
                      {institutes.map(i => <option key={i.id} value={i.id}>{i.name_en}</option>)}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Bio EN */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Bio (English)</label>
                  <span className="text-xs text-gray-400">{(form.bio_en || '').length}/500</span>
                </div>
                <textarea value={form.bio_en || ''} rows={6}
                  onChange={e => setForm(f => ({ ...f, bio_en: e.target.value.slice(0, 500) }))}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full resize-none"
                  placeholder="Biography in English..." />
              </div>

              {/* Bio FR */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Bio (Français)</label>
                  <span className="text-xs text-gray-400">{(form.bio_fr || '').length}/500</span>
                </div>
                <textarea value={form.bio_fr || ''} rows={6}
                  onChange={e => setForm(f => ({ ...f, bio_fr: e.target.value.slice(0, 500) }))}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full resize-none"
                  placeholder="Biographie en français..." />
              </div>

              {/* Qualifications */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Qualifications</label>
                  <button type="button" onClick={addQual}
                    className="flex items-center gap-1 text-xs font-bold text-[#0A1628] bg-[#0A1628]/5 hover:bg-[#C9A84C]/20 px-3 py-1.5 rounded-lg transition">
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
                {form.qualifications.length === 0 && (
                  <p className="text-xs text-gray-400 italic">No qualifications added yet.</p>
                )}
                <div className="space-y-2">
                  {form.qualifications.map((q, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input value={q.degree} onChange={e => updateQual(i, 'degree', e.target.value)}
                        placeholder="Degree (e.g. PhD)"
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:border-[#C9A84C] outline-none" />
                      <input value={q.institution} onChange={e => updateQual(i, 'institution', e.target.value)}
                        placeholder="Institution"
                        className="flex-[2] border border-gray-200 rounded-lg px-3 py-2 text-xs focus:border-[#C9A84C] outline-none" />
                      <input value={q.year} onChange={e => updateQual(i, 'year', e.target.value.slice(0, 4))}
                        placeholder="Year" maxLength={4}
                        className="w-16 border border-gray-200 rounded-lg px-2 py-2 text-xs focus:border-[#C9A84C] outline-none text-center" />
                      <button type="button" onClick={() => removeQual(i)}
                        className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg transition text-gray-400">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specializations */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3 h-3" /> Specializations
                </label>
                <TagInput
                  tags={form.specializations}
                  onChange={tags => setForm(f => ({ ...f, specializations: tags }))}
                  placeholder="Type then press Enter or comma..."
                />
              </div>

              {/* Research Interests */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3 h-3" /> Research Interests
                </label>
                <TagInput
                  tags={form.research_interests}
                  onChange={tags => setForm(f => ({ ...f, research_interests: tags }))}
                  placeholder="Type then press Enter or comma..."
                />
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Publications Count</label>
                  <input type="number" min={0} value={form.publications_count ?? ''}
                    onChange={e => setForm(f => ({ ...f, publications_count: e.target.value ? parseInt(e.target.value) : null }))}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Years Experience</label>
                  <input type="number" min={0} value={form.experience_years ?? ''}
                    onChange={e => setForm(f => ({ ...f, experience_years: e.target.value ? parseInt(e.target.value) : null }))}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full" />
                </div>
              </div>

              {/* Contact */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Email</label>
                <input type="email" value={form.email || ''}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="faculty@ztf-university.cm"
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">LinkedIn URL</label>
                <input type="url" value={form.linkedin_url || ''}
                  onChange={e => setForm(f => ({ ...f, linkedin_url: e.target.value }))}
                  placeholder="https://linkedin.com/in/..."
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full" />
              </div>

              {/* CV Upload */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3 h-3" /> CV (PDF)
                </label>
                <input ref={cvInputRef} type="file" accept=".pdf" className="hidden"
                  onChange={e => setCvFile(e.target.files?.[0] || null)} />
                <button type="button" onClick={() => cvInputRef.current?.click()}
                  className="flex items-center gap-2 border border-gray-200 text-gray-600 text-sm font-bold px-4 py-2.5 rounded-xl hover:border-[#C9A84C] hover:text-[#0A1628] transition w-full justify-center">
                  <Upload className="w-4 h-4" />
                  {cvFile ? cvFile.name : form.cv_url ? 'Replace CV' : 'Upload CV PDF'}
                </button>
                {form.cv_url && !cvFile && (
                  <a href={form.cv_url} target="_blank" rel="noreferrer" className="text-xs text-[#C9A84C] hover:underline mt-1 block text-center">
                    View current CV
                  </a>
                )}
              </div>

              {/* Toggles + order */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3">
                  <span className="text-sm font-semibold text-gray-700">Featured</span>
                  <button type="button" onClick={() => setForm(f => ({ ...f, is_featured: !f.is_featured }))}
                    className={`w-10 h-5 rounded-full transition relative ${form.is_featured ? 'bg-[#C9A84C]' : 'bg-gray-200'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_featured ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3">
                  <span className="text-sm font-semibold text-gray-700">Active</span>
                  <button type="button" onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                    className={`w-10 h-5 rounded-full transition relative ${form.is_active ? 'bg-green-500' : 'bg-gray-200'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_active ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Display Order</label>
                <input type="number" min={0} value={form.display_order ?? ''}
                  onChange={e => setForm(f => ({ ...f, display_order: e.target.value ? parseInt(e.target.value) : null }))}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full" />
              </div>

            </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-gray-100 px-6 py-4 space-y-3">
              {saveMsg && (
                <div className={`flex items-center gap-2 text-sm font-semibold rounded-xl px-4 py-3 ${
                  saveMsg.type === 'success'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-600'
                }`}>
                  {saveMsg.type === 'success'
                    ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
                  {saveMsg.text}
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={closePanel}
                  className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition text-sm">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 bg-[#0A1628] text-white font-bold py-3 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="w-4 h-4" /> Save</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <ConfirmDelete
          name={deleteTarget.full_name}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
