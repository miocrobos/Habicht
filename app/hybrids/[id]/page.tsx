
"use client";
import { toast } from 'react-hot-toast';
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Trophy, FileText, User, Briefcase, MapPin, Phone, Mail, Award, Globe, Bookmark, BookmarkPlus, Edit2, Loader2, Upload, Eye, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import { generatePlayerCV } from "@/lib/generateCV";
import { BACKGROUND_OPTIONS } from '@/components/shared/backgroundOptions';
import ChatWindow from '@/components/chat/ChatWindow';
import { generateRecruiterCV } from "@/lib/generateRecruiterCV";

// Helper function to get translated league label
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
  };
  const key = leagueMap[league];
  return key ? t(key) : league;
};

// Helper function to get translated position label
const getPositionLabel = (position: string, t: any) => {
  const positionMap: { [key: string]: string } = {
    'OUTSIDE_HITTER': 'playerProfile.positionOutsideHitter',
    'OPPOSITE': 'playerProfile.positionOpposite',
    'MIDDLE_BLOCKER': 'playerProfile.positionMiddleBlocker',
    'SETTER': 'playerProfile.positionSetter',
    'LIBERO': 'playerProfile.positionLibero',
    'UNIVERSAL': 'playerProfile.positionUniversal'
  };
  return t(positionMap[position] || position);
};

