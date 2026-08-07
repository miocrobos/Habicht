import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET published community news (most recent first)
// Supports filtering by title search (q), year, and scope (INTERNATIONAL | LOCAL).
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 100)
    const q = searchParams.get('q')?.trim()
    const scope = searchParams.get('scope')?.trim().toUpperCase()
    const year = Number(searchParams.get('year'))

    const where: any = { published: true }

    if (q) {
      where.title = { contains: q, mode: 'insensitive' }
    }
    if (scope === 'INTERNATIONAL' || scope === 'LOCAL') {
      where.scope = scope
    }
    if (year && !Number.isNaN(year)) {
      where.publishedAt = {
        gte: new Date(Date.UTC(year, 0, 1)),
        lt: new Date(Date.UTC(year + 1, 0, 1)),
      }
    }

    const news = await prisma.news.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: limit,
    })

    // Distinct years available for the year filter dropdown.
    const allDates = await prisma.news.findMany({
      where: { published: true },
      select: { publishedAt: true },
    })
    const years = Array.from(
      new Set(allDates.map((n) => new Date(n.publishedAt).getUTCFullYear()))
    ).sort((a, b) => b - a)

    return NextResponse.json({ news, years })
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json({ news: [], years: [] }, { status: 500 })
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
    const { title, excerpt, content, imageUrl, category, authorName, published, sourceName, sourceUrl, scope, publishedAt } = body

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
        sourceName: sourceName || null,
        sourceUrl: sourceUrl || null,
        scope: scope === 'INTERNATIONAL' ? 'INTERNATIONAL' : 'LOCAL',
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      },
    })

    return NextResponse.json({ news }, { status: 201 })
  } catch (error) {
    console.error('Error creating news:', error)
    return NextResponse.json({ error: 'Failed to create news' }, { status: 500 })
  }
}
