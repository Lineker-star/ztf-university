'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const SLIDES = [
  {
    src: '/images/campus1.png',
    alt: 'ZTF University Institute Campus — Administration Block',
    position: 'center',
  },
  {
    src: '/images/campus2.png',
    alt: 'ZTF University Institute Campus — Students Studying',
    position: 'center',
  },
  {
    src: '/images/students-group.jpeg',
    alt: 'ZTF University Institute — Opening Ceremony Students',
    position: 'top',
  },
  {
    src: '/images/1.jpg',
    alt: 'ZTF University Institute — Graduation Ceremony',
    position: 'top',
  },
];

export default function HeroSlideshow({
  children,
  overlayOpacity = 0.75,
}: {
  children: React.ReactNode;
  overlayOpacity?: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Images */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          >
            <Image
              src={SLIDES[currentIndex].src}
              alt={SLIDES[currentIndex].alt}
              fill
              className={`object-cover object-${SLIDES[currentIndex].position} hero-slide-active`}
              priority
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Dark overlay */}
        <div
          className="absolute inset-0 z-10"
          style={{ backgroundColor: `rgba(10,22,40,${overlayOpacity})` }}
        />

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0A1628]/80 via-transparent to-[#0A1628]/20" />
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex
                ? 'w-8 h-2 bg-[#C9A84C]'
                : 'w-2 h-2 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-20 w-full">
        {children}
      </div>
    </section>
  );
}
