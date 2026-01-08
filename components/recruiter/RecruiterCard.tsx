"use client";
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Users, Briefcase, MessageCircle } from 'lucide-react';
import CantonFlag from '@/components/shared/CantonFlag'
import { getCantonInfo } from '@/lib/swissData'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import ChatWindow from '@/components/chat/ChatWindow'
import { useLanguage } from '@/contexts/LanguageContext'

export default function RecruiterCard({ recruiter }: { recruiter: any }) {
  const { t } = useLanguage()
  const router = useRouter()
  const { data: session } = useSession()
  const [showChat, setShowChat] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  
  // Null guards for recruiter data
  if (!recruiter || !recruiter.firstName || !recruiter.lastName) {
    return null
  }
  
  const cantonInfo = getCantonInfo(recruiter.canton)
  
  // Map gender coached to display text
  const getGenderText = (genders: string[] | string | null) => {
    if (!genders) return t('playerProfile.all')
    const genderArray = Array.isArray(genders) ? genders : [genders]
    if (genderArray.length === 0) return t('playerProfile.all')
    if (genderArray.length === 2 || (genderArray.includes('MALE') && genderArray.includes('FEMALE'))) {
      return `♂ ${t('playerProfile.men')} / ♀ ${t('playerProfile.women')}`
    }
    if (genderArray.includes('MALE')) return `♂ ${t('playerProfile.men')}`
    if (genderArray.includes('FEMALE')) return `♀ ${t('playerProfile.women')}`
    return t('playerProfile.all')
  }

  // Translate coach role from database enum to display text
  const getCoachRoleText = (role: string | null) => {
    if (!role) return ''
    const roleKey = role.toLowerCase() as 'head_coach' | 'assistant_coach' | 'technical_coach' | 'physical_coach' | 'scout' | 'trainer'
    const translation = t(`coachRole.${roleKey}`)
    // If translation key is returned (not found), show the original role formatted nicely
    if (translation === `coachRole.${roleKey}` || !translation) {
      return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
    return translation
  }

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault()
    // For hybrid users, go to hybrid profile with recruiter view param
    const targetUrl = recruiter.user?.role === 'HYBRID' ? `/hybrids/${recruiter.userId}?view=recruiter` : `/recruiters/${recruiter.id}`
    router.push(targetUrl)
  }

  const handleStartChat = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation to recruiter profile
    e.stopPropagation()

    if (!session?.user) {
      toast.error(t('errors.loginRequired'))
      return
    }

    try {
      console.log('Starting chat with recruiter:', recruiter.user.id)
      const response = await axios.post('/api/chat/conversations', {
        participantId: recruiter.user.id,
        participantType: 'RECRUITER'
      })
      console.log('Chat conversation created:', response.data)

      setConversationId(response.data.conversationId)
      setShowChat(true)
    } catch (error: any) {
      console.error('Error starting chat:', error)
      console.error('Error response:', error.response?.data)
      const errorMsg = error.response?.data?.error || error.message || t('errors.unknownError') || 'Unknown error'
      toast.error(`${t('errors.chatStartError')}: ${errorMsg}`)
    }
  }

  // Get solid color based on role
  const getSolidColor = () => {
    if (recruiter.user?.role === 'HYBRID') {
      return '#f97316'; // Orange for HYBRID
    }
    return '#9333ea'; // Purple for RECRUITER
  }

  // Get the actual gender of the user (for hybrids, check player profile as fallback)
  const userGender = recruiter.gender || recruiter.user?.player?.gender
  
  return (
    <>
      <div onClick={handleCardClick} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition overflow-hidden cursor-pointer relative h-full flex flex-col">
        {/* Header with solid background */}
        <div 
          className="h-40 relative flex items-center justify-center flex-shrink-0"
          style={{ 
            background: getSolidColor()
          }}
        >
          {/* Gender Badge - only show if gender is specified */}
          {userGender && (
            <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full flex items-center gap-2 text-sm font-semibold z-10">
              {userGender === 'MALE' ? (
                <span className="text-blue-600">♂ {t('playerProfile.men')}</span>
              ) : userGender === 'FEMALE' ? (
                <span className="text-pink-600">♀ {t('playerProfile.women')}</span>
              ) : null}
            </div>
          )}
          
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
              <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold bg-blue-700">
                {recruiter.firstName[0]}{recruiter.lastName[0]}
              </div>
            )}
          </div>
        </div>

        {/* Recruiter Info */}
        <div className="px-6 py-6 bg-gray-50 dark:bg-gray-900 text-center flex-grow flex flex-col">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {recruiter.firstName} {recruiter.lastName}
          </h3>

          {/* Role & Club */}
          <div className="mb-4">
            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1 min-h-[20px]">
              <Briefcase className="w-4 h-4 flex-shrink-0" />
              <span className="line-clamp-2">{getCoachRoleText(recruiter.coachRole)}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 min-h-[20px]">
              {recruiter.club?.logo ? (
                <Image
                  src={recruiter.club.logo}
                  alt={recruiter.club.name}
                  width={16}
                  height={16}
                  className="w-4 h-4 rounded object-contain bg-white"
                  unoptimized
                />
              ) : (
                <Users className="w-4 h-4" />
              )}
              <span>{recruiter.club?.name || recruiter.organization}</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {recruiter.age || '-'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{t('playerProfile.yearsOld')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {recruiter.lookingForMembers ? '✓' : '-'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{t('recruiters.recruiting')}</div>
            </div>
          </div>

          {/* Preferred Language - always show container for consistent height */}
          <div className="mb-4 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg min-h-[36px]">
            {recruiter.preferredLanguage ? (
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                {recruiter.preferredLanguage === 'gsw' ? t('register.languageSwissGerman') :
                 recruiter.preferredLanguage === 'de' ? t('register.languageGerman') :
                 recruiter.preferredLanguage === 'fr' ? t('register.languageFrench') :
                 recruiter.preferredLanguage === 'it' ? t('register.languageItalian') :
                 recruiter.preferredLanguage === 'rm' ? t('register.languageRomansh') :
                 recruiter.preferredLanguage === 'en' ? t('register.languageEnglish') :
                 recruiter.preferredLanguage.toUpperCase()}
              </span>
            ) : (
              <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4" />
            <span>{recruiter.province ? `${recruiter.province}, ` : ''}{cantonInfo.name}</span>
          </div>

          {/* Spacer to push content up and maintain consistent height */}
          <div className="flex-grow" />

          {/* Chat Button - Only visible to RECRUITER and HYBRID users, and not on own profile */}
          {session && session.user && (session.user.role === 'RECRUITER' || session.user.role === 'HYBRID') && recruiter.user?.id && session.user.id !== recruiter.user.id && (
            <button
              onClick={handleStartChat}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              <MessageCircle className="w-4 h-4" />
              {t('chat.sendMessage')}
            </button>
          )}
        </div>
      </div>

      {/* Chat Window */}
      {showChat && conversationId && (
        <div className="fixed bottom-4 right-4 z-50">
          <ChatWindow
            conversationId={conversationId}
            otherParticipant={{
              id: recruiter.user.id,
              name: `${recruiter.firstName} ${recruiter.lastName}`,
              type: 'RECRUITER',
              club: recruiter.club?.name || recruiter.organization,
              position: recruiter.coachRole,
              profileImage: recruiter.profileImage || ''
            }}
            currentUserId={session!.user!.id}
            currentUserType={session!.user!.role as 'PLAYER' | 'RECRUITER' | 'HYBRID'}
            onClose={() => setShowChat(false)}
          />
        </div>
      )}
    </>
  )
}
