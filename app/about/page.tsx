'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function AboutPage() {
  const { t } = useLanguage()
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">{t('about.title')}</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold dark:text-white mb-4">{t('about.what.title')}</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {t('about.what.description1')}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            {t('about.what.description2')}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold dark:text-white mb-4">{t('about.mission.title')}</h2>
          <p className="text-gray-700 dark:text-gray-300">
            {t('about.mission.description')}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold dark:text-white mb-4">{t('about.features.title')}</h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <span className="text-habicht-600 mr-2">•</span>
              <span>{t('about.features.item1')}</span>
            </li>
            <li className="flex items-start">
              <span className="text-habicht-600 mr-2">•</span>
              <span>{t('about.features.item2')}</span>
            </li>
            <li className="flex items-start">
              <span className="text-habicht-600 mr-2">•</span>
              <span>{t('about.features.item3')}</span>
            </li>
            <li className="flex items-start">
              <span className="text-habicht-600 mr-2">•</span>
              <span>{t('about.features.item4')}</span>
            </li>
            <li className="flex items-start">
              <span className="text-habicht-600 mr-2">•</span>
              <span>{t('about.features.item5')}</span>
            </li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold dark:text-white mb-4">{t('about.contact.title')}</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {t('about.contact.description')}
          </p>
          <div className="space-y-2 text-gray-700 dark:text-gray-300">
            <p><strong>{t('about.contact.email')}:</strong> info@habicht-volleyball.ch</p>
            <p><strong>GitHub:</strong> <a href="https://github.com/miocrobos/UniSports" className="text-habicht-600 hover:underline">github.com/miocrobos/UniSports</a></p>
          </div>
        </div>
      </div>
    </div>
  )
}
