'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, MapPin, Ruler, Scale, Award, TrendingUp, Video as VideoIcon, Instagram, Youtube, Music2, ExternalLink, Eye, Edit2, Upload, GraduationCap, Briefcase, Phone, Mail, Trash2, Camera, MessageCircle, FileDown, Bookmark, BookmarkPlus, LogIn, UserPlus, FileText } from 'lucide-react'
import { useSession } from 'next-auth/react'
import ClubHistory from '@/components/player/ClubHistory'
import ClubBadge from '@/components/shared/ClubBadge'
import ImageUpload from '@/components/shared/ImageUpload'
import PhotoGallery from '@/components/shared/PhotoGallery'
import ChatWindow from '@/components/chat/ChatWindow'
import { useLanguage } from '@/contexts/LanguageContext'
import { generatePlayerCV } from '@/lib/generateCV'
import { formatViewCount } from '@/lib/formatViewCount'
import CVExportLanguagePopup from '@/components/shared/CVExportLanguagePopup'
import { calculateAge } from '@/lib/ageUtils'
import { BACKGROUND_OPTIONS } from '@/components/shared/backgroundOptions'
import axios from 'axios'

// Helper function to translate coach role
const getTranslatedCoachRole = (role: string, t: any) => {
  if (!role) return '';
  // Handle comma-separated roles
  const roles = role.split(',').map(r => r.trim());
  return roles.map(r => {
    const roleKey = r.toLowerCase().replace(/ /g, '_') as 'head_coach' | 'assistant_coach' | 'technical_coach' | 'physical_coach' | 'scout' | 'trainer' | 'team_manager';
    const translation = t(`coachRole.${roleKey}`);
    return translation && translation !== `coachRole.${roleKey}` ? translation : r.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  }).join(', ');
};

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
    emailVerified: Date | null
  }
  dateOfBirth: string | null
  gender: string
  height: number | null
  weight: number | null
  positions: string[]
  dominantHand: string | null
  preferredLanguage: string | null
  nationality: string
  canton: string
  city: string | null
  municipality: string | null
  currentLeagues: string[]
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
  customColor: string | null
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
  showLicense: boolean
  createdAt: string
}

// Helper functions to get translated position and league labels
const getPositionLabel = (position: string, t: any) => {
  const positionMap: { [key: string]: string } = {
    'OUTSIDE_HITTER': 'playerProfile.positionOutsideHitter',
    'OPPOSITE': 'playerProfile.positionOpposite',
    'MIDDLE_BLOCKER': 'playerProfile.positionMiddleBlocker',
    'SETTER': 'playerProfile.positionSetter',
    'LIBERO': 'playerProfile.positionLibero',
    'UNIVERSAL': 'playerProfile.positionUniversal'
  }
  return t(positionMap[position] || position)
}

