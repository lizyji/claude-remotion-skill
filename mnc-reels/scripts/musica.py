#!/usr/bin/env python3
"""Plan B de música: pista instrumental ORIGINAL sintetizada (sin letra, sin derechos de terceros).

Úsala solo cuando no se pueda bajar una pista libre de derechos (Pixabay bloqueado, etc.).
Groove suave tipo lo-fi: piano eléctrico + bajo + bombo/caja/shaker discretos.

Uso:  python3 scripts/musica.py public/musica/<nombre>.wav [--dur 62] [--bpm 94] [--semilla 7]
Sale normalizada a −14 LUFS; Reel.tsx la baja ≈ −23 dB bajo la voz.
"""
import argparse, subprocess, tempfile, wave
from pathlib import Path
import numpy as np

SR = 48000


def nota(n):  # MIDI → Hz
    return 440.0 * 2 ** ((n - 69) / 12)


def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def rhodes(f, dur, vel=1.0):
    t = np.arange(int(dur * SR)) / SR
    env = np.exp(-t * 2.2) * (1 - np.exp(-t * 400))
    trem = 1 + 0.08 * np.sin(2 * np.pi * 4.5 * t)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 6) + 0.12 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t * 9)
    return vel * s * env * trem


def bajo(f, dur):
    t = np.arange(int(dur * SR)) / SR
    env = np.minimum(1, t * 60) * np.exp(-t * 1.4)
    return (np.sin(2 * np.pi * f * t) + 0.2 * np.sin(4 * np.pi * f * t)) * env


def bombo():
    t = np.arange(int(0.35 * SR)) / SR
    f = 50 + 70 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11)


def caja(rng):
    t = np.arange(int(0.25 * SR)) / SR
    n = rng.standard_normal(len(t))
    return lowpass(n, 3500) * np.exp(-t * 22) * 0.6 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * 0.3


def shaker(rng):
    t = np.arange(int(0.08 * SR)) / SR
    n = rng.standard_normal(len(t))
    n = n - lowpass(n, 5000)  # pasa-altos
    return n * np.exp(-t * 60) * (1 - np.exp(-t * 900))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("salida")
    ap.add_argument("--dur", type=float, default=62)
    ap.add_argument("--bpm", type=float, default=94)
    ap.add_argument("--semilla", type=int, default=7)
    a = ap.parse_args()
    rng = np.random.default_rng(a.semilla)

    beat = 60 / a.bpm
    N = int(a.dur * SR)
    L = np.zeros(N + SR * 2)
    R = np.zeros(N + SR * 2)

    def add(sig, t, pan=0.0, g=1.0):
        i = int(t * SR)
        j = min(len(L), i + len(sig))
        L[i:j] += sig[: j - i] * g * (1 - max(0, pan))
        R[i:j] += sig[: j - i] * g * (1 + min(0, pan))

    # Am9 – Fmaj7 – C(add9) – G6  (1 compás cada uno)
    acordes = [[57, 60, 64, 67, 71], [53, 57, 60, 64], [48, 55, 62, 64], [55, 59, 62, 64]]
    raices = [45, 41, 36, 43]
    k, s = bombo(), caja(rng)
    compas = 0
    t = 0.0
    while t < a.dur:
        c = compas % 4
        for b, vel in [(0, 1.0), (1.5, 0.55), (2.5, 0.7)]:
            for idx, n in enumerate(acordes[c]):
                add(rhodes(nota(n), beat * 2.2, vel), t + b * beat + idx * 0.012, pan=(-0.25 if idx % 2 else 0.25), g=0.09)
        add(bajo(nota(raices[c]), beat * 1.8), t, g=0.32)
        add(bajo(nota(raices[c] + 7), beat * 1.2), t + 2.5 * beat, g=0.2)
        intro = compas >= 2  # 2 compases sin batería
        if intro:
            add(k, t, g=0.45)
            add(k, t + 2.5 * beat, g=0.3)
            add(s, t + beat, g=0.18, pan=0.1)
            add(s, t + 3 * beat, g=0.18, pan=0.1)
            for e in range(8):
                add(shaker(rng), t + e * beat / 2 + (0.02 if e % 2 else 0), pan=-0.4, g=0.05 if e % 2 else 0.08)
        compas += 1
        t += 4 * beat

    mix = np.stack([L[:N], R[:N]], axis=1)
    tt = np.arange(N) / SR
    mix *= (np.minimum(1, tt / 1.0) * np.minimum(1, (a.dur - tt) / 2.0))[:, None]
    mix /= np.max(np.abs(mix)) + 1e-9
    pcm = (mix * 0.8 * 32767).astype(np.int16)

    tmp = Path(tempfile.mkdtemp()) / "m.wav"
    with wave.open(str(tmp), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    out = Path(a.salida)
    out.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(tmp), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", str(SR), str(out)], check=True)
    print(f"→ {out}")


if __name__ == "__main__":
    main()
