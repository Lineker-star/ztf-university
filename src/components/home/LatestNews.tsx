import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { Calendar, ArrowRight } from 'lucide-react';

const NEWS_POSTS = [
  {
    slug: 'ztf-graduation-ceremony-2025',
    title_en: 'ZTF University Marks Successful 2025 Graduation Ceremony',
    title_fr: 'L\'IU-ZTF Célèbre la Cérémonie de Remise de Diplômes 2025',
    excerpt_en: 'Over 100 graduates received their degrees and certificates at the annual ceremony in Bertoua.',
    excerpt_fr: 'Plus de 100 diplômés ont reçu leurs diplômes lors de la cérémonie annuelle à Bertoua.',
    image: '/images/1.jpg',
    date: '2025-07-15',
    category: 'University News',
    category_fr: 'Actualités',
  },
  {
    slug: 'admissions-open-2026-2027',
    title_en: 'Admissions Now Open for Academic Year 2026–2027',
    title_fr: 'Inscriptions Ouvertes pour l\'Année 2026–2027',
    excerpt_en: 'Apply now for all programmes across our 7 schools and 2 vocational training institutes.',
    excerpt_fr: 'Postulez maintenant pour tous nos programmes dans nos 7 écoles et instituts de formation.',
    image: '/images/4.jpg',
    date: '2026-03-01',
    category: 'Admissions',
    category_fr: 'Admissions',
  },
  {
    slug: 'iuztf-students-national-day-parade',
    title_en: 'IU-ZTF Students March at National Day Parade in Bertoua',
    title_fr: 'Les Étudiants Défilent à la Fête Nationale à Bertoua',
    excerpt_en: 'Proudly representing ZTF University Institute at the National Day celebrations.',
    excerpt_fr: 'Représentant fièrement l\'Institut Universitaire ZTF lors des célébrations de la Fête Nationale.',
    image: '/images/5.jpg',
    date: '2025-05-20',
    category: 'Student Life',
    category_fr: 'Vie Étudiante',
  },
];

export default function LatestNews() {
  const locale = useLocale();

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-[#0A1628] font-heading mb-2">
              {locale === 'fr' ? 'Actualités Récentes' : 'Latest News'}
            </h2>
            <div className="h-1 w-12 bg-[#C9A84C] rounded-full" />
          </div>
          <Link href={`/${locale}/blog`}
            className="flex items-center gap-1 text-[#C9A84C] font-semibold hover:gap-2 transition-all text-sm">
            {locale === 'fr' ? 'Voir Tout' : 'View All'} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {NEWS_POSTS.map(post => (
            <Link key={post.slug} href={`/${locale}/blog/${post.slug}`}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="relative h-48 overflow-hidden">
                <Image src={post.image} alt={post.title_en} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 100vw, 400px" />
                <div className="absolute top-3 left-3">
                  <span className="bg-[#C9A84C] text-[#0A1628] text-xs font-bold px-3 py-1 rounded-full">
                    {locale === 'fr' ? post.category_fr : post.category}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-[#0A1628] font-heading text-base mb-2 line-clamp-2 leading-snug group-hover:text-[#C9A84C] transition">
                  {locale === 'fr' ? post.title_fr : post.title_en}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                  {locale === 'fr' ? post.excerpt_fr : post.excerpt_en}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  {new Date(post.date).toLocaleDateString(locale)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
