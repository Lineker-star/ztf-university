'use client';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Leaf, Heart, Cpu, Users, Radio, BarChart3, Smartphone, Database, Stethoscope, Scale } from 'lucide-react';

const RESEARCH_AREAS = [
  { icon: Leaf,     color: 'bg-green-50 text-green-600',  en: 'Agricultural Sciences & Biotechnology', fr: 'Sciences Agricoles & Biotechnologie',       desc_en: 'Tropical crop improvement, food security, sustainable farming for Central Africa', desc_fr: 'Amélioration des cultures tropicales, sécurité alimentaire, agriculture durable' },
  { icon: Heart,    color: 'bg-red-50 text-red-600',      en: 'Health Sciences & Medical Research',     fr: 'Sciences de la Santé & Recherche Médicale', desc_en: 'Tropical diseases, pharmaceutical research, community public health', desc_fr: 'Maladies tropicales, recherche pharmaceutique, santé publique communautaire' },
  { icon: Cpu,      color: 'bg-orange-50 text-orange-600', en: 'Engineering & Technology Innovation',   fr: 'Ingénierie & Innovation Technologique',     desc_en: 'Renewable energy, software systems, infrastructure development', desc_fr: 'Énergie renouvelable, systèmes logiciels, développement des infrastructures' },
  { icon: Scale,    color: 'bg-indigo-50 text-indigo-600', en: 'Social Sciences & Governance',          fr: 'Sciences Sociales & Gouvernance',           desc_en: 'African governance, conflict resolution, community development', desc_fr: 'Gouvernance africaine, résolution des conflits, développement communautaire' },
  { icon: Radio,    color: 'bg-purple-50 text-purple-600', en: 'Communication & Media Studies',         fr: 'Communication & Études Médiatiques',        desc_en: 'Digital media in Africa, journalism, cross-cultural communication', desc_fr: 'Médias numériques en Afrique, journalisme, communication interculturelle' },
  { icon: BarChart3,color: 'bg-teal-50 text-teal-600',    en: 'Economic Development',                   fr: 'Développement Économique',                  desc_en: 'African entrepreneurship, microfinance, development economics', desc_fr: 'Entrepreneuriat africain, microfinance, économie du développement' },
];

const INNOVATIONS = [
  { name: 'Hepatoprep', subtitle_en: 'Liver Protection Formula', subtitle_fr: 'Formule de Protection Hépatique', desc_en: 'Formulated for the management of hepatitis and liver disorders. Available in tablets, capsules, and suspensions. Derived from tropical medicinal plant research at the ZTF Research Center.', desc_fr: 'Formulé pour la prise en charge de l\'hépatite et des troubles hépatiques. Disponible en comprimés, gélules et suspensions.', badge: 'Available', href: 'https://wcscience.site/innovations/hepatoprep' },
  { name: 'Androprep', subtitle_en: "Men's Health Formula", subtitle_fr: 'Formule pour la Santé Masculine', desc_en: 'Addresses erectile dysfunction and male reproductive health. Developed from bioactive plant compounds identified through ZTF research.', desc_fr: 'Traite la dysfonction érectile et la santé reproductive masculine. Développé à partir de composés végétaux bioactifs.', badge: 'Available', href: 'https://wcscience.site/innovations/androprep' },
  { name: 'Menoprep', subtitle_en: 'Phytoestrogenic Formula for Women', subtitle_fr: 'Formule Phytœstrogénique pour Femmes', desc_en: 'Manages menopausal discomfort including hot flashes, mood changes, and hormonal imbalance. Based on Prof. Njamen\'s groundbreaking research on estrogenic medicinal plants.', desc_fr: 'Gère l\'inconfort ménopausique y compris les bouffées de chaleur et le déséquilibre hormonal.', badge: 'Available', href: 'https://wcscience.site/innovations/menoprep' },
  { name: 'Tumoprep', subtitle_en: 'Cancer Chemopreventive Formula', subtitle_fr: 'Formule Chimiopréventive Anticancéreuse', desc_en: 'Targets hormone-dependent cancers including breast and prostate cancer. Under active investigation at the ZTF Research Center.', desc_fr: 'Cible les cancers hormono-dépendants dont le cancer du sein et de la prostate. Sous investigation active.', badge: 'Available', href: 'https://wcscience.site/innovations/tumoprep' },
  { name: 'Gastroprep', subtitle_en: 'Gastric Protection Formula', subtitle_fr: 'Formule de Protection Gastrique', desc_en: 'Manages gastritis and gastric ulcers. Derived from Cameroonian medicinal plants with proven gastroprotective activity.', desc_fr: 'Gère la gastrite et les ulcères gastriques. Dérivé de plantes médicinales camerounaises à activité gastroprotectrice prouvée.', badge: 'Available', href: 'https://wcscience.site/innovations/gastroprep' },
  { name: 'Anti-Vitiligo Ointment', subtitle_en: 'Topical Depigmentation Treatment', subtitle_fr: 'Traitement Topique de Dépigmentation', desc_en: 'Topical ointment for the management of vitiligo. Formulated from natural plant extracts researched at the ZTF Research Center.', desc_fr: 'Pommade topique pour la prise en charge du vitiligo. Formulée à partir d\'extraits végétaux naturels.', badge: 'Available', href: 'https://wcscience.site/innovations/anti-vitiligo-ointment' },
];

