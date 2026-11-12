#!/usr/bin/env python3
"""Música instrumental propia (sintetizada aquí, sin derechos de terceros) para los reels MNC.

Lo-fi suave: acordes de piano eléctrico + bajo + bombo/hi-hat discretos, 96 bpm, sin letra.
Se normaliza a −14 LUFS; Reel.tsx la baja ≈ −23 dB bajo la voz.

Uso:  python3 scripts/gen_musica.py [--seg 62] [-o public/musica/lofi_mnc.m4a]
"""
import argparse, subprocess, tempfile, wave
from pathlib import Path
import numpy as np

SR = 44100
BPM = 96
BEAT = 60 / BPM
# Am9 – Fmaj7 – C – G(add9)  (frecuencias MIDI)
ACORDES = [[57, 60, 64, 67, 71], [53, 57, 60, 64], [48, 55, 60, 64, 67], [55, 59, 62, 69]]
BAJOS = [45, 41, 48, 43]


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


def epiano(f, dur):
    t = np.arange(int(SR * dur)) / SR
    env = np.exp(-t * 1.6) * (1 - np.exp(-t * 60))
    tono = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 4) + 0.08 * np.sin(2 * np.pi * 3 * f * t)
    trem = 1 + 0.08 * np.sin(2 * np.pi * 4.5 * t)
    return tono * env * trem


def bajo(f, dur):
    t = np.arange(int(SR * dur)) / SR
    env = np.exp(-t * 2.2) * (1 - np.exp(-t * 80))
    return (np.sin(2 * np.pi * f * t) + 0.2 * np.sin(2 * np.pi * 2 * f * t)) * env


def bombo():
    t = np.arange(int(SR * 0.35)) / SR
    f = 110 * np.exp(-t * 18) + 45
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11)


def hihat(rng):
    t = np.arange(int(SR * 0.06)) / SR
    n = rng.standard_normal(len(t))
    n = np.diff(n, prepend=0)  # pasa-altos simple
    return n * np.exp(-t * 70) * 0.25


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--seg", type=float, default=62)
    ap.add_argument("-o", "--salida", default=str(Path(__file__).resolve().parent.parent / "public" / "musica" / "lofi_mnc.m4a"))
    a = ap.parse_args()
    rng = np.random.default_rng(7)
    N = int(SR * a.seg)
    L = np.zeros(N + SR * 4)
    R = np.zeros_like(L)

    def poner(x, t, gl=1.0, gr=1.0):
        i = int(t * SR)
        L[i : i + len(x)] += x * gl
        R[i : i + len(x)] += x * gr

    compas = 4 * BEAT
    n_comp = int(a.seg / compas) + 1
    for c in range(n_comp):
        t0 = c * compas
        k = c % 4
        for j, m in enumerate(ACORDES[k]):
            pan = 0.35 + 0.3 * (j / max(1, len(ACORDES[k]) - 1))
            for golpe in (0, 2.5):  # acorde en 1 y en el "y" del 3
                poner(epiano(hz(m), compas * 0.9) * 0.10, t0 + golpe * BEAT + 0.004 * j, 1 - pan + 0.3, pan + 0.3)
        poner(bajo(hz(BAJOS[k]), BEAT * 1.8) * 0.33, t0)
        poner(bajo(hz(BAJOS[k]), BEAT * 1.2) * 0.25, t0 + 2.5 * BEAT)
        if c >= 1:  # la batería entra después del primer compás
            for b in (0, 2.5):
                poner(bombo() * 0.38, t0 + b * BEAT)
            for h in range(8):
                swing = 0.03 if h % 2 else 0
                poner(hihat(rng) * (0.9 if h % 2 else 0.6), t0 + (h * 0.5 + swing) * BEAT, 0.8, 1.0)

    mezcla = np.stack([L[:N], R[:N]], 1)
    # entrada/salida suaves
    fade = int(SR * 1.5)
    mezcla[:fade] *= np.linspace(0, 1, fade)[:, None]
    mezcla[-fade:] *= np.linspace(1, 0, fade)[:, None]
    mezcla /= np.abs(mezcla).max() * 1.05

    tmp = Path(tempfile.mkdtemp()) / "m.wav"
    with wave.open(str(tmp), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((mezcla * 32767).astype(np.int16).tobytes())
    out = Path(a.salida)
    out.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(tmp), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "44100", "-c:a", "aac", "-b:a", "160k", str(out)], check=True)
    print(f"→ {out}")


if __name__ == "__main__":
    main()
