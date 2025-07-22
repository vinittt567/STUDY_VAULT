import React from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import BookCard from '../components/books/BookCard';
import EmptyState from '../components/common/EmptyState';

const BooksPage: React.FC = () => {
  const { semester, subject } = useParams<{ semester: string; subject: string }>();
  const { books } = useApp();

  const filteredBooks = books.filter(book => {
    if (semester && subject) {
      return book.semester === Number(semester) && book.subject === subject;
    }
    return true;
  });

  if (filteredBooks.length === 0) {
    return (
      <EmptyState 
        title="No books available yet!"
        description="Books for this subject haven't been added yet. Please check back later."
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {subject ? `${subject} - Semester ${semester}` : 'My Books'}
        </h1>
        <p className="text-gray-600">
          {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'} available
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredBooks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
};

export default BooksPage;