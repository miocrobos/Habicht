import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET published community news (most recent first)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 50)

    const news = await prisma.news.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ news })
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json({ news: [] }, { status: 500 })
  }
}

// POST create news (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, excerpt, content, imageUrl, category, authorName, published } = body

    if (!title || !excerpt || !content) {
      return NextResponse.json(
        { error: 'Title, excerpt and content are required' },
        { status: 400 }
      )
    }

    const news = await prisma.news.create({
      data: {
        title,
        excerpt,
        content,
        imageUrl: imageUrl || null,
        category: category || 'GENERAL',
        authorName: authorName || session.user.name || 'Habicht',
        published: published !== false,
      },
    })

    return NextResponse.json({ news }, { status: 201 })
  } catch (error) {
    console.error('Error creating news:', error)
    return NextResponse.json({ error: 'Failed to create news' }, { status: 500 })
  }
}
