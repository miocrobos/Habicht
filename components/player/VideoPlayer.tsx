'use client'

import ReactPlayer from 'react-player'

interface VideoPlayerProps {
  url: string
  type: 'UPLOADED' | 'YOUTUBE' | 'INSTAGRAM' | 'TIKTOK'
  thumbnail?: string
}

export default function VideoPlayer({ url, type, thumbnail }: VideoPlayerProps) {
  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      <ReactPlayer
        url={url}
        controls
        width="100%"
        height="100%"
        light={thumbnail}
      />
    </div>
  )
}
