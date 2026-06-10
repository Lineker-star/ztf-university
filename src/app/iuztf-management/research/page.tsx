'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClientClient } from '@/lib/supabase/client';
import {
  Plus, X, Save, Trash2, Edit2, Star, Loader2,
  CheckCircle, AlertCircle, Search, RefreshCw,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Faculty { id: string; full_name: string; title_prefix: string; }

interface Research {
  id: string;
  title_en: string;
  title_fr: string;
  abstract_en: string;
  abstract_fr: string;
  authors: string[];
  category: string;
  journal_name: string;
  doi_url: string;
  published_date: string;
  pdf_url: string;
  is_featured: boolean;
  faculty_id: string | null;
  is_active: boolean;
  created_at: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ['Science', 'Technology', 'Business', 'Legal', 'Medicine', 'Agronomy', 'Humanities', 'Engineering'];

const CATEGORY_COLORS: Record<string, string> = {
  Science: 'bg-blue-100 text-blue-800', Technology: 'bg-purple-100 text-purple-800',
  Business: 'bg-orange-100 text-orange-800', Legal: 'bg-red-100 text-red-800',
  Medicine: 'bg-green-100 text-green-800', Agronomy: 'bg-lime-100 text-lime-800',
  Humanities: 'bg-yellow-100 text-yellow-800', Engineering: 'bg-gray-100 text-gray-700',
};

const WCS_PRODUCTS = [
  { name: 'Hépatoprep', desc: 'Hepatic health supplement for liver support', emoji: '🫁' },
  { name: 'Androprep', desc: 'Prostate health and male wellness formula', emoji: '💊' },
  { name: 'Fématoprep', desc: "Women's health and hormonal balance support", emoji: '🌸' },
  { name: 'Arthroprep', desc: 'Joint health and mobility support formula', emoji: '🦴' },
  { name: 'Gloméruloprep', desc: 'Kidney support and renal health formula', emoji: '🫘' },
  { name: 'Cardiprep', desc: 'Cardiovascular health and heart support', emoji: '❤️' },
];

const inputCls = 'border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full';
const textareaCls = 'border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full resize-none';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminResearchPage() {
  const supabase = createClientClient();

  const [tab, setTab] = useState<'articles' | 'wcs'>('articles');
  const [articles, setArticles] = useState<Research[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterCategory, setFilterCategory] = useState('all');
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Research | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form
  const [form, setForm] = useState({
    title_en: '', title_fr: '', abstract_en: '', abstract_fr: '',
    authors: [] as string[], authorInput: '',
    category: 'Science', journal_name: '', doi_url: '', published_date: '',
    pdf_url: '', is_featured: false, faculty_id: '', is_active: true,
  });

  // ─── Load ──────────────────────────────────────────────────────────────────

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [resRes, facRes] = await Promise.all([
        supabase.from('cms_research').select('*').order('published_date', { ascending: false }),
        supabase.from('cms_faculty').select('id, full_name, title_prefix').order('full_name'),
      ]);
      setArticles((resRes.data || []).map((r: Research) => ({ ...r, authors: Array.isArray(r.authors) ? r.authors : [] })));
      setFaculty(facRes.data || []);
    } catch { /* non-fatal */ }
    finally { setLoading(false); }
  }, []); // eslint-disable-line

  useEffect(() => { loadAll(); }, [loadAll]);

  // ─── Filtered ─────────────────────────────────────────────────────────────

  const filtered = articles.filter(a => {
    if (filterCategory !== 'all' && a.category !== filterCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.title_en.toLowerCase().includes(q) || a.authors.join(',').toLowerCase().includes(q);
    }
    return true;
  });

  // ─── Modal ────────────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditing(null);
    setForm({ title_en: '', title_fr: '', abstract_en: '', abstract_fr: '', authors: [], authorInput: '', category: 'Science', journal_name: '', doi_url: '', published_date: '', pdf_url: '', is_featured: false, faculty_id: '', is_active: true });
    setShowModal(true); setSaveMsg('');
  };

  const openEdit = (a: Research) => {
    setEditing(a);
    setForm({ title_en: a.title_en, title_fr: a.title_fr || '', abstract_en: a.abstract_en || '', abstract_fr: a.abstract_fr || '', authors: a.authors || [], authorInput: '', category: a.category || 'Science', journal_name: a.journal_name || '', doi_url: a.doi_url || '', published_date: a.published_date || '', pdf_url: a.pdf_url || '', is_featured: a.is_featured, faculty_id: a.faculty_id || '', is_active: a.is_active });
    setShowModal(true); setSaveMsg('');
  };

  const addAuthor = () => {
    const name = form.authorInput.trim();
    if (name && !form.authors.includes(name)) {
      setForm(f => ({ ...f, authors: [...f.authors, name], authorInput: '' }));
    }
  };

  const handleSave = async () => {
    if (!form.title_en) { setSaveMsg('Title (EN) is required.'); return; }
    setSaving(true); setSaveMsg('');
    try {
      const payload = {
        title_en: form.title_en, title_fr: form.title_fr, abstract_en: form.abstract_en,
        abstract_fr: form.abstract_fr, authors: form.authors, category: form.category,
        journal_name: form.journal_name, doi_url: form.doi_url,
        published_date: form.published_date || null, pdf_url: form.pdf_url,
        is_featured: form.is_featured, faculty_id: form.faculty_id || null, is_active: form.is_active,
      };
      if (editing) {
        await supabase.from('cms_research').update(payload).eq('id', editing.id);
      } else {
        await supabase.from('cms_research').insert({ ...payload, created_at: new Date().toISOString() });
      }
      setSaveMsg('Saved!');
      await loadAll();
      setTimeout(() => { setShowModal(false); setSaveMsg(''); }, 1000);
    } catch (e) { setSaveMsg('Error: ' + (e instanceof Error ? e.message : 'unknown')); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('cms_research').delete().eq('id', id);
    setDeleteId(null);
    await loadAll();
  };

  const toggleFeatured = async (a: Research) => {
    await supabase.from('cms_research').update({ is_featured: !a.is_featured }).eq('id', a.id);
    setArticles(prev => prev.map(x => x.id === a.id ? { ...x, is_featured: !x.is_featured } : x));
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628] font-heading">Research Manager</h1>
          <p className="text-gray-500 text-sm mt-1">{articles.length} articles</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadAll} className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
          {tab === 'articles' && (
            <button onClick={openAdd} className="flex items-center gap-1.5 bg-[#0A1628] text-white font-bold text-sm px-4 py-2 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition">
              <Plus className="w-4 h-4" /> Add Research
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {[{ key: 'articles', label: 'Research Articles' }, { key: 'wcs', label: 'WCS Innovations' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as 'articles' | 'wcs')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${tab === t.key ? 'bg-[#0A1628] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ARTICLES TAB */}
      {tab === 'articles' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button onClick={() => setFilterCategory('all')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${filterCategory === 'all' ? 'bg-[#0A1628] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setFilterCategory(c)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${filterCategory === c ? 'bg-[#0A1628] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{c}</button>
            ))}
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or author..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#C9A84C] outline-none" />
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Title', 'Authors', 'Category', 'Journal', 'Date', '⭐', 'Active', ''].map(h => (
                      <th key={h} className="text-left px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr><td colSpan={8} className="text-center py-10 text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-10 text-gray-400">{articles.length === 0 ? 'No research articles yet.' : 'No results match your filters.'}</td></tr>
                  ) : filtered.map(a => (
                    <tr key={a.id} className="hover:bg-gray-50 transition">
                      <td className="px-3 py-3 max-w-[200px]">
                        <p className="font-semibold text-[#0A1628] truncate">{a.title_en}</p>
                        {a.doi_url && <a href={a.doi_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#C9A84C] hover:underline">DOI</a>}
                      </td>
                      <td className="px-3 py-3 text-gray-500 text-xs max-w-[140px] truncate">{a.authors.join(', ')}</td>
                      <td className="px-3 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[a.category] || 'bg-gray-100 text-gray-600'}`}>{a.category}</span>
                      </td>
                      <td className="px-3 py-3 text-gray-500 text-xs max-w-[120px] truncate">{a.journal_name || '—'}</td>
                      <td className="px-3 py-3 text-gray-400 text-xs whitespace-nowrap">{a.published_date ? new Date(a.published_date).toLocaleDateString() : '—'}</td>
                      <td className="px-3 py-3">
                        <button onClick={() => toggleFeatured(a)} className="hover:scale-110 transition">
                          <Star className={`w-4 h-4 ${a.is_featured ? 'fill-[#C9A84C] text-[#C9A84C]' : 'text-gray-300'}`} />
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${a.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{a.is_active ? 'Active' : 'Off'}</span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(a)} className="p-1.5 text-[#C9A84C] hover:bg-[#C9A84C]/10 rounded-lg transition"><Edit2 className="w-3.5 h-3.5" /></button>
                          {deleteId === a.id ? (
                            <span className="flex gap-1 items-center">
                              <button onClick={() => handleDelete(a.id)} className="text-xs bg-red-600 text-white px-2 py-1 rounded-lg font-bold">Delete</button>
                              <button onClick={() => setDeleteId(null)} className="text-xs border border-gray-200 px-2 py-1 rounded-lg text-gray-500">Cancel</button>
                            </span>
                          ) : (
                            <button onClick={() => setDeleteId(a.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-3.5 h-3.5" /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* WCS TAB */}
      {tab === 'wcs' && (
        <div>
          <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/20 rounded-2xl p-5 mb-6">
            <h3 className="font-bold text-[#0A1628] font-heading mb-1">WCS Innovations</h3>
            <p className="text-gray-500 text-sm">Products developed from ZTF University research initiatives. Managed by WCS site.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {WCS_PRODUCTS.map(p => (
              <div key={p.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="text-3xl mb-3">{p.emoji}</div>
                <h4 className="font-bold text-[#0A1628] font-heading mb-1">{p.name}</h4>
                <p className="text-gray-500 text-sm mb-4">{p.desc}</p>
                <a href="#" className="text-xs text-[#C9A84C] font-bold hover:underline">View on WCS site →</a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-6">
            <div className="bg-[#0A1628] rounded-t-2xl px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold font-heading">{editing ? 'Edit Research' : 'Add Research Article'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Title (English) *</label>
                  <input value={form.title_en} onChange={e => setForm(f => ({ ...f, title_en: e.target.value }))} className={inputCls} placeholder="Research title..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Title (Français)</label>
                  <input value={form.title_fr} onChange={e => setForm(f => ({ ...f, title_fr: e.target.value }))} className={inputCls} placeholder="Titre de la recherche..." />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Abstract (EN)</label>
                  <textarea value={form.abstract_en} onChange={e => setForm(f => ({ ...f, abstract_en: e.target.value }))} rows={4} className={textareaCls} placeholder="Research abstract..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Abstract (FR)</label>
                  <textarea value={form.abstract_fr} onChange={e => setForm(f => ({ ...f, abstract_fr: e.target.value }))} rows={4} className={textareaCls} placeholder="Résumé de la recherche..." />
                </div>
              </div>

              {/* Authors tag input */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Authors</label>
                <div className="flex gap-2 mb-2">
                  <input value={form.authorInput} onChange={e => setForm(f => ({ ...f, authorInput: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addAuthor(); } }}
                    placeholder="Author name, press Enter to add..."
                    className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-[#C9A84C] outline-none flex-1" />
                  <button onClick={addAuthor} className="bg-gray-100 text-gray-600 font-bold px-3 py-2 rounded-xl text-sm hover:bg-gray-200 transition">Add</button>
                </div>
                {form.authors.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {form.authors.map(a => (
                      <span key={a} className="flex items-center gap-1 bg-[#0A1628]/10 text-[#0A1628] text-xs font-semibold px-2.5 py-1 rounded-full">
                        {a}
                        <button onClick={() => setForm(f => ({ ...f, authors: f.authors.filter(x => x !== a) }))}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputCls}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Publication Date</label>
                  <input type="date" value={form.published_date} onChange={e => setForm(f => ({ ...f, published_date: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Journal Name</label>
                  <input value={form.journal_name} onChange={e => setForm(f => ({ ...f, journal_name: e.target.value }))} className={inputCls} placeholder="Journal of Applied Sciences" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">DOI / Link</label>
                  <input value={form.doi_url} onChange={e => setForm(f => ({ ...f, doi_url: e.target.value }))} className={inputCls} placeholder="https://doi.org/..." />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">PDF URL</label>
                  <input value={form.pdf_url} onChange={e => setForm(f => ({ ...f, pdf_url: e.target.value }))} className={inputCls} placeholder="https://... or /docs/paper.pdf" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Faculty Member (optional)</label>
                  <select value={form.faculty_id} onChange={e => setForm(f => ({ ...f, faculty_id: e.target.value }))} className={inputCls}>
                    <option value="">Not linked</option>
                    {faculty.map(f => <option key={f.id} value={f.id}>{f.title_prefix} {f.full_name}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-6">
                {[
                  { label: 'Featured', key: 'is_featured' as const },
                  { label: 'Active', key: 'is_active' as const },
                ].map(t => (
                  <label key={t.key} className="flex items-center gap-2 cursor-pointer">
                    <button type="button" onClick={() => setForm(f => ({ ...f, [t.key]: !f[t.key] }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${form[t.key] ? 'bg-[#C9A84C]' : 'bg-gray-200'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${form[t.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className="text-sm font-semibold text-gray-700">{t.label}</span>
                  </label>
                ))}
              </div>

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
                    <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Article'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
