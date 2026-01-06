'use client'
import { toast } from 'react-hot-toast';

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, Upload, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import axios from 'axios'
import ImageUpload from './ImageUpload'
import { useHeader } from '@/contexts/HeaderContext'
import { useLanguage } from '@/contexts/LanguageContext'

interface Photo {
  id: string
  photoUrl: string
  order: number
  createdAt: string
}

interface PhotoGalleryProps {
  playerId: string
  isOwner: boolean
  isVerified: boolean
}

export default function PhotoGallery({ playerId, isOwner, isVerified }: PhotoGalleryProps) {
  const { t } = useLanguage()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [newPhotoUrl, setNewPhotoUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const { collapsed } = useHeader()

  useEffect(() => {
    fetchPhotos()
  }, [playerId])

  const fetchPhotos = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/players/${playerId}/photos`)
      setPhotos(response.data.photos || [])
    } catch (error) {
      console.error('Error fetching photos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadPhoto = async () => {
    if (!newPhotoUrl) {
      toast.error(t('toast.selectPhoto'))
      return
    }

    try {
      setUploading(true)
      await axios.post(`/api/players/${playerId}/photos`, {
        photoUrl: newPhotoUrl
      })
      
      setNewPhotoUrl('')
      setShowUploadModal(false)
      await fetchPhotos()
    } catch (error: any) {
      console.error('Error uploading photo:', error)
      toast.error(error.response?.data?.error || t('toast.uploadPhotoError'))
    } finally {
      setUploading(false)
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm(t('playerProfile.confirmDeletePhoto'))) {
      return
    }

    try {
      await axios.delete(`/api/players/${playerId}/photos/${photoId}`)
      await fetchPhotos()
      setSelectedIndex(null)
    } catch (error) {
      console.error('Error deleting photo:', error)
      toast.error(t('toast.deletePhotoError'))
    }
  }

  const nextPhoto = () => {
    if (selectedIndex !== null && selectedIndex < photos.length - 1) {
      setSelectedIndex(selectedIndex + 1)
    }
  }

  const prevPhoto = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-swiss-red"></div>
      </div>
    )
  }

  if (photos.length === 0 && !isOwner) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Photo Gallery</h3>
        {isOwner && isVerified && photos.length < 10 && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-swiss-red text-white rounded-lg hover:bg-red-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add Photo ({photos.length}/10)
          </button>
        )}
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Upload className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">{t('common.noPhotosYet') || 'No photos yet'}</p>
          {isOwner && !isVerified && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
              {t('common.verifyEmailToUpload') || 'Please verify your email to upload photos'}
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative aspect-square group cursor-pointer"
              onClick={() => setSelectedIndex(index)}
            >
              <Image
                src={photo.photoUrl}
                alt={`Photo ${index + 1}`}
                fill
                className="object-cover rounded-lg"
              />
              {isOwner && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeletePhoto(photo.id)
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('common.uploadPhoto') || 'Upload Photo'}</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <ImageUpload
                label={t('common.selectPhoto') || 'Select Photo'}
                value={newPhotoUrl}
                onChange={setNewPhotoUrl}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  {t('common.cancel') || 'Cancel'}
                </button>
                <button
                  onClick={handleUploadPhoto}
                  disabled={!newPhotoUrl || uploading}
                  className="flex-1 px-4 py-2 bg-swiss-red text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (t('common.uploading') || 'Uploading...') : (t('common.upload') || 'Upload')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute right-20 text-white hover:text-red-400 bg-black bg-opacity-60 rounded-full p-2 z-50 transition-all duration-300"
            style={{ 
              top: collapsed ? '1rem' : '5rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)' 
            }}
          >
            <X className="w-10 h-10" />
          </button>

          <button
            onClick={prevPhoto}
            disabled={selectedIndex === 0}
            className="absolute left-4 text-white hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-12 h-12" />
          </button>

          <div 
            className="relative w-full max-w-4xl h-full flex items-center justify-center p-4 transition-all duration-300"
            style={{
              maxHeight: collapsed ? '80vh' : 'calc(80vh - 4rem)',
              marginTop: collapsed ? '0' : '4rem'
            }}
          >
            <Image
              src={photos[selectedIndex].photoUrl}
              alt={`Photo ${selectedIndex + 1}`}
              fill
              className="object-contain"
            />
          </div>

          <button
            onClick={nextPhoto}
            disabled={selectedIndex === photos.length - 1}
            className="absolute right-4 text-white hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-12 h-12" />
          </button>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
            {selectedIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </div>
  )
}
