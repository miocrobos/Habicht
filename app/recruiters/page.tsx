'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Filter, MapPin, Users, X } from 'lucide-react'
import axios from 'axios'
import RecruiterCard from '@/components/recruiter/RecruiterCard'
import { useLanguage } from '@/contexts/LanguageContext'

export default function RecruitersPage() {
  const { t } = useLanguage()
  const [recruiters, setRecruiters] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    canton: '',
    genderCoached: '',
    positionLookingFor: '',
    lookingForMembers: ''
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
    loadRecruiters()
  }, [searchDebounce, filters.canton, filters.genderCoached, filters.positionLookingFor, filters.lookingForMembers])

  const loadRecruiters = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      
      const response = await axios.get(`/api/recruiters?${params}`)
      setRecruiters(response.data.recruiters || [])
    } catch (error) {
      console.error('Error loading recruiters:', error)
      setRecruiters([])
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
      canton: '',
      genderCoached: '',
      positionLookingFor: '',
      lookingForMembers: ''
    })
  }

  const hasActiveFilters = filters.search || filters.canton || filters.genderCoached || filters.positionLookingFor || filters.lookingForMembers

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{t('recruiters.title')}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t('recruiters.subtitle')}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('recruiters.filtersTitle')}</h3>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition"
              >
                <X className="w-4 h-4" />
                {t('recruiters.clearAllFilters')}
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('recruiters.searchLabel')}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                  placeholder={t('recruiters.searchPlaceholder')}
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

            {/* Canton */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('recruiters.cantonLabel')}
              </label>
              <select
                value={filters.canton}
                onChange={(e) => handleFilterChange('canton', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="">Alle</option>
                <option value="AG">Aargau</option>
                <option value="AI">Appenzell Innerrhoden</option>
                <option value="AR">Appenzell Ausserrhoden</option>
                <option value="BE">Bern</option>
                <option value="BL">Basel-Landschaft</option>
                <option value="BS">Basel-Stadt</option>
                <option value="FR">Freiburg</option>
                <option value="GE">Genf</option>
                <option value="GL">Glarus</option>
                <option value="GR">Graubünden</option>
                <option value="JU">Jura</option>
                <option value="LU">Luzern</option>
                <option value="NE">Neuenburg</option>
                <option value="NW">Nidwalden</option>
                <option value="OW">Obwalden</option>
                <option value="SG">St. Gallen</option>
                <option value="SH">Schaffhausen</option>
                <option value="SO">Solothurn</option>
                <option value="SZ">Schwyz</option>
                <option value="TG">Thurgau</option>
                <option value="TI">Tessin</option>
                <option value="UR">Uri</option>
                <option value="VD">Waadt</option>
                <option value="VS">Wallis</option>
                <option value="ZG">Zug</option>
                <option value="ZH">Zürich</option>
              </select>
            </div>

            {/* Gender Coached */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('recruiters.teamGenderLabel')}
              </label>
              <select
                value={filters.genderCoached}
                onChange={(e) => handleFilterChange('genderCoached', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="">Alle</option>
                <option value="MALE">Männer</option>
                <option value="FEMALE">Frauen</option>
              </select>
            </div>

            {/* Position Looking For */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('recruiters.lookingForPositionLabel')}
              </label>
              <select
                value={filters.positionLookingFor}
                onChange={(e) => handleFilterChange('positionLookingFor', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
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
          </div>

          {/* Active Recruiting Toggle */}
          <div className="mt-4 flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.lookingForMembers === 'true'}
                onChange={(e) => handleFilterChange('lookingForMembers', e.target.checked ? 'true' : '')}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('recruiters.activeRecruitingOnly')}
              </span>
            </label>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            {loading ? t('recruiters.loading') : `${recruiters.length} ${t('recruiters.recruitersFound')}`}
          </p>
        </div>

        {/* Recruiters Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg h-80 animate-pulse">
                <div className="h-40 bg-gray-300 dark:bg-gray-700" />
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mx-auto" />
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mx-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : recruiters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recruiters.map((recruiter: any) => (
              <RecruiterCard key={recruiter.id} recruiter={recruiter} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('recruiters.noRecruitersFound')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('recruiters.noRecruitersText')}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {t('recruiters.resetAllFilters')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
