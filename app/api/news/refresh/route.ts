import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SEED_NEWS, fetchSwissVolleyNewsUrls, titleFromSwissVolleyUrl } from '@/lib/newsSeedData'

// POST /api/news/refresh (admin only)
// Re-applies the curated FIVB / Volleyball World / Swiss Volley articles and
// pulls the latest live Swiss Volley headlines. De-duplicates on sourceUrl.
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let created = 0
    let updated = 0

    for (const item of SEED_NEWS) {
      const data = {
        title: item.title,
        excerpt: item.excerpt,
        content: item.content,
        imageUrl: item.imageUrl ?? null,
        category: item.category,
        scope: item.scope,
        sourceName: item.sourceName,
        sourceUrl: item.sourceUrl,
        authorName: item.sourceName,
        published: true,
        publishedAt: new Date(item.publishedAt),
      }
      const existing = await prisma.news.findUnique({ where: { sourceUrl: item.sourceUrl } })
      if (existing) {
        await prisma.news.update({ where: { id: existing.id }, data })
        updated++
      } else {
        await prisma.news.create({ data })
        created++
      }
    }

    // Best-effort live Swiss Volley headlines.
    const liveUrls = await fetchSwissVolleyNewsUrls()
    for (const url of liveUrls) {
      const existing = await prisma.news.findUnique({ where: { sourceUrl: url } })
      if (existing) continue
      const title = titleFromSwissVolleyUrl(url)
      await prisma.news.create({
        data: {
          title,
          excerpt: `${title} \u2013 mehr erfahren auf volleyball.ch.`,
          content: `${title}. Mehr erfahren auf volleyball.ch.`,
          category: 'GENERAL',
          scope: 'LOCAL',
          sourceName: 'Swiss Volley',
          sourceUrl: url,
          authorName: 'Swiss Volley',
          published: true,
          publishedAt: new Date(),
        },
      })
      created++
    }

    const total = await prisma.news.count()
    return NextResponse.json({ ok: true, created, updated, total })
  } catch (error) {
    console.error('Error refreshing news:', error)
    return NextResponse.json({ error: 'Failed to refresh news' }, { status: 500 })
  }
}
