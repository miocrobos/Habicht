'use client';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { ArrowLeft, Save, Loader2, User, MapPin, Briefcase, GraduationCap, Trophy, Plus, Trash2, X, PaintBucket } from 'lucide-react';
import Link from 'next/link';
import { Canton } from '@prisma/client';
import { getAllSchools } from '@/lib/schoolData';
import ImageUpload from '@/components/shared/ImageUpload';
import CountrySelect from '@/components/shared/CountrySelect';
import MultiLeagueSelector from '@/components/shared/MultiLeagueSelector';
import { toast } from 'react-hot-toast';

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

// Employment status and position arrays are now inside the component to support translations

export default function EditPlayerProfilePage({ params }: { params: { id: string } }) {
  const { t } = useLanguage();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState<any>(null);
  const [clubHistory, setClubHistory] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [allClubs, setAllClubs] = useState<any[]>([]);
  const [clubSuggestions, setClubSuggestions] = useState<Record<string, any[]>>({});
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  // Background picker logic removed as per requirements

  const schools = getAllSchools();

  // Translated employment status options
  const employmentStatusOptions = [
    { value: 'STUDENT_FULL_TIME', label: t('playerProfile.edit.studentFullTime') },
    { value: 'STUDENT_PART_TIME', label: t('playerProfile.edit.studentPartTime') },
    { value: 'WORKING_FULL_TIME', label: t('playerProfile.edit.workingFullTime') },
    { value: 'WORKING_PART_TIME', label: t('playerProfile.edit.workingPartTime') },
  ];

  // Translated positions
  const positions = [
    { value: 'SETTER', label: t('positions.setter') },
    { value: 'OUTSIDE_HITTER', label: t('positions.outsideHitter') },
    { value: 'MIDDLE_BLOCKER', label: t('positions.middleBlocker') },
    { value: 'OPPOSITE', label: t('positions.opposite') },
    { value: 'LIBERO', label: t('positions.libero') },
    { value: 'UNIVERSAL', label: t('positions.universal') },
  ];

  // Helper function to get available leagues for a club based on player's gender
  const getAvailableLeagues = (clubEntry: any): { value: string; label: string }[] => {
    const allLeagues = [
      { value: 'NLA', label: 'NLA', menField: 'hasNLAMen', womenField: 'hasNLAWomen' },
      { value: 'NLB', label: 'NLB', menField: 'hasNLBMen', womenField: 'hasNLBWomen' },
      { value: '1. Liga', label: '1. Liga', menField: 'has1LigaMen', womenField: 'has1LigaWomen' },
      { value: '2. Liga', label: '2. Liga', menField: 'has2LigaMen', womenField: 'has2LigaWomen' },
      { value: '3. Liga', label: '3. Liga', menField: 'has3LigaMen', womenField: 'has3LigaWomen' },
      { value: '4. Liga', label: '4. Liga', menField: 'has4LigaMen', womenField: 'has4LigaWomen' },
      { value: '5. Liga', label: '5. Liga', menField: 'has5LigaMen', womenField: 'has5LigaWomen' },
      { value: 'U23', label: 'U23', menField: 'hasU23Men', womenField: 'hasU23Women' },
      { value: 'U20', label: 'U20', menField: 'hasU20Men', womenField: 'hasU20Women' },
      { value: 'U18', label: 'U18', menField: 'hasU18Men', womenField: 'hasU18Women' },
    ];

    // If no club data or club not from database, show all leagues
    const clubData = clubEntry.clubData || allClubs.find(c => c.name === clubEntry.clubName);
    if (!clubData) {
      return allLeagues.map(l => ({ value: l.value, label: l.label }));
    }

    // Filter based on player's gender
    const isMale = formData?.gender === 'MALE';
    const isFemale = formData?.gender === 'FEMALE';

    return allLeagues
      .filter(league => {
        if (isMale) {
          return clubData[league.menField] === true;
        } else if (isFemale) {
          return clubData[league.womenField] === true;
        }
        // If gender not set, show leagues available for either
        return clubData[league.menField] === true || clubData[league.womenField] === true;
      })
      .map(l => ({ value: l.value, label: l.label }));
  };

  // Move handleSave inside the component so it can access state
  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);

    // Validate club history before saving
    const invalidClubs = clubHistory.filter(club => {
      const hasClubName = club.clubName && club.clubName.trim() !== '';
      const hasYearTo = club.yearTo && club.yearTo.trim() !== '';
      const isCurrentClub = club.currentClub === true;
      // Invalid if: has name BUT neither is current NOR has end year
      return hasClubName && !isCurrentClub && !hasYearTo;
    });

    if (invalidClubs.length > 0) {
      setError('Bitte füll "Bis Jahr" für alli Clubs üs, wo nid als "Aktuellä Club" markiert sind.');
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
      leagues: Array.isArray(club.leagues) ? club.leagues : (club.league ? [club.league] : []), // Multi-league support
      yearFrom: club.yearFrom && club.yearFrom.trim() !== '' ? club.yearFrom : '',
      yearTo: club.currentClub ? '' : (club.yearTo && club.yearTo.trim() !== '' ? club.yearTo : ''),
    }));

    try {
      const saveData = {
        playerData: formData,
        clubHistory: validClubHistory,
        achievements: achievements.map(a => a.text).filter((text) => text.trim() !== ''),
      };

      console.log('Saving player data...');
      console.log('Club History being saved:', JSON.stringify(validClubHistory, null, 2));
      console.log('Current clubs:', validClubHistory.filter(c => c.currentClub));

      const response = await axios.put(`/api/players/${params.id}`, saveData);

      console.log('Save response:', response.data);

      setSuccess(true);
      toast.success(t('playerProfile.profileUpdated') || 'Profil aktualisiert!');
      setTimeout(() => {
        // Redirect to hybrid profile if user is HYBRID, otherwise to player profile
        if (userRole === 'HYBRID' && userId) {
          router.push(`/hybrids/${userId}`);
        } else {
          router.push(`/players/${params.id}`);
        }
      }, 1000);
    } catch (err: any) {
      console.error('Save error:', err);
      const apiError = err.response?.data?.error;
      if (apiError && apiError.startsWith('playerProfile.')) {
        setError(t(apiError));
        toast.error(t(apiError));
      } else {
        setError(apiError || 'Fehler Bim Speichere');
        toast.error(apiError || t('playerProfile.updateError') || 'Fehler beim Speichern');
      }
    } finally {
      setSaving(false);
    }
  };

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
        dominantHand: player.dominantHand || '',
        preferredLanguage: player.preferredLanguage || '',
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
        country: club.clubCountry || '',
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

      // Store user role and userId for redirect logic
      if (player.user?.role) {
        setUserRole(player.user.role);
        setUserId(player.user.id);
      }
    } catch (err) {
      console.error('Error loading player data:', err);
      setError('Fehler bim Lade vo Spielerdate.');
    } finally {
      setLoading(false);
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('playerProfile.loadingProfile') || 'Profil wird geladen...'}</p>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-habicht-600 dark:text-habicht-400 text-lg">Spieler Nid Gfunde</p>
          <Link href="/" className="text-habicht-600 hover:text-habicht-700 mt-4 inline-block">
            Zurück Zur Startsii te
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-3 sm:py-6 md:py-12 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Mobile-Optimized Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <Link
            href={userRole === 'HYBRID' && userId ? `/hybrids/${userId}` : `/players/${params.id}`}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.backToProfile') || 'Zurück'}
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 text-sm shadow-md"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('common.saving') || 'Speichere...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {t('common.saveChanges') || 'Speichern'}
              </>
            )}
          </button>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
          {t('playerProfile.editProfile') || 'Profil Bearbeiten'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 text-xs sm:text-sm">
          {t('playerProfile.updateInfo') || 'Aktualisiere deine Informationen'}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-xs sm:text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg text-green-700 dark:text-green-300 text-xs sm:text-sm">
            ✓ {t('playerProfile.profileUpdated') || 'Profil aktualisiert!'}
          </div>
        )}

        {/* All Sections - Single Page Layout */}
        <div className="space-y-6">

        {/* Personal Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              {t('playerProfile.personalInfo') || 'Persönliche Informationen'}
            </h2>

            {/* Profile Image - Mobile Centered */}
            <div className="mb-6">
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 ring-4 ring-gray-100 dark:ring-gray-600">
                  {formData.profileImage ? (
                    <img src={formData.profileImage} alt="Profil" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-red-600 text-white text-2xl sm:text-4xl font-bold">
                      {formData.firstName?.[0]}{formData.lastName?.[0]}
                    </div>
                  )}
                </div>
                <ImageUpload
                  label={t('playerProfile.uploadNewImage') || 'Bild Hochladen'}
                  value={formData.profileImage}
                  onChange={(v: string) => setFormData({ ...formData, profileImage: v })}
                  aspectRatio="square"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('register.firstName') || 'Vorname'} *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('register.lastName') || 'Nachname'} *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('register.dateOfBirth') || 'Geburtsdatum'} *
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('register.gender') || 'Geschlecht'} *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">{t('common.select') || 'Wählen'}</option>
                  <option value="MALE">{t('playerProfile.men') || 'Männlich'}</option>
                  <option value="FEMALE">{t('playerProfile.women') || 'Weiblich'}</option>
                  <option value="OTHER">{t('playerProfile.other') || 'Andere'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('playerProfile.nationality') || 'Nationalität'} *
                </label>
                <input
                    type="text"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('register.phone') || 'Telefon'}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

        {/* Location & Employment */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              {t('playerProfile.locationEmployment') || 'Wohnort & Beschäftigung'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('register.canton') || 'Kanton'} *
                </label>
                <select
                  value={formData.canton}
                  onChange={(e) => setFormData({ ...formData, canton: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">{t('common.select') || 'Wählen'}</option>
                  {cantons.map((canton) => (
                    <option key={canton.code} value={canton.code}>
                      {canton.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('register.municipality') || 'Ort'}
                </label>
                <input
                  type="text"
                  value={formData.municipality || ''}
                  onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                  placeholder="z.B. Winterthur, Bern, Luzern"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('register.employmentStatus') || 'Beschäftigungsstatus'}
                </label>
                <select
                  value={formData.employmentStatus}
                  onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">{t('common.select') || 'Wählen'}</option>
                  {employmentStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {isStudent && (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('register.school') || 'Schule/Universität'}
                  </label>
                  <select
                    value={formData.schoolName}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">{t('common.select') || 'Wählen'}</option>
                    {schools.map((school) => (
                      <option key={school.value} value={school.value}>
                        {school.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {isWorking && (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('playerProfile.occupation') || 'Beruf'}
                  </label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    placeholder="z.B. Marketing Manager, Softwareentwickler"
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              )}
            </div>
          </div>

        {/* Volleyball Skills */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              {t('playerProfile.volleyballInfo') || 'Volleyball Informationen'}
            </h2>

            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('register.positions') || 'Positionen'}
              </label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {positions.map((pos) => (
                  <button
                    key={pos.value}
                    type="button"
                    onClick={() => {
                      const newPositions = formData.positions.includes(pos.value)
                        ? formData.positions.filter((p: string) => p !== pos.value)
                        : [...formData.positions, pos.value];
                      setFormData({ ...formData, positions: newPositions });
                    }}
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold transition ${
                      formData.positions.includes(pos.value)
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Physical Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('playerProfile.heightLabel') || 'Grösse (cm)'}
                </label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('playerProfile.weightLabel') || 'Gewicht (kg)'}
                </label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('playerProfile.spikeLabel') || 'Angriff (cm)'}
                </label>
                <input
                  type="number"
                  value={formData.spikeHeight}
                  onChange={(e) => setFormData({ ...formData, spikeHeight: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('playerProfile.blockLabel') || 'Block (cm)'}
                </label>
                <input
                  type="number"
                  value={formData.blockHeight}
                  onChange={(e) => setFormData({ ...formData, blockHeight: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Dominant Hand & Preferred Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('register.dominantHand') || 'Dominante Hand'}
                </label>
                <select
                  value={formData.dominantHand || ''}
                  onChange={(e) => setFormData({ ...formData, dominantHand: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">{t('common.select') || 'Wählen'}</option>
                  <option value="RIGHT">{t('register.rightHanded') || 'Rechts'}</option>
                  <option value="LEFT">{t('register.leftHanded') || 'Links'}</option>
                  <option value="AMBIDEXTROUS">{t('register.ambidextrous') || 'Beidhändig'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('register.preferredLanguage') || 'Sprache'}
                </label>
                <select
                  value={formData.preferredLanguage || ''}
                  onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">{t('common.select') || 'Wählen'}</option>
                  <option value="gsw">{t('register.languageSwissGerman') || 'Schwiizerdütsch'}</option>
                  <option value="de">{t('register.languageGerman') || 'Deutsch'}</option>
                  <option value="fr">{t('register.languageFrench') || 'Français'}</option>
                  <option value="it">{t('register.languageItalian') || 'Italiano'}</option>
                  <option value="en">{t('register.languageEnglish') || 'English'}</option>
                </select>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-3 sm:mt-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('playerProfile.bio') || 'Bio'}
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder={t('playerProfile.bioPlaceholder') || 'Schriib öppis über di...'}
              />
            </div>
          </div>

        {/* Club History */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                {t('playerProfile.clubHistory') || 'Club Geschichte'}
              </h2>
              <button
                onClick={handleAddClub}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
              >
              <Plus className="w-4 h-4" />
              {t('common.addClub') || 'Club hinzufügen'}
            </button>
          </div>

          {clubHistory.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 italic text-xs sm:text-sm text-center py-4">
              {t('playerProfile.noClubHistory') || 'Noch keine Clubs hinzugefügt.'}
            </p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {clubHistory.map((club, index) => {
                // Check if this club is invalid (has name but no yearTo and not current)
                const isInvalid = club.clubName && club.clubName.trim() !== '' && !club.currentClub && (!club.yearTo || club.yearTo.trim() === '');
                
                return (
                <div key={club.id} className={`p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border ${isInvalid ? 'border-red-500 dark:border-red-400' : 'border-gray-200 dark:border-gray-600'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs sm:text-sm font-semibold text-red-600">
                      {club.currentClub ? (t('common.currentClub') || 'Aktueller Club') : (t('common.previousClub') || 'Früherer Club')}
                    </span>
                    <button
                      onClick={() => handleRemoveClub(club.id)}
                      className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div className="relative">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {t('playerProfile.clubName') || 'Club Name'}
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
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-white"
                        placeholder="z.B. Volley Amriswil"
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
                                    logo: suggestion.logo || c.logo,
                                    clubData: suggestion // Store full club data for league filtering
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
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {t('playerProfile.leagues') || 'Ligen'}
                      </label>
                      <MultiLeagueSelector
                        selectedLeagues={club.leagues || (club.league ? [club.league] : [])}
                        onChange={(leagues) => {
                          const updated = clubHistory.map((c) =>
                            c.id === club.id ? { ...c, leagues, league: leagues[0] || '' } : c
                          );
                          setClubHistory(updated);
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {t('common.from') || 'Von'}
                      </label>
                      <input
                        type="number"
                        value={club.yearFrom}
                        onChange={(e) => {
                          const updated = clubHistory.map((c) =>
                            c.id === club.id ? { ...c, yearFrom: e.target.value } : c
                          );
                          setClubHistory(updated);
                        }}
                        placeholder="2020"
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {t('common.to') || 'Bis'}
                      </label>
                      <input
                        type="number"
                        value={club.yearTo || ''}
                        onChange={(e) => {
                          const updated = clubHistory.map((c) =>
                            c.id === club.id ? { ...c, yearTo: e.target.value } : c
                          );
                          setClubHistory(updated);
                        }}
                        placeholder="2024"
                        disabled={club.currentClub}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-white disabled:opacity-50"
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 pb-2">
                        <input
                          type="checkbox"
                          checked={club.currentClub}
                          onChange={(e) => {
                            const updated = clubHistory.map((c) =>
                              c.id === club.id 
                                ? { ...c, currentClub: e.target.checked, yearTo: e.target.checked ? '' : c.yearTo } 
                                : { ...c, currentClub: false }
                            );
                            setClubHistory(updated);
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {t('common.current') || 'Aktuell'}
                        </span>
                      </label>
                    </div>
                  </div>

                  {isInvalid && (
                    <div className="mt-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-3">
                      <p className="text-xs sm:text-sm text-red-800 dark:text-red-200">
                        ⚠️ {t('playerProfile.clubYearRequired') || 'Bitte füll "Bis Jahr" aus oder markier den Club als "Aktueller Club"'}
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              {t('playerProfile.achievements') || 'Erfolge'}
            </h2>

            {achievements.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 italic mb-4 text-xs sm:text-sm text-center py-4">
                {t('playerProfile.noAchievementsYet') || 'Noch keine Erfolge hinzugefügt'}
              </p>
            ) : (
              <div className="space-y-2.5 mb-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={achievement.text}
                      onChange={(e) => {
                        const updated = achievements.map((a) =>
                          a.id === achievement.id ? { ...a, text: e.target.value } : a
                        );
                        setAchievements(updated);
                      }}
                      placeholder={t('playerProfile.achievementPlaceholder') || 'z.B. U17 Schweizermeister 2021'}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={() => handleRemoveAchievement(achievement.id)}
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
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-red-600 hover:text-red-700 font-medium bg-red-50 dark:bg-red-900/20 px-4 py-2.5 rounded-lg transition text-sm"
            >
              <Plus className="w-4 h-4" />
              {t('playerProfile.addAchievement') || 'Erfolg hinzufügen'}
            </button>
          </div>

        {/* Media */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t('playerProfile.documents') || 'Dokumente'}
            </h2>

            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('playerProfile.swissVolleyLicense') || 'Swiss Volley Lizenz'} ({t('common.optional') || 'Optional'})
                </label>
                <ImageUpload
                  label={t('playerProfile.uploadLicense') || 'Lizenz hochladen'}
                  value={formData.swissVolleyLicense}
                  onChange={(v: string) => setFormData({ ...formData, swissVolleyLicense: v })}
                  aspectRatio="banner"
                  allowPdf={true}
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('playerProfile.idDocument') || 'Ausweis/ID'} ({t('common.optional') || 'Optional'})
                </label>
                <ImageUpload
                  label={t('playerProfile.uploadId') || 'Ausweis hochladen'}
                  value={formData.ausweiss}
                  onChange={(v: string) => setFormData({ ...formData, ausweiss: v })}
                  aspectRatio="banner"
                  allowPdf={true}
                />
              </div>
            </div>
          </div>

        {/* Social Media */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t('playerProfile.socialMedia') || 'Social Media'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Instagram
                </label>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  placeholder="@username"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  TikTok
                </label>
                <input
                  type="text"
                  value={formData.tiktok}
                  onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                  placeholder="@username"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  YouTube
                </label>
                <input
                  type="text"
                  value={formData.youtube}
                  onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                  placeholder="https://youtube.com/..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

        {/* Looking for Club */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <input
                  type="checkbox"
                  checked={formData.lookingForClub}
                  onChange={(e) => setFormData({ ...formData, lookingForClub: e.target.checked })}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('playerProfile.lookingForClub') || 'Aktiv auf Clubsuche'}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Bottom Save Button - Mobile Sticky */}
        <div className="mt-4 sm:mt-6 sticky bottom-3 sm:relative sm:bottom-auto flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 shadow-lg sm:shadow-none text-sm sm:text-base"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('common.saving') || 'Speichere...'}
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {t('common.saveChanges') || 'Änderungen speichern'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

}