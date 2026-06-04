'use client';
import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

const PAGES = [
  { key: 'home',      label: 'Home' },
  { key: 'about',     label: 'About' },
  { key: 'schools',   label: 'Schools' },
  { key: 'programs',  label: 'Programs' },
  { key: 'faculty',   label: 'Faculty' },
  { key: 'research',  label: 'Research' },
  { key: 'admission', label: 'Admission' },
  { key: 'media',     label: 'Media' },
  { key: 'gallery',   label: 'Gallery' },
  { key: 'blog',      label: 'Blog' },
  { key: 'contact',   label: 'Contact' },
];

const PRESET_IMAGES = [
  '/images/1.jpg',
  '/images/2.jpg',
  '/images/3.jpg',
  '/images/4.jpg',
  '/images/5.jpg',
  '/images/6.jpg',
];

const EFFECTS = ['Fade', 'Slide', 'Zoom', 'Ken Burns'] as const;

type SlideshowImage = {
  url: string;
  duration: number;
};

type HeroRow = {
  id?: string;
  page_key: string;
  title_en: string;
  title_fr: string;
  subtitle_en: string;
  subtitle_fr: string;
  background_image: string;
  overlay_opacity: number;
  object_position: string;
  enable_slideshow: boolean;
  slideshow_images: SlideshowImage[];
  slideshow_effect: string;
  slideshow_interval_ms: number;
  updated_at?: string;
};

const defaultRow = (page_key: string): HeroRow => ({
  page_key,
  title_en: '',
  title_fr: '',
  subtitle_en: '',
  subtitle_fr: '',
  background_image: '/images/1.jpg',
  overlay_opacity: 50,
  object_position: 'center',
  enable_slideshow: false,
  slideshow_images: [],
  slideshow_effect: 'Fade',
  slideshow_interval_ms: 5000,
});

