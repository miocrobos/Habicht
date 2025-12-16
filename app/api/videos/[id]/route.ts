import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the video
    const video = await prisma.video.findUnique({
      where: { id: params.id },
      include: {
        player: true,
      },
    })

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    // Check if the user owns this video
    if (video.playerId !== session.user.playerId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Delete from Cloudinary if it's an uploaded video
    if (video.videoType === 'UPLOADED' && video.videoUrl) {
      try {
        // Extract public ID from Cloudinary URL
        const urlParts = video.videoUrl.split('/')
        const publicIdWithExtension = urlParts[urlParts.length - 1]
        const publicId = `habicht/player-videos/${publicIdWithExtension.split('.')[0]}`
        
        await cloudinary.uploader.destroy(publicId, { resource_type: 'video' })
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError)
        // Continue with database deletion even if Cloudinary fails
      }
    }

    // Delete from database
    await prisma.video.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true, message: 'Video deleted successfully' })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    )
  }
}
