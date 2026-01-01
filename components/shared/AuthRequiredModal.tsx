'use client'

import { LogIn, UserPlus, X } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

interface AuthRequiredModalProps {
  isOpen: boolean
  onClose: () => void
  returnUrl?: string
}

export default function AuthRequiredModal({ isOpen, onClose, returnUrl }: AuthRequiredModalProps) {
  const { t } = useLanguage()

  if (!isOpen) return null

  const loginUrl = returnUrl ? `/auth/login?returnUrl=${encodeURIComponent(returnUrl)}` : '/auth/login'
  const registerUrl = returnUrl ? `/auth/register?returnUrl=${encodeURIComponent(returnUrl)}` : '/auth/register'

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>

          {/* Title */}
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {t('auth.required.title') || 'Sign in required'}
          </h3>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('auth.required.message') || 'Please sign in or register to view this content.'}
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={loginUrl}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              {t('auth.required.signIn') || 'Sign In'}
            </Link>
            <Link
              href={registerUrl}
              className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              {t('auth.required.register') || 'Register'}
            </Link>
          </div>

          {/* Cancel link */}
          <button
            onClick={onClose}
            className="mt-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition"
          >
            {t('common.cancel') || 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  )
}
