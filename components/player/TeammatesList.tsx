'use client'

interface TeammatesListProps {
  teammates: Array<{
    id: string
    firstName: string
    lastName: string
    position: string
    jerseyNumber?: number
    profileImage?: string
    season: string
    clubName: string
  }>
}

export default function TeammatesList({ teammates }: TeammatesListProps) {
  if (!teammates || teammates.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Kei Teammates erfasst
      </div>
    )
  }

  // Group by club/season
  const groupedTeammates = teammates.reduce((acc, teammate) => {
    const key = `${teammate.clubName} - ${teammate.season}`
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(teammate)
    return acc
  }, {} as Record<string, typeof teammates>)

  return (
    <div className="space-y-6">
      {Object.entries(groupedTeammates).map(([key, members]) => (
        <div key={key} className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-semibold text-lg mb-4 text-gray-900">{key}</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {members.map((teammate) => (
              <a
                key={teammate.id}
                href={`/players/${teammate.id}`}
                className="bg-white rounded-lg p-4 hover:shadow-lg transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-habicht-500 to-habicht-700 rounded-full flex items-center justify-center text-white font-bold shadow-md group-hover:scale-110 transition">
                    {teammate.jerseyNumber || teammate.firstName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-900 truncate">
                      {teammate.firstName} {teammate.lastName}
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      {teammate.position.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
