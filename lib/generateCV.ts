import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PlayerData {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string;
  height?: number;
  weight?: number;
  spikeHeight?: number;
  blockHeight?: number;
  nationality: string;
  canton: string;
  municipality?: string;
  phone?: string;
  position: string;
  preferredFoot?: string;
  experience: string;
  bio?: string;
  achievements?: string;
  user: {
    email: string;
  };
  currentClub?: {
    name: string;
    league?: string;
  };
  clubHistory?: Array<{
    clubName: string;
    position: string;
    startDate: Date;
    endDate?: Date;
  }>;
  education?: {
    school?: string;
    degree?: string;
    graduationYear?: number;
  };
}

export async function generatePlayerCV(playerData: PlayerData): Promise<Blob> {
  const doc = new jsPDF();
  
  // Colors - Habicht red theme
  const primaryColor = [220, 38, 38]; // DC2626
  const darkGray = [31, 41, 55]; // 1f2937
  const lightGray = [156, 163, 175]; // 9ca3af

  let yPos = 20;

  // Header with logo placeholder and title
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 40, 'F');
  
  // Add "VERIFIED BY HABICHT" stamp
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('VERIFIED BY', 15, 15);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('HABICHT', 15, 25);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Swiss Volleyball Scouting Platform', 15, 32);
  
  // Player name on the right
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  const fullName = `${playerData.firstName} ${playerData.lastName}`.toUpperCase();
  const nameWidth = doc.getTextWidth(fullName);
  doc.text(fullName, 210 - nameWidth - 15, 25);
  
  // Position subtitle
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255);
  const positionText = playerData.position || 'Volleyball Player';
  const positionWidth = doc.getTextWidth(positionText);
  doc.text(positionText, 210 - positionWidth - 15, 33);

  yPos = 50;

  // Personal Information Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('PERSONAL INFORMATION', 15, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

  const age = new Date().getFullYear() - new Date(playerData.dateOfBirth).getFullYear();
  
  const personalInfo = [
    ['Date of Birth:', new Date(playerData.dateOfBirth).toLocaleDateString('de-CH')],
    ['Age:', `${age} years`],
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
      ...(playerData.preferredFoot ? [['Preferred Foot:', playerData.preferredFoot]] : []),
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

    if (playerData.currentClub.league) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text(playerData.currentClub.league, 15, yPos);
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
      club.position,
      `${new Date(club.startDate).getFullYear()} - ${club.endDate ? new Date(club.endDate).getFullYear() : 'Present'}`
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Club', 'Position', 'Period']],
      body: clubHistoryData,
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      styles: { fontSize: 10, cellPadding: 3 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Experience
  if (playerData.experience) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('EXPERIENCE', 15, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(playerData.experience, 15, yPos);
    yPos += 10;
  }

  // Achievements
  if (playerData.achievements) {
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
    const lines = doc.splitTextToSize(playerData.achievements, 180);
    doc.text(lines, 15, yPos);
    yPos += lines.length * 5 + 10;
  }

  // Bio/About
  if (playerData.bio) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('ABOUT', 15, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    const lines = doc.splitTextToSize(playerData.bio, 180);
    doc.text(lines, 15, yPos);
  }

  // Footer
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
