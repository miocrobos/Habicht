'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, MapPin, Ruler, Weight, Award, TrendingUp, Video as VideoIcon, Instagram, Youtube, Music2, ExternalLink, Eye, Edit2, Upload, GraduationCap, Briefcase, Phone, Mail, Trash2, Camera, MessageCircle, FileDown } from 'lucide-react'
import { useSession } from 'next-auth/react'
import ClubHistory from '@/components/player/ClubHistory'
import ImageUpload from '@/components/shared/ImageUpload'
import ChatWindow from '@/components/chat/ChatWindow'
import { useLanguage } from '@/contexts/LanguageContext'
import { generatePlayerCV } from '@/lib/generateCV'
import { formatViewCount } from '@/lib/formatViewCount'
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
  user: {
    id: string
    email: string
    name: string | null
    role: string
  }
  dateOfBirth: string | null
  gender: string
  height: number | null
  weight: number | null
  positions: string[]
  nationality: string
  canton: string
  city: string | null
  municipality: string | null
  currentLeague: string | null
  currentClub: {
    id: string
    name: string
    logo: string | null
    website: string | null
    canton: string
    town: string
  } | null
  employmentStatus: string | null
  occupation: string | null
  schoolName: string | null
  profileImage: string | null
  coverImage: string | null
  backgroundGradient: string | null
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
  highlightVideo: string | null
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

const LEAGUE_TRANSLATIONS: { [key: string]: string } = {
  'NLA': 'NLA',
  'NLB': 'NLB',
  'FIRST_LEAGUE': '1. Liga',
  'SECOND_LEAGUE': '2. Liga',
  'THIRD_LEAGUE': '3. Liga',
  'FOURTH_LEAGUE': '4. Liga',
  'FIFTH_LEAGUE': '5. Liga',
  'U23': 'U23',
  'U19': 'U19',
  'U17': 'U17'
}

