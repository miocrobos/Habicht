import Link from 'next/link'
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Habicht</h3>
            <p className="text-sm">
              D'Plattform für Schweizer Volleyball-Talente - Vo Kantonsschuel bis Universität
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/players" className="hover:text-white transition">Spieler</Link></li>
              <li><Link href="/clubs" className="hover:text-white transition">Clubs</Link></li>
              <li><Link href="/about" className="hover:text-white transition">Über uns</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">Kontakt</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Ressourcen</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://www.volleyball.ch" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  Swiss Volley
                </a>
              </li>
              <li><Link href="/privacy" className="hover:text-white transition">Datenschutz</Link></li>
              <li><Link href="/terms" className="hover:text-white transition">AGB</Link></li>
              <li><Link href="/faq" className="hover:text-white transition">FAQ</Link></li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Folg üs</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white transition">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-white transition">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-white transition">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-white transition">
                <Youtube className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; {currentYear} Habicht - Swiss Volleyball Scouting Platform. Alli Rächt vorbehalte.</p>
        </div>
      </div>
    </footer>
  )
}
