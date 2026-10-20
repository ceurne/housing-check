/* Rule-based client replies for The Housing Check. Pure functions; no network. */
(function (root) {
  const CITY_NAMES = ["Heemskerk","Uitgeest","Wormer","Oostzaan","Abcoude","Uithoorn","Aalsmeer","Badhoevedorp","Nieuw-Vennep","Medemblik","Texel","Den Burg","Bergen","Egmond","Wijk aan Zee","Monnickendam","Lelystad","Amsterdam","Amstelveen","Haarlem","Hilversum","Zaanstad","Zaandam","Purmerend","Alkmaar","Dijk en Waard","Heerhugowaard","Hoorn","Den Helder","Julianadorp","Almere","Utrecht","Leiden","Rotterdam","The Hague","Den Haag","Amersfoort","Hoofddorp","Haarlemmermeer","Diemen","Weesp","Bussum","Volendam","Edam","Beverwijk","IJmuiden","Velsen","Castricum","Heiloo","Enkhuizen","Schagen","Wormerveer","Krommenie","Assendelft","Landsmeer","Zandvoort","Bloemendaal","Heemstede","Laren","Blaricum","Huizen","Naarden","Muiden"];
  const CITY_ALIASES = { "zaandam": "Zaanstad", "heerhugowaard": "Dijk en Waard", "julianadorp": "Den Helder", "den haag": "The Hague", "wormerveer": "Zaanstad", "krommenie": "Zaanstad", "assendelft": "Zaanstad" };

  // Intent patterns. Order matters only for ties.
  const I = {
    listingTold: null, // handled separately
    toldMax: /(you|your)\b[^.?!]{0,60}\b(can|could|may|are able to)\s+(borrow|spend|afford|pay)\b[^.?!]{0,40}(€|eur|euro|\d{3})|\b(maximum|max\.?)\s+(mortgage|price|purchase price|loan|budget)\s+(is|of|will be)\s+[^.?!]{0,10}(€|\d)|\bbudget\s+(is|of)\s+(about\s+)?(€|\d)/i,
    afford: /\b(afford|borrow|how much (money )?(can|could|may) (you|we|i) (get|spend|pay for)|max(imum)?\.? (mortgage|price|purchase|loan|budget)|mortgage (amount|size)|how big .*mortgage|your budget|what budget|price range)/i,
    wait: /\b(wait|waiting|later|next year|buy now|right now|now or|in a few (months|years)|lower rates?|rates? (go|will go|might go|to go) down|go down)\b/i,
    rentvsbuy: /\b(rent(ing)? (first|instead|or)|instead of buying|buy or rent|rent or buy|keep renting|should .{0,20}rent|better to rent)\b/i,
    interest: /\b(interest|rate|rates)\b/i,
    risk: /\b(lose (your|my|her|his) job|lost (your|my) job|unemploy\w*|fired|job loss|risk|risky|safe|worried|worry|what if|what happens if|if .{0,30}(goes|go) up|rise|rises|increase)\b/i,
    currentHome: /\b(where do you (live|stay)|live now|living now|current(ly)? (home|house|apartment|live|rent)|pay (any |in )?rent|your rent|rent now|rent do you pay|how much rent|rent are you paying|where are you living)\b/i,
    timing: /\b(when (do|will|are|did) you (move|start|come|arrive|want)|moving date|how soon|deadline|hurry|when .{0,20}(move|buy)|timeline|time ?frame|this month|start date)\b/i,
    stay: /\b(how long .{0,30}(stay|live|plan|work)|(stay|live|be here|work)\b.{0,25}long time|stay in the netherlands|plan to stay|long[- ]term|go back|move back|return to|forever)\b/i,
    income: /\b(income|salary|salaries|earn|earns|wage|gross|net pay|paid)\b/i,
    contract: /\b(contract|permanent|temporary|probation|job security|fixed[- ]term|freelanc\w*|self[- ]employed|employer)\b/i,
    partner: /\b(brother|partner|wife|husband|girlfriend|boyfriend|spouse|married|marta|joana|kwame|ji-?woo|second income|both work|live alone|single)\b/i,
    household: /\b(how many people|who (will )?live|who is moving|household|family members)\b/i,
    savings: /\b(saving|savings|saved|own money|own funds|deposit|down payment|equity|cash)\b/i,
    gift: /\b(parents|gift|family help|help from (your )?family|inherit|inheritance|grandmother|€\s?10[.,]000)\b/i,
    debts: /\b(debt|debts|lease|owe|credit card|study loan|student loan|car loan|other loans?|any loans?|loans)\b/i,
    costs: /\b(monthly costs?|expenses|costs? per month|childcare|fixed costs|other costs|spend .{0,20}(each|per|a) month|bills)\b/i,
    comfort: /\b(how much .{0,25}(want|like|prefer|willing) to (pay|spend)|comfortable|left over|money left|keep (some )?money|per month .{0,25}(want|okay|ok|fine)|more expensive|pay more|(spend|borrow|pay) (the )?(maximum|everything|all)|monthly budget|budget per month|budget a month)\b/i,
    buyingCosts: /\b(buying costs|extra costs|additional costs|notary|transfer tax|kosten koper|k\.k\.|fees|closing costs)\b/i,
    nhg: /\b(nhg|national mortgage guarantee|mortgage guarantee)\b/i,
    mortgageType: /\b(pay off|repay\w*|pay back the mortgage|faster|annuity|linear|interest[- ]only|type of mortgage|kind of mortgage|fixed (rate|period|interest)|variable rate)\b/i,
    tax: /\b(tax|taxes|30% ruling|30 ?percent ruling|deduction|tax return)\b/i,
    energy: /\b(energy|label|insulat\w*|heating|solar|gas bill|sustainab\w*)\b/i,
    renovation: /\b(renovat\w*|repair\w*|old (house|home|building|one)|new (building|one|home)|older (home|house|building|one)|age of the|year built|built in|new[- ]build|modern|diy|handy|fix up)\b/i,
    size: /\b(size|m2|m²|square met\w*|how big|how much space|living room|small (home|house|apartment)|large|bigger|smaller)\b/i,
    parking: /\b(parking|park (your|the) car|garage|driveway|parking permit)\b/i,
    floor: /\b(floor|stairs|lift|elevator|ground floor|top floor)\b/i,
    area: /\b(city cent(re|er)|centre|center|downtown|neighbou?rhood|district|quiet|noise|noisy|safe area|safe street|area like|kind of area|type of area|street)\b/i,
    schools: /\b(school|schools|daycare|crèche|creche)\b/i,
    shops: /\b(shops|supermarket|shopping|facilities|restaurants|cafés|cafes)\b/i,
    kids: /\b(children|kids|child|son|daughter|twins|baby|pregnan\w*|family plans|more children)\b/i,
    pets: /\b(pet|pets|dog|dogs|cat|cats|biscoito|pip|marmalade)\b/i,
    commute: /\b(commute|where do you work|work location|your work|your job|travel to work|go to work|get to work|office|hospital|university|ijmuiden|distribution centre|work from home|working from home|work at home|remote(ly)?)\b/i,
    transport: /\b(car|cars|bike|bikes|bicycle|cycle|cycling|public transport|bus|drive|driving)\b/i,
    hobbies: /\b(hobby|hobbies|free time|spare time|sport|sports|cello|futsal|hockey|football|swim\w*|bake|baking|board games|jazz|records|interests)\b/i,
    otherWishes: /\b(other wish(es)?|anything else|other requirements?|extra wish(es)?|nice to have|other (things|demands)|any other wish\w*|any other requirement\w*)\b/i,
    priorities: /\b(give up|least important|most important|more important|less important|compromise|which wish|sacrifice|let go of|drop one|choose between|priorit\w*|must[- ]haves?|non[- ]negotiable|essential|really need|deal[- ]?breaker|rank)\b/i,
    viewing: /\b(viewing|visit (it|the|this)|see (the|this|it) (house|home|apartment)|look at (it|the house|the home|the apartment)|open house)\b/i,
    meeting: /\b(meet (you|us|me|in person|up|online)|meeting|call|phone|video call|zoom|teams|talk in person|appointment)\b/i,
    job: /\b(work for|works for|dutch company|portuguese company|portugese company|which company|for work|for a living|what (is your|are your) (job|jobs|work)|what work|your profession|occupation|what do you do\b)/i,
    documents: /\b(documents?|payslips?|pay slips?|bank statements?|passport|proof of|id card|employer'?s? statement|send (me|us) (your|the))\b/i,
    offer: /\b(offer|bid|bidding|overbid\w*|above the asking|over the asking|negotiat\w*)\b/i,
    moreQuestions: /\b(any (other |more )?questions|do you have (any )?questions|questions for (me|us)|anything you want to ask)\b/i,
    kitchen: /\b(kitchen|bathroom|cook|cooking)\b/i,
    noise: /\b(noise|noisy|neighbou?rs|thick walls|allowed to play|soundproof)\b/i,
    askPermission: /\b(can i ask|may i ask|could i ask|ask you (some|a few) questions|some questions for you|a few questions)\b/i,
    employerLetter: /\b(letter (from|of) (your|the) (boss|employer|manager|company)|ask your (boss|employer|manager)|employer'?s? (letter|statement)|intention statement)\b/i,
    smalltalk: /\b(favou?rite|joke|weather|holiday plans|birthday)\b/i,
    hours: /\b(full[- ]?time|part[- ]?time|how many hours|hours (a|per) week|days a week)\b/i,
    howAreYou: /\b(how are you|how is (the|your) move|how are things|hope you are well)\b/i,
  };
  const DIM = {
    location: /\b(city(?!\s+cent)|cities|sea|beach|coast|town|towns|location|where (do|would) you (like|want) to live|liv(e|ing) in (?!the |a |an |this |that |your |it\b|one\b)|live there|living there|move to|region|outside (of )?\w+|other place|another place|somewhere else|elsewhere|closer to)\b/i,
    bedrooms: /\b(bedroom|bedrooms|rooms?|office|studio|spare room|guest room|room for)\b/i,
    type: /\b(apartment|apartments|flat|flats|terraced|terrace house|row house|corner house|corner|semi-?detached|detached|townhouse|type of (home|house)|kind of (home|house)|a house (instead|or|rather)|house or|instead of a house|instead of an apartment|not a house|a real house)\b/i,
    outdoor: /\b(garden|gardens|balcony|balconies|terrace|outdoor|outside space|yard|backyard)\b/i,
    station: /\b(station|stations|train|trains|railway)\b/i,
  };
  const TOO_EXP = /\b(too expensive|to expensive|too much money|cant afford|can not afford|over (your|the) budget|above (your|the) budget|can'?not afford|can't afford|cannot afford|not affordable|out of (your|the) budget|outside (your|the) budget)\b/i;
  const AFFORD_SAID = /\b(you can afford|is affordable|within your budget|fits your budget|you can buy|in your budget|you can pay)\b/i;
  const sentencesOf = t => t.split(/(?<=[.?!])\s+|\n+/).filter(Boolean);
  function stripFrame(t) {
    const lines = t.split(/\n/);
    const out = [];
    for (let i = 0; i < lines.length; i++) {
      const L = lines[i].trim();
      if (i > 0 && /^(kind regards|best regards|regards|greetings|with kind regards|yours sincerely|sincerely|best wishes|thanks|thank you|bye|cheers|groetjes|met vriendelijke groet)\b[^?]*$/i.test(L) && L.length < 60) break;
      if (i === 0 && /^(dear|hello|hi|hey|good (morning|afternoon|evening)|beste|hallo)\b[^.?!]*[,!]?\s*$/i.test(L) && L.length < 70) continue;
      out.push(lines[i]);
    }
    let s = out.join("\n").trim();
    s = s.replace(/^(dear|hello|hi|hey|good (morning|afternoon|evening))\b[^,!?\n]{0,50}[,!]\s*/i, "");
    return s || t;
  }
  const RUDE = /\b(stupid|idiot|dumb|shut up|f+u+c+k|shit|loser|hate you)\b/i;
  const DUTCH = ["hallo","hoi","meneer","mevrouw","ons","hoeveel","wilt","lenen","vertellen","kopen","geld","bedankt","groetjes","alvast","zou","kunnen","willen","waar","wanneer","waarom","goed","huur","tuin","slaapkamers","ik","jullie","het","een","niet","wij","heeft","hebben","graag","vriendelijke","beste","kunt","woning","huis","u","uw","jij","je","bent","dat","wat","hoe","welke","vraag"];

  function pron(c) {
    return c.plural
      ? { we: "we", We: "We", our: "our", Our: "Our", us: "us" }
      : { we: "I", We: "I", our: "my", Our: "My", us: "me" };
  }
  function fill(s, c, extra) {
    const p = Object.assign(pron(c), extra || {});
    let out = s.replace(/\{(\w+)\}/g, (m, k) => (k in p ? p[k] : m));
    out = out.replace(/\bI are\b/g, "I am").replace(/\bI do not know\b/g, "I do not know");
    return out;
  }
  const lc = s => s.toLowerCase();
  function matchesWish(home, w) {
    const x = home[w.f];
    if (w.op === "in") return w.v.includes(x);
    if (w.op === "notin") return !w.v.includes(x);
    if (w.op === ">=") return x >= w.v;
    if (w.op === "<=") return x <= w.v;
    return true;
  }
  const euro = n => "€" + Math.round(n).toLocaleString("en-GB");

  function citiesIn(text) {
    const found = [];
    const t = " " + lc(text) + " ";
    for (const name of CITY_NAMES) {
      const n = lc(name);
      if (new RegExp("[^a-z]" + n.replace(/ /g, "\\s+") + "[^a-z]").test(t)) {
        const canon = CITY_ALIASES[n] || name;
        if (!found.includes(canon)) found.push(canon);
      }
    }
    return found;
  }
  function listingsIn(text) {
    const ids = [];
    const re = /\b(?:nh|listing|home|house|number|nr\.?|#)\s*[-#]?\s*0*(\d{1,3})\b/gi;
    let m;
    while ((m = re.exec(text))) {
      const isNH = /^nh/i.test(m[0]);
      if (!isNH && !/#|listing|number|nr/i.test(m[0])) continue;
      const id = "NH-" + String(+m[1]).padStart(3, "0");
      if (!ids.includes(id)) ids.push(id);
    }
    return ids.slice(0, 4);
  }
  function looksDutch(t) {
    const w = (" " + lc(t).replace(/[^a-zà-ÿ ]/g, " ") + " ");
    const n = DUTCH.filter(x => w.includes(" " + x + " ")).length;
    return n >= 3 || /^\s*(hoi|hallo|dag|goedemorgen|goedemiddag|doei)\s*[!.]?\s*$/i.test(t);
  }

  function describeHome(h) {
    const type = h.type === "Apartment" ? "an apartment" : h.type === "Semi-detached" ? "a semi-detached house" : h.type === "Detached" ? "a detached house" : "a " + lc(h.type);
    const out = h.outdoor === "None" ? "no outdoor space" : "a " + lc(h.outdoor);
    return `${type} in ${h.city} (${h.area}) with ${h.bedrooms} bedroom${h.bedrooms === 1 ? "" : "s"} and ${out}, ${h.m2} m², ${h.station_km} km from the station, for ${euro(h.price)}`;
  }
  function reactToHome(c, h, saidAffordable, saidTooExp) {
    const P = pron(c);
    const met = [], miss = [];
    for (const w of c.wishes) (matchesWish(h, w) ? met : miss).push(w);
    const vars = { city: h.city, type_lc: lc(h.type), outdoor_lc: lc(h.outdoor) };
    const yes = met.map(w => fill(w.yes, c, vars));
    const worst = miss.some(w => w.imp === "must") ? "must" : miss.some(w => w.imp === "important") ? "important" : miss.length ? "flexible" : "none";
    let s = `I looked at ${h.id}: ${describeHome(h)}. `;
    if (worst === "none") s += `This looks perfect for ${P.us}! ` + cap(joinList(yes)) + ".";
    else if (worst === "flexible") {
      s += (yes.length ? `${P.We} like that ${joinList(yes)}. ` : "") + `It is true that ${joinList(miss.map(w => fill(w.no, c, vars)))}, but that is okay, because that is ${P.our} least important wish. ${P.We} like this one!`;
    } else if (worst === "important") {
      s += (yes.length ? `${P.We} like that ${joinList(yes)}. ` : "") + `But ${joinList(miss.map(w => fill(w.no, c, vars)))}, and that is quite important to ${P.us}. ${P.We} are not sure about this one. Is there nothing better?`;
    } else {
      const musts = miss.filter(w => w.imp === "must").map(w => fill(w.no, c, vars));
      s += `Sorry, but this one is not for ${P.us}: ${joinList(musts)}, and that is really important to ${P.us}.`;
    }
    // small extras
    if (worst !== "must") {
      if (["F", "G"].includes(h.label) && c.id === "tremblay") s += ` I see the energy label is ${h.label}. Will it be expensive to heat?`;
      else if (["F", "G"].includes(h.label)) s += ` The energy label is ${h.label}. Is that a problem?`;
      if (c.id === "tanaka" && h.year < 1960) s += " An older building probably has thick walls, which is good for my cello!";
      if (c.id === "kowalski" && h.type === "Corner house") s += " And a corner house, my first idea!";
      const SMALL = { silva: 95, tanaka: 45, mensah: 80, hughes: 90, kowalski: 90, haddad: 62, park: 105, tremblay: 58 };
      if (h.m2 < (SMALL[c.id] || 0)) s += ` It is a bit small for ${P.us}, but ${P.we} could live with it.`;
      if (h.year >= 2010) s += ` It is a new home, so ${P.we} would not need to do any work.`;
      if (saidTooExp) s += ` You say it is too expensive for ${P.us}? That is a pity.`;
      else if (saidAffordable) s += ` And you say ${P.we} can afford it? Great news!`;
      else s += ` Can ${P.we} afford it? You know that better than ${P.we} do.`;
    }
    return { text: s, worst, missing: miss.length, tooExp: !!saidTooExp };
  }
  const LABEL_RANK = { "A+": 0, A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7 };
  function compareHomes(c, hs) {
    const P = pron(c);
    const pts = hs.map(h => ({ h, plus: [] }));
    const best = (fn, txt, lowIsBest) => {
      const vals = hs.map(fn), target = lowIsBest ? Math.min(...vals) : Math.max(...vals);
      if (vals.filter(v => v === target).length === hs.length) return;
      pts.forEach((p, i) => { if (vals[i] === target) p.plus.push(txt); });
    };
    best(h => h.price, "is the cheapest", true);
    best(h => h.m2, "is the biggest", false);
    best(h => LABEL_RANK[h.label] ?? 9, "has the best energy label", true);
    if (c.wishes.some(w => w.dim === "station") || ["tanaka","tremblay","haddad","silva"].includes(c.id)) best(h => h.station_km, "is the closest to the station", true);
    best(h => h.year, "is the newest", false);
    const lines = pts.map(p => p.plus.length ? `${p.h.id} ${joinList(p.plus)}` : `${p.h.id} is somewhere in between`);
    const all = hs.length === 2 ? "both" : "all of them";
    return `${P.We} like ${all}! ${joinList(lines)}. ${P.We} find it difficult to choose. Which one do you advise, and why? What happens with each home if the interest rate goes up?`;
  }
  function joinList(a) { return a.length <= 1 ? (a[0] || "") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]; }
  function cap(s) { return s ? s[0].toUpperCase() + s.slice(1) : s; }

  function wishAnswer(c, dim, text) {
    const w = c.wishes.find(x => x.dim === dim);
    if (dim === "location") {
      const others = citiesIn(text).filter(x => !c.cities.includes(x));
      if (others.length) return fill(c.otherCity, c, { city: others.slice(0, 3).join(" or ") });
    }
    if (w) return fill(w.ans, c);
    if (dim === "type" && c.typeAns) return fill(c.typeAns, c);
    if (dim === "station" && c.stationAns) return fill(c.stationAns, c);
    if (dim === "bedrooms" && c.bedroomsAns) return fill(c.bedroomsAns, c);
    if (dim === "station") return fill(c.a.transport, c);
    if (dim === "type") return fill(`${"{We}"} do not mind what kind of home it is, as long as it fits ${"{our}"} other wishes.`, c);
    return null;
  }

  function reply(c, text, homes, advisor) {
    const P = pron(c);
    const greet = "Dear " + (advisor || "advisor") + ",";
    const close = "\n\nKind regards,\n" + c.sign;
    const wrap = body => greet + "\n\n" + body + close;
    const t = text.trim();
    if (looksDutch(t)) return wrap(fill(c.common.dutch, c));
    if (RUDE.test(t)) return wrap(fill(c.common.rude, c));

    const body = stripFrame(t);
    const parts = [];
    const used = new Set();
    const add = (key, s, pos) => {
      if (!s || used.has(key)) return;
      const head = s.slice(0, 45);
      if (parts.some(p => p.s.includes(head) || s.includes(p.s.slice(0, 45)))) { used.add(key); return; }
      used.add(key); parts.push({ s, pos });
    };

    // 1. homes proposed by the advisor
    const ids = listingsIn(t);
    const saidTooExp = /\b(too expensive|over (your|the) budget|above (your|the) budget|can'?not afford|can't afford|cannot afford|not affordable|out of (your|the) budget|outside (your|the) budget)\b/i.test(t);
    const saidAffordable = !saidTooExp && /\b(you can afford|is affordable|within your budget|fits your budget|you can buy|in your budget|you can pay)\b/i.test(t);
    let labelMentioned = false, anyTooExp = false;
    if (ids.length) {
      const reacts = [];
      for (const id of ids) {
        const h = homes[id];
        if (!h) { reacts.push({ text: fill(c.common.unknownListing, c, { id }), worst: "x" }); continue; }
        const near = ids.length === 1 ? t : sentencesOf(t).filter(x => listingsIn(x).includes(id)).join(" ");
        const tooExpHere = TOO_EXP.test(near), affHere = !tooExpHere && AFFORD_SAID.test(near);
        if (tooExpHere) anyTooExp = true;
        const r = reactToHome(c, h, affHere, tooExpHere); if (/energy label/.test(r.text)) labelMentioned = true; reacts.push(Object.assign({ id }, r));
      }
      reacts.forEach((r, i) => add("home" + i, r.text, -100 + i));
      const ok = reacts.filter(r => r.id && !r.tooExp && (r.worst === "none" || r.worst === "flexible"));
      if (/\b(safer|safe|buffer|risk|if (the )?(interest|rates?)[^.?!]{0,20}(rise|go up|goes up|increase))\b/i.test(t) && ok.length)
        add("safe", `Thank you for thinking about the risk. If the interest rate goes up, ${P.we} still want to be able to pay ${P.our} mortgage, so that is important to ${P.us}.`, -45);
      if (anyTooExp && !ok.length) add("tooExp", fill(c.common.tooExpensive, c), -40);
      if (ok.length > 1) add("pref", compareHomes(c, ok.map(r => homes[r.id])), -50);
    }

    // 2. wish dimensions and intents, kept in order of appearance
    const sentences = body.split(/(?<=[.?!])\s+|\n+/).filter(Boolean);
    let offset = 0;
    for (const sent of sentences) {
      const pos = body.indexOf(sent, offset); offset = pos + sent.length;
      const s = sent;
      const hasOtherCity = citiesIn(s).length > 0 && !listingsIn(s).length;
      // told maximum / affordability
      if (I.toldMax.test(s)) { add("toldMax", fill(ids.length ? c.common.toldMaxWithHome : c.common.toldMax, c), pos); continue; }
      // priorities before single wishes
      const dimHere = Object.keys(DIM).some(d => DIM[d].test(s)) || citiesIn(s).length > 0;
      if (I.priorities.test(s) && !dimHere) add("priorities", fill(c.a.priorities, c), pos);
      const ORDER_KEYS = ["rentvsbuy","wait","stay","job","hours","income","contract","savings","gift","debts","costs","comfort","buyingCosts","schools","kids","pets","hobbies","currentHome","timing"];
      const otherIntentHere = ORDER_KEYS.some(k => I[k].test(s));
      for (const d of Object.keys(DIM)) {
        if (d === "location" && I.stay.test(s)) continue;
        if (d === "location" && !DIM.location.test(s) && otherIntentHere) continue;
        const sd = d === "type" ? s.replace(/\b(the|this|that|your|my|our) (apartment|flat|house|home)\b/gi, "") : s;
        if (d === "type" && I.floor.test(s) && !/\bhouse\b/i.test(s)) continue;
        if (DIM[d].test(sd) || (d === "location" && hasOtherCity)) {
          if (listingsIn(s).length) continue;
          if (ids.length && !/\?/.test(s)) continue;
          if (d === "type" && !/\b(house|houses|instead|prefer|rather|okay|ok|fine|accept|consider|kind|type|terraced|corner|detached|flat|or|want|need|like|looking)\b/i.test(sd.replace(/\b(an? )?apartments?\b/gi, ""))) continue;
          add("dim:" + d, wishAnswer(c, d, s), pos + 1);
        }
      }
      if (I.afford.test(s) && !used.has("toldMax") && !I.comfort.test(s) && !saidAffordable && !saidTooExp && !ids.length) add("afford", fill(c.common.afford, c), pos + 2);
      const order = ["rentvsbuy","wait","risk","interest","currentHome","timing","stay","job","hours","income","contract","partner","household","savings","gift","debts","costs","comfort","buyingCosts","nhg","mortgageType","tax","energy","renovation","size","parking","floor","area","schools","shops","kids","pets","commute","transport","hobbies","otherWishes","kitchen","noise","askPermission","viewing","meeting","documents","employerLetter","offer","moreQuestions","smalltalk","howAreYou"];
      for (const k of order) {
        if (!I[k].test(s)) continue;
        if (k === "interest" && I.mortgageType.test(s)) continue;
        if ((k === "risk" || k === "interest") && used.has("safe")) continue;
        if (k === "partner" && /^(joana|kwame|marta|ji-?woo|daniel|lena)$/i.test((s.match(I.partner) || [""])[0]) && ORDER_KEYS.some(x => x !== "partner" && I[x].test(s))) continue;
        if ((k === "wait" && used.has("timing")) || (k === "timing" && used.has("wait"))) continue;
        if (k === "pets" && used.has("dim:outdoor")) continue;
        if (k === "transport" && used.has("debts") && /\blease\b/i.test(s)) continue;
        if (k === "income" && /\b(only your income|your income counts)\b/i.test(s)) continue;
        if (k === "interest" && (used.has("wait") || used.has("risk") || /\b(wait|later|next year|go down|lower|go up|rise|risk|what if|what happens)\b/i.test(s))) { if (!used.has("wait") && !used.has("risk")) add("risk", fill(c.a.risk, c), pos + 3); continue; }
        if (k === "risk" && /\b(area|street|neighbou?rhood)\b/i.test(s)) continue;
        if ((k === "wait" && used.has("rentvsbuy")) || (k === "rentvsbuy" && used.has("wait"))) continue;
        if (k === "energy" && labelMentioned) continue;
        if (k === "currentHome" && /\bbrother\b/i.test(s)) continue;
        if (k === "transport" && used.has("parking")) continue;
        if (k === "commute" && /\b(lose|lost|unemploy|fired)\b/i.test(s)) continue;
        if (k === "noise" && c.a.noise == null) { if (!used.has("area")) add("area", fill(c.a.area, c), pos + 3); continue; }
        if (k === "household") { add("partner", fill(c.a.partner, c), pos + 3); add("kids", fill(c.a.kids, c), pos + 3); continue; }
        if (k === "transport" && (used.has("dim:station") || DIM.station.test(s))) continue;
        if (k === "size" && DIM.outdoor.test(s)) continue;
        if (k === "kids" && (DIM.bedrooms.test(s) || I.schools.test(s))) continue;
        if (k === "pets" && DIM.outdoor.test(s)) continue;
        if (k === "hobbies" && (I.pets.test(s) && /\bdog|cat/i.test(s))) continue;
        if (k === "hobbies" && I.noise.test(s) && c.a.noise != null) continue;
        if (k === "viewing" && ids.length === 0 && !/\b(it|this|that)\b/i.test(s)) { add(k, fill(c.common.viewing.replace("Yes, {we} would love to see it!", "Yes, {we} would love to visit homes with you!"), c), pos + 3); continue; }
        const src = c.a[k] != null ? c.a[k] : c.common[k];
        if (src) add(k, fill(src, c), pos + 3);
      }
    }

    let picked = parts.sort((a, b) => a.pos - b.pos).map(p => p.s);
    // keep it readable: at most 5 paragraphs
    if (picked.length > 6) picked = picked.slice(0, 6).concat([`${P.We} will answer your other questions in ${P.our} next e-mail.`]);
    if (!picked.length) {
      if (/\b(thank|thanks)\b/i.test(t) && !/\?/.test(t)) return wrap(fill(c.common.thanks, c));
      if (!/\?/.test(t) && t.length < 400) return wrap(fill(c.common.greetingOnly, c));
      return wrap(fill(c.common.unclear, c));
    }
    return wrap("Thank you for your e-mail.\n\n" + picked.join("\n\n")).replace(/\bI are\b/g, "I am");
  }

  root.HousingCheckEngine = { reply, listingsIn, citiesIn };
})(typeof window !== "undefined" ? window : globalThis);
