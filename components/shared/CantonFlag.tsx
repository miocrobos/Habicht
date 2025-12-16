'use client'

import Image from 'next/image'
import { getCantonInfo } from '@/lib/swissData'
import { useState } from 'react'

interface CantonFlagProps {
  canton: string
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
}

// Actual Swiss Canton Flag SVG representations (fallback)
const CantonFlagSVG = ({ canton }: { canton: string }) => {
  const flags: Record<string, JSX.Element> = {
    ZH: ( // Zürich - Blue and white diagonal
      <svg viewBox="0 0 300 200" className="w-full h-full">
        <rect width="300" height="200" fill="#0F05A0"/>
        <rect width="300" height="200" fill="white" transform="rotate(45 150 100)" x="-150" y="50" width="600" height="100"/>
      </svg>
    ),
    BE: ( // Bern - Red with yellow diagonal stripe and bear
      <svg viewBox="0 0 300 200" className="w-full h-full">
        <rect width="300" height="200" fill="#ED1C24"/>
        <rect x="110" y="-50" width="80" height="300" fill="#FFD700" transform="rotate(45 150 100)"/>
        <text x="150" y="130" fontSize="120" textAnchor="middle" fill="#000">🐻</text>
      </svg>
    ),
    LU: ( // Luzern - Blue and white horizontal
      <svg viewBox="0 0 300 200" className="w-full h-full">
        <rect width="300" height="100" fill="#0066CC"/>
        <rect y="100" width="300" height="100" fill="white"/>
      </svg>
    ),
    UR: ( // Uri - Yellow with bull head
      <svg viewBox="0 0 300 200" className="w-full h-full">
        <rect width="300" height="200" fill="#FFD700"/>
        <text x="150" y="130" fontSize="100" textAnchor="middle" fill="#000">🐂</text>
      </svg>
    ),
    SZ: ( // Schwyz - Red with white cross in corner
      <svg viewBox="0 0 300 200" className="w-full h-full">
        <rect width="300" height="200" fill="#FF0000"/>
        <rect x="20" y="20" width="15" height="60" fill="white"/>
        <rect x="5" y="35" width="45" height="15" fill="white"/>
      </svg>
    ),
    OW: ( // Obwalden - Red and white
      <svg viewBox="0 0 300 200" className="w-full h-full">
        <rect width="300" height="200" fill="#FF0000"/>
        <path d="M 0,0 L 300,0 L 150,100 Z" fill="white"/>
      </svg>
    ),
    NW: ( // Nidwalden - Red with white key
      <svg viewBox="0 0 300 200" className="w-full h-full">
        <rect width="300" height="200" fill="#FF0000"/>
        <text x="150" y="130" fontSize="100" textAnchor="middle" fill="white">🔑</text>
      </svg>
    ),
    GL: ( // Glarus - Red with Saint Fridolin
      <svg viewBox="0 0 300 200" className="w-full h-full">
        <rect width="300" height="200" fill="#FF0000"/>
        <circle cx="150" cy="100" r="60" fill="black" opacity="0.3"/>
      </svg>
    ),
    ZG: ( // Zug - Blue, white, blue
      <svg viewBox="0 0 300 200" className="w-full h-full">
        <rect width="300" height="200" fill="#0066CC"/>
        <rect y="60" width="300" height="80" fill="white"/>
      </svg>
    ),
    FR: ( // Fribourg - Black and white
      <svg viewBox="0 0 300 200" className="w-full h-full">
        <rect width="150" height="200" fill="#000"/>
        <rect x="150" width="150" height="200" fill="white"/>
      </svg>
    ),
    SO: ( // Solothurn - Red and white
      <svg viewBox="0 0 300 200" className="w-full h-full">
        <rect width="300" height="100" fill="#FF0000"/>
        <rect y="100" width="300" height="100" fill="white"/>
      </svg>
    ),
    BS: ( // Basel-Stadt - White with crosier
      <svg viewBox="0 0 300 200" className="w-full h-full">
        <rect width="300" height="200" fill="white"/>
        <rect x="130" y="40" width="40" height="120" fill="#000"/>
        <circle cx="150" cy="50" r="20" fill="#000"/>
      </svg>
    ),
    BL: ( // Basel-Landschaft - White and red with crosier
      <svg viewBox="0 0 300 200" className="w-full h-full">
        <rect width="300" height="100" fill="white"/>
        <rect y="100" width="300" height="100" fill="#FF0000"/>
        <rect x="130" y="40" width="40" height="60" fill="#FF0000"/>
        <rect x="130" y="100" width="40" height="60" fill="white"/>
      </svg>
    ),
    SH: ( // Schaffhausen - Yellow with black ram
      <svg viewBox="0 0 300 200" className="w-full h-full">
        <rect width="300" height="200" fill="#FFD700"/>
        <text x="150" y="130" fontSize="100" textAnchor="middle" fill="#000">🐏</text>
      </svg>
    ),
    AR: ( // Appenzell Ausserrhoden - Black with bear
      <svg viewBox="0 0 300 200" className="w-full h-full">
        <rect width="300" height="200" fill="#000"/>
        <text x="150" y="130" fontSize="100" textAnchor="middle" fill="white">🐻</text>
      </svg>
    ),
    AI: ( // Appenzell Innerrhoden - Black with bear
      <svg viewBox="0 0 300 200" className="w-full h-full">
        <rect width="300" height="200" fill="#000"/>
        <text x="80" y="130" fontSize="90" textAnchor="middle" fill="#FFD700">🐻</text>
        <text x="220" y="130" fontSize="90" textAnchor="middle" fill="#FFD700">🐻</text>
      </svg>
    ),
    SG: ( // St. Gallen - Green and white with fasces
      <svg viewBox="0 0 300 200" className="w-full h-full">
        <rect width="300" height="200" fill="#00824A"/>
        <rect x="130" y="40" width="40" height="120" fill="white"/>
        <circle cx="150" cy="50" r="20" fill="white"/>
      </svg>
    ),
    GR: ( // Graubünden - Black, white, black with ibex
      <svg viewBox="0 0 300 200" className="w-full h-full">
        <rect width="100" height="200" fill="#000"/>
        <rect x="100" width="100" height="200" fill="white"/>
        <rect x="200" width="100" height="200" fill="#000"/>
      </svg>
    ),
    AG: ( // Aargau - Black, blue, black with waves
      <svg viewBox="0 0 300 200" className="w-full h-full">
        <rect width="300" height="67" fill="#000"/>
        <rect y="67" width="300" height="66" fill="#0066CC"/>
        <rect y="133" width="300" height="67" fill="#000"/>
        <path d="M0,90 Q75,75 150,90 T300,90" stroke="white" strokeWidth="6" fill="none"/>
        <path d="M0,110 Q75,95 150,110 T300,110" stroke="white" strokeWidth="6" fill="none"/>
        <path d="M0,130 Q75,115 150,130 T300,130" stroke="white" strokeWidth="6" fill="none"/>
      </svg>
    ),
    TG: ( // Thurgau - Green and white with lions
      <svg viewBox="0 0 300 200" className="w-full h-full">
        <rect width="150" height="200" fill="#00824A"/>
        <rect x="150" width="150" height="200" fill="white"/>
        <text x="75" y="130" fontSize="80" textAnchor="middle" fill="white">🦁</text>
        <text x="225" y="130" fontSize="80" textAnchor="middle" fill="#00824A">🦁</text>
      </svg>
    ),
    TI: ( // Ticino - Red and blue
      <svg viewBox="0 0 300 200" className="w-full h-full">
        <rect width="150" height="200" fill="#FF0000"/>
        <rect x="150" width="150" height="200" fill="#0066CC"/>
      </svg>
    ),
    VD: ( // Vaud - Green and white with motto
      <svg viewBox="0 0 300 200" className="w-full h-full">
        <rect width="300" height="100" fill="#00824A"/>
        <rect y="100" width="300" height="100" fill="white"/>
        <text x="150" y="60" fontSize="30" textAnchor="middle" fill="white" fontWeight="bold">LIBERTÉ</text>
        <text x="150" y="145" fontSize="30" textAnchor="middle" fill="#00824A" fontWeight="bold">PATRIE</text>
      </svg>
    ),
    VS: ( // Valais - Red and white with stars
      <svg viewBox="0 0 300 200" className="w-full h-full">
        <rect width="150" height="200" fill="white"/>
        <rect x="150" width="150" height="200" fill="#FF0000"/>
        <text x="75" y="120" fontSize="60" textAnchor="middle" fill="#FF0000">⭐</text>
        <text x="75" y="70" fontSize="40" textAnchor="middle" fill="#FF0000">⭐</text>
        <text x="75" y="170" fontSize="40" textAnchor="middle" fill="#FF0000">⭐</text>
        <text x="40" y="120" fontSize="40" textAnchor="middle" fill="#FF0000">⭐</text>
        <text x="110" y="120" fontSize="40" textAnchor="middle" fill="#FF0000">⭐</text>
        <text x="225" y="120" fontSize="60" textAnchor="middle" fill="white">⭐</text>
        <text x="225" y="70" fontSize="40" textAnchor="middle" fill="white">⭐</text>
        <text x="225" y="170" fontSize="40" textAnchor="middle" fill="white">⭐</text>
        <text x="190" y="120" fontSize="40" textAnchor="middle" fill="white">⭐</text>
        <text x="260" y="120" fontSize="40" textAnchor="middle" fill="white">⭐</text>
      </svg>
    ),
    NE: ( // Neuchâtel - Green, white, red
      <svg viewBox="0 0 300 200" className="w-full h-full">
        <rect width="100" height="200" fill="#00824A"/>
        <rect x="100" width="100" height="200" fill="white"/>
        <rect x="200" width="100" height="200" fill="#FF0000"/>
      </svg>
    ),
    GE: ( // Geneva - Yellow and red with key and eagle
      <svg viewBox="0 0 300 200" className="w-full h-full">
        <rect width="150" height="200" fill="#FFD700"/>
        <rect x="150" width="150" height="200" fill="#FF0000"/>
        <text x="75" y="130" fontSize="80" textAnchor="middle" fill="#FF0000">🦅</text>
        <text x="225" y="130" fontSize="80" textAnchor="middle" fill="#FFD700">🔑</text>
      </svg>
    ),
    JU: ( // Jura - Red with white and colored stripes
      <svg viewBox="0 0 300 200" className="w-full h-full">
        <rect width="300" height="200" fill="#FF0000"/>
        <rect y="70" width="300" height="20" fill="white"/>
        <rect y="110" width="300" height="20" fill="white"/>
        <path d="M20,40 L40,20 L60,40 L40,60 Z" fill="#00824A"/>
        <path d="M70,40 L90,20 L110,40 L90,60 Z" fill="#FFD700"/>
        <path d="M120,40 L140,20 L160,40 L140,60 Z" fill="#0066CC"/>
      </svg>
    ),
  }

  return flags[canton] || flags['ZH']
}

export default function CantonFlag({ canton, size = 'md', showName = false }: CantonFlagProps) {
  const cantonInfo = getCantonInfo(canton)
  
  const sizeClasses = {
    sm: 'w-8 h-6',
    md: 'w-12 h-9',
    lg: 'w-16 h-12',
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  const [useImage, setUseImage] = useState(true)

  return (
    <div className="flex items-center gap-2">
      <div 
        className={`${sizeClasses[size]} rounded border border-gray-300 dark:border-gray-600 shadow-sm overflow-hidden relative`}
        title={cantonInfo.name}
      >
        {useImage ? (
          <Image
            src={`/cantons/${canton}.png`}
            alt={`${cantonInfo.name} flag`}
            fill
            className="object-contain"
            onError={() => setUseImage(false)}
          />
        ) : (
          <CantonFlagSVG canton={canton} />
        )}
      </div>
      {showName && (
        <span className={`${textSizes[size]} font-medium text-gray-700 dark:text-gray-300`}>
          {cantonInfo.name}
        </span>
      )}
    </div>
  )
}
