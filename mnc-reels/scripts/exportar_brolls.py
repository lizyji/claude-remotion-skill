#!/usr/bin/env python3
"""Exporta cada B-roll suelto (1080×960, mitad de arriba) nombrado por toma: out/<slug>_brolls/T4_B8_tabla.mp4

Usa el campo "_id" de cada B-roll en reel.json (si falta, B<n>). Los golpes "numero" y "cierre"
se exportan recortados a 1080×960 con "_id" opcional en el golpe.
Uso:  python3 scripts/exportar_brolls.py <slug> [--golpe 1:T6_B12_cierre]
"""
import argparse, json, subprocess
from pathlib import Path
from comun import RAIZ, leer

ap = argparse.ArgumentParser()
ap.add_argument("slug")
ap.add_argument("--golpe", action="append", default=[], help="índice:nombre, p. ej. 1:T6_B12_cierre")
a = ap.parse_args()

reel = leer(RAIZ / "reels" / a.slug / "reel.json")
out = RAIZ / "out" / f"{a.slug}_brolls"
out.mkdir(parents=True, exist_ok=True)
tmp = RAIZ / "out" / ".props_clip.json"

trabajos = [({"i": i}, b.get("_id", f"B{i + 1}")) for i, b in enumerate(reel["broll"])]
trabajos += [({"golpe": int(g.split(":")[0])}, g.split(":", 1)[1]) for g in a.golpe]
for extra, nombre in trabajos:
    tmp.write_text(json.dumps({"reel": reel, **extra}, ensure_ascii=False), encoding="utf-8")
    dest = out / f"{nombre}.mp4"
    subprocess.run(["npx", "remotion", "render", "src/index.ts", "BRoll", str(dest), "--codec", "h264", "--crf", "18",
                    f"--props={tmp}", "--log=error"], check=True, cwd=RAIZ)
    print("→", dest.relative_to(RAIZ))
tmp.unlink(missing_ok=True)
