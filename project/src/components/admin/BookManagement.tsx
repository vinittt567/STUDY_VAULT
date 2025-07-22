import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Book } from '../../types';
import { Edit, Trash2, Eye, Search } from 'lucide-react';

const BookManagement: React.FC = () => {
  const { books, deleteBook } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSemester, setFilterSemester] = useState<number | 'all'>('all');

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester = filterSemester === 'all' || book.semester === filterSemester;
    return matchesSearch && matchesSemester;
  });

  const handleDelete = (bookId: string) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      deleteBook(bookId);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Manage Books</h2>
      
      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <select
          value={filterSemester}
          onChange={(e) => setFilterSemester(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Semesters</option>
          {Array.from({ length: 8 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              Semester {i + 1}
            </option>
          ))}
        </select>
      </div>

      {/* Books Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Book
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subject
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Semester
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Upload Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBooks.map((book) => (
              <tr key={book.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="h-16 w-12 object-cover rounded-lg mr-4"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {book.title}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {book.subject}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {book.semester}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {book.author || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(book.uploadDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button className="text-blue-600 hover:text-blue-800 p-1 rounded">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 p-1 rounded">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(book.id)}
                      className="text-red-600 hover:text-red-800 p-1 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No books found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default BookManagement;