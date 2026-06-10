'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClientClient } from '@/lib/supabase/client';
import {
  Globe, Phone, Share2, GraduationCap, Search,
  Save, CheckCircle, AlertCircle, Loader2, Plus, Trash2,
} from 'lucide-react';

function FbIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>; }
function IgIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>; }
function YtIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></svg>; }
function TwIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>; }
function LiIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>; }

// ─── Types ────────────────────────────────────────────────────────────────────

type FeedbackState = 'idle' | 'saving' | 'saved' | 'error';
type TabKey = 'general' | 'contact' | 'social' | 'academic' | 'seo';

interface SettingRow { key: string; value: string; }

// ─── Shared Components ────────────────────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!on)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition ${on ? 'bg-[#C9A84C]' : 'bg-gray-200'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${on ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function Feedback({ state, error }: { state: FeedbackState; error?: string }) {
  if (state === 'saving') return <span className="flex items-center gap-1.5 text-gray-500 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Saving...</span>;
  if (state === 'saved') return <span className="flex items-center gap-1.5 text-green-600 text-sm font-semibold"><CheckCircle className="w-4 h-4" /> Saved!</span>;
  if (state === 'error') return <span className="flex items-center gap-1.5 text-red-600 text-sm"><AlertCircle className="w-4 h-4" /> {error || 'Failed to save'}</span>;
  return null;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full';
const textareaCls = 'border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full resize-none';

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'general', label: 'General', icon: <Globe className="w-4 h-4" /> },
  { key: 'contact', label: 'Contact', icon: <Phone className="w-4 h-4" /> },
  { key: 'social', label: 'Social Media', icon: <Share2 className="w-4 h-4" /> },
  { key: 'academic', label: 'Academic', icon: <GraduationCap className="w-4 h-4" /> },
  { key: 'seo', label: 'SEO', icon: <Search className="w-4 h-4" /> },
];

const ALL_KEYS = [
  'site_name_en', 'site_name_fr', 'site_tagline_en', 'site_tagline_fr',
  'site_description_en', 'site_description_fr', 'logo_url', 'favicon_url', 'copyright_text',
  'phone_numbers', 'email_main', 'email_secondary', 'address_en', 'address_fr',
  'office_hours_en', 'office_hours_fr', 'whatsapp_number', 'maps_embed_url',
  'facebook_url', 'instagram_url', 'youtube_url', 'tiktok_url', 'twitter_url', 'linkedin_url',
  'academic_year', 'admissions_open', 'registration_fee', 'application_deadline', 'preregistration_fee',
  'meta_title_en', 'meta_title_fr', 'meta_description_en', 'meta_description_fr', 'og_image_url',
];

