'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import { Award, User, Mail, Lock, Calendar, MapPin, TrendingUp, Target } from 'lucide-react'
import ClubSelector from '@/components/shared/ClubSelector'
import ImageUpload from '@/components/shared/ImageUpload'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'PLAYER',
    
    // Player Specific Info
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    position: '',
    height: '',
    blockReach: '',
    spikeReach: '',
    jerseyNumber: '',
    city: '',
    canton: '',
    currentLeague: '',
    desiredLeague: '', // NEW: Target league level
    interestedClubs: [] as string[], // NEW: Array of club IDs
    achievements: [] as string[], // Array of achievements
    profileImage: '', // NEW: Required profile picture
    coverImage: '', // NEW: Optional cover image
    bio: '', // Player bio/description
    
    // Education
    schoolName: '',
    schoolType: '',
    graduationYear: '',
    
    // Contact
    phone: '',
    instagram: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Step 1 validations
    if (step === 1) {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwörter stimmen nicht überein')
        return
      }

      if (formData.password.length < 8) {
        setError('Passwort muss mindestens 8 Zeichen lang sein')
        return
      }

      if (formData.role === 'PLAYER') {
        setStep(2)
        return
      }
    }

    // Step 2 validations (Player info)
    if (step === 2 && formData.role === 'PLAYER') {
      if (!formData.dateOfBirth) {
        setError('Bitte gib dein Geburtsdatum an')
        return
      }

      const age = calculateAge(formData.dateOfBirth)
      if (age > 26) {
        setError('Entschuldigung, diese Plattform ist für Spieler bis 26 Jahre')
        return
      }

      if (age < 13) {
        setError('Du musst mindestens 13 Jahre alt sein')
        return
      }

      if (!formData.position) {
        setError('Bitte wähle deine Position')
        return
      }

      if (!formData.gender) {
        setError('Bitte wähle dein Geschlecht')
        return
      }

      if (!formData.profileImage) {
        setError('Bitte lade ein Profilbild hoch')
        return
      }
    }

    setLoading(true)

    try {
      const registrationData = {
        name: `${formData.firstName} ${formData.lastName}`.trim() || formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        playerData: formData.role === 'PLAYER' ? {
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          currentLeague: formData.currentLeague,
          desiredLeague: formData.desiredLeague || undefined,
          interestedClubs: formData.interestedClubs,
          schoolName: formData.schoolName,
          schoolType: formData.schoolType,
          graduationYear: formData.graduationYear ? parseInt(formData.graduationYear) : undefined,
          phone: formData.phone,
          instagram: formData.instagram,
          achievements: formData.achievements,
          canton: formData.canton,
          city: formData.city,
          position: formData.position,
          height: formData.height ? parseFloat(formData.height) : undefined,
          blockReach: formData.blockReach ? parseFloat(formData.blockReach) : undefined,
          spikeReach: formData.spikeReach ? parseFloat(formData.spikeReach) : undefined,
          jerseyNumber: formData.jerseyNumber ? parseInt(formData.jerseyNumber) : undefined,
          profileImage: formData.profileImage,
          coverImage: formData.coverImage || undefined,
          bio: formData.bio || undefined,
        } : undefined,
      }

      await axios.post('/api/auth/register', registrationData)

      router.push('/auth/login?registered=true')
    } catch (error: any) {
      setError(error.response?.data?.error || 'Ein Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 relative mb-6">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
              <circle cx="50" cy="50" r="48" fill="#FF0000"/>
              <path d="M 50 30 Q 45 35 45 40 L 45 50 Q 45 55 50 58 Q 55 55 55 50 L 55 40 Q 55 35 50 30 Z" 
                    fill="white" stroke="white" strokeWidth="1"/>
              <path d="M 50 30 L 42 28 L 50 35 Z" fill="#FFD700" stroke="#FFA500" strokeWidth="0.5"/>
              <path d="M 45 50 Q 30 45 25 55 Q 28 58 35 55 Q 40 53 45 52 Z" 
                    fill="white" stroke="white" strokeWidth="1"/>
              <path d="M 55 50 Q 70 45 75 55 Q 72 58 65 55 Q 60 53 55 52 Z" 
                    fill="white" stroke="white" strokeWidth="1"/>
              <path d="M 48 58 L 45 70 L 48 68 Z" fill="white" opacity="0.9"/>
              <path d="M 50 58 L 50 72 L 50 68 Z" fill="white" opacity="0.9"/>
              <path d="M 52 58 L 55 70 L 52 68 Z" fill="white" opacity="0.9"/>
              <circle cx="47" cy="38" r="2" fill="#FF0000"/>
              <circle cx="47" cy="38" r="1" fill="white"/>
              <rect x="48" y="48" width="4" height="2" fill="#FF0000"/>
              <rect x="49" y="47" width="2" height="4" fill="#FF0000"/>
            </svg>
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
            Willkommen bei Habicht
          </h2>
          <p className="text-lg text-gray-600 mb-4">
            Deine Volleyball-Zukunft startet hier
          </p>
          
          {/* Progress Steps */}
          {formData.role === 'PLAYER' && (
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className={`flex items-center gap-2 ${step === 1 ? 'text-red-600' : 'text-green-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === 1 ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                }`}>
                  {step > 1 ? '✓' : '1'}
                </div>
                <span className="font-medium">Account</span>
              </div>
              <div className="w-16 h-0.5 bg-gray-300" />
              <div className={`flex items-center gap-2 ${step === 2 ? 'text-red-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === 2 ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  2
                </div>
                <span className="font-medium">Spieler Info</span>
              </div>
            </div>
          )}
          
          <p className="text-sm text-gray-600">
            Oder{' '}
            <Link href="/auth/login" className="font-medium text-red-600 hover:text-red-500">
              meld dich aa
            </Link>
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            )}

            {/* Step 1: Basic Account Info */}
            {step === 1 && (
              <div className="space-y-5">
            {/* Step 1: Basic Account Info */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      <User className="w-4 h-4 inline mr-1" />
                      Vorname *
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Max"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nachname *
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Müller"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="max.mueller@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Ich bin...
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                  >
                    <option value="PLAYER">🏐 Spieler/in (bis 26 Jahre)</option>
                    <option value="RECRUITER">🔍 Recruiter / Scout</option>
                    <option value="CLUB_MANAGER">⚙️ Club Manager</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      <Lock className="w-4 h-4 inline mr-1" />
                      Passwort *
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Min. 8 Zeichen"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Bestätigen *
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Wiederholen"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formData.role === 'PLAYER' ? 'Weiter zu Spieler Info →' : loading ? 'Wird erstellt...' : 'Konto erstellen'}
                </button>
              </div>
            )}

            {/* Step 2: Player Specific Info */}
            {step === 2 && formData.role === 'PLAYER' && (
              <div className="space-y-5">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800 font-medium">
                    🏐 Jetzt nur noch ein paar Details zu deiner Volleyball-Karriere!
                  </p>
                </div>

                {/* Profile & Cover Images */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    📸 Profilbilder (Erforderlich)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ImageUpload
                      label="Profilbild"
                      value={formData.profileImage}
                      onChange={(base64) => setFormData({ ...formData, profileImage: base64 })}
                      aspectRatio="square"
                      required
                      helpText="Zeig dein Gesicht! Wird auf deinem Profil angezeigt."
                    />
                    <ImageUpload
                      label="Hintergrundbild"
                      value={formData.coverImage}
                      onChange={(base64) => setFormData({ ...formData, coverImage: base64 })}
                      aspectRatio="banner"
                      helpText="Optional: Ein Action-Shot oder Team-Foto als Banner."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">                {/* Bio/Description */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    📝 Über mich
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio || ''}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Erzähl etwas über dich, deine Spielweise, Ziele..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Diese Beschreibung wird auf deinem Profil angezeigt</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      📱 Telefonnummer
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="+41 79 123 45 67"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      📧 Kontakt Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="dein@email.ch"
                    />
                  </div>
                </div>
                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Geburtsdatum * (bis 26 Jahre)
                    </label>
                    <input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      required
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                      min={new Date(new Date().setFullYear(new Date().getFullYear() - 26)).toISOString().split('T')[0]}
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    {formData.dateOfBirth && (
                      <p className="text-xs text-gray-600 mt-1">
                        Alter: {calculateAge(formData.dateOfBirth)} Jahre
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                      Geschlecht *
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      required
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                    >
                      <option value="">Wähle...</option>
                      <option value="MALE">♂ Männlich</option>
                      <option value="FEMALE">♀ Weiblich</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    Position * (Was spielst du?)
                  </label>
                  <select
                    id="position"
                    name="position"
                    required
                    value={formData.position}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                  >
                    <option value="">Wähle deine Position...</option>
                    <option value="OUTSIDE_HITTER">Aussenspieler (Outside Hitter)</option>
                    <option value="OPPOSITE">Diagonalspieler (Opposite)</option>
                    <option value="MIDDLE_BLOCKER">Mittelblocker (Middle Blocker)</option>
                    <option value="SETTER">Zuspieler (Setter)</option>
                    <option value="LIBERO">Libero</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                      Grösse (cm) *
                    </label>
                    <input
                      id="height"
                      name="height"
                      type="number"
                      min="150"
                      max="220"
                      required
                      value={formData.height}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="180"
                    />
                  </div>

                  <div>
                    <label htmlFor="jerseyNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Trikot #
                    </label>
                    <input
                      id="jerseyNumber"
                      name="jerseyNumber"
                      type="number"
                      min="1"
                      max="99"
                      value={formData.jerseyNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="7"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="blockReach" className="block text-sm font-medium text-gray-700 mb-1">
                      Blockreichweite (cm)
                    </label>
                    <input
                      id="blockReach"
                      name="blockReach"
                      type="number"
                      min="200"
                      max="380"
                      value={formData.blockReach}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="310"
                    />
                    <p className="text-xs text-gray-500 mt-1">Höchste Punkt beim Blocken</p>
                  </div>

                  <div>
                    <label htmlFor="spikeReach" className="block text-sm font-medium text-gray-700 mb-1">
                      Angriffsreichweite (cm)
                    </label>
                    <input
                      id="spikeReach"
                      name="spikeReach"
                      type="number"
                      min="200"
                      max="380"
                      value={formData.spikeReach}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="330"
                    />
                    <p className="text-xs text-gray-500 mt-1">Höchste Punkt beim Angriff</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="currentLeague" className="block text-sm font-medium text-gray-700 mb-1">
                      Aktuelle Liga
                    </label>
                    <select
                      id="currentLeague"
                      name="currentLeague"
                      value={formData.currentLeague}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                    >
                      <option value="">Wähle...</option>
                      <option value="NLA">NLA</option>
                      <option value="NLB">NLB</option>
                      <option value="ERSTE_LIGA">1. Liga</option>
                      <option value="ZWEITE_LIGA">2. Liga</option>
                      <option value="DRITTE_LIGA">3. Liga</option>
                      <option value="REGIONAL">Regional</option>
                    </select>
                  </div>
                </div>

                {/* NEW: Desired League & Club Interests */}
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-5">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-red-600" />
                    Wo möchtest du spielen?
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="desiredLeague" className="block text-sm font-medium text-gray-700 mb-2">
                        Ziel-Liga (optional)
                      </label>
                      <select
                        id="desiredLeague"
                        name="desiredLeague"
                        value={formData.desiredLeague}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                      >
                        <option value="">Wähle...</option>
                        <option value="NLA">NLA</option>
                        <option value="NLB">NLB</option>
                        <option value="ERSTE_LIGA">1. Liga</option>
                        <option value="ZWEITE_LIGA">2. Liga</option>
                      </select>
                    </div>

                    {formData.gender && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Clubs von Interesse (optional, max. 10)
                        </label>
                        <ClubSelector
                          gender={formData.gender === 'MALE' ? 'MEN' : 'WOMEN'}
                          selectedClubs={formData.interestedClubs}
                          onChange={(clubIds) => setFormData({ ...formData, interestedClubs: clubIds })}
                          desiredLeague={formData.desiredLeague as any}
                          maxSelections={10}
                        />
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-600 mt-3 italic">
                    💡 Coaches dieser Clubs können dein Profil leichter finden und dich kontaktieren
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Stadt
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Zürich"
                    />
                  </div>

                  <div>
                    <label htmlFor="canton" className="block text-sm font-medium text-gray-700 mb-1">
                      Kanton
                    </label>
                    <select
                      id="canton"
                      name="canton"
                      value={formData.canton}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                    >
                      <option value="">Wähle...</option>
                      <option value="ZH">Zürich</option>
                      <option value="BE">Bern</option>
                      <option value="LU">Luzern</option>
                      <option value="UR">Uri</option>
                      <option value="SZ">Schwyz</option>
                      <option value="OW">Obwalden</option>
                      <option value="NW">Nidwalden</option>
                      <option value="GL">Glarus</option>
                      <option value="ZG">Zug</option>
                      <option value="FR">Fribourg</option>
                      <option value="SO">Solothurn</option>
                      <option value="BS">Basel-Stadt</option>
                      <option value="BL">Basel-Landschaft</option>
                      <option value="SH">Schaffhausen</option>
                      <option value="AR">Appenzell Ausserrhoden</option>
                      <option value="AI">Appenzell Innerrhoden</option>
                      <option value="SG">St. Gallen</option>
                      <option value="GR">Graubünden</option>
                      <option value="AG">Aargau</option>
                      <option value="TG">Thurgau</option>
                      <option value="TI">Ticino</option>
                      <option value="VD">Vaud</option>
                      <option value="VS">Valais</option>
                      <option value="NE">Neuchâtel</option>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-2">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    🎓 Ausbildung (Erforderlich)
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 mb-1">
                        Schule / Universität *
                      </label>
                      <input
                        id="schoolName"
                        name="schoolName"
                        type="text"
                        required
                        value={formData.schoolName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="z.B. Kantonsschule Zürich, ETH Zürich, Universität Bern..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="schoolType" className="block text-sm font-medium text-gray-700 mb-1">
                          Bildungsstufe *
                        </label>
                        <select
                          id="schoolType"
                          name="schoolType"
                          required
                          value={formData.schoolType}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                          <option value="">Wähle...</option>
                          <option value="GYMNASIUM">🏫 Gymnasium / Kantonsschule</option>
                          <option value="BERUFSSCHULE">📚 Berufsschule</option>
                          <option value="FH">🎓 Fachhochschule (FH)</option>
                          <option value="UNIVERSITY">🏛️ Universität / ETH</option>
                          <option value="OTHER">📖 Andere</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700 mb-1">
                          Abschlussjahr *
                        </label>
                        <select
                          id="graduationYear"
                          name="graduationYear"
                          required
                          value={formData.graduationYear}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                          <option value="">Wähle...</option>
                          {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 mt-3 italic">
                    💡 Deine Schule wird mit Logo auf deinem Profil angezeigt
                  </p>
                </div>

                {/* Achievements Section */}
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4 mb-2">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    Erfolge & Auszeichnungen
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Füge deine Erfolge hinzu (z.B. Meisterschaften, MVP Awards, All-Star)
                    </label>
                    <div className="space-y-2">
                      {formData.achievements.map((achievement, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={achievement}
                            onChange={(e) => {
                              const newAchievements = [...formData.achievements]
                              newAchievements[index] = e.target.value
                              setFormData({ ...formData, achievements: newAchievements })
                            }}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                            placeholder="z.B. NLA Meister 2024"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newAchievements = formData.achievements.filter((_, i) => i !== index)
                              setFormData({ ...formData, achievements: newAchievements })
                            }}
                            className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm font-medium"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, achievements: [...formData.achievements, ''] })
                        }}
                        className="w-full px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition text-sm font-medium"
                      >
                        + Erfolg hinzufügen
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Telefon (optional)
                    </label>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Telefon (optional)
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="+41 79 123 45 67"
                    />
                  </div>

                  <div>
                    <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                      Instagram (optional)
                    </label>
                    <input
                      id="instagram"
                      name="instagram"
                      type="text"
                      value={formData.instagram}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="@dein_username"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="achievements" className="block text-sm font-medium text-gray-700 mb-1">
                    <Award className="w-4 h-4 inline mr-1" />
                    Erfolge & Highlights (optional)
                  </label>
                  <textarea
                    id="achievements"
                    name="achievements"
                    rows={4}
                    value={formData.achievements}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    placeholder="z.B. Schweizer Meister U17 2023, MVP Kantonalmeisterschaft 2024, Nationalmannschaft U19..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    ← Zurück
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Wird erstellt...' : 'Profil erstellen ✓'}
                  </button>
                </div>
              </div>
            )}
        </form>
      </div>
    </div>
  )
}
