'use client'

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TermsOfService() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <Link href="/" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 mb-6 inline-block">
          {t('terms.backToHome')}
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          {t('terms.title')}
        </h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {t('terms.lastUpdated')} {new Date().toLocaleDateString('de-CH')}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('terms.section1Title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('terms.section1Text')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('terms.section2Title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('terms.section2Text')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('terms.section3Title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('terms.section3Text')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('terms.section4Title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('terms.section4Text')} <Link href="/privacy" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 underline">{t('terms.section4Link')}</Link> {t('terms.section4Text2')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('terms.section5Title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('terms.section5Text')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('terms.section6Title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('terms.section6Text')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('terms.section7Title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('terms.section7Text')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('terms.section8Title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('terms.section8Text')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('terms.section9Title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('terms.section9Text')} <br />
              <a href="mailto:support@habicht-volleyball.ch" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                support@habicht-volleyball.ch
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
