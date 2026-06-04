'use client';
import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const GALLERY_IMAGES = [
  {
    src: '/images/1.jpg',
    category: 'graduation',
    title_en: 'Graduation Awards Ceremony 2024',
    title_fr: 'Cérémonie de Remise de Prix 2024',
    desc_en: 'Award recipients at the annual ZTF University Institute graduation ceremony',
    desc_fr: "Lauréats lors de la cérémonie annuelle de remise de prix de l'IU-ZTF",
  },
  {
    src: '/images/2.jpg',
    category: 'graduation',
    title_en: 'Graduating Class — Hall Ceremony',
    title_fr: 'Promotion — Cérémonie en Salle',
    desc_en: 'Graduates in the official ZTF navy blue and gold gowns during the hall ceremony',
    desc_fr: "Diplômés en toges bleu marine et or de l'IU-ZTF lors de la cérémonie officielle",
  },
  {
    src: '/images/3.jpg',
    category: 'graduation',
    title_en: 'Outdoor Graduation Celebration',
    title_fr: 'Célébration Extérieure de Remise de Diplômes',
    desc_en: 'Students celebrate their graduation outdoors with blue and gold balloons',
    desc_fr: "Les étudiants célèbrent leur remise de diplômes en extérieur avec des ballons bleu et or",
  },
  {
    src: '/images/4.jpg',
    category: 'students',
    title_en: 'IU-ZTF at National Day Parade — Bertoua',
    title_fr: "L'IU-ZTF au Défilé de la Fête Nationale — Bertoua",
    desc_en: 'IU-ZTF students proudly representing their university at the Cameroonian National Day parade in Bertoua',
    desc_fr: "Les étudiants de l'IU-ZTF représentant fièrement leur université au défilé de la fête nationale à Bertoua",
  },
  {
    src: '/images/5.jpg',
    category: 'students',
    title_en: 'IU-ZTF Students with the Cameroonian Flag',
    title_fr: 'Étudiants IU-ZTF avec le Drapeau du Cameroun',
    desc_en: 'IU-ZTF students in their university blue polo shirts, proudly holding the Cameroonian flag',
    desc_fr: "Étudiants de l'IU-ZTF en polos bleus universitaires, tenant fièrement le drapeau du Cameroun",
  },
  {
    src: '/images/6.jpg',
    category: 'students',
    title_en: 'University Student March — Bertoua',
    title_fr: 'Marche des Étudiants — Bertoua',
    desc_en: 'ZTF University Institute students marching through the streets of Bertoua during a national celebration',
    desc_fr: "Les étudiants de l'Institut Universitaire ZTF défilant dans les rues de Bertoua lors d'une célébration nationale",
  },
];

const CATEGORIES = ['all', 'graduation', 'students', 'events', 'campus', 'faculty'] as const;
type Category = typeof CATEGORIES[number];

const CAT_LABELS: Record<Category, { en: string; fr: string }> = {
  all: { en: 'All', fr: 'Tout' },
  graduation: { en: 'Graduation', fr: 'Remise de Diplômes' },
  students: { en: 'Students', fr: 'Étudiants' },
  events: { en: 'Events', fr: 'Événements' },
  campus: { en: 'Campus', fr: 'Campus' },
  faculty: { en: 'Faculty', fr: 'Enseignants' },
};

export default function GalleryClient() {
  const locale = useLocale();
  const isFr = locale === 'fr';
  const [filter, setFilter] = useState<Category>('all');
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = filter === 'all' ? GALLERY_IMAGES : GALLERY_IMAGES.filter(img => img.category === filter);

  const openLightbox = (idx: number) => setLightbox(idx);
  const closeLightbox = () => setLightbox(null);

  const prev = useCallback(() => {
    setLightbox(l => l !== null ? Math.max(0, l - 1) : null);
  }, []);

  const next = useCallback(() => {
    setLightbox(l => l !== null ? Math.min(filtered.length - 1, l + 1) : null);
  }, [filtered.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (lightbox === null) return;
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') closeLightbox();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [lightbox, prev, next]);

  const currentImg = lightbox !== null ? filtered[lightbox] : null;

  return (
    <>
      {/* Filter Tabs — horizontally scrollable on mobile */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map(cat => {
          const count = cat === 'all' ? GALLERY_IMAGES.length : GALLERY_IMAGES.filter(i => i.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                filter === cat
                  ? 'bg-[#0A1628] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {isFr ? CAT_LABELS[cat].fr : CAT_LABELS[cat].en}
              {count > 0 && <span className="ml-1.5 text-xs opacity-60">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Grid Gallery with motion layout */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.map((img, i) => (
            <motion.div
              key={img.src}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-xl transition-shadow"
              onClick={() => openLightbox(i)}
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={img.src}
                  alt={isFr ? img.title_fr : img.title_en}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWjNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABAMC/8QAHBAAAQQDAQAAAAAAAAAAAAAAAQACAxExITP/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AiWFiG5sJCkLxsASv0pf4pHfJuqlb1K0a3dMWL5P/2Q=="
                />
                {/* Hover overlay with title */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <p className="text-white font-bold text-sm leading-tight">
                    {isFr ? img.title_fr : img.title_en}
                  </p>
                  <p className="text-gray-300 text-xs mt-1 line-clamp-1">
                    {isFr ? img.desc_fr : img.desc_en}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p>{isFr ? 'Aucune image dans cette catégorie.' : 'No images in this category yet.'}</p>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && currentImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4"
            onClick={closeLightbox}
          >
            {/* Close */}
            <button
              className="absolute top-4 right-4 text-white hover:text-[#C9A84C] transition z-10 bg-black/40 rounded-full p-2"
              onClick={closeLightbox}
            >
              <X className="w-7 h-7" />
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-4 text-white text-sm bg-black/40 px-3 py-1 rounded-full">
              {lightbox + 1} {isFr ? 'sur' : 'of'} {filtered.length}
            </div>

            {/* Prev arrow */}
            <button
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 text-white hover:text-[#C9A84C] transition z-10 bg-black/40 rounded-full p-2"
              onClick={e => { e.stopPropagation(); prev(); }}
              disabled={lightbox === 0}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            {/* Next arrow */}
            <button
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 text-white hover:text-[#C9A84C] transition z-10 bg-black/40 rounded-full p-2"
              onClick={e => { e.stopPropagation(); next(); }}
              disabled={lightbox === filtered.length - 1}
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* Image */}
            <motion.div
              key={lightbox}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-5xl w-full max-h-[75vh] flex flex-col items-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative w-full" style={{ maxHeight: '70vh' }}>
                <Image
                  src={currentImg.src}
                  alt={isFr ? currentImg.title_fr : currentImg.title_en}
                  width={1200}
                  height={800}
                  className="object-contain w-full rounded-xl"
                  style={{ maxHeight: '70vh' }}
                />
              </div>
              <div className="mt-4 text-center">
                <p className="text-white font-bold text-base">{isFr ? currentImg.title_fr : currentImg.title_en}</p>
                <p className="text-gray-400 text-sm mt-1">{isFr ? currentImg.desc_fr : currentImg.desc_en}</p>
              </div>
            </motion.div>

            {/* Keyboard hint */}
            <p className="absolute bottom-4 text-gray-500 text-xs">
              {isFr ? 'Utilisez ← → pour naviguer, Echap pour fermer' : 'Use ← → to navigate, Esc to close'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
