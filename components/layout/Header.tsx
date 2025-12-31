'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X, User, Search, Settings, Bell, Bookmark, ChevronDown, Home, Users, UserCircle, LogIn, UserPlus, LogOut, Info, Building2 } from 'lucide-react'
import SettingsPopup from '@/components/shared/SettingsPopup'
import { useSession, signOut } from 'next-auth/react'
import axios from 'axios'
import NotificationPopup from '@/components/shared/NotificationPopup'
import { useLanguage } from '@/contexts/LanguageContext'
import { useHeader } from '@/contexts/HeaderContext'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isPlayersDropdownOpen, setIsPlayersDropdownOpen] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const { collapsed, setCollapsed } = useHeader()
  const { data: session } = useSession()
  const [unreadCount, setUnreadCount] = useState(0)
  const [watchlistCount, setWatchlistCount] = useState(0)
  const { t } = useLanguage()
  const pathname = usePathname()
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])
  
  // Close mobile menu when clicking outside or navigating
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
      // Prevent touchmove on body when sidebar is open
      const preventScroll = (e: TouchEvent) => {
        if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
          e.preventDefault()
        }
      }
      document.body.addEventListener('touchmove', preventScroll, { passive: false })
      return () => {
        document.body.style.overflow = 'unset'
        document.body.removeEventListener('touchmove', preventScroll)
      }
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

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
        {/* ...dropdown arrow removed... */}
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
          <nav className="hidden lg:flex items-center space-x-3 xl:space-x-5">
            <Link href="/players" className="text-gray-700 dark:text-gray-300 hover:text-swiss-red dark:hover:text-red-400 transition font-medium text-sm xl:text-base whitespace-nowrap">
              {t('nav.players')}
            </Link>
            <Link href="/players/men" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium text-sm xl:text-base whitespace-nowrap">
              {t('nav.men')}
            </Link>
            <Link href="/players/women" className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition font-medium text-sm xl:text-base whitespace-nowrap">
              {t('nav.women')}
            </Link>
            <Link href="/player-requests" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium text-sm xl:text-base whitespace-nowrap">
              {t('nav.playerRequests') || 'Aafroge'}
            </Link>
            <Link href="/clubs" className="text-gray-700 dark:text-gray-300 hover:text-swiss-red dark:hover:text-red-400 transition font-medium text-sm xl:text-base whitespace-nowrap">
              {t('nav.clubs')}
            </Link>
            <Link href="/recruiters" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition font-medium text-sm xl:text-base whitespace-nowrap">
              {t('nav.recruiters')}
            </Link>
            <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-swiss-red dark:hover:text-red-400 transition text-sm xl:text-base whitespace-nowrap">
              {t('nav.about')}
            </Link>
            {session?.user.role === 'RECRUITER' && (
              <Link href="/dashboard/recruiter" className="text-gray-700 hover:text-swiss-red transition text-sm xl:text-base whitespace-nowrap">
                {t('nav.dashboard')}
              </Link>
            )}
            {session?.user.role === 'PLAYER' && session?.user.playerId && (
              <Link href={`/players/${session.user.playerId}`} className="text-gray-700 dark:text-gray-300 hover:text-swiss-red dark:hover:text-red-400 transition text-sm xl:text-base whitespace-nowrap">
                {t('nav.myProfile')}
              </Link>
            )}
          </nav>

          {/* Right side buttons */}
          <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
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
          <div className="lg:hidden flex items-center gap-2">
            {session && <NotificationPopup />}
            <button
              className="text-gray-700 dark:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Overlay */}

        {isMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        {/* Mobile Navigation Drawer */}
        <div
          ref={sidebarRef}
          className={`lg:hidden fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-gradient-to-r from-red-600 to-red-700">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10" style={{ isolation: 'isolate', colorScheme: 'only light' }}>
                <Image
                  src="/eagle-logo.png"
                  alt="Habicht Logo"
                  fill
                  className="object-contain no-invert"
                  style={{ filter: 'none' }}
                />
              </div>
              <span className="text-xl font-bold text-white">Habicht</span>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* User Info Section (if logged in) */}
          {session && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {session.user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {session.user.name || session.user.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {session.user.role?.toLowerCase()}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-2" style={{ WebkitOverflowScrolling: 'touch' }}>
            {/* Main Navigation */}
            <div className="px-2 py-2">
              <p className="px-4 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {t('nav.navigation') || 'Navigation'}
              </p>
              
              <Link 
                href="/" 
                className="flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="w-5 h-5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                <span className="whitespace-nowrap">{t('nav.home') || 'Home'}</span>
              </Link>
              

              <button
                type="button"
                className="flex items-center w-full gap-3 px-4 py-3 mx-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium focus:outline-none"
                onClick={() => setIsPlayersDropdownOpen((v) => !v)}
                aria-expanded={isPlayersDropdownOpen}
                aria-controls="players-dropdown"
              >
                <Users className="w-5 h-5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                <span className="whitespace-nowrap">{t('nav.players')}</span>
                <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isPlayersDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isPlayersDropdownOpen && (
                <div id="players-dropdown" className="ml-8">
                  <Link 
                    href="/players/men" 
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition font-medium text-sm"
                    onClick={() => { setIsMenuOpen(false); setIsPlayersDropdownOpen(false); }}
                  >
                    <span className="text-lg flex-shrink-0">♂</span>
                    <span className="whitespace-nowrap">{t('nav.men')}</span>
                  </Link>
                  <Link 
                    href="/players/women" 
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/30 transition font-medium text-sm"
                    onClick={() => { setIsMenuOpen(false); setIsPlayersDropdownOpen(false); }}
                  >
                    <span className="text-lg flex-shrink-0">♀</span>
                    <span className="whitespace-nowrap">{t('nav.women')}</span>
                  </Link>
                </div>
              )}
              
              <Link 
                href="/clubs" 
                className="flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <Building2 className="w-5 h-5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                <span className="whitespace-nowrap">{t('nav.clubs')}</span>
              </Link>
              
              <Link 
                href="/player-requests" 
                className="flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-lg flex-shrink-0">📋</span>
                <span className="whitespace-nowrap">{t('nav.playerRequests') || 'Spieler-Aafroge'}</span>
              </Link>
              
              <Link 
                href="/recruiters" 
                className="flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-lg flex-shrink-0">👥</span>
                <span className="whitespace-nowrap">{t('nav.recruiters')}</span>
              </Link>
              
              <Link 
                href="/about" 
                className="flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <Info className="w-5 h-5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                <span className="whitespace-nowrap">{t('nav.about')}</span>
              </Link>
            </div>
            
            {/* User Actions */}
            <div className="px-2 py-2 border-t dark:border-gray-700">
              <p className="px-4 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {t('nav.account') || 'Account'}
              </p>
              
              {session ? (
                <>
                  {session.user.role === 'PLAYER' && session.user.playerId && (
                    <Link 
                      href={`/players/${session.user.playerId}`} 
                      className="flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserCircle className="w-5 h-5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                      <span className="whitespace-nowrap">{t('nav.myProfile')}</span>
                    </Link>
                  )}
                  
                  {(session.user.role === 'RECRUITER' || session.user.role === 'HYBRID') && (
                    <Link 
                      href="/watchlist" 
                      className="flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Bookmark className="w-5 h-5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                      <span className="whitespace-nowrap">{t('nav.watchlist')}</span>
                      {watchlistCount > 0 && (
                        <span className="ml-auto flex-shrink-0 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {watchlistCount}
                        </span>
                      )}
                    </Link>
                  )}
                  
                  <Link 
                    href="/settings" 
                    className="flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="w-5 h-5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                    <span className="whitespace-nowrap">{t('nav.settings')}</span>
                  </Link>
                  
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      signOut()
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition font-medium"
                  >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    <span className="whitespace-nowrap">{t('nav.logout')}</span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/auth/login" 
                    className="flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn className="w-5 h-5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                    <span className="whitespace-nowrap">{t('nav.login')}</span>
                  </Link>
                  
                  <Link 
                    href="/auth/register" 
                    className="flex items-center gap-3 px-4 py-3 mx-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition font-semibold shadow-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserPlus className="w-5 h-5 flex-shrink-0" />
                    <span className="whitespace-nowrap">{t('nav.register')}</span>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
