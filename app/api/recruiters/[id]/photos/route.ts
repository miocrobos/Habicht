import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/recruiters/[id]/photos - Fetch all photos for a recruiter
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const photos = await prisma.recruiterPhoto.findMany({
      where: { recruiterId: params.id },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ photos })
  } catch (error) {
    console.error('Error fetching recruiter photos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    )
  }
}

// POST /api/recruiters/[id]/photos - Upload a new photo
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

    const { photoUrl } = await request.json()

    if (!photoUrl) {
      return NextResponse.json({ error: 'Photo URL is required' }, { status: 400 })
    }

    // Get the current max order
    const maxOrder = await prisma.recruiterPhoto.findFirst({
      where: { recruiterId: params.id },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    const photo = await prisma.recruiterPhoto.create({
      data: {
        recruiterId: params.id,
        photoUrl,
        order: (maxOrder?.order ?? -1) + 1
      }
    })

    return NextResponse.json({ photo })
  } catch (error) {
    console.error('Error uploading recruiter photo:', error)
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    )
  }
}

// DELETE /api/recruiters/[id]/photos - Delete a photo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const urlObj = new URL(request.url)
    const photoId = urlObj.searchParams.get('photoId')

    if (!photoId) {
      return NextResponse.json({ error: 'Photo ID is required' }, { status: 400 })
    }

    // Verify ownership
    const photo = await prisma.recruiterPhoto.findUnique({
      where: { id: photoId },
      include: { recruiter: { select: { userId: true } } }
    })

    if (!photo || photo.recruiter.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.recruiterPhoto.delete({
      where: { id: photoId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting recruiter photo:', error)
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    )
  }
}
