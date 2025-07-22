import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { Home, BookOpen, Settings, Users, Upload, X } from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { isOpen, close } = useSidebar();

  const studentLinks = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/books', icon: BookOpen, label: 'My Books' },
  ];

  const adminLinks = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/books', icon: BookOpen, label: 'All Books' },
    { to: '/admin', icon: Settings, label: 'Admin Panel' },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={close}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-sm border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile close button */}
        <div className="lg:hidden flex justify-end p-4">
          <button
            onClick={close}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-2 lg:mt-6 px-4">
          <div className="space-y-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => {
                  // Close sidebar on mobile when navigating
                  if (window.innerWidth < 1024) {
                    close();
                  }
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;