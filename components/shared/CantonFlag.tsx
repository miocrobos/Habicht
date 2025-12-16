'use client'

import Image from 'next/image'
import { getCantonInfo } from '@/lib/swissData'

interface CantonFlagProps {
  canton: string
  size?: 'sm'  | 'md' | 'lg'
  showName?: boolean
}

export default function CantonFlag({ canton, size = 'md', showName = false }: CantonFlagProps) {
  const cantonInfo = getCantonInfo(canton)
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div className="flex items-center gap-2">
      <div 
        className={`${sizeClasses[size]} rounded border border-gray-300 dark:border-gray-600 shadow-sm overflow-hidden relative`}
        title={cantonInfo.name}
        style={{ isolation: 'isolate', colorScheme: 'only light', mixBlendMode: 'normal' }}
      >
        <Image
          src={`/cantons/${canton}.svg`}
          alt={`${cantonInfo.name} flag`}
          fill
          className="object-contain no-invert"
          priority
          style={{ filter: 'none', WebkitFilter: 'none', colorScheme: 'only light', mixBlendMode: 'normal' }}
        />
      </div>
      {showName && (
        <span className={`${textSizes[size]} font-medium text-gray-700 dark:text-gray-300`}>
          {cantonInfo.name}
        </span>
      )}
    </div>
  )
}
