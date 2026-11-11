#!/usr/bin/env python3
"""Hoja de cuadros para verificar un render: 1 cuadro cada N s en una cuadrícula.

Uso:  python3 scripts/hoja_cuadros.py out/<slug>.mp4 [--cada 1.5] [--columnas 6]
Salida: out/<slug>_hoja.jpg (con el tiempo impreso en cada cuadro)
"""
import argparse
from pathlib import Path
from comun import duracion, sh

ap = argparse.ArgumentParser()
ap.add_argument("video")
ap.add_argument("--cada", type=float, default=1.5)
ap.add_argument("--columnas", type=int, default=6)
a = ap.parse_args()
v = Path(a.video)
n = int(duracion(v) / a.cada) + 1
filas = -(-n // a.columnas)
out = v.with_name(v.stem + "_hoja.jpg")
vf = (f"fps=1/{a.cada},scale=270:480,"
      f"drawtext=text='%{{pts\\:hms}}':x=8:y=8:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6,"
      f"tile={a.columnas}x{filas}:padding=6:color=white")
sh(["ffmpeg", "-y", "-v", "error", "-i", str(v), "-vf", vf, "-frames:v", "1", "-q:v", "3", str(out)])
print(f"→ {out}")
