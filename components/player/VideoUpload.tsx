'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Youtube, Instagram, Music2, Link as LinkIcon } from 'lucide-react'
import axios from 'axios'

interface VideoUploadProps {
  playerId: string
  onUploadComplete?: () => void
}

type UploadType = 'file' | 'youtube' | 'instagram' | 'tiktok'

export default function VideoUpload({ playerId, onUploadComplete }: VideoUploadProps) {
  const [uploadType, setUploadType] = useState<UploadType>('file')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [highlightType, setHighlightType] = useState('HIGHLIGHTS')
  const [externalUrl, setExternalUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    
    try {
      // Create form data
      const formData = new FormData()
      formData.append('file', file)
      formData.append('playerId', playerId)
      formData.append('title', title || file.name)
      formData.append('description', description)
      formData.append('highlightType', highlightType)
      formData.append('upload_preset', 'habicht_videos') // Cloudinary preset

      // Upload to Cloudinary via API route
      const response = await axios.post('/api/videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total 
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0
          setUploadProgress(progress)
        },
      })

      // Reset form
      setTitle('')
      setDescription('')
      setUploadProgress(0)
      onUploadComplete?.()
      
      alert('Video erfolgreich hochgeladen!')
    } catch (error) {
      console.error('Upload error:', error)
      alert('Fehler beim Hochladen. Bitte versuche es erneut.')
    } finally {
      setUploading(false)
    }
  }, [playerId, title, description, highlightType, onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv']
    },
    maxSize: 500 * 1024 * 1024, // 500MB
    multiple: false
  })

  const handleExternalUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      await axios.post('/api/videos/external', {
        playerId,
        title,
        description,
        highlightType,
        videoUrl: externalUrl,
        videoType: uploadType.toUpperCase()
      })

      // Reset form
      setTitle('')
      setDescription('')
      setExternalUrl('')
      onUploadComplete?.()
      
      alert('Video erfolgreich hinzugefügt!')
    } catch (error) {
      console.error('Error adding video:', error)
      alert('Fehler beim Hinzufügen. Bitte versuche es erneut.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Video hinzufügen</h2>

      {/* Upload Type Selection */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <TypeButton
          active={uploadType === 'file'}
          onClick={() => setUploadType('file')}
          icon={<Upload className="w-4 h-4" />}
        >
          Upload
        </TypeButton>
        <TypeButton
          active={uploadType === 'youtube'}
          onClick={() => setUploadType('youtube')}
          icon={<Youtube className="w-4 h-4" />}
        >
          YouTube
        </TypeButton>
        <TypeButton
          active={uploadType === 'instagram'}
          onClick={() => setUploadType('instagram')}
          icon={<Instagram className="w-4 h-4" />}
        >
          Instagram
        </TypeButton>
        <TypeButton
          active={uploadType === 'tiktok'}
          onClick={() => setUploadType('tiktok')}
          icon={<Music2 className="w-4 h-4" />}
        >
          TikTok
        </TypeButton>
      </div>

      {/* Common Fields */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Titel *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent"
            placeholder="z.B. Highlights NLA Match vs Lausanne"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Beschreibung
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent"
            placeholder="Beschreib dini best Szene..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kategorie *
          </label>
          <select
            value={highlightType}
            onChange={(e) => setHighlightType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent"
          >
            <option value="HIGHLIGHTS">Highlights</option>
            <option value="FULL_MATCH">Ganzes Match</option>
            <option value="SKILLS">Skills</option>
            <option value="SERVING">Service</option>
            <option value="ATTACKING">Angriff</option>
            <option value="BLOCKING">Block</option>
            <option value="DEFENSE">Defense</option>
            <option value="SETTING">Zuspiel</option>
            <option value="TRAINING">Training</option>
          </select>
        </div>
      </div>

      {/* Upload Area or URL Input */}
      {uploadType === 'file' ? (
        <div>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition ${
              isDragActive
                ? 'border-habicht-500 bg-habicht-50'
                : 'border-gray-300 hover:border-habicht-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            {isDragActive ? (
              <p className="text-lg text-habicht-600">Drop video here...</p>
            ) : (
              <>
                <p className="text-lg mb-2">
                  Drag & drop dini Video hier, oder klick zum Usewähle
                </p>
                <p className="text-sm text-gray-500">
                  MP4, MOV, AVI oder MKV (max. 500MB)
                </p>
              </>
            )}
          </div>

          {uploading && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-habicht-600 h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleExternalUrlSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {uploadType === 'youtube' && 'YouTube URL'}
              {uploadType === 'instagram' && 'Instagram URL'}
              {uploadType === 'tiktok' && 'TikTok URL'}
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent"
                placeholder={
                  uploadType === 'youtube' ? 'https://youtube.com/watch?v=...' :
                  uploadType === 'instagram' ? 'https://instagram.com/p/...' :
                  'https://tiktok.com/@username/video/...'
                }
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading || !title || !externalUrl}
            className="w-full bg-habicht-600 text-white py-3 rounded-lg font-semibold hover:bg-habicht-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Wird hinzugefügt...' : 'Video hinzufügen'}
          </button>
        </form>
      )}
    </div>
  )
}

function TypeButton({ 
  active, 
  onClick, 
  icon, 
  children 
}: { 
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
        active
          ? 'bg-habicht-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {icon}
      {children}
    </button>
  )
}
