'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClientClient } from '@/lib/supabase/client';
import {
  Megaphone, BarChart2, Layout, User, Newspaper,
  Save, CheckCircle, AlertCircle, Loader2, Plus, Trash2,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type AnnouncementType = 'info' | 'warning' | 'success' | 'urgent';

interface Stat {
  label_en: string;
  label_fr: string;
  value: string;
  icon: string;
}

interface FounderData {
  name: string;
  title: string;
  bio_en: string;
  bio_fr: string;
  quote_en: string;
  quote_fr: string;
  photo_url: string;
}

const DEFAULT_STATS: Stat[] = [
  { label_en: 'Higher Institutes', label_fr: 'Instituts Supérieurs', value: '3', icon: '🏛️' },
  { label_en: 'Students', label_fr: 'Étudiants', value: '300+', icon: '👨‍🎓' },
  { label_en: 'Faculty Members', label_fr: 'Enseignants', value: '100', icon: '👨‍🏫' },
  { label_en: 'Fields/Specialties', label_fr: 'Filières', value: '100+', icon: '📚' },
  { label_en: 'Schools', label_fr: 'Écoles', value: '7', icon: '🏫' },
  { label_en: 'Programmes', label_fr: 'Programmes', value: '10+', icon: '📋' },
];

const DEFAULT_FOUNDER: FounderData = {
  name: 'Prof. Zacharias Tanee Fomum',
  title: 'Founder & Visionary (1945–2009)',
  bio_en: '',
  bio_fr: '',
  quote_en: '',
  quote_fr: '',
  photo_url: '',
};

const ANNOUNCEMENT_COLORS: Record<AnnouncementType, string> = {
  info: 'bg-blue-100 text-blue-800 border-blue-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  success: 'bg-green-100 text-green-800 border-green-200',
  urgent: 'bg-red-100 text-red-800 border-red-200',
};

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition ${on ? 'bg-[#C9A84C]' : 'bg-gray-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${on ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

// ─── Section Feedback ─────────────────────────────────────────────────────────

type FeedbackState = 'idle' | 'saving' | 'saved' | 'error';

function SectionFeedback({ state, error }: { state: FeedbackState; error?: string }) {
  if (state === 'saving') return (
    <span className="flex items-center gap-1.5 text-gray-500 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Saving...</span>
  );
  if (state === 'saved') return (
    <span className="flex items-center gap-1.5 text-green-600 text-sm font-semibold"><CheckCircle className="w-4 h-4" /> Saved!</span>
  );
  if (state === 'error') return (
    <span className="flex items-center gap-1.5 text-red-600 text-sm"><AlertCircle className="w-4 h-4" /> {error || 'Failed to save'}</span>
  );
  return null;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminHomePage() {
  const supabase = createClientClient();

  // Section A
  const [announcementEnabled, setAnnouncementEnabled] = useState(false);
  const [announcementTextEn, setAnnouncementTextEn] = useState('');
  const [announcementTextFr, setAnnouncementTextFr] = useState('');
  const [announcementType, setAnnouncementType] = useState<AnnouncementType>('info');
  const [announceFeedback, setAnnounceFeedback] = useState<FeedbackState>('idle');
  const [announceError, setAnnounceError] = useState('');

  // Section B
  const [stats, setStats] = useState<Stat[]>(DEFAULT_STATS);
  const [statsFeedback, setStatsFeedback] = useState<FeedbackState>('idle');
  const [statsError, setStatsError] = useState('');

  // Section D
  const [founder, setFounder] = useState<FounderData>(DEFAULT_FOUNDER);
  const [founderFeedback, setFounderFeedback] = useState<FeedbackState>('idle');
  const [founderError, setFounderError] = useState('');

  // Section E
  const [newsCount, setNewsCount] = useState(3);
  const [newsEnabled, setNewsEnabled] = useState(true);
  const [newsFeedback, setNewsFeedback] = useState<FeedbackState>('idle');
  const [newsError, setNewsError] = useState('');

  const [initialLoading, setInitialLoading] = useState(true);

  // ─── Load ──────────────────────────────────────────────────────────────────

  const loadSettings = useCallback(async () => {
    setInitialLoading(true);
    try {
      const keys = [
        'announcement_enabled', 'announcement_text_en', 'announcement_text_fr',
        'announcement_type', 'homepage_stats', 'news_count', 'news_enabled',
      ];
      const { data } = await supabase
        .from('cms_site_settings')
        .select('key, value')
        .in('key', keys);

      const map: Record<string, string> = {};
      (data || []).forEach((row: { key: string; value: string }) => { map[row.key] = row.value; });

      if (map.announcement_enabled !== undefined) setAnnouncementEnabled(map.announcement_enabled === 'true');
      if (map.announcement_text_en) setAnnouncementTextEn(map.announcement_text_en);
      if (map.announcement_text_fr) setAnnouncementTextFr(map.announcement_text_fr);
      if (map.announcement_type) setAnnouncementType(map.announcement_type as AnnouncementType);
      if (map.homepage_stats) { try { setStats(JSON.parse(map.homepage_stats)); } catch { /* keep defaults */ } }
      if (map.news_count) setNewsCount(parseInt(map.news_count) || 3);
      if (map.news_enabled !== undefined) setNewsEnabled(map.news_enabled !== 'false');

      const { data: fc } = await supabase
        .from('cms_site_settings')
        .select('value')
        .eq('key', 'founder_data')
        .maybeSingle();

      if (fc?.value) { try { setFounder({ ...DEFAULT_FOUNDER, ...JSON.parse(fc.value) }); } catch { /* keep defaults */ } }
    } catch { /* non-fatal: keep defaults */ }
    finally { setInitialLoading(false); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadSettings(); }, [loadSettings]);

  // ─── Upsert helper ────────────────────────────────────────────────────────

  const upsertSettings = async (entries: Array<{ key: string; value: string }>) => {
    const { error } = await supabase
      .from('cms_site_settings')
      .upsert(entries.map(e => ({ key: e.key, value: e.value })), { onConflict: 'key' });
    if (error) throw new Error(error.message);
  };

  // ─── Save handlers ────────────────────────────────────────────────────────

  const saveAnnouncement = async () => {
    setAnnounceFeedback('saving'); setAnnounceError('');
    try {
      await upsertSettings([
        { key: 'announcement_enabled', value: String(announcementEnabled) },
        { key: 'announcement_text_en', value: announcementTextEn },
        { key: 'announcement_text_fr', value: announcementTextFr },
        { key: 'announcement_type', value: announcementType },
      ]);
      setAnnounceFeedback('saved');
      setTimeout(() => setAnnounceFeedback('idle'), 2500);
    } catch (e) {
      setAnnounceError(e instanceof Error ? e.message : 'Unknown error');
      setAnnounceFeedback('error');
    }
  };

  const saveStats = async () => {
    setStatsFeedback('saving'); setStatsError('');
    try {
      await upsertSettings([{ key: 'homepage_stats', value: JSON.stringify(stats) }]);
      setStatsFeedback('saved');
      setTimeout(() => setStatsFeedback('idle'), 2500);
    } catch (e) {
      setStatsError(e instanceof Error ? e.message : 'Unknown error');
      setStatsFeedback('error');
    }
  };

  const updateStat = (i: number, field: keyof Stat, value: string) => {
    setStats(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  };

  const saveFounder = async () => {
    setFounderFeedback('saving'); setFounderError('');
    try {
      const { error } = await supabase
        .from('cms_site_settings')
        .upsert({ key: 'founder_data', value: JSON.stringify(founder) }, { onConflict: 'key' });
      if (error) throw new Error(error.message);
      setFounderFeedback('saved');
      setTimeout(() => setFounderFeedback('idle'), 2500);
    } catch (e) {
      setFounderError(e instanceof Error ? e.message : 'Unknown error');
      setFounderFeedback('error');
    }
  };

  const saveNews = async () => {
    setNewsFeedback('saving'); setNewsError('');
    try {
      await upsertSettings([
        { key: 'news_count', value: String(newsCount) },
        { key: 'news_enabled', value: String(newsEnabled) },
      ]);
      setNewsFeedback('saved');
      setTimeout(() => setNewsFeedback('idle'), 2500);
    } catch (e) {
      setNewsError(e instanceof Error ? e.message : 'Unknown error');
      setNewsFeedback('error');
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#C9A84C]" />
        <span className="ml-3 text-gray-500">Loading home settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0A1628] font-heading">Home Page Manager</h1>
        <p className="text-gray-500 text-sm mt-1">Manage all content shown on the home page.</p>
      </div>

      {/* ── A: Announcement Banner ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <Megaphone className="w-5 h-5 text-[#C9A84C]" />
          <h2 className="text-lg font-bold text-[#0A1628] font-heading">Announcement Banner</h2>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-5">
          <div>
            <p className="text-sm font-semibold text-gray-700">Show announcement banner</p>
            <p className="text-xs text-gray-400 mt-0.5">Display a site-wide notification bar at the top of every page</p>
          </div>
          <Toggle on={announcementEnabled} onChange={setAnnouncementEnabled} />
        </div>

        <div className="mb-5">
          <label className="block text-sm font-bold text-gray-700 mb-3">Banner Type</label>
          <div className="flex flex-wrap gap-2">
            {(['info', 'warning', 'success', 'urgent'] as AnnouncementType[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setAnnouncementType(t)}
                className={`px-4 py-2 rounded-xl text-sm font-bold border transition capitalize ${
                  announcementType === t
                    ? ANNOUNCEMENT_COLORS[t] + ' border-current ring-2 ring-offset-1 ring-current'
                    : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className={`mt-3 px-4 py-2.5 rounded-xl border text-sm font-semibold ${ANNOUNCEMENT_COLORS[announcementType]}`}>
            Preview: {announcementTextEn || 'Your announcement text will appear here...'}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Text (English)</label>
            <input value={announcementTextEn} onChange={e => setAnnouncementTextEn(e.target.value)}
              placeholder="Announcement text in English..."
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Text (Français)</label>
            <input value={announcementTextFr} onChange={e => setAnnouncementTextFr(e.target.value)}
              placeholder="Texte de l'annonce en français..."
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <SectionFeedback state={announceFeedback} error={announceError} />
          <button onClick={saveAnnouncement} disabled={announceFeedback === 'saving'}
            className="flex items-center gap-2 bg-[#0A1628] text-white font-bold px-4 py-2 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition disabled:opacity-50">
            <Save className="w-4 h-4" /> Save Banner
          </button>
        </div>
      </div>

      {/* ── B: Stats Bar ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <BarChart2 className="w-5 h-5 text-[#C9A84C]" />
          <h2 className="text-lg font-bold text-[#0A1628] font-heading">Stats Bar Editor</h2>
        </div>

        <div className="space-y-3 mb-5">
          <div className="hidden sm:grid grid-cols-12 gap-2 text-xs font-bold text-gray-400 uppercase px-1">
            <span className="col-span-1">Icon</span>
            <span className="col-span-4">Label (EN)</span>
            <span className="col-span-4">Label (FR)</span>
            <span className="col-span-2">Value</span>
            <span className="col-span-1"></span>
          </div>
          {stats.map((stat, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center bg-gray-50 rounded-xl p-2">
              <div className="col-span-1">
                <input value={stat.icon} onChange={e => updateStat(i, 'icon', e.target.value)} maxLength={4}
                  className="border border-gray-200 rounded-lg px-2 py-2 text-center text-base w-full focus:border-[#C9A84C] outline-none bg-white" />
              </div>
              <div className="col-span-4">
                <input value={stat.label_en} onChange={e => updateStat(i, 'label_en', e.target.value)} placeholder="Label EN..."
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#C9A84C] outline-none w-full bg-white" />
              </div>
              <div className="col-span-4">
                <input value={stat.label_fr} onChange={e => updateStat(i, 'label_fr', e.target.value)} placeholder="Label FR..."
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#C9A84C] outline-none w-full bg-white" />
              </div>
              <div className="col-span-2">
                <input value={stat.value} onChange={e => updateStat(i, 'value', e.target.value)} placeholder="300+"
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#C9A84C] outline-none w-full bg-white" />
              </div>
              <div className="col-span-1 flex justify-end">
                {stats.length > 1 && (
                  <button type="button" onClick={() => setStats(prev => prev.filter((_, idx) => idx !== i))}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {stats.length < 8 && (
          <button type="button"
            onClick={() => setStats(prev => [...prev, { label_en: '', label_fr: '', value: '', icon: '📌' }])}
            className="flex items-center gap-2 text-sm text-[#0A1628] font-semibold border border-dashed border-gray-300 px-4 py-2 rounded-xl hover:border-[#C9A84C] hover:text-[#C9A84C] transition mb-5">
            <Plus className="w-4 h-4" /> Add Stat
          </button>
        )}

        <div className="flex items-center justify-between">
          <SectionFeedback state={statsFeedback} error={statsError} />
          <button onClick={saveStats} disabled={statsFeedback === 'saving'}
            className="flex items-center gap-2 bg-[#0A1628] text-white font-bold px-4 py-2 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition disabled:opacity-50">
            <Save className="w-4 h-4" /> Save Stats
          </button>
        </div>
      </div>

      {/* ── C: Hero Quick Link ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-3">
          <Layout className="w-5 h-5 text-[#C9A84C]" />
          <h2 className="text-lg font-bold text-[#0A1628] font-heading">Hero Section</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Manage hero banners, background images, overlay settings, and titles for all pages from the centralized Hero Manager.
        </p>
        <Link href="/iuztf-management/hero"
          className="inline-flex items-center gap-2 bg-[#0A1628] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition text-sm">
          Edit Home Hero →
        </Link>
      </div>

      {/* ── D: Founder ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <User className="w-5 h-5 text-[#C9A84C]" />
          <h2 className="text-lg font-bold text-[#0A1628] font-heading">Founder Section</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Founder Name</label>
            <input value={founder.name} onChange={e => setFounder(f => ({ ...f, name: e.target.value }))}
              placeholder="Prof. Zacharias Tanee Fomum"
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Title / Dates</label>
            <input value={founder.title} onChange={e => setFounder(f => ({ ...f, title: e.target.value }))}
              placeholder="Founder & Visionary (1945–2009)"
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Biography (English)</label>
            <textarea value={founder.bio_en} onChange={e => setFounder(f => ({ ...f, bio_en: e.target.value }))}
              rows={4} placeholder="Enter biography in English..."
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full resize-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Biography (Français)</label>
            <textarea value={founder.bio_fr} onChange={e => setFounder(f => ({ ...f, bio_fr: e.target.value }))}
              rows={4} placeholder="Entrez la biographie en français..."
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full resize-none" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Quote (English)</label>
            <input value={founder.quote_en} onChange={e => setFounder(f => ({ ...f, quote_en: e.target.value }))}
              placeholder="Inspiring quote in English..."
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Quote (Français)</label>
            <input value={founder.quote_fr} onChange={e => setFounder(f => ({ ...f, quote_fr: e.target.value }))}
              placeholder="Citation inspirante en français..."
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full" />
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Photo URL</label>
          <input value={founder.photo_url} onChange={e => setFounder(f => ({ ...f, photo_url: e.target.value }))}
            placeholder="https://... or /images/founder.jpg"
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full" />
          {founder.photo_url && (
            <div className="mt-2 flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={founder.photo_url} alt="Founder preview"
                className="w-12 h-12 rounded-full object-cover border border-gray-200"
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              <span className="text-xs text-gray-400">Photo preview</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <SectionFeedback state={founderFeedback} error={founderError} />
          <button onClick={saveFounder} disabled={founderFeedback === 'saving'}
            className="flex items-center gap-2 bg-[#0A1628] text-white font-bold px-4 py-2 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition disabled:opacity-50">
            <Save className="w-4 h-4" /> Save Founder
          </button>
        </div>
      </div>

      {/* ── E: News Settings ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <Newspaper className="w-5 h-5 text-[#C9A84C]" />
          <h2 className="text-lg font-bold text-[#0A1628] font-heading">Latest News Settings</h2>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-5">
          <div>
            <p className="text-sm font-semibold text-gray-700">Show news section on homepage</p>
            <p className="text-xs text-gray-400 mt-0.5">Toggle visibility of the Latest News block</p>
          </div>
          <Toggle on={newsEnabled} onChange={setNewsEnabled} />
        </div>

        <div className="mb-5">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-3">
            Number of posts to show on homepage
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <button key={n} type="button" onClick={() => setNewsCount(n)}
                className={`w-11 h-11 rounded-xl text-sm font-bold transition ${
                  newsCount === n ? 'bg-[#0A1628] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {n}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">Currently set to {newsCount} post{newsCount !== 1 ? 's' : ''}</p>
        </div>

        <div className="flex items-center justify-between">
          <SectionFeedback state={newsFeedback} error={newsError} />
          <button onClick={saveNews} disabled={newsFeedback === 'saving'}
            className="flex items-center gap-2 bg-[#0A1628] text-white font-bold px-4 py-2 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition disabled:opacity-50">
            <Save className="w-4 h-4" /> Save News Settings
          </button>
        </div>
      </div>
    </div>
  );
}
