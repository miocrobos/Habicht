import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PlayerData {
  firstName: string;
  lastName: string;
  dateOfBirth: string | Date | null;
  gender: string;
  height?: number | null;
  weight?: number | null;
  spikeHeight?: number | null;
  blockHeight?: number | null;
  dominantHand?: string | null;
  nationality: string;
  canton: string;
  municipality?: string | null;
  phone?: string | null;
  positions: string[];
  currentLeague?: string | null;
  bio?: string | null;
  achievements?: string[];
  profileImage?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  youtube?: string | null;
  user: {
    email: string;
  };
  currentClub?: {
    name: string;
    logo?: string | null;
  } | null;
  clubHistory?: Array<{
    clubName: string;
    league?: string | null;
    startDate: Date | string;
    endDate?: Date | string | null;
    currentClub?: boolean;
  }>;
  schoolName?: string | null;
  occupation?: string | null;
  employmentStatus?: string | null;
}

// PDF Translation System
interface PDFTranslations {
  verifiedBy: string;
  personalProfile: string;
  male: string;
  female: string;
  age: string;
  currentClub: string;
  school: string;
  occupation: string;
  status: string;
  contact: string;
  physicalAttributes: string;
  height: string;
  weight: string;
  spikeHeight: string;
  blockHeight: string;
  dominantHand: string;
  rightHanded: string;
  leftHanded: string;
  ambidextrous: string;
  clubHistory: string;
  club: string;
  league: string;
  period: string;
  current: string;
  achievements: string;
  socialMedia: string;
  footer: string;
  studentFullTime: string;
  studentPartTime: string;
  workingFullTime: string;
  workingPartTime: string;
  // Additional personal info labels
  dateOfBirth: string;
  gender: string;
  nationality: string;
  location: string;
  email: string;
  phone: string;
  educationEmployment: string;
  unknown: string;
  positions: {
    SETTER: string;
    OUTSIDE_HITTER: string;
    MIDDLE_BLOCKER: string;
    OPPOSITE: string;
    LIBERO: string;
    UNIVERSAL: string;
  };
}

