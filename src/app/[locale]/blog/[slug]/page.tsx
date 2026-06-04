export const dynamic = 'force-dynamic';

import { BLOG_POSTS } from '../blogData';
import BlogPostClient from './BlogPostClient';
import { notFound } from 'next/navigation';

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const post = BLOG_POSTS.find(p => p.slug === slug);
  if (!post) notFound();
  return <BlogPostClient post={post} locale={locale} />;
}
