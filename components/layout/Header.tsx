'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Menu, X, User, Search, Settings, Bell, Bookmark } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import axios from 'axios'
import NotificationPopup from '@/components/shared/NotificationPopup'
import { useLanguage } from '@/contexts/LanguageContext'
import { useHeader } from '@/contexts/HeaderContext'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { collapsed, setCollapsed } = useHeader()
  const { data: session } = useSession()
  const [unreadCount, setUnreadCount] = useState(0)
  const [watchlistCount, setWatchlistCount] = useState(0)
  const { t } = useLanguage()

  useEffect(() => {
    if (session) {
      const fetchUnreadCount = async () => {
        try {
          const response = await axios.get('/api/chat/unread-count')
          setUnreadCount(response.data.count || 0)
        } catch (error) {
          console.error('Error fetching unread count:', error)
        }
      }
      fetchUnreadCount()
      const interval = setInterval(fetchUnreadCount, 30000)
      
      // Fetch watchlist count for recruiters and hybrids
      const fetchWatchlistCount = async () => {
        if (session.user.role === 'RECRUITER' || session.user.role === 'HYBRID') {
          try {
            const response = await axios.get('/api/watchlist')
            setWatchlistCount(response.data.watchlist?.length || 0)
          } catch (error) {
            console.error('Error fetching watchlist count:', error)
          }
        }
      }
      fetchWatchlistCount()
      const watchlistInterval = setInterval(fetchWatchlistCount, 60000)
      
      return () => {
        clearInterval(interval)
        clearInterval(watchlistInterval)
      }
    }
  }, [session])

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50 transition-colors">
      <div className={`container mx-auto px-4 transition-all duration-500 ${collapsed ? 'h-12 overflow-hidden' : 'h-auto'}`} style={{ position: 'relative' }}>
        {/* Arrow button for retract/expand header (centered below header, no circle) */}
        <div className="w-full flex justify-center">
          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className="mt-1 mb-2 focus:outline-none"
            aria-label={collapsed ? 'Expand header' : 'Collapse header'}
          >
            <svg
              className={`w-7 h-7 text-gray-700 dark:text-gray-200 transform transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        <div className={`flex items-center justify-between transition-all duration-500 ${collapsed ? 'opacity-0 pointer-events-none h-0' : 'opacity-100 h-16'}`} style={{ minHeight: collapsed ? 0 : 64 }}>
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-12 h-12 transition-transform group-hover:scale-110" style={{ isolation: 'isolate', colorScheme: 'only light', mixBlendMode: 'normal' }}>
              <Image
                src="/eagle-logo.png"
                alt="Eagle Logo"
                fill
                className="object-contain group-hover:drop-shadow-lg no-invert"
                priority
                style={{ filter: 'none', WebkitFilter: 'none', colorScheme: 'only light', mixBlendMode: 'normal' }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-gray-900 dark:text-white leading-none tracking-tight group-hover:text-red-600 dark:group-hover:text-red-400 transition">
                Habicht
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">{t('playerProfile.swissVolleyball')}</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/players" className="text-gray-700 dark:text-gray-300 hover:text-swiss-red dark:hover:text-red-400 transition font-medium">
              {t('nav.players')}
            </Link>
            <Link href="/players/men" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium">
              {t('nav.men')}
            </Link>
            <Link href="/players/women" className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition font-medium">
              {t('nav.women')}
            </Link>
            <Link href="/clubs" className="text-gray-700 dark:text-gray-300 hover:text-swiss-red dark:hover:text-red-400 transition font-medium">
              {t('nav.clubs')}
            </Link>
            <Link href="/recruiters" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition font-medium">
              {t('nav.recruiters')}
            </Link>
            <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-swiss-red dark:hover:text-red-400 transition">
              {t('nav.about')}
            </Link>
            {session?.user.role === 'RECRUITER' && (
              <Link href="/dashboard/recruiter" className="text-gray-700 hover:text-swiss-red transition">
                {t('nav.dashboard')}
              </Link>
            )}
            {session?.user.role === 'PLAYER' && session?.user.playerId && (
              <Link href={`/players/${session.user.playerId}`} className="text-gray-700 dark:text-gray-300 hover:text-swiss-red dark:hover:text-red-400 transition">
                {t('nav.myProfile')}
              </Link>
            )}
          </nav>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-6">
            {session && <NotificationPopup />}
            {session && (session.user.role === 'RECRUITER' || session.user.role === 'HYBRID') && (
              <Link 
                href="/watchlist" 
                className="flex items-center justify-center w-10 h-10 text-gray-700 dark:text-gray-300 hover:text-swiss-red dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition relative"
                title={t('nav.watchlist')}
              >
                <Bookmark className="w-5 h-5" />
                {watchlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-swiss-red text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {watchlistCount}
                  </span>
                )}
              </Link>
            )}
            <Link 
              href="/settings" 
              className="flex items-center justify-center w-10 h-10 text-gray-700 dark:text-gray-300 hover:text-swiss-red dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              title={t('nav.settings')}
            >
              <Settings className="w-5 h-5" />
            </Link>
            <Link href="/players" className="text-gray-700 dark:text-gray-300 hover:text-swiss-red dark:hover:text-red-400 transition">
              <Search className="w-5 h-5" />
            </Link>
            
            {session ? (
              <button
                onClick={() => signOut()}
                className="bg-swiss-red dark:bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 dark:hover:bg-red-700 transition"
              >
                {t('nav.logout')}
              </button>
            ) : (
              <>
                <Link 
                  href="/auth/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-swiss-red dark:hover:text-red-400 transition font-medium"
                >
                  {t('nav.login')}
                </Link>
                <Link 
                  href="/auth/register"
                  className="bg-swiss-red dark:bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 dark:hover:bg-red-700 transition"
                >
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-700 dark:text-gray-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t dark:border-gray-700">
            <nav className="flex flex-col space-y-4">
              <Link href="/players" className="text-gray-700 dark:text-gray-300 hover:text-swiss-red dark:hover:text-red-400 transition">
                {t('nav.players')}
              </Link>
              <Link href="/players/men" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium">
                {t('nav.men')}
              </Link>
              <Link href="/players/women" className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition font-medium">
                {t('nav.women')}
              </Link>
              <Link href="/clubs" className="text-gray-700 dark:text-gray-300 hover:text-swiss-red dark:hover:text-red-400 transition">
                {t('nav.clubs')}
              </Link>
              <Link href="/recruiters" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition font-medium">
                👥 {t('nav.recruiters')}
              </Link>
              <Link href="/settings" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-swiss-red dark:hover:text-red-400 transition">
                <Settings className="w-5 h-5" />
                <span>{t('nav.settings')}</span>
              </Link>
              <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-swiss-red dark:hover:text-red-400 transition">
                {t('nav.about')}
              </Link>
              {session ? (
                <>
                  {session.user.role === 'PLAYER' && session.user.playerId && (
                    <Link href={`/players/${session.user.playerId}`} className="text-gray-700 dark:text-gray-300 hover:text-swiss-red dark:hover:text-red-400 transition">
                      {t('nav.myProfile')}
                    </Link>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="text-left text-gray-700 dark:text-gray-300 hover:text-swiss-red dark:hover:text-red-400 transition"
                  >
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="text-gray-700 dark:text-gray-300 hover:text-swiss-red dark:hover:text-red-400 transition">
                    {t('nav.login')}
                  </Link>
                  <Link href="/auth/register" className="text-swiss-red dark:text-red-400 font-semibold">
                    {t('nav.register')}
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
