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
  title: 'Habicht - Swiss Volleyball Scouting Platform',
  description: 'Scouting platform for Swiss volleyball athletes. Find talented players, view highlights, and connect with recruits.',
  keywords: ['volleyball', 'swiss volleyball', 'scouting', 'recruitment', 'athletes', 'swiss volley', 'schweizer volleyball', 'volleyball schweiz'],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/eagle-logo.png',
  },
  openGraph: {
    title: 'Habicht – Swiss Volleyball Scouting Platform',
    description: 'Scouting platform for Swiss volleyball athletes. Find talented players, view highlights, and connect with recruits.',
    images: [{ url: 'https://www.habicht-volleyball.ch/og-image.png' }],
    url: 'https://www.habicht-volleyball.ch/',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Habicht – Swiss Volleyball Scouting Platform',
    description: 'Scouting platform for Swiss volleyball athletes. Find talented players, view highlights, and connect with recruits.',
    images: ['https://www.habicht-volleyball.ch/og-image.png'],
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
