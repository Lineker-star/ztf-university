'use client';
import nextDynamic from 'next/dynamic';

const BertoaMap = nextDynamic(() => import('@/components/contact/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[300px] bg-gray-100 rounded-2xl flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading map...</p>
    </div>
  ),
});

export default function MapWrapper() {
  return <BertoaMap />;
}
