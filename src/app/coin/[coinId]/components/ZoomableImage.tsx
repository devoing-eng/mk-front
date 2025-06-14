// src/app/coin/[coinId]/components/ZoomableImage.tsx

import { useState } from 'react';
import Image from 'next/image';

interface ZoomableImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  expandedScale?: number;
}

export const ZoomableImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  className = '',
  expandedScale = 2 
}: ZoomableImageProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="inline-block">
      <div 
        className="cursor-pointer transition-all duration-300"
        style={{ 
          width: isExpanded ? width * expandedScale : width,
          height: isExpanded ? height * expandedScale : height
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Image
          src={src}
          alt={alt}
          width={isExpanded ? width * expandedScale : width}
          height={isExpanded ? height * expandedScale : height}
          className={`${className} w-full h-full`}
        />
      </div>
    </div>
  );
};