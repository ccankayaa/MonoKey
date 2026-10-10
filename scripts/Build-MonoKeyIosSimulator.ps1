$ErrorActionPreference = 'Stop'
if (-not $IsMacOS) { throw 'Native iOS compilation requires macOS/Xcode.' }
if ($env:EXPO_PUBLIC_APP_ENV -ne 'test' -or [string]::IsNullOrWhiteSpace($env:MONOKEY_IOS_BUNDLE_ID)) { throw 'The registered TEST iOS variant must be selected explicitly.' }
$root = Split-Path $PSScriptRoot -Parent
Push-Location (Join-Path $root 'apps/mobile')
try {
    $env:EXPO_NO_DOTENV = '1'
    & node (Join-Path $root "scripts/Build-MonoKeyCredentialExtension.mjs")
    if ($LASTEXITCODE -ne 0) { throw "Credential extension bundle failed." }
    & npx expo prebuild --platform ios --no-install
    if ($LASTEXITCODE -ne 0) { throw 'iOS native generation failed.' }
    & pod install --project-directory=ios
    if ($LASTEXITCODE -ne 0) { throw 'iOS native dependencies failed.' }
    $workspaces = @(Get-ChildItem -LiteralPath ios -Directory -Filter '*.xcworkspace')
    if ($workspaces.Count -ne 1) { throw 'Exactly one application workspace is required.' }
    $workspace = $workspaces[0]
    $scheme = $workspace.Name -replace '\.xcworkspace$', ''
    $derived = Join-Path $env:RUNNER_TEMP 'monokey-ios-simulator'
    & xcodebuild -workspace $workspace.FullName -scheme $scheme -configuration Release -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' -derivedDataPath $derived CODE_SIGNING_ALLOWED=NO build
    if ($LASTEXITCODE -ne 0) { throw 'iOS simulator compilation failed.' }
    $apps = @(Get-ChildItem -LiteralPath (Join-Path $derived 'Build/Products/Release-iphonesimulator') -Directory -Filter '*.app')
    if ($apps.Count -ne 1) { throw 'Simulator application output is missing or ambiguous.' }
    $bundle = & /usr/libexec/PlistBuddy -c 'Print :CFBundleIdentifier' (Join-Path $apps[0].FullName 'Info.plist')
    if ($bundle -ne $env:MONOKEY_IOS_BUNDLE_ID) { throw 'The built simulator bundle does not match the registered TEST application.' }
    $output = Join-Path $root 'artifacts/mobile'
    New-Item -ItemType Directory -Path $output -Force | Out-Null
    & ditto -c -k --sequesterRsrc --keepParent $apps[0].FullName (Join-Path $output 'monokey-test-ios-simulator.zip')
    if ($LASTEXITCODE -ne 0) { throw 'Simulator packaging failed.' }
    Write-Host 'Native TEST iOS simulator application compiled; this is not an iPhone IPA.'
} finally { Pop-Location }
