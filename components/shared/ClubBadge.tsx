'use client'

import { getClubInfo } from '@/lib/swissData'
import { getCountryFlagUrlByName, isSwissClub, getCountryCode } from '@/lib/countryFlags'
import Image from 'next/image'

interface ClubBadgeProps {
  clubName: string
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  uploadedLogo?: string | null
  country?: string | null
}

const EagleLogo = ({ size }: { size: 'sm' | 'md' | 'lg' }) => {
  const svgSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <svg viewBox="0 0 100 100" className={svgSizes[size]} fill="white">
      {/* Eagle body */}
      <ellipse cx="50" cy="60" rx="18" ry="25" fill="white"/>
      
      {/* Eagle head */}
      <circle cx="50" cy="35" r="12" fill="white"/>
      
      {/* Eagle beak */}
      <path d="M 58 35 L 65 35 L 60 38 Z" fill="#FFA500"/>
      
      {/* Eagle eye */}
      <circle cx="54" cy="33" r="2" fill="#000"/>
      
      {/* Left wing */}
      <path d="M 32 55 Q 20 50 15 45 Q 18 48 22 52 Q 28 58 32 60 Z" fill="white"/>
      <path d="M 28 58 Q 18 52 12 48 Q 15 50 20 54 Q 25 60 28 62 Z" fill="white" opacity="0.8"/>
      <path d="M 25 62 Q 16 58 10 53 Q 13 55 18 59 Q 22 64 25 66 Z" fill="white" opacity="0.6"/>
      
      {/* Right wing */}
      <path d="M 68 55 Q 80 50 85 45 Q 82 48 78 52 Q 72 58 68 60 Z" fill="white"/>
      <path d="M 72 58 Q 82 52 88 48 Q 85 50 80 54 Q 75 60 72 62 Z" fill="white" opacity="0.8"/>
      <path d="M 75 62 Q 84 58 90 53 Q 87 55 82 59 Q 78 64 75 66 Z" fill="white" opacity="0.6"/>
      
      {/* Tail feathers */}
      <path d="M 45 82 Q 42 88 40 92 L 43 85 Z" fill="white" opacity="0.7"/>
      <path d="M 50 85 Q 50 92 50 95 L 50 87 Z" fill="white" opacity="0.8"/>
      <path d="M 55 82 Q 58 88 60 92 L 57 85 Z" fill="white" opacity="0.7"/>
      
      {/* Legs */}
      <rect x="46" y="80" width="2" height="8" fill="#FFA500"/>
      <rect x="52" y="80" width="2" height="8" fill="#FFA500"/>
      
      {/* Talons */}
      <path d="M 45 88 L 43 90 M 46 88 L 46 91 M 47 88 L 49 90" stroke="#FFA500" strokeWidth="1" fill="none"/>
      <path d="M 53 88 L 51 90 M 54 88 L 54 91 M 55 88 L 57 90" stroke="#FFA500" strokeWidth="1" fill="none"/>
    </svg>
  )
}

export default function ClubBadge({ clubName, size = 'md', showName = false, uploadedLogo, country }: ClubBadgeProps) {
  const clubInfo = getClubInfo(clubName)
  const isSwiss = isSwissClub(country)
  
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

  // Prioritize uploaded logo, then for non-Swiss clubs use country flag, then custom logo, then eagle logo
  const hasUploadedLogo = uploadedLogo && uploadedLogo !== ''
  let useCountryFlag = !hasUploadedLogo && !isSwiss
  let countryFlagUrl = ''
  if (useCountryFlag) {
    const code = getCountryCode(country)
    if (code && code !== 'CH') {
      countryFlagUrl = getCountryFlagUrlByName(country)
    } else {
      // fallback: not a valid country, don't use flag
      useCountryFlag = false
      if (process.env.NODE_ENV !== 'production') {
        console.warn('ClubBadge: Invalid or unmapped country for flag:', country)
      }
    }
  }
  const hasCustomLogo = !hasUploadedLogo && !useCountryFlag && clubInfo.logo && clubInfo.logo !== '🏐'
  const bgColor = clubInfo.colors?.primary || '#FF0000'
  const borderColor = clubInfo.colors?.secondary || '#FFFFFF'

  return (
    <div className="flex items-center gap-3">
      <div 
        className={`${sizeClasses[size]} rounded-full shadow-md flex items-center justify-center font-bold relative border-4 overflow-hidden`}
        style={{ 
          backgroundColor: useCountryFlag ? '#FFFFFF' : bgColor,
          borderColor: useCountryFlag ? '#CCCCCC' : borderColor,
        }}
        title={`${clubName}${!isSwiss && country ? ` (${country})` : ''}`}
      >
        {hasUploadedLogo ? (
          <Image
            src={uploadedLogo!}
            alt={clubName}
            width={size === 'sm' ? 40 : size === 'md' ? 56 : 80}
            height={size === 'sm' ? 40 : size === 'md' ? 56 : 80}
            className="w-full h-full object-cover"
          />
        ) : useCountryFlag ? (
          <Image
            src={countryFlagUrl}
            alt={`${country} flag`}
            width={size === 'sm' ? 40 : size === 'md' ? 56 : 80}
            height={size === 'sm' ? 40 : size === 'md' ? 56 : 80}
            className="w-full h-full object-cover"
            unoptimized
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              if (process.env.NODE_ENV !== 'production') {
                console.warn('ClubBadge: Failed to load flag for', country, countryFlagUrl)
              }
            }}
          />
        ) : hasCustomLogo ? (
          <span className="filter drop-shadow-lg">{clubInfo.logo}</span>
        ) : (
          <span className="filter drop-shadow-lg text-white">🏐</span>
        )}
      </div>
      {showName && (
        <div>
          <div className={`${textSizes[size]} font-bold text-gray-900`}>
            {clubName}
          </div>
          <div className="text-xs text-gray-500 font-medium">
            {!isSwiss && country ? country : (clubInfo.symbol || 'VB')}
          </div>
        </div>
      )}
    </div>
  )
}
