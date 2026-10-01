// Synthesizes the OMNA welcome bed as a 48 kHz stereo 16-bit WAV — no downloads.
// Warm, modern, quietly techy: detuned-sine pad, filtered pluck arpeggio with
// ping-pong delay, sub bass, soft kick + hats, shimmer intro and a resolving
// final chord. Bar length is stretched so the groove lands exactly on the
// outro, using the same timeline the composition reads.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const tl = JSON.parse(readFileSync(join(ROOT, "src/omna/timeline.json"), "utf8"));
const OUT = join(ROOT, "public/omna/audio");
mkdirSync(OUT, { recursive: true });

// --- timeline (mirrors src/omna/timeline.ts) ---
let t = tl.intro.frames;
for (const c of tl.clips) t += c.frames - (c.join === "fade" ? c.joinFrames : 0);
const outroStartF = t - tl.outro.fadeIn;
const FPS = tl.fps;
const GROOVE_AT = tl.intro.frames / FPS; // first downbeat = first full frame of Manuel
const OUTRO_AT = outroStartF / FPS;
const TOTAL = (outroStartF + tl.outro.frames) / FPS + 0.2;

const BARS = Math.round((OUTRO_AT - GROOVE_AT) / 2.4); // ~100 BPM
const BAR = (OUTRO_AT - GROOVE_AT) / BARS;
const BEAT = BAR / 4;

const SR = 48000;
const N = Math.ceil(TOTAL * SR);
const L = new Float32Array(N);
const R = new Float32Array(N);
const sendL = new Float32Array(N); // reverb send
const sendR = new Float32Array(N);

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const S = (sec) => Math.round(sec * SR);

// Dmaj9 – Bm9 – Gmaj9 – Asus(add9): bright, warm, unresolved until the end
const CHORDS = [
  { root: 38, pad: [50, 57, 61, 64, 66], arp: [74, 78, 81, 85, 88] },
  { root: 35, pad: [47, 54, 57, 61, 62], arp: [71, 74, 78, 81, 85] },
  { root: 31, pad: [43, 50, 54, 57, 59], arp: [67, 71, 74, 78, 83] },
  { root: 33, pad: [45, 52, 59, 62, 64], arp: [69, 74, 76, 81, 83] },
];
const CHORD_BARS = 2;
const chordAt = (sec) => {
  const bar = Math.floor(Math.max(0, sec - GROOVE_AT) / BAR);
  return CHORDS[Math.floor(bar / CHORD_BARS) % CHORDS.length];
};

function add(i, l, r, send = 0.25) {
  if (i < 0 || i >= N) return;
  L[i] += l;
  R[i] += r;
  sendL[i] += l * send;
  sendR[i] += r * send;
}

// ---------- pad: band-limited detuned saw-ish stacks, slow swells ----------
function padNote(m, t0, t1, gain) {
  const att = 1.4, rel = 1.8;
  const i0 = S(t0), i1 = Math.min(N, S(t1 + rel));
  const base = mtof(m);
  const det = [-0.0045, 0, 0.0045];
  const ph = det.map(() => Math.random() * Math.PI * 2);
  for (let i = i0; i < i1; i++) {
    const tt = (i - i0) / SR;
    const env =
      Math.min(1, tt / att) ** 2 *
      (i / SR > t1 ? Math.max(0, 1 - (i / SR - t1) / rel) ** 2 : 1);
    if (env <= 0) continue;
    let sl = 0, sr = 0;
    for (let d = 0; d < 3; d++) {
      const f = base * (1 + det[d]);
      const w = 2 * Math.PI * f * tt + ph[d];
      // first 5 harmonics, 1/n^1.6 rolloff = soft, filtered saw
      let v = 0;
      for (let h = 1; h <= 5; h++) v += Math.sin(w * h) / Math.pow(h, 1.6);
      if (d === 0) sl += v; else if (d === 2) sr += v; else { sl += v * 0.7; sr += v * 0.7; }
    }
    const breathe = 0.85 + 0.15 * Math.sin(2 * Math.PI * 0.11 * (i / SR));
    add(i, sl * env * gain * breathe, sr * env * gain * breathe, 0.5);
  }
}

