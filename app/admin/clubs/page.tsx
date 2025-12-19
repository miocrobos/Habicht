'use client'

import { useState, useEffect } from 'react'
import { Upload, Link as LinkIcon, Save, Loader2, Search, Check, Plus } from 'lucide-react'
import axios from 'axios'
import Image from 'next/image'
import ImageUpload from '@/components/shared/ImageUpload'

// Admin panel for managing clubs - includes add new club feature
export default function ClubAdminPage() {
  const [clubs, setClubs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingClub, setEditingClub] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newClub, setNewClub] = useState({
    name: '',
    canton: '',
    town: '',
    website: '',
    logo: '',
    leagues: {
      hasNLAMen: false,
      hasNLAWomen: false,
      hasNLBMen: false,
      hasNLBWomen: false,
      has1LigaMen: false,
      has1LigaWomen: false,
      has2LigaMen: false,
      has2LigaWomen: false,
      has3LigaMen: false,
      has3LigaWomen: false,
      has4LigaMen: false,
      has4LigaWomen: false,
      hasU23Men: false,
      hasU23Women: false,
      hasU19Men: false,
      hasU19Women: false,
      hasU17Men: false,
      hasU17Women: false,
    }
  })

  const LEAGUE_OPTIONS = [
    { value: 'hasNLAMen', label: 'NLA Männer' },
    { value: 'hasNLAWomen', label: 'NLA Frauen' },
    { value: 'hasNLBMen', label: 'NLB Männer' },
    { value: 'hasNLBWomen', label: 'NLB Frauen' },
    { value: 'has1LigaMen', label: '1. Liga Männer' },
    { value: 'has1LigaWomen', label: '1. Liga Frauen' },
    { value: 'has2LigaMen', label: '2. Liga Männer' },
    { value: 'has2LigaWomen', label: '2. Liga Frauen' },
    { value: 'has3LigaMen', label: '3. Liga Männer' },
    { value: 'has3LigaWomen', label: '3. Liga Frauen' },
    { value: 'has4LigaMen', label: '4. Liga Männer' },
    { value: 'has4LigaWomen', label: '4. Liga Frauen' },
    { value: 'hasU23Men', label: 'U23 Männer' },
    { value: 'hasU23Women', label: 'U23 Frauen' },
    { value: 'hasU19Men', label: 'U19 Männer' },
    { value: 'hasU19Women', label: 'U19 Frauen' },
    { value: 'hasU17Men', label: 'U17 Männer' },
    { value: 'hasU17Women', label: 'U17 Frauen' },
  ];

  useEffect(() => {
    loadClubs()
  }, [])

  const loadClubs = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/clubs?all=true')
      setClubs(response.data.clubs)
    } catch (error) {
      console.error('Error loading clubs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveClub = async () => {
    if (!editingClub) return

    try {
      setSaving(true)
      await axios.put(`/api/clubs/${editingClub.id}`, {
        website: editingClub.website,
        logo: editingClub.logo,
        leagues: editingClub.leagues
      })
      
      setSuccessMessage(`${editingClub.name} erfolgreich aktualisiert!`)
      setTimeout(() => setSuccessMessage(''), 3000)
      
      setEditingClub(null)
      loadClubs()
    } catch (error) {
      console.error('Error saving club:', error)
      alert('Fehler beim Speichern')
    } finally {
      setSaving(false)
    }
  }

  const handleAddClub = async () => {
    if (!newClub.name || !newClub.canton || !newClub.town) {
      alert('Bitte füllen Sie Name, Kanton und Ort aus')
      return
    }

    try {
      setSaving(true)
      await axios.post('/api/clubs', newClub)
      
      setSuccessMessage(`${newClub.name} erfolgreich hinzugefügt!`)
      setTimeout(() => setSuccessMessage(''), 3000)
      
      setNewClub({ name: '', canton: '', town: '', website: '', logo: '', leagues: {
        hasNLAMen: false,
        hasNLAWomen: false,
        hasNLBMen: false,
        hasNLBWomen: false,
        has1LigaMen: false,
        has1LigaWomen: false,
        has2LigaMen: false,
        has2LigaWomen: false,
        has3LigaMen: false,
        has3LigaWomen: false,
        has4LigaMen: false,
        has4LigaWomen: false,
        hasU23Men: false,
        hasU23Women: false,
        hasU19Men: false,
        hasU19Women: false,
        hasU17Men: false,
        hasU17Women: false,
      } })
      setShowAddForm(false)
      loadClubs()
    } catch (error) {
      console.error('Error adding club:', error)
      alert('Fehler beim Hinzufügen')
    } finally {
      setSaving(false)
    }
  }

  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.town.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Club Verwaltung
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
              Verwalte Clubs, Websites und Logos
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-medium flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {showAddForm ? 'Abbrechen' : 'Neuer Club'}
          </button>
        </div>

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
            <Check className="w-5 h-5" />
            {successMessage}
          </div>
        )}

        {/* Add New Club Form */}
        {showAddForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Neuen Club hinzufügen</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Club Name *
                </label>
                <input
                  type="text"
                  value={newClub.name}
                  onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="z.B. Volley Luzern"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kanton *
                </label>
                <select
                  value={newClub.canton}
                  onChange={(e) => setNewClub({ ...newClub, canton: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Wählen...</option>
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
                  <option value="GE">Genève</option>
                  <option value="JU">Jura</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ort *
                </label>
                <input
                  type="text"
                  value={newClub.town}
                  onChange={(e) => setNewClub({ ...newClub, town: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="z.B. Luzern"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={newClub.website}
                  onChange={(e) => setNewClub({ ...newClub, website: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="https://club-website.ch"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Logo
                </label>
                <ImageUpload
                  label="Club Logo hochladen"
                  value={newClub.logo}
                  onChange={(value) => setNewClub({ ...newClub, logo: value })}
                  aspectRatio="square"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddClub}
                disabled={saving}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Speichert...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Club hinzufügen
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setNewClub({ name: '', canton: '', town: '', website: '', logo: '', leagues: {
                    hasNLAMen: false,
                    hasNLAWomen: false,
                    hasNLBMen: false,
                    hasNLBWomen: false,
                    has1LigaMen: false,
                    has1LigaWomen: false,
                    has2LigaMen: false,
                    has2LigaWomen: false,
                    has3LigaMen: false,
                    has3LigaWomen: false,
                    has4LigaMen: false,
                    has4LigaWomen: false,
                    hasU23Men: false,
                    hasU23Women: false,
                    hasU19Men: false,
                    hasU19Women: false,
                    hasU17Men: false,
                    hasU17Women: false,
                  } })
                }}
                disabled={saving}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium disabled:opacity-50"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
              placeholder="Suche nach Club-Name oder Ort..."
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Lade Clubs...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredClubs.map((club) => (
              <div key={club.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Club Info */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {club.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {club.town}, {club.canton}
                    </p>
                    
                    {/* Current Logo */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Aktuelles Logo:
                      </p>
                      {club.logo ? (
                        <div className="relative w-24 h-24 border border-gray-300 dark:border-gray-600 rounded">
                          <Image
                            src={club.logo}
                            alt={club.name}
                            fill
                            className="object-contain p-2"
                          />
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">Kein Logo hochgeladen</p>
                      )}
                    </div>

                    {/* Current Website */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Aktuelle Website:
                      </p>
                      {club.website ? (
                        <a
                          href={club.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
                        >
                          {club.website}
                        </a>
                      ) : (
                        <p className="text-sm text-gray-500 italic">Keine Website</p>
                      )}
                    </div>
                  </div>

                  {/* Editing Section */}
                  {editingClub?.id === club.id ? (
                    <>
                      {/* Logo Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Neues Logo hochladen
                        </label>
                        <ImageUpload
                          label="Logo"
                          value={editingClub.logo || ''}
                          onChange={(value) => setEditingClub({ ...editingClub, logo: value })}
                          aspectRatio="square"
                        />
                      </div>

                      {/* Website Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Website URL
                        </label>
                        <div className="relative mb-4">
                          <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="url"
                            value={editingClub.website || ''}
                            onChange={(e) => setEditingClub({ ...editingClub, website: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                            placeholder="https://club-website.ch"
                          />
                        </div>

                        {/* League Management */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Ligen (Wähl Alli Teams Vom Club)
                          </label>
                          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3">
                            {LEAGUE_OPTIONS.map(({ value, label }) => (
                              <label
                                key={value}
                                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded"
                              >
                                <input
                                  type="checkbox"
                                  checked={editingClub.leagues?.[value] || false}
                                  onChange={(e) => setEditingClub({ 
                                    ...editingClub, 
                                    leagues: { ...editingClub.leagues, [value]: e.target.checked }
                                  })}
                                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                />
                                <span className="text-sm">{label}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveClub}
                            disabled={saving}
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {saving ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Speichert...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4" />
                                Speichern
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => setEditingClub(null)}
                            disabled={saving}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium disabled:opacity-50"
                          >
                            Abbrechen
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="md:col-span-2 flex items-center justify-center">
                      <button
                        onClick={() => setEditingClub({ ...club })}
                        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-medium flex items-center gap-2"
                      >
                        <Upload className="w-5 h-5" />
                        Website & Logo bearbeiten
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredClubs.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">Keine Clubs gefunden.</p>
          </div>
        )}
      </div>
    </div>
  )
}
