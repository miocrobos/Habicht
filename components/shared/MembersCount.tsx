'use client'

import { useEffect, useRef, useState } from 'react'
import { Users } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

// Home-page-only badge showing how many members have joined the community.
export default function MembersCount() {
  const { t } = useLanguage()
  const [count, setCount] = useState<number | null>(null)
  const [display, setDisplay] = useState(0)
  const rafRef = useRef<number>()

  // Missing keys make `t` return the key itself, so fall back to English.
  const label = (() => {
    const v = t('home.membersJoined')
    return v === 'home.membersJoined' ? 'members joined' : v
  })()

  useEffect(() => {
    let active = true
    fetch('/api/stats/members')
      .then((r) => r.json())
      .then((data) => {
        if (active && typeof data.count === 'number') setCount(data.count)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (count == null) return
    const duration = 1200
    const start = performance.now()
    const from = 0

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(from + (count - from) * eased))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [count])

  if (count == null) return null

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-white shadow-lg backdrop-blur-md dark:bg-white/10">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <Users className="h-4 w-4" />
      <span className="text-sm font-semibold tabular-nums">{display.toLocaleString('de-CH')}</span>
      <span className="text-xs font-medium text-white/80">{label}</span>
    </div>
  )
}
