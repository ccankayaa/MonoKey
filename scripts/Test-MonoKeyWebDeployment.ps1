param([string]$WebOrigin = $env:TEST_WEB_ORIGIN)
$ErrorActionPreference = 'Stop'
if ($WebOrigin -ne 'https://icy-mud-054dd8e0f.4.azurestaticapps.net') { throw 'Only the verified TEST web hostname is supported.' }
$verified = $false
for ($attempt = 0; $attempt -lt 12; $attempt++) {
    try {
        $version = Invoke-RestMethod "$WebOrigin/build-version.json" -TimeoutSec 20
        if ($version.environment -eq 'test' -and $version.commit -eq $env:GITHUB_SHA) { $verified = $true; break }
    } catch { }
    Start-Sleep -Seconds 5
}
if (-not $verified) { throw 'Live TEST web build does not match the reviewed commit.' }
foreach ($path in @('/', '/vault', '/settings')) {
    $page = Invoke-WebRequest -UseBasicParsing ($WebOrigin + $path) -TimeoutSec 20
    if ($page.StatusCode -ne 200 -or $page.Content -notmatch 'id="root"') { throw 'TEST SPA route did not load.' }
    if ($page.Headers['Content-Security-Policy'] -notlike '*https://vaultx-1ee62.firebaseapp.com*') { throw 'Firebase CSP is missing.' }
}
$api = 'https://monokey-e9ahh8hpfqdah7em.ukwest-01.azurewebsites.net/api/membership'
$allowed = Invoke-WebRequest -UseBasicParsing $api -Method Options -Headers @{Origin=$WebOrigin; 'Access-Control-Request-Method'='GET'; 'Access-Control-Request-Headers'='authorization'} -TimeoutSec 20
if ($allowed.Headers['Access-Control-Allow-Origin'] -ne $WebOrigin) { throw 'The exact TEST web origin was not allowed.' }
$denied = Invoke-WebRequest -UseBasicParsing $api -Method Options -Headers @{Origin='https://example.invalid'; 'Access-Control-Request-Method'='GET'; 'Access-Control-Request-Headers'='authorization'} -TimeoutSec 20
if ($denied.Headers['Access-Control-Allow-Origin']) { throw 'An unrelated origin was unexpectedly allowed.' }
Write-Host 'TEST web build, SPA routes, Firebase CSP and exact API CORS passed.'
