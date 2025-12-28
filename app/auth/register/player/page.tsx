'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Mail, Lock, User, Calendar, Globe, Video, Award, Activity, Trophy, Plus, X, MapPin, Briefcase, GraduationCap, Eye, EyeOff } from 'lucide-react';
import ImageUpload from '@/components/shared/ImageUpload';
import VideoUpload from '@/components/shared/VideoUpload';
import StarRating from '@/components/shared/StarRating';
import CountrySelect from '@/components/shared/CountrySelect';
import { useLanguage } from '@/contexts/LanguageContext';
import StepIndicator from '@/components/shared/StepIndicator';

// Import constants
const SWISS_LEAGUES = [
  { value: 'NLA', label: 'NLA (Nationalliga A)' },
  { value: 'NLB', label: 'NLB (Nationalliga B)' },
  { value: '1. Liga', label: '1. Liga' },
  { value: '2. Liga', label: '2. Liga' },
  { value: '3. Liga', label: '3. Liga' },
  { value: '4. Liga', label: '4. Liga' },
  { value: '5. Liga', label: '5. Liga' },
  { value: 'U23 Elite', label: 'U23 Elite' },
  { value: 'U19 Elite', label: 'U19 Elite' },
  { value: 'U17 Elite', label: 'U17 Elite' },
  { value: 'Other', label: 'Other' },
];

const NATIONALITIES = [
  "Afghanistan", "Albanie", "Algerie", "Andorra", "Angola", "Antigua Und Barbuda", "Argentinie", "Armenie", "Australie", "Östriich",
  "Aserbaidschan", "Bahamas", "Bahrain", "Bangladesch", "Barbados", "Wiissrussland", "Belgie", "Belize", "Benin", "Bhutan",
  "Bolivie", "Bosnie Und Herzegowina", "Botswana", "Brasilie", "Brunei", "Bulgarie", "Burkina Faso", "Burundi", "Kambodscha", "Kamerun",
  "Kanada", "Kap Verde", "Zentralafrikanischi Republik", "Tschad", "Chile", "China", "Kolumbie", "Komore", "Kongo", "Costa Rica",
  "Kroatie", "Kuba", "Zypern", "Tschechie", "Dänemark", "Dschibuti", "Dominica", "Dominikanischi Republik", "Osttimor", "Ecuador",
  "Ägypte", "El Salvador", "Äquatorialguinea", "Eritrea", "Estland", "Äthiopie", "Fidschi", "Finnland", "Frankriich", "Gabon",
  "Gambia", "Georgie", "Dütschland", "Ghana", "Griecheland", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Ungarn", "Island", "Indie", "Indonesie", "Iran", "Irak", "Irland", "Israel",
  "Italie", "Elfebeiküste", "Jamaika", "Japan", "Jordanie", "Kasachstan", "Kenia", "Kiribati", "Nordkorea", "Südkorea",
  "Kosovo", "Kuwait", "Kirgisistan", "Laos", "Lettland", "Libanon", "Lesotho", "Liberia", "Libye", "Liechtestei",
  "Litaue", "Luxemburg", "Mazedonie", "Madagaskar", "Malawi", "Malaysia", "Maledive", "Mali", "Malta", "Marshallinsle",
  "Mauretanie", "Mauritius", "Mexiko", "Mikronesie", "Moldau", "Monaco", "Mongolei", "Montenegro", "Marokko", "Mosambik",
  "Myanmar", "Namibia", "Nauru", "Nepal", "Holländer", "Neuseeland", "Nicaragua", "Niger", "Nigeria", "Norwege",
  "Oman", "Pakistan", "Palau", "Palästina", "Panama", "Papua-Neuguinea", "Paraguay", "Peru", "Philippine", "Pole",
  "Portugal", "Katar", "Rumänie", "Russland", "Ruanda", "St. Kitts Und Nevis", "St. Lucia", "St. Vincent Und D Grenadine", "Samoa", "San Marino",
  "São Tomé Und Príncipe", "Saudi-Arabie", "Senegal", "Serbie", "Seychelle", "Sierra Leone", "Singapur", "Slowakei", "Slowenie", "Salomone",
  "Somalia", "Südafrika", "Südsudan", "Spanie", "Sri Lanka", "Sudan", "Suriname", "Eswatini", "Schwede", "Schwiiz",
  "Syrie", "Taiwan", "Tadschikistan", "Tansania", "Thailand", "Togo", "Tonga", "Trinidad Und Tobago", "Tunesie", "Türkei",
  "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "Vereinigti Arabischi Emirate", "Grossbritannie", "USA", "Uruguay", "Usbekistan", "Vanuatu",
  "Vatikanstadt", "Venezuela", "Vietnam", "Jeme", "Sambia", "Simbabwe"
];

