'use client';
import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';

const SUBJECTS = [
  { en: 'General Inquiry', fr: 'Renseignement Général' },
  { en: 'Admissions', fr: 'Admissions' },
  { en: 'Programs', fr: 'Programmes' },
  { en: 'Careers / Faculty Positions', fr: 'Carrières / Postes d\'Enseignant' },
  { en: 'Research Collaboration', fr: 'Collaboration de Recherche' },
  { en: 'Other', fr: 'Autre' },
];

export default function ContactForm({ locale = 'en' }: { locale?: string }) {
  const isFr = locale === 'fr';
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) { setStatus('success'); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }
      else setStatus('error');
    } catch { setStatus('error'); }
  };

  if (status === 'success') {
    return (
      <div className="bg-green-50 rounded-2xl p-10 text-center border border-green-200">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <p className="font-bold text-green-800 text-lg">
          {isFr ? 'Message envoyé avec succès !' : 'Message sent successfully!'}
        </p>
        <p className="text-green-700 text-sm mt-2">
          {isFr ? 'Nous vous répondrons dans 2–3 jours ouvrables.' : 'We\'ll reply within 2–3 business days.'}
        </p>
        <button onClick={() => setStatus('idle')} className="mt-4 text-sm text-gray-500 hover:text-[#C9A84C] transition">
          {isFr ? 'Envoyer un autre message' : 'Send another message'}
        </button>
      </div>
    );
  }

  const f = (en: string, fr: string) => isFr ? fr : en;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f('Full Name', 'Nom Complet')} *</label>
          <input required value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none"
            placeholder={f('Jean Mbah', 'Jean Mbah')} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email *</label>
          <input required type="email" value={form.email} onChange={e => setForm(v => ({ ...v, email: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none"
            placeholder="your@email.com" />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f('Phone', 'Téléphone')}</label>
          <input value={form.phone} onChange={e => setForm(v => ({ ...v, phone: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none"
            placeholder="+237 679 000 000" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f('Subject', 'Objet')} *</label>
          <select required value={form.subject} onChange={e => setForm(v => ({ ...v, subject: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none">
            <option value="">{f('Select a subject', 'Choisir un objet')}</option>
            {SUBJECTS.map(s => (
              <option key={s.en} value={s.en}>{isFr ? s.fr : s.en}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f('Message', 'Message')} *</label>
        <textarea required rows={5} value={form.message} onChange={e => setForm(v => ({ ...v, message: e.target.value }))}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none resize-none"
          placeholder={f('How can we help you?', 'Comment pouvons-nous vous aider ?')} />
      </div>
      {status === 'error' && (
        <p className="text-red-500 text-sm">
          {f('Something went wrong. Please try again or contact us directly.', 'Une erreur s\'est produite. Veuillez réessayer ou nous contacter directement.')}
        </p>
      )}
      <button type="submit" disabled={status === 'sending'}
        className="w-full flex items-center justify-center gap-2 bg-[#0A1628] text-white font-bold py-4 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition disabled:opacity-50 text-sm">
        <Send className="w-4 h-4" />
        {status === 'sending' ? f('Sending...', 'Envoi...') : f('Send Message', 'Envoyer le Message')}
      </button>
    </form>
  );
}