const getLeagueLabel = (league: string, t: any) => {
  const leagueMap: { [key: string]: string } = {
    'NLA': 'home.leagues.nla',
    'NLB': 'home.leagues.nlb',
    'FIRST_LEAGUE': 'home.leagues.firstLeague',
    'SECOND_LEAGUE': 'home.leagues.secondLeague',
    'THIRD_LEAGUE': 'home.leagues.thirdLeague',
    'FOURTH_LEAGUE': 'home.leagues.fourthLeague',
    'FIFTH_LEAGUE': 'home.leagues.fifthLeague',
    'U23': 'leagues.u23',
    'U20': 'leagues.u20',
    'U18': 'leagues.u18',
    'YOUTH_U23': 'leagues.u23',
    'YOUTH_U20': 'leagues.u20',
    'YOUTH_U18': 'leagues.u18'
  }
  const key = leagueMap[league]
  return key ? t(key) : league
}

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
  const [activeTab, setActiveTab] = useState('karriere')
  const [player, setPlayer] = useState<PlayerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [authRequired, setAuthRequired] = useState(false)
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
  const [showCVExportPopup, setShowCVExportPopup] = useState(false)
  const [isWatched, setIsWatched] = useState(false)
  const [watchlistLoading, setWatchlistLoading] = useState(false)
  const [zoomedLicense, setZoomedLicense] = useState<string | null>(null)
  const backgroundLoadedRef = useRef(false)
  
  // Messages state
  const [conversations, setConversations] = useState<any[]>([])
  const [conversationsLoading, setConversationsLoading] = useState(false)
  const [activeChat, setActiveChat] = useState<any>(null)

  const isOwner = session?.user?.playerId === params.id

  // Check if player is in watchlist
  useEffect(() => {
    const checkWatchlist = async () => {
      if (session && (session.user.role === 'RECRUITER' || session.user.role === 'HYBRID') && !isOwner) {
        try {
          const response = await axios.get(`/api/watchlist/${params.id}`)
          setIsWatched(response.data.isWatched)
        } catch (error) {
          console.error('Error checking watchlist:', error)
        }
      }
    }
    checkWatchlist()
  }, [session, params.id, isOwner])

  // Fetch conversations for messages tab
  const fetchConversations = async () => {
    if (!isOwner) return
    try {
      setConversationsLoading(true)
      const response = await axios.get('/api/chat/conversations')
      setConversations(response.data.conversations || [])
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setConversationsLoading(false)
    }
  }

  // Load conversations when messages tab is active
  useEffect(() => {
    if (isOwner && activeTab === 'messages') {
      fetchConversations()
    }
  }, [isOwner, activeTab])

  // Open chat from messages list
  const openChatFromList = (conversation: any) => {
    let otherParticipant
    
    if (conversation.player && conversation.recruiter) {
      // As a player, the other participant is always the recruiter
      otherParticipant = {
        id: conversation.recruiter.id,
        name: `${conversation.recruiter.firstName} ${conversation.recruiter.lastName}`,
        type: 'RECRUITER' as const,
        club: conversation.recruiter.club?.name || ''
      }
    }
    
    if (otherParticipant) {
      setActiveChat({
        conversationId: conversation.id,
        otherParticipant,
        currentUserId: session?.user?.id || '',
        currentUserType: 'PLAYER' as const
      })
    }
  }

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        setLoading(true)
        const playerResponse = await axios.get(`/api/players/${params.id}`)
        const playerData = playerResponse.data.player
        
        if (playerData) {
          setPlayer(playerData)
        }
        setAuthRequired(false)

        await axios.post(`/api/players/${params.id}/view`)
      } catch (error: any) {
        console.error('Error fetching player:', error)
        if (error?.response?.status === 401) {
          setAuthRequired(true)
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchPlayer()
  }, [params.id])

  // Set gradient based on saved preference or default based on gender/role
  useEffect(() => {
    if (player && session && !backgroundLoadedRef.current) {
      backgroundLoadedRef.current = true
      // Parse server background data
      let serverBg = null;
      try {
        if (player.customColor) {
          serverBg = JSON.parse(player.customColor);
        }
      } catch (e) {
        // If parsing fails, treat as old format
        serverBg = { backgroundGradient: player.backgroundGradient };
      }
      
      // Try to load from localStorage first for client-side persistence
      let bgLoaded = false;
      try {
        const savedBg = localStorage.getItem(`profileBackground_player_${params.id}`);
        if (savedBg) {
          const parsed = JSON.parse(savedBg);
          const bgId = parsed.selectedBg?.id || parsed.selectedBg || 'solid-blue';
          const found = BACKGROUND_OPTIONS.find(bg => bg.id === bgId);
          if (found) {
            setSelectedBg(found);
          }
          if (parsed.backgroundImage) {
            setCustomBgImage(parsed.backgroundImage);
          }
          bgLoaded = true;
          return; // Stop processing - localStorage data loaded successfully
        }
      } catch (e) {
        console.error('Failed to load background from localStorage:', e);
      }
      
      // If no localStorage, use server data and save to localStorage
      if (!bgLoaded && serverBg) {
        let bgId = 'solid-blue';
        let bgImage = '';
        
        if (serverBg.backgroundImage) {
          setCustomBgImage(serverBg.backgroundImage);
          bgId = 'image';
          bgImage = serverBg.backgroundImage;
        } else if (serverBg.backgroundGradient) {
          const found = BACKGROUND_OPTIONS.find(bg => bg.id === serverBg.backgroundGradient);
          if (found) {
            setSelectedBg(found);
            bgId = serverBg.backgroundGradient;
          }
        } else if (serverBg.customColor) {
          const found = BACKGROUND_OPTIONS.find(bg => bg.style === serverBg.customColor);
          if (found) {
            setSelectedBg(found);
            bgId = found.id;
          }
        }
        
        // Don't save server data to localStorage - only user changes should be saved
        // This prevents old server data from overwriting user's choice
      } else if (!bgLoaded && player.backgroundGradient) {
        // Fallback to old format
        const savedBg = BACKGROUND_OPTIONS.find(bg => bg.id === player.backgroundGradient);
        if (savedBg) {
          setSelectedBg(savedBg);
        }
      } else if (!bgLoaded) {
        // Use default gradient based on gender and role
        const defaultGradient = getDefaultGradient(player.gender, session.user?.role || 'PLAYER');
        setSelectedBg({
          id: 'dynamic',
          name: 'Dynamic',
          style: defaultGradient
        });
      }
    }
  }, [player, session])

  const handleVideoUpload = async () => {
    if (!videoFile) {
      alert(t('playerProfile.selectVideoFile'))
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
      alert(t('playerProfile.uploadedVideo'))
    } catch (error: any) {
      console.error('Error uploading video:', error)
      alert(t('playerProfile.errorUploadingVideo'))
    } finally {
      setUploadingVideo(false)
    }
  }
  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm(t('playerProfile.confirmDeleteVideo'))) {
      return
    }

    try {
      setDeletingVideoId(videoId)
      await axios.delete(`/api/videos/${videoId}`)
      
      // Refresh player data
      const playerResponse = await axios.get(`/api/players/${params.id}`)
      setPlayer(playerResponse.data.player)
      
      alert(t('playerProfile.uploadedVideo'))
    } catch (error) {
      console.error('Error deleting video:', error)
      alert(t('playerProfile.errorUploadingVideo'))
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
      alert(t('playerProfile.errorStartingChat'))
    }
  }

  const toggleWatchlist = async () => {
    if (!session || watchlistLoading) return

    try {
      setWatchlistLoading(true)
      
      if (isWatched) {
        // Remove from watchlist
        await axios.delete(`/api/watchlist?playerId=${params.id}`)
        setIsWatched(false)
        alert(t('watchlist.removedFromWatchlist'))
      } else {
        // Add to watchlist
        await axios.post('/api/watchlist', { playerId: params.id })
        setIsWatched(true)
        alert(t('watchlist.addedToWatchlist'))
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error)
      alert('Error updating watchlist')
    } finally {
      setWatchlistLoading(false)
    }
  }

  const handleExportCV = async (language: string) => {
    if (!player) return

    try {
      console.log(`=== CV EXPORT v2.0 (Language: ${language}) ===`)
      // Generate PDF using the utility function with selected language
      const pdfBlob = await generatePlayerCV(player, language)
      
      // Create download link with timestamp to prevent caching
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      link.download = `${player.firstName}_${player.lastName}_CV_${language.toUpperCase()}_${timestamp}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      console.log('CV downloaded successfully')
    } catch (error) {
      console.error('Error exporting CV:', error)
      alert(t('playerProfile.errorExportingCV'))
    }
  }

  const handleProfilePhotoUpdate = async () => {
    if (!newProfilePhoto) {
      alert(t('playerProfile.selectImage'))
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
      alert(t('playerProfile.photoUpdated'))
    } catch (error: any) {
      console.error('Error updating profile photo:', error)
      alert(t('playerProfile.errorUpdatingPhoto'))
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
      
      // Save background data as JSON in customColor field
      const backgroundData = JSON.stringify({
        backgroundGradient: '',
        customColor: '',
        backgroundImage: newBackgroundImage,
      });
      
      await axios.put(`/api/players/${params.id}/background`, {
        customColor: backgroundData,
      })
      
      // Update local state
      setCustomBgImage(newBackgroundImage)
      
      // Save to localStorage for persistence
      try {
        localStorage.setItem(`profileBackground_player_${params.id}`, JSON.stringify({
          selectedBg: 'image',
          customColor: '',
          backgroundImage: newBackgroundImage
        }));
      } catch (e) {
        console.error('Failed to save background to localStorage:', e);
      }
      
      // Reset and close modal
      setShowBackgroundModal(false)
      setNewBackgroundImage('')
    } catch (error: any) {
      console.error('Error updating background:', error)
      alert(t('playerProfile.errorUpdatingBackground'))
    } finally {
      setUploadingBackground(false)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('playerProfile.loadingProfile')}</p>
        </div>
      </div>
    )
  }

  // Show auth required screen for unauthenticated users
  if (authRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {t('auth.required.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('auth.required.message')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/auth/login?returnUrl=${encodeURIComponent(`/players/${params.id}`)}`}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              {t('auth.required.signIn')}
            </Link>
            <Link
              href={`/auth/register?returnUrl=${encodeURIComponent(`/players/${params.id}`)}`}
              className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              {t('auth.required.register')}
            </Link>
          </div>
          <Link
            href="/players"
            className="mt-4 inline-block text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition"
          >
            {t('playerProfile.backToOverview')}
          </Link>
        </div>
      </div>
    )
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('playerProfile.playerNotFound')}</h1>
          <Link href="/players" className="mt-4 inline-block text-red-600 hover:text-red-700">
            {t('playerProfile.backToOverview')}
          </Link>
        </div>
      </div>
    )
  }

  const playerAge = calculateAge(player.dateOfBirth)
  
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
        className="h-48 sm:h-56 md:h-64 relative"
        style={{ 
          ...(customBgImage || player.coverImage 
            ? {
                backgroundImage: `url(${customBgImage || player.coverImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }
            : {
                background: selectedBg.style
              }
          )
        }}
      >
        {/* Background change button (owner only) */}
        {isOwner && (
          <button
            onClick={() => setShowBackgroundModal(true)}
            className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-lg hover:shadow-xl transition flex items-center gap-1 sm:gap-2 z-10 text-xs sm:text-sm"
          >
            <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">{t('playerProfile.changeBackgroundButton')}</span>
            <span className="xs:hidden">Ändere</span>
          </button>
        )}

        {/* View counter (owner only) */}
        {isOwner && (
          <div className="absolute top-12 sm:top-4 left-2 sm:left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full flex items-center gap-1 sm:gap-2 text-xs sm:text-sm z-10">
            <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
            <span className="font-semibold text-gray-900 dark:text-white">{formatViewCount(player.views || 0)}</span>
            <span className="text-gray-600 dark:text-gray-400 hidden sm:inline">{t('playerProfile.profileViews')}</span>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 -mt-24 sm:-mt-28 md:-mt-32 pb-8 sm:pb-12 relative z-10">
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6 relative z-10">
          <div className="flex flex-col md:flex-row gap-3 md:gap-6">
            {/* Profile Image */}
            <div className="flex-shrink-0 relative group mx-auto md:mx-0">
              <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-gray-700 shadow-xl overflow-hidden bg-gray-200 dark:bg-gray-700">
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
                  className="absolute inset-0 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full bg-black bg-opacity-0 hover:bg-opacity-60 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 active:opacity-100"
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
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
                <div className="flex-grow">
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2 text-center md:text-left">
                    {player.firstName} {player.lastName}
                  </h1>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 sm:gap-2 mb-2 sm:mb-3 md:mb-4">
                    {player.positions.map((pos, idx) => (
                      <span key={idx} className="px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-[10px] sm:text-xs md:text-sm font-semibold rounded-full">
                        {t(`playerProfile.position${pos.charAt(0) + pos.slice(1).toLowerCase().replace(/_([a-z])/g, (m, c) => c.toUpperCase())}`) || pos}
                      </span>
                    ))}
                    {player.lookingForClub && (
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-semibold rounded-full flex items-center gap-1">
                        ✓ {t('playerProfile.lookingForClubBadge')}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 md:mb-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {player.municipality ? `${player.municipality}, ${player.canton}` : player.canton}
                    </span>
                    {playerAge && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {playerAge} {t('playerProfile.yearsOld')}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      {player.gender === 'MALE' ? '♂' : '♀'} {player.gender === 'MALE' ? t('playerProfile.male') : t('playerProfile.female')}
                    </span>
                    {player.nationality && (
                      <span>🏳 {t('playerProfile.nationality')} {player.nationality}</span>
                    )}
                    {player.currentClub && (() => {
                      // Find the current club in club history to get the country
                      const currentClubHistory = player.clubHistory?.find((ch: any) => ch.currentClub === true)
                      const clubCountry = currentClubHistory?.clubCountry || null
                      
                      return (
                        <Link 
                          href={`/clubs/${player.currentClub.id}`}
                          className="flex items-center gap-2 hover:text-red-600 dark:hover:text-red-400 transition"
                        >
                          <ClubBadge 
                            clubName={player.currentClub.name}
                            size="sm"
                            uploadedLogo={player.currentClub.logo}
                            country={clubCountry}
                          />
                          <span>{player.currentClub.name}</span>
                          {player.currentLeagues && player.currentLeagues.length > 0 && (
                            <span className="text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full ml-1">
                              {player.currentLeagues.map((league: string) => getLeagueLabel(league, t)).join(', ')}
                            </span>
                          )}
                        </Link>
                      )
                    })()}
                  </div>

                  {/* Contact Info */}
                  {(isOwner || player.showEmail || player.showPhone) && (
                    <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 mb-4 max-w-full overflow-hidden items-center sm:items-start justify-center sm:justify-start">
                      {(isOwner || player.showPhone) && player.phone && (
                        <div className="flex items-center gap-1 sm:gap-2 min-w-0 w-full sm:w-auto justify-center sm:justify-start">
                          <a href={`tel:${player.phone}`} className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 min-w-0">
                            <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">{player.phone}</span>
                          </a>
                          {isOwner && !player.showPhone && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">🔒</span>
                          )}
                        </div>
                      )}
                      {(isOwner || player.showEmail) && player.user?.email && (
                        <div className="flex items-center gap-1 sm:gap-2 min-w-0 w-full sm:w-auto justify-center sm:justify-start">
                          <a href={`mailto:${player.user.email}`} className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 min-w-0 max-w-[200px] sm:max-w-none">
                            <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">{player.user.email}</span>
                          </a>
                          {isOwner && !player.showEmail && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">🔒</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 md:gap-3 justify-center md:justify-start">
                  {player.height && (
                    <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 md:px-4 md:py-3 rounded-lg text-center min-w-[80px] md:min-w-[90px]">
                      <div className="text-xl md:text-2xl font-bold text-red-600 dark:text-red-400">{player.height}</div>
                      <div className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400">{t('playerProfile.heightLabel')}</div>
                    </div>
                  )}
                  {player.weight && (
                    <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 md:px-4 md:py-3 rounded-lg text-center min-w-[80px] md:min-w-[90px]">
                      <div className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">{player.weight}</div>
                      <div className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400">{t('playerProfile.weightLabel')}</div>
                    </div>
                  )}
                  {player.spikeHeight && (
                    <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 md:px-4 md:py-3 rounded-lg text-center min-w-[80px] md:min-w-[90px]">
                      <div className="text-xl md:text-2xl font-bold text-orange-600 dark:text-orange-400">{player.spikeHeight}</div>
                      <div className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400">{t('playerProfile.spikeLabel')}</div>
                    </div>
                  )}
                  {player.blockHeight && (
                    <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 md:px-4 md:py-3 rounded-lg text-center min-w-[80px] md:min-w-[90px]">
                      <div className="text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400">{player.blockHeight}</div>
                      <div className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400">{t('playerProfile.blockLabel')}</div>
                    </div>
                  )}
                  {player.dominantHand && (
                    <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 md:px-4 md:py-3 rounded-lg text-center min-w-[80px] md:min-w-[90px]">
                      <div className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">
                        {player.dominantHand === 'RIGHT' ? t('register.rightHanded') : 
                         player.dominantHand === 'LEFT' ? t('register.leftHanded') : 
                         t('register.ambidextrous')}
                      </div>
                      <div className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400">{t('playerProfile.dominantHandLabel')}</div>
                    </div>
                  )}
                  {player.preferredLanguage && (
                    <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 md:px-4 md:py-3 rounded-lg text-center min-w-[80px] md:min-w-[90px]">
                      <div className="text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {player.preferredLanguage === 'gsw' ? t('register.languageSwissGerman') :
                         player.preferredLanguage === 'de' ? t('register.languageGerman') :
                         player.preferredLanguage === 'fr' ? t('register.languageFrench') :
                         player.preferredLanguage === 'it' ? t('register.languageItalian') :
                         player.preferredLanguage === 'rm' ? t('register.languageRomansh') :
                         player.preferredLanguage === 'en' ? t('register.languageEnglish') :
                         player.preferredLanguage.toUpperCase()}
                      </div>
                      <div className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400">{t('playerProfile.preferredLanguageLabel')}</div>
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
              <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
                {player.schoolName && (
                  <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg max-w-full min-w-0">
                    <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base truncate">{player.schoolName}</span>
                  </div>
                )}
                {player.occupation && (
                  <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg max-w-full min-w-0">
                    <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base truncate">{player.occupation}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-3">
                {isOwner && (
                  <>
                    <Link
                      href={player.user?.role === 'HYBRID' ? `/hybrids/${player.user.id}/edit` : `/players/${params.id}/edit`}
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold text-sm sm:text-base"
                    >
                      <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      {t('playerProfile.editProfile')}
                    </Link>
                    
                    <button
                      onClick={() => setShowCVExportPopup(true)}
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm sm:text-base"
                      title={t('playerProfile.exportCV')}
                    >
                      <FileDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      {t('playerProfile.exportCV')}
                    </button>
                  </>
                )}

                {/* Chat Button - Show only to recruiters and hybrids viewing player profiles */}
                {!isOwner && session && (session.user?.role === 'RECRUITER' || session.user?.role === 'HYBRID') && player && (
                  <button
                    onClick={handleStartChat}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm sm:text-base"
                    title={t('playerProfile.sendMessage')}
                  >
                    <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {t('playerProfile.sendMessage')}
                  </button>
                )}

                {/* Watchlist Button - Show to recruiters and hybrids viewing player profiles */}
                {!isOwner && session && (session.user?.role === 'RECRUITER' || session.user?.role === 'HYBRID') && player && (
                  <button
                    onClick={toggleWatchlist}
                    disabled={watchlistLoading}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg transition font-semibold text-sm sm:text-base ${
                      isWatched 
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                    } ${watchlistLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={isWatched ? t('watchlist.removeFromWatchlist') : t('watchlist.addToWatchlist')}
                  >
                    {isWatched ? <BookmarkPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    <span className="hidden sm:inline">{isWatched ? t('watchlist.removeFromWatchlist') : t('watchlist.addToWatchlist')}</span>
                    <span className="sm:hidden">{isWatched ? 'Entferne' : 'Speichere'}</span>
                  </button>
                )}
                
                {player.instagram && (
                  <a
                    href={`https://instagram.com/${player.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition font-semibold text-sm sm:text-base"
                  >
                    <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Instagram</span>
                  </a>
                )}
                {player.tiktok && (
                  <a
                    href={`https://www.tiktok.com/@${player.tiktok.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-black text-white rounded-lg hover:opacity-90 transition font-semibold text-sm sm:text-base"
                  >
                    <Music2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">TikTok</span>
                  </a>
                )}
                {player.youtube && (
                  <a
                    href={`https://youtube.com/@${player.youtube.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold text-sm sm:text-base"
                  >
                    <Youtube className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">YouTube</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-hide">
            <nav className="flex -mb-px min-w-max px-1">
              <button
                onClick={() => setActiveTab('karriere')}
                className={`px-3 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-sm font-medium border-b-2 transition whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'karriere'
                    ? 'border-red-600 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {t('playerProfile.tabCareer')}
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`px-3 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-sm font-medium border-b-2 transition whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'videos'
                    ? 'border-red-600 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {t('playerProfile.tabVideos')}
              </button>
              <button
                onClick={() => setActiveTab('erfolge')}
                className={`px-3 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-sm font-medium border-b-2 transition whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'erfolge'
                    ? 'border-red-600 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {t('playerProfile.tabAchievements')}
              </button>
              <button
                onClick={() => setActiveTab('photos')}
                className={`px-3 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-sm font-medium border-b-2 transition whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'photos'
                    ? 'border-red-600 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Photos
              </button>
              {(isOwner || (player.showLicense && player.swissVolleyLicense)) && (
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`px-3 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-sm font-medium border-b-2 transition whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'documents'
                      ? 'border-red-600 text-red-600 dark:text-red-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {t('playerProfile.documents') || 'Documents'}
                </button>
              )}
              {/* Messages Tab - Only visible to owner */}
              {isOwner && (
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`px-3 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-sm font-medium border-b-2 transition whitespace-nowrap flex-shrink-0 flex items-center gap-1 ${
                    activeTab === 'messages'
                      ? 'border-red-600 text-red-600 dark:text-red-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  {t('settings.messages.title') || 'Messages'}
                </button>
              )}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {activeTab === 'karriere' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('playerProfile.clubHistory')}</h3>
                {player.clubHistory && player.clubHistory.length > 0 ? (
                  <ClubHistory history={player.clubHistory} />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">{t('playerProfile.noClubHistory')}</p>
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
                      {t('playerProfile.uploadVideo')}
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
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('playerProfile.registrationHighlightVideo')}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{t('playerProfile.videoFromRegistration')}</p>
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
                            title={t('playerProfile.deleteVideo')}
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
                    <p className="text-gray-500 dark:text-gray-400 mb-4">{t('playerProfile.noHighlightVideos')}</p>
                    {isOwner && (
                      <button
                        onClick={() => setShowVideoUpload(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                      >
                        <Upload className="w-4 h-4" />
                        {t('playerProfile.firstVideoUpload')}
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
                  {t('playerProfile.achievements')}
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
                    <p className="text-gray-500 dark:text-gray-400">{t('playerProfile.noAchievements')}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'photos' && (
              <PhotoGallery 
                playerId={params.id}
                isOwner={isOwner}
                isVerified={player?.user?.emailVerified !== null}
              />
            )}

            {activeTab === 'documents' && (isOwner || (player.showLicense && player.swissVolleyLicense)) && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  {t('playerProfile.documents') || 'Documents'}
                  {isOwner && !player.showLicense && (
                    <span className="ml-2 text-xs text-gray-400 flex items-center gap-1" title="Only visible to you">
                      🔒 {t('common.privateToYou') || 'Private'}
                    </span>
                  )}
                </h3>
                {isOwner && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <Link href="/settings" className="text-red-600 hover:underline">
                      {t('hybridProfile.changeVisibility') || 'Change visibility in settings'}
                    </Link>
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {player.swissVolleyLicense && (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm flex items-center gap-2">
                          <Award className="w-4 h-4 text-yellow-500" />
                          {t('playerProfile.playerLicense') || 'Swiss Volley License'}
                        </h4>
                      </div>
                      <div className="p-2">
                        {player.swissVolleyLicense.startsWith('data:image') || 
                         player.swissVolleyLicense.match(/\.(jpg|jpeg|png|gif|webp)($|\?)/i) ||
                         player.swissVolleyLicense.includes('cloudinary.com') ||
                         player.swissVolleyLicense.includes('res.cloudinary') ? (
                          <div 
                            onClick={() => setZoomedLicense(player.swissVolleyLicense)}
                            className="block cursor-pointer"
                          >
                            <img 
                              src={player.swissVolleyLicense} 
                              alt="Player License" 
                              className="w-full h-48 object-contain rounded cursor-pointer hover:opacity-90 transition bg-gray-100 dark:bg-gray-700"
                            />
                            <div className="text-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                              {t('common.clickToZoom') || 'Click to zoom'}
                            </div>
                          </div>
                        ) : player.swissVolleyLicense.match(/\.pdf($|\?)/i) ? (
                          <a 
                            href={player.swissVolleyLicense} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center h-48 bg-gray-100 dark:bg-gray-700 rounded text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition"
                          >
                            <div className="text-center">
                              <FileText className="w-12 h-12 mx-auto mb-2" />
                              <span className="text-sm font-medium">{t('common.viewDocument') || 'View Document'}</span>
                            </div>
                          </a>
                        ) : (
                          <div className="flex items-center justify-center h-48 bg-gray-100 dark:bg-gray-700 rounded">
                            <p className="text-gray-500 dark:text-gray-400 text-center">
                              {t('playerProfile.noPhotosYet') || 'No photos yet'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {!player.swissVolleyLicense && isOwner && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      {t('playerProfile.noDocumentsUploaded') || 'No documents uploaded yet.'}
                    </p>
                    <Link
                      href={`/players/${player.id}/edit`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      {t('playerProfile.uploadLicense') || 'Upload License'}
                    </Link>
                  </div>
                )}
                {!player.swissVolleyLicense && !isOwner && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    {t('playerProfile.noDocumentsUploaded') || 'No documents uploaded yet.'}
                  </p>
                )}
              </div>
            )}

            {/* Messages Tab Content - Only visible to owner */}
            {activeTab === 'messages' && isOwner && (
              <div>
                <div className="mb-3 sm:mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                    {t('settings.messages.title') || 'Messages'}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('settings.messages.subtitle') || 'Your conversations with other users'}
                  </p>
                  <p className="text-[11px] sm:text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-start sm:items-center gap-1">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5 sm:mt-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{t('settings.messages.playerNote') || 'As a player, you can only respond to messages from recruiters'}</span>
                  </p>
                </div>
                
                {conversationsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {t('settings.messages.empty') || 'No conversations yet'}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('settings.messages.emptyDescriptionPlayer') || 'Wait for recruiters to contact you'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {conversations.map((conversation) => {
                      const recruiter = conversation.recruiter
                      if (!recruiter) return null
                      
                      const otherName = `${recruiter.firstName} ${recruiter.lastName}`
                      const otherRole = getTranslatedCoachRole(recruiter.coachRole, t) || t('common.recruiter') || 'Recruiter'
                      const otherClub = recruiter.club?.name || ''
                      const lastMessage = conversation.messages?.[0]
                      const profileImage = recruiter.profileImage
                      
                      return (
                        <div
                          key={conversation.id}
                          className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition cursor-pointer active:bg-gray-100 dark:active:bg-gray-600/50"
                          onClick={() => openChatFromList(conversation)}
                        >
                          <div className="flex-shrink-0">
                            {profileImage ? (
                              <img 
                                src={profileImage} 
                                alt={otherName}
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <span className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400">
                                  {otherName.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">{otherName}</h4>
                              {lastMessage && (
                                <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                                  {new Date(lastMessage.createdAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                              {otherRole}{otherClub ? ` • ${otherClub}` : ''}
                            </p>
                            {lastMessage && (
                              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5 sm:mt-1">
                                {lastMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Window Modal from Messages Tab */}
      {activeChat && (
        <ChatWindow
          conversationId={activeChat.conversationId}
          otherParticipant={activeChat.otherParticipant}
          currentUserId={activeChat.currentUserId}
          currentUserType={activeChat.currentUserType}
          onClose={() => setActiveChat(null)}
        />
      )}

      {/* Video Upload Modal */}
      {showVideoUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('playerProfile.uploadVideo')}</h3>
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
                  {t('playerProfile.videoFile')} *
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
                  {t('playerProfile.title')}
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
                  {t('playerProfile.description')}
                </label>
                <textarea
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  placeholder={`${t('playerProfile.optional')}: ${t('playerProfile.describeVideo')}...`}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowVideoUpload(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-semibold"
                >
                  {t('playerProfile.cancel')}
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
                      {t('playerProfile.videoUploading')}
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      {t('playerProfile.uploadVideo')}
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
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('playerProfile.changeProfilePhoto')}</h3>
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
                label={t('playerProfile.selectNewProfilePhoto')}
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
                  {t('playerProfile.cancel')}
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
                      {t('playerProfile.uploading')}
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      {t('playerProfile.save')}
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
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('playerProfile.changeBackground')}</h3>
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
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('playerProfile.selectColor')}</h4>
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
                          
                          // Save background data as JSON in customColor field
                          const backgroundData = JSON.stringify({
                            backgroundGradient: option.id,
                            customColor: option.style,
                            backgroundImage: '',
                          });
                          
                          await axios.put(`/api/players/${params.id}/background`, {
                            customColor: backgroundData,
                          })
                          
                          // Save to localStorage for persistence
                          try {
                            localStorage.setItem(`profileBackground_player_${params.id}`, JSON.stringify({
                              selectedBg: option.id,
                              customColor: option.style,
                              backgroundImage: ''
                            }));
                          } catch (e) {
                            console.error('Failed to save background to localStorage:', e);
                          }
                        } catch (error) {
                          console.error('Error updating background:', error)
                          toast.error(t('toast.backgroundError'))
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
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">{t('playerProfile.or')}</span>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <ImageUpload
                  label={t('playerProfile.selectNewBackground')}
                  value={newBackgroundImage}
                  onChange={(base64) => setNewBackgroundImage(base64)}
                  aspectRatio="banner"
                  helpText={`${t('playerProfile.recommended')}: 1920x1080 Pixel`}
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
                  {t('playerProfile.cancel')}
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
                      {t('playerProfile.backgroundUpdating')}
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      {t('playerProfile.saveImage')}
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
              position: player.positions[0] ? getPositionLabel(player.positions[0], t) : undefined
            }}
            currentUserId={session.user.id}
            currentUserType={session.user.role as 'PLAYER' | 'RECRUITER'}
            onClose={() => setShowChat(false)}
          />
        </div>
      )}

      {/* CV Export Language Popup */}
      {showCVExportPopup && (
        <CVExportLanguagePopup
          onClose={() => setShowCVExportPopup(false)}
          onExport={handleExportCV}
          userType="player"
        />
      )}

      {/* License Zoom Modal */}
      {zoomedLicense && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setZoomedLicense(null)}
        >
          <button
            onClick={() => setZoomedLicense(null)}
            className="absolute top-4 right-4 text-white hover:text-red-400 bg-black bg-opacity-60 rounded-full p-2 z-50 transition-all duration-300"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div 
            className="relative max-w-4xl max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={zoomedLicense}
              alt="License"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  )
}
