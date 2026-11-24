#!/usr/bin/env python3
"""Exporta cada B-roll suelto (panel 1080×960; golpes a 1080×1920) nombrado por toma.

Uso:  python3 scripts/exportar_brolls.py <slug> [--browser-executable RUTA]
Salida: out/<slug>_brolls/<nombre>.mp4  (nombre = campo "nombre" del B-roll, p. ej. T3_B7_espera)
"""
import argparse, json
from comun import RAIZ, sh

ap = argparse.ArgumentParser()
ap.add_argument("slug")
ap.add_argument("--browser-executable")
a = ap.parse_args()
reel = json.loads((RAIZ / "reels" / a.slug / "reel.json").read_text())
props = RAIZ / "reels" / a.slug / "work" / "props_broll.json"
dest = RAIZ / "out" / f"{a.slug}_brolls"
dest.mkdir(parents=True, exist_ok=True)
items = reel["broll"] + reel["golpes"]
for i, b in enumerate(items):
    nombre = b.get("nombre") or f"B{i + 1}_{b['tipo']}"
    props.write_text(json.dumps({"reel": reel, "i": i}, ensure_ascii=False))
    cmd = ["npx", "remotion", "render", "src/index.ts", "BRollSuelto", str(dest / f"{nombre}.mp4"),
           "--codec", "h264", "--crf", "17", "--muted", f"--props={props}"]
    if a.browser_executable:
        cmd.append(f"--browser-executable={a.browser_executable}")
    sh(cmd, cwd=RAIZ)
    print("→", nombre)
