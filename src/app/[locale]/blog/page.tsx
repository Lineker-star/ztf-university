export const dynamic = 'force-dynamic';
import BlogPageClient from './BlogPageClient';

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <BlogPageClient locale={locale} />;
}
