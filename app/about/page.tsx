export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Über Habicht</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold dark:text-white mb-4">Was isch Habicht?</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Habicht isch d'Plattform für Schweizer Volleyball-Talente. 
            Mir verbinde Spieler mit Recruiters und Scouts us de ganze Schwiiz.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Inspiriert vo Volleybox, aber speziell für d'Schwiizer Volleyball-Landschaft entwicklet, 
            mit direkter Integration zu Swiss Volley und de wichtigste Clubs.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold dark:text-white mb-4">Mission</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Mir wönd es einfachs und professionells Tool schaffe, wo jungi Schweizer Volleyball-Talente 
            ihri Fähigkeite chönd zeige und de Schritt zu höchere Ligs oder Universitäts-Teams chönd mache.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold dark:text-white mb-4">Features</h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <span className="text-habicht-600 mr-2">•</span>
              <span>Vollständigi Spieler-Profile mit Stats und persönliche Infos</span>
            </li>
            <li className="flex items-start">
              <span className="text-habicht-600 mr-2">•</span>
              <span>Video-Highlights hochlade oder vo YouTube, Instagram & TikTok verlinke</span>
            </li>
            <li className="flex items-start">
              <span className="text-habicht-600 mr-2">•</span>
              <span>Automatischi Verlinkig zu Swiss Volley und Club-Websites</span>
            </li>
            <li className="flex items-start">
              <span className="text-habicht-600 mr-2">•</span>
              <span>Suchfunktion für Recruiters mit umfassende Filter</span>
            </li>
            <li className="flex items-start">
              <span className="text-habicht-600 mr-2">•</span>
              <span>Karriere-Timeline ähnlich wie bi Volleybox</span>
            </li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold dark:text-white mb-4">Kontakt</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Häsch Frage oder Vorschläg? Mir wönd vo dir ghöre!
          </p>
          <div className="space-y-2 text-gray-700 dark:text-gray-300">
            <p><strong>Email:</strong> info@habicht-volleyball.ch</p>
            <p><strong>GitHub:</strong> <a href="https://github.com/miocrobos/UniSports" className="text-habicht-600 hover:underline">github.com/miocrobos/UniSports</a></p>
          </div>
        </div>
      </div>
    </div>
  )
}
