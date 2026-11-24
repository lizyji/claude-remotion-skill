#!/usr/bin/env python3
"""Sintetiza una base instrumental (sin letra, libre de derechos por construcción).

Uso:  python3 scripts/gen_musica.py public/reels/<slug>/musica.wav [--seg 52] [--bpm 96]
Pulso suave: acordes tipo piano eléctrico, bajo, bombo y hi-hat discretos.
"""
import argparse, wave
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument("salida")
ap.add_argument("--seg", type=float, default=52)
ap.add_argument("--bpm", type=float, default=96)
a = ap.parse_args()
SR = 44100
N = int(a.seg * SR)
out = np.zeros(N)
beat = 60 / a.bpm
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
rng = np.random.default_rng(7)

def add(sig, t0, gain):
    i = int(t0 * SR)
    if i >= N: return
    sig = sig[: N - i]
    out[i : i + len(sig)] += gain * sig

def keys(m, dur):
    t = np.arange(int(dur * SR)) / SR
    f = hz(m)
    s = np.sin(2*np.pi*f*t) + 0.35*np.sin(2*np.pi*2*f*t) + 0.12*np.sin(2*np.pi*3*f*t)
    env = np.minimum(1, t / 0.01) * np.exp(-t * 1.6)
    return s * env * (1 + 0.15*np.sin(2*np.pi*4.5*t))

def bass(m, dur):
    t = np.arange(int(dur * SR)) / SR
    return np.sin(2*np.pi*hz(m)*t) * np.minimum(1, t/0.005) * np.exp(-t*2.5)

def kick():
    t = np.arange(int(0.3 * SR)) / SR
    f = 110 * np.exp(-t * 25) + 45
    return np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t * 12)

def hat():
    n = rng.standard_normal(int(0.05 * SR))
    n = np.diff(n, prepend=0)
    return n * np.exp(-np.arange(len(n)) / SR * 80)

# Am7 – Fmaj7 – C – G (sexto grado, tranquila y con avance)
prog = [(57, [60, 64, 67, 69]), (53, [57, 60, 64, 65]), (48, [55, 60, 64, 67]), (55, [59, 62, 67, 71])]
compas = 4 * beat
k = 0
t = 0.0
while t < a.seg:
    raiz, acorde = prog[k % 4]
    for j, m in enumerate(acorde):
        add(keys(m, compas), t + j * 0.012, 0.11)
        add(keys(m, compas * 0.5), t + 2.5 * beat + j * 0.01, 0.05)
    add(bass(raiz - 12, beat * 1.5), t, 0.30)
    add(bass(raiz - 12, beat * 1.0), t + 2.5 * beat, 0.22)
    for b in range(4):
        add(kick(), t + b * beat, 0.35 if b % 2 == 0 else 0.22)
        add(hat(), t + b * beat + beat / 2, 0.06)
    t += compas
    k += 1

out /= np.abs(out).max() / 0.8
fade = int(1.5 * SR)
out[-fade:] *= np.linspace(1, 0, fade)
with wave.open(a.salida, "w") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
print("→", a.salida)
