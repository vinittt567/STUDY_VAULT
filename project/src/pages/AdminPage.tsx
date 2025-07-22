import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import BookUpload from '../components/admin/BookUpload';
import BookManagement from '../components/admin/BookManagement';
import { Upload, BookOpen, Users, BarChart3 } from 'lucide-react';

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const { books, subjects } = useApp();
  const [activeTab, setActiveTab] = useState<'upload' | 'manage'>('upload');

  // Redirect if not admin
  if (user?.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Books',
      value: books.length,
      icon: BookOpen,
      color: 'bg-blue-500'
    },
    {
      label: 'Subjects',
      value: subjects.length,
      icon: BarChart3,
      color: 'bg-green-500'
    },
    {
      label: 'Active Users',
      value: '24',
      icon: Users,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
        <p className="text-gray-600">Manage books and system settings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-2 sm:p-3 rounded-lg`}>
                <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6 sm:mb-8">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'upload'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Upload className="h-4 w-4 inline mr-2" />
            Upload Books
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'manage'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BookOpen className="h-4 w-4 inline mr-2" />
            Manage Books
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'upload' && <BookUpload />}
        {activeTab === 'manage' && <BookManagement />}
      </div>
    </div>
  );
};

export default AdminPage;