// Helper function to translate coach role (handles comma-separated roles)
const getTranslatedCoachRole = (role: string | null | undefined, t: any) => {
  if (!role) return '';
  // Handle comma-separated roles
  const roles = role.split(',').map(r => r.trim());
  return roles.map(r => {
    const roleKey = r.toLowerCase().replace(/ /g, '_') as 'head_coach' | 'assistant_coach' | 'technical_coach' | 'physical_coach' | 'scout' | 'trainer' | 'team_manager';
    const translation = t(`coachRole.${roleKey}`);
    return translation && translation !== `coachRole.${roleKey}` ? translation : r.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  }).join(', ');
};

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth: string | null | undefined): number | null => {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Helper function to format birth date
const formatBirthDate = (dateString: string | null | undefined): string | null => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

export default function HybridProfilePage({ params }: { params: { id: string } }) {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [cvExportType, setCvExportType] = useState<string | null>(null);
  const [cvExportLang, setCvExportLang] = useState<string | null>(null);
  const [showCvTypePopup, setShowCvTypePopup] = useState(false);
  const [showCvLangPopup, setShowCvLangPopup] = useState(false);
  // Check URL param for initial tab - recruiter view from recruiter listing
  const viewParam = searchParams.get('view');
  const [activeTab, setActiveTab] = useState<'player' | 'recruiter' | 'messages'>(viewParam === 'recruiter' ? 'recruiter' : 'player');
  const [exportingCV, setExportingCV] = useState(false);
  const [zoomedLicense, setZoomedLicense] = useState<string | null>(null);
  const [isWatched, setIsWatched] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  
  // Background state
  const [showBackgroundModal, setShowBackgroundModal] = useState(false);
  const [selectedBg, setSelectedBg] = useState(BACKGROUND_OPTIONS[0]);
  const [customBgImage, setCustomBgImage] = useState<string | null>(null);
  const [newBackgroundImage, setNewBackgroundImage] = useState('');
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const backgroundLoadedRef = useRef(false);
  
  // Messages/Chat state
  const [conversations, setConversations] = useState<any[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [activeChat, setActiveChat] = useState<any>(null);

  // Check if the logged-in user owns this profile
  const isOwner = session?.user?.id === params.id;

  // Check if hybrid is in watchlist (using their player profile)
  useEffect(() => {
    const checkWatchlist = async () => {
      if (session && (session.user.role === 'RECRUITER' || session.user.role === 'HYBRID') && !isOwner && profile?.player?.id) {
        try {
          const response = await axios.get(`/api/watchlist/${profile.player.id}`)
          setIsWatched(response.data.isWatched)
        } catch (error) {
          console.error('Error checking watchlist:', error)
        }
      }
    }
    checkWatchlist()
  }, [session, profile?.player?.id, isOwner])

  // Toggle watchlist function
  const toggleWatchlist = async () => {
    if (!session || watchlistLoading || !profile?.player?.id) return

    try {
      setWatchlistLoading(true)
      
      if (isWatched) {
        // Remove from watchlist
        await axios.delete(`/api/watchlist?playerId=${profile.player.id}`)
        setIsWatched(false)
        toast.success(t('watchlist.removedFromWatchlist'))
      } else {
        // Add to watchlist
        await axios.post('/api/watchlist', { playerId: profile.player.id })
        setIsWatched(true)
        toast.success(t('watchlist.addedToWatchlist'))
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error)
      toast.error(t('toast.watchlistError'))
    } finally {
      setWatchlistLoading(false)
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (status === "authenticated") {
      loadHybridProfile();
    }
  }, [status, params?.id]);

  const loadHybridProfile = async () => {
    try {
      const response = await axios.get(`/api/hybrids/${params.id}`);
      const hybrid = response.data.hybrid;
      setProfile(hybrid);
      setLoading(false);
      
      // Load background if it's the owner
      if (!backgroundLoadedRef.current) {
        loadBackground(hybrid);
        backgroundLoadedRef.current = true;
      }
    } catch (err) {
      setError(t("hybridProfile.errorLoadingHybridData"));
      setLoading(false);
    }
  };

  // Load background from localStorage or server
  const loadBackground = (hybrid: any) => {
    try {
      // First try localStorage
      const savedBg = localStorage.getItem(`profileBackground_hybrid_${params.id}`);
      if (savedBg) {
        const parsed = JSON.parse(savedBg);
        if (parsed.backgroundImage) {
          setCustomBgImage(parsed.backgroundImage);
        } else if (parsed.selectedBg) {
          const found = BACKGROUND_OPTIONS.find(bg => bg.id === parsed.selectedBg);
          if (found) setSelectedBg(found);
        }
        return;
      }
      
      // Fall back to server data if available
      if (hybrid?.player?.coverImage) {
        setCustomBgImage(hybrid.player.coverImage);
      } else if (hybrid?.player?.backgroundGradient) {
        const found = BACKGROUND_OPTIONS.find(bg => bg.id === hybrid.player.backgroundGradient);
        if (found) setSelectedBg(found);
      }
    } catch (e) {
      console.error('Error loading background:', e);
    }
  };

  // Fetch conversations when user is owner
  const fetchConversations = async () => {
    if (!isOwner) return;
    try {
      setConversationsLoading(true);
      const response = await axios.get('/api/chat/conversations');
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setConversationsLoading(false);
    }
  };

  // Load conversations when tab is messages and user is owner
  useEffect(() => {
    if (isOwner && activeTab === 'messages') {
      fetchConversations();
    }
  }, [isOwner, activeTab]);

  // Open chat function
  const openChat = (conversation: any) => {
    let otherParticipant;
    
    if (conversation.player && conversation.recruiter) {
      // Check if current user is the player in this conversation
      const currentUserIsPlayer = session?.user?.playerId && conversation.playerId === session?.user?.playerId;
      
      if (currentUserIsPlayer) {
        otherParticipant = {
          id: conversation.recruiter.id,
          name: `${conversation.recruiter.firstName} ${conversation.recruiter.lastName}`,
          type: 'RECRUITER' as const,
          club: conversation.recruiter.club?.name || '',
          profileImage: conversation.recruiter.profileImage || ''
        };
      } else {
        otherParticipant = {
          id: conversation.player.id,
          name: `${conversation.player.firstName} ${conversation.player.lastName}`,
          type: 'PLAYER' as const,
          position: conversation.player.positions?.[0] || '',
          profileImage: conversation.player.profileImage || ''
        };
      }
    } else if (conversation.recruiter && conversation.secondRecruiter) {
      const currentRecruiterId = session?.user?.recruiterId;
      const isFirstRecruiter = conversation.recruiterId === currentRecruiterId;
      const other = isFirstRecruiter ? conversation.secondRecruiter : conversation.recruiter;
      otherParticipant = {
        id: other.id,
        name: `${other.firstName} ${other.lastName}`,
        type: 'RECRUITER' as const,
        club: other.club?.name || '',
        profileImage: other.profileImage || ''
      };
    }
    
    if (otherParticipant) {
      setActiveChat({
        conversationId: conversation.id,
        otherParticipant,
        currentUserId: session?.user?.id || '',
        currentUserType: 'HYBRID' as const
      });
    }
  };

  const handleCvExport = () => {
    setShowCvTypePopup(true);
  };

  const handleCvTypeSelect = (type: string) => {
    setCvExportType(type);
    setShowCvTypePopup(false);
    setShowCvLangPopup(true);
  };

  const handleCvLangSelect = async (lang: string) => {
    setCvExportLang(lang);
    setShowCvLangPopup(false);
    setExportingCV(true);
    
    try {
      if (cvExportType === 'player' && profile.player) {
        // Export player CV
        const playerCVData = {
          firstName: profile.player.firstName,
          lastName: profile.player.lastName,
          dateOfBirth: profile.player.dateOfBirth,
          gender: profile.player.gender,
          nationality: profile.player.nationality,
          canton: profile.player.canton,
          city: profile.player.city,
          height: profile.player.height,
          weight: profile.player.weight,
          spikeHeight: profile.player.spikeHeight,
          blockHeight: profile.player.blockHeight,
          dominantHand: profile.player.dominantHand,
          positions: profile.player.positions || [],
          currentLeagues: profile.player.currentLeagues || [],
          bio: profile.player.bio,
          phone: profile.player.phone,
          instagram: profile.player.instagram,
          profileImage: profile.player.profileImage,
          clubHistory: profile.player.clubHistory || [],
          achievements: profile.player.achievements || [],
          user: { email: profile.user?.email },
        };
        
        const pdfBlob = await generatePlayerCV(playerCVData, lang);
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        link.download = `${profile.player.firstName}_${profile.player.lastName}_Player_CV_${lang.toUpperCase()}_${timestamp}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(t('hybridProfile.cvExportSuccess') || 'CV exported successfully');
      } else if (cvExportType === 'recruiter' && profile.recruiter) {
        // Export recruiter CV
        const recruiterCVData = {
          firstName: profile.recruiter.firstName,
          lastName: profile.recruiter.lastName,
          organization: profile.recruiter.organization,
          coachRole: profile.recruiter.coachRole,
          city: profile.recruiter.city,
          canton: profile.recruiter.canton,
          bio: profile.recruiter.bio,
          phone: profile.recruiter.phone,
          website: profile.recruiter.website,
          positionsLookingFor: profile.recruiter.positionsLookingFor || [],
          genderCoached: profile.recruiter.genderCoached || [],
          achievements: profile.recruiter.achievements || [],
          profileImage: profile.recruiter.profileImage,
          instagram: profile.recruiter.instagram,
          user: { email: profile.user?.email || '' },
          club: profile.recruiter.club,
          clubHistory: profile.recruiter.clubHistory || [],
          age: 0,
          nationality: '',
          preferredLanguage: null,
          province: null,
          position: profile.recruiter.coachRole || '',
          tiktok: profile.recruiter.tiktok,
          youtube: profile.recruiter.youtube,
          facebook: profile.recruiter.facebook,
        };
        
        const pdfBlob = await generateRecruiterCV(recruiterCVData, lang);
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        link.download = `${profile.recruiter.firstName}_${profile.recruiter.lastName}_Recruiter_CV_${lang.toUpperCase()}_${timestamp}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(t('hybridProfile.cvExportSuccess') || 'CV exported successfully');
      }
    } catch (error) {
      console.error('Error exporting CV:', error);
      toast.error(t('hybridProfile.cvExportError') || 'Error exporting CV');
    } finally {
      setExportingCV(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('hybridProfile.loadingProfile') || 'Loading profile...'}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-orange-600 dark:text-orange-400 text-lg">{t('hybridProfile.hybridNotFound') || 'Hybrid not found'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Dynamic Background Header */}
      <div 
        className="h-36 sm:h-48 md:h-56 lg:h-64 relative"
        style={
          customBgImage
            ? {
                backgroundImage: `url(${customBgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }
            : {
                background: selectedBg.style
              }
        }
      >
        {/* Background change button (owner only) */}
        {isOwner && (
          <button
            onClick={() => setShowBackgroundModal(true)}
            className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-lg hover:shadow-xl transition flex items-center gap-1 sm:gap-2 z-10 text-xs sm:text-sm"
          >
            <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">{t('playerProfile.changeBackgroundButton') || 'Change background'}</span>
            <span className="xs:hidden">{t('common.change') || 'Change'}</span>
          </button>
        )}
      </div>

      {/* Profile Header */}
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-10">
        {error && (
          <div className="mb-3 sm:mb-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-800 dark:text-red-200 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm">
            {t(error)}
          </div>
        )}

        {/* UNIFIED PROFILE HEADER - Shared info for both player & recruiter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 sm:p-6 mb-4 sm:mb-6 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-3 md:gap-6">
            {/* Profile Image */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full border-4 border-orange-500 dark:border-orange-400 shadow-xl overflow-hidden bg-gray-200 dark:bg-gray-700">
                {(profile.profileImage || profile.player?.profileImage || profile.recruiter?.profileImage) ? (
                  <Image
                    src={profile.profileImage || profile.player?.profileImage || profile.recruiter?.profileImage}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    width={160}
                    height={160}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-br from-orange-600 to-orange-800">
                    {profile.firstName?.[0]}{profile.lastName?.[0]}
                  </div>
                )}
              </div>
            </div>

            {/* Shared Info Section */}
            <div className="flex-grow text-center md:text-left">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                {profile.firstName} {profile.lastName}
              </h2>
              
              {/* Hybrid Badge */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs sm:text-sm font-semibold rounded-full flex items-center gap-1">
                  <User className="w-3 h-3 sm:w-4 sm:h-4" /> + <Briefcase className="w-3 h-3 sm:w-4 sm:h-4" /> Hybrid
                </span>
                {profile.player?.lookingForClub && (
                  <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-[10px] sm:text-xs md:text-sm font-semibold rounded-full flex items-center gap-1">
                    ✓ <span className="hidden xs:inline">{t('playerProfile.lookingForClubBadge') || 'Sucht Club'}</span><span className="xs:hidden">{t('playerProfile.lookingShort') || 'Club'}</span>
                  </span>
                )}
                {profile.recruiter?.lookingForMembers && (
                  <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] sm:text-xs md:text-sm font-semibold rounded-full flex items-center gap-1">
                    ✓ <span className="hidden xs:inline">{t('recruiterProfile.lookingForMembers') || 'Sucht Spieler'}</span><span className="xs:hidden">{t('recruiterProfile.lookingShort') || 'Spieler'}</span>
                  </span>
                )}
              </div>
              
              {/* Location, Age, Nationality */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
                {(profile.player?.municipality || profile.player?.canton || profile.recruiter?.canton) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    {profile.player?.municipality ? `${profile.player.municipality}, ${profile.player.canton}` : 
                     profile.player?.city ? `${profile.player.city}, ${profile.player.canton}` : 
                     profile.recruiter?.province ? `${profile.recruiter.province}, ${profile.recruiter.canton}` :
                     profile.player?.canton || profile.recruiter?.canton}
                  </span>
                )}
                {profile.player?.dateOfBirth && (
                  <span className="flex items-center gap-1">
                    {calculateAge(profile.player.dateOfBirth)} {t('playerProfile.yearsOld') || 'Jahre'}
                  </span>
                )}
                {(profile.player?.nationality || profile.recruiter?.nationality) && (
                  <span>🏳 {profile.player?.nationality || profile.recruiter?.nationality}</span>
                )}
              </div>
              
              {/* Contact Info */}
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-center md:justify-start text-[10px] sm:text-xs md:text-sm mb-3 sm:mb-4">
                {(profile.player?.phone || profile.recruiter?.phone) && (
                  <a href={`tel:${profile.player?.phone || profile.recruiter?.phone}`} className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-purple-600">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{profile.player?.phone || profile.recruiter?.phone}</span>
                  </a>
                )}
                {profile.user?.email && (
                  <a href={`mailto:${profile.user.email}`} className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-purple-600">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="truncate max-w-[120px] sm:max-w-none">{profile.user.email}</span>
                  </a>
                )}
              </div>

              {/* Edit Buttons */}
              {isOwner && (
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <Link 
                    href={`/hybrids/${params.id}/edit`}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-semibold"
                  >
                    <Edit2 className="w-4 h-4" />
                    {t('hybridProfile.editProfile') || 'Profil bearbeiten'}
                  </Link>
                </div>
              )}

              {/* Watchlist Button - Show to recruiters and hybrids viewing other hybrid profiles */}
              {!isOwner && session && (session.user?.role === 'RECRUITER' || session.user?.role === 'HYBRID') && profile?.player && (
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                  <button
                    onClick={toggleWatchlist}
                    disabled={watchlistLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm font-semibold ${
                      isWatched 
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                    } ${watchlistLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={isWatched ? t('watchlist.removeFromWatchlist') : t('watchlist.addToWatchlist')}
                  >
                    {isWatched ? <BookmarkPlus className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    {isWatched ? t('watchlist.removeFromWatchlist') : t('watchlist.addToWatchlist')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Tabs - Player / Recruiter role-specific info */}
        <div className="mb-4 sm:mb-6">
          <div className="flex gap-1 sm:gap-2 bg-white dark:bg-gray-800 rounded-xl p-1.5 sm:p-2 shadow-lg border border-gray-100 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('player')}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 rounded-lg font-semibold transition text-xs sm:text-sm md:text-base ${
                activeTab === 'player'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">{t('hybridProfile.playerSection') || 'Spieler Profil'}</span>
              <span className="sm:hidden">{t('hybridProfile.playerShort') || 'Spieler'}</span>
            </button>
            <button
              onClick={() => setActiveTab('recruiter')}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 rounded-lg font-semibold transition text-xs sm:text-sm md:text-base ${
                activeTab === 'recruiter'
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">{t('hybridProfile.recruiterSection') || 'Rekrutierer Profil'}</span>
              <span className="sm:hidden">{t('hybridProfile.recruiterShort') || 'Trainer'}</span>
            </button>
            {/* Messages Tab - Only visible to owner */}
            {isOwner && (
              <button
                onClick={() => setActiveTab('messages')}
                className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 rounded-lg font-semibold transition text-xs sm:text-sm md:text-base ${
                  activeTab === 'messages'
                    ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{t('settings.messages.title') || 'Messages'}</span>
                <span className="sm:hidden">{t('hybridProfile.chatShort') || 'Chat'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Player Tab Content - Role-specific info only */}
        {activeTab === 'player' && profile.player && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 sm:p-6 mb-4 sm:mb-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              {t('hybridProfile.playerDetails') || 'Spieler Details'}
            </h3>
            
            {/* Positions */}
            {profile.player.positions && profile.player.positions.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('playerProfile.positions') || 'Positionen'}</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.player.positions.map((pos: string, idx: number) => (
                    <span key={idx} className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-semibold rounded-full">
                      {getPositionLabel(pos, t)}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Current Club and League */}
            {(profile.player.currentClub || (profile.player.currentLeagues && profile.player.currentLeagues.length > 0)) && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('playerProfile.currentClub') || 'Aktueller Club'}</h4>
                <div className="flex flex-wrap items-center gap-2">
                  {profile.player.currentClub && (
                    <Link 
                      href={`/clubs/${profile.player.currentClub.id}`}
                      className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                    >
                      {profile.player.currentClub.logo && (
                        <Image src={profile.player.currentClub.logo} alt={profile.player.currentClub.name} width={20} height={20} className="w-5 h-5 rounded object-contain bg-white" />
                      )}
                      <span className="font-medium">{profile.player.currentClub.name}</span>
                    </Link>
                  )}
                  {profile.player.currentLeagues && profile.player.currentLeagues.length > 0 && (
                    <span className="px-2.5 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-semibold rounded-full flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5" />
                      {profile.player.currentLeagues.map((league: string) => getLeagueLabel(league, t)).join(', ')}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Physical Stats */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('playerProfile.physicalStats') || 'Körperliche Daten'}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {profile.player.height && (
                  <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg text-center border border-gray-200 dark:border-gray-600">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{profile.player.height}</div>
                    <div className="text-[10px] text-gray-600 dark:text-gray-400">{t('playerProfile.heightLabel') || 'Grösse'}</div>
                  </div>
                )}
                {profile.player.weight && (
                  <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg text-center border border-gray-200 dark:border-gray-600">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">{profile.player.weight}</div>
                    <div className="text-[10px] text-gray-600 dark:text-gray-400">{t('playerProfile.weightLabel') || 'Gewicht'}</div>
                  </div>
                )}
                {profile.player.spikeHeight && (
                  <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg text-center border border-gray-200 dark:border-gray-600">
                    <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{profile.player.spikeHeight}</div>
                    <div className="text-[10px] text-gray-600 dark:text-gray-400">{t('playerProfile.spikeLabel') || 'Angriff'}</div>
                  </div>
                )}
                {profile.player.blockHeight && (
                  <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg text-center border border-gray-200 dark:border-gray-600">
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{profile.player.blockHeight}</div>
                    <div className="text-[10px] text-gray-600 dark:text-gray-400">{t('playerProfile.blockLabel') || 'Block'}</div>
                  </div>
                )}
                {profile.player.dominantHand && (
                  <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg text-center border border-gray-200 dark:border-gray-600">
                    <div className="text-sm font-bold text-red-600 dark:text-red-400">
                      {profile.player.dominantHand === 'RIGHT' ? t('register.rightHanded') || 'Rechts' : 
                       profile.player.dominantHand === 'LEFT' ? t('register.leftHanded') || 'Links' : 
                       t('register.ambidextrous') || 'Beidhand.'}
                    </div>
                    <div className="text-[10px] text-gray-600 dark:text-gray-400">{t('playerProfile.dominantHandLabel') || 'Hand'}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.player.bio && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('playerProfile.bio') || 'Bio'}</h4>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap text-sm">{profile.player.bio}</p>
              </div>
            )}

            {/* Achievements */}
            {profile.player.achievements && profile.player.achievements.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-500" />
                  {t('playerProfile.achievements') || 'Erfolge'}
                </h4>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1 text-sm">
                  {profile.player.achievements.map((achievement: string, idx: number) => (
                    <li key={idx}>{achievement}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* View Full Profile Link */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link 
                href={`/players/${profile.player.id}`}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium inline-flex items-center gap-1 text-sm"
              >
                {t('hybridProfile.viewFullPlayerProfile') || 'Vollständiges Spieler-Profil anzeigen →'}
              </Link>
            </div>
          </div>
        )}

        {/* Recruiter Tab Content - Role-specific info only */}
        {activeTab === 'recruiter' && profile.recruiter && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mb-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-green-600" />
              {t('hybridProfile.recruiterDetails') || 'Rekrutierer Details'}
            </h3>
            
            {/* Role Badge */}
            <div className="mb-4">
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-semibold rounded-full">
                {getTranslatedCoachRole(profile.recruiter.coachRole, t) || t('common.recruiter') || 'Recruiter'}
              </span>
            </div>
            
            {/* Club Affiliation */}
            {profile.recruiter.club && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('recruiterProfile.club') || 'Club'}</h4>
                <Link 
                  href={`/clubs/${profile.recruiter.club.id}`}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition"
                >
                  {profile.recruiter.club.logo && (
                    <Image src={profile.recruiter.club.logo} alt={profile.recruiter.club.name} width={24} height={24} className="w-6 h-6 rounded object-contain bg-white" />
                  )}
                  <span className="font-medium">{profile.recruiter.club.name}</span>
                </Link>
              </div>
            )}

            {/* Club Affiliations with Leagues */}
            {profile.recruiter.clubHistory && profile.recruiter.clubHistory.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('hybridProfile.clubAffiliations') || t('recruiterProfile.clubAffiliations') || 'Club Affiliations'}</h4>
                <div className="space-y-2">
                  {profile.recruiter.clubHistory.map((club: any, idx: number) => (
                    <div key={idx} className="flex flex-wrap items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {club.club?.id ? (
                        <Link 
                          href={`/clubs/${club.club.id}`}
                          className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition"
                        >
                          {(club.club?.logo || club.clubLogo) && (
                            <Image src={club.club?.logo || club.clubLogo} alt={club.clubName || club.club?.name} width={20} height={20} className="w-5 h-5 rounded object-contain bg-white" />
                          )}
                          <span className="font-medium">{club.clubName || club.club?.name}</span>
                        </Link>
                      ) : (
                        <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          {club.clubLogo && (
                            <Image src={club.clubLogo} alt={club.clubName} width={20} height={20} className="w-5 h-5 rounded object-contain bg-white" />
                          )}
                          <span className="font-medium">{club.clubName}</span>
                        </span>
                      )}
                      {club.currentClub && (
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
                          {t('playerProfile.currentClubBadge') || 'Current'}
                        </span>
                      )}
                      {club.leagues && club.leagues.length > 0 && (
                        <span className="px-2.5 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-semibold rounded-full flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5" />
                          {club.leagues.map((league: string) => getLeagueLabel(league, t)).join(', ')}
                        </span>
                      )}
                      {club.role && club.role.length > 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({club.role.map((r: string) => {
                            const roleKey = r.toLowerCase() as 'head_coach' | 'assistant_coach' | 'technical_coach' | 'physical_coach' | 'scout' | 'trainer' | 'team_manager';
                            const translation = t(`coachRole.${roleKey}`);
                            return translation === `coachRole.${roleKey}` ? r.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : translation;
                          }).join(', ')})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recruiting Preferences Stats */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('recruiterProfile.recruitingPreferences') || 'Rekrutierungs-Präferenzen'}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {profile.recruiter.genderCoached && profile.recruiter.genderCoached.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg text-center border border-gray-200 dark:border-gray-600">
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {profile.recruiter.genderCoached.map((g: string) => g === 'MALE' ? '♂' : '♀').join(' ')}
                    </div>
                    <div className="text-[10px] text-gray-600 dark:text-gray-400">{t('recruiterProfile.genderLabel') || 'Geschlecht'}</div>
                  </div>
                )}
                {profile.recruiter.preferredLanguage && (
                  <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg text-center border border-gray-200 dark:border-gray-600">
                    <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {profile.recruiter.preferredLanguage === 'gsw' ? 'CH-DE' :
                       profile.recruiter.preferredLanguage === 'de' ? 'DE' :
                       profile.recruiter.preferredLanguage === 'fr' ? 'FR' :
                       profile.recruiter.preferredLanguage === 'it' ? 'IT' :
                       profile.recruiter.preferredLanguage === 'en' ? 'EN' :
                       profile.recruiter.preferredLanguage.toUpperCase()}
                    </div>
                    <div className="text-[10px] text-gray-600 dark:text-gray-400">{t('playerProfile.languageLabel') || 'Sprache'}</div>
                  </div>
                )}
                {profile.recruiter.positionsLookingFor && profile.recruiter.positionsLookingFor.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg text-center border border-gray-200 dark:border-gray-600">
                    <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{profile.recruiter.positionsLookingFor.length}</div>
                    <div className="text-[10px] text-gray-600 dark:text-gray-400">{t('recruiterProfile.positionsCount') || 'Positionen'}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Positions Looking For */}
            {profile.recruiter.positionsLookingFor && profile.recruiter.positionsLookingFor.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('recruiterProfile.positionsLookingFor') || 'Gesuchte Positionen'}</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.recruiter.positionsLookingFor.map((pos: string, idx: number) => (
                    <span key={idx} className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs sm:text-sm font-semibold rounded-full">
                      {getPositionLabel(pos, t)}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Bio */}
            {profile.recruiter.bio && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('recruiterProfile.bio') || 'Bio'}</h4>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap text-sm">{profile.recruiter.bio}</p>
              </div>
            )}

            {/* Achievements */}
            {profile.recruiter.achievements && profile.recruiter.achievements.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-500" />
                  {t('recruiterProfile.achievements') || 'Erfolge'}
                </h4>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1 text-sm">
                  {profile.recruiter.achievements.map((achievement: string, idx: number) => (
                    <li key={idx}>{achievement}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* View Full Profile Link */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link 
                href={`/recruiters/${profile.recruiter.id}`}
                className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium inline-flex items-center gap-1 text-sm"
              >
                {t('hybridProfile.viewFullRecruiterProfile') || 'Vollständiges Rekrutierer-Profil anzeigen →'}
              </Link>
            </div>
          </div>
        )}

        {/* Messages Tab Content - Only visible to owner */}
        {activeTab === 'messages' && isOwner && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mb-6 border border-gray-100 dark:border-gray-700">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                {t('settings.messages.title') || 'Messages'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('settings.messages.subtitle') || 'Your conversations with other users'}
              </p>
            </div>
            
            {conversationsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {t('settings.messages.empty') || 'No conversations yet'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {t('settings.messages.emptyDescription') || 'Start a conversation by messaging a player or recruiter'}
                </p>
                <Link
                  href="/players"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
                >
                  {t('settings.messages.browsePlayers') || 'Browse Players'}
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {conversations.map((conversation) => {
                  // Determine other participant
                  let otherName = '';
                  let otherRole = '';
                  let otherClub = '';
                  let profileLink = '';
                  let profileImage = '';
                  
                  if (conversation.player && conversation.recruiter) {
                    const currentUserIsPlayer = session?.user?.playerId && conversation.playerId === session?.user?.playerId;
                    if (currentUserIsPlayer) {
                      otherName = `${conversation.recruiter.firstName} ${conversation.recruiter.lastName}`;
                      otherRole = getTranslatedCoachRole(conversation.recruiter.coachRole, t) || t('common.recruiter') || 'Recruiter';
                      otherClub = conversation.recruiter.club?.name || '';
                      profileLink = `/recruiters/${conversation.recruiter.id}`;
                      profileImage = conversation.recruiter.profileImage || '';
                    } else {
                      otherName = `${conversation.player.firstName} ${conversation.player.lastName}`;
                      otherRole = conversation.player.positions?.[0] || t('common.player') || 'Player';
                      otherClub = conversation.player.currentClub?.name || '';
                      profileLink = `/players/${conversation.player.id}`;
                      profileImage = conversation.player.profileImage || '';
                    }
                  } else if (conversation.recruiter && conversation.secondRecruiter) {
                    const currentRecruiterId = session?.user?.recruiterId;
                    const isFirst = conversation.recruiterId === currentRecruiterId;
                    const other = isFirst ? conversation.secondRecruiter : conversation.recruiter;
                    otherName = `${other.firstName} ${other.lastName}`;
                    otherRole = getTranslatedCoachRole(other.coachRole, t) || t('common.recruiter') || 'Recruiter';
                    otherClub = other.club?.name || '';
                    profileLink = `/recruiters/${other.id}`;
                    profileImage = other.profileImage || '';
                  }
                  
                  const lastMessage = conversation.messages?.[0];
                  
                  return (
                    <div
                      key={conversation.id}
                      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition cursor-pointer active:bg-gray-100 dark:active:bg-gray-600/50"
                      onClick={() => openChat(conversation)}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {profileImage ? (
                          <img 
                            src={profileImage} 
                            alt={otherName}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                            <span className="text-base sm:text-lg font-bold text-orange-600 dark:text-orange-400">
                              {otherName.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Conversation Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                            {otherName}
                          </h4>
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
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Chat Window Modal */}
        {activeChat && (
          <ChatWindow
            conversationId={activeChat.conversationId}
            otherParticipant={activeChat.otherParticipant}
            currentUserId={activeChat.currentUserId}
            currentUserType={activeChat.currentUserType}
            onClose={() => setActiveChat(null)}
          />
        )}

        {/* Documents/Media Section - Visible to owner always, or to others if showLicense is true and documents exist */}
        {(isOwner || ((profile.player?.showLicense && profile.player?.swissVolleyLicense) || (profile.recruiter?.showLicense && profile.recruiter?.coachingLicense))) && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Award className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </span>
              {t('hybridProfile.licenses') || 'Licenses & Credentials'}
              {isOwner && !profile.player?.showLicense && (
                <span className="ml-2 text-xs text-gray-400 flex items-center gap-1" title="Only visible to you">
                  🔒 {t('common.privateToYou') || 'Private'}
                </span>
              )}
            </h2>
            {isOwner && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {t('hybridProfile.mediaDesc') || 'Your uploaded licenses and documents.'} 
                <Link href="/settings" className="text-orange-600 hover:underline ml-1">
                  {t('hybridProfile.changeVisibility') || 'Change visibility in settings'}
                </Link>
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.recruiter?.coachingLicense && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm flex items-center gap-2">
                      <Award className="w-4 h-4 text-green-600" />
                      {t('hybridProfile.coachingLicenseDoc') || 'Coaching License'}
                    </h4>
                  </div>
                  <div className="p-2">
                    {/* Check for image: data URI, file extension, or cloudinary URL */}
                    {profile.recruiter.coachingLicense.startsWith('data:image') || 
                     profile.recruiter.coachingLicense.match(/\.(jpg|jpeg|png|gif|webp)($|\?)/i) ||
                     profile.recruiter.coachingLicense.includes('cloudinary.com') ||
                     profile.recruiter.coachingLicense.includes('res.cloudinary') ? (
                      <div 
                        onClick={() => setZoomedLicense(profile.recruiter.coachingLicense)}
                        className="block cursor-pointer"
                      >
                        <img 
                          src={profile.recruiter.coachingLicense} 
                          alt="Coaching License" 
                          className="w-full h-48 object-contain rounded cursor-pointer hover:opacity-90 transition bg-gray-100 dark:bg-gray-700"
                        />
                        <div className="text-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {t('common.clickToZoom') || 'Click to zoom'}
                        </div>
                      </div>
                    ) : profile.recruiter.coachingLicense.match(/\.pdf($|\?)/i) ? (
                      <a 
                        href={profile.recruiter.coachingLicense} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center h-48 bg-gray-100 dark:bg-gray-700 rounded text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition"
                      >
                        <div className="text-center">
                          <FileText className="w-12 h-12 mx-auto mb-2" />
                          <span className="text-sm font-medium">{t('hybridProfile.viewDocument') || 'View Document'}</span>
                        </div>
                      </a>
                    ) : (
                      <div className="flex items-center justify-center h-48 bg-gray-100 dark:bg-gray-700 rounded">
                        <p className="text-gray-500 dark:text-gray-400 text-center">
                          {t('hybridProfile.noPhotosYet') || 'No photos yet'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {profile.player?.swissVolleyLicense && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm flex items-center gap-2">
                      <Award className="w-4 h-4 text-blue-600" />
                      {t('hybridProfile.playerLicenseDoc') || 'Player License'}
                    </h4>
                  </div>
                  <div className="p-2">
                    {/* Check for image: data URI, file extension, or cloudinary URL */}
                    {profile.player.swissVolleyLicense.startsWith('data:image') || 
                     profile.player.swissVolleyLicense.match(/\.(jpg|jpeg|png|gif|webp)($|\?)/i) ||
                     profile.player.swissVolleyLicense.includes('cloudinary.com') ||
                     profile.player.swissVolleyLicense.includes('res.cloudinary') ? (
                      <div 
                        onClick={() => setZoomedLicense(profile.player.swissVolleyLicense)}
                        className="block cursor-pointer"
                      >
                        <img 
                          src={profile.player.swissVolleyLicense} 
                          alt="Player License" 
                          className="w-full h-48 object-contain rounded cursor-pointer hover:opacity-90 transition bg-gray-100 dark:bg-gray-700"
                        />
                        <div className="text-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {t('common.clickToZoom') || 'Click to zoom'}
                        </div>
                      </div>
                    ) : profile.player.swissVolleyLicense.match(/\.pdf($|\?)/i) ? (
                      <a 
                        href={profile.player.swissVolleyLicense} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center h-48 bg-gray-100 dark:bg-gray-700 rounded text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition"
                      >
                        <div className="text-center">
                          <FileText className="w-12 h-12 mx-auto mb-2" />
                          <span className="text-sm font-medium">{t('hybridProfile.viewDocument') || 'View Document'}</span>
                        </div>
                      </a>
                    ) : (
                      <div className="flex items-center justify-center h-48 bg-gray-100 dark:bg-gray-700 rounded">
                        <p className="text-gray-500 dark:text-gray-400 text-center">
                          {t('hybridProfile.noPhotosYet') || 'No photos yet'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Upload prompt when no licenses exist for owner */}
              {isOwner && !profile.player?.swissVolleyLicense && !profile.recruiter?.coachingLicense && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {t('hybridProfile.noDocumentsUploaded') || 'No documents uploaded yet.'}
                  </p>
                  <Link
                    href={`/hybrids/${profile.user.id}/edit`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t('hybridProfile.uploadLicense') || 'Upload Licenses'}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CV Export Section - Only visible to owner */}
        {isOwner && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <FileText className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </span>
              {t('hybridProfile.exportCV') || 'CV Export'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('hybridProfile.cvExportDescription') || 'Als Hybrid kannst du sowohl einen Spieler-CV als auch einen Rekrutierer-CV exportieren.'}
            </p>
            <button
              type="button"
              className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 font-semibold disabled:opacity-50 shadow-md transition flex items-center gap-2"
              onClick={handleCvExport}
              disabled={exportingCV}
            >
              {exportingCV ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
              {t('hybridProfile.exportCV') || 'Lebenslauf Exportieren'}
            </button>
            {/* CV Type Popup */}
            {showCvTypePopup && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                    {t('hybridProfile.selectCvType') || 'CV Typ Wählen'}
                  </h3>
                  <div className="flex flex-col gap-3">
                    <button 
                      className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition shadow-md" 
                      onClick={() => handleCvTypeSelect("player")}
                    >
                      <User className="w-5 h-5" />
                      <span className="font-semibold">{t('hybridProfile.playerCV') || 'Spieler CV'}</span>
                    </button>
                    <button 
                      className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition shadow-md" 
                      onClick={() => handleCvTypeSelect("recruiter")}
                    >
                      <Briefcase className="w-5 h-5" />
                      <span className="font-semibold">{t('hybridProfile.recruiterCV') || 'Rekrutierer CV'}</span>
                    </button>
                    <button className="mt-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" onClick={() => setShowCvTypePopup(false)}>
                      {t('common.cancel') || 'Abbrechen'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* CV Language Popup */}
            {showCvLangPopup && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                    {t('hybridProfile.selectLanguage') || 'Sprache Wählen'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 shadow-md transition" onClick={() => handleCvLangSelect("de")}>Deutsch</button>
                    <button className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 shadow-md transition" onClick={() => handleCvLangSelect("en")}>English</button>
                    <button className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 shadow-md transition" onClick={() => handleCvLangSelect("fr")}>Français</button>
                    <button className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 shadow-md transition" onClick={() => handleCvLangSelect("it")}>Italiano</button>
                  </div>
                  <button className="mt-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" onClick={() => setShowCvLangPopup(false)}>
                    {t('common.cancel') || 'Abbrechen'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

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

      {/* Background Image Modal */}
      {showBackgroundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('playerProfile.changeBackground') || 'Change Background'}</h3>
              <button
                onClick={() => {
                  setShowBackgroundModal(false);
                  setNewBackgroundImage('');
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
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('playerProfile.selectColor') || 'Select Color'}</h4>
                <div className="grid grid-cols-4 gap-3">
                  {BACKGROUND_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={async () => {
                        try {
                          // Update UI immediately
                          setSelectedBg(option);
                          setCustomBgImage(null);
                          setShowBackgroundModal(false);
                          
                          // Save to localStorage
                          localStorage.setItem(`profileBackground_hybrid_${params.id}`, JSON.stringify({
                            selectedBg: option.id,
                            customColor: option.style,
                            backgroundImage: ''
                          }));
                          
                          // Save to server (using player endpoint)
                          if (profile?.player?.id) {
                            const backgroundData = JSON.stringify({
                              backgroundGradient: option.id,
                              customColor: option.style,
                              backgroundImage: '',
                            });
                            await axios.put(`/api/players/${profile.player.id}/background`, {
                              customColor: backgroundData,
                            });
                          }
                        } catch (error) {
                          console.error('Error updating background:', error);
                          toast.error(t('playerProfile.errorUpdatingBackground') || 'Error updating background');
                        }
                      }}
                      className={`h-20 rounded-lg transition-all hover:scale-105 hover:shadow-lg border-2 ${
                        selectedBg.id === option.id && !customBgImage
                          ? 'border-orange-600 ring-2 ring-orange-600 ring-offset-2 dark:ring-offset-gray-800'
                          : 'border-gray-200 dark:border-gray-600'
                      }`}
                      style={{ background: option.style }}
                      title={option.name}
                    />
                  ))}
                </div>
              </div>

              {/* Custom Image Upload */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('playerProfile.or') || 'Or'}</h4>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('playerProfile.selectNewBackground') || 'Upload Custom Image'}</h4>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadingBackground(true);
                      try {
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('upload_preset', 'player_uploads');
                        
                        const cloudRes = await fetch(
                          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                          { method: 'POST', body: formData }
                        );
                        const cloudData = await cloudRes.json();
                        
                        if (cloudData.secure_url) {
                          setNewBackgroundImage(cloudData.secure_url);
                        }
                      } catch (error) {
                        console.error('Error uploading image:', error);
                        toast.error(t('toast.uploadError') || 'Error uploading image');
                      } finally {
                        setUploadingBackground(false);
                      }
                    }
                  }}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 dark:file:bg-orange-900/30 file:text-orange-700 dark:file:text-orange-300 hover:file:bg-orange-100 dark:hover:file:bg-orange-900/50 cursor-pointer"
                />
                
                {uploadingBackground && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('playerProfile.backgroundUpdating') || 'Uploading...'}
                  </div>
                )}
                
                {newBackgroundImage && (
                  <div className="mt-4">
                    <img
                      src={newBackgroundImage}
                      alt="New background preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={async () => {
                        try {
                          setUploadingBackground(true);
                          
                          // Update UI
                          setCustomBgImage(newBackgroundImage);
                          setShowBackgroundModal(false);
                          
                          // Save to localStorage
                          localStorage.setItem(`profileBackground_hybrid_${params.id}`, JSON.stringify({
                            selectedBg: 'image',
                            customColor: '',
                            backgroundImage: newBackgroundImage
                          }));
                          
                          // Save to server
                          if (profile?.player?.id) {
                            const backgroundData = JSON.stringify({
                              backgroundGradient: '',
                              customColor: '',
                              backgroundImage: newBackgroundImage,
                            });
                            await axios.put(`/api/players/${profile.player.id}/background`, {
                              customColor: backgroundData,
                            });
                          }
                          
                          setNewBackgroundImage('');
                        } catch (error) {
                          console.error('Error updating background:', error);
                          toast.error(t('playerProfile.errorUpdatingBackground') || 'Error updating background');
                        } finally {
                          setUploadingBackground(false);
                        }
                      }}
                      className="mt-3 w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold"
                    >
                      {t('playerProfile.save') || 'Save'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
