param([string]$ApkPath = 'apps/mobile/android/app/build/outputs/apk/release/app-release.apk')
$ErrorActionPreference = 'Stop'
if ($env:EXPO_PUBLIC_APP_ENV -ne 'test' -or $env:FIREBASE_DISTRIBUTION_APP_ID -notmatch '^1:\d+:android:[a-f0-9]+$' -or [string]::IsNullOrWhiteSpace($env:FIREBASE_DISTRIBUTION_GROUP) -or [string]::IsNullOrWhiteSpace($env:FIREBASE_DISTRIBUTION_CREDENTIAL_BASE64)) { throw 'Existing authorized TEST Firebase Android app, tester group and distribution credential are required.' }
if (-not (Test-Path -LiteralPath $ApkPath)) { throw 'A signed native APK is required; JS exports cannot be distributed as APKs.' }
$credential = Join-Path ([IO.Path]::GetTempPath()) ('monokey-distribution-' + [guid]::NewGuid().ToString('N') + '.json')
try {
    [IO.File]::WriteAllBytes($credential,[Convert]::FromBase64String($env:FIREBASE_DISTRIBUTION_CREDENTIAL_BASE64))
    $env:GOOGLE_APPLICATION_CREDENTIALS = $credential
    & npx --yes firebase-tools@14.22.0 appdistribution:distribute $ApkPath --project vaultx-1ee62 --app $env:FIREBASE_DISTRIBUTION_APP_ID --groups $env:FIREBASE_DISTRIBUTION_GROUP --non-interactive
    if ($LASTEXITCODE -ne 0) { throw 'Authorized Firebase test distribution failed.' }
} finally { $env:GOOGLE_APPLICATION_CREDENTIALS = $null; if (Test-Path -LiteralPath $credential) { Remove-Item -LiteralPath $credential } }
