import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <Link href="/" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 mb-6 inline-block">
          ← Zrugg Zu Homepage
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Dateschutzerklärig
        </h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Letschti Aktualisierig: {new Date().toLocaleDateString('de-CH')}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Verantwortliche Stelle
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Habicht Volleyball<br />
              Schwiiz<br />
              E-Mail: <a href="mailto:support@habicht-volleyball.ch" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">support@habicht-volleyball.ch</a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Erhebung Und Verarbeitig Vo Date
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Mir Erhäbe Und Verarbeite Folgendi Persönlichi Date:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Name, E-Mail-Adresse, Geburtsdatum</li>
              <li>Profilbilder Und Hochgeladeni Videos</li>
              <li>Volleyballbezogeni Informatione (Position, Verein, Fähigkeite)</li>
              <li>Chat-Nachrichte Zwüsche Benutzer</li>
              <li>Technischi Date (IP-Adresse, Browser, Gerät)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. Zweck Vo Dä Dateverarbeitig
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Dini Date Werde Verarbeitet Für:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>D Erstellig Und Verwaltung Vo Dim Benutzerkonto</li>
              <li>D Vernetzung Zwüsche Spieler Und Rekrutierer</li>
              <li>D Kommunikation Zwüsche Benutzer (Chat-Funktio)</li>
              <li>D Verbesserig Vo D\u00e4 Plattform</li>
              <li>D Eihaltung Vo Gsetzliche Verpflichtige</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Rechtsgrundlag
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              D Verarbeitig Vo Dine Date Basiert Uf:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Dinere Iiwilligung (Art. 6 Abs. 1 lit. a DSG)</li>
              <li>D\u00e4 Erfüllung Vom Vertrag (Art. 6 Abs. 1 lit. b DSG)</li>
              <li>Berechtigti Interesse Vo Üs Oder Dritte (Art. 6 Abs. 1 lit. f DSG)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Weitergab Vo Date
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Dini Date Werde Nur Wiitergäh A:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Anderi Registrierti Benutzer (Profilinformatione)</li>
              <li>Technischi Dienstleister (z.B. Hosting, Datenbank)</li>
              <li>Behörde, Falls Gsetzlich Vorgeschrüh</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Mir Verkaufe Oder Vermiete Dini Date Nie A Dritti.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Speicherdauer
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Dini Date Werde Gspicheret, Solanng Du E Aktives Konto Hesch. 
              Nach D\u00e4 Löschig Vo Dim Konto Werde Dini Date Innerhalb Vo 30 Täg Entfernt, 
              Ussert Es Bestoht E Gsetzlichi Ufbewahrigspflicht.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Dini Rächte
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Du Hesch S Rächt Uf:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li><strong>Uskunft:</strong> Du Chasch Jederziit Frögä, Welchi Date Mir Vo Dir Hä</li>
              <li><strong>Berichtigg:</strong> Du Chasch Falschi Date Korrigiere</li>
              <li><strong>Löschig:</strong> Du Chasch D Löschig Vo Dine Date Verlange</li>
              <li><strong>Iischränkung:</strong> Du Chasch D Verarbeitig Iischränke</li>
              <li><strong>Datenübertragbarkeit:</strong> Du Chasch Dini Date I Enem Strukturierte Format Verlange</li>
              <li><strong>Widerruef:</strong> Du Chasch Dini Iiwilligung Jederziit Wider\u00fcfe</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Zum Usüebig Vo Dine Rächte Chasch Du Üs Kontaktiere Über: <br />
              <a href="mailto:support@habicht-volleyball.ch" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                support@habicht-volleyball.ch
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Sicherheit
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Mir Setze Technischi Und Organisatorischi Massnahme Ii, 
              Zum Dini Date Vor Unbefugtem Zuegriff, Verlust Oder Missbruch Z Schütze. 
              Dini Date Werde Verschlüsselt Überträge (SSL/TLS).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              9. Cookies Und Tracking
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Mir Verwände Technisch Notwendigi Cookies, Zum D Funktionalität Vo D\u00e4 Plattform Z Gwährleiste. 
              Mir Setze Kei Cookies Für Werbezweck II.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              10. Änderige A Dä Dateschutzerklärig
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Mir Chöi Dini Dateschutzerklärig Jederziit Aktualisiere. 
              D Aktuelli Version Findsch Immer Under habicht-volleyball.ch/privacy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              11. Beschwerderächt
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Falls Du Dä Meinig Bisch, Dass D Verarbeitig Vo Dine Date Gäge S Dateschutzgsetz Verstosst, 
              Chasch Du Beschwerde Iireiche Bim:
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Eidgenössische Dateschutz- Und Öffentlichkeitsbeauftragte (EDÖB)<br />
              Feldeggweg 1<br />
              3003 Bern<br />
              Schwiiz<br />
              <a href="https://www.edoeb.admin.ch" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                www.edoeb.admin.ch
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
