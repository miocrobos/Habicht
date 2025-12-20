'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translateText, getGoogleLanguageCode } from '@/lib/translate'

type Language = 'gsw' | 'de' | 'fr' | 'it' | 'rm' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  translate: (text: string, sourceLanguage?: string) => Promise<string>
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  gsw: {
    // Gender
    'gender.male': 'Männlich',
    'gender.female': 'Wiiblich',
    // Login
    'login.title': 'Aamelde',
    'login.button': 'Aamelde',
    'login.loading': 'Wird Aameldet...',
    'login.register': 'erstell es neus Konto',
    'login.or': 'Oder',
    'login.email': 'Email Adresse',
    'login.password': 'Passwort',
    'login.rememberMe': 'Aameldet Bliibe',
    'login.forgotPassword': 'Passwort Vergässe?',
    // Chat
    'chat.writeMessage': 'Nachricht Schriihe...',
    'chat.addEmoji': 'Emoji Hinzuefüege',
    // Common
    'common.save': 'Speichere',
    'common.cancel': 'Abbräche',
    'common.delete': 'Lösche',
    'common.edit': 'Bearbeite',
    'common.search': 'Sueche',
    'common.filter': 'Filtere',
    'common.loading': 'Lade...',
    'common.error': 'Fehler',
    'common.success': 'Erfolg',
    'common.back': 'Zrugg',
    'common.next': 'Wiiter',
    'common.submit': 'Abschicke',
    // Navigation
    'nav.home': 'Hei',
    'nav.players': 'Spieler',
    'nav.men': 'Herren',
    'nav.women': 'Damen',
    'nav.recruiters': 'Rekrutierer',
    'nav.clubs': 'Verein',
    'nav.about': 'Über Üs',
    'nav.settings': 'Iistellige',
    'nav.logout': 'Abmelde',
    'nav.login': 'Aamelde',
    'nav.register': 'Registriere',
    'nav.myProfile': 'Mis Profil',
    'nav.dashboard': 'Dashboard',
    // Home Page
    home: {
      hero: {
        title: 'Habicht',
        description: 'Di modärni Scouting-Plattform für Schwiizer Volleyball. Entdeck Talänt, lueg Highlights a und vernetze dich mit Scouts.',
        menVolleyball: 'Herren Volleyball',
        womenVolleyball: 'Damen Volleyball',
        searchAllPlayers: 'Alli Spieler duresueche',
        login: 'Aamelde',
        registerNow: 'Jetzt registriere',
      },
      leagues: {
        title: 'Alli Lige. Ein Ort.',
        subtitle: 'Vo NLA Spitzenvolleyball bis zur 5. Liga – entdeck Spieler us dr ganzä Schwiiz.',
        nla: 'Nationalliga A',
        nlb: 'Nationalliga B',
        firstLeague: '1. Liga',
        secondLeague: 'Zweit Liga',
        thirdLeague: 'Dritt Liga',
        fourthLeague: 'Viert Liga',
        fifthLeague: 'Fünft Liga',
        players: 'Spieler',
      },
      features: {
        title: 'Warum Habicht?',
        subtitle: 'Di modärni Lösig für Schweizer Volleyball Scouting',
        search: {
          title: 'Intelligenti Suech',
          description: 'Finde Spieler nach Liga, Position, Canton und viel meh',
        },
        highlights: {
          title: 'Video Highlights',
          description: 'Lueg dir di beschte Aktione vo de Spieler direkt a',
        },
        network: {
          title: 'Vernetzig',
          description: 'Verbinde dich mit Scouts, Trainers und Spieler',
        },
        stats: {
          title: 'Statistike',
          description: 'Umfassendi Spieler-Profile mit detaillierte Statistike',
        },
      },
      cta: {
        title: 'Bereit zum Starte?',
        subtitle: 'Tritt dr grösste Schwiizer Volleyball Community bi',
        registerPlayer: 'Als Spieler registriere',
        registerRecruiter: 'Als Scout registriere',
      },
    },
    // About Page
    about: {
      title: 'Über Habicht',
      what: {
        title: 'Was isch Habicht?',
        description1: 'Habicht isch d\'Plattform für Schweizer Volleyball-Talente. Mir verbinde Spieler mit Recruiters und Scouts us de ganze Schwiiz.',
        description2: 'Inspiriert vo Volleybox, aber speziell für d\'Schwiizer Volleyball-Landschaft entwicklet, mit direkter Integration zu Swiss Volley und de wichtigste Clubs.',
      },
      mission: {
        title: 'Mission',
        description: 'Mir wönd es einfachs und professionells Tool schaffe, wo Schweizer Volleyball-Talente ihri Fähigkeite chönd zeige und sich mit Scouts und Clubs chönd vernetze.',
      },
      features: {
        title: 'Features',
        item1: 'Vollständigi Spieler-Profile mit Stats und persönliche Infos',
        item2: 'Video-Highlights hochlade oder vo YouTube, Instagram & TikTok verlinke',
        item3: 'Automatischi Verlinkig zu Swiss Volley und Club-Websites',
        item4: 'Suchfunktion für Recruiters mit umfassende Filter',
        item5: 'Karriere-Timeline ähnlich wie bi Volleybox',
      },
      contact: {
        title: 'Kontakt',
        description: 'Häsch Frage oder Vorschläg? Mir wönd vo dir ghöre!',
        email: 'Email',
      },
    },
    // Settings
    settings: {
      title: 'Iistellige',
      subtitle: 'Verwalte Dini Präferenzä Und Konto Iistellige',
      appearance: 'Uussehe',
      security: 'Login & Sicherheit',
      language: 'Sprache',
      notifications: 'Benachrichtigungen',
      account: 'Kontoverwaltung',
      theme: 'Theme-Modus',
      email: 'E-Mail-Adresse',
      privacy: 'Dateschutz',
      saved: 'Iistellunge Gspeichert',
    },
  },
  de: {
    // Gender
    'gender.male': 'Männlich',
    'gender.female': 'Weiblich',
    // Login
    'login.title': 'Anmelden',
    'login.button': 'Anmelden',
    'login.loading': 'Wird angemeldet...',
    'login.register': 'Erstelle ein neues Konto',
    'login.or': 'Oder',
    'login.email': 'Email Adresse',
    'login.password': 'Passwort',
    'login.rememberMe': 'Angemeldet bleiben',
    'login.forgotPassword': 'Passwort vergessen?',
    // Chat
    'chat.writeMessage': 'Nachricht schreiben...',
    'chat.addEmoji': 'Emoji hinzufügen',
    // Common
    'common.save': 'Speichern',
    'common.cancel': 'Abbrechen',
    'common.delete': 'Löschen',
    'common.edit': 'Bearbeiten',
    'common.search': 'Suchen',
    'common.filter': 'Filtern',
    'common.loading': 'Lädt...',
    'common.error': 'Fehler',
    'common.success': 'Erfolg',
    'common.back': 'Zurück',
    'common.next': 'Weiter',
    'common.submit': 'Absenden',
    // Navigation
    'nav.home': 'Startseite',
    'nav.players': 'Spieler',
    'nav.men': 'Herren',
    'nav.women': 'Damen',
    'nav.recruiters': 'Rekrutierer',
    'nav.clubs': 'Vereine',
    'nav.about': 'Über uns',
    'nav.settings': 'Einstellungen',
    'nav.logout': 'Abmelden',
    'nav.login': 'Anmelden',
    'nav.register': 'Registrieren',
    'nav.myProfile': 'Mein Profil',
    'nav.dashboard': 'Dashboard',
    // Home Page
    home: {
      hero: {
        title: 'Habicht',
        description: 'Die moderne Scouting-Plattform für Schweizer Volleyball. Entdecke Talente, schaue Highlights an und vernetze dich mit Scouts.',
        menVolleyball: 'Herren Volleyball',
        womenVolleyball: 'Damen Volleyball',
        searchAllPlayers: 'Alle Spieler durchsuchen',
        login: 'Anmelden',
        registerNow: 'Jetzt registrieren',
      },
      leagues: {
        title: 'Alle Ligen. Ein Ort.',
        subtitle: 'Von NLA Spitzenvolleyball bis zur 5. Liga – entdecke Spieler aus der ganzen Schweiz.',
        nla: 'Nationalliga A',
        nlb: 'Nationalliga B',
        firstLeague: '1. Liga',
        secondLeague: '2. Liga',
        thirdLeague: '3. Liga',
        fourthLeague: '4. Liga',
        fifthLeague: '5. Liga',
        players: 'Spieler',
      },
      features: {
        title: 'Warum Habicht?',
        subtitle: 'Die moderne Lösung für Schweizer Volleyball Scouting',
        search: {
          title: 'Intelligente Suche',
          description: 'Finde Spieler nach Liga, Position, Kanton und vielem mehr',
        },
        highlights: {
          title: 'Video Highlights',
          description: 'Schaue dir die besten Aktionen der Spieler direkt an',
        },
        network: {
          title: 'Vernetzung',
          description: 'Verbinde dich mit Scouts, Trainern und Spielern',
        },
        stats: {
          title: 'Statistiken',
          description: 'Umfassende Spieler-Profile mit detaillierten Statistiken',
        },
      },
      cta: {
        title: 'Bereit zum Starten?',
        subtitle: 'Tritt der grössten Schweizer Volleyball Community bei',
        registerPlayer: 'Als Spieler registrieren',
        registerRecruiter: 'Als Scout registrieren',
      },
    },
    // About Page
    about: {
      title: 'Über Habicht',
      what: {
        title: 'Was ist Habicht?',
        description1: 'Habicht ist die Plattform für Schweizer Volleyball-Talente. Wir verbinden Spieler mit Recruiters und Scouts aus der ganzen Schweiz.',
        description2: 'Inspiriert von Volleybox, aber speziell für die Schweizer Volleyball-Landschaft entwickelt, mit direkter Integration zu Swiss Volley und den wichtigsten Clubs.',
      },
      mission: {
        title: 'Mission',
        description: 'Wir wollen ein einfaches und professionelles Tool schaffen, mit dem Schweizer Volleyball-Talente ihre Fähigkeiten zeigen und sich mit Scouts und Clubs vernetzen können.',
      },
      features: {
        title: 'Features',
        item1: 'Vollständige Spieler-Profile mit Statistiken und persönlichen Infos',
        item2: 'Video-Highlights hochladen oder von YouTube, Instagram & TikTok verlinken',
        item3: 'Automatische Verlinkung zu Swiss Volley und Club-Websites',
        item4: 'Suchfunktion für Recruiters mit umfassenden Filtern',
        item5: 'Karriere-Timeline ähnlich wie bei Volleybox',
      },
      contact: {
        title: 'Kontakt',
        description: 'Haben Sie Fragen oder Vorschläge? Wir möchten von Ihnen hören!',
        email: 'E-Mail',
      },
    },
    // Auth Pages
    auth: {
      login: {
        title: 'Anmelden',
        or: 'Oder',
        createAccount: 'neues Konto erstellen',
        email: 'E-Mail',
        password: 'Passwort',
        rememberMe: 'Angemeldet bleiben',
        forgotPassword: 'Passwort vergessen?',
        submit: 'Anmelden',
        loading: 'Lädt...',
        invalidCredentials: 'Ungültige Anmeldedaten',
        error: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.',
        passwordResetSuccess: 'Passwort erfolgreich zurückgesetzt! Du kannst dich jetzt anmelden.',
        invalidToken: 'Ungültiger oder abgelaufener Link.',
        tokenExpired: 'Link ist abgelaufen. Bitte fordere einen neuen an.',
      },
      register: {
        title: 'Wähle Deine Rolle',
        subtitle: 'Bist Du Spieler Oder Rekrutierer?',
        player: 'Spieler',
        recruiter: 'Rekrutierer',
        hybrid: 'Hybrid',
        playerDescription: 'Registriere dich als Volleyball-Spieler. Zeige deine Fähigkeiten, vernetze dich mit Vereinen und finde Möglichkeiten.',
        recruiterDescription: 'Registriere dich als Vereins-Rekrutierer oder Trainer. Entdecke talentierte Spieler und baue dein Team auf.',
        hybridDescription: 'Registriere dich als Spieler UND Rekrutierer. Kombiniere beide Rollen und habe volle Möglichkeiten.',
        registerAsPlayer: 'Als Spieler registrieren',
        registerAsRecruiter: 'Als Rekrutierer registrieren',
        registerAsHybrid: 'Als Hybrid registrieren',
        haveAccount: 'Hast du schon ein Konto?',
      },
      forgotPassword: {
        title: 'Passwort vergessen',
        subtitle: 'Gib deine E-Mail-Adresse ein und wähle ein neues Passwort.',
        email: 'E-Mail',
        newPassword: 'Neues Passwort',
        confirmPassword: 'Neues Passwort bestätigen',
        submit: 'Passwort zurücksetzen',
        loading: 'Sende Anfrage...',
        backToLogin: 'Zurück zum Login',
        enterEmail: 'Bitte gib deine E-Mail-Adresse ein.',
        passwordMinLength: 'Passwort muss mindestens 8 Zeichen haben.',
        passwordsNoMatch: 'Passwörter stimmen nicht überein.',
        checkEmail: 'Bitte prüfe deine E-Mails, um die Passwortänderung zu bestätigen.',
        error: 'Fehler beim Senden der Anfrage.',
      },
    },
    // Settings
    settings: {
      title: 'Einstellungen',
      subtitle: 'Verwalten Sie Ihre Präferenzen und Kontoeinstellungen',
      appearance: 'Aussehen',
      security: 'Login & Sicherheit',
      language: 'Sprache',
      notifications: 'Benachrichtigungen',
      account: 'Kontoverwaltung',
      theme: 'Theme-Modus',
      email: 'E-Mail-Adresse',
      privacy: 'Datenschutz',
      saved: 'Einstellungen Gespeichert',
    },
  },
  fr: {
    // Gender
    'gender.male': 'Masculin',
    'gender.female': 'Féminin',
    // Login
    'login.title': 'Se connecter',
    'login.button': 'Se connecter',
    'login.loading': 'Connexion en cours...',
    'login.register': 'créer un nouveau compte',
    'login.or': 'Ou',
    'login.email': 'Adresse email',
    'login.password': 'Mot de passe',
    'login.rememberMe': 'Rester connecté',
    'login.forgotPassword': 'Mot de passe oublié?',
    // Chat
    'chat.writeMessage': 'Écrire un message...',
    'chat.addEmoji': 'Ajouter un emoji',
    // Common
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.back': 'Retour',
    'common.next': 'Suivant',
    'common.submit': 'Soumettre',
    // Navigation
    'nav.home': 'Accueil',
    'nav.players': 'Joueurs',
    'nav.men': 'Hommes',
    'nav.women': 'Femmes',
    'nav.recruiters': 'Recruteurs',
    'nav.clubs': 'Clubs',
    'nav.about': 'À propos',
    'nav.settings': 'Paramètres',
    'nav.logout': 'Déconnexion',
    'nav.login': 'Connexion',
    'nav.register': 'S\'inscrire',
    'nav.myProfile': 'Mon Profil',
    'nav.dashboard': 'Tableau de bord',
    // Home Page
    home: {
      hero: {
        title: 'Habicht',
        description: 'La plateforme de scouting moderne pour le volleyball suisse. Découvre des talents, regarde des highlights et connecte-toi avec des scouts.',
        menVolleyball: 'Volleyball Hommes',
        womenVolleyball: 'Volleyball Femmes',
        searchAllPlayers: 'Rechercher tous les joueurs',
        login: 'Connexion',
        registerNow: 'S\'inscrire maintenant',
      },
      leagues: {
        title: 'Toutes les ligues. Un endroit.',
        subtitle: 'De la LNA volleyball d\'élite à la 5e ligue – découvre des joueurs de toute la Suisse.',
        nla: 'Ligue nationale A',
        nlb: 'Ligue nationale B',
        firstLeague: '1ère Ligue',
        secondLeague: '2e Ligue',
        thirdLeague: '3e Ligue',
        fourthLeague: '4e Ligue',
        fifthLeague: '5e Ligue',
        players: 'Joueurs',
      },
      features: {
        title: 'Pourquoi Habicht?',
        subtitle: 'La solution moderne pour le scouting de volleyball suisse',
        search: {
          title: 'Recherche Intelligente',
          description: 'Trouve des joueurs par ligue, position, canton et bien plus',
        },
        highlights: {
          title: 'Vidéos Highlights',
          description: 'Regarde les meilleures actions des joueurs directement',
        },
        network: {
          title: 'Réseau',
          description: 'Connecte-toi avec des scouts, entraîneurs et joueurs',
        },
        stats: {
          title: 'Statistiques',
          description: 'Profils de joueurs complets avec statistiques détaillées',
        },
      },
      cta: {
        title: 'Prêt à commencer?',
        subtitle: 'Rejoins la plus grande communauté de volleyball suisse',
        registerPlayer: 'S\'inscrire comme joueur',
        registerRecruiter: 'S\'inscrire comme scout',
      },
    },
    // About Page
    about: {
      title: 'À propos de Habicht',
      what: {
        title: 'Qu\'est-ce que Habicht?',
        description1: 'Habicht est la plateforme pour les talents du volleyball suisse. Nous connectons les joueurs avec des recruteurs et scouts de toute la Suisse.',
        description2: 'Inspiré de Volleybox, mais développé spécifiquement pour le paysage du volleyball suisse, avec une intégration directe à Swiss Volley et aux clubs les plus importants.',
      },
      mission: {
        title: 'Mission',
        description: 'Nous voulons créer un outil simple et professionnel permettant aux talents du volleyball suisse de montrer leurs compétences et de se connecter avec des scouts et des clubs.',
      },
      features: {
        title: 'Fonctionnalités',
        item1: 'Profils de joueurs complets avec statistiques et informations personnelles',
        item2: 'Télécharger des vidéos highlights ou les lier depuis YouTube, Instagram & TikTok',
        item3: 'Lien automatique vers Swiss Volley et les sites web des clubs',
        item4: 'Fonction de recherche pour recruteurs avec filtres complets',
        item5: 'Chronologie de carrière similaire à Volleybox',
      },
      contact: {
        title: 'Contact',
        description: 'Vous avez des questions ou des suggestions? Nous aimerions vous entendre!',
        email: 'Email',
      },
    },
    // Auth Pages
    auth: {
      login: {
        title: 'Connexion',
        or: 'Ou',
        createAccount: 'créer un nouveau compte',
        email: 'Email',
        password: 'Mot de passe',
        rememberMe: 'Rester connecté',
        forgotPassword: 'Mot de passe oublié?',
        submit: 'Se connecter',
        loading: 'Chargement...',
        invalidCredentials: 'Identifiants invalides',
        error: 'Une erreur s\'est produite. Veuillez réessayer.',
        passwordResetSuccess: 'Mot de passe réinitialisé avec succès! Vous pouvez maintenant vous connecter.',
        invalidToken: 'Lien invalide ou expiré.',
        tokenExpired: 'Le lien a expiré. Veuillez en demander un nouveau.',
      },
      register: {
        title: 'Choisissez votre rôle',
        subtitle: 'Êtes-vous joueur ou recruteur?',
        player: 'Joueur',
        recruiter: 'Recruteur',
        hybrid: 'Hybride',
        playerDescription: 'Inscrivez-vous en tant que joueur de volleyball. Montrez vos compétences, connectez-vous avec des clubs et trouvez des opportunités.',
        recruiterDescription: 'Inscrivez-vous en tant que recruteur de club ou entraîneur. Découvrez des joueurs talentueux et construisez votre équipe.',
        hybridDescription: 'Inscrivez-vous en tant que joueur ET recruteur. Combinez les deux rôles et ayez toutes les possibilités.',
        registerAsPlayer: 'S\'inscrire comme joueur',
        registerAsRecruiter: 'S\'inscrire comme recruteur',
        registerAsHybrid: 'S\'inscrire comme hybride',
        haveAccount: 'Vous avez déjà un compte?',
      },
      forgotPassword: {
        title: 'Mot de passe oublié',
        subtitle: 'Entrez votre adresse email et choisissez un nouveau mot de passe.',
        email: 'Email',
        newPassword: 'Nouveau mot de passe',
        confirmPassword: 'Confirmer le nouveau mot de passe',
        submit: 'Réinitialiser le mot de passe',
        loading: 'Envoi de la demande...',
        backToLogin: 'Retour à la connexion',
        enterEmail: 'Veuillez entrer votre adresse email.',
        passwordMinLength: 'Le mot de passe doit contenir au moins 8 caractères.',
        passwordsNoMatch: 'Les mots de passe ne correspondent pas.',
        checkEmail: 'Veuillez vérifier vos emails pour confirmer le changement de mot de passe.',
        error: 'Erreur lors de l\'envoi de la demande.',
      },
    },
    // Settings
    settings: {
      title: 'Paramètres',
      subtitle: 'Gérez vos préférences et paramètres de compte',
      appearance: 'Apparence',
      security: 'Connexion & Sécurité',
      language: 'Langue',
      notifications: 'Notifications',
      account: 'Gestion du compte',
      theme: 'Mode thème',
      email: 'Adresse email',
      privacy: 'Confidentialité',
      saved: 'Paramètres Enregistrés',
    },
  },
  it: {
    // Gender
    'gender.male': 'Maschile',
    'gender.female': 'Femminile',
    // Login
    'login.title': 'Accedi',
    'login.button': 'Accedi',
    'login.loading': 'Accesso in corso...',
    'login.register': 'crea un nuovo account',
    'login.or': 'Oppure',
    'login.email': 'Indirizzo email',
    'login.password': 'Password',
    'login.rememberMe': 'Resta connesso',
    'login.forgotPassword': 'Password dimenticata?',
    // Chat
    'chat.writeMessage': 'Scrivi un messaggio...',
    'chat.addEmoji': 'Aggiungi emoji',
    // Common
    'common.save': 'Salva',
    'common.cancel': 'Annulla',
    'common.delete': 'Elimina',
    'common.edit': 'Modifica',
    'common.search': 'Cerca',
    'common.filter': 'Filtra',
    'common.loading': 'Caricamento...',
    'common.error': 'Errore',
    'common.success': 'Successo',
    'common.back': 'Indietro',
    'common.next': 'Avanti',
    'common.submit': 'Invia',
    // Navigation
    'nav.home': 'Home',
    'nav.players': 'Giocatori',
    'nav.men': 'Uomini',
    'nav.women': 'Donne',
    'nav.recruiters': 'Reclutatori',
    'nav.clubs': 'Club',
    'nav.about': 'Chi siamo',
    'nav.settings': 'Impostazioni',
    'nav.logout': 'Disconnetti',
    'nav.login': 'Accedi',
    'nav.register': 'Registrati',
    'nav.myProfile': 'Il Mio Profilo',
    'nav.dashboard': 'Pannello di controllo',
    // Home Page
    home: {
      hero: {
        title: 'Habicht',
        description: 'La piattaforma moderna di scouting per la pallavolo svizzera. Scopri talenti, guarda highlights e connettiti con scout.',
        menVolleyball: 'Pallavolo Maschile',
        womenVolleyball: 'Pallavolo Femminile',
        searchAllPlayers: 'Cerca tutti i giocatori',
        login: 'Accedi',
        registerNow: 'Registrati ora',
      },
      leagues: {
        title: 'Tutte le leghe. Un posto.',
        subtitle: 'Dalla LNA pallavolo d\'élite alla 5a lega – scopri giocatori da tutta la Svizzera.',
        nla: 'Lega nazionale A',
        nlb: 'Lega nazionale B',
        firstLeague: '1a Lega',
        secondLeague: '2a Lega',
        thirdLeague: '3a Lega',
        fourthLeague: '4a Lega',
        fifthLeague: '5a Lega',
        players: 'Giocatori',
      },
      features: {
        title: 'Perché Habicht?',
        subtitle: 'La soluzione moderna per lo scouting della pallavolo svizzera',
        search: {
          title: 'Ricerca Intelligente',
          description: 'Trova giocatori per lega, posizione, cantone e molto altro',
        },
        highlights: {
          title: 'Video Highlights',
          description: 'Guarda le migliori azioni dei giocatori direttamente',
        },
        network: {
          title: 'Rete',
          description: 'Connettiti con scout, allenatori e giocatori',
        },
        stats: {
          title: 'Statistiche',
          description: 'Profili completi dei giocatori con statistiche dettagliate',
        },
      },
      cta: {
        title: 'Pronto per iniziare?',
        subtitle: 'Unisciti alla più grande comunità di pallavolo svizzera',
        registerPlayer: 'Registrati come giocatore',
        registerRecruiter: 'Registrati come scout',
      },
    },
    // About Page
    about: {
      title: 'Informazioni su Habicht',
      what: {
        title: 'Cos\'è Habicht?',
        description1: 'Habicht è la piattaforma per i talenti della pallavolo svizzera. Connettiamo i giocatori con reclutatori e scout da tutta la Svizzera.',
        description2: 'Ispirato a Volleybox, ma sviluppato specificamente per il panorama della pallavolo svizzera, con integrazione diretta a Swiss Volley e ai club più importanti.',
      },
      mission: {
        title: 'Missione',
        description: 'Vogliamo creare uno strumento semplice e professionale che permetta ai talenti della pallavolo svizzera di mostrare le loro capacità e connettersi con scout e club.',
      },
      features: {
        title: 'Funzionalità',
        item1: 'Profili completi dei giocatori con statistiche e informazioni personali',
        item2: 'Carica video highlights o collegali da YouTube, Instagram & TikTok',
        item3: 'Collegamento automatico a Swiss Volley e ai siti web dei club',
        item4: 'Funzione di ricerca per reclutatori con filtri completi',
        item5: 'Cronologia di carriera simile a Volleybox',
      },
      contact: {
        title: 'Contatto',
        description: 'Hai domande o suggerimenti? Ci piacerebbe sentirti!',
        email: 'Email',
      },
    },
    // Auth Pages
    auth: {
      login: {
        title: 'Accedi',
        or: 'Oppure',
        createAccount: 'crea un nuovo account',
        email: 'Email',
        password: 'Password',
        rememberMe: 'Resta connesso',
        forgotPassword: 'Password dimenticata?',
        submit: 'Accedi',
        loading: 'Caricamento...',
        invalidCredentials: 'Credenziali non valide',
        error: 'Si è verificato un errore. Riprova.',
        passwordResetSuccess: 'Password reimpostata con successo! Ora puoi accedere.',
        invalidToken: 'Link non valido o scaduto.',
        tokenExpired: 'Il link è scaduto. Richiedine uno nuovo.',
      },
      register: {
        title: 'Scegli il tuo ruolo',
        subtitle: 'Sei un giocatore o un reclutatore?',
        player: 'Giocatore',
        recruiter: 'Reclutatore',
        hybrid: 'Ibrido',
        playerDescription: 'Registrati come giocatore di pallavolo. Mostra le tue abilità, connettiti con i club e trova opportunità.',
        recruiterDescription: 'Registrati come reclutatore di club o allenatore. Scopri giocatori talentuosi e costruisci la tua squadra.',
        hybridDescription: 'Registrati come giocatore E reclutatore. Combina entrambi i ruoli e avrai tutte le possibilità.',
        registerAsPlayer: 'Registrati come giocatore',
        registerAsRecruiter: 'Registrati come reclutatore',
        registerAsHybrid: 'Registrati come ibrido',
        haveAccount: 'Hai già un account?',
      },
      forgotPassword: {
        title: 'Password dimenticata',
        subtitle: 'Inserisci il tuo indirizzo email e scegli una nuova password.',
        email: 'Email',
        newPassword: 'Nuova password',
        confirmPassword: 'Conferma nuova password',
        submit: 'Reimposta password',
        loading: 'Invio richiesta...',
        backToLogin: 'Torna al login',
        enterEmail: 'Inserisci il tuo indirizzo email.',
        passwordMinLength: 'La password deve contenere almeno 8 caratteri.',
        passwordsNoMatch: 'Le password non corrispondono.',
        checkEmail: 'Controlla le tue email per confermare il cambio di password.',
        error: 'Errore durante l\'invio della richiesta.',
      },
    },
    // Settings
    settings: {
      title: 'Impostazioni',
      subtitle: 'Gestisci le tue preferenze e impostazioni account',
      appearance: 'Aspetto',
      security: 'Login & Sicurezza',
      language: 'Lingua',
      notifications: 'Notifiche',
      account: 'Gestione account',
      theme: 'Modalità tema',
      email: 'Indirizzo email',
      privacy: 'Privacy',
      saved: 'Impostazioni Salvate',
    },
  },
  rm: {
    // Gender
    'gender.male': 'Masculin',
    'gender.female': 'Feminin',
    // Login
    'login.title': 'S\'annunziar',
    'login.button': 'S\'annunziar',
    'login.loading': 'Annunzia en cours...',
    'login.register': 'crear in nov conto',
    'login.or': 'U',
    'login.email': 'Adressa d\'email',
    'login.password': 'Pled-clav',
    'login.rememberMe': 'Restar annunzià',
    'login.forgotPassword': 'Emblidà il pled-clav?',
    // Chat
    'chat.writeMessage': 'Scriver in messadi...',
    'chat.addEmoji': 'Agiuntar emoji',
    // Common
    'common.save': 'Memorisar',
    'common.cancel': 'Interrumper',
    'common.delete': 'Stizzar',
    'common.edit': 'Modifitgar',
    'common.search': 'Tschertgar',
    'common.filter': 'Filtrar',
    'common.loading': 'Chargiar...',
    'common.error': 'Errur',
    'common.success': 'Success',
    'common.back': 'Enavos',
    'common.next': 'Vinavant',
    'common.submit': 'Trametter',
    // Navigation
    'nav.home': 'Pagina principala',
    'nav.players': 'Giugaders',
    'nav.men': 'Umens',
    'nav.women': 'Dunnas',
    'nav.recruiters': 'Recrutaders',
    'nav.clubs': 'Clubs',
    'nav.about': 'Davart nus',
    'nav.settings': 'Parameters',
    'nav.logout': 'S\'annunziar ora',
    'nav.login': 'S\'annunziar',
    'nav.register': 'S\'annunziar',
    'nav.myProfile': 'Mes profil',
    'nav.dashboard': 'Pannel da gestiun',
    // Home Page
    home: {
      hero: {
        title: 'Habicht',
        description: 'La plattafurma moderna da scouting per il volleyball svizzer. Scuvra talents, guarda highlights e connect cun scouts.',
        menVolleyball: 'Volleyball Umens',
        womenVolleyball: 'Volleyball Dunnas',
        searchAllPlayers: 'Tschertgar tuts giugaders',
        login: 'S\'annunziar',
        registerNow: 'S\'annunziar ussa',
      },
      leagues: {
        title: 'Tut las ligas. In lieu.',
        subtitle: 'Da la LNA volleyball d\'elite a la 5avla liga – scuvra giugaders da tutta la Svizra.',
        nla: 'Liga naziunala A',
        nlb: 'Liga naziunala B',
        firstLeague: '1avla Liga',
        secondLeague: '2avla Liga',
        thirdLeague: '3avla Liga',
        fourthLeague: '4avla Liga',
        fifthLeague: '5avla Liga',
        players: 'Giugaders',
      },
      features: {
        title: 'Pertge Habicht?',
        subtitle: 'La soluziun moderna per il scouting da volleyball svizzer',
        search: {
          title: 'Tschertga Intelligenta',
          description: 'Chattapasser giugaders tenor liga, posiziun, chantun e bler dapli',
        },
        highlights: {
          title: 'Video Highlights',
          description: 'Guarda las meglras acziuns dals giugaders directamain',
        },
        network: {
          title: 'Rait',
          description: 'Connect cun scouts, trenaders e giugaders',
        },
        stats: {
          title: 'Statisticas',
          description: 'Profils cumplets da giugaders cun statisticas detagliadas',
        },
      },
      cta: {
        title: 'Pront per cumenzar?',
        subtitle: 'Participescha a la pli gronda communitad da volleyball svizzer',
        registerPlayer: 'S\'annunziar sco giugader',
        registerRecruiter: 'S\'annunziar sco scout',
      },
    },
    // About Page
    about: {
      title: 'Davart Habicht',
      what: {
        title: 'Tge è Habicht?',
        description1: 'Habicht è la plattafurma per talents da volleyball svizzers. Nòs connectain giugaders cun recruiters e scouts da tutta la Svizra.',
        description2: 'Inspirà da Volleybox, ma sviluppà spezialmain per il pajsaž da volleyball svizzer, cun integraziun directa a Swiss Volley ed als clubs pli impurtants.',
      },
      mission: {
        title: 'Missiun',
        description: 'Nòs vulain crear in tool simpel e professiunàl che pussibilitescha als talents da volleyball svizzers da mussar lur capacitàs e da sa connectar cun scouts e clubs.',
      },
      features: {
        title: 'Funcziuns',
        item1: 'Profils cumplains da giugaders cun statisticas ed infurmaziuns persunalas',
        item2: 'Chargiar video highlights u colliar els da YouTube, Instagram & TikTok',
        item3: 'Colliaziun automatica a Swiss Volley ed als websites dals clubs',
        item4: 'Funcziun da tschertga per recruiters cun filters cumplains',
        item5: 'Cronologia da carriera sco tar Volleybox',
      },
      contact: {
        title: 'Contact',
        description: 'Has dumondas u propostas? Nòs vulain tadlar da tai!',
        email: 'Email',
      },
    },
    // Auth Pages
    auth: {
      login: {
        title: 'S\'annunziar',
        or: 'U',
        createAccount: 'crear in nov conto',
        email: 'Email',
        password: 'Pled-clav',
        rememberMe: 'Restar annunzià',
        forgotPassword: 'Pled-clav emblidà?',
        submit: 'S\'annunziar',
        loading: 'Chargiar...',
        invalidCredentials: 'Datas d\'annunzia nunvalidas',
        error: 'Ina errur è succedida. Emprova per plaschair anc ina giada.',
        passwordResetSuccess: 'Pled-clav reinizializà cun success! Ti pos ussa t\'annunziar.',
        invalidToken: 'Link nunvalid u scrudà.',
        tokenExpired: 'Il link è scrudà. Dumonda per plaschair in nov.',
      },
      register: {
        title: 'Tscherna tia rolla',
        subtitle: 'Es ti giugader u recruiter?',
        player: 'Giugader',
        recruiter: 'Recruiter',
        hybrid: 'Hybrid',
        playerDescription: 'Annunzia tai sco giugader da volleyball. Mussa tias capacitads, connectescha cun clubs e chattapasser pussaivladads.',
        recruiterDescription: 'Annunzia tai sco recruiter da club u trenader. Scuvra giugaders talentads e construescha tia equipa.',
        hybridDescription: 'Annunzia tai sco giugader ED recruiter. Combinescha tut duas rollas ed ha tut las pussaivladads.',
        registerAsPlayer: 'S\'annunziar sco giugader',
        registerAsRecruiter: 'S\'annunziar sco recruiter',
        registerAsHybrid: 'S\'annunziar sco hybrid',
        haveAccount: 'Has gia in conto?',
      },
      forgotPassword: {
        title: 'Pled-clav emblidà',
        subtitle: 'Endatescha tia adressa dad email e tscherna in nov pled-clav.',
        email: 'Email',
        newPassword: 'Nov pled-clav',
        confirmPassword: 'Confermar nov pled-clav',
        submit: 'Reinizializar pled-clav',
        loading: 'Trametter dumonda...',
        backToLogin: 'Enavos al login',
        enterEmail: 'Endatescha per plaschair tia adressa dad email.',
        passwordMinLength: 'Il pled-clav sto cuntegnair almain 8 caracters.',
        passwordsNoMatch: 'Ils pleds-clav na correspundan betg.',
        checkEmail: 'Controllascha tias emails per confermar il midament dal pled-clav.',
        error: 'Errur cun trametter la dumonda.',
      },
    },
    // Settings
    settings: {
      title: 'Parameters',
      subtitle: 'Administrar tias preferenzas e parameters dal conto',
      appearance: 'Aspiet',
      security: 'Login & Segirezza',
      language: 'Linguatg',
      notifications: 'Communicaziuns',
      account: 'Administraziun dal conto',
      theme: 'Modus tema',
      email: 'Adressa dad email',
      privacy: 'Protecziun da datas',
      saved: 'Parameters Memorisads',
    },
  },
  en: {
    // Gender
    'gender.male': 'Male',
    'gender.female': 'Female',
    // Login
    'login.title': 'Login',
    'login.button': 'Login',
    'login.loading': 'Logging in...',
    'login.register': 'create a new account',
    'login.or': 'Or',
    'login.email': 'Email Address',
    'login.password': 'Password',
    'login.rememberMe': 'Remember me',
    'login.forgotPassword': 'Forgot password?',
    // Chat
    'chat.writeMessage': 'Write a message...',
    'chat.addEmoji': 'Add emoji',
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.submit': 'Submit',
    // Navigation
    'nav.home': 'Home',
    'nav.players': 'Players',
    'nav.men': 'Men',
    'nav.women': 'Women',
    'nav.recruiters': 'Recruiters',
    'nav.clubs': 'Clubs',
    'nav.about': 'About',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.myProfile': 'My Profile',
    'nav.dashboard': 'Dashboard',
    // Home Page
    home: {
      hero: {
        title: 'Habicht',
        description: 'The modern scouting platform for Swiss volleyball. Discover talents, watch highlights and connect with scouts.',
        menVolleyball: 'Men\'s Volleyball',
        womenVolleyball: 'Women\'s Volleyball',
        searchAllPlayers: 'Search all players',
        login: 'Login',
        registerNow: 'Register now',
      },
      leagues: {
        title: 'All Leagues. One Place.',
        subtitle: 'From NLA elite volleyball to 5th league – discover players from all of Switzerland.',
        nla: 'National League A',
        nlb: 'National League B',
        firstLeague: '1st League',
        secondLeague: '2nd League',
        thirdLeague: '3rd League',
        fourthLeague: '4th League',
        fifthLeague: '5th League',
        players: 'Players',
      },
      features: {
        title: 'Why Habicht?',
        subtitle: 'The modern solution for Swiss volleyball scouting',
        search: {
          title: 'Smart Search',
          description: 'Find players by league, position, canton and much more',
        },
        highlights: {
          title: 'Video Highlights',
          description: 'Watch the best actions of players directly',
        },
        network: {
          title: 'Network',
          description: 'Connect with scouts, coaches and players',
        },
        stats: {
          title: 'Statistics',
          description: 'Comprehensive player profiles with detailed statistics',
        },
      },
      cta: {
        title: 'Ready to start?',
        subtitle: 'Join the largest Swiss volleyball community',
        registerPlayer: 'Register as player',
        registerRecruiter: 'Register as scout',
      },
    },
    // About Page
    about: {
      title: 'About Habicht',
      what: {
        title: 'What is Habicht?',
        description1: 'Habicht is the platform for Swiss volleyball talents. We connect players with recruiters and scouts from all over Switzerland.',
        description2: 'Inspired by Volleybox, but developed specifically for the Swiss volleyball landscape, with direct integration to Swiss Volley and the most important clubs.',
      },
      mission: {
        title: 'Mission',
        description: 'We want to create a simple and professional tool that allows Swiss volleyball talents to showcase their skills and connect with scouts and clubs.',
      },
      features: {
        title: 'Features',
        item1: 'Complete player profiles with statistics and personal information',
        item2: 'Upload video highlights or link them from YouTube, Instagram & TikTok',
        item3: 'Automatic linking to Swiss Volley and club websites',
        item4: 'Search function for recruiters with comprehensive filters',
        item5: 'Career timeline similar to Volleybox',
      },
      contact: {
        title: 'Contact',
        description: 'Do you have questions or suggestions? We would love to hear from you!',
        email: 'Email',
      },
    },
    // Auth Pages
    auth: {
      login: {
        title: 'Login',
        or: 'Or',
        createAccount: 'create a new account',
        email: 'Email',
        password: 'Password',
        rememberMe: 'Stay logged in',
        forgotPassword: 'Forgot password?',
        submit: 'Login',
        loading: 'Loading...',
        invalidCredentials: 'Invalid credentials',
        error: 'An error occurred. Please try again.',
        passwordResetSuccess: 'Password successfully reset! You can now login.',
        invalidToken: 'Invalid or expired link.',
        tokenExpired: 'Link has expired. Please request a new one.',
      },
      register: {
        title: 'Choose your role',
        subtitle: 'Are you a player or recruiter?',
        player: 'Player',
        recruiter: 'Recruiter',
        hybrid: 'Hybrid',
        playerDescription: 'Register as a volleyball player. Show your skills, connect with clubs and find opportunities.',
        recruiterDescription: 'Register as a club recruiter or coach. Discover talented players and build your team.',
        hybridDescription: 'Register as player AND recruiter. Combine both roles and have full possibilities.',
        registerAsPlayer: 'Register as player',
        registerAsRecruiter: 'Register as recruiter',
        registerAsHybrid: 'Register as hybrid',
        haveAccount: 'Already have an account?',
      },
      forgotPassword: {
        title: 'Forgot password',
        subtitle: 'Enter your email address and choose a new password.',
        email: 'Email',
        newPassword: 'New password',
        confirmPassword: 'Confirm new password',
        submit: 'Reset password',
        loading: 'Sending request...',
        backToLogin: 'Back to login',
        enterEmail: 'Please enter your email address.',
        passwordMinLength: 'Password must be at least 8 characters.',
        passwordsNoMatch: 'Passwords do not match.',
        checkEmail: 'Please check your emails to confirm the password change.',
        error: 'Error sending request.',
      },
    },
    // Settings
    settings: {
      title: 'Settings',
      subtitle: 'Manage your preferences and account settings',
      appearance: 'Appearance',
      security: 'Login & Security',
      language: 'Language',
      notifications: 'Notifications',
      account: 'Account Management',
      theme: 'Theme Mode',
      email: 'Email Address',
      privacy: 'Privacy',
      saved: 'Settings Saved',
    },
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('gsw')

  useEffect(() => {
    // Load language from localStorage on mount
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && ['gsw', 'de', 'fr', 'it', 'rm', 'en'].includes(savedLanguage)) {
      setLanguageState(savedLanguage)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    // Swiss German (gsw) is the default language - no translation needed
    // For other languages, translation happens automatically via <Translate> component
    if (lang !== 'gsw') {
      console.log(`Language changed to ${lang} - content will be translated automatically`)
    }
    setLanguageState(lang)
    localStorage.setItem('language', lang)
    // Language changes dynamically without reload, similar to browser translate extension
  }

  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = translations[language]
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        return key // Return key if translation not found
      }
    }
    
    return typeof value === 'string' ? value : key
  }

  // Dynamic translation using Google Translate API
  const translate = async (text: string, sourceLanguage: string = 'gsw'): Promise<string> => {
    const targetLanguageCode = getGoogleLanguageCode(language)
    return await translateText(text, targetLanguageCode, sourceLanguage)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translate }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
