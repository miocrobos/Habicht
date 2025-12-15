export default function ClubsPage() {
  const clubs = [
    {
      name: 'Volley Amriswil',
      league: 'NLA',
      canton: 'TG',
      website: 'https://www.volley-amriswil.ch',
      description: 'Top club in Nationalliga A'
    },
    {
      name: 'Volley Schönenwerd',
      league: 'NLA',
      canton: 'SO',
      website: 'https://www.volleyschoenenwerd.ch',
      description: 'Elite club with strong youth program'
    },
    {
      name: 'VC Kanti Schaffhausen',
      league: 'NLB',
      canton: 'SH',
      website: 'https://www.vckanti.ch',
      description: 'School-based volleyball excellence'
    },
    {
      name: 'Volley Toggenburg',
      league: 'NLA',
      canton: 'SG',
      website: 'https://www.volley-toggenburg.ch',
      description: 'Regional powerhouse'
    },
    {
      name: "SM'Aesch Pfeffingen",
      league: 'NLA',
      canton: 'BL',
      website: 'https://www.smvolley.ch',
      description: 'Championship contender'
    },
    {
      name: 'VBC Cheseaux',
      league: 'NLA',
      canton: 'VD',
      website: 'https://www.vbc-cheseaux.ch',
      description: 'Romande volleyball leader'
    },
    {
      name: 'Volley Alpnach',
      league: 'NLB',
      canton: 'OW',
      website: 'https://www.volley-alpnach.ch',
      description: 'Central Switzerland representative'
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Schweizer Volleyball Clubs</h1>
        <p className="text-lg text-gray-600 mb-8">
          Übersicht über Schweizer Volleyball-Clubs in diverse Ligs
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{club.name}</h3>
                  <p className="text-sm text-gray-600">{club.canton}</p>
                </div>
                <span className="bg-habicht-100 text-habicht-700 px-3 py-1 rounded-full text-sm font-medium">
                  {club.league}
                </span>
              </div>
              
              <p className="text-gray-700 mb-4">{club.description}</p>
              
              <a
                href={club.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-habicht-600 text-white px-4 py-2 rounded-lg hover:bg-habicht-700 transition text-sm font-medium"
              >
                Club Website →
              </a>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-4">Din Club fehlt?</h2>
          <p className="text-gray-700 mb-4">
            Mir sind am Erwiitern vo üsere Club-Datenbank. Wenn din Club fehlt, meld dich bi üs!
          </p>
          <a
            href="mailto:info@habicht-volleyball.ch"
            className="inline-block bg-swiss-red text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-medium"
          >
            Club hinzufügen
          </a>
        </div>
      </div>
    </div>
  )
}