export default function AdminSettingsPage() {
  const supabase = createClientClient();
  const [activeTab, setActiveTab] = useState<TabKey>('general');
  const [initialLoading, setInitialLoading] = useState(true);
  const [feedback, setFeedback] = useState<Record<TabKey, FeedbackState>>({
    general: 'idle', contact: 'idle', social: 'idle', academic: 'idle', seo: 'idle',
  });
  const [errors, setErrors] = useState<Record<TabKey, string>>({
    general: '', contact: '', social: '', academic: '', seo: '',
  });

  // General
  const [siteNameEn, setSiteNameEn] = useState('');
  const [siteNameFr, setSiteNameFr] = useState('');
  const [siteTaglineEn, setSiteTaglineEn] = useState('');
  const [siteTaglineFr, setSiteTaglineFr] = useState('');
  const [siteDescEn, setSiteDescEn] = useState('');
  const [siteDescFr, setSiteDescFr] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [copyrightText, setCopyrightText] = useState('');

  // Contact
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>(['']);
  const [emailMain, setEmailMain] = useState('');
  const [emailSecondary, setEmailSecondary] = useState('');
  const [addressEn, setAddressEn] = useState('');
  const [addressFr, setAddressFr] = useState('');
  const [officeHoursEn, setOfficeHoursEn] = useState('');
  const [officeHoursFr, setOfficeHoursFr] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [mapsEmbedUrl, setMapsEmbedUrl] = useState('');

  // Social
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  // Academic
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [admissionsOpen, setAdmissionsOpen] = useState(false);
  const [registrationFee, setRegistrationFee] = useState('35000');
  const [applicationDeadline, setApplicationDeadline] = useState('');
  const [preregistrationFee, setPreregistrationFee] = useState('35000');

  // SEO
  const [metaTitleEn, setMetaTitleEn] = useState('');
  const [metaTitleFr, setMetaTitleFr] = useState('');
  const [metaDescEn, setMetaDescEn] = useState('');
  const [metaDescFr, setMetaDescFr] = useState('');
  const [ogImageUrl, setOgImageUrl] = useState('');

  // ─── Load ────────────────────────────────────────────────────────────────

  const loadSettings = useCallback(async () => {
    setInitialLoading(true);
    try {
      const { data } = await supabase.from('cms_site_settings').select('key, value').in('key', ALL_KEYS);
      const m: Record<string, string> = {};
      (data || []).forEach((r: SettingRow) => { m[r.key] = r.value; });

      if (m.site_name_en) setSiteNameEn(m.site_name_en);
      if (m.site_name_fr) setSiteNameFr(m.site_name_fr);
      if (m.site_tagline_en) setSiteTaglineEn(m.site_tagline_en);
      if (m.site_tagline_fr) setSiteTaglineFr(m.site_tagline_fr);
      if (m.site_description_en) setSiteDescEn(m.site_description_en);
      if (m.site_description_fr) setSiteDescFr(m.site_description_fr);
      if (m.logo_url) setLogoUrl(m.logo_url);
      if (m.favicon_url) setFaviconUrl(m.favicon_url);
      if (m.copyright_text) setCopyrightText(m.copyright_text);

      if (m.phone_numbers) { try { setPhoneNumbers(JSON.parse(m.phone_numbers)); } catch { setPhoneNumbers([m.phone_numbers]); } }
      if (m.email_main) setEmailMain(m.email_main);
      if (m.email_secondary) setEmailSecondary(m.email_secondary);
      if (m.address_en) setAddressEn(m.address_en);
      if (m.address_fr) setAddressFr(m.address_fr);
      if (m.office_hours_en) setOfficeHoursEn(m.office_hours_en);
      if (m.office_hours_fr) setOfficeHoursFr(m.office_hours_fr);
      if (m.whatsapp_number) setWhatsappNumber(m.whatsapp_number);
      if (m.maps_embed_url) setMapsEmbedUrl(m.maps_embed_url);

      if (m.facebook_url) setFacebookUrl(m.facebook_url);
      if (m.instagram_url) setInstagramUrl(m.instagram_url);
      if (m.youtube_url) setYoutubeUrl(m.youtube_url);
      if (m.tiktok_url) setTiktokUrl(m.tiktok_url);
      if (m.twitter_url) setTwitterUrl(m.twitter_url);
      if (m.linkedin_url) setLinkedinUrl(m.linkedin_url);

      if (m.academic_year) setAcademicYear(m.academic_year);
      if (m.admissions_open !== undefined) setAdmissionsOpen(m.admissions_open === 'true');
      if (m.registration_fee) setRegistrationFee(m.registration_fee);
      if (m.application_deadline) setApplicationDeadline(m.application_deadline);
      if (m.preregistration_fee) setPreregistrationFee(m.preregistration_fee);

      if (m.meta_title_en) setMetaTitleEn(m.meta_title_en);
      if (m.meta_title_fr) setMetaTitleFr(m.meta_title_fr);
      if (m.meta_description_en) setMetaDescEn(m.meta_description_en);
      if (m.meta_description_fr) setMetaDescFr(m.meta_description_fr);
      if (m.og_image_url) setOgImageUrl(m.og_image_url);
    } catch { /* non-fatal */ }
    finally { setInitialLoading(false); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadSettings(); }, [loadSettings]);

  // ─── Upsert ───────────────────────────────────────────────────────────────

  const upsert = async (entries: SettingRow[]) => {
    const { error } = await supabase
      .from('cms_site_settings')
      .upsert(entries, { onConflict: 'key' });
    if (error) throw new Error(error.message);
  };

  const handleSave = async (tab: TabKey, entries: SettingRow[]) => {
    setFeedback(f => ({ ...f, [tab]: 'saving' }));
    setErrors(e => ({ ...e, [tab]: '' }));
    try {
      await upsert(entries);
      setFeedback(f => ({ ...f, [tab]: 'saved' }));
      setTimeout(() => setFeedback(f => ({ ...f, [tab]: 'idle' })), 2500);
    } catch (e) {
      setErrors(er => ({ ...er, [tab]: e instanceof Error ? e.message : 'Unknown error' }));
      setFeedback(f => ({ ...f, [tab]: 'error' }));
    }
  };

  const saveGeneral = () => handleSave('general', [
    { key: 'site_name_en', value: siteNameEn },
    { key: 'site_name_fr', value: siteNameFr },
    { key: 'site_tagline_en', value: siteTaglineEn },
    { key: 'site_tagline_fr', value: siteTaglineFr },
    { key: 'site_description_en', value: siteDescEn },
    { key: 'site_description_fr', value: siteDescFr },
    { key: 'logo_url', value: logoUrl },
    { key: 'favicon_url', value: faviconUrl },
    { key: 'copyright_text', value: copyrightText },
  ]);

  const saveContact = () => handleSave('contact', [
    { key: 'phone_numbers', value: JSON.stringify(phoneNumbers.filter(Boolean)) },
    { key: 'email_main', value: emailMain },
    { key: 'email_secondary', value: emailSecondary },
    { key: 'address_en', value: addressEn },
    { key: 'address_fr', value: addressFr },
    { key: 'office_hours_en', value: officeHoursEn },
    { key: 'office_hours_fr', value: officeHoursFr },
    { key: 'whatsapp_number', value: whatsappNumber },
    { key: 'maps_embed_url', value: mapsEmbedUrl },
  ]);

  const saveSocial = () => handleSave('social', [
    { key: 'facebook_url', value: facebookUrl },
    { key: 'instagram_url', value: instagramUrl },
    { key: 'youtube_url', value: youtubeUrl },
    { key: 'tiktok_url', value: tiktokUrl },
    { key: 'twitter_url', value: twitterUrl },
    { key: 'linkedin_url', value: linkedinUrl },
  ]);

  const saveAcademic = () => handleSave('academic', [
    { key: 'academic_year', value: academicYear },
    { key: 'admissions_open', value: String(admissionsOpen) },
    { key: 'registration_fee', value: registrationFee },
    { key: 'application_deadline', value: applicationDeadline },
    { key: 'preregistration_fee', value: preregistrationFee },
  ]);

  const saveSEO = () => handleSave('seo', [
    { key: 'meta_title_en', value: metaTitleEn },
    { key: 'meta_title_fr', value: metaTitleFr },
    { key: 'meta_description_en', value: metaDescEn },
    { key: 'meta_description_fr', value: metaDescFr },
    { key: 'og_image_url', value: ogImageUrl },
  ]);

  // ─── Render ───────────────────────────────────────────────────────────────

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#C9A84C]" />
        <span className="ml-3 text-gray-500">Loading settings...</span>
      </div>
    );
  }

  const SaveBar = ({ tab, onSave }: { tab: TabKey; onSave: () => void }) => (
    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
      <Feedback state={feedback[tab]} error={errors[tab]} />
      <button onClick={onSave} disabled={feedback[tab] === 'saving'}
        className="flex items-center gap-2 bg-[#0A1628] text-white font-bold px-4 py-2 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition disabled:opacity-50">
        <Save className="w-4 h-4" /> Save Changes
      </button>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0A1628] font-heading">Site Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Configure site-wide settings, contact info, social links, and more.</p>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
              activeTab === t.key ? 'bg-[#0A1628] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── General ─────────────────────────────────────────────────────────── */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="text-lg font-bold text-[#0A1628] font-heading mb-4">General Settings</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Site Name (English)">
              <input value={siteNameEn} onChange={e => setSiteNameEn(e.target.value)}
                placeholder="ZTF University" className={inputCls} />
            </Field>
            <Field label="Site Name (Français)">
              <input value={siteNameFr} onChange={e => setSiteNameFr(e.target.value)}
                placeholder="Université ZTF" className={inputCls} />
            </Field>
            <Field label="Tagline (English)">
              <input value={siteTaglineEn} onChange={e => setSiteTaglineEn(e.target.value)}
                placeholder="Empowering Minds, Shaping Futures" className={inputCls} />
            </Field>
            <Field label="Tagline (Français)">
              <input value={siteTaglineFr} onChange={e => setSiteTaglineFr(e.target.value)}
                placeholder="Former les esprits, façonner l'avenir" className={inputCls} />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Description (English)">
              <textarea value={siteDescEn} onChange={e => setSiteDescEn(e.target.value)}
                rows={3} placeholder="Brief description of the university..."
                className={textareaCls} />
            </Field>
            <Field label="Description (Français)">
              <textarea value={siteDescFr} onChange={e => setSiteDescFr(e.target.value)}
                rows={3} placeholder="Brève description de l'université..."
                className={textareaCls} />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Logo URL">
              <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)}
                placeholder="/images/logo.png" className={inputCls} />
            </Field>
            <Field label="Favicon URL">
              <input value={faviconUrl} onChange={e => setFaviconUrl(e.target.value)}
                placeholder="/favicon.ico" className={inputCls} />
            </Field>
          </div>

          <Field label="Copyright Text">
            <input value={copyrightText} onChange={e => setCopyrightText(e.target.value)}
              placeholder="© 2026 ZTF University. All rights reserved." className={inputCls} />
          </Field>

          <SaveBar tab="general" onSave={saveGeneral} />
        </div>
      )}

      {/* ── Contact ─────────────────────────────────────────────────────────── */}
      {activeTab === 'contact' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="text-lg font-bold text-[#0A1628] font-heading mb-4">Contact Information</h2>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              Phone Numbers <span className="text-gray-400 normal-case font-normal">(max 7)</span>
            </label>
            <div className="space-y-2">
              {phoneNumbers.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <input value={p} onChange={e => setPhoneNumbers(prev => prev.map((v, idx) => idx === i ? e.target.value : v))}
                    placeholder={`+237 6XX XXX XXX`}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none flex-1" />
                  {phoneNumbers.length > 1 && (
                    <button type="button" onClick={() => setPhoneNumbers(prev => prev.filter((_, idx) => idx !== i))}
                      className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {phoneNumbers.length < 7 && (
              <button type="button" onClick={() => setPhoneNumbers(prev => [...prev, ''])}
                className="flex items-center gap-2 text-sm text-[#0A1628] font-semibold border border-dashed border-gray-300 px-4 py-2 rounded-xl hover:border-[#C9A84C] hover:text-[#C9A84C] transition mt-2">
                <Plus className="w-4 h-4" /> Add Phone Number
              </button>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Main Email">
              <input value={emailMain} onChange={e => setEmailMain(e.target.value)}
                placeholder="info@ztfuniversity.com" className={inputCls} type="email" />
            </Field>
            <Field label="Secondary Email">
              <input value={emailSecondary} onChange={e => setEmailSecondary(e.target.value)}
                placeholder="admissions@ztfuniversity.com" className={inputCls} type="email" />
            </Field>
            <Field label="WhatsApp Number">
              <input value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)}
                placeholder="+237 6XX XXX XXX" className={inputCls} />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Address (English)">
              <textarea value={addressEn} onChange={e => setAddressEn(e.target.value)}
                rows={3} placeholder="Street address in English..." className={textareaCls} />
            </Field>
            <Field label="Address (Français)">
              <textarea value={addressFr} onChange={e => setAddressFr(e.target.value)}
                rows={3} placeholder="Adresse en français..." className={textareaCls} />
            </Field>
            <Field label="Office Hours (English)">
              <input value={officeHoursEn} onChange={e => setOfficeHoursEn(e.target.value)}
                placeholder="Mon–Fri: 8am–5pm" className={inputCls} />
            </Field>
            <Field label="Office Hours (Français)">
              <input value={officeHoursFr} onChange={e => setOfficeHoursFr(e.target.value)}
                placeholder="Lun–Ven: 8h–17h" className={inputCls} />
            </Field>
          </div>

          <Field label="Google Maps Embed URL">
            <textarea value={mapsEmbedUrl} onChange={e => setMapsEmbedUrl(e.target.value)}
              rows={3} placeholder="https://www.google.com/maps/embed?pb=..." className={textareaCls} />
          </Field>

          <SaveBar tab="contact" onSave={saveContact} />
        </div>
      )}

      {/* ── Social Media ────────────────────────────────────────────────────── */}
      {activeTab === 'social' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="text-lg font-bold text-[#0A1628] font-heading mb-4">Social Media Links</h2>

          <div className="space-y-4">
            {[
              { label: 'Facebook', icon: <FbIcon className="w-5 h-5 text-blue-600" />, value: facebookUrl, setter: setFacebookUrl, placeholder: 'https://facebook.com/ztfuniversity' },
              { label: 'Instagram', icon: <IgIcon className="w-5 h-5 text-pink-500" />, value: instagramUrl, setter: setInstagramUrl, placeholder: 'https://instagram.com/ztfuniversity' },
              { label: 'YouTube', icon: <YtIcon className="w-5 h-5 text-red-600" />, value: youtubeUrl, setter: setYoutubeUrl, placeholder: 'https://youtube.com/@ztfuniversity' },
              { label: 'TikTok', icon: <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-black">T</span>, value: tiktokUrl, setter: setTiktokUrl, placeholder: 'https://tiktok.com/@ztfuniversity' },
              { label: 'X / Twitter', icon: <TwIcon className="w-5 h-5 text-sky-500" />, value: twitterUrl, setter: setTwitterUrl, placeholder: 'https://x.com/ztfuniversity' },
              { label: 'LinkedIn', icon: <LiIcon className="w-5 h-5 text-blue-700" />, value: linkedinUrl, setter: setLinkedinUrl, placeholder: 'https://linkedin.com/school/ztfuniversity' },
            ].map(({ label, icon, value, setter, placeholder }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                  {icon}
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>
                  <input value={value} onChange={e => setter(e.target.value)} placeholder={placeholder}
                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#C9A84C] outline-none w-full" />
                </div>
              </div>
            ))}
          </div>

          <SaveBar tab="social" onSave={saveSocial} />
        </div>
      )}

      {/* ── Academic ────────────────────────────────────────────────────────── */}
      {activeTab === 'academic' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="text-lg font-bold text-[#0A1628] font-heading mb-4">Academic Settings</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Academic Year">
              <input value={academicYear} onChange={e => setAcademicYear(e.target.value)}
                placeholder="2026-2027" className={inputCls} />
            </Field>
            <Field label="Application Deadline">
              <input type="date" value={applicationDeadline} onChange={e => setApplicationDeadline(e.target.value)}
                className={inputCls} />
            </Field>
            <Field label="Registration Fee (XAF)">
              <input type="number" value={registrationFee} onChange={e => setRegistrationFee(e.target.value)}
                placeholder="35000" min={0} className={inputCls} />
            </Field>
            <Field label="Pre-Registration Fee (XAF)">
              <input type="number" value={preregistrationFee} onChange={e => setPreregistrationFee(e.target.value)}
                placeholder="35000" min={0} className={inputCls} />
            </Field>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-gray-700">Admissions Open</p>
              <p className="text-xs text-gray-400 mt-0.5">When enabled, the admissions portal is open for applications</p>
            </div>
            <Toggle on={admissionsOpen} onChange={setAdmissionsOpen} />
          </div>

          <SaveBar tab="academic" onSave={saveAcademic} />
        </div>
      )}

      {/* ── SEO ─────────────────────────────────────────────────────────────── */}
      {activeTab === 'seo' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="text-lg font-bold text-[#0A1628] font-heading mb-4">SEO & Meta Tags</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Meta Title (English)">
              <input value={metaTitleEn} onChange={e => setMetaTitleEn(e.target.value)}
                placeholder="ZTF University – Excellence in Education" className={inputCls} />
              <p className="text-xs text-gray-400 mt-1">{metaTitleEn.length}/60 chars recommended</p>
            </Field>
            <Field label="Meta Title (Français)">
              <input value={metaTitleFr} onChange={e => setMetaTitleFr(e.target.value)}
                placeholder="Université ZTF – Excellence en Éducation" className={inputCls} />
              <p className="text-xs text-gray-400 mt-1">{metaTitleFr.length}/60 chars recommended</p>
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Meta Description (English)">
              <textarea value={metaDescEn} onChange={e => setMetaDescEn(e.target.value)}
                rows={3} placeholder="A brief description for search engines..."
                className={textareaCls} />
              <p className="text-xs text-gray-400 mt-1">{metaDescEn.length}/160 chars recommended</p>
            </Field>
            <Field label="Meta Description (Français)">
              <textarea value={metaDescFr} onChange={e => setMetaDescFr(e.target.value)}
                rows={3} placeholder="Une brève description pour les moteurs de recherche..."
                className={textareaCls} />
              <p className="text-xs text-gray-400 mt-1">{metaDescFr.length}/160 chars recommended</p>
            </Field>
          </div>

          <Field label="Open Graph Image URL">
            <input value={ogImageUrl} onChange={e => setOgImageUrl(e.target.value)}
              placeholder="https://... or /images/og-image.jpg (1200×630 recommended)"
              className={inputCls} />
          </Field>
          {ogImageUrl && (
            <div className="rounded-xl overflow-hidden border border-gray-100 max-w-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ogImageUrl} alt="OG preview" className="w-full object-cover"
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              <p className="text-xs text-gray-400 px-3 py-2">OG image preview</p>
            </div>
          )}

          <SaveBar tab="seo" onSave={saveSEO} />
        </div>
      )}
    </div>
  );
}