const pdfTranslations: { [key: string]: PDFTranslations } = {
  gsw: {
    verifiedBy: 'VERIFIZIERT VON',
    personalProfile: 'PERSÖNLICHS PROFIL',
    male: 'Männlich',
    female: 'Weiblich',
    age: 'Jahr Alt',
    currentClub: 'Aktuelle Verein',
    school: 'Schuel',
    occupation: 'Beruf',
    status: 'Status',
    contact: 'Kontakt',
    dateOfBirth: 'Geburtsdatum',
    gender: 'Geschlecht',
    nationality: 'Nationalität',
    location: 'Wohnort',
    email: 'Email',
    phone: 'Telefon',
    educationEmployment: 'USBILDIG & BERUF',
    unknown: 'Unbekannt',
    physicalAttributes: 'PHYSISCHI ATTRIBUTE',
    height: 'Grössi',
    weight: 'Gwicht',
    spikeHeight: 'Sprung-Schmetteri',
    blockHeight: 'Sprung-Block',
    dominantHand: 'Haupthand',
    rightHanded: 'Rechtshänder',
    leftHanded: 'Linkshänder',
    ambidextrous: 'Beidhändig',
    clubHistory: 'VEREINSHISTORIE',
    club: 'Verein',
    league: 'Liga',
    period: 'Zitraum',
    current: 'Aktuell',
    achievements: 'ERFOLG & USZEICHNIGE',
    socialMedia: 'SOCIAL MEDIA',
    footer: 'Erstellt mit Habicht - Schwiizer Volleyball Scouting Plattform',
    studentFullTime: 'Student Vollziit',
    studentPartTime: 'Student Teilziit',
    workingFullTime: 'Schaffend Vollziit',
    workingPartTime: 'Schaffend Teilziit',
    positions: {
      SETTER: 'Zuespieler/in',
      OUTSIDE_HITTER: 'Aussenagreifer/in',
      MIDDLE_BLOCKER: 'Mittelblöcker/in',
      OPPOSITE: 'Diagonal',
      LIBERO: 'Libero',
      UNIVERSAL: 'Universal'
    }
  },
  de: {
    verifiedBy: 'VERIFIZIERT VON',
    personalProfile: 'PERSÖNLICHES PROFIL',
    male: 'Männlich',
    female: 'Weiblich',
    age: 'Jahre Alt',
    currentClub: 'Aktueller Verein',
    school: 'Schule',
    occupation: 'Beruf',
    status: 'Status',
    contact: 'Kontakt',
    dateOfBirth: 'Geburtsdatum',
    gender: 'Geschlecht',
    nationality: 'Nationalität',
    location: 'Wohnort',
    email: 'E-Mail',
    phone: 'Telefon',
    educationEmployment: 'BILDUNG & BERUF',
    unknown: 'Unbekannt',
    physicalAttributes: 'PHYSISCHE ATTRIBUTE',
    height: 'Größe',
    weight: 'Gewicht',
    spikeHeight: 'Sprunghöhe Angriff',
    blockHeight: 'Sprunghöhe Block',
    dominantHand: 'Dominante Hand',
    rightHanded: 'Rechtshänder',
    leftHanded: 'Linkshänder',
    ambidextrous: 'Beidhändig',
    clubHistory: 'VEREINSGESCHICHTE',
    club: 'Verein',
    league: 'Liga',
    period: 'Zeitraum',
    current: 'Aktuell',
    achievements: 'ERFOLGE & AUSZEICHNUNGEN',
    socialMedia: 'SOCIAL MEDIA',
    footer: 'Erstellt mit Habicht - Schweizer Volleyball Scouting Plattform',
    studentFullTime: 'Student Vollzeit',
    studentPartTime: 'Student Teilzeit',
    workingFullTime: 'Berufstätig Vollzeit',
    workingPartTime: 'Berufstätig Teilzeit',
    positions: {
      SETTER: 'Zuspieler/in',
      OUTSIDE_HITTER: 'Außenangreifer/in',
      MIDDLE_BLOCKER: 'Mittelblocker/in',
      OPPOSITE: 'Diagonal',
      LIBERO: 'Libero',
      UNIVERSAL: 'Universal'
    }
  },
  fr: {
    verifiedBy: 'VÉRIFIÉ PAR',
    personalProfile: 'PROFIL PERSONNEL',
    male: 'Masculin',
    female: 'Féminin',
    age: 'Ans',
    currentClub: 'Club Actuel',
    school: 'École',
    occupation: 'Profession',
    status: 'Statut',
    contact: 'Contact',
    dateOfBirth: 'Date de naissance',
    gender: 'Sexe',
    nationality: 'Nationalité',
    location: 'Lieu de résidence',
    email: 'E-mail',
    phone: 'Téléphone',
    educationEmployment: 'FORMATION & PROFESSION',
    unknown: 'Inconnu',
    physicalAttributes: 'ATTRIBUTS PHYSIQUES',
    height: 'Taille',
    weight: 'Poids',
    spikeHeight: 'Hauteur De Détente Attaque',
    blockHeight: 'Hauteur De Détente Contre',
    dominantHand: 'Main dominante',
    rightHanded: 'Droitier',
    leftHanded: 'Gaucher',
    ambidextrous: 'Ambidextre',
    clubHistory: 'HISTORIQUE DU CLUB',
    club: 'Club',
    league: 'Ligue',
    period: 'Période',
    current: 'Actuel',
    achievements: 'RÉALISATIONS & DISTINCTIONS',
    socialMedia: 'RÉSEAUX SOCIAUX',
    footer: 'Créé avec Habicht - Plateforme de Scouting Volleyball Suisse',
    studentFullTime: 'Étudiant temps plein',
    studentPartTime: 'Étudiant temps partiel',
    workingFullTime: 'Employé temps plein',
    workingPartTime: 'Employé temps partiel',
    positions: {
      SETTER: 'Passeur/Passeuse',
      OUTSIDE_HITTER: 'Attaquant/Attaquante',
      MIDDLE_BLOCKER: 'Contreur/Contreuse Central',
      OPPOSITE: 'Pointu',
      LIBERO: 'Libero',
      UNIVERSAL: 'Universel'
    }
  },
  it: {
    verifiedBy: 'VERIFICATO DA',
    personalProfile: 'PROFILO PERSONALE',
    male: 'Maschile',
    female: 'Femminile',
    age: 'Anni',
    currentClub: 'Club Attuale',
    school: 'Scuola',
    occupation: 'Professione',
    status: 'Stato',
    contact: 'Contatto',
    dateOfBirth: 'Data di nascita',
    gender: 'Sesso',
    nationality: 'Nazionalità',
    location: 'Luogo di residenza',
    email: 'E-mail',
    phone: 'Telefono',
    educationEmployment: 'FORMAZIONE & PROFESSIONE',
    unknown: 'Sconosciuto',
    physicalAttributes: 'ATTRIBUTI FISICI',
    height: 'Altezza',
    weight: 'Peso',
    spikeHeight: 'Altezza Di Salto In Attacco',
    blockHeight: 'Altezza Di Salto A Muro',
    dominantHand: 'Mano dominante',
    rightHanded: 'Destro',
    leftHanded: 'Mancino',
    ambidextrous: 'Ambidestro',
    clubHistory: 'STORIA DEL CLUB',
    club: 'Club',
    league: 'Lega',
    period: 'Periodo',
    current: 'Attuale',
    achievements: 'SUCCESSI & RICONOSCIMENTI',
    socialMedia: 'SOCIAL MEDIA',
    footer: 'Creato con Habicht - Piattaforma di Scouting Pallavolo Svizzera',
    studentFullTime: 'Studente a tempo pieno',
    studentPartTime: 'Studente part-time',
    workingFullTime: 'Lavoratore a tempo pieno',
    workingPartTime: 'Lavoratore part-time',
    positions: {
      SETTER: 'Palleggiatore/Palleggiatrice',
      OUTSIDE_HITTER: 'Schiacciatore/Schiacciatrice',
      MIDDLE_BLOCKER: 'Centrale',
      OPPOSITE: 'Opposto',
      LIBERO: 'Libero',
      UNIVERSAL: 'Universale'
    }
  },
  rm: {
    verifiedBy: 'VERIFICÀ DA',
    personalProfile: 'PROFIL PERSUNAL',
    male: 'Masculin',
    female: 'Feminin',
    age: 'Onns',
    currentClub: 'Club Actual',
    school: 'Scola',
    occupation: 'Professiun',
    status: 'Status',
    contact: 'Contact',
    dateOfBirth: 'Data da naschientscha',
    gender: 'Schlattaing',
    nationality: 'Naziunalitad',
    location: 'Lieu da domicil',
    email: 'E-mail',
    phone: 'Telefon',
    educationEmployment: 'FURMAZIUN & PROFESSIUN',
    unknown: 'Nunenconuschent',
    physicalAttributes: 'ATTRIBUTS FISICS',
    height: 'Grondezza',
    weight: 'Paisa',
    spikeHeight: 'Autezza Attatga',
    blockHeight: 'Autezza Bloccada',
    dominantHand: 'Maun dominanta',
    rightHanded: 'Dretg',
    leftHanded: 'Sanester',
    ambidextrous: 'Ambidexter',
    clubHistory: 'ISTORGIA DAL CLUB',
    club: 'Club',
    league: 'Liga',
    period: 'Perioda',
    current: 'Actual',
    achievements: 'SUCCESSAS & DISTINCZIUNS',
    socialMedia: 'MEDIAS SOCIALAS',
    footer: 'Creà cun Habicht - Plattaforma da Scouting Volleyball Svizzer',
    studentFullTime: 'Student temp plain',
    studentPartTime: 'Student temp parzial',
    workingFullTime: 'Lavurand temp plain',
    workingPartTime: 'Lavurand temp parzial',
    positions: {
      SETTER: 'Passader/Passadra',
      OUTSIDE_HITTER: 'Attaccader/Attaccadra',
      MIDDLE_BLOCKER: 'Bloccader/Bloccadra Central',
      OPPOSITE: 'Diagonal',
      LIBERO: 'Libero',
      UNIVERSAL: 'Universal'
    }
  },
  en: {
    verifiedBy: 'VERIFIED BY',
    personalProfile: 'PERSONAL PROFILE',
    male: 'Male',
    female: 'Female',
    age: 'Years Old',
    currentClub: 'Current Club',
    school: 'School',
    occupation: 'Occupation',
    status: 'Status',
    contact: 'Contact',
    dateOfBirth: 'Date of Birth',
    gender: 'Gender',
    nationality: 'Nationality',
    location: 'Location',
    email: 'Email',
    phone: 'Phone',
    educationEmployment: 'EDUCATION & EMPLOYMENT',
    unknown: 'Unknown',
    physicalAttributes: 'PHYSICAL ATTRIBUTES',
    height: 'Height',
    weight: 'Weight',
    spikeHeight: 'Spike Height',
    blockHeight: 'Block Height',
    dominantHand: 'Dominant Hand',
    rightHanded: 'Right-Handed',
    leftHanded: 'Left-Handed',
    ambidextrous: 'Ambidextrous',
    clubHistory: 'CLUB HISTORY',
    club: 'Club',
    league: 'League',
    period: 'Period',
    current: 'Current',
    achievements: 'ACHIEVEMENTS & AWARDS',
    socialMedia: 'SOCIAL MEDIA',
    footer: 'Created with Habicht - Swiss Volleyball Scouting Platform',
    studentFullTime: 'Student full-time',
    studentPartTime: 'Student part-time',
    workingFullTime: 'Working full-time',
    workingPartTime: 'Working part-time',
    positions: {
      SETTER: 'Setter',
      OUTSIDE_HITTER: 'Outside Hitter',
      MIDDLE_BLOCKER: 'Middle Blocker',
      OPPOSITE: 'Opposite',
      LIBERO: 'Libero',
      UNIVERSAL: 'Universal'
    }
  }
};

