import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET published community news (most recent first)
// Supports filtering by keyword, publisher, year, and scope.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 100)
    const q = searchParams.get('q')?.trim() || searchParams.get('keyword')?.trim()
    const scope = searchParams.get('scope')?.trim().toUpperCase()
    const year = Number(searchParams.get('year') || searchParams.get('date'))
    const publisher = searchParams.get('publisher')?.trim()

    const where: any = { published: true }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { excerpt: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } },
        { sourceName: { contains: q, mode: 'insensitive' } },
        { keywords: { hasSome: [q] } },
      ]
    }

    if (scope === 'INTERNATIONAL' || scope === 'LOCAL') {
      where.scope = scope
    }

    if (publisher) {
      where.sourceName = { contains: publisher, mode: 'insensitive' }
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

    const allDates = await prisma.news.findMany({
      where: { published: true },
      select: { publishedAt: true },
    })
    const years = Array.from(
      new Set(allDates.map((n) => new Date(n.publishedAt).getUTCFullYear()))
    ).sort((a, b) => b - a)

    const publishers = Array.from(
      new Set(
        (await prisma.news.findMany({
          where: { published: true },
          select: { sourceName: true },
        }))
          .map((n) => n.sourceName)
          .filter(Boolean) as string[]
      )
    ).sort((a, b) => a.localeCompare(b))

    return NextResponse.json({ news, years, publishers })
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json({ news: [], years: [], publishers: [] }, { status: 500 })
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
    const {
      title,
      excerpt,
      content,
      imageUrl,
      category,
      authorName,
      published,
      sourceName,
      sourceUrl,
      scope,
      publishedAt,
      keywords,
      publisher,
    } = body

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
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80',
        category: category || 'GENERAL',
        authorName: authorName || session.user.name || 'Habicht',
        published: published !== false,
        sourceName: sourceName || publisher || null,
        sourceUrl: sourceUrl || null,
        publisher: publisher || sourceName || null,
        scope: scope === 'INTERNATIONAL' ? 'INTERNATIONAL' : 'LOCAL',
        keywords: Array.isArray(keywords) ? keywords : [],
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      },
    })

    return NextResponse.json({ news }, { status: 201 })
  } catch (error) {
    console.error('Error creating news:', error)
    return NextResponse.json({ error: 'Failed to create news' }, { status: 500 })
  }
}
