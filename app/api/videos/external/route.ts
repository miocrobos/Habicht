import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { playerId, title, description, highlightType, videoUrl, videoType } = body

    if (!playerId || !title || !videoUrl || !videoType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate URL based on platform
    const isValidUrl = validateVideoUrl(videoUrl, videoType)
    if (!isValidUrl) {
      return NextResponse.json(
        { error: 'Invalid video URL for the selected platform' },
        { status: 400 }
      )
    }

    // Get thumbnail URL based on platform
    const thumbnailUrl = getThumbnailUrl(videoUrl, videoType)

    // Save to database
    const video = await prisma.video.create({
      data: {
        playerId,
        title,
        description: description || null,
        videoType: videoType as any,
        videoUrl,
        thumbnailUrl,
        highlightType: highlightType as any,
        isPublic: true,
      },
    })

    return NextResponse.json({ success: true, video })
  } catch (error) {
    console.error('Error adding external video:', error)
    return NextResponse.json(
      { error: 'Failed to add video' },
      { status: 500 }
    )
  }
}

function validateVideoUrl(url: string, type: string): boolean {
  switch (type) {
    case 'YOUTUBE':
      return url.includes('youtube.com') || url.includes('youtu.be')
    case 'INSTAGRAM':
      return url.includes('instagram.com')
    case 'TIKTOK':
      return url.includes('tiktok.com')
    default:
      return false
  }
}

function getThumbnailUrl(url: string, type: string): string | null {
  switch (type) {
    case 'YOUTUBE':
      const youtubeId = extractYouTubeId(url)
      return youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : null
    case 'INSTAGRAM':
    case 'TIKTOK':
      // These would require API calls to get thumbnails
      return null
    default:
      return null
  }
}

function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}
