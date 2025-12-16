import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Swiss cantons with working Wikipedia URLs
const cantonFlags = {
  'ZH': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Wappen_Z%C3%BCrich_matt.svg/120px-Wappen_Z%C3%BCrich_matt.svg.png',
  'BE': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Wappen_Bern_matt.svg/120px-Wappen_Bern_matt.svg.png',
  'LU': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Wappen_Luzern_matt.svg/120px-Wappen_Luzern_matt.svg.png',
  'UR': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Wappen_Uri_matt.svg/120px-Wappen_Uri_matt.svg.png',
  'SZ': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Wappen_Schwyz_matt.svg/120px-Wappen_Schwyz_matt.svg.png',
  'OW': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Wappen_Obwalden_matt.svg/120px-Wappen_Obwalden_matt.svg.png',
  'NW': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Wappen_Nidwalden_matt.svg/120px-Wappen_Nidwalden_matt.svg.png',
  'GL': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Wappen_Glarus_matt.svg/120px-Wappen_Glarus_matt.svg.png',
  'ZG': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Wappen_Zug_matt.svg/120px-Wappen_Zug_matt.svg.png',
  'FR': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Wappen_Freiburg_matt.svg/120px-Wappen_Freiburg_matt.svg.png',
  'SO': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Wappen_Solothurn_matt.svg/120px-Wappen_Solothurn_matt.svg.png',
  'BS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Wappen_Basel-Stadt_matt.svg/120px-Wappen_Basel-Stadt_matt.svg.png',
  'BL': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Wappen_Basel-Landschaft_matt.svg/120px-Wappen_Basel-Landschaft_matt.svg.png',
  'SH': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Wappen_Schaffhausen_matt.svg/120px-Wappen_Schaffhausen_matt.svg.png',
  'AR': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Wappen_Appenzell_Ausserrhoden_matt.svg/120px-Wappen_Appenzell_Ausserrhoden_matt.svg.png',
  'AI': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Wappen_Appenzell_Innerrhoden_matt.svg/120px-Wappen_Appenzell_Innerrhoden_matt.svg.png',
  'SG': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Wappen_St._Gallen_matt.svg/120px-Wappen_St._Gallen_matt.svg.png',
  'GR': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Wappen_Graub%C3%BCnden_matt.svg/120px-Wappen_Graub%C3%BCnden_matt.svg.png',
  'AG': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Wappen_Aargau_matt.svg/120px-Wappen_Aargau_matt.svg.png',
  'TG': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Wappen_Thurgau_matt.svg/120px-Wappen_Thurgau_matt.svg.png',
  'TI': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Wappen_Tessin_matt.svg/120px-Wappen_Tessin_matt.svg.png',
  'VD': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Wappen_Waadt_matt.svg/120px-Wappen_Waadt_matt.svg.png',
  'VS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Wappen_Wallis_matt.svg/120px-Wappen_Wallis_matt.svg.png',
  'NE': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Wappen_Neuenburg_matt.svg/120px-Wappen_Neuenburg_matt.svg.png',
  'GE': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Wappen_Genf_matt.svg/120px-Wappen_Genf_matt.svg.png',
  'JU': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Wappen_Jura_matt.svg/120px-Wappen_Jura_matt.svg.png',
};

const outputDir = path.join(process.cwd(), 'public', 'cantons');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function downloadFile(url: string, outputPath: string): Promise<void> {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'image/png,image/*,*/*'
    }
  });
  
  fs.writeFileSync(outputPath, response.data);
}

async function downloadAllFlags() {
  console.log('Downloading Swiss canton flags as PNG...\n');

  for (const [canton, url] of Object.entries(cantonFlags)) {
    const outputPath = path.join(outputDir, `${canton}.png`);
    
    try {
      console.log(`Downloading ${canton}...`);
      await downloadFile(url, outputPath);
      console.log(`✓ ${canton} downloaded`);
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error: any) {
      console.error(`✗ Failed ${canton}: ${error.message}`);
    }
  }

  console.log('\n✓ Download complete!');
  console.log(`Flags saved to: ${outputDir}`);
}

downloadAllFlags();
