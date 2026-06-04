'use client';
export const dynamic = 'force-dynamic';

import { useLocale } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, MessageCircle, Play } from 'lucide-react';

// Custom social icons as SVG components since lucide doesn't have all platforms
function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
    </svg>
  );
}

function TiktokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
    </svg>
  );
}

const VIDEO_PLACEHOLDERS = [
  { title_en: 'ZTF University Graduation Ceremony 2025', title_fr: 'Cérémonie de Remise de Diplômes 2025', type: 'graduation' },
  { title_en: 'Campus Life at ZTF University', title_fr: 'Vie sur le Campus de l\'IU-ZTF', type: 'campus' },
  { title_en: 'Academic Excellence: The ZTF Story', title_fr: 'Excellence Académique : L\'Histoire ZTF', type: 'academic' },
  { title_en: 'The Legacy of Prof. Zacharias Tanee Fomum', title_fr: 'L\'Héritage du Prof. Zacharias Tanee Fomum', type: 'founder' },
];

const SOCIAL_LINKS = [
  { platform: 'Facebook', handle: 'ztfuniversityinstitute', url: 'https://facebook.com/ztfuniversityinstitute', color: 'bg-[#1877F2]', Icon: FacebookIcon, followers: '2.5K+' },
  { platform: 'Instagram', handle: '@ztfuniversityinstitute', url: 'https://instagram.com/ztfuniversityinstitute', color: 'bg-gradient-to-br from-pink-500 to-orange-400', Icon: InstagramIcon, followers: '1.8K+' },
  { platform: 'YouTube', handle: 'ZTF University', url: 'https://youtube.com/@ZTFUniversityInstitute', color: 'bg-red-600', Icon: YoutubeIcon, followers: '500+' },
  { platform: 'TikTok', handle: '@iuztf', url: 'https://tiktok.com/@iuztf', color: 'bg-black', Icon: TiktokIcon, followers: '1.2K+' },
  { platform: 'WhatsApp', handle: '(+237) 679 42 47 10', url: 'https://wa.me/237679424710', color: 'bg-green-600', Icon: MessageCircle as React.ComponentType<{ className?: string }>, followers: 'Direct' },
];

import React from 'react';

export default function MediaPage() {
  const locale = useLocale();

  return (
    <>
      {/* Hero */}
      <section className="relative pt-16 lg:pt-20">
        <div className="relative h-64 md:h-80 overflow-hidden">
          <Image src="/images/5.jpg" alt="Media Hub" fill className="object-cover" />
          <div className="absolute inset-0 bg-[#0A1628]/75" />
          <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-3xl md:text-5xl font-bold text-white font-heading mb-3">
              {locale === 'fr' ? 'Centre Médias IU-ZTF' : 'ZTF University Media Hub'}
            </h1>
            <p className="text-gray-300">
              {locale === 'fr' ? 'Vidéos, réseaux sociaux et actualités de l\'IU-ZTF' : 'Videos, social media and updates from ZTF University Institute'}
            </p>
          </div>
        </div>
      </section>

      {/* YouTube Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
              <YoutubeIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#0A1628] font-heading">
              {locale === 'fr' ? 'Nos Vidéos YouTube' : 'Our YouTube Videos'}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {VIDEO_PLACEHOLDERS.map((video, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="relative aspect-video bg-[#0A1628] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3 cursor-pointer hover:bg-red-700 transition">
                      <Play className="w-7 h-7 text-white ml-1" />
                    </div>
                    <p className="text-white font-semibold text-sm px-4">
                      {locale === 'fr' ? video.title_fr : video.title_en}
                    </p>
                  </div>
                  <div className="absolute top-3 right-3 bg-red-600 text-white text-xs px-2 py-1 rounded font-bold uppercase">{video.type}</div>
                </div>
                <div className="p-4">
                  <p className="font-semibold text-[#0A1628] text-sm">{locale === 'fr' ? video.title_fr : video.title_en}</p>
                  <p className="text-gray-400 text-xs mt-1">ZTF University Institute</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-gray-500 text-sm mb-4">
              {locale === 'fr'
                ? 'Abonnez-vous à notre chaîne YouTube pour les dernières vidéos'
                : 'Subscribe to our YouTube Channel for the latest videos'}
            </p>
            <a href="https://youtube.com/@ZTFUniversityInstitute" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-red-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-red-700 transition">
              <YoutubeIcon className="w-5 h-5 text-white" />
              {locale === 'fr' ? 'S\'abonner sur YouTube' : 'Subscribe on YouTube'}
            </a>
          </div>
        </div>
      </section>

      {/* TikTok Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <TiktokIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#0A1628] font-heading">TikTok</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {['Campus Tours', 'Student Life', 'Graduation Moments'].map(cat => (
              <div key={cat} className="bg-black rounded-2xl overflow-hidden h-64 flex items-center justify-center relative">
                <div className="text-center text-white p-4">
                  <TiktokIcon className="w-12 h-12 text-white mx-auto mb-3 opacity-60" />
                  <p className="font-semibold text-sm">{cat}</p>
                  <p className="text-gray-400 text-xs mt-1">@iuztf</p>
                </div>
                <div className="absolute bottom-3 right-3 bg-white/20 text-white text-xs px-2 py-1 rounded">TikTok</div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <a href="https://tiktok.com/@iuztf" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-black text-white font-bold px-8 py-3 rounded-xl hover:bg-gray-900 transition">
              {locale === 'fr' ? 'Nous Suivre sur TikTok' : 'Follow us on TikTok'} @iuztf
            </a>
          </div>
        </div>
      </section>

      {/* Social Media Hub */}
      <section className="py-16 bg-[#0A1628]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white font-heading mb-8 text-center">
            {locale === 'fr' ? 'Nos Réseaux Sociaux' : 'Social Media Hub'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {SOCIAL_LINKS.map(social => {
              const SocialIcon = social.Icon;
              return (
                <a key={social.platform} href={social.url} target="_blank" rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl p-5 text-center transition group">
                  <div className={`w-12 h-12 ${social.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <SocialIcon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-white font-bold text-sm">{social.platform}</p>
                  <p className="text-gray-400 text-xs mt-1">{social.handle}</p>
                  <p className="text-[#C9A84C] font-bold text-sm mt-2">{social.followers}</p>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery Link */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-xl font-bold text-[#0A1628] font-heading mb-4">
            {locale === 'fr' ? 'Voir Notre Galerie Complète' : 'View Our Full Gallery'}
          </h3>
          <Link href={`/${locale}/gallery`}
            className="inline-flex items-center gap-2 bg-[#0A1628] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition">
            {locale === 'fr' ? 'Voir la Galerie' : 'View Full Gallery'} <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
