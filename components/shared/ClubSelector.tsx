'use client'

import { useState, useEffect } from 'react'
import { getClubsByGenderAndLeague, getAllClubs, type ClubInfo } from '@/lib/clubsDatabase_comprehensive'
import { League } from '@prisma/client'
import { Filter } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface ClubSelectorProps {
  gender: 'MEN' | 'WOMEN'
  selectedClubs: string[]
  onChange: (clubIds: string[]) => void
  desiredLeague?: League
  maxSelections?: number
}

export default function ClubSelector({ 
  gender, 
  selectedClubs, 
  onChange, 
  desiredLeague,
  maxSelections = 10 
}: ClubSelectorProps) {
  const { t } = useLanguage()
  const [selectedLeague, setSelectedLeague] = useState<'NLA' | 'NLB' | '1. Liga' | '2. Liga' | 'ALL'>(
    desiredLeague as any || 'ALL'
  )
  const [selectedCanton, setSelectedCanton] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [clubs, setClubs] = useState<ClubInfo[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Get all Swiss cantons
  const cantons = [
    'ZH', 'BE', 'LU', 'UR', 'SZ', 'OW', 'NW', 'GL', 'ZG', 'FR', 'SO', 'BS', 'BL',
    'SH', 'AR', 'AI', 'SG', 'GR', 'AG', 'TG', 'TI', 'VD', 'VS', 'NE', 'GE', 'JU'
  ]

  useEffect(() => {
    const leagueMap: Partial<Record<League, 'NLA' | 'NLB' | '1. Liga' | '2. Liga'>> = {
      NLA: 'NLA',
      NLB: 'NLB',
      FIRST_LEAGUE: '1. Liga',
      SECOND_LEAGUE: '2. Liga',
      THIRD_LEAGUE: '2. Liga',
    }
    
    let filteredClubs: ClubInfo[]
    
    if (selectedLeague === 'ALL') {
      // Get all clubs for the gender
      filteredClubs = getAllClubs().filter(club => club.gender === gender)
    } else {
      const mappedLeague = desiredLeague ? leagueMap[desiredLeague] : selectedLeague
      filteredClubs = getClubsByGenderAndLeague(gender, mappedLeague as any)
    }

    // Filter by canton if selected
    if (selectedCanton !== 'ALL') {
      filteredClubs = filteredClubs.filter(club => club.canton === selectedCanton)
    }

    setClubs(filteredClubs)
  }, [gender, selectedLeague, selectedCanton, desiredLeague])

  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleClub = (clubId: string) => {
    if (selectedClubs.includes(clubId)) {
      onChange(selectedClubs.filter(id => id !== clubId))
    } else if (selectedClubs.length < maxSelections) {
      onChange([...selectedClubs, clubId])
    }
  }

  const getSelectedClubNames = () => {
    return clubs
      .filter(club => selectedClubs.includes(club.id))
      .map(club => club.shortName || club.name)
      .join(', ')
  }

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <button
        type="button"
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium text-gray-700"
      >
        <Filter className="w-4 h-4" />
        Filter {showFilters ? 'ausblenden' : 'anzeigen'}
        <span className="ml-2 bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs">
          {filteredClubs.length} Clubs
        </span>
      </button>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200">
          {/* League Filter */}
          {!desiredLeague && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Liga
              </label>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedLeague('ALL')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                    selectedLeague === 'ALL'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  Alle
                </button>
                {(['NLA', 'NLB', '1. Liga', '2. Liga'] as const).map(league => (
                  <button
                    key={league}
                    type="button"
                    onClick={() => setSelectedLeague(league)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                      selectedLeague === league
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    {league}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Canton Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('playerProfile.canton')}
            </label>
            <select
              value={selectedCanton}
              onChange={(e) => setSelectedCanton(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
            >
              <option value="ALL">{t('cantons.allCantons')}</option>
              {cantons.map(canton => (
                <option key={canton} value={canton}>{canton}</option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          <button
            type="button"
            onClick={() => {
              setSelectedLeague('ALL')
              setSelectedCanton('ALL')
              setSearchQuery('')
            }}
            className="text-sm text-gray-600 hover:text-gray-800 font-medium"
          >
            Filter zurücksetzen
          </button>
        </div>
      )}

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder={t('placeholders.searchClubCity')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Selection Summary */}
      {selectedClubs.length > 0 && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-900">
              {selectedClubs.length} von {maxSelections} Clubs ausgewählt
            </p>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Alle entfernen
            </button>
          </div>
          <p className="text-sm text-blue-700">{getSelectedClubNames()}</p>
        </div>
      )}

      {/* Clubs Grid */}
      <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
        <div className="grid gap-2">
          {filteredClubs.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Keine Clubs gefunden
            </p>
          ) : (
            filteredClubs.map(club => {
              const isSelected = selectedClubs.includes(club.id)
              const canSelect = selectedClubs.length < maxSelections || isSelected

              return (
                <button
                  key={club.id}
                  type="button"
                  onClick={() => canSelect && toggleClub(club.id)}
                  disabled={!canSelect}
                  className={`flex items-center justify-between p-3 rounded-lg text-left transition-all ${
                    isSelected
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : canSelect
                      ? 'bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      : 'bg-gray-50 border border-gray-200 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{club.logo}</span>
                    <div>
                      <div className="font-medium text-gray-900">
                        {club.shortName || club.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {club.city}, {club.canton}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>

      {selectedClubs.length >= maxSelections && (
        <p className="text-sm text-amber-600">
          ⚠️ Maximale Anzahl Clubs erreicht ({maxSelections})
        </p>
      )}
    </div>
  )
}
