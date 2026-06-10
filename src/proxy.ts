import createMiddleware from 'next-intl/middleware';
import { locales } from '@/lib/i18n/request';

export default createMiddleware({
  locales,
  defaultLocale: 'en',
  localeDetection: true,
});

export const config = {
  matcher: ['/((?!admin|ztf-control-2026|api|_next|.*\\..*).*)',],
};
