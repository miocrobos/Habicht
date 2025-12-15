import { getSchoolInfo, getSchoolLogo } from '@/lib/schoolData'

interface SchoolBadgeProps {
  schoolName: string
  schoolType?: string
  graduationYear?: number
  size?: 'sm' | 'md' | 'lg'
  showYear?: boolean
}

export default function SchoolBadge({ 
  schoolName, 
  schoolType, 
  graduationYear, 
  size = 'md',
  showYear = true 
}: SchoolBadgeProps) {
  const schoolInfo = getSchoolInfo(schoolName)
  const logo = schoolInfo?.logo || getSchoolLogo(schoolName, schoolType)

  const sizes = {
    sm: {
      container: 'px-3 py-1.5',
      logo: 'text-xl',
      text: 'text-xs',
      year: 'text-xs'
    },
    md: {
      container: 'px-4 py-2',
      logo: 'text-2xl',
      text: 'text-sm',
      year: 'text-xs'
    },
    lg: {
      container: 'px-5 py-3',
      logo: 'text-3xl',
      text: 'text-base',
      year: 'text-sm'
    }
  }

  const typeColors = {
    UNIVERSITY: 'from-purple-50 to-indigo-50 border-purple-200',
    FH: 'from-blue-50 to-cyan-50 border-blue-200',
    GYMNASIUM: 'from-green-50 to-emerald-50 border-green-200',
    BERUFSSCHULE: 'from-orange-50 to-amber-50 border-orange-200',
    OTHER: 'from-gray-50 to-slate-50 border-gray-200'
  }

  const typeTextColors = {
    UNIVERSITY: 'text-purple-700',
    FH: 'text-blue-700',
    GYMNASIUM: 'text-green-700',
    BERUFSSCHULE: 'text-orange-700',
    OTHER: 'text-gray-700'
  }

  const bgColor = typeColors[schoolInfo?.type as keyof typeof typeColors] || typeColors.OTHER
  const textColor = typeTextColors[schoolInfo?.type as keyof typeof typeTextColors] || typeTextColors.OTHER

  return (
    <div className={`
      inline-flex items-center gap-2 rounded-lg border-2
      bg-gradient-to-r ${bgColor}
      ${sizes[size].container}
      transition-all hover:shadow-md
    `}>
      <div className={`${sizes[size].logo} flex-shrink-0`}>
        {logo}
      </div>
      <div className="flex flex-col min-w-0">
        <div className={`font-semibold ${textColor} ${sizes[size].text} truncate`}>
          {schoolName}
        </div>
        {showYear && graduationYear && (
          <div className={`text-gray-600 ${sizes[size].year}`}>
            Abschluss {graduationYear}
          </div>
        )}
      </div>
    </div>
  )
}
