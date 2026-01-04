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
    lookingForMembers: '',
    userType: '', // Filter by RECRUITER or HYBRID
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
  }, [searchDebounce, filters.canton, filters.genderCoached, filters.positionLookingFor, filters.lookingForMembers, filters.userType])

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
      lookingForMembers: '',
      userType: '',
    })
  }

  const hasActiveFilters = filters.search || filters.canton || filters.genderCoached || filters.positionLookingFor || filters.lookingForMembers || filters.userType

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
                  className="w-full pl-10 pr-10 py-2 text-sm leading-normal border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white placeholder:leading-normal"
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
                <option value="">{t('cantons.allCantons')}</option>
                <option value="AG">{t('cantons.AG')}</option>
                <option value="AI">{t('cantons.AI')}</option>
                <option value="AR">{t('cantons.AR')}</option>
                <option value="BE">{t('cantons.BE')}</option>
                <option value="BL">{t('cantons.BL')}</option>
                <option value="BS">{t('cantons.BS')}</option>
                <option value="FR">{t('cantons.FR')}</option>
                <option value="GE">{t('cantons.GE')}</option>
                <option value="GL">{t('cantons.GL')}</option>
                <option value="GR">{t('cantons.GR')}</option>
                <option value="JU">{t('cantons.JU')}</option>
                <option value="LU">{t('cantons.LU')}</option>
                <option value="NE">{t('cantons.NE')}</option>
                <option value="NW">{t('cantons.NW')}</option>
                <option value="OW">{t('cantons.OW')}</option>
                <option value="SG">{t('cantons.SG')}</option>
                <option value="SH">{t('cantons.SH')}</option>
                <option value="SO">{t('cantons.SO')}</option>
                <option value="SZ">{t('cantons.SZ')}</option>
                <option value="TG">{t('cantons.TG')}</option>
                <option value="TI">{t('cantons.TI')}</option>
                <option value="UR">{t('cantons.UR')}</option>
                <option value="VD">{t('cantons.VD')}</option>
                <option value="VS">{t('cantons.VS')}</option>
                <option value="ZG">{t('cantons.ZG')}</option>
                <option value="ZH">{t('cantons.ZH')}</option>
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
                <option value="">{t('playerProfile.all')}</option>
                <option value="MALE">{t('playerProfile.men')}</option>
                <option value="FEMALE">{t('playerProfile.women')}</option>
              </select>
            </div>

            {/* User Type - Recruiter/Hybrid filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('recruiters.userTypeLabel')}
              </label>
              <select
                value={filters.userType}
                onChange={(e) => handleFilterChange('userType', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="">{t('recruiters.userTypeAll')}</option>
                <option value="RECRUITER">{t('recruiters.userTypeRecruiter')}</option>
                <option value="HYBRID">{t('recruiters.userTypeHybrid')}</option>
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
                <option value="">{t('playerProfile.all')}</option>
                <option value="OUTSIDE_HITTER">{t('playerProfile.positionOutsideHitter')}</option>
                <option value="OPPOSITE">{t('playerProfile.positionOpposite')}</option>
                <option value="MIDDLE_BLOCKER">{t('playerProfile.positionMiddleBlocker')}</option>
                <option value="SETTER">{t('playerProfile.positionSetter')}</option>
                <option value="LIBERO">{t('playerProfile.positionLibero')}</option>
                <option value="UNIVERSAL">{t('playerProfile.positionUniversal')}</option>
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
