import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  title = "No books available yet!",
  description = "Check back later for new additions to the library.",
  showBackButton = true
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[50vh] sm:min-h-screen bg-amber-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto p-4 sm:p-8">
        <div className="bg-white rounded-full p-4 sm:p-6 w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 shadow-sm">
          <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 text-amber-600 mx-auto" />
        </div>
        
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">{title}</h2>
        <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">{description}</p>
        
        {showBackButton && (
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;