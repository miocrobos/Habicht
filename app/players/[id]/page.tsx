'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, MapPin, Ruler, Weight, Award, TrendingUp, Video as VideoIcon, Instagram, Youtube, Music2, ExternalLink, Eye, Edit2, Upload, GraduationCap, Briefcase, Phone, Mail } from 'lucide-react'
import { useSession } from 'next-auth/react'
import ClubHistory from '@/components/player/ClubHistory'
import axios from 'axios'

interface PlayerProfileProps {
  params: {
    id: string
  }
}

interface PlayerData {
  id: string
  firstName: string
  lastName: string
  email: string
  dateOfBirth: string | null
  gender: string
  height: number | null
  weight: number | null
  positions: string[]
  nationality: string
  canton: string
  employmentStatus: string | null
  occupation: string | null
  schoolName: string | null
  profileImage: string | null
  bio: string | null
  phone: string | null
  instagram: string | null
  tiktok: string | null
  youtube: string | null
  spikeHeight: number | null
  blockHeight: number | null
  swissVolleyLicense: string | null
  skillReceiving: number
  skillServing: number
  skillAttacking: number
  skillBlocking: number
  skillDefense: number
  achievements: string[]
  clubHistory: any[]
  videos: any[]
  views: number
  lookingForClub: boolean
  showEmail: boolean
  showPhone: boolean
  createdAt: string
}

const POSITION_TRANSLATIONS: { [key: string]: string } = {
  'OUTSIDE_HITTER': 'Ausseagriffler',
  'OPPOSITE': 'Diagonal',
  'MIDDLE_BLOCKER': 'Mittelblocker',
  'SETTER': 'Zuespieler',
  'LIBERO': 'Libero',
  'UNIVERSAL': 'Universalspieler'
}

