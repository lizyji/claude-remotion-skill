#!/usr/bin/env python3
"""Exporta cada B-roll suelto a out/tesla-cybertruck_brolls/<id>.mp4 (panel 1080×960; golpes 1080×1920)."""
import json, subprocess
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
reel = json.loads((RAIZ / "reels/tesla-cybertruck/reel.json").read_text(encoding="utf-8"))
out = RAIZ / "out/tesla-cybertruck_brolls"
out.mkdir(parents=True, exist_ok=True)
items = [("broll", i, b["id"]) for i, b in enumerate(reel["broll"])] + [("golpe", i, g["id"]) for i, g in enumerate(reel["golpes"])]
for tipo, i, nombre in items:
    props = out / "_props.json"
    props.write_text(json.dumps({"reel": reel, "tipo": tipo, "i": i}, ensure_ascii=False), encoding="utf-8")
    dest = out / f"{nombre}.mp4"
    subprocess.run(["npx", "remotion", "render", "src/index.ts", "BRoll", str(dest), "--codec", "h264", "--crf", "18",
                    f"--props={props}", "--log=error"], cwd=RAIZ, check=True)
    print("→", dest.name)
props.unlink()
