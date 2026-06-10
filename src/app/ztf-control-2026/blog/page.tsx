'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus, Edit2, Trash2, Star, Search, ChevronDown, X,
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

type Post = {
  id: string;
  title_en: string;
  title_fr: string;
  slug: string;
  category: string;
  tags: string[] | null;
  author_name: string;
  read_time_minutes: number;
  excerpt_en: string;
  excerpt_fr: string;
  cover_image: string | null;
  is_featured: boolean;
  is_published: boolean;
  published_at: string | null;
  views: number;
  created_at: string;
  updated_at: string;
};

type FilterTab = 'all' | 'published' | 'draft' | 'scheduled';

type DeleteConfirm = { id: string; title: string } | null;

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirm>(null);
  const [togglingFeatured, setTogglingFeatured] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    const supabase = createClientClient();
    const { data } = await supabase
      .from('cms_blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    setPosts((data as Post[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.is_published).length,
    drafts: posts.filter(p => !p.is_published).length,
    scheduled: 0,
  };

  const filtered = posts.filter(p => {
    if (filterTab === 'published' && !p.is_published) return false;
    if (filterTab === 'draft' && p.is_published) return false;
    if (categoryFilter && p.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.title_en.toLowerCase().includes(q) && !p.title_fr.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const supabase = createClientClient();
    await supabase.from('cms_blog_posts').delete().eq('id', deleteConfirm.id);
    setDeleteConfirm(null);
    loadPosts();
  };

  const toggleFeatured = async (post: Post) => {
    setTogglingFeatured(post.id);
    const supabase = createClientClient();
    await supabase
      .from('cms_blog_posts')
      .update({ is_featured: !post.is_featured, updated_at: new Date().toISOString() })
      .eq('id', post.id);
    setTogglingFeatured(null);
    loadPosts();
  };

  const statusBadge = (isPublished: boolean) => {
    if (isPublished)
      return <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-green-100 text-green-700">Published</span>;
    return <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-gray-100 text-gray-500">Draft</span>;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628] font-heading">Blog Manager</h1>
          <div className="flex flex-wrap gap-4 mt-2">
            <StatPill label="Total" value={stats.total} color="text-[#0A1628]" />
            <StatPill label="Published" value={stats.published} color="text-green-700" />
            <StatPill label="Drafts" value={stats.drafts} color="text-gray-500" />
            <StatPill label="Scheduled" value={stats.scheduled} color="text-blue-600" />
          </div>
        </div>
        <Link
          href="/ztf-control-2026/blog/new"
          className="inline-flex items-center gap-2 bg-[#0A1628] text-white font-bold px-4 py-2 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition text-sm flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> New Post
        </Link>
      </div>

      {/* Filter Tabs + Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {/* Tabs */}
          <div className="flex gap-1">
            {(['all', 'published', 'draft', 'scheduled'] as FilterTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold capitalize transition ${
                  filterTab === tab
                    ? 'bg-[#0A1628] text-white'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          {/* Category + Search */}
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="border border-gray-200 rounded-xl pl-3 pr-8 py-2 text-sm focus:border-[#C9A84C] outline-none appearance-none bg-white"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <div className="relative flex-1 sm:flex-none">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search posts..."
                className="border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:border-[#C9A84C] outline-none w-full sm:w-52"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Loading posts...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-sm">
              {posts.length === 0
                ? 'No blog posts yet. Create your first post!'
                : 'No posts match your filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Post</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide hidden md:table-cell">Category</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide hidden lg:table-cell">Published</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide hidden lg:table-cell">Views</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide text-center">Featured</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(post => (
                  <tr key={post.id} className="hover:bg-gray-50/50 transition group">
                    {/* Post */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                          {post.cover_image ? (
                            <Image
                              src={post.cover_image}
                              alt=""
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">—</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/ztf-control-2026/blog/${post.id}`}
                            className="font-semibold text-[#0A1628] hover:text-[#C9A84C] transition line-clamp-1 block"
                          >
                            {post.title_en || '(Untitled)'}
                          </Link>
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{post.author_name} · {post.read_time_minutes} min</p>
                        </div>
                      </div>
                    </td>
                    {/* Category */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs bg-[#C9A84C]/10 text-[#A8893E] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                        {post.category}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3">{statusBadge(post.is_published)}</td>
                    {/* Published date */}
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell whitespace-nowrap">
                      {formatDate(post.published_at)}
                    </td>
                    {/* Views */}
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                      {(post.views ?? 0).toLocaleString()}
                    </td>
                    {/* Featured */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleFeatured(post)}
                        disabled={togglingFeatured === post.id}
                        className="transition disabled:opacity-50"
                        title={post.is_featured ? 'Remove featured' : 'Mark featured'}
                      >
                        <Star
                          className={`w-4 h-4 mx-auto ${
                            post.is_featured ? 'fill-[#C9A84C] text-[#C9A84C]' : 'text-gray-300 hover:text-[#C9A84C]'
                          }`}
                        />
                      </button>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/ztf-control-2026/blog/${post.id}`}
                          className="p-1.5 hover:bg-[#C9A84C]/10 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                        </Link>
                        {deleteConfirm?.id === post.id ? (
                          <div className="flex items-center gap-1 bg-red-50 border border-red-200 rounded-xl px-2 py-1">
                            <span className="text-xs text-red-600 font-medium whitespace-nowrap">
                              Delete &quot;{post.title_en.slice(0, 20)}{post.title_en.length > 20 ? '…' : ''}&quot;?
                            </span>
                            <button
                              onClick={handleDelete}
                              className="text-xs font-bold text-red-600 hover:text-red-800 ml-1 transition"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="text-xs font-bold text-gray-500 hover:text-gray-700 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm({ id: post.id, title: post.title_en })}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span className={`text-sm font-semibold ${color}`}>
      <span className="font-bold">{value}</span>{' '}
      <span className="text-gray-400 font-normal">{label}</span>
    </span>
  );
}
