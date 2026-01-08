'use client'

import { useState, useEffect } from 'react'
import { X, Users, MessageCircle, ExternalLink, MapPin } from 'lucide-react'
import axios from 'axios'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'

interface InterestedPlayer {
  id: string
  userId: string
  userName: string
  userImage: string | null
  userType: 'PLAYER' | 'HYBRID'
  createdAt: string
  profileUrl: string
  profileData: {
    id: string
    firstName: string
    lastName: string
    profileImage: string | null
    positions?: string[]
    currentLeagues?: string[]
    canton?: string
    city?: string
    gender?: string
    lookingForClub?: boolean
    currentClub?: {
      id: string
      name: string
    } | null
  } | null
}

interface InterestedPlayersModalProps {
  isOpen: boolean
  onClose: () => void
  requestId: string
  requestTitle: string
}

export default function InterestedPlayersModal({
  isOpen,
  onClose,
  requestId,
  requestTitle
}: InterestedPlayersModalProps) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [interests, setInterests] = useState<InterestedPlayer[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && requestId) {
      fetchInterestedPlayers()
    }
  }, [isOpen, requestId])

  const fetchInterestedPlayers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`/api/player-requests/${requestId}/interested-players`)
      setInterests(response.data.interests)
    } catch (error: any) {
      console.error('Error fetching interested players:', error)
      setError(error.response?.data?.error || 'Failed to load interested players')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getPositionLabel = (position: string) => {
    const positionMap: { [key: string]: string } = {
      'OUTSIDE_HITTER': t('positions.outsideHitter') || 'Outside Hitter',
      'OPPOSITE': t('positions.opposite') || 'Opposite',
      'MIDDLE_BLOCKER': t('positions.middleBlocker') || 'Middle Blocker',
      'SETTER': t('positions.setter') || 'Setter',
      'LIBERO': t('positions.libero') || 'Libero',
      'UNIVERSAL': t('positions.universal') || 'Universal'
    }
    return positionMap[position] || position
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-t-xl sm:rounded-xl shadow-xl w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                {t('playerRequests.interestedPlayers') || 'Interested Players'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                {requestTitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[60vh] sm:max-h-[60vh] p-3 sm:p-4">
            {loading ? (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 sm:py-12">
                <p className="text-sm sm:text-base text-red-500">{error}</p>
              </div>
            ) : interests.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {t('playerRequests.noInterestedPlayers') || 'No interested players yet'}
                </h3>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                  {t('playerRequests.noInterestedPlayersDesc') || 'Players who are interested will appear here.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {interests.map((interest) => (
                  <div
                    key={interest.id}
                    className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    {/* Profile Image */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0">
                      {(interest.profileData?.profileImage || interest.userImage) ? (
                        <Image
                          src={interest.profileData?.profileImage || interest.userImage || ''}
                          alt={interest.userName}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-base sm:text-lg font-medium">
                          {interest.userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white truncate">
                          {interest.userName}
                        </h4>
                        <span className={`px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs rounded-full ${
                          interest.userType === 'HYBRID'
                            ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                            : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        }`}>
                          {interest.userType === 'HYBRID' ? 'Hybrid' : 'Player'}
                        </span>
                      </div>
                      
                      {interest.profileData && (
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          {interest.profileData.positions && interest.profileData.positions.length > 0 && (
                            <span className="line-clamp-1">{interest.profileData.positions.map(p => getPositionLabel(p)).join(', ')}</span>
                          )}
                          {interest.profileData.canton && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {interest.profileData.canton}
                              </span>
                            </>
                          )}
                          {interest.profileData.currentClub && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span className="line-clamp-1">{interest.profileData.currentClub.name}</span>
                            </>
                          )}
                        </div>
                      )}
                      
                      <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">
                        {t('playerRequests.interestedSince') || 'Interested since'}: {formatDate(interest.createdAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      <Link
                        href={interest.profileUrl}
                        className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title={t('common.viewProfile') || 'View Profile'}
                      >
                        <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Link>
                      <Link
                        href={`/settings?tab=messages&startChat=${interest.userId}`}
                        className="p-1.5 sm:p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                        title={t('playerProfile.sendMessage') || 'Send Message'}
                      >
                        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm sm:text-base bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              {t('playerProfile.close') || 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
