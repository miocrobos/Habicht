'use client'

import { useEffect, useState } from 'react'
import { X, Mail, Phone, Instagram, MapPin, Calendar, TrendingUp, Award, Ruler, Hash, GraduationCap, Target } from 'lucide-react'
import SchoolBadge from '@/components/shared/SchoolBadge'
import { getClubById } from '@/lib/clubsDatabase_comprehensive'
import { useLanguage } from '@/contexts/LanguageContext'

interface ProfileModalProps {
  playerId?: string
  recruiterId?: string
  isOpen: boolean
  onClose: () => void
}

interface PlayerProfile {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'MALE' | 'FEMALE'
  position: string
  height?: number
  weight?: number
  jerseyNumber?: number
  canton: string
  city: string
  currentLeague: string
  desiredLeague?: string
  interestedClubs?: string[]
  schoolName?: string
  schoolType?: string
  graduationYear?: number
  phone?: string
  instagramHandle?: string
  bio?: string
  profileImage: string
  coverImage?: string
  dominantHand?: string
  preferredLanguage?: string
  achievements?: any[]
  stats?: any[]
  videos?: any[]
}

interface RecruiterProfile {
  id: string
  organization: string
  position: string
  coachRole: string
  club?: {
    name: string
    logo?: string
  }
  phone?: string
  bio?: string
  profileImage: string
  coverImage?: string
  canton?: string
  preferredLanguage?: string
  user: {
    name: string
    email: string
  }
}

