import { Toaster } from 'react-hot-toast';
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { HeaderProvider } from '@/contexts/HeaderContext'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import SettingsPopup from '@/components/shared/SettingsPopup'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.habicht-volleyball.ch'),
  title: 'Habicht | Swiss Volleyball Scouting & Talent Platform',
  description: 'Discover Swiss volleyball talent, club opportunities, player profiles, and scouting insights across Switzerland with Habicht.',
  keywords: [
    'Swiss volleyball',
    'volleyball Switzerland',
    'volleyball Schweiz',
    'schweizer volleyball',
    'volleyball scouting',
    'volleyball talent Switzerland',
    'volleyball clubs Switzerland',
    'volleyball players Switzerland',
    'volleyball recruiting Swiss',
    'Habicht volleyball',
    'volleyball talent platform',
    'volleyball Switzerland clubs',
    'Swiss volleyball players',
    'Swiss volleyball scouting platform',
  ],
  alternates: {
    canonical: '/',
    languages: {
      'de-CH': '/',
      'fr-CH': '/',
      'en-CH': '/',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/eagle-logo.png',
  },
  openGraph: {
    title: 'Habicht | Swiss Volleyball Scouting & Talent Platform',
    description: 'Discover Swiss volleyball talent, club opportunities, player profiles, and scouting insights across Switzerland with Habicht.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, type: 'image/jpeg' }],
    url: 'https://www.habicht-volleyball.ch/',
    siteName: 'Habicht',
    locale: 'de_CH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Habicht | Swiss Volleyball Scouting & Talent Platform',
    description: 'Discover Swiss volleyball talent, club opportunities, player profiles, and scouting insights across Switzerland with Habicht.',
    images: ['/og-image.jpg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de-CH" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'dark';
                document.documentElement.setAttribute('data-theme', theme);
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-white dark:bg-gray-950`}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <HeaderProvider>
                <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">
                  <Header />
                  <main className="flex-grow bg-white dark:bg-gray-950">
                    {children}
                  </main>
                  <Footer />
                  <SettingsPopup />
                  <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
                </div>
              </HeaderProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
