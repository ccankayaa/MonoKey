param(
    [System.Security.SecureString]$PostgresPassword,
    [string]$PostgresUser = 'postgres',
    [string]$HostName = 'localhost',
    [int]$Port = 5432
)

$ErrorActionPreference = 'Stop'
if ($HostName -notin @('localhost', '127.0.0.1', '::1')) { throw 'Development bootstrap requires a loopback PostgreSQL server.' }
$psql = 'C:\Program Files\PostgreSQL\15\bin\psql.exe'
$databaseName = 'monokey_dev'
$applicationUser = 'monokey_dev'

if (-not (Test-Path -LiteralPath $psql)) {
    throw "psql was not found at $psql."
}

if ($null -eq $PostgresPassword) {
    $PostgresPassword = Read-Host "Enter the password for PostgreSQL role '$PostgresUser'" -AsSecureString
}

$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($PostgresPassword)
try {
    $env:PGPASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
    $env:PGSSLMODE = 'disable'
    $passwordBytes = [byte[]]::new(36)
    $passwordGenerator = [Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $passwordGenerator.GetBytes($passwordBytes)
    }
    finally {
        $passwordGenerator.Dispose()
    }
    $applicationPassword = [Convert]::ToBase64String($passwordBytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    $roleExistsOutput = & $psql --host $HostName --port $Port --username $PostgresUser --dbname postgres --no-password --tuples-only --no-align --set ON_ERROR_STOP=1 --command "SELECT 1 FROM pg_roles WHERE rolname = '$applicationUser';" 2>&1
    $roleLookupExitCode = $LASTEXITCODE
    $ErrorActionPreference = $previousErrorActionPreference
    if ($roleLookupExitCode -ne 0) {
        $safeRoleLookupError = ($roleExistsOutput | Out-String).Replace($applicationPassword, '<redacted>').Trim()
        throw "PostgreSQL administrator authentication failed: $safeRoleLookupError"
    }

    $roleVerb = if ([string]::IsNullOrWhiteSpace(($roleExistsOutput | Out-String))) { 'CREATE' } else { 'ALTER' }
    $roleSql = "$roleVerb ROLE $applicationUser WITH LOGIN PASSWORD '$applicationPassword';"
    $ErrorActionPreference = 'Continue'
    $roleOutput = $roleSql | & $psql --host $HostName --port $Port --username $PostgresUser --dbname postgres --no-password --set ON_ERROR_STOP=1 --quiet 2>&1
    $roleExitCode = $LASTEXITCODE
    $ErrorActionPreference = $previousErrorActionPreference
    if ($roleExitCode -ne 0) {
        $safeRoleError = ($roleOutput | Out-String).Replace($applicationPassword, '<redacted>').Trim()
        throw "PostgreSQL application-role creation failed: $safeRoleError"
    }

    $databaseExists = & $psql --host $HostName --port $Port --username $PostgresUser --dbname postgres --no-password --tuples-only --no-align --set ON_ERROR_STOP=1 --command "SELECT 1 FROM pg_database WHERE datname = '$databaseName';"
    if ($LASTEXITCODE -ne 0) {
        throw 'PostgreSQL database lookup failed.'
    }

    if ([string]::IsNullOrWhiteSpace($databaseExists)) {
        & $psql --host $HostName --port $Port --username $PostgresUser --dbname postgres --no-password --set ON_ERROR_STOP=1 --command "CREATE DATABASE $databaseName OWNER $applicationUser;"
        if ($LASTEXITCODE -ne 0) {
            throw 'PostgreSQL database creation failed.'
        }
    }

    $connectionString = "Host=$HostName;Port=$Port;Database=$databaseName;Username=$applicationUser;Password=$applicationPassword;SSL Mode=Disable;Include Error Detail=false;Application Name=MonoKey.Api"
    $secureConnectionString = ConvertTo-SecureString $connectionString -AsPlainText -Force
    & "$PSScriptRoot\Set-MonoKeyDevelopmentConnectionString.ps1" -ConnectionString $secureConnectionString

    Write-Host "Local database '$databaseName' and least-privileged role '$applicationUser' are ready."
}
finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
    $env:PGPASSWORD = $null
    $env:PGSSLMODE = $null
    $applicationPassword = $null
    $passwordBytes = $null
    $connectionString = $null
}
