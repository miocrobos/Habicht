import Link from 'next/link';

export const metadata = {
  title: 'Kontakt | Habicht',
  description: 'Kontaktieren Sie Habicht für Fragen zu Schweizer Volleyball-Talenten, Clubs, Scouts und Plattform-Updates.',
};

const contactMethods = [
  {
    title: 'E-Mail',
    value: 'support@habicht-volleyball.ch',
    href: 'mailto:support@habicht-volleyball.ch',
    description: 'Für allgemeine Fragen, Club-Anfragen und Plattform-Hilfe.',
  },
  {
    title: 'About',
    value: 'Unser Team',
    href: '/about',
    description: 'Mehr über unsere Mission und das Schweizer Volleyball-Ökosystem.',
  },
  {
    title: 'FAQ',
    value: 'Häufige Fragen',
    href: '/faq',
    description: 'Antworten zu Profilen, Clubs, Scouts und der Nutzung der Plattform.',
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            ← Zur Startseite
          </Link>
        </div>

        <header className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-red-600 dark:text-red-400">
            Kontakt
          </p>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white sm:text-5xl">
            Wir helfen dir, die richtigen Volleyball-Verbindungen zu finden.
          </h1>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {contactMethods.map((item) => (
            <div key={item.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {item.title}
              </p>
              <a
                href={item.href}
                className="mb-3 block text-xl font-bold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
              >
                {item.value}
              </a>
              <p className="text-sm leading-6 text-gray-700 dark:text-gray-300">{item.description}</p>
            </div>
          ))}
        </div>

        <section className="mt-10 rounded-2xl bg-white p-8 shadow-sm dark:bg-gray-800">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Warum Kontakt aufnehmen?</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-base leading-7 text-gray-700 dark:text-gray-300">
                Habicht verbindet Spieler, Vereine, Coaches, Scouts und Talente im Schweizer Volleyballnetzwerk. Wenn du Fragen zu Profilen, Registrierungen, Clubs, Scouts oder der Plattform hast, freuen wir uns auf deine Nachricht.
              </p>
            </div>
            <div>
              <ul className="space-y-3 text-base text-gray-700 dark:text-gray-300">
                <li>• Unterstützung bei Profil-Erstellung und Club-Suche</li>
                <li>• Informationen zu Talent- und Recruiting-Prozessen</li>
                <li>• Fragen zu Swiss Volley-Daten, Ligen und Verbindungen</li>
                <li>• Hinweise für Vereine, Scouts und Athleten</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-dashed border-gray-300 bg-gray-100 p-6 dark:border-gray-700 dark:bg-gray-800/60">
          <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">Entdecke mehr</h2>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/clubs" className="rounded-full bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700">
              Clubs entdecken
            </Link>
            <Link href="/players" className="rounded-full border border-gray-300 bg-white px-4 py-2 font-medium text-gray-800 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100">
              Spieler durchsuchen
            </Link>
            <Link href="/about" className="rounded-full border border-gray-300 bg-white px-4 py-2 font-medium text-gray-800 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100">
              Über Habicht
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
