param([bool]$GenerateNative = $true, [ValidateSet('apk','aab')][string]$PackageType = 'apk')
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
if ($env:EXPO_PUBLIC_APP_ENV -ne 'test') { throw 'Signed internal packages must explicitly select test.' }
foreach ($name in @('MONOKEY_ANDROID_PACKAGE','ANDROID_KEYSTORE_BASE64','ANDROID_KEYSTORE_PASSWORD','ANDROID_KEY_ALIAS','ANDROID_KEY_PASSWORD')) {
    if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($name))) { throw 'Registered test package ID and existing signing key credentials must be supplied through the environment.' }
}
$env:EXPO_NO_DOTENV = '1'
Push-Location (Join-Path $root 'apps/mobile')
$signingFile = $null; $initFile = $null
try {
    if ($GenerateNative) { & npx expo prebuild --platform android --no-install; if ($LASTEXITCODE -ne 0) { throw 'Expo native generation failed.' } }
    $signingFile = Join-Path ([IO.Path]::GetTempPath()) ('monokey-' + [guid]::NewGuid().ToString('N') + '.jks')
    [IO.File]::WriteAllBytes($signingFile,[Convert]::FromBase64String($env:ANDROID_KEYSTORE_BASE64))
    $env:MONOKEY_SIGNING_STORE_PATH = $signingFile
    $initFile = Join-Path ([IO.Path]::GetTempPath()) ('monokey-' + [guid]::NewGuid().ToString('N') + '.gradle')
    [IO.File]::WriteAllText($initFile,@'
allprojects { p ->
 p.afterEvaluate {
  if (p.plugins.hasPlugin('com.android.application')) {
   p.android.signingConfigs.create('monokeyTest') {
    storeFile = new File(System.getenv('MONOKEY_SIGNING_STORE_PATH'))
    storePassword = System.getenv('ANDROID_KEYSTORE_PASSWORD')
    keyAlias = System.getenv('ANDROID_KEY_ALIAS')
    keyPassword = System.getenv('ANDROID_KEY_PASSWORD')
   }
   p.android.buildTypes.release.signingConfig = p.android.signingConfigs.monokeyTest
  }
 }
}
'@)
    Push-Location android
    try {
        $wrapper = if ($env:OS -eq 'Windows_NT') { './gradlew.bat' } else { './gradlew' }
        $task = if ($PackageType -eq 'apk') { ':app:assembleRelease' } else { ':app:bundleRelease' }
        & $wrapper --no-daemon --console plain --init-script $initFile $task
        if ($LASTEXITCODE -ne 0) { throw 'Native signed build failed.' }
    } finally { Pop-Location }
    Write-Host 'Signed native artifact created. Distribution requires an existing authorized Firebase app and tester group.'
} finally {
    Pop-Location
    foreach ($temporary in @($signingFile,$initFile)) { if ($temporary -and (Test-Path -LiteralPath $temporary)) { Remove-Item -LiteralPath $temporary } }
    $env:MONOKEY_SIGNING_STORE_PATH = $null
}
