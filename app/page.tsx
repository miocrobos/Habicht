'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Search, TrendingUp, Users, Video, Award, MapPin, Star, Zap, LogIn, UserPlus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import CantonFlag from '@/components/shared/CantonFlag'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)

  const handleProtectedNavigation = (path: string) => {
    if (!session) {
      // Redirect to register page with return URL
      router.push(`/auth/register?returnUrl=${encodeURIComponent(path)}`)
    } else {
      router.push(path)
    }
  }
  
  const slides = [
    {
      title: "NLA Herren & Damen",
      subtitle: "Schweizer Spitzenvolleyball",
      color: "from-blue-900/90 to-blue-700/90",
      emoji: "�"
    },
    {
      title: "NLB",
      subtitle: "Der Weg nach oben",
      color: "from-indigo-900/90 to-indigo-700/90",
      emoji: "🏐"
    },
    {
      title: "1. Liga",
      subtitle: "Regionale Spitze",
      color: "from-purple-900/90 to-purple-700/90",
      emoji: "🔥"
    },
    {
      title: "2. & 3. Liga",
      subtitle: "Aufstrebende Talente",
      color: "from-red-900/90 to-red-700/90",
      emoji: "💪"
    },
    {
      title: "4. & 5. Liga",
      subtitle: "Basis und Nachwuchs",
      color: "from-green-900/90 to-green-700/90",
      emoji: "⭐"
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section with Dynamic Background */}
      <section className="relative min-h-[700px] pb-20 mb-24 overflow-visible">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {/* Volleyball Background Images */}
          <div className="absolute inset-0">
            <Image
              src="/volleyball-bg-1.jpg"
              alt="Volleyball action"
              fill
              className="object-cover opacity-30"
              style={{ objectPosition: 'center 30%' }}
              priority
            />
          </div>
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
          
          {/* Animated volleyball court pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="h-full w-full" style={{
              backgroundImage: `
                linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .08) 25%, rgba(255, 255, 255, .08) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .08) 75%, rgba(255, 255, 255, .08) 76%, transparent 77%, transparent),
                linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .08) 25%, rgba(255, 255, 255, .08) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .08) 75%, rgba(255, 255, 255, .08) 76%, transparent 77%, transparent)
              `,
              backgroundSize: '60px 60px'
            }}></div>
          </div>
          
          {/* Dynamic color overlay */}
          <div 
            className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].color} transition-all duration-1000`}
          />
          
          {/* Radial gradient for depth */}
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/50" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto text-center text-white">
              {/* Eagle Logo with Animation */}
              <div className="mb-8 flex justify-center animate-bounce-slow">
                <div className="relative w-32 h-32 md:w-40 md:h-40 drop-shadow-2xl transform hover:scale-110 hover:rotate-3 transition-all duration-300" style={{ isolation: 'isolate', colorScheme: 'only light', mixBlendMode: 'normal' }}>
                  <Image
                    src="/eagle-logo.png"
                    alt="Eagle Logo"
                    fill
                    className="object-contain no-invert"
                    priority
                    style={{ filter: 'none', WebkitFilter: 'none', colorScheme: 'only light', mixBlendMode: 'normal' }}
                  />
                </div>
              </div>
              
              {/* Main Title */}
              <h1 className="text-7xl md:text-8xl lg:text-9xl font-black mb-6 tracking-tighter leading-none">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-white">
                  Habicht
                </span>
              </h1>
              
              {/* Dynamic Subtitle */}
              <div className="h-24 mb-8">
                <p className="text-3xl md:text-4xl font-bold mb-2 animate-fade-in">
                  {slides[currentSlide].emoji} {slides[currentSlide].title}
                </p>
                <p className="text-xl md:text-2xl text-gray-200">
                  {slides[currentSlide].subtitle}
                </p>
              </div>
              
              <p className="text-lg md:text-xl mb-8 text-gray-200 max-w-3xl mx-auto">
                Die moderne Scouting-Plattform für Schweizer Volleyball. Entdecke Talente, lueg Highlights a und vernetze dich mit Scouts.
              </p>

              {/* Main CTA Buttons */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 justify-center mb-6 md:mb-8 px-4">
                <button
                  onClick={() => handleProtectedNavigation('/players/men')}
                  className="group relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl text-base md:text-lg font-bold transition-all transform hover:scale-105 shadow-2xl overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <span className="text-lg md:text-xl">♂</span>
                    Herren Volleyball
                  </span>
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>
                
                <button
                  onClick={() => handleProtectedNavigation('/players/women')}
                  className="group relative bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl text-base md:text-lg font-bold transition-all transform hover:scale-105 shadow-2xl overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <span className="text-lg md:text-xl">♀</span>
                    Damen Volleyball
                  </span>
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>
              </div>

              {/* Secondary Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
                <button
                  onClick={() => handleProtectedNavigation('/players')}
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-6 md:px-8 py-3 md:py-4 rounded-xl text-base md:text-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-600 transition-all transform hover:scale-105 shadow-2xl"
                >
                  <span className="flex items-center gap-2 justify-center">
                    <Search className="w-5 h-5" />
                    Alle Spieler durchsuchen
                  </span>
                </button>
                {!session && (
                  <>
                    <Link
                      href="/auth/login"
                      className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-6 md:px-8 py-3 md:py-4 rounded-xl text-base md:text-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-600 transition-all transform hover:scale-105 shadow-2xl border-2 border-gray-300 dark:border-gray-600"
                    >
                      <span className="flex items-center gap-2 justify-center">
                        <LogIn className="w-5 h-5" />
                        Anmelden
                      </span>
                    </Link>
                    <Link
                      href="/auth/register"
                      className="bg-red-600 hover:bg-red-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl text-base md:text-lg font-bold transition-all transform hover:scale-105 shadow-2xl border-2 border-white"
                    >
                      <span className="flex items-center gap-2 justify-center">
                        <Star className="w-5 h-5" />
                        Jetzt registrieren
                      </span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-3 rounded-full transition-all duration-300 ${
                idx === currentSlide 
                  ? 'bg-white w-12 shadow-lg' 
                  : 'bg-white/40 w-3 hover:bg-white/60'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* League Showcase Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Alle Ligen. Ein Ort.</h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Von NLA Spitzenvolleyball bis zur 5. Liga – entdecke Spieler aus der ganzen Schweiz.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <LeagueCard
              league="NLA"
              description="Nationalliga A"
              color="from-blue-600 to-blue-700"
              emoji="🏆"
              playerCount="120+"
            />
            <LeagueCard
              league="NLB"
              description="Nationalliga B"
              color="from-indigo-600 to-indigo-700"
              emoji="🏐"
              playerCount="200+"
            />
            <LeagueCard
              league="1. Liga"
              description="Erste Liga"
              color="from-purple-600 to-purple-700"
              emoji="🔥"
              playerCount="300+"
            />
            <LeagueCard
              league="2. Liga"
              description="Zweite Liga"
              color="from-pink-600 to-pink-700"
              emoji="💪"
              playerCount="400+"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <LeagueCard
              league="3. Liga"
              description="Dritte Liga"
              color="from-green-600 to-green-700"
              emoji="⚡"
              playerCount="500+"
            />
            <LeagueCard
              league="4. Liga"
              description="Vierte Liga"
              color="from-teal-600 to-teal-700"
              emoji="⭐"
              playerCount="600+"
            />
          </div>

          <div className="grid md:grid-cols-1 gap-6 mb-16">
            <LeagueCard
              league="5. Liga"
              description="Fünfte Liga"
              color="from-indigo-600 to-purple-700"
              emoji="🌟"
              playerCount="300+"
            />
          </div>

          {/* Swiss Regions Highlight */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">🇨🇭 Alle 26 Kantone</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {['ZH', 'BE', 'VD', 'AG', 'SG', 'GE', 'LU', 'TG', 'TI', 'VS', 'BL', 'SO', 'FR', 'BS', 'GR', 'NE', 'ZG', 'SH', 'UR', 'SZ', 'JU', 'AR', 'AI', 'NW', 'GL', 'OW'].map(canton => (
                <Link 
                  key={canton} 
                  href={`/clubs?canton=${canton}`}
                  className="p-2 md:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 hover:shadow-md transition cursor-pointer flex flex-col items-center gap-2"
                >
                  <CantonFlag canton={canton as any} size="md" />
                  <div className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200">{canton}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Alles wo du brauchsch</h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">Professionelli Tools für Spieler und Scouts</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Users className="w-12 h-12" />}
              title="Detaillierti Profile"
              description="Stats, Erfolg, Club-Gschicht und Teamkollege – alles am gliiche Ort"
              color="blue"
            />
            <FeatureCard
              icon={<Video className="w-12 h-12" />}
              title="Multi-Platform Videos"
              description="YouTube, Instagram, TikTok oder direkt ufelade – du entscheidsch"
              color="pink"
            />
            <FeatureCard
              icon={<MapPin className="w-12 h-12" />}
              title="Kantonal-Basiert"
              description="Find Spieler nach Kanton mit Fahne und lokale Clubs"
              color="red"
            />
            <FeatureCard
              icon={<Zap className="w-12 h-12" />}
              title="Pro Scouting"
              description="Erwiitereti Suech, Notize und Favorite für Recruiters"
              color="yellow"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <StatCard 
              number="1,000+" 
              label="Aktive Spieler" 
              icon="👥"
            />
            <StatCard 
              number="26" 
              label="Kantone" 
              icon="🇨🇭"
            />
            <StatCard 
              number="100+" 
              label="Swiss Clubs" 
              icon="🏐"
            />
            <StatCard 
              number="5,000+" 
              label="Video Highlights" 
              icon="🎥"
            />
          </div>
        </div>
      </section>

      {/* Gender-Specific Sections */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Men's Section */}
            <Link href="/players/men" className="group">
              <div className="relative h-80 md:h-96 rounded-3xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative h-full flex flex-col items-center justify-center text-white p-6 md:p-8">
                  <div className="text-6xl md:text-8xl mb-4 md:mb-6 group-hover:scale-110 transition-transform">♂</div>
                  <h3 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4">Herren Volleyball</h3>
                  <p className="text-lg md:text-xl mb-4 md:mb-6 opacity-90 text-center">
                    NLA, NLB, 1. & 2. Liga Spieler
                  </p>
                  <div className="bg-white dark:bg-gray-800 text-blue-600 px-8 py-3 rounded-xl font-bold group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition">
                    Herren entdecken →
                  </div>
                </div>
              </div>
            </Link>

            {/* Women's Section */}
            <Link href="/players/women" className="group">
              <div className="relative h-80 md:h-96 rounded-3xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-600 to-pink-800 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative h-full flex flex-col items-center justify-center text-white p-6 md:p-8">
                  <div className="text-6xl md:text-8xl mb-4 md:mb-6 group-hover:scale-110 transition-transform">♀</div>
                  <h3 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4">Damen Volleyball</h3>
                  <p className="text-lg md:text-xl mb-4 md:mb-6 opacity-90 text-center">
                    NLA, NLB, 1. & 2. Liga Spielerinnen
                  </p>
                  <div className="bg-white dark:bg-gray-800 text-pink-600 px-8 py-3 rounded-xl font-bold group-hover:bg-pink-100 dark:group-hover:bg-pink-900/30 transition">
                    Damen entdecken →
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-red-600 to-red-700 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full" style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="text-5xl md:text-6xl mb-4 md:mb-6">🏐</div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
            Bisch du bereit?
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl mb-8 md:mb-10 opacity-90 max-w-2xl mx-auto px-4">
            Werd Teil vo de grösste Schweizer Volleyball Community und zeig was du drauf hesch!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
            <Link 
              href="/auth/register"
              className="bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 px-8 md:px-10 py-4 md:py-5 rounded-2xl font-bold text-base md:text-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition transform hover:scale-105 shadow-2xl"
            >
              <span className="flex items-center gap-2 justify-center">
                <Star className="w-6 h-6" />
                Profil erstellen
              </span>
            </Link>
            <Link 
              href="/players"
              className="bg-transparent border-2 md:border-3 border-white dark:border-gray-300 text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl font-bold text-base md:text-lg hover:bg-white dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-white transition transform hover:scale-105"
            >
              <span className="flex items-center gap-2 justify-center">
                <Search className="w-6 h-6" />
                Spieler browsen
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function LeagueCard({ league, description, color, emoji, playerCount }: { 
  league: string
  description: string
  color: string
  emoji: string
  playerCount: string
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
      <div className={`absolute inset-0 bg-gradient-to-br ${color}`} />
      <div className="relative p-8 text-white">
        <div className="text-5xl mb-4">{emoji}</div>
        <h3 className="text-3xl font-bold mb-2">{league}</h3>
        <p className="text-lg opacity-90 mb-4">{description}</p>
        <div className="text-2xl font-bold">{playerCount}</div>
        <p className="text-sm opacity-75">Spieler</p>
      </div>
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300" />
    </div>
  )
}

function FeatureCard({ icon, title, description, color }: { 
  icon: React.ReactNode
  title: string
  description: string
  color: string
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 group-hover:bg-blue-100',
    pink: 'text-pink-600 bg-pink-50 group-hover:bg-pink-100',
    red: 'text-red-600 bg-red-50 group-hover:bg-red-100',
    yellow: 'text-yellow-600 bg-yellow-50 group-hover:bg-yellow-100',
  }[color]

  return (
    <div className="group bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
      <div className={`inline-block p-3 md:p-4 rounded-xl mb-3 md:mb-4 transition-all ${colorClasses}`}>
        {icon}
      </div>
      <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
  )
}

function AuthPromptModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Anmeldung erforderlich</h3>
          <p className="text-gray-600 mb-6">
            Bitte melde dich an oder registriere dich, um auf diese Seite zuzugreifen.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/auth/login"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all"
            >
              <span className="flex items-center justify-center gap-2">
                <LogIn className="w-5 h-5" />
                Anmelden
              </span>
            </Link>
            <Link
              href="/auth/register"
              className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-3 rounded-xl font-bold transition-all"
            >
              <span className="flex items-center justify-center gap-2">
                <UserPlus className="w-5 h-5" />
                Registrieren
              </span>
            </Link>
          </div>
          <button
            onClick={onClose}
            className="mt-4 text-gray-500 hover:text-gray-700 font-medium"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  )
}

function StatCard({ number, label, icon }: { number: string; label: string; icon: string }) {
  return (
    <div className="group">
      <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">{icon}</div>
      <div className="text-5xl md:text-6xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
        {number}
      </div>
      <div className="text-xl text-gray-300 font-medium">{label}</div>
    </div>
  )
}
