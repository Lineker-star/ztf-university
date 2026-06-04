'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Upload, X, Bold, Italic, Heading2, Heading3,
  Quote, List, Link2, Trash2, Save, Send, Star,
} from 'lucide-react';
import { createClientClient } from '@/lib/supabase/client';

const CATEGORIES = [
  'University News',
  'Admissions',
  'Student Life',
  'Faith & Learning',
  'Research',
  'Events',
  'Announcements',
];

export interface BlogEditorProps {
  mode: 'new' | 'edit';
  postId?: string;
}

type Status = 'draft' | 'published' | 'scheduled';

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Very small markdown preview renderer — no external lib needed
function renderPreview(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-bold text-[#0A1628] mt-3 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold text-[#0A1628] mt-4 mb-1">$1</h2>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-[#C9A84C] pl-3 italic text-gray-600 my-2">$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-gray-700">$1</li>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[#C9A84C] underline">$1</a>')
    .replace(/\n/g, '<br />');
}

// Markdown toolbar button wrapper
function ToolbarBtn({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="p-1.5 rounded hover:bg-[#C9A84C]/10 text-gray-500 hover:text-[#0A1628] transition"
    >
      {children}
    </button>
  );
}

// Wraps selected text in a textarea with the given prefix/suffix
function wrapSelection(
  ref: React.RefObject<HTMLTextAreaElement | null>,
  setter: (val: string) => void,
  prefix: string,
  suffix = '',
  placeholder = 'text',
) {
  const el = ref.current;
  if (!el) return;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const selected = el.value.slice(start, end) || placeholder;
  const before = el.value.slice(0, start);
  const after = el.value.slice(end);
  const newVal = `${before}${prefix}${selected}${suffix}${after}`;
  setter(newVal);
  // Restore focus + selection after state update
  requestAnimationFrame(() => {
    el.focus();
    el.setSelectionRange(
      start + prefix.length,
      start + prefix.length + selected.length,
    );
  });
}

function insertLinePrefix(
  ref: React.RefObject<HTMLTextAreaElement | null>,
  setter: (val: string) => void,
  linePrefix: string,
) {
  const el = ref.current;
  if (!el) return;
  const start = el.selectionStart;
  const lineStart = el.value.lastIndexOf('\n', start - 1) + 1;
  const before = el.value.slice(0, lineStart);
  const rest = el.value.slice(lineStart);
  const newVal = `${before}${linePrefix}${rest}`;
  setter(newVal);
  requestAnimationFrame(() => {
    el.focus();
    el.setSelectionRange(start + linePrefix.length, start + linePrefix.length);
  });
}

// Markdown toolbar component
function MarkdownToolbar({
  textareaRef,
  setter,
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  setter: (val: string) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 border border-gray-200 rounded-t-xl px-2 py-1 bg-gray-50 border-b-0">
      <ToolbarBtn title="Bold" onClick={() => wrapSelection(textareaRef, setter, '**', '**', 'bold text')}>
        <Bold className="w-3.5 h-3.5" />
      </ToolbarBtn>
      <ToolbarBtn title="Italic" onClick={() => wrapSelection(textareaRef, setter, '_', '_', 'italic text')}>
        <Italic className="w-3.5 h-3.5" />
      </ToolbarBtn>
      <span className="w-px h-4 bg-gray-200 mx-1" />
      <ToolbarBtn title="Heading 2" onClick={() => insertLinePrefix(textareaRef, setter, '## ')}>
        <Heading2 className="w-3.5 h-3.5" />
      </ToolbarBtn>
      <ToolbarBtn title="Heading 3" onClick={() => insertLinePrefix(textareaRef, setter, '### ')}>
        <Heading3 className="w-3.5 h-3.5" />
      </ToolbarBtn>
      <span className="w-px h-4 bg-gray-200 mx-1" />
      <ToolbarBtn title="Blockquote" onClick={() => insertLinePrefix(textareaRef, setter, '> ')}>
        <Quote className="w-3.5 h-3.5" />
      </ToolbarBtn>
      <ToolbarBtn title="List" onClick={() => insertLinePrefix(textareaRef, setter, '- ')}>
        <List className="w-3.5 h-3.5" />
      </ToolbarBtn>
      <span className="w-px h-4 bg-gray-200 mx-1" />
      <ToolbarBtn
        title="Link"
        onClick={() => wrapSelection(textareaRef, setter, '[', '](https://)', 'link text')}
      >
        <Link2 className="w-3.5 h-3.5" />
      </ToolbarBtn>
    </div>
  );
}

export default function BlogEditor({ mode, postId }: BlogEditorProps) {
  const router = useRouter();

  // Fields
  const [titleEn, setTitleEn] = useState('');
  const [titleFr, setTitleFr] = useState('');
  const [slug, setSlug] = useState('');
  const [authorName, setAuthorName] = useState('ZTF University');
  const [readTime, setReadTime] = useState(3);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [excerptEn, setExcerptEn] = useState('');
  const [excerptFr, setExcerptFr] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [contentFr, setContentFr] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [status, setStatus] = useState<Status>('draft');
  const [publishedAt, setPublishedAt] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  // UI state
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [loadError, setLoadError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Refs for markdown toolbars
  const contentEnRef = useRef<HTMLTextAreaElement>(null);
  const contentFrRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load post in edit mode
  useEffect(() => {
    if (mode !== 'edit' || !postId) return;
    const load = async () => {
      const supabase = createClientClient();
      const { data, error } = await supabase
        .from('cms_blog_posts')
        .select('*')
        .eq('id', postId)
        .single();
      if (error || !data) {
        setLoadError('Post not found.');
        return;
      }
      setTitleEn(data.title_en || '');
      setTitleFr(data.title_fr || '');
      setSlug(data.slug || '');
      setAuthorName(data.author_name || 'ZTF University');
      setReadTime(data.read_time_minutes ?? 3);
      setCategory(data.category || CATEGORIES[0]);
      setTags(Array.isArray(data.tags) ? data.tags : []);
      setExcerptEn(data.excerpt_en || '');
      setExcerptFr(data.excerpt_fr || '');
      setContentEn(data.content_en || '');
      setContentFr(data.content_fr || '');
      setCoverImageUrl(data.cover_image || '');
      setStatus(data.is_published ? 'published' : 'draft');
      setPublishedAt(
        data.published_at ? new Date(data.published_at).toISOString().slice(0, 16) : '',
      );
      setIsFeatured(data.is_featured || false);
    };
    load();
  }, [mode, postId]);

  // Auto-generate slug from titleEn when creating new
  const handleTitleEnChange = useCallback(
    (val: string) => {
      setTitleEn(val);
      if (mode === 'new') {
        setSlug(slugify(val));
      }
    },
    [mode],
  );

  // Tag input
  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  };
  const removeTag = (t: string) => setTags(prev => prev.filter(x => x !== t));

  // Cover image upload
  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const supabase = createClientClient();
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `blog/${slug || Date.now()}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('cms-uploads')
        .upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('cms-uploads').getPublicUrl(fileName);
      setCoverImageUrl(urlData.publicUrl);
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  // Save
  const savePost = async (statusOverride?: Status) => {
    if (!titleEn.trim()) {
      setSaveMsg('Title (English) is required.');
      setTimeout(() => setSaveMsg(''), 3000);
      return;
    }
    setSaving(true);
    setSaveMsg('');
    try {
      const supabase = createClientClient();
      const resolvedStatus = statusOverride || status;
      const data = {
        title_en: titleEn,
        title_fr: titleFr,
        slug: slug || slugify(titleEn),
        category,
        tags,
        author_name: authorName,
        read_time_minutes: readTime,
        excerpt_en: excerptEn,
        excerpt_fr: excerptFr,
        content_en: contentEn,
        content_fr: contentFr,
        cover_image: coverImageUrl || null,
        is_featured: isFeatured,
        is_published: resolvedStatus === 'published',
        published_at:
          resolvedStatus === 'published' || statusOverride === 'published'
            ? new Date().toISOString()
            : publishedAt
            ? new Date(publishedAt).toISOString()
            : null,
        updated_at: new Date().toISOString(),
      };

      if (mode === 'new') {
        const { data: inserted, error } = await supabase
          .from('cms_blog_posts')
          .insert({ ...data, created_at: new Date().toISOString() })
          .select()
          .single();
        if (error) throw error;
        setSaveMsg('Saved!');
        if (inserted) router.push(`/admin/blog/${inserted.id}`);
      } else {
        const { error } = await supabase
          .from('cms_blog_posts')
          .update(data)
          .eq('id', postId!);
        if (error) throw error;
        setSaveMsg(resolvedStatus === 'published' ? 'Published!' : 'Saved!');
        if (statusOverride) setStatus(resolvedStatus);
        setTimeout(() => setSaveMsg(''), 3000);
      }
    } catch (err) {
      console.error('Save failed:', err);
      setSaveMsg('Save failed. Please try again.');
      setTimeout(() => setSaveMsg(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!postId) return;
    const supabase = createClientClient();
    await supabase.from('cms_blog_posts').delete().eq('id', postId);
    router.push('/admin/blog');
  };

  if (loadError) {
    return (
      <div className="p-12 text-center text-gray-400 text-sm">
        {loadError}
        <Link href="/admin/blog" className="ml-2 text-[#C9A84C] underline">Back to Blog</Link>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#0A1628] font-heading">
          {mode === 'new' ? 'New Blog Post' : 'Edit Post'}
        </h1>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
        {/* ── LEFT: Editor ────────────────────────────── */}
        <div className="space-y-5">
          {/* Cover Image */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <label className="block text-xs font-bold text-gray-500 mb-3 uppercase">Cover Image</label>
            {coverImageUrl ? (
              <div className="relative">
                <div className="relative w-full max-h-[200px] rounded-xl overflow-hidden bg-gray-100">
                  <Image
                    src={coverImageUrl}
                    alt="Cover"
                    width={800}
                    height={200}
                    className="w-full object-cover max-h-[200px]"
                  />
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-semibold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverImageUrl('')}
                    className="text-xs font-semibold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl py-10 flex flex-col items-center gap-2 hover:border-[#C9A84C] hover:bg-[#C9A84C]/5 transition text-gray-400 disabled:opacity-60"
              >
                <Upload className="w-6 h-6" />
                <span className="text-sm font-medium">
                  {uploadingImage ? 'Uploading...' : 'Upload Cover Image'}
                </span>
                <span className="text-xs">JPG, PNG, WebP · Recommended 1200×630</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
                e.target.value = '';
              }}
            />
          </div>

          {/* Titles + Slug + Author + Read Time */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">
                Title (English) <span className="text-red-400">*</span>
              </label>
              <input
                value={titleEn}
                onChange={e => handleTitleEnChange(e.target.value)}
                placeholder="Post Title (English)"
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full font-semibold text-[#0A1628]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">
                Title (Français)
              </label>
              <input
                value={titleFr}
                onChange={e => setTitleFr(e.target.value)}
                placeholder="Titre (Français)"
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Slug</label>
              <input
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="url-friendly-slug"
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full font-mono text-gray-600"
              />
              <p className="text-xs text-[#C9A84C] mt-1.5 font-medium">
                URL: /media/blog/{slug || 'post-slug-here'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Author</label>
                <input
                  value={authorName}
                  onChange={e => setAuthorName(e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">
                  Read time (minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={readTime}
                  onChange={e => setReadTime(Math.max(1, parseInt(e.target.value) || 1))}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full"
                />
              </div>
            </div>
          </div>

          {/* Category + Tags */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-[#0A1628]/8 text-[#0A1628] text-xs font-semibold px-2.5 py-1 rounded-full"
                  >
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { e.preventDefault(); addTag(); }
                  }}
                  placeholder="Type a tag and press Enter"
                  className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#C9A84C] outline-none flex-1"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="bg-[#0A1628] text-white font-bold px-4 py-2 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition text-sm"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Excerpts */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Excerpt (English)</label>
                <span className="text-xs text-gray-400">{excerptEn.length}/200</span>
              </div>
              <textarea
                value={excerptEn}
                onChange={e => setExcerptEn(e.target.value.slice(0, 200))}
                rows={3}
                placeholder="Brief summary shown on the blog listing page..."
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full resize-none"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Résumé (Français)</label>
                <span className="text-xs text-gray-400">{excerptFr.length}/200</span>
              </div>
              <textarea
                value={excerptFr}
                onChange={e => setExcerptFr(e.target.value.slice(0, 200))}
                rows={3}
                placeholder="Résumé court en français..."
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full resize-none"
              />
            </div>
          </div>

          {/* Content EN */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">
              Content (English)
            </label>
            <MarkdownToolbar textareaRef={contentEnRef} setter={setContentEn} />
            <textarea
              ref={contentEnRef}
              value={contentEn}
              onChange={e => setContentEn(e.target.value)}
              rows={20}
              placeholder="Write the full article content here (Markdown supported)..."
              className="border border-gray-200 rounded-b-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full resize-y font-mono leading-relaxed"
            />
          </div>

          {/* Content FR */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">
              Contenu (Français)
            </label>
            <MarkdownToolbar textareaRef={contentFrRef} setter={setContentFr} />
            <textarea
              ref={contentFrRef}
              value={contentFr}
              onChange={e => setContentFr(e.target.value)}
              rows={20}
              placeholder="Rédigez le contenu complet de l'article ici (Markdown supporté)..."
              className="border border-gray-200 rounded-b-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full resize-y font-mono leading-relaxed"
            />
          </div>
        </div>

        {/* ── RIGHT: Sidebar ───────────────────────────── */}
        <div className="space-y-5 lg:sticky lg:top-6">
          {/* Publish Settings */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-[#0A1628] text-sm mb-4">Publish Settings</h3>
            {/* Status buttons */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Status</label>
              <div className="flex gap-1.5">
                {(['draft', 'published', 'scheduled'] as Status[]).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition ${
                      status === s
                        ? s === 'published'
                          ? 'bg-green-600 text-white'
                          : s === 'scheduled'
                          ? 'bg-blue-600 text-white'
                          : 'bg-[#0A1628] text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {/* Published date */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">
                {status === 'scheduled' ? 'Scheduled Date & Time' : 'Published Date & Time'}
              </label>
              <input
                type="datetime-local"
                value={publishedAt}
                onChange={e => setPublishedAt(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full"
              />
            </div>
            {/* Featured toggle */}
            <button
              type="button"
              onClick={() => setIsFeatured(f => !f)}
              className={`flex items-center gap-2 w-full px-4 py-2.5 rounded-xl border transition text-sm font-semibold ${
                isFeatured
                  ? 'bg-[#C9A84C]/10 border-[#C9A84C] text-[#A8893E]'
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Star className={`w-4 h-4 ${isFeatured ? 'fill-[#C9A84C] text-[#C9A84C]' : ''}`} />
              {isFeatured ? 'Featured Post' : 'Mark as Featured'}
            </button>
          </div>

          {/* Quick Preview */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-[#0A1628] text-sm mb-3">Quick Preview</h3>
            <div className="overflow-y-auto max-h-[300px] space-y-2">
              {titleEn && (
                <p className="text-base font-bold text-[#0A1628] leading-tight">{titleEn}</p>
              )}
              {excerptEn && (
                <p className="text-xs text-gray-500 leading-relaxed">{excerptEn}</p>
              )}
              {contentEn && (
                <div
                  className="text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-2 mt-2"
                  dangerouslySetInnerHTML={{ __html: renderPreview(contentEn) }}
                />
              )}
              {!titleEn && !contentEn && (
                <p className="text-xs text-gray-400 italic">Start typing to see a preview...</p>
              )}
            </div>
          </div>

          {/* Delete (edit mode) */}
          {mode === 'edit' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-[#0A1628] text-sm mb-3">Danger Zone</h3>
              {showDeleteConfirm ? (
                <div className="space-y-2">
                  <p className="text-xs text-red-600 font-medium">
                    Delete &quot;{titleEn}&quot;? This cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="flex-1 bg-red-600 text-white font-bold py-2 rounded-xl text-sm hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 bg-gray-100 text-gray-600 font-bold py-2 rounded-xl text-sm hover:bg-gray-200 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-700 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete this post
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM ACTION BAR ─────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 shadow-lg">
        <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center justify-between gap-3">
          <Link
            href="/admin/blog"
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#0A1628] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {saveMsg && (
            <span
              className={`text-sm font-semibold px-3 py-1.5 rounded-xl ${
                saveMsg.includes('fail') || saveMsg.includes('required')
                  ? 'bg-red-50 text-red-600'
                  : 'bg-green-50 text-green-700'
              }`}
            >
              {saveMsg}
            </span>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => savePost('draft')}
              disabled={saving}
              className="flex items-center gap-2 border border-gray-200 text-gray-600 font-bold px-4 py-2 rounded-xl hover:bg-gray-50 transition text-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => savePost('published')}
              disabled={saving}
              className="flex items-center gap-2 bg-[#0A1628] text-white font-bold px-4 py-2 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition text-sm disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {saving ? 'Saving...' : 'Publish Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
