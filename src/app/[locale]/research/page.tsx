export const dynamic = 'force-dynamic';
import ResearchPageClient from './ResearchPageClient';

export default async function ResearchPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <ResearchPageClient locale={locale} />;
}
