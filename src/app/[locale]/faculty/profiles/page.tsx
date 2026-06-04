export const dynamic = 'force-dynamic';


import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, BookOpen, Award, Microscope, Download } from 'lucide-react';

export default async function AcademicProfilesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isFr = locale === 'fr';

  const profiles = [
    {
      name: 'Prof. Dieudonnée NJAMEN',
      title_en: 'Rector, ZTF University Institute | Professor of Chemistry',
      title_fr: 'Recteur, Institut Universitaire ZTF | Professeur de Chimie',
      photo: '/images/Rector.png',
      qualifications: [
        'PhD in Organic Chemistry, University of Yaoundé I',
        'Post-doctoral research, France',
        'Supervised under Prof. Zacharias Tanee Fomum',
      ],
      specializations: ['Organic Chemistry', 'Medicinal Plants', 'Natural Products Chemistry'],
      research_en: 'Isolation and structural determination of bioactive compounds from Cameroonian medicinal plants. Member of the Department of Animal Biology and Physiology at the University of Yaoundé I.',
      research_fr: "Isolation et détermination structurale de composés bioactifs à partir de plantes médicinales camerounaises. Membre du Département de Biologie et Physiologie Animale de l'Université de Yaoundé I.",
      notable_en: 'Supervised under Prof. Zacharias Tanee Fomum at the University of Yaoundé I. Over 50 publications in international peer-reviewed journals.',
      notable_fr: "A travaillé sous la direction du Prof. Zacharias Tanee Fomum à l'Université de Yaoundé I. Plus de 50 publications dans des revues scientifiques internationales à comité de lecture.",
      publications: 50,
    },
    {
      name: 'Prof. Moïse ADAMOU',
      title_en: 'Vice-Rector, ZTF University Institute',
      title_fr: 'Vice-Recteur, Institut Universitaire ZTF',
      photo: '/images/Vice Rector.jpg',
      qualifications: ['PhD Applied Sciences', 'M.Sc. Applied Physics'],
      specializations: ['Applied Sciences', 'Physics', 'Academic Administration'],
      research_en: 'Applied sciences research with focus on physics applications in developing contexts across Central Africa.',
      research_fr: "Recherche en sciences appliquées avec un focus sur les applications de la physique dans les contextes en développement en Afrique Centrale.",
      notable_en: 'Over 20 years of academic and administrative experience in higher education in Cameroon.',
      notable_fr: "Plus de 20 ans d'expérience académique et administrative dans l'enseignement supérieur au Cameroun.",
      publications: 25,
    },
  ];

  return (
    <>
      <section className="relative pt-16 lg:pt-20">
        <div className="relative h-56 overflow-hidden">
          <Image src="/images/2.jpg" alt="Academic Profiles" fill className="object-cover" />
          <div className="absolute inset-0 bg-[#0A1628]/70" />
          <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white font-heading mb-2">
              {isFr ? 'Profils Académiques' : 'Academic Profiles'}
            </h1>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
          <Link href={`/${locale}`} className="hover:text-[#C9A84C] transition">{isFr ? 'Accueil' : 'Home'}</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/${locale}/faculty`} className="hover:text-[#C9A84C] transition">{isFr ? 'Corps Enseignant' : 'Faculty'}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#0A1628] font-semibold">{isFr ? 'Profils Académiques' : 'Academic Profiles'}</span>
        </div>
      </div>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {profiles.map(p => (
            <div key={p.name} className="bg-white rounded-3xl border-2 border-[#C9A84C]/20 shadow-lg overflow-hidden hover:border-[#C9A84C]/50 transition">
              <div className="bg-[#0A1628] p-8">
                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-[#C9A84C] flex-shrink-0">
                    <Image src={p.photo} alt={p.name} width={128} height={128} className="object-cover w-full h-full" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-2xl font-bold text-white font-heading">{p.name}</h2>
                    <p className="text-[#C9A84C] font-semibold mt-1">{isFr ? p.title_fr : p.title_en}</p>
                    <div className="flex items-center gap-2 mt-3 justify-center sm:justify-start">
                      <div className="bg-[#C9A84C]/10 text-[#C9A84C] text-sm font-bold px-4 py-1.5 rounded-full flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        {p.publications}+ {isFr ? 'Publications' : 'Publications'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-[#0A1628] font-heading mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#C9A84C]" />
                    {isFr ? 'Qualifications' : 'Qualifications'}
                  </h3>
                  <ul className="space-y-1.5">
                    {p.qualifications.map(q => (
                      <li key={q} className="text-sm text-gray-600 flex gap-2">
                        <span className="text-[#C9A84C]">•</span> {q}
                      </li>
                    ))}
                  </ul>

                  <h3 className="font-bold text-[#0A1628] font-heading mb-3 mt-6 flex items-center gap-2">
                    <Microscope className="w-4 h-4 text-[#C9A84C]" />
                    {isFr ? 'Spécialisations' : 'Specializations'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {p.specializations.map(s => (
                      <span key={s} className="bg-[#C9A84C]/10 text-[#A8893E] text-xs font-semibold px-3 py-1 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-[#0A1628] font-heading mb-3">
                    {isFr ? 'Recherche' : 'Research'}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-5">
                    {isFr ? p.research_fr : p.research_en}
                  </p>

                  <h3 className="font-bold text-[#0A1628] font-heading mb-3">
                    {isFr ? 'Points Notables' : 'Notable'}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-5">
                    {isFr ? p.notable_fr : p.notable_en}
                  </p>

                  <button className="inline-flex items-center gap-2 border border-[#0A1628] text-[#0A1628] text-sm font-semibold px-5 py-2 rounded-xl hover:bg-[#0A1628] hover:text-white transition opacity-60 cursor-not-allowed">
                    <Download className="w-4 h-4" />
                    {isFr ? 'Télécharger CV (À venir)' : 'Download CV (Coming soon)'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
