import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Upload, Check, AlertCircle, Bug } from 'lucide-react';
import { debugAuthStatus } from '../../utils/debugAuth';

const BookUpload: React.FC = () => {
  const { addBook } = useApp();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    semester: 1,
    author: '',
    coverImage: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [connectionError, setConnectionError] = useState(false);

  const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if Supabase is connected
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      setConnectionError(true);
      alert('Supabase is not connected. Please click "Connect to Supabase" in the top right corner.');
      return;
    }

    if (!selectedFile) {
      alert('Please select a PDF file to upload');
      return;
    }

    if (!user) {
      alert('You must be logged in to upload books');
      return;
    }

    setIsUploading(true);
    setConnectionError(false);
    setUploadProgress(0);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('books')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        
        if (uploadError.message.includes('not found') || uploadError.message.includes('bucket')) {
          alert('Storage bucket not found. Please ensure your Supabase project is properly configured with a "books" storage bucket.');
        } else {
          alert(`Failed to upload PDF file: ${uploadError.message}`);
        }
        return;
      }

      console.log('📁 Upload successful, file path:', uploadData.path);
      setUploadProgress(50);

      const { data: { publicUrl } } = supabase.storage
        .from('books')
        .getPublicUrl(uploadData.path);

      console.log('🔗 Public URL generated:', publicUrl ? 'Success' : 'Failed');
      setUploadProgress(75);

      // Create book data with proper structure for database
      const bookData = {
        title: formData.title,
        subject: formData.subject,
        semester: formData.semester,
        author: formData.author || null,
        coverImage: formData.coverImage || 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=300',
        pdfUrl: publicUrl
      };

      console.log('📦 Book Data for addBook:', bookData);
      console.log('👤 Current user ID:', user.id);

      await addBook(bookData);

      setUploadProgress(100);
      setShowSuccess(true);

      // Reset form
      setFormData({
        title: '',
        subject: '',
        semester: 1,
        author: '',
        coverImage: ''
      });
      setSelectedFile(null);

      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error uploading book:', error);
      alert(`Failed to upload book: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'semester' ? Number(value) : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please select a valid PDF file');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert(`File size (${formatFileSize(file.size)}) exceeds max limit of ${formatFileSize(MAX_FILE_SIZE)}`);
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload New Book</h2>

      {/* Connection Error Warning */}
      {connectionError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-red-800">
            <p className="font-medium mb-1">Supabase Not Connected</p>
            <p className="text-sm">Please click the "Connect to Supabase" button in the top right corner to set up your database connection.</p>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <Check className="h-5 w-5 text-green-600" />
          <span className="text-green-800">Book uploaded successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Book Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300"
              placeholder="Enter book title"
            />
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300"
              placeholder="Enter subject"
            />
          </div>

          {/* Semester */}
          <div>
            <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-2">
              Semester *
            </label>
            <select
              id="semester"
              name="semester"
              value={formData.semester}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300"
            >
              {Array.from({ length: 8 }, (_, i) => (
                <option key={i + 1} value={i + 1}>Semester {i + 1}</option>
              ))}
            </select>
          </div>

          {/* Author */}
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
              Author
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300"
              placeholder="Enter author name"
            />
          </div>
        </div>

        {/* Cover Image */}
        <div>
          <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-2">
            Cover Image URL
          </label>
          <input
            type="url"
            id="coverImage"
            name="coverImage"
            value={formData.coverImage}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300"
            placeholder="Optional"
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PDF File *
          </label>
          <p className="text-sm text-gray-500 mb-2">Max: {formatFileSize(MAX_FILE_SIZE)}</p>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              {selectedFile ? selectedFile.name : 'Click to upload PDF'}
            </p>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="pdf-upload"
              required
            />
            <label
              htmlFor="pdf-upload"
              className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer"
            >
              {selectedFile ? 'Change File' : 'Choose File'}
            </label>
          </div>
          {selectedFile && (
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-green-600">✓ File selected</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  const input = document.getElementById('pdf-upload') as HTMLInputElement;
                  if (input) input.value = '';
                }}
                className="text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {isUploading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between mb-2 text-blue-800 text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Debug Button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={debugAuthStatus}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            <Bug className="h-4 w-4" />
            Debug Auth Status
          </button>
        </div>

        {/* Submit/Reset Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            disabled={isUploading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : 'Upload Book'}
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({ title: '', subject: '', semester: 1, author: '', coverImage: '' });
              setSelectedFile(null);
            }}
            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookUpload;
