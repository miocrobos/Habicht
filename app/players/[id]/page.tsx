'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, MapPin, Ruler, Weight, Award, TrendingUp, Video as VideoIcon, Instagram, Youtube, Music2, ExternalLink, Eye } from 'lucide-react'
import VideoPlayer from '@/components/player/VideoPlayer'
import StatsDisplay from '@/components/player/StatsDisplay'
import ClubHistory from '@/components/player/ClubHistory'
import TeammatesList from '@/components/player/TeammatesList'
import CoachesList from '@/components/player/CoachesList'
import CantonFlag from '@/components/shared/CantonFlag'
import ClubBadge from '@/components/shared/ClubBadge'
import SchoolBadge from '@/components/shared/SchoolBadge'
import { getCantonInfo } from '@/lib/swissData'
import axios from 'axios'

// This would come from API/database
interface PlayerProfileProps {
  params: {
    id: string
  }
}

export default function PlayerProfile({ params }: PlayerProfileProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [views, setViews] = useState(0)

  // Increment view count when profile loads
  useEffect(() => {
    const incrementView = async () => {
      try {
        const response = await axios.post(`/api/players/${params.id}/view`)
        setViews(response.data.views)
      } catch (error) {
        console.error('Error incrementing views:', error)
      }
    }
    
    incrementView()
  }, [params.id])

  // Get canton info for dynamic theming
  const cantonInfo = getCantonInfo('ZH') // This would come from player data

  // Mock data - replace with actual API call
  const player = {
    id: params.id,
    firstName: 'Marco',
    lastName: 'Müller',
    dateOfBirth: '2005-03-15',
    gender: 'MALE',
    height: 192,
    weight: 85,
    position: 'OUTSIDE_HITTER',
    jerseyNumber: 7,
    canton: 'ZH',
    city: 'Zürich',
    schoolName: 'Kantonsschule Zürich Nord',
    schoolType: 'GYMNASIUM',
    graduationYear: 2024,
    currentClub: {
      name: 'Volley Amriswil',
      logo: '/clubs/amriswil.png',
      websiteUrl: 'https://www.volley-amriswil.ch'
    },
    currentLeague: 'NLA',
    bio: 'Motivierte Aussenspieler mit starkem Angriff und guter Defensiv. Suche nach Möglichkeiten auf Universitätsniveau.',
    profileImage: '/players/default.jpg',
    coverImage: '/covers/default.jpg',
    instagramHandle: 'marco.mueller.volley',
    tiktokHandle: '@marcovolley',
    youtubeChannel: 'MarcoVolleyball',
    videos: [
      {
        id: '1',
        title: 'Highlights NLA Match vs Lausanne UC',
        videoType: 'UPLOADED',
        videoUrl: 'https://res.cloudinary.com/...',
        thumbnailUrl: '/thumbnails/1.jpg',
        highlightType: 'HIGHLIGHTS',
        views: 234
      },
      {
        id: '2',
        title: 'Serving Compilation 2023/24',
        videoType: 'YOUTUBE',
        videoUrl: 'https://youtube.com/watch?v=...',
        thumbnailUrl: '/thumbnails/2.jpg',
        highlightType: 'SERVING',
        views: 456
      }
    ],
    stats: {
      season: '2023-2024',
      matchesPlayed: 18,
      points: 234,
      kills: 198,
      attackPercentage: 42.5,
      aces: 36,
      blocks: 28
    },
    clubHistory: [
      {
        club: { name: 'Volley Amriswil', logo: '/clubs/amriswil.png' },
        startDate: '2022-08-01',
        endDate: null,
        league: 'NLA',
        jerseyNumber: 7
      },
      {
        club: { name: 'TSV Jona', logo: '/clubs/jona.png' },
        startDate: '2019-08-01',
        endDate: '2022-06-30',
        league: 'YOUTH_U17',
        jerseyNumber: 12
      }
    ],
    achievements: [
      {
        title: 'U17 Swiss Championship',
        type: 'CHAMPIONSHIP',
        date: '2021-05-15'
      },
      {
        title: 'Youth National Team Selection',
        type: 'YOUTH_NATIONAL_TEAM',
        date: '2022-06-01'
      }
    ],
    teammates: [
      {
        id: '2',
        firstName: 'Luca',
        lastName: 'Weber',
        position: 'SETTER',
        jerseyNumber: 5,
        season: '2023-2024',
        clubName: 'Volley Amriswil'
      },
      {
        id: '3',
        firstName: 'Thomas',
        lastName: 'Meier',
        position: 'MIDDLE_BLOCKER',
        jerseyNumber: 11,
        season: '2023-2024',
        clubName: 'Volley Amriswil'
      },
      {
        id: '4',
        firstName: 'Jan',
        lastName: 'Schneider',
        position: 'LIBERO',
        jerseyNumber: 1,
        season: '2023-2024',
        clubName: 'Volley Amriswil'
      }
    ],
    coaches: [
      {
        id: '1',
        firstName: 'Stefan',
        lastName: 'Hübscher',
        role: 'Headcoach',
        specialization: 'Angriff & Taktik',
        yearsExperience: 15,
        email: 'coach@volley-amriswil.ch',
        clubName: 'Volley Amriswil'
      },
      {
        id: '2',
        firstName: 'Peter',
        lastName: 'Keller',
        role: 'Assistenztrainer',
        specialization: 'Defense & Kondition',
        yearsExperience: 8,
        clubName: 'Volley Amriswil'
      }
    ]
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Cover Image with Canton Colors */}
      <div 
        className="h-48 relative"
        style={{ 
          background: `linear-gradient(135deg, ${cantonInfo.colors.primary} 0%, ${cantonInfo.colors.secondary} 100%)` 
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <CantonFlag canton={player.canton} size="lg" showName />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-12">
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div 
                className="w-32 h-32 rounded-full border-4 shadow-lg overflow-hidden"
                style={{ borderColor: cantonInfo.colors.primary }}
              >
                <div 
                  className="w-full h-full flex items-center justify-center text-white text-4xl font-bold"
                  style={{ backgroundColor: cantonInfo.colors.primary }}
                >
                  {player.firstName[0]}{player.lastName[0]}
                </div>
              </div>
            </div>

            {/* Player Info */}
            <div className="flex-grow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex flex-wrap items-center gap-2 md:gap-3">
                    {player.firstName} {player.lastName}
                    {player.isPlaceholder && (
                      <span className="px-2 md:px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs md:text-sm font-medium rounded-full border border-orange-300 dark:border-orange-700">
                        ⚠️ Platzhalter
                      </span>
                    )}
                  </h1>
                  <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mt-1">
                    {player.position.replace('_', ' ')} • #{player.jerseyNumber}
                  </p>
                  {player.isPlaceholder && (
                    <div className="mt-2 px-3 py-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg text-sm text-orange-800 dark:text-orange-300">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {views || 0} Profilaufrufe
                    </span>
                      <strong>📌 Hinweis:</strong> Dieses Profil wurde automatisch von Volleybox importiert. 
                      <button className="ml-2 underline font-medium hover:text-orange-900 dark:hover:text-orange-200">
                        Profil beanspruchen →
                      </button>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-3 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {player.city}, {player.canton}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date().getFullYear() - new Date(player.dateOfBirth).getFullYear()} Jahre
                    </span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-4 md:mt-0 flex flex-wrap gap-2 md:gap-4 text-center">
                  <div className="bg-gray-50 dark:bg-gray-700 px-3 md:px-4 py-2 rounded-lg">
                    <div className="text-xl md:text-2xl font-bold text-habicht-600 dark:text-habicht-400">{player.height}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Grösse cm</div>
                  </div>
                  {player.blockReach && (
                    <div className="bg-gray-50 dark:bg-gray-700 px-3 md:px-4 py-2 rounded-lg">
                      <div className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">{player.blockReach}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Block cm</div>
                    </div>
                  )}
                  {player.spikeReach && (
                    <div className="bg-gray-50 dark:bg-gray-700 px-3 md:px-4 py-2 rounded-lg">
                      <div className="text-xl md:text-2xl font-bold text-red-600 dark:text-red-400">{player.spikeReach}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Angriff cm</div>
                    </div>
                  )}
                  <div className="bg-gray-50 dark:bg-gray-700 px-3 md:px-4 py-2 rounded-lg">
                    <div className="text-xl md:text-2xl font-bold text-habicht-600 dark:text-habicht-400">{player.currentLeague}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Liga</div>
                  </div>
                </div>
              </div>

              {/* School Badge */}
              {player.schoolName && (
                <div className="mt-4">
                  <SchoolBadge 
                    schoolName={player.schoolName}
                    schoolType={player.schoolType}
                    graduationYear={player.graduationYear}
                    size="lg"
                  />
                </div>
              )}

              {/* Current Club */}
              <div className="mt-4 p-3 md:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <ClubBadge clubName={player.currentClub.name} size="md" />
                  <div>
                    <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Aktueller Club</div>
                    <div className="font-semibold dark:text-white">{player.currentClub.name}</div>
                    <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{player.currentLeague}</div>
                  </div>
                </div>
                <a 
                  href={player.currentClub.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-habicht-600 hover:text-habicht-700"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>

              {/* Social Media Links */}
              <div className="mt-4 flex gap-4">
                {player.instagramHandle && (
                  <a
                    href={`https://instagram.com/${player.instagramHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition"
                  >
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </a>
                )}
                {player.tiktokHandle && (
                  <a
                    href={`https://tiktok.com/${player.tiktokHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:opacity-90 transition"
                  >
                    <Music2 className="w-4 h-4" />
                    TikTok
                  </a>
                )}
                {player.youtubeChannel && (
                  <a
                    href={`https://youtube.com/@${player.youtubeChannel}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:opacity-90 transition"
                  >
                    <Youtube className="w-4 h-4" />
                    YouTube
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex flex-wrap">
              <TabButton 
                active={activeTab === 'overview'} 
                onClick={() => setActiveTab('overview')}
              >
                Übersicht
              </TabButton>
              <TabButton 
                active={activeTab === 'videos'} 
                onClick={() => setActiveTab('videos')}
              >
                Videos
              </TabButton>
              <TabButton 
                active={activeTab === 'stats'} 
                onClick={() => setActiveTab('stats')}
              >
                Statistiken
              </TabButton>
              <TabButton 
                active={activeTab === 'history'} 
                onClick={() => setActiveTab('history')}
              >
                Karriere
              </TabButton>
              <TabButton 
                active={activeTab === 'teammates'} 
                onClick={() => setActiveTab('teammates')}
              >
                Teammates
              </TabButton>
              <TabButton 
                active={activeTab === 'coaches'} 
                onClick={() => setActiveTab('coaches')}
              >
                Coaches
              </TabButton>
            </nav>
          </div>

          <div className="p-4 md:p-6">
            {activeTab === 'overview' && (
              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <h3 className="text-base md:text-lg font-semibold mb-3 dark:text-white">Über mich</h3>
                  <p className="text-sm md:text-base text-gray-700 dark:text-gray-300">{player.bio}</p>

                  <h3 className="text-lg font-semibold mt-6 mb-3">Physische Daten</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Grösse:</span>
                      <span className="font-semibold">{player.height} cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gewicht:</span>
                      <span className="font-semibold">{player.weight} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Position:</span>
                      <span className="font-semibold">{player.position.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mt-6 mb-3">Ausbildung</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Schule:</span>
                      <span className="font-semibold">{player.schoolName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Typ:</span>
                      <span className="font-semibold">{player.schoolType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Abschluss:</span>
                      <span className="font-semibold">{player.graduationYear}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    Erfolge & Auszeichnungen
                  </h3>
                  {player.achievements && player.achievements.length > 0 ? (
                    <div className="space-y-2">
                      {player.achievements.map((achievement, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg">
                          <Award className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            {typeof achievement === 'string' ? (
                              <div className="font-medium text-gray-900">{achievement}</div>
                            ) : (
                              <>
                                <div className="font-semibold text-gray-900">{achievement.title}</div>
                                <div className="text-sm text-gray-600">
                                  {new Date(achievement.date).toLocaleDateString('de-CH')}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 italic p-4 bg-gray-50 rounded-lg">
                      Keine Erfolge eingetragen
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'videos' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Video Highlights</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {player.videos.map((video) => (
                    <div key={video.id} className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition">
                      <div className="aspect-video bg-gray-300 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <VideoIcon className="w-12 h-12 text-white" />
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold mb-1">{video.title}</h4>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{video.highlightType}</span>
                          <span>{video.views} views</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Season Statistics</h3>
                <StatsDisplay stats={player.stats} />
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <h3 className="text-base md:text-lg font-semibold mb-4 dark:text-white">Club History</h3>
                <ClubHistory history={player.clubHistory} />
              </div>
            )}

            {activeTab === 'teammates' && (
              <div>
                <h3 className="text-base md:text-lg font-semibold mb-4 dark:text-white">Teammates</h3>
                <TeammatesList teammates={player.teammates} />
              </div>
            )}

            {activeTab === 'coaches' && (
              <div>
                <h3 className="text-base md:text-lg font-semibold mb-4 dark:text-white">Coaches</h3>
                <CoachesList coaches={player.coaches} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function TabButton({ 
  active, 
  onClick, 
  children 
}: { 
  active: boolean
  onClick: () => void
  children: React.ReactNode 
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-medium transition ${
        active
          ? 'text-habicht-600 dark:text-habicht-400 border-b-2 border-habicht-600 dark:border-habicht-400'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
      }`}
    >
      {children}
    </button>
  )
}
