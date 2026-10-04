param([Security.SecureString]$PostgresPassword, [string]$PostgresUser = 'postgres')
$ErrorActionPreference = 'Stop'
# Authenticate normally. This script never edits pg_hba.conf or elevates automatically.
& "$PSScriptRoot/Initialize-MonoKeyDevelopmentDatabase.ps1" -PostgresPassword $PostgresPassword -PostgresUser $PostgresUser
