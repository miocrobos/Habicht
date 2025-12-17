'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Users, Briefcase } from 'lucide-react'
import CantonFlag from '@/components/shared/CantonFlag'
import { getCantonInfo } from '@/lib/swissData'

export default function RecruiterCard({ recruiter }: { recruiter: any }) {
  const cantonInfo = getCantonInfo(recruiter.canton)
  
  // Map gender coached to display text
  const getGenderText = (gender: string | null) => {
    if (gender === 'MALE') return '♂ HERREN'
    if (gender === 'FEMALE') return '♀ DAMEN'
    return 'ALLE'
  }
  
  return (
    <Link href={`/recruiters/${recruiter.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition overflow-hidden cursor-pointer">
        {/* Header with gradient background */}
        <div 
          className="h-40 relative flex items-center justify-center"
          style={{ 
            background: `linear-gradient(135deg, ${cantonInfo.colors.primary} 0%, ${cantonInfo.colors.secondary} 100%)`
          }}
        >
          {/* Gender Coached Badge */}
          <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full flex items-center gap-2 text-sm font-semibold z-10">
            <span>{getGenderText(recruiter.genderCoached)}</span>
          </div>
          
          {/* Canton Flag */}
          <div className="absolute top-3 right-3 z-10">
            <CantonFlag canton={recruiter.canton} size="sm" />
          </div>

          {/* Profile Picture Centered in Header */}
          <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-xl overflow-hidden bg-gray-200 dark:bg-gray-700">
            {recruiter.profileImage ? (
              <Image
                src={recruiter.profileImage}
                alt={`${recruiter.firstName} ${recruiter.lastName}`}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold bg-gradient-to-br from-blue-600 to-blue-800">
                {recruiter.firstName[0]}{recruiter.lastName[0]}
              </div>
            )}
          </div>
        </div>

        {/* Recruiter Info */}
        <div className="px-6 py-6 bg-gray-50 dark:bg-gray-900 text-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {recruiter.firstName} {recruiter.lastName}
          </h3>

          {/* Role & Club */}
          <div className="mb-4">
            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">
              <Briefcase className="w-4 h-4" />
              <span>{recruiter.coachRole}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4" />
              <span>{recruiter.club?.name || recruiter.organization}</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {recruiter.age || '-'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Jahr Alt</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {recruiter.lookingForMembers ? '✓' : '-'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Rekrutiert</div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4" />
            <span>{recruiter.province ? `${recruiter.province}, ` : ''}{recruiter.canton}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