const INNOVATION_PROJECTS = [
  { icon: Smartphone, color: 'bg-green-50 text-green-600', title_en: 'Digital Agriculture Platform', title_fr: 'Plateforme Numérique d\'Agriculture', status: 'In Development', status_fr: 'En Développement', team_en: 'Agronomy & Engineering', team_fr: 'Agronomie & Ingénierie', desc_en: 'A mobile-first platform connecting Cameroonian farmers with markets, weather data, and agronomic advice.', desc_fr: 'Plateforme mobile connectant les agriculteurs camerounais avec les marchés et les conseils agronomiques.', statusColor: 'bg-yellow-100 text-yellow-700' },
  { icon: Database, color: 'bg-purple-50 text-purple-600', title_en: 'Tropical Medicinal Plants Database', title_fr: 'Base de Données des Plantes Médicinales', status: 'Active', status_fr: 'Actif', team_en: 'Health Sciences & HIHS', team_fr: 'Sciences de la Santé & ISSS', desc_en: 'Documenting 200+ plant species from the East Region of Cameroon.', desc_fr: 'Documentation de plus de 200 espèces végétales de la Région de l\'Est.', statusColor: 'bg-green-100 text-green-700' },
  { icon: Stethoscope, color: 'bg-red-50 text-red-600', title_en: 'ZTF Community Health Initiative', title_fr: 'Initiative de Santé Communautaire ZTF', status: 'Active', status_fr: 'Actif', team_en: 'SHP / EMS', team_fr: 'EMS', desc_en: 'Free community health screenings in Bertoua and surrounding villages.', desc_fr: 'Dépistages gratuits à Bertoua et dans les villages environnants.', statusColor: 'bg-green-100 text-green-700' },
  { icon: Scale, color: 'bg-indigo-50 text-indigo-600', title_en: 'East Cameroon Legal Aid Clinic', title_fr: 'Clinique d\'Aide Juridique de l\'Est', status: 'Active', status_fr: 'Actif', team_en: 'School of Legal Professions', team_fr: 'École des Métiers du Droit', desc_en: 'Pro-bono legal assistance to underserved communities in the East Region.', desc_fr: 'Assistance juridique bénévole aux communautés défavorisées de la Région de l\'Est.', statusColor: 'bg-green-100 text-green-700' },
];

