#!/usr/bin/env python3
"""Corta los B-rolls sueltos de un reel ya renderizado, nombrados por toma (campo "id" en reel.json).

  - B-rolls de panel: del render "soloBroll" (sin Manuel ni subtítulos), recortados a 1080×960.
  - Golpes a pantalla completa (jugada, número, cierre): del render final, 1080×1920, sin audio.

Uso:
  npx remotion render src/index.ts Reel out/<slug>_broll_full.mp4 --muted --props=<props con "soloBroll": true>
  python3 scripts/exportar_brolls.py <slug>
Salida: out/<slug>_brolls/<id>.mp4
"""
import sys
from comun import RAIZ, leer, sh

slug = sys.argv[1]
reel = leer(RAIZ / "reels" / slug / "reel.json")
out = RAIZ / "out" / f"{slug}_brolls"
out.mkdir(parents=True, exist_ok=True)
panel, final = RAIZ / "out" / f"{slug}_broll_full.mp4", RAIZ / "out" / f"{slug}.mp4"
for i, b in enumerate(reel["broll"] + reel["golpes"]):
    nombre = b.get("id") or f'{"golpe" if b in reel["golpes"] else "broll"}_{i:02d}_{b["tipo"]}'
    es_golpe = b in reel["golpes"]
    vf = "null" if es_golpe else "crop=1080:960:0:0"
    sh(["ffmpeg", "-y", "-v", "error", "-ss", f'{b["start"]:.3f}', "-to", f'{b["end"]:.3f}', "-i", str(final if es_golpe else panel),
        "-vf", vf, "-an", "-c:v", "libx264", "-crf", "17", "-pix_fmt", "yuv420p", str(out / f"{nombre}.mp4")])
    print(f'{nombre}.mp4  ({b["end"] - b["start"]:.1f} s)')
print(f"→ {out}")
