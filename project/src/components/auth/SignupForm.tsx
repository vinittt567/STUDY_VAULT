import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

interface SignupFormProps {
  onToggleMode: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onToggleMode }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { signup, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const result = await signup(name, email, password);
    if (!result.success) {
      setError(result.error || 'Failed to create account. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-50 to-indigo-100 items-center justify-center p-12">
        <div className="max-w-md text-center">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-blue-600 p-3 rounded-xl mr-3">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Study Vault</h1>
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Join the knowledge revolution.</h2>
          
          {/* Illustration */}
          <div className="relative">
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <div className="flex items-center justify-center">
                {/* Safe/Vault illustration */}
                <div className="relative">
                  <div className="w-48 h-48 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <div className="w-20 h-20 border-8 border-green-200 rounded-full flex items-center justify-center">
                      <div className="w-8 h-8 bg-green-200 rounded-full"></div>
                    </div>
                    {/* Vault handle */}
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-12 bg-green-300 rounded-full"></div>
                  </div>
                  
                  {/* Student character */}
                  <div className="absolute -bottom-4 -right-8">
                    <div className="relative">
                      {/* Body */}
                      <div className="w-16 h-20 bg-green-500 rounded-t-full"></div>
                      {/* Head */}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-orange-200 rounded-full"></div>
                      {/* Hair */}
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-14 h-8 bg-gray-800 rounded-t-full"></div>
                      {/* Book */}
                      <div className="absolute top-2 -left-2 w-8 h-6 bg-white rounded shadow-md transform -rotate-12"></div>
                      {/* Arms */}
                      <div className="absolute top-4 -left-3 w-6 h-3 bg-orange-200 rounded-full transform -rotate-45"></div>
                      <div className="absolute top-4 -right-3 w-6 h-3 bg-orange-200 rounded-full transform rotate-45"></div>
                      {/* Legs */}
                      <div className="absolute bottom-0 left-2 w-4 h-8 bg-gray-800 rounded-b-full"></div>
                      <div className="absolute bottom-0 right-2 w-4 h-8 bg-gray-800 rounded-b-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="bg-blue-600 p-3 rounded-xl mr-3">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Study Vault</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-600">Join thousands of students already learning</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="Confirm your password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <div className="text-red-600 text-sm">
                  <p className="font-medium mb-1">{error}</p>
                  {error.includes('already exists') ? (
                    <div className="text-xs text-red-500 space-y-1">
                      <p>• Click "Already have an account? Sign in" below</p>
                      <p>• Use the login form with your existing credentials</p>
                    </div>
                  ) : error.includes('connect to Supabase') ? (
                    <div className="text-xs text-red-500 space-y-1">
                      <p>• Click "Connect to Supabase" button in the top right</p>
                      <p>• Set up your database connection first</p>
                    </div>
                  ) : (
                    <div className="text-xs text-red-500 space-y-1">
                      <p>• Make sure your password is at least 6 characters</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={onToggleMode}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Already have an account? Sign in
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">© 2025 Study Vault. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;