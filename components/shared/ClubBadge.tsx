'use client'

import { getClubInfo } from '@/lib/swissData'

interface ClubBadgeProps {
  clubName: string
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
}

export default function ClubBadge({ clubName, size = 'md', showName = false }: ClubBadgeProps) {
  const clubInfo = getClubInfo(clubName)
  
  const sizeClasses = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  // Use volleyball icon if no club info found
  const displayLogo = clubInfo.logo || '🏐'
  const bgColor = clubInfo.colors?.primary || '#FF0000'
  const borderColor = clubInfo.colors?.secondary || '#FFFFFF'

  return (
    <div className="flex items-center gap-3">
      <div 
        className={`${sizeClasses[size]} rounded-full shadow-md flex items-center justify-center font-bold relative border-4`}
        style={{ 
          backgroundColor: bgColor,
          borderColor: borderColor,
        }}
        title={clubName}
      >
        <span className="filter drop-shadow-lg">{displayLogo}</span>
      </div>
      {showName && (
        <div>
          <div className={`${textSizes[size]} font-bold text-gray-900`}>
            {clubName}
          </div>
          <div className="text-xs text-gray-500 font-medium">
            {clubInfo.symbol || 'VB'}
          </div>
        </div>
      )}
    </div>
  )
}
