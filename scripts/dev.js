const { spawn } = require('child_process');

console.log('\x1b[36m%s\x1b[0m', '\n🏐 Habicht Volleyball - Starting Development Workflow');
console.log('\x1b[36m%s\x1b[0m', '====================================================\n');

// Step 1: Run build first
console.log('\x1b[33m%s\x1b[0m', '📦 Step 1/3: Building project...\n');

const build = spawn('npm', ['run', 'build'], {
  stdio: 'inherit',
  shell: true
});

build.on('close', (buildCode) => {
  if (buildCode !== 0) {
    console.log('\n\x1b[31m%s\x1b[0m', '✗ Build failed! Please fix errors before starting dev server.');
    process.exit(buildCode);
  }

  console.log('\n\x1b[32m%s\x1b[0m', '✓ Build successful!\n');

  // Step 2: Check deployment
  console.log('\x1b[33m%s\x1b[0m', '🚀 Step 2/3: Checking Vercel deployment...\n');

  const checkDeploy = spawn('npm', ['run', 'check-deployment'], {
    stdio: 'inherit',
    shell: true
  });

  checkDeploy.on('close', (deployCode) => {
    // Step 3: Start dev server
    console.log('\n\x1b[33m%s\x1b[0m', '🔥 Step 3/3: Starting development server...\n');

    const nextDev = spawn('next', ['dev'], {
      stdio: 'inherit',
      shell: true
    });

    // Wait a bit for Next.js to start
    setTimeout(() => {
      console.log('\n\x1b[36m%s\x1b[0m', '==========================================');
      console.log('\x1b[32m%s\x1b[0m', '✓ Local Development:');
      console.log('  \x1b[36m%s\x1b[0m', '→ http://localhost:3000');
      console.log('\n\x1b[32m%s\x1b[0m', '🌐 Production Website:');
      console.log('  \x1b[36m%s\x1b[0m', '→ https://www.habicht-volleyball.ch');
      console.log('  \x1b[36m%s\x1b[0m', '→ https://uni-sports-pvx6buiuj-miocrobos-projects.vercel.app');
      console.log('\x1b[36m%s\x1b[0m', '==========================================\n');
    }, 3000);

    nextDev.on('error', (error) => {
      console.error('Failed to start dev server:', error);
      process.exit(1);
    });

    nextDev.on('close', (code) => {
      process.exit(code);
    });
  });
});

build.on('error', (error) => {
  console.error('Failed to build:', error);
  process.exit(1);
});
