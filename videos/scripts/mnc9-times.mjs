// Prints the B-roll windows of Mnc9Reel (same at() rules as captionsCore) — keep in sync with T in Mnc9Reel.tsx.
import fs from "fs";
const W = JSON.parse(fs.readFileSync(new URL("../src/mnc9/words.json", import.meta.url)));
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9áéíóúñü]/g, "");
const at = (w, nth = 0, after = 0) => W.filter((x) => norm(x.w) === norm(w) && x.s >= after)[nth].s;
const T = {
  b2: at("una") - 0.12, b3: at("Piensa") - 0.1, b4: at("formas") - 0.1, b5: at("Entonces") - 0.1,
  b6: at("Toma") - 0.1, b7: at("UPS", 0, 34) - 0.1, b8: at("Pero") - 0.1, b9: at("UPS", 0, 41) - 0.1,
  b10: at("Y", 0, 51) - 0.1, b11: at("Pedidos,") - 0.12, b12: at("Una", 0, 64) - 0.1, b13: at("Si", 0, 66.5) - 0.12,
};
const seq = [0, T.b2, T.b3, T.b4, T.b5, T.b6, T.b7, T.b8, T.b9, T.b10, T.b11, T.b12, T.b13];
for (let i = 0; i < 12; i++) console.log(seq[i].toFixed(3), seq[i + 1].toFixed(3));
console.log(T.b13.toFixed(3), "end");
