$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
Push-Location $root
try {
    & dotnet run --project backend/tools/MonoKey.DatabaseTasks -- dev-migrate
    if ($LASTEXITCODE -ne 0) { throw 'Development migration failed. Verify monokey_dev exists and the Windows credential is configured.' }
} finally { Pop-Location }
