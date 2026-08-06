'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Search, Building2, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/contexts/LanguageContext'
import type { Court } from '@/components/courts/CourtsMap'

// Leaflet touches `window`, so the map must be client-only.
const CourtsMap = dynamic(() => import('@/components/courts/CourtsMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
      <MapPin className="h-8 w-8 animate-pulse text-gray-400" />
    </div>
  ),
})

export default function CourtsPage() {
  const { t } = useLanguage()
  const [courts, setCourts] = useState<Court[]>([])
  const [query, setQuery] = useState('')
  const [loaded, setLoaded] = useState(false)

  const tr = (key: string, fallback: string) => {
    const v = t(key)
    return v === key ? fallback : v
  }

  useEffect(() => {
    fetch('/api/courts')
      .then((r) => r.json())
      .then((data) => setCourts(data.courts || []))
      .catch(() => setCourts([]))
      .finally(() => setLoaded(true))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return courts
    return courts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.canton.toLowerCase().includes(q)
    )
  }, [courts, query])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-gradient-to-br from-red-600 to-orange-600 text-white">
        <div className="container mx-auto px-4 py-12 sm:py-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-medium mb-3">
            <MapPin className="h-4 w-4" />
            {tr('courts.badge', 'Standorte')}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black">
            {tr('courts.title', 'Find a court to play')}
          </h1>
          <p className="mt-3 max-w-2xl text-white/90">
            {tr('courts.subtitle', 'Discover indoor volleyball courts and venues across Switzerland where you can play, train and connect.')}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="h-[420px] sm:h-[560px] w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <CourtsMap courts={filtered} />
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={tr('courts.searchPlaceholder', 'Search by name, city or canton')}
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-transparent focus:ring-2 focus:ring-red-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>

            <div className="max-h-[500px] space-y-3 overflow-y-auto pr-1">
              {loaded && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Building2 className="h-10 w-10 text-gray-400" />
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                    {tr('courts.empty', 'No courts found. New locations are added regularly.')}
                  </p>
                </div>
              )}
              {filtered.map((court) => (
                <Card key={court.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{court.name}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <MapPin className="h-3 w-3" />
                          {court.city}, {court.canton}
                        </p>
                      </div>
                      <Badge variant={court.indoor ? 'default' : 'secondary'}>
                        {court.indoor ? 'Indoor' : 'Outdoor'}
                      </Badge>
                    </div>
                    {court.website && (
                      <a
                        href={court.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Website
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
