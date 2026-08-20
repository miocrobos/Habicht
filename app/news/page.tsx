'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import {
  Newspaper,
  Calendar,
  Trophy,
  Megaphone,
  CalendarDays,
  Building2,
  Search,
  Globe,
  MapPin,
  ExternalLink,
  X,
} from 'lucide-react'
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
  sourceName: string | null
  sourceUrl: string | null
  publisher?: string | null
  keywords?: string[]
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

type ScopeFilter = 'ALL' | 'INTERNATIONAL' | 'LOCAL'

export default function NewsPage() {
  const { t } = useLanguage()
  const [news, setNews] = useState<NewsItem[]>([])
  const [years, setYears] = useState<number[]>([])
  const [publishers, setPublishers] = useState<string[]>([])
  const [loaded, setLoaded] = useState(false)

  const [query, setQuery] = useState('')
  const [scope, setScope] = useState<ScopeFilter>('ALL')
  const [year, setYear] = useState<string>('')
  const [publisher, setPublisher] = useState<string>('')

  const tr = (key: string, fallback: string) => {
    const v = t(key)
    return v === key ? fallback : v
  }

  useEffect(() => {
    fetch('/api/news?limit=100')
      .then((r) => r.json())
      .then((data) => {
        setNews(data.news || [])
        setYears(data.years || [])
        setPublishers(data.publishers || [])
      })
      .catch(() => setNews([]))
      .finally(() => setLoaded(true))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()

    return news.filter((item) => {
      const searchable = [
        item.title || '',
        item.excerpt || '',
        item.content || '',
        (item.keywords || []).join(' '),
        item.publisher || item.sourceName || '',
      ].join(' ').toLowerCase()

      if (q && !searchable.includes(q)) return false
      if (scope !== 'ALL' && (item.scope || 'LOCAL') !== scope) return false

      if (year) {
        const y = new Date(item.publishedAt || item.createdAt).getFullYear()
        if (String(y) !== year) return false
      }

      if (publisher) {
        const itemPublisher = (item.publisher || item.sourceName || '').toLowerCase()
        if (!itemPublisher.includes(publisher.toLowerCase())) return false
      }

      return true
    })
  }, [news, query, scope, year, publisher])

  const hasActiveFilters = query.trim() !== '' || scope !== 'ALL' || year !== '' || publisher !== ''

  const scopeTabs: { key: ScopeFilter; label: string; icon: typeof Globe }[] = [
    { key: 'ALL', label: tr('news.filter.all', 'All'), icon: Newspaper },
    { key: 'INTERNATIONAL', label: tr('news.filter.international', 'International'), icon: Globe },
    { key: 'LOCAL', label: tr('news.filter.local', 'Local'), icon: MapPin },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-gradient-to-br from-red-600 to-orange-600 text-white">
        <div className="container mx-auto px-4 py-10 sm:py-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs sm:text-sm font-medium mb-3">
            <Newspaper className="h-4 w-4" />
            {tr('home.news.badge', 'Community')}
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black">
            {tr('news.title', 'Volleyball News')}
          </h1>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-white/90">
            {tr(
              'news.subtitle',
              'The latest from FIVB, Volleyball World and Swiss Volley – international and local.'
            )}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10">
        <div className="mb-6 sm:mb-8 space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              inputMode="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tr('news.filter.searchPlaceholder', 'Search by keyword, title or publisher...')}
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 shadow-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label={tr('common.clear', 'Clear')}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {scopeTabs.map((tab) => {
                const Icon = tab.icon
                const active = scope === tab.key
                return (
                  <button
                    key={tab.key}
                    onClick={() => setScope(tab.key)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                      active
                        ? 'bg-red-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs sm:text-sm text-gray-900 outline-none focus:border-red-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="">{tr('news.filter.allPublishers', 'All publishers')}</option>
                {publishers.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs sm:text-sm text-gray-900 outline-none focus:border-red-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="">{tr('news.filter.allYears', 'All years')}</option>
                {years.map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>

              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setQuery('')
                    setScope('ALL')
                    setYear('')
                    setPublisher('')
                  }}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-medium text-gray-500 hover:text-red-600 dark:text-gray-400"
                >
                  <X className="h-3.5 w-3.5" />
                  {tr('news.filter.reset', 'Reset')}
                </button>
              )}
            </div>
          </div>

          {loaded && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {filtered.length}{' '}
              {filtered.length === 1 ? tr('news.filter.result', 'article') : tr('news.filter.results', 'articles')}
            </p>
          )}
        </div>

        {loaded && filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
            <Newspaper className="h-12 w-12 text-gray-400" />
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              {hasActiveFilters
                ? tr('news.noMatches', 'No articles match your filters.')
                : tr('news.empty', 'No news yet. Check back soon!')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((item) => {
              const meta = categoryMeta[item.category] || categoryMeta.GENERAL
              const Icon = meta.icon
              const isInternational = (item.scope || 'LOCAL') === 'INTERNATIONAL'
              const cardImage = item.imageUrl || 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80'

              const CardInner = (
                <Card
                  id={item.id}
                  className="flex h-full flex-col overflow-hidden scroll-mt-24 transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="relative h-40 sm:h-48 w-full">
                    <Image
                      src={cardImage}
                      alt={item.title}
                      fill
                      className="object-cover"
                      unoptimized={cardImage.startsWith('http')}
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="secondary" className="gap-1">
                        <Icon className="h-3 w-3" />
                        {meta.label}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={`gap-1 ${
                          isInternational
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        }`}
                      >
                        {isInternational ? <Globe className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                        {isInternational ? tr('news.filter.international', 'International') : tr('news.filter.local', 'Local')}
                      </Badge>
                    </div>
                    <CardTitle className="mt-2 line-clamp-2 text-base sm:text-lg">{item.title}</CardTitle>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.publishedAt || item.createdAt).toLocaleDateString('de-CH')}
                      </span>
                      {(item.publisher || item.sourceName) && (
                        <span className="font-medium text-gray-600 dark:text-gray-300">
                          {item.publisher || item.sourceName}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col">
                    <p className="line-clamp-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                      {item.excerpt || item.content}
                    </p>
                    {item.sourceUrl && (
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-red-600">
                        {tr('news.readMore', 'Read article')}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </span>
                    )}
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
                <div key={item.id}>{CardInner}</div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