export default function ProfileModal({ playerId, recruiterId, isOpen, onClose }: ProfileModalProps) {
  const [profile, setProfile] = useState<PlayerProfile | RecruiterProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'info' | 'stats' | 'videos'>('info')
  const { t } = useLanguage()

  useEffect(() => {
    if (isOpen && (playerId || recruiterId)) {
      fetchProfile()
    }
  }, [isOpen, playerId, recruiterId])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const url = playerId 
        ? `/api/players/${playerId}` 
        : `/api/recruiters/${recruiterId}`
      
      const response = await fetch(url)
      const data = await response.json()
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const isPlayer = (profile: any): profile is PlayerProfile => {
    return profile && 'firstName' in profile
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const getPositionDisplay = (position: string) => {
    const positionMap: { [key: string]: string } = {
      OUTSIDE_HITTER: 'playerProfile.positionOutsideHitter',
      OPPOSITE: 'playerProfile.positionOpposite',
      MIDDLE_BLOCKER: 'playerProfile.positionMiddleBlocker',
      SETTER: 'playerProfile.positionSetter',
      LIBERO: 'playerProfile.positionLibero',
      UNIVERSAL: 'playerProfile.positionUniversal'
    }
    return t(positionMap[position] || position)
  }

  const getLeagueDisplay = (league: string) => {
    const leagueMap: { [key: string]: string } = {
      'NLA': 'home.leagues.nla',
      'NLB': 'home.leagues.nlb',
      'FIRST_LEAGUE': 'home.leagues.firstLeague',
      'SECOND_LEAGUE': 'home.leagues.secondLeague',
      'THIRD_LEAGUE': 'home.leagues.thirdLeague',
      'FOURTH_LEAGUE': 'home.leagues.fourthLeague',
      'FIFTH_LEAGUE': 'home.leagues.fifthLeague',
      'U23': 'U23',
      'U19': 'home.leagues.u19',
      'U17': 'home.leagues.u17'
    }
    const key = leagueMap[league]
    return key === 'U23' ? 'U23' : t(key || league)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>

          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : profile ? (
            <>
              {/* Cover Image / Backdrop */}
              <div className="relative h-64 bg-gradient-to-br from-red-500 via-red-600 to-red-700">
                {profile.coverImage ? (
                  <img
                    src={profile.coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-red-600 to-red-700" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>

              {/* Profile Picture & Basic Info */}
              <div className="relative px-8 pb-6">
                {/* Profile Picture */}
                <div className="absolute -top-24 left-8">
                  <div className="relative">
                    <img
                      src={profile.profileImage}
                      alt={isPlayer(profile) ? `${profile.firstName} ${profile.lastName}` : profile.user.name}
                      className="w-48 h-48 rounded-2xl border-8 border-white shadow-2xl object-cover"
                    />
                    {isPlayer(profile) && (
                      <div className="absolute bottom-2 right-2 bg-white px-4 py-2 rounded-xl shadow-lg">
                        <span className="text-2xl font-bold text-red-600">
                          {profile.jerseyNumber || '—'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Name & Title */}
                <div className="pt-28">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-4xl font-bold text-gray-900 mb-2">
                        {isPlayer(profile) 
                          ? `${profile.firstName} ${profile.lastName}`
                          : profile.user.name
                        }
                      </h2>
                      {isPlayer(profile) ? (
                        <div className="flex items-center gap-4 text-lg text-gray-600 mb-4">
                          <span className="font-semibold text-red-600">
                            {getPositionDisplay(profile.position)}
                          </span>
                          <span>•</span>
                          <span>{getLeagueDisplay(profile.currentLeague)}</span>
                          <span>•</span>
                          <span>{calculateAge(profile.dateOfBirth)} Jahre</span>
                          {profile.height && (
                            <>
                              <span>•</span>
                              <span>{profile.height} cm</span>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 text-lg text-gray-600 mb-4">
                          <span className="font-semibold text-red-600">{profile.coachRole}</span>
                          {profile.club && (
                            <>
                              <span>•</span>
                              <span>{profile.club.name}</span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Location */}
                      <div className="flex items-center gap-2 text-gray-600 mb-4">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {isPlayer(profile) 
                            ? `${profile.city}, ${profile.canton}`
                            : profile.canton || 'Schweiz'
                          }
                        </span>
                      </div>

                      {/* School Badge for Players */}
                      {isPlayer(profile) && profile.schoolName && profile.schoolType && (
                        <SchoolBadge 
                          schoolName={profile.schoolName}
                          schoolType={profile.schoolType}
                          graduationYear={profile.graduationYear}
                        />
                      )}
                    </div>
                  </div>

                  {/* Tabs */}
                  {isPlayer(profile) && (
                    <div className="flex gap-2 mb-6 mt-6 border-b border-gray-200">
                      {['info', 'stats', 'videos'].map(tab => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab as any)}
                          className={`px-6 py-3 font-semibold transition-colors ${
                            activeTab === tab
                              ? 'text-red-600 border-b-2 border-red-600'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {tab === 'info' && 'Informationen'}
                          {tab === 'stats' && 'Statistiken'}
                          {tab === 'videos' && 'Videos'}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Content */}
                  <div className="space-y-6">
                    {activeTab === 'info' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Bio */}
                        {profile.bio && (
                          <div className="md:col-span-2 bg-gray-50 rounded-xl p-6">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <Award className="w-5 h-5 text-red-600" />
                              Über mich
                            </h3>
                            <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
                          </div>
                        )}

                        {/* Contact Info */}
                        <div className="bg-gray-50 rounded-xl p-6">
                          <h3 className="font-semibold text-gray-900 mb-4">Kontakt</h3>
                          <div className="space-y-3">
                            {profile.phone && (
                              <div className="flex items-center gap-3 text-gray-700">
                                <Phone className="w-5 h-5 text-gray-400" />
                                <span>{profile.phone}</span>
                              </div>
                            )}
                            {isPlayer(profile) && profile.instagramHandle && (
                              <div className="flex items-center gap-3 text-gray-700">
                                <Instagram className="w-5 h-5 text-gray-400" />
                                <span>{profile.instagramHandle}</span>
                              </div>
                            )}
                            {isPlayer(profile) && profile.dominantHand && (
                              <div className="flex items-col gap-3 text-gray-700">
                                <div className="text-sm font-semibold text-green-600">
                                  {profile.dominantHand === 'RIGHT' ? t('register.rightHanded') : 
                                   profile.dominantHand === 'LEFT' ? t('register.leftHanded') : 
                                   t('register.ambidextrous')}
                                </div>
                                <div className="text-xs text-gray-500">{t('playerProfile.dominantHandLabel')}</div>
                              </div>
                            )}
                            {profile.preferredLanguage && (
                              <div className="flex items-col gap-3 text-gray-700">
                                <div className="text-sm font-semibold text-blue-600">
                                  {profile.preferredLanguage === 'gsw' ? t('register.languageSwissGerman') :
                                   profile.preferredLanguage === 'de' ? t('register.languageGerman') :
                                   profile.preferredLanguage === 'fr' ? t('register.languageFrench') :
                                   profile.preferredLanguage === 'it' ? t('register.languageItalian') :
                                   profile.preferredLanguage === 'rm' ? t('register.languageRomansh') :
                                   profile.preferredLanguage === 'en' ? t('register.languageEnglish') :
                                   profile.preferredLanguage.toUpperCase()}
                                </div>
                                <div className="text-xs text-gray-500">{t('playerProfile.preferredLanguageLabel')}</div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Career Goals (Players) */}
                        {isPlayer(profile) && profile.desiredLeague && (
                          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-200">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <Target className="w-5 h-5 text-red-600" />
                              Karriereziele
                            </h3>
                            <div className="space-y-3">
                              <div>
                                <span className="text-sm text-gray-600">Ziel-Liga:</span>
                                <p className="text-lg font-semibold text-red-600">{profile.desiredLeague}</p>
                              </div>
                              {profile.interestedClubs && profile.interestedClubs.length > 0 && (
                                <div>
                                  <span className="text-sm text-gray-600">Interessierte Clubs:</span>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {profile.interestedClubs.slice(0, 5).map((clubId) => {
                                      const club = getClubById(clubId)
                                      return club ? (
                                        <span key={clubId} className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700 border border-gray-200">
                                          {club.logo} {club.shortName || club.name}
                                        </span>
                                      ) : null
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'stats' && isPlayer(profile) && (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Statistiken</h3>
                        {profile.stats && profile.stats.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Stats display here */}
                            <p className="col-span-full text-gray-600">Statistiken werden geladen...</p>
                          </div>
                        ) : (
                          <p className="text-gray-600">Noch keine Statistiken verfügbar</p>
                        )}
                      </div>
                    )}

                    {activeTab === 'videos' && isPlayer(profile) && (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Videos</h3>
                        {profile.videos && profile.videos.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Videos display here */}
                          </div>
                        ) : (
                          <p className="text-gray-600">Noch keine Videos hochgeladen</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-gray-600">
              Profil nicht gefunden
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
