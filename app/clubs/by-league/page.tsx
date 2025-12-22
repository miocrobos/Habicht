'use client';
import ClubsByLeague from '@/components/clubs/ClubsByLeague';
import { Trophy } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ClubsByLeaguePage() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            {t('playerProfile.clubsByLeague')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {t('playerProfile.clubsByLeagueDesc')}
          </p>
        </div>

        <ClubsByLeague />
      </div>
    </div>
  );
}
