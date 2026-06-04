'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Faculty } from '@/types/database';
import Modal from '@/components/ui/Modal';
import { BookOpen, Mail, GraduationCap, Lightbulb } from 'lucide-react';

export default function FacultyGrid({ faculty }: { faculty: Faculty[] }) {
  const t = useTranslations('faculty');
  const [selected, setSelected] = useState<Faculty | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10">
        {faculty.map(member => (
          <div
            key={member.id}
            className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
            onClick={() => setSelected(member)}
          >
            {/* Photo */}
            <div className="h-48 bg-gradient-to-b from-[#0A1628] to-[#162845] flex items-center justify-center">
              {member.photo_url ? (
                <img src={member.photo_url} alt={member.full_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-20 h-20 bg-[#C9A84C]/20 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-[#C9A84C] font-heading">
                    {member.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
              )}
            </div>
            <div className="p-5">
              <h3 className="font-bold text-[#0A1628] font-heading text-base mb-0.5">{member.full_name}</h3>
              <p className="text-[#C9A84C] text-xs font-semibold mb-1">{member.title}</p>
              <p className="text-gray-500 text-xs mb-3">{member.department}</p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <BookOpen className="w-3 h-3" />
                <span>{member.publications_count} {t('publications')}</span>
              </div>
              <button className="mt-3 text-[#0A1628] text-xs font-semibold hover:text-[#C9A84C] transition">
                {t('view_bio')} →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.full_name} size="lg">
        {selected && (
          <div>
            <div className="flex items-start gap-6 mb-6">
              <div className="w-24 h-24 bg-gradient-to-b from-[#0A1628] to-[#162845] rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-[#C9A84C] font-heading">
                  {selected.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#0A1628] font-heading">{selected.full_name}</h2>
                <p className="text-[#C9A84C] font-semibold">{selected.title}</p>
                <p className="text-gray-500 text-sm">{selected.department} · {selected.school}</p>
                {selected.email && (
                  <a href={`mailto:${selected.email}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#C9A84C] transition mt-1">
                    <Mail className="w-4 h-4" /> {selected.email}
                  </a>
                )}
              </div>
            </div>

            {selected.bio_en && (
              <div className="mb-6">
                <h4 className="font-bold text-[#0A1628] mb-2">Biography</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{selected.bio_en}</p>
              </div>
            )}

            {selected.qualifications && selected.qualifications.length > 0 && (
              <div className="mb-4">
                <h4 className="font-bold text-[#0A1628] mb-2 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#C9A84C]" /> {t('qualifications')}
                </h4>
                <ul className="space-y-1">
                  {selected.qualifications.map(q => <li key={q} className="text-sm text-gray-600">• {q}</li>)}
                </ul>
              </div>
            )}

            {selected.specializations && selected.specializations.length > 0 && (
              <div className="mb-4">
                <h4 className="font-bold text-[#0A1628] mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-[#C9A84C]" /> {t('specializations')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selected.specializations.map(s => (
                    <span key={s} className="bg-[#C9A84C]/10 text-[#A8893E] px-3 py-1 rounded-full text-xs font-semibold">{s}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#C9A84C]" />
              <span className="font-bold text-[#0A1628]">{selected.publications_count}</span>
              <span className="text-gray-600 text-sm">{t('publications')}</span>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
