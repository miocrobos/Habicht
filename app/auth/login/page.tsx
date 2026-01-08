'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  useEffect(() => {
    // Check for success/error messages from password reset
    const successParam = searchParams.get('success')
    const errorParam = searchParams.get('error')
    
    if (successParam === 'password_reset') {
      setSuccess(t('auth.login.passwordResetSuccess'))
    } else if (errorParam === 'invalid_token') {
      setError(t('auth.login.invalidToken'))
    } else if (errorParam === 'token_expired') {
      setError(t('auth.login.tokenExpired'))
    } else if (errorParam === 'server_error') {
      setError(t('auth.login.error'))
    }

    // Load saved credentials if remember me was checked
    const savedEmail = localStorage.getItem('rememberedEmail')
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [searchParams])

  useEffect(() => {
    // If already logged in, redirect to profile
    if (session?.user) {
      if (session.user.role === 'HYBRID') {
        // Redirect hybrid users to their hybrid profile
        router.push(`/hybrids/${session.user.id}`)
      } else if (session.user.playerId) {
        router.push(`/players/${session.user.playerId}`)
      } else if (session.user.recruiterId) {
        // Redirect recruiter to their profile page
        router.push(`/recruiters/${session.user.recruiterId}`)
      }
    }
  }, [session, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(t('auth.login.invalidCredentials'))
      } else {
        // Save email and remember me preference
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email)
          localStorage.setItem('rememberMe', 'true')
        } else {
          localStorage.removeItem('rememberedEmail')
          localStorage.removeItem('rememberMe')
        }

        // After successful login, fetch user session and redirect to their profile
        const response = await fetch('/api/auth/session')
        const data = await response.json()
        
        if (data?.user?.role === 'HYBRID') {
          // Redirect hybrid user to their hybrid profile
          router.push(`/hybrids/${data.user.id}`)
        } else if (data?.user?.playerId) {
          // Redirect player to their profile
          router.push(`/players/${data.user.playerId}`)
        } else if (data?.user?.recruiterId) {
          // Redirect recruiter to their profile page
          router.push(`/recruiters/${data.user.recruiterId}`)
        } else {
          // Fallback to home page if no profile found
          router.push('/')
        }
        router.refresh()
      }
    } catch (error) {
      setError(t('auth.login.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div>
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
            <img src="/eagle-logo.png" alt="Habicht Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            {t('auth.login.title')}
          </h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {t('auth.login.or')}{' '}
            <Link href="/auth/register" className="font-medium text-habicht-600 hover:text-habicht-500">
              {t('auth.login.createAccount')}
            </Link>
          </p>
        </div>

        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}
          {success && (
            <div className="rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-green-800 dark:text-green-200">{success}</p>
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                {t('auth.login.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10"
                placeholder={t('auth.login.email')}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                {t('auth.login.password')}
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2.5 sm:py-2 pr-10 text-sm border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder={t('auth.login.password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 dark:border-gray-600 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs sm:text-sm text-gray-900 dark:text-white">
                {t('auth.login.rememberMe')}
              </label>
            </div>

            <div className="text-xs sm:text-sm">
              <Link href="/auth/forgot-password" className="font-medium text-habicht-600 hover:text-habicht-500">
                {t('auth.login.forgotPassword')}
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 sm:py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-habicht-600 hover:bg-habicht-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-habicht-500 disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-[0.98]"
            >
              {loading ? t('auth.login.loading') : t('auth.login.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
