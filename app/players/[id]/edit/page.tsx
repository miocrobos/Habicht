'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { ArrowLeft, Save, Loader2, User, MapPin, Briefcase, GraduationCap, Trophy, Plus, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { Canton } from '@prisma/client';
import { getAllSchools } from '@/lib/schoolData';
import ImageUpload from '@/components/shared/ImageUpload';
import { useLanguage } from '@/contexts/LanguageContext';

const cantons = [
  { code: 'ZH' as Canton, name: 'Züri' },
  { code: 'BE' as Canton, name: 'Bärn' },
  { code: 'LU' as Canton, name: 'Luzern' },
  { code: 'UR' as Canton, name: 'Uri' },
  { code: 'SZ' as Canton, name: 'Schwyz' },
  { code: 'OW' as Canton, name: 'Obwalde' },
  { code: 'NW' as Canton, name: 'Nidwalde' },
  { code: 'GL' as Canton, name: 'Glarus' },
  { code: 'ZG' as Canton, name: 'Zug' },
  { code: 'FR' as Canton, name: 'Friburg' },
  { code: 'SO' as Canton, name: 'Solothurn' },
  { code: 'BS' as Canton, name: 'Basel-Stadt' },
  { code: 'BL' as Canton, name: 'Basel-Land' },
  { code: 'SH' as Canton, name: 'Schaffhuse' },
  { code: 'AR' as Canton, name: 'Appenzell Usserrhode' },
  { code: 'AI' as Canton, name: 'Appenzell Innerrhode' },
  { code: 'SG' as Canton, name: 'St. Galle' },
  { code: 'GR' as Canton, name: 'Graubünde' },
  { code: 'AG' as Canton, name: 'Aargau' },
  { code: 'TG' as Canton, name: 'Thurgau' },
  { code: 'TI' as Canton, name: 'Tessin' },
  { code: 'VD' as Canton, name: 'Waadt' },
  { code: 'VS' as Canton, name: 'Wallis' },
  { code: 'NE' as Canton, name: 'Neueburg' },
  { code: 'GE' as Canton, name: 'Genf' },
  { code: 'JU' as Canton, name: 'Jura' },
];

