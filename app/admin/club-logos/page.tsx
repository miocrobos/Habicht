
'use client'
import { toast } from 'react-hot-toast';

import { useState, useEffect } from 'react'
import { Upload, Plus, X } from 'lucide-react'
import ImageUpload from '@/components/shared/ImageUpload'
import ClubBadge from '@/components/shared/ClubBadge'
import { useLanguage } from '@/contexts/LanguageContext'
import axios from 'axios'

export default function ManageClubLogosPage() {
  const { t } = useLanguage()
  const [clubs, setClubs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClub, setSelectedClub] = useState<any>(null)
  const [newLogo, setNewLogo] = useState('')
  const [uploading, setUploading] = useState(false)
  const [showAddClub, setShowAddClub] = useState(false)
  const [newClub, setNewClub] = useState({
    name: '',
    canton: 'ZH',
    town: '',
    website: '',
    logo: ''
  })

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
      await axios.put(`/api/clubs/${selectedClub.id}`, {
        logo: newLogo
      })
      
      // Refresh clubs list
      await loadClubs()
      
      // Reset selection
      setSelectedClub(null)
      setNewLogo('')
      
      toast.success('Logo successfully uploaded!')
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast.error(t('errors.logoUploadError'))
    } finally {
      setUploading(false)
    }
  }

  const handleAddClub = async () => {
    if (!newClub.name || !newClub.canton) {
      toast.error(t('errors.enterNameCanton'))
      return
    }

    try {
      setUploading(true)
      await axios.post('/api/clubs', newClub)
      
      // Refresh clubs list
      await loadClubs()
      
      // Reset form
      setNewClub({
        name: '',
        canton: 'ZH',
        town: '',
        website: '',
        logo: ''
      })
      setShowAddClub(false)
      
      toast.success('Club successfully added!')
    } catch (error) {
      console.error('Error adding club:', error)
      toast.error(t('errors.clubAddError'))
    } finally {
      setUploading(false)
    }
  }

  const cantons = [
    'AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR', 'JU', 'LU',
    'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG', 'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH'
  ]

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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Club Logos verwalten</h1>
            <p className="text-lg text-gray-600">
              Lade Logos für die Volleyball Clubs hoch
            </p>
          </div>
          <button
            onClick={() => setShowAddClub(true)}
            className="flex items-center gap-2 bg-habicht-600 text-white px-6 py-3 rounded-lg hover:bg-habicht-700 transition font-medium"
          >
            <Plus className="w-5 h-5" />
            Neuer Club
          </button>
        </div>

        {showAddClub && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Neuen Club hinzufügen</h2>
                  <button
                    onClick={() => setShowAddClub(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Club Name *
                    </label>
                    <input
                      type="text"
                      value={newClub.name}
                      onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent"
                      placeholder="z.B. Volley Luzern"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kanton *
                    </label>
                    <select
                      value={newClub.canton}
                      onChange={(e) => setNewClub({ ...newClub, canton: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent"
                    >
                      {cantons.map((canton) => (
                        <option key={canton} value={canton}>{canton}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stadt/Ort
                    </label>
                    <input
                      type="text"
                      value={newClub.town}
                      onChange={(e) => setNewClub({ ...newClub, town: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent"
                      placeholder="z.B. Luzern"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={newClub.website}
                      onChange={(e) => setNewClub({ ...newClub, website: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <ImageUpload
                      label="Club Logo"
                      value={newClub.logo}
                      onChange={(base64) => setNewClub({ ...newClub, logo: base64 })}
                      aspectRatio="square"
                      helpText="Logo wird als Profilbild für den Club verwendet"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleAddClub}
                    disabled={!newClub.name || !newClub.canton || uploading}
                    className="flex-1 bg-habicht-600 text-white px-6 py-3 rounded-lg hover:bg-habicht-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {uploading ? 'Wird hinzugefügt...' : 'Club hinzufügen'}
                  </button>
                  <button
                    onClick={() => setShowAddClub(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
