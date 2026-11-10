// Prints the B-roll windows of Mnc12Reel (same at() rules as captionsCore) — keep in sync with T/ROLLS in Mnc12Reel.tsx.
import fs from "fs";
const W = JSON.parse(fs.readFileSync(new URL("../src/mnc12/words.json", import.meta.url)));
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9áéíóúñü]/g, "");
const at = (w, nth = 0, after = 0) => W.filter((x) => norm(x.w) === norm(w) && x.s >= after)[nth].s;
const T = {
  app: at("es", 0, 2.5) - 0.1, b2: at("Se") - 0.1, c1: at("es", 0, 10) - 0.1, b3: at("en", 0, 13) - 0.1, b5: at("Le", 0, 17) - 0.1,
  b6: at("y", 0, 24.6) - 0.1, b7: at("Lo", 0, 28) - 0.1, b8: at("si", 0, 32) - 0.1, b9: at("Pero") - 0.1, b10: at("no", 0, 37.5) - 0.1,
  c2: at("Como", 0, 44.9) - 0.1, cfg: at("Para", 0, 47.5) - 0.1, b11: at("Ya", 0, 58.9) - 0.1, close: at("Si", 0, 63) - 0.12,
};
const seq = [0, T.app, T.b2, T.c1, T.b3, T.b5, T.b6, T.b7, T.b8, T.b9, T.b10, T.c2, T.cfg, T.b11, T.close];
for (let i = 0; i < seq.length - 1; i++) console.log(seq[i].toFixed(3), seq[i + 1].toFixed(3));
console.log(T.close.toFixed(3), "end");
