import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingActions from '@/components/shared/FloatingActions';
import '../globals.css';
import { locales } from '@/lib/i18n/request';

export const metadata: Metadata = {
  title: 'ZTF University Institute | Institut Universitaire ZTF — Bertoua, Cameroon',
  description: 'ZTF University Institute (ZTF-UI) — A Christian university founded on excellence, faith, and service in Bertoua, Cameroon. Empowering World Innovators and Leaders for Global Impact.',
  icons: {
    icon: '/images/logo.png',
    apple: '/images/logo.png',
  },
};

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as 'en')) {
    notFound();
  }

  const messages = await getMessages();
  const isRTL = locale === 'ar';

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&family=Noto+Sans+Arabic:wght@400;600&family=Noto+Sans+SC:wght@400;700&family=Noto+Sans+KR:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <FloatingActions />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
