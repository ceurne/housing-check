import os
import json,re,sys
sys.path.insert(0,'.')
from clients_data import CLIENTS, COMMON
md=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'client_files.md')).read()
parts=re.split(r'^# Client \d+: .*$',md,flags=re.M)[1:]
homes=json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'homes240.json')))
H={h['id']:{k:h[k] for k in ['id','city','area','street','type','m2','bedrooms','outdoor','station_km','label','price','year']} for h in homes}
out=[]
for c,sec in zip(CLIENTS,parts):
  sec=re.sub(r'```\{=openxml\}.*?```','',sec,flags=re.S).strip()
  subj=re.search(r'\*\*Subject:\*\* (.*)',sec).group(1).strip()
  body=sec.split('\n',2)[2].strip().replace('**','')
  body=re.sub(r'^- ','• ',body,flags=re.M)
  d=dict(c); d['from']=d.pop('frm'); d['subject']=subj; d['email']=body; d['common']=COMMON
  out.append(d)
json.dump({'clients':out,'homes':H},open('data.json','w'),ensure_ascii=False)
print(len(out),len(H))
import os
here=os.path.dirname(os.path.abspath(__file__))
open(os.path.join(here,'..','data.js'),'w').write('window.HC_DATA = '+json.dumps({'clients':out,'homes':H},ensure_ascii=False)+';\n')
