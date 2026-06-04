import { createClient } from '@supabase/supabase-js';

const url = 'https://ecgmfwfmlvrdqnyvfcjl.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjZ21md2ZtbHZyZHFueXZmY2psIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDM5MzA3MywiZXhwIjoyMDk1OTY5MDczfQ.bDq-Av0tZwhGibPit9AJjJHWRrMRgSBBY5MyV0ae920';
const supabase = createClient(url, serviceKey);

async function seed() {
  // 1. Hero sections
  const heroes = [
    { page_key: 'home', title_en: 'ZTF University Institute', title_fr: 'Institut Universitaire ZTF', subtitle_en: 'Empowering World Innovators and Leaders for Global Impact', subtitle_fr: 'Former les Innovateurs et Leaders Mondiaux pour un Impact Global', background_image: '/images/1.jpg', overlay_opacity: 0.50, object_position: 'top', is_active: true },
    { page_key: 'about', title_en: 'About Us', title_fr: 'A Propos', subtitle_en: 'Our history, mission, and leadership', subtitle_fr: 'Notre histoire, notre mission et notre direction', background_image: '/images/2.jpg', overlay_opacity: 0.55, object_position: 'top', is_active: true },
    { page_key: 'schools', title_en: 'Our Schools & Higher Institutes', title_fr: 'Nos Ecoles & Instituts Superieurs', subtitle_en: '3 Higher Institutes - 7 Schools - 100+ Fields', subtitle_fr: '3 Instituts Superieurs - 7 Ecoles - 100+ Filieres', background_image: '/images/3.jpg', overlay_opacity: 0.55, object_position: 'top', is_active: true },
    { page_key: 'programs', title_en: 'Academic Programs', title_fr: 'Programmes Academiques', subtitle_en: 'Explore our complete range of degree programmes', subtitle_fr: 'Decouvrez notre gamme complete de programmes', background_image: '/images/4.jpg', overlay_opacity: 0.55, object_position: 'top', is_active: true },
    { page_key: 'faculty', title_en: 'Faculty & Staff', title_fr: 'Corps Enseignant & Personnel', subtitle_en: 'Meet our dedicated academic team', subtitle_fr: 'Rencontrez notre equipe academique dedicee', background_image: '/images/2.jpg', overlay_opacity: 0.55, object_position: 'top', is_active: true },
    { page_key: 'research', title_en: 'Research & Innovation', title_fr: 'Recherche & Innovation', subtitle_en: 'Advancing knowledge in Central Africa', subtitle_fr: 'Faire avancer la connaissance en Afrique Centrale', background_image: '/images/6.jpg', overlay_opacity: 0.55, object_position: 'top', is_active: true },
    { page_key: 'admission', title_en: 'Admissions 2026-2027', title_fr: 'Admissions 2026-2027', subtitle_en: 'Apply now - Applications are open!', subtitle_fr: 'Postulez maintenant - Dossiers ouverts!', background_image: '/images/3.jpg', overlay_opacity: 0.55, object_position: 'top', is_active: true },
    { page_key: 'media', title_en: 'Media Hub', title_fr: 'Centre Medias', subtitle_en: 'Videos, Photos & Social Media', subtitle_fr: 'Videos, Photos & Reseaux Sociaux', background_image: '/images/5.jpg', overlay_opacity: 0.55, object_position: 'top', is_active: true },
    { page_key: 'gallery', title_en: 'Media Gallery', title_fr: 'Galerie Medias', subtitle_en: 'Capturing the spirit of ZTF University Institute', subtitle_fr: 'L esprit de l Institut en images', background_image: '/images/5.jpg', overlay_opacity: 0.55, object_position: 'top', is_active: true },
    { page_key: 'blog', title_en: 'Blog & News', title_fr: 'Blog & Actualites', subtitle_en: 'Latest updates from ZTF University Institute', subtitle_fr: 'Les dernieres nouvelles de l IU-ZTF', background_image: '/images/4.jpg', overlay_opacity: 0.55, object_position: 'top', is_active: true },
    { page_key: 'contact', title_en: 'Contact Us', title_fr: 'Contactez-Nous', subtitle_en: 'Get in touch with ZTF University Institute', subtitle_fr: 'Prenez contact avec l Institut Universitaire ZTF', background_image: '/images/6.jpg', overlay_opacity: 0.55, object_position: 'top', is_active: true },
  ];
  const { error: heroErr } = await supabase.from('cms_hero_sections').upsert(heroes, { onConflict: 'page_key' });
  console.log('Heroes:', heroErr ? 'ERROR: ' + heroErr.message : 'OK - ' + heroes.length + ' rows');

  // 2. Institutes
  const institutes = [
    { code_en: 'HIACOMST', code_fr: 'ISASCOMT', name_en: 'Higher Institute of Agronomy, Communication Sciences and Technology', name_fr: 'Institut Superieur d Agronomie, des Sciences de la Communication et de Technologie', description_en: 'Focuses on agricultural innovation, cutting-edge technology, and professional communication.', description_fr: 'Axe sur l innovation agricole, la technologie de pointe et la communication professionnelle.', icon: '🌾', color_class: 'border-green-500', is_standalone: false, display_order: 1, is_active: true },
    { code_en: 'HILEPMAH', code_fr: 'ISMEDMAH', name_en: 'Higher Institute of Legal Professions, Management and Humanities', name_fr: 'Institut Superieur des Metiers du Droit, de Management et des Humanites', description_en: 'Trains legal professionals, business leaders, and social scientists.', description_fr: 'Forme les professionnels du droit, les chefs d entreprise et les scientifiques sociaux.', icon: '⚖️', color_class: 'border-blue-500', is_standalone: false, display_order: 2, is_active: true },
    { code_en: 'HIHS', code_fr: 'ISSS', name_en: 'Higher Institute of Health Sciences', name_fr: 'Institut Superieur des Sciences de la Sante', description_en: 'Dedicated to academic health education and medical research.', description_fr: 'Dedie a l enseignement academique de la sante et a la recherche medicale.', icon: '🏥', color_class: 'border-red-500', is_standalone: false, display_order: 3, is_active: true },
    { code_en: 'SHP', code_fr: 'EMS', name_en: 'School of Health Professions', name_fr: 'Ecole des Metiers de la Sante', description_en: 'Specialized professional school for hands-on health professions training.', description_fr: 'Ecole professionnelle specialisee pour la formation pratique aux metiers de la sante.', icon: '💊', color_class: 'border-teal-500', is_standalone: true, display_order: 4, is_active: true },
  ];
  const { data: existInst } = await supabase.from('cms_institutes').select('id').limit(1);
  if (!existInst || existInst.length === 0) {
    const { error: instErr } = await supabase.from('cms_institutes').insert(institutes);
    console.log('Institutes:', instErr ? 'ERROR: ' + instErr.message : 'OK - 4 rows');
  } else {
    // Update existing
    for (const inst of institutes) {
      await supabase.from('cms_institutes').update(inst).eq('code_en', inst.code_en);
    }
    console.log('Institutes: Updated existing 4 rows');
  }

  // 3. Site settings
  const settings = [
    { key: 'site_name_en', value: 'ZTF University Institute' },
    { key: 'site_name_fr', value: 'Institut Universitaire ZTF' },
    { key: 'announcement_enabled', value: 'true' },
    { key: 'announcement_text_en', value: 'Admissions for 2026-2027 are NOW OPEN - Apply Today!' },
    { key: 'announcement_text_fr', value: 'Les Admissions 2026-2027 sont OUVERTES - Postulez!' },
    { key: 'announcement_type', value: 'success' },
    { key: 'homepage_stats', value: '[{"label_en":"Higher Institutes","label_fr":"Instituts Superieurs","value":"3","icon":"🏛️"},{"label_en":"Students","label_fr":"Etudiants","value":"300+","icon":"👨‍🎓"},{"label_en":"Faculty Members","label_fr":"Enseignants","value":"100","icon":"👨‍🏫"},{"label_en":"Fields/Specialties","label_fr":"Filieres","value":"100+","icon":"📚"},{"label_en":"Schools","label_fr":"Ecoles","value":"7","icon":"🏫"},{"label_en":"Programmes","label_fr":"Programmes","value":"10+","icon":"📋"}]' },
    { key: 'news_count', value: '3' },
    { key: 'news_enabled', value: 'true' },
    { key: 'academic_year', value: '2026-2027' },
    { key: 'admissions_open', value: 'true' },
    { key: 'registration_fee', value: '35000' },
    { key: 'preregistration_fee', value: '35000' },
    { key: 'facebook_url', value: 'https://www.facebook.com/ztfuniversityinstitute' },
    { key: 'whatsapp_number', value: '237679424710' },
    { key: 'email_main', value: 'info@ztfuniversity.com' },
  ];
  const { error: settErr } = await supabase.from('cms_site_settings').upsert(settings, { onConflict: 'key' });
  console.log('Settings:', settErr ? 'ERROR: ' + settErr.message : 'OK - ' + settings.length + ' keys');

  // 4. Faculty
  const { data: existingFaculty } = await supabase.from('cms_faculty').select('id').limit(1);
  if (!existingFaculty || existingFaculty.length === 0) {
    const faculty = [
      { full_name: 'Pastor Theodore ANDOSEH', title: 'Pastor', role: 'president', department: 'ZTF Foundation', bio_en: 'Pastor Theodore Andoseh is the President and Promoter of ZTF University Institute, established in Bertoua, Cameroon in 2023.', bio_fr: 'Le Pasteur Theodore Andoseh est le President et Promoteur de l Institut Universitaire ZTF, fonde a Bertoua en 2023.', is_featured: true, is_active: true, display_order: 1 },
      { full_name: 'Prof. Dieudonnee NJAMEN', title: 'Prof.', role: 'rector', department: 'Chemistry, University of Yaounde I', bio_en: 'Professor Dieudonnee Njamen is the Rector of ZTF University Institute and Professor of Chemistry at the University of Yaounde I.', bio_fr: 'Le Professeur Dieudonnee Njamen est le Recteur de l Institut Universitaire ZTF et Professeur de Chimie a l Universite de Yaounde I.', is_featured: true, is_active: true, display_order: 2 },
      { full_name: 'Prof. Moise ADAMOU', title: 'Prof.', role: 'vice_rector', department: 'Applied Sciences', bio_en: 'Professor Moise Adamou serves as Vice-Rector of ZTF University Institute, overseeing academic programs and research.', bio_fr: 'Le Professeur Moise Adamou est Vice-Recteur de l Institut Universitaire ZTF, supervisant les programmes academiques.', is_featured: true, is_active: true, display_order: 3 },
    ];
    const { error: facErr } = await supabase.from('cms_faculty').insert(faculty);
    console.log('Faculty:', facErr ? 'ERROR: ' + facErr.message : 'OK - 3 rows');
  } else {
    console.log('Faculty: Already has data - skipped');
  }

  console.log('\nSeeding complete!');
}

seed().catch(e => console.error('Fatal:', e.message));
