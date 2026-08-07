'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Newspaper, Calendar, ArrowRight, Trophy, Megaphone, CalendarDays, Building2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/LanguageContext'

interface NewsItem {
  id: string
  title: string
  excerpt: string
  imageUrl: string | null
  category: string
  authorName: string
  sourceName: string | null
  sourceUrl: string | null
  scope: string
  publishedAt: string
  createdAt: string
}

const categoryMeta: Record<string, { icon: typeof Trophy; label: string }> = {
  GENERAL: { icon: Newspaper, label: 'News' },
  EVENT: { icon: CalendarDays, label: 'Event' },
  TOURNAMENT: { icon: Trophy, label: 'Tournament' },
  CLUB: { icon: Building2, label: 'Club' },
  ANNOUNCEMENT: { icon: Megaphone, label: 'Announcement' },
}

export default function NewsSection() {
  const { t } = useLanguage()
  const [news, setNews] = useState<NewsItem[]>([])
  const [loaded, setLoaded] = useState(false)

  const tr = (key: string, fallback: string) => {
    const v = t(key)
    return v === key ? fallback : v
  }

  useEffect(() => {
    fetch('/api/news?limit=3')
      .then((r) => r.json())
      .then((data) => setNews(data.news || []))
      .catch(() => setNews([]))
      .finally(() => setLoaded(true))
  }, [])

  // Hide the section entirely until there is community news to show.
  if (loaded && news.length === 0) return null

  return (
    <section className="py-10 sm:py-16 md:py-20 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-end justify-between mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-600 dark:bg-red-950/40 mb-3">
              <Newspaper className="h-4 w-4" />
              {tr('home.news.badge', 'Community')}
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {tr('home.news.title', 'Latest from the community')}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl">
              {tr('home.news.subtitle', 'News, events and tournaments from the Swiss volleyball community.')}
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <Link href="/news">
              {tr('home.news.viewAll', 'View all')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {news.map((item) => {
            const meta = categoryMeta[item.category] || categoryMeta.GENERAL
            const Icon = meta.icon
            const CardInner = (
              <Card className="h-full overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5">
                {item.imageUrl ? (
                  <div className="relative h-40 sm:h-44 w-full overflow-hidden">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex h-40 sm:h-44 w-full items-center justify-center bg-gradient-to-br from-red-500 to-orange-500">
                    <Icon className="h-12 w-12 text-white/90" />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Icon className="h-3 w-3" />
                      {meta.label}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.publishedAt || item.createdAt).toLocaleDateString('de-CH')}
                    </span>
                    {item.sourceName && (
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        {item.sourceName}
                      </span>
                    )}
                  </div>
                  <CardTitle className="mt-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
                    {item.excerpt}
                  </p>
                </CardContent>
              </Card>
            )

            return item.sourceUrl ? (
              <a
                key={item.id}
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                {CardInner}
              </a>
            ) : (
              <Link key={item.id} href={`/news#${item.id}`} className="group block">
                {CardInner}
              </Link>
            )
          })}
        </div>

        <div className="mt-6 sm:hidden">
          <Button asChild variant="outline" className="w-full">
            <Link href="/news">
              {tr('home.news.viewAll', 'View all')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
