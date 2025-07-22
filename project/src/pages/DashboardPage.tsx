import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import SemesterSelector from '../components/dashboard/SemesterSelector';
import SubjectCard from '../components/dashboard/SubjectCard';
import EmptyState from '../components/common/EmptyState';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { subjects, selectedSemester } = useApp();

  const semesterSubjects = subjects.filter(subject => subject.semester === selectedSemester);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Hi {user?.name} 👋
        </h1>
        <p className="text-gray-600">Welcome to your study dashboard</p>
      </div>

      <SemesterSelector />

      {semesterSubjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {semesterSubjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      ) : (
        <EmptyState 
          title={`No subjects available for Semester ${selectedSemester}`}
          description="Books for this semester haven't been added yet. Please check back later."
          showBackButton={false}
        />
      )}
    </div>
  );
};

export default DashboardPage;