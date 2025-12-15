'use client'

import { useState, useEffect } from 'react'
import { Upload } from 'lucide-react'
import ImageUpload from '@/components/shared/ImageUpload'
import ClubBadge from '@/components/shared/ClubBadge'
import axios from 'axios'

export default function ManageClubLogosPage() {
  const [clubs, setClubs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClub, setSelectedClub] = useState<any>(null)
  const [newLogo, setNewLogo] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadClubs()
  }, [])

  const loadClubs = async () => {
    try {
      const response = await axios.get('/api/clubs')
      setClubs(response.data.clubs)
    } catch (error) {
      console.error('Error loading clubs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadLogo = async () => {
    if (!selectedClub || !newLogo) return

    try {
      setUploading(true)
      await axios.post(`/api/clubs/${selectedClub.id}/logo`, {
        logo: newLogo
      })
      
      // Refresh clubs list
      await loadClubs()
      
      // Reset selection
      setSelectedClub(null)
      setNewLogo('')
      
      alert('Logo erfolgreich hochgeladen!')
    } catch (error) {
      console.error('Error uploading logo:', error)
      alert('Fehler beim Hochladen des Logos')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Lade Clubs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Club Logos verwalten</h1>
          <p className="text-lg text-gray-600">
            Lade Logos für die Volleyball Clubs hoch
          </p>
        </div>

        {selectedClub ? (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-6">
              <button
                onClick={() => {
                  setSelectedClub(null)
                  setNewLogo('')
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Zurück zur Liste
              </button>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <ClubBadge clubName={selectedClub.name} size="lg" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedClub.name}</h2>
                <p className="text-gray-600">{selectedClub.canton} • {selectedClub.leagueDisplay}</p>
              </div>
            </div>

            <div className="max-w-md">
              <ImageUpload
                label="Club Logo"
                value={newLogo}
                onChange={(base64) => setNewLogo(base64)}
                aspectRatio="square"
                required
                helpText="Logo wird als Profilbild für den Club verwendet"
              />

              <button
                onClick={handleUploadLogo}
                disabled={!newLogo || uploading}
                className="mt-6 w-full bg-habicht-600 text-white px-6 py-3 rounded-lg hover:bg-habicht-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {uploading ? 'Wird hochgeladen...' : 'Logo speichern'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Wähle einen Club aus ({clubs.length} Clubs)
              </h3>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clubs.map((club: any) => (
                <button
                  key={club.id}
                  onClick={() => setSelectedClub(club)}
                  className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-habicht-500 hover:bg-habicht-50 transition text-left"
                >
                  <ClubBadge clubName={club.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{club.name}</h4>
                    <p className="text-sm text-gray-600">{club.canton} • {club.leagueDisplay}</p>
                  </div>
                  <Upload className="w-5 h-5 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
