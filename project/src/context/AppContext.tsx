import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Book, Subject, AppContextType } from '../types';
import { useAuth } from './AuthContext';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadBooks();
    }
  }, [user]);

  const loadBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading books:', error);
        return;
      }

      if (data) {
        const formattedBooks: Book[] = data.map(book => ({
          id: book.id,
          title: book.title,
          subject: book.subject,
          semester: book.semester,
          author: book.author,
          coverImage: book.cover_image_url || 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=300',
          pdfUrl: book.pdf_url,
          uploadDate: book.created_at.split('T')[0]
        }));

        setBooks(formattedBooks);
        updateSubjects(formattedBooks);
      }
    } catch (error) {
      console.error('Error loading books:', error);
    }
  };

  const updateSubjects = (booksList: Book[]) => {
    const subjectMap = new Map<string, Subject>();

    booksList.forEach(book => {
      const key = `${book.subject}-${book.semester}`;
      if (subjectMap.has(key)) {
        subjectMap.get(key)!.books.push(book);
      } else {
        subjectMap.set(key, {
          id: key,
          name: book.subject,
          semester: book.semester,
          books: [book]
        });
      }
    });

    setSubjects(Array.from(subjectMap.values()));
  };

  const addBook = async (bookData: Omit<Book, 'id' | 'uploadDate'>) => {
    if (!user) {
      throw new Error('User must be logged in to add books');
    }

    try {
      console.log('🔄 Adding book to database...');
      console.log('📝 Book data:', bookData);
      console.log('👤 User ID:', user.id);

      // Ensure user profile exists in the database
      console.log('🔍 Checking user profile in database...');
      const { data: userCheck, error: userError } = await supabase
        .from('users')
        .select('id, role')
        .eq('id', user.id)
        .single();

      if (userError && userError.code === 'PGRST116') {
        // User profile doesn't exist, create it
        console.log('🔧 User profile not found, creating...');
        try {
          const { data: authUser } = await supabase.auth.getUser();
          if (authUser.user) {
            const { error: createError } = await supabase.from('users').insert({
              id: authUser.user.id,
              full_name: user.name,
              email: user.email,
              role: user.role
            });
            
            if (createError) {
              console.error('❌ Failed to create user profile:', createError);
              // Continue anyway - the new RLS policies should allow upload
              console.log('⚠️ Continuing with upload despite profile creation failure...');
            } else {
              console.log('✅ User profile created successfully');
            }
          }
        } catch (profileError) {
          console.error('❌ Profile creation failed:', profileError);
          // Continue anyway - the new RLS policies should allow upload
          console.log('⚠️ Continuing with upload despite profile creation failure...');
        }
      } else if (userCheck) {
        console.log('✅ User profile verified in database:', userCheck);
      } else {
        console.warn('⚠️ Unexpected user check result:', userError);
      }

      const { data, error } = await supabase
        .from('books')
        .insert({
          title: bookData.title,
          subject: bookData.subject,
          semester: bookData.semester,
          author: bookData.author,
          cover_image_url: bookData.coverImage,
          pdf_url: bookData.pdfUrl,
          uploaded_by: user.id  // This is required by RLS policy
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Database error adding book:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // Provide more specific error messages for RLS violations
        if (error.message.includes('row-level security policy')) {
          throw new Error('Permission denied: You may not have the required permissions to upload books. Please log out and log back in, or contact an administrator.');
        }
        
        throw error;
      }

      if (data) {
        console.log('✅ Book added successfully to database:', data.id);
        const newBook: Book = {
          id: data.id,
          title: data.title,
          subject: data.subject,
          semester: data.semester,
          coverImage: data.cover_image_url || 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=300',
          pdfUrl: data.pdf_url,
          author: data.author,
          uploadDate: data.created_at.split('T')[0]
        };

        const updatedBooks = [newBook, ...books];
        setBooks(updatedBooks);
        updateSubjects(updatedBooks);
        console.log('✅ Book added to local state successfully');
      }
    } catch (error) {
      console.error('Error adding book:', error);
      throw error;
    }
  };

  const deleteBook = async (bookId: string) => {
    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', bookId);

      if (error) {
        console.error('Error deleting book:', error);
        throw error;
      }

      const updatedBooks = books.filter(book => book.id !== bookId);
      setBooks(updatedBooks);
      updateSubjects(updatedBooks);
    } catch (error) {
      console.error('Error deleting book:', error);
      throw error;
    }
  };

  const value: AppContextType = {
    books,
    subjects,
    selectedSemester,
    setSelectedSemester,
    addBook,
    deleteBook
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};