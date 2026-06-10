'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, FileText, Image, BookOpen, MessageSquare, Clock, CheckCircle, XCircle, GraduationCap, TrendingUp, Plus, Download } from 'lucide-react';

type Stats = {
  total_applications: number;
  pending: number;
  under_review: number;
  accepted: number;
  rejected: number;
  enrolled: number;
  waitlisted: number;
  faculty_count: number;
  blog_posts: number;
  gallery_images: number;
  unread_messages: number;
};

type Application = {
  application_number: string;
  first_name: string;
  last_name: string;
  program_applied: string;
  school_applied: string;
  status: string;
  created_at: string;
};

type Message = {
  id: string;
  name: string;
  subject: string;
  email: string;
  is_read: boolean;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  waitlisted: 'bg-orange-100 text-orange-800',
  enrolled: 'bg-purple-100 text-purple-800',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    total_applications: 0, pending: 0, under_review: 0, accepted: 0,
    rejected: 0, enrolled: 0, waitlisted: 0, faculty_count: 0,
    blog_posts: 0, gallery_images: 0, unread_messages: 0,
  });
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { createClientClient } = await import('@/lib/supabase/client');
        const supabase = createClientClient();

        const [appsRes, messagesRes] = await Promise.all([
          supabase.from('applications').select('application_number, first_name, last_name, program_applied, school_applied, status, created_at').order('created_at', { ascending: false }).limit(5),
          supabase.from('contact_messages').select('id, name, subject, email, is_read, created_at').order('created_at', { ascending: false }).limit(5),
        ]);

        if (appsRes.data) setRecentApps(appsRes.data);
        if (messagesRes.data) setRecentMessages(messagesRes.data);

        // Get counts
        const [allApps, unread] = await Promise.all([
          supabase.from('applications').select('status'),
          supabase.from('contact_messages').select('id', { count: 'exact' }).eq('is_read', false),
        ]);

        if (allApps.data) {
          const s: Stats = { total_applications: allApps.data.length, pending: 0, under_review: 0, accepted: 0, rejected: 0, enrolled: 0, waitlisted: 0, faculty_count: 0, blog_posts: 0, gallery_images: 0, unread_messages: unread.count || 0 };
          allApps.data.forEach(a => { if (a.status in s) (s as Record<string, number>)[a.status]++; });
          setStats(s);
        }
      } catch {
        // DB not configured — show demo data
        setStats({ total_applications: 0, pending: 0, under_review: 0, accepted: 0, rejected: 0, enrolled: 0, waitlisted: 0, faculty_count: 8, blog_posts: 6, gallery_images: 6, unread_messages: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: 'Total Applications', value: stats.total_applications, icon: FileText, color: 'bg-blue-500', href: '/ztf-control-2026/admissions' },
    { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'bg-yellow-500', href: '/ztf-control-2026/admissions?status=pending' },
    { label: 'Accepted', value: stats.accepted, icon: CheckCircle, color: 'bg-green-500', href: '/ztf-control-2026/admissions?status=accepted' },
    { label: 'Faculty Members', value: stats.faculty_count || 8, icon: Users, color: 'bg-indigo-500', href: '/ztf-control-2026/faculty' },
    { label: 'Blog Posts', value: stats.blog_posts || 6, icon: BookOpen, color: 'bg-purple-500', href: '/ztf-control-2026/blog' },
    { label: 'Gallery Images', value: stats.gallery_images || 6, icon: Image, color: 'bg-pink-500', href: '/ztf-control-2026/gallery' },
    { label: 'Unread Messages', value: stats.unread_messages, icon: MessageSquare, color: 'bg-red-500', href: '/ztf-control-2026/contact' },
    { label: 'Enrolled Students', value: stats.enrolled, icon: GraduationCap, color: 'bg-teal-500', href: '/ztf-control-2026/admissions?status=enrolled' },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628] font-heading">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back. Here&apos;s what&apos;s happening at ZTF University.</p>
        </div>
        <div className="hidden sm:flex gap-2">
          <Link href="/ztf-control-2026/admissions" className="flex items-center gap-1 bg-[#0A1628] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition">
            <Plus className="w-3.5 h-3.5" /> New Admission
          </Link>
          <Link href="/ztf-control-2026/blog" className="flex items-center gap-1 border border-gray-200 text-gray-600 text-xs font-bold px-4 py-2 rounded-xl hover:border-[#C9A84C] transition">
            <Plus className="w-3.5 h-3.5" /> New Post
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition group">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 ${card.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-4.5 h-4.5 text-white" style={{ width: '18px', height: '18px' }} />
                </div>
                <TrendingUp className="w-4 h-4 text-gray-300 group-hover:text-[#C9A84C] transition" />
              </div>
              <p className="text-2xl font-bold text-[#0A1628] font-heading">
                {loading ? '—' : card.value}
              </p>
              <p className="text-gray-500 text-xs mt-1">{card.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Application Status Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-[#0A1628] font-heading mb-4">Application Status Overview</h3>
          <div className="space-y-3">
            {[
              { label: 'Pending', value: stats.pending, color: 'bg-yellow-400' },
              { label: 'Under Review', value: stats.under_review, color: 'bg-blue-400' },
              { label: 'Accepted', value: stats.accepted, color: 'bg-green-400' },
              { label: 'Waitlisted', value: stats.waitlisted, color: 'bg-orange-400' },
              { label: 'Enrolled', value: stats.enrolled, color: 'bg-purple-400' },
              { label: 'Rejected', value: stats.rejected, color: 'bg-red-400' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3">
                <div className="w-24 text-xs text-gray-500 font-medium">{s.label}</div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${s.color} rounded-full`}
                    style={{ width: stats.total_applications > 0 ? `${(s.value / stats.total_applications) * 100}%` : '0%' }}
                  />
                </div>
                <div className="w-8 text-right text-xs font-bold text-[#0A1628]">{s.value}</div>
              </div>
            ))}
          </div>
          <Link href="/ztf-control-2026/admissions" className="mt-4 inline-flex items-center gap-1 text-xs text-[#C9A84C] font-bold hover:underline">
            Manage All Applications →
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-[#0A1628] font-heading mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '📝', label: 'New Blog Post', href: '/ztf-control-2026/blog' },
              { icon: '🖼️', label: 'Upload Images', href: '/ztf-control-2026/gallery' },
              { icon: '👨‍🏫', label: 'Add Faculty', href: '/ztf-control-2026/faculty' },
              { icon: '📋', label: 'View Applications', href: '/ztf-control-2026/admissions' },
              { icon: '🏛️', label: 'Manage Institutes', href: '/ztf-control-2026/institutes' },
              { icon: '🔬', label: 'Research', href: '/ztf-control-2026/research' },
            ].map(a => (
              <Link key={a.label} href={a.href}
                className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-[#C9A84C]/10 hover:border-[#C9A84C] border border-transparent transition text-sm font-semibold text-[#0A1628]">
                <span className="text-base">{a.icon}</span>
                {a.label}
              </Link>
            ))}
          </div>
          <Link href="/ztf-control-2026/admissions"
            className="mt-4 flex items-center gap-2 text-xs text-gray-500 hover:text-[#C9A84C] transition">
            <Download className="w-3.5 h-3.5" /> Export All Applications to Excel
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-[#0A1628] font-heading">Recent Applications</h3>
            <Link href="/ztf-control-2026/admissions" className="text-xs text-[#C9A84C] font-bold hover:underline">View All</Link>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
          ) : recentApps.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No applications yet.<br />
              <span className="text-xs">Configure your Supabase connection to see live data.</span>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentApps.map(app => (
                <div key={app.application_number} className="px-5 py-3.5 hover:bg-gray-50 transition flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-[#0A1628] text-sm truncate">{app.first_name} {app.last_name}</p>
                    <p className="text-gray-400 text-xs truncate">{app.program_applied}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-600'}`}>
                    {app.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Messages */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-[#0A1628] font-heading">Recent Messages</h3>
            <Link href="/ztf-control-2026/contact" className="text-xs text-[#C9A84C] font-bold hover:underline">View All</Link>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
          ) : recentMessages.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No messages yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentMessages.map(msg => (
                <div key={msg.id} className="px-5 py-3.5 hover:bg-gray-50 transition flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[#0A1628] text-sm">{msg.name}</p>
                      {!msg.is_read && <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />}
                    </div>
                    <p className="text-gray-400 text-xs truncate">{msg.subject || 'No subject'}</p>
                  </div>
                  <p className="text-xs text-gray-300 flex-shrink-0">{new Date(msg.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DB Info box */}
      <div className="mt-6 bg-[#C9A84C]/10 border border-[#C9A84C]/20 rounded-2xl p-5">
        <p className="text-[#0A1628] font-semibold text-sm">
          💡 <strong>Supabase Connected</strong> — Live data from your database is shown above.
          Run the SQL migrations from the Build Guide to create all CMS tables.
        </p>
      </div>
    </div>
  );
}
