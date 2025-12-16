'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X, User, Search } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session } = useSession()

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-12 h-12 transition-transform group-hover:scale-110" style={{ isolation: 'isolate', colorScheme: 'light', mixBlendMode: 'normal' }}>
              <Image
                src="/eagle-logo.png"
                alt="Eagle Logo"
                fill
                className="object-contain group-hover:drop-shadow-lg no-invert"
                priority
                style={{ filter: 'none', WebkitFilter: 'none', colorScheme: 'light', mixBlendMode: 'normal' }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-gray-900 leading-none tracking-tight group-hover:text-red-600 transition">
                Habicht
              </span>
              <span className="text-xs text-gray-500 font-medium tracking-wide">SWISS VOLLEYBALL</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/players" className="text-gray-700 hover:text-swiss-red transition">
              Spieler
            </Link>
            <Link href="/players/men" className="text-gray-700 hover:text-blue-600 transition font-medium">
              ♂ Herren
            </Link>
            <Link href="/players/women" className="text-gray-700 hover:text-pink-600 transition font-medium">
              ♀ Damen
            </Link>
            <Link href="/clubs" className="text-gray-700 hover:text-swiss-red transition">
              Clubs
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-swiss-red transition">
              Über uns
            </Link>
            {session?.user.role === 'RECRUITER' && (
              <Link href="/dashboard/recruiter" className="text-gray-700 hover:text-swiss-red transition">
                Dashboard
              </Link>
            )}
            {session?.user.role === 'PLAYER' && (
              <Link href="/dashboard/player" className="text-gray-700 hover:text-swiss-red transition">
                Mein Profil
              </Link>
            )}
          </nav>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/players" className="text-gray-700 hover:text-swiss-red transition">
              <Search className="w-5 h-5" />
            </Link>
            
            {session ? (
              <button
                onClick={() => signOut()}
                className="bg-swiss-red text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Abmelden
              </button>
            ) : (
              <>
                <Link 
                  href="/auth/login"
                  className="text-gray-700 hover:text-swiss-red transition font-medium"
                >
                  Anmelden
                </Link>
                <Link 
                  href="/auth/register"
                  className="bg-swiss-red text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Registrieren
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link href="/players" className="text-gray-700 hover:text-swiss-red transition">
                Spieler
              </Link>
              <Link href="/players/men" className="text-gray-700 hover:text-blue-600 transition font-medium">
                ♂ Herren
              </Link>
              <Link href="/players/women" className="text-gray-700 hover:text-pink-600 transition font-medium">
                ♀ Damen
              </Link>
              <Link href="/clubs" className="text-gray-700 hover:text-swiss-red transition">
                Clubs
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-swiss-red transition">
                Über uns
              </Link>
              {session ? (
                <>
                  <Link href="/profile" className="text-gray-700 hover:text-swiss-red transition">
                    Profil
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="text-left text-gray-700 hover:text-swiss-red transition"
                  >
                    Abmelden
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="text-gray-700 hover:text-swiss-red transition">
                    Anmelden
                  </Link>
                  <Link href="/auth/register" className="text-swiss-red font-semibold">
                    Registrieren
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
