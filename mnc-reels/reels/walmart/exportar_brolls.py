#!/usr/bin/env python3
"""Exporta los B-rolls sueltos (1080×960) nombrados por toma a out/walmart_brolls/.
Clips de panel: composición BRoll. Golpes a pantalla completa: se toman del render final
(out/walmart.mp4), reducidos a 540×960 sobre fondo verde claro."""
import json, subprocess, tempfile
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
reel = json.loads((RAIZ / "reels/walmart/reel.json").read_text(encoding="utf-8"))
OUT = RAIZ / "out/walmart_brolls"
OUT.mkdir(parents=True, exist_ok=True)

NOMBRES = [
    "T1_B1a_walmart_fachada", "T1_B1b_tormenta", "T1_B2b_poptarts_nadie_lo_adivino",
    "T2_B3_agua_linternas_pilas", "T2_B4a_walmart_agua_agotada_milton", "T2_B4b_anaquel_vacio",
    "T3_B5a_walmart_2004", "T3_B5b_walmart_pasillo", "T3_B5c_walmart_cajas", "T3_B5d_barras_x7",
    "T3_B6_titular_abc_news", "T3_B7a_camion_walmart", "T3_B7b_camion_llega_tienda",
    "T4_B9a_corazonada_ventas", "T4_B9b_no_necesitas_ser_walmart",
    "T5_B10a_exporta_ventas_ia", "T5_B10b_calendario",
    "T6_B11_anaquel_se_llena", "T6_B12b_comentarios",
]
GOLPES = ["T1_B2_x7", "T4_B8_aqui_esta_la_jugada", "T6_B12_x7", "T6_B13_frase_cierre"]
assert len(NOMBRES) == len(reel["broll"]) and len(GOLPES) == len(reel["golpes"])

for nombre, b in zip(NOMBRES, reel["broll"]):
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f:
        json.dump({"b": b}, f, ensure_ascii=False)
    subprocess.run(["npx", "remotion", "render", "src/index.ts", "BRoll", str(OUT / f"{nombre}.mp4"),
                    "--codec", "h264", "--crf", "18", f"--props={f.name}", "--log=error"], cwd=RAIZ, check=True)
    print("→", nombre)

for nombre, g in zip(GOLPES, reel["golpes"]):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(g["start"]), "-to", str(g["end"]), "-i", str(RAIZ / "out/walmart.mp4"),
                    "-an", "-vf", "scale=540:960,pad=1080:960:270:0:color=0xE5EAE5", "-c:v", "libx264", "-crf", "18",
                    "-pix_fmt", "yuv420p", str(OUT / f"{nombre}.mp4")], check=True)
    print("→", nombre)
