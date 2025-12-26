'use client'

import { FaBeer } from 'react-icons/fa'

export default function TestIcons() {
  return (
    <div style={{ padding: 40 }}>
      <h1>Test React Icons</h1>
      <FaBeer style={{ fontSize: 48, color: 'orange' }} />
      <p>If you see a beer icon above, react-icons is working.</p>
    </div>
  )
}
