
'use client'
import { toast } from 'react-hot-toast';

import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { FileDown, Bookmark, ExternalLink, Trash2, User, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import ChatWindow from '@/components/chat/ChatWindow'
import CVTypeModal from '@/components/shared/CVTypeModal'
import CVExportLanguagePopup from '@/components/shared/CVExportLanguagePopup'
import { generatePlayerCV } from '@/lib/generateCV'
import { generateRecruiterCV } from '@/lib/generateRecruiterCV'

// Helper function to translate coach role
const getTranslatedCoachRole = (role: string, t: any) => {
  if (!role) return '';
  // Handle comma-separated roles
  const roles = role.split(',').map(r => r.trim());
  return roles.map(r => {
    const roleKey = r.toLowerCase().replace(/ /g, '_') as 'head_coach' | 'assistant_coach' | 'technical_coach' | 'physical_coach' | 'scout' | 'trainer' | 'team_manager';
    const translation = t(`coachRole.${roleKey}`);
    return translation && translation !== `coachRole.${roleKey}` ? translation : r.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  }).join(', ');
};

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage: setLanguageContext, t } = useLanguage()
  const { data: session } = useSession()
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'appearance' | 'security' | 'language' | 'account' | 'notifications' | 'watchlist' | 'messages'>('appearance')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [conversations, setConversations] = useState<any[]>([])
  const [conversationsLoading, setConversationsLoading] = useState(false)
  const [activeChat, setActiveChat] = useState<any>(null)
  const [recruiterMessages, setRecruiterMessages] = useState(true)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showEmail, setShowEmail] = useState(false)
  const [showPhone, setShowPhone] = useState(false)
  const [showLicense, setShowLicense] = useState(false)
  const [showRecruiterLicense, setShowRecruiterLicense] = useState(false)
  const [loading, setLoading] = useState(false)
  const [municipality, setMunicipality] = useState('')
  const [notifyChatMessages, setNotifyChatMessages] = useState(true)
  const [notifyPlayerLooking, setNotifyPlayerLooking] = useState(true)
  const [notifyRecruiterSearching, setNotifyRecruiterSearching] = useState(true)
  const [showCVModal, setShowCVModal] = useState(false)
  const [showCVLanguagePopup, setShowCVLanguagePopup] = useState(false)
  const [cvExportType, setCvExportType] = useState<'player' | 'recruiter' | 'hybrid'>('player')
  const [playerData, setPlayerData] = useState<any>(null)
  const [recruiterData, setRecruiterData] = useState<any>(null)
  const [watchlist, setWatchlist] = useState<any[]>([])
  const [watchlistLoading, setWatchlistLoading] = useState(false)

  // Language is now managed by LanguageContext, no need for local state

  useEffect(() => {
    if (session?.user?.playerId) {
      fetchPrivacySettings()
      fetchPlayerData()
    }
    if (session?.user?.recruiterId) {
      fetchRecruiterData()
      fetchWatchlist()
    }
    if (session?.user?.role === 'HYBRID') {
      fetchWatchlist()
    }
    if (session?.user) {
      fetchNotificationSettings()
      fetchConversations()
    }
  }, [session])

  const fetchWatchlist = async () => {
    try {
      setWatchlistLoading(true)
      const response = await axios.get('/api/watchlist')
      setWatchlist(response.data || [])
    } catch (error) {
      console.error('Error fetching watchlist:', error)
    } finally {
      setWatchlistLoading(false)
    }
  }

  const removeFromWatchlist = async (playerId: string) => {
    try {
      await axios.delete(`/api/watchlist/${playerId}`)
      setWatchlist(watchlist.filter(w => w.player?.id !== playerId))
      toast.success(t('settings.watchlist.removed') || 'Removed from watchlist')
    } catch (error) {
      console.error('Error removing from watchlist:', error)
      toast.error(t('settings.watchlist.removeError') || 'Error removing from watchlist')
    }
  }

  const fetchConversations = async () => {
    try {
      setConversationsLoading(true)
      const response = await axios.get('/api/chat/conversations')
      setConversations(response.data.conversations || [])
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setConversationsLoading(false)
    }
  }

  const openChat = (conversation: any) => {
    // Determine the other participant based on user type
    const isPlayer = session?.user?.role === 'PLAYER'
    const isHybrid = session?.user?.role === 'HYBRID'
    
    let otherParticipant
    if (conversation.player && conversation.recruiter) {
      // Player-Recruiter conversation
      // Check if current user is the player in this conversation
      const currentUserIsPlayer = isPlayer || (isHybrid && session?.user?.playerId && conversation.playerId === session?.user?.playerId)
      
      if (currentUserIsPlayer) {
        otherParticipant = {
          id: conversation.recruiter.id,
          name: `${conversation.recruiter.firstName} ${conversation.recruiter.lastName}`,
          type: 'RECRUITER' as const,
          club: conversation.recruiter.club?.name || ''
        }
      } else {
        otherParticipant = {
          id: conversation.player.id,
          name: `${conversation.player.firstName} ${conversation.player.lastName}`,
          type: 'PLAYER' as const,
          position: conversation.player.positions?.[0] || ''
        }
      }
    } else if (conversation.recruiter && conversation.secondRecruiter) {
      // Recruiter-Recruiter conversation
      const currentRecruiterId = session?.user?.recruiterId
      const isFirstRecruiter = conversation.recruiterId === currentRecruiterId
      const other = isFirstRecruiter ? conversation.secondRecruiter : conversation.recruiter
      otherParticipant = {
        id: other.id,
        name: `${other.firstName} ${other.lastName}`,
        type: 'RECRUITER' as const,
        club: other.club?.name || ''
      }
    }
    
    if (otherParticipant) {
      setActiveChat({
        conversationId: conversation.id,
        otherParticipant,
        currentUserId: session?.user?.id || '',
        currentUserType: session?.user?.role as 'PLAYER' | 'RECRUITER' | 'HYBRID'
      })
    }
  }

  const fetchPrivacySettings = async () => {
    try {
      const response = await axios.get(`/api/players/${session?.user?.playerId}`)
      const player = response.data.player
      setShowEmail(player.showEmail || false)
      setShowPhone(player.showPhone || false)
      setShowLicense(player.showLicense || false)
      setMunicipality(player.municipality || '')
    } catch (error) {
      console.error('Error fetching privacy settings:', error)
    }
  }

  const fetchNotificationSettings = async () => {
    try {
      const response = await axios.get('/api/auth/user')
      const user = response.data
      setNotifyChatMessages(user.notifyChatMessages ?? true)
      setNotifyPlayerLooking(user.notifyPlayerLooking ?? true)
      setNotifyRecruiterSearching(user.notifyRecruiterSearching ?? true)
    } catch (error) {
      console.error('Error fetching notification settings:', error)
    }
  }

  const fetchPlayerData = async () => {
    try {
      const response = await axios.get(`/api/players/${session?.user?.playerId}`)
      setPlayerData(response.data.player)
    } catch (error) {
      console.error('Error fetching player data:', error)
    }
  }

  const fetchRecruiterData = async () => {
    try {
      const response = await axios.get(`/api/recruiters/${session?.user?.recruiterId}`)
      setRecruiterData(response.data.recruiter || response.data)
      setShowRecruiterLicense(response.data.recruiter?.showLicense || response.data?.showLicense || false)
    } catch (error) {
      console.error('Error fetching recruiter data:', error)
    }
  }

  const handleExportCV = async (language: string) => {
    try {
      if (cvExportType === 'player' && playerData) {
        const pdfBlob = await generatePlayerCV(playerData, language)
        const url = URL.createObjectURL(pdfBlob)
        const link = document.createElement('a')
        link.href = url
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
        link.download = `${playerData.firstName}_${playerData.lastName}_Player_CV_${language.toUpperCase()}_${timestamp}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } else if (cvExportType === 'recruiter' && recruiterData) {
        const pdfBlob = await generateRecruiterCV(recruiterData, language)
        const url = URL.createObjectURL(pdfBlob)
        const link = document.createElement('a')
        link.href = url
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
        link.download = `${recruiterData.firstName}_${recruiterData.lastName}_Recruiter_CV_${language.toUpperCase()}_${timestamp}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting CV:', error)
      toast.error(t('playerProfile.errorExportingCV'))
    }
  }

  const updatePrivacySettings = async (field: 'showEmail' | 'showPhone' | 'showLicense', value: boolean) => {
    try {
      setLoading(true)
      await axios.put(`/api/players/${session?.user?.playerId}`, {
        playerData: {
          [field]: value
        }
      })
      if (field === 'showEmail') setShowEmail(value)
      if (field === 'showPhone') setShowPhone(value)
      if (field === 'showLicense') setShowLicense(value)
      showSaveConfirmation()
    } catch (error) {
      console.error('Error updating privacy settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateRecruiterPrivacySettings = async (field: 'showLicense', value: boolean) => {
    try {
      setLoading(true)
      await axios.put(`/api/recruiters/${session?.user?.recruiterId}`, {
        showLicense: value
      })
      if (field === 'showLicense') setShowRecruiterLicense(value)
      showSaveConfirmation()
    } catch (error) {
      console.error('Error updating recruiter privacy settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme)
    showSaveConfirmation()
  }

  const handleLanguageChange = (newLanguage: string) => {
    setLanguageContext(newLanguage as 'gsw' | 'de' | 'fr' | 'it' | 'rm' | 'en')
    showSaveConfirmation()
  }

  const handleNotificationChange = (type: 'email' | 'recruiter', value: boolean) => {
    if (type === 'email') setEmailNotifications(value)
    if (type === 'recruiter') setRecruiterMessages(value)
    showSaveConfirmation()
  }

  const updateNotificationSettings = async (field: 'notifyChatMessages' | 'notifyPlayerLooking' | 'notifyRecruiterSearching', value: boolean) => {
    try {
      setLoading(true)
      await axios.put('/api/auth/user/notifications', { [field]: value })
      
      if (field === 'notifyChatMessages') setNotifyChatMessages(value)
      if (field === 'notifyPlayerLooking') setNotifyPlayerLooking(value)
      if (field === 'notifyRecruiterSearching') setNotifyRecruiterSearching(value)
      
      showSaveConfirmation()
    } catch (error) {
      console.error('Error updating notification settings:', error)
      toast.error(t('playerProfile.errorSavingNotificationSettings'))
    } finally {
      setLoading(false)
    }
  }

  const showSaveConfirmation = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error(t('playerProfile.passwordMismatch'))
      return
    }
    showSaveConfirmation()
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
            {t('settings.title')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {t('settings.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 sm:p-4 space-y-1 sm:space-y-2 flex lg:flex-col overflow-x-auto lg:overflow-visible gap-1 sm:gap-0">
              <button
                onClick={() => setActiveTab('appearance')}
                className={`flex-shrink-0 lg:w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${
                  activeTab === 'appearance'
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2 sm:space-x-3 whitespace-nowrap">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  <span className="hidden sm:inline">{t('settings.appearance.title')}</span>
                  <span className="sm:hidden">Theme</span>
                </div>
              </button>
              
              {/* Login & Security tab - only for logged in users */}
              {session?.user && (
                <button
                  onClick={() => setActiveTab('security')}
                  className={`flex-shrink-0 lg:w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${
                    activeTab === 'security'
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3 whitespace-nowrap">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="hidden sm:inline">{t('settings.security.title')}</span>
                    <span className="sm:hidden">Security</span>
                  </div>
                </button>
              )}

              <button
                onClick={() => setActiveTab('language')}
                className={`flex-shrink-0 lg:w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${
                  activeTab === 'language'
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2 sm:space-x-3 whitespace-nowrap">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  <span className="hidden sm:inline">{t('settings.language.title')}</span>
                  <span className="sm:hidden">Lang</span>
                </div>
              </button>

              {/* Notifications tab - only for logged in users */}
              {session?.user && (
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`flex-shrink-0 lg:w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${
                    activeTab === 'notifications'
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3 whitespace-nowrap">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="hidden sm:inline">{t('settings.notifications.title')}</span>
                    <span className="sm:hidden">Notif</span>
                  </div>
                </button>
              )}

              {/* Account Management tab - only for logged in users */}
              {session?.user && (
                <button
                  onClick={() => setActiveTab('account')}
                className={`flex-shrink-0 lg:w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${
                  activeTab === 'account'
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2 sm:space-x-3 whitespace-nowrap">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                    <span className="hidden sm:inline">{t('settings.account.title')}</span>
                    <span className="sm:hidden">Account</span>
                  </div>
                </button>
              )}

              {/* Watchlist tab - only for recruiters and hybrid users */}
              {(session?.user?.role === 'RECRUITER' || session?.user?.role === 'HYBRID') && (
                <button
                  onClick={() => setActiveTab('watchlist')}
                  className={`flex-shrink-0 lg:w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${
                    activeTab === 'watchlist'
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3 whitespace-nowrap">
                    <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">{t('settings.watchlist.title') || 'Watchlist'}</span>
                    <span className="sm:hidden">Watch</span>
                    {watchlist.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-600 text-white rounded-full">{watchlist.length}</span>
                    )}
                  </div>
                </button>
              )}

              {/* Messages tab - for all logged in users */}
              {session?.user && (
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`flex-shrink-0 lg:w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${
                    activeTab === 'messages'
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3 whitespace-nowrap">
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">{t('settings.messages.title') || 'Messages'}</span>
                    <span className="sm:hidden">Chat</span>
                    {conversations.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-600 text-white rounded-full">{conversations.length}</span>
                    )}
                  </div>
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              {activeTab === 'appearance' && (
                <>
                  <div className="border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1">{t('settings.appearance.title')}</h2>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{t('settings.appearance.subtitle')}</p>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('settings.theme.title')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button onClick={() => handleThemeChange('light')} className={`relative p-6 rounded-lg border-2 transition-all duration-200 ${theme === 'light' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-yellow-400 rounded-full">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white">{t('settings.theme.light.title')}</span>
                          </div>
                          {theme === 'light' && (
                            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-left">{t('settings.theme.light.description')}</p>
                      </button>
                      <button onClick={() => handleThemeChange('dark')} className={`relative p-6 rounded-lg border-2 transition-all duration-200 ${theme === 'dark' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-indigo-600 rounded-full">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                              </svg>
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white">{t('settings.theme.dark.title')}</span>
                          </div>
                          {theme === 'dark' && (
                            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-left">{t('settings.theme.dark.description')}</p>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'security' && (
                <>
                  <div className="border-b border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">{t('settings.security.title')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.security.subtitle')}</p>
                  </div>
                  <div className="p-6 space-y-8">
                    {/* Privacy Settings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('settings.privacy.title')}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.privacy.subtitle')}</p>
                      
                      {/* Email Toggle */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{t('settings.email.show.title')}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.email.show.description')}</p>
                        </div>
                        <button
                          onClick={() => updatePrivacySettings('showEmail', !showEmail)}
                          disabled={loading}
                          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                            showEmail ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'
                          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                              showEmail ? 'translate-x-7' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Phone Toggle */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{t('settings.phone.show.title')}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.phone.show.description')}</p>
                        </div>
                        <button
                          onClick={() => updatePrivacySettings('showPhone', !showPhone)}
                          disabled={loading}
                          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                            showPhone ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'
                          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                              showPhone ? 'translate-x-7' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* License Toggle - Player License */}
                      {(session?.user?.role === 'PLAYER' || session?.user?.role === 'HYBRID') && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">{t('settings.license.show.playerTitle') || 'Show Player License Publicly'}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.license.show.playerDescription') || 'Allow other users to see your uploaded Swiss Volley license.'}</p>
                          </div>
                          <button
                            onClick={() => updatePrivacySettings('showLicense', !showLicense)}
                            disabled={loading}
                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                              showLicense ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <span
                              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                                showLicense ? 'translate-x-7' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      )}

                      {/* License Toggle - Coaching License */}
                      {(session?.user?.role === 'RECRUITER' || session?.user?.role === 'HYBRID') && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">{t('settings.license.show.recruiterTitle') || 'Show Coaching License Publicly'}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.license.show.recruiterDescription') || 'Allow other users to see your uploaded coaching license.'}</p>
                          </div>
                          <button
                            onClick={() => updateRecruiterPrivacySettings('showLicense', !showRecruiterLicense)}
                            disabled={loading}
                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                              showRecruiterLicense ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <span
                              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                                showRecruiterLicense ? 'translate-x-7' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">{t('settings.email.title')}</label>
                        <input type="email" value={session?.user?.email || ''} disabled className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 cursor-not-allowed" />
                      </div>
                      <form onSubmit={handlePasswordChange} className="space-y-4 mt-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('settings.password.change')}</h3>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">{t('settings.password.current.title')}</label>
                          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500" placeholder={t('settings.password.current.placeholder')} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">{t('settings.password.new.title')}</label>
                          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500" placeholder={t('settings.password.new.placeholder')} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">{t('settings.password.confirm.title')}</label>
                          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500" placeholder={t('settings.password.confirm.placeholder')} />
                        </div>
                        <button type="submit" className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium">{t('settings.password.change')}</button>
                      </form>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'language' && (
                <>
                  <div className="border-b border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">{t('settings.language.title')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.language.subtitle')}</p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {[
                        { code: 'gsw', name: 'Schwiizerdütsch', flag: '🇨🇭' },
                        { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
                        { code: 'fr', name: 'Français', flag: '🇫🇷' },
                        { code: 'it', name: 'Italiano', flag: '🇮🇹' },
                        { code: 'rm', name: 'Rumantsch', flag: '🇨🇭' },
                        { code: 'en', name: 'English', flag: '🇬🇧' }
                      ].map((lang) => (
                        <button key={lang.code} onClick={() => handleLanguageChange(lang.code)} className={`w-full p-4 rounded-lg border-2 transition-all ${language === lang.code ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-3xl">{lang.flag}</span>
                              <span className="font-semibold text-gray-900 dark:text-white">{lang.name}</span>
                            </div>
                            {language === lang.code && (
                              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'notifications' && (
                <>
                  <div className="border-b border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">{t('settings.notifications.title')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.notifications.subtitle')}</p>
                  </div>
                  <div className="p-6 space-y-6">
                    {/* Chat Messages */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{t('settings.notifications.chat.title')}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.notifications.chat.description')}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifyChatMessages}
                          onChange={(e) => updateNotificationSettings('notifyChatMessages', e.target.checked)}
                          disabled={loading}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                      </label>
                    </div>

                    {/* Player Looking for Club */}
                    {session?.user?.role === 'RECRUITER' && (
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{t('settings.notifications.playerLooking.title')}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.notifications.playerLooking.description')}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifyPlayerLooking}
                            onChange={(e) => updateNotificationSettings('notifyPlayerLooking', e.target.checked)}
                            disabled={loading}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                        </label>
                      </div>
                    )}

                    {/* Recruiter Searching */}
                    {session?.user?.role === 'PLAYER' && (
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{t('settings.notifications.recruiterSearching.title')}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.notifications.recruiterSearching.description')}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifyRecruiterSearching}
                            onChange={(e) => updateNotificationSettings('notifyRecruiterSearching', e.target.checked)}
                            disabled={loading}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                        </label>
                      </div>
                    )}

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>ℹ️ {t('settings.notifications.note.title')}</strong> {t('settings.notifications.note.description')}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'account' && (
                <>
                  <div className="border-b border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">{t('settings.account.title')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.account.subtitle')}</p>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">{t('settings.account.info')}</h3>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600 dark:text-gray-400"><span className="font-medium">{t('settings.email')}:</span> {session?.user?.email || t('settings.account.notLoggedIn')}</p>
                        <p className="text-gray-600 dark:text-gray-400"><span className="font-medium">{t('settings.account.type')}:</span> {session?.user?.role || t('settings.account.guest')}</p>
                      </div>
                    </div>

                    {/* CV Export Section */}
                    {(session?.user?.role === 'RECRUITER' || session?.user?.role === 'HYBRID' || (session?.user?.role === 'PLAYER' && session?.user?.playerId)) && (
                      <div className="border border-green-300 dark:border-green-700 rounded-lg p-6 bg-green-50 dark:bg-green-900/20">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <FileDown className="w-5 h-5" />
                          {t('settings.account.cvExportTitle')}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {session?.user?.role === 'HYBRID' 
                            ? t('settings.account.cvExportDescriptionHybrid')
                            : session?.user?.role === 'RECRUITER'
                            ? t('settings.account.cvExportDescriptionRecruiter')
                            : t('settings.account.cvExportDescriptionPlayer')}
                        </p>
                        
                        {session?.user?.role === 'HYBRID' ? (
                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={() => setShowCVModal(true)}
                              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-red-600 text-white rounded-lg hover:from-blue-700 hover:to-red-700 transition font-semibold shadow-md"
                            >
                              <FileDown className="w-4 h-4" />
                              {t('settings.account.cvExportButtonChoose')}
                            </button>
                          </div>
                        ) : session?.user?.role === 'RECRUITER' ? (
                          <button
                            onClick={() => { setCvExportType('recruiter'); setShowCVLanguagePopup(true); }}
                            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold shadow-md"
                          >
                            <FileDown className="w-4 h-4" />
                            {t('settings.account.cvExportButtonRecruiter')}
                          </button>
                        ) : (
                          <button
                            onClick={() => { setCvExportType('player'); setShowCVLanguagePopup(true); }}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-md"
                          >
                            <FileDown className="w-4 h-4" />
                            {t('settings.account.cvExportButtonPlayer')}
                          </button>
                        )}
                      </div>
                    )}

                    <div className="border border-orange-300 dark:border-orange-700 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('settings.account.deactivateTitle')}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t('settings.account.deactivateDescription')}</p>
                      <button 
                        onClick={async () => {
                          if (confirm(t('settings.account.deactivateConfirm'))) {
                            try {
                              await axios.post('/api/auth/deactivate')
                              toast.success(t('settings.account.deactivateSuccess'))
                              window.location.href = '/'
                            } catch (error) {
                              toast.error(t('settings.account.deactivateError'))
                            }
                          }
                        }}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
                      >
                        {t('settings.account.deactivateButton')}
                      </button>
                    </div>
                    <div className="border border-red-300 dark:border-red-700 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('settings.account.deleteTitle')}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t('settings.account.deleteWarning')}</p>
                      <button 
                        onClick={async () => {
                          if (confirm(t('settings.account.deleteConfirm1'))) {
                            if (confirm(t('settings.account.deleteConfirm2'))) {
                              try {
                                await axios.delete('/api/auth/delete-account')
                                toast.success(t('settings.account.deleteSuccess'))
                                window.location.href = '/'
                              } catch (error) {
                                toast.error(t('settings.account.deleteError'))
                              }
                            }
                          }
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                      >
                        {t('settings.account.deleteButton')}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Watchlist Tab Content */}
              {activeTab === 'watchlist' && (session?.user?.role === 'RECRUITER' || session?.user?.role === 'HYBRID') && (
                <>
                  <div className="border-b border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                      <Bookmark className="w-6 h-6" />
                      {t('settings.watchlist.title') || 'My Watchlist'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('settings.watchlist.subtitle') || 'Players you are watching. Only you can see this list.'}
                    </p>
                  </div>
                  <div className="p-6">
                    {watchlistLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                      </div>
                    ) : watchlist.length === 0 ? (
                      <div className="text-center py-12">
                        <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          {t('settings.watchlist.empty') || 'No players in your watchlist'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          {t('settings.watchlist.emptyDescription') || 'Add players to your watchlist to keep track of them here.'}
                        </p>
                        <Link
                          href="/players"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                        >
                          {t('settings.watchlist.browsePlayers') || 'Browse Players'}
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {watchlist.map((item) => (
                          <div
                            key={item.id || item.player?.id}
                            className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition"
                          >
                            {/* Player Photo */}
                            <div className="flex-shrink-0">
                              {item.player?.profileImage ? (
                                <Image
                                  src={item.player.profileImage}
                                  alt={`${item.player.firstName} ${item.player.lastName}`}
                                  width={56}
                                  height={56}
                                  className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                                />
                              ) : (
                                <div className="w-14 h-14 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                  <User className="w-7 h-7 text-gray-500 dark:text-gray-400" />
                                </div>
                              )}
                            </div>

                            {/* Player Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                                {item.player?.firstName} {item.player?.lastName}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {item.player?.positions?.map((pos: string) => 
                                  t(`playerProfile.position${pos.charAt(0) + pos.slice(1).toLowerCase().replace(/_/g, '')}`) || pos
                                ).join(', ') || '-'}
                              </p>
                              {item.player?.currentClub && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  {item.player.currentClub.name}
                                </p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/players/${item.player?.id}`}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                              >
                                <ExternalLink className="w-4 h-4" />
                                <span className="hidden sm:inline">{t('common.viewProfile') || 'View'}</span>
                              </Link>
                              <button
                                onClick={() => removeFromWatchlist(item.player?.id)}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                title={t('settings.watchlist.remove') || 'Remove from watchlist'}
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="hidden sm:inline">{t('common.remove') || 'Remove'}</span>
                              </button>
                            </div>
                          </div>
                        ))}

                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t('settings.watchlist.total') || 'Total:'} <span className="font-semibold">{watchlist.length}</span> {t('settings.watchlist.players') || 'players'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Messages Tab Content */}
              {activeTab === 'messages' && (
                <>
                  <div className="border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                      {t('settings.messages.title') || 'Messages'}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {t('settings.messages.subtitle') || 'Your conversations with other users'}
                    </p>
                  </div>
                  <div className="p-4 sm:p-6">
                    {conversationsLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                      </div>
                    ) : conversations.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          {t('settings.messages.empty') || 'No conversations yet'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          {session?.user?.role === 'PLAYER' 
                            ? (t('settings.messages.emptyDescriptionPlayer') || 'Wait for recruiters to contact you')
                            : (t('settings.messages.emptyDescription') || 'Start a conversation by messaging a player or recruiter')
                          }
                        </p>
                        {session?.user?.role !== 'PLAYER' && (
                          <Link
                            href="/players"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                          >
                            {t('settings.messages.browsePlayers') || 'Browse Players'}
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {conversations.map((conversation) => {
                          // Determine other participant
                          const isPlayer = session?.user?.role === 'PLAYER'
                          const isHybrid = session?.user?.role === 'HYBRID'
                          let otherName = ''
                          let otherRole = ''
                          let otherClub = ''
                          let profileLink = ''
                          let profileImage = ''
                          
                          if (conversation.player && conversation.recruiter) {
                            if (isPlayer || (isHybrid && session?.user?.playerId && conversation.playerId === session?.user?.playerId)) {
                              otherName = `${conversation.recruiter.firstName} ${conversation.recruiter.lastName}`
                              otherRole = getTranslatedCoachRole(conversation.recruiter.coachRole, t) || t('common.recruiter') || 'Recruiter'
                              otherClub = conversation.recruiter.club?.name || ''
                              profileLink = `/recruiters/${conversation.recruiter.id}`
                              profileImage = conversation.recruiter.profileImage || ''
                            } else {
                              otherName = `${conversation.player.firstName} ${conversation.player.lastName}`
                              otherRole = conversation.player.positions?.[0] || t('common.player') || 'Player'
                              otherClub = conversation.player.currentClub?.name || ''
                              profileLink = `/players/${conversation.player.id}`
                              profileImage = conversation.player.profileImage || ''
                            }
                          } else if (conversation.recruiter && conversation.secondRecruiter) {
                            const currentRecruiterId = session?.user?.recruiterId
                            const isFirst = conversation.recruiterId === currentRecruiterId
                            const other = isFirst ? conversation.secondRecruiter : conversation.recruiter
                            otherName = `${other.firstName} ${other.lastName}`
                            otherRole = getTranslatedCoachRole(other.coachRole, t) || t('common.recruiter') || 'Recruiter'
                            otherClub = other.club?.name || ''
                            profileLink = `/recruiters/${other.id}`
                            profileImage = other.profileImage || ''
                          }
                          
                          const lastMessage = conversation.messages?.[0]
                          
                          return (
                            <div
                              key={conversation.id}
                              className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition cursor-pointer active:bg-gray-100 dark:active:bg-gray-600/50"
                              onClick={() => openChat(conversation)}
                            >
                              {/* Avatar */}
                              <div className="flex-shrink-0">
                                {profileImage ? (
                                  <img 
                                    src={profileImage} 
                                    alt={otherName}
                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                    <span className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400">
                                      {otherName.charAt(0)}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Conversation Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                                    {otherName}
                                  </h4>
                                  {lastMessage && (
                                    <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                                      {new Date(lastMessage.createdAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {otherRole}{otherClub ? ` • ${otherClub}` : ''}
                                </p>
                                {lastMessage && (
                                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5 sm:mt-1">
                                    {lastMessage.content}
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        })}

                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t('settings.messages.total') || 'Total:'} <span className="font-semibold">{conversations.length}</span> {t('settings.messages.conversations') || 'conversations'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Active Chat Window */}
        {activeChat && (
          <ChatWindow
            conversationId={activeChat.conversationId}
            otherParticipant={activeChat.otherParticipant}
            currentUserId={activeChat.currentUserId}
            currentUserType={activeChat.currentUserType}
            onClose={() => setActiveChat(null)}
          />
        )}

        {saved && (
          <div className="fixed bottom-8 right-8 p-4 bg-green-50 dark:bg-green-900/90 border border-green-200 dark:border-green-800 rounded-lg shadow-lg flex items-center space-x-3 z-50">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-800 dark:text-green-200 font-medium">{t('settings.saved')}</span>
          </div>
        )}

        {/* CV Type Modal for Hybrid Users */}
        {showCVModal && playerData && recruiterData && (
          <CVTypeModal
            isOpen={showCVModal}
            onClose={() => setShowCVModal(false)}
            playerData={playerData}
            recruiterData={recruiterData}
            userName={session?.user?.name || `${playerData.firstName} ${playerData.lastName}`}
          />
        )}

        {/* CV Language Export Popup */}
        {showCVLanguagePopup && (
          <CVExportLanguagePopup
            onClose={() => setShowCVLanguagePopup(false)}
            onExport={handleExportCV}
            userType={cvExportType}
          />
        )}
      </div>
    </div>
  )
}
