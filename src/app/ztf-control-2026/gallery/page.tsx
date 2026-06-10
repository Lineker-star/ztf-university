'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  Plus, X, Save, Trash2, Edit2, Upload, Star, Images,
  AlertTriangle, CheckCircle, Search, ArrowUp, ArrowDown,
  ChevronDown
} from 'lucide-react';
import { createClientClient } from '@/lib/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────

type GalleryItem = {
  id: string;
  title_en: string | null;
  title_fr: string | null;
  description_en: string | null;
  description_fr: string | null;
  image_url: string;
  category: string;
  is_featured: boolean;
  display_order: number | null;
  created_at: string;
};

type QueueFile = {
  file: File;
  preview: string;
  title_en: string;
  title_fr: string;
  category: string;
  is_featured: boolean;
  status: 'pending' | 'uploading' | 'done' | 'error';
  errorMsg?: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ['General', 'Campus', 'Events', 'Graduation', 'Faculty', 'Students', 'Research', 'Sports'];

const CATEGORY_COLORS: Record<string, string> = {
  General:    'bg-gray-100 text-gray-700',
  Campus:     'bg-blue-100 text-blue-700',
  Events:     'bg-purple-100 text-purple-700',
  Graduation: 'bg-[#C9A84C]/20 text-[#7A6020]',
  Faculty:    'bg-indigo-100 text-indigo-700',
  Students:   'bg-green-100 text-green-700',
  Research:   'bg-cyan-100 text-cyan-700',
  Sports:     'bg-orange-100 text-orange-700',
};

// ─── Confirm dialog ───────────────────────────────────────────────────────────

function ConfirmDelete({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-xs w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-[#0A1628] text-sm">Delete Image</h3>
            <p className="text-xs text-gray-500 mt-0.5">This cannot be undone.</p>
          </div>
        </div>
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

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({
  item,
  onSave,
  onClose,
}: {
  item: GalleryItem;
  onSave: (updated: Partial<GalleryItem>) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title_en: item.title_en || '',
    title_fr: item.title_fr || '',
    description_en: item.description_en || '',
    description_fr: item.description_fr || '',
    category: item.category,
    is_featured: item.is_featured,
    display_order: item.display_order ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      title_en: form.title_en || null,
      title_fr: form.title_fr || null,
      description_en: form.description_en || null,
      description_fr: form.description_fr || null,
      category: form.category,
      is_featured: form.is_featured,
      display_order: form.display_order !== '' ? Number(form.display_order) : null,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => onClose(), 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-[#0A1628]">Edit Image</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          {/* Preview */}
          <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-gray-100">
            <Image src={item.image_url} alt="" fill className="object-cover" sizes="500px" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Title (EN)</label>
              <input value={form.title_en} onChange={e => setForm(f => ({ ...f, title_en: e.target.value }))}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#C9A84C] outline-none w-full" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Title (FR)</label>
              <input value={form.title_fr} onChange={e => setForm(f => ({ ...f, title_fr: e.target.value }))}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#C9A84C] outline-none w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Description (EN)</label>
            <textarea value={form.description_en} rows={2}
              onChange={e => setForm(f => ({ ...f, description_en: e.target.value }))}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#C9A84C] outline-none w-full resize-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Description (FR)</label>
            <textarea value={form.description_fr} rows={2}
              onChange={e => setForm(f => ({ ...f, description_fr: e.target.value }))}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#C9A84C] outline-none w-full resize-none" />
          </div>
          <div className="grid grid-cols-3 gap-3 items-end">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Category</label>
              <div className="relative">
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#C9A84C] outline-none w-full appearance-none">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Order</label>
              <input type="number" value={form.display_order}
                onChange={e => setForm(f => ({ ...f, display_order: e.target.value }))}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#C9A84C] outline-none w-full" />
            </div>
          </div>
          <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3">
            <span className="text-sm font-semibold text-gray-700">Featured</span>
            <button type="button" onClick={() => setForm(f => ({ ...f, is_featured: !f.is_featured }))}
              className={`w-10 h-5 rounded-full transition relative ${form.is_featured ? 'bg-[#C9A84C]' : 'bg-gray-200'}`}>
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_featured ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>
        </div>
        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 font-bold py-2.5 rounded-xl hover:bg-gray-50 transition text-sm">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className={`flex-1 font-bold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2 ${
              saved ? 'bg-green-500 text-white' : 'bg-[#0A1628] text-white hover:bg-[#C9A84C] hover:text-[#0A1628]'
            }`}>
            {saving ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
            ) : saved ? (
              <><CheckCircle className="w-4 h-4" />Saved!</>
            ) : (
              <><Save className="w-4 h-4" />Save Changes</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Upload Modal ─────────────────────────────────────────────────────────────

function UploadModal({ onClose, onUploaded }: { onClose: () => void; onUploaded: (items: GalleryItem[]) => void }) {
  const [queue, setQueue] = useState<QueueFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'));
    const newQueue: QueueFile[] = arr.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      title_en: file.name.replace(/\.[^.]+$/, ''),
      title_fr: '',
      category: 'General',
      is_featured: false,
      status: 'pending',
    }));
    setQueue(prev => [...prev, ...newQueue]);
  };

  const removeFromQueue = (idx: number) => {
    setQueue(prev => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const updateQueue = (idx: number, updates: Partial<QueueFile>) => {
    setQueue(prev => prev.map((item, i) => i === idx ? { ...item, ...updates } : item));
  };

  const handleUploadAll = async () => {
    if (queue.length === 0) return;
    setUploading(true);
    const supabase = createClientClient();
    const inserted: GalleryItem[] = [];

    for (let i = 0; i < queue.length; i++) {
      if (queue[i].status === 'done') continue;
      updateQueue(i, { status: 'uploading' });
      try {
        const file = queue[i].file;
        const path = `gallery/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const { error: upErr } = await supabase.storage.from('cms-uploads').upload(path, file, { upsert: true });
        if (upErr) throw upErr;
        const { data: { publicUrl } } = supabase.storage.from('cms-uploads').getPublicUrl(path);
        const { data, error: dbErr } = await supabase.from('cms_gallery').insert({
          image_url: publicUrl,
          title_en: queue[i].title_en || null,
          title_fr: queue[i].title_fr || null,
          category: queue[i].category,
          is_featured: queue[i].is_featured,
          display_order: null,
        }).select().single();
        if (dbErr) throw dbErr;
        inserted.push(data as GalleryItem);
        updateQueue(i, { status: 'done' });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Upload failed';
        updateQueue(i, { status: 'error', errorMsg: msg });
      }
    }

    setUploading(false);
    if (inserted.length > 0) {
      onUploaded(inserted);
      setTimeout(() => onClose(), 800);
    }
  };

  const doneCount = queue.filter(q => q.status === 'done').length;
  const pendingCount = queue.filter(q => q.status === 'pending').length;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="font-bold text-[#0A1628] text-lg">Upload Images</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition ${
              dragOver ? 'border-[#C9A84C] bg-[#C9A84C]/5' : 'border-gray-200 hover:border-[#C9A84C] bg-gray-50'
            }`}
          >
            <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden"
              onChange={e => addFiles(e.target.files!)} />
            <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-600">Drag images here or click to browse</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · Multiple files supported</p>
          </div>

          {/* Queue */}
          {queue.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-gray-700">{queue.length} file{queue.length !== 1 ? 's' : ''} queued</p>
                {doneCount > 0 && <span className="text-xs text-green-600 font-bold">{doneCount} uploaded</span>}
              </div>

              {/* Thumbnail preview grid */}
              <div className="grid grid-cols-4 gap-2 mb-2">
                {queue.map((q, i) => (
                  <div key={i} className="relative group">
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                      <Image src={q.preview} alt="" fill className="object-cover" sizes="100px" />
                      {q.status === 'uploading' && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        </div>
                      )}
                      {q.status === 'done' && (
                        <div className="absolute inset-0 bg-green-500/60 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                      )}
                      {q.status === 'error' && (
                        <div className="absolute inset-0 bg-red-500/60 flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                    <button onClick={() => removeFromQueue(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Per-file settings */}
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {queue.map((q, i) => (
                  <div key={i} className={`border rounded-xl p-3 space-y-2 ${
                    q.status === 'done' ? 'border-green-200 bg-green-50' :
                    q.status === 'error' ? 'border-red-200 bg-red-50' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={q.preview} alt="" fill className="object-cover" sizes="40px" />
                      </div>
                      <p className="text-xs text-gray-500 truncate flex-1">{q.file.name}</p>
                      <p className="text-xs text-gray-400 flex-shrink-0">{(q.file.size / 1024).toFixed(0)} KB</p>
                    </div>
                    {q.status === 'error' && (
                      <p className="text-xs text-red-600 font-semibold">{q.errorMsg}</p>
                    )}
                    {q.status !== 'done' && (
                      <div className="grid grid-cols-2 gap-2">
                        <input value={q.title_en} onChange={e => updateQueue(i, { title_en: e.target.value })}
                          placeholder="Title (EN)" disabled={uploading}
                          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:border-[#C9A84C] outline-none disabled:opacity-50" />
                        <input value={q.title_fr} onChange={e => updateQueue(i, { title_fr: e.target.value })}
                          placeholder="Title (FR)" disabled={uploading}
                          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:border-[#C9A84C] outline-none disabled:opacity-50" />
                        <div className="relative">
                          <select value={q.category} onChange={e => updateQueue(i, { category: e.target.value })}
                            disabled={uploading}
                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:border-[#C9A84C] outline-none w-full appearance-none disabled:opacity-50">
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer px-2">
                          <input type="checkbox" checked={q.is_featured}
                            onChange={e => updateQueue(i, { is_featured: e.target.checked })}
                            disabled={uploading}
                            className="rounded accent-[#C9A84C]" />
                          <span className="text-xs text-gray-600 font-semibold">Featured</span>
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-100 px-6 py-4 flex gap-3">
          <button onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 font-bold py-2.5 rounded-xl hover:bg-gray-50 transition text-sm">
            {doneCount > 0 ? 'Close' : 'Cancel'}
          </button>
          <button onClick={handleUploadAll} disabled={uploading || pendingCount === 0}
            className="flex-1 bg-[#0A1628] text-white font-bold py-2.5 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition text-sm disabled:opacity-40 flex items-center justify-center gap-2">
            {uploading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Uploading...</>
            ) : (
              <><Upload className="w-4 h-4" />Upload All ({pendingCount})</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('All');
  const [search, setSearch] = useState('');
  const [editItem, setEditItem] = useState<GalleryItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<GalleryItem | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);

  // ── Load ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const supabase = createClientClient();
        const { data } = await supabase
          .from('cms_gallery')
          .select('*')
          .order('display_order', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: false });
        if (data) setItems(data as GalleryItem[]);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filtered = items.filter(item => {
    const catMatch = filterCat === 'All' || item.category === filterCat;
    const q = search.toLowerCase();
    const searchMatch = !q ||
      (item.title_en || '').toLowerCase().includes(q) ||
      (item.title_fr || '').toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q);
    return catMatch && searchMatch;
  });

  // ── Stats ──────────────────────────────────────────────────────────────────

  const totalImages = items.length;
  const featuredCount = items.filter(i => i.is_featured).length;
  const categoriesCount = new Set(items.map(i => i.category)).size;

  // ── Toggle featured ────────────────────────────────────────────────────────

  const toggleFeatured = async (item: GalleryItem) => {
    try {
      const supabase = createClientClient();
      await supabase.from('cms_gallery').update({ is_featured: !item.is_featured }).eq('id', item.id);
      setItems(prev => prev.map(x => x.id === item.id ? { ...x, is_featured: !x.is_featured } : x));
    } catch { /* silent */ }
  };

  // ── Save edit ──────────────────────────────────────────────────────────────

  const handleSaveEdit = async (updated: Partial<GalleryItem>) => {
    if (!editItem) return;
    const supabase = createClientClient();
    await supabase.from('cms_gallery').update(updated).eq('id', editItem.id);
    setItems(prev => prev.map(x => x.id === editItem.id ? { ...x, ...updated } : x));
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async (item: GalleryItem) => {
    try {
      const supabase = createClientClient();
      await supabase.from('cms_gallery').delete().eq('id', item.id);
      setItems(prev => prev.filter(x => x.id !== item.id));
    } catch { /* silent */ }
    setDeleteItem(null);
  };

  // ── Reorder ────────────────────────────────────────────────────────────────

  const moveItem = useCallback(async (id: string, direction: 'up' | 'down') => {
    setItems(prev => {
      const idx = prev.findIndex(x => x.id === id);
      if (idx < 0) return prev;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];

      // Persist new order
      const supabase = createClientClient();
      arr.forEach((item, i) => {
        supabase.from('cms_gallery').update({ display_order: i }).eq('id', item.id).then(() => {});
      });

      return arr;
    });
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628] font-heading">Gallery Manager</h1>
          <p className="text-gray-500 text-sm mt-1">{totalImages} images</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setReorderMode(!reorderMode)}
            className={`flex items-center gap-2 font-bold px-4 py-2.5 rounded-xl border text-sm transition ${
              reorderMode
                ? 'bg-[#C9A84C] text-[#0A1628] border-[#C9A84C]'
                : 'border-gray-200 text-gray-600 hover:border-[#C9A84C] hover:text-[#0A1628]'
            }`}>
            {reorderMode ? 'Done Reordering' : 'Reorder'}
          </button>
          <button onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 bg-[#0A1628] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition text-sm">
            <Plus className="w-4 h-4" /> Upload Images
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Images', value: totalImages, icon: Images, color: 'text-[#0A1628]' },
          { label: 'Featured', value: featuredCount, icon: Star, color: 'text-[#C9A84C]' },
          { label: 'Categories', value: categoriesCount, icon: null, color: 'text-purple-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">{stat.label}</p>
                <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
              </div>
              {stat.icon && <stat.icon className={`w-8 h-8 ${stat.color} opacity-20`} />}
            </div>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search images..."
            className="border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:border-[#C9A84C] outline-none w-full" />
        </div>
        <div className="flex flex-wrap gap-2">
          {['All', ...CATEGORIES].map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterCat === cat
                  ? 'bg-[#0A1628] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-[#C9A84C]'
              }`}>
              {cat}
              <span className={`ml-1 ${filterCat === cat ? 'opacity-60' : 'text-gray-400'}`}>
                ({cat === 'All' ? items.length : items.filter(i => i.category === cat).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl aspect-square animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Images className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p className="font-semibold">No images found.</p>
          <button onClick={() => setShowUpload(true)}
            className="mt-4 text-sm text-[#C9A84C] font-bold hover:underline">
            Upload the first image
          </button>
        </div>
      ) : (
        <div className={reorderMode ? 'space-y-2' : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'}>
          {filtered.map((item, idx) => (
            reorderMode ? (
              /* Reorder list row */
              <div key={item.id}
                className="bg-white border border-gray-100 rounded-xl shadow-sm flex items-center gap-3 p-3 hover:shadow-md transition">
                <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                  <Image src={item.image_url} alt="" fill className="object-cover" sizes="56px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#0A1628] truncate">{item.title_en || 'Untitled'}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[item.category] || 'bg-gray-100 text-gray-600'}`}>
                    {item.category}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={() => moveItem(item.id, 'up')} disabled={idx === 0}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition disabled:opacity-30">
                    <ArrowUp className="w-4 h-4 text-gray-600" />
                  </button>
                  <button onClick={() => moveItem(item.id, 'down')} disabled={idx === filtered.length - 1}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition disabled:opacity-30">
                    <ArrowDown className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            ) : (
              /* Image card */
              <div key={item.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm group hover:shadow-lg transition-all">
                <div className="relative aspect-square overflow-hidden">
                  <Image src={item.image_url} alt={item.title_en || ''} fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />

                  {/* Featured badge */}
                  {item.is_featured && (
                    <div className="absolute top-2 left-2 bg-[#C9A84C] text-[#0A1628] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="w-2.5 h-2.5" fill="currentColor" /> Featured
                    </div>
                  )}

                  {/* Category badge */}
                  <div className={`absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[item.category] || 'bg-gray-100 text-gray-600'}`}>
                    {item.category}
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200">
                    <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditItem(item)}
                        className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg hover:bg-[#C9A84C] transition">
                        <Edit2 className="w-4 h-4 text-[#0A1628]" />
                      </button>
                      <button onClick={() => toggleFeatured(item)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition ${
                          item.is_featured ? 'bg-[#C9A84C]' : 'bg-white hover:bg-[#C9A84C]'
                        }`}>
                        <Star className={`w-4 h-4 ${item.is_featured ? 'text-[#0A1628]' : 'text-gray-500'}`} fill={item.is_featured ? 'currentColor' : 'none'} />
                      </button>
                      <button onClick={() => setDeleteItem(item)}
                        className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition">
                        <Trash2 className="w-4 h-4 text-gray-500 group/btn-hover:text-white" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="px-3 py-2.5">
                  <p className="font-semibold text-[#0A1628] text-xs leading-tight line-clamp-1">
                    {item.title_en || 'Untitled'}
                  </p>
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* Modals */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploaded={newItems => setItems(prev => [...prev, ...newItems])}
        />
      )}
      {editItem && (
        <EditModal
          item={editItem}
          onSave={handleSaveEdit}
          onClose={() => setEditItem(null)}
        />
      )}
      {deleteItem && (
        <ConfirmDelete
          onConfirm={() => handleDelete(deleteItem)}
          onCancel={() => setDeleteItem(null)}
        />
      )}
    </div>
  );
}
