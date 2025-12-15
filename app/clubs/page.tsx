'use client'

import { useState } from 'react'
import { Filter } from 'lucide-react'
import CantonFlag from '@/components/shared/CantonFlag'

const CANTONS = [
  'Alle',
  'AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR',
  'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG',
  'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH'
]

const LEAGUES = ['Alle', 'NLA', 'NLB', '1. Liga', '2. Liga']

export default function ClubsPage() {
  const [selectedCanton, setSelectedCanton] = useState('Alle')
  const [selectedLeague, setSelectedLeague] = useState('Alle')
  
  const clubs = [
    {
      name: 'Volley Amriswil',
      league: 'NLA',
      canton: 'TG',
      website: 'https://www.volley-amriswil.ch',
      description: 'Top club in Nationalliga A'
    },
    {
      name: 'Volley Schönenwerd',
      league: 'NLA',
      canton: 'SO',
      website: 'https://www.volleyschoenenwerd.ch',
      description: 'Elite club with strong youth program'
    },
    {
      name: 'VC Kanti Schaffhausen',
      league: 'NLB',
      canton: 'SH',
      website: 'https://www.vckanti.ch',
      description: 'School-based volleyball excellence'
    },
    {
      name: 'Volley Toggenburg',
      league: 'NLA',
      canton: 'SG',
      website: 'https://www.volley-toggenburg.ch',
      description: 'Regional powerhouse'
    },
    {
      name: "SM'Aesch Pfeffingen",
      league: 'NLA',
      canton: 'BL',
      website: 'https://www.smvolley.ch',
      description: 'Championship contender'
    },
    {
      name: 'VBC Cheseaux',
      league: 'NLA',
      canton: 'VD',
      website: 'https://www.vbc-cheseaux.ch',
      description: 'Romande volleyball leader'
    },
    {
      name: 'Volley Alpnach',
      league: 'NLB',
      canton: 'OW',
      website: 'https://www.volley-alpnach.ch',
      description: 'Central Switzerland representative'
    },
  ]

  const filteredClubs = clubs.filter(club => {
    const matchesCanton = selectedCanton === 'Alle' || club.canton === selectedCanton
    const matchesLeague = selectedLeague === 'Alle' || club.league === selectedLeague
    return matchesCanton && matchesLeague
  })

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Schweizer Volleyball Clubs</h1>
        <p className="text-lg text-gray-600 mb-8">
          Übersicht über Schweizer Volleyball-Clubs in diverse Ligs
        </p>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filter</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Canton Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kanton
              </label>
              <select
                value={selectedCanton}
                onChange={(e) => setSelectedCanton(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {CANTONS.map(canton => (
                  <option key={canton} value={canton}>{canton}</option>
                ))}
              </select>
            </div>

            {/* League Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Liga
              </label>
              <select
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {LEAGUES.map(league => (
                  <option key={league} value={league}>{league}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">{filteredClubs.length}</span>
            <span>Club{filteredClubs.length !== 1 ? 's' : ''} gefunden</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{club.name}</h3>
                  <div className="flex items-center gap-2">
                    <CantonFlag canton={club.canton} size="sm" />
                    <p className="text-sm text-gray-600">{club.canton}</p>
                  </div>
                </div>
                <span className="bg-habicht-100 text-habicht-700 px-3 py-1 rounded-full text-sm font-medium">
                  {club.league}
                </span>
              </div>
              
              <p className="text-gray-700 mb-4">{club.description}</p>
              
              <a
                href={club.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-habicht-600 text-white px-4 py-2 rounded-lg hover:bg-habicht-700 transition text-sm font-medium"
              >
                Club Website →
              </a>
            </div>
          ))}
        </div>

        {filteredClubs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Keine Clubs gefunden. Bitte passe deine Filter an.</p>
          </div>
        )}

        <div className="mt-12 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-4">Din Club fehlt?</h2>
          <p className="text-gray-700 mb-4">
            Mir sind am Erwiitern vo üsere Club-Datenbank. Wenn din Club fehlt, meld dich bi üs!
          </p>
          <a
            href="mailto:info@habicht-volleyball.ch"
            className="inline-block bg-swiss-red text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-medium"
          >
            Club hinzufügen
          </a>
        </div>
      </div>
    </div>
  )
}
