'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Mail, Lock, User, Calendar, Globe, MapPin, Briefcase, Eye, EyeOff, Upload, Plus, X } from 'lucide-react';
import ImageUpload from '@/components/shared/ImageUpload';
import { useLanguage } from '@/contexts/LanguageContext';
import StepIndicator from '@/components/shared/StepIndicator';

const NATIONALITIES = [
  "Afghanistan", "Albanie", "Algerie", "Andorra", "Angola", "Argentinie", "Armenie", "Australie", "Östriich",
  "Aserbaidschan", "Bahamas", "Bahrain", "Bangladesch", "Barbados", "Wiissrussland", "Belgie", "Belize", "Benin",
  "Bolivie", "Bosnie Und Herzegowina", "Botswana", "Brasilie", "Brunei", "Bulgarie", "Burundi", "Kambodscha", "Kamerun",
  "Kanada", "Kap Verde", "Chile", "China", "Kolumbie", "Kongo", "Costa Rica",
  "Kroatie", "Kuba", "Zypern", "Tschechie", "Dänemark", "Dominikanischi Republik", "Ecuador",
  "Ägypte", "El Salvador", "Estland", "Äthiopie", "Finnland", "Frankriich",
  "Georgie", "Dütschland", "Ghana", "Griecheland", "Guatemala", "Haiti", "Honduras", "Ungarn", "Island", "Indie", "Indonesie", "Iran", "Irak", "Irland", "Israel",
  "Italie", "Jamaika", "Japan", "Jordanie", "Kasachstan", "Kenia", "Nordkorea", "Südkorea",
  "Kosovo", "Kuwait", "Lettland", "Libanon", "Libye", "Liechtestei",
  "Litaue", "Luxemburg", "Mazedonie", "Madagaskar", "Malaysia", "Maledive", "Mali", "Malta",
  "Mexiko", "Moldau", "Monaco", "Mongolei", "Montenegro", "Marokko", "Mosambik",
  "Myanmar", "Namibia", "Nepal", "Holländer", "Neuseeland", "Nicaragua", "Niger", "Nigeria", "Norwege",
  "Oman", "Pakistan", "Palästina", "Panama", "Paraguay", "Peru", "Philippine", "Pole",
  "Portugal", "Katar", "Rumänie", "Russland", "Ruanda", "Samoa", "San Marino",
  "Saudi-Arabie", "Senegal", "Serbie", "Sierra Leone", "Singapur", "Slowakei", "Slowenie",
  "Somalia", "Südafrika", "Südsudan", "Spanie", "Sri Lanka", "Sudan", "Suriname", "Schwede", "Schwiiz",
  "Syrie", "Taiwan", "Tadschikistan", "Tansania", "Thailand", "Togo", "Trinidad Und Tobago", "Tunesie", "Türkei",
  "Turkmenistan", "Uganda", "Ukraine", "Vereinigti Arabischi Emirate", "Grossbritannie", "USA", "Uruguay", "Usbekistan",
  "Venezuela", "Vietnam", "Jeme", "Sambia", "Simbabwe"
];

const COACH_ROLES = [
  "HEAD_COACH",
  "ASSISTANT_COACH",
  "YOUTH_COACH",
  "SCOUT",
  "FITNESS_COACH",
  "VIDEO_ANALYST",
  "TEAM_MANAGER"
];

// Map role enum to translation key
const getRoleLabel = (role: string, t: any): string => {
  const mapping: { [key: string]: string } = {
    "HEAD_COACH": t('register.headCoach'),
    "ASSISTANT_COACH": t('register.assistantCoach'),
    "YOUTH_COACH": t('register.youthCoach'),
    "SCOUT": t('register.scout'),
    "FITNESS_COACH": t('register.fitnessCoach'),
    "VIDEO_ANALYST": t('register.videoAnalyst'),
    "TEAM_MANAGER": t('register.teamManager')
  };
  return mapping[role] || role;
};

interface ClubAffiliation {
  id: string;
  clubName: string;
  logo: string;
  role: string[];  // Changed to array to support multiple roles
  genderCoached: string;
  yearFrom: string;
  yearTo: string;
  currentClub: boolean;
}

