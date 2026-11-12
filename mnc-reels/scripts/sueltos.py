#!/usr/bin/env python3
"""Renderiza los B-rolls sueltos de un reel, nombrados por toma (id del clip en reel.json).

Uso:  python3 scripts/sueltos.py <slug>
Salida: out/<slug>_brolls/<id>.mp4 — panel 1080×960 (mitad de arriba) o 1080×1920 para golpes.
Incluye reel["extras"] (clips que se entregan sueltos aunque no entren al corte final).
"""
import json, subprocess, sys, tempfile
from pathlib import Path
from comun import RAIZ

slug = sys.argv[1]
reel = json.loads((RAIZ / "reels" / slug / "reel.json").read_text())
dest = RAIZ / "out" / f"{slug}_brolls"
dest.mkdir(parents=True, exist_ok=True)


def render(comp, props, nombre):
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f:
        json.dump(props, f, ensure_ascii=False)
    out = dest / f"{nombre}.mp4"
    subprocess.run(["npx", "remotion", "render", "src/index.ts", comp, str(out), "--codec", "h264", "--crf", "17", f"--props={f.name}", "--log=error"], cwd=RAIZ, check=True)
    print("→", out.relative_to(RAIZ))


for i, b in enumerate(reel["broll"] + reel.get("extras", [])):
    dur = b["end"] - b["start"]
    render("BRollSuelto", {"b": {**b, "start": 0, "end": dur}}, b.get("id", f"broll_{i+1:02d}"))
for i, g in enumerate(reel["golpes"]):
    # palabras desplazadas para que la frase de cierre se ilumine igual que en el reel
    pal = [{**p, "start": p["start"] - g["start"], "end": p["end"] - g["start"]} for p in reel["palabras"]]
    render("GolpeSuelto", {"g": {**g, "start": 0, "end": g["end"] - g["start"]}, "palabras": pal}, g.get("id", f"golpe_{i+1:02d}"))
