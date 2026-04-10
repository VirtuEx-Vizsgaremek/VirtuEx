# VirtuEx Installer 3000

#########################

function Get-NextFreePort {
    param([int]$StartPort = 8080)

    $usedPorts = [System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners() | Select-Object -ExpandProperty Port

    $port = $StartPort
    while ($port -in $usedPorts) {
        $port++
    }
    return $port
}

function New-Secret {
    param([int]$Bits = 256)
    $bytes = New-Object byte[] ($Bits / 8)
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    return [Convert]::ToBase64String($bytes)
}

#########################

Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

if (-not (Get-Command "scoop" -ErrorAction SilentlyContinue)) {
    Write-Host "scoop is not installed, installing..."

    Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
}

if (-not (Get-Command "pg_ctl" -ErrorAction SilentlyContinue)) {
    Write-Host "postgresql is not installed, installing..."

    scoop install main/postgresql
}

if (-not (Get-Command "pnpm" -ErrorAction SilentlyContinue)) {
    Write-Host "pnpm is not installed, installing..."

    scoop install main/pnpm
}

$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

$PostgrePort = 5432

if (Test-NetConnection -ComputerName localhost -Port $PostgrePort -InformationLevel Quiet) {
    Write-Host "There is something running on the default postgre port, will use next available port."

    $PostgrePort = Get-NextFreePort $PostgrePort
}

# Create data path for postgresql
$DocumentsPath = "$Home\Documents"

if (Test-Path -LiteralPath "$DocumentsPath\virtuexdbdata") {
    Remove-Item -LiteralPath "$DocumentsPath\virtuexdbdata" -Recurse -Force
}
New-Item -Name virtuexdbdata -Path $DocumentsPath -ItemType Directory

pg_ctl init -D "$DocumentsPath\virtuexdbdata"
pg_ctl start -D "$DocumentsPath\virtuexdbdata" -o "-p $PostgrePort"

psql -U postgres -p $PostgrePort -c "DROP DATABASE IF EXISTS virtuex;"
psql -U postgres -p $PostgrePort -c "CREATE DATABASE virtuex;"

$JWTSecret = New-Secret
$account = Invoke-RestMethod -Uri "https://api.nodemailer.com/user" `
                  -Method POST `
                  -ContentType "application/json" `
                  -Body '{
                    "requestor": "virtuex-installer",
                    "version": "1.0.0"
                  }'

$EmailUser = $account.user
$EmailPass = $account.pass
$EmailHost = $account.smtp.host
$EmailPort = $account.smtp.port

$ApiPort = Get-NextFreePort 3001

@"
JWT_SECRET=$JWTSecret

SMTP_HOST=$EmailHost
SMTP_PORT=$EmailPort
SMTP_USER=$EmailUser
SMTP_PASS=$EmailPass

PORT=$ApiPort
"@ | Out-File -FilePath "apps/api/.env" -Encoding utf8

$ApiUrl = "http://localhost:$ApiPort"

@"
NEXT_PUBLIC_API_URL=$ApiUrl
"@  | Out-File -FilePath "apps/web/.env" -Encoding utf8

# Install with pnpm
pnpm i

Write-Host "Installation complete, you can start the porject with pnpm dev"