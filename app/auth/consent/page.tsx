'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Eye, FileText, Lock, Users } from 'lucide-react';

export default function ConsentPage() {
  const router = useRouter();
  const [consents, setConsents] = useState({
    viewProfile: false,
    contactRecruiters: false,
    dataProcessing: false,
    termsOfService: false,
    privacyPolicy: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const allConsentsGiven = Object.values(consents).every(value => value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!allConsentsGiven) {
      setError('Bitte Akzeptier Alli Erforderliche Zuestimmige Zum Wiitermache');
      return;
    }

    setLoading(true);
    // In a real implementation, you would send consent data to the API
    // For now, we'll just redirect to the home page
    setTimeout(() => {
      router.push('/');
    }, 500);
  };

  const toggleConsent = (key: keyof typeof consents) => {
    setConsents({ ...consents, [key]: !consents[key] });
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Dateschutz & Zuestimmig</h2>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            Bevor Du Dis Profil Erstellsch, Bitte Prüef Und Akzeptier Die Folgende Bedingige
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                <p className="text-sm text-red-800 dark:text-red-200 font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Profile Visibility Consent */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-5 hover:border-red-300 dark:hover:border-red-700 transition">
                <label className="flex items-start space-x-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consents.viewProfile}
                    onChange={() => toggleConsent('viewProfile')}
                    className="w-5 h-5 mt-1 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-5 h-5 text-red-600" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">Profilsichtbarkeit *</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Ich Stimme Zü, Dass Mini Profilinformatione (Name, Foto, Körperliche Stats, Fähigkeite, Vereinshistorie Und Erfolg) 
                      Vo Andere Benutzer Gseh Werde Chönne, Inkl. Verein, Trainer Und Rekrutierer Uf Dä UniSports Plattform.
                    </p>
                  </div>
                </label>
              </div>

              {/* Contact By Recruiters */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-5 hover:border-red-300 dark:hover:border-red-700 transition">
                <label className="flex items-start space-x-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consents.contactRecruiters}
                    onChange={() => toggleConsent('contactRecruiters')}
                    className="w-5 h-5 mt-1 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-red-600" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">Kommunikations-Zuestimmig *</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Ich Stimme Zü, Dass Verein, Trainer Und Rekrutierer Mich Über S UniSports Plattform Chat-System 
                      Kontaktiere Chönne Bezüglich Potenzielle Möglichkeite, Probe-Training Oder Vereinsmitgliedschaft.
                    </p>
                  </div>
                </label>
              </div>

              {/* Data Processing */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-5 hover:border-red-300 dark:hover:border-red-700 transition">
                <label className="flex items-start space-x-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consents.dataProcessing}
                    onChange={() => toggleConsent('dataProcessing')}
                    className="w-5 h-5 mt-1 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-5 h-5 text-red-600" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">Dateverarbeitig *</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Ich Stimme Zü, Dass UniSports Mini Persönliche Date (Inkl. Fotos, Videos Und Leistigsstatistike) 
                      Im Iiverständnis Mit GDPR Und Schwiizer Dateschutzgesätz Verarbeitet Und Speicheret, 
                      Zum Zweck Vo Dä Plattform-Dienschtleistige.
                    </p>
                  </div>
                </label>
              </div>

              {/* Terms of Service */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-5 hover:border-red-300 dark:hover:border-red-700 transition">
                <label className="flex items-start space-x-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consents.termsOfService}
                    onChange={() => toggleConsent('termsOfService')}
                    className="w-5 h-5 mt-1 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-red-600" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">Nutzigsbedingige *</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Ich Ha Die{' '}
                      <a href="/terms" target="_blank" className="text-red-600 hover:text-red-700 underline">
                        Nutzigsbedingige
                      </a>
                      {' '}Gläse Und Stimme Dene Zü, Inkl. Zulässigi Nutzigsräglige, Inhaltsräglige Und Account-Verantwortige.
                    </p>
                  </div>
                </label>
              </div>

              {/* Privacy Policy */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-5 hover:border-red-300 dark:hover:border-red-700 transition">
                <label className="flex items-start space-x-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consents.privacyPolicy}
                    onChange={() => toggleConsent('privacyPolicy')}
                    className="w-5 h-5 mt-1 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-red-600" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">Dateschutzerklärig *</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Ich Ha Die{' '}
                      <a href="/privacy" target="_blank" className="text-red-600 hover:text-red-700 underline">
                        Dateschutzerklärig
                      </a>
                      {' '}Gläse Und Stimme Dere Zü, Inkl. Wie Mini Date Gsammlet, Bruucht, Teilt Und Geschützt Werde Uf Dä Plattform.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Hiiwis:</strong> Du Chasch Dini Dateschutz-Iistellige Verwalte Und Dini Zuestimmige Jederzit 
                I Dine Account-Iistellige Aktualisiere. Du Hesch S Rächt, Datelöschig Z Verlange Oder Dini Date 
                Jederzit Z Exportiere.
              </p>
            </div>

            <button
              type="submit"
              disabled={!allConsentsGiven || loading}
              className="w-full bg-red-600 text-white py-4 px-4 rounded-lg font-bold text-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verarbeite...' : allConsentsGiven ? 'Akzeptiere & Profil Erstelle ✓' : 'Bitte Akzeptier Alli Zuestimmige'}
            </button>

            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              Dur S Klicke Uf "Akzeptiere & Profil Erstelle" Bestätisch Du, Dass Du Mindeschtens 16 Jahr Alt Bisch 
              Und Die Rechtliche Handligsfähigkeit Hesch, Die Vereinbarig Iizgä.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
