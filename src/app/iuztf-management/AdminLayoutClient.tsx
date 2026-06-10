'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, LogOut, ChevronRight } from 'lucide-react';

const SIDEBAR_ITEMS = [
  { icon: '📊', label: 'Dashboard', href: '/iuztf-management' },
  { icon: '🏠', label: 'Home Page', href: '/iuztf-management/home' },
  { icon: '🌐', label: 'Site Settings', href: '/iuztf-management/settings' },
  { icon: '🖼️', label: 'Hero Sections', href: '/iuztf-management/hero' },
  { icon: 'ℹ️', label: 'About Page', href: '/iuztf-management/about' },
  { divider: true, label: 'ACADEMIC' },
  { icon: '🏛️', label: 'Institutes', href: '/iuztf-management/institutes' },
  { icon: '🏫', label: 'Schools', href: '/iuztf-management/schools' },
  { icon: '📚', label: 'Programs & Fees', href: '/iuztf-management/programs' },
  { icon: '👨‍🏫', label: 'Faculty & Staff', href: '/iuztf-management/faculty' },
  { icon: '🔬', label: 'Research', href: '/iuztf-management/research' },
  { divider: true, label: 'STUDENTS' },
  { icon: '📋', label: 'Admissions', href: '/iuztf-management/admissions', badge: 'pendingApps' },
  { divider: true, label: 'CONTENT' },
  { icon: '🖼️', label: 'Gallery', href: '/iuztf-management/gallery' },
  { icon: '📝', label: 'Blog Posts', href: '/iuztf-management/blog' },
  { icon: '📺', label: 'Media', href: '/iuztf-management/media' },
  { icon: '📢', label: 'Announcements', href: '/iuztf-management/announcements' },
  { divider: true, label: 'SYSTEM' },
  { icon: '✉️', label: 'Contact Messages', href: '/iuztf-management/contact', badge: 'unreadMessages' },
  { icon: '👥', label: 'Admin Users', href: '/iuztf-management/users' },
];

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingApps, setPendingApps] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === '/iuztf-management/login' || pathname === '/iuztf-management/login/reset';

  const loadBadges = useCallback(async () => {
    try {
      const { createClientClient } = await import('@/lib/supabase/client');
      const supabase = createClientClient();

      const [{ count: unread }, { count: pending }] = await Promise.all([
        supabase
          .from('contact_messages')
          .select('id', { count: 'exact', head: true })
          .eq('is_read', false),
        supabase
          .from('applications')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending'),
      ]);

      setUnreadMessages(unread ?? 0);
      setPendingApps(pending ?? 0);
    } catch {
      // Tables may not exist yet — silently ignore
    }
  }, []);

  useEffect(() => {
    if (isLoginPage) return;

    const checkAuth = async () => {
      try {
        const { createClientClient } = await import('@/lib/supabase/client');
        const supabase = createClientClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/iuztf-management/login');
        } else {
          setAdminEmail(user.email || '');
          loadBadges();
        }
      } catch {
        setAdminEmail('dev@admin.com');
        loadBadges();
      }
    };
    checkAuth();
  }, [isLoginPage, router, loadBadges]);

  // Real-time badge updates
  useEffect(() => {
    if (isLoginPage) return;
    let supabase: ReturnType<typeof import('@/lib/supabase/client')['createClientClient']> | null = null;

    (async () => {
      const { createClientClient } = await import('@/lib/supabase/client');
      supabase = createClientClient();

      const channel = supabase
        .channel('sidebar_badge_rt')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, loadBadges)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, loadBadges)
        .subscribe();

      return () => { supabase?.removeChannel(channel); };
    })();
  }, [isLoginPage, loadBadges]);

  const handleLogout = async () => {
    try {
      const { createClientClient } = await import('@/lib/supabase/client');
      const supabase = createClientClient();
      await supabase.auth.signOut();
    } catch { /* ignore */ }
    router.push('/iuztf-management/login');
  };

  const badgeCounts: Record<string, number> = {
    unreadMessages,
    pendingApps,
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-[#0A1628] z-40 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <Image src="/images/logo.png" alt="ZTF" width={42} height={42} className="object-contain flex-shrink-0" />
          <div>
            <div className="text-white font-bold text-sm font-heading leading-tight">ZTF University</div>
            <div className="text-[#C9A84C] text-xs">Management Portal</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          {SIDEBAR_ITEMS.map((item, i) => {
            if ('divider' in item && item.divider) {
              return (
                <div key={i} className="px-4 pt-4 pb-1">
                  <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">{item.label}</p>
                </div>
              );
            }
            const itemHref = 'href' in item ? item.href : '';
            const isActive = 'href' in item && (pathname === itemHref || (itemHref !== '/iuztf-management' && !!itemHref && !!pathname && pathname.startsWith(itemHref)));
            const badgeKey = 'badge' in item ? item.badge as string : undefined;
            const badgeCount = badgeKey ? badgeCounts[badgeKey] : 0;

            return (
              <Link key={itemHref || i} href={itemHref || '#'}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'bg-[#C9A84C] text-[#0A1628] font-bold' : 'text-gray-400 hover:bg-white/10 hover:text-white'
                }`}>
                <span className="text-base">{('icon' in item) ? item.icon : ''}</span>
                <span className="flex-1">{'label' in item ? item.label : ''}</span>
                {badgeCount > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none ${
                    isActive ? 'bg-[#0A1628] text-[#C9A84C]' : 'bg-red-500 text-white'
                  }`}>
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom — user + logout */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-[#C9A84C] rounded-full flex items-center justify-center text-[#0A1628] font-bold text-sm">
              {adminEmail.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{adminEmail}</p>
              <p className="text-gray-500 text-xs">Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 text-gray-400 hover:text-white text-sm px-2 py-2 rounded-lg hover:bg-white/10 transition">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center gap-4 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition text-gray-600">
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-sm text-gray-500 hidden sm:flex">
            <span>Portal</span>
            {pathname !== '/iuztf-management' && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-[#0A1628] font-semibold capitalize">
                  {pathname?.split('/').pop()?.replace(/-/g, ' ')}
                </span>
              </>
            )}
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Total unread indicator in header */}
            {(unreadMessages + pendingApps) > 0 && (
              <div className="flex items-center gap-1.5 bg-red-50 border border-red-100 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                {unreadMessages + pendingApps} pending
              </div>
            )}
            <Link href="/" target="_blank"
              className="text-xs text-gray-500 hover:text-[#C9A84C] transition hidden sm:block">
              View Site →
            </Link>
            <div className="w-8 h-8 bg-[#0A1628] rounded-full flex items-center justify-center text-[#C9A84C] font-bold text-sm">
              {adminEmail.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
