'use client'

import { useState } from 'react'
import { X, FileText, Download } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface CVExportLanguagePopupProps {
  onClose: () => void
  onExport: (language: string) => void
  userType: 'player' | 'recruiter' | 'hybrid'
}

export default function CVExportLanguagePopup({ onClose, onExport, userType }: CVExportLanguagePopupProps) {
  const { t } = useLanguage()
  const [selectedLang, setSelectedLang] = useState<string>('')

  const languages = [
    { code: 'en', name: t('playerProfile.cvLanguageEnglish'), flag: '🇬🇧' },
    { code: 'de', name: t('playerProfile.cvLanguageGerman'), flag: '🇩🇪' },
    { code: 'fr', name: t('playerProfile.cvLanguageFrench'), flag: '🇫🇷' },
    { code: 'gsw', name: t('playerProfile.cvLanguageSwissGerman'), flag: '🇨🇭' },
    { code: 'it', name: t('playerProfile.cvLanguageItalian'), flag: '🇮🇹' },
    { code: 'rm', name: t('playerProfile.cvLanguageRomansh'), flag: '🇨🇭' },
  ]

  const handleExport = () => {
    if (selectedLang) {
      onExport(selectedLang)
      onClose()
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Popup */}
        <div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-red-600" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('playerProfile.cvExport')}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('playerProfile.cvChooseType')}
            </p>

            {userType === 'hybrid' && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('playerProfile.cvPlayerTitle')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  {t('playerProfile.cvPlayerDesc')}
                </p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('playerProfile.cvRecruiterTitle')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('playerProfile.cvRecruiterDesc')}
                </p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t('playerProfile.cvLanguageSelect')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLang(lang.code)}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition ${
                      selectedLang === lang.code
                        ? 'border-red-600 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-700'
                    }`}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {lang.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              {t('playerProfile.cancel')}
            </button>
            <button
              onClick={handleExport}
              disabled={!selectedLang}
              className={`flex-1 px-4 py-2 rounded-lg transition flex items-center justify-center gap-2 ${
                selectedLang
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              <Download className="w-4 h-4" />
              {t('notifications.cvExporting')}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
