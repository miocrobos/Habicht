'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Trophy } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 sm:py-12 px-3 sm:px-4">
      <div className="max-w-4xl w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white">{t('auth.register.title')}</h2>
          <p className="mt-2 sm:mt-3 text-sm sm:text-lg text-gray-600 dark:text-gray-400">{t('auth.register.subtitle')}</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {/* Player Card */}
          <button
            onClick={() => router.push('/auth/register/player')}
            className="group bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-8 hover:shadow-xl sm:hover:shadow-2xl transition-all hover:scale-[1.02] sm:hover:scale-105 border-2 border-transparent hover:border-red-500 active:scale-[0.98]"
          >
            <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition">
                <Trophy className="w-8 h-8 sm:w-12 sm:h-12 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{t('auth.register.player')}</h3>
              <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400 line-clamp-3 sm:line-clamp-none">
                {t('auth.register.playerDescription')}
              </p>
              <div className="pt-2 sm:pt-4">
                <span className="inline-flex items-center text-sm sm:text-base text-red-600 dark:text-red-400 font-semibold group-hover:gap-2 transition-all">
                  {t('auth.register.registerAsPlayer')}
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </div>
            </div>
          </button>

          {/* Hybrid Card */}
          <button
            onClick={() => router.push('/auth/register/hybrid')}
            className="group bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-8 hover:shadow-xl sm:hover:shadow-2xl transition-all hover:scale-[1.02] sm:hover:scale-105 border-2 border-transparent hover:border-orange-500 active:scale-[0.98]"
          >
            <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition">
                <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                  <Trophy className="w-5 h-5 sm:w-8 sm:h-8 text-orange-600 dark:text-orange-400" />
                  <Users className="w-5 h-5 sm:w-8 sm:h-8 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{t('auth.register.hybrid')}</h3>
              <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400 line-clamp-3 sm:line-clamp-none">
                {t('auth.register.hybridDescription')}
              </p>
              <div className="pt-2 sm:pt-4">
                <span className="inline-flex items-center text-sm sm:text-base text-orange-600 dark:text-orange-400 font-semibold group-hover:gap-2 transition-all">
                  {t('auth.register.registerAsHybrid')}
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </div>
            </div>
          </button>

          {/* Recruiter Card */}
          <button
            onClick={() => router.push('/auth/register/recruiter')}
            className="group bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-8 hover:shadow-xl sm:hover:shadow-2xl transition-all hover:scale-[1.02] sm:hover:scale-105 border-2 border-transparent hover:border-blue-500 active:scale-[0.98]"
          >
            <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition">
                <Users className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{t('auth.register.recruiter')}</h3>
              <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400 line-clamp-3 sm:line-clamp-none">
                {t('auth.register.recruiterDescription')}
              </p>
              <div className="pt-2 sm:pt-4">
                <span className="inline-flex items-center text-sm sm:text-base text-blue-600 dark:text-blue-400 font-semibold group-hover:gap-2 transition-all">
                  {t('auth.register.registerAsRecruiter')}
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </div>
            </div>
          </button>
        </div>

        <p className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 pt-2 sm:pt-4">
          {t('auth.register.haveAccount')} <Link href="/auth/login" className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium">{t('auth.login.submit')}</Link>
        </p>
      </div>
    </div>
  );
}
