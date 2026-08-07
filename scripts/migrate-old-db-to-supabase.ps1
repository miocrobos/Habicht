# =============================================================================
# Migrate the OLD local Postgres database into the NEW Supabase database.
#
# This brings back ALL data (including the users kamsiyochukwuugoji, Ansh, Nik
# and Jule and their player/recruiter/hybrid profiles) that lived in the local
# "habicht" database before the Supabase switch.
#
# It uses pg_dump (read the old DB) piped into psql (write to Supabase). Nothing
# is deleted from the old database.
#
# USAGE (PowerShell, from the project root):
#   1. Make sure the target (Supabase) tables already exist:
#          npm run db:push
#   2. Run this script and pass your OLD local DB connection details. You will be
#      prompted for the OLD database password (typed directly, never stored):
#
#          ./scripts/migrate-old-db-to-supabase.ps1 `
#              -OldHost localhost -OldPort 5432 -OldUser postgres -OldDb habicht
#
#   The NEW (Supabase) connection is read automatically from DATABASE_URL in .env.
#
# NOTES
#   * Data-only load (schema is managed by Prisma / db:push). Run against an
#     EMPTY Supabase DB to avoid unique-constraint clashes.
#   * If you don't know the old DB name, list databases with:
#         & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -l
# =============================================================================

param(
    [string]$OldHost = "localhost",
    [int]$OldPort = 5432,
    [string]$OldUser = "postgres",
    [string]$OldDb = "habicht",
    [string]$PgBin = "C:\Program Files\PostgreSQL\18\bin"
)

$ErrorActionPreference = "Stop"

$pgDump = Join-Path $PgBin "pg_dump.exe"
$psql = Join-Path $PgBin "psql.exe"

foreach ($exe in @($pgDump, $psql)) {
    if (-not (Test-Path $exe)) {
        Write-Error "Not found: $exe  (set -PgBin to your PostgreSQL bin folder)"
        exit 1
    }
}

# ---- Read the Supabase (target) DATABASE_URL from .env ----------------------
$envFile = Join-Path $PSScriptRoot "..\.env"
if (-not (Test-Path $envFile)) { Write-Error ".env not found next to project root"; exit 1 }
$targetUrl = (Get-Content $envFile | Where-Object { $_ -match '^\s*DATABASE_URL\s*=' } |
    Select-Object -First 1) -replace '^\s*DATABASE_URL\s*=\s*', '' -replace '^"|"$', ''
if ([string]::IsNullOrWhiteSpace($targetUrl)) { Write-Error "DATABASE_URL missing in .env"; exit 1 }

Write-Host "Source (old): $OldUser@${OldHost}:$OldPort/$OldDb" -ForegroundColor Cyan
Write-Host "Target (new): Supabase (from .env DATABASE_URL)" -ForegroundColor Cyan
Write-Host ""

# ---- Prompt for the OLD DB password (typed directly, kept only in-process) ---
$securePw = Read-Host -AsSecureString "OLD database password for user '$OldUser'"
$oldPw = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePw))

$dumpFile = Join-Path $env:TEMP "habicht-old-data.sql"

try {
    # ---- 1. Dump data-only from the old DB ----------------------------------
    Write-Host "Dumping data from old database..." -ForegroundColor Yellow
    $env:PGPASSWORD = $oldPw
    & $pgDump `
        --host=$OldHost --port=$OldPort --username=$OldUser --dbname=$OldDb `
        --data-only --no-owner --no-privileges --disable-triggers `
        --column-inserts `
        --file=$dumpFile
    if ($LASTEXITCODE -ne 0) { throw "pg_dump failed with exit code $LASTEXITCODE" }
    Write-Host "Dump written to $dumpFile" -ForegroundColor Green

    # ---- 2. Load into Supabase ----------------------------------------------
    Write-Host "Loading data into Supabase..." -ForegroundColor Yellow
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    & $psql $targetUrl -v ON_ERROR_STOP=1 -f $dumpFile
    if ($LASTEXITCODE -ne 0) { throw "psql load failed with exit code $LASTEXITCODE" }

    Write-Host ""
    Write-Host "Migration complete. Verify with:  node_modules\.bin\tsx.cmd scripts/investigate-users.ts" -ForegroundColor Green
}
finally {
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    $oldPw = $null
    if (Test-Path $dumpFile) {
        Write-Host "Leaving dump file at $dumpFile (delete it once verified)." -ForegroundColor DarkGray
    }
}
