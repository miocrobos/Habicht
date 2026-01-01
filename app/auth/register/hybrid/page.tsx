'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import StarRating from '@/components/shared/StarRating';
import ImageUpload from '@/components/shared/ImageUpload';

export default function HybridRegisterPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [step, setStep] = useState(1); // Add step state

  // Comprehensive combined player and recruiter form data
  const [formData, setFormData] = useState({
    // Account
    email: '',
    password: '',
    confirmPassword: '',
    
    // Personal (Common)
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    nationality: 'Switzerland',
    canton: '',
    municipality: '',
    phone: '',
    bio: '',
    
    // Player - Positions & Physical Stats
    positions: [] as string[],
    dominantHand: '',
    preferredLanguage: '',
    height: '',
    weight: '',
    spikeHeight: '',
    blockHeight: '',
    
    // Player - Skills (0-5 ratings)
    skillReceiving: 0,
    skillServing: 0,
    skillAttacking: 0,
    skillBlocking: 0,
    skillDefense: 0,
    skillSetting: 0,
    
    // Player - Social Media & Videos
    instagram: '',
    tiktok: '',
    youtube: '',
    highlightVideo: '',
    
    // Player - Professional/Academic
    employmentStatus: '',
    occupation: '',
    schoolName: '',
    swissVolleyLicense: '',
    ausweiss: '',
    lookingForClub: false,
    
    // Recruiter - Coaching Info
    coachRole: [] as string[],
    organization: '',
    genderCoached: [] as string[],
    coachingLicense: '',
    
    // Recruiter - Recruitment Needs
    positionsLookingFor: [] as string[],
    lookingForMembers: false,
  });

  // Club history for player
  const [clubHistory, setClubHistory] = useState<Array<{
    id: string;
    clubName: string;
    league: string;
    startYear: string;
    endYear: string;
    position: string;
    currentClub?: boolean;
  }>>([]);

  // Player achievements
  const [playerAchievements, setPlayerAchievements] = useState<Array<{
    title: string;
    year: string;
    description: string;
  }>>([]);

  // Club affiliations for recruiter
  const [clubAffiliations, setClubAffiliations] = useState<Array<{
    clubName: string;
    role: string;
    startYear: string;
    endYear: string;
  }>>([]);

  // Recruiter achievements
  const [recruiterAchievements, setRecruiterAchievements] = useState<Array<{
    title: string;
    year: string;
    description: string;
  }>>([]);

  const positionOptions = ['SETTER', 'OUTSIDE_HITTER', 'MIDDLE_BLOCKER', 'OPPOSITE', 'LIBERO', 'UNIVERSAL'];
  const genderOptions = ['MALE', 'FEMALE'];
  const coachRoleOptions = ['HEAD_COACH', 'ASSISTANT_COACH', 'TECHNICAL_COACH', 'PHYSICAL_COACH', 'SCOUT', 'TRAINER'];
  const employmentOptions = ['EMPLOYED', 'SELF_EMPLOYED', 'STUDENT', 'UNEMPLOYED', 'RETIRED'];

  const handlePositionToggle = (position: string) => {
    setFormData(prev => ({
      ...prev,
      positions: prev.positions.includes(position)
        ? prev.positions.filter(p => p !== position)
        : [...prev.positions, position]
    }));
  };

  const handleCoachRoleToggle = (role: string) => {
    setFormData(prev => ({
      ...prev,
      coachRole: prev.coachRole.includes(role)
        ? prev.coachRole.filter(r => r !== role)
        : [...prev.coachRole, role]
    }));
  };

  const handleGenderCoachedToggle = (gender: string) => {
    setFormData(prev => ({
      ...prev,
      genderCoached: prev.genderCoached.includes(gender)
        ? prev.genderCoached.filter(g => g !== gender)
        : [...prev.genderCoached, gender]
    }));
  };

  const handlePositionsLookingForToggle = (position: string) => {
    setFormData(prev => ({
      ...prev,
      positionsLookingFor: prev.positionsLookingFor.includes(position)
        ? prev.positionsLookingFor.filter(p => p !== position)
        : [...prev.positionsLookingFor, position]
    }));
  };

  const addClubHistory = () => {
    setClubHistory([
      ...clubHistory,
      { id: Date.now().toString() + Math.random().toString(36).slice(2), clubName: '', league: '', startYear: '', endYear: '', position: '', currentClub: false }
    ]);
  };

  const removeClubHistory = (id: string) => {
    setClubHistory(clubHistory.filter((club) => club.id !== id));
  };

  const updateClubHistory = (id: string, field: string, value: string) => {
    setClubHistory(clubHistory.map(club =>
      club.id === id ? { ...club, [field]: value } : club
    ));
  };

  const addPlayerAchievement = () => {
    setPlayerAchievements([...playerAchievements, { title: '', year: '', description: '' }]);
  };

  const removePlayerAchievement = (index: number) => {
    setPlayerAchievements(playerAchievements.filter((_, i) => i !== index));
  };

  const updatePlayerAchievement = (index: number, field: string, value: string) => {
    const updated = [...playerAchievements];
    updated[index] = { ...updated[index], [field]: value };
    setPlayerAchievements(updated);
  };

  const addClubAffiliation = () => {
    setClubAffiliations([...clubAffiliations, { clubName: '', role: '', startYear: '', endYear: '' }]);
  };

  const removeClubAffiliation = (index: number) => {
    setClubAffiliations(clubAffiliations.filter((_, i) => i !== index));
  };

  const updateClubAffiliation = (index: number, field: string, value: string) => {
    const updated = [...clubAffiliations];
    updated[index] = { ...updated[index], [field]: value };
    setClubAffiliations(updated);
  };

  const addRecruiterAchievement = () => {
    setRecruiterAchievements([...recruiterAchievements, { title: '', year: '', description: '' }]);
  };

  const removeRecruiterAchievement = (index: number) => {
    setRecruiterAchievements(recruiterAchievements.filter((_, i) => i !== index));
  };

  const updateRecruiterAchievement = (index: number, field: string, value: string) => {
    const updated = [...recruiterAchievements];
    updated[index] = { ...updated[index], [field]: value };
    setRecruiterAchievements(updated);
  };

  const handleNext = () => {
    setError('');
    
    // Step 1 validation (Account + Personal Info)
    if (step === 1) {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all required fields');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError(t('register.passwordsDoNotMatch'));
        return;
      }
      if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.gender || !formData.canton) {
        setError('Please fill in all required fields');
        return;
      }
      setStep(2);
      window.scrollTo(0, 0);
      return;
    }

    // Step 2 validation (Player Info)
    if (step === 2) {
      if (formData.positions.length === 0) {
        setError(t('register.selectPositionRequired'));
        return;
      }
      if (!formData.coachingLicense) {
        setError(t('register.coachingLicenseRequired') || 'Coaching license is required');
        return;
      }
      setStep(3);
      window.scrollTo(0, 0);
      return;
    }
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreedToTerms) {
      setError(t('register.agreeToTermsRequired'));
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Create both player and recruiter profiles
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          accountType: 'hybrid',
          playerData: {
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            nationality: formData.nationality,
            canton: formData.canton,
            municipality: formData.municipality,
            phone: formData.phone,
            bio: formData.bio,
            positions: formData.positions,
            dominantHand: formData.dominantHand || null,
            preferredLanguage: formData.preferredLanguage || null,
            height: formData.height ? parseFloat(formData.height) : null,
            weight: formData.weight ? parseFloat(formData.weight) : null,
            spikeHeight: formData.spikeHeight ? parseFloat(formData.spikeHeight) : null,
            blockHeight: formData.blockHeight ? parseFloat(formData.blockHeight) : null,
            skillReceiving: formData.skillReceiving,
            skillServing: formData.skillServing,
            skillAttacking: formData.skillAttacking,
            skillBlocking: formData.skillBlocking,
            skillDefense: formData.skillDefense,
            skillSetting: formData.skillSetting,
            instagram: formData.instagram,
            tiktok: formData.tiktok,
            youtube: formData.youtube,
            highlightVideo: formData.highlightVideo,
            employmentStatus: formData.employmentStatus,
            occupation: formData.occupation,
            schoolName: formData.schoolName,
            swissVolleyLicense: formData.swissVolleyLicense,
            ausweiss: formData.ausweiss,
            lookingForClub: formData.lookingForClub,
            clubHistory: clubHistory,
            achievements: playerAchievements,
          },
          recruiterData: {
            nationality: formData.nationality,
            canton: formData.canton,
            province: formData.municipality,
            phone: formData.phone,
            preferredLanguage: formData.preferredLanguage || null,
            bio: formData.bio,
            coachRole: formData.coachRole,
            organization: formData.organization,
            genderCoached: formData.genderCoached,
            coachingLicense: formData.coachingLicense,
            positionsLookingFor: formData.positionsLookingFor,
            lookingForMembers: formData.lookingForMembers,
            clubAffiliations: clubAffiliations,
            achievements: recruiterAchievements,
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('register.errorCreatingAccount'));
      }

      // Redirect to registration success page with email sent status
      const emailSent = data.emailSent;
      router.push(`/auth/registration-success?email=${encodeURIComponent(formData.email)}&emailSent=${emailSent}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">
            {t('register.hybridTitle')}
          </h2>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            {t('register.hybridSubtitle')}
          </p>
          
          {/* Step Progress */}
          <div className="mt-6 flex justify-center items-center space-x-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              1
            </div>
            <div className={`h-1 w-16 ${step >= 2 ? 'bg-red-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              2
            </div>
            <div className={`h-1 w-16 ${step >= 3 ? 'bg-red-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              3
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="space-y-8">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* STEP 1: Account + Personal Information */}
            {step === 1 && (
              <>
            {/* SECTION 1: Account Information */}
            <div className="space-y-4 border-b border-gray-200 dark:border-gray-700 pb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('register.accountInfo')}
              </h3>
              
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder={t('register.email')}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  required
                />
                
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="password"
                    placeholder={t('register.password')}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                    required
                  />
                  
                  <input
                    type="password"
                    placeholder={t('register.confirmPassword')}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: Personal Information */}
            <div className="space-y-4 border-b border-gray-200 dark:border-gray-700 pb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('register.personalInfo')}
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder={t('register.firstName')}
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  required
                />
                
                <input
                  type="text"
                  placeholder={t('register.lastName')}
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="date"
                  placeholder={t('register.dateOfBirth')}
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  required
                />

                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">{t('register.selectGender')}</option>
                  {genderOptions.map(g => (
                    <option key={g} value={g}>{t(`register.${g.toLowerCase()}`)}</option>
                  ))}
                </select>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <select
                  value={formData.canton}
                  onChange={(e) => setFormData({ ...formData, canton: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">{t('register.selectCanton')}</option>
                  <option value="AG">{t('cantons.AG')}</option>
                  <option value="AI">{t('cantons.AI')}</option>
                  <option value="AR">{t('cantons.AR')}</option>
                  <option value="BE">{t('cantons.BE')}</option>
                  <option value="BL">{t('cantons.BL')}</option>
                  <option value="BS">{t('cantons.BS')}</option>
                  <option value="FR">{t('cantons.FR')}</option>
                  <option value="GE">{t('cantons.GE')}</option>
                  <option value="GL">{t('cantons.GL')}</option>
                  <option value="GR">{t('cantons.GR')}</option>
                  <option value="JU">{t('cantons.JU')}</option>
                  <option value="LU">{t('cantons.LU')}</option>
                  <option value="NE">{t('cantons.NE')}</option>
                  <option value="NW">{t('cantons.NW')}</option>
                  <option value="OW">{t('cantons.OW')}</option>
                  <option value="SG">{t('cantons.SG')}</option>
                  <option value="SH">{t('cantons.SH')}</option>
                  <option value="SO">{t('cantons.SO')}</option>
                  <option value="SZ">{t('cantons.SZ')}</option>
                  <option value="TG">{t('cantons.TG')}</option>
                  <option value="TI">{t('cantons.TI')}</option>
                  <option value="UR">{t('cantons.UR')}</option>
                  <option value="VD">{t('cantons.VD')}</option>
                  <option value="VS">{t('cantons.VS')}</option>
                  <option value="ZG">{t('cantons.ZG')}</option>
                  <option value="ZH">{t('cantons.ZH')}</option>
                </select>

                <input
                  type="text"
                  placeholder={t('register.municipality')}
                  value={formData.municipality}
                  onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  required
                />

                <input
                  type="tel"
                  placeholder={t('register.phone')}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>

              <textarea
                placeholder={t('register.bio')}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
              />
            </div>
            </>
            )}

            {/* STEP 2: Player Information */}
            {step === 2 && (
              <>
            {/* SECTION 3: Player Information */}
            <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('register.playerInfo')}
              </h3>

              {/* Positions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('register.positions')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {positionOptions.map(pos => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => handlePositionToggle(pos)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        formData.positions.includes(pos)
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {t(`positions.${pos.toLowerCase()}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dominant Hand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('register.dominantHand')}
                </label>
                <select
                  value={formData.dominantHand}
                  onChange={(e) => setFormData({ ...formData, dominantHand: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                >
                  <option value="">{t('register.selectDominantHand')}</option>
                  <option value="RIGHT">{t('register.rightHanded')}</option>
                  <option value="LEFT">{t('register.leftHanded')}</option>
                  <option value="AMBIDEXTROUS">{t('register.ambidextrous')}</option>
                </select>
              </div>

              {/* Preferred Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('register.preferredLanguage')}
                </label>
                <select
                  value={formData.preferredLanguage}
                  onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                >
                  <option value="">{t('register.selectPreferredLanguage')}</option>
                  <option value="gsw">{t('register.languageSwissGerman')}</option>
                  <option value="de">{t('register.languageGerman')}</option>
                  <option value="fr">{t('register.languageFrench')}</option>
                  <option value="it">{t('register.languageItalian')}</option>
                  <option value="rm">{t('register.languageRomansh')}</option>
                  <option value="en">{t('register.languageEnglish')}</option>
                </select>
              </div>

              {/* Physical Stats */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('register.physicalStats')}
                </label>
                <div className="grid md:grid-cols-4 gap-4">
                  <input
                    type="number"
                    placeholder={t('register.height')}
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder={t('register.weight')}
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder={t('register.spikeHeight')}
                    value={formData.spikeHeight}
                    onChange={(e) => setFormData({ ...formData, spikeHeight: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder={t('register.blockHeight')}
                    value={formData.blockHeight}
                    onChange={(e) => setFormData({ ...formData, blockHeight: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Club History */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('register.clubHistory')}
                  </label>
                  <button
                    type="button"
                    onClick={addClubHistory}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    + {t('register.addClub')}
                  </button>
                </div>
                {clubHistory.map((club) => (
                  <div key={club.id} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-3">
                    <div className="grid md:grid-cols-5 gap-3">
                      <input
                        type="text"
                        placeholder={t('register.clubName')}
                        value={club.clubName}
                        onChange={(e) => updateClubHistory(club.id, 'clubName', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder={t('register.league')}
                        value={club.league}
                        onChange={(e) => updateClubHistory(club.id, 'league', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder={t('register.position')}
                        value={club.position}
                        onChange={(e) => updateClubHistory(club.id, 'position', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder={t('register.startYear')}
                        value={club.startYear}
                        onChange={(e) => updateClubHistory(club.id, 'startYear', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                      />
                      {club.currentClub ? (
                        <div className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                          <span className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                            ✓ {t('register.current')}
                          </span>
                        </div>
                      ) : (
                        <input
                          type="text"
                          placeholder={t('register.endYear')}
                          value={club.endYear}
                          onChange={(e) => updateClubHistory(club.id, 'endYear', e.target.value)}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                        />
                      )}
                    </div>
                    <div className="mt-2">
                      <label className={`flex items-center space-x-2 cursor-pointer p-3 rounded-lg border-2 transition ${
                        club.currentClub 
                          ? 'bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-600 shadow-md' 
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}>
                        <input
                          type="checkbox"
                          checked={!!club.currentClub}
                          onChange={(e) => {
                            setClubHistory(prev => prev.map((c) =>
                              c.id === club.id
                                ? { ...c, currentClub: e.target.checked, endYear: e.target.checked ? '' : c.endYear }
                                : { ...c, currentClub: false }
                            ));
                          }}
                          className="w-5 h-5 rounded text-green-600 border-gray-300 focus:ring-green-500"
                        />
                        <span className={`text-sm font-medium flex items-center gap-2 ${
                          club.currentClub 
                            ? 'text-green-700 dark:text-green-300' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {t('register.currentlyPlaying')}
                        </span>
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeClubHistory(club.id)}
                      className="mt-2 text-sm text-red-600 hover:text-red-700"
                    >
                      {t('register.remove')}
                    </button>
                  </div>
                ))}
              </div>

              {/* Player Achievements */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('register.achievements')}
                  </label>
                  <button
                    type="button"
                    onClick={addPlayerAchievement}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    + {t('register.addAchievement')}
                  </button>
                </div>
                {playerAchievements.map((achievement, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-3">
                    <div className="grid md:grid-cols-2 gap-3 mb-2">
                      <input
                        type="text"
                        placeholder={t('register.achievementTitle')}
                        value={achievement.title}
                        onChange={(e) => updatePlayerAchievement(index, 'title', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder={t('register.year')}
                        value={achievement.year}
                        onChange={(e) => updatePlayerAchievement(index, 'year', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <textarea
                      placeholder={t('register.description')}
                      value={achievement.description}
                      onChange={(e) => updatePlayerAchievement(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => removePlayerAchievement(index)}
                      className="mt-2 text-sm text-red-600 hover:text-red-700"
                    >
                      {t('register.remove')}
                    </button>
                  </div>
                ))}
              </div>

              {/* Social Media */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('register.socialMedia')}
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="url"
                    placeholder={t('register.instagram')}
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="url"
                    placeholder={t('register.tiktok')}
                    value={formData.tiktok}
                    onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="url"
                    placeholder={t('register.youtube')}
                    value={formData.youtube}
                    onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="url"
                    placeholder={t('register.highlightVideo')}
                    value={formData.highlightVideo}
                    onChange={(e) => setFormData({ ...formData, highlightVideo: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Professional/Academic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('register.professionalInfo')}
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                  <select
                    value={formData.employmentStatus}
                    onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">{t('register.selectEmployment')}</option>
                    {employmentOptions.map(emp => (
                      <option key={emp} value={emp}>{t(`register.${emp.toLowerCase()}`)}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder={t('register.occupation')}
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  />
                  <select
                    value={formData.schoolName}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">{t('register.selectSchool')}</option>
                    <optgroup label={t('register.universities')}>
                      <option value="ETH Zürich">ETH Zürich</option>
                      <option value="Universität Zürich">Universität Zürich</option>
                      <option value="Universität Bern">Universität Bern</option>
                      <option value="Universität Basel">Universität Basel</option>
                      <option value="Universität St. Gallen (HSG)">Universität St. Gallen (HSG)</option>
                      <option value="Université de Lausanne">Université de Lausanne</option>
                      <option value="Université de Genève">Université de Genève</option>
                      <option value="EPFL Lausanne">EPFL Lausanne</option>
                      <option value="Universität Luzern">Universität Luzern</option>
                      <option value="Université de Fribourg">Université de Fribourg</option>
                    </optgroup>
                    <optgroup label={t('register.appliedSciences')}>
                      <option value="ZHAW Zürich">ZHAW Zürich</option>
                      <option value="FHNW">FHNW</option>
                      <option value="BFH Bern">BFH Bern</option>
                      <option value="HSLU Luzern">HSLU Luzern</option>
                      <option value="OST - Ostschweizer Fachhochschule">OST - Ostschweizer Fachhochschule</option>
                      <option value="SUPSI">SUPSI</option>
                      <option value="HES-SO">HES-SO</option>
                      <option value="ZHdK - Zürcher Hochschule der Künste">ZHdK - Zürcher Hochschule der Künste</option>
                      <option value="FH Graubünden">FH Graubünden</option>
                    </optgroup>
                    <optgroup label={t('register.cantonalSchools')}>
                      <option value="Kantonsschule Zürich Nord">Kantonsschule Zürich Nord</option>
                      <option value="Kantonsschule Enge Zürich">Kantonsschule Enge Zürich</option>
                      <option value="Kantonsschule Rämibühl Zürich">Kantonsschule Rämibühl Zürich</option>
                      <option value="Kantonsschule Wettingen">Kantonsschule Wettingen</option>
                      <option value="Kantonsschule Aarau">Kantonsschule Aarau</option>
                      <option value="Kantonsschule Baden">Kantonsschule Baden</option>
                      <option value="Kantonsschule Wohlen">Kantonsschule Wohlen</option>
                      <option value="Kantonsschule Zug">Kantonsschule Zug</option>
                      <option value="Kantonsschule Menzingen">Kantonsschule Menzingen</option>
                      <option value="Kantonsschule Alpenquai Luzern">Kantonsschule Alpenquai Luzern</option>
                      <option value="Kantonsschule Reussbühl Luzern">Kantonsschule Reussbühl Luzern</option>
                      <option value="Kantonsschule Willisau">Kantonsschule Willisau</option>
                      <option value="Kantonsschule Sursee">Kantonsschule Sursee</option>
                      <option value="Gymnasium Kirchenfeld Bern">Gymnasium Kirchenfeld Bern</option>
                      <option value="Gymnasium Neufeld Bern">Gymnasium Neufeld Bern</option>
                      <option value="Gymnasium français de Bienne">Gymnasium français de Bienne</option>
                      <option value="Kantonsschule Olten">Kantonsschule Olten</option>
                      <option value="Kantonsschule Solothurn">Kantonsschule Solothurn</option>
                      <option value="Gymnasium am Münsterplatz Basel">Gymnasium am Münsterplatz Basel</option>
                      <option value="Gymnasium Oberwil">Gymnasium Oberwil</option>
                      <option value="Gymnasium Liestal">Gymnasium Liestal</option>
                      <option value="Gymnasium Muttenz">Gymnasium Muttenz</option>
                      <option value="Kantonsschule Schaffhausen">Kantonsschule Schaffhausen</option>
                      <option value="Kantonsschule am Burggraben St. Gallen">Kantonsschule am Burggraben St. Gallen</option>
                      <option value="Kantonsschule Wattwil">Kantonsschule Wattwil</option>
                      <option value="Kollegium St. Fiden">Kollegium St. Fiden</option>
                      <option value="Kantonsschule Frauenfeld">Kantonsschule Frauenfeld</option>
                      <option value="Kantonsschule Kreuzlingen">Kantonsschule Kreuzlingen</option>
                      <option value="Kantonsschule Romanshorn">Kantonsschule Romanshorn</option>
                      <option value="Bündner Kantonsschule Chur">Bündner Kantonsschule Chur</option>
                      <option value="Evangelische Mittelschule Schiers">Evangelische Mittelschule Schiers</option>
                      <option value="Lyceum Alpinum Zuoz">Lyceum Alpinum Zuoz</option>
                      <option value="Stiftsschule Einsiedeln">Stiftsschule Einsiedeln</option>
                      <option value="Kollegium Schwyz">Kollegium Schwyz</option>
                      <option value="Kantonsschule Uri Altdorf">Kantonsschule Uri Altdorf</option>
                      <option value="Kollegium Karl Borromäus Altdorf">Kollegium Karl Borromäus Altdorf</option>
                      <option value="Collège St-Michel Fribourg">Collège St-Michel Fribourg</option>
                      <option value="Collège du Sud Bulle">Collège du Sud Bulle</option>
                      <option value="Gymnase de Bulle">Gymnase de Bulle</option>
                      <option value="Lycée Cantonal Porrentruy">Lycée Cantonal Porrentruy</option>
                      <option value="Lycée Denis-de-Rougemont Neuchâtel">Lycée Denis-de-Rougemont Neuchâtel</option>
                      <option value="Gymnase de la Cité Lausanne">Gymnase de la Cité Lausanne</option>
                      <option value="Gymnase de Beaulieu Lausanne">Gymnase de Beaulieu Lausanne</option>
                      <option value="Gymnase de Renens">Gymnase de Renens</option>
                      <option value="Gymnase de Morges">Gymnase de Morges</option>
                      <option value="Gymnase de Nyon">Gymnase de Nyon</option>
                      <option value="Collège Calvin Genève">Collège Calvin Genève</option>
                      <option value="Collège de Genève">Collège de Genève</option>
                      <option value="Collège Voltaire Genève">Collège Voltaire Genève</option>
                      <option value="Collège Rousseau Genève">Collège Rousseau Genève</option>
                      <option value="Collège Sismondi Genève">Collège Sismondi Genève</option>
                      <option value="Lycée Collège de la Planta Sion">Lycée Collège de la Planta Sion</option>
                      <option value="Liceo Cantonale Lugano">Liceo Cantonale Lugano</option>
                      <option value="Liceo Cantonale Bellinzona">Liceo Cantonale Bellinzona</option>
                      <option value="Liceo Cantonale Locarno">Liceo Cantonale Locarno</option>
                      <option value="Liceo Cantonale Mendrisio">Liceo Cantonale Mendrisio</option>
                    </optgroup>
                  </select>
                  <ImageUpload 
                    label={t('register.swissVolleyLicense')} 
                    value={formData.swissVolleyLicense}
                    onChange={(v) => setFormData({ ...formData, swissVolleyLicense: v })} 
                    aspectRatio="banner" 
                  />
                  <ImageUpload 
                    label={t('register.ausweiss')} 
                    value={formData.ausweiss}
                    onChange={(v) => setFormData({ ...formData, ausweiss: v })} 
                    aspectRatio="banner" 
                  />
                </div>
              </div>

              {/* Looking for Club */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.lookingForClub}
                  onChange={(e) => setFormData({ ...formData, lookingForClub: e.target.checked })}
                  className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t('register.lookingForClub')}
                </span>
              </label>
            </div>
            </>
            )}

            {/* STEP 3: Recruiter Information + Terms */}
            {step === 3 && (
              <>
            {/* SECTION 4: Recruiter Information */}
            <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('register.recruiterInfo')}
              </h3>

              {/* Coach Roles */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('register.coachRole')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {coachRoleOptions.map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleCoachRoleToggle(role)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        formData.coachRole.includes(role)
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {t(`coachRole.${role.toLowerCase()}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Organization & License */}
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder={t('register.organization')}
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('register.coachingLicense')} <span className="text-red-500">*</span>
                  </label>
                  <ImageUpload 
                    label="" 
                    value={formData.coachingLicense}
                    onChange={(v) => setFormData({ ...formData, coachingLicense: v })} 
                    aspectRatio="banner" 
                  />
                </div>
              </div>

              {/* Gender Coached */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('register.genderCoached')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {genderOptions.map(gender => (
                    <button
                      key={gender}
                      type="button"
                      onClick={() => handleGenderCoachedToggle(gender)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        formData.genderCoached.includes(gender)
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {t(`register.${gender.toLowerCase()}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Positions Looking For */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('register.positionsLookingFor')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {positionOptions.map(pos => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => handlePositionsLookingForToggle(pos)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        formData.positionsLookingFor.includes(pos)
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {t(`positions.${pos.toLowerCase()}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Club Affiliations */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('register.clubAffiliations')}
                  </label>
                  <button
                    type="button"
                    onClick={addClubAffiliation}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    + {t('register.addAffiliation')}
                  </button>
                </div>
                {clubAffiliations.map((affiliation, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-3">
                    <div className="grid md:grid-cols-4 gap-3">
                      <input
                        type="text"
                        placeholder={t('register.clubName')}
                        value={affiliation.clubName}
                        onChange={(e) => updateClubAffiliation(index, 'clubName', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder={t('register.role')}
                        value={affiliation.role}
                        onChange={(e) => updateClubAffiliation(index, 'role', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder={t('register.startYear')}
                        value={affiliation.startYear}
                        onChange={(e) => updateClubAffiliation(index, 'startYear', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder={t('register.endYear')}
                        value={affiliation.endYear}
                        onChange={(e) => updateClubAffiliation(index, 'endYear', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeClubAffiliation(index)}
                      className="mt-2 text-sm text-red-600 hover:text-red-700"
                    >
                      {t('register.remove')}
                    </button>
                  </div>
                ))}
              </div>

              {/* Recruiter Achievements */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('register.coachingAchievements')}
                  </label>
                  <button
                    type="button"
                    onClick={addRecruiterAchievement}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    + {t('register.addAchievement')}
                  </button>
                </div>
                {recruiterAchievements.map((achievement, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-3">
                    <div className="grid md:grid-cols-2 gap-3 mb-2">
                      <input
                        type="text"
                        placeholder={t('register.achievementTitle')}
                        value={achievement.title}
                        onChange={(e) => updateRecruiterAchievement(index, 'title', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder={t('register.year')}
                        value={achievement.year}
                        onChange={(e) => updateRecruiterAchievement(index, 'year', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <textarea
                      placeholder={t('register.description')}
                      value={achievement.description}
                      onChange={(e) => updateRecruiterAchievement(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => removeRecruiterAchievement(index)}
                      className="mt-2 text-sm text-red-600 hover:text-red-700"
                    >
                      {t('register.remove')}
                    </button>
                  </div>
                ))}
              </div>

              {/* Looking for Members */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.lookingForMembers}
                  onChange={(e) => setFormData({ ...formData, lookingForMembers: e.target.checked })}
                  className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t('register.lookingForMembers')}
                </span>
              </label>
            </div>

            {/* Terms and Submit */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t('register.agreeToTerms')}{' '}
                  <Link href="/terms" className="text-red-600 hover:text-red-700 font-medium">
                    {t('register.terms')}
                  </Link>
                  {' '}{t('register.and')}{' '}
                  <Link href="/privacy" className="text-red-600 hover:text-red-700 font-medium">
                    {t('register.privacyPolicy')}
                  </Link>
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-bold text-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('register.creating') : t('register.createHybridAccount')}
              </button>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                {t('register.alreadyHaveAccount')}{' '}
                <Link href="/auth/login" className="text-red-600 hover:text-red-700 font-medium">
                  {t('register.login')}
                </Link>
              </p>
            </div>
            </>
            )}

            {/* Navigation Buttons */}
            {step !== 3 && (
              <div className="flex justify-between pt-6">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                  >
                    {t('register.backButton')}
                  </button>
                )}
                <button
                  type="submit"
                  className="ml-auto px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl"
                >
                  {t('register.continueButton')}
                </button>
              </div>
            )}

            {step === 3 && step > 1 && (
              <div className="pt-6">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  {t('register.backButton')}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
