import words from "./words.json";

// Splits the verbatim, word-timed transcript into subtitle chunks that follow
// the voice: break on punctuation, never more than MAX_WORDS / MAX_CHARS
// (two lines at caption size), and never hold a chunk past the next one.
export type Word = { w: string; s: number; e: number; hl?: boolean };
export type Chunk = { from: number; to: number; words: Word[] };

const MAX_WORDS = 6;
const MAX_CHARS = 32;
const MAX_MERGED = 40; // two lines at caption size
const MIN_DUR = 0.55; // s
const W = words as Word[];

// Concepts that get the orange accent (1 per chunk, multi-word phrases first).
const KEYWORDS: string[][] = [
  ["memoria", "compartida"],
  ["google", "maps"],
  ["flujos", "con", "ia"],
  ["agentes", "internos"],
  ["inteligencia", "artificial"],
  ["dashboard"],
  ["whatsapp"],
  ["crm"],
  ["leads"],
  ["rutear"],
  ["automatizaciones"],
  ["automatizar"],
  ["agentes"],
  ["apps"],
  ["zapier"],
  ["análisis"],
  ["cerebro"],
  ["pronóstico"],
  ["planeación"],
  ["conciliar"],
  ["alertas"],
  ["ficha"],
  ["cotizadores"],
  ["programación"],
  ["ia"],
  ["profundidad"],
];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9áéíóúñü]/g, "");

const highlight = (ws: Word[]): Word[] => {
  const n = ws.map((x) => norm(x.w));
  for (const k of KEYWORDS) {
    for (let i = 0; i + k.length <= n.length; i++) {
      if (k.every((t, j) => n[i + j] === t)) {
        return ws.map((x, j) => ({ ...x, hl: j >= i && j < i + k.length }));
      }
    }
  }
  return ws;
};

// words a line should never end on (articles, prepositions, conjunctions)
const WEAK = new Set(
  "un una el la los las de del a al en con por para que y o tu tus su sus mi te se lo le me este esta esos como sobre entre desde muy más".split(" "),
);
const len = (ws: Word[]) => ws.map((x) => x.w).join(" ").length;
const insideKeyword = (ws: Word[], i: number) => {
  // true when a split before ws[i] would cut a multi-word keyword in half
  const n = ws.map((x) => norm(x.w));
  return KEYWORDS.some((k) => {
    if (k.length < 2) return false;
    for (let a = 0; a + k.length <= n.length; a++) {
      if (k.every((t, j) => n[a + j] === t) && i > a && i < a + k.length) return true;
    }
    return false;
  });
};

// recursively split a clause at the most balanced "strong" boundary
const splitClause = (ws: Word[]): Word[][] => {
  if (len(ws) <= MAX_CHARS && ws.length <= MAX_WORDS) return [ws];
  let best = -1;
  let score = Infinity;
  for (let i = 1; i < ws.length; i++) {
    if (WEAK.has(norm(ws[i - 1].w)) || insideKeyword(ws, i)) continue;
    const lonely = i === 1 || i === ws.length - 1 ? 12 : 0; // avoid one-word chunks
    const sc = Math.abs(len(ws.slice(0, i)) - len(ws.slice(i))) + lonely;
    if (sc < score) {
      score = sc;
      best = i;
    }
  }
  if (best < 0) best = Math.ceil(ws.length / 2);
  return [...splitClause(ws.slice(0, best)), ...splitClause(ws.slice(best))];
};

const build = (): Chunk[] => {
  // 1 · clauses end on punctuation or on a real pause
  const clauses: Word[][] = [];
  let cur: Word[] = [];
  W.forEach((wd, i) => {
    cur.push(wd);
    const next = W[i + 1];
    const pause = next && next.s - wd.e > 0.35 && !insideKeyword([wd, next], 1);
    if (/[.,?!:;]$/.test(wd.w) || !next || pause) {
      clauses.push(cur);
      cur = [];
    }
  });
  // 2 · join short clauses of the same sentence when they fit together
  const joined: Word[][] = [];
  for (const c of clauses) {
    const prev = joined[joined.length - 1];
    const prevEnd = prev?.[prev.length - 1];
    if (
      prev &&
      !/[.?!]$/.test(prevEnd.w) &&
      len([...prev, ...c]) <= MAX_CHARS &&
      prev.length + c.length <= MAX_WORDS &&
      (len(prev) < 16 || len(c) < 16)
    ) {
      prev.push(...c);
    } else joined.push([...c]);
  }
  // 3 · split long clauses at balanced, natural boundaries
  const split = joined.flatMap(splitClause);
  // 4 · nothing flashes by: fold chunks spoken in under MIN_DUR into a neighbour
  const dur = (ws: Word[]) => ws[ws.length - 1].e - ws[0].s;
  const chunks: Word[][] = [];
  for (let i = 0; i < split.length; i++) {
    const c = split[i];
    const prev = chunks[chunks.length - 1];
    const next = split[i + 1];
    if (dur(c) >= MIN_DUR) {
      chunks.push([...c]);
      continue;
    }
    const withPrev = prev && !/[.?!]$/.test(prev[prev.length - 1].w) ? len([...prev, ...c]) : Infinity;
    const withNext = next && !/[.?!]$/.test(c[c.length - 1].w) ? len([...c, ...next]) : Infinity;
    if (withPrev <= MAX_MERGED && withPrev <= withNext) prev.push(...c);
    else if (withNext <= MAX_MERGED) {
      split[i + 1] = [...c, ...next];
    } else chunks.push([...c]);
  }
  return chunks.map((ws, i) => {
    const nextStart = chunks[i + 1]?.[0].s ?? Infinity;
    const from = Math.max(0, ws[0].s - 0.06);
    const to = Math.min(nextStart - 0.04, ws[ws.length - 1].e + 0.45);
    return { from, to, words: highlight(ws) };
  });
};

export const CHUNKS = build();
export const WORDS = W;
// first time a word (normalized, optionally nth occurrence) is spoken
export const at = (word: string, nth = 0, after = 0): number => {
  const hits = W.filter((x) => norm(x.w) === norm(word) && x.s >= after);
  if (!hits[nth]) throw new Error(`word not found: ${word} #${nth} after ${after}`);
  return hits[nth].s;
};
