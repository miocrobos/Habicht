'use client'

import { useState, useEffect } from 'react'
import { Star, Users } from 'lucide-react'
import axios from 'axios'
import { useLanguage } from '@/contexts/LanguageContext'

interface InterestButtonProps {
  requestId: string
  isPlayerOrHybrid: boolean
  isCreator: boolean
  onShowInterestedPlayers?: () => void
}

export default function InterestButton({
  requestId,
  isPlayerOrHybrid,
  isCreator,
  onShowInterestedPlayers
}: InterestButtonProps) {
  const { t } = useLanguage()
  const [hasInterest, setHasInterest] = useState(false)
  const [interestCount, setInterestCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    fetchInterestStatus()
  }, [requestId])

  const fetchInterestStatus = async () => {
    try {
      const response = await axios.get(`/api/player-requests/${requestId}/interest`)
      setHasInterest(response.data.hasInterest)
      setInterestCount(response.data.interestCount)
    } catch (error) {
      console.error('Error fetching interest status:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleInterest = async () => {
    if (!isPlayerOrHybrid || toggling) return

    setToggling(true)
    try {
      if (hasInterest) {
        const response = await axios.delete(`/api/player-requests/${requestId}/interest`)
        setHasInterest(false)
        setInterestCount(response.data.interestCount)
      } else {
        const response = await axios.post(`/api/player-requests/${requestId}/interest`)
        setHasInterest(true)
        setInterestCount(response.data.interestCount)
      }
    } catch (error) {
      console.error('Error toggling interest:', error)
    } finally {
      setToggling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-1 text-gray-400">
        <Star className="w-5 h-5 animate-pulse" />
      </div>
    )
  }

  // For creators - show star with count, clickable to view interested players
  if (isCreator) {
    return (
      <button
        onClick={onShowInterestedPlayers}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        title={t('playerRequests.viewInterestedPlayers') || 'View interested players'}
      >
        <Star className="w-5 h-5" />
        {interestCount > 0 && (
          <span className="text-sm font-medium">{interestCount}</span>
        )}
      </button>
    )
  }

  // For players/hybrids - show star to toggle interest
  if (isPlayerOrHybrid) {
    return (
      <button
        onClick={toggleInterest}
        disabled={toggling}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
          hasInterest
            ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/50'
        } ${toggling ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={hasInterest 
          ? (t('playerRequests.removeInterest') || 'Remove interest')
          : (t('playerRequests.showInterest') || 'Show interest')
        }
      >
        <Star 
          className={`w-5 h-5 ${hasInterest ? 'fill-current' : ''}`}
        />
        {interestCount > 0 && (
          <span className="text-sm font-medium">{interestCount}</span>
        )}
      </button>
    )
  }

  // For recruiters (non-creator) - just show count
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg">
      <Star className="w-5 h-5" />
      {interestCount > 0 && (
        <span className="text-sm font-medium">{interestCount}</span>
      )}
    </div>
  )
}
