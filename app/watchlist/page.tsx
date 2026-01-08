'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { X, Search, Bookmark, Bell, RefreshCw, CheckCheck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { useHeader } from '@/contexts/HeaderContext'

// League translation helper
const getLeagueLabel = (league: string, t: (key: string) => string) => {
  const leagueMap: { [key: string]: string } = {
    'NLA': 'leagues.nla',
    'NLB': 'leagues.nlb',
    'FIRST_LEAGUE': 'leagues.firstLeague',
    'SECOND_LEAGUE': 'leagues.secondLeague',
    'THIRD_LEAGUE': 'leagues.thirdLeague',
    'FOURTH_LEAGUE': 'leagues.fourthLeague',
    'FIFTH_LEAGUE': 'leagues.fifthLeague',
    'U23': 'leagues.u23',
    'U20': 'leagues.u20',
    'U18': 'leagues.u18',
    'YOUTH_U23': 'leagues.u23',
    'YOUTH_U20': 'leagues.u20',
    'YOUTH_U18': 'leagues.u18'
  }
  const key = leagueMap[league]
  return key ? t(key) : league
}

interface WatchlistNotification {
  id: string
  type: string
  title: string
  message: string
  actionUrl: string | null
  read: boolean
  createdAt: string
  playerId?: string
}

interface WatchlistPlayer {
  id: string
  player: {
    id: string
    firstName: string
    lastName: string
    profileImage: string | null
    user: {
      name: string | null
      image: string | null
    }
    gender: string
    positions: string[]
    primaryPosition: string | null
    currentLeagues: string[]
    currentClub: {
      id: string
      name: string
    } | null
  }
  createdAt: string
  recentUpdate?: WatchlistNotification | null
}

