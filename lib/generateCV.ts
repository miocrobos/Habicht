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
  nationality: string;
  canton: string;
  municipality?: string | null;
  phone?: string | null;
  positions: string[];
  currentLeague?: string | null;
  bio?: string | null;
  achievements?: string[];
  profileImage?: string | null;
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

export async function generatePlayerCV(playerData: PlayerData): Promise<Blob> {
  console.log('🎯 CV Generation v2.0 - Professional Format Starting...');
  console.log('Player:', playerData.firstName, playerData.lastName);
  
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
  
  // Position subtitle on the left
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  const positionText = playerData.positions?.join(', ') || 'Volleyball Player';
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
    
    // Add "VERIFIED BY HABICHT" text next to logo
    doc.setFontSize(5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text('VERIFIED BY', 182, 11, { align: 'right' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('HABICHT', 182, 16, { align: 'right' });
  } catch (error) {
    console.log('Could not add logo, using text only');
    // Fallback to text-based verification if logo fails
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text('VERIFIED BY', 195, 12, { align: 'right' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('HABICHT', 195, 17, { align: 'right' });
  }

  yPos = 50;

  // Personal Profile Section with Photo (more human, narrative style)
  console.log('✅ Using NEW Professional Format (PERSÖNLICHS PROFIL)');
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('PERSÖNLICHS PROFIL', 15, yPos);
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
  const genderText = playerData.gender === 'MALE' ? 'Männlich' : 'Weiblich';
  const birthText = playerData.dateOfBirth ? new Date(playerData.dateOfBirth).toLocaleDateString('de-CH') : 'Unbekannt';
  const locationText = playerData.municipality ? `${playerData.municipality}, ${playerData.canton}` : playerData.canton;
  
  let narrativeLines = [
    `Geburtsdatum: ${birthText}${age ? ` (${age} Jahr)` : ''}`,
    `Geschlecht: ${genderText}`,
    `Nationalität: ${playerData.nationality}`,
    `Wohnort: ${locationText}`,
    '',
    `Email: ${playerData.user.email}`,
  ];
  
  if (playerData.phone) {
    narrativeLines.push(`Telefon: ${playerData.phone}`);
  }
  
  narrativeLines.forEach((line, index) => {
    doc.text(line, 15, yPos + (index * 6));
  });
  
  yPos += narrativeLines.length * 6 + 5;

  // Physical Stats (more human format)
  if (playerData.height || playerData.weight || playerData.spikeHeight || playerData.blockHeight) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('ATHLETISCHI DATE', 15, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    
    const statsLines = [];
    if (playerData.height) statsLines.push(`Körpergrösse: ${playerData.height} cm`);
    if (playerData.weight) statsLines.push(`Gewicht: ${playerData.weight} kg`);
    if (playerData.spikeHeight) statsLines.push(`Angriffsreichhöhe: ${playerData.spikeHeight} cm`);
    if (playerData.blockHeight) statsLines.push(`Blockhöhe: ${playerData.blockHeight} cm`);
    
    statsLines.forEach((line, index) => {
      doc.text(line, 15, yPos + (index * 6));
    });
    
    yPos += statsLines.length * 6 + 5;
  }

  // Current Club (more professional presentation)
  if (playerData.currentClub) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('AKTUELLÄ VEREIN', 15, yPos);
    yPos += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0); // Pure black color
    doc.text(playerData.currentClub.name, 15, yPos);
    yPos += 6;

    if (playerData.currentLeague) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text(`Liga: ${playerData.currentLeague}`, 15, yPos);
      yPos += 8;
    } else {
      yPos += 3;
    }
  }

  // Club History
  if (playerData.clubHistory && playerData.clubHistory.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('CLUB GSCHICHT', 15, yPos);
    yPos += 8;

    const clubHistoryData = playerData.clubHistory.map(club => [
      club.clubName,
      club.league || 'N/A',
      `${new Date(club.startDate).getFullYear()} - ${club.endDate ? new Date(club.endDate).getFullYear() : 'Aktuell'}`
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Club', 'Liga', 'Periode']],
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

  // Education/Employment (more narrative style)
  if (playerData.schoolName || playerData.occupation) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('USBILDIG & BERUF', 15, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    
    const educationLines = [];
    if (playerData.schoolName) {
      educationLines.push(`Schule: ${playerData.schoolName}`);
    }
    if (playerData.occupation) {
      educationLines.push(`Beruf: ${playerData.occupation}`);
    }
    if (playerData.employmentStatus) {
      // Remove underscores and capitalize properly
      const formattedStatus = playerData.employmentStatus.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase());
      educationLines.push(`Status: ${formattedStatus}`);
    }
    
    educationLines.forEach((line, index) => {
      doc.text(line, 15, yPos + (index * 6));
    });
    
    yPos += educationLines.length * 6 + 5;
  }

  // Achievements (more professional presentation)
  if (playerData.achievements && playerData.achievements.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('ERFOLGE & AUSZEICHNUNGE', 15, yPos);
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
    doc.text(
      `Generated by Habicht | www.habicht-volleyball.ch | Page ${i} of ${pageCount}`,
      105,
      290,
      { align: 'center' }
    );
  }

  return doc.output('blob');
}
