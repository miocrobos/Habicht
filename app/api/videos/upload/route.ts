import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const playerId = formData.get('playerId') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const highlightType = formData.get('highlightType') as string

    console.log('Video upload request:', { 
      hasFile: !!file, 
      playerId, 
      title, 
      highlightType,
      fileSize: file?.size,
      fileType: file?.type 
    })

    if (!file || !playerId || !title) {
      return NextResponse.json(
        { error: `Missing required fields - file: ${!!file}, playerId: ${!!playerId}, title: ${!!title}` },
        { status: 400 }
      )
    }

    // Verify user owns this profile
    if (session.user.playerId !== playerId) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only upload videos to your own profile' },
        { status: 403 }
      )
    }

    // Convert file to base64 for storage (simplified approach)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // For now, store as base64 (not recommended for production but works for demo)
    // In production, you should use Cloudinary, AWS S3, or similar
    const base64Video = `data:${file.type};base64,${buffer.toString('base64')}`

    console.log('Video converted to base64, size:', base64Video.length)

    // Save to database
    const video = await prisma.video.create({
      data: {
        playerId,
        title,
        description: description || null,
        videoType: 'UPLOADED',
        videoUrl: base64Video,
        thumbnailUrl: null,
        duration: null,
        highlightType: highlightType as any,
        isPublic: true,
      },
    })

    console.log('Video saved to database:', video.id)

    return NextResponse.json({ success: true, video })
  } catch (error: any) {
    console.error('Upload error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json(
      { error: 'Failed to upload video' },
      { status: 500 }
    )
  }
}
