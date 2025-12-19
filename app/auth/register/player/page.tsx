'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Mail, Lock, User, Calendar, Globe, Video, Award, Weight, Activity, Trophy, Plus, X, MapPin, Briefcase, GraduationCap, Eye, EyeOff } from 'lucide-react';
import ImageUpload from '@/components/shared/ImageUpload';
import VideoUpload from '@/components/shared/VideoUpload';
import StarRating from '@/components/shared/StarRating';

// Import constants
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

const POSITIONS = [
  "Ausseagriffler",
  "Diagonal",
  "Mittelblocker",
  "Zuespieler",
  "Libero",
  "Universalspieler"
];

// Map Swiss German positions to database enum values
const mapPositionToEnum = (swissGermanPosition: string): string => {
  const mapping: { [key: string]: string } = {
    "Ausseagriffler": "OUTSIDE_HITTER",
    "Diagonal": "OPPOSITE",
    "Mittelblocker": "MIDDLE_BLOCKER",
    "Zuespieler": "SETTER",
    "Libero": "LIBERO",
    "Universalspieler": "UNIVERSAL"
  };
  return mapping[swissGermanPosition] || swissGermanPosition;
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
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '', firstName: '', lastName: '',
    dateOfBirth: '', gender: '', nationality: '', canton: '', municipality: '', positions: [] as string[], height: '',
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
    if (p.length < 8) return { valid: false, message: 'Passwort Muss Mindestens 8 Zeiche Ha' };
    if (!/\d/.test(p)) return { valid: false, message: 'Passwort Muss E Zahl Enthalte' };
    if (!/[!@#$%^&*()]/.test(p)) return { valid: false, message: 'Passwort Muss Es Sonderzeiche Enthalte' };
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
    setClubHistory(clubHistory.map(club => 
      club.id === id ? { ...club, [field]: value } : club
    ));
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
        setError('Passwörter Stimme Nid überein'); 
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
      if (!formData.gender) { setError('Bitte Wähl Dis Gschlecht'); return; }
      if (!formData.nationality) { setError('Bitte Wähl Dini Nationalität'); return; }
      if (!formData.canton) { setError('Bitte Wähl Din Wohnkanton'); return; }
      if (!formData.employmentStatus) { setError('Bitte Wähl Din Beschäftigungsstatus'); return; }
      if ((formData.employmentStatus === 'STUDENT_FULL_TIME' || formData.employmentStatus === 'STUDENT_PART_TIME') && !formData.schoolName) { 
        setError('Bitte Wähl Dini Schuel/Universität'); 
        return; 
      }
      if ((formData.employmentStatus === 'WORKING_FULL_TIME' || formData.employmentStatus === 'WORKING_PART_TIME') && !formData.occupation) { 
        setError('Bitte Gib Din Beruf Aa'); 
        return; 
      }
      if (formData.positions.length === 0) { setError('Bitte Wähl Mindeschtens Ei Position'); return; }
      if (!formData.profileImage) { setError('Bitte Lad Es Profilbild Ufe'); return; }
      setStep(3);
      return;
    }

    // Step 3 - Final submission
    if (!agreedToTerms) {
      setError('Du Muesch D Nutzigsbedingige Akzeptiere');
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
      setError(err.response?.data?.error || 'En Fehler Isch Ufträte');
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
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Spieler Registrierig</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Schritt {step} Vo 3</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                <p className="text-sm text-red-800 dark:text-red-200 font-medium">{error}</p>
              </div>
            )}

            {/* STEP 1: Account Information */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Account-Informatione</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Mail className="w-4 h-4 inline mr-1" />E-Mail
                  </label>
                  <input name="email" type="email" required value={formData.email} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Lock className="w-4 h-4 inline mr-1" />Passwort (8+ Zeiche, Zahl, Symbol)
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passwort Bestätige</label>
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
                  Wiiter →
                </button>
              </div>
            )}

            {/* STEP 2: Player Information */}
            {step === 2 && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Spieler-Informatione</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vorname *</label>
                    <input name="firstName" required value={formData.firstName} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nachname *</label>
                    <input name="lastName" required value={formData.lastName} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" />
                  </div>
                </div>

                <ImageUpload label="Profilbild *" value={formData.profileImage}
                  onChange={(v) => setFormData({ ...formData, profileImage: v })} aspectRatio="square" required />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <User className="w-4 h-4 inline mr-1" />Gschlecht *
                    </label>
                    <select name="gender" required value={formData.gender} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white">
                      <option value="">Uuswähle...</option>
                      <option value="MALE">Männlich</option>
                      <option value="FEMALE">Wiiblich</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Globe className="w-4 h-4 inline mr-1" />Nationalität *
                    </label>
                    <select name="nationality" required value={formData.nationality} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white">
                      <option value="">Uuswähle...</option>
                      {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Position(e) * <span className="text-xs text-gray-500">(Wähl Alli Zutreffende)</span>
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
                        <span className="text-sm text-gray-700 dark:text-gray-300">{pos}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Grössi (cm)</label>
                    <input name="height" type="number" value={formData.height} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder="180" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Weight className="w-4 h-4 inline mr-1" />Gwicht (kg)
                    </label>
                    <input name="weight" type="number" value={formData.weight} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder="75" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Calendar className="w-4 h-4 inline mr-1" />Geburtsdatum
                    </label>
                    <input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange}
                      lang="de-CH"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder="tt.mm.jjjj" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Mail className="w-4 h-4 inline mr-1" />Telefonnummer
                  </label>
                  <input name="phone" type="tel" value={formData.phone} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder="+41 79 123 45 67" />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Optional - Rekrutierer Chönne Dich Direkt Aaruefe</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <MapPin className="w-4 h-4 inline mr-1" />Wohnkanton *
                  </label>
                  <select name="canton" value={formData.canton} onChange={handleChange} required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white">
                    <option value="">Uuswähle...</option>
                    <option value="ZH">Zürich</option>
                    <option value="BE">Bern</option>
                    <option value="LU">Luzern</option>
                    <option value="UR">Uri</option>
                    <option value="SZ">Schwyz</option>
                    <option value="OW">Obwalden</option>
                    <option value="NW">Nidwalden</option>
                    <option value="GL">Glarus</option>
                    <option value="ZG">Zug</option>
                    <option value="FR">Fribourg</option>
                    <option value="SO">Solothurn</option>
                    <option value="BS">Basel-Stadt</option>
                    <option value="BL">Basel-Landschaft</option>
                    <option value="SH">Schaffhausen</option>
                    <option value="AR">Appenzell Ausserrhoden</option>
                    <option value="AI">Appenzell Innerrhoden</option>
                    <option value="SG">St. Gallen</option>
                    <option value="GR">Graubünden</option>
                    <option value="AG">Aargau</option>
                    <option value="TG">Thurgau</option>
                    <option value="TI">Ticino</option>
                    <option value="VD">Vaud</option>
                    <option value="VS">Valais</option>
                    <option value="NE">Neuchâtel</option>
                    <option value="GE">Genève</option>
                    <option value="JU">Jura</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <MapPin className="w-4 h-4 inline mr-1" />Gemeinde/Municipality
                  </label>
                  <input name="municipality" type="text" value={formData.municipality} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" 
                    placeholder="z.B. Winterthur, Bern, etc." />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Optional - Gmeind I Dim Kanton</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Briefcase className="w-4 h-4 inline mr-1" />Beschäftigungsstatus *
                  </label>
                  <select name="employmentStatus" value={formData.employmentStatus} onChange={handleChange} required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white">
                    <option value="">Uuswähle...</option>
                    <option value="STUDENT_FULL_TIME">Student Vollziit</option>
                    <option value="STUDENT_PART_TIME">Student Teilziit</option>
                    <option value="WORKING_FULL_TIME">Schaffe Vollziit</option>
                    <option value="WORKING_PART_TIME">Schaffe Teilziit</option>
                  </select>
                </div>

                {(formData.employmentStatus === 'STUDENT_FULL_TIME' || formData.employmentStatus === 'STUDENT_PART_TIME') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <GraduationCap className="w-4 h-4 inline mr-1" />Schuel/Universität *
                    </label>
                    <select name="schoolName" value={formData.schoolName} onChange={handleChange} required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white">
                      <option value="">Uuswähle Dini Schuel...</option>
                      <optgroup label="Universitäte">
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
                      <optgroup label="Fachhochschuele">
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
                      <optgroup label="Kantonsschuele/Gymnasie">
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
                      <Briefcase className="w-4 h-4 inline mr-1" />Beruf/Occupation *
                    </label>
                    <input name="occupation" value={formData.occupation} onChange={handleChange} required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" 
                      placeholder="z.B. Software Entwickler, Lehrer, etc." />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Activity className="w-4 h-4 inline mr-1" />Schlagreichwiiti (cm)
                    </label>
                    <input name="spikeHeight" type="number" value={formData.spikeHeight} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder="320" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Activity className="w-4 h-4 inline mr-1" />Blockreichwiiti (cm)
                    </label>
                    <input name="blockHeight" type="number" value={formData.blockHeight} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder="300" />
                  </div>
                </div>

                <div className="bg-pink-50 dark:bg-gray-700 border border-pink-200 dark:border-gray-600 rounded-lg p-5">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Soziali Medie</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instagram</label>
                      <input name="instagram" value={formData.instagram} onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder="@username" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TikTok</label>
                      <input name="tiktok" value={formData.tiktok} onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder="@username" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">YouTube</label>
                      <input name="youtube" value={formData.youtube} onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder="Channel" />
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-gray-700 border border-purple-200 dark:border-gray-600 rounded-lg p-5">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Video className="w-5 h-5" />Highlight-Video
                  </h4>
                  <VideoUpload value={formData.highlightVideo}
                    onChange={(v) => setFormData({ ...formData, highlightVideo: v })} label="Lad Dis Beschte Spiel-Highlight Ufe" />
                </div>

                <div className="bg-green-50 dark:bg-gray-700 border border-green-200 dark:border-gray-600 rounded-lg p-5">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Fähigkeite Selbstiischätzig</h4>
                  <div className="space-y-3">
                    <StarRating label="Annahme" value={formData.skillReceiving} onChange={(v) => setFormData({ ...formData, skillReceiving: v })} />
                    <StarRating label="Ufschlag" value={formData.skillServing} onChange={(v) => setFormData({ ...formData, skillServing: v })} />
                    <StarRating label="Aangriff" value={formData.skillAttacking} onChange={(v) => setFormData({ ...formData, skillAttacking: v })} />
                    <StarRating label="Block" value={formData.skillBlocking} onChange={(v) => setFormData({ ...formData, skillBlocking: v })} />
                    <StarRating label="Abwehr" value={formData.skillDefense} onChange={(v) => setFormData({ ...formData, skillDefense: v })} />
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-gray-700 border border-orange-200 dark:border-gray-600 rounded-lg p-5">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5" />Swiss Volley Lizenz (Optional)
                  </h4>
                  <ImageUpload label="Lad Lizenz-Foto Ufe" value={formData.swissVolleyLicense}
                    onChange={(v) => setFormData({ ...formData, swissVolleyLicense: v })} aspectRatio="banner" />
                </div>

                <div className="bg-blue-50 dark:bg-gray-700 border border-blue-200 dark:border-gray-600 rounded-lg p-5">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5" />Ausweiss/ID (Optional)
                  </h4>
                  <ImageUpload label="Lad Ausweiss-Foto Ufe" value={formData.ausweiss}
                    onChange={(v) => setFormData({ ...formData, ausweiss: v })} aspectRatio="banner" />
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600">
                    ← Zurück
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50">
                    Wiiter →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Achievements & Experience */}
            {step === 3 && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Erfolg & Erfahrig</h3>

                {/* Bio Section */}
                <div className="bg-blue-50 dark:bg-gray-700 border border-blue-200 dark:border-gray-600 rounded-lg p-5">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <User className="w-5 h-5" />Über Mich / Bio
                  </h4>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Verzell Über Dich, Din Spielstil, Dini Ziel, etc..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white resize-none"
                  />
                </div>

                {/* Achievements Section */}
                <div className="bg-yellow-50 dark:bg-gray-700 border border-yellow-200 dark:border-gray-600 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Trophy className="w-5 h-5" />Erfolg
                    </h4>
                    <button
                      type="button"
                      onClick={addAchievement}
                      className="flex items-center gap-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />Erfolg Hinzuefüge
                    </button>
                  </div>

                  {achievements.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      Nonig Erfolg Hinzugefügt. Klick "Erfolg Hinzuefüge" Zum Starte.
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
                                  placeholder="z.B. Schwiizermeister 2023, MVP Uszeichnig, etc."
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
                      <Trophy className="w-5 h-5" />Vereinserfahrig I Dä Schwiiz
                    </h4>
                    <div className="flex gap-2">
                      <Link
                        href="/clubs/submit"
                        target="_blank"
                        className="flex items-center gap-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
                      >
                        Club Mälde
                      </Link>
                      <button
                        type="button"
                        onClick={addClubExperience}
                        className="flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                      >
                        <Plus className="w-4 h-4" />Verein Hinzuefüge
                      </button>
                    </div>
                  </div>

                  {clubHistory.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      Nonig Vereinserfahrig Hinzugefügt. Klick "Verein Hinzuefüge" Zum Starte.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {clubHistory.map((club) => (
                        <div key={club.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-start justify-between mb-3">
                            <h5 className="font-medium text-gray-900 dark:text-white">Verein {clubHistory.indexOf(club) + 1}</h5>
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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vereinsname *</label>
                                <input
                                  type="text"
                                  value={club.clubName}
                                  onChange={(e) => updateClubExperience(club.id, 'clubName', e.target.value)}
                                  required
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                                  placeholder="Gib Vereinsname II"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  <Globe className="w-4 h-4 inline mr-1" />Land *
                                </label>
                                <select
                                  value={club.country}
                                  onChange={(e) => updateClubExperience(club.id, 'country', e.target.value)}
                                  required
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                                >
                                  {NATIONALITIES.map(country => <option key={country} value={country}>{country}</option>)}
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <Trophy className="w-4 h-4 inline mr-1" />Liga/Division *
                              </label>
                              <input
                                type="text"
                                value={club.league}
                                onChange={(e) => updateClubExperience(club.id, 'league', e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                                placeholder="z.B. NLA, 1. Liga, U19 Elite, etc."
                              />
                            </div>

                            {club.country !== 'Switzerland' && (
                              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                <p className="text-xs text-blue-800 dark:text-blue-200">
                                  <strong>Hiiwis:</strong> Verein Usserhalb Dä Schwiiz Werde Nur Zü Dinere Persönliche Historie Hinzugefügt Und Erschüne Nid I Üser Schwiizer Vereinsdatenbank.
                                </p>
                              </div>
                            )}

                            {!club.logo ? (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vereinslogo (Optional)</label>
                                <ImageUpload
                                  label="Lad Vereinslogo Ufe"
                                  value={club.logo}
                                  onChange={(v) => updateClubExperience(club.id, 'logo', v)}
                                  aspectRatio="square"
                                />
                              </div>
                            ) : (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vereinslogo</label>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2">
                                    <img 
                                      src={club.logo} 
                                      alt="Club Logo" 
                                      className="w-16 h-16 rounded-lg object-cover border-2 border-green-500 dark:border-green-400"
                                    />
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                      ✓ Ufelade
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => updateClubExperience(club.id, 'logo', '')}
                                    className="px-3 py-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
                                  >
                                    Logo Entferne
                                  </button>
                                </div>
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                  Logo Isch Bereits Ufelade. Zum Es Neus Logo Uufezlade, Entfern Zerscht S Bestehende.
                                </p>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jahr Vo</label>
                                <input
                                  type="number"
                                  value={club.yearFrom}
                                  onChange={(e) => updateClubExperience(club.id, 'yearFrom', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                                  placeholder="2020"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jahr Bis</label>
                                {club.currentClub ? (
                                  <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                                    <span className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                                      ✓ Aktuell
                                    </span>
                                  </div>
                                ) : (
                                  <input
                                    type="number"
                                    value={club.yearTo}
                                    onChange={(e) => updateClubExperience(club.id, 'yearTo', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                                    placeholder="2023"
                                  />
                                )}
                              </div>
                            </div>

                            <label className={`flex items-center space-x-2 cursor-pointer p-3 rounded-lg border-2 transition ${
                              club.currentClub 
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-600' 
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
                                Spiel Aktuell Do
                                {(club.currentClub || club.logo) && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-600 text-white">
                                    ✓ Aktiv
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
                <div className="bg-teal-50 dark:bg-gray-700 border border-teal-200 dark:border-gray-600 rounded-lg p-5">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.lookingForClub}
                      onChange={(e) => setFormData({ ...formData, lookingForClub: e.target.checked })}
                      className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Ich Sueche Aktiv En Verein</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Wähl Das Aa, Zum Für Rekrutierer Sichtbar Zü Werde</p>
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
                      <p className="font-semibold text-gray-900 dark:text-white mb-2">Nutzigsbedingige Und Dateschutz *</p>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        Ich Akzeptiere D <Link href="/terms" target="_blank" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 underline">Nutzigsbedingige</Link> Und D <Link href="/privacy" target="_blank" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 underline">Dateschutzerklärig</Link> Vo Habicht Volleyball. 
                        Ich Verstönd, Dass Mini Date Gmäss Schwiizerischem Dateschutzgsetz (DSG) Verarbeitet Werde Und Zum Zweck Vo Dä Rekrutierig Und Kontaktufnahm Verwändet Werde Chöi. 
                        Ich Cha Mini Iiwilligig Jederziit Widerüfe.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600">
                    ← Zurück
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50">
                    {loading ? 'Erstelle Profil...' : 'Profil Erstelle ✓'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Hesch Scho En Account? <Link href="/auth/login" className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium">Aamelde</Link>
        </p>
      </div>
    </div>
  );
}
