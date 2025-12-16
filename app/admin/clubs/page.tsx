'use client'

import { useState, useEffect } from 'react'
import { Upload, Link as LinkIcon, Save, Loader2, Search, Check } from 'lucide-react'
import axios from 'axios'
import Image from 'next/image'
import ImageUpload from '@/components/shared/ImageUpload'

export default function ClubAdminPage() {
  const [clubs, setClubs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingClub, setEditingClub] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

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

  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.town.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Club Verwaltung - Websites & Logos
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Füge Webseiten und Logos zu den Clubs hinzu
        </p>

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
            <Check className="w-5 h-5" />
            {successMessage}
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
