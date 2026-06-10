'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, LayoutDashboard, FileText, Users, Image, BookOpen, MessageSquare, Settings, LogOut } from 'lucide-react';

const NAV = [
  { href: '/ztf-control-2026', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/ztf-control-2026/applications', label: 'Applications', icon: FileText },
  { href: '/ztf-control-2026/faculty', label: 'Faculty', icon: Users },
  { href: '/ztf-control-2026/blog', label: 'Blog Posts', icon: BookOpen },
  { href: '/ztf-control-2026/gallery', label: 'Gallery', icon: Image },
  { href: '/ztf-control-2026/messages', label: 'Messages', icon: MessageSquare },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0A1628] min-h-screen flex flex-col flex-shrink-0">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#C9A84C] rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-[#0A1628]" />
          </div>
          <div>
            <div className="text-white font-bold text-sm">ZTF University</div>
            <div className="text-[#C9A84C] text-xs">Admin Panel</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {NAV.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/ztf-control-2026' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                isActive ? 'bg-[#C9A84C] text-[#0A1628]' : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white text-sm transition">
          <LogOut className="w-4 h-4" />
          Back to Site
        </Link>
      </div>
    </aside>
  );
}
