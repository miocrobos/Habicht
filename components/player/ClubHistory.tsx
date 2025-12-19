'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function ClubHistory({ history }: { history: any[] }) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">Kei Vereinsgeschichte verfüegbar</p>
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Club Karriere</h3>
      
      <div className="space-y-4">
        {history.map((item, index) => {
          const clubName = item.clubName || item.club?.name || 'Unknown Club';
          const clubId = item.clubId || item.club?.id;
          const isClickable = !!clubId;
          
          return (
            <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition">
              {/* Club Logo */}
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow flex-shrink-0 overflow-hidden">
                {(item.clubLogo || item.club?.logo) ? (
                  <Image
                    src={item.clubLogo || item.club.logo}
                    alt={clubName}
                    width={64}
                    height={64}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="font-bold text-red-600 dark:text-red-400 text-xs">
                    {clubName.split(' ').map((word: string) => word[0]).join('').slice(0, 3)}
                  </span>
                )}
              </div>

              {/* Club Info */}
              <div className="flex-grow">
                <div className="flex items-start justify-between">
                  <div>
                    {isClickable ? (
                      <Link href={`/clubs/${clubId}`} className="font-semibold text-lg dark:text-white hover:text-red-600 dark:hover:text-red-400 transition">
                        {clubName}
                      </Link>
                    ) : (
                      <h4 className="font-semibold text-lg dark:text-white">{clubName}</h4>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.league || 'Unknown League'}</p>
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
          );
        })}
      </div>
    </div>
  )
}
