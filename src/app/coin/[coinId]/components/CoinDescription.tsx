import { useState } from 'react';

interface CoinDescriptionProps {
    description: string | null;
    maxChars: number;
}

const CoinDescription = ({ description, maxChars = 200 }: CoinDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Check if description is long enough to truncate
  const needsTruncation = description && description.length > maxChars;
  
  // Get the appropriate description text based on expansion state
  const displayText = !needsTruncation || isExpanded 
    ? description 
    : `${description.substring(0, maxChars).trim()}...`;
  
  return (
    <div className="description-container">
      <p className="mt-1 break-all">{displayText}</p>
      
      {needsTruncation && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-500 hover:text-blue-700 text-sm font-medium mt-1 focus:outline-none cursor-pointer"
        >
          {isExpanded ? 'View less' : 'View more'}
        </button>
      )}
    </div>
  );
};

export default CoinDescription;