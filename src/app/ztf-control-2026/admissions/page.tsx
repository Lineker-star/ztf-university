'use client';
import { useState, useEffect } from 'react';
import { Search, X, Check, ChevronRight, Clock, Eye, CheckCircle, XCircle, PauseCircle, GraduationCap, RefreshCw } from 'lucide-react';

type Application = {
  id: string;
  application_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  date_of_birth: string;
  gender: string;
  nationality: string;
  address?: string;
  previous_school?: string;
  highest_qualification?: string;
  program_applied: string;
  school_applied: string;
  study_mode: string;
  academic_year: string;
  status: string;
  emergency_name?: string;
  emergency_phone?: string;
  notes?: string;
  created_at: string;
  reviewed_at?: string;
  photo_url?: string;
  certificate_url?: string;
};

const STATUS_CONFIG: Record<string, { color: string; icon: React.ComponentType<{ className?: string }>; label: string }> = {
  pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
  under_review: { color: 'bg-blue-100 text-blue-800', icon: Eye, label: 'Under Review' },
  accepted: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Accepted' },
  rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
  waitlisted: { color: 'bg-orange-100 text-orange-800', icon: PauseCircle, label: 'Waitlisted' },
  enrolled: { color: 'bg-purple-100 text-purple-800', icon: GraduationCap, label: 'Enrolled' },
};

