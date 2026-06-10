import createMiddleware from 'next-intl/middleware';
import { locales } from '@/lib/i18n/request';

export default createMiddleware({
  locales,
  defaultLocale: 'en',
  localeDetection: true,
});

export const config = {
  // Exclude the secret admin panel, API routes, Next.js internals, and static files
  matcher: ['/((?!ztf-control-2026|api|_next/static|_next/image|favicon.ico|images|.*\\..*).*)'],
};
