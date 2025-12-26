"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "react-hot-toast";

function ErrorBoundary({ error }: { error: any }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">Error loading hybrid profile</h1>
        <p className="text-gray-600 dark:text-gray-400">{error?.message || "An unexpected error occurred."}</p>
      </div>
    </div>
  );
}

export default function HybridProfilePage({ params }: { params: { id: string } }) {
  const { t } = useLanguage();
  const [hybrid, setHybrid] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [showZoom, setShowZoom] = useState(false); // Zoom state
  const [showBgModal, setShowBgModal] = useState(false); // Modal state
  const [selectedBg, setSelectedBg] = useState<string | null>(null);
  const [customColor, setCustomColor] = useState("#2563eb");
  const [backgroundImage, setBackgroundImage] = useState("");

  useEffect(() => {
    const fetchHybrid = async () => {
      try {
        setLoading(true);
        setError(null);
            const response = await axios.get(`/api/hybrids/${params.id}`); // No trailing comma
        if (response.data && response.data.hybrid) {
          setHybrid(response.data.hybrid);
        } else {
          setError({ message: t("hybridProfile.hybridNotFound") || "Hybrid Not Found" });
        }
      } catch (err: any) {
        setError(err);
        console.error("Error fetching hybrid:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHybrid();
  }, [params.id, t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t("hybridProfile.loadingProfile") || "Loading profile..."}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorBoundary error={error} />;
  }

  if (!hybrid) {
    return <ErrorBoundary error={{ message: t("hybridProfile.hybridNotFound") || "Hybrid Not Found" }} />;
  }

  // Background options (same as before)
  const BACKGROUND_OPTIONS = [
    { id: "solid-blue", name: "Blau", style: "#2563eb" },
    { id: "solid-green", name: "Grün", style: "#16a34a" },
    { id: "solid-purple", name: "Lila", style: "#9333ea" },
    { id: "solid-orange", name: "Orange", style: "#f97316" },
    { id: "solid-pink", name: "Pink", style: "#ec4899" },
    { id: "solid-yellow", name: "Gelb", style: "#eab308" },
    { id: "solid-teal", name: "Türkis", style: "#14b8a6" },
    { id: "solid-indigo", name: "Indigo", style: "#6366f1" },
    { id: "solid-dark", name: "Dunkel", style: "#1f2937" },
    { id: "solid-gray", name: "Grau", style: "#6b7280" },
    { id: "solid-black", name: "Schwarz", style: "#000000" },
  ];

  // Add this function inside the HybridProfilePage component
  async function saveBackgroundSettings() {
    try {
      await axios.post(`/api/hybrids/${params.id}/background`, {
        backgroundGradient: selectedBg,
        customColor,
        backgroundImage,
      });
      setShowBgModal(false);
      // Optionally, refresh profile data
      setLoading(true);
      const response = await axios.get(`/api/hybrids/${params.id}`);
      if (response.data && response.data.hybrid) {
        setHybrid(response.data.hybrid);
      }
      setLoading(false);
    } catch (err) {
      toast.error('Failed to save background settings.');
    }
  }

  // Move this function outside the return statement, at the top level of the component
  function getGradientStyle(id: string) {
    const gradients: Record<string, string> = {
      'gradient-sunset': 'linear-gradient(90deg, #ff7e5f, #feb47b)',
      'gradient-ocean': 'linear-gradient(90deg, #43cea2, #185a9d)',
      'gradient-rainbow': 'linear-gradient(90deg, #ff9966, #ff5e62, #00c3ff, #ffff1c)',
      'solid-blue': '#2563eb',
      'solid-green': '#16a34a',
      'solid-purple': '#9333ea',
      'solid-orange': '#f97316',
      'solid-pink': '#ec4899',
      'solid-yellow': '#eab308',
      'solid-teal': '#14b8a6',
      'solid-indigo': '#6366f1',
      'solid-dark': '#1f2937',
      'solid-gray': '#6b7280',
      'solid-black': '#000000',
      'solid-red': '#dc2626',
    };
    return gradients[id] || '#2563eb';
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{hybrid.firstName} {hybrid.lastName}</h1>
      {/* Render hybrid profile details here */}
      <p>{hybrid.email}</p>
      {/* ...other fields... */}
      <Link href="/hybrid" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
        {t("hybridProfile.backToOverview") || "Back to Overview"}
      </Link>

      {/* Hintergrund / Background display */}
      {hybrid.backgroundImage || hybrid.backgroundGradient || hybrid.customColor ? (
        <div className="mb-6">
          <div
            className="w-full h-40 rounded-xl mb-2"
            style={{
              background: hybrid.backgroundImage
                ? `url(${hybrid.backgroundImage}) center/cover no-repeat`
                : hybrid.backgroundGradient && hybrid.backgroundGradient !== 'custom'
                ? getGradientStyle(hybrid.backgroundGradient)
                : hybrid.customColor || '#2563eb',
            }}
          />
          <span className="text-gray-700 dark:text-gray-200 text-sm">
            {t('hybridProfile.backgroundPreview') || 'Profil-Hintergrund'}
          </span>
        </div>
      ) : null}

      {/* Profile Image with Zoom */}
      {hybrid.profileImage && (
        <>
          <div className="flex justify-center mb-6">
            <img
              src={hybrid.profileImage}
              alt={t('hybridProfile.profilePhotoAlt') || 'Profile Photo'}
              className="w-32 h-32 rounded-full object-cover border-4 border-habicht-600 shadow-lg cursor-zoom-in"
              onClick={() => setShowZoom(true)}
            />
          </div>
          {showZoom && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 relative max-w-xl w-full flex flex-col items-center">
                <button
                  type="button"
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                  onClick={() => setShowZoom(false)}
                >
                  <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' /></svg>
                </button>
                <img src={hybrid.profileImage} alt={t('hybridProfile.profilePhotoAlt') || 'Profile Photo'} className="w-full h-auto rounded-lg" />
              </div>
            </div>
          )}
        </>
      )}

      <button
        className="px-4 py-2 bg-gray-700 text-white rounded-lg mb-4"
        onClick={() => setShowBgModal(true)}
      >
        {t('hybridProfile.changeBackground') || 'Hintergrund Ändere'}
      </button>

      {showBgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-900 rounded-lg shadow-lg p-8 relative max-w-2xl w-full">
            <button
              className="absolute top-4 right-4 text-3xl text-white"
              onClick={() => setShowBgModal(false)}
            >
              &times;
            </button>
            <h2 className="text-3xl font-bold text-white mb-6">{t('hybridProfile.changeBackground') || 'Hintergrund Ändere'}</h2>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">{t('hybridProfile.chooseColor') || 'Farb Wähle'}</h3>
              <div className="grid grid-cols-4 gap-4 mb-4">
                {BACKGROUND_OPTIONS.map(bg => (
                  <button
                    key={bg.id}
                    className="rounded-lg border-2 border-gray-500 h-24"
                    style={{ background: bg.style }}
                    onClick={() => setSelectedBg(bg.id)}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-white">{t('hybridProfile.or') || 'Oder'}</span>
                <input
                  type="color"
                  value={customColor}
                  onChange={e => setCustomColor(e.target.value)}
                  className="w-10 h-10 border-2 border-gray-300 rounded-full cursor-pointer"
                />
              </div>
              <div className="mb-4">
                <label className="block text-white mb-2">{t('hybridProfile.chooseBackgroundImage') || 'Wähl Es Neus Hintergrundbild'}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = ev => setBackgroundImage(ev.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="block w-full text-white"
                />
                {backgroundImage && (
                  <img src={backgroundImage} alt="Preview" className="mt-2 rounded-lg max-h-32" />
                )}
              </div>
            </div>
            <button
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
              onClick={saveBackgroundSettings}
            >
              {t('hybridProfile.saveBackground') || 'Speichern'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
