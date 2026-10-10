param([string]$ApkPath = 'apps/mobile/android/app/build/outputs/apk/release/app-release.apk')
$ErrorActionPreference = 'Stop'
if ($env:EXPO_PUBLIC_APP_ENV -ne 'test' -or $env:FIREBASE_DISTRIBUTION_APP_ID -notmatch '^1:\d+:android:[a-f0-9]+$' -or [string]::IsNullOrWhiteSpace($env:FIREBASE_DISTRIBUTION_GROUP)) { throw 'The authorized TEST Firebase Android app and tester group are required.' }
if (-not (Test-Path -LiteralPath $ApkPath)) { throw 'A signed native APK is required; JS exports cannot be distributed as APKs.' }
$credential = $null
$originalCredential = $env:GOOGLE_APPLICATION_CREDENTIALS
$originalQuotaProject = $env:GOOGLE_CLOUD_QUOTA_PROJECT
try {
    if (-not [string]::IsNullOrWhiteSpace($env:FIREBASE_DISTRIBUTION_CREDENTIAL_BASE64)) {
        $credential = Join-Path ([IO.Path]::GetTempPath()) ('monokey-distribution-' + [guid]::NewGuid().ToString('N') + '.json')
        [IO.File]::WriteAllBytes($credential,[Convert]::FromBase64String($env:FIREBASE_DISTRIBUTION_CREDENTIAL_BASE64))
        $env:GOOGLE_APPLICATION_CREDENTIALS = $credential
    }
    if ([string]::IsNullOrWhiteSpace($env:GOOGLE_APPLICATION_CREDENTIALS) -or -not (Test-Path -LiteralPath $env:GOOGLE_APPLICATION_CREDENTIALS)) { throw 'Protected Google workload federation credentials are required.' }
    $env:GOOGLE_CLOUD_QUOTA_PROJECT = 'vaultx-1ee62'
    $resultText = (& npx --yes firebase-tools@14.22.0 appdistribution:distribute $ApkPath --project vaultx-1ee62 --app $env:FIREBASE_DISTRIBUTION_APP_ID --groups $env:FIREBASE_DISTRIBUTION_GROUP --non-interactive --json 2>&1 | Out-String)
    if ($LASTEXITCODE -ne 0) { throw 'Authorized Firebase test distribution failed.' }
    $jsonStart = [regex]::Match($resultText, '(?m)^\s*\{\s*\r?\n\s*"status"\s*:')
    if (-not $jsonStart.Success) { throw 'Firebase distribution did not return a structured result.' }
    $result = $resultText.Substring($jsonStart.Index) | ConvertFrom-Json
    if ($result.status -ne 'success') { throw 'Firebase distribution did not complete.' }
    # The CLI also returns a signed binary URL; keep that credential out of logs.
    $testerUrl = $result.result.testingUri
    if ($testerUrl) {
        $uri = [Uri]$testerUrl
        if ($uri.Scheme -ne 'https' -or $uri.Host -ne 'appdistribution.firebase.google.com') { throw 'Unexpected tester URL.' }
        Write-Host ('Authorized tester page: ' + $uri.GetLeftPart([UriPartial]::Path))
    }
    Write-Host 'Signed TEST Android release uploaded and distributed to the authorized tester group.'
} finally {
    $env:GOOGLE_APPLICATION_CREDENTIALS = $originalCredential
    $env:GOOGLE_CLOUD_QUOTA_PROJECT = $originalQuotaProject
    if ($credential -and (Test-Path -LiteralPath $credential)) { Remove-Item -LiteralPath $credential }
}
