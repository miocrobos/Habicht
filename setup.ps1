# Habicht - Installation Script
# Run this in PowerShell

Write-Host "🏐 Habicht - Swiss Volleyball Scouting Platform Setup" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found. Please install from https://nodejs.org" -ForegroundColor Red
    exit
}

# Check npm
Write-Host "Checking npm..." -ForegroundColor Yellow
if (Get-Command npm -ErrorAction SilentlyContinue) {
    $npmVersion = npm --version
    Write-Host "✓ npm installed: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "✗ npm not found. Please install Node.js" -ForegroundColor Red
    exit
}

# Install dependencies
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit
}

# Create .env.local if it doesn't exist
Write-Host ""
Write-Host "Setting up environment file..." -ForegroundColor Yellow
if (!(Test-Path ".env.local")) {
    Copy-Item ".env.example" ".env.local"
    Write-Host "✓ Created .env.local from template" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Edit .env.local with your credentials:" -ForegroundColor Yellow
    Write-Host "   - DATABASE_URL" -ForegroundColor Cyan
    Write-Host "   - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)" -ForegroundColor Cyan
    Write-Host "   - Cloudinary credentials (optional, for video uploads)" -ForegroundColor Cyan
} else {
    Write-Host "✓ .env.local already exists" -ForegroundColor Green
}

# Database setup prompt
Write-Host ""
Write-Host "Database Setup" -ForegroundColor Yellow
Write-Host "Have you set up your PostgreSQL database? (Y/N)" -ForegroundColor Cyan
$dbSetup = Read-Host

if ($dbSetup -eq "Y" -or $dbSetup -eq "y") {
    Write-Host ""
    Write-Host "Pushing database schema..." -ForegroundColor Yellow
    npm run db:push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database schema created successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to create database schema" -ForegroundColor Red
        Write-Host "   Make sure DATABASE_URL is correct in .env.local" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "⚠️  Database setup skipped. Remember to:" -ForegroundColor Yellow
    Write-Host "   1. Create PostgreSQL database" -ForegroundColor Cyan
    Write-Host "   2. Update DATABASE_URL in .env.local" -ForegroundColor Cyan
    Write-Host "   3. Run: npm run db:push" -ForegroundColor Cyan
}

# Summary
Write-Host ""
Write-Host "=================================================" -ForegroundColor Green
Write-Host "Setup Complete! 🎉" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review and update .env.local with your credentials" -ForegroundColor Cyan
Write-Host "2. If not done, set up database: npm run db:push" -ForegroundColor Cyan
Write-Host "3. Start development server: npm run dev" -ForegroundColor Cyan
Write-Host "4. Visit: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Optional:" -ForegroundColor Yellow
Write-Host "- View database: npm run db:studio" -ForegroundColor Cyan
Write-Host "- Read SETUP.md for detailed instructions" -ForegroundColor Cyan
Write-Host ""
Write-Host "Good luck! 🏐🇨🇭" -ForegroundColor Green
