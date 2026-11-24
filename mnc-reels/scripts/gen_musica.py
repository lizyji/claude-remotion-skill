#!/usr/bin/env python3
"""Sintetiza una cama musical instrumental (sin letra, libre de derechos: generada aquí).

Lo-fi suave a 92 bpm: pad de acordes (Am–F–C–G), bajo, arpegio pulsado, bombo y hi-hat ligeros.
Uso:  python3 scripts/gen_musica.py public/reels/<slug>/musica.wav --segundos 62
"""
import argparse, wave
import numpy as np

SR = 44100
ap = argparse.ArgumentParser()
ap.add_argument("salida")
ap.add_argument("--segundos", type=float, default=62)
ap.add_argument("--bpm", type=float, default=92)
a = ap.parse_args()

N = int(a.segundos * SR)
t = np.arange(N) / SR
beat = 60 / a.bpm
bar = beat * 4
out = np.zeros(N)
rng = np.random.default_rng(7)

def nota(m):
    return 440 * 2 ** ((m - 69) / 12)

# Am, F, C, G (midi)
ACORDES = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
BAJOS = [45, 41, 48, 43]

def env(n, a_, r_):
    e = np.ones(n)
    na, nr = int(a_ * SR), int(r_ * SR)
    e[:na] = np.linspace(0, 1, na)
    e[-nr:] *= np.linspace(1, 0, nr)
    return e

def poner(sig, ini):
    i = int(ini * SR)
    if i >= N:
        return
    j = min(N, i + len(sig))
    out[i:j] += sig[: j - i]

nbar = int(a.segundos / bar) + 1
for b in range(nbar):
    k = b % 4
    t0 = b * bar
    n = int(bar * SR * 1.05)
    tt = np.arange(n) / SR
    # pad: senos ligeramente desafinados
    pad = sum(np.sin(2 * np.pi * nota(m) * tt) + 0.5 * np.sin(2 * np.pi * nota(m) * 1.003 * tt) for m in ACORDES[k])
    poner(0.05 * pad * env(n, 0.4, 0.5), t0)
    # bajo
    nb = int(beat * 2 * SR)
    tb = np.arange(nb) / SR
    bajo = np.sin(2 * np.pi * nota(BAJOS[k]) * tb) * np.exp(-tb * 2.5)
    poner(0.22 * bajo, t0)
    poner(0.18 * bajo, t0 + beat * 2)
    # arpegio en corcheas
    for s in range(8):
        m = ACORDES[k][s % 3] + 12
        na = int(beat * 0.5 * SR)
        ta = np.arange(na) / SR
        pl = (np.sin(2 * np.pi * nota(m) * ta) + 0.3 * np.sin(4 * np.pi * nota(m) * ta)) * np.exp(-ta * 9)
        poner(0.06 * pl, t0 + s * beat / 2)
    # batería
    for q in range(4):
        tq = t0 + q * beat
        if q in (0, 2):
            nk = int(0.25 * SR)
            tk = np.arange(nk) / SR
            f = 110 * np.exp(-tk * 18) + 45
            kick = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tk * 12)
            poner(0.35 * kick, tq)
        else:
            ns = int(0.18 * SR)
            snare = rng.standard_normal(ns) * np.exp(-np.arange(ns) / SR * 25)
            poner(0.06 * snare, tq)
        for h in (0, 0.5):
            nh = int(0.04 * SR)
            hat = np.diff(rng.standard_normal(nh + 1)) * np.exp(-np.arange(nh) / SR * 90)
            poner(0.025 * hat, tq + h * beat)

# suavizado (paso bajo simple) y fade in/out
out = np.convolve(out, np.ones(4) / 4, mode="same")
out *= env(N, 1.0, 2.5)
out /= np.max(np.abs(out)) / 0.8
pcm = (np.stack([out, out], 1) * 32767).astype(np.int16)
with wave.open(a.salida, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("→", a.salida)
