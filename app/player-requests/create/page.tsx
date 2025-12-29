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

const positions = [
  { value: 'OUTSIDE_HITTER', label: 'Aussespieler' },
  { value: 'OPPOSITE', label: 'Diagonalspieler' },
  { value: 'MIDDLE_BLOCKER', label: 'Mittelblocker' },
  { value: 'SETTER', label: 'Zuspieler' },
  { value: 'LIBERO', label: 'Libero' },
  { value: 'UNIVERSAL', label: 'Universal' }
]

const contractTypes = [
  { value: 'PROFESSIONAL', label: 'Professionell' },
  { value: 'SEMI_PROFESSIONAL', label: 'Semi-Professionell' },
  { value: 'AMATEUR', label: 'Amateur' },
  { value: 'VOLUNTEER', label: 'Freiwillig' },
  { value: 'INTERNSHIP', label: 'Praktikum' }
]

const leagues = [
  { value: 'NLA', label: 'NLA' },
  { value: 'NLB', label: 'NLB' },
  { value: 'FIRST_LEAGUE', label: '1. Liga' },
  { value: 'SECOND_LEAGUE', label: '2. Liga' },
  { value: 'THIRD_LEAGUE', label: '3. Liga' },
  { value: 'FOURTH_LEAGUE', label: '4. Liga' },
  { value: 'FIFTH_LEAGUE', label: '5. Liga' },
  { value: 'YOUTH_U23', label: 'U23' },
  { value: 'YOUTH_U20', label: 'U20' },
  { value: 'YOUTH_U18', label: 'U18' }
]

const genders = [
  { value: 'MALE', label: 'Männer' },
  { value: 'FEMALE', label: 'Fraue' }
]

export default function CreatePlayerRequestPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useLanguage()
  
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
      setError('Bitte wähl en Club us der Datebamk us.')
      return false
    }
    if (!formData.title.trim()) {
      setError('Bitte gib en Titel ii.')
      return false
    }
    if (!formData.description.trim()) {
      setError('Bitte gib e Beschriibig ii.')
      return false
    }
    if (!formData.positionNeeded) {
      setError('Bitte wähl e Position us.')
      return false
    }
    if (!formData.contractType) {
      setError('Bitte wähl en Vertragstyp us.')
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
      setError(error.response?.data?.error || 'Es isch en Fehler passiert. Bitte probier nochmal.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
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
            Aafrog erfolgriich erstellt!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Alli Spieler wärde benachrichtigt...
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
          {t('playerRequests.backToList') || 'Zrugg zur Lischte'}
        </Link>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
            <h1 className="text-2xl font-bold text-white">
              {t('playerRequests.createTitle') || 'Neui Spieler-Aafrog erstelle'}
            </h1>
            <p className="text-white/80 mt-1">
              {t('playerRequests.createSubtitle') || 'Find de perfekte Spieler für din Club'}
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
                Club * <span className="text-gray-500 font-normal">(muss i der Datebamk sii)</span>
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
                    placeholder="Club sueche..."
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
                  Club usgwählt: {formData.clubName}
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Titel *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="z.B. Suche Aussespieler für NLA Team"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Position & Contract Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Position gsuecht *
                </label>
                <select
                  name="positionNeeded"
                  value={formData.positionNeeded}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Wähl Position...</option>
                  {positions.map(pos => (
                    <option key={pos.value} value={pos.value}>{pos.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vertragstyp *
                </label>
                <select
                  name="contractType"
                  value={formData.contractType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Wähl Vertragstyp...</option>
                  {contractTypes.map(ct => (
                    <option key={ct.value} value={ct.value}>{ct.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Gender & League */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gschlächt
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Egal</option>
                  {genders.map(g => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Liga
                </label>
                <select
                  name="league"
                  value={formData.league}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Wähl Liga...</option>
                  {leagues.map(l => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Beschriibig *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Beschriib d'Stelle und was du suechsch..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white resize-none"
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Aaforderige
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                rows={3}
                placeholder="Spezifischi Aaforderige (optional)..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white resize-none"
              />
            </div>

            {/* Salary & Start Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lohn / Vergüetig
                </label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  placeholder="z.B. CHF 2'000-3'000/Monet"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Startdatum
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
                    Wird gsendet...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Aafrog sende
                  </>
                )}
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-3">
                Alli Spieler wärde per E-Mail und Benachrichtigung informiert.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
