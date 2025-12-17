'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { data: session } = useSession()
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'appearance' | 'security' | 'language' | 'account' | 'notifications'>('appearance')
  const [language, setLanguage] = useState('de')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [recruiterMessages, setRecruiterMessages] = useState(true)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showEmail, setShowEmail] = useState(false)
  const [showPhone, setShowPhone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [municipality, setMunicipality] = useState('')

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language')
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  useEffect(() => {
    if (session?.user?.playerId) {
      fetchPrivacySettings()
    }
  }, [session])

  const fetchPrivacySettings = async () => {
    try {
      const response = await axios.get(`/api/players/${session?.user?.playerId}`)
      const player = response.data.player
      setShowEmail(player.showEmail || false)
      setShowPhone(player.showPhone || false)
      setMunicipality(player.municipality || '')
    } catch (error) {
      console.error('Error fetching privacy settings:', error)
    }
  }

  const updatePrivacySettings = async (field: 'showEmail' | 'showPhone', value: boolean) => {
    try {
      setLoading(true)
      await axios.put(`/api/players/${session?.user?.playerId}`, {
        playerData: {
          [field]: value
        }
      })
      if (field === 'showEmail') setShowEmail(value)
      if (field === 'showPhone') setShowPhone(value)
      showSaveConfirmation()
    } catch (error) {
      console.error('Error updating privacy settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme)
    showSaveConfirmation()
  }

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)
    localStorage.setItem('language', newLanguage)
    showSaveConfirmation()
  }

  const handleNotificationChange = (type: 'email' | 'recruiter', value: boolean) => {
    if (type === 'email') setEmailNotifications(value)
    if (type === 'recruiter') setRecruiterMessages(value)
    showSaveConfirmation()
  }

  const showSaveConfirmation = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      alert('Passwörter stimmen nicht überein')
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Einstellungen
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Verwalten Sie Ihre Präferenzen und Kontoeinstellungen
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 space-y-2">
              <button
                onClick={() => setActiveTab('appearance')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'appearance'
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  <span>Erscheinungsbild</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'security'
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Login & Sicherheit</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('language')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'language'
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  <span>Sprache</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'notifications'
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span>Benachrichtigungen</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('account')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'account'
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Kontoverwaltung</span>
                </div>
              </button>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              {activeTab === 'appearance' && (
                <>
                  <div className="border-b border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">Erscheinungsbild</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Passen Sie an, wie Habicht für Sie aussieht</p>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Theme-Modus</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button onClick={() => handleThemeChange('light')} className={`relative p-6 rounded-lg border-2 transition-all duration-200 ${theme === 'light' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-yellow-400 rounded-full">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white">Hell</span>
                          </div>
                          {theme === 'light' && (
                            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-left">Helles Design mit traditioneller Farbgebung</p>
                      </button>
                      <button onClick={() => handleThemeChange('dark')} className={`relative p-6 rounded-lg border-2 transition-all duration-200 ${theme === 'dark' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-indigo-600 rounded-full">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                              </svg>
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white">Dunkel</span>
                          </div>
                          {theme === 'dark' && (
                            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-left">Dunkles Design für komfortables Arbeiten bei wenig Licht</p>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'security' && (
                <>
                  <div className="border-b border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">Login & Sicherheit</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Verwalten Sie Ihr Passwort und Sicherheitseinstellungen</p>
                  </div>
                  <div className="p-6 space-y-8">
                    {/* Privacy Settings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Datenschutz</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Steuern Sie, welche Informationen öffentlich sichtbar sind</p>
                      
                      {/* Email Toggle */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">E-Mail-Adresse Anzeige</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Ihre E-Mail-Adresse für andere sichtbar machen</p>
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
                          <p className="font-medium text-gray-900 dark:text-white">Telefonnummer Anzeige</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Ihre Telefonnummer für andere sichtbar machen</p>
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
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">E-Mail-Adresse</label>
                        <input type="email" value={session?.user?.email || ''} disabled className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 cursor-not-allowed" />
                      </div>
                      <form onSubmit={handlePasswordChange} className="space-y-4 mt-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Passwort Ändern</h3>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Aktuelles Passwort</label>
                          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500" placeholder="Aktuelles Passwort eingeben" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Neues Passwort</label>
                          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500" placeholder="Neues Passwort eingeben" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Passwort bestätigen</label>
                          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500" placeholder="Passwort erneut eingeben" />
                        </div>
                        <button type="submit" className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium">Passwort ändern</button>
                      </form>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'language' && (
                <>
                  <div className="border-b border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">Sprache</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Wählen Sie Ihre bevorzugte Sprache</p>
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
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">Benachrichtigungen</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Verwalten Sie, wie Sie Benachrichtigungen erhalten</p>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">E-Mail-Benachrichtigungen</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Erhalten Sie wichtige Updates und Informationen per E-Mail</p>
                      </div>
                      <button onClick={() => handleNotificationChange('email', !emailNotifications)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${emailNotifications ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Nachrichten von Recruitern</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Erhalten Sie eine E-Mail, wenn ein Recruiter Ihnen eine Nachricht sendet oder an Ihrem Profil interessiert ist</p>
                      </div>
                      <button onClick={() => handleNotificationChange('recruiter', !recruiterMessages)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${recruiterMessages ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${recruiterMessages ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'account' && (
                <>
                  <div className="border-b border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">Kontoverwaltung</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Verwalten Sie Ihr Konto oder löschen Sie es</p>
                  </div>
                  <div className="p-6 space-y-6">
                    {/* Profile Information */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-4">Profilinformationen</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Gemeinde/Municipality
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={municipality}
                              onChange={(e) => setMunicipality(e.target.value)}
                              placeholder="z.B. Winterthur, Bern, etc."
                              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                            <button
                              onClick={async () => {
                                try {
                                  setLoading(true)
                                  await axios.put(`/api/players/${session?.user?.playerId}`, {
                                    playerData: { municipality: municipality || null }
                                  })
                                  showSaveConfirmation()
                                } catch (error) {
                                  console.error('Error updating municipality:', error)
                                } finally {
                                  setLoading(false)
                                }
                              }}
                              disabled={loading}
                              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                            >
                              Speichern
                            </button>
                          </div>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Gmeind I Dim Kanton</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">Kontoinformationen</h3>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600 dark:text-gray-400"><span className="font-medium">E-Mail:</span> {session?.user?.email || 'Nicht angemeldet'}</p>
                        <p className="text-gray-600 dark:text-gray-400"><span className="font-medium">Kontotyp:</span> {session?.user?.role || 'Gast'}</p>
                      </div>
                    </div>
                    <div className="border border-orange-300 dark:border-orange-700 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Konto deaktivieren</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Ihr Profil wird ausgeblendet und Sie können sich nicht mehr anmelden. Sie können Ihr Konto jederzeit wieder aktivieren.</p>
                      <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium">Konto deaktivieren</button>
                    </div>
                    <div className="border border-red-300 dark:border-red-700 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Konto löschen</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Diese Aktion kann nicht rückgängig gemacht werden. Alle Ihre Daten, Videos und Nachrichten werden dauerhaft gelöscht.</p>
                      <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium">Konto dauerhaft löschen</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {saved && (
          <div className="fixed bottom-8 right-8 p-4 bg-green-50 dark:bg-green-900/90 border border-green-200 dark:border-green-800 rounded-lg shadow-lg flex items-center space-x-3 z-50">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-800 dark:text-green-200 font-medium">Einstellungen gespeichert</span>
          </div>
        )}
      </div>
    </div>
  )
}
