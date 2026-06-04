const PARTNERS = [
  'CMF International',
  'WUPFC',
  'RTVC Cameroon',
  'University of Yaoundé I',
  'African Union Education',
  'CEMAC Region',
];

export default function PartnersSection() {
  return (
    <section className="py-14 bg-gray-50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-500 font-semibold uppercase tracking-widest mb-8">
          Affiliations & Partners
        </p>
        <div className="flex flex-wrap justify-center gap-6 lg:gap-12 items-center">
          {PARTNERS.map(p => (
            <div
              key={p}
              className="px-6 py-3 bg-white rounded-xl border border-gray-200 text-gray-500 font-semibold text-sm shadow-sm hover:border-[#C9A84C] hover:text-[#0A1628] transition"
            >
              {p}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
