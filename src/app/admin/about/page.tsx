'use client';
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus, X, Save } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type IdentityData = {
  university_name_en: string;
  university_name_fr: string;
  founded_year: string;
  location: string;
  accreditation: string;
};

type MissionData = {
  mission_en: string;
  mission_fr: string;
  vision_en: string;
  vision_fr: string;
  values: string[];
};

type LeaderCard = {
  name: string;
  title_en: string;
  title_fr: string;
  description_en: string;
  description_fr: string;
  department: string;
  bio_en: string;
  bio_fr: string;
  photo_url: string;
};

type HistoryData = {
  history_en: string;
  history_fr: string;
};

type StatItem = {
  label_en: string;
  label_fr: string;
  value: string;
  icon: string;
};

// ─── Defaults ─────────────────────────────────────────────────────────────────

const defaultIdentity: IdentityData = {
  university_name_en: 'ZTF University Institute (ZTF-UI)',
  university_name_fr: 'Institut Universitaire ZTF (IU-ZTF)',
  founded_year: '2023',
  location: 'Bertoua, East Region, Cameroon',
  accreditation: '',
};

const defaultMission: MissionData = {
  mission_en: '',
  mission_fr: '',
  vision_en: '',
  vision_fr: '',
  values: [],
};

const defaultLeadership: LeaderCard[] = [
  {
    name: 'Pastor Theodore ANDOSEH',
    title_en: 'President & Promoter',
    title_fr: 'Président & Promoteur',
    description_en: '',
    description_fr: '',
    department: '',
    bio_en: '',
    bio_fr: '',
    photo_url: '/images/President & Promoter.png',
  },
  {
    name: 'Prof. Dieudonnée NJAMEN',
    title_en: 'Rector',
    title_fr: 'Recteur',
    description_en: '',
    description_fr: '',
    department: '',
    bio_en: '',
    bio_fr: '',
    photo_url: '/images/Rector.png',
  },
  {
    name: 'Prof. Moïse ADAMOU',
    title_en: 'Vice-Rector',
    title_fr: 'Vice-Recteur',
    description_en: '',
    description_fr: '',
    department: '',
    bio_en: '',
    bio_fr: '',
    photo_url: '/images/Vice Rector.jpg',
  },
];

const defaultHistory: HistoryData = {
  history_en: '',
  history_fr: '',
};

