import React from 'react';

interface StepIndicatorProps {
  step: number;
  total: number;
  color?: string; // e.g. 'red', 'blue', 'purple'
}

const colorMap: Record<string, string> = {
  red: 'bg-red-600',
  blue: 'bg-blue-600',
  purple: 'bg-purple-600',
  green: 'bg-green-600',
  yellow: 'bg-yellow-500',
  gray: 'bg-gray-400',
};

export default function StepIndicator({ step, total, color = 'red' }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <React.Fragment key={i}>
          <div
            className={`w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold 
              ${step === i + 1 ? colorMap[color] + ' text-white' : 'bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}
            `}
          >
            {i + 1}
          </div>
          {i < total - 1 && (
            <div className="h-1 w-12 bg-gray-400 dark:bg-gray-600 rounded" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
