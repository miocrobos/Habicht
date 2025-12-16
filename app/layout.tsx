import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/AuthProvider'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Habicht - Swiss Volleyball Scouting Platform',
  description: 'Scouting platform for Swiss volleyball athletes from high school to university. Find talented players, view highlights, and connect with recruits.',
  keywords: ['volleyball', 'swiss volleyball', 'scouting', 'recruitment', 'athletes', 'swiss volley'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de-CH" className="dark:bg-gray-900">
      <body className={`${inter.className} dark:bg-gray-900`}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen dark:bg-gray-900">
            <Header />
            <main className="flex-grow dark:bg-gray-900">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
