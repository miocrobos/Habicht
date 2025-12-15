'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Filter, MapPin, TrendingUp } from 'lucide-react'
import axios from 'axios'
import CantonFlag from '@/components/shared/CantonFlag'
import ClubBadge from '@/components/shared/ClubBadge'
import { getCantonInfo } from '@/lib/swissData'

export default function PlayersPage() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    position: '',
    canton: '',
    league: '',
    minHeight: '',
  })

  useEffect(() => {
    loadPlayers()
  }, [filters])

  const loadPlayers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      
      const response = await axios.get(`/api/players?${params}`)
      setPlayers(response.data.players)
    } catch (error) {
      console.error('Error loading players:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Spieler entdecken</h1>
          <p className="text-lg text-gray-600">
            Finde talentierte Schweizer Volleyball-Spieler
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Suche
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent"
                  placeholder="Name, Club, Schule..."
                />
              </div>
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <select
                value={filters.position}
                onChange={(e) => handleFilterChange('position', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent"
              >
                <option value="">Alle</option>
                <option value="OUTSIDE_HITTER">Aussenspieler</option>
                <option value="OPPOSITE">Diagonalspieler</option>
                <option value="MIDDLE_BLOCKER">Mittelblocker</option>
                <option value="SETTER">Zuspieler</option>
                <option value="LIBERO">Libero</option>
              </select>
            </div>

            {/* Canton */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kanton
              </label>
              <select
                value={filters.canton}
                onChange={(e) => handleFilterChange('canton', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent"
              >
                <option value="">Alle</option>
                <option value="ZH">Zürich</option>
                <option value="BE">Bern</option>
                <option value="VD">Vaud</option>
                <option value="AG">Aargau</option>
                <option value="SG">St. Gallen</option>
                <option value="GE">Genève</option>
                {/* Add more cantons */}
              </select>
            </div>

            {/* League */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Liga
              </label>
              <select
                value={filters.league}
                onChange={(e) => handleFilterChange('league', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent"
              >
                <option value="">Alle</option>
                <option value="NLA">NLA</option>
                <option value="NLB">NLB</option>
                <option value="FIRST_LEAGUE">1. Liga</option>
                <option value="YOUTH_U19">U19</option>
                <option value="YOUTH_U17">U17</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-habicht-600"></div>
            <p className="mt-4 text-gray-600">Lade Spieler...</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              {players.length} Spieler gfunde
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {players.map((player: any) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>

            {players.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600">Kei Spieler gfunde mit dene Filter</p>
                <button
                  onClick={() => setFilters({ search: '', position: '', canton: '', league: '', minHeight: '' })}
                  className="mt-4 text-habicht-600 hover:text-habicht-700 font-medium"
                >
                  Filter zurücksetzen
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function PlayerCard({ player }: { player: any }) {
  const cantonInfo = getCantonInfo(player.canton)
  
  return (
    <Link href={`/players/${player.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden cursor-pointer">
        {/* Profile Image with Canton Colors */}
        <div 
          className="h-48 flex items-center justify-center relative"
          style={{ 
            background: `linear-gradient(135deg, ${cantonInfo.colors.primary} 0%, ${cantonInfo.colors.secondary} 100%)`
          }}
        >
          <div className="text-white text-6xl font-bold z-10">
            {player.firstName[0]}{player.lastName[0]}
          </div>
          {/* Canton Flag Badge */}
          <div className="absolute top-3 right-3">
            <CantonFlag canton={player.canton} size="sm" />
          </div>
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center">
              <div 
                className="text-lg font-bold"
                style={{ color: cantonInfo.colors.primary }}
              >
                {player.height}
              </div>
              <div className="text-xs text-gray-600">cm</div>
            </div>
            <div className="text-center">
              <div 
                className="text-lg font-bold"
                style={{ color: cantonInfo.colors.primary }}
              >
                {player.currentLeague}
              </div>
              <div className="text-xs text-gray-600">Liga</div>
            </div>
            <div className="text-center">
              <div 
                className="text-lg font-bold"
                style={{ color: cantonInfo.colors.primary }}
              >
                {player.graduationYear}
              </div>
              <div className="text-xs text-gray-600">Jahr</div>
            </div>
          </div>

          {/* Club with Badge */}
          {player.currentClub && (
            <div className="flex items-center gap-2 mb-2 p-2 bg-gray-50 rounded">
              <ClubBadge clubName={player.currentClub.name} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {player.currentClub.name}
                </div>
              </div>
            </div>
          )}  <div className="text-lg font-bold text-habicht-600">{player.graduationYear}</div>
              <div className="text-xs text-gray-600">Jahr</div>
            </div>
          </div>

          {/* Club */}
          {player.currentClub && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span>{player.currentClub.name}</span>
            </div>
          )}

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{player.city}, {player.canton}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
