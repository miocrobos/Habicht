'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Search, Filter, MapPin, Briefcase, Users, Clock, X, Plus, CheckCircle, XCircle, Star } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'
import InterestButton from '@/components/shared/InterestButton'
import InterestedPlayersModal from '@/components/shared/InterestedPlayersModal'

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

// Translation helper functions
const getPositionLabel = (position: string, t: (key: string) => string) => {
  const positionMap: { [key: string]: string } = {
    'OUTSIDE_HITTER': 'positions.outsideHitter',
    'OPPOSITE': 'positions.opposite',
    'MIDDLE_BLOCKER': 'positions.middleBlocker',
    'SETTER': 'positions.setter',
    'LIBERO': 'positions.libero',
    'UNIVERSAL': 'positions.universal'
  }
  const key = positionMap[position]
  return key ? t(key) : position
}

const getContractTypeLabel = (contractType: string, t: (key: string) => string) => {
  const contractMap: { [key: string]: string } = {
    'PROFESSIONAL': 'playerRequests.contractTypes.professional',
    'SEMI_PROFESSIONAL': 'playerRequests.contractTypes.semiProfessional',
    'AMATEUR': 'playerRequests.contractTypes.amateur',
    'VOLUNTEER': 'playerRequests.contractTypes.volunteer',
    'INTERNSHIP': 'playerRequests.contractTypes.internship'
  }
  const key = contractMap[contractType]
  return key ? t(key) : contractType
}

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
  const [showStarredRequests, setShowStarredRequests] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<{ id: string, title: string } | null>(null)

  const isRecruiterOrHybrid = session?.user?.role === 'RECRUITER' || session?.user?.role === 'HYBRID'
  const isPlayerOrHybrid = session?.user?.role === 'PLAYER' || session?.user?.role === 'HYBRID'

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (session) {
      fetchRequests()
    }
  }, [session, status, router, showMyRequests, showStarredRequests, filters.status])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (showMyRequests && isRecruiterOrHybrid) params.append('myRequests', 'true')
      if (showStarredRequests && isPlayerOrHybrid) params.append('starredRequests', 'true')
      
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
                <option value="OUTSIDE_HITTER">{t('positions.outsideHitter')}</option>
                <option value="OPPOSITE">{t('positions.opposite')}</option>
                <option value="MIDDLE_BLOCKER">{t('positions.middleBlocker')}</option>
                <option value="SETTER">{t('positions.setter')}</option>
                <option value="LIBERO">{t('positions.libero')}</option>
                <option value="UNIVERSAL">{t('positions.universal')}</option>
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
                <option value="PROFESSIONAL">{t('playerRequests.contractTypes.professional')}</option>
                <option value="SEMI_PROFESSIONAL">{t('playerRequests.contractTypes.semiProfessional')}</option>
                <option value="AMATEUR">{t('playerRequests.contractTypes.amateur')}</option>
                <option value="VOLUNTEER">{t('playerRequests.contractTypes.volunteer')}</option>
                <option value="INTERNSHIP">{t('playerRequests.contractTypes.internship')}</option>
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

          {/* Starred Requests Toggle (for players/hybrids) */}
          {isPlayerOrHybrid && (
            <div className={`mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 ${isRecruiterOrHybrid ? 'mt-2 pt-2 border-t-0' : ''}`}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showStarredRequests}
                  onChange={(e) => setShowStarredRequests(e.target.checked)}
                  className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-500"
                />
                <Star className={`w-4 h-4 ${showStarredRequests ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t('playerRequests.showStarredRequests') || 'Nur gsternte Aafroge zeige'}
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
                      {/* Club Logo */}
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {request.club?.logo && request.club.logo.startsWith('http') ? (
                          <Image
                            src={request.club.logo}
                            alt={request.club.name || request.clubName}
                            width={48}
                            height={48}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Briefcase className="w-6 h-6 text-gray-500" />
                        )}
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
                        {getPositionLabel(request.positionNeeded, t)}
                      </span>
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm rounded-full">
                        {getContractTypeLabel(request.contractType, t)}
                      </span>
                      {request.league && (
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-sm rounded-full">
                          {getLeagueLabel(request.league, t)}
                        </span>
                      )}
                      {request.gender && (
                        <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 text-sm rounded-full">
                          {request.gender === 'MALE' ? `♂ ${t('playerProfile.men')}` : request.gender === 'FEMALE' ? `♀ ${t('playerProfile.women')}` : request.gender}
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
                  <div className="flex lg:flex-col gap-2 items-end">
                    {/* Interest Button - Only for open requests */}
                    {request.status === 'OPEN' && (
                      <InterestButton
                        requestId={request.id}
                        isPlayerOrHybrid={isPlayerOrHybrid}
                        isCreator={request.creatorId === session?.user?.id}
                        onShowInterestedPlayers={() => setSelectedRequest({ id: request.id, title: request.title })}
                      />
                    )}
                    
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

      {/* Interested Players Modal */}
      {selectedRequest && (
        <InterestedPlayersModal
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          requestId={selectedRequest.id}
          requestTitle={selectedRequest.title}
        />
      )}
    </div>
  )
}
