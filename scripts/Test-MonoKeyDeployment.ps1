param([string]$ApiUrl = 'https://monokey-e9ahh8hpfqdah7em.ukwest-01.azurewebsites.net')
$ErrorActionPreference = 'Stop'
if ($ApiUrl -ne 'https://monokey-e9ahh8hpfqdah7em.ukwest-01.azurewebsites.net') { throw 'Only the authorized test hostname is supported.' }
$healthy = $false
for ($attempt = 0; $attempt -lt 15; $attempt++) {
    try { $result = Invoke-WebRequest -UseBasicParsing "$ApiUrl/health" -TimeoutSec 20; if ($result.StatusCode -eq 200) { $healthy = $true; break } } catch { }
    Start-Sleep -Seconds 5
}
if (-not $healthy) { throw 'Test API liveness failed.' }
$databaseReady = $false
for ($attempt = 0; $attempt -lt 15; $attempt++) {
    try { $ready = Invoke-WebRequest -UseBasicParsing "$ApiUrl/health/ready" -TimeoutSec 20; if ($ready.StatusCode -eq 200) { $databaseReady = $true; break } } catch { }
    Start-Sleep -Seconds 5
}
if (-not $databaseReady) { throw 'Test database readiness failed.' }
if ($env:GITHUB_SHA -and $result.Headers['X-MonoKey-Build'] -notlike "*$($env:GITHUB_SHA)*") { throw 'Deployed build does not match the reviewed commit.' }
try { Invoke-WebRequest -UseBasicParsing "$ApiUrl/api/membership" -Headers @{Authorization='Bearer deliberately-invalid'} -TimeoutSec 20 | Out-Null; throw 'Invalid token was accepted.' }
catch { if ([int]$_.Exception.Response.StatusCode -ne 401) { throw 'Expected invalid-token rejection was not observed.' } }
Write-Host 'Test API liveness, database readiness and invalid JWT rejection passed.'
Write-Host ('Deployed build: ' + $result.Headers['X-MonoKey-Build'])
