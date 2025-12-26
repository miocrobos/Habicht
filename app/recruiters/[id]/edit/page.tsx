"use client";
import VideoUpload from '@/components/shared/VideoUpload';
import CountrySelect from '@/components/shared/CountrySelect';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { PaintBucket, Save, Loader2, Plus, Trash2, X, ZoomIn, RefreshCcw, Video, Trophy } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import ImageUpload from "@/components/shared/ImageUpload";

const BACKGROUND_OPTIONS = [
  { id: 'solid-blue', name: 'Blau', style: '#2563eb' },
  { id: 'solid-green', name: 'Grün', style: '#16a34a' },
  { id: 'solid-purple', name: 'Lila', style: '#9333ea' },
  { id: 'solid-orange', name: 'Orange', style: '#f97316' },
  { id: 'solid-pink', name: 'Pink', style: '#ec4899' },
  { id: 'solid-yellow', name: 'Gelb', style: '#eab308' },
  { id: 'solid-teal', name: 'Türkis', style: '#14b8a6' },
  { id: 'solid-indigo', name: 'Indigo', style: '#6366f1' },
  { id: 'solid-dark', name: 'Dunkel', style: '#1f2937' },
  { id: 'solid-gray', name: 'Grau', style: '#6b7280' },
  { id: 'solid-black', name: 'Schwarz', style: '#000000' },
  { id: 'solid-red', name: 'Rot', style: '#dc2626' },
  { id: 'gradient-sunset', name: 'Sunset', style: 'linear-gradient(90deg, #ff7e5f, #feb47b)' },
  { id: 'gradient-ocean', name: 'Ocean', style: 'linear-gradient(90deg, #43cea2, #185a9d)' },
  { id: 'gradient-rainbow', name: 'Rainbow', style: 'linear-gradient(90deg, #ff9966, #ff5e62, #00c3ff, #ffff1c)' },
];
// Custom Color Picker helper
const ColorPicker = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => (
  <input
    type="color"
    value={value}
    onChange={e => onChange(e.target.value)}
    className="w-10 h-10 border-2 border-gray-300 dark:border-gray-600 rounded-full cursor-pointer"
    aria-label="Custom Color Picker"
    style={{ background: value }}
  />
);




