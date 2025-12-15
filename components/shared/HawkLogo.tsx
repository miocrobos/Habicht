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
      <div className={`relative ${sizes[size]}`}>
        <svg viewBox="0 0 100 100" className={`w-full h-full ${animated ? 'transition-transform group-hover:scale-110' : ''}`}>
          {/* Red circular background */}
          <circle cx="50" cy="50" r="48" fill="#FF0000" className={animated ? 'group-hover:animate-pulse' : ''}/>
          
          {/* White hawk silhouette */}
          {/* Head and body */}
          <path d="M 50 30 Q 45 35 45 40 L 45 50 Q 45 55 50 58 Q 55 55 55 50 L 55 40 Q 55 35 50 30 Z" 
                fill="white" stroke="white" strokeWidth="1"/>
          
          {/* Sharp golden beak */}
          <path d="M 50 30 L 42 28 L 50 35 Z" fill="#FFD700" stroke="#FFA500" strokeWidth="0.5"/>
          
          {/* Left wing spread */}
          <path d="M 45 50 Q 30 45 25 55 Q 28 58 35 55 Q 40 53 45 52 Z" 
                fill="white" stroke="white" strokeWidth="1"/>
          
          {/* Right wing spread */}
          <path d="M 55 50 Q 70 45 75 55 Q 72 58 65 55 Q 60 53 55 52 Z" 
                fill="white" stroke="white" strokeWidth="1"/>
          
          {/* Tail feathers - three distinct feathers */}
          <path d="M 48 58 L 45 70 L 48 68 Z" fill="white" opacity="0.9"/>
          <path d="M 50 58 L 50 72 L 50 68 Z" fill="white" opacity="0.9"/>
          <path d="M 52 58 L 55 70 L 52 68 Z" fill="white" opacity="0.9"/>
          
          {/* Sharp eye with red accent */}
          <circle cx="47" cy="38" r="2" fill="#FF0000"/>
          <circle cx="47" cy="38" r="1" fill="white"/>
          
          {/* Swiss cross on chest */}
          <rect x="48" y="48" width="4" height="2" fill="#FF0000"/>
          <rect x="49" y="47" width="2" height="4" fill="#FF0000"/>
          
          {/* Detail lines for feathers */}
          <line x1="45" y1="52" x2="43" y2="54" stroke="white" strokeWidth="0.5" opacity="0.6"/>
          <line x1="55" y1="52" x2="57" y2="54" stroke="white" strokeWidth="0.5" opacity="0.6"/>
        </svg>
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
