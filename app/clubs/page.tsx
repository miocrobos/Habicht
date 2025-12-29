'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Filter, Search } from 'lucide-react'
import CantonFlag from '@/components/shared/CantonFlag'
import ClubBadge from '@/components/shared/ClubBadge'
import Link from 'next/link'
import axios from 'axios'
import { useLanguage } from '@/contexts/LanguageContext'

const CANTONS = [
  'Alle',
  'AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR',
  'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG',
  'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH'
]

const LEAGUES = ['Alle', 'NLA', 'NLB', '1. Liga', '2. Liga', '3. Liga', '4. Liga', '5. Liga', 'U23', 'U20', 'U18']

export default function ClubsPage() {
  const { t } = useLanguage()
  
  // Function to get translated league label
  const getLeagueLabel = (league: string) => {
    switch(league) {
      case 'Alle': return t('playerProfile.all')
      case 'NLA': return t('leagues.nla')
      case 'NLB': return t('leagues.nlb')
      case '1. Liga': return t('leagues.firstLeague')
      case '2. Liga': return t('leagues.secondLeague')
      case '3. Liga': return t('leagues.thirdLeague')
      case '4. Liga': return t('leagues.fourthLeague')
      case '5. Liga': return t('leagues.fifthLeague')
      case 'U23': return t('leagues.u23')
      case 'U20': return t('leagues.u20')
      case 'U18': return t('leagues.u18')
      default: return league
    }
  }
  const searchParams = useSearchParams()
  const cantonFromUrl = searchParams.get('canton')
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCanton, setSelectedCanton] = useState(cantonFromUrl || 'Alle')
  const [selectedLeague, setSelectedLeague] = useState('Alle')
  const [selectedGender, setSelectedGender] = useState('ALL')
  const [clubs, setClubs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (cantonFromUrl) {
      setSelectedCanton(cantonFromUrl)
    }
  }, [cantonFromUrl])

  useEffect(() => {
    loadClubs()
  }, [selectedCanton, selectedLeague, selectedGender])

  const loadClubs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCanton !== 'Alle') params.append('canton', selectedCanton)
      if (selectedLeague !== 'Alle') params.append('league', selectedLeague)
      if (selectedGender !== 'ALL') {
        params.append('gender', selectedGender)
      }
      
      const response = await axios.get(`/api/clubs?${params}`)
      // Sort clubs alphabetically by name
      const sortedClubs = response.data.clubs.sort((a: any, b: any) => 
        a.name.localeCompare(b.name, 'de-CH')
      )
      setClubs(sortedClubs)
    } catch (error) {
      console.error('Error loading clubs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter clubs by search query (client-side)
  const filteredClubs = searchQuery.trim() 
    ? clubs.filter(club => 
        club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (club.town && club.town.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : clubs

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-8 md:py-12">
      <div className="container mx-auto px-3 sm:px-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 md:mb-6">{t('clubs.title')}</h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 md:mb-8">
          {t('clubs.subtitle')}
        </p>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6 md:mb-8">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{t('clubs.filtersTitle')}</h3>
          </div>
          
          {/* Search Bar - Full width on top */}
          <div className="mb-3 sm:mb-4">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
              {t('clubs.searchLabel') || 'Suche'}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('clubs.searchPlaceholder') || 'Verein oder Stadt suchen...'}
                className="w-full pl-10 pr-4 py-2.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {/* Canton Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                {t('clubs.cantonLabel')}
              </label>
              <select
                value={selectedCanton}
                onChange={(e) => setSelectedCanton(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="Alle">{t('playerProfile.all')}</option>
                {CANTONS.slice(1).map(canton => (
                  <option key={canton} value={canton}>{canton}</option>
                ))}
              </select>
            </div>

            {/* League Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                {t('clubs.leagueLabel')}
              </label>
              <select
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="Alle">{t('playerProfile.all')}</option>
                {LEAGUES.slice(1).map(league => (
                  <option key={league} value={league}>{getLeagueLabel(league)}</option>
                ))}
              </select>
            </div>

            {/* Gender Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                {t('clubs.genderLabel')}
              </label>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="ALL">{t('playerProfile.all')}</option>
                <option value="MALE">{t('playerProfile.men')}</option>
                <option value="FEMALE">{t('playerProfile.women')}</option>
              </select>
            </div>
          </div>

          <div className="mt-3 sm:mt-4 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">{filteredClubs.length}</span>
            <span>{t('clubs.clubsFound')}</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-red-600"></div>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-400">{t('clubs.loading')}</p>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredClubs.map((club: any) => (
                <div key={club.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition p-4 sm:p-6">
                  <div className="flex items-center gap-4 mb-4">
                    {/* Club badge links to profile page */}
                    <Link href={`/clubs/${club.id}`} className="hover:scale-110 transition-transform">
                      <ClubBadge clubName={club.name} size="lg" uploadedLogo={club.logo} />
                    </Link>
                    <div className="flex-1">
                      <Link href={`/clubs/${club.id}`} className="hover:underline">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{club.name}</h3>
                      </Link>
                      <div className="flex items-center gap-2">
                        <CantonFlag canton={club.canton} size="sm" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">{club.town}, {club.canton}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span className="font-medium">{club.playerCount}</span>
                    <span>{t('clubs.playersRegistered')}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link
                      href={`/clubs/${club.id}`}
                      className="flex-1 inline-block bg-habicht-600 text-white px-4 py-2 rounded-lg hover:bg-habicht-700 transition text-sm font-medium text-center"
                    >
                      {t('clubs.viewPlayers')}
                    </Link>
                    {club.website && (
                      <a
                        href={club.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-block bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm font-medium text-center"
                      >
                        {t('clubs.website')}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredClubs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">{t('clubs.noClubsFound')}</p>
              </div>
            )}
          </>
        )}

        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold dark:text-white mb-4">{t('clubs.missingClub')}</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {t('clubs.missingClubText')}
          </p>
          <Link
            href="/clubs/submit"
            className="inline-block bg-swiss-red text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-medium text-center"
          >
            {t('clubs.submitClub')}
          </Link>
        </div>
      </div>
    </div>
  )
}
