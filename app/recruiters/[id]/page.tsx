'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Briefcase, MapPin, Award, ExternalLink, Eye, Edit2, Phone, Mail, Camera, Building2, Globe } from 'lucide-react'
import { useSession } from 'next-auth/react'
import ClubBadge from '@/components/shared/ClubBadge'
import RecruiterPhotoGallery from '@/components/shared/RecruiterPhotoGallery'
import RecruiterVideoGallery from '@/components/shared/RecruiterVideoGallery'
import { useLanguage } from '@/contexts/LanguageContext'
import { formatViewCount } from '@/lib/formatViewCount'
import axios from 'axios'
import ErrorBoundary from 'next/dist/client/components/error-boundary'

interface RecruiterProfileProps {
  params: {
    id: string
  }
}

interface RecruiterData {
  id: string
  firstName: string
  lastName: string
  user: {
    id: string
    email: string
    name: string | null
    role: string
  }
  organization: string
  position: string
  profileImage: string | null
  coverImage: string | null
  bio: string | null
  phone: string | null
  website: string | null
  nationality: string
  canton: string
  city: string | null
  municipality: string | null
  linkedClubs: Array<{
    id: string
    name: string
    logo: string | null
    website: string | null
    canton: string
    town: string
  }>
  showEmail: boolean
  showPhone: boolean
  views: number
  createdAt: string
}

export default function RecruiterProfile({ params }: RecruiterProfileProps) {
  const { data: session } = useSession()
  const { t, language } = useLanguage()
  const [recruiter, setRecruiter] = useState<RecruiterData | null>(null)
  const [loading, setLoading] = useState(true)

  const [activeTab, setActiveTab] = useState<'info' | 'photos' | 'videos'>('info');
  const [isOwner, setIsOwner] = useState(false);
  const [error, setError] = useState<any>(null);

  const [showBgModal, setShowBgModal] = useState(false);
  const [selectedBg, setSelectedBg] = useState<string | null>(null);
  const [customColor, setCustomColor] = useState("#2563eb");
  const [backgroundImage, setBackgroundImage] = useState("");

  const BACKGROUND_OPTIONS = [
    { id: "solid-blue", name: "Blau", style: "#2563eb" },
    { id: "solid-green", name: "Grün", style: "#16a34a" },
    { id: "solid-purple", name: "Lila", style: "#9333ea" },
    { id: "solid-orange", name: "Orange", style: "#f97316" },
    { id: "solid-pink", name: "Pink", style: "#ec4899" },
    { id: "solid-yellow", name: "Gelb", style: "#eab308" },
    { id: "solid-teal", name: "Türkis", style: "#14b8a6" },
    { id: "solid-indigo", name: "Indigo", style: "#6366f1" },
    { id: "solid-dark", name: "Dunkel", style: "#1f2937" },
    { id: "solid-gray", name: "Grau", style: "#6b7280" },
    { id: "solid-black", name: "Schwarz", style: "#000000" },
  ];

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
                  <Link
                    href="/settings/profile"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </Link>
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
                      {recruiter.linkedClubs.map((club) => (
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-900 rounded-lg shadow-lg p-8 relative max-w-2xl w-full">
            <button
              className="absolute top-4 right-4 text-3xl text-white"
              onClick={() => setShowBgModal(false)}
            >
              &times;
            </button>
            <h2 className="text-3xl font-bold text-white mb-6">Hintergrund Ändere</h2>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">Farb Wähle</h3>
              <div className="grid grid-cols-4 gap-4 mb-4">
                {BACKGROUND_OPTIONS.map(bg => (
                  <button
                    key={bg.id}
                    className="rounded-lg border-2 border-gray-500 h-24"
                    style={{ background: bg.style }}
                    onClick={() => setSelectedBg(bg.id)}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-white">Oder</span>
                <input
                  type="color"
                  value={customColor}
                  onChange={e => setCustomColor(e.target.value)}
                  className="w-10 h-10 border-2 border-gray-300 rounded-full cursor-pointer"
                />
              </div>
              <div className="mb-4">
                <label className="block text-white mb-2">Wähl Es Neus Hintergrundbild</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = ev => setBackgroundImage(ev.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="block w-full text-white"
                />
                {backgroundImage && (
                  <img src={backgroundImage} alt="Preview" className="mt-2 rounded-lg max-h-32" />
                )}
              </div>
            </div>
            <button
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
              onClick={() => setShowBgModal(false)}
            >
              Speichern
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
