'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, BookOpen } from 'lucide-react';
import HeroSlideshow from '@/components/home/HeroSlideshow';

export default function HeroSection() {
  const t = useTranslations('hero');
  const locale = useLocale();

  return (
    <HeroSlideshow overlayOpacity={0.72}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 text-center">
        {/* Admission Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 bg-[#C9A84C] text-[#0A1628] font-bold text-sm px-5 py-2 rounded-full mb-6"
        >
          <GraduationCap className="w-4 h-4" />
          {t('admission_open')}
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white font-heading mb-2 leading-tight"
        >
          {locale === 'fr' ? (
            <>INSTITUT UNIVERSITAIRE <span className="text-[#C9A84C]">ZTF</span></>
          ) : (
            <>ZTF UNIVERSITY <span className="text-[#C9A84C]">INSTITUTE</span></>
          )}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-[#C9A84C] font-semibold text-base mb-4"
        >
          {locale === 'fr' ? 'IU-ZTF — Bertoua, Cameroun' : 'ZTF-UI — Bertoua, Cameroon'}
        </motion.p>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl text-gray-100 mb-3 max-w-3xl mx-auto font-heading italic"
        >
          &ldquo;{t('tagline')}&rdquo;
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-300 mb-5 max-w-2xl mx-auto text-sm md:text-base"
        >
          {t('subtitle')}
        </motion.p>

        {/* Founder portrait between subtitle and quote */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.55 }}
          className="flex flex-col items-center mb-4"
        >
          <Image
            src="/images/Founder.jpeg"
            alt="Prof. Zacharias Tanee Fomum — Founder"
            width={90}
            height={90}
            className="rounded-full border-4 border-[#C9A84C] object-cover mb-2 shadow-lg"
          />
          <p className="text-[#C9A84C] text-xs font-semibold tracking-wide">
            {locale === 'fr'
              ? 'Prof. Zacharias Tanee Fomum — Inspiration Fondatrice'
              : 'Prof. Zacharias Tanee Fomum — Founding Inspiration'}
          </p>
        </motion.div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-6 max-w-2xl mx-auto p-4 border-l-4 border-[#C9A84C] bg-black/20 rounded-r-xl text-left"
        >
          <p className="text-gray-200 italic text-sm leading-relaxed">&ldquo;{t('quote')}&rdquo;</p>
          <p className="text-[#C9A84C] text-xs mt-2 font-semibold">{t('quote_author')}</p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href={`/${locale}/admission/apply`}
            className="inline-flex items-center justify-center gap-2 bg-[#C9A84C] text-[#0A1628] font-bold px-8 py-4 rounded-xl hover:bg-[#E8C96A] transition-all duration-200 text-base md:text-lg shadow-lg shadow-[#C9A84C]/20 w-full sm:w-auto"
          >
            <GraduationCap className="w-5 h-5" />
            {t('cta_apply')}
          </Link>
          <Link
            href={`/${locale}/schools`}
            className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition text-base md:text-lg w-full sm:w-auto"
          >
            <BookOpen className="w-5 h-5" />
            {t('cta_explore')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-12 flex justify-center"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-1">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full"
            />
          </div>
        </motion.div>
      </div>
    </HeroSlideshow>
  );
}
