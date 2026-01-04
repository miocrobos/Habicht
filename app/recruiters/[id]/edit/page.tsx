'use client';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { ArrowLeft, Save, Loader2, User, MapPin, Briefcase, Trophy, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Canton } from '@prisma/client';
import ImageUpload from '@/components/shared/ImageUpload';
import CountrySelect from '@/components/shared/CountrySelect';
import MultiLeagueSelector from '@/components/shared/MultiLeagueSelector';

const cantons = [
  { code: 'ZH' as Canton, name: 'Züri' },
  { code: 'BE' as Canton, name: 'Bärn' },
  { code: 'LU' as Canton, name: 'Luzern' },
  { code: 'UR' as Canton, name: 'Uri' },
  { code: 'SZ' as Canton, name: 'Schwyz' },
  { code: 'OW' as Canton, name: 'Obwaldä' },
  { code: 'NW' as Canton, name: 'Nidwaldä' },
  { code: 'GL' as Canton, name: 'Glarus' },
  { code: 'ZG' as Canton, name: 'Zug' },
  { code: 'FR' as Canton, name: 'Fribourg' },
  { code: 'SO' as Canton, name: 'Solothurn' },
  { code: 'BS' as Canton, name: 'Basel-Stadt' },
  { code: 'BL' as Canton, name: 'Basel-Land' },
  { code: 'SH' as Canton, name: 'Schaffhuusä' },
  { code: 'AR' as Canton, name: 'Appezöll Usserhodä' },
  { code: 'AI' as Canton, name: 'Appezöll Innärhodä' },
  { code: 'SG' as Canton, name: 'St. Gallä' },
  { code: 'GR' as Canton, name: 'Graubündä' },
  { code: 'AG' as Canton, name: 'Aargau' },
  { code: 'TG' as Canton, name: 'Thurgau' },
  { code: 'TI' as Canton, name: 'Tessin' },
  { code: 'VD' as Canton, name: 'Waadt' },
  { code: 'VS' as Canton, name: 'Wallis' },
  { code: 'NE' as Canton, name: 'Neuäburg' },
  { code: 'GE' as Canton, name: 'Gänf' },
  { code: 'JU' as Canton, name: 'Jura' },
];

const positions = [
  { value: 'SETTER', label: 'Zuspieleri/in' },
  { value: 'OUTSIDE_HITTER', label: 'Usseagrifferi/in' },
  { value: 'OPPOSITE', label: 'Diagonal' },
  { value: 'MIDDLE_BLOCKER', label: 'Mittäblockeri/in' },
  { value: 'LIBERO', label: 'Libero' },
  { value: 'UNIVERSAL', label: 'Universal' },
];

