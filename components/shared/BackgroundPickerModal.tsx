import React, { useState, useEffect, useRef } from "react";

type BackgroundOption = { id: string; name: string; style: string };

interface Props {
  onClose: () => void;
  onSave: (bg: BackgroundOption, image: string) => Promise<void>;
  backgroundOptions: BackgroundOption[];
  initialBg: BackgroundOption;
  initialCustomColor: string;
  initialImage: string;
  loading: boolean;
  onSavedBg?: (bg: BackgroundOption, customColor: string, image: string) => void;
}

const BackgroundPickerModal: React.FC<Props> = React.memo(
  ({ onClose, onSave, backgroundOptions, initialBg, initialCustomColor, initialImage, loading, onSavedBg }) => {
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

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newColor = e.target.value;
      setCustomColor(newColor);
      setSelectedBg({ id: 'custom', name: 'Custom', style: newColor });
      setBackgroundImage(''); // Clear any background image when selecting a color
      setError(null);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const imageData = ev.target?.result as string;
          setBackgroundImage(imageData);
          // When uploading an image, update selectedBg to indicate image mode
          setSelectedBg({ id: 'image', name: 'Custom Image', style: '' });
        };
        reader.readAsDataURL(file);
      }
    };

    const handleSave = async () => {
      if (!loading) {
        await onSave(selectedBg, backgroundImage);
        if (typeof onSavedBg === 'function') {
          onSavedBg(selectedBg, customColor, backgroundImage);
        }
        // Note: localStorage is now handled by parent components with profile-specific keys
        // Show popup notification
        const popup = document.createElement('div');
        popup.textContent = 'Hintergrund gespeichert!';
        popup.className = 'fixed top-6 right-6 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-[100] transition-all animate-fade-in';
        document.body.appendChild(popup);
        setTimeout(() => popup.remove(), 2000);
        // Auto-close modal after save
        if (typeof onClose === 'function') {
          setTimeout(() => onClose(), 300); // allow notification to show
        }
      }
    };

    // Determine the background style for preview
    const getPreviewBackground = () => {
      if (backgroundImage) {
        return `url(${backgroundImage}) center/cover no-repeat`;
      }
      if (selectedBg.id === 'custom') {
        return customColor;
      }
      return selectedBg.style;
    };

    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" 
        aria-modal="true" 
        role="dialog" 
        tabIndex={-1}
      >
        <div 
          ref={modalRef}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-xs w-full p-3 sm:p-4 relative"
        >
          <button
            className="absolute top-40 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-3xl leading-none z-10"
            onClick={onClose}
            aria-label="Schließen"
            tabIndex={0}
          >
            &times;
          </button>
          <h2 className="text-lg font-bold mb-4 dark:text-white pr-8">Profilhintergrund wählen</h2>
          
          {/* Solid Color Swatches */}
          <div className="mb-4">
            <label className="text-sm dark:text-gray-300 block mb-2">Farbe wählen:</label>
            <div className="flex flex-wrap gap-2">
              {backgroundOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`w-10 h-10 rounded border-2 transition-all ${selectedBg.id === option.id ? 'border-blue-500 ring-2 ring-blue-400' : 'border-gray-300'} flex items-center justify-center`}
                  style={{ background: option.style }}
                  aria-label={option.name}
                  onClick={() => {
                    setSelectedBg(option);
                    setCustomColor(option.style);
                    setBackgroundImage('');
                  }}
                >
                  {selectedBg.id === option.id && (
                    <span className="block w-4 h-4 rounded bg-white border border-blue-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Image Upload */}
          <div className="mb-2">
            <label htmlFor="imageUpload" className="text-sm dark:text-gray-300 block mb-1">
              Oder Bild hochladen:
            </label>
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-500 dark:text-gray-300
                file:mr-2 file:py-1 file:px-3
                file:rounded file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                dark:file:bg-gray-700 dark:file:text-gray-300"
            />
            {backgroundImage && (
              <img 
                src={backgroundImage} 
                alt="Preview" 
                className="mt-2 rounded-lg max-h-20 border-2 border-gray-300" 
              />
            )}
          </div>
          
          {/* Live Preview */}
          <div className="mb-4">
            <label className="text-sm dark:text-gray-300 block mb-1">Vorschau:</label>
            <div 
              style={{ 
                background: getPreviewBackground(),
                minHeight: '80px',
                borderRadius: '0.5rem',
                overflow: 'hidden'
              }} 
              className="relative w-full flex items-center justify-center border-2 border-gray-300"
            >
              <div className="absolute inset-0 bg-black/10 dark:bg-black/20" style={{ pointerEvents: 'none' }} />
              <span className="relative z-10 text-white text-sm font-semibold drop-shadow-lg">
                Live Vorschau
              </span>
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mb-2 text-red-600 text-sm">
              {error}
            </div>
          )}
          
          {/* Save Button */}
          <button
            className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed w-full transition-colors"
            onClick={handleSave}
            disabled={loading}
            type="button"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Speichern...
              </>
            ) : (
              'Speichern'
            )}
          </button>
        </div>
      </div>
    );
  }
);

export { BackgroundPickerModal };
export type { BackgroundOption };