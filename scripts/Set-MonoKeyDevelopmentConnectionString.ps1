param([Security.SecureString]$ConnectionString)
$ErrorActionPreference = 'Stop'
& "$PSScriptRoot/Set-MonoKeyCredential.ps1" -ConnectionString $ConnectionString
