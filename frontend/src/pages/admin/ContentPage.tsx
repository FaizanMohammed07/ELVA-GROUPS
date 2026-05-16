export default function AdminContentPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 font-sans">Content Management</h1>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-700 font-sans mb-4">Hero Banners</h2>
          <p className="text-sm text-gray-400 font-sans">Manage homepage banners, promotions, and seasonal campaigns.</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-700 font-sans mb-4">Blog Posts</h2>
          <p className="text-sm text-gray-400 font-sans">Create and manage blog articles, gift guides, and brand stories.</p>
        </div>
      </div>
    </div>
  );
}
