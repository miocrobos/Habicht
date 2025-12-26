
'use client'
import { toast } from 'react-hot-toast';

import { useState } from 'react'
import { X, FileDown } from 'lucide-react'
import { generatePlayerCV } from '@/lib/generateCV'
import { generateRecruiterCV } from '@/lib/generateRecruiterCV'
import { useLanguage } from '@/contexts/LanguageContext'

interface CVTypeModalProps {
  isOpen: boolean
  onClose: () => void
  playerData: any
  recruiterData: any
  userName: string
}

export default function CVTypeModal({ isOpen, onClose, playerData, recruiterData, userName }: CVTypeModalProps) {
  const { t } = useLanguage()
  const [exporting, setExporting] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('gsw') // Default to Swiss German

  if (!isOpen) return null

  const handleExportPlayerCV = async () => {
    try {
      setExporting(true)
      console.log('=== Exporting Player CV ===')
      console.log('Player data:', playerData)
      console.log('Selected language:', selectedLanguage)
      
      const pdfBlob = await generatePlayerCV(playerData, selectedLanguage)
      
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      link.download = `${userName.replace(' ', '_')}_Spieler_CV_${selectedLanguage}_${timestamp}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      console.log('Player CV downloaded successfully')
      onClose()
    } catch (error) {
      console.error('Error exporting player CV:', error)
      toast.error(t('playerProfile.errorExportingCV'))
    } finally {
      setExporting(false)
    }
  }

  const handleExportRecruiterCV = async () => {
    try {
      setExporting(true)
      console.log('=== Exporting Recruiter CV ===')
      console.log('Recruiter data:', recruiterData)
      console.log('Selected language:', selectedLanguage)
      
      const pdfBlob = await generateRecruiterCV(recruiterData, selectedLanguage)
      
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      link.download = `${userName.replace(' ', '_')}_Recruiter_CV_${selectedLanguage}_${timestamp}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      console.log('Recruiter CV downloaded successfully')
      onClose()
    } catch (error) {
      console.error('Error exporting recruiter CV:', error)
      toast.error(t('playerProfile.errorExportingCV'))
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          disabled={exporting}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <FileDown className="w-16 h-16 mx-auto text-red-600 mb-3" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('playerProfile.cvExport')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('playerProfile.cvChooseType')}
          </p>
        </div>

        {/* Language Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('playerProfile.cvLanguageSelect')}
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
          >
            <option value="gsw">{t('playerProfile.cvLanguageSwissGerman')}</option>
            <option value="de">{t('playerProfile.cvLanguageGerman')}</option>
            <option value="fr">{t('playerProfile.cvLanguageFrench')}</option>
            <option value="it">{t('playerProfile.cvLanguageItalian')}</option>
            <option value="rm">{t('playerProfile.cvLanguageRomansh')}</option>
            <option value="en">{t('playerProfile.cvLanguageEnglish')}</option>
          </select>
        </div>

        {/* CV Type Options */}
        <div className="space-y-4">
          {/* Player CV Option */}
          <button
            onClick={handleExportPlayerCV}
            disabled={exporting}
            className="w-full p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🏐</span>
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {t('playerProfile.cvPlayerTitle')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('playerProfile.cvPlayerDesc')}
                </p>
              </div>
            </div>
          </button>

          {/* Recruiter CV Option */}
          <button
            onClick={handleExportRecruiterCV}
            disabled={exporting}
            className="w-full p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <span className="text-2xl">👔</span>
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {t('playerProfile.cvRecruiterTitle')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('playerProfile.cvRecruiterDesc')}
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Loading State */}
        {exporting && (
          <div className="mt-4 text-center">
            <div className="inline-block w-6 h-6 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {t('playerProfile.cvExporting')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
