// Prints the B-roll windows of Mnc8Reel (same at() rules as captionsCore) — keep in sync with T in Mnc8Reel.tsx.
import fs from "fs";
const W = JSON.parse(fs.readFileSync(new URL("../src/mnc8/words.json", import.meta.url)));
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9áéíóúñü]/g, "");
const at = (w, nth = 0, after = 0) => W.filter((x) => norm(x.w) === norm(w) && x.s >= after)[nth].s;
const T = {
  b2: at("el") - 0.05, b4: at("Klarna", 1) - 0.08, b3: at("Es", 0, 9) - 0.1, b5: at("En", 0, 12) - 0.1,
  b6: at("En", 0, 15.3) - 0.1, b7: at("dos") - 0.1, b8: at("y", 0, 22) - 0.1, b9: at("Todo") - 0.1,
  b10: at("El", 0, 28) - 0.1, b11: at("y", 0, 33.9) - 0.1, b12: at("Pero", 1) - 0.1, b13: at("Klarna", 0, 39) - 0.1,
  b14: at("No", 0, 47.5) - 0.1, b15: at("Si") - 0.12, b16: at("Si", 1) - 0.12,
};
const seq = [0, T.b2, T.b4, T.b3, T.b5, T.b6, T.b7, T.b8, T.b9, T.b10, T.b11, T.b12, T.b13, T.b14, T.b15, T.b16];
for (let i = 0; i < 15; i++) console.log(seq[i].toFixed(3), seq[i + 1].toFixed(3));
console.log(T.b16.toFixed(3), "end");
