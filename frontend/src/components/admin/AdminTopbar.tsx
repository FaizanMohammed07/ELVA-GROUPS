import { Bell, Search } from 'lucide-react';
import { useAuthStore } from '@store/authStore';

export const AdminTopbar = () => {
  const { user } = useAuthStore();
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <Search size={16} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search orders, products, customers..."
          className="flex-1 text-sm text-gray-600 placeholder-gray-400 focus:outline-none font-sans"
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:text-gray-700">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gold-500 text-white flex items-center justify-center text-sm font-semibold rounded-full">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900 font-sans">{user?.name}</p>
            <p className="text-xs text-gray-500 font-sans capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
