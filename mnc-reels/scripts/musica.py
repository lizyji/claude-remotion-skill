#!/usr/bin/env python3
"""Genera una base instrumental original (libre de derechos por construcción): 104 BPM,
acordes suaves Am–F–C–G, bajo, bombo, hi-hat y un arpegio de pluck. Sin letra.

Uso: python3 scripts/musica.py public/reels/<slug>/musica.wav --dur 80
"""
import argparse, wave
import numpy as np

SR = 44100

def nota(m):
    return 440.0 * 2 ** ((m - 69) / 12)

def env(n, a=0.01, r=0.3):
    t = np.arange(n) / SR
    e = np.minimum(1, t / a) * np.exp(-t / r)
    return e

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("salida"); ap.add_argument("--dur", type=float, default=80)
    a = ap.parse_args()
    bpm = 104; beat = 60 / bpm; bar = 4 * beat
    N = int(a.dur * SR) + SR
    out = np.zeros((N, 2))
    rng = np.random.default_rng(7)
    acordes = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G
    nbar = int(a.dur / bar) + 1
    def add(sig, t0, pan=0.0):
        i = int(t0 * SR); j = min(N, i + len(sig))
        if i >= N: return
        out[i:j, 0] += sig[: j - i] * (1 - pan) ; out[i:j, 1] += sig[: j - i] * (1 + pan)
    for b in range(nbar):
        ch = acordes[b % 4]; t0 = b * bar
        # pad suave (seno + 2º armónico, ataque lento)
        n = int(bar * SR); t = np.arange(n) / SR
        e = np.minimum(1, t / 0.4) * np.minimum(1, (bar - t) / 0.3)
        pad = sum(np.sin(2 * np.pi * nota(m) * t) + 0.25 * np.sin(4 * np.pi * nota(m) * t) for m in ch) * e * 0.05
        add(pad, t0)
        # bajo
        for k in range(4):
            n = int(beat * SR); t = np.arange(n) / SR
            add(np.sin(2 * np.pi * nota(ch[0] - 24) * t) * env(n, 0.005, 0.25) * 0.22, t0 + k * beat)
        # arpegio pluck en corcheas
        arp = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[1] + 12, ch[0] + 24, ch[2] + 12, ch[1] + 12, ch[2] + 12]
        for k, m in enumerate(arp):
            n = int(beat / 2 * SR * 2); t = np.arange(n) / SR
            s = (np.sin(2 * np.pi * nota(m) * t) + 0.3 * np.sin(6 * np.pi * nota(m) * t)) * env(n, 0.003, 0.12) * 0.07
            add(s, t0 + k * beat / 2, pan=0.25 if k % 2 else -0.25)
        # bombo (1 y 3), clap suave (2 y 4), hi-hat en corcheas
        for k in range(4):
            if k % 2 == 0:
                n = int(0.35 * SR); t = np.arange(n) / SR
                f = 50 + 90 * np.exp(-t / 0.04)
                add(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.12) * 0.45, t0 + k * beat)
            else:
                n = int(0.2 * SR)
                add(rng.standard_normal(n) * env(n, 0.002, 0.05) * 0.06, t0 + k * beat)
        for k in range(8):
            n = int(0.06 * SR); x = rng.standard_normal(n); x = np.diff(x, prepend=0)
            add(x * env(n, 0.001, 0.015) * (0.03 if k % 2 else 0.018), t0 + k * beat / 2, pan=0.3)
    out = out[: int(a.dur * SR)]
    fade = int(1.5 * SR); out[-fade:] *= np.linspace(1, 0, fade)[:, None]
    out /= np.max(np.abs(out)) * 1.12
    with wave.open(a.salida, "w") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((out * 32767).astype(np.int16).tobytes())
    print("→", a.salida)

if __name__ == "__main__":
    main()