// ---------- pluck: sine + octave with fast decay ----------
function pluck(m, t0, gain, pan) {
  const dur = 0.55;
  const i0 = S(t0), i1 = Math.min(N, S(t0 + dur));
  const f = mtof(m);
  for (let i = i0; i < i1; i++) {
    const tt = (i - i0) / SR;
    const env = Math.min(1, tt / 0.004) * Math.exp(-tt * 7.5);
    const v = (Math.sin(2 * Math.PI * f * tt) + 0.35 * Math.sin(4 * Math.PI * f * tt) * Math.exp(-tt * 14)) * env * gain;
    add(i, v * (1 - pan), v * (1 + pan), 0.35);
  }
}

// ---------- sub bass ----------
function bass(m, t0, dur, gain) {
  const i0 = S(t0), i1 = Math.min(N, S(t0 + dur));
  const f = mtof(m);
  for (let i = i0; i < i1; i++) {
    const tt = (i - i0) / SR;
    const env = Math.min(1, tt / 0.012) * Math.exp(-tt * 2.2) * Math.min(1, (t0 + dur - i / SR) / 0.05);
    const v = (Math.sin(2 * Math.PI * f * tt) + 0.18 * Math.sin(4 * Math.PI * f * tt)) * env * gain;
    add(i, v, v, 0.02);
  }
}

// ---------- kick / hat ----------
function kick(t0, gain) {
  const i0 = S(t0), i1 = Math.min(N, S(t0 + 0.32));
  let ph = 0;
  for (let i = i0; i < i1; i++) {
    const tt = (i - i0) / SR;
    const f = 44 + 80 * Math.exp(-tt * 28);
    ph += (2 * Math.PI * f) / SR;
    const v = Math.sin(ph) * Math.exp(-tt * 9) * gain;
    add(i, v, v, 0.0);
  }
}
let hp = 0, prev = 0;
function hat(t0, gain, pan) {
  const i0 = S(t0), i1 = Math.min(N, S(t0 + 0.06));
  for (let i = i0; i < i1; i++) {
    const tt = (i - i0) / SR;
    const n = Math.random() * 2 - 1;
    hp = 0.92 * (hp + n - prev); // one-pole highpass
    prev = n;
    const v = hp * Math.exp(-tt * 70) * gain;
    add(i, v * (1 - pan), v * (1 + pan), 0.15);
  }
}

// ---------- shimmer + riser for the brand open ----------
function shimmer(t0, t1, gain) {
  const notes = [86, 90, 93];
  for (let i = S(t0); i < Math.min(N, S(t1)); i++) {
    const tt = i / SR - t0;
    const p = tt / (t1 - t0);
    const env = Math.sin(Math.PI * Math.min(1, p)) ** 2;
    let v = 0;
    notes.forEach((m, k) => (v += Math.sin(2 * Math.PI * mtof(m) * tt + k) * (0.6 + 0.4 * Math.sin(tt * 3 + k))));
    add(i, v * env * gain, v * env * gain * 0.9, 0.9);
  }
}
function riser(t0, t1, gain) {
  let lp = 0;
  for (let i = S(t0); i < Math.min(N, S(t1)); i++) {
    const p = (i / SR - t0) / (t1 - t0);
    const c = 0.01 + 0.25 * p * p;
    lp += c * (Math.random() * 2 - 1 - lp);
    const v = lp * p * p * gain;
    add(i, v, v, 0.8);
  }
}

// ================= arrangement =================
// Intro: pad swell + shimmer + riser into the first downbeat
padNote(CHORDS[3].pad[0], 0, GROOVE_AT, 0.05);
CHORDS[3].pad.slice(1).forEach((m) => padNote(m, 0.1, GROOVE_AT, 0.045));
shimmer(0, GROOVE_AT + 0.6, 0.02);
riser(GROOVE_AT - 1.2, GROOVE_AT, 0.14);

