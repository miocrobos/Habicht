'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import axios from 'axios'
import { MapPin, Users, Trophy, Globe, Mail, Phone, Facebook, Instagram, Twitter, Youtube, Calendar, Award, Filter, X } from 'lucide-react'
import { FaTiktok } from 'react-icons/fa'
import CantonFlag from '@/components/shared/CantonFlag'
import PlayerCard from '@/components/player/PlayerCard'
import RecruiterCard from '@/components/recruiter/RecruiterCard'
import { getCantonInfo } from '@/lib/swissData'
import { useLanguage } from '@/contexts/LanguageContext'

export default function ClubProfilePage() {
  const { t } = useLanguage()
  const params = useParams()
  const clubId = params.id as string
  const [club, setClub] = useState<any>(null)
  const [players, setPlayers] = useState<any[]>([])
  const [recruiters, setRecruiters] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'info' | 'players' | 'recruiters'>('info')
  const [loading, setLoading] = useState(true)
  const [playerFilters, setPlayerFilters] = useState({
    position: '',
    league: '',
    gender: '',
  })
  const [recruiterFilters, setRecruiterFilters] = useState({
    role: '',
    gender: '',
  })

  useEffect(() => {
    loadClubData()
  }, [clubId])

  useEffect(() => {
    if (activeTab === 'players') {
      loadPlayers()
    } else if (activeTab === 'recruiters') {
      loadRecruiters()
    }
  }, [activeTab, playerFilters, recruiterFilters])

  const loadClubData = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/clubs/${clubId}`)
      setClub(response.data)
    } catch (error) {
      console.error('Error loading club:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPlayers = async () => {
    try {
      const params = new URLSearchParams({
        club: clubId,
        ...playerFilters
      })
      const response = await axios.get(`/api/clubs/players?${params}`)
      setPlayers(response.data.players || [])
    } catch (error) {
      console.error('Error loading players:', error)
    }
  }

  const loadRecruiters = async () => {
    try {
      const params = new URLSearchParams({
        clubId,
        ...recruiterFilters
      })
      const response = await axios.get(`/api/recruiters?${params}`)
      setRecruiters(response.data.recruiters || [])
    } catch (error) {
      console.error('Error loading recruiters:', error)
    }
  }

  const clearPlayerFilters = () => {
    setPlayerFilters({ position: '', league: '', gender: '' })
  }

  const clearRecruiterFilters = () => {
    setRecruiterFilters({ role: '', gender: '' })
  }

  const getClubLeagues = () => {
    if (!club) return []
    const leagues: Array<{name: string, gender: string}> = []
    
    if (club.hasNLAMen) leagues.push({ name: 'NLA', gender: 'Männer' })
    if (club.hasNLAWomen) leagues.push({ name: 'NLA', gender: 'Frauen' })
    if (club.hasNLBMen) leagues.push({ name: 'NLB', gender: 'Männer' })
    if (club.hasNLBWomen) leagues.push({ name: 'NLB', gender: 'Frauen' })
    if (club.has1LigaMen) leagues.push({ name: '1. Liga', gender: 'Männer' })
    if (club.has1LigaWomen) leagues.push({ name: '1. Liga', gender: 'Frauen' })
    if (club.has2LigaMen) leagues.push({ name: '2. Liga', gender: 'Männer' })
    if (club.has2LigaWomen) leagues.push({ name: '2. Liga', gender: 'Frauen' })
    if (club.has3LigaMen) leagues.push({ name: '3. Liga', gender: 'Männer' })
    if (club.has3LigaWomen) leagues.push({ name: '3. Liga', gender: 'Frauen' })
    if (club.has4LigaMen) leagues.push({ name: '4. Liga', gender: 'Männer' })
    if (club.has4LigaWomen) leagues.push({ name: '4. Liga', gender: 'Frauen' })
    if (club.hasU23Men) leagues.push({ name: 'U23', gender: 'Männer' })
    if (club.hasU23Women) leagues.push({ name: 'U23', gender: 'Frauen' })
    if (club.hasU19Men) leagues.push({ name: 'U19', gender: 'Männer' })
    if (club.hasU19Women) leagues.push({ name: 'U19', gender: 'Frauen' })
    if (club.hasU17Men) leagues.push({ name: 'U17', gender: 'Männer' })
    if (club.hasU17Women) leagues.push({ name: 'U17', gender: 'Frauen' })
    
    return leagues
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('clubProfile.loading')}</p>
        </div>
      </div>
    )
  }

  if (!club) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">{t('clubProfile.notFound')}</p>
        </div>
      </div>
    )
  }

  const cantonInfo = getCantonInfo(club.canton)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with gradient background */}
      <div 
        className="relative h-64"
        style={{ 
          background: `linear-gradient(135deg, ${cantonInfo.colors.primary} 0%, ${cantonInfo.colors.secondary} 100%)`
        }}
      >
        <div className="absolute top-4 right-4">
          <CantonFlag canton={club.canton} size="lg" />
        </div>
        
        <div className="container mx-auto px-4 h-full flex items-end pb-8">
          <div className="flex items-end gap-6">
            {/* Club Logo */}
            <div className="w-32 h-32 rounded-2xl border-4 border-white dark:border-gray-800 shadow-xl overflow-hidden bg-white">
              {club.logo ? (
                <Image
                  src={club.logo}
                  alt={club.name}
                  width={128}
                  height={128}
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
                  🏐
                </div>
              )}
            </div>

            {/* Club Info */}
            <div className="text-white pb-2">
              <h1 className="text-4xl font-bold mb-2">{club.name}</h1>
              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{club.town}, {cantonInfo.name}</span>
                </div>
                {club.founded && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{t('clubProfile.founded')} {club.founded}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-4 px-2 border-b-2 font-semibold transition ${
                activeTab === 'info'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                {t('clubProfile.clubInfo')}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('players')}
              className={`py-4 px-2 border-b-2 font-semibold transition ${
                activeTab === 'players'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {t('clubProfile.players')}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('recruiters')}
              className={`py-4 px-2 border-b-2 font-semibold transition ${
                activeTab === 'recruiters'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {t('clubProfile.recruiters')}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Club Info Tab */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* Description */}
            {club.description && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('clubProfile.about')}</h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{club.description}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Contact & Social Media */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('clubProfile.contactSocial')}</h2>
                <div className="space-y-3">
                  {club.website && (
                    <a 
                      href={club.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition"
                    >
                      <Globe className="w-5 h-5" />
                      <span>Website</span>
                    </a>
                  )}
                  {club.email && (
                    <a 
                      href={`mailto:${club.email}`}
                      className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition"
                    >
                      <Mail className="w-5 h-5" />
                      <span>{club.email}</span>
                    </a>
                  )}
                  {club.phone && (
                    <a 
                      href={`tel:${club.phone}`}
                      className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition"
                    >
                      <Phone className="w-5 h-5" />
                      <span>{club.phone}</span>
                    </a>
                  )}
                  
                  {/* Social Media Links */}
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">{t('clubProfile.socialMedia')}</h3>
                    <div className="flex flex-wrap gap-3">
                      {club.facebook && (
                        <a 
                          href={club.facebook} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition"
                        >
                          <Facebook className="w-5 h-5" />
                        </a>
                      )}
                      {club.instagram && (
                        <a 
                          href={`https://instagram.com/${club.instagram.replace('@', '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 rounded-lg hover:bg-pink-200 dark:hover:bg-pink-900/40 transition"
                        >
                          <Instagram className="w-5 h-5" />
                        </a>
                      )}
                      {club.tiktok && (
                        <a 
                          href={`https://tiktok.com/@${club.tiktok.replace('@', '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 bg-black dark:bg-gray-900 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition"
                        >
                          <FaTiktok className="w-5 h-5" />
                        </a>
                      )}
                      {club.twitter && (
                        <a 
                          href={`https://twitter.com/${club.twitter.replace('@', '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-500 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition"
                        >
                          <Twitter className="w-5 h-5" />
                        </a>
                      )}
                      {club.youtube && (
                        <a 
                          href={club.youtube} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition"
                        >
                          <Youtube className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Club Leagues/Teams */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('clubProfile.teamsLeagues')}</h2>
                {getClubLeagues().length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {getClubLeagues().map((league, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg border border-red-200 dark:border-red-800"
                      >
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{league.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{league.gender}</p>
                        </div>
                        <Trophy className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">{t('clubProfile.noLeagues')}</p>
                )}
              </div>

              {/* Achievements */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('clubProfile.achievements')}</h2>
                {club.achievements && club.achievements.length > 0 ? (
                  <ul className="space-y-2">
                    {club.achievements.map((achievement: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <Trophy className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{achievement}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">{t('clubProfile.noAchievements')}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('players')}
                className="flex-1 bg-red-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
              >
                <Users className="w-5 h-5" />
                {t('clubProfile.viewPlayers')}
              </button>
              {club.website && (
                <a
                  href={club.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Globe className="w-5 h-5" />
                  Website
                </a>
              )}
            </div>
          </div>
        )}

        {/* Players Tab */}
        {activeTab === 'players' && (
          <div>
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filter</h3>
                </div>
                {(playerFilters.position || playerFilters.league || playerFilters.gender) && (
                  <button
                    onClick={clearPlayerFilters}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition"
                  >
                    <X className="w-4 h-4" />
                    Filter Lösche
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={playerFilters.gender}
                  onChange={(e) => setPlayerFilters({ ...playerFilters, gender: e.target.value })}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                >
                  <option value="">{t('clubProfile.gender')}</option>
                  <option value="MALE">{t('clubProfile.men')}</option>
                  <option value="FEMALE">{t('clubProfile.women')}</option>
                </select>
                <select
                  value={playerFilters.position}
                  onChange={(e) => setPlayerFilters({ ...playerFilters, position: e.target.value })}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                >
                  <option value="">{t('clubProfile.position')}</option>
                  <option value="OUTSIDE_HITTER">{t('playerProfile.positionOutsideHitter')}</option>
                  <option value="OPPOSITE">{t('playerProfile.positionOpposite')}</option>
                  <option value="MIDDLE_BLOCKER">{t('playerProfile.positionMiddleBlocker')}</option>
                  <option value="SETTER">{t('playerProfile.positionSetter')}</option>
                  <option value="LIBERO">{t('playerProfile.positionLibero')}</option>
                  <option value="UNIVERSAL">{t('playerProfile.positionUniversal')}</option>
                </select>
                <select
                  value={playerFilters.league}
                  onChange={(e) => setPlayerFilters({ ...playerFilters, league: e.target.value })}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                >
                  <option value="">{t('clubProfile.league')}</option>
                  <option value="NLA">NLA</option>
                  <option value="NLB">NLB</option>
                  <option value="FIRST_LEAGUE">{t('players.league1')}</option>
                  <option value="SECOND_LEAGUE">{t('players.league2')}</option>
                  <option value="THIRD_LEAGUE">{t('players.league3')}</option>
                  <option value="FOURTH_LEAGUE">{t('players.league4')}</option>
                  <option value="FIFTH_LEAGUE">{t('players.league5')}</option>
                </select>
              </div>
            </div>

            {/* Players Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {players.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>

            {players.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">{t('clubProfile.noPlayers')}</p>
              </div>
            )}
          </div>
        )}

        {/* Recruiters Tab */}
        {activeTab === 'recruiters' && (
          <div>
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('clubProfile.filter')}</h3>
                </div>
                {(recruiterFilters.role || recruiterFilters.gender) && (
                  <button
                    onClick={clearRecruiterFilters}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition"
                  >
                    <X className="w-4 h-4" />
                    {t('clubProfile.clearFilters')}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={recruiterFilters.role}
                  onChange={(e) => setRecruiterFilters({ ...recruiterFilters, role: e.target.value })}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Roll</option>
                  <option value="Cheftrainer">Cheftrainer</option>
                  <option value="Assistenztrainer">Assistenztrainer</option>
                  <option value="Jugendtrainer">Jugendtrainer</option>
                  <option value="Scout">Scout</option>
                  <option value="Teammanager">Teammanager</option>
                </select>
                <select
                  value={recruiterFilters.gender}
                  onChange={(e) => setRecruiterFilters({ ...recruiterFilters, gender: e.target.value })}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                >
                  <option value="">{t('recruiters.teamGenderLabel')}</option>
                  <option value="MALE">{t('clubProfile.men')}</option>
                  <option value="FEMALE">{t('clubProfile.women')}</option>
                </select>
              </div>
            </div>

            {/* Recruiters Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recruiters.map((recruiter) => (
                <RecruiterCard key={recruiter.id} recruiter={recruiter} />
              ))}
            </div>

            {recruiters.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">{t('clubProfile.noRecruiters')}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
