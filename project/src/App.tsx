  import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { SidebarProvider } from './context/SidebarContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import BooksPage from './pages/BooksPage';
import AdminPage from './pages/AdminPage';
import ReaderPage from './pages/ReaderPage';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex h-screen pt-16">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <div className="p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

const AppRoutes: React.FC = () => {
  const { user, isLoading } = useAuth();

  console.log('🎯 AppRoutes render - isLoading:', isLoading, 'user:', user ? 'exists' : 'null');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading StudyVault...</p>
        </div>
      </div>
    );
  }

  console.log('🚀 Rendering app content - user:', user ? 'authenticated' : 'not authenticated');

  if (!user) {
    console.log('📝 Showing auth page');
    return <AuthPage />;
  }

  console.log('🏠 Showing main app');
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/books" element={<BooksPage />} />
        <Route path="/books/:semester/:subject" element={<BooksPage />} />
        <Route path="/reader/:bookId" element={<ReaderPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;