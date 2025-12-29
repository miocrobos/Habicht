'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { ArrowLeft, MapPin, Briefcase, Calendar, Users, Clock, ExternalLink, CheckCircle, XCircle, Building2 } from 'lucide-react'
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
    town: string
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

export default function PlayerRequestDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const { t } = useLanguage()
  const [request, setRequest] = useState<PlayerRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const requestId = params.id as string
  const isOwner = request?.creatorId === session?.user?.id

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (session && requestId) {
      fetchRequest()
    }
  }, [session, status, router, requestId])

  const fetchRequest = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/player-requests/${requestId}`)
      setRequest(response.data.request)
    } catch (error: any) {
      console.error('Error fetching player request:', error)
      setError(error.response?.data?.error || 'Failed to load request')
    } finally {
      setLoading(false)
    }
  }

  const closeRequest = async () => {
    if (!confirm('Bisch sicher dass du die Aafrog schliesse wotsch?')) return
    
    try {
      await axios.patch(`/api/player-requests/${requestId}`, { status: 'CLOSED' })
      fetchRequest()
    } catch (error) {
      console.error('Error closing request:', error)
    }
  }

  const reopenRequest = async () => {
    try {
      await axios.patch(`/api/player-requests/${requestId}`, { status: 'OPEN' })
      fetchRequest()
    } catch (error) {
      console.error('Error reopening request:', error)
    }
  }

  const deleteRequest = async () => {
    if (!confirm('Bisch sicher dass du die Aafrog lösche wotsch? Das cha nöd rückgängig gmacht werde.')) return
    
    try {
      await axios.delete(`/api/player-requests/${requestId}`)
      router.push('/player-requests')
    } catch (error) {
      console.error('Error deleting request:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('de-CH', {
      day: '2-digit',
      month: 'long',
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
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !request) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t('playerRequests.notFound') || 'Aafrog nöd gfunde'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Link
            href="/player-requests"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← {t('playerRequests.backToList') || 'Zrugg zur Lischte'}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Link
          href="/player-requests"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('playerRequests.backToList') || 'Zrugg zur Lischte'}
        </Link>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className={`p-6 ${request.status === 'CLOSED' ? 'bg-gray-100 dark:bg-gray-700' : 'bg-gradient-to-r from-blue-600 to-blue-700'}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {request.status === 'CLOSED' && (
                    <span className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-full">
                      Gschlosse
                    </span>
                  )}
                  {request.status === 'OPEN' && (
                    <span className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-full">
                      Offe
                    </span>
                  )}
                </div>
                <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${request.status === 'CLOSED' ? 'text-gray-700 dark:text-gray-300' : 'text-white'}`}>
                  {request.title}
                </h1>
                <div className={`flex items-center gap-2 ${request.status === 'CLOSED' ? 'text-gray-600 dark:text-gray-400' : 'text-white/90'}`}>
                  <Building2 className="w-4 h-4" />
                  <span className="font-medium">{request.clubName}</span>
                  <span>•</span>
                  <MapPin className="w-4 h-4" />
                  <span>{request.canton}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium rounded-lg">
                🏐 {getPositionLabel(request.positionNeeded, t)}
              </span>
              <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-medium rounded-lg">
                📝 {getContractTypeLabel(request.contractType, t)}
              </span>
              {request.league && (
                <span className="px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-medium rounded-lg">
                  🏆 {getLeagueLabel(request.league, t)}
                </span>
              )}
              {request.gender && (
                <span className="px-4 py-2 bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 font-medium rounded-lg">
                  {request.gender === 'MALE' ? `♂ ${t('playerProfile.men')}` : request.gender === 'FEMALE' ? `♀ ${t('playerProfile.women')}` : request.gender}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {t('playerRequests.description') || 'Beschriibig'}
              </h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {request.description}
                </p>
              </div>
            </div>

            {/* Requirements */}
            {request.requirements && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {t('playerRequests.requirements') || 'Aaforderige'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {request.requirements}
                </p>
              </div>
            )}

            {/* Additional Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {request.salary && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Lohn / Vergüetig</div>
                  <div className="font-medium text-gray-900 dark:text-white">{request.salary}</div>
                </div>
              )}
              {request.startDate && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Startdatum</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {new Date(request.startDate).toLocaleDateString('de-CH')}
                  </div>
                </div>
              )}
            </div>

            {/* Club Info */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('playerRequests.clubInfo') || 'Club Information'}
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{request.club.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {request.club.town}, {request.club.canton}
                  </p>
                  {request.club.website && (
                    <a
                      href={request.club.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm mt-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Website bsueche
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Meta Info */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex flex-wrap gap-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Erstellt vo: <span className="font-medium">{request.creatorName}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Erstellt: {formatDate(request.createdAt)}</span>
                </div>
                {request.closedAt && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Gschlosse: {formatDate(request.closedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions (for owner) */}
          {isOwner && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-750">
              <div className="flex flex-wrap gap-3">
                {request.status === 'OPEN' ? (
                  <button
                    onClick={closeRequest}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {t('playerRequests.markAsClosed') || 'Als gschlosse markiere'}
                  </button>
                ) : (
                  <button
                    onClick={reopenRequest}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {t('playerRequests.reopen') || 'Wieder eröffne'}
                  </button>
                )}
                <button
                  onClick={deleteRequest}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  {t('playerRequests.delete') || 'Lösche'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
