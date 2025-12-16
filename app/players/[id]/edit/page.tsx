'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { ArrowLeft, Save, Loader2, User, MapPin, Briefcase, GraduationCap, Trophy, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Canton } from '@prisma/client';
import { getAllSchools } from '@/lib/schoolData';

export default function EditPlayerProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState<any>(null);
  const [clubHistory, setClubHistory] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      loadPlayerData();
    }
  }, [status, params.id]);

  const loadPlayerData = async () => {
    try {
      const response = await axios.get(`/api/players/${params.id}`);
      const player = response.data.player;
      
      setFormData({
        firstName: player.firstName || '',
        lastName: player.lastName || '',
        email: player.user.email || '',
        dateOfBirth: player.dateOfBirth ? new Date(player.dateOfBirth).toISOString().split('T')[0] : '',
        gender: player.gender || '',
        nationality: player.nationality || '',
        canton: player.canton || '',
        employmentStatus: player.employmentStatus || '',
        occupation: player.occupation || '',
        schoolName: player.schoolName || '',
        positions: player.positions || [],
        height: player.height || '',
        weight: player.weight || '',
        spikeHeight: player.spikeHeight || '',
        blockHeight: player.blockHeight || '',
        phone: player.phone || '',
        profileImage: player.profileImage || '',
        instagram: player.instagram || '',
        tiktok: player.tiktok || '',
        youtube: player.youtube || '',
        highlightVideo: player.highlightVideo || '',
        swissVolleyLicense: player.swissVolleyLicense || '',
        skillReceiving: player.skillReceiving || 0,
        skillServing: player.skillServing || 0,
        skillAttacking: player.skillAttacking || 0,
        skillBlocking: player.skillBlocking || 0,
        skillDefense: player.skillDefense || 0,
        bio: player.bio || '',
        lookingForClub: player.lookingForClub || false,
      });

      setClubHistory(player.clubHistory.map((club: any) => ({
        id: club.id,
        clubName: club.clubName || '',
        logo: club.clubLogo || '',
        country: club.clubCountry || 'Switzerland',
        clubWebsiteUrl: club.clubWebsiteUrl || '',
        league: club.league || '',
        yearFrom: club.startDate ? new Date(club.startDate).getFullYear().toString() : '',
        yearTo: club.endDate ? new Date(club.endDate).getFullYear().toString() : '',
        currentClub: club.currentClub || false,
      })));

      setAchievements(player.achievements.map((text: string, index: number) => ({
        id: `achievement-${index}`,
        text,
      })));

      setLoading(false);
    } catch (err) {
      console.error('Error loading player:', err);
      setError('Fehler Bim Lade Vo Spieler-Date');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      await axios.put(`/api/players/${params.id}`, {
        playerData: formData,
        clubHistory,
        achievements: achievements.map(a => a.text).filter(text => text.trim() !== ''),
      });

      setSuccess(true);
      setTimeout(() => {
        router.push(`/players/${params.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Fehler Bim Speichere');
    } finally {
      setSaving(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Lade Profil...</p>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-lg">Spieler Nid Gfunde</p>
          <Link href="/" className="text-red-600 hover:text-red-700 mt-4 inline-block">
            Zurück Zur Startsiite
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              href={`/players/${params.id}`}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Zurück Zum Profil
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Speichere...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Änderige Speichere
                </>
              )}
            </button>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Profil Bearbeite
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Aktualisier Dini Informatione
          </p>

          {error && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-green-800 dark:text-green-200">
                ✓ Erfolgriich Gespeichert! Wiiterläitig...
              </p>
            </div>
          )}
        </div>

        {/* Note: The full form implementation would go here, similar to registration form */}
        {/* This is a placeholder - I'll create the full implementation in a complete file */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <p className="text-gray-600 dark:text-gray-400">
            Edit form components loading... (Full implementation in progress)
          </p>
        </div>
      </div>
    </div>
  );
}
