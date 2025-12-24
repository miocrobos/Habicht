import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/recruiters/[id]/videos - Fetch all videos for a recruiter
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videos = await prisma.recruiterVideo.findMany({
      where: { recruiterId: params.id },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ videos })
  } catch (error) {
    console.error('Error fetching recruiter videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}

// POST /api/recruiters/[id]/videos - Upload a new video
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the recruiter belongs to the user
    const recruiter = await prisma.recruiter.findUnique({
      where: { id: params.id },
      select: { userId: true }
    })

    if (!recruiter || recruiter.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { videoUrl, title } = await request.json()

    if (!videoUrl) {
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 })
    }

    // Get the current max order
    const maxOrder = await prisma.recruiterVideo.findFirst({
      where: { recruiterId: params.id },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    const video = await prisma.recruiterVideo.create({
      data: {
        recruiterId: params.id,
        videoUrl,
        title: title || '',
        order: (maxOrder?.order ?? -1) + 1
      }
    })

    return NextResponse.json({ video })
  } catch (error) {
    console.error('Error uploading recruiter video:', error)
    return NextResponse.json(
      { error: 'Failed to upload video' },
      { status: 500 }
    )
  }
}

// DELETE /api/recruiters/[id]/videos - Delete a video
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId')

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 })
    }

    // Verify ownership
    const video = await prisma.recruiterVideo.findUnique({
      where: { id: videoId },
      include: { recruiter: { select: { userId: true } } }
    })

    if (!video || video.recruiter.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.recruiterVideo.delete({
      where: { id: videoId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting recruiter video:', error)
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    )
  }
}