export default function RecruiterEditPage({ params }: { params: { id: string } }) {
  const { t } = useLanguage();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nationality: 'Swiss',
    age: '',
    organization: '',
    coachRole: '',
    coachingLicense: '',
    preferredLanguage: '',
    bio: '',
    canton: '',
    province: '',
    phone: '',
    instagram: '',
    tiktok: '',
    youtube: '',
    facebook: '',
    profileImage: '',
    genderCoached: [] as string[],
    positionsLookingFor: [] as string[],
    lookingForMembers: false,
  });

  const [clubHistory, setClubHistory] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<{ id: string; text: string }[]>([]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/login');
      return;
    }

    loadRecruiterData();
  }, [session, status]);

  const loadRecruiterData = async () => {
    try {
      const response = await axios.get(`/api/recruiters/${params.id}`);
      const recruiter = response.data.recruiter;

      if (recruiter.user?.role) {
        setUserRole(recruiter.user.role);
      }
      if (recruiter.user?.id) {
        setUserId(recruiter.user.id);
      }

      setFormData({
        firstName: recruiter.firstName || '',
        lastName: recruiter.lastName || '',
        nationality: recruiter.nationality || 'Swiss',
        age: recruiter.age?.toString() || '',
        organization: recruiter.organization || '',
        coachRole: recruiter.coachRole || '',
        coachingLicense: recruiter.coachingLicense || '',
        preferredLanguage: recruiter.preferredLanguage || '',
        bio: recruiter.bio || '',
        canton: recruiter.canton || '',
        province: recruiter.province || '',
        phone: recruiter.phone || '',
        instagram: recruiter.instagram || '',
        tiktok: recruiter.tiktok || '',
        youtube: recruiter.youtube || '',
        facebook: recruiter.facebook || '',
        profileImage: recruiter.profileImage || '',
        genderCoached: recruiter.genderCoached || [],
        positionsLookingFor: recruiter.positionsLookingFor || [],
        lookingForMembers: recruiter.lookingForMembers || false,
      });

      if (recruiter.clubHistory && Array.isArray(recruiter.clubHistory)) {
        const formattedHistory = recruiter.clubHistory.map((club: any) => ({
          id: club.id,
          clubName: club.clubName || club.club?.name || '',
          logo: club.club?.logo || '',
          country: club.country || 'Switzerland',
          clubWebsiteUrl: club.clubWebsiteUrl || '',
          leagues: club.leagues || (club.league ? [club.league] : []),
          yearFrom: club.startDate ? new Date(club.startDate).getFullYear().toString() : '',
          yearTo: club.endDate ? new Date(club.endDate).getFullYear().toString() : '',
          currentClub: club.currentClub || false,
        }));
        setClubHistory(formattedHistory);
      }

      if (recruiter.achievements && Array.isArray(recruiter.achievements)) {
        setAchievements(recruiter.achievements.map((ach: any, idx: number) => ({
          id: ach.id || `ach-${idx}`,
          text: typeof ach === 'string' ? ach : ach.text || '',
        })));
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading recruiter data:', err);
      setError('Fehler bim Lade vo de Date');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const payload = {
        ...formData,
        clubHistory: clubHistory.map(club => ({
          ...club,
          startDate: club.yearFrom ? new Date(`${club.yearFrom}-01-01`) : null,
          endDate: club.currentClub ? null : (club.yearTo ? new Date(`${club.yearTo}-12-31`) : null),
        })),
        achievements: achievements.map(a => a.text).filter(t => t.trim() !== ''),
      };

      await axios.put(`/api/recruiters/${params.id}`, payload);
      setSuccess(true);
      
      setTimeout(() => {
        if (userRole === 'HYBRID' && userId) {
          router.push(`/hybrids/${userId}`);
        } else {
          router.push(`/recruiters/${params.id}`);
        }
      }, 1000);
    } catch (err: any) {
      console.error('Error saving recruiter data:', err);
      setError(err.response?.data?.error || 'Fehler bim Speichere');
    } finally {
      setSaving(false);
    }
  };

  const handleAddClub = () => {
    setClubHistory([
      ...clubHistory,
      {
        id: `new-${Date.now()}`,
        clubName: '',
        logo: '',
        country: 'Switzerland',
        clubWebsiteUrl: '',
        leagues: [],
        yearFrom: '',
        yearTo: '',
        currentClub: false,
      },
    ]);
  };

  const handleAddAchievement = () => {
    setAchievements([
      ...achievements,
      { id: `new-${Date.now()}`, text: '' },
    ]);
  };

  const toggleGender = (gender: string) => {
    if (formData.genderCoached.includes(gender)) {
      setFormData({
        ...formData,
        genderCoached: formData.genderCoached.filter(g => g !== gender),
      });
    } else {
      setFormData({
        ...formData,
        genderCoached: [...formData.genderCoached, gender],
      });
    }
  };

  const togglePosition = (position: string) => {
    if (formData.positionsLookingFor.includes(position)) {
      setFormData({
        ...formData,
        positionsLookingFor: formData.positionsLookingFor.filter(p => p !== position),
      });
    } else {
      setFormData({
        ...formData,
        positionsLookingFor: [...formData.positionsLookingFor, position],
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-habicht-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <Link
              href={userRole === 'HYBRID' && userId ? `/hybrids/${userId}` : `/recruiters/${params.id}`}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              Zurück Zum Profil
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-habicht-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-habicht-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  Speichere...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                  Änderige Speichere
                </>
              )}
            </button>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Recruiter Profil Bearbeite
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
            Aktualisier Dini Informatione
          </p>

          {error && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
              <p className="text-red-800 dark:text-red-200 text-sm sm:text-base">{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 sm:p-4">
              <p className="text-green-800 dark:text-green-200 text-sm sm:text-base">
                ✓ Erfolgriich Gespeichert! Wiiterläitig...
              </p>
            </div>
          )}
        </div>

        {/* Profile Photo */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="w-6 h-6 text-habicht-600" />
            Profilbild
          </h2>
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
              {formData.profileImage ? (
                <img
                  src={formData.profileImage}
                  alt="Profilbild"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <User className="w-16 h-16" />
                </div>
              )}
            </div>
            <ImageUpload
              label="Neus Profilbild Ufelad"
              value={formData.profileImage}
              onChange={(v: string) => setFormData({ ...formData, profileImage: v })}
              aspectRatio="square"
            />
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="w-6 h-6 text-habicht-600" />
            Persönlichi Informatione
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vorname *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nachname *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nationalität
              </label>
              <CountrySelect
                value={formData.nationality}
                onChange={(v) => setFormData({ ...formData, nationality: v })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Alter
              </label>
              <input
                type="number"
                min="18"
                max="100"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="z.B. 35"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Organisation / Club
              </label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="z.B. Volley Amriswil"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rolle
              </label>
              <input
                type="text"
                value={formData.coachRole}
                onChange={(e) => setFormData({ ...formData, coachRole: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="z.B. Headcoach, Scout"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bevorzugti Sprach
              </label>
              <select
                value={formData.preferredLanguage}
                onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Wähl üs</option>
                <option value="gsw">Schwiizerdütsch</option>
                <option value="de">Hochdütsch</option>
                <option value="fr">Französisch</option>
                <option value="it">Italienisch</option>
                <option value="en">Englisch</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Coaching-Lizänz
              </label>
              <ImageUpload
                label=""
                value={formData.coachingLicense}
                onChange={(base64) => setFormData({ ...formData, coachingLicense: base64 })}
                allowPdf={true}
                helpText="Upload deiner Coaching-Lizänz (Bild oder PDF)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Telefon
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kanton
              </label>
              <select
                value={formData.canton}
                onChange={(e) => setFormData({ ...formData, canton: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Wähl üs</option>
                {cantons.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Schriib öppis über di..."
            />
          </div>
        </div>

        {/* Looking For */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-habicht-600" />
            Suechinstellige
          </h2>

          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.lookingForMembers}
                onChange={(e) => setFormData({ ...formData, lookingForMembers: e.target.checked })}
                className="rounded text-habicht-600 focus:ring-habicht-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Aktiv uf de Suechi nach Spieler
              </span>
            </label>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Geschlecht gsuecht
            </label>
            <div className="flex gap-4">
              {['MALE', 'FEMALE'].map((gender) => (
                <label key={gender} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.genderCoached.includes(gender)}
                    onChange={() => toggleGender(gender)}
                    className="rounded text-habicht-600 focus:ring-habicht-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {gender === 'MALE' ? 'Männlich' : 'Wiiblich'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Positione gsuecht
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {positions.map((pos) => (
                <label key={pos.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.positionsLookingFor.includes(pos.value)}
                    onChange={() => togglePosition(pos.value)}
                    className="rounded text-habicht-600 focus:ring-habicht-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{pos.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-habicht-600" />
            Erfolg & Zertifikat
          </h2>

          {achievements.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 italic mb-4">Kei Erfolg hinzugefügt</p>
          ) : (
            <div className="space-y-3 mb-4">
              {achievements.map((ach, index) => (
                <div key={ach.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={ach.text}
                    onChange={(e) => {
                      const updated = achievements.map((a, i) =>
                        i === index ? { ...a, text: e.target.value } : a
                      );
                      setAchievements(updated);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="z.B. J+S Leiter, 10 Jahre Trainer-Erfahrig"
                  />
                  <button
                    onClick={() => setAchievements(achievements.filter((_, i) => i !== index))}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleAddAchievement}
            className="flex items-center gap-2 text-habicht-600 hover:text-habicht-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            Erfolg Hinzuefüge
          </button>
        </div>

        {/* Club History */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-habicht-600" />
            Club-Gschicht
          </h2>

          {clubHistory.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 italic mb-4">Kei Club-Gschicht hinzugefügt</p>
          ) : (
            <div className="space-y-4 mb-4">
              {clubHistory.map((club, index) => (
                <div key={club.id} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Club {index + 1}</h3>
                    <button
                      onClick={() => setClubHistory(clubHistory.filter((_, i) => i !== index))}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Club Name *
                      </label>
                      <input
                        type="text"
                        value={club.clubName}
                        onChange={(e) => {
                          const updated = clubHistory.map((c, i) =>
                            i === index ? { ...c, clubName: e.target.value } : c
                          );
                          setClubHistory(updated);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="z.B. Volley Amriswil"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Land
                      </label>
                      <CountrySelect
                        value={club.country || ''}
                        onChange={(v) => {
                          const updated = clubHistory.map((c, i) =>
                            i === index ? { ...c, country: v } : c
                          );
                          setClubHistory(updated);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Ligen (Mehrfachauswahl)
                      </label>
                      <MultiLeagueSelector
                        selectedLeagues={club.leagues || []}
                        onChange={(leagues) => {
                          const updated = clubHistory.map((c, i) =>
                            i === index ? { ...c, leagues } : c
                          );
                          setClubHistory(updated);
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Von Jahr
                      </label>
                      <input
                        type="text"
                        value={club.yearFrom}
                        onChange={(e) => {
                          const updated = clubHistory.map((c, i) =>
                            i === index ? { ...c, yearFrom: e.target.value } : c
                          );
                          setClubHistory(updated);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="z.B. 2020"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Bis Jahr
                      </label>
                      {club.currentClub ? (
                        <div className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                          <span className="text-green-600 dark:text-green-400 font-semibold">✓ Aktuell</span>
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={club.yearTo}
                          onChange={(e) => {
                            const updated = clubHistory.map((c, i) =>
                              i === index ? { ...c, yearTo: e.target.value } : c
                            );
                            setClubHistory(updated);
                          }}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="z.B. 2023"
                        />
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border-2 transition bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                      <input
                        type="checkbox"
                        checked={!!club.currentClub}
                        onChange={(e) => {
                          setClubHistory(prev => prev.map((c, i) =>
                            i === index
                              ? { ...c, currentClub: e.target.checked, yearTo: e.target.checked ? '' : c.yearTo }
                              : { ...c, currentClub: false }
                          ));
                        }}
                        className="rounded text-habicht-600 focus:ring-habicht-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Aktuellä Club
                      </span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleAddClub}
            className="flex items-center gap-2 text-habicht-600 hover:text-habicht-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            Club Hinzuefüge
          </button>
        </div>

        {/* Social Media */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Social Media
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Instagram Handle
              </label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="@username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                TikTok Handle
              </label>
              <input
                type="text"
                value={formData.tiktok}
                onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="@username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                YouTube Channel
              </label>
              <input
                type="text"
                value={formData.youtube}
                onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://youtube.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Facebook
              </label>
              <input
                type="text"
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://facebook.com/..."
              />
            </div>
          </div>
        </div>

        {/* Save Button at Bottom */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-habicht-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-habicht-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>
    </div>
  );
}
