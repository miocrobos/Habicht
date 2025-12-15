'use client'

export default function ClubHistory({ history }: { history: any[] }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Club Karriere</h3>
      
      <div className="space-y-4">
        {history.map((item, index) => (
          <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:shadow-md transition">
            {/* Club Logo */}
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow flex-shrink-0">
              <span className="font-bold text-habicht-600">
                {item.club.name.split(' ').map((word: string) => word[0]).join('')}
              </span>
            </div>

            {/* Club Info */}
            <div className="flex-grow">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-lg">{item.club.name}</h4>
                  <p className="text-sm text-gray-600">{item.league}</p>
                  {item.jerseyNumber && (
                    <p className="text-sm text-gray-600">Nummer: #{item.jerseyNumber}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {new Date(item.startDate).getFullYear()} - {item.endDate ? new Date(item.endDate).getFullYear() : 'Heute'}
                  </div>
                  {!item.endDate && (
                    <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Aktuell
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
