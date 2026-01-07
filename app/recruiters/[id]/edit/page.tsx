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
import { toast } from 'react-hot-toast';

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
  const [activeSection, setActiveSection] = useState<'personal' | 'professional' | 'social'>('personal');

  // Translated positions
  const positions = [
    { value: 'SETTER', label: t('positions.setter') },
    { value: 'OUTSIDE_HITTER', label: t('positions.outsideHitter') },
    { value: 'MIDDLE_BLOCKER', label: t('positions.middleBlocker') },
    { value: 'OPPOSITE', label: t('positions.opposite') },
    { value: 'LIBERO', label: t('positions.libero') },
    { value: 'UNIVERSAL', label: t('positions.universal') },
  ];

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
      toast.success(t('playerProfile.profileUpdated') || 'Profil aktualisiert!');
      
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
      toast.error(err.response?.data?.error || 'Fehler bim Speichere');
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
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-3 sm:py-6 md:py-12 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Mobile-Optimized Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <Link
            href={userRole === 'HYBRID' && userId ? `/hybrids/${userId}` : `/recruiters/${params.id}`}
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
          {t('recruiterProfile.editProfile') || 'Profil Bearbeiten'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 text-xs sm:text-sm">
          {t('recruiterProfile.updateInfo') || 'Aktualisiere deine Informationen'}
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

        {/* Mobile-Optimized Section Tabs */}
        <div className="mb-4 sm:mb-6 grid grid-cols-3 gap-1.5 sm:gap-2 bg-white dark:bg-gray-800 rounded-xl p-1.5 shadow-lg">
          <button
            onClick={() => setActiveSection('personal')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-lg font-semibold transition text-[10px] xs:text-xs sm:text-sm ${
              activeSection === 'personal'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="leading-tight">{t('recruiterProfile.personal') || 'Persönlich'}</span>
          </button>
          <button
            onClick={() => setActiveSection('professional')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-lg font-semibold transition text-[10px] xs:text-xs sm:text-sm ${
              activeSection === 'professional'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="leading-tight">{t('recruiterProfile.professional') || 'Beruflich'}</span>
          </button>
          <button
            onClick={() => setActiveSection('social')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-lg font-semibold transition text-[10px] xs:text-xs sm:text-sm ${
              activeSection === 'social'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="leading-tight">{t('recruiterProfile.social') || 'Erfolge'}</span>
          </button>
        </div>

        {/* Personal Section - Mobile Optimized */}
        {activeSection === 'personal' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              {t('recruiterProfile.personalInfo') || 'Persönliche Informationen'}
            </h2>

            {/* Profile Image - Mobile Centered */}
            <div className="mb-6">
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 ring-4 ring-gray-100 dark:ring-gray-600">
                  {formData.profileImage ? (
                    <img src={formData.profileImage} alt="Profil" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <User className="w-10 h-10 sm:w-16 sm:h-16" />
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
                  {t('playerProfile.nationality') || 'Nationalität'}
                </label>
                <CountrySelect
                  value={formData.nationality}
                  onChange={(v) => setFormData({ ...formData, nationality: v })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('recruiterProfile.age') || 'Alter'}
                </label>
                <input
                  type="number"
                  min="18"
                  max="100"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="z.B. 35"
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

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('register.canton') || 'Kanton'}
                </label>
                <select
                  value={formData.canton}
                  onChange={(e) => setFormData({ ...formData, canton: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">{t('common.select') || 'Wählen'}</option>
                  {cantons.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('register.municipality') || 'Ort'}
                </label>
                <input
                  type="text"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('register.preferredLanguage') || 'Sprache'}
                </label>
                <select
                  value={formData.preferredLanguage}
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

            <div className="mt-4">
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
        )}

        {/* Professional Section - Mobile Optimized */}
        {activeSection === 'professional' && (
          <div className="space-y-4">
            {/* Organization & Role */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                {t('recruiterProfile.organization') || 'Organisation'}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('recruiterProfile.organization') || 'Club'}
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="z.B. Volley Amriswil"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('recruiterProfile.role') || 'Rolle'}
                  </label>
                  <select
                    value={formData.coachRole}
                    onChange={(e) => setFormData({ ...formData, coachRole: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">{t('common.select') || 'Wählen'}</option>
                    <option value="HEAD_COACH">{t('coachRole.head_coach') || 'Head Coach'}</option>
                    <option value="ASSISTANT_COACH">{t('coachRole.assistant_coach') || 'Assistent'}</option>
                    <option value="TECHNICAL_COACH">{t('coachRole.technical_coach') || 'Technik Coach'}</option>
                    <option value="PHYSICAL_COACH">{t('coachRole.physical_coach') || 'Fitness Coach'}</option>
                    <option value="SCOUT">{t('coachRole.scout') || 'Scout'}</option>
                    <option value="TRAINER">{t('coachRole.trainer') || 'Trainer'}</option>
                    <option value="TEAM_MANAGER">{t('coachRole.team_manager') || 'Manager'}</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('recruiterProfile.coachingLicense') || 'Lizenz'}
                  </label>
                  <ImageUpload
                    label=""
                    value={formData.coachingLicense}
                    onChange={(base64) => setFormData({ ...formData, coachingLicense: base64 })}
                    allowPdf={true}
                    helpText={t('recruiterProfile.uploadLicense') || 'Coaching-Lizenz hochladen (Bild/PDF)'}
                  />
                </div>
              </div>
            </div>

            {/* Looking For */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                {t('recruiterProfile.lookingFor') || 'Suche'}
              </h2>

              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={formData.lookingForMembers}
                    onChange={(e) => setFormData({ ...formData, lookingForMembers: e.target.checked })}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('recruiterProfile.activelyLooking') || 'Aktiv auf Spielersuche'}
                  </span>
                </label>
              </div>

              <div className="mb-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('recruiterProfile.genderLookingFor') || 'Geschlecht'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {['MALE', 'FEMALE'].map((gender) => (
                    <label key={gender} className="flex items-center gap-2 cursor-pointer bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                      <input
                        type="checkbox"
                        checked={formData.genderCoached.includes(gender)}
                        onChange={() => toggleGender(gender)}
                        className="rounded text-red-600 focus:ring-red-500"
                      />
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                        {gender === 'MALE' ? (t('playerProfile.men') || 'Männlich') : (t('playerProfile.women') || 'Weiblich')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('recruiterProfile.positionsLookingFor') || 'Positionen'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {positions.map((pos) => (
                    <label key={pos.value} className="flex items-center gap-1.5 cursor-pointer bg-gray-50 dark:bg-gray-700/50 px-2.5 py-2 rounded-lg text-xs sm:text-sm">
                      <input
                        type="checkbox"
                        checked={formData.positionsLookingFor.includes(pos.value)}
                        onChange={() => togglePosition(pos.value)}
                        className="rounded text-red-600 focus:ring-red-500 flex-shrink-0"
                      />
                      <span className="text-gray-700 dark:text-gray-300 truncate">{pos.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Club History - Mobile Optimized */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                {t('recruiterProfile.clubHistory') || 'Club-Geschichte'}
              </h2>

              {clubHistory.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 italic mb-4 text-xs sm:text-sm text-center py-4">
                  {t('recruiterProfile.noClubHistory') || 'Noch keine Clubs hinzugefügt'}
                </p>
              ) : (
                <div className="space-y-3 sm:space-y-4 mb-4">
                  {clubHistory.map((club, index) => (
                    <div key={club.id} className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                          Club {index + 1}
                        </h3>
                        <button
                          onClick={() => setClubHistory(clubHistory.filter((_, i) => i !== index))}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
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
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="z.B. Volley Amriswil"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Von
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
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="2020"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Bis
                          </label>
                          {club.currentClub ? (
                            <div className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                              <span className="text-green-600 dark:text-green-400 font-semibold text-xs">✓ Aktuell</span>
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
                              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="2023"
                            />
                          )}
                        </div>

                        <div className="sm:col-span-2">
                          <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg border-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
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
                              className="rounded text-red-600 focus:ring-red-500"
                            />
                            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                              Aktueller Club
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleAddClub}
                className="w-full sm:w-auto flex items-center justify-center gap-2 text-red-600 hover:text-red-700 font-medium bg-red-50 dark:bg-red-900/20 px-4 py-2.5 rounded-lg transition text-sm"
              >
                <Plus className="w-4 h-4" />
                Club Hinzufügen
              </button>
            </div>
          </div>
        )}

        {/* Social & Achievements Section - Mobile Optimized */}
        {activeSection === 'social' && (
          <div className="space-y-4">
            {/* Achievements */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                {t('recruiterProfile.achievements') || 'Erfolge'}
              </h2>

              {achievements.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 italic mb-4 text-xs sm:text-sm text-center py-4">
                  Noch keine Erfolge hinzugefügt
                </p>
              ) : (
                <div className="space-y-2.5 mb-4">
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
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="z.B. J+S Leiter, 10 Jahre Erfahrung"
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
                className="w-full sm:w-auto flex items-center justify-center gap-2 text-red-600 hover:text-red-700 font-medium bg-red-50 dark:bg-red-900/20 px-4 py-2.5 rounded-lg transition text-sm"
              >
                <Plus className="w-4 h-4" />
                Erfolg Hinzufügen
              </button>
            </div>

            {/* Social Media */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4">
                Social Media
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
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="@username"
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
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="@username"
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
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://youtube.com/..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Facebook
                  </label>
                  <input
                    type="text"
                    value={formData.facebook}
                    onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://facebook.com/..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

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
                Speichere...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Änderungen Speichern
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
