'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClientClient } from '@/lib/supabase/client';
import {
  Plus, X, Trash2, Save, Loader2, CheckCircle, AlertCircle, ExternalLink,
} from 'lucide-react';

function YtIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></svg>; }
function FbIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>; }
function IgIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>; }
function TwIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>; }
function LiIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>; }

// ─── Types ────────────────────────────────────────────────────────────────────

interface VideoItem {
  id: string;
  title_en: string;
  title_fr: string;
  description: string;
  video_id: string;
  url: string;
  added_at: string;
}

interface SocialLink { key: string; label: string; value: string; enabled: boolean; }
interface DocItem { name: string; url: string; size: string; type: string; uploaded_at: string; }

type TabKey = 'youtube' | 'social' | 'documents';

const inputCls = 'border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full';
const textareaCls = inputCls + ' resize-none';

const SOCIAL_PLATFORMS = [
  { key: 'facebook_url', label: 'Facebook', color: 'text-blue-600' },
  { key: 'instagram_url', label: 'Instagram', color: 'text-pink-500' },
  { key: 'youtube_url', label: 'YouTube', color: 'text-red-600' },
  { key: 'tiktok_url', label: 'TikTok', color: 'text-black' },
  { key: 'twitter_url', label: 'Twitter / X', color: 'text-sky-500' },
  { key: 'linkedin_url', label: 'LinkedIn', color: 'text-blue-700' },
  { key: 'whatsapp_number', label: 'WhatsApp', color: 'text-green-600' },
];

function SocialIcon({ label, className }: { label: string; className?: string }) {
  if (label === 'Facebook') return <FbIcon className={className} />;
  if (label === 'Instagram') return <IgIcon className={className} />;
  if (label === 'YouTube') return <YtIcon className={className} />;
  if (label === 'Twitter / X') return <TwIcon className={className} />;
  if (label === 'LinkedIn') return <LiIcon className={className} />;
  return <ExternalLink className={className} />;
}

function extractVideoId(url: string): string {
  const m1 = url.match(/[?&]v=([^&]+)/);
  if (m1) return m1[1];
  const m2 = url.match(/youtu\.be\/([^?]+)/);
  if (m2) return m2[1];
  const m3 = url.match(/shorts\/([^?]+)/);
  if (m3) return m3[1];
  return '';
}

type FeedbackState = 'idle' | 'saving' | 'saved' | 'error';

