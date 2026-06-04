export const dynamic = 'force-dynamic';


import Image from 'next/image';
import ContactForm from './ContactForm';
import MapWrapper from './MapWrapper';
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';

const PHONES = [
  '(+237) 679 42 47 10',
  '(+237) 691 45 96 11',
  '(+237) 690 35 53 29',
  '(+237) 699 99 31 47',
  '(+237) 651 58 85 86',
  '(+237) 690 50 63 04',
  '(+237) 672 18 72 59',
];

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <>
      {/* Hero */}
      <section className="relative pt-16 lg:pt-20">
        <div className="relative h-64 md:h-80 overflow-hidden">
          <Image src="/images/6.jpg" alt="Contact" fill className="object-cover" />
          <div className="absolute inset-0 bg-[#0A1628]/70" />
          <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-3xl md:text-5xl font-bold text-white font-heading mb-3">
              {locale === 'fr' ? 'Contactez-Nous' : 'Contact Us'}
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl">
              {locale === 'fr'
                ? 'Nous serions ravis de vous entendre — équipe à Bertoua, Cameroun'
                : 'We\'d love to hear from you — our team is in Bertoua, Cameroon'}
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Left: Form */}
            <div>
              <h2 className="text-2xl font-bold text-[#0A1628] font-heading mb-6">
                {locale === 'fr' ? 'Envoyer un Message' : 'Send Us a Message'}
              </h2>
              <ContactForm locale={locale} />
            </div>

            {/* Right: Info */}
            <div>
              <h2 className="text-2xl font-bold text-[#0A1628] font-heading mb-6">
                {locale === 'fr' ? 'Informations de Contact' : 'Contact Information'}
              </h2>

              <div className="space-y-5 mb-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-[#C9A84C]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#C9A84C]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0A1628] text-sm">{locale === 'fr' ? 'Adresse' : 'Address'}</p>
                    <p className="text-gray-500 text-sm mt-0.5">
                      Koumé – Bertoua, {locale === 'fr' ? 'Région de l\'Est, Cameroun' : 'East Region, Cameroon'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-[#C9A84C]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-[#C9A84C]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0A1628] text-sm">{locale === 'fr' ? 'Téléphone' : 'Phone'}</p>
                    <div className="mt-0.5 grid grid-cols-2 gap-x-4 gap-y-0.5">
                      {PHONES.map(p => (
                        <a key={p} href={`tel:${p.replace(/[\s()]/g, '')}`} className="text-gray-500 text-sm hover:text-[#C9A84C] transition">{p}</a>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-[#C9A84C]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#C9A84C]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0A1628] text-sm">Email</p>
                    <a href="mailto:info@ztfuniversity.com" className="text-gray-500 text-sm hover:text-[#C9A84C] transition block">info@ztfuniversity.com</a>
                    <a href="mailto:ztfuniversityinstitute@gmail.com" className="text-gray-500 text-sm hover:text-[#C9A84C] transition block">ztfuniversityinstitute@gmail.com</a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-[#C9A84C]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#C9A84C]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0A1628] text-sm">{locale === 'fr' ? 'Horaires' : 'Office Hours'}</p>
                    <p className="text-gray-500 text-sm mt-0.5">
                      {locale === 'fr' ? 'Lundi – Vendredi : 7h30 – 17h00' : 'Monday – Friday: 7:30 AM – 5:00 PM'}
                    </p>
                  </div>
                </div>
              </div>

              {/* WhatsApp */}
              <a href="https://wa.me/237679424710" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 bg-green-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-green-600 transition mb-8 w-fit">
                <MessageCircle className="w-5 h-5" />
                {locale === 'fr' ? 'Nous écrire sur WhatsApp' : 'WhatsApp Us'}
              </a>

              {/* Interactive Leaflet Map */}
              <div className="rounded-2xl overflow-hidden h-72 border border-gray-200 shadow-sm">
                <MapWrapper />
              </div>

              {/* Directions */}
              <div className="mt-6 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <h3 className="font-bold text-[#0A1628] font-heading mb-2">
                  {locale === 'fr' ? 'Comment Nous Rejoindre' : 'How to Reach Us'}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {locale === 'fr'
                    ? 'L\'Institut Universitaire ZTF est situé dans le quartier Koumé de Bertoua, Région de l\'Est, Cameroun. Depuis Yaoundé, prendre l\'axe national vers l\'est en direction de Bertoua (environ 350 km).'
                    : 'ZTF University Institute is located in the Koumé district of Bertoua, East Region, Cameroon. From Yaoundé, take the national highway east toward Bertoua (approx. 350 km).'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
