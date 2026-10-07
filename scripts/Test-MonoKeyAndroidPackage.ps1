param([string]$ApkPath = 'apps/mobile/android/app/build/outputs/apk/release/app-release.apk')
$ErrorActionPreference = 'Stop'
if ($env:EXPO_PUBLIC_APP_ENV -ne 'test' -or [string]::IsNullOrWhiteSpace($env:MONOKEY_ANDROID_PACKAGE) -or [string]::IsNullOrWhiteSpace($env:TEST_ANDROID_CERT_SHA256)) { throw 'Registered TEST package and expected signing certificate are required.' }
$sdk = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { $env:ANDROID_SDK_ROOT }
if (-not $sdk) { throw 'Android SDK is unavailable.' }
$toolDirectory = Get-ChildItem -LiteralPath (Join-Path $sdk 'build-tools') -Directory | Where-Object { $_.Name -match '^\d+\.\d+\.\d+$' } | Sort-Object { [version]$_.Name } -Descending | Select-Object -First 1
if (-not $toolDirectory) { throw 'Android package verification tools are unavailable.' }
$signer = Join-Path $toolDirectory.FullName $(if ($env:OS -eq 'Windows_NT') { 'apksigner.bat' } else { 'apksigner' })
$signed = @(& $signer verify --verbose --print-certs $ApkPath 2>&1)
if ($LASTEXITCODE -ne 0) { throw 'APK signature verification failed.' }
$certificate = [regex]::Match(($signed -join "`n"), '(?im)^\s*Signer #1 certificate SHA-256 digest:\s*([a-f0-9:]{64,95})\s*$')
if (-not $certificate.Success) { throw 'APK signing certificate fingerprint could not be read.' }
$digest = $certificate.Groups[1].Value
if (($digest -replace ':','').Trim() -ne ($env:TEST_ANDROID_CERT_SHA256 -replace ':','').Trim()) { throw 'APK signing identity does not match the protected TEST key.' }
$aapt = Join-Path $toolDirectory.FullName $(if ($env:OS -eq 'Windows_NT') { 'aapt2.exe' } else { 'aapt2' })
$metadata = & $aapt dump badging $ApkPath
if ($LASTEXITCODE -ne 0 -or $metadata[0] -notlike "*name='$($env:MONOKEY_ANDROID_PACKAGE)'*") { throw 'APK package does not match the registered TEST application.' }
if ($metadata -match '^application-debuggable') { throw 'A release-signed internal APK is required.' }
Write-Host 'Native TEST APK signature, registered package and release configuration passed.'
