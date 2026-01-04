'use client';

import { SWISS_LEAGUES } from '@/lib/constants/leagues';
import { useLanguage } from '@/contexts/LanguageContext';

interface MultiLeagueSelectorProps {
  selectedLeagues: string[];
  onChange: (leagues: string[]) => void;
  disabled?: boolean;
  className?: string;
}

export default function MultiLeagueSelector({
  selectedLeagues,
  onChange,
  disabled = false,
  className = '',
}: MultiLeagueSelectorProps) {
  const { t } = useLanguage();

  const handleLeagueToggle = (leagueValue: string) => {
    if (disabled) return;
    
    if (selectedLeagues.includes(leagueValue)) {
      onChange(selectedLeagues.filter(l => l !== leagueValue));
    } else {
      onChange([...selectedLeagues, leagueValue]);
    }
  };

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2 ${className}`}>
      {SWISS_LEAGUES.map((league) => {
        const isSelected = selectedLeagues.includes(league.value);
        return (
          <label
            key={league.value}
            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition border ${
              isSelected
                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-500'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleLeagueToggle(league.value)}
              disabled={disabled}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
            />
            <span className="text-sm font-medium">{league.label}</span>
          </label>
        );
      })}
    </div>
  );
}
