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

  // Personal Information Section with Profile Image
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('PERSONAL INFORMATION', 15, yPos);
  yPos += 8;

  // Add profile photo beside personal information (right side)
  let profileImageAdded = false;
  if (playerData.profileImage) {
    try {
      console.log('Attempting to load profile image:', playerData.profileImage);
      const imageUrl = playerData.profileImage.startsWith('http') 
        ? playerData.profileImage 
        : `${typeof window !== 'undefined' ? window.location.origin : 'https://www.habicht-volleyball.ch'}${playerData.profileImage.startsWith('/') ? '' : '/'}${playerData.profileImage}`;
      
      console.log('Profile image URL:', imageUrl);
      const profileResponse = await fetch(imageUrl);
      
      if (!profileResponse.ok) {
        throw new Error(`Failed to fetch profile image: ${profileResponse.status}`);
      }
      
      const profileBlob = await profileResponse.blob();
      const profileBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(profileBlob);
      });
      
      // Detect format from base64 string
      let imageFormat: 'PNG' | 'JPEG' = 'JPEG';
      if (profileBase64.includes('image/png')) {
        imageFormat = 'PNG';
      } else if (profileBase64.includes('image/jpg') || profileBase64.includes('image/jpeg')) {
        imageFormat = 'JPEG';
      }
      
      // Add professional profile photo beside personal info (35x45mm professional size)
      doc.addImage(profileBase64, imageFormat, 155, yPos - 5, 35, 45);
      profileImageAdded = true;
      console.log('Profile image added successfully');
    } catch (error) {
      console.error('Could not load profile photo for personal info:', error);
    }
  } else {
    console.log('No profile image provided in player data');
  }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

  const age = playerData.dateOfBirth ? new Date().getFullYear() - new Date(playerData.dateOfBirth).getFullYear() : null;
  
  const personalInfo = [
    ...(playerData.dateOfBirth ? [['Date of Birth:', new Date(playerData.dateOfBirth).toLocaleDateString('de-CH')]] : []),
    ...(age ? [['Age:', `${age} years`]] : []),
    ['Gender:', playerData.gender === 'MALE' ? 'Male' : 'Female'],
    ['Nationality:', playerData.nationality],
    ['Canton:', playerData.canton],
    ...(playerData.municipality ? [['Municipality:', playerData.municipality]] : []),
    ['Email:', playerData.user.email],
    ...(playerData.phone ? [['Phone:', playerData.phone]] : []),
  ];

  autoTable(doc, {
    startY: yPos,
    body: personalInfo,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 'auto' }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Physical Stats
  if (playerData.height || playerData.weight || playerData.spikeHeight || playerData.blockHeight) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('PHYSICAL ATTRIBUTES', 15, yPos);
    yPos += 8;

    const physicalStats = [
      ...(playerData.height ? [['Height:', `${playerData.height} cm`]] : []),
      ...(playerData.weight ? [['Weight:', `${playerData.weight} kg`]] : []),
      ...(playerData.spikeHeight ? [['Spike Reach:', `${playerData.spikeHeight} cm`]] : []),
      ...(playerData.blockHeight ? [['Block Reach:', `${playerData.blockHeight} cm`]] : []),
    ];

    autoTable(doc, {
      startY: yPos,
      body: physicalStats,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 'auto' }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Current Club
  if (playerData.currentClub) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('CURRENT CLUB', 15, yPos);
    yPos += 8;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(playerData.currentClub.name, 15, yPos);
    yPos += 5;

    if (playerData.currentLeague) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text(playerData.currentLeague, 15, yPos);
      yPos += 10;
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
    doc.text('CLUB HISTORY', 15, yPos);
    yPos += 8;

    const clubHistoryData = playerData.clubHistory.map(club => [
      club.clubName,
      club.league || 'N/A',
      `${new Date(club.startDate).getFullYear()} - ${club.endDate ? new Date(club.endDate).getFullYear() : 'Present'}`
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Club', 'League', 'Period']],
      body: clubHistoryData,
      theme: 'striped',
      headStyles: {
        fillColor: [220, 38, 38] as [number, number, number],
        textColor: [255, 255, 255] as [number, number, number],
        fontSize: 10,
        fontStyle: 'bold'
      },
      styles: { fontSize: 10, cellPadding: 3 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Education/Employment
  if (playerData.schoolName || playerData.occupation) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('EDUCATION & EMPLOYMENT', 15, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    
    const educationText = [];
    if (playerData.schoolName) {
      educationText.push(`School: ${playerData.schoolName}`);
    }
    if (playerData.occupation) {
      educationText.push(`Occupation: ${playerData.occupation}`);
    }
    if (playerData.employmentStatus) {
      educationText.push(`Status: ${playerData.employmentStatus}`);
    }
    
    educationText.forEach((text, index) => {
      doc.text(text, 15, yPos + (index * 5));
    });
    
    yPos += educationText.length * 5 + 10;
  }

  // Achievements
  if (playerData.achievements && playerData.achievements.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('ACHIEVEMENTS', 15, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    const achievementText = playerData.achievements.join('\n');
    const lines = doc.splitTextToSize(achievementText, 180);
    doc.text(lines, 15, yPos);
    yPos += lines.length * 5 + 10;
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
