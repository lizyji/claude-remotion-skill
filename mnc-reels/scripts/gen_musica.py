#!/usr/bin/env python3
"""Sintetiza una cama musical instrumental (lo-fi suave, sin letra) propia: libre de derechos.
Uso: python3 scripts/gen_musica.py salida.wav --dur 46 [--bpm 92]"""
import argparse, wave, numpy as np
ap = argparse.ArgumentParser(); ap.add_argument("salida"); ap.add_argument("--dur", type=float, default=46); ap.add_argument("--bpm", type=float, default=92)
a = ap.parse_args()
SR = 44100; n = int(a.dur * SR); t = np.arange(n) / SR
beat = 60 / a.bpm; bar = 4 * beat
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
# Am9 – Fmaj7 – Cmaj7 – G6 (voicings medios)
acordes = [[57, 60, 64, 67, 71], [53, 57, 60, 64, 69], [48, 55, 59, 64, 67], [55, 59, 62, 64, 71]]
bajos = [45, 41, 48, 43]
out = np.zeros(n)
def env(L, a_, r_):
    e = np.ones(L); A = min(L, int(a_ * SR)); R = min(L, int(r_ * SR))
    e[:A] = np.linspace(0, 1, A); e[-R:] *= np.linspace(1, 0, R); return e
def nota(f, ini, dur, vol, armon=(1, .35, .12)):
    i0 = int(ini * SR); L = min(int(dur * SR), n - i0)
    if L <= 0: return
    tt = np.arange(L) / SR
    w = sum(v * np.sin(2 * np.pi * f * k * tt) for k, v in enumerate(armon, 1))
    w *= env(L, 0.02, min(0.6, dur * 0.6)) * np.exp(-tt * 0.9) * (1 + 0.004 * np.sin(2 * np.pi * 5 * tt))
    out[i0:i0 + L] += vol * w
c = 0; tb = 0.0
while tb < a.dur:
    ac = acordes[c % 4]
    for k, m in enumerate(ac): nota(hz(m), tb + k * 0.012, bar * 0.95, 0.05)          # pad/piano
    for b in range(4):
        nota(hz(bajos[c % 4]), tb + b * beat, beat * 0.9, 0.11, (1, .2))                # bajo
        if b in (1, 3): nota(hz(ac[(b + c) % 5] + 12), tb + b * beat + beat / 2, beat * 0.6, 0.025)  # arpegio
    for b in range(4):  # bombo suave + hat
        i0 = int((tb + b * beat) * SR)
        if b in (0, 2) and i0 < n:
            L = min(int(0.25 * SR), n - i0); tt = np.arange(L) / SR
            out[i0:i0 + L] += 0.22 * np.sin(2 * np.pi * (50 + 60 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 14)
        for h in (0, 0.5):
            j0 = int((tb + (b + h) * beat) * SR)
            if j0 < n:
                L = min(int(0.05 * SR), n - j0)
                out[j0:j0 + L] += 0.018 * np.random.default_rng(j0).standard_normal(L) * np.exp(-np.arange(L) / SR * 90)
    tb += bar; c += 1
# suavizado (paso bajo simple) y normalización
k = np.ones(6) / 6; out = np.convolve(out, k, mode="same")
out *= 0.5 / np.max(np.abs(out))
fade = int(1.5 * SR); out[-fade:] *= np.linspace(1, 0, fade); out[:int(0.3 * SR)] *= np.linspace(0, 1, int(0.3 * SR))
st = np.stack([out, np.roll(out, 200)], 1)
with wave.open(a.salida, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype(np.int16).tobytes())
print("→", a.salida)
