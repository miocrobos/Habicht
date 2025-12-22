'use client'

import { useState } from 'react'
import { Upload, Video, X } from 'lucide-react'

interface VideoUploadProps {
  value: string
  onChange: (value: string) => void
  label?: string
}

export default function VideoUpload({ value, onChange, label = 'Video hochladen' }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith('video/')) {
      alert('Bitte wähle eine Video-Datei aus')
      return
    }

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert(t('errors.videoTooLarge'))
      return
    }

    setUploading(true)
    try {
      // Convert to base64
      const reader = new FileReader()
      reader.onloadend = () => {
        onChange(reader.result as string)
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Video upload error:', error)
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        <Video className="w-4 h-4 inline mr-1" />
        {label}
      </label>
      
      {!value ? (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-red-500 dark:hover:border-red-400 transition">
          <input
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
            id="video-upload"
            disabled={uploading}
          />
          <label
            htmlFor="video-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {uploading ? 'Wird hochgeladen...' : 'Klicke zum Hochladen'}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-500">
              MP4, MOV, AVI (max. 50MB)
            </span>
          </label>
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden bg-black">
          <video
            src={value}
            controls
            className="w-full h-48 object-contain"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
