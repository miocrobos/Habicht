"use client";
import VideoUpload from '@/components/shared/VideoUpload';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { PaintBucket, Save, Loader2, Plus, Trash2, X, ZoomIn, RefreshCcw, Video } from "lucide-react";
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

  // Advanced background/image state (must be after formData is defined)
  const [backgroundImage, setBackgroundImage] = useState('');
  // showZoom: false | 'background' | 'profile'
  const [showZoom, setShowZoom] = useState<false | 'background' | 'profile'>(false);
  const [customColor, setCustomColor] = useState('#2563eb');

  // Sync background image and color with formData
  useEffect(() => {
    if (formData) {
      setBackgroundImage(formData.backgroundImage || '');
      setCustomColor(formData.customColor || '#2563eb');
      if (formData.backgroundGradient) {
        const found = BACKGROUND_OPTIONS.find(bg => bg.id === formData.backgroundGradient);
        if (found) setSelectedBg(found);
      }
    }
  }, [formData]);

  // Reset background to default
  const handleResetBackground = () => {
    setBackgroundImage('');
    setCustomColor('#2563eb');
    setSelectedBg(BACKGROUND_OPTIONS[0]);
    setFormData((prev: any) => ({ ...prev, backgroundImage: '', customColor: '#2563eb', backgroundGradient: BACKGROUND_OPTIONS[0].id }));
  };

  // Live preview style
  const previewStyle = {
    background: backgroundImage
      ? `url(${backgroundImage}) center/cover no-repeat`
      : selectedBg.id === 'custom' ? customColor : selectedBg.style,
    position: 'relative' as const,
    minHeight: '180px',
    borderRadius: '1rem',
    overflow: 'hidden',
    // Make the overlay more transparent
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
    if (status === 'authenticated') {
      loadRecruiterData();
    }
  }, [status, params?.id]);

  const loadRecruiterData = async () => {
    try {
      const response = await axios.get(`/api/recruiters/${params.id}`);
      const recruiter = response.data.recruiter;
      setFormData({
        firstName: recruiter.firstName || '',
        lastName: recruiter.lastName || '',
        email: recruiter.user.email || '',
        dateOfBirth: recruiter.dateOfBirth ? new Date(recruiter.dateOfBirth).toISOString().split('T')[0] : '',
        gender: recruiter.gender || '',
        nationality: recruiter.nationality || '',
        canton: recruiter.canton || '',
        city: recruiter.city || '',
        municipality: recruiter.municipality || '',
        employmentStatus: recruiter.employmentStatus || '',
        occupation: recruiter.occupation || '',
        schoolName: recruiter.schoolName || '',
        phone: recruiter.phone || '',
        profileImage: recruiter.profileImage || '',
        instagram: recruiter.instagram || '',
        tiktok: recruiter.tiktok || '',
        youtube: recruiter.youtube || '',
        highlightVideo: recruiter.highlightVideo || '',
        swissVolleyLicense: recruiter.swissVolleyLicense || '',
        ausweiss: recruiter.ausweiss || '',
        bio: recruiter.bio || '',
        backgroundGradient: recruiter.backgroundGradient || '',
      });
      setClubHistory(recruiter.clubHistory || []);
      setAchievements(recruiter.achievements || []);
      if (recruiter.backgroundGradient) {
        const savedBg = BACKGROUND_OPTIONS.find(bg => bg.id === recruiter.backgroundGradient);
        if (savedBg) setSelectedBg(savedBg);
      }
      setLoading(false);
    } catch (err) {
      setError(t('recruiterProfile.errorLoadingRecruiterData'));
      setLoading(false);
    }
  };

  // ...handlers for form fields, club history, achievements, etc...

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Background Picker Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <PaintBucket className="w-6 h-6 text-habicht-600" /> Profil-Hintergrund
          </h2>
          <div className="mb-4 flex flex-wrap gap-3 items-center">
            {BACKGROUND_OPTIONS.map(bg => (
              <button
                key={bg.id}
                type="button"
                onClick={() => {
                  setSelectedBg(bg);
                  setFormData((prev: any) => ({ ...prev, backgroundGradient: bg.id }));
                }}
                className={`w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all duration-150 ${selectedBg?.id === bg.id ? 'border-habicht-600 scale-110' : 'border-gray-300 dark:border-gray-600'}`}
                style={{ background: bg.style }}
                aria-label={bg.name}
              >
                {selectedBg?.id === bg.id && <span className="text-white text-lg font-bold">✓</span>}
              </button>
            ))}
            {/* Custom Color Picker */}
            <ColorPicker value={customColor} onChange={v => {
              setCustomColor(v);
              setSelectedBg({ id: 'custom', name: 'Custom', style: v });
              setFormData((prev: any) => ({ ...prev, customColor: v, backgroundGradient: 'custom' }));
            }} />
          </div>
          <div className="mb-4">
            <ImageUpload
              label="Hintergrundbild hochladen (optional)"
              value={backgroundImage}
              onChange={v => {
                setBackgroundImage(v);
                setFormData((prev: any) => ({ ...prev, backgroundImage: v }));
              }}
              aspectRatio="banner"
              helpText="Empfohlen: Querformat, max. 5MB."
            />
            {backgroundImage && (
              <button
                type="button"
                className="mt-2 flex items-center gap-2 text-habicht-600 hover:underline"
                onClick={() => setShowZoom('background')}
              >
                <ZoomIn className="w-5 h-5" /> Bild vergrößern
              </button>
            )}
          </div>
          <div className="mb-4 flex gap-3">
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
              onClick={handleResetBackground}
            >
              <RefreshCcw className="w-4 h-4" /> Zurücksetzen
            </button>
          </div>
          {/* Live Preview */}
          <div className="mt-4">
            <div style={previewStyle} className="relative w-full h-40 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/10 dark:bg-black/20" style={{ pointerEvents: 'none' }} />
              <span className="relative z-10 text-white text-lg font-semibold drop-shadow-lg">Live Vorschau</span>
            </div>
          </div>
        </div>

        {/* Zoom Modal */}
        {showZoom === 'background' && backgroundImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 relative max-w-3xl w-full">
              <button
                type="button"
                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                onClick={() => setShowZoom(false)}
              >
                <X className="w-5 h-5" />
              </button>
              <img src={backgroundImage} alt="Zoomed Background" className="w-full h-auto rounded-lg" />
            </div>
          </div>
        )}

        {/* Profile Photo with Zoom */}
        <div className="mt-8 flex flex-col items-center">
          {formData?.profileImage && (
            <>
              <img
                src={formData.profileImage}
                alt="Profilfoto"
                className="w-32 h-32 rounded-full object-cover border-4 border-habicht-600 shadow-lg cursor-zoom-in"
                onClick={() => setShowZoom('profile')}
              />
              {showZoom === 'profile' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                  <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 relative max-w-xl w-full flex flex-col items-center">
                    <button
                      type="button"
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                      onClick={() => setShowZoom(false)}
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <img src={formData.profileImage} alt="Profilfoto Zoom" className="w-full h-auto rounded-lg" />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        {/* Photo Upload Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {t('editProfile.profilePhoto')}
          </h2>
          <ImageUpload
            label={t('editProfile.uploadProfilePhoto')}
            value={formData?.profileImage}
            onChange={(v: string) => setFormData((prev: any) => ({ ...prev, profileImage: v }))}
            aspectRatio="square"
          />
        </div>

        {/* Video Upload Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Video className="w-5 h-5 text-habicht-600" /> Highlight Videos
          </h2>
          <div className="space-y-3">
            {(formData?.highlightVideos || []).map((video: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <VideoUpload
                  value={video}
                  onChange={v => {
                    const updated = [...(formData?.highlightVideos || [])];
                    updated[idx] = v;
                    setFormData((prev: any) => ({ ...prev, highlightVideos: updated }));
                  }}
                />
                <button
                  type="button"
                  className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                  onClick={() => {
                    const updated = [...(formData?.highlightVideos || [])];
                    updated.splice(idx, 1);
                    setFormData((prev: any) => ({ ...prev, highlightVideos: updated }));
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-2 bg-habicht-600 text-white rounded-lg hover:bg-habicht-700"
              onClick={() => setFormData((prev: any) => ({ ...prev, highlightVideos: [...(formData?.highlightVideos || []), ''] }))}
            >
              <Plus className="w-4 h-4" /> Video Hinzufügen
            </button>
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {t('editProfile.documents')}
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('editProfile.swissVolleyLicense')}
              </label>
              <ImageUpload
                label={t('editProfile.uploadLicense')}
                value={formData?.swissVolleyLicense}
                onChange={(v: string) => setFormData((prev: any) => ({ ...prev, swissVolleyLicense: v }))}
                aspectRatio="banner"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('editProfile.idDocument')}
              </label>
              <ImageUpload
                label={t('editProfile.uploadId')}
                value={formData?.ausweiss}
                onChange={(v: string) => setFormData((prev: any) => ({ ...prev, ausweiss: v }))}
                aspectRatio="banner"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// TODO: Refactor this page to match the unified structure and UX of the restored player edit page, including persistent and instant background color selection.
