// Prints the B-roll windows of Mnc10Reel (same at() rules as captionsCore) — keep in sync with T/ROLLS in Mnc10Reel.tsx.
import fs from "fs";
const W = JSON.parse(fs.readFileSync(new URL("../src/mnc10/words.json", import.meta.url)));
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9áéíóúñü]/g, "");
const at = (w, nth = 0, after = 0) => W.filter((x) => norm(x.w) === norm(w) && x.s >= after)[nth].s;
const T = {
  b2: at("tu", 0, 3) - 0.1, b3: at("Gong,") - 0.1, b4: at("revisó") - 0.1, sSales: at("que", 0, 13.8) - 0.1,
  b5: at("más", 0, 16) - 0.1, sNotes: at("Entonces,") - 0.1, b6: at("hasta") - 0.1, b7: at("Dos,", 0, 22) - 0.1,
  b8: at("Tres,") - 0.1, b9: at("Y", 0, 30.5) - 0.1, b10: at("Pero") - 0.1, b11: at("El", 0, 37.5) - 0.1,
  sTyping: at("Le") - 0.1, b12: at("Y", 0, 49) - 0.1, sTeam: at("¿qué", 0, 51.5) - 0.1, b13: at("Y", 0, 54.5) - 0.05,
  b14: at("Si") - 0.12,
};
const seq = [0, T.b2, T.b3, T.b4, T.sSales, T.b5, T.sNotes, T.b6, T.b7, T.b8, T.b9, T.b10, T.b11, T.sTyping, T.b12, T.sTeam, T.b13, T.b14];
for (let i = 0; i < seq.length - 1; i++) console.log(seq[i].toFixed(3), seq[i + 1].toFixed(3));
console.log(T.b14.toFixed(3), "end");
