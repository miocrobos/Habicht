
'use client'
import { toast } from 'react-hot-toast';

import { useState, useEffect } from 'react'
import { X, Upload, Plus, Trash2 } from 'lucide-react'
import axios from 'axios'
import { useLanguage } from '@/contexts/LanguageContext'

interface Video {
  id: string
  videoUrl: string
  title: string | null
  order: number
  createdAt: string
}

interface RecruiterVideoGalleryProps {
  recruiterId: string
  isOwner: boolean
}

export default function RecruiterVideoGallery({ recruiterId, isOwner }: RecruiterVideoGalleryProps) {
  const { t } = useLanguage()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [newVideoUrl, setNewVideoUrl] = useState('')
  const [newVideoTitle, setNewVideoTitle] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchVideos()
  }, [recruiterId])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/recruiters/${recruiterId}/videos`)
      setVideos(response.data.videos || [])
    } catch (error) {
      console.error('Error fetching videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadVideo = async () => {
    if (!newVideoUrl) {
      toast.error(t('toast.enterVideoUrl'))
      return
    }

    try {
      setUploading(true)
      await axios.post(`/api/recruiters/${recruiterId}/videos`, {
        videoUrl: newVideoUrl,
        title: newVideoTitle || 'Untitled Video'
      })
      
      setNewVideoUrl('')
      setNewVideoTitle('')
      setShowUploadModal(false)
      await fetchVideos()
    } catch (error: any) {
      console.error('Error uploading video:', error)
      toast.error(error.response?.data?.error || t('toast.uploadVideoError'))
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm(t('playerProfile.confirmDeleteVideo'))) {
      return
    }

    try {
      await axios.delete(`/api/recruiters/${recruiterId}/videos?videoId=${videoId}`)
      await fetchVideos()
    } catch (error) {
      console.error('Error deleting video:', error)
      toast.error(t('toast.deleteVideoError'))
    }
  }

  const extractVideoId = (url: string) => {
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(youtubeRegex)
    return match ? match[1] : null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      {isOwner && (
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          <Plus className="w-4 h-4" />
          {t('playerProfile.addVideo') || 'Add Video'}
        </button>
      )}

      {/* Videos Grid */}
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => {
            const videoId = extractVideoId(video.videoUrl)
            return (
              <div key={video.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                {videoId ? (
                  <div className="relative aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title={video.title || 'Video'}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">{t('playerProfile.invalidVideoUrl') || 'Invalid video URL'}</p>
                  </div>
                )}
                
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                      {video.title || t('playerProfile.untitledVideo') || 'Untitled Video'}
                    </h4>
                    {isOwner && (
                      <button
                        onClick={() => handleDeleteVideo(video.id)}
                        className="flex-shrink-0 p-1 text-red-600 hover:text-red-700 transition"
                        title={t('playerProfile.deleteVideo') || 'Delete video'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(video.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">{t('playerProfile.noVideos') || 'No videos uploaded yet'}</p>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('playerProfile.addVideo') || 'Add Video'}</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('playerProfile.videoTitle') || 'Video Title'}
                </label>
                <input
                  type="text"
                  value={newVideoTitle}
                  onChange={(e) => setNewVideoTitle(e.target.value)}
                  placeholder={t('playerProfile.enterVideoTitle') || 'Enter video title'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  YouTube URL
                </label>
                <input
                  type="url"
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('playerProfile.pasteYoutubeUrl') || 'Paste a YouTube video URL'}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  {t('common.cancel') || 'Cancel'}
                </button>
                <button
                  onClick={handleUploadVideo}
                  disabled={!newVideoUrl || uploading}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (t('playerProfile.addingVideo') || 'Adding...') : (t('playerProfile.addVideo') || 'Add Video')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
