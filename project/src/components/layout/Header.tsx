import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { BookOpen, LogOut, User, Settings, Menu } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { toggle } = useSidebar();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={toggle}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">StudyVault</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <User className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              {user?.role === 'admin' && (
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                  Admin
                </span>
              )}
            </div>
            
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;