const BACKGROUND_OPTIONS = [
  { id: 'gradient1', name: 'Rot Gradient', style: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' },
  { id: 'gradient2', name: 'Blau Gradient', style: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)' },
  { id: 'gradient3', name: 'Grün Gradient', style: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' },
  { id: 'gradient4', name: 'Lila Gradient', style: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)' },
  { id: 'solid-red', name: 'Rot', style: '#dc2626' },
  { id: 'solid-blue', name: 'Blau', style: '#2563eb' },
  { id: 'solid-dark', name: 'Dunkel', style: '#1f2937' },
]

export default function PlayerProfile({ params }: PlayerProfileProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [player, setPlayer] = useState<PlayerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showBgSelector, setShowBgSelector] = useState(false)
  const [selectedBg, setSelectedBg] = useState(BACKGROUND_OPTIONS[0])
  const [customBgImage, setCustomBgImage] = useState<string | null>(null)
  const { data: session } = useSession()

  const isOwner = session?.user?.playerId === params.id

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        setLoading(true)
        const playerResponse = await axios.get(`/api/players/${params.id}`)
        const playerData = playerResponse.data.player
        
        if (playerData) {
          setPlayer(playerData)
        }

        await axios.post(`/api/players/${params.id}/view`)
      } catch (error) {
        console.error('Error fetching player:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchPlayer()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Lade Profil...</p>
        </div>
      </div>
    )
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Spieler Nid Gfunde</h1>
          <Link href="/players" className="mt-4 inline-block text-red-600 hover:text-red-700">
            Zrugg Zur Übersicht
          </Link>
        </div>
      </div>
    )
  }

  const playerAge = player.dateOfBirth ? new Date().getFullYear() - new Date(player.dateOfBirth).getFullYear() : null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Custom Background Header */}
      <div 
        className="h-64 relative"
        style={{ 
          background: customBgImage ? 'transparent' : selectedBg.style,
          backgroundImage: customBgImage ? `url(${customBgImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Background change button (owner only) */}
        {isOwner && (
          <button
            onClick={() => setShowBgSelector(!showBgSelector)}
            className="absolute top-4 right-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition flex items-center gap-2 z-10"
          >
            <Upload className="w-4 h-4" />
            Hintergrund Ändere
          </button>
        )}

        {/* Background selector dropdown */}
        {showBgSelector && isOwner && (
          <div className="absolute top-16 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 z-50 min-w-[250px]">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Wähl Es Hintergrund:</p>
            
            {/* Custom Image Upload */}
            <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <label className="block mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Eigeni Bild Ufelade:</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        setCustomBgImage(reader.result as string)
                        setShowBgSelector(false)
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  className="mt-2 block w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-red-50 file:text-red-700
                    hover:file:bg-red-100
                    dark:file:bg-red-900/30 dark:file:text-red-300
                    dark:hover:file:bg-red-900/50
                    cursor-pointer"
                />
              </label>
            </div>

            <div className="space-y-2">
              {BACKGROUND_OPTIONS.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => {
                    setSelectedBg(bg)
                    setCustomBgImage(null)
                    setShowBgSelector(false)
                  }}
                  className="w-full flex items-center gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <div 
                    className="w-8 h-8 rounded"
                    style={{ background: bg.style }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{bg.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* View counter */}
        <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2 text-sm z-10">
          <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="font-semibold text-gray-900 dark:text-white">{player.views || 0}</span>
          <span className="text-gray-600 dark:text-gray-400">Profilufrufe</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 pb-12 relative z-10">
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 mb-6 relative z-10">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="w-40 h-40 rounded-full border-4 border-white dark:border-gray-700 shadow-xl overflow-hidden bg-gray-200 dark:bg-gray-700">
                {player.profileImage ? (
                  <Image
                    src={player.profileImage}
                    alt={`${player.firstName} ${player.lastName}`}
                    width={160}
                    height={160}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-5xl font-bold bg-gradient-to-br from-red-600 to-red-800">
                    {player.firstName[0]}{player.lastName[0]}
                  </div>
                )}
              </div>
            </div>

            {/* Player Info */}
            <div className="flex-grow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-grow">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {player.firstName} {player.lastName}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {player.positions.map((pos, idx) => (
                      <span key={idx} className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-semibold rounded-full">
                        {POSITION_TRANSLATIONS[pos] || pos}
                      </span>
                    ))}
                    {player.lookingForClub && (
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-semibold rounded-full flex items-center gap-1">
                        ✓ Suecht Club
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {player.canton}
                    </span>
                    {playerAge && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {playerAge} Jahr
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      {player.gender === 'MALE' ? '♂' : '♀'} {player.gender === 'MALE' ? 'Männlich' : 'Wiiblich'}
                    </span>
                    {player.nationality && (
                      <span>🏳 Nationalität: {player.nationality}</span>
                    )}
                  </div>

                  {/* Contact Info */}
                  {(isOwner || player.showEmail || player.showPhone) && (
                    <div className="flex flex-wrap gap-3 mb-4">
                      {(isOwner || player.showPhone) && player.phone && (
                        <a href={`tel:${player.phone}`} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                          <Phone className="w-4 h-4" />
                          {player.phone}
                        </a>
                      )}
                      {(isOwner || player.showEmail) && player.email && (
                        <a href={`mailto:${player.email}`} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                          <Mail className="w-4 h-4" />
                          {player.email}
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-3">
                  {player.height && (
                    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 rounded-lg text-center min-w-[90px]">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">{player.height}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Grössi cm</div>
                    </div>
                  )}
                  {player.weight && (
                    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 rounded-lg text-center min-w-[90px]">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{player.weight}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Gwicht kg</div>
                    </div>
                  )}
                  {player.spikeHeight && (
                    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 rounded-lg text-center min-w-[90px]">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{player.spikeHeight}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Schlag cm</div>
                    </div>
                  )}
                  {player.blockHeight && (
                    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 rounded-lg text-center min-w-[90px]">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{player.blockHeight}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Block cm</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              {player.bio && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300">{player.bio}</p>
                </div>
              )}

              {/* Education/Employment Info */}
              <div className="mt-4 flex flex-wrap gap-3">
                {player.schoolName && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg">
                    <GraduationCap className="w-5 h-5" />
                    <span className="font-medium">{player.schoolName}</span>
                  </div>
                )}
                {player.occupation && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg">
                    <Briefcase className="w-5 h-5" />
                    <span className="font-medium">{player.occupation}</span>
                  </div>
                )}
                {player.swissVolleyLicense && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-lg">
                    <Award className="w-5 h-5" />
                    <span className="font-medium">Swiss Volley: {player.swissVolleyLicense}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                {isOwner && (
                  <Link
                    href={`/players/${params.id}/edit`}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                  >
                    <Edit2 className="w-4 h-4" />
                    Profil Bearbeite
                  </Link>
                )}
                
                {player.instagram && (
                  <a
                    href={`https://instagram.com/${player.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition font-semibold"
                  >
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </a>
                )}
                {player.tiktok && (
                  <a
                    href={`https://tiktok.com/${player.tiktok.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:opacity-90 transition font-semibold"
                  >
                    <Music2 className="w-4 h-4" />
                    TikTok
                  </a>
                )}
                {player.youtube && (
                  <a
                    href={`https://youtube.com/@${player.youtube.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                  >
                    <Youtube className="w-4 h-4" />
                    YouTube
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex flex-wrap -mb-px">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'overview'
                    ? 'border-red-600 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Übersicht
              </button>
              <button
                onClick={() => setActiveTab('karriere')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'karriere'
                    ? 'border-red-600 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Karriere
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'videos'
                    ? 'border-red-600 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Videos
              </button>
              <button
                onClick={() => setActiveTab('erfolge')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'erfolge'
                    ? 'border-red-600 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Erfolge & Uszeichnunge
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Skills Section */}
                {(player.skillReceiving > 0 || player.skillServing > 0 || player.skillAttacking > 0 || player.skillBlocking > 0 || player.skillDefense > 0) && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Fähigkeite
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {player.skillReceiving > 0 && (
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Annahme</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{player.skillReceiving}/5</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${(player.skillReceiving / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {player.skillServing > 0 && (
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ufschlag</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{player.skillServing}/5</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                              style={{ width: `${(player.skillServing / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {player.skillAttacking > 0 && (
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Agriff</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{player.skillAttacking}/5</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all"
                              style={{ width: `${(player.skillAttacking / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {player.skillBlocking > 0 && (
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Block</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{player.skillBlocking}/5</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all"
                              style={{ width: `${(player.skillBlocking / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {player.skillDefense > 0 && (
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Verteidige</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{player.skillDefense}/5</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full transition-all"
                              style={{ width: `${(player.skillDefense / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'karriere' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Vereinsgeschichte</h3>
                {player.clubHistory && player.clubHistory.length > 0 ? (
                  <ClubHistory clubHistory={player.clubHistory} />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">Kei Vereinsgeschichte Verfüegbar</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'videos' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <VideoIcon className="w-5 h-5 text-red-500" />
                    Highlight Videos
                  </h3>
                  {isOwner && (
                    <Link
                      href={`/players/${params.id}/videos/upload`}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold text-sm"
                    >
                      <Upload className="w-4 h-4" />
                      Video Ufelade
                    </Link>
                  )}
                </div>
                {player.videos && player.videos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {player.videos.map((video, idx) => (
                      <div key={idx} className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md">
                        <div className="aspect-video bg-gray-900 relative">
                          {video.url && (
                            <video
                              controls
                              className="w-full h-full"
                              poster={video.thumbnail}
                            >
                              <source src={video.url} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          )}
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{video.title || 'Highlight Video'}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{video.description}</p>
                          {video.createdAt && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                              {new Date(video.createdAt).toLocaleDateString('de-CH')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <VideoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Kei Highlight Videos Verfüegbar</p>
                    {isOwner && (
                      <Link
                        href={`/players/${params.id}/videos/upload`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                      >
                        <Upload className="w-4 h-4" />
                        Erste Video Ufelade
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'erfolge' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Erfolge & Uszeichnunge
                </h3>
                {player.achievements && player.achievements.length > 0 ? (
                  <div className="space-y-3">
                    {player.achievements.map((achievement, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{achievement}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">Kei Erfolge & Uszeichnunge Verfüegbar</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
