/* Language check for The Housing Check: tone (register), spelling and common phrasing mistakes.
   Works offline. Needs window.HC_WORDS (newline-separated word list, most frequent first). */
(function (root) {
  let DICT = null, RANK = null;
  function dict() {
    if (DICT) return DICT;
    DICT = new Set(); RANK = new Map();
    (root.HC_WORDS || "").split("\n").forEach((w, i) => { if (w) { DICT.add(w); RANK.set(w, i); } });
    return DICT;
  }
  const known = w => dict().has(w);

  // ---------- tone ----------
  const TEXTSPEAK = { u: "you", ur: "your / you're", r: "are", pls: "please", plz: "please", thx: "thank you", thnx: "thank you", ty: "thank you",
    btw: "by the way", idk: "I do not know", imo: "in my opinion", tbh: "to be honest", lol: "(leave it out)", omg: "(leave it out)", nvm: "(leave it out)",
    gonna: "going to", wanna: "want to", gotta: "have to", kinda: "rather / quite", cuz: "because", coz: "because", ya: "you", yeah: "yes", yep: "yes", nope: "no",
    k: "OK", bro: "(leave it out)", dude: "(leave it out)", guys: "(leave it out)", awesome: "excellent / very good", cool: "good / fine", stuff: "things",
    yo: "(leave it out)", hiya: "Dear …", heya: "Dear …", sup: "(leave it out)", asap: "as soon as possible", tho: "though", cya: "Kind regards" };
  const GOOD_GREET = /^(dear|good (morning|afternoon|evening)|hello)\b/i;
  const OK_GREET = /^(hi)\b/i;
  const BAD_GREET = /^(hey+|yo|hiya|heya|sup|hoi|hallo|hai|helloo+|hii+)\b/i;
  const GOOD_CLOSE = /\b(kind regards|best regards|warm regards|regards|yours sincerely|yours faithfully|sincerely|best wishes|with kind regards|many thanks|thank you in advance|looking forward to (hearing from you|your (reply|answer)))\b/i;
  const BAD_CLOSE = /\b(cheers|bye+|cya|later|ciao|groetjes|doei|xoxo|xx+|peace)\b/i;
  const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]|[:;]-?[)(DPp]\B|<3/u;
  const DEMANDING = /\b(answer (me )?(fast|quick|now|asap)|hurry up|you (must|have to) answer|i need (it|this|an answer) (now|today|fast)|reply (fast|quick|now))\b/i;

  // ---------- phrasing (high-precision patterns) ----------
  const G = [
    [/\blend(ing)? (money |a mortgage |it )?(from|of) (the |a )?bank\b/i, "borrow … from the bank", "You borrow FROM someone; the bank lends TO you."],
    [/\bhow much costs?\s+(it|the|this|that|a|an)\b/i, "How much does … cost?", "In a question with 'how much', use 'does … cost'."],
    [/\b(i am|i'm|we are|we're) agree\b/i, "I agree / we agree", "'Agree' is a verb: no 'am' or 'are'."],
    [/\bsince (\d+|one|two|three|four|five|six|seven|eight|nine|ten|a few|many) (years?|months?|weeks?|days?)\b/i, "for … years", "Use 'for' with a period of time, 'since' with a starting point (since 2020)."],
    [/\bmore (cheaper|bigger|smaller|better|easier|larger|higher|lower|worse|safer|nicer)\b/i, "cheaper / bigger (without 'more')", "Do not use 'more' with a comparative that already ends in -er."],
    [/\b(should|could|would|must|might) of\b/i, "should have / could have", "It is 'should have', not 'should of'."],
    [/\b(you|we|they) was\b/i, "you were / we were / they were", "Use 'were' after you, we and they."],
    [/\b(he|she|it) don'?t\b/i, "he/she/it doesn't", "Use 'doesn't' after he, she and it."],
    [/\b(i|we|you|they) has\b/i, "I have / we have", "Use 'have' after I, we, you and they."],
    [/\b(we|you|they) is\b/i, "we are / you are", "Use 'are' after we, you and they."],
    [/(?<!\b(does|did|will|would|can|could|should|may|might|must|to|let|make|let's)\s)\b(he|she) have\b/i, "he has / she has", "Use 'has' after he and she."],
    [/\byour (welcome|right|going|very|so|not|able)\b/i, "you're (= you are)", "'Your' shows possession; 'you're' means 'you are'."],
    [/\byou'?re (house|home|income|wishes|wish|money|family|budget|e-?mail|question|questions|savings|children|job|contract|salary|partner|mortgage|own)\b/i, "your (house / income …)", "'You're' means 'you are'; use 'your' for possession."],
    [/\bthere (house|home|income|wishes|budget|children|savings|salary|own|family|questions?)\b/i, "their", "'There' is a place; 'their' shows possession."],
    [/\btheir (is|are|was|were)\b/i, "there is / there are", "'Their' shows possession; use 'there is / there are'."],
    [/\b(more|less|bigger|smaller|cheaper|higher|lower|better|worse|larger|safer|rather|nicer|older|newer) then\b/i, "than", "Use 'than' to compare; 'then' is about time."],
    [/\bits (a|an|the|very|too|not|important|possible|better|true|okay|ok|expensive|cheap)\b/i, "it's (= it is)", "'Its' shows possession; 'it's' means 'it is'."],
    [/\bit'?s (own|price|garden|location|energy|size|bedrooms|balcony)\b/i, "its (possession)", "Use 'its' (no apostrophe) for possession."],
    [/\bloose (your|my|the|their|our|money|job|the house)\b/i, "lose", "'Lose' (verb) rhymes with 'choose'; 'loose' means not tight."],
    [/\b(i|we|would|to|can|could|will|should) advice\b/i, "advise (verb)", "'Advice' is the noun; 'advise' is the verb."],
    [/\ba (apartment|energy|offer|answer|advice|option|extra|old|interest|e-?mail|idea|overview|important|income|estate agent|average)\b/i, "an …", "Use 'an' before a vowel sound."],
    [/\ban (house|home|garden|big|small|nice|new|good|bank|mortgage|loan|terraced)\b/i, "a …", "Use 'a' before a consonant sound."],
    [/\b(informations|advices|furnitures|moneys|homeworks|equipments)\b/i, "information / advice (no -s)", "These nouns are uncountable: no -s."],
    [/\bmake a (photo|picture)\b/i, "take a photo", "In English you 'take' a photo."],
    [/\bhear of you\b/i, "hear from you", "It is 'I look forward to hearing from you'."],
    [/\bon (the )?moment\b/i, "at the moment", "Use 'at the moment'."],
    [/\bexplain (me|us)\b/i, "explain to me / us", "Use 'explain something to someone'."],
    [/\blook forward to hear\b/i, "look forward to hearing", "After 'look forward to', use the -ing form."],
    [/\b(i|we) (want|would like) (to )?(know|ask) (if|whether|how|what|which) (is|are|can|do|does) (you|your|it|there)\b/i, "I would like to know if you are / if it is …", "In an indirect question, keep normal word order: '… if you are …'."],
    [/\bdo you (has|is|are)\b/i, "do you have / are you", "After 'do you', use the base form of the verb."],
    [/\bdoes (he|she|it|your \w+) (has|is|wants|needs)\b/i, "does … have / want / need", "After 'does', use the base form (have, want, need)."],
    [/\b(\d+|two|three|four|five|six) bedroom\b(?!s)/i, "… bedrooms", "Plural after a number: three bedrooms."],
  ];

  // Words that are fine even if they are not in the dictionary
  const EXTRA_OK = new Set("ok okay nh e-mail email emails e-mails km m2 m² vs etc ie eg pm am mr mrs ms dr max min".split(" "));
  const FIX = { dont: "don't (or: do not)", cant: "can't (or: cannot)", wont: "won't (or: will not)", thats: "that's (or: that is)", doesnt: "doesn't (or: does not)",
    isnt: "isn't (or: is not)", didnt: "didn't (or: did not)", im: "I'm (or: I am)", ive: "I've (or: I have)", youre: "you're (or: you are)", whats: "what's (or: what is)",
    fulltime: "full-time", parttime: "part-time", nessecary: "necessary", neccessary: "necessary", necesary: "necessary", neccesary: "necessary",
    portugese: "Portuguese", netherland: "the Netherlands", netto: "net", bruto: "gross", appartement: "apartment", appartment: "apartment", adres: "address",
    hypotheek: "mortgage", salaris: "salary", rente: "interest rate", huis: "house", woning: "home", tuin: "garden", makelaar: "estate agent",
    sincerly: "sincerely", regars: "regards", untill: "until", wich: "which", alot: "a lot", ofcourse: "of course", definately: "definitely", seperate: "separate" };
  const DUTCH_WORDS = ["ik","jullie","het","een","niet","wij","heeft","hebben","graag","vriendelijke","beste","kunt","woning","huis","uw","jij","bent","wat","hoe","welke","vraag","hoeveel","wilt","lenen","meneer","mevrouw","groetjes","bedankt","alvast","zou","kunnen","willen","waarom","wanneer","tuin","huur"];

  function edits1(w) {
    const a = "abcdefghijklmnopqrstuvwxyz", out = new Set();
    for (let i = 0; i <= w.length; i++) {
      const L = w.slice(0, i), R = w.slice(i);
      if (R) out.add(L + R.slice(1));
      if (R.length > 1) out.add(L + R[1] + R[0] + R.slice(2));
      for (const ch of a) { if (R) out.add(L + ch + R.slice(1)); out.add(L + ch + R); }
    }
    return out;
  }
  function suggest(w) {
    dict();
    let best = null, br = Infinity;
    const e1 = edits1(w);
    for (const x of e1) if (DICT.has(x) && RANK.get(x) < br) { best = x; br = RANK.get(x); }
    if (best) return best;
    if (w.length >= 5 && w.length <= 12) {
      for (const x of e1) for (const y of edits1(x)) if (DICT.has(y) && RANK.get(y) < br) { best = y; br = RANK.get(y); }
    }
    return best;
  }

  function check(text, opts) {
    opts = opts || {};
    const t = (text || "").trim();
    const wl = " " + t.toLowerCase().replace(/[^a-zà-ÿ ]/g, " ") + " ";
    if (DUTCH_WORDS.filter(x => wl.includes(" " + x + " ")).length >= 3)
      return { level: 2, reason: "dutch", tone: [{ kind: "dutch", weight: 2, msg: "Your e-mail is in Dutch, and your client does not speak Dutch yet.", fix: "Write your e-mail in English." }], spelling: [], grammar: [], wordCount: 0 };
    const lines = t.split(/\n/).map(s => s.trim()).filter(Boolean);
    const first = lines[0] || "", lastLines = lines.slice(-3).join(" ");
    const tone = [];
    const addTone = (kind, weight, msg, fix) => tone.push({ kind, weight, msg, fix });

    // greeting
    if (BAD_GREET.test(first)) addTone("greeting", 2, `“${first.split(/[\s,!]/)[0]}” is too informal for a business e-mail.`, "Start with “Dear Mr Kowalski,” or “Dear Mateus,”.");
    else if (OK_GREET.test(first)) addTone("greeting", 1, "“Hi” is friendly, but a little informal for a client you do not know well.", "Start with “Dear …,”.");
    else if (!GOOD_GREET.test(first)) addTone("greeting", 1, "Your e-mail has no greeting.", "Start with “Dear …,” and the client's name.");
    // closing
    if (BAD_CLOSE.test(lastLines)) addTone("closing", 2, "Your closing is too informal.", "End with “Kind regards,” and your name.");
    else if (!GOOD_CLOSE.test(lastLines) && lines.length > 0) addTone("closing", 1, "Your e-mail has no closing.", "End with “Kind regards,” and your name on the next line.");
    // text speak and slang
    const words = t.toLowerCase().match(/[a-z']+/g) || [];
    const ts = [...new Set(words.filter(w => TEXTSPEAK[w] && !(w === "k" && /\bk\.?m\b/i.test(t))))];
    if (ts.length) addTone("textspeak", 2, `Text speak or slang: ${ts.map(w => "“" + w + "”").join(", ")}.`, ts.map(w => `${w} → ${TEXTSPEAK[w]}`).join("; "));
    if (EMOJI.test(t)) addTone("emoji", 2, "Emojis or smileys do not belong in a business e-mail.", "Leave them out.");
    if (/!{2,}|\?{2,}/.test(t)) addTone("punct", 2, "Several exclamation marks or question marks in a row look unprofessional.", "Use one.");
    const caps = (t.match(/\b[A-Z]{4,}\b/g) || []).filter(w => !/^(NHG|BKR|EUR|NOTE|ASAP)$/.test(w));
    if (caps.length) addTone("caps", 2, `Words in capitals (${caps.slice(0, 3).join(", ")}) read as shouting.`, "Write them in normal letters.");
    if (/(^|[\s.!?])i([\s',]|$)/.test(t)) addTone("lowerI", 2, "“i” should always be a capital “I”.", "Write “I”.");
    const sents = t.split(/(?<=[.?!])\s+|\n+/).map(s => s.trim()).filter(s => /[a-z]/i.test(s));
    const lowerStarts = sents.filter(s => /^[a-z]/.test(s)).length;
    if (sents.length >= 2 && lowerStarts / sents.length >= 0.5) addTone("lowercase", 2, "Many sentences start with a small letter.", "Start every sentence with a capital letter.");
    if (words.length >= 15 && !/[.?!]/.test(t)) addTone("nopunct", 1, "Your e-mail has no full stops or question marks.", "End every sentence with a full stop or question mark.");
    if (words.length < 8) addTone("short", 1, "Your e-mail is very short and may feel abrupt.", "Add a greeting, a short polite sentence and a closing.");
    if (DEMANDING.test(t)) addTone("demanding", 2, "Your e-mail sounds demanding.", "Ask politely: “Could you please let me know …?”.");

    // spelling
    dict();
    const extra = new Set([...(opts.allow || [])].map(s => s.toLowerCase()));
    const spelling = [];
    const tokens = t.match(/[A-Za-zÀ-ÿ'’-]+/g) || [];
    const seen = new Set();
    for (const raw of tokens) {
      let w = raw.replace(/[’]/g, "'").replace(/^['-]+|['-]+$/g, "");
      if (!w || w.length < 2) continue;
      if (/^[A-Z]/.test(w)) { if (w === w.toUpperCase() || !known(w.toLowerCase())) continue; } // names, places, acronyms
      const lw = w.toLowerCase();
      if (["hoi","hallo","hey","heyy","hai"].includes(lw)) continue;
      if (lw === "netherlands" || lw === "holland" || lw === "dutch" || lw === "english") continue;
      if (TEXTSPEAK[lw] || EXTRA_OK.has(lw) || extra.has(lw) || seen.has(lw)) continue;
      const base = lw.replace(/'(s|t|re|ve|ll|d|m)$/, "").replace(/n$/, m => lw.endsWith("n't") ? "" : m);
      if (known(lw) || known(base) || (lw.endsWith("n't") && known(lw.slice(0, -3))) || /^(can't|won't|shan't|i'm|i've|i'd|i'll)$/.test(lw)) continue;
      if (lw.includes("-") && lw.split("-").every(p => known(p) || extra.has(p))) continue;
      seen.add(lw);
      spelling.push({ word: w, suggestion: FIX[lw] || suggest(lw) });
    }
    // phrasing
    const grammar = [];
    for (const [re, fix, why] of G) {
      const m = t.match(re);
      if (m) grammar.push({ found: m[0], fix, why });
    }
    const toneHeavy = tone.filter(x => x.weight === 2).length, toneMinor = tone.filter(x => x.weight === 1).length;
    const lang = spelling.length + grammar.length;
    const density = words.length ? lang / words.length : 0;
    let level = 0;
    if (toneHeavy >= 2 || (toneHeavy >= 1 && toneMinor >= 2) || lang >= 6 || (lang >= 4 && density > 0.12) || (toneHeavy >= 1 && lang >= 3)) level = 2;
    else if (toneHeavy >= 1 || toneMinor >= 1 || lang >= 2) level = 1;
    const reason = level === 0 ? null : (lang >= 4 && toneHeavy === 0) || (lang >= 2 && toneHeavy === 0 && toneMinor === 0) ? "language" : "tone";
    return { level, reason, tone, spelling, grammar, wordCount: words.length };
  }

  root.HousingCheckLanguage = { check, suggest };
})(typeof window !== "undefined" ? window : globalThis);
