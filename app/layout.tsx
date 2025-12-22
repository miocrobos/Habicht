import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Habicht - Schwiizer Volleyball Scouting Plattform',
  description: 'D Moderne Scouting-Plattform Für Schwiizer Volleyball. Entdecke Talente, Lueg Highlights Aa Und Vernetz Dich Mit Rekrutierer.',
  keywords: ['volleyball', 'swiss volleyball', 'scouting', 'recruitment', 'athletes', 'swiss volley', 'schweizer volleyball', 'volleyball schweiz'],
  icons: {
    icon: '/eagle-logo.png',
    apple: '/eagle-logo.png',
  },
  openGraph: {
    title: 'Habicht - Schwiizer Volleyball Scouting Plattform',
    description: 'D Moderne Scouting-Plattform Für Schwiizer Volleyball. Entdecke Talente, Lueg Highlights Aa Und Vernetz Dich Mit Rekrutierer.',
    images: ['/eagle-logo.png'],
    type: 'website',
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'light';
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
      <body className={inter.className}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow">
                  {children}
                </main>
                <Footer />
              </div>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