// Map country name to translation key
const getCountryLabel = (country: string, t: any): string => {
  const countryMap: { [key: string]: string } = {
    "Afghanistan": "countries.afghanistan",
    "Albanie": "countries.albania",
    "Algerie": "countries.algeria",
    "Andorra": "countries.andorra",
    "Angola": "countries.angola",
    "Antigua Und Barbuda": "countries.antiguaAndBarbuda",
    "Argentinie": "countries.argentina",
    "Armenie": "countries.armenia",
    "Australie": "countries.australia",
    "Östriich": "countries.austria",
    "Aserbaidschan": "countries.azerbaijan",
    "Bahamas": "countries.bahamas",
    "Bahrain": "countries.bahrain",
    "Bangladesch": "countries.bangladesh",
    "Barbados": "countries.barbados",
    "Wiissrussland": "countries.belarus",
    "Belgie": "countries.belgium",
    "Belize": "countries.belize",
    "Benin": "countries.benin",
    "Bhutan": "countries.bhutan",
    "Bolivie": "countries.bolivia",
    "Bosnie Und Herzegowina": "countries.bosniaAndHerzegovina",
    "Botswana": "countries.botswana",
    "Brasilie": "countries.brazil",
    "Brunei": "countries.brunei",
    "Bulgarie": "countries.bulgaria",
    "Burkina Faso": "countries.burkinaFaso",
    "Burundi": "countries.burundi",
    "Kambodscha": "countries.cambodia",
    "Kamerun": "countries.cameroon",
    "Kanada": "countries.canada",
    "Kap Verde": "countries.capeVerde",
    "Zentralafrikanischi Republik": "countries.centralAfricanRepublic",
    "Tschad": "countries.chad",
    "Chile": "countries.chile",
    "China": "countries.china",
    "Kolumbie": "countries.colombia",
    "Komore": "countries.comoros",
    "Kongo": "countries.congo",
    "Costa Rica": "countries.costaRica",
    "Kroatie": "countries.croatia",
    "Kuba": "countries.cuba",
    "Zypern": "countries.cyprus",
    "Tschechie": "countries.czechRepublic",
    "Dänemark": "countries.denmark",
    "Dschibuti": "countries.djibouti",
    "Dominica": "countries.dominica",
    "Dominikanischi Republik": "countries.dominicanRepublic",
    "Osttimor": "countries.eastTimor",
    "Ecuador": "countries.ecuador",
    "Ägypte": "countries.egypt",
    "El Salvador": "countries.elSalvador",
    "Äquatorialguinea": "countries.equatorialGuinea",
    "Eritrea": "countries.eritrea",
    "Estland": "countries.estonia",
    "Äthiopie": "countries.ethiopia",
    "Fidschi": "countries.fiji",
    "Finnland": "countries.finland",
    "Frankriich": "countries.france",
    "Gabon": "countries.gabon",
    "Gambia": "countries.gambia",
    "Georgie": "countries.georgia",
    "Dütschland": "countries.germany",
    "Ghana": "countries.ghana",
    "Griecheland": "countries.greece",
    "Grenada": "countries.grenada",
    "Guatemala": "countries.guatemala",
    "Guinea": "countries.guinea",
    "Guinea-Bissau": "countries.guineaBissau",
    "Guyana": "countries.guyana",
    "Haiti": "countries.haiti",
    "Honduras": "countries.honduras",
    "Ungarn": "countries.hungary",
    "Island": "countries.iceland",
    "Indie": "countries.india",
    "Indonesie": "countries.indonesia",
    "Iran": "countries.iran",
    "Irak": "countries.iraq",
    "Irland": "countries.ireland",
    "Israel": "countries.israel",
    "Italie": "countries.italy",
    "Elfebeiküste": "countries.ivoryCoast",
    "Jamaika": "countries.jamaica",
    "Japan": "countries.japan",
    "Jordanie": "countries.jordan",
    "Kasachstan": "countries.kazakhstan",
    "Kenia": "countries.kenya",
    "Kiribati": "countries.kiribati",
    "Nordkorea": "countries.northKorea",
    "Südkorea": "countries.southKorea",
    "Kosovo": "countries.kosovo",
    "Kuwait": "countries.kuwait",
    "Kirgisistan": "countries.kyrgyzstan",
    "Laos": "countries.laos",
    "Lettland": "countries.latvia",
    "Libanon": "countries.lebanon",
    "Lesotho": "countries.lesotho",
    "Liberia": "countries.liberia",
    "Libye": "countries.libya",
    "Liechtestei": "countries.liechtenstein",
    "Litaue": "countries.lithuania",
    "Luxemburg": "countries.luxembourg",
    "Mazedonie": "countries.northMacedonia",
    "Madagaskar": "countries.madagascar",
    "Malawi": "countries.malawi",
    "Malaysia": "countries.malaysia",
    "Maledive": "countries.maldives",
    "Mali": "countries.mali",
    "Malta": "countries.malta",
    "Marshallinsle": "countries.marshallIslands",
    "Mauretanie": "countries.mauritania",
    "Mauritius": "countries.mauritius",
    "Mexiko": "countries.mexico",
    "Mikronesie": "countries.micronesia",
    "Moldau": "countries.moldova",
    "Monaco": "countries.monaco",
    "Mongolei": "countries.mongolia",
    "Montenegro": "countries.montenegro",
    "Marokko": "countries.morocco",
    "Mosambik": "countries.mozambique",
    "Myanmar": "countries.myanmar",
    "Namibia": "countries.namibia",
    "Nauru": "countries.nauru",
    "Nepal": "countries.nepal",
    "Holländer": "countries.netherlands",
    "Neuseeland": "countries.newZealand",
    "Nicaragua": "countries.nicaragua",
    "Niger": "countries.niger",
    "Nigeria": "countries.nigeria",
    "Norwege": "countries.norway",
    "Oman": "countries.oman",
    "Pakistan": "countries.pakistan",
    "Palau": "countries.palau",
    "Palästina": "countries.palestine",
    "Panama": "countries.panama",
    "Papua-Neuguinea": "countries.papuaNewGuinea",
    "Paraguay": "countries.paraguay",
    "Peru": "countries.peru",
    "Philippine": "countries.philippines",
    "Pole": "countries.poland",
    "Portugal": "countries.portugal",
    "Katar": "countries.qatar",
    "Rumänie": "countries.romania",
    "Russland": "countries.russia",
    "Ruanda": "countries.rwanda",
    "St. Kitts Und Nevis": "countries.saintKittsAndNevis",
    "St. Lucia": "countries.saintLucia",
    "St. Vincent Und D Grenadine": "countries.saintVincentAndTheGrenadines",
    "Samoa": "countries.samoa",
    "San Marino": "countries.sanMarino",
    "São Tomé Und Príncipe": "countries.saoTomeAndPrincipe",
    "Saudi-Arabie": "countries.saudiArabia",
    "Senegal": "countries.senegal",
    "Serbie": "countries.serbia",
    "Seychelle": "countries.seychelles",
    "Sierra Leone": "countries.sierraLeone",
    "Singapur": "countries.singapore",
    "Slowakei": "countries.slovakia",
    "Slowenie": "countries.slovenia",
    "Salomone": "countries.solomonIslands",
    "Somalia": "countries.somalia",
    "Südafrika": "countries.southAfrica",
    "Südsudan": "countries.southSudan",
    "Spanie": "countries.spain",
    "Sri Lanka": "countries.sriLanka",
    "Sudan": "countries.sudan",
    "Suriname": "countries.suriname",
    "Eswatini": "countries.eswatini",
    "Schwede": "countries.sweden",
    "Schwiiz": "countries.switzerland",
    "Syrie": "countries.syria",
    "Taiwan": "countries.taiwan",
    "Tadschikistan": "countries.tajikistan",
    "Tansania": "countries.tanzania",
    "Thailand": "countries.thailand",
    "Togo": "countries.togo",
    "Tonga": "countries.tonga",
    "Trinidad Und Tobago": "countries.trinidadAndTobago",
    "Tunesie": "countries.tunisia",
    "Türkei": "countries.turkey",
    "Turkmenistan": "countries.turkmenistan",
    "Tuvalu": "countries.tuvalu",
    "Uganda": "countries.uganda",
    "Ukraine": "countries.ukraine",
    "Vereinigti Arabischi Emirate": "countries.unitedArabEmirates",
    "Grossbritannie": "countries.unitedKingdom",
    "USA": "countries.unitedStates",
    "Uruguay": "countries.uruguay",
    "Usbekistan": "countries.uzbekistan",
    "Vanuatu": "countries.vanuatu",
    "Vatikanstadt": "countries.vaticanCity",
    "Venezuela": "countries.venezuela",
    "Vietnam": "countries.vietnam",
    "Jeme": "countries.yemen",
    "Sambia": "countries.zambia",
    "Simbabwe": "countries.zimbabwe"
  };
  
  const key = countryMap[country];
  return key ? t(key) : country;
};

