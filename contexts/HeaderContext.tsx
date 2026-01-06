'use client'

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react'

interface HeaderContextType {
  collapsed: boolean
  setCollapsed: Dispatch<SetStateAction<boolean>>
  watchlistCount: number
  setWatchlistCount: Dispatch<SetStateAction<number>>
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined)

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [watchlistCount, setWatchlistCount] = useState(0)

  return (
    <HeaderContext.Provider value={{ collapsed, setCollapsed, watchlistCount, setWatchlistCount }}>
      {children}
    </HeaderContext.Provider>
  )
}

export function useHeader() {
  const context = useContext(HeaderContext)
  if (context === undefined) {
    throw new Error('useHeader must be used within a HeaderProvider')
  }
  return context
}
