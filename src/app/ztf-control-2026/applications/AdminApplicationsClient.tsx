'use client';
import { useState, useEffect } from 'react';
import { createClientClient } from '@/lib/supabase/client';
import type { Application } from '@/types/database';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { Search, Filter, Download } from 'lucide-react';

const STATUS_BADGE: Record<string, 'default' | 'gold' | 'green' | 'red' | 'blue' | 'orange' | 'purple'> = {
  pending: 'gold',
  under_review: 'blue',
  accepted: 'green',
  rejected: 'red',
  waitlisted: 'orange',
  enrolled: 'purple',
};

export default function AdminApplicationsClient() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected] = useState<Application | null>(null);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const supabase = createClientClient();
      const { data } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });
      setApplications(data || []);
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = applications.filter(a => {
    const matchSearch = !search ||
      `${a.first_name} ${a.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      (a.application_number || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const updateApplication = async () => {
    if (!selected) return;
    setUpdating(true);
    try {
      const supabase = createClientClient();
      await supabase.from('applications').update({
        status: newStatus || selected.status,
        notes: notes || selected.notes,
        reviewed_at: new Date().toISOString(),
      }).eq('id', selected.id);
      await loadApplications();
      setSelected(null);
    } catch { /* ignore */ }
    setUpdating(false);
  };

  const exportCSV = () => {
    const headers = ['Application #', 'Name', 'Email', 'Phone', 'Program', 'School', 'Status', 'Date'];
    const rows = filtered.map(a => [
      a.application_number, `${a.first_name} ${a.last_name}`, a.email, a.phone,
      a.program_applied, a.school_applied, a.status,
      new Date(a.created_at).toLocaleDateString()
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'applications.csv';
    a.click();
  };

  return (
    <>
      {/* Controls */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or number..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#C9A84C]"
          />
        </div>
        <select
          value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#C9A84C]"
        >
          {['all', 'pending', 'under_review', 'accepted', 'rejected', 'waitlisted', 'enrolled'].map(s => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-[#0A1628] text-white text-sm font-semibold rounded-xl hover:bg-[#162845] transition">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-4">{filtered.length} applications</p>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['App #', 'Applicant', 'Program', 'School', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  {applications.length === 0 ? 'No applications yet. Configure Supabase to see live data.' : 'No results found.'}
                </td></tr>
              ) : filtered.map(a => (
                <tr key={a.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => { setSelected(a); setNotes(a.notes || ''); setNewStatus(a.status); }}>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{a.application_number}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[#0A1628]">{a.first_name} {a.last_name}</div>
                    <div className="text-xs text-gray-400">{a.email}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{a.program_applied}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-[140px] truncate">{a.school_applied}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_BADGE[a.status] || 'default'}>{a.status.replace('_', ' ')}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(a.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button className="text-[#C9A84C] text-xs font-semibold hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={`Application: ${selected?.application_number}`} size="xl">
        {selected && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Personal */}
              <div>
                <h4 className="font-bold text-[#0A1628] mb-3">Personal Information</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Name:</strong> {selected.first_name} {selected.last_name}</p>
                  <p><strong>Date of Birth:</strong> {selected.date_of_birth}</p>
                  <p><strong>Gender:</strong> {selected.gender}</p>
                  <p><strong>Nationality:</strong> {selected.nationality}</p>
                  <p><strong>Email:</strong> {selected.email}</p>
                  <p><strong>Phone:</strong> {selected.phone}</p>
                  <p><strong>Address:</strong> {selected.address}</p>
                </div>
              </div>

              {/* Application */}
              <div>
                <h4 className="font-bold text-[#0A1628] mb-3">Application Details</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Program:</strong> {selected.program_applied}</p>
                  <p><strong>School:</strong> {selected.school_applied}</p>
                  <p><strong>Study Mode:</strong> {selected.study_mode}</p>
                  <p><strong>Academic Year:</strong> {selected.academic_year}</p>
                  <p><strong>Previous School:</strong> {selected.previous_school}</p>
                  <p><strong>Qualification:</strong> {selected.highest_qualification}</p>
                  <p><strong>Submitted:</strong> {new Date(selected.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Status Update */}
            <div className="border-t pt-5">
              <h4 className="font-bold text-[#0A1628] mb-3">Update Status</h4>
              <div className="flex gap-4 mb-3">
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#C9A84C] flex-1"
                >
                  {['pending', 'under_review', 'accepted', 'rejected', 'waitlisted', 'enrolled'].map(s => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add notes (visible to admin only)..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C9A84C] mb-3"
              />
              <button
                onClick={updateApplication}
                disabled={updating}
                className="bg-[#0A1628] text-white font-bold px-6 py-2.5 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition disabled:opacity-50 text-sm"
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
