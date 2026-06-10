import createMiddleware from 'next-intl/middleware';
import { locales } from '@/lib/i18n/request';

export default createMiddleware({
  locales,
  defaultLocale: 'en',
  localeDetection: true,
});

export const config = {
  matcher: [
    '/((?!iuztf-management|api|_next|.*\\..*).*)',
  ],
};
