#!/usr/bin/env python3
"""Transcribe con tiempos por palabra (faster-whisper) y aplica correcciones.json.

Uso:
  # 1) Identificar la toma correcta en una carpeta de copy_XXXX.MOV (primeros 12 s de cada uno)
  python3 scripts/transcribir.py --primeros 12 reels/<slug>/raw/*.MOV

  # 2) Transcribir la toma completa → reels/<slug>/work/palabras_raw.json
  python3 scripts/transcribir.py reels/<slug>/raw/copy_1234.MOV -o reels/<slug>/work/palabras_raw.json

  # 3) Re-transcribir solo un fragmento sospechoso (frases "fantasma" en silencios)
  python3 scripts/transcribir.py reels/<slug>/raw/copy_1234.MOV --desde 23.4 --hasta 26.0

Requiere:  pip install faster-whisper   (modelo por defecto: large-v3; usa --modelo medium si no hay GPU)
"""
import argparse, sys, tempfile
from pathlib import Path
from comun import corregir, escribir, sh


def extraer_audio(video, desde=None, hasta=None):
    tmp = Path(tempfile.mkdtemp()) / "a.wav"
    cmd = ["ffmpeg", "-y", "-v", "error"]
    if desde is not None:
        cmd += ["-ss", str(desde)]
    if hasta is not None:
        cmd += ["-to", str(hasta)] if desde is None else ["-t", str(hasta - desde)]
    cmd += ["-i", str(video), "-ac", "1", "-ar", "16000", str(tmp)]
    sh(cmd)
    return tmp


def transcribir(modelo, wav, offset=0.0):
    segs, _ = modelo.transcribe(str(wav), language="es", word_timestamps=True, vad_filter=True,
                                initial_prompt="Manuel NoCode habla de IA, Claude, Airtable, Make, automatización, Grok Bot.")
    out = []
    for s in segs:
        for w in s.words or []:
            out.append({"w": w.word.strip(), "start": round(w.start + offset, 3), "end": round(w.end + offset, 3), "prob": round(w.probability, 3)})
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("videos", nargs="+")
    ap.add_argument("-o", "--salida")
    ap.add_argument("--primeros", type=float, help="solo los primeros N segundos de cada archivo (para elegir toma)")
    ap.add_argument("--desde", type=float)
    ap.add_argument("--hasta", type=float)
    ap.add_argument("--modelo", default="large-v3")
    a = ap.parse_args()
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        sys.exit("Falta faster-whisper:  pip install faster-whisper")
    modelo = WhisperModel(a.modelo, compute_type="auto")

    for v in a.videos:
        desde, hasta = (0.0, a.primeros) if a.primeros else (a.desde, a.hasta)
        palabras = corregir(transcribir(modelo, extraer_audio(v, desde, hasta), offset=desde or 0.0))
        texto = " ".join(p["w"] for p in palabras)
        print(f"\n== {Path(v).name} ==\n{texto}")
        dudosas = [p for p in palabras if p.get("prob", 1) < 0.6 or p.get("corregida")]
        if dudosas:
            print("  Revisar a mano:", ", ".join(f'{p["w"]}@{p["start"]:.2f}{"*" if p.get("corregida") else ""}' for p in dudosas))
        if a.salida and len(a.videos) == 1:
            escribir(Path(a.salida), palabras)
            print(f"→ {a.salida}  ({len(palabras)} palabras)")


if __name__ == "__main__":
    main()
