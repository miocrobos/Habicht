// Curated real articles from FIVB, Volleyball World and Swiss Volley.
// Used by both the seed script (scripts/seed-news.ts) and the admin refresh
// route (app/api/news/refresh). Every entry links to a real, live source page.
// De-duplication is done on `sourceUrl` (unique in the DB).

export type NewsScope = 'INTERNATIONAL' | 'LOCAL'

export interface SeedNewsItem {
  title: string
  excerpt: string
  content: string
  category: string // GENERAL | EVENT | TOURNAMENT | CLUB | ANNOUNCEMENT
  scope: NewsScope
  sourceName: string
  sourceUrl: string
  imageUrl?: string | null
  publishedAt: string // ISO date
}

export const SEED_NEWS: SeedNewsItem[] = [
  // ---------------------------------------------------------------------------
  // FIVB (International)
  // ---------------------------------------------------------------------------
  {
    title: 'Poland defend VNL title, outlasting USA in spectacular five-set final',
    excerpt: 'Tomasz Fornal named MVP as Poland edge the USA in a thrilling five-set Volleyball Nations League final.',
    content:
      'Poland successfully defended their Volleyball Nations League crown, outlasting the USA in a spectacular five-set final. Tomasz Fornal was named MVP, while the USA settled for yet another silver medal. Read the full recap on FIVB.com.',
    category: 'TOURNAMENT',
    scope: 'INTERNATIONAL',
    sourceName: 'FIVB',
    sourceUrl: 'https://www.fivb.com/poland-defend-vnl-title-outlasting-usa-in-spectacular-five-set-final/',
    publishedAt: '2026-08-02',
  },
  {
    title: "Slovenia's first VNL medal underlines steady rise under Volleyball Empowerment",
    excerpt: 'Slovenia defeated Japan to secure their first-ever VNL podium finish after three previous fourth-place results.',
    content:
      'Slovenia claimed their first-ever Volleyball Nations League medal, defeating Japan to reach the podium after three previous fourth-place finishes. The result underlines the European team\u2019s steady rise under Volleyball Empowerment. Read more on FIVB.com.',
    category: 'TOURNAMENT',
    scope: 'INTERNATIONAL',
    sourceName: 'FIVB',
    sourceUrl: 'https://www.fivb.com/slovenias-first-vnl-medal-underlines-steady-rise-under-volleyball-empowerment/',
    publishedAt: '2026-08-02',
  },
  {
    title: 'FIVB statement on roadmap for return of Russian athletes to world competitions',
    excerpt: 'Update follows extensive consultations with the parties involved.',
    content:
      'The FIVB has published a statement on the roadmap for the potential return of Russian athletes to world competitions. The update follows extensive consultations with the parties involved. Read the full statement on FIVB.com.',
    category: 'ANNOUNCEMENT',
    scope: 'INTERNATIONAL',
    sourceName: 'FIVB',
    sourceUrl: 'https://www.fivb.com/fivb-statement-on-roadmap-for-return-of-russian-athletes-to-world-competitions/',
    publishedAt: '2026-08-04',
  },
  {
    title: "Men's national champions triumph in Lebanon and Uruguay",
    excerpt: 'Weekly recap of domestic volleyball trophies from around the world.',
    content:
      'A weekly recap of domestic volleyball trophies, featuring men\u2019s national champions crowned in Lebanon and Uruguay. Read the full round-up on FIVB.com.',
    category: 'GENERAL',
    scope: 'INTERNATIONAL',
    sourceName: 'FIVB',
    sourceUrl: 'https://www.fivb.com/mens-national-champions-triumph-in-lebanon-and-uruguay/',
    publishedAt: '2026-08-04',
  },
  {
    title: "Brazil's beach volleyball team welcomed to France's newest International Centre of Excellence",
    excerpt: 'Inside a week of world-class training at CREPS Toulouse ahead of Gstaad Elite.',
    content:
      'Brazil\u2019s beach volleyball team was welcomed to France\u2019s newest International Centre of Excellence for a week of world-class training at CREPS Toulouse ahead of the Gstaad Elite. Read more on FIVB.com.',
    category: 'GENERAL',
    scope: 'INTERNATIONAL',
    sourceName: 'FIVB',
    sourceUrl: 'https://www.fivb.com/brazils-beach-volleyball-team-welcomed-to-frances-newest-international-centre-of-excellence/',
    publishedAt: '2026-08-05',
  },

  // ---------------------------------------------------------------------------
  // Volleyball World (International)
  // ---------------------------------------------------------------------------
  {
    title: 'Volleyball Nations League 2026',
    excerpt: 'Follow every match, result and highlight from the 2026 Volleyball Nations League on Volleyball World.',
    content:
      'The Volleyball Nations League is the premier annual international competition for the world\u2019s best national teams. Follow every match, result, standings and highlight from the 2026 edition on Volleyball World.',
    category: 'TOURNAMENT',
    scope: 'INTERNATIONAL',
    sourceName: 'Volleyball World',
    sourceUrl: 'https://en.volleyballworld.com/volleyball/competitions/volleyball-nations-league',
    publishedAt: '2026-06-01',
  },
  {
    title: 'Beach Pro Tour 2026',
    excerpt: 'All the action from the 2026 Beach Pro Tour \u2013 Elite16, Challenge and Futures events worldwide.',
    content:
      'The Beach Pro Tour brings together the best beach volleyball duos across Elite16, Challenge and Futures events around the world. Catch all the 2026 action on Volleyball World.',
    category: 'TOURNAMENT',
    scope: 'INTERNATIONAL',
    sourceName: 'Volleyball World',
    sourceUrl: 'https://en.volleyballworld.com/beachvolleyball/competitions/beach-pro-tour/',
    publishedAt: '2026-01-01',
  },
  {
    title: "Girls' U17 World Championship",
    excerpt: 'Meet the rising stars of the game at the Volleyball World Girls\u2019 U17 World Championship.',
    content:
      'The Girls\u2019 U17 World Championship showcases the next generation of volleyball talent from around the globe. Follow the tournament on Volleyball World.',
    category: 'TOURNAMENT',
    scope: 'INTERNATIONAL',
    sourceName: 'Volleyball World',
    sourceUrl: 'https://en.volleyballworld.com/volleyball/competitions/girls-u17-world-championship',
    publishedAt: '2026-07-01',
  },
  {
    title: 'Watch volleyball live on VBTV',
    excerpt: 'Stream live matches and on-demand volleyball from around the world on Volleyball World TV.',
    content:
      'VBTV is Volleyball World\u2019s official streaming platform, offering live and on-demand access to volleyball and beach volleyball events from around the world.',
    category: 'GENERAL',
    scope: 'INTERNATIONAL',
    sourceName: 'Volleyball World',
    sourceUrl: 'https://tv.volleyballworld.com/',
    publishedAt: '2026-01-01',
  },

  // ---------------------------------------------------------------------------
  // Swiss Volley (Local)
  // ---------------------------------------------------------------------------
  {
    title: 'One Week to go: in einer Woche startet die Beachvolleyball-EM',
    excerpt: 'Vom 12. bis 16. August findet in Stare Jab\u0142onki (POL) die Beachvolleyball-EM statt \u2013 mit sechs Schweizer Duos.',
    content:
      'Vom 12. bis 16. August findet in Stare Jab\u0142onki (POL) die Beachvolleyball-EM statt. Die sechs qualifizierten Schweizer Duos geben einen Einblick in ihre jeweilige Gruppe. Mehr erfahren auf volleyball.ch.',
    category: 'TOURNAMENT',
    scope: 'LOCAL',
    sourceName: 'Swiss Volley',
    sourceUrl: 'https://www.volleyball.ch/de/news/one-week-to-go-in-einer-woche-startet-die-beachvolleyball-em-93ad62d6',
    publishedAt: '2026-08-05',
  },
  {
    title: 'Mitgliederumfrage 2025: Hohe Zufriedenheit mit Swiss Volley',
    excerpt: '76,7 Prozent der Teilnehmenden sind mit der Arbeit von Swiss Volley sehr oder eher zufrieden.',
    content:
      'Der Verband wird positiv wahrgenommen: 76,7 Prozent der Teilnehmenden sind mit der Arbeit von Swiss Volley sehr oder eher zufrieden. Damit best\u00e4tigt die Mitgliederumfrage 2025 das Ergebnis der Vorjahre. Mehr erfahren auf volleyball.ch.',
    category: 'ANNOUNCEMENT',
    scope: 'LOCAL',
    sourceName: 'Swiss Volley',
    sourceUrl: 'https://www.volleyball.ch/de/news/mitgliederumfrage-2025-hohe-zufriedenheit-mit-swiss-volley-6f2b1176',
    publishedAt: '2026-07-30',
  },
  {
    title: 'Sechs Schweizer Teams an der Beachvolleyball-EM',
    excerpt: 'Vom 12. bis 16. August findet in Polen die Beachvolleyball-EM statt \u2013 mit drei Schweizer M\u00e4nner- und drei Frauenteams.',
    content:
      'Vom 12. bis 16. August findet in Polen die Beachvolleyball-EM statt. Qualifiziert haben sich drei Schweizer M\u00e4nner- und drei Frauenteams. Heute hat die Auslosung stattgefunden. Mehr erfahren auf volleyball.ch.',
    category: 'TOURNAMENT',
    scope: 'LOCAL',
    sourceName: 'Swiss Volley',
    sourceUrl: 'https://www.volleyball.ch/de/news/sechs-schweizer-teams-an-der-beachvolleyball-em-aed5f82e',
    publishedAt: '2026-07-24',
  },
  {
    title: 'So sind die Schweizer NLA-Teams n\u00e4chste Saison im Europacup vertreten',
    excerpt: 'F\u00fcnf Frauen- und f\u00fcnf M\u00e4nnerteams vertreten die Schweiz in der kommenden Saison auf europ\u00e4ischer B\u00fchne.',
    content:
      'In der kommenden Saison vertreten f\u00fcnf Frauen- und f\u00fcnf M\u00e4nnerteams die Schweiz auf europ\u00e4ischer B\u00fchne. In Luxembourg hat die Auslosung f\u00fcr den Europacup 2026/27 stattgefunden. Mehr erfahren auf volleyball.ch.',
    category: 'TOURNAMENT',
    scope: 'LOCAL',
    sourceName: 'Swiss Volley',
    sourceUrl: 'https://www.volleyball.ch/de/news/so-sind-die-schweizer-nla-teams-naechste-saison-im-europacup-vertreten-583eafd0',
    publishedAt: '2026-07-15',
  },
  {
    title: 'Neuer \u00abNationaler Nachwuchsverein Volleyball M\u00e4nner\u00bb in Bern ab Sommer 2027',
    excerpt: 'Ab Sommer 2027 nimmt in der Region Bern-Solothurn ein neuer Nationaler Nachwuchsverein f\u00fcr M\u00e4nner den Betrieb auf.',
    content:
      'Ab Sommer 2027 nimmt in der Region Bern-Solothurn ein neuer Nationaler Nachwuchsverein (NNV) f\u00fcr M\u00e4nner seinen Betrieb auf. Das Projekt \u00abNNV Volley Talents Bern\u00bb wird am Standort Gymnasium Hofwil angesiedelt. Mehr erfahren auf volleyball.ch.',
    category: 'ANNOUNCEMENT',
    scope: 'LOCAL',
    sourceName: 'Swiss Volley',
    sourceUrl: 'https://www.volleyball.ch/de/news/neuer-nationaler-nachwuchsverein-volleyball-maenner-in-bern-ab-sommer-2027-bfb6e0dc',
    publishedAt: '2026-07-14',
  },
  {
    title: 'Chiara Ammirati wechselt zu NawaRo Straubing in die 2. Bundesliga Pro',
    excerpt: 'Die Schweizer Aussenangreiferin bestreitet 2026/27 ihre dritte Auslandsaison in Deutschland.',
    content:
      'Die Schweizer Aussenangreiferin Chiara Ammirati wechselt auf die Saison 2026/27 hin zum deutschen Zweitligisten NawaRo Straubing. Dort wird sie ihre dritte Auslandsaison bestreiten. Mehr erfahren auf volleyball.ch.',
    category: 'GENERAL',
    scope: 'LOCAL',
    sourceName: 'Swiss Volley',
    sourceUrl: 'https://www.volleyball.ch/de/news/chiara-ammirati-wechselt-zu-nawaro-straubing-in-die-2-bundesliga-pro-4201faa6',
    publishedAt: '2026-07-01',
  },
  {
    title: 'Julian Weisigk spielt n\u00e4chste Saison bei R\u00edo Duero Voley Soria in Spanien',
    excerpt: 'Der Schweizer Nationalspieler hat f\u00fcr 2026/27 beim spanischen Erstligisten unterschrieben.',
    content:
      'Der Schweizer Nationalspieler Julian Weisigk hat f\u00fcr die Saison 2026/27 beim spanischen Erstligisten R\u00edo Duero Voley Soria unterschrieben, nachdem er mit Levski Sofia den bulgarischen Meistertitel gewonnen hat. Mehr erfahren auf volleyball.ch.',
    category: 'GENERAL',
    scope: 'LOCAL',
    sourceName: 'Swiss Volley',
    sourceUrl: 'https://www.volleyball.ch/de/news/julian-weisigk-spielt-naechste-saison-bei-rio-duero-voley-soria-in-spanien-c816f855',
    publishedAt: '2026-06-25',
  },
  {
    title: 'Mission \u00abErfahrung sammeln\u00bb am Futures in Genf',
    excerpt: 'Die NLZ-Athleten Livio Friedli (17) und Luke Koller (15) starten am Heimturnier in Genf in der Qualifikation.',
    content:
      'Der eine ist 17 Jahre alt, der andere gerade mal 15: Die NLZ-Athleten Livio Friedli und Luke Koller starten am Heimturnier, dem Futures in Genf, in der Qualifikation. Mehr erfahren auf volleyball.ch.',
    category: 'TOURNAMENT',
    scope: 'LOCAL',
    sourceName: 'Swiss Volley',
    sourceUrl: 'https://www.volleyball.ch/de/news/mission-erfahrung-sammeln-am-futures-in-genf-174ec27e',
    publishedAt: '2026-06-24',
  },
]

