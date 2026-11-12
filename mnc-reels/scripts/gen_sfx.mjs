// Synthesizes a minimal SFX kit as 16-bit mono WAVs — no external assets needed.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SR = 44100;
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "sfx");
mkdirSync(OUT, { recursive: true });

function wav(samples) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  return buf;
}

const secs = (s) => Math.round(s * SR);

// whoosh — noise burst, lowpassed, swelling then dying
{
  const N = secs(0.4);
  const out = new Float32Array(N);
  let lp = 0;
  for (let i = 0; i < N; i++) {
    const t = i / N;
    const env = Math.sin(Math.PI * Math.pow(t, 0.7)) ** 2;
    const cutoff = 0.05 + 0.25 * Math.sin(Math.PI * t); // sweep
    lp += cutoff * ((Math.random() * 2 - 1) - lp);
    out[i] = lp * env * 0.9;
  }
  writeFileSync(join(OUT, "whoosh.wav"), wav(out));
}

// pop — quick pitch-dropping sine
{
  const N = secs(0.14);
  const out = new Float32Array(N);
  let phase = 0;
  for (let i = 0; i < N; i++) {
    const t = i / N;
    const f = 700 - 380 * t;
    phase += (2 * Math.PI * f) / SR;
    out[i] = Math.sin(phase) * Math.exp(-t * 9) * 0.8;
  }
  writeFileSync(join(OUT, "pop.wav"), wav(out));
}

// tick — tiny high blip
{
  const N = secs(0.05);
  const out = new Float32Array(N);
  let phase = 0;
  for (let i = 0; i < N; i++) {
    const t = i / N;
    phase += (2 * Math.PI * 1900) / SR;
    out[i] = Math.sin(phase) * Math.exp(-t * 14) * 0.5;
  }
  writeFileSync(join(OUT, "tick.wav"), wav(out));
}

// bass hit — low sine thump
{
  const N = secs(0.45);
  const out = new Float32Array(N);
  let phase = 0;
  for (let i = 0; i < N; i++) {
    const t = i / N;
    const f = 85 - 25 * t;
    phase += (2 * Math.PI * f) / SR;
    out[i] = Math.sin(phase) * Math.exp(-t * 6) * 0.95;
  }
  writeFileSync(join(OUT, "bass.wav"), wav(out));
}

// click — short filtered noise transient
{
  const N = secs(0.03);
  const out = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const t = i / N;
    out[i] = (Math.random() * 2 - 1) * Math.exp(-t * 18) * 0.6;
  }
  writeFileSync(join(OUT, "click.wav"), wav(out));
}

// música SOLO para el demo (pad instrumental sintetizado, 70 s). En un reel real usa una
// pista instrumental libre de derechos y ponla en public/musica/.
{
  const DUR = 70;
  const N = secs(DUR);
  const out = new Float32Array(N);
  const freqs = [130.81, 196.0, 261.63, 329.63]; // C3 G3 C4 E4
  for (const f of freqs) {
    for (const d of [f / 1.0015, f * 1.0015]) {
      let phase = Math.random() * Math.PI * 2;
      for (let i = 0; i < N; i++) {
        phase += (2 * Math.PI * d) / SR;
        out[i] += Math.sin(phase);
      }
    }
  }
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const pulse = 0.75 + 0.25 * Math.sin(2 * Math.PI * (100 / 60) * t) ** 2;
    out[i] *= (0.5 / (freqs.length * 2)) * Math.min(1, t / 1.5) * Math.min(1, (DUR - t) / 2) * pulse;
  }
  writeFileSync(join(OUT, "..", "musica-demo.wav"), wav(out));
}

console.log("SFX escritos en", OUT);
