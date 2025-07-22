export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
}

export interface Book {
  id: string;
  title: string;
  subject: string;
  semester: number;
  coverImage: string;
  pdfUrl: string;
  author?: string;
  uploadDate: string;
}

export interface Subject {
  id: string;
  name: string;
  semester: number;
  books: Book[];
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export interface AppContextType {
  books: Book[];
  subjects: Subject[];
  selectedSemester: number;
  setSelectedSemester: (semester: number) => void;
  addBook: (book: Omit<Book, 'id' | 'uploadDate'>) => void;
  deleteBook: (bookId: string) => void;
}