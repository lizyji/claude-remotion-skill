#!/usr/bin/env python3
"""Fondo musical instrumental original (sin letra, libre de derechos porque se sintetiza aquí).

Plan B cuando no hay acceso a bibliotecas de stock (Pexels/Pixabay). Pad suave + bajo + pulso
ligero, 96 bpm, progresión Am–F–C–G. El volumen final lo controla Reel.tsx (≈ −23 dB bajo la voz).

Uso:  python3 scripts/gen_musica.py public/reels/<slug>/musica.wav --seg 70
"""
import argparse, wave
import numpy as np

SR = 44100


def nota(n):  # MIDI → Hz
    return 440.0 * 2 ** ((n - 69) / 12)


def env(n, a, r):
    e = np.ones(n)
    a, r = min(a, n // 2), min(r, n // 2)
    e[:a] = np.linspace(0, 1, a)
    e[n - r:] = np.linspace(1, 0, r)
    return e


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("salida")
    ap.add_argument("--seg", type=float, default=70)
    a = ap.parse_args()

    bpm = 96
    beat = 60 / bpm
    compas = 4 * beat
    total = int(a.seg * SR)
    mix = np.zeros(total)
    t_all = np.arange(total) / SR
    acordes = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G
    rng = np.random.default_rng(7)

    i = 0
    while i * compas < a.seg:
        ac = acordes[i % 4]
        s0 = int(i * compas * SR)
        n = min(int(compas * SR), total - s0)
        t = np.arange(n) / SR
        pad = np.zeros(n)
        for m in ac:
            for det in (-0.08, 0.08):
                f = nota(m + 12) * (1 + det / 100)
                pad += np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)
        pad *= env(n, int(0.4 * SR), int(0.4 * SR)) * 0.05
        bajo = 0.12 * np.sin(2 * np.pi * nota(ac[0] - 12) * t) * env(n, 400, int(0.3 * SR))
        mix[s0:s0 + n] += pad + bajo
        # pulso: arpegio suave en corcheas
        for k in range(8):
            ps = s0 + int(k * beat / 2 * SR)
            pn = min(int(0.22 * SR), total - ps)
            if pn <= 0:
                continue
            tt = np.arange(pn) / SR
            f = nota(ac[k % 3] + 24)
            mix[ps:ps + pn] += 0.035 * np.sin(2 * np.pi * f * tt) * np.exp(-tt * 14)
        # kick suave en 1 y 3, hat en contratiempos
        for k in range(4):
            ks = s0 + int(k * beat * SR)
            kn = min(int(0.18 * SR), total - ks)
            if kn <= 0:
                continue
            tt = np.arange(kn) / SR
            if k % 2 == 0:
                mix[ks:ks + kn] += 0.22 * np.sin(2 * np.pi * (50 + 60 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 18)
            hs = ks + int(beat / 2 * SR)
            hn = min(int(0.05 * SR), total - hs)
            if hn > 0:
                mix[hs:hs + hn] += 0.025 * rng.standard_normal(hn) * np.exp(-np.arange(hn) / SR * 90)
        i += 1

    mix *= env(total, int(1.0 * SR), int(2.0 * SR))
    mix /= np.max(np.abs(mix)) + 1e-9
    mix *= 0.8
    est = np.stack([mix, np.roll(mix, int(0.012 * SR))], axis=1)
    with wave.open(a.salida, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((est * 32767).astype(np.int16).tobytes())
    print("→", a.salida)


if __name__ == "__main__":
    main()
