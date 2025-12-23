'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Filter, MapPin, TrendingUp, X, RefreshCw } from 'lucide-react'
import axios from 'axios'
import PlayerCard from '@/components/player/PlayerCard'
import { useLanguage } from '@/contexts/LanguageContext'

export default function PlayersPage() {
  const { t } = useLanguage()
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    position: '',
    canton: '',
    league: '',
    minHeight: '',
    gender: '',
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
  }, [searchDebounce, filters.position, filters.canton, filters.league, filters.minHeight, filters.gender])

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
      gender: '',
    })
  }

  const hasActiveFilters = filters.search || filters.position || filters.canton || filters.league || filters.minHeight || filters.gender

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{t('players.title')}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t('players.subtitle')}
          </p>
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
                {t('players.clearAllFilters')}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('players.searchLabel')}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                  placeholder={t('players.searchPlaceholder')}
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
                {t('players.positionLabel')}
              </label>
              <select
                value={filters.position}
                onChange={(e) => handleFilterChange('position', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="">{t('players.positionAll')}</option>
                <option value="OUTSIDE_HITTER">{t('players.positionOutsideHitter')}</option>
                <option value="OPPOSITE">{t('players.positionOpposite')}</option>
                <option value="MIDDLE_BLOCKER">{t('players.positionMiddleBlocker')}</option>
                <option value="SETTER">{t('players.positionSetter')}</option>
                <option value="LIBERO">{t('players.positionLibero')}</option>
                <option value="UNIVERSAL">{t('players.positionUniversal')}</option>
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('players.genderLabel')}
              </label>
              <select
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="">{t('players.genderAll')}</option>
                <option value="MALE">{t('players.genderMale')}</option>
                <option value="FEMALE">{t('players.genderFemale')}</option>
              </select>
            </div>

            {/* Canton */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('players.cantonLabel')}
              </label>
              <select
                value={filters.canton}
                onChange={(e) => handleFilterChange('canton', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="">{t('players.cantonAll')}</option>
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
                {t('players.leagueLabel')}
              </label>
              <select
                value={filters.league}
                onChange={(e) => handleFilterChange('league', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="">{t('players.leagueAll')}</option>
                <option value="NLA">{t('home.leagues.nla')}</option>
                <option value="NLB">{t('home.leagues.nlb')}</option>
                <option value="FIRST_LEAGUE">{t('home.leagues.firstLeague')}</option>
                <option value="SECOND_LEAGUE">{t('home.leagues.secondLeague')}</option>
                <option value="THIRD_LEAGUE">{t('home.leagues.thirdLeague')}</option>
                <option value="FOURTH_LEAGUE">{t('home.leagues.fourthLeague')}</option>
                <option value="FIFTH_LEAGUE">{t('home.leagues.fifthLeague')}</option>
                <option value="YOUTH_U19">{t('home.leagues.u19')}</option>
                <option value="YOUTH_U17">{t('home.leagues.u17')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-habicht-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">{t('players.loading')}</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              {players.length} {t('players.playersFound')}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {players.map((player: any) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>

            {players.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">{t('players.noPlayersFound')}</p>
                <button
                  onClick={() => setFilters({ search: '', position: '', canton: '', league: '', minHeight: '', gender: '' })}
                  className="mt-4 text-habicht-600 hover:text-habicht-700 font-medium"
                >
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
