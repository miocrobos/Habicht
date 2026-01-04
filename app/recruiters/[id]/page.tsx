'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast';
import Image from 'next/image'
import Link from 'next/link'
import { Briefcase, MapPin, Award, ExternalLink, Eye, Edit2, Phone, Mail, Camera, Building2, Globe, FileDown, FileText, Users, Instagram, Youtube, Facebook, MessageCircle, Trophy, Upload } from 'lucide-react'
import { BACKGROUND_OPTIONS } from '@/components/shared/backgroundOptions';
import { useSession } from 'next-auth/react'
import ClubBadge from '@/components/shared/ClubBadge'
import RecruiterPhotoGallery from '@/components/shared/RecruiterPhotoGallery'
import RecruiterVideoGallery from '@/components/shared/RecruiterVideoGallery'
import { useLanguage } from '@/contexts/LanguageContext'
import { formatViewCount } from '@/lib/formatViewCount'
import CVTypeModal from '@/components/shared/CVTypeModal'
import CVExportLanguagePopup from '@/components/shared/CVExportLanguagePopup'
import { generateRecruiterCV } from '@/lib/generateRecruiterCV'
import ImageUpload from '@/components/shared/ImageUpload'
import axios from 'axios'
import ErrorBoundary from 'next/dist/client/components/error-boundary'

type PageProps = {
  params: { id: string }
}

export default function RecruiterProfilePage({ params }: PageProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [showBgModal, setShowBgModal] = useState<boolean>(false);
  const [savingBg, setSavingBg] = useState<boolean>(false);
  const [exportingCV, setExportingCV] = useState<boolean>(false);
  const [recruiter, setRecruiter] = useState<any>(null);
  const [showCVLangPopup, setShowCVLangPopup] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'info' | 'photos' | 'videos' | 'documents'>('info');
  const [selectedBg, setSelectedBg] = useState<string>('solid-blue');
  const [customColor, setCustomColor] = useState<string>('#2563eb');
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [newBackgroundImage, setNewBackgroundImage] = useState<string>('');
  const [showProfilePhotoModal, setShowProfilePhotoModal] = useState<boolean>(false);
  const [newProfilePhoto, setNewProfilePhoto] = useState<string>('');
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);
  const [zoomedLicense, setZoomedLicense] = useState<string | null>(null);
  const backgroundLoadedRef = useRef(false);
  const { data: session } = useSession();
  const { t } = useLanguage();

// ...rest of your component logic and JSX