const defaultStats: StatItem[] = [
  { label_en: 'Students Enrolled', label_fr: 'Étudiants inscrits', value: '500+', icon: '🎓' },
  { label_en: 'Academic Programs', label_fr: 'Programmes académiques', value: '12', icon: '📚' },
  { label_en: 'Faculty Members', label_fr: 'Membres du corps enseignant', value: '40+', icon: '👨‍🏫' },
  { label_en: 'Research Projects', label_fr: 'Projets de recherche', value: '20+', icon: '🔬' },
  { label_en: 'Year Founded', label_fr: 'Année de fondation', value: '2023', icon: '🏛️' },
  { label_en: 'Partner Institutions', label_fr: 'Institutions partenaires', value: '10+', icon: '🤝' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function safeJson<T>(raw: unknown, fallback: T): T {
  if (!raw) return fallback;
  if (typeof raw === 'object') return raw as T;
  try { return JSON.parse(raw as string) as T; } catch { return fallback; }
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition"
      >
        <span className="text-lg font-bold text-[#0A1628] font-heading">{title}</span>
        {open ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {open && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}

// ─── Save button ──────────────────────────────────────────────────────────────

function SaveBtn({
  onSave,
  saving,
  status,
  msg,
}: {
  onSave: () => void;
  saving: boolean;
  status: 'idle' | 'success' | 'error';
  msg: string;
}) {
  return (
    <div className="mt-5 flex flex-col gap-2">
      {status === 'success' && (
        <p className="text-green-700 text-sm font-semibold bg-green-50 border border-green-200 rounded-xl px-4 py-2">
          {msg}
        </p>
      )}
      {status === 'error' && (
        <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded-xl px-4 py-2">
          Error: {msg}
        </p>
      )}
      <button
        onClick={onSave}
        disabled={saving}
        className={`flex items-center gap-2 self-start bg-[#0A1628] text-white font-bold px-5 py-2.5 rounded-xl transition disabled:opacity-50 text-sm ${
          status === 'success' ? 'bg-green-500 hover:bg-green-600' : 'hover:bg-[#C9A84C] hover:text-[#0A1628]'
        }`}
      >
        <Save className="w-4 h-4" />
        {saving ? 'Saving…' : status === 'success' ? 'Saved!' : 'Save Section'}
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminAboutPage() {
  // Open/close accordion state (all start open)
  const [open, setOpen] = useState({
    identity: true,
    mission: true,
    leadership: true,
    history: true,
    stats: true,
  });

  const toggle = (key: keyof typeof open) =>
    setOpen(prev => ({ ...prev, [key]: !prev[key] }));

  // ── Data state ──
  const [identity, setIdentity] = useState<IdentityData>(defaultIdentity);
  const [mission, setMission] = useState<MissionData>(defaultMission);
  const [leadership, setLeadership] = useState<LeaderCard[]>(defaultLeadership);
  const [history, setHistory] = useState<HistoryData>(defaultHistory);
  const [stats, setStats] = useState<StatItem[]>(defaultStats);

  // ── Save states per section ──
  type SaveState = { saving: boolean; status: 'idle' | 'success' | 'error'; msg: string };
  const initSave: SaveState = { saving: false, status: 'idle', msg: '' };
  const [identitySave, setIdentitySave] = useState<SaveState>(initSave);
  const [missionSave, setMissionSave] = useState<SaveState>(initSave);
  const [leadershipSave, setLeadershipSave] = useState<SaveState>(initSave);
  const [historySave, setHistorySave] = useState<SaveState>(initSave);
  const [statsSave, setStatsSave] = useState<SaveState>(initSave);

  // ── Values input for mission tags ──
  const [valueInput, setValueInput] = useState('');

  // ── Load on mount ──
  useEffect(() => {
    const load = async () => {
      try {
        const { createClientClient } = await import('@/lib/supabase/client');
        const supabase = createClientClient();
        const { data } = await supabase
          .from('cms_page_content')
          .select('section, data')
          .eq('page', 'about');
        if (!data) return;
        data.forEach((row: { section: string; data: unknown }) => {
          if (row.section === 'identity')
            setIdentity(safeJson(row.data, defaultIdentity));
          if (row.section === 'mission')
            setMission(safeJson(row.data, defaultMission));
          if (row.section === 'leadership') {
            const arr = safeJson<LeaderCard[]>(row.data, defaultLeadership);
            setLeadership(arr.length === 3 ? arr : defaultLeadership);
          }
          if (row.section === 'history')
            setHistory(safeJson(row.data, defaultHistory));
          if (row.section === 'stats') {
            const arr = safeJson<StatItem[]>(row.data, defaultStats);
            setStats(arr.length === 6 ? arr : defaultStats);
          }
        });
      } catch { /* silently fail – fall back to defaults */ }
    };
    load();
  }, []);

  // ── Generic save helper ──
  const saveSection = async (
    section: string,
    dataPayload: unknown,
    setSave: React.Dispatch<React.SetStateAction<SaveState>>,
  ) => {
    setSave({ saving: true, status: 'idle', msg: '' });
    try {
      const { createClientClient } = await import('@/lib/supabase/client');
      const supabase = createClientClient();
      const { error } = await supabase
        .from('cms_page_content')
        .upsert(
          { page: 'about', section, data: dataPayload, updated_at: new Date().toISOString() },
          { onConflict: 'page,section' },
        );
      if (error) {
        setSave({ saving: false, status: 'error', msg: error.message });
      } else {
        setSave({ saving: false, status: 'success', msg: 'Section saved successfully!' });
        setTimeout(() => setSave(s => ({ ...s, status: 'idle' })), 2500);
      }
    } catch (e: unknown) {
      setSave({ saving: false, status: 'error', msg: e instanceof Error ? e.message : 'Save failed' });
    }
  };

  // ── Leadership card updater ──
  const updateLeader = (idx: number, field: keyof LeaderCard, value: string) => {
    setLeadership(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const inputCls = 'border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full';
  const labelCls = 'block text-xs font-bold text-gray-500 mb-1 uppercase';

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0A1628] font-heading">About Page CMS</h1>
        <p className="text-gray-500 text-sm mt-1">
          Edit all content for the About page. Each section saves independently.
        </p>
      </div>

      <div className="space-y-5">

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 1: University Identity
        ══════════════════════════════════════════════════════════════════ */}
        <Section title="1. University Identity" open={open.identity} onToggle={() => toggle('identity')}>
          <div className="grid sm:grid-cols-2 gap-4 mt-2">
            <div>
              <label className={labelCls}>University Name (English)</label>
              <input
                value={identity.university_name_en}
                onChange={e => setIdentity(p => ({ ...p, university_name_en: e.target.value }))}
                className={inputCls}
                placeholder="ZTF University Institute (ZTF-UI)"
              />
            </div>
            <div>
              <label className={labelCls}>Nom de l&apos;université (Français)</label>
              <input
                value={identity.university_name_fr}
                onChange={e => setIdentity(p => ({ ...p, university_name_fr: e.target.value }))}
                className={inputCls}
                placeholder="Institut Universitaire ZTF (IU-ZTF)"
              />
            </div>
            <div>
              <label className={labelCls}>Founded Year</label>
              <input
                value={identity.founded_year}
                onChange={e => setIdentity(p => ({ ...p, founded_year: e.target.value }))}
                className={inputCls}
                placeholder="2023"
              />
            </div>
            <div>
              <label className={labelCls}>Location</label>
              <input
                value={identity.location}
                onChange={e => setIdentity(p => ({ ...p, location: e.target.value }))}
                className={inputCls}
                placeholder="Bertoua, East Region, Cameroon"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Accreditation</label>
              <input
                value={identity.accreditation}
                onChange={e => setIdentity(p => ({ ...p, accreditation: e.target.value }))}
                className={inputCls}
                placeholder="Accreditation body / number..."
              />
            </div>
          </div>
          <SaveBtn
            onSave={() => saveSection('identity', identity, setIdentitySave)}
            saving={identitySave.saving}
            status={identitySave.status}
            msg={identitySave.msg}
          />
        </Section>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 2: Mission, Vision & Values
        ══════════════════════════════════════════════════════════════════ */}
        <Section title="2. Mission, Vision & Values" open={open.mission} onToggle={() => toggle('mission')}>
          <div className="grid sm:grid-cols-2 gap-4 mt-2">
            <div>
              <label className={labelCls}>Mission (English)</label>
              <textarea
                value={mission.mission_en}
                onChange={e => setMission(p => ({ ...p, mission_en: e.target.value }))}
                rows={4}
                className={`${inputCls} resize-none`}
                placeholder="Our mission is..."
              />
            </div>
            <div>
              <label className={labelCls}>Mission (Français)</label>
              <textarea
                value={mission.mission_fr}
                onChange={e => setMission(p => ({ ...p, mission_fr: e.target.value }))}
                rows={4}
                className={`${inputCls} resize-none`}
                placeholder="Notre mission est..."
              />
            </div>
            <div>
              <label className={labelCls}>Vision (English)</label>
              <textarea
                value={mission.vision_en}
                onChange={e => setMission(p => ({ ...p, vision_en: e.target.value }))}
                rows={4}
                className={`${inputCls} resize-none`}
                placeholder="Our vision is..."
              />
            </div>
            <div>
              <label className={labelCls}>Vision (Français)</label>
              <textarea
                value={mission.vision_fr}
                onChange={e => setMission(p => ({ ...p, vision_fr: e.target.value }))}
                rows={4}
                className={`${inputCls} resize-none`}
                placeholder="Notre vision est..."
              />
            </div>
          </div>

          {/* Values tags */}
          <div className="mt-4">
            <label className={labelCls}>Core Values</label>
            <div className="flex flex-wrap gap-2 mb-2 min-h-[36px]">
              {mission.values.map((v, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 bg-[#C9A84C]/10 text-[#0A1628] text-sm font-semibold px-3 py-1 rounded-full border border-[#C9A84C]/30"
                >
                  {v}
                  <button
                    onClick={() =>
                      setMission(p => ({ ...p, values: p.values.filter((_, j) => j !== i) }))
                    }
                    className="text-gray-400 hover:text-red-500 transition ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {mission.values.length === 0 && (
                <span className="text-gray-400 text-sm italic">No values added yet.</span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                value={valueInput}
                onChange={e => setValueInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && valueInput.trim()) {
                    e.preventDefault();
                    setMission(p => ({ ...p, values: [...p.values, valueInput.trim()] }));
                    setValueInput('');
                  }
                }}
                className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-[#C9A84C] outline-none flex-1"
                placeholder="Type a value and press Add..."
              />
              <button
                onClick={() => {
                  if (!valueInput.trim()) return;
                  setMission(p => ({ ...p, values: [...p.values, valueInput.trim()] }));
                  setValueInput('');
                }}
                className="flex items-center gap-1 bg-[#0A1628] text-white font-bold px-4 py-2 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition text-sm"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>

          <SaveBtn
            onSave={() => saveSection('mission', mission, setMissionSave)}
            saving={missionSave.saving}
            status={missionSave.status}
            msg={missionSave.msg}
          />
        </Section>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 3: Leadership
        ══════════════════════════════════════════════════════════════════ */}
        <Section title="3. Leadership" open={open.leadership} onToggle={() => toggle('leadership')}>
          <div className="grid sm:grid-cols-3 gap-5 mt-2">
            {leadership.map((leader, idx) => (
              <div key={idx} className="border border-gray-100 rounded-2xl p-4 space-y-3 bg-gray-50/50">
                {/* Photo preview */}
                <div className="flex items-center gap-3 mb-1">
                  <div
                    className="w-14 h-14 rounded-xl bg-cover bg-center bg-gray-200 border border-gray-200 flex-shrink-0"
                    style={{ backgroundImage: leader.photo_url ? `url(${leader.photo_url})` : undefined }}
                  />
                  <div>
                    <p className="font-bold text-[#0A1628] text-sm leading-tight">{leader.name}</p>
                    <p className="text-[#C9A84C] text-xs font-semibold">{leader.title_en}</p>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Full Name</label>
                  <input
                    value={leader.name}
                    onChange={e => updateLeader(idx, 'name', e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Title (English)</label>
                  <input
                    value={leader.title_en}
                    onChange={e => updateLeader(idx, 'title_en', e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Titre (Français)</label>
                  <input
                    value={leader.title_fr}
                    onChange={e => updateLeader(idx, 'title_fr', e.target.value)}
                    className={inputCls}
                  />
                </div>
                {idx > 0 && (
                  <div>
                    <label className={labelCls}>Department</label>
                    <input
                      value={leader.department}
                      onChange={e => updateLeader(idx, 'department', e.target.value)}
                      className={inputCls}
                      placeholder="e.g. Faculty of Science"
                    />
                  </div>
                )}
                {idx === 0 ? (
                  <>
                    <div>
                      <label className={labelCls}>Description (English)</label>
                      <textarea
                        value={leader.description_en}
                        onChange={e => updateLeader(idx, 'description_en', e.target.value)}
                        rows={3}
                        className={`${inputCls} resize-none`}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Description (Français)</label>
                      <textarea
                        value={leader.description_fr}
                        onChange={e => updateLeader(idx, 'description_fr', e.target.value)}
                        rows={3}
                        className={`${inputCls} resize-none`}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className={labelCls}>Bio (English)</label>
                      <textarea
                        value={leader.bio_en}
                        onChange={e => updateLeader(idx, 'bio_en', e.target.value)}
                        rows={3}
                        className={`${inputCls} resize-none`}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Bio (Français)</label>
                      <textarea
                        value={leader.bio_fr}
                        onChange={e => updateLeader(idx, 'bio_fr', e.target.value)}
                        rows={3}
                        className={`${inputCls} resize-none`}
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className={labelCls}>Photo URL</label>
                  <input
                    value={leader.photo_url}
                    onChange={e => updateLeader(idx, 'photo_url', e.target.value)}
                    className={inputCls}
                    placeholder="/images/..."
                  />
                </div>
              </div>
            ))}
          </div>

          <SaveBtn
            onSave={() => saveSection('leadership', leadership, setLeadershipSave)}
            saving={leadershipSave.saving}
            status={leadershipSave.status}
            msg={leadershipSave.msg}
          />
        </Section>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 4: History
        ══════════════════════════════════════════════════════════════════ */}
        <Section title="4. History" open={open.history} onToggle={() => toggle('history')}>
          <div className="grid sm:grid-cols-2 gap-4 mt-2">
            <div>
              <label className={labelCls}>History (English)</label>
              <textarea
                value={history.history_en}
                onChange={e => setHistory(p => ({ ...p, history_en: e.target.value }))}
                rows={12}
                className={`${inputCls} resize-y`}
                placeholder="Write the university history in English..."
              />
            </div>
            <div>
              <label className={labelCls}>Histoire (Français)</label>
              <textarea
                value={history.history_fr}
                onChange={e => setHistory(p => ({ ...p, history_fr: e.target.value }))}
                rows={12}
                className={`${inputCls} resize-y`}
                placeholder="Rédigez l'histoire de l'université en français..."
              />
            </div>
          </div>
          <SaveBtn
            onSave={() => saveSection('history', history, setHistorySave)}
            saving={historySave.saving}
            status={historySave.status}
            msg={historySave.msg}
          />
        </Section>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 5: Stats
        ══════════════════════════════════════════════════════════════════ */}
        <Section title="5. Statistics" open={open.stats} onToggle={() => toggle('stats')}>
          <div className="mt-2 space-y-3">
            {stats.map((stat, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-3 items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                <div className="col-span-1">
                  <label className={labelCls}>Icon</label>
                  <input
                    value={stat.icon}
                    onChange={e => setStats(prev => {
                      const next = [...prev];
                      next[idx] = { ...next[idx], icon: e.target.value };
                      return next;
                    })}
                    className="border border-gray-200 rounded-xl px-2 py-2 text-center text-base focus:border-[#C9A84C] outline-none w-full"
                    maxLength={2}
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Value</label>
                  <input
                    value={stat.value}
                    onChange={e => setStats(prev => {
                      const next = [...prev];
                      next[idx] = { ...next[idx], value: e.target.value };
                      return next;
                    })}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-[#C9A84C] focus:border-[#C9A84C] outline-none w-full"
                    placeholder="500+"
                  />
                </div>
                <div className="col-span-4">
                  <label className={labelCls}>Label (EN)</label>
                  <input
                    value={stat.label_en}
                    onChange={e => setStats(prev => {
                      const next = [...prev];
                      next[idx] = { ...next[idx], label_en: e.target.value };
                      return next;
                    })}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#C9A84C] outline-none w-full"
                    placeholder="Label in English"
                  />
                </div>
                <div className="col-span-5">
                  <label className={labelCls}>Label (FR)</label>
                  <input
                    value={stat.label_fr}
                    onChange={e => setStats(prev => {
                      const next = [...prev];
                      next[idx] = { ...next[idx], label_fr: e.target.value };
                      return next;
                    })}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#C9A84C] outline-none w-full"
                    placeholder="Libellé en français"
                  />
                </div>
              </div>
            ))}
          </div>
          <SaveBtn
            onSave={() => saveSection('stats', stats, setStatsSave)}
            saving={statsSave.saving}
            status={statsSave.status}
            msg={statsSave.msg}
          />
        </Section>

      </div>
    </div>
  );
}
