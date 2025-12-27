'use client'

interface CoachesListProps {
  coaches: Array<{
    id: string
    firstName: string
    lastName: string
    role: string
    specialization?: string
    photoUrl?: string
    email?: string
    yearsExperience?: number
    clubName: string
  }>
}

export default function CoachesList({ coaches }: CoachesListProps) {
  if (!coaches || coaches.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Kei Coaches erfasst
      </div>
    )
  }

  // Group by club
  const groupedCoaches = coaches.reduce((acc, coach) => {
    const key = coach.clubName
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(coach)
    return acc
  }, {} as Record<string, typeof coaches>)

  return (
    <div className="space-y-6">
      {Object.entries(groupedCoaches).map(([clubName, clubCoaches]) => (
        <div key={clubName} className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-semibold text-lg mb-4 text-gray-900">{clubName}</h4>
          <div className="space-y-4">
            {clubCoaches.map((coach) => (
              <div
                key={coach.id}
                className="bg-white rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex items-start gap-4">
                  {/* Coach Avatar */}
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold shadow-md text-xl flex-shrink-0">
                    {coach.firstName[0]}{coach.lastName[0]}
                  </div>

                  {/* Coach Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-bold text-gray-900">
                          {coach.firstName} {coach.lastName}
                        </h5>
                        <p className="text-sm text-habicht-600 font-medium">
                          {coach.role}
                        </p>
                        {coach.specialization && (
                          <p className="text-xs text-gray-600 mt-1">
                            Spezialisierung: {coach.specialization}
                          </p>
                        )}
                      </div>
                      {coach.yearsExperience && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-habicht-600">
                            {coach.yearsExperience}
                          </div>
                          <div className="text-xs text-gray-600">Jahre</div>
                        </div>
                      )}
                    </div>

                    {coach.email && (
                      <a
                        href={`mailto:${coach.email}`}
                        className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-habicht-600 mt-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Kontakt
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
