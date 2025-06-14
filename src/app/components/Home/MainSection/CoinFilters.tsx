// src/app/components/Home/MainSection/CoinFilters.tsx

'use client';
import { useEffect } from 'react';
import { FaCircle } from 'react-icons/fa6';

const filterOptions = [
  { value: 'trending', label: 'Trending', icon: '🔥' },
  { value: 'new', label: 'New', icon: '🌱' },
  { value: 'min_progress', label: 'Min progress', icon: '🔽' },
  { value: 'max_progress', label: 'Max progress', icon: '🔼' },
  { value: 'finalized', label: 'Finalized', icon: '🏁' },
] as const;

type FilterValue = typeof filterOptions[number]['value'];

interface CoinFiltersProps {
  selectedFilter: FilterValue;
  onFilterChange: (filter: FilterValue) => void;
  isLoading?: boolean;
}

export const CoinFilters = ({ 
  selectedFilter, 
  onFilterChange, 
  isLoading = false 
}: CoinFiltersProps) => {
  
  // Handle filter button clicks
  const handleFilterClick = (value: FilterValue) => {
    // Save to localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedFilter', value);
    }
    
    // Notify parent component
    onFilterChange(value);
  };

  // Load saved filter from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFilter = localStorage.getItem('selectedFilter') as FilterValue;
      if (savedFilter && filterOptions.some(option => option.value === savedFilter)) {
        onFilterChange(savedFilter);
      }
    }
  }, [onFilterChange]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-none sm:flex flex-wrap gap-2 mb-4">
      {filterOptions.map((option, index) => (
        <button
          key={option.value}
          onClick={() => handleFilterClick(option.value)}
          disabled={isLoading} // Disable during loading to prevent rapid clicks
          className={`
            inline-flex items-center justify-between px-3 py-1 sm:px-4 sm:py-2 
            rounded-full text-sm sm:text-base transition-all duration-200
            ${index === 0 ? 'col-span-2' : ''} 
            ${
              selectedFilter === option.value
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
            }
            ${isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <div className="flex items-center">
            <span className="mr-1.5 sm:mr-2">{option.icon}</span>
            {option.label}
            {/* Subtle loading indicator */}
            {isLoading && selectedFilter === option.value && (
              <span className="ml-2 w-2 h-2 bg-white rounded-full animate-pulse"></span>
            )}
          </div>

          {selectedFilter === option.value && !isLoading && (
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full">
              <FaCircle className="text-indigo-200"/>
            </span>
          )}
        </button>
      ))}
    </div>
  );
};