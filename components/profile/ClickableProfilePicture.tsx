'use client'

import { useState } from 'react'
import ProfileModal from './ProfileModal'

interface ClickableProfilePictureProps {
  playerId?: string
  recruiterId?: string
  imageUrl: string
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showBorder?: boolean
}

export default function ClickableProfilePicture({
  playerId,
  recruiterId,
  imageUrl,
  name,
  size = 'md',
  className = '',
  showBorder = true
}: ClickableProfilePictureProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`
          ${sizeClasses[size]} 
          rounded-full 
          overflow-hidden 
          ${showBorder ? 'ring-2 ring-gray-200 hover:ring-red-500' : ''}
          transition-all 
          duration-200 
          transform 
          hover:scale-105 
          hover:shadow-lg
          focus:outline-none
          focus:ring-2
          focus:ring-red-500
          focus:ring-offset-2
          ${className}
        `}
        title={`${name} - Klicke um Profil anzuzeigen`}
      >
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
      </button>

      <ProfileModal
        playerId={playerId}
        recruiterId={recruiterId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
