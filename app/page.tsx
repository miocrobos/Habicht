'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Search, TrendingUp, Users, Video, Award, MapPin, Star, Zap, LogIn, UserPlus, Building2 } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import CantonFlag from '@/components/shared/CantonFlag'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTheme } from '@/contexts/ThemeContext'

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, language } = useLanguage();
  const { theme } = useTheme();

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



  return (
    <div className="min-h-screen">
      {/* Hero Section with Full-Bleed Background Image */}
      <section className="relative min-h-[420px] sm:min-h-[500px] md:min-h-[550px] lg:min-h-[600px] overflow-hidden">
        {/* Background Image with Blend Effect - switches based on theme */}
        <div className="absolute inset-0">
          {/* Same image for both modes */}
          <Image
            src="/volleyball-hero.jpg?v=2"
            alt="Volleyball"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Gradient overlay for light mode - white gradient for text readability */}
          <div className={`absolute inset-0 transition-opacity duration-500 ${theme === 'light' ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent" />
          </div>
          {/* Gradient overlay for dark mode - dark gradient for text readability */}
          <div className={`absolute inset-0 transition-opacity duration-500 ${theme === 'light' ? 'opacity-0' : 'opacity-100'}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-950/95 via-gray-950/80 to-gray-950/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
          </div>
        </div>
        
        <div className="container mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col justify-end items-start min-h-[420px] sm:min-h-[500px] md:min-h-[550px] lg:min-h-[600px] py-6 sm:py-8 lg:py-12 pb-12 sm:pb-16 md:pb-20 lg:pb-24">
            
            {/* Content - Left aligned */}
            <div className="max-w-md sm:max-w-lg lg:max-w-xl text-left">
              <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight mb-3 sm:mb-4 md:mb-6 ${theme === 'light' ? 'text-gray-900 drop-shadow-sm' : 'text-white'}`}>
                {t('home.hero.title')}
              </h1>
              <p className={`text-base sm:text-lg md:text-xl lg:text-2xl mb-4 sm:mb-6 md:mb-8 leading-relaxed ${theme === 'light' ? 'text-gray-800 drop-shadow-sm' : 'text-gray-300'}`}>
                {t('home.hero.subtitle')}
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 md:gap-4">
                <Link
                  href="/clubs"
                  className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 border-2 rounded-lg text-sm sm:text-base md:text-lg font-semibold transition-all ${
                    theme === 'light' 
                      ? 'border-gray-900 text-gray-900 hover:bg-gray-900/10' 
                      : 'border-white text-white hover:bg-white/10'
                  }`}
                >
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  {t('home.hero.searchAllClubs')}
                </Link>
                {!session && (
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm sm:text-base md:text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                  >
                    <Star className="w-4 h-4 sm:w-5 sm:h-5" />
                    {t('home.hero.registerNow')}
                  </Link>
                )}
              </div>
            </div>
          </div>
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
            { league: t('home.leagues.nlaShort'), description: t('home.leagues.nla'), color: "from-blue-600 to-blue-700", emoji: "🏆", playerCount: "120+", fact: t('home.leagueCards.nla.quote'), explanation: t('home.slides.nla.explanation') },
            { league: t('home.leagues.nlbShort'), description: t('home.leagues.nlb'), color: "from-indigo-600 to-indigo-700", emoji: "🏐", playerCount: "200+", fact: t('home.leagueCards.nlb.quote'), explanation: t('home.slides.nlb.explanation') },
            { league: t('home.leagues.firstLeague'), description: t('home.leagues.firstLeague'), color: "from-purple-600 to-purple-700", emoji: "🔥", playerCount: "300+", fact: t('home.leagueCards.liga1.quote'), explanation: t('home.slides.liga1.explanation') },
            { league: t('home.leagues.secondLeague'), description: t('home.leagues.secondLeague'), color: "from-pink-600 to-pink-700", emoji: "💪", playerCount: "400+", fact: t('home.leagueCards.liga2.quote'), explanation: t('home.slides.liga2.explanation') },
            { league: t('home.leagues.thirdLeague'), description: t('home.leagues.thirdLeague'), color: "from-green-600 to-green-700", emoji: "⚡", playerCount: "500+", fact: t('home.leagueCards.liga3.quote'), explanation: t('home.slides.liga3.explanation'), widthClass: "w-full" }
          ]} />

          {/* Second row: 4th, 5th, U23, U20, U18 */}
          <LeagueRow key={`row2-${language}`} language={language} cards={[
            { league: t('home.leagues.fourthLeague'), description: t('home.leagues.fourthLeague'), color: "from-teal-600 to-teal-700", emoji: "⭐", playerCount: "600+", fact: t('home.leagueCards.liga4.quote'), explanation: t('home.slides.liga4.explanation') },
            { league: t('home.leagues.fifthLeague'), description: t('home.leagues.fifthLeague'), color: "from-indigo-600 to-purple-700", emoji: "🌟", playerCount: "300+", fact: t('home.leagueCards.liga5.quote'), explanation: t('home.slides.liga5.explanation') },
            { league: t('home.leagues.u23'), description: t('home.leagues.u23'), color: "from-orange-600 to-orange-700", emoji: "🎯", playerCount: "150+", fact: t('home.leagueCards.u23.quote'), explanation: t('home.slides.u23.explanation') },
            { league: t('home.leagues.u20'), description: t('home.leagues.u20'), color: "from-cyan-600 to-cyan-700", emoji: "🚀", playerCount: "180+", fact: t('home.leagueCards.u20.quote'), explanation: t('home.slides.u20.explanation') },
            { league: t('home.leagues.u18'), description: t('home.leagues.u18'), color: "from-amber-600 to-amber-700", emoji: "✨", playerCount: "200+", fact: t('home.leagueCards.u18.quote'), explanation: t('home.slides.u18.explanation'), widthClass: "w-full" }
          ]} />

          {/* Swiss Regions Highlight */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-3 sm:p-6 md:p-12">
            <h3 className="text-lg sm:text-2xl md:text-3xl font-bold text-center mb-3 sm:mb-6 md:mb-8">🇨🇭 Alle 26 Kantone</h3>
            <div className="grid grid-cols-4 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-1.5 sm:gap-3 md:gap-4">
              {['ZH', 'BE', 'VD', 'AG', 'SG', 'GE', 'LU', 'TG', 'TI', 'VS', 'BL', 'SO', 'FR', 'BS', 'GR', 'NE', 'ZG', 'SH', 'UR', 'SZ', 'JU', 'AR', 'AI', 'NW', 'GL', 'OW'].map(canton => (
                <Link 
                  key={canton} 
                  href={`/clubs?canton=${canton}`}
                  className="p-1 sm:p-2 md:p-3 bg-gray-50 dark:bg-gray-700 rounded-md sm:rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 hover:shadow-md transition cursor-pointer flex flex-col items-center gap-0.5 sm:gap-2 active:scale-95"
                >
                  <CantonFlag canton={canton as any} size="sm" />
                  <div className="text-xs sm:text-base md:text-lg lg:text-xl font-bold text-gray-800 dark:text-gray-200">{canton}</div>
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
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gradient-to-br from-blue-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="grid grid-cols-2 gap-2 sm:gap-4 md:gap-6 lg:gap-8">
            {/* Men's Section */}
            <Link href="/players/men" className="group">
              <div className="relative h-40 xs:h-48 sm:h-64 md:h-72 lg:h-80 xl:h-96 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-lg sm:shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative h-full flex flex-col items-center justify-center text-white p-2 sm:p-4 md:p-6 lg:p-8">
                  <div className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl mb-1.5 sm:mb-3 md:mb-4 lg:mb-6 group-hover:scale-110 transition-transform">♂</div>
                  <h3 className="text-sm xs:text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-1 sm:mb-2 md:mb-3 lg:mb-4 text-center">{t('home.gender.mensVolleyball')}</h3>
                  <p className="text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl mb-2 sm:mb-3 md:mb-4 lg:mb-6 opacity-90 text-center line-clamp-1 sm:line-clamp-2">
                    {t('home.gender.mensLeaguePlayers')}
                  </p>
                  <div className="bg-white dark:bg-gray-800 text-blue-600 px-2 py-1 xs:px-3 xs:py-1.5 sm:px-5 sm:py-2 md:px-6 md:py-3 rounded-md sm:rounded-lg md:rounded-xl text-[10px] xs:text-xs sm:text-sm md:text-base font-bold group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition">
                    {t('home.gender.discoverMen')}
                  </div>
                </div>
              </div>
            </Link>

            {/* Women's Section */}
            <Link href="/players/women" className="group">
              <div className="relative h-40 xs:h-48 sm:h-64 md:h-72 lg:h-80 xl:h-96 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-lg sm:shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-600 to-pink-800 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative h-full flex flex-col items-center justify-center text-white p-2 sm:p-4 md:p-6 lg:p-8">
                  <div className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl mb-1.5 sm:mb-3 md:mb-4 lg:mb-6 group-hover:scale-110 transition-transform">♀</div>
                  <h3 className="text-sm xs:text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-1 sm:mb-2 md:mb-3 lg:mb-4 text-center">{t('home.gender.womensVolleyball')}</h3>
                  <p className="text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl mb-2 sm:mb-3 md:mb-4 lg:mb-6 opacity-90 text-center line-clamp-1 sm:line-clamp-2">
                    {t('home.gender.womensLeaguePlayers')}
                  </p>
                  <div className="bg-white dark:bg-gray-800 text-pink-600 px-2 py-1 xs:px-3 xs:py-1.5 sm:px-5 sm:py-2 md:px-6 md:py-3 rounded-md sm:rounded-lg md:rounded-xl text-[10px] xs:text-xs sm:text-sm md:text-base font-bold group-hover:bg-pink-100 dark:group-hover:bg-pink-900/30 transition">
                    {t('home.gender.discoverWomen')}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-24 bg-gradient-to-r from-red-600 to-red-700 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full" style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }}></div>
        </div>
        
        <div className="container mx-auto px-3 sm:px-4 text-center relative z-10">
          <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-2 sm:mb-3 md:mb-4 lg:mb-6">🏐</div>
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold mb-2 sm:mb-3 md:mb-4 lg:mb-6 px-2">
            {t('home.cta.title')}
          </h2>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl mb-4 sm:mb-6 md:mb-8 lg:mb-10 opacity-90 max-w-2xl mx-auto px-3 sm:px-4">
            {t('home.cta.subtitle')}
          </p>
          <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 md:gap-4 justify-center px-3 sm:px-4">
            <Link 
              href="/auth/register"
              className="bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 px-4 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 lg:px-10 lg:py-5 rounded-lg sm:rounded-xl md:rounded-2xl font-bold text-xs sm:text-sm md:text-base lg:text-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition transform hover:scale-105 active:scale-95 shadow-lg sm:shadow-xl md:shadow-2xl"
            >
              <span className="flex items-center gap-1.5 sm:gap-2 justify-center">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                {t('home.cta.registerPlayer')}
              </span>
            </Link>
            <Link 
              href="/players"
              className="bg-transparent border-2 md:border-3 border-white dark:border-gray-300 text-white px-4 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 lg:px-10 lg:py-5 rounded-lg sm:rounded-xl md:rounded-2xl font-bold text-xs sm:text-sm md:text-base lg:text-lg hover:bg-white dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-white transition transform hover:scale-105 active:scale-95"
            >
              <span className="flex items-center gap-1.5 sm:gap-2 justify-center">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                {t('home.gender.browsePlayers')}
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function LeagueCard({ league, description, color, emoji, playerCount, fact, explanation, showQuote, showExplanation, onClick, onMouseEnter, onMouseLeave }: {
  league: string;
  description: string;
  color: string;
  emoji: string;
  playerCount: string;
  fact?: string;
  explanation?: string;
  showQuote?: boolean;
  showExplanation?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const { t } = useLanguage();
  
  // Determine what content to show
  const showPanel = showQuote || showExplanation;
  const panelContent = showExplanation ? explanation : fact;
  const isExplanationMode = showExplanation;
  
  return (
    <div 
      className="league-card group relative overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl shadow-md sm:shadow-lg hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 h-full flex flex-col cursor-pointer"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} rounded-lg sm:rounded-xl md:rounded-2xl`} />
      <div className="relative flex flex-col sm:flex-row h-full">
        {/* Main content */}
        <div 
          className="p-2.5 sm:p-4 md:p-5 text-white flex-shrink-0 flex flex-col justify-between flex-1 min-h-[85px] sm:min-h-[120px]"
        >
          <div>
            <div className="text-lg sm:text-2xl md:text-3xl mb-0.5 sm:mb-2">{emoji}</div>
            <h3 className="text-sm sm:text-lg md:text-xl font-bold mb-0.5 sm:mb-1 leading-tight">{league}</h3>
            <p className="text-[11px] sm:text-xs md:text-sm opacity-90 mb-0.5 sm:mb-2 line-clamp-1 md:line-clamp-none">{description}</p>
          </div>
          <div>
            <div className="text-sm sm:text-lg md:text-xl font-bold">{playerCount}</div>
            <p className="text-[10px] sm:text-[10px] opacity-75">{t('home.leagues.players')}</p>
          </div>
        </div>
        {/* Quote/Explanation panel - shows on hover/tap/double-tap */}
        {panelContent && (
          <div 
            className={`transition-all duration-300 ease-out overflow-hidden ${
              showPanel 
                ? isExplanationMode
                  ? 'h-auto sm:h-full sm:w-[200px] lg:w-[280px] max-h-[120px] sm:max-h-none'
                  : 'h-auto sm:h-full sm:w-[160px] lg:w-[200px] max-h-[80px] sm:max-h-none'
                : 'h-0 sm:h-full sm:w-0 max-h-0 sm:max-h-none'
            }`}
          >
            <div className={`w-full h-full bg-white/20 backdrop-blur-sm sm:border-l border-t sm:border-t-0 border-white/30 p-2 sm:p-3 flex flex-col justify-center ${
              isExplanationMode ? 'sm:w-[200px] lg:w-[280px]' : 'sm:w-[160px] lg:w-[200px]'
            }`}>
              {isExplanationMode ? (
                <>
                  <p className="text-[8px] sm:text-xs lg:text-sm text-white/70 font-semibold uppercase tracking-wide mb-1">
                    {t('home.slides.aboutThisLeague') || 'About this League'}
                  </p>
                  <p className="text-[9px] sm:text-xs lg:text-sm text-white font-medium leading-snug">
                    {panelContent}
                  </p>
                </>
              ) : (
                <p className="text-[9px] sm:text-xs lg:text-sm text-white font-medium italic leading-snug">
                  "{panelContent}"
                </p>
              )}
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
  explanation?: string;
  widthClass?: string;
}> }) {
  // Track which card shows explanation (single click)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  // Track hover for desktop (shows quote)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  // Reset states when language changes
  useEffect(() => {
    setExpandedIndex(null);
    setHoveredIndex(null);
  }, [language]);
  
  // Single click toggles explanation
  const handleClick = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };
  
  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
  };
  
  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };
  
  return (
    <div className={`league-row gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8 ${hoveredIndex !== null ? 'has-hover' : ''}`}>
      {cards.map((card, index) => {
        const showExplanation = expandedIndex === index;
        const showQuote = hoveredIndex === index && !showExplanation;
        const isExpanded = showQuote || showExplanation;
        
        return (
          <div 
            key={`${index}-${language}`} 
            className={`league-card-wrapper ${card.widthClass || ''} ${isExpanded ? 'is-expanded' : ''} ${showExplanation ? 'is-explanation' : ''} ${hoveredIndex === index ? 'is-hovered' : ''}`}
          >
            <LeagueCard
              league={card.league}
              description={card.description}
              color={card.color}
              emoji={card.emoji}
              playerCount={card.playerCount}
              fact={card.fact}
              explanation={card.explanation}
              showQuote={showQuote}
              showExplanation={showExplanation}
              onClick={() => handleClick(index)}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
            />
          </div>
        );
      })}
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
    <div className="group bg-white dark:bg-gray-800 p-3 sm:p-5 md:p-8 rounded-lg sm:rounded-xl md:rounded-2xl shadow-md hover:shadow-lg sm:hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
      <div className={`inline-block p-1.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl mb-1.5 sm:mb-3 md:mb-4 transition-all ${colorClasses}`}>
        <div className="w-5 h-5 sm:w-8 sm:h-8 md:w-12 md:h-12 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full">
          {icon}
        </div>
      </div>
      <h3 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold mb-0.5 sm:mb-2 md:mb-3 text-gray-900 dark:text-white line-clamp-2">{title}</h3>
      <p className="text-[10px] sm:text-xs md:text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 sm:line-clamp-3">{description}</p>
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
      <div className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl mb-1.5 sm:mb-3 md:mb-4 group-hover:scale-110 transition-transform">{icon}</div>
      <div className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-0.5 sm:mb-2 md:mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
        {number}
      </div>
      <div className="text-[10px] sm:text-xs md:text-sm lg:text-lg xl:text-xl text-gray-300 font-medium">{label}</div>
    </div>
  );
}
