export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: 'student' | 'staff' | 'admin' | 'faculty';
  avatar_url: string | null;
  created_at: string;
};

export type Application = {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  nationality: string;
  national_id: string | null;
  photo_url: string | null;
  email: string;
  phone: string;
  whatsapp: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  previous_school: string | null;
  highest_qualification: string | null;
  gpa: number | null;
  certificate_url: string | null;
  transcript_url: string | null;
  program_applied: string;
  school_applied: string;
  study_mode: 'on-campus' | 'online' | 'hybrid';
  academic_year: string;
  emergency_name: string | null;
  emergency_phone: string | null;
  emergency_relation: string | null;
  status: 'pending' | 'under_review' | 'accepted' | 'rejected' | 'waitlisted' | 'enrolled';
  application_number: string | null;
  assigned_to: string | null;
  notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  agreed_to_terms: boolean;
  agreed_to_privacy: boolean;
  created_at: string;
  updated_at: string;
};

export type Program = {
  id: string;
  name_en: string;
  name_fr: string | null;
  name_es: string | null;
  name_de: string | null;
  name_pt: string | null;
  name_zh: string | null;
  name_ar: string | null;
  name_ko: string | null;
  name_nl: string | null;
  name_ru: string | null;
  school: string;
  level: 'certificate' | 'diploma' | 'bachelor' | 'master' | 'phd' | 'vocational';
  duration_years: number | null;
  description_en: string | null;
  description_fr: string | null;
  tuition_xaf: number | null;
  is_online: boolean;
  is_active: boolean;
  created_at: string;
};

export type Faculty = {
  id: string;
  full_name: string;
  title: string | null;
  department: string | null;
  school: string | null;
  bio_en: string | null;
  bio_fr: string | null;
  qualifications: string[] | null;
  specializations: string[] | null;
  photo_url: string | null;
  email: string | null;
  publications_count: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
};

export type Research = {
  id: string;
  title_en: string;
  title_fr: string | null;
  abstract_en: string | null;
  abstract_fr: string | null;
  authors: string[] | null;
  faculty_id: string | null;
  school: string | null;
  category: string | null;
  publication_date: string | null;
  journal: string | null;
  doi: string | null;
  pdf_url: string | null;
  is_featured: boolean;
  created_at: string;
};

export type BlogPost = {
  id: string;
  title_en: string;
  title_fr: string | null;
  title_es: string | null;
  content_en: string | null;
  content_fr: string | null;
  content_es: string | null;
  excerpt_en: string | null;
  excerpt_fr: string | null;
  cover_image: string | null;
  author_id: string | null;
  author_name: string | null;
  category: string | null;
  tags: string[] | null;
  slug: string;
  is_published: boolean;
  published_at: string | null;
  views: number;
  created_at: string;
};

export type GalleryItem = {
  id: string;
  title_en: string | null;
  title_fr: string | null;
  image_url: string;
  category: 'campus' | 'students' | 'events' | 'labs' | 'classrooms' | 'graduation' | 'sports' | 'other';
  taken_at: string | null;
  is_featured: boolean;
  display_order: number;
  created_at: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  phone: string | null;
  is_read: boolean;
  replied_at: string | null;
  created_at: string;
};

export type Announcement = {
  id: string;
  title_en: string;
  title_fr: string | null;
  content_en: string | null;
  content_fr: string | null;
  type: 'info' | 'warning' | 'success' | 'urgent';
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
};
