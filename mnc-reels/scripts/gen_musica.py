#!/usr/bin/env python3
"""Sintetiza una pista instrumental original (sin letra, libre de derechos) para el fondo del reel.

Uso:  python3 scripts/gen_musica.py public/reels/<slug>/musica.wav [--seg 60] [--bpm 100]
Pad suave de acordes (Am–F–C–G), bajo, bombo suave y shaker. El volumen final lo controla Reel.tsx.
"""
import argparse, wave
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument("salida")
ap.add_argument("--seg", type=float, default=60)
ap.add_argument("--bpm", type=float, default=100)
a = ap.parse_args()

SR = 44100
n = int(a.seg * SR)
t = np.arange(n) / SR
beat = 60 / a.bpm
bar = beat * 4
mix = np.zeros(n)
rng = np.random.default_rng(7)

nota = lambda m: 440 * 2 ** ((m - 69) / 12)
acordes = [[57, 60, 64], [53, 57, 60], [48, 55, 60, 64], [55, 59, 62]]  # Am F C G
bajos = [45, 41, 36, 43]


def env(L, att, rel):
    e = np.ones(L)
    ka, kr = int(att * SR), int(rel * SR)
    e[:ka] = np.linspace(0, 1, ka)
    e[-kr:] *= np.linspace(1, 0, kr)
    return e


nbars = int(np.ceil(a.seg / bar))
for b in range(nbars):
    i0 = int(b * bar * SR)
    L = min(int(bar * SR), n - i0)
    if L <= 0:
        break
    tt = np.arange(L) / SR
    ac = acordes[b % 4]
    pad = sum(np.sin(2 * np.pi * nota(m) * tt) + 0.3 * np.sin(2 * np.pi * nota(m) * 2.001 * tt) for m in ac) / len(ac)
    mix[i0:i0 + L] += 0.22 * pad * env(L, 0.4, 0.5)
    # arpegio suave en corcheas
    for k in range(8):
        j0 = i0 + int(k * beat / 2 * SR)
        Lk = min(int(beat / 2 * SR), n - j0)
        if Lk <= 0:
            continue
        tk = np.arange(Lk) / SR
        f = nota(ac[k % len(ac)] + 12)
        mix[j0:j0 + Lk] += 0.08 * np.sin(2 * np.pi * f * tk) * np.exp(-tk * 6)
    # bajo
    for k in range(4):
        j0 = i0 + int(k * beat * SR)
        Lk = min(int(beat * SR), n - j0)
        if Lk <= 0:
            continue
        tk = np.arange(Lk) / SR
        mix[j0:j0 + Lk] += 0.25 * np.sin(2 * np.pi * nota(bajos[b % 4]) * tk) * np.exp(-tk * 3)

# bombo en 1 y 3, shaker en corcheas
for k in range(int(a.seg / beat)):
    j0 = int(k * beat * SR)
    if k % 2 == 0:
        Lk = min(int(0.25 * SR), n - j0)
        tk = np.arange(Lk) / SR
        mix[j0:j0 + Lk] += 0.45 * np.sin(2 * np.pi * (50 + 80 * np.exp(-tk * 30)) * tk) * np.exp(-tk * 14)
    for h in (0, 0.5):
        j1 = int((k + h) * beat * SR)
        Lh = min(int(0.05 * SR), n - j1)
        if Lh > 0:
            mix[j1:j1 + Lh] += 0.035 * rng.standard_normal(Lh) * np.exp(-np.arange(Lh) / SR * 80)

mix /= np.max(np.abs(mix)) * 1.12
fade = int(1.5 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)
with wave.open(a.salida, "w") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print(f"→ {a.salida}")
