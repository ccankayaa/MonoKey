$ErrorActionPreference = 'Stop'
Push-Location (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
try {
    & npx.cmd --yes firebase-tools@14.22.0 emulators:start --only auth --project demo-monokey --config firebase.emulators.json
    if ($LASTEXITCODE -ne 0) { throw 'Auth Emulator failed.' }
}
finally { Pop-Location }
