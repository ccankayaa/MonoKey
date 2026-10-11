"""Run with the existing Azure CLI Python and a secure, zone-scoped DNS-edit token file."""
import argparse, json, datetime
from pathlib import Path
import requests
from azure.cli.core._profile import Profile

parser=argparse.ArgumentParser()
parser.add_argument('--token-file',required=True)
args=parser.parse_args()
root=Path(__file__).resolve().parents[1]
token=Path(args.token_file).read_text(encoding='utf-8-sig').strip()
headers={'Authorization':'Bearer '+token,'Content-Type':'application/json'}
cf='https://api.cloudflare.com/client/v4'
def request(method,path,body=None):
    response=requests.request(method,cf+path,headers=headers,json=body,timeout=30)
    data=response.json()
    if not response.ok or not data.get('success'):raise RuntimeError('Cloudflare operation refused: HTTP '+str(response.status_code))
    return data
zones=request('GET','/zones?name=monokeyapp.com')['result']
if len(zones)!=1 or zones[0]['status']!='active':raise RuntimeError('The delegated owner zone must exist and be active; no delegation changes are made.')
zone=zones[0]['id'];records=[]
for page in range(1,11):
    data=request('GET',f'/zones/{zone}/dns_records?per_page=100&page={page}')
    records+=data['result']
    if page>=data.get('result_info',{}).get('total_pages',1):break
else:raise RuntimeError('Rollback export exceeds the bounded record limit.')
snapshot=root/'.local/monokey-delivery/cloudflare-dns-rollback.json'
snapshot.parent.mkdir(parents=True,exist_ok=True)
if snapshot.exists():raise RuntimeError('An existing rollback snapshot must be reviewed before another DNS mutation.')
snapshot.write_text(json.dumps({'recordedAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'zone':zone,'records':records},indent=2),encoding='utf-8')
management='https://management.azure.com';azure={'Authorization':'Bearer '+Profile().get_raw_token(resource=management+'/')[0][1]}
prefix='/subscriptions/26c10fcf-0ece-4e3a-ad63-8ad7cfb87f10/resourceGroups/MonoKey/providers/Microsoft.Web/staticSites/'
def azure_get(path):
    response=requests.get(management+prefix+path,headers=azure,timeout=30);response.raise_for_status();return response.json()
marketing=azure_get('monokey-marketing?api-version=2022-03-01');dashboard=azure_get('MonokeyWeb?api-version=2022-03-01')
if any(site['sku']['name']!='Free' for site in [marketing,dashboard]):raise RuntimeError('The intended free SWA boundaries changed.')
targets={'monokeyapp.com':marketing['properties']['defaultHostname'],'www.monokeyapp.com':marketing['properties']['defaultHostname'],'test.my.monokeyapp.com':dashboard['properties']['defaultHostname']}
planned=[]
for name,target in targets.items():
    existing=[row for row in records if row['name']==name and row['type'] in ['A','AAAA','CNAME']]
    if len(existing)>1:raise RuntimeError('Multiple routing records require owner review: '+name)
    row=existing[0] if existing else None
    accepted=[target,'85.159.66.93','redirect.natrocdn.com']
    if row and row['content'] not in accepted:raise RuntimeError('Unexpected routing target requires owner review: '+name)
    body={'type':'CNAME','name':name,'content':target,'proxied':False,'ttl':row.get('ttl',1) if row else 1}
    if not row or row['type']!='CNAME' or row['content']!=target or row.get('proxied'):planned.append((row,body))
binding=azure_get('monokey-marketing/customDomains/monokeyapp.com?api-version=2022-03-01')
proof=binding['properties'].get('validationToken')
if not proof:raise RuntimeError('Retrieve an actual Azure apex TXT ownership code before DNS mutation.')
if not any(row['name']=='monokeyapp.com' and row['type']=='TXT' and row['content']==proof for row in records):planned.append((None,{'type':'TXT','name':'monokeyapp.com','content':proof,'ttl':1}))
for row,body in planned:
    request('PUT' if row else 'POST',f'/zones/{zone}/dns_records'+('/'+row['id'] if row else ''),body)
print('DNS-only marketing/dashboard routes applied. Existing SPF/MX/DKIM/DMARC and unrelated records preserved; rollback snapshot saved locally.')
print('Revalidate marketing apex with dns-txt-token and www with cname-delegation; bounded HTTPS checks remain required.')
