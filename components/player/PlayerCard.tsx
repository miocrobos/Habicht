'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MapPin } from 'lucide-react'
import CantonFlag from '@/components/shared/CantonFlag'
import { getCantonInfo } from '@/lib/swissData'

export default function PlayerCard({ player }: { player: any }) {
  const cantonInfo = getCantonInfo(player.canton)
  const age = player.dateOfBirth ? Math.floor((new Date().getTime() - new Date(player.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null
  const league = player.currentLeague ? player.currentLeague.replace('_', ' ') : 'FIRST_LEAGUE'
  
  return (
    <Link href={`/players/${player.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition overflow-hidden cursor-pointer">
        {/* Header with gradient background */}
        <div 
          className="h-32 relative"
          style={{ 
            background: `linear-gradient(135deg, ${cantonInfo.colors.primary} 0%, ${cantonInfo.colors.secondary} 100%)`
          }}
        >
          {/* Gender Badge */}
          <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full flex items-center gap-2 text-sm font-semibold">
            <span>{player.gender === 'MALE' ? '♂ HERREN' : '♀ DAMEN'}</span>
          </div>
          {/* Canton Flag */}
          <div className="absolute top-3 right-3">
            <CantonFlag canton={player.canton} size="sm" />
          </div>
        </div>

        {/* Profile Picture - Overlapping header */}
        <div className="flex justify-center -mt-16 mb-4">
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
              <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold bg-gradient-to-br from-red-600 to-red-800">
                {player.firstName[0]}{player.lastName[0]}
              </div>
            )}
          </div>
        </div>

        {/* Player Info */}
        <div className="px-6 pb-6 text-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {player.firstName} {player.lastName}
          </h3>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {player.height || '-'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">cm</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600 dark:text-red-400">
                {league}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Liga</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {age || '-'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Jahr</div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4" />
            <span>{player.city || 'Unknown'}, {player.canton}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
