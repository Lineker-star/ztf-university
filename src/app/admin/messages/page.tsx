export default function AdminMessagesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0A1628] font-heading">Contact Messages</h1>
        <p className="text-gray-500 text-sm mt-1">View and manage messages from the contact form</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
        <p className="text-gray-400 mb-4">Connect your Supabase database to view contact messages here.</p>
      </div>
    </div>
  );
}
