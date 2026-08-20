import Link from 'next/link';

export const metadata = {
  title: 'Volleyball Training Schweiz | Habicht',
  description: 'Volleyball Training in der Schweiz: Informationen zu Teams, Vereinen, Trainingsmöglichkeiten und dem Schweizer Volleyballnetzwerk mit Habicht.',
  keywords: [
    'Volleyball Training Schweiz',
    'Volleyball Verein Schweiz',
    'Volleyball Trainingsmöglichkeiten',
    'Swiss volleyball training',
    'Volleyball clubs Switzerland',
    'Habicht training',
  ],
};

export default function VolleyballTrainingPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-red-600 dark:text-red-400">
            Volleyball Training
          </p>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white sm:text-5xl">
            Volleyballtraining und Vereins-Connection in der Schweiz.
          </h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">Für ambitionierte Spieler</h2>
            <p className="text-base leading-7 text-gray-700 dark:text-gray-300">
              Training ist nicht nur ein körperlicher Prozess, sondern auch ein Weg zur Sichtbarkeit. Wer sich im Schweizer Volleyballsystem richtig positioniert,
              findet leichter Zugang zu Clubs, Teams und passenden Möglichkeiten.
            </p>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">Für Vereine und Scouts</h2>
            <p className="text-base leading-7 text-gray-700 dark:text-gray-300">
              Vereine und Scouts profitieren von klarer Übersicht, besseren Verbindungen und schnellerer Auffindbarkeit von Profilen im Schweizer Volleyballbereich.
            </p>
          </section>
        </div>

        <section className="mt-10 rounded-2xl bg-white p-8 shadow-sm dark:bg-gray-800">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Die wichtigsten Vorteile</h2>
          <ul className="space-y-3 text-base leading-7 text-gray-700 dark:text-gray-300">
            <li>• Bessere Sichtbarkeit für Spieler und Vereine</li>
            <li>• Mehr Transparenz im Schweizer Volleyball-Ökosystem</li>
            <li>• Schnellere Verbindung von Talent und geeigneten Teams</li>
            <li>• Stärkere Orientierung bei Trainings- und Vereinsentscheidungen</li>
          </ul>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/clubs" className="rounded-full bg-red-600 px-5 py-3 font-medium text-white hover:bg-red-700">
            Clubs durchsuchen
          </Link>
          <Link href="/about" className="rounded-full border border-gray-300 bg-white px-5 py-3 font-medium text-gray-800 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100">
            Über Habicht
          </Link>
          <Link href="/faq" className="rounded-full border border-gray-300 bg-white px-5 py-3 font-medium text-gray-800 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100">
            FAQ
          </Link>
        </div>
      </div>
    </main>
  );
}
