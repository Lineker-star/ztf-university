export const dynamic = 'force-dynamic';
import Image from 'next/image';
import { Star, Heart, Lightbulb, Users, Globe, Shield, Award, BookOpen, FlaskConical } from 'lucide-react';

const VALUES = [
  { icon: Star, en: 'Excellence', fr: 'Excellence' },
  { icon: Heart, en: 'Faith & Integrity', fr: 'Foi & Intégrité' },
  { icon: Lightbulb, en: 'Innovation', fr: 'Innovation' },
  { icon: Users, en: 'Service', fr: 'Service' },
  { icon: Globe, en: 'Community', fr: 'Communauté' },
  { icon: Shield, en: 'Perseverance', fr: 'Persévérance' },
];

const TIMELINE = [
  { year: '1945', en: 'Prof. ZTF born in Cameroon on June 20', fr: 'Naissance du Prof. ZTF au Cameroun le 20 juin' },
  { year: '1969', en: 'First-Class B.Sc. — Fourah Bay College, Sierra Leone', fr: 'B.Sc. mention Très Bien — Fourah Bay College, Sierra Leone' },
  { year: '1973', en: 'Ph.D. in Organic Chemistry — University of Makerere, Uganda (age 28)', fr: 'Doctorat en Chimie Organique — Université de Makerere, Ouganda (28 ans)' },
  { year: '1975', en: 'Joins University of Yaoundé I as Professor of Organic Chemistry', fr: 'Rejoint l\'Université de Yaoundé I comme Professeur de Chimie Organique' },
  { year: '2004', en: 'Chemistry Dept. ranked 2nd among all African research centres', fr: 'Département de Chimie classé 2e parmi les centres de recherche africains' },
  { year: '2005', en: 'Doctor of Science (D.Sc.) — University of Durham, Great Britain', fr: 'Docteur ès Sciences (D.Sc.) — Université de Durham, Grande-Bretagne' },
  { year: '2009', en: 'Prof. ZTF passes away on March 14 — a world-changing legacy', fr: 'Le Prof. ZTF s\'éteint le 14 mars — un héritage qui change le monde' },
  { year: '2023', en: 'ZTF University Institute founded in Bertoua, Cameroon', fr: 'Fondation de l\'Institut Universitaire ZTF à Bertoua, Cameroun' },
];

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isFr = locale === 'fr';

  const uniName = isFr ? 'Institut Universitaire ZTF (IU-ZTF)' : 'ZTF University Institute (ZTF-UI)';

  return (
    <>
      {/* Hero */}
      <section className="relative pt-16 lg:pt-20">
        <div className="relative h-64 md:h-80 overflow-hidden">
          <Image src="/images/2.jpg" alt={uniName} fill className="object-cover" />
          <div className="absolute inset-0 bg-[#0A1628]/70" />
          <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-3xl md:text-5xl font-bold text-white font-heading mb-3">{uniName}</h1>
            <p className="text-gray-300 text-base md:text-lg max-w-2xl">
              {isFr ? 'Une université chrétienne à intégration de foi à Bertoua, Cameroun' : 'A faith-integrated Christian university in Bertoua, Cameroon'}
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#0A1628] text-white rounded-2xl p-8">
              <div className="w-12 h-12 bg-[#C9A84C] rounded-xl flex items-center justify-center mb-5">
                <Star className="w-6 h-6 text-[#0A1628]" />
              </div>
              <h2 className="text-2xl font-bold font-heading text-[#C9A84C] mb-3">{isFr ? 'Notre Mission' : 'Our Mission'}</h2>
              <p className="text-gray-300 leading-relaxed">
                {isFr
                  ? 'Offrir une éducation académiquement excellente et intégrée à la foi, qui habilite les étudiants à devenir des leaders innovants au service de Dieu, de l\'Afrique et du monde.'
                  : 'To provide faith-integrated, academically excellent education that empowers students to become innovative leaders who serve God, Africa, and the world.'}
              </p>
            </div>
            <div className="bg-[#C9A84C] rounded-2xl p-8">
              <div className="w-12 h-12 bg-[#0A1628] rounded-xl flex items-center justify-center mb-5">
                <Globe className="w-6 h-6 text-[#C9A84C]" />
              </div>
              <h2 className="text-2xl font-bold font-heading text-[#0A1628] mb-3">{isFr ? 'Notre Vision' : 'Our Vision'}</h2>
              <p className="text-[#0A1628]/80 leading-relaxed">
                {isFr
                  ? 'Être la principale université chrétienne d\'Afrique Centrale, formant des diplômés qui allient valeurs bibliques, excellence professionnelle et engagement au service.'
                  : 'To be the leading Christian university in Central Africa, producing graduates who combine biblical values, professional excellence, and a heart for service.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* University Structure */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#0A1628] font-heading mb-8 text-center">
            {isFr ? 'Structure de l\'Université' : 'University Structure'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { num: '3', en: 'Higher Institutes', fr: 'Instituts Supérieurs' },
              { num: '7', en: 'Schools', fr: 'Écoles' },
              { num: '2', en: 'Vocational Institutes', fr: 'IFP' },
              { num: '25+', en: 'Fields of Study', fr: 'Filières' },
              { num: '100+', en: 'Specializations', fr: 'Spécialisations' },
              { num: '✓', en: 'Online Learning', fr: 'Formation à Distance' },
            ].map(item => (
              <div key={item.en} className="text-center bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="text-3xl font-bold text-[#C9A84C] font-heading">{item.num}</div>
                <div className="text-xs text-gray-500 mt-1">{isFr ? item.fr : item.en}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#0A1628] font-heading mb-8 text-center">
            {isFr ? 'Nos Valeurs Fondamentales' : 'Our Core Values'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
            {VALUES.map(v => {
              const Icon = v.icon;
              return (
                <div key={v.en} className="text-center p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                  <div className="w-12 h-12 bg-[#C9A84C]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-[#C9A84C]" />
                  </div>
                  <p className="font-bold text-[#0A1628] text-sm font-heading">{isFr ? v.fr : v.en}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* LEADERSHIP SECTION — President FIRST */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#0A1628] font-heading mb-12 text-center">
            {isFr ? 'Direction & Leadership' : 'Leadership'}
          </h2>

          {/* TIER 1 — President & Promoter (most prominent) */}
          <div className="mb-10">
            <div className="bg-gradient-to-r from-[#0A1628] to-[#162845] rounded-3xl p-8 border-2 border-[#C9A84C] shadow-xl max-w-3xl mx-auto hover:-translate-y-1 transition-transform">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-[#C9A84C] shadow-lg">
                    <Image
                      src="/images/President & Promoter.png"
                      alt="Pastor Theodore ANDOSEH"
                      width={144}
                      height={144}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="inline-block bg-[#C9A84C] text-[#0A1628] text-xs font-bold px-4 py-1 rounded-full mb-3 uppercase tracking-wider">
                    {isFr ? 'Président & Promoteur' : 'President & Promoter'}
                  </div>
                  <h3 className="text-2xl font-bold text-white font-heading">Pastor Theodore ANDOSEH</h3>
                  <p className="text-[#C9A84C] font-semibold mb-3">
                    {isFr ? 'Président de la Fondation ZTF' : 'President, ZTF Foundation'}
                  </p>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {isFr
                      ? 'Le Pasteur Theodore Andoseh est le Président et Promoteur de l\'Institut Universitaire ZTF et Président de la Fondation ZTF. Sous sa direction visionnaire, l\'IU-ZTF a été fondé à Bertoua, Cameroun en 2023, perpétuant l\'héritage du Prof. Zacharias Tanee Fomum dans l\'enseignement supérieur.'
                      : 'Pastor Theodore Andoseh is the President and Promoter of ZTF University Institute and President of the ZTF Foundation. Under his visionary leadership, ZTF University Institute was established in Bertoua, Cameroon in 2023, carrying forward the legacy of Prof. Zacharias Tanee Fomum into higher education.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* TIER 2 — Rector & Vice-Rector */}
          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Rector */}
            <div className="bg-white rounded-2xl p-7 border border-gray-200 shadow-sm hover:-translate-y-1 transition-transform text-center">
              <div className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-4 border-3 border-[#C9A84C] shadow-md">
                <Image
                  src="/images/Rector.png"
                  alt="Prof. Dieudonnée NJAMEN"
                  width={112}
                  height={112}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="inline-block bg-[#0A1628] text-white text-xs font-bold px-3 py-1 rounded-full mb-2">
                {isFr ? 'Recteur' : 'Rector / Vice-Chancellor'}
              </div>
              <h3 className="font-bold text-[#0A1628] font-heading text-lg">Prof. Dieudonnée NJAMEN</h3>
              <p className="text-gray-500 text-sm mt-1">
                {isFr ? 'Chimie, Université de Yaoundé I' : 'Chemistry, University of Yaoundé I'}
              </p>
            </div>

            {/* Vice-Rector */}
            <div className="bg-white rounded-2xl p-7 border border-gray-200 shadow-sm hover:-translate-y-1 transition-transform text-center">
              <div className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-4 border-3 border-[#C9A84C] shadow-md">
                <Image
                  src="/images/Vice Rector.jpg"
                  alt="Prof. Moïse ADAMOU"
                  width={112}
                  height={112}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="inline-block bg-[#0A1628] text-white text-xs font-bold px-3 py-1 rounded-full mb-2">
                {isFr ? 'Vice-Recteur' : 'Vice-Rector / DVC'}
              </div>
              <h3 className="font-bold text-[#0A1628] font-heading text-lg">Prof. Moïse ADAMOU</h3>
              <p className="text-gray-500 text-sm mt-1">{isFr ? 'Sciences Appliquées' : 'Applied Sciences'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Deep Dive */}
      <section className="py-20 bg-[#0A1628]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white font-heading mb-2 text-center">
            {isFr ? 'Notre Fondateur' : 'Our Founder'}
          </h2>
          <p className="text-gray-400 text-center mb-12">Prof. Zacharias Tanee Fomum — 1945–2009</p>

          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <div className="flex flex-col sm:flex-row gap-6 mb-8">
                <div className="w-40 h-48 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-[#C9A84C] mx-auto sm:mx-0">
                  <Image src="/images/Founder.jpeg" alt="Prof. ZTF" width={160} height={192} className="object-cover w-full h-full" />
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {isFr
                    ? 'Le Professeur Zacharias Tanee Fomum (1945–2009) était l\'un des plus grands esprits académiques et leaders spirituels d\'Afrique. Il a obtenu un B.Sc. mention très bien à Fourah Bay College (1969), un doctorat en chimie organique à l\'Université de Makerere, Ouganda (à l\'âge de 28 ans), et un Doctorat ès Sciences de l\'Université de Durham, Grande-Bretagne (2005). En tant que Professeur de Chimie Organique à l\'Université de Yaoundé I, il a supervisé plus de 100 thèses et co-signé plus de 160 publications dans les principales revues scientifiques internationales.'
                    : 'Professor Zacharias Tanee Fomum (1945–2009) was one of Africa\'s greatest academic minds and spiritual leaders. He earned a first-class B.Sc. from Fourah Bay College (1969), a Ph.D. in Organic Chemistry from the University of Makerere, Uganda (at age 28), and a Doctor of Science from Durham University, Great Britain (2005). As Professor of Organic Chemistry at the University of Yaoundé I, he supervised over 100 doctoral and master\'s theses and co-authored more than 160 publications in top international journals.'}
                </p>
              </div>

              <h3 className="text-xl font-bold text-[#C9A84C] mb-5 font-heading">
                {isFr ? 'Chronologie Académique' : 'Academic Timeline'}
              </h3>
              <div className="space-y-3">
                {TIMELINE.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-14 text-[#C9A84C] font-bold text-sm flex-shrink-0">{item.year}</div>
                    <div className="flex-1 border-l-2 border-white/10 pl-4 pb-3">
                      <p className="text-gray-300 text-sm">{isFr ? item.fr : item.en}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {[
                { icon: Award, value: 'D.Sc.', en: 'Doctor of Science', fr: 'Docteur ès Sciences', sub: 'University of Durham, UK — 2005' },
                { icon: BookOpen, value: '160+', en: 'Scientific Publications', fr: 'Publications Scientifiques', sub: 'Leading international journals' },
                { icon: Users, value: '100+', en: 'Theses Supervised', fr: 'Thèses Supervisées', sub: "Master's and Doctoral students" },
                { icon: Globe, value: '350+', en: 'Books Authored', fr: 'Livres Écrits', sub: '10M+ copies in 100+ languages' },
                { icon: FlaskConical, value: '2nd', en: 'African Research Ranking', fr: 'Classement Recherche Afrique', sub: 'Chemistry publications — 2004' },
              ].map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.value} className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4">
                    <div className="w-10 h-10 bg-[#C9A84C]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-[#C9A84C]" />
                    </div>
                    <div>
                      <div className="text-[#C9A84C] font-bold text-xl font-heading">{s.value}</div>
                      <div className="text-white font-semibold text-sm">{isFr ? s.fr : s.en}</div>
                      <div className="text-gray-500 text-xs">{s.sub}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* History */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-[#0A1628] font-heading mb-6">
            {isFr ? 'Notre Histoire' : 'Our History'}
          </h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            {isFr
              ? 'L\'Institut Universitaire ZTF a été créé en 2023 à Bertoua, au Cameroun — la terre même où le Prof. ZTF a vécu et servi. Bâtie sur l\'héritage d\'un homme qui croyait que l\'éducation était un acte d\'obéissance à Dieu, l\'IU-ZTF cherche à former la prochaine génération de chercheurs, professionnels et leaders africains qui transformeront le continent et le monde.'
              : 'ZTF University Institute was established in 2023 in Bertoua, Cameroon — the very land where Prof. ZTF lived and served. Built on the legacy of a man who believed education was an act of obedience to God, ZTF-UI seeks to raise the next generation of African scholars, professionals, and leaders who will transform the continent and the world.'}
          </p>
        </div>
      </section>

      {/* Campus Map */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#0A1628] font-heading mb-8 text-center">
            {isFr ? 'Notre Campus — Koumé, Bertoua' : 'Our Campus — Koumé, Bertoua'}
          </h2>
          <div className="rounded-2xl overflow-hidden shadow-xl h-80 border border-gray-200">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127658.0!2d13.679!3d4.579!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1063a3f30843e8f3%3A0xc60ceadfa3b0e6e0!2sBertoua%2C%20Cameroon!5e0!3m2!1sen!2scm!4v1700000000000!5m2!1sen!2scm"
              width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </>
  );
}
