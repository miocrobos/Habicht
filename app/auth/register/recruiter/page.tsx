'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Mail, Lock, User, Calendar, Globe, MapPin, Briefcase, Eye, EyeOff, Upload, Plus, X } from 'lucide-react';
import ImageUpload from '@/components/shared/ImageUpload';

// Canton list
const CANTONS = [
  { code: 'ZH', name: 'Zürich' },
  { code: 'BE', name: 'Bern' },
  { code: 'LU', name: 'Luzern' },
  { code: 'UR', name: 'Uri' },
  { code: 'SZ', name: 'Schwyz' },
  { code: 'OW', name: 'Obwalden' },
  { code: 'NW', name: 'Nidwalden' },
  { code: 'GL', name: 'Glarus' },
  { code: 'ZG', name: 'Zug' },
  { code: 'FR', name: 'Freiburg' },
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
  { code: 'GE', name: 'Genève' },
  { code: 'JU', name: 'Jura' }
];

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
  "Cheftrainer",
  "Assistenztrainer",
  "Jugendtrainer",
  "Scout",
  "Athletiktrainer",
  "Videoanalyst",
  "Teammanager"
];

interface ClubAffiliation {
  id: string;
  clubName: string;
  logo: string;
  role: string;
  genderCoached: string;
  yearFrom: string;
  yearTo: string;
  currentClub: boolean;
}

