import React from 'react';
import { LineChart, TrendingUp } from 'lucide-react';
import { ChartType } from '@/app/types/coin';

interface ChartToggleProps {
  activeChart: ChartType;
  onToggle: (type: ChartType) => void;
}


export const ChartToggle = ({ activeChart, onToggle }: ChartToggleProps) => {
  return (
    <div className="flex mt-4 mb-4">
      <div className="bg-gray-800/50 p-1 rounded-lg flex gap-1">
        <button
          onClick={() => onToggle('bcurve')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${
            activeChart === 'bcurve'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          MK Chart
        </button>
        <button
          onClick={() => onToggle('current')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${
            activeChart === 'current'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <LineChart className="w-4 h-4" />
          Current
        </button>
      </div>
    </div>
  );
};