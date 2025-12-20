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
