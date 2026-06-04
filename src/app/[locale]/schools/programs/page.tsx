export const dynamic = 'force-dynamic';
import ProgramsPageClient from './ProgramsPageClient';

export default async function SchoolsProgramsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ institute?: string; school?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  return <ProgramsPageClient locale={locale} institute={sp.institute} school={sp.school} />;
}
