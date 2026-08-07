import { prisma } from '../lib/prisma'
import { SEED_NEWS, fetchSwissVolleyNewsUrls, titleFromSwissVolleyUrl } from '../lib/newsSeedData'

// Seeds the News table with curated real articles from FIVB, Volleyball World
// and Swiss Volley, then augments with the latest live Swiss Volley headlines.
// Idempotent: de-duplicates on sourceUrl.
async function main() {
  console.log(`Seeding ${SEED_NEWS.length} curated articles...`)
  let created = 0
  let updated = 0

  for (const item of SEED_NEWS) {
    const existing = await prisma.news.findUnique({ where: { sourceUrl: item.sourceUrl } })
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
    if (existing) {
      await prisma.news.update({ where: { id: existing.id }, data })
      updated++
    } else {
      await prisma.news.create({ data })
      created++
    }
  }

  // Augment with the latest live Swiss Volley headlines (best-effort).
  const liveUrls = await fetchSwissVolleyNewsUrls()
  console.log(`Found ${liveUrls.length} live Swiss Volley URLs`)
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
  console.log(`Done. Created ${created}, updated ${updated}. Total news: ${total}`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
