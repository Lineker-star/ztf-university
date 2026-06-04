'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, ArrowLeft, Clock } from 'lucide-react';
import type { BLOG_POSTS } from '../BlogPageClient';

type Post = typeof BLOG_POSTS[0];

export default function BlogPostClient({ post, locale }: { post: Post; locale: string }) {
  const isFr = locale === 'fr';
  const title = isFr ? post.title_fr : post.title_en;
  const excerpt = isFr ? post.excerpt_fr : post.excerpt_en;

  return (
    <>
      {/* Hero */}
      <section className="relative pt-16 lg:pt-20">
        <div className="relative h-72 md:h-96 overflow-hidden">
          <Image src={post.image} alt={title} fill className="object-cover object-top" priority />
          <div className="absolute inset-0 bg-[#0A1628]/70" />
          <div className="relative h-full flex flex-col items-end justify-end px-4 sm:px-8 pb-8">
            <div className="max-w-3xl">
              <span className="inline-block bg-[#C9A84C] text-[#0A1628] text-xs font-bold px-3 py-1 rounded-full mb-3">
                {isFr ? post.cat_fr : post.cat_en}
              </span>
              <h1 className="text-2xl md:text-4xl font-bold text-white font-heading leading-snug">{title}</h1>
            </div>
          </div>
        </div>
      </section>

      {/* Article */}
      <article className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Back */}
          <Link href={`/${locale}/blog`}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#C9A84C] transition mb-8">
            <ArrowLeft className="w-4 h-4" />
            {isFr ? 'Retour au Blog' : 'Back to Blog'}
          </Link>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-8 pb-6 border-b border-gray-100">
            <span className="font-semibold text-[#0A1628]">{post.author}</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(post.date).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {post.readTime} {isFr ? 'min de lecture' : 'min read'}
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <p className="text-xl font-semibold text-[#0A1628] mb-6">{excerpt}</p>
            <p>
              {isFr
                ? `Cet article est publié par ${post.author} de l'Institut Universitaire ZTF. Pour plus d'informations, veuillez nous contacter.`
                : `This article is published by ${post.author} at ZTF University Institute. For more information, please contact us.`}
            </p>
          </div>

          {/* CTA */}
          <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div>
              <p className="font-bold text-[#0A1628]">{isFr ? 'Intéressé(e) par l\'IU-ZTF?' : 'Interested in ZTF-UI?'}</p>
              <p className="text-sm text-gray-500">{isFr ? "Postulez dès maintenant pour l'année 2026–2027" : 'Apply now for the 2026–2027 academic year'}</p>
            </div>
            <Link href={`/${locale}/admission/apply`}
              className="inline-flex items-center gap-2 bg-[#C9A84C] text-[#0A1628] font-bold px-6 py-3 rounded-xl hover:bg-[#E8C96A] transition text-sm flex-shrink-0">
              {isFr ? 'Postuler Maintenant' : 'Apply Now'}
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