export default function AdminAdmissionsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSchool, setFilterSchool] = useState('all');
  const [selected, setSelected] = useState<Application | null>(null);
  const [notes, setNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const loadApplications = async () => {
    setLoading(true);
    try {
      const { createClientClient } = await import('@/lib/supabase/client');
      const supabase = createClientClient();
      const { data } = await supabase.from('applications').select('*').order('created_at', { ascending: false });
      setApplications(data || []);
    } catch { setApplications([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    loadApplications();
    // Real-time: poll every 30s as fallback, and use Supabase realtime when available
    const interval = setInterval(loadApplications, 30000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const schools = ['all', ...Array.from(new Set(applications.map(a => a.school_applied)))];

  const filtered = applications.filter(a => {
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    if (filterSchool !== 'all' && a.school_applied !== filterSchool) return false;
    if (search) {
      const q = search.toLowerCase();
      return `${a.first_name} ${a.last_name}`.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        (a.application_number || '').toLowerCase().includes(q);
    }
    return true;
  });

  // Status counts
  const counts: Record<string, number> = { all: applications.length };
  applications.forEach(a => { counts[a.status] = (counts[a.status] || 0) + 1; });

  const updateApplication = async () => {
    if (!selected) return;
    setUpdating(true);
    try {
      const { createClientClient } = await import('@/lib/supabase/client');
      const supabase = createClientClient();
      await supabase.from('applications').update({
        status: newStatus || selected.status,
        notes: notes,
        reviewed_at: new Date().toISOString(),
      }).eq('id', selected.id);
      await loadApplications();
      setSelected(null);
    } catch { } finally { setUpdating(false); }
  };

  const toExport = () => selectedIds.size > 0 ? applications.filter(a => selectedIds.has(a.id)) : filtered;

  const exportToExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      const list = toExport();
      const data = list.map((app, index) => ({
        'No.': index + 1,
        'Application Number': app.application_number || '',
        'First Name': app.first_name || '',
        'Last Name': app.last_name || '',
        'Full Name': `${app.first_name} ${app.last_name}`,
        'Email': app.email || '',
        'Phone': app.phone || '',
        'WhatsApp': app.whatsapp || '',
        'Date of Birth': app.date_of_birth || '',
        'Gender': app.gender || '',
        'Nationality': app.nationality || '',
        'Address': app.address || '',
        'Previous School': app.previous_school || '',
        'Highest Qualification': app.highest_qualification || '',
        'Program Applied': app.program_applied || '',
        'School/Institute': app.school_applied || '',
        'Study Mode': app.study_mode || '',
        'Academic Year': app.academic_year || '2026-2027',
        'Emergency Contact': app.emergency_name || '',
        'Emergency Phone': app.emergency_phone || '',
        'Status': app.status || 'pending',
        'Submitted Date': app.created_at ? new Date(app.created_at).toLocaleDateString('fr-FR') : '',
        'Notes': app.notes || '',
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      ws['!cols'] = [
        { wch: 5 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 25 },
        { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 10 },
        { wch: 15 }, { wch: 25 }, { wch: 25 }, { wch: 20 }, { wch: 30 },
        { wch: 30 }, { wch: 15 }, { wch: 12 }, { wch: 20 }, { wch: 15 },
        { wch: 12 }, { wch: 20 }, { wch: 30 },
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Applications ZTF 2026-2027');
      XLSX.writeFile(wb, `ZTF_Applications_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (e) { console.error('Export failed:', e); }
  };

  const exportToPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const list = toExport();
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      doc.setFillColor(10, 22, 40);
      doc.rect(0, 0, 297, 25, 'F');
      doc.setTextColor(201, 168, 76);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('ZTF UNIVERSITY INSTITUTE', 148, 10, { align: 'center' });
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text('Applications Report — Academic Year 2026-2027', 148, 18, { align: 'center' });
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${new Date().toLocaleDateString('fr-FR')} | Total: ${list.length} applications`, 148, 30, { align: 'center' });
      const tableData = list.map((app, i) => [
        i + 1,
        app.application_number || '-',
        `${app.first_name} ${app.last_name}`,
        app.email || '-',
        app.phone || '-',
        app.program_applied || '-',
        (app.school_applied || '-').substring(0, 15),
        (app.status || 'pending').toUpperCase(),
        app.created_at ? new Date(app.created_at).toLocaleDateString('fr-FR') : '-',
      ]);
      autoTable(doc, {
        startY: 35,
        head: [['#', 'App. No.', 'Full Name', 'Email', 'Phone', 'Program', 'School', 'Status', 'Date']],
        body: tableData,
        headStyles: { fillColor: [10, 22, 40], textColor: [201, 168, 76], fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 7 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 35, left: 10, right: 10 },
      });
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text(`ZTF University Institute | Koumé, Bertoua, Cameroon | Page ${i} of ${pageCount}`, 148, doc.internal.pageSize.height - 5, { align: 'center' });
      }
      doc.save(`ZTF_Applications_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (e) { console.error('PDF export failed:', e); }
  };

  const exportToWord = async () => {
    try {
      const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, AlignmentType, WidthType } = await import('docx');
      const list = toExport();
      const headers = ['#', 'App Number', 'Full Name', 'Email', 'Phone', 'Program', 'School', 'Status', 'Date'];
      const tableRows = [
        new TableRow({
          children: headers.map(header =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: header, bold: true, color: 'C9A84C', size: 18 })] })],
              shading: { fill: '0A1628' },
            })
          ),
        }),
        ...list.map((app, i) =>
          new TableRow({
            children: [
              String(i + 1),
              app.application_number || '-',
              `${app.first_name} ${app.last_name}`,
              app.email || '-',
              app.phone || '-',
              app.program_applied || '-',
              app.school_applied || '-',
              app.status || 'pending',
              app.created_at ? new Date(app.created_at).toLocaleDateString('fr-FR') : '-',
            ].map(text =>
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text, size: 18 })] })] })
            ),
          })
        ),
      ];
      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({ text: 'ZTF UNIVERSITY INSTITUTE', heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
            new Paragraph({ text: 'Applications Report — Academic Year 2026-2027', alignment: AlignmentType.CENTER }),
            new Paragraph({ text: `Generated: ${new Date().toLocaleDateString('fr-FR')} | Total: ${list.length}`, alignment: AlignmentType.CENTER }),
            new Paragraph({ text: '' }),
            new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } }),
          ],
        }],
      });
      const buffer = await Packer.toBuffer(doc);
      const blob = new Blob([new Uint8Array(buffer)], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ZTF_Applications_${new Date().toISOString().split('T')[0]}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) { console.error('Word export failed:', e); }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0A1628] font-heading">Admissions Manager</h1>
            <p className="text-gray-500 text-sm mt-1">{applications.length} total applications</p>
          </div>
          <button onClick={loadApplications} className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={exportToExcel} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-bold transition">
            📊 Export Excel {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
          </button>
          <button onClick={exportToPDF} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-bold transition">
            📄 Export PDF {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
          </button>
          <button onClick={exportToWord} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-bold transition">
            📝 Export Word {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
          </button>
          <span className="text-gray-500 text-sm self-center">
            {filtered.length} shown / {applications.length} total
          </span>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {['all', 'pending', 'under_review', 'accepted', 'rejected', 'waitlisted', 'enrolled'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition capitalize ${
              filterStatus === s ? 'bg-[#0A1628] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {s.replace('_', ' ')} ({counts[s] || 0})
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or application #..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-[#C9A84C] outline-none" />
        </div>
        <select value={filterSchool} onChange={e => setFilterSchool(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#C9A84C] outline-none min-w-[160px]">
          {schools.map(s => <option key={s} value={s}>{s === 'all' ? 'All Schools' : s}</option>)}
        </select>
      </div>

      <p className="text-gray-500 text-sm mb-3">
        {filtered.length} results
        {selectedIds.size > 0 && <span className="ml-2 text-[#C9A84C] font-bold">· {selectedIds.size} selected</span>}
      </p>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left w-8">
                  <input type="checkbox" onChange={e => {
                    if (e.target.checked) setSelectedIds(new Set(filtered.map(a => a.id)));
                    else setSelectedIds(new Set());
                  }} className="accent-[#C9A84C]" />
                </th>
                {['App #', 'Applicant', 'Program', 'School', 'Mode', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="text-left px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-gray-400">
                  Loading applications...
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-gray-400">
                  {applications.length === 0
                    ? 'No applications yet. Configure Supabase and run the SQL migrations to see live data.'
                    : 'No results match your filters.'}
                </td></tr>
              ) : filtered.map(a => {
                const sc = STATUS_CONFIG[a.status] || STATUS_CONFIG.pending;
                const StatusIcon = sc.icon;
                return (
                  <tr key={a.id} className={`hover:bg-gray-50 transition ${selectedIds.has(a.id) ? 'bg-[#C9A84C]/5' : ''}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selectedIds.has(a.id)} onChange={() => toggleSelect(a.id)} className="accent-[#C9A84C]" />
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">{a.application_number}</td>
                    <td className="px-3 py-3">
                      <div className="font-semibold text-[#0A1628] whitespace-nowrap">{a.first_name} {a.last_name}</div>
                      <div className="text-xs text-gray-400">{a.email}</div>
                    </td>
                    <td className="px-3 py-3 text-gray-600 max-w-[160px] truncate">{a.program_applied}</td>
                    <td className="px-3 py-3 text-gray-500 text-xs max-w-[130px] truncate">{a.school_applied}</td>
                    <td className="px-3 py-3 text-xs text-gray-400 capitalize">{a.study_mode}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${sc.color}`}>
                        <StatusIcon className="w-3 h-3" /> {sc.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-3">
                      <button onClick={() => { setSelected(a); setNotes(a.notes || ''); setNewStatus(a.status); }}
                        className="flex items-center gap-1 text-[#C9A84C] font-semibold text-xs hover:underline whitespace-nowrap">
                        View <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setSelected(null)} />
          <div className="w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="bg-[#0A1628] p-5 flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold font-heading">{selected.first_name} {selected.last_name}</h3>
                <p className="text-[#C9A84C] text-sm font-mono">{selected.application_number}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white p-1"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-5 space-y-5">
              {/* Personal */}
              <section>
                <h4 className="font-bold text-[#0A1628] text-sm mb-3 uppercase tracking-wider text-gray-500">Personal Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    ['Email', selected.email], ['Phone', selected.phone], ['WhatsApp', selected.whatsapp || '—'],
                    ['DOB', selected.date_of_birth], ['Gender', selected.gender], ['Nationality', selected.nationality],
                  ].map(([k, v]) => (
                    <div key={k}><span className="text-gray-400 text-xs">{k}</span><p className="font-semibold text-[#0A1628]">{v}</p></div>
                  ))}
                </div>
              </section>

              {/* Academic */}
              <section>
                <h4 className="font-bold text-[#0A1628] text-sm mb-3 uppercase tracking-wider text-gray-500">Application Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    ['Program', selected.program_applied], ['School', selected.school_applied],
                    ['Mode', selected.study_mode], ['Year', selected.academic_year],
                    ['Previous School', selected.previous_school || '—'], ['Qualification', selected.highest_qualification || '—'],
                  ].map(([k, v]) => (
                    <div key={k}><span className="text-gray-400 text-xs">{k}</span><p className="font-semibold text-[#0A1628]">{v}</p></div>
                  ))}
                </div>
              </section>

              {/* Status + Notes */}
              <section>
                <h4 className="font-bold text-[#0A1628] text-sm mb-3 uppercase tracking-wider text-gray-500">Status & Notes</h4>
                <div className="space-y-3">
                  <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none">
                    {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}
                    placeholder="Internal notes (not visible to applicant)..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none resize-none" />
                </div>
              </section>

              {/* Documents */}
              {(selected.photo_url || selected.certificate_url) && (
                <section>
                  <h4 className="font-bold text-[#0A1628] text-sm mb-3 uppercase tracking-wider text-gray-500">Documents</h4>
                  <div className="flex gap-3">
                    {selected.photo_url && <a href={selected.photo_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#C9A84C] hover:underline">📸 Photo</a>}
                    {selected.certificate_url && <a href={selected.certificate_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#C9A84C] hover:underline">📄 Certificate</a>}
                  </div>
                </section>
              )}

              <div className="flex gap-3 pt-3">
                <button onClick={updateApplication} disabled={updating}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#0A1628] text-white font-bold py-3 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition disabled:opacity-50 text-sm">
                  <Check className="w-4 h-4" />
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => setSelected(null)}
                  className="px-5 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
