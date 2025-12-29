'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Search, Filter, MapPin, Briefcase, Users, Clock, X, Plus, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

interface PlayerRequest {
  id: string
  creatorId: string
  creatorType: string
  creatorName: string
  clubId: string
  clubName: string
  canton: string
  title: string
  description: string
  positionNeeded: string
  contractType: string
  gender: string | null
  league: string | null
  salary: string | null
  startDate: string | null
  requirements: string | null
  status: string
  createdAt: string
  closedAt: string | null
  club: {
    id: string
    name: string
    logo: string | null
    website: string | null
    canton: string
  }
}

const positionLabels: Record<string, string> = {
  OUTSIDE_HITTER: 'Aussespieler',
  OPPOSITE: 'Diagonalspieler',
  MIDDLE_BLOCKER: 'Mittelblocker',
  SETTER: 'Zuspieler',
  LIBERO: 'Libero',
  UNIVERSAL: 'Universal'
}

const contractTypeLabels: Record<string, string> = {
  PROFESSIONAL: 'Professionell',
  SEMI_PROFESSIONAL: 'Semi-Professionell',
  AMATEUR: 'Amateur',
  VOLUNTEER: 'Freiwillig',
  INTERNSHIP: 'Praktikum'
}

const leagueLabels: Record<string, string> = {
  NLA: 'NLA',
  NLB: 'NLB',
  FIRST_LEAGUE: '1. Liga',
  SECOND_LEAGUE: '2. Liga',
  THIRD_LEAGUE: '3. Liga',
  FOURTH_LEAGUE: '4. Liga',
  FIFTH_LEAGUE: '5. Liga',
  YOUTH_U23: 'U23',
  YOUTH_U20: 'U20',
  YOUTH_U18: 'U18'
}

export default function PlayerRequestsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useLanguage()
  const [requests, setRequests] = useState<PlayerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    position: '',
    canton: '',
    contractType: '',
    status: 'OPEN'
  })
  const [showMyRequests, setShowMyRequests] = useState(false)

  const isRecruiterOrHybrid = session?.user?.role === 'RECRUITER' || session?.user?.role === 'HYBRID'

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (session) {
      fetchRequests()
    }
  }, [session, status, router, showMyRequests, filters.status])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (showMyRequests && isRecruiterOrHybrid) params.append('myRequests', 'true')
      
      const response = await axios.get(`/api/player-requests?${params}`)
      setRequests(response.data.requests || [])
    } catch (error) {
      console.error('Error fetching player requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const closeRequest = async (requestId: string) => {
    try {
      await axios.patch(`/api/player-requests/${requestId}`, { status: 'CLOSED' })
      fetchRequests()
    } catch (error) {
      console.error('Error closing request:', error)
    }
  }

  const filteredRequests = requests.filter(req => {
    if (filters.search) {
      const query = filters.search.toLowerCase()
      if (
        !req.title.toLowerCase().includes(query) &&
        !req.clubName.toLowerCase().includes(query) &&
        !req.description.toLowerCase().includes(query) &&
        !req.creatorName.toLowerCase().includes(query)
      ) {
        return false
      }
    }
    if (filters.position && req.positionNeeded !== filters.position) return false
    if (filters.canton && req.canton !== filters.canton) return false
    if (filters.contractType && req.contractType !== filters.contractType) return false
    return true
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('playerRequests.loading') || 'Loading...'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {t('playerRequests.title') || 'Spieler-Aafroge'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('playerRequests.subtitle') || 'Finde Clubs wo Spieler sueche'}
            </p>
          </div>
          
          {isRecruiterOrHybrid && (
            <Link
              href="/player-requests/create"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              {t('playerRequests.create') || 'Neui Aafrog erstelle'}
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('playerRequests.filters') || 'Filter'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('playerRequests.search') || 'Sueche'}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder={t('playerRequests.searchPlaceholder') || 'Titel, Club, oder Beschriibig...'}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Position Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('playerRequests.position') || 'Position'}
              </label>
              <select
                value={filters.position}
                onChange={(e) => setFilters({ ...filters, position: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="">{t('playerRequests.allPositions') || 'Alli Positione'}</option>
                {Object.entries(positionLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Contract Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('playerRequests.contractType') || 'Vertragstyp'}
              </label>
              <select
                value={filters.contractType}
                onChange={(e) => setFilters({ ...filters, contractType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="">{t('playerRequests.allContracts') || 'Alli Typen'}</option>
                {Object.entries(contractTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('playerRequests.status') || 'Status'}
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="OPEN">{t('playerRequests.statusOpen') || 'Offe'}</option>
                <option value="CLOSED">{t('playerRequests.statusClosed') || 'Gschlosse'}</option>
                <option value="">{t('playerRequests.statusAll') || 'Alli'}</option>
              </select>
            </div>
          </div>

          {/* My Requests Toggle (for recruiters/hybrids) */}
          {isRecruiterOrHybrid && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showMyRequests}
                  onChange={(e) => setShowMyRequests(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t('playerRequests.showMyRequests') || 'Nur mini Aafroge zeige'}
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-gray-600 dark:text-gray-400">
          {filteredRequests.length} {filteredRequests.length === 1 ? 'Aafrog' : 'Aafroge'} gfunde
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('playerRequests.noResults') || 'Kei Aafroge gfunde'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('playerRequests.noResultsDescription') || 'Probier anderi Filter oder chunn spöter zrugg.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${
                  request.status === 'CLOSED' ? 'opacity-75' : ''
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Main Content */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      {/* Club Logo Placeholder */}
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-6 h-6 text-gray-500" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {request.title}
                          </h3>
                          {request.status === 'CLOSED' && (
                            <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                              Gschlosse
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <span className="font-medium">{request.clubName}</span>
                          <span>•</span>
                          <MapPin className="w-3 h-3" />
                          <span>{request.canton}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm rounded-full">
                        {positionLabels[request.positionNeeded] || request.positionNeeded}
                      </span>
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm rounded-full">
                        {contractTypeLabels[request.contractType] || request.contractType}
                      </span>
                      {request.league && (
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-sm rounded-full">
                          {leagueLabels[request.league] || request.league}
                        </span>
                      )}
                      {request.gender && (
                        <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 text-sm rounded-full">
                          {request.gender === 'MALE' ? '♂ Männer' : request.gender === 'FEMALE' ? '♀ Fraue' : request.gender}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                      {request.description}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(request.createdAt)}</span>
                      </div>
                      <span>•</span>
                      <span>Vo: {request.creatorName}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2">
                    <Link
                      href={`/player-requests/${request.id}`}
                      className="flex-1 lg:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg text-center transition-colors"
                    >
                      {t('playerRequests.viewDetails') || 'Details aaluege'}
                    </Link>
                    
                    {/* Close button for owner */}
                    {request.creatorId === session?.user?.id && request.status === 'OPEN' && (
                      <button
                        onClick={() => closeRequest(request.id)}
                        className="flex-1 lg:flex-none px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg text-center transition-colors"
                      >
                        {t('playerRequests.closeRequest') || 'Schliesse'}
                      </button>
                    )}
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
