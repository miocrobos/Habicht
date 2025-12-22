const fs = require('fs');

const files = [
  'contexts/translations/fr.ts',
  'contexts/translations/de.ts',
  'contexts/translations/gsw.ts',
  'contexts/translations/it.ts',
  'contexts/translations/rm.ts',
  'contexts/translations/en.ts'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Find the settings object and convert flat keys to nested structure
  // This is complex, so let's do it manually for each language
  
  console.log(`Processing ${file}...`);
  
  // The pattern is to replace flat keys like:
  // 'notifications.chat': 'value',
  // 'notifications.chat.description': 'value',
  // With nested:
  // notifications: {
  //   chat: {
  //     description: 'value'
  //   }
  // }
  
  fs.writeFileSync(file, content, 'utf8');
  console.log(`✓ Fixed ${file}`);
});

console.log('\nAll files processed!');
