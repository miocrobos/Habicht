'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

interface ImageUploadProps {
  label: string
  value: string
  onChange: (base64: string) => void
  aspectRatio?: 'square' | 'banner'
  required?: boolean
  helpText?: string
}

export default function ImageUpload({
  label,
  value,
  onChange,
  aspectRatio = 'square',
  required = false,
  helpText
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (file: File) => {
    setError('')

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Bitte wähle eine Bilddatei aus')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Bild darf maximal 5MB gross sein')
      return
    }

    try {
      // Convert to base64
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        onChange(base64)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError('Fehler beim Hochladen des Bildes')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileChange(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemove = () => {
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const aspectClasses = aspectRatio === 'square' 
    ? 'aspect-square' 
    : 'aspect-[3/1]'

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-600 dark:text-red-400">*</span>}
      </label>

      {value ? (
        <div className="relative group">
          <div className={`w-full ${aspectClasses} rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700`}>
            <img
              src={value}
              alt={label}
              className="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-600 dark:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 dark:hover:bg-red-800"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleClick}
            className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
          >
            <span className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg font-medium text-gray-900 dark:text-gray-100 shadow-lg">
              Bild ändern
            </span>
          </button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            w-full ${aspectClasses} 
            border-2 border-dashed rounded-xl 
            cursor-pointer transition-all
            flex flex-col items-center justify-center
            ${isDragging 
              ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-red-400 dark:hover:border-red-500 hover:bg-gray-50 dark:hover:bg-gray-800/30'
            }
          `}
        >
          <ImageIcon className={`w-12 h-12 mb-3 ${isDragging ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`} />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {isDragging ? 'Bild hier ablegen' : 'Klicke oder ziehe ein Bild hierher'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            PNG, JPG oder WEBP (max. 5MB)
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
        className="hidden"
      />

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {helpText && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{helpText}</p>
      )}
    </div>
  )
}
