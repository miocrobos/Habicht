#!/usr/bin/env node
const https = require('https');

console.log('\x1b[36m%s\x1b[0m', '\n🚀 Checking Vercel Deployment Status...\n');

// Check if the production site is accessible
const checkDeployment = () => {
  const options = {
    hostname: 'www.habicht-volleyball.ch',
    port: 443,
    path: '/',
    method: 'GET',
    headers: {
      'User-Agent': 'Deployment-Checker'
    }
  };

  const req = https.request(options, (res) => {
    if (res.statusCode === 200) {
      console.log('\x1b[32m%s\x1b[0m', '✓ Production site is live and accessible');
      console.log('  \x1b[36m%s\x1b[0m', '→ https://www.habicht-volleyball.ch');
    } else {
      console.log('\x1b[33m%s\x1b[0m', `⚠ Site returned status: ${res.statusCode}`);
    }
    console.log('\n\x1b[36m%s\x1b[0m', '💡 Tip: Changes pushed to GitHub will auto-deploy to Vercel');
    console.log('   Check deployment status at: https://vercel.com/dashboard\n');
  });

  req.on('error', (error) => {
    console.log('\x1b[31m%s\x1b[0m', '✗ Could not reach production site');
    console.log('  Error:', error.message);
    console.log('\n\x1b[36m%s\x1b[0m', '💡 Check your Vercel deployment at: https://vercel.com/dashboard\n');
  });

  req.end();
};

checkDeployment();
