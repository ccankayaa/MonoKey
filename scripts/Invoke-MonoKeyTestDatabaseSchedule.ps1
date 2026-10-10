param([ValidateSet('Start','Stop')][string]$Action,[string]$ConfigurationPath="$PSScriptRoot/config/test-database-schedule.json")
$ErrorActionPreference='Stop'
$config=Get-Content -LiteralPath $ConfigurationPath -Raw | ConvertFrom-Json
if(-not $config.enabled){Write-Host 'Optional TEST schedule is disabled; no Azure mutation performed.';return}
if($config.subscription -ne '26c10fcf-0ece-4e3a-ad63-8ad7cfb87f10' -or $config.resourceGroup -ne 'MonoKey' -or $config.server -ne 'monokeydb'){throw 'The schedule is limited to the existing TEST server.'}
if(-not $config.activeUsersCleared){throw 'Do not stop a server with active users. Review the TEST downtime window before enabling this optional configuration.'}
if(-not $Action){throw 'Choose Start or Stop explicitly.'}
& az postgres flexible-server $Action.ToLowerInvariant() --subscription $config.subscription --resource-group $config.resourceGroup --name $config.server
if($LASTEXITCODE -ne 0){throw 'TEST database action failed.'}
