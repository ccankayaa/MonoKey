[CmdletBinding()]
param(
    [ValidateRange(1, 65535)]
    [int]$Port = 5173,

    [switch]$Expose
)

$ErrorActionPreference = 'Stop'

$repositoryPath = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$appsPath = Join-Path $repositoryPath 'apps'

if (-not (Test-Path -LiteralPath (Join-Path $appsPath 'package.json'))) {
    throw "MonoKey client workspace was not found at '$appsPath'."
}

$driveLetter = @('V', 'W', 'X', 'Y', 'Z') |
    Where-Object { -not (Test-Path -LiteralPath "${_}:\") } |
    Select-Object -First 1

if (-not $driveLetter) {
    throw 'No unused drive letter is available from V: through Z: for the temporary Vite path workaround.'
}

$driveName = "${driveLetter}:"
& subst.exe $driveName $repositoryPath
if ($LASTEXITCODE -ne 0) {
    throw "Could not map $driveName to the MonoKey repository."
}

try {
    Push-Location "${driveName}\apps"
    try {
        & npm.cmd run build --workspace '@monokey/contracts'
        if ($LASTEXITCODE -ne 0) { throw 'Shared contracts build failed.' }
        & npm.cmd run build --workspace '@monokey/crypto'
        if ($LASTEXITCODE -ne 0) { throw 'Shared crypto build failed.' }
        $viteArguments = @('run', 'dev', '--workspace', '@monokey/web', '--', '--port', $Port)
        if ($Expose) {
            $viteArguments += '--host'
        }

        & npm.cmd $viteArguments
        if ($LASTEXITCODE -ne 0) {
            throw "MonoKey web development server exited with code $LASTEXITCODE."
        }
    }
    finally {
        Pop-Location
    }
}
finally {
    & subst.exe $driveName /D
}