const POSITIONS = [
  "OUTSIDE_HITTER",
  "OPPOSITE",
  "MIDDLE_BLOCKER",
  "SETTER",
  "LIBERO",
  "UNIVERSAL"
];

// Map position enum to translation key
const getPositionLabel = (position: string, t: any): string => {
  const mapping: { [key: string]: string } = {
    "OUTSIDE_HITTER": t('register.outsideHitter'),
    "OPPOSITE": t('register.opposite'),
    "MIDDLE_BLOCKER": t('register.middleBlocker'),
    "SETTER": t('register.setter'),
    "LIBERO": t('register.libero'),
    "UNIVERSAL": t('register.universal')
  };
  return mapping[position] || position;
};

// Map Swiss German positions to database enum values (backward compatibility)
const mapPositionToEnum = (position: string): string => {
  // If already an enum, return it
  if (["OUTSIDE_HITTER", "OPPOSITE", "MIDDLE_BLOCKER", "SETTER", "LIBERO", "UNIVERSAL"].includes(position)) {
    return position;
  }
  
  // Map old Swiss German to enum
  const mapping: { [key: string]: string } = {
    "Ausseagriffler": "OUTSIDE_HITTER",
    "Diagonal": "OPPOSITE",
    "Mittelblocker": "MIDDLE_BLOCKER",
    "Zuespieler": "SETTER",
    "Libero": "LIBERO",
    "Universalspieler": "UNIVERSAL"
  };
  return mapping[position] || position;
};

