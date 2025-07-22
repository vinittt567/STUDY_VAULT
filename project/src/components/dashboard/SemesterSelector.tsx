import React from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronDown } from 'lucide-react';

const SemesterSelector: React.FC = () => {
  const { selectedSemester, setSelectedSemester } = useApp();

  const semesters = Array.from({ length: 8 }, (_, i) => i + 1);

  return (
    <div className="mb-8">
      <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-2">
        Select Semester
      </label>
      <div className="relative">
        <select
          id="semester"
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(Number(e.target.value))}
          className="w-full sm:w-auto px-4 py-3 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none bg-white"
        >
          {semesters.map((sem) => (
            <option key={sem} value={sem}>
              Semester {sem}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
      </div>
    </div>
  );
};

export default SemesterSelector;