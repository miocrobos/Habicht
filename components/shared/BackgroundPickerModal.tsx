import React, { useState, useEffect, useRef } from "react";
import { BACKGROUND_OPTIONS } from "./backgroundOptions";

type BackgroundOption = { id: string; name: string; style: string };

interface Props {
  onClose: () => void;
  onSave: (bg: BackgroundOption, image: string) => Promise<void>;
  backgroundOptions: BackgroundOption[];
  initialBg: BackgroundOption;
  initialCustomColor: string;
  initialImage: string;
  loading: boolean;
}

const BackgroundPickerModal: React.FC<Props> = React.memo(
  ({ onClose, onSave, backgroundOptions, initialBg, initialCustomColor, initialImage, loading }) => {
    const [selectedBg, setSelectedBg] = useState<BackgroundOption>(initialBg);
    const [customColor, setCustomColor] = useState(initialCustomColor);
    const [backgroundImage, setBackgroundImage] = useState(initialImage);
    const [error, setError] = useState<string | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setSelectedBg(initialBg);
      setCustomColor(initialCustomColor);
      setBackgroundImage(initialImage);
      setError(null);
    }, [initialBg, initialCustomColor, initialImage]);

    // Focus trap and escape key
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
        if (e.key === "Tab" && modalRef.current) {
          const focusable = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          } else if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true" role="dialog" tabIndex={-1}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            onClick={onClose}
            aria-label="Schließen"
            tabIndex={0}
          >
            &times;
          </button>
          <h2 className="text-lg font-bold mb-4">Profilhintergrund wählen</h2>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {backgroundOptions.map((bg) => (
              <button
                key={bg.id}
                className={`rounded-lg border-2 h-24 ${selectedBg.id === bg.id ? 'border-habicht-600 scale-110' : 'border-gray-500'}`}
                style={{ background: bg.style }}
                onClick={() => setSelectedBg(bg)}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-white">Oder</span>
            <input
              type="color"
              value={customColor}
              onChange={e => {
                setCustomColor(e.target.value);
                setSelectedBg({ id: 'custom', name: 'Custom', style: e.target.value });
              }}
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2">Wähl Es Neus Hintergrundbild</label>
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
          <div className="mb-4">
            <div style={{ background: backgroundImage ? `url(${backgroundImage}) center/cover no-repeat` : selectedBg.id === 'custom' ? customColor : selectedBg.style, position: 'relative', minHeight: '100px', borderRadius: '1rem', overflow: 'hidden' }} className="relative w-full h-24 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/10 dark:bg-black/20" style={{ pointerEvents: 'none' }} />
              <span className="relative z-10 text-white text-lg font-semibold drop-shadow-lg">Live Vorschau</span>
            </div>
          </div>
          <button
            className="mt-4 px-6 py-2 bg-habicht-600 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={async () => {
              await onSave(selectedBg, backgroundImage);
            }}
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Speichern'}
          </button>
        </div>
      </div>
    );
  }
);


export { BackgroundPickerModal };
export type { BackgroundOption };


