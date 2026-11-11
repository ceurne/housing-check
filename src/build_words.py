"""Build words_en.txt (rank order) from the pyspellchecker English frequency list, with British spellings.
Run once: python3 build_words.py /path/to/spellchecker/resources/en.json.gz"""
import gzip, json, sys, re, os
here = os.path.dirname(os.path.abspath(__file__))
d = json.load(gzip.open(sys.argv[1]))
words = [k for k, v in sorted(d.items(), key=lambda x: -x[1]) if re.fullmatch(r"[a-z]+(-[a-z]+)?", k)][:60000]
BLOCK = set("wether advices calender cant wont dont doesnt didnt isnt im ive thats youre u ur r pls plz thx thnx gonna wanna gotta kinda cuz coz ya yeah yep nope lol omg idk btw tbh nvm ty k informations furnitures".split())
words = [w for w in words if w not in BLOCK]
have = set(words)
extra = []
for w in list(words):
    for a, b in (("ize", "ise"), ("ized", "ised"), ("izes", "ises"), ("izing", "ising"), ("ization", "isation"), ("izations", "isations"), ("yze", "yse"), ("yzed", "ysed"), ("yzing", "ysing")):
        if w.endswith(a): extra.append(w[: -len(a)] + b)
OUR = "colour favour honour labour neighbour behaviour harbour humour rumour flavour savour vapour endeavour".split()
for base in OUR:
    for suf in ("", "s", "ed", "ing", "ite", "ites", "able", "ably", "hood", "hoods", "ly", "ful", "less"):
        extra.append(base + suf)
extra += """centre centres theatre theatres metre metres litre litres programme programmes defence licence offence travelled travelling traveller travellers
jewellery grey mould cheque tyre enrol enrolled fulfil fulfilment catalogue dialogue analogue cosy organisation organisations realise realised realising
apologise apologised recognise recognised specialise specialised specialisation finalise prioritise summarise emphasise criticise maths whilst amongst
learnt spelt dreamt burnt e-mail e-mails emails email nhg bkr wifi online offline km mortgage mortgages affordable buyer buyers homeowner homeowners
annuity annuities leaseholder pram prams cello futsal semi-detached terraced loft attic duplex studio""".split()
for w in extra:
    if w not in have:
        have.add(w); words.append(w)
open(os.path.join(here, "words_en.txt"), "w").write("\n".join(words) + "\n")
print(len(words), "words")
