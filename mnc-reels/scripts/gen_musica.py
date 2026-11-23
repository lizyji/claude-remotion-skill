#!/usr/bin/env python3
"""Música instrumental original (sintetizada aquí, sin letra, libre de derechos) para un reel.

Pulso tech suave: bombo ligero, hi-hat, bajo y acordes tipo pad (Am – F – C – G).
Uso:  python3 scripts/gen_musica.py public/reels/<slug>/musica.wav [--seg 50] [--bpm 104]
"""
import argparse, wave
import numpy as np

SR = 48000
ap = argparse.ArgumentParser()
ap.add_argument("salida")
ap.add_argument("--seg", type=float, default=50)
ap.add_argument("--bpm", type=float, default=104)
a = ap.parse_args()

n = int(a.seg * SR)
L = np.zeros(n)
R = np.zeros(n)
beat = 60 / a.bpm
rng = np.random.default_rng(3)
f = lambda midi: 440 * 2 ** ((midi - 69) / 12)

def env(dur, at=0.005, rel=0.1):
    t = np.arange(int(dur * SR)) / SR
    e = np.minimum(1, t / at) * np.exp(-t / rel)
    return t, e

def add(buf, start, sig, pan=0.0):
    i = int(start * SR)
    if i >= n:
        return
    sig = sig[: n - i]
    L[i : i + len(sig)] += sig * (1 - pan) / 2 * 2 ** 0.5
    R[i : i + len(sig)] += sig * (1 + pan) / 2 * 2 ** 0.5

# Acordes (MIDI): Am, F, C, G — 1 compás (4 tiempos) cada uno
acordes = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
bajos = [45, 41, 48, 43]
compas = 4 * beat
k = 0
t0 = 0.0
while t0 < a.seg:
    ac, bj = acordes[k % 4], bajos[k % 4]
    # pad: sierras suaves filtradas (promedio móvil) con ataque lento
    t = np.arange(int(compas * SR)) / SR
    pad = sum(np.sin(2 * np.pi * f(m) * t + 0.3 * np.sin(2 * np.pi * 0.3 * t)) + 0.3 * np.sin(4 * np.pi * f(m) * t) for m in ac)
    pad *= np.minimum(1, t / 0.4) * np.minimum(1, (compas - t) / 0.3) * 0.05
    add(L, t0, pad, -0.3)
    add(R, t0, pad * 0.9, 0.3)
    # arpegio pluck en corcheas
    for c in range(8):
        m = ac[[0, 1, 2, 1, 0, 2, 1, 2][c]] + 12
        tt, e = env(beat / 2 * 0.95, 0.003, 0.12)
        add(L, t0 + c * beat / 2, np.sin(2 * np.pi * f(m) * tt) * e * 0.045, 0.4 if c % 2 else -0.4)
    for b in range(4):
        tb = t0 + b * beat
        # bombo
        tt, e = env(0.35, 0.002, 0.09)
        kick = np.sin(2 * np.pi * (50 + 90 * np.exp(-tt * 30)) * tt) * e * 0.33
        add(L, tb, kick)
        # bajo
        tt, e = env(beat * 0.9, 0.01, 0.3)
        add(L, tb, (np.sin(2 * np.pi * f(bj) * tt) + 0.25 * np.sin(4 * np.pi * f(bj) * tt)) * e * 0.12)
        # hi-hat a contratiempo
        tt, e = env(0.06, 0.001, 0.015)
        add(L, tb + beat / 2, np.diff(rng.standard_normal(len(tt) + 1)) * e * 0.035, 0.2)
        # clap suave en 2 y 4
        if b % 2:
            tt, e = env(0.15, 0.001, 0.05)
            add(L, tb, rng.standard_normal(len(tt)) * e * 0.05)
    t0 += compas
    k += 1

st = np.stack([L, R], 1)
st /= np.abs(st).max() / 0.7
fade = int(0.5 * SR)
st[:fade] *= np.linspace(0, 1, fade)[:, None]
st[-fade:] *= np.linspace(1, 0, fade)[:, None]
with wave.open(a.salida, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((st * 32767).astype(np.int16).tobytes())
print(f"→ {a.salida}")
