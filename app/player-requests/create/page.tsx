'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { ArrowLeft, Send, Building2, Search, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

interface Club {
  id: string
  name: string
  canton: string
  town: string
}

export default function CreatePlayerRequestPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useLanguage()

  // Define positions with translation keys
  const positions = [
    { value: 'OUTSIDE_HITTER', labelKey: 'outsideHitter' },
    { value: 'OPPOSITE', labelKey: 'opposite' },
    { value: 'MIDDLE_BLOCKER', labelKey: 'middleBlocker' },
    { value: 'SETTER', labelKey: 'setter' },
    { value: 'LIBERO', labelKey: 'libero' },
    { value: 'UNIVERSAL', labelKey: 'universal' }
  ]

  // Define contract types with translation keys
  const contractTypes = [
    { value: 'PROFESSIONAL', labelKey: 'professional' },
    { value: 'SEMI_PROFESSIONAL', labelKey: 'semiProfessional' },
    { value: 'AMATEUR', labelKey: 'amateur' },
    { value: 'VOLUNTEER', labelKey: 'volunteer' },
    { value: 'INTERNSHIP', labelKey: 'internship' }
  ]

  // Define leagues with translation keys
  const leagues = [
    { value: 'NLA', labelKey: 'nla' },
    { value: 'NLB', labelKey: 'nlb' },
    { value: 'FIRST_LEAGUE', labelKey: 'league1' },
    { value: 'SECOND_LEAGUE', labelKey: 'league2' },
    { value: 'THIRD_LEAGUE', labelKey: 'league3' },
    { value: 'FOURTH_LEAGUE', labelKey: 'league4' },
    { value: 'FIFTH_LEAGUE', labelKey: 'league5' },
    { value: 'YOUTH_U23', labelKey: 'youthU23' },
    { value: 'YOUTH_U20', labelKey: 'youthU20' },
    { value: 'YOUTH_U18', labelKey: 'youthU18' }
  ]

  // Define genders with translation keys
  const genders = [
    { value: 'MALE', labelKey: 'male' },
    { value: 'FEMALE', labelKey: 'female' }
  ]
  
  const [clubs, setClubs] = useState<Club[]>([])
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([])
  const [clubSearch, setClubSearch] = useState('')
  const [showClubDropdown, setShowClubDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    clubId: '',
    clubName: '',
    title: '',
    description: '',
    positionNeeded: '',
    contractType: '',
    gender: '',
    league: '',
    salary: '',
    startDate: '',
    requirements: ''
  })

  const isRecruiterOrHybrid = session?.user?.role === 'RECRUITER' || session?.user?.role === 'HYBRID'

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated' && !isRecruiterOrHybrid) {
      router.push('/player-requests')
      return
    }

    if (session) {
      fetchClubs()
    }
  }, [session, status, router, isRecruiterOrHybrid])

  const fetchClubs = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/clubs')
      setClubs(response.data.clubs || [])
    } catch (error) {
      console.error('Error fetching clubs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (clubSearch.length > 0) {
      const filtered = clubs.filter(club =>
        club.name.toLowerCase().includes(clubSearch.toLowerCase()) ||
        club.canton.toLowerCase().includes(clubSearch.toLowerCase()) ||
        club.town.toLowerCase().includes(clubSearch.toLowerCase())
      ).slice(0, 10)
      setFilteredClubs(filtered)
      setShowClubDropdown(filtered.length > 0)
    } else {
      setFilteredClubs([])
      setShowClubDropdown(false)
    }
  }, [clubSearch, clubs])

  const selectClub = (club: Club) => {
    setFormData({
      ...formData,
      clubId: club.id,
      clubName: club.name
    })
    setClubSearch(club.name)
    setShowClubDropdown(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const validateForm = () => {
    if (!formData.clubId) {
      setError(t('playerRequests.errorClubRequired') || 'Please select a club')
      return false
    }
    if (!formData.title.trim()) {
      setError(t('playerRequests.errorTitleRequired') || 'Please enter a title')
      return false
    }
    if (!formData.description.trim()) {
      setError(t('playerRequests.errorDescriptionRequired') || 'Please enter a description')
      return false
    }
    if (!formData.positionNeeded) {
      setError(t('playerRequests.errorPositionRequired') || 'Please select a position')
      return false
    }
    if (!formData.contractType) {
      setError(t('playerRequests.errorContractRequired') || 'Please select a contract type')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) return

    try {
      setSubmitting(true)
      
      const requestData = {
        clubId: formData.clubId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        positionNeeded: formData.positionNeeded,
        contractType: formData.contractType,
        gender: formData.gender || null,
        league: formData.league || null,
        salary: formData.salary.trim() || null,
        startDate: formData.startDate || null,
        requirements: formData.requirements.trim() || null
      }

      const response = await axios.post('/api/player-requests', requestData)
      
      setSuccess(true)
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/player-requests/${response.data.request.id}`)
      }, 2000)
    } catch (error: any) {
      console.error('Error creating player request:', error)
      setError(error.response?.data?.error || t('playerRequests.errorSubmit') || 'Error creating request')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('playerRequests.loading') || 'Loading...'}</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t('playerRequests.successMessage') || 'Request created successfully!'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('playerRequests.notificationInfo') || 'All players will be notified...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Back Button */}
        <Link
          href="/player-requests"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('playerRequests.backToList') || 'Back to List'}
        </Link>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
            <h1 className="text-2xl font-bold text-white">
              {t('playerRequests.createTitle') || 'Create New Player Request'}
            </h1>
            <p className="text-white/80 mt-1">
              {t('playerRequests.createSubtitle') || 'Find the perfect player for your club'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Club Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('playerRequests.clubLabel') || 'Club'} *
              </label>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={clubSearch}
                    onChange={(e) => {
                      setClubSearch(e.target.value)
                      if (formData.clubId && e.target.value !== formData.clubName) {
                        setFormData({ ...formData, clubId: '', clubName: '' })
                      }
                    }}
                    onFocus={() => clubSearch && setShowClubDropdown(true)}
                    placeholder={t('playerRequests.searchClub') || 'Search club...'}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                {/* Club Dropdown */}
                {showClubDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredClubs.map((club) => (
                      <button
                        key={club.id}
                        type="button"
                        onClick={() => selectClub(club)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-3"
                      >
                        <Building2 className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{club.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{club.town}, {club.canton}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {formData.clubId && (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  {formData.clubName}
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('playerRequests.titleLabel') || 'Title'} *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder={t('playerRequests.titlePlaceholder') || 'e.g. Looking for Outside Hitter for NLA Team'}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Position & Contract Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('playerRequests.positionSought') || 'Position Sought'} *
                </label>
                <select
                  name="positionNeeded"
                  value={formData.positionNeeded}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                >
                  <option value="">{t('playerRequests.selectPosition') || 'Select position...'}</option>
                  {positions.map(pos => (
                    <option key={pos.value} value={pos.value}>
                      {pos.labelKey ? t(`playerRequests.positionOptions.${pos.labelKey}`) : pos.value}
                    </option>
                  ))}
                </select>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('playerRequests.contractType') || 'Contract Type'} *
                </label>
                <select
                  name="contractType"
                  value={formData.contractType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                >
                  <option value="">{t('playerRequests.selectContractType') || 'Select contract type...'}</option>
                  {contractTypes.map(ct => (
                    <option key={ct.value} value={ct.value}>
                      {ct.labelKey ? t(`playerRequests.contractTypes.${ct.labelKey}`) : ct.value}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Gender & League */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('playerRequests.gender') || 'Gender'}
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                >
                  <option value="">{t('playerRequests.genderAny') || 'Any'}</option>
                  {genders.map(g => (
                    <option key={g.value} value={g.value}>
                      {g.labelKey ? t(`playerRequests.genderOptions.${g.labelKey}`) : g.value}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('playerRequests.league') || 'League'}
                </label>
                <select
                  name="league"
                  value={formData.league}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                >
                  <option value="">{t('playerRequests.selectLeague') || 'Select league...'}</option>
                  {leagues.map(l => (
                    <option key={l.value} value={l.value}>
                      {t(`playerRequests.leagueOptions.${l.labelKey}`) || l.labelKey}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('playerRequests.descriptionLabel') || 'Description'} *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder={t('playerRequests.descriptionPlaceholder') || 'Describe the position and what you are looking for...'}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white resize-none"
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('playerRequests.requirementsLabel') || 'Requirements'}
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                rows={3}
                placeholder={t('playerRequests.requirementsPlaceholder') || 'Specific requirements (optional)...'}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white resize-none"
              />
            </div>

            {/* Salary & Start Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('playerRequests.salary') || 'Salary / Compensation'}
                </label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  placeholder={t('playerRequests.salaryPlaceholder') || 'e.g. CHF 2,000-3,000/month'}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('playerRequests.startDate') || 'Start Date'}
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 px-6 rounded-lg transition-colors"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    {t('playerRequests.submitting') || 'Submitting...'}
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    {t('playerRequests.submitButton') || 'Submit Request'}
                  </>
                )}
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-3">
                {t('playerRequests.notificationInfo') || 'All players will be notified by email and notification.'}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
