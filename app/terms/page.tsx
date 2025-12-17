import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <Link href="/" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 mb-6 inline-block">
          ← Zrugg Zu Homepage
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Nutzigsbedingige
        </h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Letschti Aktualisierig: {new Date().toLocaleDateString('de-CH')}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Geltungsbereich
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Die Nutzigsbedingige Reglä D Verwendig Vo Dä Plattform Habicht Volleyball (habicht-volleyball.ch). 
              Mit Dä Registrierig Akzeptiersch Du Dini Bedingige.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Registrierig Und Benutzerkonto
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Du Muesch Dichtig Und Vollständigi Informatione Aagä. Du Bisch Verantw\u00f6rtlich Für D Sicherheit Vo Dim Passwort. 
              Du Darfsch Nur E Konto Erstelle Und Muesch Mindestens 13 Jahr Alt Si.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. Nutzung Vo Dä Plattform
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              D Plattform Dient Zum Zweck Vo D\u00e4 Vernetzung Zwüsche Volleyballspielere Und Rekrutierer. 
              Du Verpflichtesch Dich, Kei Beleidigendi, Diskriminierendi Oder Illegali Inhalt Z Teile.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Dateschutz
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Dini Persönliche Date Werde Gmäss Dä <Link href="/privacy" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 underline">Dateschutzerklärig</Link> Verarbeitet. 
              Dini Profilinformatione Sind Für Anderi Registrierti Benutzer Sichtbar.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Haftungsausschluss
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Habicht Volleyball Übernimmt Kei Haftung Für D Richtigkeit Vo Benutzer-Inhalte Oder Für Schäde, 
              Wo Durch D Nutzung Vo D\u00e4 Plattform Entstönd. D Nutzung Erfolgt Uf Eigni Gfahre.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Kündigg Und Löschig
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Du Chasch Di Konto Jederziit Lösche. Mir Behälte Üs S Rächt Vor, Konten Z Sperr\u00e4, 
              Wo Gäge Dini Bedingige Verstosse.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Änderigen
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Mir Chöi Dini Nutzigsbedingige Jederziit Aapasse. Änderige Werde Per E-Mail Mitteilt 
              Oder Uf D\u00e4 Plattform Veröffentlicht.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Anwendbares Rächt
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Es Gilt Schwiizerisches Rächt. Gerichtsstand Isch Zürich, Schwiiz.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              9. Kontakt
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Bi Froge Zu Dä Nutzigsbedingige Chasch Du Üs Kontaktiere: <br />
              <a href="mailto:support@habicht-volleyball.ch" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                support@habicht-volleyball.ch
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
