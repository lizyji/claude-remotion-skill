#!/usr/bin/env python3
"""Cama musical instrumental sintetizada (propia, libre de derechos, sin letra).

Uso:  python3 scripts/gen_musica.py public/reels/<slug>/musica.wav --seg 60 --bpm 96
Acordes suaves (pad), bajo, kick y hi-hat discretos. Pensada para ir a ≈ −23 dB bajo la voz.
"""
import argparse, wave
import numpy as np

SR = 48000
NOTAS = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}


def hz(n, oct_):
    return 440.0 * 2 ** ((NOTAS[n] + 12 * (oct_ - 4) - 9) / 12)


def env(n, a=0.02, r=0.3):
    t = np.arange(n) / SR
    e = np.minimum(1, t / a) * np.exp(-t / r)
    return e


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("salida")
    ap.add_argument("--seg", type=float, default=60)
    ap.add_argument("--bpm", type=float, default=96)
    a = ap.parse_args()
    n = int(a.seg * SR)
    out = np.zeros((n, 2))
    beat = 60 / a.bpm
    # Progresión I–V–vi–IV en C (cálida, neutra)
    acordes = [("C", "E", "G"), ("G", "B", "D"), ("A", "C", "E"), ("F", "A", "C")]
    bajos = ["C", "G", "A", "F"]
    compas = 4 * beat
    rng = np.random.default_rng(7)
    t_all = np.arange(n) / SR
    k = 0
    while k * compas < a.seg:
        i0 = int(k * compas * SR)
        L = min(int(compas * SR), n - i0)
        if L <= 0:
            break
        t = np.arange(L) / SR
        ch = acordes[k % 4]
        pad = sum(np.sin(2 * np.pi * hz(x, 4) * t + d) + 0.5 * np.sin(2 * np.pi * hz(x, 5) * t) for x, d in zip(ch, (0, 1, 2)))
        pad *= np.minimum(1, t / 0.4) * np.minimum(1, (compas - t) / 0.3) * 0.05
        out[i0:i0 + L, 0] += pad
        out[i0:i0 + L, 1] += pad * 0.92
        # bajo en tiempos 1 y 3
        for b in (0, 2):
            j = i0 + int(b * beat * SR)
            m = min(int(beat * 1.6 * SR), n - j)
            if m > 0:
                tt = np.arange(m) / SR
                s = np.sin(2 * np.pi * hz(bajos[k % 4], 2) * tt) * env(m, 0.01, 0.5) * 0.16
                out[j:j + m] += s[:, None]
        # arpegio suave en corcheas
        for c in range(8):
            j = i0 + int(c * beat / 2 * SR)
            m = min(int(0.4 * SR), n - j)
            if m > 0:
                tt = np.arange(m) / SR
                nota = ch[[0, 1, 2, 1][c % 4]]
                s = np.sin(2 * np.pi * hz(nota, 5) * tt) * env(m, 0.005, 0.18) * 0.035
                out[j:j + m, c % 2] += s
        # kick (1, 3) y hat (contratiempos)
        for b in range(4):
            j = i0 + int(b * beat * SR)
            if b % 2 == 0:
                m = min(int(0.25 * SR), n - j)
                if m > 0:
                    tt = np.arange(m) / SR
                    f = 50 + 70 * np.exp(-tt * 30)
                    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(m, 0.002, 0.09) * 0.22
                    out[j:j + m] += s[:, None]
            jh = j + int(beat / 2 * SR)
            m = min(int(0.05 * SR), n - jh)
            if m > 0:
                s = rng.standard_normal(m) * env(m, 0.001, 0.015) * 0.03
                s = np.diff(s, prepend=0)
                out[jh:jh + m] += s[:, None]
        k += 1
    fade = int(1.5 * SR)
    out[:fade] *= np.linspace(0, 1, fade)[:, None]
    out[-fade:] *= np.linspace(1, 0, fade)[:, None]
    out /= np.abs(out).max() / 0.8
    with wave.open(a.salida, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((out * 32767).astype(np.int16).tobytes())
    print("→", a.salida)


if __name__ == "__main__":
    main()