const BACKGROUND_OPTIONS = [
  // Gradients
  { id: 'gradient1', name: 'Rot Gradient', style: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' },
  { id: 'gradient2', name: 'Blau Gradient', style: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)' },
  { id: 'gradient3', name: 'Grün Gradient', style: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' },
  { id: 'gradient4', name: 'Lila Gradient', style: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)' },
  { id: 'gradient5', name: 'Orange Gradient', style: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)' },
  { id: 'gradient6', name: 'Pink Gradient', style: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' },
  { id: 'gradient7', name: 'Gelb Gradient', style: 'linear-gradient(135deg, #eab308 0%, #a16207 100%)' },
  { id: 'gradient8', name: 'Türkis Gradient', style: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)' },
  { id: 'gradient9', name: 'Indigo Gradient', style: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)' },
  { id: 'gradient10', name: 'Ozean', style: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%)' },
  { id: 'gradient11', name: 'Sonnenuntergang', style: 'linear-gradient(135deg, #f97316 0%, #dc2626 50%, #9333ea 100%)' },
  { id: 'gradient12', name: 'Wald', style: 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #14532d 100%)' },
  // Solid Colors
  { id: 'solid-red', name: 'Rot', style: '#dc2626' },
  { id: 'solid-blue', name: 'Blau', style: '#2563eb' },
  { id: 'solid-green', name: 'Grün', style: '#16a34a' },
  { id: 'solid-purple', name: 'Lila', style: '#9333ea' },
  { id: 'solid-orange', name: 'Orange', style: '#f97316' },
  { id: 'solid-pink', name: 'Pink', style: '#ec4899' },
  { id: 'solid-yellow', name: 'Gelb', style: '#eab308' },
  { id: 'solid-teal', name: 'Türkis', style: '#14b8a6' },
  { id: 'solid-indigo', name: 'Indigo', style: '#6366f1' },
  { id: 'solid-dark', name: 'Dunkel', style: '#1f2937' },
  { id: 'solid-gray', name: 'Grau', style: '#6b7280' },
  { id: 'solid-black', name: 'Schwarz', style: '#000000' },
]

// Get default gradient based on gender and role
const getDefaultGradient = (gender: string, role: string) => {
  if (role === 'HYBRID') {
    return 'linear-gradient(135deg, #f97316 0%, #ffffff 100%)' // Orange to white
  }
  if (role === 'RECRUITER') {
    return 'linear-gradient(135deg, #dc2626 0%, #ffffff 100%)' // Red to white
  }
  // Player role
  if (gender === 'FEMALE') {
    return 'linear-gradient(135deg, #ec4899 0%, #ffffff 100%)' // Pink to white
  }
  return 'linear-gradient(135deg, #2563eb 0%, #ffffff 100%)' // Blue to white for male
}

export default function PlayerProfile({ params }: PlayerProfileProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [player, setPlayer] = useState<PlayerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showBgSelector, setShowBgSelector] = useState(false)
  const [selectedBg, setSelectedBg] = useState(BACKGROUND_OPTIONS[0])
  const [customBgImage, setCustomBgImage] = useState<string | null>(null)
  const { data: session } = useSession()
  const { t } = useLanguage()
  const [showVideoUpload, setShowVideoUpload] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoTitle, setVideoTitle] = useState('')
  const [videoDescription, setVideoDescription] = useState('')
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null)
  const [showProfilePhotoModal, setShowProfilePhotoModal] = useState(false)
  const [newProfilePhoto, setNewProfilePhoto] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [showBackgroundModal, setShowBackgroundModal] = useState(false)
  const [newBackgroundImage, setNewBackgroundImage] = useState('')
  const [uploadingBackground, setUploadingBackground] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)

  const isOwner = session?.user?.playerId === params.id

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        setLoading(true)
        const playerResponse = await axios.get(`/api/players/${params.id}`)
        const playerData = playerResponse.data.player
        
        console.log('Player Data:', playerData)
        console.log('Club History:', playerData?.clubHistory)
        console.log('Videos:', playerData?.videos)
        console.log('Highlight Video:', playerData?.highlightVideo)
        
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

  // Set gradient based on saved preference or default based on gender/role
  useEffect(() => {
    if (player && session) {
      // If player has a saved background gradient, use it
      if (player.backgroundGradient) {
        const savedBg = BACKGROUND_OPTIONS.find(bg => bg.id === player.backgroundGradient)
        if (savedBg) {
          setSelectedBg(savedBg)
          return
        }
      }
      
      // Otherwise use default gradient based on gender and role
      const defaultGradient = getDefaultGradient(player.gender, session.user?.role || 'PLAYER')
      setSelectedBg({
        id: 'dynamic',
        name: 'Dynamic',
        style: defaultGradient
      })
    }
  }, [player, session])

  const handleVideoUpload = async () => {
    if (!videoFile) {
      alert('Bitte wähl es Video us')
      return
    }

    try {
      setUploadingVideo(true)
      const formData = new FormData()
      formData.append('file', videoFile)
      formData.append('playerId', params.id)
      formData.append('title', videoTitle || 'Highlight Video')
      formData.append('description', videoDescription || '')
      formData.append('highlightType', 'HIGHLIGHTS')

      await axios.post(`/api/videos/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // Reload player data to show new video
      const playerResponse = await axios.get(`/api/players/${params.id}`)
      setPlayer(playerResponse.data.player)
      
      // Reset form and close modal
      setShowVideoUpload(false)
      setVideoFile(null)
      setVideoTitle('')
      setVideoDescription('')
      alert('Video erfolgriich ufeglade!')
    } catch (error: any) {
      console.error('Error uploading video:', error)
      const errorMsg = error.response?.data?.error || error.message || 'Unbekannte Fehler'
      alert(`Fehler bim Video-Upload: ${errorMsg}`)
    } finally {
      setUploadingVideo(false)
    }
  }
  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Bisch sicher, dass du das Video lösche möchtest?')) {
      return
    }

    try {
      setDeletingVideoId(videoId)
      await axios.delete(`/api/videos/${videoId}`)
      
      // Refresh player data
      const playerResponse = await axios.get(`/api/players/${params.id}`)
      setPlayer(playerResponse.data.player)
      
      alert('Video erfolgriich glöscht!')
    } catch (error) {
      console.error('Error deleting video:', error)
      alert('Fehler bim Video Lösche')
    } finally {
      setDeletingVideoId(null)
    }
  }

  const handleStartChat = async () => {
    if (!session?.user || !player) return

    try {
      // Check if conversation already exists or create a new one
      const response = await axios.post('/api/chat/conversations', {
        participantId: player.user.id,
        participantType: 'PLAYER'
      })

      setConversationId(response.data.conversationId)
      setShowChat(true)
    } catch (error) {
      console.error('Error starting chat:', error)
      alert('Fehler bim Chat starte')
    }
  }

  const handleExportCV = async () => {
    if (!player) return

    try {
      console.log('=== CV EXPORT v2.0 (Professional Format) ===')
      console.log('Player data:', player)
      
      // Generate PDF using the utility function
      const pdfBlob = await generatePlayerCV(player)
      
      console.log('PDF generated, size:', pdfBlob.size, 'bytes')
      
      // Create download link with timestamp to prevent caching
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      link.download = `${player.firstName}_${player.lastName}_CV_${timestamp}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      console.log('CV downloaded successfully')
    } catch (error) {
      console.error('Error exporting CV:', error)
      alert('Fehler bim CV Export')
    }
  }

  const handleProfilePhotoUpdate = async () => {
    if (!newProfilePhoto) {
      alert('Bitte wähl es Bild us')
      return
    }

    try {
      setUploadingPhoto(true)
      
      // Get current player data first
      const currentResponse = await axios.get(`/api/players/${params.id}`)
      const currentPlayer = currentResponse.data.player
      
      // Update with full player data structure
      await axios.put(`/api/players/${params.id}`, {
        playerData: {
          firstName: currentPlayer.firstName,
          lastName: currentPlayer.lastName,
          dateOfBirth: currentPlayer.dateOfBirth,
          gender: currentPlayer.gender,
          nationality: currentPlayer.nationality,
          canton: currentPlayer.canton,
          city: currentPlayer.city,
          municipality: currentPlayer.municipality,
          height: currentPlayer.height,
          weight: currentPlayer.weight,
          spikeHeight: currentPlayer.spikeHeight,
          blockHeight: currentPlayer.blockHeight,
          phone: currentPlayer.phone,
          employmentStatus: currentPlayer.employmentStatus,
          occupation: currentPlayer.occupation,
          schoolName: currentPlayer.schoolName,
          positions: currentPlayer.positions,
          profileImage: newProfilePhoto,  // Update this field
          instagram: currentPlayer.instagram,
          tiktok: currentPlayer.tiktok,
          youtube: currentPlayer.youtube,
          highlightVideo: currentPlayer.highlightVideo,
          swissVolleyLicense: currentPlayer.swissVolleyLicense,
          skillReceiving: currentPlayer.skillReceiving,
          skillServing: currentPlayer.skillServing,
          skillAttacking: currentPlayer.skillAttacking,
          skillBlocking: currentPlayer.skillBlocking,
          skillDefense: currentPlayer.skillDefense,
          bio: currentPlayer.bio,
          lookingForClub: currentPlayer.lookingForClub,
          showEmail: currentPlayer.showEmail,
          showPhone: currentPlayer.showPhone,
        },
        clubHistory: currentPlayer.clubHistory || [],
        achievements: currentPlayer.achievements || [],
      })

      // Refresh player data
      const playerResponse = await axios.get(`/api/players/${params.id}`)
      setPlayer(playerResponse.data.player)
      
      // Reset and close modal
      setShowProfilePhotoModal(false)
      setNewProfilePhoto('')
      alert('Profilbild erfolgriich gänderet!')
    } catch (error: any) {
      console.error('Error updating profile photo:', error)
      const errorMsg = error.response?.data?.error || error.message || 'Unbekannte Fehler'
      alert(`Fehler bim Profilbild Ändere: ${errorMsg}`)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleBackgroundUpdate = async () => {
    if (!newBackgroundImage) {
      return
    }

    try {
      setUploadingBackground(true)
      
      // Get current player data first
      const currentResponse = await axios.get(`/api/players/${params.id}`)
      const currentPlayer = currentResponse.data.player
      
      console.log('Updating background with image:', newBackgroundImage.substring(0, 50))
      
      // Update with cover image
      await axios.put(`/api/players/${params.id}`, {
        playerData: {
          firstName: currentPlayer.firstName,
          lastName: currentPlayer.lastName,
          dateOfBirth: currentPlayer.dateOfBirth,
          gender: currentPlayer.gender,
          nationality: currentPlayer.nationality,
          canton: currentPlayer.canton,
          city: currentPlayer.city,
          municipality: currentPlayer.municipality,
          height: currentPlayer.height,
          weight: currentPlayer.weight,
          spikeHeight: currentPlayer.spikeHeight,
          blockHeight: currentPlayer.blockHeight,
          phone: currentPlayer.phone,
          employmentStatus: currentPlayer.employmentStatus,
          occupation: currentPlayer.occupation,
          schoolName: currentPlayer.schoolName,
          positions: currentPlayer.positions,
          profileImage: currentPlayer.profileImage,
          coverImage: newBackgroundImage,  // Update background
          backgroundGradient: null,  // Clear gradient when using custom image
          instagram: currentPlayer.instagram,
          tiktok: currentPlayer.tiktok,
          youtube: currentPlayer.youtube,
          highlightVideo: currentPlayer.highlightVideo,
          swissVolleyLicense: currentPlayer.swissVolleyLicense,
          skillReceiving: currentPlayer.skillReceiving,
          skillServing: currentPlayer.skillServing,
          skillAttacking: currentPlayer.skillAttacking,
          skillBlocking: currentPlayer.skillBlocking,
          skillDefense: currentPlayer.skillDefense,
          bio: currentPlayer.bio,
          lookingForClub: currentPlayer.lookingForClub,
          showEmail: currentPlayer.showEmail,
          showPhone: currentPlayer.showPhone,
        },
        clubHistory: currentPlayer.clubHistory || [],
        achievements: currentPlayer.achievements || [],
      })

      // Refresh player data
      const playerResponse = await axios.get(`/api/players/${params.id}`)
      setPlayer(playerResponse.data.player)
      setCustomBgImage(newBackgroundImage)
      
      // Reset and close modal
      setShowBackgroundModal(false)
      setNewBackgroundImage('')
    } catch (error: any) {
      console.error('Error updating background:', error)
      const errorMsg = error.response?.data?.error || error.message || 'Unbekannte Fehler'
      alert(`Fehler bim Hintergrund Ändere: ${errorMsg}`)
    } finally {
      setUploadingBackground(false)
    }
  }
  
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
  
  // Format birth date with zero-padding (e.g., 06.03.2006)
  const formatBirthDate = (dateString: string | null) => {
    if (!dateString) return null
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}.${month}.${year}`
  }
  const formattedBirthDate = formatBirthDate(player.dateOfBirth)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Custom Background Header */}
      <div 
        className="h-64 relative"
        style={{ 
          background: (customBgImage || player.coverImage) ? 'transparent' : selectedBg.style,
          backgroundImage: (customBgImage || player.coverImage) ? `url(${customBgImage || player.coverImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Background change button (owner only) */}
        {isOwner && (
          <button
            onClick={() => setShowBackgroundModal(true)}
            className="absolute top-4 right-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition flex items-center gap-2 z-10"
          >
            <Upload className="w-4 h-4" />
            Hintergrund Ändere
          </button>
        )}

        {/* View counter (owner only) */}
        {isOwner && (
          <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2 text-sm z-10">
            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="font-semibold text-gray-900 dark:text-white">{formatViewCount(player.views || 0)}</span>
            <span className="text-gray-600 dark:text-gray-400">Profilufrufe</span>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 pb-12 relative z-10">
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 mb-6 relative z-10">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Image */}
            <div className="flex-shrink-0 relative group">
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
              {isOwner && (
                <button
                  onClick={() => setShowProfilePhotoModal(true)}
                  className="absolute inset-0 w-40 h-40 rounded-full bg-black bg-opacity-0 hover:bg-opacity-60 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                  title="Profilbild ändere"
                >
                  <div className="text-white flex flex-col items-center gap-1">
                    <Camera className="w-6 h-6" />
                    <span className="text-xs font-medium">Ändere</span>
                  </div>
                </button>
              )}
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
                      {player.municipality ? `${player.municipality}, ${player.canton}` : player.canton}
                    </span>
                    {playerAge && formattedBirthDate && (
                      <span className="flex items-center gap-1" title={`Geburtsdatum: ${formattedBirthDate}`}>
                        <Calendar className="w-4 h-4" />
                        {playerAge} Jahr (Geb. {formattedBirthDate})
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      {player.gender === 'MALE' ? '♂' : '♀'} {player.gender === 'MALE' ? 'Männlich' : 'Weiblich'}
                    </span>
                    {player.nationality && (
                      <span>🏳 Nationalität: {player.nationality}</span>
                    )}
                    {player.currentClub && (
                      <Link 
                        href={`/clubs/${player.currentClub.id}`}
                        className="flex items-center gap-2 hover:text-red-600 dark:hover:text-red-400 transition"
                      >
                        {player.currentClub.logo && (
                          <Image
                            src={player.currentClub.logo}
                            alt={player.currentClub.name}
                            width={24}
                            height={24}
                            className="w-6 h-6 rounded object-contain bg-white"
                          />
                        )}
                        {!player.currentClub.logo && <span>🏐</span>}
                        <span>{player.currentClub.name}</span>
                        {player.currentLeague && (
                          <span className="text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full ml-1">
                            {LEAGUE_TRANSLATIONS[player.currentLeague] || player.currentLeague}
                          </span>
                        )}
                      </Link>
                    )}
                  </div>

                  {/* Contact Info */}
                  {(isOwner || player.showEmail || player.showPhone) && (
                    <div className="flex flex-wrap gap-3 mb-4">
                      {(isOwner || player.showPhone) && player.phone && (
                        <div className="flex items-center gap-2">
                          <a href={`tel:${player.phone}`} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                            <Phone className="w-4 h-4" />
                            {player.phone}
                          </a>
                          {isOwner && !player.showPhone && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">🔒</span>
                          )}
                        </div>
                      )}
                      {(isOwner || player.showEmail) && player.user?.email && (
                        <div className="flex items-center gap-2">
                          <a href={`mailto:${player.user.email}`} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                            <Mail className="w-4 h-4" />
                            {player.user.email}
                          </a>
                          {isOwner && !player.showEmail && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">🔒</span>
                          )}
                        </div>
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
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                {isOwner && (
                  <>
                    <Link
                      href={`/players/${params.id}/edit`}
                      className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                    >
                      <Edit2 className="w-4 h-4" />
                      Profil Bearbeite
                    </Link>
                    
                    <button
                      onClick={handleExportCV}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                      title="Läbeslaauf als PDF exportiere"
                    >
                      <FileDown className="w-4 h-4" />
                      Läbeslaauf Exportiere
                    </button>
                  </>
                )}

                {/* Chat Button - Show only to recruiters viewing player profiles */}
                {!isOwner && session && session.user?.role === 'RECRUITER' && player && (
                  <button
                    onClick={handleStartChat}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                    title="Nachricht sende"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Nachricht sende
                  </button>
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
                    href={`https://www.tiktok.com/@${player.tiktok.replace('@', '')}`}
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

                {/* Swiss Volley License Section */}
                {player.swissVolleyLicense && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-600" />
                      Swiss Volley Lizenz
                    </h3>
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-700 dark:to-gray-800 p-6 rounded-lg border-2 border-yellow-300 dark:border-yellow-600">
                      <img 
                        src={player.swissVolleyLicense} 
                        alt="Swiss Volley License" 
                        className="w-full max-w-2xl mx-auto rounded-lg shadow-xl border-2 border-white dark:border-gray-600"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'karriere' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Vereinsgeschichte</h3>
                {player.clubHistory && player.clubHistory.length > 0 ? (
                  <ClubHistory history={player.clubHistory} />
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
                    <button
                      onClick={() => setShowVideoUpload(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold text-sm"
                    >
                      <Upload className="w-4 h-4" />
                      Video Ufelade
                    </button>
                  )}
                </div>
                {(player.highlightVideo || (player.videos && player.videos.length > 0)) ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Show highlightVideo from registration if exists */}
                    {player.highlightVideo && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md">
                        <div className="aspect-video bg-gray-900 relative">
                          <video
                            controls
                            className="w-full h-full"
                          >
                            <source src={player.highlightVideo} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Registrierungs-Highlight Video</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Video us de Erstregistrierig</p>
                        </div>
                      </div>
                    )}
                    {/* Show regular videos */}
                    {player.videos && player.videos.map((video, idx) => (
                      <div key={idx} className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md relative group">
                        {isOwner && (
                          <button
                            onClick={() => handleDeleteVideo(video.id)}
                            disabled={deletingVideoId === video.id}
                            className="absolute top-2 right-2 z-10 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 disabled:opacity-50"
                            title="Video Lösche"
                          >
                            {deletingVideoId === video.id ? (
                              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        <div className="aspect-video bg-gray-900 relative">
                          {video.videoUrl && (
                            <video
                              controls
                              className="w-full h-full"
                              poster={video.thumbnailUrl || undefined}
                            >
                              <source src={video.videoUrl} type="video/mp4" />
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
                      <button
                        onClick={() => setShowVideoUpload(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                      >
                        <Upload className="w-4 h-4" />
                        Erste Video Ufelade
                      </button>
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

      {/* Video Upload Modal */}
      {showVideoUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Video Ufelade</h3>
              <button
                onClick={() => setShowVideoUpload(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Video Datei *
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 dark:file:bg-red-900/30 dark:file:text-red-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Titel
                </label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="z.B. Highlight Reel 2024"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Beschriibig
                </label>
                <textarea
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  placeholder="Optional: Beschriib dis Video..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowVideoUpload(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-semibold"
                >
                  Abbreche
                </button>
                <button
                  onClick={handleVideoUpload}
                  disabled={!videoFile || uploadingVideo}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploadingVideo ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Ufelade
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Photo Modal */}
      {showProfilePhotoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Profilbild Ändere</h3>
              <button
                onClick={() => {
                  setShowProfilePhotoModal(false)
                  setNewProfilePhoto('')
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <ImageUpload
                label="Wähl Es Neus Profilbild"
                value={newProfilePhoto}
                onChange={(base64) => setNewProfilePhoto(base64)}
                aspectRatio="square"
                required
              />

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowProfilePhotoModal(false)
                    setNewProfilePhoto('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-semibold"
                >
                  Abbreche
                </button>
                <button
                  onClick={handleProfilePhotoUpdate}
                  disabled={!newProfilePhoto || uploadingPhoto}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploadingPhoto ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      Speichere
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Background Image Modal */}
      {showBackgroundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Hintergrund Ändere</h3>
              <button
                onClick={() => {
                  setShowBackgroundModal(false)
                  setNewBackgroundImage('')
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Color Selector */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Farb Wähle</h4>
                <div className="grid grid-cols-4 gap-3">
                  {BACKGROUND_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={async () => {
                        try {
                          // Update UI immediately for instant feedback
                          setSelectedBg(option)
                          setCustomBgImage(null)
                          setShowBackgroundModal(false)
                          
                          // Update player state immediately to show gradient
                          setPlayer(prev => prev ? { ...prev, coverImage: null, backgroundGradient: option.id } : prev)
                          
                          // Save gradient/color to database
                          const currentResponse = await axios.get(`/api/players/${params.id}`)
                          const currentPlayer = currentResponse.data.player
                          
                          await axios.put(`/api/players/${params.id}`, {
                            playerData: {
                              firstName: currentPlayer.firstName,
                              lastName: currentPlayer.lastName,
                              dateOfBirth: currentPlayer.dateOfBirth,
                              gender: currentPlayer.gender,
                              nationality: currentPlayer.nationality,
                              canton: currentPlayer.canton,
                              city: currentPlayer.city,
                              municipality: currentPlayer.municipality,
                              currentLeague: currentPlayer.currentLeague,
                              height: currentPlayer.height,
                              weight: currentPlayer.weight,
                              spikeHeight: currentPlayer.spikeHeight,
                              blockHeight: currentPlayer.blockHeight,
                              phone: currentPlayer.phone,
                              employmentStatus: currentPlayer.employmentStatus,
                              occupation: currentPlayer.occupation,
                              schoolName: currentPlayer.schoolName,
                              positions: currentPlayer.positions,
                              profileImage: currentPlayer.profileImage,
                              coverImage: null,  // Clear cover image to use gradient
                              backgroundGradient: option.id,  // Save selected gradient ID
                              instagram: currentPlayer.instagram,
                              tiktok: currentPlayer.tiktok,
                              youtube: currentPlayer.youtube,
                              highlightVideo: currentPlayer.highlightVideo,
                              swissVolleyLicense: currentPlayer.swissVolleyLicense,
                              skillReceiving: currentPlayer.skillReceiving,
                              skillServing: currentPlayer.skillServing,
                              skillAttacking: currentPlayer.skillAttacking,
                              skillBlocking: currentPlayer.skillBlocking,
                              skillDefense: currentPlayer.skillDefense,
                              bio: currentPlayer.bio,
                              lookingForClub: currentPlayer.lookingForClub,
                              showEmail: currentPlayer.showEmail,
                              showPhone: currentPlayer.showPhone,
                            },
                            clubHistory: currentPlayer.clubHistory || [],
                            achievements: currentPlayer.achievements || [],
                          })
                          
                          // Refresh player data to ensure consistency
                          const playerResponse = await axios.get(`/api/players/${params.id}`)
                          setPlayer(playerResponse.data.player)
                        } catch (error) {
                          console.error('Error updating background:', error)
                          // Revert changes on error
                          const playerResponse = await axios.get(`/api/players/${params.id}`)
                          setPlayer(playerResponse.data.player)
                        }
                      }}
                      className={`h-20 rounded-lg transition-all hover:scale-105 hover:shadow-lg border-2 ${
                        selectedBg.id === option.id && !customBgImage && !player.coverImage
                          ? 'border-red-600 ring-2 ring-red-600 ring-offset-2 dark:ring-offset-gray-800'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      style={{ background: option.style }}
                      title={option.name}
                    >
                      <span className="sr-only">{option.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Oder</span>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <ImageUpload
                  label="Wähl Es Neus Hintergrundbild"
                  value={newBackgroundImage}
                  onChange={(base64) => setNewBackgroundImage(base64)}
                  aspectRatio="banner"
                  helpText="Empfohlen: 1920x1080 Pixel"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowBackgroundModal(false)
                    setNewBackgroundImage('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-semibold"
                >
                  Abbreche
                </button>
                <button
                  onClick={handleBackgroundUpdate}
                  disabled={!newBackgroundImage || uploadingBackground}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploadingBackground ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Bild Speichere
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {showChat && conversationId && player && session?.user && (
        <div className="fixed bottom-4 right-4 z-50">
          <ChatWindow
            conversationId={conversationId}
            otherParticipant={{
              id: player.user.id,
              name: `${player.firstName} ${player.lastName}`,
              type: 'PLAYER',
              club: player.currentClub?.name,
              position: player.positions[0] ? POSITION_TRANSLATIONS[player.positions[0]] : undefined
            }}
            currentUserId={session.user.id}
            currentUserType={session.user.role as 'PLAYER' | 'RECRUITER'}
            onClose={() => setShowChat(false)}
          />
        </div>
      )}
    </div>
  )
}
