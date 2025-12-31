'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Search, TrendingUp, Users, Video, Award, MapPin, Star, Zap, LogIn, UserPlus } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import CantonFlag from '@/components/shared/CantonFlag'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  // JavaScript fallback for league card hover (for browsers without :has() support)
  useEffect(() => {
    const leagueRows = document.querySelectorAll('.league-row');
    
    leagueRows.forEach(row => {
      const wrappers = row.querySelectorAll('.league-card-wrapper');
      
      wrappers.forEach(wrapper => {
        wrapper.addEventListener('mouseenter', () => {
          row.classList.add('has-hover');
          wrapper.classList.add('is-hovered');
        });
        
        wrapper.addEventListener('mouseleave', () => {
          row.classList.remove('has-hover');
          wrapper.classList.remove('is-hovered');
        });
      });
    });
    
    return () => {
      leagueRows.forEach(row => {
        const wrappers = row.querySelectorAll('.league-card-wrapper');
        wrappers.forEach(wrapper => {
          wrapper.replaceWith(wrapper.cloneNode(true));
        });
      });
    };
  }, []);

  const handleProtectedNavigation = (path: string) => {
    if (!session) {
      router.push(`/auth/register?returnUrl=${encodeURIComponent(path)}`);
    } else {
      router.push(path);
    }
  };

  const slides = [
    {
      titleKey: 'home.slides.nla.title',
      subtitleKey: 'home.slides.nla.subtitle',
      color: "from-blue-900/90 to-blue-700/90",
      emoji: "🏆",
      explanationKey: 'home.slides.nla.explanation',
      quoteKey: 'home.slides.nla.quote'
    },
    {
      titleKey: 'home.slides.nlb.title',
      subtitleKey: 'home.slides.nlb.subtitle',
      color: "from-indigo-900/90 to-indigo-700/90",
      emoji: "🏐",
      explanationKey: 'home.slides.nlb.explanation',
      quoteKey: 'home.slides.nlb.quote'
    },
    {
      titleKey: 'home.slides.liga1.title',
      subtitleKey: 'home.slides.liga1.subtitle',
      color: "from-purple-900/90 to-purple-700/90",
      emoji: "🔥",
      explanationKey: 'home.slides.liga1.explanation',
      quoteKey: 'home.slides.liga1.quote'
    },
    {
      titleKey: 'home.slides.liga23.title',
      subtitleKey: 'home.slides.liga23.subtitle',
      color: "from-red-900/90 to-red-700/90",
      emoji: "💪",
      explanationKey: 'home.slides.liga23.explanation',
      quoteKey: 'home.slides.liga23.quote'
    },
    {
      titleKey: 'home.slides.liga45.title',
      subtitleKey: 'home.slides.liga45.subtitle',
      color: "from-green-900/90 to-green-700/90",
      emoji: "⭐",
      explanationKey: 'home.slides.liga45.explanation',
      quoteKey: 'home.slides.liga45.quote'
    },
    {
      titleKey: 'home.slides.u23.title',
      subtitleKey: 'home.slides.u23.subtitle',
      color: "from-orange-900/90 to-orange-700/90",
      emoji: "🎯",
      explanationKey: 'home.slides.u23.explanation',
      quoteKey: 'home.slides.u23.quote'
    },
    {
      titleKey: 'home.slides.u20.title',
      subtitleKey: 'home.slides.u20.subtitle',
      color: "from-cyan-900/90 to-cyan-700/90",
      emoji: "🚀",
      explanationKey: 'home.slides.u20.explanation',
      quoteKey: 'home.slides.u20.quote'
    },
    {
      titleKey: 'home.slides.u18.title',
      subtitleKey: 'home.slides.u18.subtitle',
      color: "from-amber-900/90 to-amber-700/90",
      emoji: "🌟",
      explanationKey: 'home.slides.u18.explanation',
      quoteKey: 'home.slides.u18.quote'
    }
  ];

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 30000);
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  return (
    <div className="min-h-screen">
      {/* Hero Section with League Explanation */}
      <section className="relative min-h-[400px] sm:min-h-[500px] md:min-h-[600px] pb-8 sm:pb-16 mb-8 sm:mb-16 md:mb-24 overflow-visible">
        {/* Animated Background */}
        <div className="absolute inset-0">
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
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
          <div className="absolute inset-0 opacity-10">
            <div className="h-full w-full" style={{
              backgroundImage: `
                linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .08) 25%, rgba(255, 255, 255, .08) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .08) 75%, rgba(255, 255, 255, .08) 76%, transparent 77%, transparent),
                linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .08) 25%, rgba(255, 255, 255, .08) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .08) 75%, rgba(255, 255, 255, .08) 76%, transparent 77%, transparent)
              `,
              backgroundSize: '60px 60px'
            }}></div>
          </div>
          <div className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].color} transition-all duration-1000`} />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/50" />
        </div>

        {/* Pause/Play Button - bottom left, above slide indicators */}
        <div className="absolute bottom-10 sm:bottom-12 left-4 z-30">
          <button
            onClick={() => setPaused((p) => !p)}
            className="bg-white/70 hover:bg-white text-gray-600 hover:text-gray-900 rounded-full p-1.5 sm:p-2 shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 group"
            aria-label={paused ? 'Play transitions' : 'Pause transitions'}
          >
            <span className="sr-only">{paused ? 'Play transitions' : 'Pause transitions'}</span>
            {paused ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v18l15-9L5 3z" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
            )}
            <span className="hidden sm:block absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-black/80 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              {paused ? 'Play transitions' : 'Pause transitions'}
            </span>
          </button>
        </div>

        {/* Content with League Explanation - Side by Side Layout */}
        <div className="relative z-10 h-full flex items-center justify-center min-h-[420px] sm:min-h-[520px] md:min-h-[600px]">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="max-w-6xl mx-auto text-white">
              {/* Animated League Slide - Side by Side */}
              <div
                key={currentSlide}
                className="transition-all duration-700 ease-in-out animate-fade-in"
              >
                <div className="flex flex-col lg:flex-row items-stretch gap-3 lg:gap-12 w-full mb-4 sm:mb-6">
                  {/* LEFT: Liga name + subtitle */}
                  <div className="flex-shrink-0 lg:w-2/5 flex flex-col justify-center">
                    <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-left flex items-center gap-2 sm:gap-3">
                      <span className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl">{slides[currentSlide].emoji}</span> {t(slides[currentSlide].titleKey)}
                    </h1>
                    {t(slides[currentSlide].subtitleKey) && (
                      <p className="text-[19.5px] text-gray-200 mt-1 sm:mt-2 text-center w-full break-words">
                        {t(slides[currentSlide].subtitleKey)}
                      </p>
                    )}
                  </div>
                  
                  {/* RIGHT: Quote and explanation box */}
                  <div className="flex-1 lg:w-3/5 bg-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 flex flex-col justify-center">
                    {/* Inspiring quote at top */}
                    <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-white font-bold italic mb-2 sm:mb-3">
                      {t(slides[currentSlide].quoteKey)}
                    </p>
                    {/* Explanation below */}
                    <p className="text-[11px] sm:text-sm md:text-base text-gray-200 text-left">
                      {t(slides[currentSlide].explanationKey)}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Center tagline */}
              <p className="text-[11px] sm:text-sm md:text-base lg:text-lg mb-4 sm:mb-6 text-gray-200 max-w-2xl mx-auto text-center px-2">
                {t('home.hero.description')}
              </p>

              {/* Main CTA Buttons */}
              <div className="flex flex-row flex-wrap gap-2 sm:gap-2 md:gap-3 justify-center mb-4 sm:mb-6 md:mb-8 px-2 sm:px-4">
                <button
                  onClick={() => handleProtectedNavigation('/players/men')}
                  className="group relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs sm:text-sm md:text-base font-bold transition-all transform hover:scale-105 active:scale-95 shadow-xl sm:shadow-2xl overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <span className="text-base sm:text-lg md:text-xl">♂</span>
                    {t('home.hero.menVolleyball')}
                  </span>
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>
                <button
                  onClick={() => handleProtectedNavigation('/players/women')}
                  className="group relative bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs sm:text-sm md:text-base font-bold transition-all transform hover:scale-105 active:scale-95 shadow-xl sm:shadow-2xl overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <span className="text-base sm:text-lg md:text-xl">♀</span>
                    {t('home.hero.womenVolleyball')}
                  </span>
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>
              </div>

              {/* Secondary Buttons */}
              <div className="flex flex-row gap-1 sm:gap-1.5 md:gap-2 justify-center px-2 sm:px-4 pb-4 sm:pb-6 md:pb-0">
                <button
                  onClick={() => handleProtectedNavigation('/players')}
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg text-[10px] sm:text-xs md:text-sm font-bold hover:bg-gray-100 dark:hover:bg-gray-600 transition-all transform hover:scale-105 active:scale-95 shadow-lg sm:shadow-xl md:shadow-2xl"
                >
                  <span className="flex items-center gap-1 sm:gap-1.5 justify-center">
                    <Search className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    {t('home.hero.searchAllPlayers')}
                  </span>
                </button>
                {!session && (
                  <>
                    <Link
                      href="/auth/login"
                      className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg text-[10px] sm:text-xs md:text-sm font-bold hover:bg-gray-100 dark:hover:bg-gray-600 transition-all transform hover:scale-105 active:scale-95 shadow-lg sm:shadow-xl md:shadow-2xl border-2 border-gray-300 dark:border-gray-600"
                    >
                      <span className="flex items-center gap-1 sm:gap-1.5 justify-center">
                        <LogIn className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                        {t('home.hero.login')}
                      </span>
                    </Link>
                    <Link
                      href="/auth/register"
                      className="bg-red-600 hover:bg-red-700 text-white px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg text-[10px] sm:text-xs md:text-sm font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg sm:shadow-xl md:shadow-2xl border-2 border-white"
                    >
                      <span className="flex items-center gap-1 sm:gap-1.5 justify-center">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                        {t('home.hero.registerNow')}
                      </span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Slide Indicators - small dots on mobile */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 sm:gap-2 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`slider-dot rounded-full transition-all duration-300 ${
                idx === currentSlide 
                  ? 'bg-white w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 shadow-lg' 
                  : 'bg-white/40 w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 hover:bg-white/60'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* League Showcase Section */}
      <section className="py-10 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">{t('home.leagues.title')}</h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto px-4">
              {t('home.leagues.subtitle')}
            </p>
          </div>

          {/* First row: NLA to 3rd League */}
          <LeagueRow key={`row1-${language}`} language={language} cards={[
            { league: t('home.leagues.nlaShort'), description: t('home.leagues.nla'), color: "from-blue-600 to-blue-700", emoji: "🏆", playerCount: "120+", fact: t('home.leagueCards.nla.quote') },
            { league: t('home.leagues.nlbShort'), description: t('home.leagues.nlb'), color: "from-indigo-600 to-indigo-700", emoji: "🏐", playerCount: "200+", fact: t('home.leagueCards.nlb.quote') },
            { league: t('home.leagues.firstLeague'), description: t('home.leagues.firstLeague'), color: "from-purple-600 to-purple-700", emoji: "🔥", playerCount: "300+", fact: t('home.leagueCards.liga1.quote') },
            { league: t('home.leagues.secondLeague'), description: t('home.leagues.secondLeague'), color: "from-pink-600 to-pink-700", emoji: "💪", playerCount: "400+", fact: t('home.leagueCards.liga2.quote') },
            { league: t('home.leagues.thirdLeague'), description: t('home.leagues.thirdLeague'), color: "from-green-600 to-green-700", emoji: "⚡", playerCount: "500+", fact: t('home.leagueCards.liga3.quote'), widthClass: "w-full" }
          ]} />

          {/* Second row: 4th, 5th, U23, U20, U18 */}
          <LeagueRow key={`row2-${language}`} language={language} cards={[
            { league: t('home.leagues.fourthLeague'), description: t('home.leagues.fourthLeague'), color: "from-teal-600 to-teal-700", emoji: "⭐", playerCount: "600+", fact: t('home.leagueCards.liga4.quote') },
            { league: t('home.leagues.fifthLeague'), description: t('home.leagues.fifthLeague'), color: "from-indigo-600 to-purple-700", emoji: "🌟", playerCount: "300+", fact: t('home.leagueCards.liga5.quote') },
            { league: t('home.leagues.u23'), description: t('home.leagues.u23'), color: "from-orange-600 to-orange-700", emoji: "🎯", playerCount: "150+", fact: t('home.leagueCards.u23.quote') },
            { league: t('home.leagues.u20'), description: t('home.leagues.u20'), color: "from-cyan-600 to-cyan-700", emoji: "🚀", playerCount: "180+", fact: t('home.leagueCards.u20.quote') },
            { league: t('home.leagues.u18'), description: t('home.leagues.u18'), color: "from-amber-600 to-amber-700", emoji: "✨", playerCount: "200+", fact: t('home.leagueCards.u18.quote'), widthClass: "w-full" }
          ]} />

          {/* Swiss Regions Highlight */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 md:p-12">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6 md:mb-8">🇨🇭 Alle 26 Kantone</h3>
            <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3 md:gap-4">
              {['ZH', 'BE', 'VD', 'AG', 'SG', 'GE', 'LU', 'TG', 'TI', 'VS', 'BL', 'SO', 'FR', 'BS', 'GR', 'NE', 'ZG', 'SH', 'UR', 'SZ', 'JU', 'AR', 'AI', 'NW', 'GL', 'OW'].map(canton => (
                <Link 
                  key={canton} 
                  href={`/clubs?canton=${canton}`}
                  className="p-1.5 sm:p-2 md:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 hover:shadow-md transition cursor-pointer flex flex-col items-center gap-1 sm:gap-2"
                >
                  <CantonFlag canton={canton as any} size="sm" />
                  <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-800 dark:text-gray-200">{canton}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 sm:py-16 md:py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">{t('home.features.title')}</h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400">{t('home.features.subtitle')}</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            <FeatureCard
              icon={<Users className="w-12 h-12" />}
              title={t('home.features.search.title')}
              description={t('home.features.search.description')}
              color="blue"
            />
            <FeatureCard
              icon={<Video className="w-12 h-12" />}
              title={t('home.features.highlights.title')}
              description={t('home.features.highlights.description')}
              color="pink"
            />
            <FeatureCard
              icon={<MapPin className="w-12 h-12" />}
              title={t('home.features.network.title')}
              description={t('home.features.network.description')}
              color="red"
            />
            <FeatureCard
              icon={<Zap className="w-12 h-12" />}
              title={t('home.features.stats.title')}
              description={t('home.features.stats.description')}
              color="yellow"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 sm:py-16 md:py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 text-center">
            <StatCard 
              number="1,000+" 
              label={t('home.stats.activePlayers')} 
              icon="👥"
            />
            <StatCard 
              number="26" 
              label={t('home.stats.cantons')} 
              icon="🇨🇭"
            />
            <StatCard 
              number="100+" 
              label={t('home.stats.swissClubs')} 
              icon="🏐"
            />
            <StatCard 
              number="5,000+" 
              label={t('home.stats.videoHighlights')} 
              icon="🎥"
            />
          </div>
        </div>
      </section>

      {/* Gender-Specific Sections */}
      <section className="py-10 sm:py-16 md:py-20 bg-gradient-to-br from-blue-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {/* Men's Section */}
            <Link href="/players/men" className="group">
              <div className="relative h-60 sm:h-72 md:h-80 lg:h-96 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg sm:shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative h-full flex flex-col items-center justify-center text-white p-4 sm:p-6 md:p-8">
                  <div className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl mb-2 sm:mb-4 md:mb-6 group-hover:scale-110 transition-transform">♂</div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-center">{t('home.gender.mensVolleyball')}</h3>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-3 sm:mb-4 md:mb-6 opacity-90 text-center line-clamp-2">
                    {t('home.gender.mensLeaguePlayers')}
                  </p>
                  <div className="bg-white dark:bg-gray-800 text-blue-600 px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition">
                    {t('home.gender.discoverMen')}
                  </div>
                </div>
              </div>
            </Link>

            {/* Women's Section */}
            <Link href="/players/women" className="group">
              <div className="relative h-60 sm:h-72 md:h-80 lg:h-96 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg sm:shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-600 to-pink-800 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative h-full flex flex-col items-center justify-center text-white p-4 sm:p-6 md:p-8">
                  <div className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl mb-2 sm:mb-4 md:mb-6 group-hover:scale-110 transition-transform">♀</div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-center">{t('home.gender.womensVolleyball')}</h3>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-3 sm:mb-4 md:mb-6 opacity-90 text-center line-clamp-2">
                    {t('home.gender.womensLeaguePlayers')}
                  </p>
                  <div className="bg-white dark:bg-gray-800 text-pink-600 px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold group-hover:bg-pink-100 dark:group-hover:bg-pink-900/30 transition">
                    {t('home.gender.discoverWomen')}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-r from-red-600 to-red-700 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full" style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-3 sm:mb-4 md:mb-6">🏐</div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 md:mb-6 px-2">
            {t('home.cta.title')}
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-6 sm:mb-8 md:mb-10 opacity-90 max-w-2xl mx-auto px-4">
            {t('home.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
            <Link 
              href="/auth/register"
              className="bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base md:text-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition transform hover:scale-105 active:scale-95 shadow-xl sm:shadow-2xl"
            >
              <span className="flex items-center gap-2 justify-center">
                <Star className="w-5 h-5 sm:w-6 sm:h-6" />
                {t('home.cta.registerPlayer')}
              </span>
            </Link>
            <Link 
              href="/players"
              className="bg-transparent border-2 md:border-3 border-white dark:border-gray-300 text-white px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base md:text-lg hover:bg-white dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-white transition transform hover:scale-105 active:scale-95"
            >
              <span className="flex items-center gap-2 justify-center">
                <Search className="w-5 h-5 sm:w-6 sm:h-6" />
                {t('home.gender.browsePlayers')}
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function LeagueCard({ league, description, color, emoji, playerCount, fact, isExpanded, isHovered, onToggle, onMouseEnter, onMouseLeave }: {
  league: string;
  description: string;
  color: string;
  emoji: string;
  playerCount: string;
  fact?: string;
  isExpanded?: boolean;
  isHovered?: boolean;
  onToggle?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const { t } = useLanguage();
  
  // Determine if quote should show (mobile: tap expand, desktop: hover)
  const showQuote = isExpanded || isHovered;
  
  return (
    <div 
      className="league-card group relative overflow-hidden rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 h-full flex flex-col cursor-pointer"
      onClick={onToggle}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} rounded-xl sm:rounded-2xl`} />
      <div className="relative flex flex-row h-full">
        {/* Main content */}
        <div 
          className="p-2 sm:p-4 md:p-5 text-white flex-shrink-0 flex flex-col justify-between flex-1 min-h-[90px] sm:min-h-[150px]"
        >
          <div>
            <div className="text-lg sm:text-2xl md:text-3xl mb-0.5 sm:mb-2">{emoji}</div>
            <h3 className="text-[10px] sm:text-lg md:text-xl font-bold mb-0.5 sm:mb-1 leading-tight">{league}</h3>
            <p className="text-[8px] sm:text-xs md:text-sm opacity-90 mb-0.5 sm:mb-2 line-clamp-3 md:line-clamp-none">{description}</p>
          </div>
          <div>
            <div className="text-sm sm:text-lg md:text-xl font-bold">{playerCount}</div>
            <p className="text-[7px] sm:text-[10px] opacity-75">{t('home.leagues.players')}</p>
          </div>
        </div>
        {/* Quote panel - expands on tap (mobile) or hover (desktop) */}
        {fact && (
          <div 
            className={`quote-panel transition-all duration-300 ease-out overflow-hidden flex-shrink-0 ${
              showQuote 
                ? 'w-[140px] sm:w-[200px] lg:w-[260px]' 
                : 'w-0'
            }`}
          >
            <div className="w-[140px] sm:w-[200px] lg:w-[260px] h-full bg-white/20 backdrop-blur-sm border-l border-white/30 p-2 sm:p-3 lg:p-4 flex items-center">
              <p className="text-[9px] sm:text-xs lg:text-sm text-white font-medium italic leading-snug sm:leading-relaxed">
                "{fact}"
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Wrapper for League rows that handles expand/collapse state on mobile and hover on desktop
function LeagueRow({ children, cards, language }: { children?: React.ReactNode, language?: string, cards: Array<{
  league: string;
  description: string;
  color: string;
  emoji: string;
  playerCount: string;
  fact?: string;
  widthClass?: string;
}> }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  // Reset states when language changes
  useEffect(() => {
    setExpandedIndex(null);
    setHoveredIndex(null);
  }, [language]);
  
  const handleToggle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };
  
  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
  };
  
  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };
  
  return (
    <div className={`league-row flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8 ${hoveredIndex !== null ? 'has-hover' : ''}`}>
      {cards.map((card, index) => (
        <div 
          key={`${index}-${language}`} 
          className={`league-card-wrapper ${card.widthClass || ''} sm:w-auto ${expandedIndex === index ? 'is-expanded' : ''} ${hoveredIndex === index ? 'is-hovered' : ''}`}
        >
          <LeagueCard
            league={card.league}
            description={card.description}
            color={card.color}
            emoji={card.emoji}
            playerCount={card.playerCount}
            fact={card.fact}
            isExpanded={expandedIndex === index}
            isHovered={hoveredIndex === index}
            onToggle={() => handleToggle(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          />
        </div>
      ))}
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { 
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 group-hover:bg-blue-100',
    pink: 'text-pink-600 bg-pink-50 group-hover:bg-pink-100',
    red: 'text-red-600 bg-red-50 group-hover:bg-red-100',
    yellow: 'text-yellow-600 bg-yellow-50 group-hover:bg-yellow-100',
  }[color];

  return (
    <div className="group bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg sm:hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
      <div className={`inline-block p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl mb-2 sm:mb-3 md:mb-4 transition-all ${colorClasses}`}>
        <div className="w-6 h-6 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full">
          {icon}
        </div>
      </div>
      <h3 className="text-base sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 md:mb-3 text-gray-900 dark:text-white line-clamp-2">{title}</h3>
      <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">{description}</p>
    </div>
  );
}

function AuthPromptModal({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('playerProfile.authRequired')}</h3>
          <p className="text-gray-600 mb-6">
            {t('playerProfile.authRequiredMessage')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/auth/login"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all"
            >
              <span className="flex items-center justify-center gap-2">
                <LogIn className="w-5 h-5" />
                {t('playerProfile.login')}
              </span>
            </Link>
            <Link
              href="/auth/register"
              className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-3 rounded-xl font-bold transition-all"
            >
              <span className="flex items-center justify-center gap-2">
                <UserPlus className="w-5 h-5" />
                {t('playerProfile.register')}
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
  );
}

function StatCard({ number, label, icon }: { number: string; label: string; icon: string }) {
  return (
    <div className="group">
      <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-2 sm:mb-3 md:mb-4 group-hover:scale-110 transition-transform">{icon}</div>
      <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-1 sm:mb-2 md:mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
        {number}
      </div>
      <div className="text-xs sm:text-sm md:text-lg lg:text-xl text-gray-300 font-medium">{label}</div>
    </div>
  );
}
