'use client'

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sun, Moon, Globe2 } from 'lucide-react';

const LANGUAGES = [
  { code: 'gsw', label: 'Schwiizerd.' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'it', label: 'Italiano' },
  { code: 'en', label: 'English' },
  { code: 'rm', label: 'Rumantsch' },
];

export default function SettingsPopup() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="fixed bottom-4 right-4 sm:top-24 sm:bottom-auto z-40" ref={ref}>
      <button
        aria-label="Settings"
        className="bg-white dark:bg-gray-800 rounded-full shadow-lg p-2.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition border border-gray-200 dark:border-gray-600"
        onClick={() => setOpen((v) => !v)}
      >
        <Globe2 className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-200" />
      </button>
      {open && (
        <div className="absolute right-0 bottom-full mb-2 sm:bottom-auto sm:top-full sm:mt-2 w-[280px] sm:w-72 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 flex flex-col gap-3 sm:gap-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-200">{t('home.settings.theme')}</span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 sm:gap-2 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              {theme === 'light' ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />}
              <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-200">{theme === 'light' ? t('home.settings.light') : t('home.settings.dark')}</span>
            </button>
          </div>
          <div>
            <span className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-200 block mb-2">{t('home.settings.language')}</span>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as any)}
                  className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-medium transition border border-transparent whitespace-nowrap ${language === lang.code ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
