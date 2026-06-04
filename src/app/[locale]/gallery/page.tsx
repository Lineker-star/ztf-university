export const dynamic = 'force-dynamic';


import Image from 'next/image';
import GalleryClient from './GalleryClient';

export default async function GalleryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <>
      {/* Hero */}
      <section className="relative pt-16 lg:pt-20">
        <div className="relative h-64 md:h-80 overflow-hidden">
          <Image src="/images/5.jpg" alt="Media Gallery" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-[#0A1628]/65" />
          <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-3xl md:text-5xl font-bold text-white font-heading mb-3">
              {locale === 'fr' ? 'Galerie Médias' : 'Media Gallery'}
            </h1>
            <p className="text-gray-300 text-base md:text-lg max-w-2xl">
              {locale === 'fr'
                ? "L'esprit de l'Institut Universitaire ZTF en images"
                : 'Capturing the spirit of ZTF University Institute'}
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <GalleryClient />
        </div>
      </section>
    </>
  );
}
