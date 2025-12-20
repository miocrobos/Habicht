'use client'

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PrivacyPolicy() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <Link href="/" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 mb-6 inline-block">
          {t('privacy.backToHome')}
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          {t('privacy.title')}
        </h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {t('privacy.lastUpdated')} {new Date().toLocaleDateString('de-CH')}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('privacy.section1Title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Habicht Volleyball<br />
              Schwiiz<br />
              {t('privacy.section1Contact')} <a href="mailto:support@habicht-volleyball.ch" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">support@habicht-volleyball.ch</a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('privacy.section2Title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('privacy.section2Intro')}
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>{t('privacy.section2Item1')}</li>
              <li>{t('privacy.section2Item2')}</li>
              <li>{t('privacy.section2Item3')}</li>
              <li>{t('privacy.section2Item4')}</li>
              <li>{t('privacy.section2Item5')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('privacy.section3Title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('privacy.section3Intro')}
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>{t('privacy.section3Item1')}</li>
              <li>{t('privacy.section3Item2')}</li>
              <li>{t('privacy.section3Item3')}</li>
              <li>{t('privacy.section3Item4')}</li>
              <li>{t('privacy.section3Item5')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('privacy.section4Title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('privacy.section4Intro')}
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>{t('privacy.section4Item1')}</li>
              <li>{t('privacy.section4Item2')}</li>
              <li>{t('privacy.section4Item3')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('privacy.section5Title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('privacy.section5Intro')}
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>{t('privacy.section5Item1')}</li>
              <li>{t('privacy.section5Item2')}</li>
              <li>{t('privacy.section5Item3')}</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('privacy.section5Note')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('privacy.section6Title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('privacy.section6Text')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('privacy.section7Title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('privacy.section7Intro')}
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li><strong>{t('privacy.section7Item1Title')}</strong> {t('privacy.section7Item1Text')}</li>
              <li><strong>{t('privacy.section7Item2Title')}</strong> {t('privacy.section7Item2Text')}</li>
              <li><strong>{t('privacy.section7Item3Title')}</strong> {t('privacy.section7Item3Text')}</li>
              <li><strong>{t('privacy.section7Item4Title')}</strong> {t('privacy.section7Item4Text')}</li>
              <li><strong>{t('privacy.section7Item5Title')}</strong> {t('privacy.section7Item5Text')}</li>
              <li><strong>{t('privacy.section7Item6Title')}</strong> {t('privacy.section7Item6Text')}</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('privacy.section7Contact')} <br />
              <a href="mailto:support@habicht-volleyball.ch" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                support@habicht-volleyball.ch
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('privacy.section8Title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('privacy.section8Text')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('privacy.section9Title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('privacy.section9Text')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('privacy.section10Title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('privacy.section10Text')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('privacy.section11Title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('privacy.section11Intro')}
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('privacy.section11Authority')}<br />
              Feldeggweg 1<br />
              3003 Bern<br />
              Schwiiz<br />
              <a href="https://www.edoeb.admin.ch" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                www.edoeb.admin.ch
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