// Example: Move this handler inside the component, after recruiter is defined
const handleExportCV = async (language: string) => {
  if (!recruiter) return;
  setExportingCV(true);
  try {
    const recruiterCVData = {
      firstName: recruiter.firstName,
      lastName: recruiter.lastName,
      organization: recruiter.organization,
      position: recruiter.position,
      city: recruiter.city,
      canton: recruiter.canton,
      bio: recruiter.bio,
      phone: recruiter.phone,
      website: recruiter.website,
      positionsLookingFor: recruiter.positionsLookingFor ?? [],
      achievements: recruiter.achievements ?? [],
      profileImage: recruiter.profileImage ?? null,
      instagram: recruiter.instagram ?? null,
      tiktok: recruiter.tiktok ?? null,
      youtube: recruiter.youtube ?? null,
      facebook: recruiter.facebook ?? null,
      user: { email: recruiter.user.email },
      club: recruiter.linkedClubs && recruiter.linkedClubs.length > 0 ? {
        name: recruiter.linkedClubs[0].name,
        logo: recruiter.linkedClubs[0].logo ?? null,
      } : null,
      clubHistory: recruiter.linkedClubs?.map((club: { name: string }) => ({
        clubName: club.name,
        role: recruiter.position,
        startDate: '',
        endDate: '',
        currentClub: false,
      })) ?? [],
      // Add required RecruiterData fields
      age: recruiter.age ?? '',
      nationality: recruiter.nationality ?? '',
      coachRole: recruiter.coachRole ?? recruiter.position ?? '',
      genderCoached: recruiter.genderCoached ?? [],
      preferredLanguage: recruiter.preferredLanguage ?? null,
      province: recruiter.province ?? null,
    };
    const pdfBlob = await generateRecruiterCV(recruiterCVData, language);
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    link.download = `${recruiter.firstName}_${recruiter.lastName}_Recruiter_CV_${language.toUpperCase()}_${timestamp}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting CV:', error);
    toast.error(t('toast.cvExportError'));
  } finally {
    setExportingCV(false);
    setShowCVLangPopup(false);
  }
};

  // Use shared BACKGROUND_OPTIONS from components/shared/backgroundOptions

  function getGradientStyle(id: string) {
    const gradients: Record<string, string> = {
      'gradient-sunset': 'linear-gradient(90deg, #ff7e5f, #feb47b)',
      'gradient-ocean': 'linear-gradient(90deg, #43cea2, #185a9d)',
      'gradient-rainbow': 'linear-gradient(90deg, #ff9966, #ff5e62, #00c3ff, #ffff1c)',
      'solid-blue': '#2563eb',
      'solid-green': '#16a34a',
      'solid-purple': '#9333ea',
      'solid-orange': '#f97316',
      'solid-pink': '#ec4899',
      'solid-yellow': '#eab308',
      'solid-teal': '#14b8a6',
      'solid-indigo': '#6366f1',
      'solid-dark': '#1f2937',
      'solid-gray': '#6b7280',
      'solid-black': '#000000',
      'solid-red': '#dc2626',
    };
    return gradients[id] || '#2563eb';
  }

  useEffect(() => {
    const fetchRecruiterData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/recruiters/${params.id}`);
        if (response.data && response.data.recruiter) {
          // Transform clubHistory to linkedClubs for display
          const recruiterData = response.data.recruiter;
          
          // Build linkedClubs from clubHistory, deduplicated by club ID
          const clubMap = new Map<string, any>();
          
          // Add current club first (if exists)
          if (recruiterData.club && recruiterData.club.id) {
            clubMap.set(recruiterData.club.id, {
              id: recruiterData.club.id,
              name: recruiterData.club.name,
              logo: recruiterData.club.logo,
              town: recruiterData.club.town || '',
              canton: recruiterData.club.canton || '',
            });
          }
          
          // Add clubs from clubHistory (deduplicated)
          if (recruiterData.clubHistory && recruiterData.clubHistory.length > 0) {
            recruiterData.clubHistory.forEach((ch: any) => {
              const clubId = ch.club?.id || ch.clubId;
              if (clubId && !clubMap.has(clubId)) {
                clubMap.set(clubId, {
                  id: clubId,
                  name: ch.clubName || ch.club?.name,
                  logo: ch.clubLogo || ch.club?.logo,
                  town: ch.club?.town || '',
                  canton: ch.club?.canton || '',
                });
              }
            });
          }
          
          recruiterData.linkedClubs = Array.from(clubMap.values());
          setRecruiter(recruiterData);
          
          // Only load background once on initial load
          if (backgroundLoadedRef.current) {
            setLoading(false);
            return;
          }
          backgroundLoadedRef.current = true;
          
          // Parse server background data
          let serverBg = null;
          try {
            if (response.data.recruiter.customColor) {
              serverBg = JSON.parse(response.data.recruiter.customColor);
            }
          } catch (e) {
            // If parsing fails, treat as old format (plain color string)
            serverBg = { customColor: response.data.recruiter.customColor };
          }
          
          // Try to load from localStorage first for client-side persistence
          let bgLoaded = false;
          try {
            const savedBg = localStorage.getItem(`profileBackground_recruiter_${params.id}`);
            if (savedBg) {
              const parsed = JSON.parse(savedBg);
              setSelectedBg(parsed.selectedBg?.id || parsed.selectedBg || 'solid-blue');
              setCustomColor(parsed.customColor || '#2563eb');
              setBackgroundImage(parsed.backgroundImage || '');
              bgLoaded = true;
              return; // Stop processing - localStorage data loaded successfully
            }
          } catch (e) {
            console.error('Failed to load background from localStorage:', e);
          }
          
          // If no localStorage, use server data and save to localStorage
          if (!bgLoaded && serverBg) {
            let bgId = 'solid-blue';
            let color = '#2563eb';
            let image = '';
            
            if (serverBg.backgroundImage) {
              setBackgroundImage(serverBg.backgroundImage);
              setSelectedBg('image');
              bgId = 'image';
              image = serverBg.backgroundImage;
            } else if (serverBg.backgroundGradient) {
              setSelectedBg(serverBg.backgroundGradient);
              const found = BACKGROUND_OPTIONS.find(bg => bg.id === serverBg.backgroundGradient);
              color = found ? found.style : '#2563eb';
              bgId = serverBg.backgroundGradient;
              setCustomColor(color);
            } else if (serverBg.customColor) {
              setSelectedBg('custom');
              setCustomColor(serverBg.customColor);
              bgId = 'custom';
              color = serverBg.customColor;
            } else {
              setSelectedBg('solid-blue');
              setCustomColor('#2563eb');
            }
            
            // Don't save server data to localStorage - only user changes should be saved
          } else if (!bgLoaded) {
            setSelectedBg('solid-blue');
            setCustomColor('#2563eb');
          }
        } else {
          setError({ message: t("recruiterProfile.recruiterNotFound") || "Recruiter Not Found" });
        }
      } catch (err: any) {
        setError(err);
        console.error('Error fetching recruiter data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecruiterData();
  }, [params.id, t]);

  useEffect(() => {
    if (recruiter && session?.user) {
      setIsOwner(recruiter.user.id === session.user.id);
    }
  }, [recruiter, session]);

  // Handle profile photo update
  const handleProfilePhotoUpdate = async () => {
    if (!newProfilePhoto || !recruiter) return;
    
    try {
      setUploadingPhoto(true);
      await axios.put(`/api/recruiters/${params.id}`, {
        profileImage: newProfilePhoto,
      });
      
      // Refresh recruiter data
      const response = await axios.get(`/api/recruiters/${params.id}`);
      if (response.data && response.data.recruiter) {
        setRecruiter(response.data.recruiter);
      }
      
      setShowProfilePhotoModal(false);
      setNewProfilePhoto('');
      toast.success(t('playerProfile.photoUpdated') || 'Profile photo updated!');
    } catch (error: any) {
      console.error('Error updating profile photo:', error);
      toast.error(t('playerProfile.errorUpdatingPhoto') || 'Error updating photo');
    } finally {
      setUploadingPhoto(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('recruiterProfile.loadingProfile') || 'Loading profile...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorBoundary error={error} />;
  }

  if (!recruiter) {
    return <ErrorBoundary error={{ message: 'Recruiter Not Found' }} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Cover Image */}
      <div 
        className="relative h-64"
        style={{
          background: backgroundImage 
            ? `url(${backgroundImage}) center/cover no-repeat` 
            : selectedBg === 'custom' || customColor !== '#2563eb'
            ? customColor
            : getGradientStyle(selectedBg)
        }}
      >
        {recruiter.coverImage && (
          <Image
            src={recruiter.coverImage}
            alt="Cover"
            fill
            className="object-cover"
            priority
          />
        )}
        {/* Background change button (owner only) */}
        {isOwner && (
          <button
            onClick={() => setShowBgModal(true)}
            className="absolute top-4 right-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition flex items-center gap-2 z-10 text-sm"
          >
            <Edit2 className="w-4 h-4" />
            <span>{t('recruiterProfile.changeBackground') || 'Hintergrund Ändere'}</span>
          </button>
        )}
      </div>

      {/* Profile Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Card - Similar to Player Profile */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg -mt-20 relative z-10 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
            {/* Profile Image */}
            <div className="relative group">
              <div className="relative w-40 h-40 rounded-full border-4 border-white dark:border-gray-900 bg-white dark:bg-gray-800 overflow-hidden shadow-xl">
                {recruiter.profileImage ? (
                  <Image
                    src={recruiter.profileImage}
                    alt={`${recruiter.firstName} ${recruiter.lastName}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-purple-600 text-white text-4xl font-bold">
                    {recruiter.firstName[0]}{recruiter.lastName[0]}
                  </div>
                )}
              </div>
              {isOwner && (
                <button
                  onClick={() => setShowProfilePhotoModal(true)}
                  className="absolute inset-0 w-40 h-40 rounded-full bg-black bg-opacity-0 hover:bg-opacity-60 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                  title={t('recruiterProfile.changePhoto') || 'Profilbild ändere'}
                >
                  <div className="text-white flex flex-col items-center gap-1">
                    <Camera className="w-6 h-6" />
                    <span className="text-xs font-medium">{t('common.change') || 'Ändere'}</span>
                  </div>
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-grow">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {recruiter.firstName} {recruiter.lastName}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2 mb-3">
                    {/* Gender badge for hybrid users */}
                    {recruiter.user?.role === 'HYBRID' && recruiter.user?.player?.gender && (
                      <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-sm font-semibold rounded-full">
                        {recruiter.user.player.gender === 'MALE' ? `♂ ${t('playerProfile.men') || 'Männlich'}` : `♀ ${t('playerProfile.women') || 'Weiblich'}`}
                      </span>
                    )}
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-semibold rounded-full">
                      {recruiter.coachRole || recruiter.position || 'Recruiter'}
                    </span>
                    {recruiter.lookingForMembers && (
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-semibold rounded-full flex items-center gap-1">
                        ✓ {t('recruiterProfile.lookingForMembers') || 'Looking for players'}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {(recruiter.city || recruiter.province) && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {recruiter.city || recruiter.province}, {recruiter.canton}
                      </span>
                    )}
                    {recruiter.nationality && (
                      <span>🏳 {t('playerProfile.nationality') || 'Nationality'}: {recruiter.nationality}</span>
                    )}
                    {recruiter.club && (
                      <Link href={`/clubs/${recruiter.club.id}`} className="flex items-center gap-2 hover:text-purple-600">
                        {recruiter.club.logo && (
                          <Image src={recruiter.club.logo} alt={recruiter.club.name} width={16} height={16} className="w-4 h-4 rounded object-contain bg-white" />
                        )}
                        <span>{recruiter.club.name}</span>
                      </Link>
                    )}
                  </div>
                  {/* Contact Info */}
                  <div className="flex flex-wrap gap-3 text-sm mb-4">
                    {(recruiter.showPhone || isOwner) && recruiter.phone && (
                      <a href={`tel:${recruiter.phone}`} className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-purple-600">
                        <Phone className="w-4 h-4" />
                        <span>{recruiter.phone}</span>
                        {isOwner && !recruiter.showPhone && <span className="text-xs text-gray-400">🔒</span>}
                      </a>
                    )}
                    {(recruiter.showEmail || isOwner) && recruiter.user?.email && (
                      <a href={`mailto:${recruiter.user.email}`} className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-purple-600">
                        <Mail className="w-4 h-4" />
                        <span>{recruiter.user.email}</span>
                        {isOwner && !recruiter.showEmail && <span className="text-xs text-gray-400">🔒</span>}
                      </a>
                    )}
                  </div>
                </div>

                {/* Stats Boxes - Similar to Player Profile */}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 md:gap-3">
                  {recruiter.age && (
                    <div className="bg-gray-50 dark:bg-gray-800 px-3 py-2 md:px-4 md:py-3 rounded-lg text-center min-w-[80px] md:min-w-[90px] border border-gray-200 dark:border-gray-700">
                      <div className="text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400">{recruiter.age}</div>
                      <div className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400">{t('recruiterProfile.ageLabel') || 'Jahre Alt'}</div>
                    </div>
                  )}
                  {recruiter.genderCoached && recruiter.genderCoached.length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-800 px-3 py-2 md:px-4 md:py-3 rounded-lg text-center min-w-[80px] md:min-w-[90px] border border-gray-200 dark:border-gray-700">
                      <div className="text-lg md:text-xl font-bold text-blue-600 dark:text-blue-400">
                        {recruiter.genderCoached.map((g: string) => g === 'MALE' ? '♂' : '♀').join(' / ')}
                      </div>
                      <div className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400">{t('recruiterProfile.searchingFor') || 'Sucht'}</div>
                    </div>
                  )}
                  {recruiter.preferredLanguage && (
                    <div className="bg-gray-50 dark:bg-gray-800 px-3 py-2 md:px-4 md:py-3 rounded-lg text-center min-w-[80px] md:min-w-[90px] border border-gray-200 dark:border-gray-700">
                      <div className="text-lg md:text-xl font-bold text-green-600 dark:text-green-400">
                        {recruiter.preferredLanguage === 'gsw' ? t('register.languageSwissGerman') || 'Schwiizerdütsch' :
                         recruiter.preferredLanguage === 'de' ? t('register.languageGerman') || 'Deutsch' :
                         recruiter.preferredLanguage === 'fr' ? t('register.languageFrench') || 'Français' :
                         recruiter.preferredLanguage === 'it' ? t('register.languageItalian') || 'Italiano' :
                         recruiter.preferredLanguage === 'en' ? t('register.languageEnglish') || 'English' :
                         recruiter.preferredLanguage.toUpperCase()}
                      </div>
                      <div className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400">{t('playerProfile.languageLabel') || 'Sprache'}</div>
                    </div>
                  )}
                  {recruiter.positionsLookingFor && recruiter.positionsLookingFor.length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-800 px-3 py-2 md:px-4 md:py-3 rounded-lg text-center min-w-[80px] md:min-w-[90px] border border-gray-200 dark:border-gray-700">
                      <div className="text-lg md:text-xl font-bold text-orange-600 dark:text-orange-400">{recruiter.positionsLookingFor.length}</div>
                      <div className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400">{t('recruiterProfile.positionsCount') || 'Positionen'}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio Section - Inside Profile Card */}
              {recruiter.bio && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{recruiter.bio}</p>
                </div>
              )}

              {/* Positions Looking For - Badges */}
              {recruiter.positionsLookingFor && recruiter.positionsLookingFor.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('recruiterProfile.positionsLookingFor') || 'Looking for positions'}:</h3>
                  <div className="flex flex-wrap gap-2">
                    {recruiter.positionsLookingFor.map((pos: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-semibold rounded-full">
                        {t(`playerProfile.position${pos.charAt(0) + pos.slice(1).toLowerCase().replace(/_([a-z])/g, (m: string, c: string) => c.toUpperCase())}`) || pos.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons Row */}
              <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-3">
                {isOwner && (
                  <>
                    <Link
                      href={recruiter.user?.role === 'HYBRID' ? `/hybrids/${recruiter.user.id}/edit` : '/settings/profile'}
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold text-sm sm:text-base"
                    >
                      <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      {t('recruiterProfile.editProfile') || 'Edit Profile'}
                    </Link>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm sm:text-base"
                      onClick={() => setShowCVLangPopup(true)}
                      disabled={exportingCV}
                      title={t('recruiterProfile.exportCV') || 'Export CV'}
                    >
                      <FileDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      {t('recruiterProfile.exportCV') || 'Export CV'}
                    </button>
                  </>
                )}
                
                {/* Social Media Buttons */}
                {recruiter.instagram && (
                  <a
                    href={`https://instagram.com/${recruiter.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition font-semibold text-sm sm:text-base"
                  >
                    <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Instagram</span>
                  </a>
                )}
                {recruiter.tiktok && (
                  <a
                    href={`https://www.tiktok.com/@${recruiter.tiktok.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-black text-white rounded-lg hover:opacity-90 transition font-semibold text-sm sm:text-base"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                    <span className="hidden xs:inline">TikTok</span>
                  </a>
                )}
                {recruiter.youtube && (
                  <a
                    href={`https://youtube.com/@${recruiter.youtube.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold text-sm sm:text-base"
                  >
                    <Youtube className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">YouTube</span>
                  </a>
                )}
                {recruiter.facebook && (
                  <a
                    href={recruiter.facebook.startsWith('http') ? recruiter.facebook : `https://facebook.com/${recruiter.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm sm:text-base"
                  >
                    <Facebook className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Facebook</span>
                  </a>
                )}
              </div>

              {/* CV Language Export Popup */}
              {showCVLangPopup && (
                <CVExportLanguagePopup
                  onClose={() => setShowCVLangPopup(false)}
                  onExport={handleExportCV}
                  userType="recruiter"
                />
              )}
            </div>
          </div>

          {/* View Count */}
          {isOwner && (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mt-4">
              <Eye className="w-4 h-4" />
              <span>{formatViewCount(recruiter.views || 0)} {t('recruiterProfile.profileViews') || 'Profile Views'}</span>
            </div>
          )}
        </div>

        {/* Tabs Card - Similar to Player Profile */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-hide">
            <nav className="flex -mb-px min-w-max px-1">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-3 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-sm font-medium border-b-2 transition whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'info'
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {t('recruiterProfile.tabInfo') || 'Information'}
              </button>
              <button
                onClick={() => setActiveTab('photos')}
                className={`px-3 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-sm font-medium border-b-2 transition whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'photos'
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {t('recruiterProfile.tabPhotos') || 'Photos'}
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`px-3 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-sm font-medium border-b-2 transition whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'videos'
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {t('recruiterProfile.tabVideos') || 'Videos'}
              </button>
              {(isOwner || recruiter.showLicense) && recruiter.coachingLicense && (
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`px-3 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-sm font-medium border-b-2 transition whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'documents'
                      ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {t('recruiterProfile.tabDocuments') || 'Documents'}
                </button>
              )}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Bio */}
                {recruiter.bio && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </span>
                      {t('recruiterProfile.aboutMe') || 'About Me'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">{recruiter.bio}</p>
                  </div>
                )}

                {/* Linked Clubs */}
                {recruiter.linkedClubs && recruiter.linkedClubs.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </span>
                      {t('recruiterProfile.associatedClubs') || 'Associated Clubs'}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {recruiter.linkedClubs.map((club: any) => (
                        <Link
                          key={club.id}
                          href={`/clubs/${club.id}`}
                          className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-xl hover:shadow-md transition group border border-gray-200 dark:border-gray-700"
                        >
                          <ClubBadge
                            clubName={club.name}
                            uploadedLogo={club.logo}
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">{club.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{club.town}, {club.canton}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Achievements Section */}
                {recruiter.achievements && recruiter.achievements.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      </span>
                      {t('recruiterProfile.achievements') || 'Coaching Achievements'}
                    </h2>
                    <ul className="space-y-3">
                      {recruiter.achievements.map((achievement: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10 rounded-xl border border-yellow-200 dark:border-yellow-800/30">
                          <Award className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 dark:text-gray-300">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Current Club Card */}
                {recruiter.club && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </span>
                      {t('recruiterProfile.currentClub') || 'Current Club'}
                    </h2>
                    <Link
                      href={`/clubs/${recruiter.club.id}`}
                      className="flex items-center gap-4 p-5 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-900/20 dark:via-indigo-900/20 dark:to-blue-900/20 rounded-xl hover:shadow-lg transition group border border-purple-200 dark:border-purple-800/30"
                    >
                      <ClubBadge
                        clubName={recruiter.club.name}
                        uploadedLogo={recruiter.club.logo}
                        size="lg"
                      />
                      <div>
                        <p className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">{recruiter.club.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{recruiter.club.canton}</p>
                        <span className="inline-flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 mt-1 font-medium">
                          {t('common.viewClub') || 'View Club'} <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Contact Information */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </span>
                    {t('recruiterProfile.contact') || 'Contact'}
                  </h2>
                  <div className="space-y-4">
                    {(recruiter.showEmail || isOwner) && (
                      <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <Mail className="w-5 h-5 text-purple-500 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</p>
                          <a
                            href={`mailto:${recruiter.user.email}`}
                            className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 break-all font-medium"
                          >
                            {recruiter.user.email}
                          </a>
                        </div>
                      </div>
                    )}
                    {(recruiter.showPhone || isOwner) && recruiter.phone && (
                      <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <Phone className="w-5 h-5 text-green-500 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('register.phone') || 'Phone'}</p>
                          <a
                            href={`tel:${recruiter.phone}`}
                            className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                          >
                            {recruiter.phone}
                          </a>
                        </div>
                      </div>
                    )}
                    {recruiter.website && (
                      <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <Globe className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('recruiterProfile.website') || 'Website'}</p>
                          <a
                            href={recruiter.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 inline-flex items-center gap-1 font-medium"
                          >
                            {recruiter.website.replace(/^https?:\/\//, '')}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Organization Info */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </span>
                    {t('recruiterProfile.organization') || 'Organization'}
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <Building2 className="w-5 h-5 text-orange-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('recruiterProfile.organization') || 'Organization'}</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{recruiter.organization}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <Briefcase className="w-5 h-5 text-purple-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('recruiterProfile.position') || 'Position'}</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{recruiter.position}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recruiting Info - Gender they're searching for */}
                {recruiter.genderCoached && recruiter.genderCoached.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                        <Users className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                      </span>
                      {t('recruiterProfile.recruitingInfo') || 'Recruiting'}
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/10 dark:to-purple-900/10 rounded-lg border border-pink-200 dark:border-pink-800/30">
                        <Users className="w-5 h-5 text-pink-500 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('recruiterProfile.teamGender') || 'Team Gender'}</p>
                          <p className="font-semibold text-gray-900 dark:text-white text-lg">
                            {recruiter.genderCoached.map((g: string) => 
                              g === 'MALE' ? `♂ ${t('playerProfile.men') || 'Herren'}` : 
                              g === 'FEMALE' ? `♀ ${t('playerProfile.women') || 'Damen'}` : g
                            ).join(' / ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <RecruiterPhotoGallery recruiterId={params.id} isOwner={isOwner} />
          )}

          {activeTab === 'videos' && (
            <RecruiterVideoGallery recruiterId={params.id} isOwner={isOwner} />
          )}

          {activeTab === 'documents' && (isOwner || recruiter.showLicense) && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                {t('recruiterProfile.tabDocuments') || 'Documents'}
                {isOwner && !recruiter.showLicense && (
                  <span className="ml-2 text-xs text-gray-400 flex items-center gap-1" title="Only visible to you">
                    🔒 {t('common.privateToYou') || 'Private'}
                  </span>
                )}
              </h3>
              {isOwner && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <Link href="/settings" className="text-purple-600 hover:underline">
                    {t('hybridProfile.changeVisibility') || 'Change visibility in settings'}
                  </Link>
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recruiter.coachingLicense && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-500" />
                        {t('recruiterProfile.coachingLicense') || 'Coaching License'}
                      </h4>
                    </div>
                    <div className="p-2">
                      {recruiter.coachingLicense.startsWith('data:image') || 
                       recruiter.coachingLicense.match(/\.(jpg|jpeg|png|gif|webp)($|\?)/i) ||
                       recruiter.coachingLicense.includes('cloudinary.com') ||
                       recruiter.coachingLicense.includes('res.cloudinary') ? (
                        <div 
                          onClick={() => setZoomedLicense(recruiter.coachingLicense)}
                          className="block cursor-pointer"
                        >
                          <img 
                            src={recruiter.coachingLicense} 
                            alt="Coaching License" 
                            className="w-full h-48 object-contain rounded cursor-pointer hover:opacity-90 transition bg-gray-100 dark:bg-gray-700"
                          />
                          <div className="text-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                            {t('common.clickToZoom') || 'Click to zoom'}
                          </div>
                        </div>
                      ) : recruiter.coachingLicense.match(/\.pdf($|\?)/i) ? (
                        <a 
                          href={recruiter.coachingLicense} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center h-48 bg-gray-100 dark:bg-gray-700 rounded text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition"
                        >
                          <div className="text-center">
                            <FileText className="w-12 h-12 mx-auto mb-2" />
                            <span className="text-sm font-medium">{t('common.viewDocument') || 'View Document'}</span>
                          </div>
                        </a>
                      ) : (
                        <div className="flex items-center justify-center h-48 bg-gray-100 dark:bg-gray-700 rounded">
                          <p className="text-gray-500 dark:text-gray-400 text-center">
                            {t('recruiterProfile.noPhotosYet') || 'No photos yet'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {!recruiter.coachingLicense && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  {t('recruiterProfile.noDocumentsUploaded') || 'No documents uploaded yet.'}
                </p>
              )}
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Background Change Modal - Inline style like player profile */}
      {showBgModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('recruiterProfile.changeBackground') || 'Hintergrund Ändere'}</h3>
              <button
                onClick={() => {
                  setShowBgModal(false)
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
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('playerProfile.selectColor') || 'Farbe wählen'}</h4>
                <div className="grid grid-cols-4 gap-3">
                  {BACKGROUND_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={async () => {
                        try {
                          // Update UI immediately for instant feedback
                          setSelectedBg(option.id)
                          setCustomColor(option.style)
                          setBackgroundImage('')
                          setShowBgModal(false)
                          
                          // Save background data as JSON in customColor field
                          const backgroundData = JSON.stringify({
                            backgroundGradient: option.id,
                            customColor: option.style,
                            backgroundImage: '',
                          });
                          
                          await axios.put(`/api/recruiters/${params.id}/background`, {
                            customColor: backgroundData,
                          })
                          
                          // Save to localStorage for persistence
                          try {
                            localStorage.setItem(`profileBackground_recruiter_${params.id}`, JSON.stringify({
                              selectedBg: option.id,
                              customColor: option.style,
                              backgroundImage: ''
                            }));
                          } catch (e) {
                            console.error('Failed to save background to localStorage:', e);
                          }
                          
                          toast.success(t('toast.backgroundSaved'))
                        } catch (error) {
                          console.error('Error updating background:', error)
                          toast.error(t('toast.backgroundError'))
                        }
                      }}
                      className={`h-20 rounded-lg transition-all hover:scale-105 hover:shadow-lg border-2 ${
                        selectedBg === option.id && !backgroundImage
                          ? 'border-purple-600 ring-2 ring-purple-600 ring-offset-2 dark:ring-offset-gray-800'
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
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">{t('playerProfile.or') || 'oder'}</span>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <ImageUpload
                  label={t('playerProfile.selectNewBackground') || 'Hintergrundbild wählen'}
                  value={newBackgroundImage}
                  onChange={(base64) => setNewBackgroundImage(base64)}
                  aspectRatio="banner"
                  helpText={`${t('playerProfile.recommended') || 'Empfohlen'}: 1920x1080 Pixel`}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowBgModal(false)
                    setNewBackgroundImage('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-semibold"
                >
                  {t('playerProfile.cancel') || 'Abbrechen'}
                </button>
                <button
                  onClick={async () => {
                    if (!newBackgroundImage) return
                    setSavingBg(true)
                    try {
                      // Save background data as JSON in customColor field
                      const backgroundData = JSON.stringify({
                        backgroundGradient: '',
                        customColor: '',
                        backgroundImage: newBackgroundImage,
                      });
                      
                      await axios.put(`/api/recruiters/${params.id}/background`, {
                        customColor: backgroundData,
                      })
                      
                      // Update local state
                      setBackgroundImage(newBackgroundImage)
                      setSelectedBg('')
                      
                      // Save to localStorage for persistence
                      try {
                        localStorage.setItem(`profileBackground_recruiter_${params.id}`, JSON.stringify({
                          selectedBg: 'image',
                          customColor: '',
                          backgroundImage: newBackgroundImage
                        }));
                      } catch (e) {
                        console.error('Failed to save background to localStorage:', e);
                      }
                      
                      setShowBgModal(false)
                      setNewBackgroundImage('')
                      toast.success(t('toast.backgroundSaved'))
                    } catch (error) {
                      console.error('Error updating background:', error)
                      toast.error(t('toast.backgroundError'))
                    } finally {
                      setSavingBg(false)
                    }
                  }}
                  disabled={!newBackgroundImage || savingBg}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {savingBg ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('playerProfile.backgroundUpdating') || 'Wird gespeichert...'}
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      {t('playerProfile.saveImage') || 'Bild speichern'}
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
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('playerProfile.changeProfilePhoto') || 'Change Profile Photo'}</h3>
              <button
                onClick={() => {
                  setShowProfilePhotoModal(false);
                  setNewProfilePhoto('');
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
                label={t('playerProfile.selectNewProfilePhoto') || 'Select new profile photo'}
                value={newProfilePhoto}
                onChange={(base64) => setNewProfilePhoto(base64)}
                aspectRatio="square"
                required
              />

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowProfilePhotoModal(false);
                    setNewProfilePhoto('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-semibold"
                >
                  {t('playerProfile.cancel') || 'Cancel'}
                </button>
                <button
                  onClick={handleProfilePhotoUpdate}
                  disabled={!newProfilePhoto || uploadingPhoto}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploadingPhoto ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('playerProfile.uploading') || 'Uploading...'}
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      {t('playerProfile.save') || 'Save'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
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