interface ClubExperience {
  id: string;
  clubName: string;
  logo: string;
  country: string;
  clubWebsiteUrl: string;
  league: string;
  yearFrom: string;
  yearTo: string;
  currentClub: boolean;
}

interface Achievement {
  id: string;
  text: string;
}

export default function PlayerRegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '', firstName: '', lastName: '',
    dateOfBirth: '', gender: '', nationality: '', canton: '', municipality: '', positions: [] as string[], dominantHand: '', preferredLanguage: '', height: '',
    weight: '', spikeHeight: '', blockHeight: '', 
    profileImage: '', instagram: '', tiktok: '', youtube: '', highlightVideo: '',
    skillReceiving: 0, skillServing: 0, skillAttacking: 0, skillBlocking: 0, skillDefense: 0,
    swissVolleyLicense: '', ausweiss: '', phone: '', bio: '',
    employmentStatus: '', occupation: '', schoolName: '',
    lookingForClub: false
  });
  const [clubHistory, setClubHistory] = useState<ClubExperience[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (p: string) => {
    if (p.length < 8) return { valid: false, message: t('register.passwordMin8') };
    if (!/\d/.test(p)) return { valid: false, message: t('register.passwordNeedsNumber') };
    if (!/[!@#$%^&*()]/.test(p)) return { valid: false, message: t('register.passwordNeedsSymbol') };
    return { valid: true, message: '' };
  };

  const addClubExperience = () => {
    setClubHistory([...clubHistory, {
      id: Date.now().toString(),
      clubName: '',
      logo: '',
      country: 'Switzerland',
      clubWebsiteUrl: '',
      league: '',
      yearFrom: '',
      yearTo: '',
      currentClub: false
    }]);
  };

  const removeClubExperience = (id: string) => {
    setClubHistory(clubHistory.filter(club => club.id !== id));
  };

  const updateClubExperience = (id: string, field: keyof ClubExperience, value: any) => {
    console.log('updateClubExperience called:', { id, field, value });
    setClubHistory(prev => {
      const updatedHistory = prev.map(club => {
        if (club.id === id) {
          console.log('Updating club:', club, 'with', { [field]: value });
          return { ...club, [field]: value };
        }
        return club;
      });
      console.log('Updated history:', updatedHistory);
      return updatedHistory;
    });
  };

  const addAchievement = () => {
    setAchievements([...achievements, {
      id: Date.now().toString(),
      text: ''
    }]);
  };

  const removeAchievement = (id: string) => {
    setAchievements(achievements.filter(achievement => achievement.id !== id));
  };

  const updateAchievement = (id: string, text: string) => {
    setAchievements(achievements.map(achievement => 
      achievement.id === id ? { ...achievement, text } : achievement
    ));
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
      if (!formData.gender) { setError(t('register.selectGenderRequired')); return; }
      if (!formData.nationality) { setError(t('register.selectNationality')); return; }
      if (!formData.canton) { setError(t('register.selectCantonRequired')); return; }
      if (!formData.employmentStatus) { setError(t('register.selectEmploymentRequired')); return; }
      if ((formData.employmentStatus === 'STUDENT_FULL_TIME' || formData.employmentStatus === 'STUDENT_PART_TIME') && !formData.schoolName) { 
        setError(t('register.selectSchoolRequired')); 
        return; 
      }
      if ((formData.employmentStatus === 'WORKING_FULL_TIME' || formData.employmentStatus === 'WORKING_PART_TIME') && !formData.occupation) { 
        setError(t('register.enterOccupation')); 
        return; 
      }
      if (formData.positions.length === 0) { setError(t('register.selectPositionRequired')); return; }
      if (!formData.profileImage) { setError(t('register.uploadProfileImage')); return; }
      setStep(3);
      return;
    }

    // Step 3 - Final submission
    if (!agreedToTerms) {
      setError(t('register.agreeToTermsRequired'));
      return;
    }

    // Step 3 - Final submission
    setLoading(true);
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const response = await axios.post('/api/auth/register', {
        email: formData.email,
        password: formData.password,
        name: fullName,
        role: 'PLAYER',
        playerData: {
          firstName: formData.firstName, 
          lastName: formData.lastName, 
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender, 
          nationality: formData.nationality,
          canton: formData.canton,
          municipality: formData.municipality || null,
          employmentStatus: formData.employmentStatus,
          occupation: formData.occupation,
          schoolName: formData.schoolName,
          positions: formData.positions.map(mapPositionToEnum),
          dominantHand: formData.dominantHand || null,
          preferredLanguage: formData.preferredLanguage || null,
          height: formData.height ? parseFloat(formData.height) : undefined,
          weight: formData.weight ? parseFloat(formData.weight) : undefined,
          spikeHeight: formData.spikeHeight ? parseFloat(formData.spikeHeight) : undefined,
          blockHeight: formData.blockHeight ? parseFloat(formData.blockHeight) : undefined,
          profileImage: formData.profileImage,
          instagram: formData.instagram, 
          tiktok: formData.tiktok, 
          youtube: formData.youtube,
          highlightVideo: formData.highlightVideo, 
          swissVolleyLicense: formData.swissVolleyLicense,
          ausweiss: formData.ausweiss || null,
          skillReceiving: formData.skillReceiving, 
          skillServing: formData.skillServing,
          skillAttacking: formData.skillAttacking, 
          skillBlocking: formData.skillBlocking,
          skillDefense: formData.skillDefense, 
          phone: formData.phone, 
          bio: formData.bio,
          achievements: achievements.map(a => a.text).filter(text => text.trim() !== ''),
          clubHistory: clubHistory,
          lookingForClub: formData.lookingForClub
        }
      });
      
      // Show success message with email sent notification
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

  const handlePositionToggle = (position: string) => {
    const newPositions = formData.positions.includes(position)
      ? formData.positions.filter(p => p !== position)
      : [...formData.positions, position];
    setFormData({ ...formData, positions: newPositions });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('register.playerTitle')}</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{t('register.playerSubtitle')}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <StepIndicator step={step} total={3} color="red" />

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
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Mail className="w-4 h-4 inline mr-1" />{t('register.email')}
                  </label>
                  <input name="email" type="email" required value={formData.email} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Lock className="w-4 h-4 inline mr-1" />{t('register.password')} (8+ {t('register.required')})
                  </label>
                  <div className="relative">
                    <input 
                      name="password" 
                      type={showPassword ? "text" : "password"} 
                      required 
                      value={formData.password} 
                      onChange={handleChange}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white" 
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('register.confirmPassword')}</label>
                  <div className="relative">
                    <input 
                      name="confirmPassword" 
                      type={showConfirmPassword ? "text" : "password"} 
                      required 
                      value={formData.confirmPassword} 
                      onChange={handleChange}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white" 
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
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50">
                  {t('register.continueButton')}
                </button>
              </div>
            )}

            {/* STEP 2: Player Information */}
            {step === 2 && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t('register.playerInfo')}</h3>
                
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

                <ImageUpload label={t('register.profilePicture') + ' *'} value={formData.profileImage}
                  onChange={(v) => setFormData({ ...formData, profileImage: v })} aspectRatio="square" required />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <User className="w-4 h-4 inline mr-1" />{t('register.selectGender')} *
                    </label>
                    <select name="gender" required value={formData.gender} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white">
                      <option value="">{t('register.selectPlaceholder')}</option>
                      <option value="MALE">{t('register.male')}</option>
                      <option value="FEMALE">{t('register.female')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Globe className="w-4 h-4 inline mr-1" />{t('register.nationality')} *
                    </label>
                    <select name="nationality" required value={formData.nationality} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white">
                      <option value="">{t('register.selectPlaceholder')}</option>
                      {NATIONALITIES.map(n => <option key={n} value={n}>{getCountryLabel(n, t)}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('register.positions')} * <span className="text-xs text-gray-500">({t('register.selectAll')})</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {POSITIONS.map(pos => (
                      <label key={pos} className="flex items-center space-x-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                        <input
                          type="checkbox"
                          checked={formData.positions.includes(pos)}
                          onChange={() => handlePositionToggle(pos)}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{getPositionLabel(pos, t)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('register.dominantHand')}
                  </label>
                  <select 
                    name="dominantHand" 
                    value={formData.dominantHand} 
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">{t('register.selectDominantHand')}</option>
                    <option value="RIGHT">{t('register.rightHanded')}</option>
                    <option value="LEFT">{t('register.leftHanded')}</option>
                    <option value="AMBIDEXTROUS">{t('register.ambidextrous')}</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('register.optional')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('register.preferredLanguage')}
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
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('register.optional')}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('register.height')}</label>
                    <input name="height" type="number" value={formData.height} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder={t('placeholders.height')} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('register.weight')}
                    </label>
                    <input name="weight" type="number" value={formData.weight} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder={t('placeholders.weight')} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Calendar className="w-4 h-4 inline mr-1" />{t('register.dateOfBirth')}
                    </label>
                    <input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange}
                      lang="de-CH"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder={t('placeholders.dateFormat')} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Mail className="w-4 h-4 inline mr-1" />{t('register.phoneNumber')}
                  </label>
                  <input name="phone" type="tel" value={formData.phone} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder={t('placeholders.phoneNumber')} />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('register.optional')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <MapPin className="w-4 h-4 inline mr-1" />{t('register.canton')} *
                  </label>
                  <select name="canton" value={formData.canton} onChange={handleChange} required
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
                  <input name="municipality" type="text" value={formData.municipality} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" 
                    placeholder={t('placeholders.exampleCities')} />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('register.optional')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Briefcase className="w-4 h-4 inline mr-1" />{t('register.employmentStatus')} *
                  </label>
                  <select name="employmentStatus" value={formData.employmentStatus} onChange={handleChange} required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white">
                    <option value="">{t('register.selectEmployment')}</option>
                    <option value="STUDENT_FULL_TIME">{t('register.studentFullTime')}</option>
                    <option value="STUDENT_PART_TIME">{t('register.studentPartTime')}</option>
                    <option value="WORKING_FULL_TIME">{t('register.workingFullTime')}</option>
                    <option value="WORKING_PART_TIME">{t('register.workingPartTime')}</option>
                  </select>
                </div>

                {(formData.employmentStatus === 'STUDENT_FULL_TIME' || formData.employmentStatus === 'STUDENT_PART_TIME') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <GraduationCap className="w-4 h-4 inline mr-1" />{t('register.school')} *
                    </label>
                    <select name="schoolName" value={formData.schoolName} onChange={handleChange} required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white">
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
                  </div>
                )}

                {(formData.employmentStatus === 'WORKING_FULL_TIME' || formData.employmentStatus === 'WORKING_PART_TIME') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Briefcase className="w-4 h-4 inline mr-1" />{t('register.occupation')} *
                    </label>
                    <input name="occupation" value={formData.occupation} onChange={handleChange} required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" 
                      placeholder={t('placeholders.exampleJob')} />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Activity className="w-4 h-4 inline mr-1" />{t('register.spikeHeight')}
                    </label>
                    <input name="spikeHeight" type="number" value={formData.spikeHeight} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder={t('placeholders.spikeHeight')} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Activity className="w-4 h-4 inline mr-1" />{t('register.blockHeight')}
                    </label>
                    <input name="blockHeight" type="number" value={formData.blockHeight} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder={t('placeholders.blockHeight')} />
                  </div>
                </div>

                <div className="bg-pink-50 dark:bg-gray-700 border border-pink-200 dark:border-gray-600 rounded-lg p-5">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{t('register.socialMedia')}</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instagram</label>
                      <input name="instagram" value={formData.instagram} onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder={t('placeholders.username')} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TikTok</label>
                      <input name="tiktok" value={formData.tiktok} onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder={t('placeholders.username')} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">YouTube</label>
                      <input name="youtube" value={formData.youtube} onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder={t('placeholders.channelUrl')} />
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-gray-700 border border-purple-200 dark:border-gray-600 rounded-lg p-5">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Video className="w-5 h-5" />{t('register.highlightVideo')}
                  </h4>
                  <VideoUpload value={formData.highlightVideo}
                    onChange={(v) => setFormData({ ...formData, highlightVideo: v })} label={t('register.highlightVideo')} />
                </div>

                <div className="bg-green-50 dark:bg-gray-700 border border-green-200 dark:border-gray-600 rounded-lg p-5">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">{t('register.skills')}</h4>
                  <div className="space-y-3">
                    <StarRating label={t('register.receiving')} value={formData.skillReceiving} onChange={(v) => setFormData({ ...formData, skillReceiving: v })} />
                    <StarRating label={t('register.serving')} value={formData.skillServing} onChange={(v) => setFormData({ ...formData, skillServing: v })} />
                    <StarRating label={t('register.attacking')} value={formData.skillAttacking} onChange={(v) => setFormData({ ...formData, skillAttacking: v })} />
                    <StarRating label={t('register.blocking')} value={formData.skillBlocking} onChange={(v) => setFormData({ ...formData, skillBlocking: v })} />
                    <StarRating label={t('register.defense')} value={formData.skillDefense} onChange={(v) => setFormData({ ...formData, skillDefense: v })} />
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-gray-700 border border-orange-200 dark:border-gray-600 rounded-lg p-5">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5" />{t('register.swissVolleyLicense')} ({t('register.optional')})
                  </h4>
                  <ImageUpload label={t('register.swissVolleyLicense')} value={formData.swissVolleyLicense}
                    onChange={(v) => setFormData({ ...formData, swissVolleyLicense: v })} aspectRatio="banner" />
                </div>

                <div className="bg-blue-50 dark:bg-gray-700 border border-blue-200 dark:border-gray-600 rounded-lg p-5">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5" />{t('register.ausweiss')} ({t('register.optional')})
                  </h4>
                  <ImageUpload label={t('register.ausweiss')} value={formData.ausweiss}
                    onChange={(v) => setFormData({ ...formData, ausweiss: v })} aspectRatio="banner" />
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600">
                    {t('register.backButton')}
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50">
                    {t('register.continueButton')}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Achievements & Experience */}
            {step === 3 && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t('register.skillsAchievements')}</h3>

                {/* Bio Section */}
                <div className="bg-blue-50 dark:bg-gray-700 border border-blue-200 dark:border-gray-600 rounded-lg p-5">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <User className="w-5 h-5" />{t('register.bio')}
                  </h4>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    placeholder={t('placeholders.tellAboutYourself')}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white resize-none"
                  />
                </div>

                {/* Achievements Section */}
                <div className="bg-yellow-50 dark:bg-gray-700 border border-yellow-200 dark:border-gray-600 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Trophy className="w-5 h-5" />{t('register.achievements')}
                    </h4>
                    <button
                      type="button"
                      onClick={addAchievement}
                      className="flex items-center gap-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />{t('register.addAchievement')}
                    </button>
                  </div>

                  {achievements.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      {t('register.noAchievementsAdded')}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {achievements.map((achievement, index) => (
                        <div key={achievement.id} className="flex items-start gap-2">
                          <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2 flex-1">
                                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-2">#{index + 1}</span>
                                <input
                                  type="text"
                                  value={achievement.text}
                                  onChange={(e) => updateAchievement(achievement.id, e.target.value)}
                                  placeholder={t('placeholders.exampleAchievement')}
                                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white text-sm"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeAchievement(achievement.id)}
                                className="text-red-600 hover:text-red-700 p-1"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Club Experience Section */}
                <div className="bg-indigo-50 dark:bg-gray-700 border border-indigo-200 dark:border-gray-600 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Trophy className="w-5 h-5" />{t('register.clubHistory')}
                    </h4>
                    <div className="flex gap-2">
                      <Link
                        href="/clubs/submit"
                        target="_blank"
                        className="flex items-center gap-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
                      >
                        {t('register.submitClub')}
                      </Link>
                      <button
                        type="button"
                        onClick={addClubExperience}
                        className="flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                      >
                        <Plus className="w-4 h-4" />{t('register.addClub')}
                      </button>
                    </div>
                  </div>

                  {clubHistory.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      {t('register.optional')}
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {clubHistory.map((club) => (
                        <div key={club.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-start justify-between mb-3">
                            <h5 className="font-medium text-gray-900 dark:text-white">{t('playerProfile.clubNumber')} {clubHistory.indexOf(club) + 1}</h5>
                            <button
                              type="button"
                              onClick={() => removeClubExperience(club.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('register.clubName')} *</label>
                                <input
                                  type="text"
                                  value={club.clubName}
                                  onChange={(e) => updateClubExperience(club.id, 'clubName', e.target.value)}
                                  required
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                                  placeholder={t('playerProfile.enterClubName')}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  <Globe className="w-4 h-4 inline mr-1" />{t('register.country')} *
                                </label>
                                <CountrySelect
                                  value={club.country}
                                  onChange={(value) => updateClubExperience(club.id, 'country', value)}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                                  placeholder={t('register.selectCountry') || 'Select Country'}
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <Trophy className="w-4 h-4 inline mr-1" />{t('register.league')} *
                              </label>
                              {club.country === 'Switzerland' ? (
                                <select
                                  value={club.league}
                                  onChange={(e) => updateClubExperience(club.id, 'league', e.target.value)}
                                  required
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                                >
                                  <option value="">{t('playerProfile.selectLeague') || 'Select League'}</option>
                                  {SWISS_LEAGUES.map(league => (
                                    <option key={league.value} value={league.value}>
                                      {league.label}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  value={club.league}
                                  onChange={(e) => updateClubExperience(club.id, 'league', e.target.value)}
                                  required
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                                  placeholder={t('placeholders.exampleLeague')}
                                />
                              )}
                            </div>

                            {club.country !== 'Switzerland' && (
                              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                <p className="text-xs text-blue-800 dark:text-blue-200">
                                  {t('playerProfile.clubOutsideSwitzerlandNote')}
                                </p>
                              </div>
                            )}



                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('register.startYear')}</label>
                                <input
                                  type="number"
                                  value={club.yearFrom}
                                  onChange={(e) => updateClubExperience(club.id, 'yearFrom', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                                  placeholder={t('placeholders.exampleYear')}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('register.endYear')}</label>
                                {club.currentClub ? (
                                  <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                                    <span className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                                      ✓ {t('register.current')}
                                    </span>
                                  </div>
                                ) : (
                                  <input
                                    type="number"
                                    value={club.yearTo}
                                    onChange={(e) => updateClubExperience(club.id, 'yearTo', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                                    placeholder={t('placeholders.exampleYear')}
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
                                  updateClubExperience(club.id, 'currentClub', e.target.checked);
                                  if (e.target.checked) {
                                    updateClubExperience(club.id, 'yearTo', '');
                                  }
                                }}
                                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                              />
                              <span className={`text-sm font-medium flex items-center gap-2 ${
                                club.currentClub 
                                  ? 'text-green-700 dark:text-green-300' 
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {t('register.currentlyPlaying')}
                                {(club.currentClub || club.logo) && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-600 text-white">
                                    {t('register.active')}
                                  </span>
                                )}
                              </span>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Looking For Club Toggle */}
                <div className={`border rounded-lg p-5 ${formData.lookingForClub ? 'bg-teal-100 dark:bg-teal-900/30 border-teal-500 dark:border-teal-500' : 'bg-teal-50 dark:bg-gray-700 border-teal-200 dark:border-gray-600'}`}>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.lookingForClub}
                      onChange={(e) => setFormData({ ...formData, lookingForClub: e.target.checked })}
                      className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{t('register.lookingForClub')}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('register.optional')}</p>
                    </div>
                  </label>
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

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600">
                    {t('register.backButton')}
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50">
                    {loading ? t('register.creating') : t('register.createAccount')}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          {t('register.alreadyHaveAccount')} <Link href="/auth/login" className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium">{t('register.login')}</Link>
        </p>
      </div>
    </div>
  );
}
