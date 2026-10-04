import datetime,json,sys
from pathlib import Path
p=Path(sys.argv[1]); raw=p.read_bytes()
audit=json.loads(raw.decode('utf-16') if raw.startswith(b'\xff\xfe') else raw.decode('utf-8-sig'))
if 'projects' in audit:
    found=[(p['path'],v) for p in audit['projects'] for f in p.get('frameworks',[]) for group in ('topLevelPackages','transitivePackages') for v in f.get(group,[]) if v.get('vulnerabilities')]
    print('NuGet affected packages:',len(found))
    raise SystemExit(bool(found))
review=json.loads(Path(__file__).with_name('dependency-review.json').read_text(encoding='utf-8'))
expired=datetime.date.today()>datetime.date.fromisoformat(review['expiresOn'])
unknown=[]; warnings=set()
for name,item in audit.get('vulnerabilities',{}).items():
    for via in item.get('via',[]):
        if not isinstance(via,dict):continue
        advisory=via.get('url','').rsplit('/',1)[-1]
        if expired or advisory not in review['npmAdvisories']: unknown.append((name,advisory))
        else:warnings.add(advisory)
if audit.get('error'):raise SystemExit('Dependency audit service failed.')
print('NPM affected packages:',audit.get('metadata',{}).get('vulnerabilities',{}))
for a in sorted(warnings):print('UNPATCHED SECURITY WARNING:',a,review['npmAdvisories'][a])
for name,a in unknown:print('Unreviewed security warning:',name,a)
raise SystemExit(bool(unknown))
