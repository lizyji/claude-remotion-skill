// Prints the B-roll windows of Mnc11Reel (same at() rules as captionsCore) — keep in sync with T/ROLLS in Mnc11Reel.tsx.
import fs from "fs";
const W = JSON.parse(fs.readFileSync(new URL("../src/mnc11/words.json", import.meta.url)));
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9áéíóúñü]/g, "");
const at = (w, nth = 0, after = 0) => W.filter((x) => norm(x.w) === norm(w) && x.s >= after)[nth].s;
const T = {
  sys: at("Mis", 0, 4) - 0.1, c1: at("Antes") - 0.1, b4: at("Ahora,", 0, 16) - 0.1, b5: at("con", 0, 24.6) - 0.1,
  b6: at("Y", 0, 27) - 0.05, b7: at("guion") - 0.1, yesno: at("Yo", 0, 33) - 0.1, b8: at("Si", 0, 36.5) - 0.1,
  b9: at("Y", 0, 41.5) - 0.1, b10: at("Pero", 0, 46) - 0.1, c2: at("La", 0, 47.5) - 0.1, crit: at("La", 0, 51.5) - 0.1,
  c3: at("Esto") - 0.1, close: at("Y", 0, 59.7) - 0.05,
};
const seq = [0, T.sys, T.c1, T.b4, T.b5, T.b6, T.b7, T.yesno, T.b8, T.b9, T.b10, T.c2, T.crit, T.c3, T.close];
for (let i = 0; i < seq.length - 1; i++) console.log(seq[i].toFixed(3), seq[i + 1].toFixed(3));
console.log(T.close.toFixed(3), "end");
