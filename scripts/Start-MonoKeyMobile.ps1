param([ValidateSet('dev','test','prod')][string]$Environment = 'dev')
$ErrorActionPreference = 'Stop'
$root=Split-Path $PSScriptRoot -Parent
$file=Join-Path $root ('apps/mobile/.env.' + $(if($Environment -eq 'dev'){'development'}else{$Environment}) + '.local')
if(-not (Test-Path -LiteralPath $file)){throw 'Create the explicit ignored mode file from its placeholder example first.'}
Get-ChildItem Env: | Where-Object {$_.Name -match '^(EXPO_PUBLIC_|MONOKEY_)'} | ForEach-Object {[Environment]::SetEnvironmentVariable($_.Name,$null,'Process')}
$env:EXPO_NO_DOTENV='1';$env:EXPO_PUBLIC_APP_ENV=$Environment
foreach($line in [IO.File]::ReadAllLines($file)) {if($line -match '^((?:EXPO_PUBLIC_|MONOKEY_)[A-Z0-9_]+)=(.*)$'){[Environment]::SetEnvironmentVariable($Matches[1],$Matches[2].Trim('"'),'Process')}}
if($env:EXPO_PUBLIC_APP_ENV -ne $Environment){throw 'Mode file does not match the selected environment.'}
Push-Location (Join-Path $root 'apps')
try {& npm.cmd run build --workspace '@monokey/contracts';if($LASTEXITCODE -ne 0){throw 'Shared contracts build failed'};& npm.cmd run build --workspace '@monokey/crypto';if($LASTEXITCODE -ne 0){throw 'Shared crypto build failed'};& npm.cmd run start --workspace '@monokey/mobile';if($LASTEXITCODE -ne 0){throw 'Expo start failed.'}}finally{Pop-Location}
