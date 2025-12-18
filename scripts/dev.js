const { spawn } = require('child_process');

console.log('\x1b[36m%s\x1b[0m', '\n🏐 Habicht Volleyball - Development Server');
console.log('\x1b[36m%s\x1b[0m', '==========================================\n');

const nextDev = spawn('next', ['dev'], {
  stdio: 'inherit',
  shell: true
});

// Wait a bit for Next.js to start
setTimeout(() => {
  console.log('\n\x1b[32m%s\x1b[0m', '✓ Local Development:');
  console.log('  \x1b[36m%s\x1b[0m', '→ http://localhost:3000');
  console.log('\n\x1b[32m%s\x1b[0m', '🌐 Production Website:');
  console.log('  \x1b[36m%s\x1b[0m', '→ https://www.habicht-volleyball.ch');
  console.log('  \x1b[36m%s\x1b[0m', '→ https://uni-sports-pvx6buiuj-miocrobos-projects.vercel.app\n');
}, 3000);

nextDev.on('error', (error) => {
  console.error('Failed to start dev server:', error);
  process.exit(1);
});

nextDev.on('close', (code) => {
  process.exit(code);
});
