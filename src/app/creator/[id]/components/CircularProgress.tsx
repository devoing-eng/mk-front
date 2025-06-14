import { useCoinMetrics } from '@/app/hooks/useCoinMetrics';
import Image from 'next/image';

export default function CircularProgress({ coinId }: { coinId: string }) {
  
  const { progress } = useCoinMetrics(coinId);
  
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  if (progress >= 100) {
    return (
      <div className="w-[40px] h-[40px] rounded-full bg-gradient-to-r from-rose-50 to-rose-100 flex items-center justify-center">
        <Image
          src="/images/uniswap-logo.svg"
          alt="Completed"
          width={28}
          height={28}
        />
      </div>
    );
  }
  
  return (
    <div className="relative w-[48px] h-[48px]">
      <svg className="w-full h-full transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          className="text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-green-400 transition-all duration-300"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};