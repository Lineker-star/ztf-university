'use client';
import { useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import type { BlogPost } from '@/types/database';
import { Calendar, Eye, ArrowRight } from 'lucide-react';

const CATEGORIES = ['all', 'news', 'academic', 'student_life', 'faith', 'africa', 'research', 'admissions'] as const;

const CAT_LABELS: Record<string, { en: string; fr: string }> = {
  all: { en: 'All', fr: 'Tous' },
  news: { en: 'University News', fr: 'Actualités Universitaires' },
  academic: { en: 'Academic', fr: 'Académique' },
  student_life: { en: 'Student Life', fr: 'Vie Étudiante' },
  faith: { en: 'Faith & Learning', fr: 'Foi & Apprentissage' },
  africa: { en: 'Africa & Development', fr: 'Afrique & Développement' },
  research: { en: 'Research', fr: 'Recherche' },
  admissions: { en: 'Admissions', fr: 'Admissions' },
};

export default function BlogClient({ posts }: { posts: BlogPost[] }) {
  const locale = useLocale();
  const [filter, setFilter] = useState('all');
  const [email, setEmail] = useState('');

  const filtered = filter === 'all' ? posts : posts.filter(p => p.category === filter || p.category?.toLowerCase().replace(/\s+/g, '_') === filter);

  const getTitle = (post: BlogPost) => (locale === 'fr' && post.title_fr) ? post.title_fr : post.title_en;
  const getExcerpt = (post: BlogPost) => (locale === 'fr' && post.excerpt_fr) ? post.excerpt_fr : (post.excerpt_en || '');

  return (
    <div className="grid lg:grid-cols-3 gap-10">
      {/* Articles */}
      <div className="lg:col-span-2">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition whitespace-nowrap flex-shrink-0 ${
                filter === cat ? 'bg-[#0A1628] text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}>
              {locale === 'fr' ? CAT_LABELS[cat]?.fr : CAT_LABELS[cat]?.en}
            </button>
          ))}
        </div>

        <div className="space-y-8">
          {filtered.map(post => (
            <article key={post.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all group">
              {post.cover_image && (
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={post.cover_image}
                    alt={getTitle(post)}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 600px"
                  />
                </div>
              )}
              <div className="p-6">
                {post.category && (
                  <div className="inline-block bg-[#C9A84C]/10 text-[#A8893E] text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase">
                    {CAT_LABELS[post.category]?.[locale as 'en' | 'fr'] || post.category.replace(/_/g, ' ')}
                  </div>
                )}
                <h2 className="text-xl font-bold text-[#0A1628] font-heading mb-3 group-hover:text-[#C9A84C] transition leading-snug">
                  {getTitle(post)}
                </h2>
                {getExcerpt(post) && (
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{getExcerpt(post)}</p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-4">
                    {post.author_name && <span>By {post.author_name}</span>}
                    {post.published_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.published_at).toLocaleDateString(locale)}
                      </div>
                    )}
                    <div className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views}</div>
                  </div>
                  <Link href={`/${locale}/blog/${post.slug}`}
                    className="flex items-center gap-1 text-[#C9A84C] font-semibold hover:gap-2 transition-all">
                    {locale === 'fr' ? 'Lire la Suite' : 'Read More'} <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              {locale === 'fr' ? 'Aucun article dans cette catégorie.' : 'No articles in this category yet.'}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <aside className="space-y-8">
        {/* Newsletter */}
        <div className="bg-[#0A1628] rounded-2xl p-6 text-white">
          <h3 className="font-bold text-lg font-heading mb-2 text-[#C9A84C]">
            {locale === 'fr' ? 'Restez Informé' : 'Stay Updated'}
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            {locale === 'fr' ? 'Recevez les dernières nouvelles de l\'IU-ZTF.' : 'Get the latest news from ZTF University Institute.'}
          </p>
          <input value={email} onChange={e => setEmail(e.target.value)}
            placeholder={locale === 'fr' ? 'Votre e-mail' : 'Your email'}
            type="email"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-400 mb-3 focus:border-[#C9A84C] outline-none" />
          <button className="w-full bg-[#C9A84C] text-[#0A1628] font-bold py-2.5 rounded-xl hover:bg-[#E8C96A] transition text-sm">
            {locale === 'fr' ? 'S\'abonner' : 'Subscribe'}
          </button>
        </div>

        {/* Recent Posts */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-[#0A1628] font-heading mb-4">
            {locale === 'fr' ? 'Articles Récents' : 'Recent Posts'}
          </h3>
          <div className="space-y-4">
            {posts.slice(0, 5).map(post => (
              <Link key={post.id} href={`/${locale}/blog/${post.slug}`} className="flex gap-3 group">
                {post.cover_image && (
                  <div className="relative w-14 h-14 flex-shrink-0">
                    <Image src={post.cover_image} alt="" fill className="rounded-lg object-cover" sizes="56px" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-[#0A1628] group-hover:text-[#C9A84C] transition line-clamp-2 leading-snug">
                    {getTitle(post)}
                  </p>
                  {post.published_at && (
                    <p className="text-xs text-gray-400 mt-1">{new Date(post.published_at).toLocaleDateString(locale)}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-[#0A1628] font-heading mb-4">
            {locale === 'fr' ? 'Catégories' : 'Categories'}
          </h3>
          <div className="space-y-2">
            {CATEGORIES.slice(1).map(cat => (
              <button key={cat} onClick={() => setFilter(cat)}
                className="w-full flex justify-between items-center text-sm text-gray-600 hover:text-[#C9A84C] transition py-1">
                <span>{locale === 'fr' ? CAT_LABELS[cat]?.fr : CAT_LABELS[cat]?.en}</span>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                  {posts.filter(p => p.category === cat || p.category?.toLowerCase().replace(/\s+/g, '_') === cat).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
