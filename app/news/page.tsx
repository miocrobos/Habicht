'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Newspaper, Calendar, Trophy, Megaphone, CalendarDays, Building2, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/contexts/LanguageContext'

interface NewsItem {
  id: string
  title: string
  excerpt: string
  content: string
  imageUrl: string | null
  category: string
  authorName: string
  createdAt: string
}

const categoryMeta: Record<string, { icon: typeof Trophy; label: string }> = {
  GENERAL: { icon: Newspaper, label: 'News' },
  EVENT: { icon: CalendarDays, label: 'Event' },
  TOURNAMENT: { icon: Trophy, label: 'Tournament' },
  CLUB: { icon: Building2, label: 'Club' },
  ANNOUNCEMENT: { icon: Megaphone, label: 'Announcement' },
}

export default function NewsPage() {
  const { t } = useLanguage()
  const [news, setNews] = useState<NewsItem[]>([])
  const [loaded, setLoaded] = useState(false)

  const tr = (key: string, fallback: string) => {
    const v = t(key)
    return v === key ? fallback : v
  }

  useEffect(() => {
    fetch('/api/news?limit=50')
      .then((r) => r.json())
      .then((data) => setNews(data.news || []))
      .catch(() => setNews([]))
      .finally(() => setLoaded(true))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-gradient-to-br from-red-600 to-orange-600 text-white">
        <div className="container mx-auto px-4 py-12 sm:py-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-medium mb-3">
            <Newspaper className="h-4 w-4" />
            {tr('home.news.badge', 'Community')}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black">
            {tr('news.title', 'Community News')}
          </h1>
          <p className="mt-3 max-w-2xl text-white/90">
            {tr('news.subtitle', 'Stay up to date with news, events and tournaments from the Swiss volleyball community.')}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12">
        {loaded && news.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Newspaper className="h-12 w-12 text-gray-400" />
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              {tr('news.empty', 'No news yet. Check back soon!')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {news.map((item) => {
              const meta = categoryMeta[item.category] || categoryMeta.GENERAL
              const Icon = meta.icon
              return (
                <Card key={item.id} id={item.id} className="overflow-hidden scroll-mt-24">
                  {item.imageUrl ? (
                    <div className="relative h-52 w-full">
                      <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-52 w-full items-center justify-center bg-gradient-to-br from-red-500 to-orange-500">
                      <Icon className="h-14 w-14 text-white/90" />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <Icon className="h-3 w-3" />
                        {meta.label}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.createdAt).toLocaleDateString('de-CH')}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <User className="h-3 w-3" />
                        {item.authorName}
                      </span>
                    </div>
                    <CardTitle className="mt-2 text-xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                      {item.content}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
