#!/usr/bin/env python3
"""Pista instrumental original (sin letra, sin derechos de terceros) para fondo de reels.

Tech/lo-fi tranquilo: acordes suaves + bajo + hi-hat y bombo ligeros, 100 BPM.
Uso:  python3 scripts/gen_musica.py public/reels/<slug>/musica.wav [--seg 55] [--seed 7]
"""
import argparse, wave
import numpy as np

SR = 44100


def env(n, a=0.01, r=0.3):
    t = np.arange(n) / SR
    e = np.minimum(1, t / a) * np.exp(-t / r)
    return e


def nota(f, n, tipo="pad"):
    t = np.arange(n) / SR
    if tipo == "pad":
        s = sum(np.sin(2 * np.pi * f * k * t) / k ** 1.6 for k in (1, 2, 3))
        s *= np.minimum(1, t / 0.25) * np.minimum(1, (n / SR - t) / 0.35).clip(0)
        return s * 0.16
    if tipo == "bajo":
        return np.sin(2 * np.pi * f * t) * env(n, 0.005, 0.5) * 0.35
    if tipo == "pluck":
        return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * env(n, 0.003, 0.18) * 0.12


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("salida")
    ap.add_argument("--seg", type=float, default=55)
    ap.add_argument("--seed", type=int, default=7)
    a = ap.parse_args()
    rng = np.random.default_rng(a.seed)
    bpm = 100
    beat = 60 / bpm
    total = int(a.seg * SR)
    mix = np.zeros(total + SR * 2)

    hz = lambda m: 440 * 2 ** ((m - 69) / 12)
    # Am – F – C – G (acordes en MIDI)
    acordes = [[57, 60, 64], [53, 57, 60], [48, 55, 64], [55, 59, 62]]
    bajos = [45, 41, 48, 43]
    compas = int(4 * beat * SR)
    k = 0
    pos = 0
    while pos < total:
        ac, bj = acordes[k % 4], bajos[k % 4]
        for m in ac:
            mix[pos:pos + compas] += nota(hz(m), compas, "pad")
        for b in range(4):
            p = pos + int(b * beat * SR)
            n = int(beat * SR)
            mix[p:p + n] += nota(hz(bj - 12 if b % 2 else bj), n, "bajo")
            # bombo en 1 y 3, hi-hat en corcheas
            if b in (0, 2):
                t = np.arange(int(0.25 * SR)) / SR
                mix[p:p + len(t)] += np.sin(2 * np.pi * (50 + 90 * np.exp(-t * 30)) * t) * np.exp(-t * 14) * 0.45
            for h in (0, 0.5):
                q = p + int(h * beat * SR)
                ln = int(0.05 * SR)
                mix[q:q + ln] += rng.standard_normal(ln) * np.exp(-np.arange(ln) / SR * 80) * (0.05 if h else 0.03)
        # arpegio suave en la segunda mitad de cada compás
        for i, m in enumerate(ac + [ac[0] + 12]):
            p = pos + int((2 + i * 0.5) * beat * SR)
            n = int(0.5 * SR)
            mix[p:p + n] += nota(hz(m + 12), n, "pluck")
        pos += compas
        k += 1

    mix = mix[:total]
    # fundido de entrada/salida y normalización
    f = int(0.8 * SR)
    mix[:f] *= np.linspace(0, 1, f)
    mix[-f * 2:] *= np.linspace(1, 0, f * 2)
    mix = mix / np.max(np.abs(mix)) * 0.7
    est = np.stack([mix, np.roll(mix, int(0.012 * SR)) * 0.95], axis=1)
    with wave.open(a.salida, "w") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((est * 32767).astype(np.int16).tobytes())
    print(f"→ {a.salida}")


if __name__ == "__main__":
    main()
