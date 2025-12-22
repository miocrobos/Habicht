'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function HybridRegisterPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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
    clubName: string;
    league: string;
    startYear: string;
    endYear: string;
    position: string;
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

  const positionOptions = ['Setter', 'Outside Hitter', 'Middle Blocker', 'Opposite', 'Libero'];
  const genderOptions = ['Male', 'Female'];
  const coachRoleOptions = ['Head Coach', 'Assistant Coach', 'Technical Coach', 'Physical Coach', 'Scout', 'Trainer'];
  const employmentOptions = ['Employed', 'Self-Employed', 'Student', 'Unemployed', 'Retired'];
  const cantonOptions = [
    { code: 'ZH', name: 'Zürich' },
    { code: 'BE', name: 'Bern' },
    { code: 'LU', name: 'Luzern' },
    { code: 'UR', name: 'Uri' },
    { code: 'SZ', name: 'Schwyz' },
    { code: 'OW', name: 'Obwalden' },
    { code: 'NW', name: 'Nidwalden' },
    { code: 'GL', name: 'Glarus' },
    { code: 'ZG', name: 'Zug' },
    { code: 'FR', name: 'Fribourg' },
    { code: 'SO', name: 'Solothurn' },
    { code: 'BS', name: 'Basel-Stadt' },
    { code: 'BL', name: 'Basel-Landschaft' },
    { code: 'SH', name: 'Schaffhausen' },
    { code: 'AR', name: 'Appenzell Ausserrhoden' },
    { code: 'AI', name: 'Appenzell Innerrhoden' },
    { code: 'SG', name: 'St. Gallen' },
    { code: 'GR', name: 'Graubünden' },
    { code: 'AG', name: 'Aargau' },
    { code: 'TG', name: 'Thurgau' },
    { code: 'TI', name: 'Ticino' },
    { code: 'VD', name: 'Vaud' },
    { code: 'VS', name: 'Valais' },
    { code: 'NE', name: 'Neuchâtel' },
    { code: 'GE', name: 'Geneva' },
    { code: 'JU', name: 'Jura' }
  ];

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
    setClubHistory([...clubHistory, { clubName: '', league: '', startYear: '', endYear: '', position: '' }]);
  };

  const removeClubHistory = (index: number) => {
    setClubHistory(clubHistory.filter((_, i) => i !== index));
  };

  const updateClubHistory = (index: number, field: string, value: string) => {
    const updated = [...clubHistory];
    updated[index] = { ...updated[index], [field]: value };
    setClubHistory(updated);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError(t('register.passwordsDoNotMatch'));
      return;
    }

    if (!agreedToTerms) {
      setError(t('register.agreeToTerms'));
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
            {t('register.hybridTitle') || 'Hybrid Registration'}
          </h2>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            {t('register.hybridSubtitle') || 'Create both player and recruiter profiles'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* SECTION 1: Account Information */}
            <div className="space-y-4 border-b border-gray-200 dark:border-gray-700 pb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('register.accountInfo') || '1. Account Information'}
              </h3>
              
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder={t('register.email') || 'Email'}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  required
                />
                
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="password"
                    placeholder={t('register.password') || 'Password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                    required
                  />
                  
                  <input
                    type="password"
                    placeholder={t('register.confirmPassword') || 'Confirm Password'}
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
                {t('register.personalInfo') || '2. Personal Information'}
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder={t('register.firstName') || 'First Name'}
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  required
                />
                
                <input
                  type="text"
                  placeholder={t('register.lastName') || 'Last Name'}
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="date"
                  placeholder={t('register.dateOfBirth') || 'Date of Birth'}
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
                  <option value="">{t('register.selectGender') || 'Select Gender'}</option>
                  {genderOptions.map(g => (
                    <option key={g} value={g}>{t(`register.${g.toLowerCase()}`) || g}</option>
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
                  <option value="">{t('register.selectCanton') || 'Select Canton'}</option>
                  {cantonOptions.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder={t('register.municipality') || 'Municipality/City'}
                  value={formData.municipality}
                  onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  required
                />

                <input
                  type="tel"
                  placeholder={t('register.phone') || 'Phone Number'}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>

              <textarea
                placeholder={t('register.bio') || 'Bio / About Me'}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* SECTION 3: Player Information */}
            <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('register.playerInfo') || '3. Player Information'}
              </h3>

              {/* Positions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('register.positions') || 'Positions'}
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
                      {t(`positions.${pos.toLowerCase().replace(' ', '')}`) || pos}
                    </button>
                  ))}
                </div>
              </div>

              {/* Physical Stats */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('register.physicalStats') || 'Physical Statistics'}
                </label>
                <div className="grid md:grid-cols-4 gap-4">
                  <input
                    type="number"
                    placeholder={t('register.height') || 'Height (cm)'}
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder={t('register.weight') || 'Weight (kg)'}
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder={t('register.spikeHeight') || 'Spike Height (cm)'}
                    value={formData.spikeHeight}
                    onChange={(e) => setFormData({ ...formData, spikeHeight: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder={t('register.blockHeight') || 'Block Height (cm)'}
                    value={formData.blockHeight}
                    onChange={(e) => setFormData({ ...formData, blockHeight: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t('register.skills') || 'Skills (0-5)'}
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { key: 'skillReceiving', label: t('register.receiving') || 'Receiving' },
                    { key: 'skillServing', label: t('register.serving') || 'Serving' },
                    { key: 'skillAttacking', label: t('register.attacking') || 'Attacking' },
                    { key: 'skillBlocking', label: t('register.blocking') || 'Blocking' },
                    { key: 'skillDefense', label: t('register.defense') || 'Defense' },
                    { key: 'skillSetting', label: t('register.setting') || 'Setting' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</label>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        value={formData[key as keyof typeof formData] as number}
                        onChange={(e) => setFormData({ ...formData, [key]: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <div className="text-center text-sm font-medium text-gray-900 dark:text-white">
                        {formData[key as keyof typeof formData]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Club History */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('register.clubHistory') || 'Club History'}
                  </label>
                  <button
                    type="button"
                    onClick={addClubHistory}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    + {t('register.addClub') || 'Add Club'}
                  </button>
                </div>
                {clubHistory.map((club, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-3">
                    <div className="grid md:grid-cols-5 gap-3">
                      <input
                        type="text"
                        placeholder={t('register.clubName') || 'Club Name'}
                        value={club.clubName}
                        onChange={(e) => updateClubHistory(index, 'clubName', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder={t('register.league') || 'League'}
                        value={club.league}
                        onChange={(e) => updateClubHistory(index, 'league', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder={t('register.position') || 'Position'}
                        value={club.position}
                        onChange={(e) => updateClubHistory(index, 'position', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder={t('register.startYear') || 'Start Year'}
                        value={club.startYear}
                        onChange={(e) => updateClubHistory(index, 'startYear', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder={t('register.endYear') || 'End Year'}
                        value={club.endYear}
                        onChange={(e) => updateClubHistory(index, 'endYear', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeClubHistory(index)}
                      className="mt-2 text-sm text-red-600 hover:text-red-700"
                    >
                      {t('register.remove') || 'Remove'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Player Achievements */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('register.achievements') || 'Achievements'}
                  </label>
                  <button
                    type="button"
                    onClick={addPlayerAchievement}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    + {t('register.addAchievement') || 'Add Achievement'}
                  </button>
                </div>
                {playerAchievements.map((achievement, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-3">
                    <div className="grid md:grid-cols-2 gap-3 mb-2">
                      <input
                        type="text"
                        placeholder={t('register.achievementTitle') || 'Title'}
                        value={achievement.title}
                        onChange={(e) => updatePlayerAchievement(index, 'title', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder={t('register.year') || 'Year'}
                        value={achievement.year}
                        onChange={(e) => updatePlayerAchievement(index, 'year', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <textarea
                      placeholder={t('register.description') || 'Description'}
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
                      {t('register.remove') || 'Remove'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Social Media */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('register.socialMedia') || 'Social Media & Videos'}
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="url"
                    placeholder={t('register.instagram') || 'Instagram URL'}
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="url"
                    placeholder={t('register.tiktok') || 'TikTok URL'}
                    value={formData.tiktok}
                    onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="url"
                    placeholder={t('register.youtube') || 'YouTube URL'}
                    value={formData.youtube}
                    onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="url"
                    placeholder={t('register.highlightVideo') || 'Highlight Video URL'}
                    value={formData.highlightVideo}
                    onChange={(e) => setFormData({ ...formData, highlightVideo: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Professional/Academic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('register.professionalInfo') || 'Professional & Academic Information'}
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                  <select
                    value={formData.employmentStatus}
                    onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">{t('register.selectEmployment') || 'Employment Status'}</option>
                    {employmentOptions.map(emp => (
                      <option key={emp} value={emp}>{t(`register.${emp.toLowerCase()}`) || emp}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder={t('register.occupation') || 'Occupation/Field of Study'}
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder={t('register.school') || 'School/University'}
                    value={formData.schoolName}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder={t('register.swissVolleyLicense') || 'Swiss Volley License'}
                    value={formData.swissVolleyLicense}
                    onChange={(e) => setFormData({ ...formData, swissVolleyLicense: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder={t('register.ausweiss') || 'Ausweiss'}
                    value={formData.ausweiss}
                    onChange={(e) => setFormData({ ...formData, ausweiss: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
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
                  {t('register.lookingForClub') || 'I am currently looking for a club'}
                </span>
              </label>
            </div>

            {/* SECTION 4: Recruiter Information */}
            <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('register.recruiterInfo') || '4. Recruiter Information'}
              </h3>

              {/* Coach Roles */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('register.coachRole') || 'Coaching Roles'}
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
                      {t(`coachRole.${role.toLowerCase().replace(' ', '')}`) || role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Organization & License */}
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder={t('register.organization') || 'Organization/Club Name'}
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="text"
                  placeholder={t('register.coachingLicense') || 'Coaching License'}
                  value={formData.coachingLicense}
                  onChange={(e) => setFormData({ ...formData, coachingLicense: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Gender Coached */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('register.genderCoached') || 'Gender Coached'}
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
                      {t(`register.${gender.toLowerCase()}`) || gender}
                    </button>
                  ))}
                </div>
              </div>

              {/* Positions Looking For */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('register.positionsLookingFor') || 'Positions Looking For'}
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
                      {t(`positions.${pos.toLowerCase().replace(' ', '')}`) || pos}
                    </button>
                  ))}
                </div>
              </div>

              {/* Club Affiliations */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('register.clubAffiliations') || 'Club Affiliations'}
                  </label>
                  <button
                    type="button"
                    onClick={addClubAffiliation}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    + {t('register.addAffiliation') || 'Add Club'}
                  </button>
                </div>
                {clubAffiliations.map((affiliation, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-3">
                    <div className="grid md:grid-cols-4 gap-3">
                      <input
                        type="text"
                        placeholder={t('register.clubName') || 'Club Name'}
                        value={affiliation.clubName}
                        onChange={(e) => updateClubAffiliation(index, 'clubName', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder={t('register.role') || 'Role'}
                        value={affiliation.role}
                        onChange={(e) => updateClubAffiliation(index, 'role', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder={t('register.startYear') || 'Start Year'}
                        value={affiliation.startYear}
                        onChange={(e) => updateClubAffiliation(index, 'startYear', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder={t('register.endYear') || 'End Year'}
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
                      {t('register.remove') || 'Remove'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Recruiter Achievements */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('register.coachingAchievements') || 'Coaching Achievements'}
                  </label>
                  <button
                    type="button"
                    onClick={addRecruiterAchievement}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    + {t('register.addAchievement') || 'Add Achievement'}
                  </button>
                </div>
                {recruiterAchievements.map((achievement, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-3">
                    <div className="grid md:grid-cols-2 gap-3 mb-2">
                      <input
                        type="text"
                        placeholder={t('register.achievementTitle') || 'Title'}
                        value={achievement.title}
                        onChange={(e) => updateRecruiterAchievement(index, 'title', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder={t('register.year') || 'Year'}
                        value={achievement.year}
                        onChange={(e) => updateRecruiterAchievement(index, 'year', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <textarea
                      placeholder={t('register.description') || 'Description'}
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
                      {t('register.remove') || 'Remove'}
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
                  {t('register.lookingForMembers') || 'I am currently looking for team members'}
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
                {loading ? t('register.creating') || 'Creating Account...' : t('register.createHybridAccount') || 'Create Hybrid Account'}
              </button>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                {t('register.alreadyHaveAccount') || 'Already have an account?'}{' '}
                <Link href="/auth/login" className="text-red-600 hover:text-red-700 font-medium">
                  {t('register.login') || 'Log in'}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
