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
  const [activeTab, setActiveTab] = useState<'info' | 'photos' | 'videos'>('info')
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    fetchRecruiterData()
  }, [params.id])

  useEffect(() => {
    if (recruiter && session?.user) {
      setIsOwner(recruiter.user.id === session.user.id)
    }
  }, [recruiter, session])

  const fetchRecruiterData = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/recruiters/${params.id}`)
      setRecruiter(response.data)
    } catch (error) {
      console.error('Error fetching recruiter data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!recruiter) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Recruiter Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400">The recruiter profile you're looking for doesn't exist.</p>
          <Link href="/recruiters" className="text-purple-600 hover:text-purple-700 mt-4 inline-block">
            Back to Recruiters
          </Link>
        </div>
      </div>
    )
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
                            logo={club.logo}
                            name={club.name}
                            size={40}
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
    </div>
  )
}
