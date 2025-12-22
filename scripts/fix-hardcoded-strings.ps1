# COMPREHENSIVE TRANSLATION FIX SCRIPT
# This script replaces ALL hardcoded strings with translation keys

Write-Host "="*80 -ForegroundColor Cyan
Write-Host "COMPREHENSIVE TRANSLATION FIX - Starting..." -ForegroundColor Cyan
Write-Host "="*80 -ForegroundColor Cyan

$fixes = @(
    # File: app/players/[id]/edit/page.tsx
    @{
        file = "app\players\[id]\edit\page.tsx"
        replacements = @(
            @{ find = 'placeholder="z.B. Winterthur, Bern, Luzern"'; replace = 'placeholder={t("placeholders.exampleCities")}' }
            @{ find = 'placeholder="z.B. Marketing Manager, Softwareentwickler"'; replace = 'placeholder={t("placeholders.exampleJob")}' }
            @{ find = 'placeholder="z.B. Volley Amriswil"'; replace = 'placeholder={t("placeholders.exampleClub")}' }
            @{ find = 'placeholder="z.B. 2020"'; replace = 'placeholder={t("placeholders.exampleYear")}' }
            @{ find = 'placeholder="z.B. 2023"'; replace = 'placeholder={t("placeholders.exampleYear")}' }
            @{ find = 'placeholder="z.B. U17 Schwiizermeister 2021"'; replace = 'placeholder={t("placeholders.exampleAchievement")}' }
            @{ find = '>Beschäftigungsstatus</'; replace = '>{t("labels.employmentStatus")}</' }
            @{ find = '>Schuel / Universität</'; replace = '>{t("labels.schoolUniversity")}</' }
            @{ find = '>Beruf</'; replace = '>{t("labels.occupation")}</' }
            @{ find = '>Volleyball Informatione</'; replace = '>{t("labels.volleyballInfo")}</' }
        )
    }
    
    # File: app/auth/register/player/page.tsx  
    @{
        file = "app\auth\register\player\page.tsx"
        replacements = @(
            @{ find = 'placeholder="180"'; replace = 'placeholder={t("placeholders.height")}' }
            @{ find = 'placeholder="75"'; replace = 'placeholder={t("placeholders.weight")}' }
            @{ find = 'placeholder="tt.mm.jjjj"'; replace = 'placeholder={t("placeholders.dateFormat")}' }
            @{ find = 'placeholder="+41 79 123 45 67"'; replace = 'placeholder={t("placeholders.phoneNumber")}' }
            @{ find = 'placeholder="z.B. Winterthur, Bern, etc."'; replace = 'placeholder={t("placeholders.exampleCities")}' }
            @{ find = 'placeholder="z.B. Software Entwickler, Lehrer, etc."'; replace = 'placeholder={t("placeholders.exampleJob")}' }
            @{ find = 'placeholder="320"'; replace = 'placeholder={t("placeholders.spikeHeight")}' }
            @{ find = 'placeholder="300"'; replace = 'placeholder={t("placeholders.blockHeight")}' }
            @{ find = 'placeholder="Verzell Über Dich, Din Spielstil, Dini Ziel, etc..."'; replace = 'placeholder={t("placeholders.tellAboutYourself")}' }
            @{ find = 'placeholder="z.B. Schwiizermeister 2023, MVP Uszeichnig, etc."'; replace = 'placeholder={t("placeholders.exampleAchievement")}' }
            @{ find = 'placeholder="z.B. NLA, 1. Liga, U19 Elite, etc."'; replace = 'placeholder={t("placeholders.exampleLeague")}' }
            @{ find = 'placeholder="2020"'; replace = 'placeholder={t("placeholders.exampleYear")}' }
            @{ find = 'placeholder="2023"'; replace = 'placeholder={t("placeholders.exampleYear")}' }
        )
    }
    
    # File: components/shared/ClubSelector.tsx
    @{
        file = "components\shared\ClubSelector.tsx"
        replacements = @(
            @{ find = 'placeholder="Suche nach Club oder Stadt..."'; replace = 'placeholder={t("placeholders.searchClubCity")}' }
        )
    }
    
    # File: app/clubs/submit/page.tsx
    @{
        file = "app\clubs\submit\page.tsx"
        replacements = @(
            @{ find = 'placeholder="https://example.ch"'; replace = 'placeholder={t("placeholders.websiteUrl")}' }
        )
    }
)

$totalReplacements = 0
foreach ($fix in $fixes) {
    $filePath = $fix.file
    if (Test-Path $filePath) {
        Write-Host "`nProcessing: $filePath" -ForegroundColor Yellow
        $content = Get-Content $filePath -Raw -Encoding UTF8
        
        $changesMade = 0
        foreach ($replacement in $fix.replacements) {
            if ($content -match [regex]::Escape($replacement.find)) {
                $content = $content -replace [regex]::Escape($replacement.find), $replacement.replace
                $changesMade++
                $totalReplacements++
                Write-Host "  ✓ Replaced: $($replacement.find.Substring(0, [Math]::Min(50, $replacement.find.Length)))..." -ForegroundColor Green
            }
        }
        
        if ($changesMade -gt 0) {
            Set-Content -Path $filePath -Value $content -Encoding UTF8 -NoNewline
            Write-Host "  Total changes in file: $changesMade" -ForegroundColor Cyan
        } else {
            Write-Host "  No changes needed" -ForegroundColor Gray
        }
    } else {
        Write-Host "`nFile not found: $filePath" -ForegroundColor Red
    }
}

Write-Host "`n" + "="*80 -ForegroundColor Cyan
Write-Host "TOTAL REPLACEMENTS MADE: $totalReplacements" -ForegroundColor Green
Write-Host "="*80 -ForegroundColor Cyan
