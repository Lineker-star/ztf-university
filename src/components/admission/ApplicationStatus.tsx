'use client';
import { useState } from 'react';
import { useLocale } from 'next-intl';
import { createClientClient } from '@/lib/supabase/client';
import { Search, Clock, Eye, CheckCircle, PauseCircle, XCircle, GraduationCap } from 'lucide-react';

type ApplicationResult = {
  application_number: string;
  status: string;
  first_name: string;
  last_name: string;
  program_applied: string;
  school_applied: string;
  created_at: string;
  reviewed_at: string | null;
};

const STATUS_CONFIG: Record<string, {
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  textColor: string;
  message_en: string;
  message_fr: string;
  label_en: string;
  label_fr: string;
}> = {
  pending: {
    icon: Clock,
    bgColor: 'bg-yellow-50 border-yellow-200',
    textColor: 'text-yellow-700',
    label_en: 'Pending',
    label_fr: 'En attente',
    message_en: 'Your application is being processed. Please allow 7–14 business days for review.',
    message_fr: 'Votre candidature est en cours de traitement. Veuillez prévoir 7 à 14 jours ouvrables pour l\'examen.',
  },
  under_review: {
    icon: Eye,
    bgColor: 'bg-blue-50 border-blue-200',
    textColor: 'text-blue-700',
    label_en: 'Under Review',
    label_fr: 'En cours d\'examen',
    message_en: 'Our admissions team is carefully reviewing your application.',
    message_fr: 'Notre équipe d\'admission examine attentivement votre candidature.',
  },
  accepted: {
    icon: CheckCircle,
    bgColor: 'bg-green-50 border-green-200',
    textColor: 'text-green-700',
    label_en: 'Accepted',
    label_fr: 'Accepté(e)',
    message_en: 'Congratulations! You have been accepted to ZTF University Institute. Please check your email for enrollment instructions.',
    message_fr: 'Félicitations! Vous avez été accepté(e) à l\'Institut Universitaire ZTF. Veuillez consulter votre email pour les instructions d\'inscription.',
  },
  waitlisted: {
    icon: PauseCircle,
    bgColor: 'bg-orange-50 border-orange-200',
    textColor: 'text-orange-700',
    label_en: 'Waitlisted',
    label_fr: 'Liste d\'attente',
    message_en: 'You have been placed on our waiting list. We will contact you if a position becomes available.',
    message_fr: 'Vous avez été placé(e) sur notre liste d\'attente. Nous vous contacterons si une place se libère.',
  },
  rejected: {
    icon: XCircle,
    bgColor: 'bg-red-50 border-red-200',
    textColor: 'text-red-700',
    label_en: 'Unsuccessful',
    label_fr: 'Non retenu(e)',
    message_en: 'Unfortunately your application was not successful this time. You are welcome to apply for the next academic year.',
    message_fr: 'Malheureusement, votre candidature n\'a pas été retenue cette fois. Vous êtes invité(e) à postuler pour la prochaine année académique.',
  },
  enrolled: {
    icon: GraduationCap,
    bgColor: 'bg-purple-50 border-purple-200',
    textColor: 'text-purple-700',
    label_en: 'Enrolled',
    label_fr: 'Inscrit(e)',
    message_en: 'You are officially enrolled at ZTF University Institute. Welcome to the ZTF family!',
    message_fr: 'Vous êtes officiellement inscrit(e) à l\'Institut Universitaire ZTF. Bienvenue dans la famille ZTF!',
  },
};

export default function ApplicationStatus() {
  const locale = useLocale();
  const isFr = locale === 'fr';
  const [appNumber, setAppNumber] = useState('');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<ApplicationResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    if (!appNumber || !email) return;
    setLoading(true);
    setNotFound(false);
    setResult(null);

    try {
      const supabase = createClientClient();
      const { data } = await supabase
        .from('applications')
        .select('application_number, status, first_name, last_name, program_applied, school_applied, created_at, reviewed_at')
        .eq('application_number', appNumber.trim().toUpperCase())
        .eq('email', email.trim().toLowerCase())
        .single();

      if (data) setResult(data as ApplicationResult);
      else setNotFound(true);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const statusCfg = result ? (STATUS_CONFIG[result.status] || STATUS_CONFIG.pending) : null;

  return (
    <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-100">
      <h3 className="text-xl font-bold text-[#0A1628] font-heading mb-5">
        {isFr ? 'Vérifier le Statut de ma Candidature' : 'Check Application Status'}
      </h3>

      <div className="space-y-3 mb-4">
        <input
          value={appNumber}
          onChange={e => setAppNumber(e.target.value.toUpperCase())}
          placeholder={`${isFr ? 'Numéro de candidature' : 'Application number'} (ex: ZTF-2026-01001)`}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none"
        />
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={isFr ? 'Votre adresse email' : 'Your email address'}
          type="email"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none"
        />
      </div>

      <button
        onClick={checkStatus}
        disabled={loading || !appNumber || !email}
        className="w-full flex items-center justify-center gap-2 bg-[#0A1628] text-white font-bold py-3 rounded-xl hover:bg-[#162845] transition disabled:opacity-50 text-sm"
      >
        <Search className="w-4 h-4" />
        {loading ? (isFr ? 'Vérification...' : 'Checking...') : (isFr ? 'Vérifier le Statut' : 'Check Status')}
      </button>

      {notFound && (
        <p className="mt-4 text-sm text-red-600 text-center bg-red-50 rounded-xl py-3">
          {isFr ? 'Aucune candidature trouvée avec ces informations.' : 'No application found with these details.'}
        </p>
      )}

      {result && statusCfg && (
        <div className={`mt-5 rounded-2xl border-2 ${statusCfg.bgColor} overflow-hidden`}>
          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <statusCfg.icon className={`w-6 h-6 ${statusCfg.textColor}`} />
              <div>
                <span className={`font-bold text-base ${statusCfg.textColor}`}>
                  {isFr ? statusCfg.label_fr : statusCfg.label_en}
                </span>
              </div>
            </div>

            <p className={`text-sm mb-4 ${statusCfg.textColor}`}>
              {isFr ? statusCfg.message_fr : statusCfg.message_en}
            </p>

            <div className="bg-white/60 rounded-xl p-4 space-y-1.5 text-sm">
              <p><strong>{isFr ? 'Candidat(e)' : 'Applicant'}:</strong> {result.first_name} {result.last_name}</p>
              <p><strong>{isFr ? 'Numéro' : 'Application #'}:</strong> {result.application_number}</p>
              <p><strong>Programme:</strong> {result.program_applied}</p>
              <p><strong>{isFr ? 'École' : 'School'}:</strong> {result.school_applied}</p>
              <p><strong>{isFr ? 'Soumis le' : 'Submitted'}:</strong> {new Date(result.created_at).toLocaleDateString(locale)}</p>
              {result.reviewed_at && (
                <p><strong>{isFr ? 'Examiné le' : 'Reviewed'}:</strong> {new Date(result.reviewed_at).toLocaleDateString(locale)}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
