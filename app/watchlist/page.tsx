'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { X, Search, Bookmark } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

interface WatchlistPlayer {
  id: string
  player: {
    id: string
    user: {
      name: string | null
      image: string | null
    }
    gender: string
    positions: string[]
    primaryPosition: string | null
    currentLeague: string | null
    currentClub: {
      id: string
      name: string
    } | null
  }
  createdAt: string
}

export default function WatchlistPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useLanguage()
  const [watchlist, setWatchlist] = useState<WatchlistPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

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
      fetchWatchlist()
    }
  }, [session, status, router])

  const fetchWatchlist = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/watchlist')
      setWatchlist(response.data.watchlist || [])
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

  const filteredWatchlist = watchlist.filter(item => {
    if (!searchQuery) return true
    
    const playerName = item.player.user.name?.toLowerCase() || ''
    const clubName = item.player.currentClub?.name.toLowerCase() || ''
    const query = searchQuery.toLowerCase()
    
    return playerName.includes(query) || clubName.includes(query)
  })

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {t('watchlist.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {watchlist.length} {t('watchlist.playerCount')}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('watchlist.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-swiss-red dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* Watchlist Grid */}
        {filteredWatchlist.length === 0 ? (
          <div className="text-center py-16">
            <Bookmark className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('watchlist.empty')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('watchlist.emptyDescription')}
            </p>
            <Link
              href="/players"
              className="inline-block bg-swiss-red text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
            >
              {t('nav.players')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWatchlist.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="p-6">
                  {/* Player Image & Name */}
                  <div className="flex items-center mb-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                      {item.player.user.image ? (
                        <Image
                          src={item.player.user.image}
                          alt={item.player.user.name || 'Player'}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">
                          {item.player.gender === 'MALE' ? '♂' : '♀'}
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {item.player.user.name || 'Unknown Player'}
                      </h3>
                      {item.player.currentClub && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.player.currentClub.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Player Info */}
                  <div className="space-y-2 mb-4">
                    {item.player.primaryPosition && (
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">{t('playerProfile.primaryPosition')}:</span>{' '}
                        {t(`positions.${item.player.primaryPosition.toLowerCase().replace(' ', '_')}`)}
                      </p>
                    )}
                    {item.player.currentLeague && (
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">{t('playerProfile.league')}:</span>{' '}
                        {t(`leagues.${item.player.currentLeague.toLowerCase().replace(/\s+/g, '')}`)}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Link
                      href={`/players/${item.player.id}`}
                      className="flex-1 bg-swiss-red text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-center"
                    >
                      {t('watchlist.viewProfile')}
                    </Link>
                    <button
                      onClick={() => removeFromWatchlist(item.player.id)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                      title={t('watchlist.removeFromWatchlist')}
                    >
                      <X className="w-5 h-5" />
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
