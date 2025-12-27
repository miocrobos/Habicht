"use client";

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast';
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, MapPin, Ruler, Award, TrendingUp, Video as VideoIcon, Instagram, Youtube, Music2, ExternalLink, Eye, Edit2, Upload, GraduationCap, Briefcase, Phone, Mail, Trash2, Camera, MessageCircle, FileDown, Bookmark, BookMarked } from 'lucide-react'
import { BackgroundPickerModal } from '@/components/shared/BackgroundPickerModal';
import { BACKGROUND_OPTIONS } from '@/components/shared/backgroundOptions';
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

// BACKGROUND_OPTIONS now imported from shared/backgroundOptions.ts

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
          setSelectedBg({ id: 'image', name: 'Custom Image', style: '' });
        } else if (response.data.player.customColor) {
          setSelectedBg({ id: 'custom', name: 'Custom', style: response.data.player.customColor });
          setCustomColor(response.data.player.customColor);
        } else {
          setSelectedBg(BACKGROUND_OPTIONS[0]);
          setCustomColor(BACKGROUND_OPTIONS[0].style);
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
        {/* ...existing code... */}
      </div>

      {/* Profile Card */}
      <div className="max-w-5xl mx-auto px-4 -mt-20 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Sidebar Stats */}
              <div className="flex flex-col gap-4 md:w-1/4">
                {player.height && (
                  <div className="bg-blue-100 text-blue-800 rounded-lg p-3 text-center font-bold">
                    {player.height} <span className="block text-xs font-normal text-blue-600">{t('playerProfile.heightLabel')}</span>
                  </div>
                )}
                {player.weight && (
                  <div className="bg-green-100 text-green-800 rounded-lg p-3 text-center font-bold">
                    {player.weight} <span className="block text-xs font-normal text-green-600">{t('playerProfile.weightLabel')}</span>
                  </div>
                )}
                {player.spikeHeight && (
                  <div className="bg-pink-100 text-pink-800 rounded-lg p-3 text-center font-bold">
                    {player.spikeHeight} <span className="block text-xs font-normal text-pink-600">{t('playerProfile.spikeLabel')}</span>
                  </div>
                )}
                {player.blockHeight && (
                  <div className="bg-purple-100 text-purple-800 rounded-lg p-3 text-center font-bold">
                    {player.blockHeight} <span className="block text-xs font-normal text-purple-600">{t('playerProfile.blockLabel')}</span>
                  </div>
                )}
                {player.dominantHand && (
                  <div className="bg-yellow-100 text-yellow-800 rounded-lg p-3 text-center font-bold">
                    {player.dominantHand === 'RIGHT' ? t('register.rightHanded') : 
                     player.dominantHand === 'LEFT' ? t('register.leftHanded') : 
                     t('register.ambidextrous')}
                    <span className="block text-xs font-normal text-yellow-600">{t('playerProfile.dominantHandLabel')}</span>
                  </div>
                )}
                {player.preferredLanguage && (
                  <div className="bg-red-100 text-red-800 rounded-lg p-3 text-center font-bold">
                    {player.preferredLanguage === 'gsw' ? t('register.languageSwissGerman') :
                     player.preferredLanguage === 'de' ? t('register.languageGerman') :
                     player.preferredLanguage === 'fr' ? t('register.languageFrench') :
                     player.preferredLanguage === 'it' ? t('register.languageItalian') :
                     player.preferredLanguage === 'rm' ? t('register.languageRomansh') :
                     player.preferredLanguage === 'en' ? t('register.languageEnglish') :
                     player.preferredLanguage.toUpperCase()}
                    <span className="block text-xs font-normal text-red-600">{t('playerProfile.preferredLanguageLabel')}</span>
                  </div>
                )}
              </div>

              {/* Main Info */}
              <div className="flex-1">
                {/* ...existing code for profile image, name, positions, bio, contact info, etc... */}
              </div>
            </div>

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

            {/* Club History & Achievements at bottom */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <ClubHistory history={player.clubHistory} />
              {/* Achievements section here if needed */}
              {/* ...existing code for achievements... */}
            </div>

            {/* Action Buttons */}
            {/* ...existing code for action buttons, chat, watchlist, social links... */}
          </div>
        </div>
      </div>
      {/* Background Picker Modal */}
                  {showBackgroundModal && (
                    <BackgroundPickerModal
                      onClose={() => setShowBackgroundModal(false)}
                      onSave={async (bg, image) => {
                        setSelectedBg(bg);
                        setCustomBgImage(image);
                        setBackgroundImage(image || bg.style);
                        // Persist background selection to backend
                        try {
                          setUploadingBackground(true);
                          const currentResponse = await axios.get(`/api/players/${params.id}`);
                          const currentPlayer = currentResponse.data.player;
                          let updateData = { ...currentPlayer };
                          if (bg.id === 'custom') {
                            updateData.customColor = customColor;
                            updateData.coverImage = '';
                          } else if (bg.id === 'image') {
                            updateData.coverImage = image;
                            updateData.customColor = '';
                          } else {
                            updateData.customColor = bg.style;
                            updateData.coverImage = '';
                          }
                          await axios.put(`/api/players/${params.id}`,
                            {
                              playerData: updateData,
                              clubHistory: currentPlayer.clubHistory || [],
                              achievements: currentPlayer.achievements || [],
                            }
                          );
                          toast.success('Background updated!');
                        } catch (err) {
                          toast.error('Error saving background');
                        } finally {
                          setUploadingBackground(false);
                        }
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