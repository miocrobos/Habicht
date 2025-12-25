'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function SubmitClubPage() {
  const { t, language, setLanguage } = useLanguage();
  const router = useRouter();
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : undefined;
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  useEffect(() => {
    // Try to get lang from URL (e.g., /de/clubs/submit or ?lang=de)
    let urlLang = undefined;
    // Check for /[lang]/ in pathname
    const match = pathname.match(/^\/(gsw|de|fr|it|rm|en)(\/|$)/);
    if (match) {
      urlLang = match[1];
    } else if (searchParams && searchParams.get('lang')) {
      urlLang = searchParams.get('lang');
    }
    // Only set if different and valid
    if (urlLang && urlLang !== language && ['gsw','de','fr','it','rm','en'].includes(urlLang)) {
      setLanguage(urlLang as 'gsw' | 'de' | 'fr' | 'it' | 'rm' | 'en');
    }
    // If no URL lang, fallback to localStorage (handled by LanguageProvider on mount)
  }, [pathname, searchParams, language, setLanguage]);
  const [formData, setFormData] = useState({
    submitterName: '',
    submitterEmail: '',
    clubName: '',
    leagues: [] as string[], // Changed to array for multiple leagues
    canton: '',
    municipality: '',
    website: '',
    facebook: '',
    instagram: '',
    tiktok: '',
    twitter: '',
    youtube: '',
    founded: '',
    achievements: '',
    additionalInfo: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const AVAILABLE_LEAGUES = ['NLA', 'NLB', '1. Liga', '2. Liga', '3. Liga', '4. Liga', 'U23', 'U19', 'U17'];

  const handleLeagueToggle = (league: string) => {
    setFormData(prev => ({
      ...prev,
      leagues: prev.leagues.includes(league)
        ? prev.leagues.filter(l => l !== league)
        : [...prev.leagues, league]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await axios.post('/api/clubs/submit', formData);
      setSubmitStatus('success');
      setFormData({
        submitterName: '',
        submitterEmail: '',
        clubName: '',
        leagues: [],
        canton: '',
        municipality: '',
        website: '',
        facebook: '',
        instagram: '',
        tiktok: '',
        twitter: '',
        youtube: '',
        founded: '',
        achievements: '',
        additionalInfo: '',
      });
    } catch (error) {
      console.error('Error submitting club:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
            {t('clubSubmit.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t('clubSubmit.subtitle')}
          </p>

          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-lg">
              {t('clubSubmit.successMessage')}
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded-lg">
              {t('clubSubmit.errorMessage')}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Submitter Information */}
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                {t('clubSubmit.contactInfo')}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('clubSubmit.yourName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.submitterName}
                    onChange={(e) => setFormData({ ...formData, submitterName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder={t('clubSubmit.namePlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('clubSubmit.yourEmail')} *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.submitterEmail}
                    onChange={(e) => setFormData({ ...formData, submitterEmail: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder={t('clubSubmit.emailPlaceholder')}
                  />
                </div>
              </div>
            </div>

            {/* Club Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                {t('clubSubmit.clubInfo')}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('clubSubmit.clubName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.clubName}
                    onChange={(e) => setFormData({ ...formData, clubName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder={t('clubSubmit.clubNamePlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('clubSubmit.leagues')}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {AVAILABLE_LEAGUES.map((league) => (
                      <label
                        key={league}
                        className={`flex items-center justify-center px-3 py-2 border rounded-lg cursor-pointer transition ${
                          formData.leagues.includes(league)
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-red-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.leagues.includes(league)}
                          onChange={() => handleLeagueToggle(league)}
                          className="sr-only"
                        />
                        <span className="text-sm font-medium">{league}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{t('clubSubmit.multipleSelection')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('clubSubmit.canton')}
                  </label>
                  <input
                    type="text"
                    value={formData.canton}
                    onChange={(e) => setFormData({ ...formData, canton: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder={t('clubSubmit.cantonPlaceholder')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('clubSubmit.municipality')}
                  </label>
                  <input
                    type="text"
                    value={formData.municipality}
                    onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder={t('clubSubmit.municipalityPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('clubSubmit.foundedYear')}
                  </label>
                  <input
                    type="number"
                    value={formData.founded}
                    onChange={(e) => setFormData({ ...formData, founded: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder={t('clubSubmit.yearPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('clubSubmit.website')}
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="https://example.ch"
                  />
                </div>

                {/* Social Media Section */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    {t('clubSubmit.socialMedia')}
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Facebook
                      </label>
                      <input
                        type="url"
                        value={formData.facebook}
                        onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                        placeholder="https://facebook.com/clubname"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Instagram
                      </label>
                      <input
                        type="text"
                        value={formData.instagram}
                        onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                        placeholder="@clubname"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        TikTok
                      </label>
                      <input
                        type="text"
                        value={formData.tiktok}
                        onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                        placeholder="@clubname"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Twitter/X
                      </label>
                      <input
                        type="text"
                        value={formData.twitter}
                        onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                        placeholder="@clubname"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        YouTube
                      </label>
                      <input
                        type="url"
                        value={formData.youtube}
                        onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                        placeholder="https://youtube.com/@clubname"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('clubSubmit.achievements')}
                  </label>
                  <textarea
                    value={formData.achievements}
                    onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder={t('clubSubmit.achievementsPlaceholder')}
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('clubSubmit.achievementsHelp')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('clubSubmit.website')}
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="https://example.ch"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('clubSubmit.additionalInfo')}
                  </label>
                  <textarea
                    value={formData.additionalInfo}
                    onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder={t('clubSubmit.additionalInfoPlaceholder')}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('clubSubmit.submitting') : t('clubSubmit.submit')}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