export default function EditPlayerProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Define translated options using t() function
  const employmentStatusOptions = [
    { value: 'STUDENT_FULL_TIME', label: t('register.studentFullTime') },
    { value: 'STUDENT_PART_TIME', label: t('register.studentPartTime') },
    { value: 'WORKING_FULL_TIME', label: t('register.workingFullTime') },
    { value: 'WORKING_PART_TIME', label: t('register.workingPartTime') },
  ];

  const positions = [
    { value: 'SETTER', label: t('register.setter') },
    { value: 'OUTSIDE_HITTER', label: t('register.outsideHitter') },
    { value: 'MIDDLE_BLOCKER', label: t('register.middleBlocker') },
    { value: 'OPPOSITE', label: t('register.opposite') },
    { value: 'LIBERO', label: t('register.libero') },
    { value: 'UNIVERSAL', label: t('register.universal') },
  ];

  const dominantHandOptions = [
    { value: 'RIGHT', label: t('register.rightHanded') },
    { value: 'LEFT', label: t('register.leftHanded') },
    { value: 'AMBIDEXTROUS', label: t('register.ambidextrous') },
  ];
  
  const [formData, setFormData] = useState<any>(null);
  const [clubHistory, setClubHistory] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [allClubs, setAllClubs] = useState<any[]>([]);
  const [clubSuggestions, setClubSuggestions] = useState<Record<string, any[]>>({});

  const schools = getAllSchools();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      loadPlayerData();
      loadClubs();
    }
  }, [status, params.id]);

  const loadClubs = async () => {
    try {
      const response = await axios.get('/api/clubs?all=true');
      setAllClubs(response.data.clubs || []);
    } catch (err) {
      console.error('Error loading clubs:', err);
    }
  };

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
        city: player.city || '',
        municipality: player.municipality || '',
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
        ausweiss: player.ausweiss || '',
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
      setError(t('playerProfile.errorLoadingPlayerData'));
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);

    // Validate club history: check if any club has a name but neither currentClub nor yearTo
    const invalidClubs = clubHistory.filter(club => {
      const hasClubName = club.clubName && club.clubName.trim() !== '';
      const hasYearTo = club.yearTo && club.yearTo.trim() !== '';
      const isCurrentClub = club.currentClub === true;
      // Invalid if: has name BUT neither is current NOR has end year
      return hasClubName && !isCurrentClub && !hasYearTo;
    });

    if (invalidClubs.length > 0) {
      setError(t('playerProfile.pleaseSelectUntilYear'));
      setSaving(false);
      // Scroll to error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Filter club history: only include clubs that have a name
    // AND either currentClub is checked OR yearTo is filled
    const validClubHistory = clubHistory.filter(club => {
      const hasClubName = club.clubName && club.clubName.trim() !== '';
      const hasYearTo = club.yearTo && club.yearTo.trim() !== '';
      const isCurrentClub = club.currentClub === true;
      // Include club if: has name AND (is current OR has end year)
      return hasClubName && (isCurrentClub || hasYearTo);
    }).map(club => ({
      ...club,
      // Clean up empty strings to null/undefined for proper database handling
      league: club.league && club.league.trim() !== '' ? club.league : '',
      yearFrom: club.yearFrom && club.yearFrom.trim() !== '' ? club.yearFrom : '',
      yearTo: club.currentClub ? '' : (club.yearTo && club.yearTo.trim() !== '' ? club.yearTo : ''),
    }));

    try {
      const saveData = {
        playerData: formData,
        clubHistory: validClubHistory,
        achievements: achievements.map(a => a.text).filter((text: string) => text.trim() !== ''),
      };
      
      const response = await axios.put(`/api/players/${params.id}`, saveData);

      setSuccess(true);
      setTimeout(() => {
        router.push(`/players/${params.id}`);
      }, 1500);
    } catch (err: any) {
      console.error('Save error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.error || t('playerProfile.errorSavingPlayerData'));
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
        league: '',
        yearFrom: '',
        yearTo: '',
        currentClub: false,
      },
    ]);
  };

  const handleRemoveClub = (id: string) => {
    setClubHistory(clubHistory.filter(club => club.id !== id));
  };

  const handleAddAchievement = () => {
    setAchievements([
      ...achievements,
      { id: `new-${Date.now()}`, text: '' },
    ]);
  };

  const handleRemoveAchievement = (id: string) => {
    setAchievements(achievements.filter(ach => ach.id !== id));
  };

  const isStudent = formData?.employmentStatus?.includes('STUDENT');
  const isWorking = formData?.employmentStatus?.includes('WORKING');

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-habicht-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{t('playerProfile.loadingProfile')}</p>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-habicht-600 dark:text-habicht-400 text-lg">{t('playerProfile.playerNotFound')}</p>
          <Link href="/" className="text-habicht-600 hover:text-habicht-700 mt-4 inline-block">
            {t('playerProfile.backToHome')}
          </Link>
        </div>
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
              href={`/players/${params.id}`}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              {t('playerProfile.backToProfile')}
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-habicht-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-habicht-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  {t('playerProfile.saving')}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                  {t('playerProfile.saveChanges')}
                </>
              )}
            </button>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {t('playerProfile.editProfile')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
            {t('editProfile.updateInfo')}
          </p>

          {error && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
              <p className="text-red-800 dark:text-red-200 text-sm sm:text-base">{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 sm:p-4">
              <p className="text-green-800 dark:text-green-200 text-sm sm:text-base">
                ✓ {t('editProfile.savedSuccess')}
              </p>
            </div>
          )}
        </div>

        {/* Personal Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="w-6 h-6 text-habicht-600" />
            {t('editProfile.personalInfo')}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('editProfile.firstName')} *
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
                {t('editProfile.lastName')} *
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
                {t('editProfile.dateOfBirth')} *
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('editProfile.gender')} *
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">{t('playerProfile.select')}</option>
                <option value="MALE">{t('editProfile.male')}</option>
                <option value="FEMALE">{t('editProfile.female')}</option>
                <option value="OTHER">{t('editProfile.other')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('editProfile.nationality')} *
              </label>
              <input
                type="text"
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('editProfile.phone')}
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Location & Employment */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-habicht-600" />
            {t('editProfile.locationEmployment')}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('editProfile.canton')} *
              </label>
              <select
                value={formData.canton}
                onChange={(e) => setFormData({ ...formData, canton: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">{t('register.selectCanton')}</option>
                {cantons.map((canton) => (
                  <option key={canton.code} value={canton.code}>
                    {canton.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('editProfile.municipality')}
              </label>
              <input
                type="text"
                value={formData.municipality || ''}
                onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                placeholder={t('placeholders.exampleCities')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('labels.employmentStatus')}
              </label>
              <select
                value={formData.employmentStatus}
                onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">{t('playerProfile.selectStatus')}</option>
                {employmentStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {isStudent && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('labels.schoolUniversity')}
                </label>
                <select
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">{t('register.selectSchool')}</option>
                  {schools.map((school) => (
                    <option key={school.value} value={school.value}>
                      {school.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {isWorking && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('labels.occupation')}
                </label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  placeholder={t('placeholders.exampleJob')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}
          </div>
        </div>

        {/* Volleyball Skills */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-habicht-600" />
            {t('labels.volleyballInfo')}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('editProfile.positions')}
              </label>
              <div className="space-y-2">
                {positions.map((pos) => (
                  <label key={pos.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.positions.includes(pos.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            positions: [...formData.positions, pos.value],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            positions: formData.positions.filter((p: string) => p !== pos.value),
                          });
                        }
                      }}
                      className="rounded text-habicht-600 focus:ring-habicht-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{pos.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('register.dominantHand')}
              </label>
              <select
                value={formData.dominantHand || ''}
                onChange={(e) => setFormData({ ...formData, dominantHand: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">{t('register.selectDominantHand')}</option>
                {dominantHandOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('editProfile.height')}
                </label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('editProfile.weight')}
                </label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('editProfile.spikeHeight')}
                </label>
                <input
                  type="number"
                  value={formData.spikeHeight}
                  onChange={(e) => setFormData({ ...formData, spikeHeight: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('editProfile.blockHeight')}
                </label>
                <input
                  type="number"
                  value={formData.blockHeight}
                  onChange={(e) => setFormData({ ...formData, blockHeight: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('editProfile.swissVolleyLicense')}
            </label>
            <ImageUpload 
              label={t('playerProfile.uploadLicense')}
              value={formData.swissVolleyLicense}
              onChange={(v) => setFormData({ ...formData, swissVolleyLicense: v })} 
              aspectRatio="banner" 
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('editProfile.bio')}
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Club History */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-habicht-600" />
              {t('editProfile.clubHistory')}
            </h2>
            <button
              onClick={handleAddClub}
              className="flex items-center gap-2 bg-habicht-600 text-white px-4 py-2 rounded-lg hover:bg-habicht-700 transition"
            >
              <Plus className="w-4 h-4" />
              {t('editProfile.addClub')}
            </button>
          </div>

          {clubHistory.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 italic">{t('editProfile.noClubHistory')}</p>
          ) : (
            <div className="space-y-4">
              {clubHistory.map((club, index) => {
                // Check if this club is invalid (has name but no yearTo and not current)
                const isInvalid = club.clubName && club.clubName.trim() !== '' && !club.currentClub && (!club.yearTo || club.yearTo.trim() === '');
                
                return (
                <div key={club.id} className={`border rounded-lg p-4 ${isInvalid ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 dark:border-gray-600'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Club {index + 1}</h3>
                    <button
                      onClick={() => handleRemoveClub(club.id)}
                      className="text-red-600 hover:text-red-700 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('editProfile.clubName')}
                      </label>
                      <input
                        type="text"
                        value={club.clubName}
                        onChange={(e) => {
                          const value = e.target.value;
                          const updated = clubHistory.map((c) =>
                            c.id === club.id ? { ...c, clubName: value } : c
                          );
                          setClubHistory(updated);
                          
                          // Show suggestions if typing
                          if (value.length >= 2) {
                            const suggestions = allClubs.filter(c => 
                              c.name.toLowerCase().includes(value.toLowerCase()) ||
                              (c.shortName && c.shortName.toLowerCase().includes(value.toLowerCase()))
                            ).slice(0, 5);
                            setClubSuggestions({ ...clubSuggestions, [club.id]: suggestions });
                          } else {
                            setClubSuggestions({ ...clubSuggestions, [club.id]: [] });
                          }
                        }}
                        onBlur={() => {
                          // Delay to allow click on suggestion
                          setTimeout(() => {
                            setClubSuggestions({ ...clubSuggestions, [club.id]: [] });
                          }, 200);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder={t('placeholders.exampleClub')}
                      />
                      {clubSuggestions[club.id]?.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {clubSuggestions[club.id].map((suggestion) => (
                            <button
                              key={suggestion.id}
                              type="button"
                              onClick={() => {
                                const updated = clubHistory.map((c) =>
                                  c.id === club.id ? { 
                                    ...c, 
                                    clubName: suggestion.name,
                                    logo: suggestion.logo || c.logo
                                  } : c
                                );
                                setClubHistory(updated);
                                setClubSuggestions({ ...clubSuggestions, [club.id]: [] });
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition flex items-center gap-2"
                            >
                              {suggestion.logo && <span className="text-lg">{suggestion.logo}</span>}
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">{suggestion.name}</div>
                                {suggestion.shortName && (
                                  <div className="text-sm text-gray-600 dark:text-gray-400">{suggestion.shortName}</div>
                                )}
                                <div className="text-xs text-gray-500 dark:text-gray-500">{suggestion.town}, {suggestion.canton}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('editProfile.league')}
                      </label>
                      <select
                        value={club.league}
                        onChange={(e) => {
                          const updated = clubHistory.map((c) =>
                            c.id === club.id ? { ...c, league: e.target.value } : c
                          );
                          setClubHistory(updated);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">{t('clubProfile.selectLeague')}</option>
                        <option value="NLA">NLA</option>
                        <option value="NLB">NLB</option>
                        <option value="1. Liga">1. Liga</option>
                        <option value="2. Liga">2. Liga</option>
                        <option value="3. Liga">3. Liga</option>
                        <option value="4. Liga">4. Liga</option>
                        <option value="5. Liga">5. Liga</option>
                        <option value="U19 Elite">U19 Elite</option>
                        <option value="U17 Elite">U17 Elite</option>
                        <option value="U15 Elite">U15 Elite</option>
                        <option value="U19">U19</option>
                        <option value="U17">U17</option>
                        <option value="U15">U15</option>
                        <option value="U13">U13</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('editProfile.fromYear')}
                      </label>
                      <input
                        type="text"
                        value={club.yearFrom}
                        onChange={(e) => {
                          const updated = clubHistory.map((c) =>
                            c.id === club.id ? { ...c, yearFrom: e.target.value } : c
                          );
                          setClubHistory(updated);
                        }}
                        placeholder={t('placeholders.exampleYear')}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('editProfile.toYear')} {!club.currentClub && <span className="text-red-600">*</span>}
                      </label>
                      {club.currentClub ? (
                        <div className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                          <span className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                            {t('register.current')}
                          </span>
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={club.yearTo}
                          onChange={(e) => {
                            const updated = clubHistory.map((c) =>
                              c.id === club.id ? { ...c, yearTo: e.target.value } : c
                            );
                            setClubHistory(updated);
                          }}
                          placeholder={t('placeholders.exampleYear')}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                            isInvalid ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                          }`}
                        />
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={club.currentClub}
                        onChange={(e) => {
                          const updated = clubHistory.map((c) =>
                            c.id === club.id 
                              ? { ...c, currentClub: e.target.checked, yearTo: e.target.checked ? '' : c.yearTo } 
                              : { ...c, currentClub: false } // Uncheck all other clubs
                          );
                          setClubHistory(updated);
                        }}
                        className="rounded text-habicht-600 focus:ring-habicht-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('editProfile.currentClub')}
                      </span>
                    </label>
                  </div>

                  {isInvalid && (
                    <div className="mt-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-3">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        {t('playerProfile.pleaseSelectUntilYearWarning')}
                      </p>
                    </div>
                  )}
                </div>
              );
              })}
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-habicht-600" />
              {t('playerProfile.achievements')}
            </h2>
            <button
              onClick={handleAddAchievement}
              className="flex items-center gap-2 bg-habicht-600 text-white px-4 py-2 rounded-lg hover:bg-habicht-700 transition"
            >
              <Plus className="w-4 h-4" />
              {t('editProfile.addAchievement')}
            </button>
          </div>

          {achievements.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 italic">{t('editProfile.noAchievements')}</p>
          ) : (
            <div className="space-y-3">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={achievement.text}
                    onChange={(e) => {
                      const updated = achievements.map((a) =>
                        a.id === achievement.id ? { ...a, text: e.target.value } : a
                      );
                      setAchievements(updated);
                    }}
                    placeholder={t('placeholders.exampleAchievement')}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={() => handleRemoveAchievement(achievement.id)}
                    className="text-red-600 hover:text-red-700 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Documents */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {t('editProfile.documents')}
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('editProfile.swissVolleyLicense')}
              </label>
              <ImageUpload
                label={t('playerProfile.uploadLicense')}
                value={formData.swissVolleyLicense}
                onChange={(v: string) => setFormData({ ...formData, swissVolleyLicense: v })}
                aspectRatio="banner"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('editProfile.idDocument')}
              </label>
              <ImageUpload
                label={t('playerProfile.uploadId')}
                value={formData.ausweiss}
                onChange={(v: string) => setFormData({ ...formData, ausweiss: v })}
                aspectRatio="banner"
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {t('editProfile.socialMedia')}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('editProfile.instagramHandle')}
              </label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="@username"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('editProfile.tiktokHandle')}
              </label>
              <input
                type="text"
                value={formData.tiktok}
                onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                placeholder="@username"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('editProfile.youtubeChannel')}
              </label>
              <input
                type="text"
                value={formData.youtube}
                onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                placeholder="@channelname"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('editProfile.highlightVideo')}
              </label>
              <input
                type="url"
                value={formData.highlightVideo}
                onChange={(e) => setFormData({ ...formData, highlightVideo: e.target.value })}
                placeholder="https://youtube.com/..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Looking for Club */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={formData.lookingForClub}
              onChange={(e) => setFormData({ ...formData, lookingForClub: e.target.checked })}
              className="mt-1 rounded text-habicht-600 focus:ring-habicht-500"
            />
            <div>
              <span className="block font-semibold text-gray-900 dark:text-white">
                {t('editProfile.lookingForClub')}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t('playerProfile.openForClubOffers')}
              </span>
            </div>
          </label>
        </div>

        {/* Save Button */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-habicht-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-habicht-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {saving ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                {t('playerProfile.saving')}
              </>
            ) : (
              <>
                <Save className="w-6 h-6" />
                {t('playerProfile.saveChanges')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