export default function ResearchPageClient({ locale }: { locale: string }) {
  const isFr = locale === 'fr';

  return (
    <>
      {/* HERO */}
      <section className="relative pt-16 lg:pt-20">
        <div className="relative h-72 md:h-80 overflow-hidden">
          <Image src="/images/2.jpg" alt="Research & Innovation" fill className="object-cover object-top" priority />
          <div className="absolute inset-0 bg-[#0A1628]/60" />
          <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-3xl md:text-5xl font-bold text-white font-heading mb-2">
              {isFr ? 'Recherche & Innovation' : 'Research & Innovation'}
            </h1>
            <p className="text-[#C9A84C] font-semibold text-sm md:text-base">
              {isFr ? 'Faire avancer la connaissance en Afrique Centrale' : 'Advancing Knowledge in Central Africa'}
            </p>
          </div>
        </div>
      </section>

      {/* WCS PARTNERSHIP BANNER */}
      <section className="py-12 bg-[#C9A84C]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#0A1628]/70 mb-2">
            {isFr ? 'Partenariat Académique' : 'Academic Partnership'}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-[#0A1628] font-heading mb-4">
            {isFr ? 'En partenariat avec World Conquest Science (WCS)' : 'In Partnership with World Conquest Science (WCS)'}
          </h2>
          <p className="text-[#0A1628]/80 text-sm md:text-base leading-relaxed mb-6 max-w-3xl mx-auto">
            {isFr
              ? "L'Institut Universitaire ZTF est affilié académiquement à World Conquest Science — une organisation de recherche scientifique fondée dans l'héritage du Prof. Zacharias Tanee Fomum. WCS fait progresser la recherche scientifique en utilisant les plantes médicinales tropicales du Cameroun pour développer des médicaments naturels pour le monde."
              : "ZTF University Institute is academically affiliated with World Conquest Science — a scientific research organisation founded in the legacy of Prof. Zacharias Tanee Fomum. WCS advances scientific research using tropical medicinal plants of Cameroon to develop natural medicines for the world."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://wcscience.site" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#0A1628] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#162845] transition text-sm">
              {isFr ? 'Visiter le site WCS' : 'Visit WCS Website'} <ExternalLink className="w-4 h-4" />
            </a>
            <a href="https://wcscience.site/innovations" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border-2 border-[#0A1628] text-[#0A1628] font-bold px-6 py-3 rounded-xl hover:bg-[#0A1628]/10 transition text-sm">
              {isFr ? 'Voir toutes les Innovations' : 'View All Innovations'} <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ZTF RESEARCH CENTER */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-[#C9A84C]/10 text-[#A8893E] text-xs font-bold px-4 py-1 rounded-full mb-4 uppercase tracking-wider">
                Koumé, Bertoua, Cameroon
              </div>
              <h2 className="text-3xl font-bold text-[#0A1628] font-heading mb-4">
                {isFr ? 'Centre de Recherche ZTF' : 'ZTF Research Center'}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                {isFr
                  ? "Le Centre de Recherche ZTF, situé à Koumé, Bertoua, est le centre de recherche scientifique de la Fondation ZTF. Sous la direction du Prof. Dieudonnée Njamen — un disciple direct du Prof. Zacharias Tanee Fomum — le centre se concentre sur l'isolement et la caractérisation des composés bioactifs des plantes médicinales camerounaises."
                  : "The ZTF Research Center, located in Koumé, Bertoua, Cameroon, is the scientific research hub of the ZTF Foundation. Under the direction of Prof. Dieudonnée Njamen — a direct mentee of Prof. Zacharias Tanee Fomum — the center focuses on the isolation and characterization of bioactive compounds from Cameroonian medicinal plants."}
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: '🌿', en: 'Phytochemistry & Natural Products', fr: 'Phytochimie & Produits Naturels' },
                  { icon: '💊', en: 'Drug Development from Medicinal Plants', fr: 'Développement de Médicaments' },
                  { icon: '🔬', en: 'Bioactive Compound Isolation', fr: "Isolement de Composés Bioactifs" },
                  { icon: '🦠', en: 'Tropical Disease Research', fr: 'Recherche sur les Maladies Tropicales' },
                ].map(item => (
                  <div key={item.en} className="bg-gray-50 rounded-xl p-4 text-sm">
                    <span className="text-xl block mb-1">{item.icon}</span>
                    <span className="font-semibold text-[#0A1628] text-xs">{isFr ? item.fr : item.en}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#0A1628] rounded-2xl p-8 text-white">
              <h3 className="text-xl font-bold font-heading text-[#C9A84C] mb-4">
                {isFr ? "L'Héritage du Fondateur" : "Founder's Research Legacy"}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                {isFr
                  ? "Prof. Zacharias Tanee Fomum (1945–2009) a supervisé plus de 100 thèses de doctorat et co-signé plus de 160 publications dans des revues scientifiques internationales. En 2004, son département de chimie a été classé 2e parmi tous les centres de recherche africains."
                  : "Prof. Zacharias Tanee Fomum (1945–2009) supervised over 100 doctoral theses and co-authored 160+ publications in leading international scientific journals. In 2004, his chemistry department ranked 2nd among all African scientific research centres."}
              </p>
              <div className="grid grid-cols-3 gap-3 mt-4">
                {[{ v: '160+', l: isFr ? 'Publications' : 'Publications' }, { v: '100+', l: isFr ? 'Thèses' : 'Theses' }, { v: '2nd', l: isFr ? 'Afrique' : 'In Africa' }].map(s => (
                  <div key={s.v} className="bg-white/10 rounded-xl p-3 text-center">
                    <div className="text-[#C9A84C] font-bold text-lg font-heading">{s.v}</div>
                    <div className="text-gray-400 text-xs">{s.l}</div>
                  </div>
                ))}
              </div>
              <blockquote className="border-l-4 border-[#C9A84C] pl-4 italic text-gray-300 text-sm mt-5">
                &ldquo;God deserves nothing but the best from His children.&rdquo;
                <footer className="text-[#C9A84C] text-xs mt-1 not-italic">— Prof. Z. T. Fomum</footer>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* WCS INNOVATIONS / PRODUCTS */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#0A1628] font-heading mb-2">
              {isFr ? 'Produits de Recherche & Innovations' : 'Research Products & Innovations'}
            </h2>
            <p className="text-gray-500 text-sm max-w-2xl mx-auto">
              {isFr
                ? 'Médicaments et composés développés à partir de la recherche scientifique du Centre de Recherche ZTF'
                : 'Medicines and compounds developed from scientific research at the ZTF Research Center'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {INNOVATIONS.map(prod => (
              <div key={prod.name} className="bg-white rounded-2xl border-l-4 border-[#C9A84C] shadow-sm hover:shadow-lg transition-all p-5 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-[#0A1628] font-heading text-xl">{prod.name}</h3>
                  <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
                    {isFr ? 'Disponible' : prod.badge}
                  </span>
                </div>
                <p className="text-[#C9A84C] font-semibold text-sm mb-3">
                  {isFr ? prod.subtitle_fr : prod.subtitle_en}
                </p>
                <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-4">
                  {isFr ? prod.desc_fr : prod.desc_en}
                </p>
                <a href={prod.href} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#0A1628] font-bold text-sm hover:text-[#C9A84C] transition mt-auto">
                  {isFr ? 'En savoir plus' : 'Learn More'} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>

          <div className="text-center">
            <a href="https://wcscience.site/innovations" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#0A1628] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition">
              {isFr ? 'Voir toutes les Innovations WCS' : 'View All WCS Innovations'} <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* RESEARCH AREAS */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#0A1628] font-heading mb-8 text-center">
            {isFr ? 'Domaines de Recherche' : 'Research Areas'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {RESEARCH_AREAS.map(area => {
              const Icon = area.icon;
              return (
                <div key={area.en} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                  <div className={`w-12 h-12 ${area.color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-[#0A1628] font-heading mb-2">{isFr ? area.fr : area.en}</h3>
                  <p className="text-gray-500 text-sm">{isFr ? area.desc_fr : area.desc_en}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* INNOVATION PROJECTS */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#0A1628] font-heading mb-8 text-center">
            {isFr ? "Projets d'Innovation" : 'Innovation Projects'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {INNOVATION_PROJECTS.map(proj => {
              const Icon = proj.icon;
              return (
                <div key={proj.title_en} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-4">
                  <div className={`w-12 h-12 ${proj.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap gap-2 mb-1">
                      <h3 className="font-bold text-[#0A1628] font-heading text-sm">{isFr ? proj.title_fr : proj.title_en}</h3>
                    </div>
                    <div className="flex gap-2 mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${proj.statusColor}`}>{isFr ? proj.status_fr : proj.status}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{isFr ? proj.team_fr : proj.team_en}</span>
                    </div>
                    <p className="text-gray-500 text-sm">{isFr ? proj.desc_fr : proj.desc_en}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* COLLABORATE CTA */}
      <section className="py-16 bg-[#0A1628]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white font-heading mb-4">
            {isFr ? 'Collaborez avec Nous' : 'Collaborate with Us'}
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            {isFr
              ? "Vous êtes chercheur, institution ou organisation souhaitant collaborer avec l'Institut Universitaire ZTF ou World Conquest Science?"
              : "Are you a researcher, institution, or organization interested in collaborating with ZTF University Institute or World Conquest Science?"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/${locale}/contact`}
              className="inline-flex items-center gap-2 bg-[#C9A84C] text-[#0A1628] font-bold px-8 py-3 rounded-xl hover:bg-[#E8C96A] transition">
              {isFr ? 'Nous Contacter' : 'Contact Us'}
            </Link>
            <a href="https://wcscience.site" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-white/30 text-white font-bold px-8 py-3 rounded-xl hover:bg-white/10 transition">
              {isFr ? 'Rejoindre WCS' : 'Join WCS'} <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
