'use client';

import { useState } from 'react';
import axios from 'axios';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function SubmitClubPage() {
  const [formData, setFormData] = useState({
    submitterName: '',
    submitterEmail: '',
    clubName: '',
    league: '',
    canton: '',
    website: '',
    additionalInfo: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

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
        league: '',
        canton: '',
        website: '',
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
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
            Club Mälde
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Fehlt En Club I Üsere Datebank? Mäld Ihn Üs Und Mir Füege Ihn Dezue!
          </p>

          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-lg">
              ✓ Danke! Dini Mäldig Isch Üs Erreicht. Mir Prüefed Und Füege De Club Dezue.
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded-lg">
              ✗ Es Isch Es Problem Ufträtte. Bitte Versuech Es Später Nomol.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Submitter Information */}
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Dini Kontaktdate
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Din Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.submitterName}
                    onChange={(e) => setFormData({ ...formData, submitterName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Vorname Nachname"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Dini E-Mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.submitterEmail}
                    onChange={(e) => setFormData({ ...formData, submitterEmail: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="din.email@example.ch"
                  />
                </div>
              </div>
            </div>

            {/* Club Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Club Informatione
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Club Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.clubName}
                    onChange={(e) => setFormData({ ...formData, clubName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="z.B. Volley Bern"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Liga
                  </label>
                  <input
                    type="text"
                    value={formData.league}
                    onChange={(e) => setFormData({ ...formData, league: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="z.B. NLA, NLB, 1. Liga"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Kanton
                  </label>
                  <input
                    type="text"
                    value={formData.canton}
                    onChange={(e) => setFormData({ ...formData, canton: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="z.B. Bern, Zürich"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Websiite
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
                    Zuesätzlechi Informatione
                  </label>
                  <textarea
                    value={formData.additionalInfo}
                    onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Öppis Witersch Wo Mir Sötte Wüsse?"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Wird Gschickt...' : 'Club Mälde'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
