#!/usr/bin/env python3
"""Inserta una pausa (cuadro congelado + silencio) en el video ya preparado y re-mapea el reel.json.

Sirve para dejar "limpia" una imagen para guardar (p. ej. la lección a pantalla completa)
o para dar cola al cierre. El cuadro congelado debe quedar TAPADO por un golpe a pantalla
completa: nunca dejes a Manuel congelado a la vista.

Uso:
  python3 scripts/insertar_pausa.py --slug <slug> --en 39.2 --dur 2.0 [--cola 0.6]

Se corre DESPUÉS de preparar.py (tiempos del video ya recortado). Mueve palabras, subs,
cortes, broll, golpes, pasos y sfx que empiezan después de --en.
"""
import argparse
from comun import RAIZ, duracion, escribir, leer, sh
from bloques import bloques

ap = argparse.ArgumentParser()
ap.add_argument("--slug", required=True)
ap.add_argument("--en", type=float, help="instante (s) donde se inserta la pausa")
ap.add_argument("--dur", type=float, default=0.0)
ap.add_argument("--cola", type=float, default=0.0, help="segundos extra al final (cuadro congelado)")
a = ap.parse_args()

video = RAIZ / "public" / "reels" / a.slug / "manuel.mp4"
tmp = video.with_name("manuel_tmp.mp4")
total = duracion(video)

partes, filtros = [], []
if a.en is not None and a.dur > 0:
    filtros.append(f"[0:v]trim=0:{a.en},setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration={a.dur}[v1];"
                   f"[0:a]atrim=0:{a.en},asetpts=PTS-STARTPTS,apad=pad_dur={a.dur}[a1];"
                   f"[0:v]trim={a.en},setpts=PTS-STARTPTS[v2];[0:a]atrim={a.en},asetpts=PTS-STARTPTS[a2];"
                   f"[v1][a1][v2][a2]concat=n=2:v=1:a=1[vc][ac]")
else:
    filtros.append("[0:v]null[vc];[0:a]anull[ac]")
filtros.append(f"[vc]tpad=stop_mode=clone:stop_duration={a.cola},fps=30[vo];[ac]apad=pad_dur={a.cola}[ao]")
sh(["ffmpeg", "-y", "-v", "error", "-i", str(video), "-filter_complex", ";".join(filtros), "-map", "[vo]", "-map", "[ao]",
    "-c:v", "libx264", "-crf", "14", "-preset", "fast", "-c:a", "aac", "-b:a", "256k", str(tmp)])
tmp.replace(video)

desp = lambda t: t + a.dur if (a.en is not None and t >= a.en) else t
reel_p = RAIZ / "reels" / a.slug / "reel.json"
r = leer(reel_p)
r["palabras"] = [{**p, "start": round(desp(p["start"]), 3), "end": round(desp(p["end"]), 3)} for p in r["palabras"]]
r["cortes"] = [round(desp(c), 3) for c in r["cortes"]]
for k in ("broll", "golpes", "pasos"):
    for x in r.get(k, []):
        x["start"], x["end"] = round(desp(x["start"]), 3), round(desp(x["end"]), 3)
for s in r.get("sfx", []):
    s["t"] = round(desp(s["t"]), 3)
r["subs"] = bloques(r["palabras"])
r["duracion"] = round(duracion(video), 3)
escribir(reel_p, r)
print(f"Duración: {total:.2f} s → {r['duracion']:.2f} s")
