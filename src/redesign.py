import json,random
random.seed(11)
H=json.load(open('homes240.json'))
byid={h['id']:h for h in H}
def ann(r): i=r/12; return (1-(1+i)**-360)/i
INC={"silva":(95000,40000),"tanaka":(72000,60000),"mensah":(110000,25000),"hughes":(48000,90000),"kowalski":(78000,30000),"haddad":(65000,15000),"park":(140000,80000),"tremblay":(58000,35000)}
def maxp(k,r=.04): i,o=INC[k]; return i/12*.25*ann(r)+o
def mk(city,area,street,typ,m2,bd,year,label,outdoor,st,park,price):
  return dict(city=city,area=area,street=street,type=typ,m2=m2,rooms=bd+1,bedrooms=bd,year=year,label=label,outdoor=outdoor,station_km=st,parking=park,price=price)
NEW={
 "silva_b":mk("Haarlem","Zuidwest","Watermolen 27","Terraced house",95,3,1958,"E","Garden",3.4,"Free street parking",419500),
 "silva_c":mk("Haarlem","Schalkwijk","Kievitstraat 112","Terraced house",86,3,1965,"G","Garden",4.2,"Free street parking",399000),
 "tanaka_b":mk("Haarlem","Oost","Ankerplein 8","Apartment",47,1,1965,"E","Balcony",1.4,"Permit",349500),
 "tanaka_c":mk("Amsterdam","West","Rozengracht 140","Apartment",38,1,1925,"F","Balcony",1.0,"Permit",335000),
 "mensah_b":mk("Amstelveen","Westwijk","Beukenlaan 61","Apartment",84,3,1972,"C","Balcony",2.6,"Garage space",469500),
 "mensah_c":mk("Amsterdam","Nieuw-West","Valkweg 19","Apartment",74,3,1958,"F","Balcony",1.9,"Permit",445000),
 "hughes_a":mk("Den Helder","Julianadorp","Zandpad 4","Terraced house",108,3,2021,"A","Garden",5.1,"Free street parking",297500),
 "hughes_c":mk("Hoorn","Grote Waal","Iepenhof 36","Terraced house",82,2,1972,"F","Garden",2.9,"Free street parking",272500),
 "kowalski_c":mk("Zaanstad","Krommenie","Lijnbaan 52","Terraced house",88,3,1958,"F","Garden",2.2,"Free street parking",329500),
 "haddad_b":mk("Alkmaar","Oudorp","Spoorstraat 17","Apartment",62,2,1968,"E","Balcony",3.1,"Free street parking",274500),
 "haddad_c":mk("Alkmaar","De Mare","Graanmarkt 90","Apartment",58,2,1965,"G","Balcony",3.8,"Free street parking",262500),
 "park_a":mk("Amsterdam","Oost","Sluiskade 33","Terraced house",125,3,2016,"A","Garden",1.6,"Permit",682500),
 "park_c":mk("Amsterdam","Nieuw-West","Merelhof 118","Terraced house",98,3,1965,"D","Garden",2.7,"Permit",615000),
 "tremblay_b":mk("Hilversum","Kerkelanden","Lindenlaan 72","Apartment",60,2,1968,"E","Balcony",1.7,"Free street parking",268500),
 "tremblay_c":mk("Hilversum","Oost","Brugstraat 9","Apartment",55,2,1962,"G","Balcony",1.5,"Free street parking",257500),
}
for key,d in NEW.items():
  cand=[h for h in H if h['city']==d['city'] and not h.get('key')]
  h=random.choice(cand); hid=h['id']; h.clear(); h.update(d); h['id']=hid; h['key']=key
# option map
KEY={h['key']:h['id'] for h in H if h.get('key')}
OPT={"silva":["silva_rec","silva_b","silva_c"],"tanaka":["tanaka_rec","tanaka_b","tanaka_c"],"mensah":["mensah_rec","mensah_b","mensah_c"],
 "hughes":["hughes_a","hughes_rec","hughes_c"],"kowalski":["kowalski_rec1","kowalski_rec2","kowalski_c"],"haddad":["haddad_rec","haddad_b","haddad_c"],
 "park":["park_a","park_rec","park_c"],"tremblay":["tremblay_rec","tremblay_b","tremblay_c"]}
# wishes from data
import importlib.util,sys
sys.path.insert(0,'.')
from clients_data import CLIENTS
def ok(h,w):
  x=h[w['f']]; v=w['v']
  return (x in v) if w['op']=='in' else (x not in v) if w['op']=='notin' else (x>=v) if w['op']=='>=' else (x<=v)
DROP={"silva":"station","mensah":"type","haddad":"station","tremblay":"outdoor"}
allowed=set(KEY.values())
for it in range(10):
  ch=0
  for c in CLIENTS:
    k=c['id']; mp=maxp(k)
    scen=[None]+[w['dim'] for w in c['wishes'] if w['imp']=='flexible']
    for drop in scen:
      for h in H:
        if h['id'] in allowed: continue
        if h['price']<=mp and all(ok(h,w) for w in c['wishes'] if w['dim']!=drop):
          h['price']=int(round(mp*1.08/2500)*2500)+2500; ch+=1
  if not ch: break
json.dump(H,open('homes240.json','w'),indent=1)
# report
for c in CLIENTS:
  k=c['id']; th=[maxp(k,r) for r in (.04,.045,.05)]
  drop=DROP.get(k)
  fit=[h for h in H if h['price']<=th[0] and all(ok(h,w) for w in c['wishes'] if w['dim']!=drop)]
  full=[h['id'] for h in H if h['price']<=th[0] and all(ok(h,w) for w in c['wishes'])]
  print(f"{k:9} full={full} after-drop={[(h['id'],h['price'],'A' if h['price']>th[1] else 'B' if h['price']>th[2] else 'C') for h in sorted(fit,key=lambda x:-x['price'])]}")
print({k:[KEY[x] for x in v] for k,v in OPT.items()})
json.dump({k:[KEY[x] for x in v] for k,v in OPT.items()},open('options.json','w'))
