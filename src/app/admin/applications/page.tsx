import AdminApplicationsClient from './AdminApplicationsClient';

export default function AdminApplicationsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0A1628] font-heading">Applications</h1>
        <p className="text-gray-500 text-sm mt-1">Manage student admission applications</p>
      </div>
      <AdminApplicationsClient />
    </div>
  );
}
