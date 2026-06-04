import { z } from 'zod';

export const applicationSchema = z.object({
  first_name: z.string().min(2, 'First name is required'),
  last_name: z.string().min(2, 'Last name is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  nationality: z.string().min(2, 'Nationality is required'),
  national_id: z.string().optional(),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(8, 'Phone number is required'),
  whatsapp: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
  city: z.string().optional(),
  country: z.string().optional(),
  previous_school: z.string().min(2, 'Previous school is required'),
  highest_qualification: z.string().min(2, 'Qualification is required'),
  gpa: z.string().optional(),
  program_applied: z.string().min(2, 'Program is required'),
  school_applied: z.string().min(2, 'School is required'),
  study_mode: z.enum(['on-campus', 'online', 'hybrid']),
  academic_year: z.string().default('2026-2027'),
  emergency_name: z.string().min(2, 'Emergency contact name is required'),
  emergency_phone: z.string().min(8, 'Emergency contact phone is required'),
  emergency_relation: z.string().min(2, 'Emergency contact relation is required'),
  agreed_to_terms: z.literal(true, 'You must agree to the terms and conditions'),
  agreed_to_privacy: z.literal(true, 'You must agree to the privacy policy'),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;

export const STEP_FIELDS: Record<number, (keyof ApplicationFormData)[]> = {
  0: ['first_name', 'last_name', 'date_of_birth', 'gender', 'nationality'],
  1: ['email', 'phone', 'address'],
  2: ['previous_school', 'highest_qualification'],
  3: ['program_applied', 'school_applied', 'study_mode'],
  4: ['emergency_name', 'emergency_phone', 'emergency_relation'],
  5: ['agreed_to_terms', 'agreed_to_privacy'],
};

export const SCHOOLS = [
  'School of Agricultural Sciences & Biotechnology',
  'School of Communication',
  'School of Engineering & Applied Technology',
  'School of Health Sciences',
  'School of Economics, Finance & Business Management',
  'School of Law & Political Sciences',
  'School of Humanities & Applied Social Sciences',
  'ZTF VTI for Sustainable Development',
  'ZTF VTI for Human Sciences',
];

export const PROGRAMS: Record<string, string[]> = {
  'School of Agricultural Sciences & Biotechnology': ['Agricultural Sciences & Biotechnology'],
  'School of Communication': ['Communication Studies'],
  'School of Engineering & Applied Technology': ['Engineering & Applied Technology'],
  'School of Health Sciences': ['Health Sciences'],
  'School of Economics, Finance & Business Management': ['Economics, Finance & Business Management', 'Online Business Management'],
  'School of Law & Political Sciences': ['Law & Political Sciences'],
  'School of Humanities & Applied Social Sciences': ['Humanities & Applied Social Sciences'],
  'ZTF VTI for Sustainable Development': ['Certificate in Sustainable Agriculture', 'Certificate in IT & Applied Technology'],
  'ZTF VTI for Human Sciences': ['Certificate in Health Sciences', 'Certificate in Applied Economic Sciences'],
};
