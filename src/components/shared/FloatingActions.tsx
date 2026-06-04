'use client';
import { useState, useEffect } from 'react';
import { MessageCircle, ArrowUp } from 'lucide-react';

export default function FloatingActions() {
  const [showTop, setShowTop] = useState(false);
  const [showCookie, setShowCookie] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);

    // Show cookie banner if not already accepted/declined
    if (!localStorage.getItem('ztf-cookie-consent')) {
      setTimeout(() => setShowCookie(true), 2000);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleCookie = (accept: boolean) => {
    localStorage.setItem('ztf-cookie-consent', accept ? 'accepted' : 'declined');
    setShowCookie(false);
  };

  return (
    <>
      {/* WhatsApp floating button */}
      <a
        href="https://wa.me/237679424710"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-green-500 rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 transition animate-[pulse_2s_ease-in-out_infinite]"
        aria-label="WhatsApp"
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </a>

      {/* Back to top */}
      {showTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 z-40 w-12 h-12 bg-[#0A1628] border border-[#C9A84C]/50 rounded-full shadow-lg flex items-center justify-center hover:bg-[#C9A84C] hover:text-[#0A1628] transition text-white"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Cookie Consent Banner */}
      {showCookie && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A1628] border-t border-[#C9A84C]/30 p-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-300 text-sm">
              We use cookies to improve your experience on ZTF University Institute website.{' '}
              <span className="text-gray-400">Your data is handled in accordance with our privacy policy.</span>
            </p>
            <div className="flex gap-3 flex-shrink-0">
              <button onClick={() => handleCookie(true)}
                className="px-5 py-2 bg-[#C9A84C] text-[#0A1628] font-bold rounded-lg text-sm hover:bg-[#E8C96A] transition">
                Accept
              </button>
              <button onClick={() => handleCookie(false)}
                className="px-5 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 transition">
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
