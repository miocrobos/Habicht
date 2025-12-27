'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MapPin } from 'lucide-react'
import CantonFlag from '@/components/shared/CantonFlag'
import { getCantonInfo } from '@/lib/swissData'
import { useLanguage } from '@/contexts/LanguageContext'

export default function PlayerCard({ player }: { player: any }) {
  const { t } = useLanguage()
  const cantonInfo = getCantonInfo(player.canton)
  const age = player.dateOfBirth ? Math.floor((new Date().getTime() - new Date(player.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null
  
  // Get gradient based on role and gender
    // Get solid color based on role and gender
    const getSolidColor = () => {
      if (player.user?.role === 'HYBRID') {
        return '#f97316'; // Orange for HYBRID
      }
      if (player.user?.role === 'RECRUITER') {
        return '#9333ea'; // Purple for RECRUITER
      }
      if (player.gender === 'FEMALE') {
        return '#ec4899'; // Pink for DAMEN
      }
      return '#2563eb'; // Blue for HERREN
    }
  
  return (
    <Link href={`/players/${player.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition overflow-hidden cursor-pointer">
        {/* Header with solid background */}
        <div 
          className="h-40 relative flex items-center justify-center"
          style={{ 
            background: getSolidColor()
          }}
        >
          {/* Gender Badge */}
          <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full flex items-center gap-2 text-sm font-semibold z-10">
            <span>{player.gender === 'MALE' ? `♂ ${t('playerProfile.men')}` : `♀ ${t('playerProfile.women')}`}</span>
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
              <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold bg-red-700">
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

          {/* Location and League */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>{player.municipality ? `${player.municipality}, ` : ''}{cantonInfo.name}</span>
            </div>
            {player.currentLeague && player.currentClub && (
              <Link
                href={`/clubs/${player.currentClub.id}?league=${encodeURIComponent(player.currentLeague)}`}
                className="inline-block mt-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-semibold hover:bg-red-200 dark:hover:bg-red-800 transition cursor-pointer"
                title={player.currentLeague}
              >
                {player.currentLeague}
              </Link>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
