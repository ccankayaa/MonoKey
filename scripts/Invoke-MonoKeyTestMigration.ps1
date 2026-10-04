param([string]$MigrationAssembly, [string]$RunId = $env:GITHUB_RUN_ID)
$ErrorActionPreference = 'Stop'
$subscription = '26c10fcf-0ece-4e3a-ad63-8ad7cfb87f10'
function Invoke-Azure([string[]]$Arguments) {
    $result = & az @Arguments --only-show-errors 2>$null
    if ($LASTEXITCODE -ne 0) { throw 'Scoped Azure operation failed.' }
    return $result
}
$account = (Invoke-Azure @('account','show','-o','json') | Out-String | ConvertFrom-Json)
if ($account.id -ne $subscription -or $account.tenantId -ne '2a6dab10-6b40-482d-b45c-5c9dd5b8f7e0') { throw 'Unexpected Azure identity boundary.' }
if ($RunId -notmatch '^\d+$') { throw 'A GitHub numeric run ID is required.' }
if (-not (Test-Path -LiteralPath $MigrationAssembly)) { throw 'Reviewed migration artifact is missing.' }
$scope = @('--subscription',$subscription,'-g','MonoKey','-s','monokeydb')
$ip = (Invoke-RestMethod -Uri 'https://api.ipify.org').Trim()
$parsed = [Net.IPAddress]::Parse($ip)
if ($parsed.AddressFamily -ne [Net.Sockets.AddressFamily]::InterNetwork) { throw 'Runner IPv4 required.' }
$rule = "monokey-runner-$(Get-Date -AsUTC -Format yyyyMMddHHmmss)-$RunId"
# Serialize the Test workflow. Clean rules left behind by interrupted older runs.
$rules = (Invoke-Azure (@('postgres','flexible-server','firewall-rule','list') + $scope + @('-o','json')) | Out-String | ConvertFrom-Json)
foreach ($old in $rules) {
    if ($old.name -match '^monokey-runner-(\d{14})-\d+$') {
        $created = [DateTime]::ParseExact($Matches[1],'yyyyMMddHHmmss',[Globalization.CultureInfo]::InvariantCulture)
        if ($created -lt [DateTime]::UtcNow.AddDays(-1)) { Invoke-Azure (@('postgres','flexible-server','firewall-rule','delete') + $scope + @('-n',$old.name,'--yes')) | Out-Null }
    }
}
try {
    Invoke-Azure (@('postgres','flexible-server','firewall-rule','create') + $scope + @('-n',$rule,'--start-ip-address',$ip,'--end-ip-address',$ip,'-o','none')) | Out-Null
    $connection = (Invoke-Azure @('keyvault','secret','show','--vault-name','monokey-test-kv-ccan','-n','monokey-test-migration-connection','--query','value','-o','tsv') | Out-String).Trim()
    if (-not $connection) { throw 'Migration secret is unavailable.' }
    if ($env:GITHUB_ACTIONS -eq 'true') { Write-Output ('::add-mask::' + $connection.Replace('%','%25').Replace("`r",'%0D').Replace("`n",'%0A')) }
    $env:ConnectionStrings__MonoKeyDatabase = $connection
    & dotnet $MigrationAssembly test-migrate
    if ($LASTEXITCODE -ne 0) { throw 'Reviewed test migration failed.' }
}
finally {
    $env:ConnectionStrings__MonoKeyDatabase = $null; $connection = $null
    Invoke-Azure (@('postgres','flexible-server','firewall-rule','delete') + $scope + @('-n',$rule,'--yes','-o','none')) | Out-Null
}
