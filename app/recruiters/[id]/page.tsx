'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast';
import Image from 'next/image'
import Link from 'next/link'
import { Briefcase, MapPin, Award, ExternalLink, Eye, Edit2, Phone, Mail, Camera, Building2, Globe, FileDown, FileText } from 'lucide-react'
import { BackgroundPickerModal, BackgroundOption } from '@/components/shared/BackgroundPickerModal';
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
import axios from 'axios'
import ErrorBoundary from 'next/dist/client/components/error-boundary'

type PageProps = {
  params: { id: string }
}

export default function RecruiterProfilePage({ params }: PageProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [showBgModal, setShowBgModal] = useState<boolean>(false);
  const [savingBg, setSavingBg] = useState<boolean>(false);
  const [exportingCV, setExportingCV] = useState<boolean>(false);
  const [recruiter, setRecruiter] = useState<any>(null);
  const [showCVLangPopup, setShowCVLangPopup] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'info' | 'photos' | 'videos'>('info');
  const [selectedBg, setSelectedBg] = useState<string>('solid-blue');
  const [customColor, setCustomColor] = useState<string>('#2563eb');
  const [backgroundImage, setBackgroundImage] = useState<string>('');
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
    toast.error('Fehler bim CV Export');
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
          setRecruiter(response.data.recruiter);
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
  }, [params.id]);

  useEffect(() => {
    if (recruiter && session?.user) {
      setIsOwner(recruiter.user.id === session.user.id);
    }
  }, [recruiter, session]);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
      <div className="relative h-64 bg-gradient-to-r from-purple-600 to-purple-800">
        {recruiter.coverImage && (
          <Image
            src={recruiter.coverImage}
            alt="Cover"
            fill
            className="object-cover"
            priority
          />
        )}
      </div>

      {/* Profile Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative pb-8 border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-20">
            {/* Profile Image */}
            <div className="relative">
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
                <Link
                  href="/settings/profile"
                  className="absolute bottom-0 right-0 p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition shadow-lg"
                  title="Edit profile"
                >
                  <Camera className="w-5 h-5" />
                </Link>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {recruiter.firstName} {recruiter.lastName}
                  </h1>
                  <div className="flex items-center gap-2 mt-1 text-gray-600 dark:text-gray-400">
                    <Briefcase className="w-4 h-4" />
                    <span>{recruiter.position} at {recruiter.organization}</span>
                  </div>
                  {recruiter.city && (
                    <div className="flex items-center gap-2 mt-1 text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>{recruiter.city}, {recruiter.canton}</span>
                    </div>
                  )}
                </div>

                {isOwner && (
                  <div className="flex gap-3">
                    <Link
                      href="/settings/profile"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </Link>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold shadow-md"
                      onClick={() => setShowCVLangPopup(true)}
                      disabled={exportingCV}
                      title="Recruiter Läbeslaauf Exportiere"
                    >
                      <FileDown className="w-4 h-4" />
                      Export CV
                    </button>
                  </div>
                )}
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
          </div>

          {/* View Count */}
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mt-4">
            <Eye className="w-4 h-4" />
            <span>{formatViewCount(recruiter.views)} {recruiter.views === 1 ? 'view' : 'views'}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-800 mt-8">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('info')}
              className={`pb-4 px-1 border-b-2 transition ${
                activeTab === 'info'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Information
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`pb-4 px-1 border-b-2 transition ${
                activeTab === 'photos'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Photos
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`pb-4 px-1 border-b-2 transition ${
                activeTab === 'videos'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Videos
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="py-8">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Bio */}
                {recruiter.bio && (
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About</h2>
                    <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{recruiter.bio}</p>
                  </div>
                )}

                {/* Linked Clubs */}
                {recruiter.linkedClubs && recruiter.linkedClubs.length > 0 && (
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Associated Clubs</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {recruiter.linkedClubs.map((club: any) => (
                        <Link
                          key={club.id}
                          href={`/clubs/${club.id}`}
                          className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        >
                          <ClubBadge
                            clubName={club.name}
                            uploadedLogo={club.logo}
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white truncate">{club.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{club.town}, {club.canton}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Contact Information */}
                <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Contact</h2>
                  <div className="space-y-3">
                    {(recruiter.showEmail || isOwner) && (
                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                          <a
                            href={`mailto:${recruiter.user.email}`}
                            className="text-purple-600 hover:text-purple-700 break-all"
                          >
                            {recruiter.user.email}
                          </a>
                        </div>
                      </div>
                    )}
                    {(recruiter.showPhone || isOwner) && recruiter.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                          <a
                            href={`tel:${recruiter.phone}`}
                            className="text-purple-600 hover:text-purple-700"
                          >
                            {recruiter.phone}
                          </a>
                        </div>
                      </div>
                    )}
                    {recruiter.website && (
                      <div className="flex items-start gap-3">
                        <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Website</p>
                          <a
                            href={recruiter.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-700 inline-flex items-center gap-1"
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
                <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Organization</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Organization</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{recruiter.organization}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Position</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{recruiter.position}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <RecruiterPhotoGallery recruiterId={params.id} isOwner={isOwner} />
          )}

          {activeTab === 'videos' && (
            <RecruiterVideoGallery recruiterId={params.id} isOwner={isOwner} />
          )}
        </div>
      </div>

      {/* Background Change Modal */}
      {showBgModal && (
        <BackgroundPickerModal
          key={
            (recruiter?.backgroundGradient || 'solid-blue') +
            (recruiter?.customColor || '#2563eb') +
            (recruiter?.backgroundImage || '')
          }
          onClose={() => setShowBgModal(false)}
          onSave={async (bg) => {
            setSavingBg(true);
            try {
              await axios.put(`/api/recruiters/${params.id}/background`, {
                backgroundGradient: bg.id,
              });
              // Refresh recruiter data from backend
              const recruiterResponse = await axios.get(`/api/recruiters/${params.id}`);
              const updatedRecruiter = recruiterResponse.data.recruiter;
              setRecruiter(updatedRecruiter);
              setShowBgModal(false);
            } catch (error) {
              toast.error('Fehler beim Speichern des Hintergrunds');
            } finally {
              setSavingBg(false);
            }
          }}
          backgroundOptions={BACKGROUND_OPTIONS}
          initialBg={BACKGROUND_OPTIONS.find(bg => bg.id === (recruiter?.backgroundGradient || 'solid-blue')) || BACKGROUND_OPTIONS[0]}
          initialCustomColor={recruiter?.customColor || '#2563eb'}
          initialImage={recruiter?.backgroundImage || ''}
          loading={savingBg}
          onSavedBg={(bg, customColor, image) => {
            setSelectedBg(bg.id);
            setCustomColor(customColor);
            setBackgroundImage(image);
          }}
        />
      )}
    </div>
  )
}