// Distinctive Swiss Volley article URL pattern: /de/news/<slug>-<8 hex chars>
const SWISS_VOLLEY_NEWS_RE =
  /https:\/\/www\.volleyball\.ch\/de\/news\/[a-z0-9\u00e0-\u00ff-]+-[0-9a-f]{8}/gi

/**
 * Best-effort live scrape of the latest Swiss Volley (LOCAL) headlines.
 * Returns article URLs found on the public news page. Titles are derived from
 * the URL slug; callers should keep curated entries as the source of truth for
 * richer copy. Never throws \u2013 returns an empty array on any failure.
 */
export async function fetchSwissVolleyNewsUrls(): Promise<string[]> {
  try {
    const res = await fetch('https://www.volleyball.ch/de/news', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HabichtBot/1.0)' },
      // News listing changes rarely; avoid hammering the source.
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const html = await res.text()
    const matches = html.match(SWISS_VOLLEY_NEWS_RE) || []
    return Array.from(new Set(matches))
  } catch {
    return []
  }
}

/** Turn a Swiss Volley slug URL into a readable title. */
export function titleFromSwissVolleyUrl(url: string): string {
  const slug = url
    .replace(/^https:\/\/www\.volleyball\.ch\/de\/news\//, '')
    .replace(/-[0-9a-f]{8}$/i, '')
  const words = slug.split('-').filter(Boolean)
  return words
    .map((w) => (w.length > 2 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ')
}
