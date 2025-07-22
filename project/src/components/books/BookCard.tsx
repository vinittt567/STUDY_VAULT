import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Book } from '../../types';
import { BookOpen, Calendar, User, Download } from 'lucide-react';

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const navigate = useNavigate();

  const handleRead = () => {
    navigate(`/reader/${book.id}`);
  };

  const handleDownload = () => {
    // Create a temporary link element to trigger download
    const link = document.createElement('a');
    link.href = book.pdfUrl;
    link.download = `${book.title}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-[3/4] bg-gray-100">
        <img
          src={book.coverImage}
          alt={book.title}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="p-6">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{book.title}</h3>
        
        {book.author && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <User className="h-4 w-4" />
            <span>{book.author}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Calendar className="h-4 w-4" />
          <span>Added {new Date(book.uploadDate).toLocaleDateString()}</span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleRead}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Read
          </button>
          <button
            onClick={handleDownload}
            className="bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            title="Download PDF"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;