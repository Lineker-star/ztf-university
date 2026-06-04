-- ============================================================
-- ZTF University Institute — Schema Migration 001
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Add missing columns to cms_research
ALTER TABLE public.cms_research
  ADD COLUMN IF NOT EXISTS journal_name TEXT,
  ADD COLUMN IF NOT EXISTS doi_url TEXT,
  ADD COLUMN IF NOT EXISTS published_date DATE;

-- 2. Add data/content columns to cms_page_content
ALTER TABLE public.cms_page_content
  ADD COLUMN IF NOT EXISTS data JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS content TEXT;

-- 3. Create cms_announcements table
CREATE TABLE IF NOT EXISTS public.cms_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL DEFAULT '',
  title_fr TEXT DEFAULT '',
  content_en TEXT DEFAULT '',
  content_fr TEXT DEFAULT '',
  type TEXT DEFAULT 'info' CHECK (type IN ('info','warning','success','urgent')),
  show_on_home BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create contact_messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT,
  subject TEXT DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  is_read BOOLEAN DEFAULT FALSE,
  reply_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create applications table
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_number TEXT UNIQUE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  whatsapp TEXT,
  date_of_birth TEXT,
  gender TEXT,
  nationality TEXT DEFAULT 'Cameroonian',
  address TEXT,
  previous_school TEXT,
  highest_qualification TEXT,
  program_applied TEXT NOT NULL DEFAULT '',
  school_applied TEXT NOT NULL DEFAULT '',
  study_mode TEXT DEFAULT 'full_time',
  academic_year TEXT DEFAULT '2026-2027',
  status TEXT DEFAULT 'pending',
  notes TEXT,
  photo_url TEXT,
  certificate_url TEXT,
  emergency_name TEXT,
  emergency_phone TEXT,
  emergency_relation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- 6. Enable Row Level Security on new tables
ALTER TABLE public.cms_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- 7. Grant access policies (allow anon for now — secure with auth later)
CREATE POLICY IF NOT EXISTS "anon_all_cms_announcements" ON public.cms_announcements
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "anon_all_contact_messages" ON public.contact_messages
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "anon_all_applications" ON public.applications
  FOR ALL USING (true) WITH CHECK (true);

-- 8. Seed cms_hero_sections with correct data
INSERT INTO public.cms_hero_sections
  (page_key, title_en, title_fr, subtitle_en, subtitle_fr,
   background_image, overlay_opacity, object_position, is_active)
VALUES
  ('home','ZTF University Institute','Institut Universitaire ZTF',
   'Empowering World Innovators and Leaders for Global Impact',
   'Former les Innovateurs et Leaders Mondiaux pour un Impact Global',
   '/images/1.jpg',0.50,'top',true),
  ('about','About Us','À Propos de Nous',
   'Learn about our history, mission, and leadership',
   'Découvrez notre histoire, notre mission et notre direction',
   '/images/2.jpg',0.55,'top',true),
  ('schools','Our Schools & Higher Institutes','Nos Écoles & Instituts Supérieurs',
   '3 Higher Institutes · 7 Schools · 100+ Fields',
   '3 Instituts Supérieurs · 7 Écoles · 100+ Filières',
   '/images/3.jpg',0.55,'top',true),
  ('programs','Academic Programs','Programmes Académiques',
   'Explore our complete range of degree programmes',
   'Découvrez notre gamme complète de programmes de diplômes',
   '/images/4.jpg',0.55,'top',true),
  ('faculty','Faculty & Staff','Corps Enseignant & Personnel',
   'Meet our dedicated academic team',
   'Rencontrez notre équipe académique dédiée',
   '/images/2.jpg',0.55,'top',true),
  ('research','Research & Innovation','Recherche & Innovation',
   'Advancing knowledge in Central Africa',
   'Faire avancer la connaissance en Afrique Centrale',
   '/images/6.jpg',0.55,'top',true),
  ('admission','Admissions 2026–2027','Admissions 2026–2027',
   'Apply for the academic year 2026-2027 — Applications Open',
   'Postulez pour l''année académique 2026-2027 — Dossiers ouverts',
   '/images/3.jpg',0.55,'top',true),
  ('media','Media Hub','Centre Médias',
   'Videos, Photos & Social Media',
   'Vidéos, Photos & Réseaux Sociaux',
   '/images/5.jpg',0.55,'top',true),
  ('gallery','Media Gallery','Galerie Médias',
   'Capturing the spirit of ZTF University Institute',
   'L''esprit de l''Institut Universitaire ZTF en images',
   '/images/5.jpg',0.55,'top',true),
  ('blog','Blog & News','Blog & Actualités',
   'Latest updates from ZTF University Institute',
   'Les dernières nouvelles de l''Institut Universitaire ZTF',
   '/images/4.jpg',0.55,'top',true),
  ('contact','Contact Us','Contactez-Nous',
   'Get in touch with ZTF University Institute',
   'Prenez contact avec l''Institut Universitaire ZTF',
   '/images/6.jpg',0.55,'top',true)
ON CONFLICT (page_key) DO UPDATE SET
  title_en = EXCLUDED.title_en,
  title_fr = EXCLUDED.title_fr,
  subtitle_en = EXCLUDED.subtitle_en,
  subtitle_fr = EXCLUDED.subtitle_fr,
  background_image = COALESCE(cms_hero_sections.background_image, EXCLUDED.background_image),
  overlay_opacity = COALESCE(cms_hero_sections.overlay_opacity, EXCLUDED.overlay_opacity),
  updated_at = NOW();

