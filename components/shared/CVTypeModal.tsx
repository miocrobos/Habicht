'use client'

import { useState } from 'react'
import { X, FileDown } from 'lucide-react'
import { generatePlayerCV } from '@/lib/generateCV'
import { generateRecruiterCV } from '@/lib/generateRecruiterCV'

interface CVTypeModalProps {
  isOpen: boolean
  onClose: () => void
  playerData: any
  recruiterData: any
  userName: string
}

export default function CVTypeModal({ isOpen, onClose, playerData, recruiterData, userName }: CVTypeModalProps) {
  const [exporting, setExporting] = useState(false)

  if (!isOpen) return null

  const handleExportPlayerCV = async () => {
    try {
      setExporting(true)
      console.log('=== Exporting Player CV ===')
      console.log('Player data:', playerData)
      
      const pdfBlob = await generatePlayerCV(playerData)
      
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      link.download = `${userName.replace(' ', '_')}_Spieler_CV_${timestamp}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      console.log('Player CV downloaded successfully')
      onClose()
    } catch (error) {
      console.error('Error exporting player CV:', error)
      alert('Fehler bim CV Export')
    } finally {
      setExporting(false)
    }
  }

  const handleExportRecruiterCV = async () => {
    try {
      setExporting(true)
      console.log('=== Exporting Recruiter CV ===')
      console.log('Recruiter data:', recruiterData)
      
      const pdfBlob = await generateRecruiterCV(recruiterData)
      
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      link.download = `${userName.replace(' ', '_')}_Recruiter_CV_${timestamp}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      console.log('Recruiter CV downloaded successfully')
      onClose()
    } catch (error) {
      console.error('Error exporting recruiter CV:', error)
      alert('Fehler bim CV Export')
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
            CV Exportiere
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Wähl us, welli Art vo CV du hesch möchtest:
          </p>
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
                  Spieler CV
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Zeigt dini Spieler-Profile, Positione, Stats, Club-Gschicht, und Erfolge
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
                  Recruiter CV
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Zeigt dini Coaching-Rolle, Club-Affilierung, Positione wo du suechsch, und Erfahrig
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
              CV wird exportiert...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
