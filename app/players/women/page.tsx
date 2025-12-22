'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Filter, MapPin, TrendingUp, X, RefreshCw } from 'lucide-react'
import axios from 'axios'
import CantonFlag from '@/components/shared/CantonFlag'
import ClubBadge from '@/components/shared/ClubBadge'
import ClickableProfilePicture from '@/components/profile/ClickableProfilePicture'
import { getCantonInfo } from '@/lib/swissData'
import { useLanguage } from '@/contexts/LanguageContext'

export default function WomenPlayersPage() {
  const { t } = useLanguage()
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    position: '',
    canton: '',
    league: '',
    minHeight: '',
    school: '',
    gender: 'FEMALE',
  })
  const [searchDebounce, setSearchDebounce] = useState('')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(filters.search)
    }, 300)
    return () => clearTimeout(timer)
  }, [filters.search])

  useEffect(() => {
    loadPlayers()
  }, [searchDebounce, filters.position, filters.canton, filters.league, filters.minHeight, filters.school])

  const loadPlayers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      
      const response = await axios.get(`/api/players?${params}`)
      setPlayers(response.data.players)
    } catch (error) {
      console.error('Error loading players:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value })
  }

  const clearAllFilters = () => {
    setFilters({
      search: '',
      position: '',
      canton: '',
      league: '',
      minHeight: '',
      school: '',
      gender: 'FEMALE',
    })
  }

  const hasActiveFilters = filters.search || filters.position || filters.canton || filters.league || filters.minHeight || filters.school

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('players.womenTitle')}</h1>
              <p className="text-lg text-gray-600">
                {t('players.womenPlayers')}
              </p>
            </div>
            <Link 
              href="/players/men"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              {t('players.toMen')}
            </Link>
          </div>
          
          {/* Quick Links */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => handleFilterChange('league', 'NLA')}
              className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition text-sm font-medium"
            >
              {t('players.nlaWomen')}
            </button>
            <button
              onClick={() => handleFilterChange('league', 'NLB')}
              className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition text-sm font-medium"
            >
              {t('players.nlbWomen')}
            </button>
            <button
              onClick={() => handleFilterChange('league', 'FIRST_LEAGUE')}
              className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition text-sm font-medium"
            >
              {t('players.league1')}
            </button>
            <button
              onClick={() => handleFilterChange('league', 'SECOND_LEAGUE')}
              className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition text-sm font-medium"
            >
              {t('players.league2')}
            </button>
            <button
              onClick={() => handleFilterChange('league', 'THIRD_LEAGUE')}
              className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition text-sm font-medium"
            >
              {t('players.league3')}
            </button>
            <button
              onClick={() => handleFilterChange('league', 'FOURTH_LEAGUE')}
              className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition text-sm font-medium"
            >
              {t('players.league4')}
            </button>
            <button
              onClick={() => handleFilterChange('league', 'FIFTH_LEAGUE')}
              className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition text-sm font-medium"
            >
              {t('players.league5')}
            </button>
            <button
              onClick={() => handleFilterChange('league', '')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
            >
              {t('players.showAll')}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('players.filtersTitle')}</h3>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition"
              >
                <X className="w-4 h-4" />
                {t('playerProfile.clearFilters')}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('playerProfile.search')}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                  placeholder={t('playerProfile.searchPlaceholder')}
                />
                {filters.search && (
                  <button
                    onClick={() => handleFilterChange('search', '')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Position
              </label>
              <select
                value={filters.position}
                onChange={(e) => handleFilterChange('position', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="">Alle</option>
                <option value="OUTSIDE_HITTER">Aussenspieler</option>
                <option value="OPPOSITE">Diagonalspieler</option>
                <option value="MIDDLE_BLOCKER">Mittelblocker</option>
                <option value="SETTER">Zuspieler</option>
                <option value="LIBERO">Libero</option>
                <option value="UNIVERSAL">Universal</option>
              </select>
            </div>

            {/* Canton */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Kanton
              </label>
              <select
                value={filters.canton}
                onChange={(e) => handleFilterChange('canton', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="">Alle</option>
                <option value="AG">Aargau</option>
                <option value="AI">Appenzell Innerrhoden</option>
                <option value="AR">Appenzell Ausserrhoden</option>
                <option value="BE">Bern</option>
                <option value="BL">Basel-Landschaft</option>
                <option value="BS">Basel-Stadt</option>
                <option value="FR">Freiburg</option>
                <option value="GE">Genève</option>
                <option value="GL">Glarus</option>
                <option value="GR">Graubünden</option>
                <option value="JU">Jura</option>
                <option value="LU">Luzern</option>
                <option value="NE">Neuchâtel</option>
                <option value="NW">Nidwalden</option>
                <option value="OW">Obwalden</option>
                <option value="SG">St. Gallen</option>
                <option value="SH">Schaffhausen</option>
                <option value="SO">Solothurn</option>
                <option value="SZ">Schwyz</option>
                <option value="TG">Thurgau</option>
                <option value="TI">Ticino</option>
                <option value="UR">Uri</option>
                <option value="VD">Vaud</option>
                <option value="VS">Valais</option>
                <option value="ZG">Zug</option>
                <option value="ZH">Zürich</option>
              </select>
            </div>

            {/* League */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('playerProfile.league')}
              </label>
              <select
                value={filters.league}
                onChange={(e) => handleFilterChange('league', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="">{t('playerProfile.all')}</option>
                <option value="NLA">NLA</option>
                <option value="NLB">NLB</option>
                <option value="FIRST_LEAGUE">1. Liga</option>
                <option value="SECOND_LEAGUE">2. Liga</option>
                <option value="THIRD_LEAGUE">3. Liga</option>
                <option value="FOURTH_LEAGUE">4. Liga</option>
                <option value="FIFTH_LEAGUE">5. Liga</option>
                <option value="YOUTH_U19">U19</option>
                <option value="YOUTH_U17">U17</option>
              </select>
            </div>

            {/* School/Institute */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('register.school') || 'Schule'}
              </label>
              <input
                type="text"
                value={filters.school}
                onChange={(e) => handleFilterChange('school', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                placeholder="ETH, Uni Zürich..."
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">{t('playerProfile.loadingPlayers')}</p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-lg text-gray-900 dark:text-white">{players.length}</span> {t('playerProfile.womenPlayersFound')}
              </div>
              {hasActiveFilters && (
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Filter className="w-3 h-3" />
                  {t('playerProfile.filtersActive')}
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {players.map((player: any) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>

            {players.length === 0 && (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('players.noPlayersFound')}</p>
                <p className="text-gray-500 dark:text-gray-400 mb-6">{t('players.adjustFilters')}</p>
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  {t('players.resetFilters')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function PlayerCard({ player }: { player: any }) {
  const { t } = useLanguage()
  const cantonInfo = getCantonInfo(player.canton)
  const age = player.dateOfBirth ? Math.floor((new Date().getTime() - new Date(player.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null
  
  // Get gradient based on role and gender
  const getGradient = () => {
    // Check user role first
    if (player.user?.role === 'HYBRID') {
      return 'linear-gradient(135deg, #f97316 0%, #fed7aa 50%, #ffffff 100%)' // Orange for HYBRID
    }
    if (player.user?.role === 'RECRUITER') {
      return 'linear-gradient(135deg, #9333ea 0%, #e9d5ff 50%, #ffffff 100%)' // Purple for RECRUITER
    }
    // Pink gradient for all DAMEN players
    return 'linear-gradient(135deg, #ec4899 0%, #fce7f3 50%, #ffffff 100%)' // Pink for DAMEN
  }
  
  return (
    <Link href={`/players/${player.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition overflow-hidden cursor-pointer">
        {/* Header with gradient background */}
        <div 
          className="h-40 relative flex items-center justify-center"
          style={{ 
            background: getGradient()
          }}
        >
          {/* Gender Badge */}
          <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full flex items-center gap-2 text-sm font-semibold z-10">
            <span>♀ {t('playerProfile.women')}</span>
          </div>
          {/* Canton Flag */}
          <div className="absolute top-3 right-3 z-10">
            <CantonFlag canton={player.canton} size="sm" />
          </div>

          {/* Profile Picture Centered in Header */}
          <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-xl overflow-hidden bg-gray-200 dark:bg-gray-700">
            {player.profileImage ? (
              <Image
                src={player.profileImage}
                alt={`${player.firstName} ${player.lastName}`}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold bg-gradient-to-br from-pink-600 to-pink-800">
                {player.firstName[0]}{player.lastName[0]}
              </div>
            )}
          </div>
        </div>

        {/* Player Info */}
        <div className="px-6 py-6 bg-gray-50 dark:bg-gray-900 text-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {player.firstName} {player.lastName}
          </h3>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {player.height || '-'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">cm</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {age || '-'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Jahr</div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4" />
            <span>{player.municipality ? `${player.municipality}, ` : ''}{player.canton}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

