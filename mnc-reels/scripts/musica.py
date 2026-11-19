#!/usr/bin/env python3
"""Sintetiza una base instrumental original (sin letra, libre de derechos) para un reel.

Uso: python3 scripts/musica.py public/reels/<slug>/musica.wav --segundos 54 [--bpm 100]
Pad suave + arpegio + bombo/hi-hat discretos. Progresión Am–F–C–G.
"""
import argparse, wave
import numpy as np

SR = 44100


def nota(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def env(n, a, r):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na)
    e[-nr:] *= np.linspace(1, 0, nr)
    return e


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("salida")
    ap.add_argument("--segundos", type=float, default=54)
    ap.add_argument("--bpm", type=float, default=100)
    a = ap.parse_args()
    N = int(a.segundos * SR)
    out = np.zeros(N)
    beat = 60 / a.bpm
    compas = 4 * beat
    acordes = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G
    t_all = np.arange(N) / SR
    k = 0
    t0 = 0.0
    rng = np.random.default_rng(7)
    while t0 < a.segundos:
        ac = acordes[k % 4]
        i0, i1 = int(t0 * SR), min(N, int((t0 + compas) * SR))
        n = i1 - i0
        t = np.arange(n) / SR
        # pad
        pad = sum(np.sin(2 * np.pi * nota(m) * t) + 0.3 * np.sin(2 * np.pi * nota(m) * 2.003 * t) for m in ac)
        out[i0:i1] += 0.05 * pad * env(n, 0.4, 0.4)
        # bajo
        out[i0:i1] += 0.10 * np.sin(2 * np.pi * nota(ac[0] - 12) * t) * env(n, 0.02, 0.3)
        # arpegio en corcheas
        for s in range(8):
            ts = t0 + s * beat / 2
            j0 = int(ts * SR)
            if j0 >= N:
                break
            m = ac[[0, 1, 2, 1][s % 4]] + 12
            ln = min(int(0.28 * SR), N - j0)
            tt = np.arange(ln) / SR
            out[j0:j0 + ln] += 0.06 * np.sin(2 * np.pi * nota(m) * tt) * np.exp(-tt * 9)
        # bombo (1 y 3) y hi-hat (contratiempos)
        for b in range(4):
            tb = t0 + b * beat
            j0 = int(tb * SR)
            if j0 >= N:
                break
            if b % 2 == 0:
                ln = min(int(0.25 * SR), N - j0)
                tt = np.arange(ln) / SR
                out[j0:j0 + ln] += 0.22 * np.sin(2 * np.pi * (50 + 90 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 14)
            jh = int((tb + beat / 2) * SR)
            if jh < N:
                ln = min(int(0.05 * SR), N - jh)
                out[jh:jh + ln] += 0.025 * rng.standard_normal(ln) * np.exp(-np.arange(ln) / SR * 80)
        t0 += compas
        k += 1
    out *= env(N, 0.5, 2.0)
    out = out / np.max(np.abs(out)) * 0.8
    st = np.stack([out, out], axis=1)
    with wave.open(a.salida, "w") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())
    print("→", a.salida)


if __name__ == "__main__":
    main()