function Feedback({ state, error }: { state: FeedbackState; error?: string }) {
  if (state === 'saving') return <span className="flex items-center gap-1.5 text-gray-500 text-sm"><Loader2 className="w-4 h-4 animate-spin" />Saving...</span>;
  if (state === 'saved') return <span className="flex items-center gap-1.5 text-green-600 text-sm font-semibold"><CheckCircle className="w-4 h-4" />Saved!</span>;
  if (state === 'error') return <span className="flex items-center gap-1.5 text-red-600 text-sm"><AlertCircle className="w-4 h-4" />{error || 'Failed'}</span>;
  return null;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminMediaPage() {
  const supabase = createClientClient();
  const [tab, setTab] = useState<TabKey>('youtube');

  // YouTube
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitleEn, setVideoTitleEn] = useState('');
  const [videoTitleFr, setVideoTitleFr] = useState('');
  const [videoDesc, setVideoDesc] = useState('');
  const [videoPreviewId, setVideoPreviewId] = useState('');
  const [ytFeedback, setYtFeedback] = useState<FeedbackState>('idle');
  const [ytError, setYtError] = useState('');

  // Social
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(
    SOCIAL_PLATFORMS.map(p => ({ key: p.key, label: p.label, value: '', enabled: true }))
  );
  const [socialFeedback, setSocialFeedback] = useState<FeedbackState>('idle');
  const [socialError, setSocialError] = useState('');

  // Documents
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [docUploading, setDocUploading] = useState(false);
  const [docMsg, setDocMsg] = useState('');
  const [docFeedback, setDocFeedback] = useState<FeedbackState>('idle');

  const [loading, setLoading] = useState(true);

  // ─── Load ──────────────────────────────────────────────────────────────────

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const keys = ['youtube_videos', 'media_documents', ...SOCIAL_PLATFORMS.map(p => p.key)];
      const { data } = await supabase.from('cms_site_settings').select('key,value').in('key', keys);
      const m: Record<string, string> = {};
      (data || []).forEach((r: { key: string; value: string }) => { m[r.key] = r.value; });

      if (m.youtube_videos) { try { setVideos(JSON.parse(m.youtube_videos)); } catch { /* keep empty */ } }
      if (m.media_documents) { try { setDocs(JSON.parse(m.media_documents)); } catch { /* keep empty */ } }

      setSocialLinks(SOCIAL_PLATFORMS.map(p => ({
        key: p.key, label: p.label, value: m[p.key] || '', enabled: true,
      })));
    } catch { /* non-fatal */ }
    finally { setLoading(false); }
  }, []); // eslint-disable-line

  useEffect(() => { loadAll(); }, [loadAll]);

  const upsertSetting = async (key: string, value: string) => {
    await supabase.from('cms_site_settings').upsert({ key, value }, { onConflict: 'key' });
  };

  // ─── YouTube ──────────────────────────────────────────────────────────────

  const handleUrlChange = (url: string) => {
    setVideoUrl(url);
    setVideoPreviewId(extractVideoId(url));
  };

  const addVideo = async () => {
    if (!videoPreviewId) { setYtError('Invalid YouTube URL — could not extract video ID.'); return; }
    setYtFeedback('saving'); setYtError('');
    try {
      const newVideo: VideoItem = {
        id: Math.random().toString(36).slice(2),
        title_en: videoTitleEn,
        title_fr: videoTitleFr,
        description: videoDesc,
        video_id: videoPreviewId,
        url: videoUrl,
        added_at: new Date().toISOString(),
      };
      const updated = [...videos, newVideo];
      await upsertSetting('youtube_videos', JSON.stringify(updated));
      setVideos(updated);
      setVideoUrl(''); setVideoTitleEn(''); setVideoTitleFr(''); setVideoDesc(''); setVideoPreviewId('');
      setYtFeedback('saved');
      setTimeout(() => setYtFeedback('idle'), 2000);
    } catch (e) { setYtError(e instanceof Error ? e.message : 'Unknown error'); setYtFeedback('error'); }
  };

  const deleteVideo = async (id: string) => {
    const updated = videos.filter(v => v.id !== id);
    await upsertSetting('youtube_videos', JSON.stringify(updated));
    setVideos(updated);
  };

  // ─── Social ───────────────────────────────────────────────────────────────

  const saveSocial = async () => {
    setSocialFeedback('saving'); setSocialError('');
    try {
      await Promise.all(
        socialLinks.map(s => upsertSetting(s.key, s.value))
      );
      setSocialFeedback('saved');
      setTimeout(() => setSocialFeedback('idle'), 2500);
    } catch (e) { setSocialError(e instanceof Error ? e.message : 'Unknown'); setSocialFeedback('error'); }
  };

  // ─── Documents ────────────────────────────────────────────────────────────

  const handleDocUpload = async (file: File) => {
    setDocUploading(true); setDocMsg('');
    try {
      const path = `documents/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from('cms-uploads').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('cms-uploads').getPublicUrl(path);
      const newDoc: DocItem = {
        name: file.name,
        url: data.publicUrl,
        size: (file.size / 1024).toFixed(0) + ' KB',
        type: file.type,
        uploaded_at: new Date().toISOString(),
      };
      const updated = [...docs, newDoc];
      await upsertSetting('media_documents', JSON.stringify(updated));
      setDocs(updated);
      setDocMsg('Uploaded!');
    } catch (e) { setDocMsg('Upload failed: ' + (e instanceof Error ? e.message : 'error')); }
    finally { setDocUploading(false); }
  };

  const deleteDoc = async (url: string) => {
    const updated = docs.filter(d => d.url !== url);
    await upsertSetting('media_documents', JSON.stringify(updated));
    setDocs(updated);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-[#C9A84C]" />
      <span className="ml-3 text-gray-500">Loading media settings...</span>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0A1628] font-heading">Media Manager</h1>
        <p className="text-gray-500 text-sm mt-1">Manage YouTube videos, social media links, and downloadable documents.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'youtube', label: 'YouTube Videos', icon: <YtIcon className="w-4 h-4" /> },
          { key: 'social', label: 'Social Media', icon: <ExternalLink className="w-4 h-4" /> },
          { key: 'documents', label: 'Documents', icon: <ExternalLink className="w-4 h-4" /> },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as TabKey)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${tab === t.key ? 'bg-[#0A1628] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── YOUTUBE TAB ─────────────────────────────────────────────────────── */}
      {tab === 'youtube' && (
        <div className="space-y-6">
          {/* Add video */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#0A1628] font-heading mb-4">Add YouTube Video</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">YouTube URL</label>
                <input value={videoUrl} onChange={e => handleUrlChange(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  className={inputCls} />
              </div>

              {videoPreviewId && (
                <div className="rounded-xl overflow-hidden border border-gray-100 max-w-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://img.youtube.com/vi/${videoPreviewId}/mqdefault.jpg`} alt="Video thumbnail" className="w-full" />
                  <p className="text-xs text-green-600 font-semibold px-3 py-1.5">✓ Video ID: {videoPreviewId}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Title (English)</label>
                  <input value={videoTitleEn} onChange={e => setVideoTitleEn(e.target.value)} className={inputCls} placeholder="Video title..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Title (Français)</label>
                  <input value={videoTitleFr} onChange={e => setVideoTitleFr(e.target.value)} className={inputCls} placeholder="Titre de la vidéo..." />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Description</label>
                <textarea value={videoDesc} onChange={e => setVideoDesc(e.target.value)} rows={2} className={textareaCls} placeholder="Brief description..." />
              </div>

              {ytError && <p className="text-red-500 text-sm">{ytError}</p>}

              <div className="flex items-center gap-3">
                <button onClick={addVideo} disabled={ytFeedback === 'saving' || !videoPreviewId}
                  className="flex items-center gap-2 bg-[#0A1628] text-white font-bold px-4 py-2 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition text-sm disabled:opacity-50">
                  <Plus className="w-4 h-4" /> Add Video
                </button>
                <Feedback state={ytFeedback} error={ytError} />
              </div>
            </div>
          </div>

          {/* Video grid */}
          {videos.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-[#0A1628] font-heading mb-4">Videos ({videos.length})</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map(v => (
                  <div key={v.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`https://img.youtube.com/vi/${v.video_id}/mqdefault.jpg`} alt={v.title_en} className="w-full" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                          <YtIcon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-[#0A1628] text-sm truncate">{v.title_en || 'Untitled'}</h4>
                      {v.description && <p className="text-gray-400 text-xs mt-1 truncate">{v.description}</p>}
                      <div className="flex items-center justify-between mt-3">
                        <a href={v.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#C9A84C] font-bold hover:underline">Watch →</a>
                        <button onClick={() => deleteVideo(v.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {videos.length === 0 && (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
              <YtIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No videos added yet. Paste a YouTube URL above to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* ── SOCIAL MEDIA TAB ────────────────────────────────────────────────── */}
      {tab === 'social' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-[#0A1628] font-heading mb-5">Social Media Links</h2>
          <div className="space-y-4">
            {socialLinks.map((link, i) => {
              const platform = SOCIAL_PLATFORMS.find(p => p.key === link.key);
              return (
                <div key={link.key} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center">
                    <SocialIcon label={link.label} className={`w-5 h-5 ${platform?.color || 'text-gray-500'}`} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{link.label}</label>
                    <input
                      value={link.value}
                      onChange={e => setSocialLinks(prev => prev.map((s, idx) => idx === i ? { ...s, value: e.target.value } : s))}
                      placeholder={link.key === 'whatsapp_number' ? '+237 6XX XXX XXX' : `https://...`}
                      className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#C9A84C] outline-none w-full"
                    />
                  </div>
                  {link.value && (
                    <a href={link.key === 'whatsapp_number' ? `https://wa.me/${link.value.replace(/\s/g,'')}` : link.value}
                      target="_blank" rel="noopener noreferrer"
                      className="flex-shrink-0 p-2 text-gray-400 hover:text-[#C9A84C] transition">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            <Feedback state={socialFeedback} error={socialError} />
            <button onClick={saveSocial} disabled={socialFeedback === 'saving'}
              className="flex items-center gap-2 bg-[#0A1628] text-white font-bold px-4 py-2 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition text-sm disabled:opacity-50">
              <Save className="w-4 h-4" /> Save Social Links
            </button>
          </div>
        </div>
      )}

      {/* ── DOCUMENTS TAB ───────────────────────────────────────────────────── */}
      {tab === 'documents' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#0A1628] font-heading mb-4">Upload Document</h2>
            <label className="block border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-[#C9A84C] transition">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                {docUploading ? <Loader2 className="w-6 h-6 text-[#C9A84C] animate-spin" /> : <Plus className="w-6 h-6 text-gray-400" />}
              </div>
              <p className="text-sm font-semibold text-gray-600">{docUploading ? 'Uploading...' : 'Click to upload a document'}</p>
              <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX — any size</p>
              <input type="file" accept=".pdf,.doc,.docx" className="hidden" disabled={docUploading}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleDocUpload(f); e.target.value = ''; }} />
            </label>
            {docMsg && <p className={`mt-2 text-sm font-semibold ${docMsg.includes('failed') ? 'text-red-500' : 'text-green-600'}`}>{docMsg}</p>}
          </div>

          {docs.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-[#0A1628] font-heading">Documents ({docs.length})</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {docs.map(doc => (
                  <div key={doc.url} className="px-6 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blue-700 uppercase">{doc.type?.split('/').pop()?.slice(0,3) || 'DOC'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#0A1628] text-sm truncate">{doc.name}</p>
                      <p className="text-xs text-gray-400">{doc.size} · {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                    </div>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-[#C9A84C] font-bold hover:underline flex-shrink-0">
                      <ExternalLink className="w-3.5 h-3.5" /> Download
                    </a>
                    <button onClick={() => deleteDoc(doc.url)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {docs.length === 0 && (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
              <p className="text-gray-400 text-sm">No documents uploaded yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
