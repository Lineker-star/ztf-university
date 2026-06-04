import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A1628] flex flex-col items-center justify-center text-center p-8">
      <Image src="/images/logo.png" alt="ZTF University Institute" width={100} height={100} className="object-contain mb-8 opacity-80" />
      <h1 className="text-8xl font-bold text-[#C9A84C] font-heading mb-4">404</h1>
      <h2 className="text-2xl font-bold text-white font-heading mb-3">Page Not Found</h2>
      <p className="text-gray-400 mb-8 max-w-md">
        The page you are looking for does not exist or has been moved. Let us guide you back.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/en" className="bg-[#C9A84C] text-[#0A1628] font-bold px-8 py-3 rounded-xl hover:bg-[#E8C96A] transition">
          Go Home
        </Link>
        <Link href="/en/contact" className="border border-white/30 text-white font-bold px-8 py-3 rounded-xl hover:bg-white/10 transition">
          Contact Us
        </Link>
      </div>
    </div>
  );
}