export default function HeroManagerPage() {
  const [heroMap, setHeroMap] = useState<Record<string, HeroRow>>(() => {
    const m: Record<string, HeroRow> = {};
    PAGES.forEach(p => { m[p.key] = defaultRow(p.key); });
    return m;
  });
  const [loadError, setLoadError] = useState('');

  // Modal state
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draft, setDraft] = useState<HeroRow | null>(null);

  // Slideshow add-form state
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageDuration, setNewImageDuration] = useState(5);

  // Save state
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveMsg, setSaveMsg] = useState('');

  // Load all hero sections on mount
  useEffect(() => {
    const load = async () => {
      try {
        const { createClientClient } = await import('@/lib/supabase/client');
        const supabase = createClientClient();
        const { data, error } = await supabase.from('cms_hero_sections').select('*');
        if (error) { setLoadError(error.message); return; }
        if (data && data.length > 0) {
          setHeroMap(prev => {
            const next = { ...prev };
            (data as HeroRow[]).forEach(row => {
              next[row.page_key] = {
                ...defaultRow(row.page_key),
                ...row,
                overlay_opacity: typeof row.overlay_opacity === 'number' ? Math.round(row.overlay_opacity * 100) : 50,
                slideshow_images: Array.isArray(row.slideshow_images) ? row.slideshow_images : [],
              };
            });
            return next;
          });
        }
      } catch (e: unknown) {
        setLoadError(e instanceof Error ? e.message : 'Failed to load hero sections');
      }
    };
    load();
  }, []);

  const openEdit = (key: string) => {
    setDraft({ ...heroMap[key] });
    setNewImageUrl('');
    setNewImageDuration(5);
    setSaveStatus('idle');
    setSaveMsg('');
    setEditingKey(key);
  };

  const closeModal = () => {
    setEditingKey(null);
    setDraft(null);
    setSaveStatus('idle');
  };

  const updateDraft = <K extends keyof HeroRow>(field: K, value: HeroRow[K]) => {
    setDraft(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const addSlideshowImage = () => {
    if (!draft || !newImageUrl.trim()) return;
    updateDraft('slideshow_images', [
      ...draft.slideshow_images,
      { url: newImageUrl.trim(), duration: newImageDuration },
    ]);
    setNewImageUrl('');
    setNewImageDuration(5);
  };

  const removeSlideshowImage = (idx: number) => {
    if (!draft) return;
    updateDraft('slideshow_images', draft.slideshow_images.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!draft || !editingKey) return;
    setSaving(true);
    setSaveStatus('idle');
    try {
      const { createClientClient } = await import('@/lib/supabase/client');
      const supabase = createClientClient();
      const payload = {
        page_key: draft.page_key,
        title_en: draft.title_en,
        title_fr: draft.title_fr,
        subtitle_en: draft.subtitle_en,
        subtitle_fr: draft.subtitle_fr,
        background_image: draft.background_image,
        overlay_opacity: draft.overlay_opacity / 100,
        object_position: draft.object_position,
        enable_slideshow: draft.enable_slideshow,
        slideshow_images: draft.slideshow_images,
        slideshow_effect: draft.slideshow_effect,
        slideshow_interval_ms: draft.slideshow_interval_ms,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from('cms_hero_sections')
        .upsert(payload, { onConflict: 'page_key' });
      if (error) {
        setSaveStatus('error');
        setSaveMsg(error.message);
      } else {
        setHeroMap(prev => ({ ...prev, [editingKey]: { ...draft } }));
        setSaveStatus('success');
        setSaveMsg('Saved successfully!');
        setTimeout(() => setSaveStatus('idle'), 2500);
      }
    } catch (e: unknown) {
      setSaveStatus('error');
      setSaveMsg(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const pageLabel = (key: string) => PAGES.find(p => p.key === key)?.label ?? key;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0A1628] font-heading">Hero Sections Manager</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage hero banner image, overlay, text and slideshow for each of the 11 pages.
        </p>
        {loadError && (
          <p className="mt-2 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{loadError}</p>
        )}
      </div>

      {/* Grid of 11 page cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {PAGES.map(p => {
          const row = heroMap[p.key];
          return (
            <div key={p.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Mini preview */}
              <div className="relative h-28 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover"
                  style={{
                    backgroundImage: `url(${row.background_image})`,
                    backgroundPosition: row.object_position,
                  }}
                />
                <div
                  className="absolute inset-0 bg-[#0A1628]"
                  style={{ opacity: row.overlay_opacity / 100 }}
                />
                <div className="absolute inset-0 flex items-center justify-center px-3">
                  <span className="text-white font-bold text-sm font-heading drop-shadow text-center line-clamp-2">
                    {row.title_en || p.label}
                  </span>
                </div>
                <div className="absolute top-2 right-2 bg-[#C9A84C] text-[#0A1628] text-xs font-bold px-2 py-0.5 rounded-full">
                  {row.overlay_opacity}%
                </div>
              </div>

              {/* Card body */}
              <div className="p-4">
                <h3 className="font-bold text-[#0A1628] text-base mb-0.5">{p.label}</h3>
                <p className="text-gray-400 text-xs truncate mb-3">
                  {row.background_image ? row.background_image.split('/').pop() : 'No image set'}
                </p>
                <button
                  onClick={() => openEdit(p.key)}
                  className="w-full bg-[#0A1628] text-white font-bold px-4 py-2 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition text-sm"
                >
                  Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== EDIT MODAL ===== */}
      {editingKey && draft && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-8 pb-8">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-lg font-bold text-[#0A1628] font-heading">
                Edit {pageLabel(editingKey)} Hero
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">

              {/* 1. Background Image Selector */}
              <div>
                <label className="block text-sm font-bold text-[#0A1628] mb-3">Background Image</label>
                <div className="flex gap-2 flex-wrap mb-3">
                  {PRESET_IMAGES.map(img => (
                    <button
                      key={img}
                      onClick={() => updateDraft('background_image', img)}
                      title={img}
                      className={`flex-shrink-0 rounded-lg border-2 transition ${
                        draft.background_image === img ? 'ring-2 ring-[#C9A84C] border-[#C9A84C]' : 'border-transparent'
                      }`}
                      style={{
                        width: 80,
                        height: 50,
                        backgroundImage: `url(${img})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                  ))}
                </div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Or enter custom URL:</label>
                <input
                  type="text"
                  value={draft.background_image}
                  onChange={e => updateDraft('background_image', e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full"
                  placeholder="https://... or /images/custom.jpg"
                />
              </div>

              {/* 2. Live Preview */}
              <div>
                <label className="block text-sm font-bold text-[#0A1628] mb-2">Live Preview</label>
                <div
                  className="relative w-full rounded-xl overflow-hidden"
                  style={{ height: 160 }}
                >
                  <div
                    className="absolute inset-0 bg-cover"
                    style={{
                      backgroundImage: `url(${draft.background_image})`,
                      backgroundPosition: draft.object_position,
                    }}
                  />
                  <div
                    className="absolute inset-0 bg-[#0A1628]"
                    style={{ opacity: draft.overlay_opacity / 100 }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center px-4">
                    <span className="text-white font-bold text-lg font-heading drop-shadow text-center">
                      {draft.title_en || 'Title Text'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Overlay Opacity Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-[#0A1628]">Overlay Opacity</label>
                  <span className="text-[#C9A84C] font-bold text-sm">{draft.overlay_opacity}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={90}
                  step={5}
                  value={draft.overlay_opacity}
                  onChange={e => updateDraft('overlay_opacity', Number(e.target.value))}
                  className="w-full accent-[#C9A84C]"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>10% (light)</span>
                  <span>90% (dark)</span>
                </div>
              </div>

              {/* 4. Image Position */}
              <div>
                <label className="block text-sm font-bold text-[#0A1628] mb-2">Image Position</label>
                <div className="flex gap-2">
                  {['top', 'center', 'bottom'].map(pos => (
                    <button
                      key={pos}
                      onClick={() => updateDraft('object_position', pos)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition ${
                        draft.object_position === pos
                          ? 'bg-[#C9A84C] text-[#0A1628]'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Title EN + FR */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Title (English)</label>
                  <input
                    value={draft.title_en}
                    onChange={e => updateDraft('title_en', e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full"
                    placeholder="Page title..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Title (Français)</label>
                  <input
                    value={draft.title_fr}
                    onChange={e => updateDraft('title_fr', e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full"
                    placeholder="Titre de la page..."
                  />
                </div>
              </div>

              {/* 6. Subtitle EN + FR */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Subtitle (English)</label>
                  <input
                    value={draft.subtitle_en}
                    onChange={e => updateDraft('subtitle_en', e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full"
                    placeholder="Optional subtitle..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Subtitle (Français)</label>
                  <input
                    value={draft.subtitle_fr}
                    onChange={e => updateDraft('subtitle_fr', e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full"
                    placeholder="Sous-titre optionnel..."
                  />
                </div>
              </div>

              {/* 7. Slideshow Section */}
              <div className="border border-gray-100 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                  <span className="text-sm font-bold text-[#0A1628]">Slideshow</span>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <span className="text-xs text-gray-500">
                      {draft.enable_slideshow ? 'Enabled' : 'Disabled'}
                    </span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={draft.enable_slideshow}
                        onChange={e => updateDraft('enable_slideshow', e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-10 h-6 rounded-full transition ${draft.enable_slideshow ? 'bg-[#C9A84C]' : 'bg-gray-300'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow absolute top-1 transition-transform ${draft.enable_slideshow ? 'translate-x-5' : 'translate-x-1'}`} />
                      </div>
                    </div>
                  </label>
                </div>

                {draft.enable_slideshow && (
                  <div className="p-4 space-y-4">
                    {/* Add image row */}
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Image URL</label>
                        <input
                          type="text"
                          value={newImageUrl}
                          onChange={e => setNewImageUrl(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSlideshowImage(); } }}
                          className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-[#C9A84C] outline-none w-full"
                          placeholder="https://... or /images/..."
                        />
                      </div>
                      <div className="w-24 flex-shrink-0">
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Secs</label>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={newImageDuration}
                          onChange={e => setNewImageDuration(Number(e.target.value))}
                          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#C9A84C] outline-none w-full"
                        />
                      </div>
                      <button
                        onClick={addSlideshowImage}
                        className="flex items-center gap-1 bg-[#0A1628] text-white font-bold px-3 py-2 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition text-sm flex-shrink-0"
                      >
                        <Plus className="w-4 h-4" /> Add Image
                      </button>
                    </div>

                    {/* List of slideshow images */}
                    {draft.slideshow_images.length > 0 && (
                      <div className="space-y-2">
                        {draft.slideshow_images.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-xl p-2">
                            <div
                              className="w-16 h-10 rounded-lg flex-shrink-0 border border-gray-200 bg-cover bg-center bg-gray-100"
                              style={{ backgroundImage: `url(${item.url})` }}
                            />
                            <span className="flex-1 text-xs text-gray-600 truncate">{item.url}</span>
                            <span className="text-xs text-[#C9A84C] font-bold flex-shrink-0">{item.duration}s</span>
                            <button
                              onClick={() => removeSlideshowImage(idx)}
                              className="p-1 hover:bg-red-50 rounded-lg transition flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Effect & Interval */}
                    <div className="grid sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Transition Effect</label>
                        <div className="space-y-1.5">
                          {EFFECTS.map(effect => (
                            <label key={effect} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name={`slideshow_effect_${editingKey}`}
                                value={effect}
                                checked={draft.slideshow_effect === effect}
                                onChange={() => updateDraft('slideshow_effect', effect)}
                                className="accent-[#C9A84C]"
                              />
                              <span className="text-sm text-gray-700">{effect}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Auto-advance Interval</label>
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="number"
                            min={3000}
                            max={10000}
                            step={500}
                            value={draft.slideshow_interval_ms}
                            onChange={e => updateDraft('slideshow_interval_ms', Number(e.target.value))}
                            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#C9A84C] outline-none w-24"
                          />
                          <span className="text-sm text-gray-500">ms ({draft.slideshow_interval_ms / 1000}s)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Save feedback */}
              {saveStatus === 'success' && (
                <p className="text-green-700 text-sm font-semibold bg-green-50 border border-green-200 rounded-xl px-4 py-2">
                  {saveMsg}
                </p>
              )}
              {saveStatus === 'error' && (
                <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                  Error: {saveMsg}
                </p>
              )}

              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={saving}
                className={`w-full py-3 rounded-xl font-bold text-sm transition disabled:opacity-50 ${
                  saveStatus === 'success'
                    ? 'bg-green-500 text-white'
                    : 'bg-[#0A1628] text-white hover:bg-[#C9A84C] hover:text-[#0A1628]'
                }`}
              >
                {saving ? 'Saving…' : saveStatus === 'success' ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
