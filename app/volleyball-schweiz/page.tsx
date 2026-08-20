import Link from 'next/link';

export const metadata = {
  title: 'Volleyball Schweiz | Habicht',
  description: 'Volleyball in der Schweiz entdecken: Clubs, Teams, Talentprofile, Trainingsmöglichkeiten und relevante Informationen für Schweizer Volleyballer.',
  keywords: [
    'Volleyball Schweiz',
    'Swiss volleyball',
    'Volleyball Clubs Schweiz',
    'Volleyball Vereine Schweiz',
    'Volleyball talent Schweiz',
    'Volleyball Training Schweiz',
    'Habicht volleyball',
  ],
};

const sections = [
  {
    title: 'Volleyball in der Schweiz entdecken',
    text: 'Habicht hilft dabei, die Schweizer Volleyballszene besser zu verstehen – von Clubs und Teams bis hin zu Profilen, Trainingsideen und relevanten Verbindungen im Sportbereich.',
  },
  {
    title: 'Für Spieler, Clubs und Scouts',
    text: 'Ob du nach passenden Teams suchst, dein Profil sichtbar machen möchtest oder mit Vereinen und Scouts in Kontakt treten willst: Die Plattform schafft mehr Transparenz und bessere Sichtbarkeit.',
  },
  {
    title: 'Mehr Sichtbarkeit im Schweizer Volleyballnetzwerk',
    text: 'Eine starke Präsenz im Schweizer Volleyball-Ökosystem hilft dabei, die richtigen Ansprechpartner zu finden, Chancen zu erkennen und sich im Wettbewerb besser zu positionieren.',
  },
];

export default function VolleyballSchweizPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-red-600 dark:text-red-400">
            Volleyball Schweiz
          </p>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white sm:text-5xl">
            Schweizer Volleyball entdecken, vernetzen und verstehen.
          </h1>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">{section.title}</h2>
              <p className="text-base leading-7 text-gray-700 dark:text-gray-300">{section.text}</p>
            </section>
          ))}
        </div>

        <section className="mt-10 rounded-2xl bg-white p-8 shadow-sm dark:bg-gray-800">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Warum Habicht für Schweizer Volleyball relevant ist</h2>
          <p className="text-base leading-7 text-gray-700 dark:text-gray-300">
            Habicht dient als zentrale Anlaufstelle für die Schweizer Volleyballszene, mit Fokus auf Sichtbarkeit, Profiling,
            Teams, Clubs und Networking. Das Ziel ist, die Verbindung zwischen Talent, Vereinen und Interessierten zu stärken und
            die Suche nach passenden Möglichkeiten deutlich einfacher zu machen.
          </p>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/clubs" className="rounded-full bg-red-600 px-5 py-3 font-medium text-white hover:bg-red-700">
            Clubs entdecken
          </Link>
          <Link href="/players" className="rounded-full border border-gray-300 bg-white px-5 py-3 font-medium text-gray-800 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100">
            Spieler durchsuchen
          </Link>
          <Link href="/contact" className="rounded-full border border-gray-300 bg-white px-5 py-3 font-medium text-gray-800 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100">
            Kontakt
          </Link>
        </div>
      </div>
    </main>
  );
}
