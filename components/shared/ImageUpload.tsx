'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, FileText } from 'lucide-react'

interface ImageUploadProps {
  label: string
  value: string
  onChange: (base64: string) => void
  aspectRatio?: 'square' | 'banner'
  required?: boolean
  helpText?: string
  allowPdf?: boolean  // New prop to allow PDF uploads
}

export default function ImageUpload({
  label,
  value,
  onChange,
  aspectRatio = 'square',
  required = false,
  helpText,
  allowPdf = false
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  const [isPdf, setIsPdf] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check if the current value is a PDF
  const isCurrentValuePdf = value?.startsWith('data:application/pdf')

  const handleFileChange = async (file: File) => {
    setError('')

    // Validate file type
    const isImage = file.type.startsWith('image/')
    const isPdfFile = file.type === 'application/pdf'
    
    if (!isImage && !(allowPdf && isPdfFile)) {
      setError(allowPdf ? 'Please select an image or PDF file' : 'Please select an image file')
      return
    }

    // Validate file size (max 10MB for PDFs, 5MB for images)
    const maxSize = isPdfFile ? 10 * 1024 * 1024 : 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError(isPdfFile ? 'PDF must be max 10MB' : 'Image must be max 5MB')
      return
    }

    try {
      // Convert to base64
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setIsPdf(isPdfFile)
        onChange(base64)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError('Error uploading file')
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
          {isCurrentValuePdf ? (
            // PDF Preview
            <div className={`w-full ${aspectClasses} rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center`}>
              <FileText className="w-16 h-16 text-red-500 dark:text-red-400 mb-2" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">PDF Document</p>
              <a 
                href={value} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
                onClick={(e) => e.stopPropagation()}
              >
                View PDF
              </a>
            </div>
          ) : (
            // Image Preview
            <div className={`w-full ${aspectClasses} rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700`}>
              <img
                src={value}
                alt={label}
                className="w-full h-full object-cover"
              />
            </div>
          )}
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
              {isCurrentValuePdf ? 'Change file' : 'Change image'}
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
          {allowPdf ? (
            <div className="flex gap-2 mb-3">
              <ImageIcon className={`w-10 h-10 ${isDragging ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`} />
              <FileText className={`w-10 h-10 ${isDragging ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`} />
            </div>
          ) : (
            <ImageIcon className={`w-12 h-12 mb-3 ${isDragging ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`} />
          )}
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {isDragging 
              ? (allowPdf ? 'Drop file here' : 'Drop image here')
              : (allowPdf ? 'Click or drag image/PDF here' : 'Click or drag image here')
            }
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {allowPdf ? 'PNG, JPG, WEBP (max 5MB) or PDF (max 10MB)' : 'PNG, JPG or WEBP (max 5MB)'}
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={allowPdf ? "image/*,.pdf,application/pdf" : "image/*"}
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
