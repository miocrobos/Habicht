"use client";
// Function to get translated league label
const getLeagueLabel = (league: string, t: any) => {
  switch(league) {
    case 'Alle': return t('playerProfile.all');
    case 'NLA': return t('leagues.nla');
    case 'NLB': return t('leagues.nlb');
    case '1. Liga': return t('leagues.firstLeague');
    case '2. Liga': return t('leagues.secondLeague');
    case '3. Liga': return t('leagues.thirdLeague');
    case '4. Liga': return t('leagues.fourthLeague');
    case 'U23': return 'U23';
    case 'U19': return t('leagues.u19');
    case 'U17': return t('leagues.u17');
    default: return league;
  }
};

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast';
// Helper to get position label (fallback to position string)
function getPositionLabel(position: string, t: any) {
  return t(`playerProfile.position${position.charAt(0) + position.slice(1).toLowerCase().replace(/_([a-z])/g, (m, c) => c.toUpperCase())}`) || position;
}

function ErrorBoundary({ error }: { error: any }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">Error loading player profile</h1>
        <p className="text-gray-600 dark:text-gray-400">{error?.message || 'An unexpected error occurred.'}</p>
      </div>
    </div>
  );
}
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, MapPin, Ruler, Award, TrendingUp, Video as VideoIcon, Instagram, Youtube, Music2, ExternalLink, Eye, Edit2, Upload, GraduationCap, Briefcase, Phone, Mail, Trash2, Camera, MessageCircle, FileDown, Bookmark, BookMarked } from 'lucide-react'
import { BackgroundPickerModal } from '@/components/shared/BackgroundPickerModal';
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
import axios from 'axios'


interface PlayerProfileProps {
  params: {
    id: string
  }
}


type ApiPlayerData = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | Date | null;
  gender: string;
  height?: number | null;
  weight?: number | null;
  spikeHeight?: number | null;
  blockHeight?: number | null;
  dominantHand?: string | null;
  preferredLanguage?: string | null;
  nationality: string;
  canton: string;
  city?: string | null;
  municipality?: string | null;
  phone?: string | null;
  positions: string[];
  currentLeague?: string | null;
  bio?: string | null;
  achievements?: string[];
  profileImage?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  youtube?: string | null;
  user: {
    id: string;
    email: string;
    name?: string | null;
    role?: string;
    emailVerified?: string | null;
  };
  currentClub?: {
    id: string;
    name: string;
    logo?: string | null;
    website?: string | null;
    canton?: string | null;
    town?: string | null;
  } | null;
  clubHistory?: Array<{
    id?: string;
    clubName: string;
    league?: string | null;
    startDate: Date | string;
    endDate?: Date | string | null;
    currentClub?: boolean;
    clubCountry?: string;
    club?: {
      id?: string;
      name?: string;
      logo?: string | null;
    };
  }>;
  schoolName?: string | null;
  occupation?: string | null;
  employmentStatus?: string | null;
  views?: number;
  lookingForClub?: boolean;
  showEmail?: boolean;
  showPhone?: boolean;
  backgroundGradient?: string | null;
  coverImage?: string | null;
  skillReceiving?: number;
  skillServing?: number;
  skillAttacking?: number;
  skillBlocking?: number;
  skillDefense?: number;
  swissVolleyLicense?: string | null;
  highlightVideo?: string | null;
  videos?: Array<{
    id: string;
    videoUrl: string;
    thumbnailUrl?: string | null;
    title?: string;
    description?: string;
    createdAt?: string;
  }>;
};
const BACKGROUND_OPTIONS = [
  { id: 'solid-blue', name: 'Blau', style: '#2563eb' },
  { id: 'solid-red', name: 'Rot', style: '#dc2626' },
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
];

// Get default gradient based on gender and role
const getDefaultGradient = (gender: string, role: string) => {
  if (role === 'HYBRID') {
    return 'linear-gradient(135deg, #f97316 0%, #ffffff 100%)'; // Orange to white
  }
  if (role === 'RECRUITER') {
    return 'linear-gradient(135deg, #dc2626 0%, #ffffff 100%)'; // Red to white
  }
  // Player role
  if (gender === 'FEMALE') {
    return 'linear-gradient(135deg, #ec4899 0%, #ffffff 100%)'; // Pink to white
  }
  return 'linear-gradient(135deg, #2563eb 0%, #ffffff 100%)'; // Blue to white for male
};

