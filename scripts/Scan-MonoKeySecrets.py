import re,subprocess,sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]
files=subprocess.check_output(['git','ls-files','--cached','--others','--exclude-standard','-z'],cwd=root).decode().split('\0')
patterns=[re.compile(r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----'),re.compile(r'gh[pousr]_[A-Za-z0-9]{30,}'),re.compile(r'(?:sk_live_|rk_live_)[A-Za-z0-9]{16,}'),re.compile(r'AIza[A-Za-z0-9_-]{30,}'),re.compile(r'"type"\s*:\s*"service_account"')]
issues=[]
for name in set(files):
    p=root/name
    if not name or not p.is_file():continue
    if name.startswith(('.local/','docs/')) or name.endswith(('.env','.pfx','.p12','.keystore','.jks','.mobileprovision')):issues.append((name,'forbidden file'));continue
    if name=='scripts/Scan-MonoKeySecrets.py':continue
    raw=p.read_bytes()
    if b'\0' in raw:continue
    text=raw.decode('utf-8',errors='replace')
    for i,line in enumerate(text.splitlines(),1):
        if any(pattern.search(line) for pattern in patterns):issues.append((name,'line '+str(i)))
        for match in re.finditer(r'(?i)(?:^|;)password=([^;\s"\']+)',line):
            value=match.group(1)
            if value not in ('disposable-ci-only','a=b#c') and not value.startswith(('$','<','{')):
                issues.append((name,'credential '+str(i)))
print('Secret scan files:',len(set(files)-{''}),'findings:',len(issues))
for name,location in issues:print(name,location)
sys.exit(bool(issues))
