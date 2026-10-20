// Usage: node src/tests/run.js src/tests/questions_1.json
global.window = global; require("../../data.js"); require("../../engine.js");
const D = window.HC_DATA, E = window.HousingCheckEngine;
const T = JSON.parse(require("fs").readFileSync(process.argv[2], "utf8"));
for (const [id, q] of T) console.log("=".repeat(60) + "\n[" + id + "] " + q + "\n---\n" + E.reply(D.clients.find(c => c.id === id), q, D.homes, "Group 3"));
