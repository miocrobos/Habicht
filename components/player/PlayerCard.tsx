'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MapPin } from 'lucide-react'
import CantonFlag from '@/components/shared/CantonFlag'
import { getCantonInfo } from '@/lib/swissData'
import { useLanguage } from '@/contexts/LanguageContext'

// League translation helper
const getLeagueLabel = (league: string, t: (key: string) => string) => {
  const leagueMap: { [key: string]: string } = {
    'NLA': 'home.leagues.nla',
    'NLB': 'home.leagues.nlb',
    'FIRST_LEAGUE': 'home.leagues.firstLeague',
    'SECOND_LEAGUE': 'home.leagues.secondLeague',
    'THIRD_LEAGUE': 'home.leagues.thirdLeague',
    'FOURTH_LEAGUE': 'home.leagues.fourthLeague',
    'FIFTH_LEAGUE': 'home.leagues.fifthLeague',
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
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl sm:hover:shadow-2xl transition overflow-hidden cursor-pointer active:scale-[0.98]">
        {/* Header with solid background */}
        <div 
          className="h-32 sm:h-40 relative flex items-center justify-center"
          style={{ 
            background: getSolidColor()
          }}
        >
          {/* Gender Badge */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 sm:px-3 py-0.5 sm:py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold z-10">
            <span>{player.gender === 'MALE' ? `♂ ${t('playerProfile.men')}` : `♀ ${t('playerProfile.women')}`}</span>
          </div>
          {/* Canton Flag */}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
            <CantonFlag canton={player.canton} size="sm" />
          </div>

          {/* Profile Picture Centered in Header */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-3 sm:border-4 border-white dark:border-gray-800 shadow-lg sm:shadow-xl overflow-hidden bg-gray-200 dark:bg-gray-700">
            {player.profileImage ? (
              <Image
                src={player.profileImage}
                alt={`${player.firstName} ${player.lastName}`}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-2xl sm:text-4xl font-bold bg-red-700">
                {player.firstName[0]}{player.lastName[0]}
              </div>
            )}
          </div>
        </div>

        {/* Player Info */}
        <div className="px-3 py-3 sm:px-6 sm:py-6 bg-gray-50 dark:bg-gray-900 text-center">
          <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2 truncate">
            {player.firstName} {player.lastName}
          </h3>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-2 sm:mb-4">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                {player.height || '-'}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">cm</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                {age || '-'}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Jahr</div>
            </div>
          </div>

          {/* Location and League */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate max-w-[150px] sm:max-w-none">{player.municipality ? `${player.municipality}, ` : ''}{cantonInfo.name}</span>
            </div>
            {player.currentLeague && player.currentClub && (
              <Link
                href={`/clubs/${player.currentClub.id}?league=${encodeURIComponent(player.currentLeague)}`}
                className="inline-block mt-0.5 sm:mt-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-[10px] sm:text-xs font-semibold hover:bg-red-200 dark:hover:bg-red-800 transition cursor-pointer truncate max-w-full"
                title={getLeagueLabel(player.currentLeague, t)}
              >
                {getLeagueLabel(player.currentLeague, t)}
              </Link>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
