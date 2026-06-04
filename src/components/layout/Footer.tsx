import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { GraduationCap, MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');
  const contact = useTranslations('contact');
  const locale = useLocale();

  return (
    <footer className="bg-[#0A1628] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#C9A84C] rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-[#0A1628]" />
              </div>
              <div>
                <div className="font-bold text-lg font-heading">ZTF University</div>
                <div className="text-[#C9A84C] text-xs">Institut Universitaire ZTF</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">{t('description')}</p>
            <div className="mt-4 flex gap-3">
              {['facebook', 'twitter', 'instagram', 'youtube', 'linkedin'].map(s => (
                <a key={s} href="#" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[#C9A84C] hover:text-[#0A1628] transition text-xs font-bold">
                  {s[0].toUpperCase()}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-[#C9A84C] mb-4 font-heading">{t('quick_links')}</h4>
            <ul className="space-y-2">
              {[
                { href: `/${locale}/about`, label: nav('about') },
                { href: `/${locale}/schools`, label: nav('schools') },
                { href: `/${locale}/schools/programs`, label: nav('programs') },
                { href: `/${locale}/faculty`, label: nav('faculty') },
                { href: `/${locale}/research`, label: nav('research') },
                { href: `/${locale}/admission`, label: nav('admission') },
                { href: `/${locale}/blog`, label: nav('blog') },
                { href: `/${locale}/contact`, label: nav('contact') },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-[#C9A84C] transition text-sm">
                    → {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Schools */}
          <div>
            <h4 className="font-bold text-[#C9A84C] mb-4 font-heading">Our Schools</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {[
                'Agricultural Sciences',
                'Communication',
                'Engineering & Technology',
                'Health Sciences',
                'Economics & Business',
                'Law & Political Sciences',
                'Humanities & Social Sciences',
              ].map(s => (
                <li key={s}><Link href={`/${locale}/schools`} className="hover:text-[#C9A84C] transition">→ {s}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-[#C9A84C] mb-4 font-heading">{t('contact_info')}</h4>
            <ul className="space-y-3">
              <li className="flex gap-3 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-[#C9A84C] flex-shrink-0 mt-0.5" />
                <span>{contact('address')}</span>
              </li>
              <li className="flex gap-3 text-sm text-gray-400">
                <Phone className="w-4 h-4 text-[#C9A84C] flex-shrink-0 mt-0.5" />
                <div>
                  <div>(+237) 679 42 47 10</div>
                  <div>691 45 96 11</div>
                  <div>690 35 53 29</div>
                </div>
              </li>
              <li className="flex gap-3 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-[#C9A84C] flex-shrink-0 mt-0.5" />
                <div>
                  <div>info@ztfuniversity.com</div>
                  <div>ztfuniversityinstitute@gmail.com</div>
                </div>
              </li>
              <li className="flex gap-3 text-sm text-gray-400">
                <Clock className="w-4 h-4 text-[#C9A84C] flex-shrink-0 mt-0.5" />
                <span>{contact('hours')}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Announcement Banner */}
        <div className="mt-12 p-4 bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-xl text-center">
          <p className="text-[#C9A84C] font-semibold">
            🎓 Admissions for 2025–2026 Academic Year are NOW OPEN
          </p>
          <Link href={`/${locale}/admission/apply`} className="text-sm text-white hover:text-[#C9A84C] transition">
            Apply Today →
          </Link>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">{t('rights')}</p>
          <div className="flex gap-6">
            <Link href={`/${locale}/privacy`} className="text-gray-500 hover:text-[#C9A84C] transition text-sm">{t('privacy')}</Link>
            <Link href={`/${locale}/terms`} className="text-gray-500 hover:text-[#C9A84C] transition text-sm">{t('terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
