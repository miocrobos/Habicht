'use client'

import { getCantonInfo } from '@/lib/swissData'

interface CantonFlagProps {
  canton: string
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
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

  return (
    <div className="flex items-center gap-2">
      <div 
        className={`${sizeClasses[size]} rounded border-2 border-gray-300 shadow-sm flex items-center justify-center font-bold text-white relative overflow-hidden`}
        style={{ 
          background: `linear-gradient(to bottom, ${cantonInfo.colors.primary} 50%, ${cantonInfo.colors.secondary} 50%)`,
        }}
        title={cantonInfo.name}
      >
        <span className="text-xs font-bold mix-blend-difference">
          {canton}
        </span>
      </div>
      {showName && (
        <span className={`${textSizes[size]} font-medium text-gray-700`}>
          {cantonInfo.name}
        </span>
      )}
    </div>
  )
}
