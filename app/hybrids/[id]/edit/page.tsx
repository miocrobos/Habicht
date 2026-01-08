'use client';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { ArrowLeft, Save, Loader2, User, Briefcase, MapPin, Trophy, Plus, Trash2, X, Building } from 'lucide-react';
import Link from 'next/link';
import { Canton } from '@prisma/client';
import { getAllSchools } from '@/lib/schoolData';
import ImageUpload from '@/components/shared/ImageUpload';
import CountrySelect from '@/components/shared/CountrySelect';
import MultiLeagueSelector from '@/components/shared/MultiLeagueSelector';
import { toast } from 'react-hot-toast';
import { calculateAge } from '@/lib/ageUtils';

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

// Position and employment status arrays are now inside the component to support translations

export default function HybridEditPage({ params }: { params: { id: string } }) {
  const { t } = useLanguage();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState<'shared' | 'player' | 'recruiter'>('shared');

  // Translated positions
  const positions = [
    { value: 'SETTER', label: t('positions.setter') },
    { value: 'OUTSIDE_HITTER', label: t('positions.outsideHitter') },
    { value: 'MIDDLE_BLOCKER', label: t('positions.middleBlocker') },
    { value: 'OPPOSITE', label: t('positions.opposite') },
    { value: 'LIBERO', label: t('positions.libero') },
    { value: 'UNIVERSAL', label: t('positions.universal') },
  ];

  // Translated employment status options
  const employmentStatusOptions = [
    { value: 'STUDENT_FULL_TIME', label: t('playerProfile.edit.studentFullTime') },
    { value: 'STUDENT_PART_TIME', label: t('playerProfile.edit.studentPartTime') },
    { value: 'WORKING_FULL_TIME', label: t('playerProfile.edit.workingFullTime') },
    { value: 'WORKING_PART_TIME', label: t('playerProfile.edit.workingPartTime') },
  ];

  // Shared data
  const [sharedData, setSharedData] = useState({
    profileImage: '',
    firstName: '',
    lastName: '',
    nationality: 'Swiss',
    phone: '',
    canton: '',
    municipality: '',
    preferredLanguage: '',
    gender: '',
    dateOfBirth: '',
  });

  // Player-specific data
  const [playerData, setPlayerData] = useState({
    playerId: '',
    height: '',
    weight: '',
    spikeHeight: '',
    blockHeight: '',
    dominantHand: '',
    positions: [] as string[],
    currentLeagues: [] as string[],
    currentClubId: '',
    lookingForClub: false,
    lookingForLeagues: [] as string[],
    bio: '',
    employmentStatus: '',
    school: '',
    instagram: '',
    tiktok: '',
    youtube: '',
    facebook: '',
    swissVolleyLicense: '',
    ausweiss: '',
  });

  // Recruiter-specific data
  const [recruiterData, setRecruiterData] = useState({
    recruiterId: '',
    age: '',
    organization: '',
    coachRole: '',
    coachingLicense: '',
    genderCoached: [] as string[],
    positionsLookingFor: [] as string[],
    lookingForMembers: false,
    bio: '',
    instagram: '',
    tiktok: '',
    youtube: '',
    facebook: '',
  });

  const [playerClubHistory, setPlayerClubHistory] = useState<any[]>([]);
  const [recruiterClubHistory, setRecruiterClubHistory] = useState<any[]>([]);
  const [playerAchievements, setPlayerAchievements] = useState<{ id: string; text: string }[]>([]);
  const [recruiterAchievements, setRecruiterAchievements] = useState<{ id: string; text: string }[]>([]);
  const [allClubs, setAllClubs] = useState<any[]>([]);

  const schools = getAllSchools();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/login');
      return;
    }
    // Check if user owns this profile
    if (session.user.id !== params.id) {
      router.push(`/hybrids/${params.id}`);
      return;
    }
    loadHybridData();
    loadAllClubs();
  }, [session, status]);

  const loadAllClubs = async () => {
    try {
      const response = await axios.get('/api/clubs?all=true');
      setAllClubs(response.data.clubs || []);
    } catch (error) {
      console.error('Error loading clubs:', error);
    }
  };

  const loadHybridData = async () => {
    try {
      const response = await axios.get(`/api/hybrids/${params.id}`);
      const hybrid = response.data.hybrid;

      // Set shared data
      setSharedData({
        profileImage: hybrid.profileImage || hybrid.player?.profileImage || hybrid.recruiter?.profileImage || '',
        firstName: hybrid.firstName || hybrid.player?.firstName || hybrid.recruiter?.firstName || '',
        lastName: hybrid.lastName || hybrid.player?.lastName || hybrid.recruiter?.lastName || '',
        nationality: hybrid.player?.nationality || hybrid.recruiter?.nationality || 'Swiss',
        phone: hybrid.player?.phone || hybrid.recruiter?.phone || '',
        canton: hybrid.player?.canton || hybrid.recruiter?.canton || '',
        municipality: hybrid.player?.municipality || hybrid.recruiter?.province || '',
        preferredLanguage: hybrid.player?.preferredLanguage || hybrid.recruiter?.preferredLanguage || '',
        gender: hybrid.player?.gender || '',
        dateOfBirth: hybrid.player?.dateOfBirth ? new Date(hybrid.player.dateOfBirth).toISOString().split('T')[0] : '',
      });

      // Set player data if exists
      if (hybrid.player) {
        setPlayerData({
          playerId: hybrid.player.id || '',
          height: hybrid.player.height?.toString() || '',
          weight: hybrid.player.weight?.toString() || '',
          spikeHeight: hybrid.player.spikeHeight?.toString() || '',
          blockHeight: hybrid.player.blockHeight?.toString() || '',
          dominantHand: hybrid.player.dominantHand || '',
          positions: hybrid.player.positions || [],
          currentLeagues: hybrid.player.currentLeagues || [],
          currentClubId: hybrid.player.currentClub?.id || '',
          lookingForClub: hybrid.player.lookingForClub || false,
          lookingForLeagues: hybrid.player.lookingForLeagues || [],
          bio: hybrid.player.bio || '',
          employmentStatus: hybrid.player.employmentStatus || '',
          school: hybrid.player.school || '',
          instagram: hybrid.player.instagram || '',
          tiktok: hybrid.player.tiktok || '',
          youtube: hybrid.player.youtube || '',
          facebook: hybrid.player.facebook || '',
          swissVolleyLicense: hybrid.player.swissVolleyLicense || '',
          ausweiss: hybrid.player.ausweiss || '',
        });

        // Load player club history
        if (hybrid.player.clubHistory && Array.isArray(hybrid.player.clubHistory)) {
          const formattedHistory = hybrid.player.clubHistory.map((club: any) => {
            // Get unique leagues to prevent duplicates
            const rawLeagues = club.leagues || (club.league ? [club.league] : []);
            const uniqueLeagues = [...new Set(rawLeagues)] as string[];
            
            return {
              id: club.id,
              clubId: club.clubId || club.club?.id || '',
              clubName: club.clubName || club.club?.name || '',
              logo: club.club?.logo || club.clubLogo || '',
              country: club.clubCountry || club.country || 'Switzerland',
              clubWebsiteUrl: club.clubWebsiteUrl || '',
              leagues: uniqueLeagues,
              yearFrom: club.startDate ? new Date(club.startDate).getFullYear().toString() : '',
              yearTo: club.endDate ? new Date(club.endDate).getFullYear().toString() : '',
              currentClub: club.currentClub || false,
            };
          });
          setPlayerClubHistory(formattedHistory);
        }

        // Load player achievements
        if (hybrid.player.achievements && Array.isArray(hybrid.player.achievements)) {
          setPlayerAchievements(hybrid.player.achievements.map((ach: string, idx: number) => ({
            id: `achievement-${idx}`,
            text: ach,
          })));
        }
      }

      // Set recruiter data if exists
      if (hybrid.recruiter) {
        setRecruiterData({
          recruiterId: hybrid.recruiter.id || '',
          age: hybrid.recruiter.age?.toString() || '',
          organization: hybrid.recruiter.organization || '',
          coachRole: hybrid.recruiter.coachRole || '',
          coachingLicense: hybrid.recruiter.coachingLicense || '',
          genderCoached: hybrid.recruiter.genderCoached || [],
          positionsLookingFor: hybrid.recruiter.positionsLookingFor || [],
          lookingForMembers: hybrid.recruiter.lookingForMembers || false,
          bio: hybrid.recruiter.bio || '',
          instagram: hybrid.recruiter.instagram || '',
          tiktok: hybrid.recruiter.tiktok || '',
          youtube: hybrid.recruiter.youtube || '',
          facebook: hybrid.recruiter.facebook || '',
        });

        // Load recruiter club history
        if (hybrid.recruiter.clubHistory && Array.isArray(hybrid.recruiter.clubHistory)) {
          const formattedHistory = hybrid.recruiter.clubHistory.map((club: any) => {
            // Get unique leagues to prevent duplicates
            const rawLeagues = club.leagues || (club.league ? [club.league] : []);
            const uniqueLeagues = [...new Set(rawLeagues)] as string[];
            // Get coachRole from role array (first element)
            const roleArray = club.role || [];
            const coachRole = Array.isArray(roleArray) && roleArray.length > 0 ? roleArray[0] : '';
            
            return {
              id: club.id,
              clubId: club.clubId || club.club?.id || '',
              clubName: club.clubName || club.club?.name || '',
              logo: club.club?.logo || club.clubLogo || '',
              country: club.clubCountry || club.country || 'Switzerland',
              clubWebsiteUrl: club.clubWebsiteUrl || '',
              leagues: uniqueLeagues,
              coachRole: coachRole,
              yearFrom: club.startDate ? new Date(club.startDate).getFullYear().toString() : '',
              yearTo: club.endDate ? new Date(club.endDate).getFullYear().toString() : '',
              currentClub: club.currentClub || false,
            };
          });
          setRecruiterClubHistory(formattedHistory);
        }

        // Load recruiter achievements
        if (hybrid.recruiter.achievements && Array.isArray(hybrid.recruiter.achievements)) {
          setRecruiterAchievements(hybrid.recruiter.achievements.map((ach: string, idx: number) => ({
            id: `achievement-${idx}`,
            text: ach,
          })));
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading hybrid data:', error);
      setError('Error loading profile data');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      // Prepare all API calls to run in parallel
      const apiCalls: Promise<any>[] = [];
      
      // Update hybrid profile with shared data (this is the main source for hybrid profile page)
      apiCalls.push(axios.put(`/api/hybrids/${params.id}`, {
        firstName: sharedData.firstName,
        lastName: sharedData.lastName,
        profileImage: sharedData.profileImage,
        nationality: sharedData.nationality,
        phone: sharedData.phone,
        canton: sharedData.canton || null,
        municipality: sharedData.municipality,
        bio: playerData.bio || recruiterData.bio,
      }));

      // Update player profile with shared data + player-specific data
      if (playerData.playerId) {
        // Derive currentLeagues from player's current club in club history (not from recruiter's club affiliations)
        const playerCurrentClub = playerClubHistory.find(c => c.currentClub);
        const playerCurrentLeagues = playerCurrentClub?.leagues || [];
        
        apiCalls.push(axios.put(`/api/players/${playerData.playerId}`, {
          playerData: {
            firstName: sharedData.firstName,
            lastName: sharedData.lastName,
            profileImage: sharedData.profileImage,
            nationality: sharedData.nationality,
            phone: sharedData.phone,
            canton: sharedData.canton,
            municipality: sharedData.municipality,
            preferredLanguage: sharedData.preferredLanguage,
            // Shared fields
            gender: sharedData.gender,
            dateOfBirth: sharedData.dateOfBirth ? new Date(sharedData.dateOfBirth).toISOString() : null,
            // Player specific
            height: playerData.height ? parseInt(playerData.height) : null,
            weight: playerData.weight ? parseInt(playerData.weight) : null,
            spikeHeight: playerData.spikeHeight ? parseInt(playerData.spikeHeight) : null,
            blockHeight: playerData.blockHeight ? parseInt(playerData.blockHeight) : null,
            dominantHand: playerData.dominantHand || null,
            positions: playerData.positions,
            // Use leagues from player's current club entry (not mixed with recruiter leagues)
            currentLeagues: playerCurrentLeagues,
            currentClubId: playerData.currentClubId || null,
            lookingForClub: playerData.lookingForClub,
            lookingForLeagues: playerData.lookingForLeagues,
            bio: playerData.bio,
            employmentStatus: playerData.employmentStatus || null,
            school: playerData.school || null,
            instagram: playerData.instagram,
            tiktok: playerData.tiktok,
            youtube: playerData.youtube,
            facebook: playerData.facebook,
            swissVolleyLicense: playerData.swissVolleyLicense || null,
            ausweiss: playerData.ausweiss || null,
          },
          achievements: playerAchievements.map(a => a.text),
          clubHistory: playerClubHistory.filter(c => c.clubName && (c.currentClub || c.yearTo)).map(club => ({
            clubId: club.clubId || null,
            clubName: club.clubName,
            country: club.country || 'Switzerland',
            clubWebsiteUrl: club.clubWebsiteUrl || '',
            leagues: [...new Set(club.leagues || [])], // Ensure unique leagues
            startDate: club.yearFrom ? new Date(`${club.yearFrom}-01-01`).toISOString() : null,
            endDate: club.currentClub ? null : (club.yearTo ? new Date(`${club.yearTo}-12-31`).toISOString() : null),
            currentClub: club.currentClub || false,
          })),
        }));
      }

      // Update recruiter profile with shared data + recruiter-specific data
      if (recruiterData.recruiterId) {
        // Calculate age from shared dateOfBirth for the recruiter profile
        const ageFromDOB = sharedData.dateOfBirth ? calculateAge(sharedData.dateOfBirth) : null;
        
        apiCalls.push(axios.put(`/api/recruiters/${recruiterData.recruiterId}`, {
          firstName: sharedData.firstName,
          lastName: sharedData.lastName,
          profileImage: sharedData.profileImage,
          nationality: sharedData.nationality,
          phone: sharedData.phone,
          canton: sharedData.canton,
          province: sharedData.municipality,
          preferredLanguage: sharedData.preferredLanguage,
          // Recruiter specific - age calculated from player's DOB
          age: ageFromDOB,
          organization: recruiterData.organization,
          coachRole: recruiterData.coachRole,
          coachingLicense: recruiterData.coachingLicense,
          genderCoached: recruiterData.genderCoached,
          positionsLookingFor: recruiterData.positionsLookingFor,
          lookingForMembers: recruiterData.lookingForMembers,
          bio: recruiterData.bio,
          instagram: recruiterData.instagram,
          tiktok: recruiterData.tiktok,
          youtube: recruiterData.youtube,
          facebook: recruiterData.facebook,
          achievements: recruiterAchievements.map(a => a.text),
          clubHistory: recruiterClubHistory.filter(c => c.clubName && (c.currentClub || c.yearTo)).map(club => ({
            clubId: club.clubId || null,
            clubName: club.clubName,
            country: club.country || 'Switzerland',
            clubWebsiteUrl: club.clubWebsiteUrl || '',
            leagues: [...new Set(club.leagues || [])], // Ensure unique leagues
            role: club.coachRole ? [club.coachRole] : [],
            startDate: club.yearFrom ? new Date(`${club.yearFrom}-01-01`).toISOString() : null,
            endDate: club.currentClub ? null : (club.yearTo ? new Date(`${club.yearTo}-12-31`).toISOString() : null),
            currentClub: club.currentClub || false,
          })),
        }));
      }

      // Run all API calls in parallel for faster save
      await Promise.all(apiCalls);

      setSuccess(true);
      toast.success(t('playerProfile.profileUpdated') || 'Profil aktualisiert!');
      // Redirect immediately after success (reduced from 1500ms)
      setTimeout(() => router.push(`/hybrids/${params.id}`), 300);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setError(error.response?.data?.error || 'Error saving profile');
      toast.error(t('playerProfile.updateError') || 'Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const addPlayerClubHistory = () => {
    setPlayerClubHistory([...playerClubHistory, {
      id: `new-${Date.now()}`,
      clubName: '',
      country: 'Switzerland',
      leagues: [],
      yearFrom: '',
      yearTo: '',
      currentClub: false,
    }]);
  };

  const addRecruiterClubHistory = () => {
    setRecruiterClubHistory([...recruiterClubHistory, {
      id: `new-${Date.now()}`,
      clubName: '',
      country: 'Switzerland',
      leagues: [],
      coachRole: '',
      yearFrom: '',
      yearTo: '',
      currentClub: false,
    }]);
  };

  const addPlayerAchievement = () => {
    setPlayerAchievements([...playerAchievements, { id: `new-${Date.now()}`, text: '' }]);
  };

  const addRecruiterAchievement = () => {
    setRecruiterAchievements([...recruiterAchievements, { id: `new-${Date.now()}`, text: '' }]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('hybridProfile.loadingProfile') || 'Loading profile...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href={`/hybrids/${params.id}`}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('common.back') || 'Zurück'}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('hybridProfile.editProfile') || 'Hybrid Profil bearbeiten'}
          </h1>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg text-green-700 dark:text-green-300">
            {t('playerProfile.profileUpdated') || 'Profil aktualisiert!'}
          </div>
        )}

        {/* Section Tabs */}
        <div className="mb-6 flex gap-2 bg-white dark:bg-gray-800 rounded-xl p-2 shadow-lg">
          <button
            onClick={() => setActiveSection('shared')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition ${
              activeSection === 'shared'
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <User className="w-5 h-5" />
            {t('hybridProfile.sharedInfo') || 'Gemeinsam'}
          </button>
          <button
            onClick={() => setActiveSection('player')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition ${
              activeSection === 'player'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <User className="w-5 h-5" />
            {t('hybridProfile.playerSection') || 'Spieler'}
          </button>
          <button
            onClick={() => setActiveSection('recruiter')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition ${
              activeSection === 'recruiter'
                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Briefcase className="w-5 h-5" />
            {t('hybridProfile.recruiterSection') || 'Rekrutierer'}
          </button>
        </div>

        {/* Shared Info Section */}
        {activeSection === 'shared' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <User className="w-6 h-6 text-purple-600" />
              {t('hybridProfile.sharedInfo') || 'Gemeinsame Informationen'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {t('hybridProfile.sharedInfoDesc') || 'Diese Informationen werden für beide Profile (Spieler & Rekrutierer) verwendet.'}
            </p>

            {/* Profile Image */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('playerProfile.profileImage') || 'Profilbild'}
              </label>
              <ImageUpload
                value={sharedData.profileImage}
                onChange={(url) => setSharedData({ ...sharedData, profileImage: url })}
                label=""
              />
            </div>

            {/* Name */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('register.firstName') || 'Vorname'}
                </label>
                <input
                  type="text"
                  value={sharedData.firstName}
                  onChange={(e) => setSharedData({ ...sharedData, firstName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('register.lastName') || 'Nachname'}
                </label>
                <input
                  type="text"
                  value={sharedData.lastName}
                  onChange={(e) => setSharedData({ ...sharedData, lastName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Nationality & Phone */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('playerProfile.nationality') || 'Nationalität'}
                </label>
                <CountrySelect
                  value={sharedData.nationality}
                  onChange={(val) => setSharedData({ ...sharedData, nationality: val })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('register.phone') || 'Telefon'}
                </label>
                <input
                  type="tel"
                  value={sharedData.phone}
                  onChange={(e) => setSharedData({ ...sharedData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Canton & Municipality */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('register.canton') || 'Kanton'}
                </label>
                <select
                  value={sharedData.canton}
                  onChange={(e) => setSharedData({ ...sharedData, canton: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">{t('common.select') || 'Auswählen'}</option>
                  {cantons.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('register.municipality') || 'Gemeinde/Ort'}
                </label>
                <input
                  type="text"
                  value={sharedData.municipality}
                  onChange={(e) => setSharedData({ ...sharedData, municipality: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Preferred Language */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('register.preferredLanguage') || 'Bevorzugte Sprache'}
              </label>
              <select
                value={sharedData.preferredLanguage}
                onChange={(e) => setSharedData({ ...sharedData, preferredLanguage: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">{t('common.select') || 'Auswählen'}</option>
                <option value="gsw">{t('register.languageSwissGerman') || 'Schwiizerdütsch'}</option>
                <option value="de">{t('register.languageGerman') || 'Deutsch'}</option>
                <option value="fr">{t('register.languageFrench') || 'Französisch'}</option>
                <option value="it">{t('register.languageItalian') || 'Italienisch'}</option>
                <option value="en">{t('register.languageEnglish') || 'English'}</option>
              </select>
            </div>

            {/* Gender & Date of Birth */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('register.gender') || 'Geschlecht'}
                </label>
                <select
                  value={sharedData.gender}
                  onChange={(e) => setSharedData({ ...sharedData, gender: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">{t('common.select') || 'Auswählen'}</option>
                  <option value="MALE">{t('playerProfile.men') || 'Männlich'}</option>
                  <option value="FEMALE">{t('playerProfile.women') || 'Weiblich'}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('register.dateOfBirth') || 'Geburtsdatum'}
                </label>
                <input
                  type="date"
                  value={sharedData.dateOfBirth}
                  onChange={(e) => setSharedData({ ...sharedData, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Player Section */}
        {activeSection === 'player' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <User className="w-6 h-6 text-blue-600" />
              {t('hybridProfile.playerDetails') || 'Spieler Informationen'}
            </h2>

            {/* Positions */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('register.positions') || 'Positionen'}
              </label>
              <div className="flex flex-wrap gap-2">
                {positions.map((pos) => (
                  <button
                    key={pos.value}
                    type="button"
                    onClick={() => {
                      const newPositions = playerData.positions.includes(pos.value)
                        ? playerData.positions.filter(p => p !== pos.value)
                        : [...playerData.positions, pos.value];
                      setPlayerData({ ...playerData, positions: newPositions });
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold transition ${
                      playerData.positions.includes(pos.value)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Physical Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('playerProfile.heightLabel') || 'Grösse (cm)'}
                </label>
                <input
                  type="number"
                  value={playerData.height}
                  onChange={(e) => setPlayerData({ ...playerData, height: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('playerProfile.weightLabel') || 'Gewicht (kg)'}
                </label>
                <input
                  type="number"
                  value={playerData.weight}
                  onChange={(e) => setPlayerData({ ...playerData, weight: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('playerProfile.spikeLabel') || 'Angriff (cm)'}
                </label>
                <input
                  type="number"
                  value={playerData.spikeHeight}
                  onChange={(e) => setPlayerData({ ...playerData, spikeHeight: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('playerProfile.blockLabel') || 'Block (cm)'}
                </label>
                <input
                  type="number"
                  value={playerData.blockHeight}
                  onChange={(e) => setPlayerData({ ...playerData, blockHeight: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Dominant Hand */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('register.dominantHand') || 'Dominante Hand'}
              </label>
              <select
                value={playerData.dominantHand}
                onChange={(e) => setPlayerData({ ...playerData, dominantHand: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">{t('common.select') || 'Auswählen'}</option>
                <option value="RIGHT">{t('register.rightHanded') || 'Rechts'}</option>
                <option value="LEFT">{t('register.leftHanded') || 'Links'}</option>
                <option value="BOTH">{t('register.ambidextrous') || 'Beidhändig'}</option>
              </select>
            </div>

            {/* Looking for Club */}
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={playerData.lookingForClub}
                  onChange={(e) => setPlayerData({ ...playerData, lookingForClub: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('playerProfile.lookingForClub') || 'Sucht Club'}
                </span>
              </label>
            </div>

            {/* Employment Status & School */}
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {t('playerProfile.employment') || 'Beschäftigung'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('register.employmentStatus') || 'Beschäftigungsstatus'}
                  </label>
                  <select
                    value={playerData.employmentStatus}
                    onChange={(e) => setPlayerData({ ...playerData, employmentStatus: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">{t('common.select') || 'Auswählen'}</option>
                    {employmentStatusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                {playerData.employmentStatus?.includes('STUDENT') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('register.school') || 'Schule/Universität'}
                    </label>
                    <select
                      value={playerData.school}
                      onChange={(e) => setPlayerData({ ...playerData, school: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">{t('common.select') || 'Auswählen'}</option>
                      {schools.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Player Club History */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  {t('playerProfile.clubHistory') || 'Club Geschichte'}
                </h3>
                <button
                  type="button"
                  onClick={addPlayerClubHistory}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  {t('common.addClub') || 'Club hinzufügen'}
                </button>
              </div>
              
              {playerClubHistory.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                  {t('playerProfile.noClubHistory') || 'Noch keine Clubs hinzugefügt.'}
                </p>
              ) : (
                <div className="space-y-4">
                  {playerClubHistory.map((club, idx) => (
                    <div key={club.id} className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-semibold text-blue-600">
                          {club.currentClub ? (t('common.currentClub') || 'Aktueller Club') : (t('common.previousClub') || 'Früherer Club')}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPlayerClubHistory(playerClubHistory.filter((_, i) => i !== idx))}
                          className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            {t('playerProfile.clubName') || 'Club Name'}
                          </label>
                          <select
                            value={club.clubId || ''}
                            onChange={(e) => {
                              const selectedClub = allClubs.find(c => c.id === e.target.value);
                              const newHistory = [...playerClubHistory];
                              newHistory[idx].clubId = e.target.value;
                              newHistory[idx].clubName = selectedClub?.name || '';
                              setPlayerClubHistory(newHistory);
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                          >
                            <option value="">{t('common.selectClub') || 'Club auswählen'}</option>
                            {allClubs.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={club.clubName || ''}
                            onChange={(e) => {
                              const newHistory = [...playerClubHistory];
                              newHistory[idx].clubName = e.target.value;
                              newHistory[idx].clubId = '';
                              setPlayerClubHistory(newHistory);
                            }}
                            className="w-full mt-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                            placeholder={t('playerProfile.orEnterManually') || 'oder manuell eingeben'}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            {t('playerProfile.leagues') || 'Ligen'}
                          </label>
                          <MultiLeagueSelector
                            selectedLeagues={club.leagues || []}
                            onChange={(leagues) => {
                              const newHistory = [...playerClubHistory];
                              newHistory[idx].leagues = leagues;
                              setPlayerClubHistory(newHistory);
                            }}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            {t('common.from') || 'Von'}
                          </label>
                          <input
                            type="number"
                            value={club.yearFrom || ''}
                            onChange={(e) => {
                              const newHistory = [...playerClubHistory];
                              newHistory[idx].yearFrom = e.target.value;
                              setPlayerClubHistory(newHistory);
                            }}
                            placeholder="2020"
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
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
                              const newHistory = [...playerClubHistory];
                              newHistory[idx].yearTo = e.target.value;
                              setPlayerClubHistory(newHistory);
                            }}
                            placeholder="2024"
                            disabled={club.currentClub}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white disabled:opacity-50"
                          />
                        </div>
                        <div className="flex items-end">
                          <label className="flex items-center gap-2 pb-2">
                            <input
                              type="checkbox"
                              checked={club.currentClub || false}
                              onChange={(e) => {
                                const newHistory = [...playerClubHistory];
                                newHistory[idx].currentClub = e.target.checked;
                                if (e.target.checked) {
                                  newHistory[idx].yearTo = '';
                                }
                                setPlayerClubHistory(newHistory);
                              }}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              {t('common.current') || 'Aktuell'}
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bio */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('playerProfile.bio') || 'Bio'}
              </label>
              <textarea
                value={playerData.bio}
                onChange={(e) => setPlayerData({ ...playerData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Player Achievements */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  {t('playerProfile.achievements') || 'Erfolge'}
                </label>
                <button
                  type="button"
                  onClick={addPlayerAchievement}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  {t('common.add') || 'Hinzufügen'}
                </button>
              </div>
              {playerAchievements.map((ach, idx) => (
                <div key={ach.id} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={ach.text}
                    onChange={(e) => {
                      const newAchievements = [...playerAchievements];
                      newAchievements[idx].text = e.target.value;
                      setPlayerAchievements(newAchievements);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder={t('playerProfile.achievementPlaceholder') || 'z.B. Schweizermeister 2023'}
                  />
                  <button
                    type="button"
                    onClick={() => setPlayerAchievements(playerAchievements.filter((_, i) => i !== idx))}
                    className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Social Media */}
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                {t('playerProfile.socialMedia') || 'Social Media'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('socialMedia.instagram') || 'Instagram'}
                  </label>
                  <input
                    type="text"
                    value={playerData.instagram}
                    onChange={(e) => setPlayerData({ ...playerData, instagram: e.target.value })}
                    placeholder={t('socialMedia.usernamePlaceholder') || '@username'}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('socialMedia.tiktok') || 'TikTok'}
                  </label>
                  <input
                    type="text"
                    value={playerData.tiktok}
                    onChange={(e) => setPlayerData({ ...playerData, tiktok: e.target.value })}
                    placeholder={t('socialMedia.usernamePlaceholder') || '@username'}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('socialMedia.youtube') || 'YouTube'}
                  </label>
                  <input
                    type="text"
                    value={playerData.youtube}
                    onChange={(e) => setPlayerData({ ...playerData, youtube: e.target.value })}
                    placeholder={t('socialMedia.channelUrlPlaceholder') || 'Channel URL'}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('socialMedia.facebook') || 'Facebook'}
                  </label>
                  <input
                    type="text"
                    value={playerData.facebook}
                    onChange={(e) => setPlayerData({ ...playerData, facebook: e.target.value })}
                    placeholder={t('socialMedia.profileUrlPlaceholder') || 'Profile URL'}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Media Section */}
            <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {t('playerProfile.media') || 'Media'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('playerProfile.playerLicense') || 'Swiss Volley Lizenz'} ({t('register.optional') || 'Optional'})
                  </label>
                  <ImageUpload
                    label={t('register.uploadLicense') || 'Lad Lizenz-Foto Ufe'}
                    value={playerData.swissVolleyLicense}
                    onChange={(v: string) => setPlayerData({ ...playerData, swissVolleyLicense: v })}
                    aspectRatio="banner"
                    allowPdf={true}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('playerProfile.idCard') || 'Ausweiss/ID'} ({t('register.optional') || 'Optional'})
                  </label>
                  <ImageUpload
                    label={t('register.uploadId') || 'Lad Ausweiss-Foto Ufe'}
                    value={playerData.ausweiss}
                    onChange={(v: string) => setPlayerData({ ...playerData, ausweiss: v })}
                    aspectRatio="banner"
                    allowPdf={true}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recruiter Section */}
        {activeSection === 'recruiter' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-green-600" />
              {t('hybridProfile.recruiterDetails') || 'Rekrutierer Informationen'}
            </h2>

            {/* Coaching License */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('recruiterProfile.coachingLicense') || 'Trainerlizenz'}
              </label>
              <ImageUpload
                label=""
                value={recruiterData.coachingLicense}
                onChange={(base64) => setRecruiterData({ ...recruiterData, coachingLicense: base64 })}
                allowPdf={true}
                helpText={t('recruiterProfile.coachingLicenseHelpText') || 'Upload your coaching license (image or PDF)'}
              />
            </div>

            {/* Club Affiliations */}
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-green-600" />
                  {t('recruiterProfile.clubAffiliations') || 'Club Zugehörigkeiten'}
                </h3>
                <button
                  type="button"
                  onClick={addRecruiterClubHistory}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  {t('common.addClub') || 'Club hinzufügen'}
                </button>
              </div>
              
              {recruiterClubHistory.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                  {t('recruiterProfile.noClubsYet') || 'Noch keine Clubs hinzugefügt. Klicke auf "Club hinzufügen" um deine Club-Zugehörigkeiten zu verwalten.'}
                </p>
              ) : (
                <div className="space-y-4">
                  {recruiterClubHistory.map((club, idx) => (
                    <div key={club.id} className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-semibold text-green-600">
                          {club.currentClub ? (t('common.currentClub') || 'Aktueller Club') : (t('common.previousClub') || 'Früherer Club')}
                        </span>
                        <button
                          type="button"
                          onClick={() => setRecruiterClubHistory(recruiterClubHistory.filter((_, i) => i !== idx))}
                          className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            {t('recruiterProfile.clubName') || 'Club Name'}
                          </label>
                          <select
                            value={club.clubId || ''}
                            onChange={(e) => {
                              const selectedClub = allClubs.find(c => c.id === e.target.value);
                              const newHistory = [...recruiterClubHistory];
                              newHistory[idx].clubId = e.target.value;
                              newHistory[idx].clubName = selectedClub?.name || '';
                              setRecruiterClubHistory(newHistory);
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
                          >
                            <option value="">{t('common.selectClub') || 'Club auswählen'}</option>
                            {allClubs.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={club.clubName || ''}
                            onChange={(e) => {
                              const newHistory = [...recruiterClubHistory];
                              newHistory[idx].clubName = e.target.value;
                              newHistory[idx].clubId = '';
                              setRecruiterClubHistory(newHistory);
                            }}
                            className="w-full mt-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
                            placeholder={t('recruiterProfile.orEnterManually') || 'oder manuell eingeben'}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            {t('recruiterProfile.coachRole') || 'Trainer-Rolle'}
                          </label>
                          <select
                            value={club.coachRole || ''}
                            onChange={(e) => {
                              const newHistory = [...recruiterClubHistory];
                              newHistory[idx].coachRole = e.target.value;
                              setRecruiterClubHistory(newHistory);
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
                          >
                            <option value="">{t('common.select') || 'Auswählen'}</option>
                            <option value="HEAD_COACH">{t('coachRole.head_coach') || 'Headcoach'}</option>
                            <option value="ASSISTANT_COACH">{t('coachRole.assistant_coach') || 'Assistenztrainer'}</option>
                            <option value="TECHNICAL_COACH">{t('coachRole.technical_coach') || 'Technischer Trainer'}</option>
                            <option value="PHYSICAL_COACH">{t('coachRole.physical_coach') || 'Athletiktrainer'}</option>
                            <option value="SCOUT">{t('coachRole.scout') || 'Scout'}</option>
                            <option value="TRAINER">{t('coachRole.trainer') || 'Trainer'}</option>
                          </select>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          {t('recruiterProfile.leagues') || 'Ligen'}
                        </label>
                        <MultiLeagueSelector
                          selectedLeagues={club.leagues || []}
                          onChange={(leagues) => {
                            const newHistory = [...recruiterClubHistory];
                            newHistory[idx].leagues = leagues;
                            setRecruiterClubHistory(newHistory);
                          }}
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            {t('common.from') || 'Von'}
                          </label>
                          <input
                            type="number"
                            value={club.yearFrom || ''}
                            onChange={(e) => {
                              const newHistory = [...recruiterClubHistory];
                              newHistory[idx].yearFrom = e.target.value;
                              setRecruiterClubHistory(newHistory);
                            }}
                            placeholder="2020"
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
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
                              const newHistory = [...recruiterClubHistory];
                              newHistory[idx].yearTo = e.target.value;
                              setRecruiterClubHistory(newHistory);
                            }}
                            placeholder="2024"
                            disabled={club.currentClub}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white disabled:opacity-50"
                          />
                        </div>
                        <div className="flex items-end">
                          <label className="flex items-center gap-2 pb-2">
                            <input
                              type="checkbox"
                              checked={club.currentClub || false}
                              onChange={(e) => {
                                const newHistory = [...recruiterClubHistory];
                                newHistory[idx].currentClub = e.target.checked;
                                if (e.target.checked) {
                                  newHistory[idx].yearTo = '';
                                }
                                setRecruiterClubHistory(newHistory);
                              }}
                              className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              {t('common.current') || 'Aktuell'}
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Gender Coached */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('recruiterProfile.genderCoached') || 'Trainierte Geschlechter'}
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={recruiterData.genderCoached.includes('MALE')}
                    onChange={(e) => {
                      const newGenders = e.target.checked
                        ? [...recruiterData.genderCoached, 'MALE']
                        : recruiterData.genderCoached.filter(g => g !== 'MALE');
                      setRecruiterData({ ...recruiterData, genderCoached: newGenders });
                    }}
                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">♂ {t('playerProfile.men') || 'Männer'}</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={recruiterData.genderCoached.includes('FEMALE')}
                    onChange={(e) => {
                      const newGenders = e.target.checked
                        ? [...recruiterData.genderCoached, 'FEMALE']
                        : recruiterData.genderCoached.filter(g => g !== 'FEMALE');
                      setRecruiterData({ ...recruiterData, genderCoached: newGenders });
                    }}
                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">♀ {t('playerProfile.women') || 'Frauen'}</span>
                </label>
              </div>
            </div>

            {/* Positions Looking For */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('recruiterProfile.positionsLookingFor') || 'Gesuchte Positionen'}
              </label>
              <div className="flex flex-wrap gap-2">
                {positions.map((pos) => (
                  <button
                    key={pos.value}
                    type="button"
                    onClick={() => {
                      const newPositions = recruiterData.positionsLookingFor.includes(pos.value)
                        ? recruiterData.positionsLookingFor.filter(p => p !== pos.value)
                        : [...recruiterData.positionsLookingFor, pos.value];
                      setRecruiterData({ ...recruiterData, positionsLookingFor: newPositions });
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold transition ${
                      recruiterData.positionsLookingFor.includes(pos.value)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Looking for Members */}
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={recruiterData.lookingForMembers}
                  onChange={(e) => setRecruiterData({ ...recruiterData, lookingForMembers: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('recruiterProfile.lookingForMembers') || 'Sucht Spieler'}
                </span>
              </label>
            </div>

            {/* Organization */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('recruiterProfile.organization') || 'Club Affiliation'}
              </label>
              <input
                type="text"
                value={recruiterData.organization}
                onChange={(e) => setRecruiterData({ ...recruiterData, organization: e.target.value })}
                placeholder={t('recruiterProfile.organizationPlaceholder') || 'z.B. Swiss Volley, Verband, etc.'}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Bio */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('recruiterProfile.bio') || 'Bio'}
              </label>
              <textarea
                value={recruiterData.bio}
                onChange={(e) => setRecruiterData({ ...recruiterData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Social Media */}
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                {t('recruiterProfile.socialMedia') || 'Social Media'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('socialMedia.instagram') || 'Instagram'}
                  </label>
                  <input
                    type="text"
                    value={recruiterData.instagram}
                    onChange={(e) => setRecruiterData({ ...recruiterData, instagram: e.target.value })}
                    placeholder={t('socialMedia.usernamePlaceholder') || '@username'}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('socialMedia.tiktok') || 'TikTok'}
                  </label>
                  <input
                    type="text"
                    value={recruiterData.tiktok}
                    onChange={(e) => setRecruiterData({ ...recruiterData, tiktok: e.target.value })}
                    placeholder={t('socialMedia.usernamePlaceholder') || '@username'}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('socialMedia.youtube') || 'YouTube'}
                  </label>
                  <input
                    type="text"
                    value={recruiterData.youtube}
                    onChange={(e) => setRecruiterData({ ...recruiterData, youtube: e.target.value })}
                    placeholder={t('socialMedia.channelUrlPlaceholder') || 'Channel URL'}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('socialMedia.facebook') || 'Facebook'}
                  </label>
                  <input
                    type="text"
                    value={recruiterData.facebook}
                    onChange={(e) => setRecruiterData({ ...recruiterData, facebook: e.target.value })}
                    placeholder={t('socialMedia.profileUrlPlaceholder') || 'Profile URL'}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Recruiter Achievements */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  {t('recruiterProfile.achievements') || 'Erfolge'}
                </label>
                <button
                  type="button"
                  onClick={addRecruiterAchievement}
                  className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  {t('common.add') || 'Hinzufügen'}
                </button>
              </div>
              {recruiterAchievements.map((ach, idx) => (
                <div key={ach.id} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={ach.text}
                    onChange={(e) => {
                      const newAchievements = [...recruiterAchievements];
                      newAchievements[idx].text = e.target.value;
                      setRecruiterAchievements(newAchievements);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    placeholder={t('recruiterProfile.achievementPlaceholder') || 'z.B. Aufstieg in NLA 2023'}
                  />
                  <button
                    type="button"
                    onClick={() => setRecruiterAchievements(recruiterAchievements.filter((_, i) => i !== idx))}
                    className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Link
            href={`/hybrids/${params.id}`}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            {t('common.cancel') || 'Abbrechen'}
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {t('common.save') || 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  );
}
