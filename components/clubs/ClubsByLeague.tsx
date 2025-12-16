'use client';
import { useState } from 'react';
import { Search, Trophy, Users, MapPin, Loader2 } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

interface Club {
  id: string;
  name: string;
  shortName?: string;
  logo?: string;
  canton: string;
  town: string;
  league: string;
  _count: {
    currentPlayers: number;
  };
  currentPlayers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
    positions: string[];
  }>;
}

export default function ClubsByLeague() {
  const [league, setLeague] = useState('');
  const [canton, setCanton] = useState('');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!league.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const params = new URLSearchParams();
      params.append('league', league);
      if (canton) params.append('canton', canton);

      const response = await axios.get(`/api/clubs/by-league?${params.toString()}`);
      setClubs(response.data.clubs);
    } catch (err) {
      console.error('Error searching clubs:', err);
      setClubs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-red-600" />
          Verein Nach Liga Sueche
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Liga/Division *
            </label>
            <input
              type="text"
              value={league}
              onChange={(e) => setLeague(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
              placeholder="z.B. NLA, 1. Liga, U19 Elite..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kanton (Optional)
            </label>
            <select
              value={canton}
              onChange={(e) => setCanton(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
            >
              <option value="">Alli Kantön</option>
              <option value="ZH">Zürich</option>
              <option value="BE">Bern</option>
              <option value="LU">Luzern</option>
              <option value="AG">Aargau</option>
              <option value="SG">St. Gallen</option>
              <option value="VD">Vaud</option>
              <option value="GE">Genève</option>
              <option value="TI">Ticino</option>
              <option value="VS">Valais</option>
              <option value="FR">Fribourg</option>
              <option value="SO">Solothurn</option>
              <option value="BS">Basel-Stadt</option>
              <option value="BL">Basel-Landschaft</option>
              <option value="GR">Graubünden</option>
              <option value="TG">Thurgau</option>
              <option value="ZG">Zug</option>
              <option value="NE">Neuchâtel</option>
              <option value="SH">Schaffhausen</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !league.trim()}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sueche...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Verein Sueche
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-red-600" />
        </div>
      ) : searched && clubs.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Kei Verein Gfunde Für Liga "{league}"
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
            Probier En Anderi Liga Oder Vergrössere Din Suchberiich
          </p>
        </div>
      ) : clubs.length > 0 ? (
        <>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-blue-800 dark:text-blue-200">
              <strong>{clubs.length}</strong> Verein Gfunde I Dä Liga "{league}"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club) => (
              <Link
                key={club.id}
                href={`/clubs/${club.id}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition overflow-hidden border border-gray-200 dark:border-gray-700 group"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    {club.logo ? (
                      <img
                        src={club.logo}
                        alt={club.name}
                        className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200 dark:border-gray-600"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <span className="text-2xl">🏐</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition truncate">
                        {club.name}
                      </h3>
                      {club.shortName && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {club.shortName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Trophy className="w-4 h-4 text-red-600" />
                      <span className="font-semibold">{club.league}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 text-red-600" />
                      <span>{club.town}, {club.canton}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4 text-red-600" />
                      <span>{club._count.currentPlayers} Aktivi Spieler</span>
                    </div>
                  </div>

                  {club.currentPlayers.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        Einigi Spieler:
                      </p>
                      <div className="flex -space-x-2">
                        {club.currentPlayers.slice(0, 5).map((player) => (
                          <div
                            key={player.id}
                            className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden bg-gray-200 dark:bg-gray-700"
                            title={`${player.firstName} ${player.lastName}`}
                          >
                            {player.profileImage ? (
                              <img
                                src={player.profileImage}
                                alt={player.firstName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300">
                                {player.firstName[0]}{player.lastName[0]}
                              </div>
                            )}
                          </div>
                        ))}
                        {club._count.currentPlayers > 5 && (
                          <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                              +{club._count.currentPlayers - 5}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
