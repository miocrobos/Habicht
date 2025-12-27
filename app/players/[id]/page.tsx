"use client";

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast';
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

// Helper function to get translated league label
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

// Helper to get position label
function getPositionLabel(position: string, t: any) {
  return t(`playerProfile.position${position.charAt(0) + position.slice(1).toLowerCase().replace(/_([a-z])/g, (m, c) => c.toUpperCase())}`) || position;
}

// Error Boundary Component
function ErrorBoundary({ error }: { error: any }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error loading player profile</h2>
        <p className="text-gray-600 dark:text-gray-400">{error?.message || 'An unexpected error occurred.'}</p>
      </div>
    </div>
  );
}

// Background options constant (add your actual options here)
const BACKGROUND_OPTIONS = [
  { id: '1', name: 'Default', style: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: '2', name: 'Sunset', style: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: '3', name: 'Ocean', style: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { id: 'custom', name: 'Custom', style: '#667eea' }
];

// Main Player Profile Page Component
export default function PlayerProfilePage(props: any) {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const params = props.params || { id: '' };

  // State declarations
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Background and image states
  const [customBgImage, setCustomBgImage] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [selectedBg, setSelectedBg] = useState(BACKGROUND_OPTIONS[0]);
  const [customColor, setCustomColor] = useState('');
  const [showBackgroundModal, setShowBackgroundModal] = useState(false);
  const [newBackgroundImage, setNewBackgroundImage] = useState('');
  const [uploadingBackground, setUploadingBackground] = useState(false);
  
  // Profile photo states
  const [showProfilePhotoModal, setShowProfilePhotoModal] = useState(false);
  const [newProfilePhoto, setNewProfilePhoto] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Video states
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);
  
  // Chat states
  const [showChat, setShowChat] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  // Watchlist states
  const [isWatched, setIsWatched] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  
  // CV export state
  const [showCVExportPopup, setShowCVExportPopup] = useState(false);

  // Fetch player data
  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/players/${params.id}`);
        setPlayer(response.data.player);
        
        // Set background
        if (response.data.player.coverImage) {
          setBackgroundImage(response.data.player.coverImage);
          setCustomBgImage(response.data.player.coverImage);
        } else if (response.data.player.backgroundGradient) {
          const bg = BACKGROUND_OPTIONS.find(opt => opt.id === response.data.player.backgroundGradient);
          if (bg) setSelectedBg(bg);
        }
        
        // Check ownership
        if (session?.user?.id === response.data.player.userId) {
          setIsOwner(true);
        }
        
        // Check watchlist status
        if (session?.user && (session.user.role === 'RECRUITER' || session.user.role === 'HYBRID')) {
          try {
            const watchlistResponse = await axios.get(`/api/watchlist/check?playerId=${params.id}`);
            setIsWatched(watchlistResponse.data.isWatched);
          } catch (err) {
            console.error('Error checking watchlist:', err);
          }
        }
        
        setLoading(false);
      } catch (err: any) {
        setError(err);
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPlayer();
    }
  }, [params.id, session]);

  // Handler functions
  const handleVideoUpload = async () => {
    if (!videoFile) {
      toast.error(t('playerProfile.selectVideo'));
      return;
    }

    try {
      setUploadingVideo(true);
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('title', videoTitle);
      formData.append('description', videoDescription);
      formData.append('playerId', params.id);

      await axios.post(`/api/videos/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Reload player data
      const playerResponse = await axios.get(`/api/players/${params.id}`);
      setPlayer(playerResponse.data.player);

      // Reset form
      setShowVideoUpload(false);
      setVideoFile(null);
      setVideoTitle('');
      setVideoDescription('');
      toast.success(t('playerProfile.uploadedVideo'));
    } catch (error: any) {
      console.error('Error uploading video:', error);
      toast.error(t('playerProfile.errorUploadingVideo'));
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm(t('playerProfile.confirmDeleteVideo'))) {
      return;
    }

    try {
      setDeletingVideoId(videoId);
      await axios.delete(`/api/videos/${videoId}`);
      
      const playerResponse = await axios.get(`/api/players/${params.id}`);
      setPlayer(playerResponse.data.player);
      toast.success(t('playerProfile.videoDeleted'));
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error(t('playerProfile.errorDeletingVideo'));
    } finally {
      setDeletingVideoId(null);
    }
  };

  const handleStartChat = async () => {
    if (!session?.user || !player) return;

    try {
      const response = await axios.post('/api/chat/conversations', {
        participantId: player.user.id,
        participantType: 'PLAYER'
      });
      setConversationId(response.data.conversationId);
      setShowChat(true);
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error(t('playerProfile.errorStartingChat'));
    }
  };

  const toggleWatchlist = async () => {
    if (!session || watchlistLoading) return;

    try {
      setWatchlistLoading(true);
      if (isWatched) {
        await axios.delete(`/api/watchlist?playerId=${params.id}`);
        setIsWatched(false);
        toast.success(t('watchlist.removedFromWatchlist'));
      } else {
        await axios.post('/api/watchlist', { playerId: params.id });
        setIsWatched(true);
        toast.success(t('watchlist.addedToWatchlist'));
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      toast.error('Error updating watchlist');
    } finally {
      setWatchlistLoading(false);
    }
  };

  const handleExportCV = async (language: string) => {
    if (!player) return;

    try {
      const pdfBlob = await generatePlayerCV(player, language);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      link.download = `${player.firstName}_${player.lastName}_CV_${language.toUpperCase()}_${timestamp}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CV:', error);
      toast.error(t('playerProfile.errorExportingCV'));
    }
  };

  const handleProfilePhotoUpdate = async () => {
    if (!newProfilePhoto) {
      toast.error(t('playerProfile.selectImage'));
      return;
    }

    try {
      setUploadingPhoto(true);
      const currentResponse = await axios.get(`/api/players/${params.id}`);
      const currentPlayer = currentResponse.data.player;

      await axios.put(`/api/players/${params.id}`, {
        playerData: {
          ...currentPlayer,
          profileImage: newProfilePhoto,
        },
        clubHistory: currentPlayer.clubHistory || [],
        achievements: currentPlayer.achievements || [],
      });

      const playerResponse = await axios.get(`/api/players/${params.id}`);
      setPlayer(playerResponse.data.player);
      setShowProfilePhotoModal(false);
      setNewProfilePhoto('');
      toast.success(t('playerProfile.photoUpdated'));
    } catch (error: any) {
      console.error('Error updating profile photo:', error);
      toast.error(t('playerProfile.errorUpdatingPhoto'));
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Format birth date
  const formatBirthDate = (dateValue: string | Date | null) => {
    if (!dateValue) return null;
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('playerProfile.loadingProfile')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return <ErrorBoundary error={error} />;
  }

  // No player found
  if (!player) {
    return <ErrorBoundary error={{ message: 'Player not found' }} />;
  }

  const playerAge = player.dateOfBirth 
    ? new Date().getFullYear() - new Date(player.dateOfBirth).getFullYear() 
    : null;
  const formattedBirthDate = formatBirthDate(player.dateOfBirth);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Custom Background Header */}
      <div 
        className="relative h-64 md:h-80"
        style={
          backgroundImage 
            ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: selectedBg.style }
        }
      >
        {/* Background change button (owner only) */}
        {isOwner && (
          <button
            onClick={() => setShowBackgroundModal(true)}
            className="absolute top-4 right-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition flex items-center gap-2 z-10"
          >
            <Camera className="w-4 h-4" />
            {t('playerProfile.changeBackgroundButton')}
          </button>
        )}

        {/* View counter (owner only) */}
        {isOwner && (
          <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span className="font-semibold">{formatViewCount(player.views || 0)}</span>
            <span className="text-sm">{t('playerProfile.profileViews')}</span>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="max-w-5xl mx-auto px-4 -mt-20 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Profile Image */}
              <div className="relative group">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-xl">
                  {player.profileImage ? (
                    <Image
                      src={player.profileImage}
                      alt={`${player.firstName} ${player.lastName}`}
                      width={160}
                      height={160}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-4xl font-bold">
                      {player.firstName[0]}{player.lastName[0]}
                    </div>
                  )}
                </div>

                {isOwner && (
                  <button
                    onClick={() => setShowProfilePhotoModal(true)}
                    className="absolute inset-0 w-32 h-32 md:w-40 md:h-40 rounded-full bg-black bg-opacity-0 hover:bg-opacity-60 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                    title="Profilbild ändern"
                  >
                    <div className="text-center text-white">
                      <Camera className="w-6 h-6 mx-auto mb-1" />
                      <span className="text-xs">Ändern</span>
                    </div>
                  </button>
                )}
              </div>

              {/* Player Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {player.firstName} {player.lastName}
                </h1>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
                  {player.positions.map((pos: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-semibold">
                      {getPositionLabel(pos, t)}
                    </span>
                  ))}
                  {player.lookingForClub && (
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold">
                      ✓ {t('playerProfile.lookingForClubBadge')}
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-gray-600 dark:text-gray-400">
                  <p className="flex items-center justify-center md:justify-start gap-2">
                    <MapPin className="w-4 h-4" />
                    {player.municipality ? `${player.municipality}, ${player.canton}` : player.canton}
                  </p>
                  {playerAge && formattedBirthDate && (
                    <p className="flex items-center justify-center md:justify-start gap-2">
                      <Calendar className="w-4 h-4" />
                      {playerAge} {t('playerProfile.yearsOld')} ({t('playerProfile.bornAbbrev')} {formattedBirthDate})
                    </p>
                  )}
                  <p className="flex items-center justify-center md:justify-start gap-2">
                    {player.gender === 'MALE' ? '♂' : '♀'} {player.gender === 'MALE' ? t('playerProfile.male') : t('playerProfile.female')}
                  </p>
                  {player.nationality && (
                    <p className="flex items-center justify-center md:justify-start gap-2">
                      🏳 {t('playerProfile.nationality')} {player.nationality}
                    </p>
                  )}
                  {player.currentClub && (() => {
                    const currentClubHistory = player.clubHistory?.find((ch: any) => ch.currentClub === true);
                    return (
                      <p className="flex items-center justify-center md:justify-start gap-2">
                        <ClubBadge 
                          clubName={player.currentClub.name}
                        />
                        {player.currentLeague && (
                          <span className="text-sm">({getLeagueLabel(player.currentLeague, t)})</span>
                        )}
                      </p>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Contact Info */}
            {(isOwner || player?.showEmail || player?.showPhone) && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                {(isOwner || player.showPhone) && player.phone && (
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${player.phone}`} className="text-red-600 hover:underline">
                      {player.phone}
                    </a>
                    {isOwner && !player.showPhone && (
                      <span className="text-xs text-gray-500">🔒</span>
                    )}
                  </div>
                )}
                {(isOwner || player.showEmail) && player.user?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${player.user.email}`} className="text-red-600 hover:underline">
                      {player.user.email}
                    </a>
                    {isOwner && !player.showEmail && (
                      <span className="text-xs text-gray-500">🔒</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              {player.height && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{player.height}</div>
                  <div className="text-sm text-gray-500">{t('playerProfile.heightLabel')}</div>
                </div>
              )}
              {player.weight && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{player.weight}</div>
                  <div className="text-sm text-gray-500">{t('playerProfile.weightLabel')}</div>
                </div>
              )}
              {player.spikeHeight && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{player.spikeHeight}</div>
                  <div className="text-sm text-gray-500">{t('playerProfile.spikeLabel')}</div>
                </div>
              )}
              {player.blockHeight && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{player.blockHeight}</div>
                  <div className="text-sm text-gray-500">{t('playerProfile.blockLabel')}</div>
                </div>
              )}
              {player.dominantHand && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {player.dominantHand === 'RIGHT' ? t('register.rightHanded') : 
                     player.dominantHand === 'LEFT' ? t('register.leftHanded') : 
                     t('register.ambidextrous')}
                  </div>
                  <div className="text-sm text-gray-500">{t('playerProfile.dominantHandLabel')}</div>
                </div>
              )}
              {player.preferredLanguage && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {player.preferredLanguage === 'gsw' ? t('register.languageSwissGerman') :
                     player.preferredLanguage === 'de' ? t('register.languageGerman') :
                     player.preferredLanguage === 'fr' ? t('register.languageFrench') :
                     player.preferredLanguage === 'it' ? t('register.languageItalian') :
                     player.preferredLanguage === 'rm' ? t('register.languageRomansh') :
                     player.preferredLanguage === 'en' ? t('register.languageEnglish') :
                     player.preferredLanguage.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-500">{t('playerProfile.preferredLanguageLabel')}</div>
                </div>
              )}
            </div>

            {/* Bio */}
            {player.bio && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{player.bio}</p>
              </div>
            )}

            {/* Education/Employment Info */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4">
              {player.schoolName && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-red-600" />
                  <span className="text-gray-700 dark:text-gray-300">{player.schoolName}</span>
                </div>
              )}
              {player.occupation && (
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-red-600" />
                  <span className="text-gray-700 dark:text-gray-300">{player.occupation}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              {isOwner && (
                <>
                  <Link
                    href={`/player-profile/${params.id}/edit`}
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

              {/* Chat Button - Show only to recruiters */}
              {!isOwner && session && session.user?.role === 'RECRUITER' && player && (
                <button
                  onClick={handleStartChat}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  <MessageCircle className="w-4 h-4" />
                  {t('playerProfile.sendMessage')}
                </button>
              )}

              {/* Watchlist Button */}
              {!isOwner && session && (session.user?.role === 'RECRUITER' || session.user?.role === 'HYBRID') && player && (
                <button
                  onClick={toggleWatchlist}
                  disabled={watchlistLoading}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition font-semibold ${
                    isWatched 
                      ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  } disabled:opacity-50`}
                >
                  {isWatched ? <BookMarked className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  {isWatched ? t('watchlist.removeFromWatchlist') : t('watchlist.addToWatchlist')}
                </button>
              )}

              {/* Social Media Links */}
              {player.instagram && (
                <a
                  href={player.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition font-semibold"
                >
                  <Instagram className="w-4 h-4" />
                  Instagram
                </a>
              )}
              {player.tiktok && (
                            <a
                              href={player.tiktok}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition font-semibold"
                            >
                              <Music2 className="w-4 h-4" />
                              TikTok
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
            
                  {/* Background Picker Modal */}
                  {showBackgroundModal && (
                    <BackgroundPickerModal
                      onClose={() => setShowBackgroundModal(false)}
                      onSave={async (bg, image) => {
                        // Save logic: update state and optionally persist
                        setSelectedBg(bg);
                        setCustomBgImage(image);
                        setBackgroundImage(image || bg.style);
                      }}
                      backgroundOptions={BACKGROUND_OPTIONS}
                      initialBg={selectedBg}
                      initialCustomColor={customColor}
                      initialImage={customBgImage}
                      loading={uploadingBackground}
                      onSavedBg={(bg, color, image) => {
                        setSelectedBg(bg);
                        setCustomColor(color);
                        setCustomBgImage(image);
                        setBackgroundImage(image || bg.style);
                      }}
                    />
                  )}
            
                  {/* Profile Photo Modal */}
                  {showProfilePhotoModal && (
                    <div>
                      <ImageUpload
                        label={t('playerProfile.changeProfilePhoto')}
                        value={newProfilePhoto}
                        onChange={setNewProfilePhoto}
                      />
                      <div className="flex gap-2 mt-4">
                        <button
                          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                          onClick={() => setShowProfilePhotoModal(false)}
                          disabled={uploadingPhoto}
                        >
                          {t('playerProfile.cancel')}
                        </button>
                        <button
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                          onClick={handleProfilePhotoUpdate}
                          disabled={uploadingPhoto || !newProfilePhoto}
                        >
                          {uploadingPhoto ? t('playerProfile.uploading') : t('playerProfile.save')}
                        </button>
                      </div>
                    </div>
                  )}
            
                  {/* CV Export Popup */}
                  {showCVExportPopup && (
                    <CVExportLanguagePopup
                      onClose={() => setShowCVExportPopup(false)}
                      onExport={handleExportCV}
                      userType="player"
                    />
                  )}
            
                  {/* Chat Window */}
                                {showChat && conversationId && (
                                  <ChatWindow
                                    conversationId={conversationId}
                                    onClose={() => setShowChat(false)}
                                    otherParticipant={player?.user}
                                    currentUserId={session?.user?.id ?? ''}
                                    currentUserType={(session?.user?.role === 'PLAYER' || session?.user?.role === 'RECRUITER') ? session.user.role : 'PLAYER'}
                                  />
                                )}
                </div>
                  );
                }