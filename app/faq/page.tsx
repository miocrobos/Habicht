import Link from 'next/link';

export const metadata = {
  title: 'FAQ | Habicht',
  description: 'Häufige Fragen zu Habicht, Swiss Volleyball, Clubs, Profilen und dem Talent-Tracking für Schweizer Volleyballer.',
};

const faqs = [
  {
    question: 'Was ist Habicht?',
    answer:
      'Habicht ist eine Plattform für Schweizer Volleyball-Talente, Clubs, Scouts und Vereine. Sie hilft dabei, Profilinformationen, Team- und Club-Verbindungen sowie relevante talentorientierte Kontakte schnell zu finden.',
  },
  {
    question: 'Für wen ist die Plattform geeignet?',
    answer:
      'Habicht richtet sich an Volleyballspielerinnen und -spieler, Clubs, Coaches, Scouts und alle, die sich im Schweizer Volleyball-Netzwerk vernetzen möchten.',
  },
  {
    question: 'Kann ich Clubs oder Spieler finden?',
    answer:
      'Ja. Über die Such- und Filterfunktionen lassen sich Clubs, Spielerprofile und Laufbahninformationen gezielt entdecken und vergleichen.',
  },
  {
    question: 'Wie melde ich mich an?',
    answer:
      'Du kannst dich über die Registrierungsseite anmelden. Danach kannst du deine Profilinformationen ergänzen und deine Präsenz im Netzwerk aufbauen.',
  },
  {
    question: 'Ist die Plattform auch für Scouts relevant?',
    answer:
      'Ja. Scouts und Vereinsverantwortliche können Talentprofile leichter finden und sich mit passenden Spielern vernetzen.',
  },
  {
    question: 'Wo finde ich weitere Informationen?',
    answer:
      'Weitere Hinweise findest du auf der Startseite, in unserem About-Bereich sowie über den Kontakt-Button für individuelle Fragen.',
  },
];

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            ← Zur Startseite
          </Link>
        </div>

        <header className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-red-600 dark:text-red-400">
            FAQ
          </p>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white sm:text-5xl">
            Häufige Fragen zu Habicht
          </h1>
        </header>

        <div className="space-y-5">
          {faqs.map((item, index) => (
            <section
              key={item.question}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
                {index + 1}. {item.question}
              </h2>
              <p className="text-base leading-7 text-gray-700 dark:text-gray-300">{item.answer}</p>
            </section>
          ))}
        </div>

        <section className="mt-10 rounded-2xl border border-dashed border-gray-300 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">Weitere Hilfe</h2>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/clubs" className="rounded-full bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700">
              Clubs suchen
            </Link>
            <Link href="/players" className="rounded-full border border-gray-300 bg-white px-4 py-2 font-medium text-gray-800 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100">
              Spieler anzeigen
            </Link>
            <Link href="/contact" className="rounded-full border border-gray-300 bg-white px-4 py-2 font-medium text-gray-800 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100">
              Kontakt aufnehmen
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
