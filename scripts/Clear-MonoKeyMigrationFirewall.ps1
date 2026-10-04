param([string]$RunId=$env:GITHUB_RUN_ID)
$ErrorActionPreference='Stop'
if ($RunId -notmatch '^\d+$') { throw 'Numeric GitHub run ID required.' }
$subscription='26c10fcf-0ece-4e3a-ad63-8ad7cfb87f10'
$account=& az account show -o json --only-show-errors 2>$null | ConvertFrom-Json
if ($LASTEXITCODE -ne 0 -or $account.id -ne $subscription -or $account.tenantId -ne '2a6dab10-6b40-482d-b45c-5c9dd5b8f7e0') { throw 'Unexpected Azure identity boundary.' }
$rules=& az postgres flexible-server firewall-rule list --subscription $subscription -g MonoKey -s monokeydb -o json --only-show-errors 2>$null | ConvertFrom-Json
if ($LASTEXITCODE -ne 0) { throw 'Scoped firewall inspection failed.' }
foreach($rule in $rules) {
    if ($rule.name -match ("^monokey-runner-\d{14}-" + $RunId + '$')) {
        & az postgres flexible-server firewall-rule delete --subscription $subscription -g MonoKey -s monokeydb -n $rule.name --yes -o none --only-show-errors
        if ($LASTEXITCODE -ne 0) { throw 'Runner firewall cleanup failed.' }
    }
}
