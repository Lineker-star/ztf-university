'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const locale = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [schoolsOpen, setSchoolsOpen] = useState(false);
  const schoolsRef = useRef<HTMLDivElement>(null);

  const isFr = locale === 'fr';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (schoolsRef.current && !schoolsRef.current.contains(e.target as Node)) {
        setSchoolsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const uniName = isFr ? 'Institut Universitaire ZTF' : 'ZTF University Institute';
  const uniAbbr = isFr ? 'IU-ZTF · Bertoua, Cameroun' : 'ZTF-UI · Bertoua, Cameroon';

  const schoolsDropdown = [
    { href: `/${locale}/schools`, label_en: 'Overview', label_fr: 'Vue d\'ensemble' },
    { href: `/${locale}/schools#hiacomst`, label_en: 'HIACOMST', label_fr: 'ISASCOMT' },
    { href: `/${locale}/schools#hilepmah`, label_en: 'HILEPMAH', label_fr: 'ISMEDMAH' },
    { href: `/${locale}/schools#hihs`, label_en: 'HIHS / Health Sciences', label_fr: 'ISSS / Sciences Santé' },
    { href: `/${locale}/schools#shp`, label_en: 'SHP / Health Professions', label_fr: 'EMS / Métiers Santé' },
    null, // divider
    { href: `/${locale}/schools/programs`, label_en: 'Academic Programs', label_fr: 'Programmes Académiques' },
    { href: `/${locale}/schools#vocational`, label_en: 'Vocational Training', label_fr: 'Formation Professionnelle' },
  ];

  const mainLinks = [
    { href: `/${locale}`, label_en: 'Home', label_fr: 'Accueil' },
    { href: `/${locale}/about`, label_en: 'About', label_fr: 'À Propos' },
    { href: `/${locale}/faculty`, label_en: 'Faculty', label_fr: 'Corps Enseignant' },
    { href: `/${locale}/research`, label_en: 'Research & Innovation', label_fr: 'Recherche & Innovation' },
    { href: `/${locale}/admission`, label_en: 'Admission', label_fr: 'Admission' },
    { href: `/${locale}/media`, label_en: 'Media', label_fr: 'Médias' },
    { href: `/${locale}/blog`, label_en: 'Blog', label_fr: 'Blog' },
    { href: `/${locale}/contact`, label_en: 'Contact', label_fr: 'Contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#0A1628]/98 shadow-xl backdrop-blur-sm' : 'bg-[#0A1628]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-3 flex-shrink-0">
            <Image src="/images/logo.png" alt="ZTF University Institute Logo" width={55} height={55} className="object-contain" priority />
            <div className="hidden sm:block">
              <div className="text-white font-bold text-sm leading-tight font-heading">{uniName}</div>
              <div className="text-[#C9A84C] text-xs">{uniAbbr}</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden xl:flex items-center gap-0.5">
            {/* Home */}
            <Link href={`/${locale}`} className="text-gray-300 hover:text-white hover:bg-white/10 px-2.5 py-2 rounded-lg text-xs font-medium transition">
              {isFr ? 'Accueil' : 'Home'}
            </Link>
            <Link href={`/${locale}/about`} className="text-gray-300 hover:text-white hover:bg-white/10 px-2.5 py-2 rounded-lg text-xs font-medium transition">
              {isFr ? 'À Propos' : 'About'}
            </Link>

            {/* Schools Dropdown */}
            <div className="relative" ref={schoolsRef}>
              <button
                onClick={() => setSchoolsOpen(!schoolsOpen)}
                className="flex items-center gap-1 text-gray-300 hover:text-white hover:bg-white/10 px-2.5 py-2 rounded-lg text-xs font-medium transition"
              >
                {isFr ? 'Écoles & Instituts' : 'Schools & Institutes'}
                <ChevronDown className={`w-3 h-3 transition-transform ${schoolsOpen ? 'rotate-180' : ''}`} />
              </button>
              {schoolsOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-[#0D1F3C] border border-[#C9A84C]/30 rounded-xl shadow-2xl z-50 overflow-hidden">
                  {schoolsDropdown.map((item, i) =>
                    item === null ? (
                      <div key={i} className="border-t border-white/10 my-1" />
                    ) : (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSchoolsOpen(false)}
                        className="block px-4 py-2.5 text-xs text-gray-300 hover:bg-[#C9A84C]/10 hover:text-white transition"
                      >
                        {isFr ? item.label_fr : item.label_en}
                      </Link>
                    )
                  )}
                </div>
              )}
            </div>

            {mainLinks.slice(2).map(link => (
              <Link key={link.href} href={link.href}
                className="text-gray-300 hover:text-white hover:bg-white/10 px-2.5 py-2 rounded-lg text-xs font-medium transition">
                {isFr ? link.label_fr : link.label_en}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link href={`/${locale}/admission/apply`}
              className="hidden sm:inline-flex items-center bg-[#C9A84C] text-[#0A1628] font-bold px-4 py-2 rounded-lg hover:bg-[#E8C96A] transition text-xs">
              {isFr ? 'Postuler' : 'Apply Now'}
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="xl:hidden p-2 text-white hover:bg-white/10 rounded-lg transition">
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="xl:hidden bg-[#0A1628] border-t border-white/10">
          <div className="px-4 py-4 space-y-1 max-h-[80vh] overflow-y-auto">
            <Link href={`/${locale}`} onClick={() => setMobileOpen(false)}
              className="block text-gray-300 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition text-sm">
              {isFr ? 'Accueil' : 'Home'}
            </Link>
            <Link href={`/${locale}/about`} onClick={() => setMobileOpen(false)}
              className="block text-gray-300 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition text-sm">
              {isFr ? 'À Propos' : 'About'}
            </Link>
            {/* Schools section */}
            <div className="px-4 py-2">
              <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-wider mb-2">
                {isFr ? 'Écoles & Instituts' : 'Schools & Institutes'}
              </p>
              {schoolsDropdown.map((item, i) =>
                item === null ? null : (
                  <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                    className="block text-gray-400 hover:text-white px-2 py-1.5 text-sm transition">
                    → {isFr ? item.label_fr : item.label_en}
                  </Link>
                )
              )}
            </div>
            {mainLinks.slice(2).map(link => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                className="block text-gray-300 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition text-sm">
                {isFr ? link.label_fr : link.label_en}
              </Link>
            ))}
            <Link href={`/${locale}/admission/apply`} onClick={() => setMobileOpen(false)}
              className="block text-center bg-[#C9A84C] text-[#0A1628] font-bold px-4 py-3 rounded-lg hover:bg-[#E8C96A] transition mt-4">
              {isFr ? 'Postuler' : 'Apply Now'}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
