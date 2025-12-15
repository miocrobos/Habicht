'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Filter } from 'lucide-react'
import CantonFlag from '@/components/shared/CantonFlag'
import ClubBadge from '@/components/shared/ClubBadge'
import Link from 'next/link'
import axios from 'axios'

const CANTONS = [
  'Alle',
  'AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR',
  'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG',
  'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH'
]

const LEAGUES = ['Alle', 'NLA', 'NLB', '1. Liga', '2. Liga', '3. Liga', '4. Liga', 'U23', 'U19', 'U17']

export default function ClubsPage() {
  const searchParams = useSearchParams()
  const cantonFromUrl = searchParams.get('canton')
  
  const [selectedCanton, setSelectedCanton] = useState(cantonFromUrl || 'Alle')
  const [selectedLeague, setSelectedLeague] = useState('Alle')
  const [clubs, setClubs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (cantonFromUrl) {
      setSelectedCanton(cantonFromUrl)
    }
  }, [cantonFromUrl])

  useEffect(() => {
    loadClubs()
  }, [selectedCanton, selectedLeague])

  const loadClubs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCanton !== 'Alle') params.append('canton', selectedCanton)
      if (selectedLeague !== 'Alle') params.append('league', selectedLeague)
      
      const response = await axios.get(`/api/clubs?${params}`)
      setClubs(response.data.clubs)
    } catch (error) {
      console.error('Error loading clubs:', error)
    } finally {
      setLoading(false)
    }
  }

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
            <span className="font-medium">{clubs.length}</span>
            <span>Club{clubs.length !== 1 ? 's' : ''} gefunden</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-600">Lade Clubs...</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clubs.map((club: any) => (
                <div key={club.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <ClubBadge clubName={club.name} size="lg" />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{club.name}</h3>
                      <div className="flex items-center gap-2">
                        <CantonFlag canton={club.canton} size="sm" />
                        <p className="text-sm text-gray-600">{club.town}, {club.canton}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <span className="bg-habicht-100 text-habicht-700 px-3 py-1 rounded-full text-sm font-medium">
                      {club.leagueDisplay}
                    </span>
                  </div>
                  
                  {club.description && <p className="text-gray-700 mb-4">{club.description}</p>}
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <span className="font-medium">{club.playerCount}</span>
                    <span>Spieler registriert</span>
                  </div>
                  
                  <div className="flex gap-2">
                    {club.website && (
                      <a
                        href={club.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-habicht-600 text-white px-4 py-2 rounded-lg hover:bg-habicht-700 transition text-sm font-medium"
                      >
                        Website →
                      </a>
                    )}
                    <Link
                      href={`/players?club=${club.name}`}
                      className="inline-block bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
                    >
                      Spieler →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {clubs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Keine Clubs gefunden. Bitte passe deine Filter an.</p>
              </div>
            )}
          </>
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
