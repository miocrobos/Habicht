'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Mail, ArrowRight } from 'lucide-react';

function RegistrationSuccessContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const emailSent = searchParams.get('emailSent') === 'true';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Account Erfolgriich Erstellt!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Willkomme Bi UniSports! 🎉
            </p>
          </div>

          {/* Email Verification Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  {emailSent ? '📧 Verifizierings-E-Mail Gsendet!' : '📧 E-Mail-Verifizierig Erforderlich'}
                </h2>
                <div className="space-y-3 text-blue-800 dark:text-blue-200">
                  {emailSent ? (
                    <>
                      <p>
                        Mir Hän Dir En Verifizierings-E-Mail Gsendet Aa:
                      </p>
                      <p className="font-semibold bg-white dark:bg-gray-800 px-3 py-2 rounded border border-blue-300 dark:border-blue-700">
                        {email || 'Dini E-Mail-Adresse'}
                      </p>
                      <div className="pt-2">
                        <p className="font-medium mb-2">📋 Nächschte Schritte:</p>
                        <ol className="list-decimal list-inside space-y-1 text-sm">
                          <li>Öffne Din E-Mail-Postfach</li>
                          <li>Suech Nach Dä E-Mail Vo UniSports</li>
                          <li>Klick Uf "E-Mail Verifiziere"</li>
                          <li>Du Wirsch Automatisch Zü Dim Profil Wiitergeleitet</li>
                        </ol>
                      </div>
                    </>
                  ) : (
                    <p>
                      Bitte Pr\u00fcef Din E-Mail-Postfach F\u00fcr Wiitri Informatione.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>⚠️ Wichtig:</strong> Falls Du Kei E-Mail Gsehsch, Pr\u00fcef Din Spam-Ordner. 
              Dä Verifizierings-Link Isch 24 Stunde G\u00fcltig.
            </p>
          </div>

          {/* Development Mode Note */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>🔧 Development Mode:</strong> Check your terminal/console for the verification link.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link
              href="/auth/login"
              className="flex items-center justify-center gap-2 w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Zür Aamäldig
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Zür Startsiite
            </Link>
          </div>

          {/* Additional Help */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Hesch Prob läm Mit Dä Verifizierig?{' '}
              <a href="mailto:support@unisports.ch" className="text-red-600 hover:text-red-700 font-medium">
                Kontaktier Üs
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegistrationSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Lade...</p>
        </div>
      </div>
    }>
      <RegistrationSuccessContent />
    </Suspense>
  );
}
