import React from 'react';

const PlaceholderChart = () => {
  // Generate points for a smoother, more modern wave
  const generateWavePath = () => {
    const width = 1000;
    const height = 400;
    const points = [];
    
    for (let x = 0; x <= width; x += 5) {
      // Create multiple overlapping sine waves for a more organic feel
      const y = (height / 2) + 
                Math.sin(x / 80) * 40 + 
                Math.sin(x / 120) * 30 + 
                Math.sin(x / 200) * 20;
      points.push(`${x},${y}`);
    }
    
    return `M${points.join(' L')}`;
  };

  return (
    <div className="relative w-full h-[400px] rounded-xl bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
      
      {/* Chart SVG */}
      <svg
        viewBox="0 0 1000 400"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id="grid-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(229, 231, 235)" stopOpacity="0.1" />
            <stop offset="100%" stopColor="rgb(229, 231, 235)" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="line-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines - more subtle and modern */}
        {[...Array(6)].map((_, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={i * 80 + 40}
            x2="1000"
            y2={i * 80 + 40}
            stroke="currentColor"
            strokeWidth="1"
            className="text-gray-200 dark:text-gray-700"
            strokeDasharray="4 4"
          />
        ))}
        {[...Array(8)].map((_, i) => (
          <line
            key={`v-${i}`}
            x1={i * 125}
            y1="0"
            x2={i * 125}
            y2="400"
            stroke="currentColor"
            strokeWidth="1"
            className="text-gray-200 dark:text-gray-700"
            strokeDasharray="4 4"
          />
        ))}
        
        {/* Area under the wave */}
        <path
          d={`${generateWavePath()} L1000,400 L0,400 Z`}
          fill="url(#line-gradient)"
          className="transition-opacity duration-300"
        />
        
        {/* Main wave line */}
        <path
          d={generateWavePath()}
          fill="none"
          stroke="#6366f1"
          strokeWidth="2.5"
          className="transition-all duration-300"
        />
        
        {/* Subtle dots at intersections */}
        {[...Array(6)].map((_, i) =>
          [...Array(8)].map((_, j) => (
            <circle
              key={`dot-${i}-${j}`}
              cx={j * 125}
              cy={i * 80 + 40}
              r="1.5"
              className="fill-gray-300 dark:fill-gray-600"
            />
          ))
        )}
      </svg>
    </div>
  );
};

export default PlaceholderChart;