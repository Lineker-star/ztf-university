'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Mail, MailOpen, MessageSquare, Calendar, CheckCircle2,
  X, Trash2, RefreshCw, Download, Eye, CheckCheck, AlertCircle,
} from 'lucide-react';
import { createClientClient } from '@/lib/supabase/client';

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  reply_sent: boolean;
  created_at: string;
};

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtFull(date: string) {
  return new Date(date).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function trunc(str: string | null | undefined, len: number) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

function sevenDaysAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString();
}

export default function AdminContactPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const supabase = createClientClient();

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setMessages(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  // Auto-mark as read when side panel opens
  useEffect(() => {
    if (!selected) return;
    if (selected.is_read) return;
    (async () => {
      await supabase.from('contact_messages').update({ is_read: true }).eq('id', selected.id);
      setMessages(prev => prev.map(m => m.id === selected.id ? { ...m, is_read: true } : m));
      setSelected(prev => prev ? { ...prev, is_read: true } : prev);
    })();
  }, [selected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleCheck = (id: string) => {
    setChecked(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleAll = () => {
    if (checked.size === messages.length) {
      setChecked(new Set());
    } else {
      setChecked(new Set(messages.map(m => m.id)));
    }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    await supabase.from('contact_messages').update({ is_read: true }).eq('is_read', false);
    setMessages(prev => prev.map(m => ({ ...m, is_read: true })));
    if (selected) setSelected(prev => prev ? { ...prev, is_read: true } : prev);
    setMarkingAll(false);
  };

  const markUnread = async () => {
    if (!selected) return;
    await supabase.from('contact_messages').update({ is_read: false }).eq('id', selected.id);
    setMessages(prev => prev.map(m => m.id === selected.id ? { ...m, is_read: false } : m));
    setSelected(prev => prev ? { ...prev, is_read: false } : prev);
  };

  const sendReply = async () => {
    if (!selected || !replyText.trim()) return;
    setReplyStatus('sending');
    try {
      const res = await fetch('/api/admin/send-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selected.email,
          subject: `Re: ${selected.subject || 'Your message'}`,
          message: replyText,
        }),
      });
      if (!res.ok) throw new Error('Send failed');
      // Mark reply_sent
      await supabase.from('contact_messages').update({ reply_sent: true }).eq('id', selected.id);
      setMessages(prev => prev.map(m => m.id === selected.id ? { ...m, reply_sent: true } : m));
      setSelected(prev => prev ? { ...prev, reply_sent: true } : prev);
      setReplyStatus('success');
      setReplyText('');
    } catch {
      setReplyStatus('error');
    }
  };

  const deleteMessage = async (id: string) => {
    await supabase.from('contact_messages').delete().eq('id', id);
    setMessages(prev => prev.filter(m => m.id !== id));
    if (selected?.id === id) setSelected(null);
    setDeleteConfirm(null);
  };

  const exportExcel = async () => {
    setExporting(true);
    try {
      const XLSX = await import('xlsx');
      const rows = messages.map(m => ({
        Name: m.name,
        Email: m.email,
        Phone: m.phone || '',
        Subject: m.subject || '',
        Message: m.message,
        Read: m.is_read ? 'Yes' : 'No',
        Replied: m.reply_sent ? 'Yes' : 'No',
        Date: fmtFull(m.created_at),
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Messages');
      XLSX.writeFile(wb, `contact-messages-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } finally {
      setExporting(false);
    }
  };

  const total = messages.length;
  const unread = messages.filter(m => !m.is_read).length;
  const thisWeek = messages.filter(m => m.created_at >= sevenDaysAgo()).length;
  const replied = messages.filter(m => m.reply_sent).length;

  const statCards = [
    { label: 'Total Messages', value: total, icon: MessageSquare, color: 'bg-blue-500' },
    { label: 'Unread', value: unread, icon: Mail, color: 'bg-red-500' },
    { label: 'This Week', value: thisWeek, icon: Calendar, color: 'bg-yellow-500' },
    { label: 'Replied', value: replied, icon: CheckCircle2, color: 'bg-green-500' },
  ];

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628] font-heading">Contact Messages</h1>
          <p className="text-gray-500 text-sm mt-0.5">All form submissions from the contact page.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={markAllRead}
            disabled={markingAll || unread === 0}
            className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 text-sm font-semibold px-4 py-2 rounded-xl hover:border-[#C9A84C] transition disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4" />
            {markingAll ? 'Marking…' : 'Mark All Read'}
          </button>
          <button
            onClick={exportExcel}
            disabled={exporting || messages.length === 0}
            className="flex items-center gap-1.5 bg-[#0A1628] text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting…' : 'Export to Excel'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 ${card.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#0A1628] font-heading">{loading ? '—' : card.value}</p>
              <p className="text-gray-500 text-xs mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-gray-300" />
            Loading messages…
          </div>
        ) : messages.length === 0 ? (
          <div className="py-20 text-center">
            <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-semibold">No messages yet.</p>
            <p className="text-gray-400 text-sm mt-1">Contact form submissions will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={checked.size === messages.length && messages.length > 0}
                      onChange={toggleAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide hidden md:table-cell">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Preview</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide hidden xl:table-cell">Date</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wide w-8">•</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {messages.map(msg => (
                  <tr
                    key={msg.id}
                    onClick={() => { setSelected(msg); setReplyStatus('idle'); setReplyText(''); }}
                    className={`cursor-pointer transition hover:bg-[#C9A84C]/5 ${!msg.is_read ? 'bg-blue-50/40' : ''} ${selected?.id === msg.id ? 'bg-[#C9A84C]/10' : ''}`}
                  >
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={checked.has(msg.id)}
                        onChange={() => toggleCheck(msg.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#0A1628]">
                      <span className={!msg.is_read ? 'font-bold' : ''}>{msg.name}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{msg.email}</td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{trunc(msg.subject, 40)}</td>
                    <td className="px-4 py-3 text-gray-400 hidden lg:table-cell">{trunc(msg.message, 60)}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden xl:table-cell whitespace-nowrap">{fmt(msg.created_at)}</td>
                    <td className="px-4 py-3 text-center">
                      {!msg.is_read ? (
                        <span className="w-2.5 h-2.5 bg-blue-500 rounded-full inline-block" title="Unread" />
                      ) : msg.reply_sent ? (
                        <span className="w-2.5 h-2.5 bg-green-400 rounded-full inline-block" title="Replied" />
                      ) : (
                        <span className="w-2.5 h-2.5 bg-gray-200 rounded-full inline-block" title="Read" />
                      )}
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setSelected(msg); setReplyStatus('idle'); setReplyText(''); }}
                          className="flex items-center gap-1 text-xs font-semibold text-[#0A1628] hover:text-[#C9A84C] transition"
                          title="View"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(msg.id)}
                          className="text-red-400 hover:text-red-600 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirm inline */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="font-bold text-[#0A1628]">Delete Message?</p>
                <p className="text-gray-500 text-sm">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:border-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMessage(deleteConfirm)}
                className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIDE PANEL */}
      {selected && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setSelected(null)}
          />
          {/* Panel */}
          <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col overflow-hidden">
            {/* Panel Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4 flex-shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-[#0A1628] font-heading truncate">{selected.name}</h2>
                  {selected.is_read ? (
                    <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
                      <MailOpen className="w-3 h-3" /> Read
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex-shrink-0">
                      <Mail className="w-3 h-3" /> Unread
                    </span>
                  )}
                  {selected.reply_sent && (
                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3" /> Replied
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5 truncate">{selected.email}</p>
                {selected.phone && <p className="text-xs text-gray-400">{selected.phone}</p>}
                <p className="text-xs text-gray-400 mt-0.5">{fmtFull(selected.created_at)}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="flex-shrink-0 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Panel Body — scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Subject */}
              {selected.subject && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Subject</p>
                  <p className="text-[#0A1628] font-semibold">{selected.subject}</p>
                </div>
              )}

              {/* Message */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Message</p>
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selected.message}
                </div>
              </div>

              {/* Reply section */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Reply via Email</p>
                <textarea
                  value={replyText}
                  onChange={e => { setReplyText(e.target.value); setReplyStatus('idle'); }}
                  rows={5}
                  placeholder="Type your reply…"
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#C9A84C] outline-none w-full resize-none"
                />
                {replyStatus === 'success' && (
                  <div className="flex items-center gap-2 mt-2 text-green-600 text-sm">
                    <CheckCircle2 className="w-4 h-4" /> Reply sent successfully.
                  </div>
                )}
                {replyStatus === 'error' && (
                  <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4" /> Failed to send. Check Resend configuration.
                  </div>
                )}
                <button
                  onClick={sendReply}
                  disabled={replyStatus === 'sending' || !replyText.trim()}
                  className="mt-3 w-full bg-[#0A1628] text-white font-bold px-4 py-2.5 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition disabled:opacity-50 text-sm"
                >
                  {replyStatus === 'sending' ? 'Sending…' : 'Send Reply'}
                </button>
              </div>

              {/* Secondary actions */}
              <div className="flex gap-2 pt-1">
                {selected.is_read && (
                  <button
                    onClick={markUnread}
                    className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 border border-gray-200 hover:border-[#C9A84C] px-4 py-2 rounded-xl transition"
                  >
                    <Mail className="w-3.5 h-3.5" /> Mark Unread
                  </button>
                )}
                <button
                  onClick={() => setDeleteConfirm(selected.id)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-red-500 border border-red-200 hover:bg-red-50 px-4 py-2 rounded-xl transition"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Message
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