-- 9. Seed cms_institutes
INSERT INTO public.cms_institutes
  (code_en, code_fr, name_en, name_fr, description_en, description_fr,
   icon, color_class, is_standalone, display_order, is_active)
VALUES
  ('HIACOMST','ISASCOMT',
   'Higher Institute of Agronomy, Communication Sciences and Technology',
   'Institut Supérieur d''Agronomie, des Sciences de la Communication et de Technologie',
   'Focuses on agricultural innovation, cutting-edge technology, and professional communication.',
   'Axé sur l''innovation agricole, la technologie de pointe et la communication professionnelle.',
   '🌾','border-green-500',false,1,true),
  ('HILEPMAH','ISMEDMAH',
   'Higher Institute of Legal Professions, Management and Humanities',
   'Institut Supérieur des Métiers du Droit, de Management et des Humanités',
   'Trains legal professionals, business leaders, and social scientists.',
   'Forme les professionnels du droit, les chefs d''entreprise et les scientifiques sociaux.',
   '⚖️','border-blue-500',false,2,true),
  ('HIHS','ISSS',
   'Higher Institute of Health Sciences',
   'Institut Supérieur des Sciences de la Santé',
   'Dedicated to academic health education and medical research.',
   'Dédié à l''enseignement académique de la santé et à la recherche médicale.',
   '🏥','border-red-500',false,3,true),
  ('SHP','EMS',
   'School of Health Professions',
   'École des Métiers de la Santé',
   'Specialized professional school for hands-on health professions training.',
   'École professionnelle spécialisée pour la formation pratique aux métiers de la santé.',
   '💊','border-teal-500',true,4,true)
ON CONFLICT (code_en) DO UPDATE SET
  name_en = EXCLUDED.name_en, name_fr = EXCLUDED.name_fr,
  description_en = EXCLUDED.description_en, description_fr = EXCLUDED.description_fr,
  updated_at = NOW();

-- 10. Seed cms_site_settings with key data
INSERT INTO public.cms_site_settings (key, value, type, label, section)
VALUES
  ('site_name_en','ZTF University Institute','text','Site Name EN','general'),
  ('site_name_fr','Institut Universitaire ZTF','text','Site Name FR','general'),
  ('announcement_enabled','true','boolean','Announcement Enabled','home'),
  ('announcement_text_en','Admissions for 2026–2027 are NOW OPEN – Apply Today!','text','Announcement EN','home'),
  ('announcement_text_fr','Les Admissions 2026–2027 sont OUVERTES – Postulez dès aujourd''hui!','text','Announcement FR','home'),
  ('announcement_type','success','text','Announcement Type','home'),
  ('homepage_stats','[{"label_en":"Higher Institutes","label_fr":"Instituts Supérieurs","value":"3","icon":"🏛️"},{"label_en":"Students","label_fr":"Étudiants","value":"300+","icon":"👨‍🎓"},{"label_en":"Faculty Members","label_fr":"Enseignants","value":"100","icon":"👨‍🏫"},{"label_en":"Fields/Specialties","label_fr":"Filières","value":"100+","icon":"📚"},{"label_en":"Schools","label_fr":"Écoles","value":"7","icon":"🏫"},{"label_en":"Programmes","label_fr":"Programmes","value":"10+","icon":"📋"}]','json','Homepage Stats','home'),
  ('news_count','3','number','News Count','home'),
  ('news_enabled','true','boolean','News Enabled','home'),
  ('academic_year','2026-2027','text','Academic Year','academic'),
  ('admissions_open','true','boolean','Admissions Open','academic'),
  ('registration_fee','35000','number','Registration Fee XAF','academic'),
  ('preregistration_fee','35000','number','Pre-Registration Fee XAF','academic'),
  ('facebook_url','https://www.facebook.com/ztfuniversityinstitute','text','Facebook','social'),
  ('whatsapp_number','237679424710','text','WhatsApp','contact'),
  ('email_main','info@ztfuniversity.com','text','Main Email','contact')
ON CONFLICT (key) DO NOTHING;

-- 11. Seed faculty leadership
INSERT INTO public.cms_faculty
  (full_name, title, role, department, bio_en, bio_fr,
   is_featured, is_active, display_order)
VALUES
  ('Pastor Theodore ANDOSEH','Pastor','president','ZTF Foundation',
   'Pastor Theodore Andoseh is the President and Promoter of ZTF University Institute. Under his visionary leadership, ZTF University Institute was established in Bertoua, Cameroon in 2023.',
   'Le Pasteur Theodore Andoseh est le Président et Promoteur de l''Institut Universitaire ZTF. Sous sa direction visionnaire, l''IU-ZTF a été fondé à Bertoua en 2023.',
   true,true,1),
  ('Prof. Dieudonnée NJAMEN','Prof.','rector','Chemistry, University of Yaoundé I',
   'Professor Dieudonnée Njamen is the Rector of ZTF University Institute. A Professor of Chemistry at the University of Yaoundé I and a direct mentee of Prof. Zacharias Tanee Fomum.',
   'Le Professeur Dieudonnée Njamen est le Recteur de l''Institut Universitaire ZTF. Professeur de Chimie à l''Université de Yaoundé I.',
   true,true,2),
  ('Prof. Moïse ADAMOU','Prof.','vice_rector','Applied Sciences',
   'Professor Moïse Adamou serves as Vice-Rector of ZTF University Institute, overseeing academic programs and research activities.',
   'Le Professeur Moïse Adamou est Vice-Recteur de l''Institut Universitaire ZTF, supervisant les programmes académiques.',
   true,true,3)
ON CONFLICT DO NOTHING;

-- Done!
SELECT 'Migration 001 complete — all tables created/updated' AS result;