export default function RecruiterProfileEditPage({ params }: { params: { id: string } }) {
  const { t } = useLanguage();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<any>(null);
  const [selectedBg, setSelectedBg] = useState(BACKGROUND_OPTIONS[0]);
  const [clubHistory, setClubHistory] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [backgroundImage, setBackgroundImage] = useState('');
  const [showZoom, setShowZoom] = useState<false | 'background' | 'profile'>(false);
  const [customColor, setCustomColor] = useState('#2563eb');
  const [bgLoading, setBgLoading] = useState(false);

  // Add explicit types for club and index in map callbacks
  // Example: clubHistory.map((club: any, index: number) => ...)

  // Ensure all handlers are defined
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
    setClubHistory(clubHistory.filter((club: any) => club.id !== id));
  };

  const handleAddAchievement = () => {
    setAchievements([
      ...achievements,
      { id: `new-${Date.now()}`, text: '' },
    ]);
  };

  const handleRemoveAchievement = (id: string) => {
    setAchievements(achievements.filter((ach: any) => ach.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const response = await axios.put(`/api/recruiters/${params.id}/background`, {
        ...formData,
        clubHistory,
        achievements,
        backgroundGradient: selectedBg.id,
        customColor: selectedBg.id === 'custom' ? customColor : undefined,
        backgroundImage,
      });
      if (response.status === 200) {
        router.refresh();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "recruiterProfile.errorSavingRecruiterData");
    } finally {
      setSaving(false);
    }
  };

  // Sync background image and color with formData
  useEffect(() => {
    if (formData) {
      setBackgroundImage(formData.backgroundImage || '');
      if (formData.backgroundGradient === 'custom') {
        setCustomColor(formData.customColor || '#2563eb');
        setSelectedBg({ id: 'custom', name: 'Custom', style: formData.customColor || '#2563eb' });
      } else if (formData.backgroundGradient) {
        const found = BACKGROUND_OPTIONS.find(bg => bg.id === formData.backgroundGradient);
        if (found) setSelectedBg(found);
      }
    }
  }, [formData]);

  // Reset background to default
  const handleResetBackground = () => {
      setLoading(false);
  };

  // ...handlers for form fields, club history, achievements, etc...

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {error && (
          <div className="mb-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
            {t(error)}
          </div>
        )}

        {/* Club History Section - Unified 'Aktüell Club' Checkbox Highlight */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-habicht-600" /> Club-Gschicht
          </h2>
          {clubHistory.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 italic">Kei Club-Gschicht hinzugefügt</p>
          ) : (
            <div className="space-y-4">
              {clubHistory.map((club, index) => {
                const isInvalid = club.clubName && club.clubName.trim() !== '' && !club.currentClub && (!club.yearTo || club.yearTo.trim() === '');
                return (
                  <div key={club.id || index} className={`border rounded-lg p-4 ${isInvalid ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 dark:border-gray-600'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Club {index + 1}</h3>
                      <button
                        onClick={() => setClubHistory(clubHistory.filter((_, i) => i !== index))}
                        className="text-red-600 hover:text-red-700 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Club Name *</label>
                        <input
                          type="text"
                          value={club.clubName}
                          onChange={(e) => {
                            const value = e.target.value;
                            const updated = clubHistory.map((c, i) => i === index ? { ...c, clubName: value } : c);
                            setClubHistory(updated);
                          }}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="z.B. Volley Amriswil"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Liga *</label>
                        <input
                          type="text"
                          value={club.league}
                          onChange={(e) => {
                            const updated = clubHistory.map((c, i) => i === index ? { ...c, league: e.target.value } : c);
                            setClubHistory(updated);
                          }}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="z.B. NLA, 1. Liga, U19 Elite"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Land / Country</label>
                        <CountrySelect
                          value={club.country || 'Switzerland'}
                          onChange={v => {
                            const updated = clubHistory.map((c, i) => i === index ? { ...c, country: v } : c);
                            setClubHistory(updated);
                          }}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Von Jahr *</label>
                        <input
                          type="text"
                          value={club.yearFrom}
                          onChange={(e) => {
                            const updated = clubHistory.map((c, i) => i === index ? { ...c, yearFrom: e.target.value } : c);
                            setClubHistory(updated);
                          }}
                          placeholder="z.B. 2020"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bis Jahr {!club.currentClub && <span className="text-red-600">*</span>}</label>
                        {club.currentClub ? (
                          <div className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                            <span className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                              ✓ Aktuell
                            </span>
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={club.yearTo}
                            onChange={(e) => {
                              const updated = clubHistory.map((c, i) => i === index ? { ...c, yearTo: e.target.value } : c);
                              setClubHistory(updated);
                            }}
                            placeholder="z.B. 2023"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-habicht-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                          />
                        )}
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className={`flex items-center gap-2 cursor-pointer p-3 rounded-lg border-2 transition ${
                        club.currentClub 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-600' 
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}>
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
                          className="rounded text-habicht-600 focus:ring-habicht-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Aktuellä Club
                        </span>
                      </label>
                    </div>
                    {isInvalid && (
                      <div className="mt-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-3">
                        <p className="text-sm text-red-800 dark:text-red-200">
                          ⚠️ Bitte füll "Bis Jahr" üs oder markier dä Club als "Aktuellä Club"
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex justify-end mt-8">
          <button
            type="button"
            className="px-6 py-2 bg-habicht-600 hover:bg-habicht-700 text-white font-semibold rounded-lg shadow disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? t('editProfile.saving') : t('editProfile.saveButton')}
          </button>
        </div>
      </div>
    </div>
  );

}