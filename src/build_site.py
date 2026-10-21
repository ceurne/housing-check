"""Build index.html: one self-contained file with the Client Inbox and the Market day dashboard.

Run from the repository root:  python3 src/build_site.py
Sources: src/inbox.html, src/marktdag.html, data.js, engine.js
"""
import html, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rd = lambda p: open(os.path.join(ROOT, p), encoding="utf-8").read()

data = rd("data.js").replace("</", "<\\/")
engine = rd("engine.js").replace("</script", "<\\/script")
share = '<script>window.HC_DATA = parent.HC_DATA; window.HousingCheckEngine = parent.HousingCheckEngine;</script>'

inbox = rd("src/inbox.html").replace('<script src="data.js"></script>\n<script src="engine.js"></script>', share)
dash = rd("src/marktdag.html").replace('<script src="data.js"></script>', share)
assert share in inbox and share in dash

shell = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>The Housing Check</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=IBM+Plex+Sans:wght@500;600&display=swap">
<style>
:root{{--bg:#EEF2F2;--surface:#FFFFFF;--line:#CBD5D5;--ink:#122224;--muted:#56696B;--accent:#0D6B66;--accent-ink:#FFFFFF;
  --f-display:"Bricolage Grotesque",ui-sans-serif,system-ui,sans-serif;--f-body:"IBM Plex Sans",ui-sans-serif,system-ui,sans-serif}}
@media (prefers-color-scheme:dark){{:root{{--bg:#0F1718;--surface:#172324;--line:#2E4244;--ink:#E4EEEE;--muted:#93A8AA;--accent:#4FB8B0;--accent-ink:#0B1A1A;color-scheme:dark}}}}
*,*::before,*::after{{box-sizing:border-box}}
html,body{{height:100%;margin:0}}
body{{background:var(--bg);color:var(--ink);font-family:var(--f-body);display:flex;flex-direction:column}}
.top{{display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;justify-content:space-between;background:var(--surface);border-bottom:1px solid var(--line);
  padding-block:calc(8px + env(safe-area-inset-top,0px)) 8px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}}
.brand{{font-family:var(--f-display);font-weight:800;font-size:1.1rem;letter-spacing:-.01em}}
.tabs{{display:inline-flex;border:1px solid var(--line);border-radius:999px;padding:3px;background:var(--bg)}}
.tabs button{{font:inherit;font-weight:600;font-size:.88rem;border:0;background:none;color:var(--muted);padding:6px 14px;border-radius:999px;cursor:pointer}}
.tabs button[aria-selected="true"]{{background:var(--accent);color:var(--accent-ink)}}
.dl{{font-size:.82rem;font-weight:600;color:var(--accent);text-decoration:none;border:1px solid var(--line);border-radius:999px;padding:6px 12px}}
.dl:hover{{border-color:var(--accent)}}
:focus-visible{{outline:2px solid var(--accent);outline-offset:2px}}
iframe{{flex:1;width:100%;border:0;display:block;background:var(--bg)}}
[hidden]{{display:none!important}}
@media (max-width:520px){{.brand{{width:100%}}}}
</style>
<script>{data}</script>
<script>{engine}</script>
</head>
<body>
<div class="top">
  <span class="brand">The Housing Check</span>
  <div class="tabs" role="tablist" aria-label="Choose a tool">
    <button role="tab" id="tab-inbox" aria-selected="true" aria-controls="inbox">Client Inbox · students</button>
    <button role="tab" id="tab-teacher" aria-selected="false" aria-controls="teacher">Market day · teacher</button>
  </div>
  <a class="dl" id="dl" href="index.html" download="The_Housing_Check.html" title="Save this whole site as one file that works offline">Download as one file</a>
</div>
<iframe id="inbox" title="Client Inbox" srcdoc="{html.escape(inbox, quote=True)}"></iframe>
<iframe id="teacher" title="Market day dashboard" hidden srcdoc="{html.escape(dash, quote=True)}"></iframe>
<script>
function show(which) {{
  const t = which === "teacher";
  document.getElementById("inbox").hidden = t;
  document.getElementById("teacher").hidden = !t;
  document.getElementById("tab-inbox").setAttribute("aria-selected", !t);
  document.getElementById("tab-teacher").setAttribute("aria-selected", t);
  try {{ history.replaceState(null, "", t ? "#teacher" : "#inbox"); }} catch (e) {{}}
}}
document.getElementById("tab-inbox").onclick = () => show("inbox");
document.getElementById("tab-teacher").onclick = () => show("teacher");
show(location.hash === "#teacher" ? "teacher" : "inbox");
// When opened from a downloaded file, the download link is not needed.
if (location.protocol === "file:") document.getElementById("dl").hidden = true;
</script>
</body>
</html>
'''
open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8").write(shell)
open(os.path.join(ROOT, "marktdag.html"), "w", encoding="utf-8").write(
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>The Housing Check</title>'
  '<meta http-equiv="refresh" content="0; url=./#teacher"></head>'
  '<body><p>The market day dashboard has moved: <a href="./#teacher">open it here</a>.</p></body></html>\n')
print("index.html", round(len(shell) / 1024), "KB")
