import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Subject } from '../../types';
import { BookOpen, ChevronRight } from 'lucide-react';

interface SubjectCardProps {
  subject: Subject;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/books/${subject.semester}/${subject.name}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-lg">
            <BookOpen className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{subject.name}</h3>
            <p className="text-sm text-gray-600">Semester {subject.semester}</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          {subject.books.length} {subject.books.length === 1 ? 'book' : 'books'}
        </span>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
          Available
        </span>
      </div>
    </div>
  );
};

export default SubjectCard;