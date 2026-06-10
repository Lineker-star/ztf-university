import type { Metadata } from 'next';
import '@/app/globals.css';
import AdminLayoutClient from './AdminLayoutClient';

export const metadata: Metadata = {
  title: 'Management Portal',
  description: 'Authorized Personnel Only',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen">
        <AdminLayoutClient>{children}</AdminLayoutClient>
      </body>
    </html>
  );
}