export default function RecruiterRegisterPage() {
  const router = useRouter();
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
    coachRole: '',
    genderCoached: [] as string[],
    phone: '',
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
    if (p.length < 8) return { valid: false, message: 'Passwort Muss Mindestens 8 Zeiche Ha' };
    if (!/\d/.test(p)) return { valid: false, message: 'Passwort Muss E Zahl Enthalte' };
    if (!/[!@#$%^&*()]/.test(p)) return { valid: false, message: 'Passwort Muss Es Sonderzeiche Enthalte' };
    return { valid: true, message: '' };
  };

  const addClubAffiliation = () => {
    setClubHistory([...clubHistory, {
      id: Date.now().toString(),
      clubName: '',
      logo: '',
      role: '',
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
        setError('Passwörter Stimme Nid Überein'); 
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
        setError('Bitte Gib Din Geburtsdatum Ii'); 
        return; 
      }
      const age = Math.floor((new Date().getTime() - new Date(formData.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 18) { 
        setError('Alter Muss Mindestens 18 Si'); 
        return; 
      }
      if (!formData.nationality) { setError('Bitte Wähl Dini Nationalität'); return; }
      if (!formData.canton) { setError('Bitte Wähl Din Wohnkanton'); return; }
      if (!formData.clubName) { setError('Bitte Wähl Din Verein'); return; }
      if (!formData.coachRole) { setError('Bitte Wähl Dini Roll'); return; }
      if (formData.genderCoached.length === 0) { setError('Bitte Wähl Welches Gschlecht Du Trainiersch'); return; }
      setStep(3);
      return;
    }

    // Step 3 - Final submission
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
      setError(err.response?.data?.error || 'En Fehler Isch Ufträte');
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
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Rekrutierer Registrierig</h2>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Mail className="w-4 h-4 inline mr-1" />E-Mail *
                  </label>
                  <input name="email" type="email" required value={formData.email} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Lock className="w-4 h-4 inline mr-1" />Passwort (8+ Zeiche, Zahl, Symbol) *
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passwort Bestätige *</label>
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
                  Wiiter →
                </button>
              </div>
            )}

            {/* STEP 2: Personal & Professional Information */}
            {step === 2 && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Persönlichi & Berueflichi Informatione</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Calendar className="w-4 h-4 inline mr-1" />Geburtsdatum *
                  </label>
                  <input 
                    name="dateOfBirth" 
                    type="date" 
                    required 
                    value={formData.dateOfBirth} 
                    onChange={handleChange}
                    lang="de-CH"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" 
                    placeholder="tt.mm.jjjj"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Globe className="w-4 h-4 inline mr-1" />Nationalität *
                  </label>
                  <select name="nationality" required value={formData.nationality} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white">
                    <option value="">Wähl Nationalität</option>
                    {NATIONALITIES.map(nat => <option key={nat} value={nat}>{nat}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <MapPin className="w-4 h-4 inline mr-1" />Wohnkanton *
                  </label>
                  <select name="canton" required value={formData.canton} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white">
                    <option value="">Wähl Kanton</option>
                    {CANTONS.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <MapPin className="w-4 h-4 inline mr-1" />Gemeinde/Municipality
                  </label>
                  <input 
                    name="province" 
                    value={formData.province} 
                    onChange={handleChange}
                    placeholder="z.B. Winterthur, Bern, etc."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" 
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Optional - Gmeind I Dim Kanton</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Briefcase className="w-4 h-4 inline mr-1" />Aktuelle Verein *
                  </label>
                  <select name="clubName" required value={formData.clubName} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white">
                    <option value="">Wähl Verein</option>
                    {clubs.map(club => <option key={club.id} value={club.name}>{club.name} ({club.canton})</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Roll Im Verein *</label>
                  <select name="coachRole" required value={formData.coachRole} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white">
                    <option value="">Wähl Roll</option>
                    {COACH_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Team Gschlecht * (Mehrfach Uuswahl Möglich)</label>
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
                      <span className="text-gray-900 dark:text-white">♂ Männer</span>
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
                      <span className="text-gray-900 dark:text-white">♀ Fraue</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setStep(1)}
                    className="w-1/3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                    ← Zrugg
                  </button>
                  <button type="submit" disabled={loading}
                    className="w-2/3 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                    Wiiter →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Additional Information & Club History */}
            {step === 3 && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Zuesätzlichi Informatione</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefonnummer (Optional)</label>
                  <input 
                    name="phone" 
                    type="tel" 
                    value={formData.phone} 
                    onChange={handleChange}
                    placeholder="+41 79 123 45 67"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Über Mich (Optional)</label>
                  <textarea 
                    name="bio" 
                    rows={4} 
                    value={formData.bio} 
                    onChange={handleChange}
                    placeholder="Erzähl Es Bisseli Über Dich Und Dini Erfahrig..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Upload className="w-4 h-4 inline mr-1" />Trainer-Lizenz (Optional)
                  </label>
                  <ImageUpload 
                    label=""
                    value={formData.coachingLicense}
                    onChange={(base64) => setFormData({ ...formData, coachingLicense: base64 })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Upload className="w-4 h-4 inline mr-1" />Ausweiss (Optional)
                  </label>
                  <ImageUpload 
                    label=""
                    value={formData.ausweiss}
                    onChange={(base64) => setFormData({ ...formData, ausweiss: base64 })}
                  />
                </div>

                {/* Social Media */}
                <div className="bg-purple-50 dark:bg-gray-700 border border-purple-200 dark:border-gray-600 rounded-lg p-5">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Social Media (Optional)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Facebook</label>
                      <input 
                        name="facebook" 
                        type="text" 
                        value={formData.facebook} 
                        onChange={handleChange}
                        placeholder="Facebook Profil/Site URL"
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
                        placeholder="@username"
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
                        placeholder="@username"
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
                        placeholder="Channel URL"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white text-sm" 
                      />
                    </div>
                  </div>
                </div>

                {/* Achievements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Erfolge & Uszeichnige (Optional)
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={newAchievement}
                        onChange={(e) => setNewAchievement(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
                        placeholder="z.B. Schwizer Meischter 2023, NLA Uffstig..."
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white text-sm"
                      />
                      <button 
                        type="button"
                        onClick={addAchievement}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-1 text-sm font-medium"
                      >
                        <Plus className="w-4 h-4" /> Hinzuefüege
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Verein-Gschicht (Optional)</label>
                    <button 
                      type="button"
                      onClick={addClubAffiliation}
                      className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" /> Verein Hinzuefüege
                    </button>
                  </div>

                  {clubHistory.map((club) => (
                    <div key={club.id} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-3 bg-gray-50 dark:bg-gray-700/50">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">Verein</h4>
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
                          placeholder="Verein Name"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white text-sm"
                        />
                        
                        <div className="grid grid-cols-2 gap-3">
                          <select 
                            value={club.role}
                            onChange={(e) => updateClubAffiliation(club.id, 'role', e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white text-sm"
                          >
                            <option value="">Roll</option>
                            {COACH_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                          </select>
                          
                          <select 
                            value={club.genderCoached}
                            onChange={(e) => updateClubAffiliation(club.id, 'genderCoached', e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white text-sm"
                          >
                            <option value="">Team Gschlecht</option>
                            <option value="MALE">Männer</option>
                            <option value="FEMALE">Fraue</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Jahr Vo</label>
                            <input 
                              type="number"
                              value={club.yearFrom}
                              onChange={(e) => updateClubAffiliation(club.id, 'yearFrom', e.target.value)}
                              placeholder="2020"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Jahr Bis</label>
                            {club.currentClub ? (
                              <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                                <span className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-1 text-sm">
                                  ✓ Aktuell
                                </span>
                              </div>
                            ) : (
                              <input 
                                type="number"
                                value={club.yearTo}
                                onChange={(e) => updateClubAffiliation(club.id, 'yearTo', e.target.value)}
                                placeholder="2023"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white text-sm"
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
                            Schaff Aktuell Do
                          </span>
                        </label>

                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Verein Logo</label>
                          <ImageUpload 
                            label=""
                            value={club.logo}
                            onChange={(base64) => updateClubAffiliation(club.id, 'logo', base64)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setStep(2)}
                    className="w-1/3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                    ← Zrugg
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-2/3 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                    {loading ? 'Wird Glade...' : 'Registrierig Abschliesse ✓'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            Hesch Scho En Account? <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">Aamelde</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
