'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface HeaderContextType {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined)

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <HeaderContext.Provider value={{ collapsed, setCollapsed }}>
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
