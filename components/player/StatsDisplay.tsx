'use client'

export default function StatsDisplay({ stats }: { stats: any }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Saison {stats.season}</h3>
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* General Stats */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="font-semibold mb-4 text-gray-700">Allgemein</h4>
          <div className="space-y-3">
            <StatRow label="Spiele" value={stats.matchesPlayed} />
            <StatRow label="Sets" value={stats.setsPlayed} />
            <StatRow label="Punkte" value={stats.points} />
          </div>
        </div>

        {/* Offensive Stats */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="font-semibold mb-4 text-gray-700">Angriff</h4>
          <div className="space-y-3">
            <StatRow label="Kills" value={stats.kills} />
            <StatRow label="Versuche" value={stats.attackAttempts} />
            <StatRow label="Erfolgsquote" value={`${stats.attackPercentage}%`} />
          </div>
        </div>

        {/* Service & Defense */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="font-semibold mb-4 text-gray-700">Service & Defense</h4>
          <div className="space-y-3">
            <StatRow label="Aces" value={stats.aces} />
            <StatRow label="Blocks" value={stats.blocks} />
            <StatRow label="Digs" value={stats.digs || 0} />
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="mt-6 p-6 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-4 text-gray-700">Performance Übersicht</h4>
        <div className="space-y-4">
          <ProgressBar label="Angriff" value={stats.attackPercentage} max={100} />
          <ProgressBar label="Service" value={(stats.aces / stats.matchesPlayed) * 10} max={10} />
          <ProgressBar label="Block" value={(stats.blocks / stats.matchesPlayed) * 5} max={5} />
        </div>
      </div>
    </div>
  )
}

function StatRow({ label, value }: { label: string, value: number | string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-600">{label}</span>
      <span className="font-bold text-lg">{value}</span>
    </div>
  )
}

function ProgressBar({ label, value, max }: { label: string, value: number, max: number }) {
  const percentage = (value / max) * 100

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold">{value.toFixed(1)}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-habicht-600 h-2.5 rounded-full transition-all"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  )
}