export default function WatchlistPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useLanguage()
  const { setWatchlistCount } = useHeader()
  const [watchlist, setWatchlist] = useState<WatchlistPlayer[]>([])
  const [notifications, setNotifications] = useState<WatchlistNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showUpdatesOnly, setShowUpdatesOnly] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (session && session.user.role !== 'RECRUITER' && session.user.role !== 'HYBRID') {
      router.push('/')
      return
    }

    if (session) {
      fetchWatchlistAndNotifications()
    }
  }, [session, status, router])

  const fetchWatchlistAndNotifications = async () => {
    try {
      setLoading(true)
      
      // First fetch the watchlist (this also marks WATCHLIST_UPDATE notifications as read on the server)
      const watchlistRes = await axios.get('/api/watchlist')
      
      // Then fetch notifications (they should now be marked as read)
      const notificationsRes = await axios.get('/api/auth/user/notifications')

      const watchlistData = watchlistRes.data.watchlist || []
      const allNotifications = notificationsRes.data.notifications || []
      
      // Filter to only WATCHLIST_UPDATE and PROFILE_UPDATE notifications
      // Since we visited the watchlist, these are now marked as read on the server
      const watchlistNotifications = allNotifications.filter(
        (n: WatchlistNotification) => n.type === 'WATCHLIST_UPDATE' || n.type === 'PROFILE_UPDATE'
      ).map((n: WatchlistNotification) => ({ ...n, read: true })) // Mark as read in local state
      
      setNotifications(watchlistNotifications)
      
      // Map notifications to watchlist items by matching player IDs from actionUrl
      const notificationsByPlayerId = new Map<string, WatchlistNotification>()
      watchlistNotifications.forEach((notif: WatchlistNotification) => {
        if (notif.actionUrl) {
          const match = notif.actionUrl.match(/\/players\/([^/]+)/)
          if (match) {
            const existingNotif = notificationsByPlayerId.get(match[1])
            // Keep the most recent notification for each player
            if (!existingNotif || new Date(notif.createdAt) > new Date(existingNotif.createdAt)) {
              notificationsByPlayerId.set(match[1], { ...notif, playerId: match[1] })
            }
          }
        }
      })

      // Attach recent updates to watchlist items
      const enrichedWatchlist = watchlistData.map((item: WatchlistPlayer) => ({
        ...item,
        recentUpdate: notificationsByPlayerId.get(item.player.id) || null
      }))

      setWatchlist(enrichedWatchlist)
    } catch (error) {
      console.error('Error fetching watchlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFromWatchlist = async (playerId: string) => {
    try {
      await axios.delete(`/api/watchlist?playerId=${playerId}`)
      setWatchlist(watchlist.filter(item => item.player.id !== playerId))
    } catch (error) {
      console.error('Error removing from watchlist:', error)
    }
  }

  const dismissNotification = async (notificationId: string, playerId: string) => {
    try {
      await axios.patch(`/api/auth/user/notifications/${notificationId}/read`)
      // Update local state
      setWatchlist(prev => prev.map(item => 
        item.player.id === playerId 
          ? { ...item, recentUpdate: null }
          : item
      ))
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      // Decrement the header watchlist count
      setWatchlistCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error dismissing notification:', error)
    }
  }

  const markAllAsViewed = async () => {
    try {
      await axios.post('/api/watchlist/mark-viewed')
      // Clear all recentUpdate entries from local state
      setWatchlist(prev => prev.map(item => ({ ...item, recentUpdate: null })))
      setNotifications([])
      // Update the header watchlist count to 0
      setWatchlistCount(0)
    } catch (error) {
      console.error('Error marking all as viewed:', error)
    }
  }

  const filteredWatchlist = watchlist.filter(item => {
    if (!searchQuery && !showUpdatesOnly) return true
    
    const playerName = `${item.player.firstName} ${item.player.lastName}`.toLowerCase()
    const clubName = item.player.currentClub?.name.toLowerCase() || ''
    const query = searchQuery.toLowerCase()
    
    const matchesSearch = !searchQuery || playerName.includes(query) || clubName.includes(query)
    const matchesUpdateFilter = !showUpdatesOnly || item.recentUpdate !== null
    
    return matchesSearch && matchesUpdateFilter
  })

  const unreadUpdateCount = watchlist.filter(item => item.recentUpdate && !item.recentUpdate.read).length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-swiss-red mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('watchlist.loading') || 'Loading...'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
              {t('watchlist.title')}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {watchlist.length} {t('watchlist.playerCount')}
              {unreadUpdateCount > 0 && (
                <span className="ml-2 inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium bg-swiss-red text-white">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  {unreadUpdateCount} {t('watchlist.profileUpdates') || 'updates'}
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {unreadUpdateCount > 0 && (
              <>
                <button
                  onClick={markAllAsViewed}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('watchlist.markAllAsViewed') || 'Mark All as Viewed'}</span>
                  <span className="sm:hidden">Alle</span>
                </button>
                <button
                  onClick={() => setShowUpdatesOnly(!showUpdatesOnly)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition text-sm sm:text-base ${
                    showUpdatesOnly
                      ? 'bg-swiss-red text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  <span className="hidden sm:inline">{showUpdatesOnly ? t('watchlist.showAll') || 'Show All' : t('watchlist.showUpdatesOnly') || 'Show Updates Only'}</span>
                  <span className="sm:hidden">{showUpdatesOnly ? 'Alle' : 'Updates'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder={t('watchlist.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-swiss-red dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* Watchlist Grid */}
        {filteredWatchlist.length === 0 ? (
          <div className="text-center py-10 sm:py-16">
            <Bookmark className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-700 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {showUpdatesOnly ? (t('watchlist.noUpdates') || 'No profile updates') : t('watchlist.empty')}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 px-4">
              {showUpdatesOnly 
                ? (t('watchlist.noUpdatesDescription') || 'Players in your watchlist haven\'t updated their profiles recently.')
                : t('watchlist.emptyDescription')}
            </p>
            {showUpdatesOnly ? (
              <button
                onClick={() => setShowUpdatesOnly(false)}
                className="inline-block bg-swiss-red text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-red-700 transition text-sm sm:text-base"
              >
                {t('watchlist.showAll') || 'Show All Players'}
              </button>
            ) : (
              <Link
                href="/players"
                className="inline-block bg-swiss-red text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-red-700 transition text-sm sm:text-base"
              >
                {t('nav.players')}
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {filteredWatchlist.map((item) => (
              <div
                key={item.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition relative ${
                  item.recentUpdate ? 'ring-2 ring-swiss-red' : ''
                }`}
              >
                {/* Update Badge */}
                {item.recentUpdate && (
                  <div className="absolute top-0 right-0 bg-swiss-red text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-bl-lg flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" />
                    {t('watchlist.updated') || 'Updated'}
                  </div>
                )}

                <div className="p-3 sm:p-6">
                  {/* Player Image & Name */}
                  <div className="flex items-center mb-3 sm:mb-4">
                    <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                      {item.player.profileImage || item.player.user.image ? (
                        <Image
                          src={item.player.profileImage || item.player.user.image || ''}
                          alt={`${item.player.firstName} ${item.player.lastName}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl text-gray-400">
                          {item.player.gender === 'MALE' ? '♂' : '♀'}
                        </div>
                      )}
                    </div>
                    <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                      <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {item.player.firstName} {item.player.lastName}
                      </h3>
                      {item.player.currentClub && (
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                          {item.player.currentClub.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Profile Update Notification */}
                  {item.recentUpdate && (
                    <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1">
                            {new Date(item.recentUpdate.createdAt).toLocaleDateString('de-CH', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">
                            {t('watchlist.profileChanges') || 'Profile Changes:'}
                          </p>
                          <ul className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
                            {item.recentUpdate.message.split('; ').map((change, idx) => (
                              <li key={idx} className="text-[10px] sm:text-xs">{change}</li>
                            ))}
                          </ul>
                        </div>
                        <button
                          onClick={() => dismissNotification(item.recentUpdate!.id, item.player.id)}
                          className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                          title={t('watchlist.dismissNotification') || 'Dismiss'}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Player Info */}
                  <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                    {item.player.primaryPosition && (
                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">{t('playerProfile.primaryPosition')}:</span>{' '}
                        {t(`positions.${item.player.primaryPosition.toLowerCase().replace(' ', '_')}`)}
                      </p>
                    )}
                    {item.player.currentLeagues && item.player.currentLeagues.length > 0 && (
                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">{t('playerProfile.league')}:</span>{' '}
                        {item.player.currentLeagues.map((league: string) => getLeagueLabel(league, t)).join(', ')}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 sm:gap-3">
                    <Link
                      href={`/players/${item.player.id}`}
                      className="flex-1 bg-swiss-red text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 transition text-center text-xs sm:text-sm"
                    >
                      {t('watchlist.viewProfile')}
                    </Link>
                    <button
                      onClick={() => removeFromWatchlist(item.player.id)}
                      className="px-3 sm:px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                      title={t('watchlist.removeFromWatchlist')}
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
