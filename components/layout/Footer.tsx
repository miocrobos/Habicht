import Link from 'next/link'
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 dark:text-gray-400">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* About */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <h3 className="text-white dark:text-gray-100 font-bold text-base sm:text-lg mb-3 sm:mb-4">Habicht</h3>
            <p className="text-xs sm:text-sm">
              D'Plattform für Schweizer Volleyball-Talente - Vo Kantonsschuel bis Universität
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white dark:text-gray-100 font-bold text-base sm:text-lg mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li><Link href="/players" className="hover:text-white dark:hover:text-gray-100 transition">Spieler</Link></li>
              <li><Link href="/clubs" className="hover:text-white dark:hover:text-gray-100 transition">Clubs</Link></li>
              <li><Link href="/about" className="hover:text-white dark:hover:text-gray-100 transition">Über uns</Link></li>
              <li><Link href="/contact" className="hover:text-white dark:hover:text-gray-100 transition">Kontakt</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white dark:text-gray-100 font-bold text-base sm:text-lg mb-3 sm:mb-4">Ressourcen</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li>
                <a 
                  href="https://www.volleyball.ch" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white dark:hover:text-gray-100 transition"
                >
                  Swiss Volley
                </a>
              </li>
              <li><Link href="/privacy" className="hover:text-white dark:hover:text-gray-100 transition">Datenschutz</Link></li>
              <li><Link href="/terms" className="hover:text-white dark:hover:text-gray-100 transition">AGB</Link></li>
              <li><Link href="/faq" className="hover:text-white dark:hover:text-gray-100 transition">FAQ</Link></li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="col-span-2 sm:col-span-1">
            <h3 className="text-white dark:text-gray-100 font-bold text-base sm:text-lg mb-3 sm:mb-4">Folg üs</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white dark:hover:text-gray-100 transition p-2 -m-2" aria-label="Facebook">
                <Facebook className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a href="#" className="hover:text-white dark:hover:text-gray-100 transition p-2 -m-2" aria-label="Instagram">
                <Instagram className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a href="#" className="hover:text-white dark:hover:text-gray-100 transition p-2 -m-2" aria-label="Twitter">
                <Twitter className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a href="#" className="hover:text-white dark:hover:text-gray-100 transition p-2 -m-2" aria-label="Youtube">
                <Youtube className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 dark:border-gray-900 mt-6 sm:mt-8 pt-6 sm:pt-8 text-xs sm:text-sm text-center">
          <p>&copy; {currentYear} Habicht - Swiss Volleyball Scouting Platform. Alli Rächt vorbehalte.</p>
        </div>
      </div>
    </footer>
  )
}
