import Image from 'next/image'

interface HawkLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animated?: boolean
  showText?: boolean
}

export default function HawkLogo({ size = 'md', animated = true, showText = false }: HawkLogoProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }

  return (
    <div className={`flex items-center gap-3 ${animated ? 'group' : ''}`}>
      <div className={`relative ${sizes[size]} ${animated ? 'transition-transform group-hover:scale-110' : ''}`}>
        <Image
          src="/eagle-logo.png"
          alt="Eagle Logo"
          fill
          className={`object-contain ${animated ? 'group-hover:drop-shadow-2xl' : ''}`}
          priority
          style={{ filter: 'none' }}
        />
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={`font-black text-gray-900 leading-none tracking-tight ${animated ? 'group-hover:text-red-600 transition' : ''} ${
            size === 'sm' ? 'text-base' : size === 'md' ? 'text-xl' : size === 'lg' ? 'text-3xl' : 'text-5xl'
          }`}>
            Habicht
          </span>
          {(size === 'lg' || size === 'xl') && (
            <span className="text-xs text-gray-500 font-medium tracking-wide">SWISS VOLLEYBALL</span>
          )}
        </div>
      )}
    </div>
  )
}