export default function RecruiterRegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    canton: '',
    province: '',
    clubName: '',
    coachRole: [] as string[],  // Changed to array to support multiple roles
    genderCoached: [] as string[],
    phone: '',
    preferredLanguage: '',
    bio: '',
    coachingLicense: '',
    ausweiss: '',
    facebook: '',
    instagram: '',
    tiktok: '',
    youtube: ''
  });
  const [clubHistory, setClubHistory] = useState<ClubAffiliation[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [newAchievement, setNewAchievement] = useState('');
  const [clubs, setClubs] = useState<any[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch clubs on mount
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await axios.get('/api/clubs');
        // Handle both array and object responses
        const clubsData = Array.isArray(res.data) ? res.data : (res.data.clubs || []);
        setClubs(clubsData);
      } catch (err) {
        console.error('Error fetching clubs:', err);
        setClubs([]); // Set empty array on error
      }
    };
    fetchClubs();
  }, []);

  const validatePassword = (p: string) => {
    if (p.length < 8) return { valid: false, message: t('register.passwordMin8') };
    if (!/\d/.test(p)) return { valid: false, message: t('register.passwordNeedsNumber') };
    if (!/[!@#$%^&*()]/.test(p)) return { valid: false, message: t('register.passwordNeedsSymbol') };
    return { valid: true, message: '' };
  };

  const addClubAffiliation = () => {
    setClubHistory([...clubHistory, {
      id: Date.now().toString(),
      clubName: '',
      logo: '',
      role: [],  // Initialize as empty array
      genderCoached: '',
      yearFrom: '',
      yearTo: '',
      currentClub: false
    }]);
  };

  const removeClubAffiliation = (id: string) => {
    setClubHistory(clubHistory.filter(club => club.id !== id));
  };

  const updateClubAffiliation = (id: string, field: keyof ClubAffiliation, value: any) => {
    setClubHistory(clubHistory.map(club => 
      club.id === id ? { ...club, [field]: value } : club
    ));
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setAchievements([...achievements, newAchievement.trim()]);
      setNewAchievement('');
    }
  };

  const removeAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (step === 1) {
      if (formData.password !== formData.confirmPassword) { 
        setError(t('register.passwordsNotMatch')); 
        return; 
      }
      const check = validatePassword(formData.password);
      if (!check.valid) { 
        setError(check.message); 
        return; 
      }
      setStep(2);
      return;
    }
    
    if (step === 2) {
      if (!formData.dateOfBirth) { 
        setError(t('register.enterDateOfBirth')); 
        return; 
      }
      const age = Math.floor((new Date().getTime() - new Date(formData.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 18) { 
        setError(t('register.mustBe18')); 
        return; 
      }
      if (!formData.nationality) { setError(t('register.selectNationality')); return; }
      if (!formData.canton) { setError(t('register.selectCantonRequired')); return; }
      if (!formData.clubName) { setError(t('register.selectOrganization')); return; }
      if (formData.coachRole.length === 0) { setError(t('register.selectRoleRequired')); return; }
      if (formData.genderCoached.length === 0) { setError(t('register.selectGenderCoachedRequired')); return; }
      setStep(3);
      return;
    }

    // Step 3 - Final submission - Check terms before submitting
    if (!agreedToTerms) {
      setError(t('register.agreeToTermsRequired'));
      return;
    }
    
    setLoading(true);
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      
      // Find the selected club
      const selectedClub = clubs.find(c => c.name === formData.clubName);
      
      const age = Math.floor((new Date().getTime() - new Date(formData.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      
      const response = await axios.post('/api/auth/register', {
        email: formData.email,
        password: formData.password,
        name: fullName,
        role: 'RECRUITER',
        recruiterData: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          age: age,
          dateOfBirth: formData.dateOfBirth,
          nationality: formData.nationality,
          canton: formData.canton,
          province: formData.province || null,
          clubId: selectedClub?.id,
          coachRole: formData.coachRole,
          genderCoached: formData.genderCoached,
          phone: formData.phone || null,
          preferredLanguage: formData.preferredLanguage || null,
          bio: formData.bio || null,
          coachingLicense: formData.coachingLicense || null,
          ausweiss: formData.ausweiss || null,
          facebook: formData.facebook || null,
          instagram: formData.instagram || null,
          tiktok: formData.tiktok || null,
          youtube: formData.youtube || null,
          clubHistory: clubHistory,
          achievements: achievements,
          organization: formData.clubName,
          position: formData.coachRole
        }
      });
      
      // Redirect to verification pending page
      const emailSent = response.data.emailSent;
      router.push(`/auth/registration-success?email=${encodeURIComponent(formData.email)}&emailSent=${emailSent}`);
    } catch (err: any) {
      setError(err.response?.data?.error || t('playerProfile.errorRegistration'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('register.recruiterTitle')}</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{t('register.recruiterSubtitle')}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <StepIndicator step={step} total={3} color="blue" />

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                <p className="text-sm text-red-800 dark:text-red-200 font-medium">{error}</p>
              </div>
            )}

            {/* STEP 1: Account Information */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t('register.accountInfo')}</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('register.firstName')} *</label>
                    <input name="firstName" required value={formData.firstName} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('register.lastName')} *</label>
                    <input name="lastName" required value={formData.lastName} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Mail className="w-4 h-4 inline mr-1" />{t('register.email')} *
                  </label>
                  <input name="email" type="email" required value={formData.email} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Lock className="w-4 h-4 inline mr-1" />{t('register.password')} (8+ {t('register.required')}) *
                  </label>
                  <div className="relative">
                    <input 
                      name="password" 
                      type={showPassword ? "text" : "password"} 
                      required 
                      value={formData.password} 
                      onChange={handleChange}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('register.confirmPassword')} *</label>
                  <div className="relative">
                    <input 
                      name="confirmPassword" 
                      type={showConfirmPassword ? "text" : "password"} 
                      required 
                      value={formData.confirmPassword} 
                      onChange={handleChange}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                  {t('register.continueButton')}
                </button>
              </div>
            )}

            {/* STEP 2: Personal & Professional Information */}
            {step === 2 && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t('register.personalInfo')} & {t('register.professionalInfo')}</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Calendar className="w-4 h-4 inline mr-1" />{t('register.dateOfBirth')} *
                  </label>
                  <input 
                    name="dateOfBirth" 
                    type="date" 
                    required 
                    value={formData.dateOfBirth} 
                    onChange={handleChange}
                    lang="de-CH"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" 
                    placeholder={t('placeholders.dateFormat')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Globe className="w-4 h-4 inline mr-1" />{t('register.nationality')} *
                  </label>
                  <select name="nationality" required value={formData.nationality} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white">
                    <option value="">{t('register.selectNationality')}</option>
                    {NATIONALITIES.map(nat => <option key={nat} value={nat}>{nat}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <MapPin className="w-4 h-4 inline mr-1" />{t('register.canton')} *
                  </label>
                  <select name="canton" required value={formData.canton} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white">
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <MapPin className="w-4 h-4 inline mr-1" />{t('register.municipality')}
                  </label>
                  <input 
                    name="province" 
                    value={formData.province} 
                    onChange={handleChange}
                    placeholder={t('register.cityPlaceholder')}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" 
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('register.optional')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Briefcase className="w-4 h-4 inline mr-1" />{t('register.organization')} *
                  </label>
                  <select name="clubName" required value={formData.clubName} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white">
                    <option value="">{t('register.selectPlaceholder')}</option>
                    {clubs.map(club => <option key={club.id} value={club.name}>{club.name} ({club.canton})</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('register.coachRole')} * ({t('register.selectAll')})
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {COACH_ROLES.map(roleOption => (
                      <label key={roleOption} className="flex items-center space-x-2 cursor-pointer p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                        <input
                          type="checkbox"
                          checked={formData.coachRole.includes(roleOption)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, coachRole: [...formData.coachRole, roleOption] });
                            } else {
                              setFormData({ ...formData, coachRole: formData.coachRole.filter(r => r !== roleOption) });
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-900 dark:text-white">{getRoleLabel(roleOption, t)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('register.genderCoached')} * ({t('register.selectAll')})</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                      <input
                        type="checkbox"
                        checked={formData.genderCoached.includes('MALE')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, genderCoached: [...formData.genderCoached, 'MALE'] });
                          } else {
                            setFormData({ ...formData, genderCoached: formData.genderCoached.filter(g => g !== 'MALE') });
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-900 dark:text-white">♂ {t('register.male')}</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                      <input
                        type="checkbox"
                        checked={formData.genderCoached.includes('FEMALE')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, genderCoached: [...formData.genderCoached, 'FEMALE'] });
                          } else {
                            setFormData({ ...formData, genderCoached: formData.genderCoached.filter(g => g !== 'FEMALE') });
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-900 dark:text-white">♀ {t('register.female')}</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setStep(1)}
                    className="w-1/3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                    {t('register.backButton')}
                  </button>
                  <button type="submit" disabled={loading}
                    className="w-2/3 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                    {t('register.continueButton')}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Additional Information & Club History */}
            {step === 3 && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t('register.recruiterInfo')}</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('register.phoneNumber')} ({t('register.optional')})</label>
                  <input 
                    name="phone" 
                    type="tel" 
                    value={formData.phone} 
                    onChange={handleChange}
                    placeholder={t('placeholders.phoneNumber')}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('register.preferredLanguage')} ({t('register.optional')})
                  </label>
                  <select 
                    name="preferredLanguage" 
                    value={formData.preferredLanguage} 
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('register.bio')} ({t('register.optional')})</label>
                  <textarea 
                    name="bio" 
                    rows={4} 
                    value={formData.bio} 
                    onChange={handleChange}
                    placeholder={t('register.bioPlaceholder')}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Upload className="w-4 h-4 inline mr-1" />{t('register.coachingLicense')} ({t('register.optional')})
                  </label>
                  <ImageUpload 
                    label=""
                    value={formData.coachingLicense}
                    onChange={(base64) => setFormData({ ...formData, coachingLicense: base64 })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Upload className="w-4 h-4 inline mr-1" />{t('register.ausweiss')} ({t('register.optional')})
                  </label>
                  <ImageUpload 
                    label=""
                    value={formData.ausweiss}
                    onChange={(base64) => setFormData({ ...formData, ausweiss: base64 })}
                  />
                </div>

                {/* Social Media */}
                <div className="bg-purple-50 dark:bg-gray-700 border border-purple-200 dark:border-gray-600 rounded-lg p-5">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{t('register.socialMedia')} ({t('register.optional')})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Facebook</label>
                      <input 
                        name="facebook" 
                        type="text" 
                        value={formData.facebook} 
                        onChange={handleChange}
                        placeholder={t('register.facebookPlaceholder')}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instagram</label>
                      <input 
                        name="instagram" 
                        type="text" 
                        value={formData.instagram} 
                        onChange={handleChange}
                        placeholder={t('placeholders.username')}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TikTok</label>
                      <input 
                        name="tiktok" 
                        type="text" 
                        value={formData.tiktok} 
                        onChange={handleChange}
                        placeholder={t('placeholders.username')}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">YouTube</label>
                      <input 
                        name="youtube" 
                        type="text" 
                        value={formData.youtube} 
                        onChange={handleChange}
                        placeholder={t('placeholders.channelUrl')}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white text-sm" 
                      />
                    </div>
                  </div>
                </div>

                {/* Achievements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('register.coachingAchievements')} ({t('register.optional')})
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={newAchievement}
                        onChange={(e) => setNewAchievement(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
                        placeholder={t('register.achievementsPlaceholder')}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white text-sm"
                      />
                      <button 
                        type="button"
                        onClick={addAchievement}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-1 text-sm font-medium"
                      >
                        <Plus className="w-4 h-4" /> {t('register.addAchievement')}
                      </button>
                    </div>
                    
                    {achievements.length > 0 && (
                      <div className="space-y-2 mt-3">
                        {achievements.map((achievement, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                            <span className="text-sm text-gray-900 dark:text-white">{achievement}</span>
                            <button 
                              type="button"
                              onClick={() => removeAchievement(index)}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Club History */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('register.clubAffiliations')} ({t('register.optional')})</label>
                    <div className="flex gap-2">
                      <Link
                        href="/clubs/submit"
                        target="_blank"
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
                      >
                        {t('register.clubSubmit')}
                      </Link>
                      <button 
                        type="button"
                        onClick={addClubAffiliation}
                        className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                      >
                        <Plus className="w-4 h-4" /> {t('register.addAffiliation')}
                      </button>
                    </div>
                  </div>

                  {clubHistory.map((club) => (
                    <div key={club.id} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-3 bg-gray-50 dark:bg-gray-700/50">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">{t('playerProfile.clubAffiliation')}</h4>
                        <button 
                          type="button"
                          onClick={() => removeClubAffiliation(club.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <input 
                          value={club.clubName}
                          onChange={(e) => updateClubAffiliation(club.id, 'clubName', e.target.value)}
                          placeholder={t('playerProfile.clubNamePlaceholder')}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white text-sm"
                        />
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('register.role')}
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {COACH_ROLES.map(roleOption => (
                              <label key={roleOption} className="flex items-center space-x-2 cursor-pointer p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                                <input
                                  type="checkbox"
                                  checked={club.role.includes(roleOption)}
                                  onChange={(e) => {
                                    const newRoles = e.target.checked
                                      ? [...club.role, roleOption]
                                      : club.role.filter(r => r !== roleOption);
                                    updateClubAffiliation(club.id, 'role', newRoles);
                                  }}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-900 dark:text-white">{getRoleLabel(roleOption, t)}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                          <select 
                            value={club.genderCoached}
                            onChange={(e) => updateClubAffiliation(club.id, 'genderCoached', e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white text-sm"
                          >
                            <option value="">{t('register.genderCoached')}</option>
                            <option value="MALE">{t('register.male')}</option>
                            <option value="FEMALE">{t('register.female')}</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{t('register.startYear')}</label>
                            <input 
                              type="number"
                              value={club.yearFrom}
                              onChange={(e) => updateClubAffiliation(club.id, 'yearFrom', e.target.value)}
                              placeholder={t('placeholders.exampleYear')}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{t('register.endYear')}</label>
                            {club.currentClub ? (
                              <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                                <span className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-1 text-sm">
                                  ✓ {t('register.current')}
                                </span>
                              </div>
                            ) : (
                              <input 
                                type="number"
                                value={club.yearTo}
                                onChange={(e) => updateClubAffiliation(club.id, 'yearTo', e.target.value)}
                                placeholder={t('placeholders.exampleYearEnd')}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white text-sm"
                              />
                            )}
                          </div>
                        </div>

                        <label className={`flex items-center space-x-2 cursor-pointer p-3 rounded-lg border-2 transition ${
                          club.currentClub 
                            ? 'bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-600 shadow-md' 
                            : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}>
                          <input 
                            type="checkbox"
                            checked={club.currentClub}
                            onChange={(e) => {
                              updateClubAffiliation(club.id, 'currentClub', e.target.checked);
                              if (e.target.checked) {
                                updateClubAffiliation(club.id, 'yearTo', '');
                              }
                            }}
                            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          />
                          <span className={`text-sm font-medium flex items-center gap-2 ${
                            club.currentClub 
                              ? 'text-green-700 dark:text-green-300' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {t('register.currentlyWorkingHere')}
                          </span>
                        </label>

                        {/* Club logo upload removed as per requirements */}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Terms and Conditions */}
                <div className="bg-blue-50 dark:bg-gray-700 border-2 border-blue-200 dark:border-gray-600 rounded-lg p-5">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      required
                    />
                    <div className="text-sm">
                      <p className="font-semibold text-gray-900 dark:text-white mb-2">{t('register.agreeToTerms')} {t('register.terms')} {t('register.and')} {t('register.privacyPolicy')} *</p>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {t('register.agreeToTerms')} <Link href="/terms" target="_blank" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 underline">{t('register.terms')}</Link> {t('register.and')} <Link href="/privacy" target="_blank" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 underline">{t('register.privacyPolicy')}</Link>.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setStep(2)}
                    className="w-1/3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                    {t('register.backButton')}
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-2/3 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                    {loading ? t('register.creating') : t('register.createAccount')}
                  </button>
                </div>
              </div>
            )}
          </form>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            {t('register.alreadyHaveAccount')} <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">{t('register.login')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
