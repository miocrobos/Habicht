import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { prisma } from '@/lib/prisma'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const playerId = formData.get('playerId') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const highlightType = formData.get('highlightType') as string

    if (!file || !playerId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'habicht/player-videos',
          chunk_size: 6000000, // 6MB chunks
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      uploadStream.end(buffer)
    })

    const cloudinaryResult = uploadResult as any

    // Save to database
    const video = await prisma.video.create({
      data: {
        playerId,
        title,
        description: description || null,
        videoType: 'UPLOADED',
        videoUrl: cloudinaryResult.secure_url,
        thumbnailUrl: cloudinaryResult.secure_url.replace('/upload/', '/upload/so_0/'),
        duration: Math.round(cloudinaryResult.duration),
        highlightType: highlightType as any,
        isPublic: true,
      },
    })

    return NextResponse.json({ success: true, video })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload video' },
      { status: 500 }
    )
  }
}