// Helper function to translate employment status
function translateEmploymentStatus(status: string | null | undefined, translations: PDFTranslations): string {
  if (!status) return '';
  
  const statusMap: { [key: string]: keyof PDFTranslations } = {
    'STUDENT_FULL_TIME': 'studentFullTime',
    'STUDENT_PART_TIME': 'studentPartTime',
    'WORKING_FULL_TIME': 'workingFullTime',
    'WORKING_PART_TIME': 'workingPartTime'
  };
  
  const translationKey = statusMap[status];
  return translationKey ? (translations[translationKey] as string) : status;
}

export async function generatePlayerCV(playerData: PlayerData, language: string = 'gsw'): Promise<Blob> {
  console.log('🎯 CV Generation v2.0 - Professional Format Starting...');
  console.log('Player:', playerData.firstName, playerData.lastName);
  console.log('Language:', language);
  
  // Get translations for selected language
  const translations = pdfTranslations[language] || pdfTranslations['gsw'];
  const positions = translations.positions as { [key: string]: string };
  
  const doc = new jsPDF();
  
  // Colors - Habicht red theme
  const primaryColor = [220, 38, 38]; // DC2626
  const darkGray = [31, 41, 55]; // 1f2937
  const lightGray = [156, 163, 175]; // 9ca3af

  let yPos = 20;

  // Header with logo and title
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 40, 'F');
  
  // Player name on the left
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  const fullName = `${playerData.firstName} ${playerData.lastName}`.toUpperCase();
  doc.text(fullName, 15, 25);
  
  // Position subtitle on the left - translate positions
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  const translatedPositions = playerData.positions?.map(pos => positions[pos] || pos) || [];
  const positionText = translatedPositions.join(', ') || 'Volleyball Spieler/in';
  doc.text(positionText, 15, 33);
  
  // Add logo and "VERIFIED BY HABICHT" stamp at top right
  try {
    // Load eagle logo - use absolute URL
    const logoUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/eagle-logo.png` 
      : 'https://www.habicht-volleyball.ch/eagle-logo.png';
    
    const logoResponse = await fetch(logoUrl);
    const logoBlob = await logoResponse.blob();
    const logoBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(logoBlob);
    });
    
    // Add logo image at top right
    doc.addImage(logoBase64, 'PNG', 185, 8, 15, 15);
    
    // Add verification text next to logo
    doc.setFontSize(5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text(translations.verifiedBy as string, 182, 11, { align: 'right' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('HABICHT', 182, 16, { align: 'right' });
  } catch (error) {
    console.log('Could not add logo, using text only');
    // Fallback to text-based verification if logo fails
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text(translations.verifiedBy as string, 195, 12, { align: 'right' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('HABICHT', 195, 17, { align: 'right' });
  }

  yPos = 50;

  // Personal Profile Section with Photo (more human, narrative style)
  console.log('✅ Using Professional Format with translations');
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(translations.personalProfile as string, 15, yPos);
  yPos += 8;

  // Add profile photo beside personal information (right side)
  let profileImageAdded = false;
  if (playerData.profileImage) {
    try {
      console.log('🖼️ Attempting to load profile image:', playerData.profileImage);
      
      let profileBase64: string;
      
      // Check if image is already base64
      if (playerData.profileImage.startsWith('data:image')) {
        console.log('✅ Image is already base64');
        profileBase64 = playerData.profileImage;
      } else {
        // Image is a URL, need to fetch it
        const imageUrl = playerData.profileImage.startsWith('http') 
          ? playerData.profileImage 
          : `${typeof window !== 'undefined' ? window.location.origin : 'https://www.habicht-volleyball.ch'}${playerData.profileImage.startsWith('/') ? '' : '/'}${playerData.profileImage}`;
        
        console.log('📥 Fetching profile image from URL:', imageUrl);
        const profileResponse = await fetch(imageUrl, {
          mode: 'cors',
          credentials: 'same-origin'
        });
        
        if (!profileResponse.ok) {
          throw new Error(`Failed to fetch profile image: ${profileResponse.status}`);
        }
        
        const profileBlob = await profileResponse.blob();
        profileBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(profileBlob);
        });
      }
      
      // Detect format from base64 string
      let imageFormat: 'PNG' | 'JPEG' = 'JPEG';
      if (profileBase64.includes('image/png')) {
        imageFormat = 'PNG';
      } else if (profileBase64.includes('image/jpg') || profileBase64.includes('image/jpeg')) {
        imageFormat = 'JPEG';
      }
      
      // Add professional profile photo beside personal info (45x55mm professional size)
      doc.addImage(profileBase64, imageFormat, 150, yPos - 5, 45, 55);
      profileImageAdded = true;
      console.log('✅ Profile image added successfully to PDF');
    } catch (error) {
      console.error('❌ Could not load profile photo:', error);
    }
  } else {
    console.log('⚠️ No profile image provided in player data');
  }

  // Create a more narrative, human-readable personal section
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

  const age = playerData.dateOfBirth ? new Date().getFullYear() - new Date(playerData.dateOfBirth).getFullYear() : null;
  
  // Build narrative text instead of table
  const genderText = playerData.gender === 'MALE' ? translations.male as string : translations.female as string;
  // Format birth date with zero-padding (e.g., 06.03.2006)
  const formatBirthDate = (dateString: string | Date | null) => {
    if (!dateString) return translations.unknown;
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };
  const birthText = formatBirthDate(playerData.dateOfBirth);
  const locationText = playerData.municipality ? `${playerData.municipality}, ${playerData.canton}` : playerData.canton;
  
  let narrativeLines = [
    `${translations.dateOfBirth}: ${birthText}`,
    `${translations.gender}: ${genderText}`,
    `${translations.nationality}: ${playerData.nationality}`,
    `${translations.location}: ${locationText}`,
    '',
    `${translations.email}: ${playerData.user.email}`,
  ];
  
  if (playerData.phone) {
    narrativeLines.push(`${translations.phone}: ${playerData.phone}`);
  }
  
  narrativeLines.forEach((line, index) => {
    doc.text(line, 15, yPos + (index * 6));
  });
  
  yPos += narrativeLines.length * 6 + 5;

  // Physical Stats (more human format)
  if (playerData.height || playerData.weight || playerData.spikeHeight || playerData.blockHeight || playerData.dominantHand) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(translations.physicalAttributes.toUpperCase(), 15, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    
    const statsLines = [];
    if (playerData.height) statsLines.push(`${translations.height}: ${playerData.height} cm`);
    if (playerData.weight) statsLines.push(`${translations.weight}: ${playerData.weight} kg`);
    if (playerData.spikeHeight) statsLines.push(`${translations.spikeHeight}: ${playerData.spikeHeight} cm`);
    if (playerData.blockHeight) statsLines.push(`${translations.blockHeight}: ${playerData.blockHeight} cm`);
    if (playerData.dominantHand) {
      const handText = playerData.dominantHand === 'RIGHT' ? translations.rightHanded :
                       playerData.dominantHand === 'LEFT' ? translations.leftHanded :
                       playerData.dominantHand === 'AMBIDEXTROUS' ? translations.ambidextrous :
                       playerData.dominantHand;
      statsLines.push(`${translations.dominantHand}: ${handText}`);
    }
    
    statsLines.forEach((line, index) => {
      doc.text(line, 15, yPos + (index * 6));
    });
    
    yPos += statsLines.length * 6 + 5;
  }

  // Education/Employment - moved before club history for better CV flow
  if (playerData.schoolName || playerData.occupation) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(translations.educationEmployment.toUpperCase(), 15, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    
    const educationLines = [];
    if (playerData.schoolName) {
      educationLines.push(`${translations.school}: ${playerData.schoolName}`);
    }
    if (playerData.occupation) {
      educationLines.push(`${translations.occupation}: ${playerData.occupation}`);
    }
    if (playerData.employmentStatus) {
      const translatedStatus = translateEmploymentStatus(playerData.employmentStatus, translations);
      educationLines.push(`${translations.status}: ${translatedStatus}`);
    }
    
    educationLines.forEach((line, index) => {
      doc.text(line, 15, yPos + (index * 6));
    });
    
    yPos += educationLines.length * 6 + 10;
  }

  // Club History - moved after education
  if (playerData.clubHistory && playerData.clubHistory.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(translations.clubHistory.toUpperCase(), 15, yPos);
    yPos += 8;

    // Remove duplicates and sort by start date (most recent first)
    const uniqueClubHistory = playerData.clubHistory
      .filter((club, index, self) => 
        index === self.findIndex((c) => 
          c.clubName === club.clubName && 
          new Date(c.startDate).getTime() === new Date(club.startDate).getTime()
        )
      )
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    const clubHistoryData = uniqueClubHistory.map(club => [
      club.clubName,
      club.league || 'N/A',
      `${new Date(club.startDate).getFullYear()} - ${club.endDate ? new Date(club.endDate).getFullYear() : translations.current}`
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [[translations.club, translations.league, translations.period]],
      body: clubHistoryData,
      theme: 'striped',
      headStyles: {
        fillColor: [220, 38, 38] as [number, number, number],
        textColor: [255, 255, 255] as [number, number, number],
        fontSize: 10,
        fontStyle: 'bold'
      },
      styles: { 
        fontSize: 10, 
        cellPadding: 3,
        textColor: [0, 0, 0] as [number, number, number] // Pure black for all text
      },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [0, 0, 0] as [number, number, number] } // Pure black bold for club names
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Social Media Section
  if (playerData.instagram || playerData.tiktok || playerData.youtube) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(translations.socialMedia.toUpperCase(), 15, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    
    const socialMediaLines = [];
    if (playerData.instagram) {
      socialMediaLines.push(`Instagram: ${playerData.instagram.startsWith('@') ? playerData.instagram : '@' + playerData.instagram}`);
    }
    if (playerData.tiktok) {
      socialMediaLines.push(`TikTok: ${playerData.tiktok.startsWith('@') ? playerData.tiktok : '@' + playerData.tiktok}`);
    }
    if (playerData.youtube) {
      socialMediaLines.push(`YouTube: ${playerData.youtube}`);
    }
    
    socialMediaLines.forEach((line, index) => {
      doc.text(line, 15, yPos + (index * 6));
    });
    
    yPos += socialMediaLines.length * 6 + 10;
  }

  // Achievements (more professional presentation) - kept at the end
  if (playerData.achievements && playerData.achievements.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(translations.achievements.toUpperCase(), 15, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    
    playerData.achievements.forEach((achievement, index) => {
      const bulletText = `• ${achievement}`;
      const lines = doc.splitTextToSize(bulletText, 175);
      lines.forEach((line: string) => {
        doc.text(line, 15, yPos);
        yPos += 5;
      });
      yPos += 1; // Extra space between achievements
    });
    
    yPos += 5;
  }

  // Footer with page numbers only
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    const footerText = `${translations.footer} | Page ${i} of ${pageCount}`;
    doc.text(
      footerText,
      105,
      290,
      { align: 'center' }
    );
  }

  return doc.output('blob');
}
