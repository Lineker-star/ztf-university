'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { createClientClient } from '@/lib/supabase/client';

interface HeroRow {
  page_key: string;
  title_en: string | null;
  title_fr: string | null;
  subtitle_en: string | null;
  subtitle_fr: string | null;
  background_image: string | null;
  overlay_opacity: number | null;
  object_position: string | null;
  enable_slideshow: boolean | null;
  slideshow_images: { url: string; duration: number }[] | null;
  slideshow_effect: string | null;
  slideshow_interval_ms: number | null;
  is_active: boolean | null;
}

interface DynamicHeroProps {
  pageKey: string;
  locale?: string;
  fallbackImage?: string;
  fallbackTitle?: string;
  fallbackSubtitle?: string;
  className?: string;
}

export default function DynamicHero({
  pageKey,
  locale = 'en',
  fallbackImage = '/images/1.jpg',
  fallbackTitle = '',
  fallbackSubtitle = '',
  className = 'relative h-64 md:h-80 flex items-center justify-center overflow-hidden',
}: DynamicHeroProps) {
  const [hero, setHero] = useState<HeroRow | null>(null);
  const [slideshowIndex, setSlideshowIndex] = useState(0);

  useEffect(() => {
    const supabase = createClientClient();

    const load = async () => {
      const { data } = await supabase
        .from('cms_hero_sections')
        .select('*')
        .eq('page_key', pageKey)
        .maybeSingle();
      if (data) setHero(data as HeroRow);
    };
    load();

    // Real-time subscription
    const channel = supabase
      .channel(`hero-${pageKey}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'cms_hero_sections', filter: `page_key=eq.${pageKey}` },
        (payload) => { setHero(payload.new as HeroRow); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [pageKey]);

  // Slideshow cycling
  useEffect(() => {
    if (!hero?.enable_slideshow || !hero.slideshow_images?.length) return;
    const interval = hero.slideshow_interval_ms || 5000;
    const timer = setInterval(() => {
      setSlideshowIndex(i => (i + 1) % (hero.slideshow_images?.length || 1));
    }, interval);
    return () => clearInterval(timer);
  }, [hero]);

  const slides = hero?.slideshow_images || [];
  const hasSlideshow = hero?.enable_slideshow && slides.length > 0;
  const bgImage = hasSlideshow ? (slides[slideshowIndex]?.url || fallbackImage) : (hero?.background_image || fallbackImage);
  const opacity = hero?.overlay_opacity ?? 0.5;
  const position = hero?.object_position || 'top';
  const title = locale === 'fr' ? (hero?.title_fr || fallbackTitle) : (hero?.title_en || fallbackTitle);
  const subtitle = locale === 'fr' ? hero?.subtitle_fr : hero?.subtitle_en;

  return (
    <section className={className}>
      <div className="absolute inset-0">
        <Image
          src={bgImage}
          alt={title || 'ZTF University'}
          fill
          className={`object-cover object-${position}`}
          priority
        />
        <div
          className="absolute inset-0 bg-[#0A1628]"
          style={{ opacity }}
        />
      </div>
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {title && (
          <h1 className="text-3xl md:text-5xl font-heading text-white font-bold mb-3 drop-shadow-lg">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-[#C9A84C] text-lg md:text-xl drop-shadow font-semibold">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
