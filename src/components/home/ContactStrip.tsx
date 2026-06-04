import { useTranslations } from 'next-intl';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function ContactStrip() {
  const t = useTranslations('contact');

  return (
    <section className="py-12 bg-[#0A1628] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-white">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-[#C9A84C]/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-[#C9A84C]" />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Location</div>
              <div className="text-sm">{t('address')}</div>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-[#C9A84C]/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-[#C9A84C]" />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Phone</div>
              <div className="text-sm">(+237) 679 42 47 10</div>
              <div className="text-sm">691 45 96 11</div>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-[#C9A84C]/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-[#C9A84C]" />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Email</div>
              <div className="text-sm">{t('email')}</div>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-[#C9A84C]/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-[#C9A84C]" />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Office Hours</div>
              <div className="text-sm">{t('hours')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
