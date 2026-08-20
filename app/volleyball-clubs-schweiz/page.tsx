import Link from 'next/link';

export const metadata = {
  title: 'Volleyball Clubs Schweiz | Habicht',
  description: 'Volleyball Clubs in der Schweiz entdecken: Teams, Vereine, Spielstärke, Netzwerk und Informationsquellen für Schweizer Volleyball-Interessierte.',
  keywords: [
    'Volleyball Clubs Schweiz',
    'Volleyball Vereine Schweiz',
    'Swiss volleyball clubs',
    'Volleyball teams Switzerland',
    'Habicht clubs',
  ],
};

export default function VolleyballClubsSchweizPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-red-600 dark:text-red-400">
            Volleyball Clubs Schweiz
          </p>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white sm:text-5xl">
            Schweizer Volleyballvereine und Teams besser finden.
          </h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">Für Spieler</h2>
            <p className="text-base leading-7 text-gray-700 dark:text-gray-300">
              Spieler können über Habicht schneller passende Vereine, Teams und Trainingsmöglichkeiten in der Schweizer Volleyballszene entdecken.
            </p>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">Für Vereine</h2>
            <p className="text-base leading-7 text-gray-700 dark:text-gray-300">
              Vereine profitieren von einer klaren Darstellung ihrer Präsenz, Sichtbarkeit und Verfügbarkeit im Netzwerk der Schweizer Volleyball-Community.
            </p>
          </section>
        </div>

        <section className="mt-10 rounded-2xl bg-white p-8 shadow-sm dark:bg-gray-800">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Warum Clubs-Suche wichtig ist</h2>
          <p className="text-base leading-7 text-gray-700 dark:text-gray-300">
            Eine gute Vereins- und Team-Suche reduziert Reibung, spart Zeit und hilft dabei, bessere sportliche Verbindungen zu finden. Gerade im Volleyball ist die richtige
            Passung zwischen Team, Trainingsniveau und Entwicklung oft entscheidend.
          </p>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/clubs" className="rounded-full bg-red-600 px-5 py-3 font-medium text-white hover:bg-red-700">
            Clubs durchsuchen
          </Link>
          <Link href="/players" className="rounded-full border border-gray-300 bg-white px-5 py-3 font-medium text-gray-800 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100">
            Spieler entdecken
          </Link>
          <Link href="/contact" className="rounded-full border border-gray-300 bg-white px-5 py-3 font-medium text-gray-800 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100">
            Kontakt
          </Link>
        </div>
      </div>
    </main>
  );
}
