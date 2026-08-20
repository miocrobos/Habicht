'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function AboutPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-12">
      <div className="container mx-auto px-3 sm:px-4 max-w-4xl">
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">{t('about.title')}</h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-8 mb-4 sm:mb-8">
          <h2 className="text-lg sm:text-2xl font-semibold dark:text-white mb-3 sm:mb-4">{t('about.what.title')}</h2>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-3 sm:mb-4">
            {t('about.what.description1')}
          </p>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-3 sm:mb-4">
            {t('about.what.description2')}
          </p>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
            Habicht unterstützt Swiss Volley, Clubs, Coaches und aufstrebende Athletinnen und Athleten dabei, die wichtigsten Entwicklungen im Schweizer Volleyball sichtbar zu machen und die nächsten Schritte einfacher zu finden.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-8 mb-4 sm:mb-8">
          <h2 className="text-lg sm:text-2xl font-semibold dark:text-white mb-3 sm:mb-4">{t('about.mission.title')}</h2>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {t('about.mission.description')}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-8 mb-4 sm:mb-8">
          <h2 className="text-lg sm:text-2xl font-semibold dark:text-white mb-3 sm:mb-4">{t('about.features.title')}</h2>
          <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
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

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-8 mb-4 sm:mb-8">
          <h2 className="text-lg sm:text-2xl font-semibold dark:text-white mb-3 sm:mb-4">Mehr entdecken</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/clubs" className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
              Clubs durchsuchen
            </Link>
            <Link href="/players" className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100">
              Spieler entdecken
            </Link>
            <Link href="/contact" className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100">
              Kontakt
            </Link>
            <Link href="/faq" className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100">
              FAQ
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-8">
          <h2 className="text-lg sm:text-2xl font-semibold dark:text-white mb-3 sm:mb-4">{t('about.contact.title')}</h2>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-3 sm:mb-4">
            {t('about.contact.description')}
          </p>
          <div className="space-y-2 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            <p><strong>{t('about.contact.email')}:</strong> info@habicht-volleyball.ch</p>
            <p className="break-all"><strong>GitHub:</strong> <a href="https://github.com/miocrobos/UniSports" className="text-habicht-600 hover:underline">github.com/miocrobos/UniSports</a></p>
          </div>
        </div>
      </div>
    </div>
  )
}
