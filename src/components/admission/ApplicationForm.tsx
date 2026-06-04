'use client';
import { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { applicationSchema, STEP_FIELDS, type ApplicationFormData } from '@/types/application';
import { createClientClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Upload, Printer, Home, Search } from 'lucide-react';
import Link from 'next/link';

const STEPS_KEYS = ['personal', 'contact', 'academic', 'program', 'emergency', 'review'] as const;

const SCHOOLS_WITH_PROGRAMS: Record<string, string[]> = {
  'HIACOMST — Higher Institute of Agronomy, Communication Sciences and Technology': [
    'Agronomy and Biotechnology (BSc/HND)',
    'Forestry & Wildlife Management (BSc)',
    'Food Science & Biotechnology (BSc)',
    'Software Engineering (BSc/HND)',
    'Cyber Security (BSc)',
    'Cloud Computing (BSc)',
    'Electrical & Electronic Engineering (BSc)',
    'Civil & Architectural Engineering (BSc)',
    'Mechanical Engineering (BSc)',
    'Networks & Telecommunication (BSc)',
    'Journalism & Mass Communication (BSc/HND)',
    'Corporate Communication (BSc)',
    'Translation & Interpretation (BSc)',
    'Strategic Leadership (BSc)',
  ],
  'HILEPMAH — Higher Institute of Legal Professions, Management and Humanities': [
    'Business & Corporate Law (BSc)',
    'Human Rights & Social Justice (BSc)',
    'International Relations (BSc)',
    'Public Administration (BSc)',
    'Applied Economics (BSc)',
    'Accountancy (BSc/HND)',
    'Banking & Finance (BSc)',
    'Business Management (BSc/HND)',
    'Entrepreneurship (BSc)',
    'Logistics & Transport (BSc)',
    'Applied Linguistics (BSc)',
    'Human Resource Management (BSc)',
    'Sociology (BSc)',
    'Psychology (BSc)',
    'Education & Pedagogy (BSc)',
  ],
  'HIHS — Higher Institute of Health Sciences': [
    'Nursing Sciences (BSc)',
    'Medical Laboratory Analysis (BSc)',
    'Physiotherapy (BSc)',
    'Pharmaceutical Sciences (BSc)',
    'Public Health (BSc)',
    'Dentistry & Stomatology (BSc)',
    'Midwifery (BSc)',
  ],
  'SHP — School of Health Professions': [
    'Nursing / Infirmerie (HND)',
    'Midwifery / Sage-femme (HND)',
    'Medical Lab Technician (HND)',
    'Pharmacy Technician (HND)',
    'Physiotherapy Assistant (HND)',
    'Dental Nursing (HND)',
    'Operating Theatre Technician (HND)',
    'Radiology Technician (HND)',
    'Public Health Inspector (HND)',
  ],
  'IFPDD — Vocational Training Institute for Sustainable Development': [
    'Agropastoral Advisory (Certificate)',
    'Plant Production (Certificate)',
    'Animal Production (Certificate)',
    'Computer Maintenance & Networking (Certificate)',
    'Web & App Development (Certificate)',
    'Graphics Design (Certificate)',
    'Electrical Wiring (Certificate)',
    'Auto-Mechanics (Certificate)',
    'Film Production (Certificate)',
  ],
  'IFPSH — Vocational Training Institute for Human Sciences': [
    'Paramedic (Certificate)',
    'Physiotherapy Assistant (Certificate)',
    'Pharmacy Technician (Certificate)',
    'Banking & Insurance (Certificate)',
    'Computerized Accounting (Certificate)',
    'Hotel Management & Gastronomy (Certificate)',
    'Tourism (Certificate)',
  ],
};

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

const ic = (hasError: boolean) =>
  `w-full border ${hasError ? 'border-red-400' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none transition`;

function ApplicationFormInner() {
  const locale = useLocale();
  const isFr = locale === 'fr';
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ number: string; name: string; program: string; school: string; email: string } | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);

  const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      study_mode: 'on-campus' as const,
      academic_year: '2026-2027',
      program_applied: searchParams?.get('program') || '',
      school_applied: searchParams?.get('school') || '',
      city: 'Bertoua',
      country: 'Cameroon',
    },
  });

  const watchSchool = watch('school_applied');
  const watchEmail = watch('email');
  const watchFirst = watch('first_name');
  const watchLast = watch('last_name');
  const watchProgram = watch('program_applied');

  const availablePrograms = watchSchool ? (SCHOOLS_WITH_PROGRAMS[watchSchool] || []) : [];

  const nextStep = async () => {
    const fields = STEP_FIELDS[step] || [];
    const valid = await trigger(fields as Parameters<typeof trigger>[0]);
    if (valid) setStep(s => s + 1);
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    try {
      const supabase = createClientClient();
      const { data } = await supabase.storage
        .from('application-documents')
        .upload(`applications/${Date.now()}_${file.name}`, file);
      return data?.path || '';
    } catch {
      return '';
    }
  };

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    try {
      const supabase = createClientClient();

      const [photoUrl, certUrl, idUrl] = await Promise.all([
        photoFile ? uploadFile(photoFile, 'photos') : Promise.resolve(''),
        certFile ? uploadFile(certFile, 'certificates') : Promise.resolve(''),
        idFile ? uploadFile(idFile, 'ids') : Promise.resolve(''),
      ]);

      const { data: app, error } = await supabase
        .from('applications')
        .insert({
          first_name: data.first_name,
          last_name: data.last_name,
          date_of_birth: data.date_of_birth,
          gender: data.gender,
          nationality: data.nationality,
          email: data.email,
          phone: data.phone,
          whatsapp: data.whatsapp || data.phone,
          address: data.address,
          city: data.city || 'Bertoua',
          country: data.country || 'Cameroon',
          previous_school: data.previous_school,
          highest_qualification: data.highest_qualification,
          program_applied: data.program_applied,
          school_applied: data.school_applied,
          study_mode: data.study_mode || 'on-campus',
          academic_year: '2026-2027',
          emergency_name: data.emergency_name,
          emergency_phone: data.emergency_phone,
          emergency_relation: data.emergency_relation,
          agreed_to_terms: data.agreed_to_terms,
          agreed_to_privacy: data.agreed_to_privacy,
          status: 'pending',
          photo_url: photoUrl,
          certificate_url: certUrl,
          national_id: idUrl,
        })
        .select('application_number')
        .single();

      if (error) throw error;

      setSubmitResult({
        number: app.application_number,
        name: `${data.first_name} ${data.last_name}`,
        program: data.program_applied,
        school: data.school_applied,
        email: data.email,
      });

      // Send confirmation email
      await fetch('/api/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, name: data.first_name, application_number: app.application_number }),
      });

      setStep(STEPS_KEYS.length);
    } catch (err) {
      console.error('Submission error:', err);
      alert(isFr ? 'Erreur lors de la soumission. Veuillez réessayer.' : 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── SUCCESS SCREEN ─────────────────────────────────────────
  if (step === STEPS_KEYS.length && submitResult) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8 sm:p-12 bg-white rounded-3xl border-2 border-green-200 shadow-xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        >
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-5" />
        </motion.div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#0A1628] font-heading mb-3">
          {isFr ? 'Candidature Soumise avec Succès!' : 'Application Submitted Successfully!'}
        </h2>
        <p className="text-gray-500 mb-4">{isFr ? 'Numéro de Candidature' : 'Your Application Number'}:</p>
        <div className="text-4xl font-bold text-[#C9A84C] font-heading mb-6 bg-[#C9A84C]/10 rounded-2xl py-4 px-6 inline-block">
          {submitResult.number}
        </div>

        <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-left max-w-md mx-auto">
          <p className="text-sm text-gray-600"><strong>{isFr ? 'Nom' : 'Name'}:</strong> {submitResult.name}</p>
          <p className="text-sm text-gray-600 mt-1"><strong>Programme:</strong> {submitResult.program}</p>
          <p className="text-sm text-gray-600 mt-1"><strong>{isFr ? 'École' : 'School'}:</strong> {submitResult.school}</p>
          <p className="text-sm text-gray-600 mt-1"><strong>{isFr ? 'Année' : 'Academic Year'}:</strong> 2026–2027</p>
        </div>

        <p className="text-gray-500 text-sm mb-6">
          {isFr ? 'Un email de confirmation a été envoyé à' : 'A confirmation email has been sent to'}{' '}
          <strong className="text-[#0A1628]">{submitResult.email}</strong>
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href={`/${locale}/admission#status`}
            className="inline-flex items-center justify-center gap-2 bg-[#0A1628] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#162845] transition text-sm">
            <Search className="w-4 h-4" />
            {isFr ? 'Vérifier le Statut' : 'Check Application Status'}
          </a>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 border border-[#0A1628] text-[#0A1628] font-bold px-6 py-3 rounded-xl hover:bg-gray-50 transition text-sm"
          >
            <Printer className="w-4 h-4" />
            {isFr ? 'Imprimer la Confirmation' : 'Print Confirmation'}
          </button>
          <Link href={`/${locale}`}
            className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-bold px-6 py-3 rounded-xl hover:bg-gray-200 transition text-sm">
            <Home className="w-4 h-4" />
            {isFr ? 'Retour à l\'Accueil' : 'Return to Home'}
          </Link>
        </div>
      </motion.div>
    );
  }

  const f = (en: string, fr: string) => isFr ? fr : en;

  return (
    <div>
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8 overflow-x-auto pb-1">
        {STEPS_KEYS.map((key, i) => (
          <div key={key} className="flex flex-col items-center flex-1 min-w-[50px]">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
              ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-[#C9A84C] text-[#0A1628]' : 'bg-gray-200 text-gray-400'}`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className="text-[10px] mt-1 text-center text-gray-500 hidden sm:block capitalize">{key}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
        {/* Step 0 — Personal */}
        {step === 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#0A1628] font-heading mb-4">{f('Personal Information', 'Informations Personnelles')}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label={f('First Name', 'Prénom')} error={errors.first_name?.message}>
                <input {...register('first_name')} className={ic(!!errors.first_name)} placeholder="Jean" />
              </FormField>
              <FormField label={f('Last Name', 'Nom')} error={errors.last_name?.message}>
                <input {...register('last_name')} className={ic(!!errors.last_name)} placeholder="Mbah" />
              </FormField>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label={f('Date of Birth', 'Date de Naissance')} error={errors.date_of_birth?.message}>
                <input {...register('date_of_birth')} type="date" className={ic(!!errors.date_of_birth)} />
              </FormField>
              <FormField label={f('Gender', 'Sexe')} error={errors.gender?.message}>
                <select {...register('gender')} className={ic(!!errors.gender)}>
                  <option value="">{f('Select', 'Choisir')}</option>
                  <option value="male">{f('Male', 'Masculin')}</option>
                  <option value="female">{f('Female', 'Féminin')}</option>
                  <option value="other">{f('Other', 'Autre')}</option>
                </select>
              </FormField>
            </div>
            <FormField label={f('Nationality', 'Nationalité')} error={errors.nationality?.message}>
              <input {...register('nationality')} className={ic(!!errors.nationality)} placeholder="Cameroonian" />
            </FormField>
          </div>
        )}

        {/* Step 1 — Contact */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#0A1628] font-heading mb-4">{f('Contact Information', 'Informations de Contact')}</h3>
            <FormField label={f('Email Address', 'Adresse Email')} error={errors.email?.message}>
              <input {...register('email')} type="email" className={ic(!!errors.email)} placeholder="your@email.com" />
            </FormField>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label={f('Phone Number', 'Numéro de Téléphone')} error={errors.phone?.message}>
                <input {...register('phone')} className={ic(!!errors.phone)} placeholder="+237 679 000 000" />
              </FormField>
              <FormField label={f('WhatsApp (optional)', 'WhatsApp (optionnel)')}>
                <input {...register('whatsapp')} className={ic(false)} placeholder="+237 679 000 000" />
              </FormField>
            </div>
            <FormField label={f('Home Address', 'Adresse Domicile')} error={errors.address?.message}>
              <input {...register('address')} className={ic(!!errors.address)} placeholder="Koumé, Bertoua" />
            </FormField>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label={f('City', 'Ville')}>
                <input {...register('city')} className={ic(false)} placeholder="Bertoua" />
              </FormField>
              <FormField label={f('Country', 'Pays')}>
                <input {...register('country')} className={ic(false)} placeholder="Cameroon" />
              </FormField>
            </div>
          </div>
        )}

        {/* Step 2 — Academic */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#0A1628] font-heading mb-4">{f('Academic Background & Documents', 'Parcours Académique & Documents')}</h3>
            <FormField label={f('Previous School', 'École Précédente')} error={errors.previous_school?.message}>
              <input {...register('previous_school')} className={ic(!!errors.previous_school)} placeholder="Lycée de Bertoua" />
            </FormField>
            <FormField label={f('Highest Qualification', 'Diplôme le Plus Élevé')} error={errors.highest_qualification?.message}>
              <input {...register('highest_qualification')} className={ic(!!errors.highest_qualification)} placeholder="Baccalauréat série C" />
            </FormField>
            <FormField label={f('GPA / Grade Average (optional)', 'Moyenne Générale (optionnel)')}>
              <input {...register('gpa')} className={ic(false)} placeholder="14.5/20" />
            </FormField>
            <div className="space-y-3 pt-2">
              <p className="text-sm font-bold text-gray-700">{f('Required Documents', 'Documents Requis')}</p>
              {[
                { label_en: 'Profile Photo * (JPG/PNG, max 2MB)', label_fr: 'Photo de profil * (JPG/PNG, max 2Mo)', setter: setPhotoFile, file: photoFile, accept: '.jpg,.jpeg,.png' },
                { label_en: 'Academic Certificate * (PDF/JPG, max 5MB)', label_fr: 'Certificat Académique * (PDF/JPG, max 5Mo)', setter: setCertFile, file: certFile, accept: '.pdf,.jpg,.jpeg,.png' },
                { label_en: 'National ID or Passport * (PDF/JPG, max 5MB)', label_fr: 'CNI ou Passeport * (PDF/JPG, max 5Mo)', setter: setIdFile, file: idFile, accept: '.pdf,.jpg,.jpeg,.png' },
              ].map(doc => (
                <div key={doc.label_en} className="border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-[#C9A84C] transition">
                  <label className="flex flex-col items-center gap-2 cursor-pointer">
                    <Upload className="w-6 h-6 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-600">{isFr ? doc.label_fr : doc.label_en}</span>
                    {doc.file && <span className="text-xs text-green-600 font-semibold">✓ {doc.file.name}</span>}
                    <input type="file" accept={doc.accept} className="hidden"
                      onChange={e => doc.setter(e.target.files?.[0] || null)} />
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Program */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#0A1628] font-heading mb-4">{f('Program Selection', 'Choix du Programme')}</h3>
            <FormField label={f('School / Institute', 'École / Institut')} error={errors.school_applied?.message}>
              <select {...register('school_applied')} className={ic(!!errors.school_applied)}>
                <option value="">{f('Select a school', 'Choisir une école')}</option>
                {Object.keys(SCHOOLS_WITH_PROGRAMS).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </FormField>
            <FormField label={f('Program Applied For', 'Programme Choisi')} error={errors.program_applied?.message}>
              <select {...register('program_applied')} className={ic(!!errors.program_applied)}>
                <option value="">{f('Select a program', 'Choisir un programme')}</option>
                {availablePrograms.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </FormField>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label={f('Study Mode', 'Mode d\'Étude')} error={errors.study_mode?.message}>
                <select {...register('study_mode')} className={ic(!!errors.study_mode)}>
                  <option value="on-campus">{f('On Campus', 'Présentiel')}</option>
                  <option value="online">{f('Online', 'En Ligne')}</option>
                  <option value="hybrid">{f('Hybrid', 'Hybride')}</option>
                </select>
              </FormField>
              <FormField label={f('Academic Year', 'Année Académique')}>
                <select {...register('academic_year')} className={ic(false)}>
                  <option value="2026-2027">2026–2027</option>
                  <option value="2027-2028">2027–2028</option>
                </select>
              </FormField>
            </div>
          </div>
        )}

        {/* Step 4 — Emergency */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#0A1628] font-heading mb-4">{f('Emergency Contact', 'Contact d\'Urgence')}</h3>
            <FormField label={f('Emergency Contact Name', 'Nom du Contact d\'Urgence')} error={errors.emergency_name?.message}>
              <input {...register('emergency_name')} className={ic(!!errors.emergency_name)} placeholder="Marie Ndongo" />
            </FormField>
            <FormField label={f('Emergency Phone', 'Téléphone d\'Urgence')} error={errors.emergency_phone?.message}>
              <input {...register('emergency_phone')} className={ic(!!errors.emergency_phone)} placeholder="+237 691 000 000" />
            </FormField>
            <FormField label={f('Relationship', 'Lien de Parenté')} error={errors.emergency_relation?.message}>
              <input {...register('emergency_relation')} className={ic(!!errors.emergency_relation)} placeholder="Mother / Mère" />
            </FormField>
          </div>
        )}

        {/* Step 5 — Review */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#0A1628] font-heading mb-4">{f('Review & Submit', 'Révision & Soumission')}</h3>
            <div className="bg-gray-50 rounded-2xl p-5 text-sm text-gray-600 space-y-1.5">
              <p><strong>{f('Name', 'Nom')}:</strong> {watchFirst} {watchLast}</p>
              <p><strong>Email:</strong> {watchEmail}</p>
              <p><strong>{f('Program', 'Programme')}:</strong> {watchProgram || '—'}</p>
              <p><strong>{f('School', 'École')}:</strong> {watchSchool || '—'}</p>
              <p><strong>{f('Academic Year', 'Année')}:</strong> 2026–2027</p>
              {photoFile && <p><strong>{f('Photo', 'Photo')}:</strong> ✓ {photoFile.name}</p>}
              {certFile && <p><strong>{f('Certificate', 'Certificat')}:</strong> ✓ {certFile.name}</p>}
            </div>
            <div className="space-y-3">
              <label className="flex gap-3 items-start cursor-pointer">
                <input type="checkbox" {...register('agreed_to_terms')} className="mt-1 accent-[#C9A84C] w-4 h-4" />
                <span className="text-sm text-gray-600">{f('I agree to the Terms and Conditions', 'J\'accepte les Conditions Générales')}</span>
              </label>
              {errors.agreed_to_terms && <p className="text-red-500 text-xs">{errors.agreed_to_terms.message}</p>}
              <label className="flex gap-3 items-start cursor-pointer">
                <input type="checkbox" {...register('agreed_to_privacy')} className="mt-1 accent-[#C9A84C] w-4 h-4" />
                <span className="text-sm text-gray-600">{f('I agree to the Privacy Policy', 'J\'accepte la Politique de Confidentialité')}</span>
              </label>
              {errors.agreed_to_privacy && <p className="text-red-500 text-xs">{errors.agreed_to_privacy.message}</p>}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-5 border-t border-gray-100 gap-3">
          {step > 0 && (
            <button type="button" onClick={() => setStep(s => s - 1)}
              className="px-5 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition font-semibold text-sm">
              ← {f('Back', 'Retour')}
            </button>
          )}
          {step < STEPS_KEYS.length - 1 ? (
            <button type="button" onClick={nextStep}
              className="ml-auto px-8 py-3 bg-[#0A1628] text-white font-bold rounded-xl hover:bg-[#162845] transition text-sm">
              {f('Next Step', 'Étape Suivante')} →
            </button>
          ) : (
            <button type="submit" disabled={isSubmitting}
              className="ml-auto px-10 py-3 bg-[#C9A84C] text-[#0A1628] font-bold rounded-xl hover:bg-[#E8C96A] transition disabled:opacity-50 text-sm">
              {isSubmitting
                ? f('Submitting...', 'Envoi...')
                : f('Submit Application', 'Soumettre la Candidature')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default function ApplicationForm() {
  return (
    <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-2xl h-96" />}>
      <ApplicationFormInner />
    </Suspense>
  );
}
