import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface RecruiterData {
  firstName: string;
  lastName: string;
  age: number;
  nationality: string;
  canton: string;
  province?: string | null;
  phone?: string | null;
  bio?: string | null;
  coachRole: string;
  organization: string;
  position: string;
  genderCoached: string[];
  positionsLookingFor: string[];
  achievements?: string[];
  profileImage?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  youtube?: string | null;
  facebook?: string | null;
  user: {
    email: string;
  };
  club?: {
    name: string;
    logo?: string | null;
  } | null;
  clubHistory?: Array<{
    clubName: string;
    role?: string | null;
    startDate: Date | string;
    endDate?: Date | string | null;
    currentClub?: boolean;
  }>;
}

export async function generateRecruiterCV(recruiterData: RecruiterData, language: string = 'gsw'): Promise<Blob> {
  console.log('🎯 Recruiter CV Generation - Professional Format Starting...');
  console.log('Recruiter:', recruiterData.firstName, recruiterData.lastName);
  console.log('Language:', language);
  
  const doc = new jsPDF();
  
  // Colors - Habicht red theme
  const primaryColor = [220, 38, 38]; // DC2626
  const darkGray = [31, 41, 55]; // 1f2937
  const lightGray = [156, 163, 175]; // 9ca3af

  let yPos = 20;

  // Header with logo and title
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 40, 'F');
  
  // Recruiter name on the left
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  const fullName = `${recruiterData.firstName} ${recruiterData.lastName}`.toUpperCase();
  doc.text(fullName, 15, 25);
  
  // Position subtitle on the left
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  const positionText = `${recruiterData.coachRole} | ${recruiterData.organization}`;
  doc.text(positionText, 15, 33);
  
  // Add logo and "VERIFIED BY HABICHT" stamp at top right
  try {
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
    
    doc.addImage(logoBase64, 'PNG', 185, 8, 15, 15);
    
    doc.setFontSize(5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text('VERIFIZIERT VON', 182, 11, { align: 'right' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('HABICHT', 182, 16, { align: 'right' });
  } catch (error) {
    console.log('Could not add logo, using text only');
  }

  yPos = 50;

  // Personal Profile Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('PERSÖNLICHS PROFIL', 15, yPos);
  yPos += 8;

  // Add profile photo if available
  if (recruiterData.profileImage) {
    try {
      let profileBase64: string;
      
      if (recruiterData.profileImage.startsWith('data:image')) {
        profileBase64 = recruiterData.profileImage;
      } else {
        const imageUrl = recruiterData.profileImage.startsWith('http') 
          ? recruiterData.profileImage 
          : `${typeof window !== 'undefined' ? window.location.origin : 'https://www.habicht-volleyball.ch'}${recruiterData.profileImage.startsWith('/') ? '' : '/'}${recruiterData.profileImage}`;
        
        const profileResponse = await fetch(imageUrl, {
          mode: 'cors',
          credentials: 'same-origin'
        });
        
        if (profileResponse.ok) {
          const profileBlob = await profileResponse.blob();
          profileBase64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(profileBlob);
          });
          
          let imageFormat: 'PNG' | 'JPEG' = 'JPEG';
          if (profileBase64.includes('image/png')) {
            imageFormat = 'PNG';
          }
          
          doc.addImage(profileBase64, imageFormat, 150, yPos - 5, 45, 55);
        }
      }
    } catch (error) {
      console.error('❌ Could not load profile photo:', error);
    }
  }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

  const locationText = recruiterData.province ? `${recruiterData.province}, ${recruiterData.canton}` : recruiterData.canton;
  
  let narrativeLines = [
    `Alter: ${recruiterData.age} Jahr`,
    `Nationalität: ${recruiterData.nationality}`,
    `Wohnort: ${locationText}`,
    '',
    `Email: ${recruiterData.user.email}`,
  ];
  
  if (recruiterData.phone) {
    narrativeLines.push(`Telefon: ${recruiterData.phone}`);
  }
  
  narrativeLines.forEach((line, index) => {
    doc.text(line, 15, yPos + (index * 6));
  });
  
  yPos += narrativeLines.length * 6 + 10;

  // Coaching Details
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('COACHING DETAILS', 15, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

  const genderTranslations: { [key: string]: string } = {
    'MALE': 'Männer',
    'FEMALE': 'Frauen',
    'OTHER': 'Andere'
  };

  const positionTranslations: { [key: string]: string } = {
    'SETTER': 'Zuespieler/in',
    'OUTSIDE_HITTER': 'Aussenagreifer/in',
    'MIDDLE_BLOCKER': 'Mittelblöcker/in',
    'OPPOSITE': 'Diagonal',
    'LIBERO': 'Libero',
    'UNIVERSAL': 'Universal'
  };

  const coachingLines = [];
  coachingLines.push(`Position: ${recruiterData.position}`);
  
  if (recruiterData.genderCoached && recruiterData.genderCoached.length > 0) {
    const genders = recruiterData.genderCoached.map(g => genderTranslations[g] || g).join(', ');
    coachingLines.push(`Trainiert: ${genders}`);
  }

  if (recruiterData.positionsLookingFor && recruiterData.positionsLookingFor.length > 0) {
    const positions = recruiterData.positionsLookingFor.map(p => positionTranslations[p] || p).join(', ');
    coachingLines.push(`Sucht Positionen: ${positions}`);
  }

  coachingLines.forEach((line, index) => {
    doc.text(line, 15, yPos + (index * 6));
  });

  yPos += coachingLines.length * 6 + 10;

  // Current Club
  if (recruiterData.club) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('AKTUELLÄ VEREIN', 15, yPos);
    yPos += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(recruiterData.club.name, 15, yPos);
    yPos += 6;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Rolle: ${recruiterData.coachRole}`, 15, yPos);
    yPos += 10;
  }

  // Club History
  if (recruiterData.clubHistory && recruiterData.clubHistory.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('CLUB GSCHICHT', 15, yPos);
    yPos += 8;

    const clubHistoryData = recruiterData.clubHistory.map(club => [
      club.clubName,
      club.role || recruiterData.coachRole,
      `${new Date(club.startDate).getFullYear()} - ${club.endDate ? new Date(club.endDate).getFullYear() : 'Aktuell'}`
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Club', 'Rolle', 'Periode']],
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
        textColor: [0, 0, 0] as [number, number, number]
      },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [0, 0, 0] as [number, number, number] }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Bio
  if (recruiterData.bio) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('ÜBER MICH', 15, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    
    const bioLines = doc.splitTextToSize(recruiterData.bio, 175);
    bioLines.forEach((line: string) => {
      doc.text(line, 15, yPos);
      yPos += 5;
    });
    
    yPos += 10;
  }

  // Social Media Section
  if (recruiterData.instagram || recruiterData.tiktok || recruiterData.youtube || recruiterData.facebook) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('SOCIAL MEDIA', 15, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    
    const socialMediaLines = [];
    if (recruiterData.instagram) {
      socialMediaLines.push(`Instagram: ${recruiterData.instagram.startsWith('@') ? recruiterData.instagram : '@' + recruiterData.instagram}`);
    }
    if (recruiterData.tiktok) {
      socialMediaLines.push(`TikTok: ${recruiterData.tiktok.startsWith('@') ? recruiterData.tiktok : '@' + recruiterData.tiktok}`);
    }
    if (recruiterData.youtube) {
      socialMediaLines.push(`YouTube: ${recruiterData.youtube}`);
    }
    if (recruiterData.facebook) {
      socialMediaLines.push(`Facebook: ${recruiterData.facebook}`);
    }
    
    socialMediaLines.forEach((line, index) => {
      doc.text(line, 15, yPos + (index * 6));
    });
    
    yPos += socialMediaLines.length * 6 + 10;
  }

  // Achievements
  if (recruiterData.achievements && recruiterData.achievements.length > 0) {
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
    
    recruiterData.achievements.forEach((achievement, index) => {
      const bulletText = `• ${achievement}`;
      const lines = doc.splitTextToSize(bulletText, 175);
      lines.forEach((line: string) => {
        doc.text(line, 15, yPos);
        yPos += 5;
      });
      yPos += 1;
    });
    
    yPos += 5;
  }

  // Footer with page numbers
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
