'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, LogOut, ChevronRight } from 'lucide-react';

const SIDEBAR_ITEMS = [
  { icon: '📊', label: 'Dashboard', href: '/ztf-control-2026' },
  { icon: '🏠', label: 'Home Page', href: '/ztf-control-2026/home' },
  { icon: '🌐', label: 'Site Settings', href: '/ztf-control-2026/settings' },
  { icon: '🖼️', label: 'Hero Sections', href: '/ztf-control-2026/hero' },
  { icon: 'ℹ️', label: 'About Page', href: '/ztf-control-2026/about' },
  { divider: true, label: 'ACADEMIC' },
  { icon: '🏛️', label: 'Institutes', href: '/ztf-control-2026/institutes' },
  { icon: '🏫', label: 'Schools', href: '/ztf-control-2026/schools' },
  { icon: '📚', label: 'Programs & Fees', href: '/ztf-control-2026/programs' },
  { icon: '👨‍🏫', label: 'Faculty & Staff', href: '/ztf-control-2026/faculty' },
  { icon: '🔬', label: 'Research', href: '/ztf-control-2026/research' },
  { divider: true, label: 'STUDENTS' },
  { icon: '📋', label: 'Admissions', href: '/ztf-control-2026/admissions' },
  { divider: true, label: 'CONTENT' },
  { icon: '🖼️', label: 'Gallery', href: '/ztf-control-2026/gallery' },
  { icon: '📝', label: 'Blog Posts', href: '/ztf-control-2026/blog' },
  { icon: '📺', label: 'Media', href: '/ztf-control-2026/media' },
  { icon: '📢', label: 'Announcements', href: '/ztf-control-2026/announcements' },
  { divider: true, label: 'SYSTEM' },
  { icon: '✉️', label: 'Contact Messages', href: '/ztf-control-2026/contact' },
  { icon: '👥', label: 'Admin Users', href: '/ztf-control-2026/users' },
];

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  // Skip auth layout for login and reset pages
  const isLoginPage = pathname === '/ztf-control-2026/login' || pathname === '/ztf-control-2026/login/reset';

  useEffect(() => {
    if (isLoginPage) return;

    const checkAuth = async () => {
      try {
        const { createClientClient } = await import('@/lib/supabase/client');
        const supabase = createClientClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/ztf-control-2026/login');
        } else {
          setAdminEmail(user.email || '');
        }
      } catch {
        // If Supabase not configured, allow access in dev
        setAdminEmail('dev@admin.com');
      }
    };
    checkAuth();
  }, [isLoginPage, router]);

  const handleLogout = async () => {
    try {
      const { createClientClient } = await import('@/lib/supabase/client');
      const supabase = createClientClient();
      await supabase.auth.signOut();
    } catch { /* ignore */ }
    router.push('/ztf-control-2026/login');
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile overlay */}
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
            <div className="text-[#C9A84C] text-xs">Admin Portal</div>
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
            const isActive = 'href' in item && (pathname === itemHref || (itemHref !== '/ztf-control-2026' && !!itemHref && !!pathname && pathname.startsWith(itemHref)));
            return (
              <Link key={itemHref || i} href={itemHref || '#'}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'bg-[#C9A84C] text-[#0A1628] font-bold' : 'text-gray-400 hover:bg-white/10 hover:text-white'
                }`}>
                <span className="text-base">{('icon' in item) ? item.icon : ''}</span>
                {'label' in item ? item.label : ''}
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
        {/* Top header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center gap-4 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition text-gray-600">
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-sm text-gray-500 hidden sm:flex">
            <span>Admin</span>
            {pathname !== '/ztf-control-2026' && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-[#0A1628] font-semibold capitalize">
                  {pathname?.split('/').pop()?.replace(/-/g, ' ')}
                </span>
              </>
            )}
          </div>

          <div className="ml-auto flex items-center gap-3">
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
