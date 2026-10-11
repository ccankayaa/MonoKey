param(
 [Parameter(Mandatory)][string]$AscPrivateKeyPath,
 [Parameter(Mandatory)][ValidatePattern('^[0-9a-f-]{36}$')][string]$EasProjectId,
 [Parameter(Mandatory)][string]$FirebasePublicConfigPath,
 [switch]$StartBuild,
 [string]$ExistingBuildId
)
$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
$key=(Resolve-Path -LiteralPath $AscPrivateKeyPath).Path
if([IO.Path]::GetExtension($key) -ne '.p8'){throw 'The ASC MS5LN4UVS2 private key must be a secure .p8 file.'}
$public=Get-Content -LiteralPath $FirebasePublicConfigPath -Raw | ConvertFrom-Json
if($public.bundleId -ne 'com.monokeyapp.app' -or $public.projectId -ne 'vaultx-1ee62'){throw 'The owner TestFlight app must use the explicitly registered TEST Firebase configuration.'}
$env:MONOKEY_EAS_PROJECT_ID=$EasProjectId
$env:EXPO_ASC_API_KEY_PATH=$key
$env:EXPO_ASC_KEY_ID='MS5LN4UVS2'
$env:EXPO_ASC_ISSUER_ID='ea1ad231-b69c-4e7b-9c63-dac3fcba5d96'
$env:EXPO_APPLE_TEAM_ID='Q4KKGWHFMS'
$env:EXPO_PUBLIC_FIREBASE_API_KEY=$public.apiKey
$env:EXPO_PUBLIC_FIREBASE_APP_ID=$public.appId
$env:EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=$public.googleClientId
$env:MONOKEY_GOOGLE_IOS_URL_SCHEME=$public.reversedGoogleClientId
$state=Join-Path $root '.local/monokey-delivery/focused-cloud-build.json'
Push-Location (Join-Path $root 'apps/mobile')
try {
 & npx.cmd --yes --registry=https://registry.npmjs.org eas-cli@24.8.0 whoami
 if($LASTEXITCODE -ne 0){throw 'Authenticate EAS before preparing credentials or spending a cloud build.'}
 if(-not $StartBuild -and -not $ExistingBuildId){
  Write-Host 'No cloud build started. Configure EAS preview environment with the public TEST Firebase/Google values, MONOKEY_EAS_PROJECT_ID and the web Google client ID.'
  Write-Host 'Use eas credentials:configure-build --platform ios --profile testflight to verify app AND provider credentials/capabilities. Developer API submission credentials alone do not satisfy distribution signing.'
  Write-Host 'Verify current ASC build numbers; increase the configured iOS build number if build 4 is already used. Review export compliance for Argon2id/XChaCha20-Poly1305; no exemption is assumed.'
  return
 }
 if($StartBuild){
  if(Test-Path -LiteralPath $state){throw 'A focused cloud-build checkpoint already exists. Resume the existing build; do not spend another speculative build.'}
  # Call only after credentials/configuration and source verification have passed.
  $output=& npx.cmd --yes --registry=https://registry.npmjs.org eas-cli@24.8.0 build --platform ios --profile testflight --non-interactive --no-wait --json
  if($LASTEXITCODE -ne 0){throw 'EAS did not accept the build. No submission attempted.'}
  $output | Set-Content -LiteralPath $state -Encoding utf8
  Write-Host 'One EAS build accepted. Save its build ID and resume status checks without rebuilding.'
  return
 }
 & npx.cmd --yes --registry=https://registry.npmjs.org eas-cli@24.8.0 build:view $ExistingBuildId --json
 if($LASTEXITCODE -ne 0){throw 'EAS build status is unavailable.'}
 Write-Host 'After FINISHED, submit this exact build with eas submit --platform ios --profile testflight --id <build-id>. Never submit for public App Store release.'
} finally {Pop-Location;$env:EXPO_ASC_API_KEY_PATH=$null;$env:EXPO_ASC_KEY_ID=$null;$env:EXPO_ASC_ISSUER_ID=$null;$env:EXPO_PUBLIC_FIREBASE_API_KEY=$null}
