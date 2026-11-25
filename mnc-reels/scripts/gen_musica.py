#!/usr/bin/env python3
"""Sintetiza una cama musical instrumental (sin letra, 100% propia → libre de derechos).

Pad suave + bajo + kick/hat discretos, progresión Am–F–C–G, ~100 bpm.
Uso:  python3 scripts/gen_musica.py public/reels/<slug>/musica.wav --seg 60
"""
import argparse, wave
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument("salida")
ap.add_argument("--seg", type=float, default=60)
ap.add_argument("--bpm", type=float, default=100)
a = ap.parse_args()
SR = 48000
n = int(a.seg * SR)
t = np.arange(n) / SR
beat = 60 / a.bpm
bar = beat * 4
nota = lambda m: 440 * 2 ** ((m - 69) / 12)
ACORDES = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G
BAJOS = [45, 41, 36, 43]
L = np.zeros(n); R = np.zeros(n)
rng = np.random.default_rng(7)

for k in range(int(a.seg / bar) + 1):
    t0 = k * bar; i0 = int(t0 * SR); i1 = min(n, int((t0 + bar) * SR))
    if i0 >= n: break
    tt = t[i0:i1] - t0
    env = np.minimum(1, tt / 0.6) * np.minimum(1, (bar - tt) / 0.5)
    ch = ACORDES[k % 4]
    for j, m in enumerate(ch):
        f = nota(m + 12)
        v = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2 * f * tt) + 0.12 * np.sin(2 * np.pi * 3 * f * tt)) * env * 0.05
        det = np.sin(2 * np.pi * (f * 1.004) * tt) * env * 0.03
        L[i0:i1] += v + (det if j % 2 else 0); R[i0:i1] += v + (0 if j % 2 else det)
    # arpegio suave en corcheas
    for s in range(8):
        a0 = i0 + int(s * beat / 2 * SR); a1 = min(n, a0 + int(0.4 * SR))
        if a0 >= n: break
        ta = t[a0:a1] - t[a0]
        f = nota(ch[[0, 1, 2, 1][s % 4]] + 24)
        v = np.sin(2 * np.pi * f * ta) * np.exp(-ta * 7) * 0.035
        (L if s % 2 else R)[a0:a1] += v; (R if s % 2 else L)[a0:a1] += v * 0.5
    # bajo
    fb = nota(BAJOS[k % 4])
    for s in range(4):
        b0 = i0 + int(s * beat * SR); b1 = min(n, b0 + int(beat * 0.9 * SR))
        if b0 >= n: break
        tb = t[b0:b1] - t[b0]
        v = np.sin(2 * np.pi * fb * tb) * np.exp(-tb * 2.5) * 0.12
        L[b0:b1] += v; R[b0:b1] += v
# kick (1 y 3) + hat (contratiempos)
for s in range(int(a.seg / beat) + 1):
    k0 = int(s * beat * SR)
    if k0 >= n: break
    if s % 2 == 0:
        k1 = min(n, k0 + int(0.25 * SR)); tk = t[k0:k1] - t[k0]
        v = np.sin(2 * np.pi * (50 + 70 * np.exp(-tk * 30)) * tk) * np.exp(-tk * 14) * 0.22
        L[k0:k1] += v; R[k0:k1] += v
    h0 = k0 + int(beat / 2 * SR); h1 = min(n, h0 + int(0.05 * SR))
    if h0 < n:
        th = t[h0:h1] - t[h0]
        v = rng.standard_normal(h1 - h0) * np.exp(-th * 90) * 0.03
        v = np.diff(np.concatenate([[0], v]))  # agudo
        L[h0:h1] += v; R[h0:h1] += v * 0.8
st = np.stack([L, R], 1)
st /= np.abs(st).max() / 0.8
fade = np.minimum(1, np.minimum(t / 1.0, (a.seg - t) / 2.0))[:, None]
st *= fade
with wave.open(a.salida, "w") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype(np.int16).tobytes())
print("→", a.salida)