export default function PlayerProfile({ params }: PlayerProfileProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [player, setPlayer] = useState<ApiPlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [showBgSelector, setShowBgSelector] = useState(false);
  const [selectedBg, setSelectedBg] = useState(BACKGROUND_OPTIONS[0]);
  const [customBgImage, setCustomBgImage] = useState<string | null>(null);
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);
  const [showProfilePhotoModal, setShowProfilePhotoModal] = useState(false);
  const [newProfilePhoto, setNewProfilePhoto] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showBackgroundModal, setShowBackgroundModal] = useState(false);
  const [newBackgroundImage, setNewBackgroundImage] = useState('');
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showCVExportPopup, setShowCVExportPopup] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [savingBg, setSavingBg] = useState<string | null>(null);
  const [showBgModal, setShowBgModal] = useState(false);
  const [selectedBgOption, setSelectedBgOption] = useState<string | null>(null);
  const [customColor, setCustomColor] = useState('#2563eb');
  const [backgroundImage, setBackgroundImage] = useState('');

  const isOwner = session?.user?.playerId === params.id;
  // State declarations moved to top of file, only declare once.

  // Check if player is in watchlist
  useEffect(() => {
    const checkWatchlist = async () => {
      if (session && (session.user.role === 'RECRUITER' || session.user.role === 'HYBRID') && !isOwner) {
        try {
          const response = await axios.get(`/api/watchlist/${params.id}`);
          setIsWatched(response.data.isWatched);
        } catch (err) {
          console.error('Error checking watchlist:', err);
        }
      }
    };
    checkWatchlist();
  }, [session, params.id, isOwner]);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        setLoading(true);
        setError(null);
        const playerResponse = await axios.get(`/api/players/${params.id}`);
        const playerData = playerResponse.data.player;
        if (playerData) {
          setPlayer({
            ...playerData,
            showEmail: playerData.showEmail ?? false,
            showPhone: playerData.showPhone ?? false,
          } as ApiPlayerData);
        } else {
          setError({ message: 'Player not found.' });
        }
        await axios.post(`/api/players/${params.id}/view`);
      } catch (err: any) {
        setError(err);
        console.error('Error fetching player:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayer();
  }, [params.id]);

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
      toast.error(t('playerProfile.selectVideoFile'))
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
      toast.success(t('playerProfile.uploadedVideo'))
    } catch (error: any) {
      console.error('Error uploading video:', error)
      toast.error(t('playerProfile.errorUploadingVideo'))
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
      
      toast.success(t('playerProfile.uploadedVideo'))
    } catch (error) {
      console.error('Error deleting video:', error)
      toast.error(t('playerProfile.errorUploadingVideo'))
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
      toast.error(t('playerProfile.errorStartingChat'))
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
        toast.success(t('watchlist.removedFromWatchlist'))
      } else {
        // Add to watchlist
        await axios.post('/api/watchlist', { playerId: params.id })
        setIsWatched(true)
        toast.success(t('watchlist.addedToWatchlist'))
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error)
      toast.error('Error updating watchlist')
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
      toast.error(t('playerProfile.errorExportingCV'))
    }
  }

  const handleProfilePhotoUpdate = async () => {
    if (!newProfilePhoto) {
      toast.error(t('playerProfile.selectImage'))
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
      toast.success(t('playerProfile.photoUpdated'))
    } catch (error: any) {
      console.error('Error updating profile photo:', error)
      toast.error(t('playerProfile.errorUpdatingPhoto'))
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
      toast.error(t('playerProfile.errorUpdatingBackground'))
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
    );
  }

  if (error) {
    return <ErrorBoundary error={error} />;
  }

  if (!player) {
    return <ErrorBoundary error={{ message: t('playerProfile.playerNotFound') }} />;
  }

  const playerAge = player.dateOfBirth ? new Date().getFullYear() - new Date(player.dateOfBirth).getFullYear() : null
  
  // Format birth date with zero-padding (e.g., 06.03.2006)
  const formatBirthDate = (dateValue: string | Date | null) => {
    if (!dateValue) return null;
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };
  const formattedBirthDate = formatBirthDate(player.dateOfBirth);

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
            {t('playerProfile.changeBackgroundButton')}
          </button>
        )}

        {/* View counter (owner only) */}
        {isOwner && (
          <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2 text-sm z-10">
            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="font-semibold text-gray-900 dark:text-white">{formatViewCount(player.views || 0)}</span>
            <span className="text-gray-600 dark:text-gray-400">{t('playerProfile.profileViews')}</span>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 pb-12 relative z-10">
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 mb-6 relative z-10">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {/* Profile Image */}
            <div className="flex-shrink-0 relative group mx-auto md:mx-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-gray-700 shadow-xl overflow-hidden bg-gray-200 dark:bg-gray-700">
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
                  className="absolute inset-0 w-32 h-32 md:w-40 md:h-40 rounded-full bg-black bg-opacity-0 hover:bg-opacity-60 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 active:opacity-100"
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
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 text-center md:text-left">
                    {player.firstName} {player.lastName}
                  </h1>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3 md:mb-4">
                    {player.positions.map((pos, idx) => (
                      <span key={idx} className="px-2.5 py-1 md:px-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs md:text-sm font-semibold rounded-full">
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
                    {playerAge && formattedBirthDate && (
                      <span className="flex items-center gap-1" title={`${t('playerProfile.bornAbbrev')} ${formattedBirthDate}`}>
                        <Calendar className="w-4 h-4" />
                        {playerAge} {t('playerProfile.yearsOld')} ({t('playerProfile.bornAbbrev')} {formattedBirthDate})
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
                          {player.currentLeague && (
                            <span className="text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full ml-1">
                              {getLeagueLabel(player.currentLeague, t)}
                            </span>
                          )}
                        </Link>
                      )
                    })()}
                  </div>

                  {/* Contact Info */}
                  {(isOwner || player?.showEmail || player?.showPhone) && (
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
                      {t('playerProfile.editProfile')}
                    </Link>
                    
                    <button
                      onClick={() => setShowCVExportPopup(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                      title={t('playerProfile.exportCV')}
                    >
                      <FileDown className="w-4 h-4" />
                      {t('playerProfile.exportCV')}
                    </button>
                  </>
                )}

                {/* Chat Button - Show only to recruiters viewing player profiles */}
                {!isOwner && session && session.user?.role === 'RECRUITER' && player && (
                  <button
                    onClick={handleStartChat}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                    title={t('playerProfile.sendMessage')}
                  >
                    <MessageCircle className="w-4 h-4" />
                    {t('playerProfile.sendMessage')}
                  </button>
                )}

                {/* Watchlist Button - Show to recruiters and hybrids viewing player profiles */}
                {!isOwner && session && (session.user?.role === 'RECRUITER' || session.user?.role === 'HYBRID') && player && (
                  <button
                    onClick={toggleWatchlist}
                    disabled={watchlistLoading}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg transition font-semibold ${
                      isWatched 
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                    } ${watchlistLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={isWatched ? t('watchlist.removeFromWatchlist') : t('watchlist.addToWatchlist')}
                  >
                    {isWatched ? <BookMarked className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    {isWatched ? t('watchlist.removeFromWatchlist') : t('watchlist.addToWatchlist')}
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
          <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            <nav className="flex -mb-px min-w-max">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-red-600 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {t('playerProfile.tabOverview')}
              </button>
              <button
                onClick={() => setActiveTab('karriere')}
                className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  activeTab === 'karriere'
                    ? 'border-red-600 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {t('playerProfile.tabCareer')}
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  activeTab === 'videos'
                    ? 'border-red-600 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {t('playerProfile.tabVideos')}
              </button>
              <button
                onClick={() => setActiveTab('erfolge')}
                className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  activeTab === 'erfolge'
                    ? 'border-red-600 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {t('playerProfile.tabAchievements')}
              </button>
              <button
                onClick={() => setActiveTab('photos')}
                className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  activeTab === 'photos'
                    ? 'border-red-600 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Photos
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Skills Section */}
                {((player.skillReceiving ?? 0) > 0 || (player.skillServing ?? 0) > 0 || (player.skillAttacking ?? 0) > 0 || (player.skillBlocking ?? 0) > 0 || (player.skillDefense ?? 0) > 0) && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      {t('playerProfile.skills')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(player.skillReceiving ?? 0) > 0 && (
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('playerProfile.skillReceiving')}</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{player.skillReceiving}/5</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${((player.skillReceiving ?? 0) / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {(player.skillServing ?? 0) > 0 && (
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('playerProfile.skillServing')}</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{player.skillServing}/5</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                              style={{ width: `${((player.skillServing ?? 0) / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {(player.skillAttacking ?? 0) > 0 && (
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('playerProfile.skillAttacking')}</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{player.skillAttacking}/5</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all"
                              style={{ width: `${((player.skillAttacking ?? 0) / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {(player.skillBlocking ?? 0) > 0 && (
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('playerProfile.skillBlocking')}</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{player.skillBlocking}/5</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all"
                              style={{ width: `${((player.skillBlocking ?? 0) / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {(player.skillDefense ?? 0) > 0 && (
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Verteidige</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{player.skillDefense}/5</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full transition-all"
                              style={{ width: `${((player.skillDefense ?? 0) / 5) * 100}%` }}
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
          </div>
        </div>
      </div>

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
        <BackgroundPickerModal
          onClose={() => {
            setShowBackgroundModal(false);
            setNewBackgroundImage('');
          }}
          onSave={async (bg) => {
            try {
              await axios.put(`/api/players/${params.id}`, {
                playerData: {
                  ...player,
                  backgroundGradient: bg,
                }
              });
              const savedBg = BACKGROUND_OPTIONS.find(option => option.id === String(bg));
              if (savedBg) setSelectedBg(savedBg);
              setShowBackgroundModal(false);
              setNewBackgroundImage('');
            } catch (error) {
              toast.error('Fehler beim Speichern des Hintergrunds');
            }
          }}
          backgroundOptions={BACKGROUND_OPTIONS}
          initialBg={selectedBg}
          initialCustomColor={customColor}
          initialImage={backgroundImage}
          loading={false}
        />
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
    </div>
  )
}
