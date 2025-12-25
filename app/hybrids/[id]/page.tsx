"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { PaintBucket, Save, Loader2, Plus, Trash2, X, ZoomIn, RefreshCcw, Trophy, FileText } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import ImageUpload from "@/components/shared/ImageUpload";
import CountrySelect from "@/components/shared/CountrySelect";

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
  { id: "solid-red", name: "Rot", style: "#dc2626" },
  { id: "gradient-sunset", name: "Sunset", style: "linear-gradient(90deg, #ff7e5f, #feb47b)" },
  { id: "gradient-ocean", name: "Ocean", style: "linear-gradient(90deg, #43cea2, #185a9d)" },
  { id: "gradient-rainbow", name: "Rainbow", style: "linear-gradient(90deg, #ff9966, #ff5e62, #00c3ff, #ffff1c)" },
];

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

export default function HybridProfilePage({ params }: { params: { id: string } }) {
  const { t } = useLanguage();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [selectedBg, setSelectedBg] = useState(BACKGROUND_OPTIONS[0]);
  const [customColor, setCustomColor] = useState("#2563eb");
  const [backgroundImage, setBackgroundImage] = useState("");
  const [showZoom, setShowZoom] = useState<false | "background" | "profile">(false);
  const [cvExportType, setCvExportType] = useState<string | null>(null);
  const [cvExportLang, setCvExportLang] = useState<string | null>(null);
  const [showCvTypePopup, setShowCvTypePopup] = useState(false);
  const [showCvLangPopup, setShowCvLangPopup] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (status === "authenticated") {
      loadHybridProfile();
    }
  }, [status, params?.id]);

  const loadHybridProfile = async () => {
    try {
      const response = await axios.get(`/api/hybrids/${params.id}`);
      const hybrid = response.data.hybrid;
      setProfile(hybrid);
      setSelectedBg(
        BACKGROUND_OPTIONS.find(bg => bg.id === hybrid.backgroundGradient) || BACKGROUND_OPTIONS[0]
      );
      setCustomColor(hybrid.customColor || "#2563eb");
      setBackgroundImage(hybrid.backgroundImage || "");
      setLoading(false);
    } catch (err) {
      setError(t("hybridProfile.errorLoadingHybridData"));
      setLoading(false);
    }
  };

  const handleCvExport = () => {
    setShowCvTypePopup(true);
  };

  const handleCvTypeSelect = (type: string) => {
    setCvExportType(type);
    setShowCvTypePopup(false);
    setShowCvLangPopup(true);
  };

  const handleCvLangSelect = (lang: string) => {
    setCvExportLang(lang);
    setShowCvLangPopup(false);
    // TODO: Implement actual CV export logic here
    // e.g. generateCV(profile, type, lang)
    alert(`Exporting ${cvExportType === "player" ? "Player" : "Recruiter"} CV in ${lang}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-12 h-12 animate-spin text-habicht-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Lade Profil...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-habicht-600 dark:text-habicht-400 text-lg">Hybrid Nid Gfunde</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {error && (
          <div className="mb-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
            {t(error)}
          </div>
        )}
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
                onClick={() => setSelectedBg(bg)}
                className={`w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all duration-150 ${selectedBg?.id === bg.id ? "border-habicht-600 scale-110" : "border-gray-300 dark:border-gray-600"}`}
                style={{ background: bg.style }}
                aria-label={bg.name}
              >
                {selectedBg?.id === bg.id && <span className="text-white text-lg font-bold">★</span>}
              </button>
            ))}
            {/* Custom Color Picker */}
            <ColorPicker value={customColor} onChange={v => {
              setCustomColor(v);
              setSelectedBg({ id: "custom", name: "Custom", style: v });
            }} />
          </div>
          <div className="mb-4">
            <ImageUpload
              label="Hintergrundbild hochladen (optional)"
              value={backgroundImage}
              onChange={setBackgroundImage}
              aspectRatio="banner"
              helpText="Empfohlen: Querformat, max. 5MB."
            />
            {backgroundImage && (
              <button
                type="button"
                className="mt-2 flex items-center gap-2 text-habicht-600 hover:underline"
                onClick={() => setShowZoom("background")}
              >
                <ZoomIn className="w-5 h-5" /> Bild vergrößern
              </button>
            )}
          </div>
          {/* Live Preview */}
          <div className="mt-4">
            <div style={{ background: backgroundImage ? `url(${backgroundImage}) center/cover no-repeat` : selectedBg.id === "custom" ? customColor : selectedBg.style, position: "relative", minHeight: "180px", borderRadius: "1rem", overflow: "hidden" }} className="relative w-full h-40 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/10 dark:bg-black/20" style={{ pointerEvents: "none" }} />
              <span className="relative z-10 text-white text-lg font-semibold drop-shadow-lg">Live Vorschau</span>
            </div>
          </div>
        </div>
        {/* CV Export Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-habicht-600" /> CV Export
          </h2>
          <button
            type="button"
            className="px-4 py-2 bg-habicht-600 text-white rounded-lg hover:bg-habicht-700 font-semibold"
            onClick={handleCvExport}
          >
            CV Exportieren
          </button>
          {/* CV Type Popup */}
          {showCvTypePopup && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4">CV Typ Wählen</h3>
                <button className="px-4 py-2 bg-habicht-600 text-white rounded-lg mr-2" onClick={() => handleCvTypeSelect("player")}>Player CV</button>
                <button className="px-4 py-2 bg-habicht-600 text-white rounded-lg" onClick={() => handleCvTypeSelect("recruiter")}>Recruiter CV</button>
                <button className="ml-4 text-gray-500" onClick={() => setShowCvTypePopup(false)}>Abbrechen</button>
              </div>
            </div>
          )}
          {/* CV Language Popup */}
          {showCvLangPopup && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4">Sprache Wählen</h3>
                <button className="px-4 py-2 bg-habicht-600 text-white rounded-lg mr-2" onClick={() => handleCvLangSelect("de")}>Deutsch</button>
                <button className="px-4 py-2 bg-habicht-600 text-white rounded-lg mr-2" onClick={() => handleCvLangSelect("en")}>Englisch</button>
                <button className="px-4 py-2 bg-habicht-600 text-white rounded-lg" onClick={() => handleCvLangSelect("fr")}>Französisch</button>
                <button className="ml-4 text-gray-500" onClick={() => setShowCvLangPopup(false)}>Abbrechen</button>
              </div>
            </div>
          )}
        </div>
        {/* ...other profile sections (personal info, club history, achievements, etc.) should be added here, following the player profile structure... */}
      </div>
    </div>
  );
}