// Body: chord every 2 bars
for (let b = 0; b < BARS; b += CHORD_BARS) {
  const t0 = GROOVE_AT + b * BAR;
  const ch = chordAt(t0 + 0.01);
  ch.pad.forEach((m) => padNote(m, t0, t0 + CHORD_BARS * BAR, 0.016));
  for (let k = 0; k < CHORD_BARS * 4; k++) bass(ch.root, t0 + k * BEAT, BEAT * 0.9, k % 4 === 0 ? 0.32 : 0.2);
}
// Arp — 8ths, gentle pattern, enters on bar 1
const PATTERN = [0, 2, 1, 3, 2, 4, 3, 1];
for (let e = 0; e < BARS * 8; e++) {
  const t0 = GROOVE_AT + e * (BEAT / 2);
  const ch = chordAt(t0 + 0.001);
  const m = ch.arp[PATTERN[e % 8]];
  const accent = e % 2 === 0 ? 1 : 0.7;
  pluck(m, t0, 0.07 * accent, e % 2 === 0 ? -0.35 : 0.35);
}
// Drums — soft kick on 1 & 3, hats on offbeat 8ths; held back for the first 2 bars
for (let q = 0; q < BARS * 4; q++) {
  const t0 = GROOVE_AT + q * BEAT;
  if (q % 2 === 0 && q >= 8) kick(t0, 0.5);
  if (q >= 4) hat(t0 + BEAT / 2, 0.11, q % 2 ? 0.3 : -0.3);
  if (q >= 16 && q % 4 === 3) hat(t0 + BEAT * 0.75, 0.06, 0);
}
// Outro: resolve to D (add9) with a soft kick + long tail
kick(OUTRO_AT, 0.55);
bass(38, OUTRO_AT, 2.6, 0.38);
[50, 57, 62, 64, 66, 69].forEach((m) => padNote(m, OUTRO_AT, TOTAL - 1.6, 0.017));
[74, 78, 81, 86].forEach((m, k) => pluck(m, OUTRO_AT + k * (BEAT / 2), 0.08, k % 2 ? 0.4 : -0.4));
shimmer(OUTRO_AT, TOTAL, 0.008);

// ================= fx =================
// ping-pong delay on the whole sends (3/16 note), then a small Schroeder reverb
const D = S(BEAT * 0.75);
for (let i = D; i < N; i++) {
  sendL[i] += sendR[i - D] * 0.32;
  sendR[i] += sendL[i - D] * 0.32;
}
function reverb(x) {
  const out = new Float32Array(N);
  const combs = [1557, 1617, 1491, 1422].map((d) => ({ d: Math.round((d * SR) / 44100), b: new Float32Array(Math.round((d * SR) / 44100)), i: 0, lp: 0 }));
  const aps = [225, 556].map((d) => ({ d: Math.round((d * SR) / 44100), b: new Float32Array(Math.round((d * SR) / 44100)), i: 0 }));
  for (let n = 0; n < N; n++) {
    let s = 0;
    for (const c of combs) {
      const y = c.b[c.i];
      c.lp = y * 0.6 + c.lp * 0.4;
      c.b[c.i] = x[n] + c.lp * 0.84;
      c.i = (c.i + 1) % c.d;
      s += y;
    }
    for (const a of aps) {
      const y = a.b[a.i];
      a.b[a.i] = s + y * 0.5;
      a.i = (a.i + 1) % a.d;
      s = y - s * 0.5;
    }
    out[n] = s * 0.25;
  }
  return out;
}
const rvL = reverb(sendL);
const rvR = reverb(sendR);
for (let i = 0; i < N; i++) {
  L[i] += rvL[i] * 0.55;
  R[i] += rvR[i] * 0.55;
}

// master: gentle tanh glue, fade out tail, normalize to -3 dBFS
let peak = 0;
for (let i = 0; i < N; i++) {
  const fade = Math.min(1, (TOTAL - i / SR) / 1.4);
  L[i] = Math.tanh(L[i] * 1.2) * Math.max(0, fade);
  R[i] = Math.tanh(R[i] * 1.2) * Math.max(0, fade);
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const g = 0.708 / peak;

const buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0);
buf.writeUInt32LE(36 + N * 4, 4);
buf.write("WAVE", 8);
buf.write("fmt ", 12);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write("data", 36);
buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * g)) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * g)) * 32767), 46 + i * 4);
}
writeFileSync(join(OUT, "music.wav"), buf);
console.log(
  `music.wav: ${TOTAL.toFixed(2)}s, ${BARS} bars @ ${(240 / BAR).toFixed(1)} BPM, groove ${GROOVE_AT.toFixed(2)}s, outro ${OUTRO_AT.toFixed(2)}s`,
);
