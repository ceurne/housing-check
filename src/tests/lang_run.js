// Usage: node src/tests/lang_run.js file.json  -> prints level, reason and issues per e-mail
global.window = global; require("../../words.js"); require("../../data.js"); require("../../language.js"); require("../../engine.js");
const D = window.HC_DATA, L = window.HousingCheckLanguage, E = window.HousingCheckEngine;
const T = JSON.parse(require("fs").readFileSync(process.argv[2], "utf8"));
for (const [id, q] of T) {
  const c = D.clients.find(x => x.id === id);
  const r = L.check(q, { allow: E.allowFor(c, D.homes, "Group 3") });
  console.log(`[${id}] L${r.level} ${r.reason || ""} | ${q.replace(/\n/g, " ").slice(0, 70)}`);
  r.tone.forEach(x => console.log("   tone:", x.weight, x.msg));
  r.spelling.forEach(x => console.log("   spell:", x.word, "->", x.suggestion));
  r.grammar.forEach(x => console.log("   grammar:", x.found, "->", x.fix));
}
