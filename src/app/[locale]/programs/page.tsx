export const dynamic = 'force-dynamic';

// Redirect old /programs to new /schools/programs
import { redirect } from 'next/navigation';

export default async function OldProgramsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/schools/programs`);
}
