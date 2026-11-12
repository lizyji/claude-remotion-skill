#!/usr/bin/env python3
"""Recorta silencios, normaliza a −14 LUFS, re-mapea las palabras y arma los subtítulos.

Uso:
  python3 scripts/preparar.py reels/<slug>/raw/copy_1234.MOV --slug <slug> \
      [--palabras reels/<slug>/work/palabras_raw.json] [--quitar 12.3-14.1 --quitar 40-41.2]

Hace:
  1. Detecta silencios por energía (−38 dB, ≥ 0.3 s) y los quita dejando 0.10 s después de
     cada frase y 0.08 s antes de la siguiente. Nunca corta dentro de una palabra.
     --quitar elimina además tramos con errores de lectura (tiempos del archivo en bruto).
  2. Escala/recorta a 1080×1920 a 30 fps.
  3. Normaliza la voz a −14 LUFS (loudnorm en dos pasadas).
  4. Escribe public/reels/<slug>/manuel.mp4 y actualiza reels/<slug>/reel.json:
     duracion, manuel, cortes, palabras (re-mapeadas) y subs (bloques de ≤5 palabras/24 car.).
     Conserva broll, golpes, pasos, sfx y portada si el reel.json ya existía.
"""
import argparse, json, re, subprocess
import numpy as np
from pathlib import Path
from comun import RAIZ, duracion, escribir, leer, sh
from bloques import bloques

UMBRAL_DB, MIN_SIL, PAD_DESPUES, PAD_ANTES, MIN_CORTE = -38, 0.3, 0.10, 0.08, 0.12


def silencios(video, ventana=0.02):
    """Silencios por ENERGÍA (RMS en ventanas de 20 ms) bajo UMBRAL_DB durante ≥ MIN_SIL.
    (silencedetect de ffmpeg mide picos por muestra: con ruido de cuarto casi no detecta pausas.)
    El audio se alinea al tiempo del video (first_pts=0), igual que en transcribir.py."""
    sr = 16000
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(video), "-af", "aresample=async=1:first_pts=0",
                          "-ac", "1", "-ar", str(sr), "-f", "s16le", "-"], check=True, capture_output=True).stdout
    a = np.frombuffer(raw, dtype=np.int16).astype(np.float64) / 32768
    n = int(sr * ventana)
    k = len(a) // n
    rms = 20 * np.log10(np.sqrt((a[: k * n].reshape(k, n) ** 2).mean(axis=1)) + 1e-9)
    total = duracion(video)
    sils, ini = [], None
    for i, db in enumerate(list(rms) + [0.0]):
        if db < UMBRAL_DB and ini is None:
            ini = i
        elif db >= UMBRAL_DB and ini is not None:
            if (i - ini) * ventana >= MIN_SIL:
                sils.append((ini * ventana, min(total, i * ventana)))
            ini = None
    if sils and sils[-1][1] >= k * ventana - 0.05:
        sils[-1] = (sils[-1][0], total)
    return sils, total


def restar(a, b, palabras_iv):
    """Intervalo de corte [a,b] menos los intervalos de palabras (con margen)."""
    piezas = [(a, b)]
    for ws, we in palabras_iv:
        nuevas = []
        for s, e in piezas:
            if we <= s or ws >= e:
                nuevas.append((s, e))
                continue
            if ws - PAD_ANTES > s:
                nuevas.append((s, ws - PAD_ANTES))
            if we + PAD_DESPUES < e:
                nuevas.append((we + PAD_DESPUES, e))
        piezas = nuevas
    return [(s, e) for s, e in piezas if e - s >= MIN_CORTE]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--slug", required=True)
    ap.add_argument("--palabras")
    ap.add_argument("--quitar", action="append", default=[], help="tramo a quitar, p. ej. 12.3-14.1")
    a = ap.parse_args()

    video = Path(a.video)
    palabras = leer(Path(a.palabras)) if a.palabras else []
    sils, total = silencios(video)
    # Los tiempos de la transcripción suelen alargarse dentro de las pausas: se recortan
    # contra los silencios medidos por energía (ahí no hay voz) para que no bloqueen el corte.
    for p in palabras:
        for s, e in sils:
            if s <= p["start"] < e and p["end"] > e:
                p["start"] = round(e, 3)
            if s < p["end"] <= e and p["start"] < s:
                p["end"] = round(s, 3)

    cortes = []
    for s, e in sils:
        cs, ce = (0.0 if s <= 0.05 else s + PAD_DESPUES), (total if e >= total - 0.05 else e - PAD_ANTES)
        if ce - cs >= MIN_CORTE:
            cortes += restar(cs, ce, [(p["start"], p["end"]) for p in palabras])
    for q in a.quitar:
        s, e = map(float, q.split("-"))
        cortes.append((s, e))
    # unir y ordenar
    cortes.sort()
    unidos = []
    for s, e in cortes:
        if unidos and s <= unidos[-1][1] + 0.02:
            unidos[-1] = (unidos[-1][0], max(unidos[-1][1], e))
        else:
            unidos.append((s, e))

    quedan, cur = [], 0.0
    for s, e in unidos:
        if s > cur:
            quedan.append((cur, s))
        cur = max(cur, e)
    if cur < total:
        quedan.append((cur, total))

    def nuevo_t(t):
        return t - sum(min(e, t) - s for s, e in unidos if s < t)

    # Palabras dentro de tramos quitados se descartan; el resto se re-mapea
    pal_new = [
        {**p, "start": round(nuevo_t(p["start"]), 3), "end": round(nuevo_t(p["end"]), 3)}
        for p in palabras
        if not any(s <= p["start"] and p["end"] <= e for s, e in unidos)
    ]
    marcas = [round(nuevo_t(s), 3) for s, _ in unidos if 0 < nuevo_t(s) < nuevo_t(total) - 0.05]

    # 1) recorte + encuadre vertical, audio PCM intermedio
    work = RAIZ / "reels" / a.slug / "work"
    work.mkdir(parents=True, exist_ok=True)
    sel = "+".join(f"between(t,{s:.3f},{e:.3f})" for s, e in quedan)
    vf = f"select='{sel}',setpts=N/FRAME_RATE/TB,fps=30,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1"
    af = f"aselect='{sel}',asetpts=N/SR/TB,aresample=48000"
    tmp = work / "recortado.mkv"
    sh(["ffmpeg", "-y", "-v", "error", "-i", str(video), "-vf", vf, "-af", af, "-c:v", "libx264", "-crf", "14", "-preset", "fast", "-c:a", "pcm_s16le", str(tmp)])

    # 2) loudnorm dos pasadas → −14 LUFS
    medir = sh(["ffmpeg", "-v", "info", "-i", str(tmp), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"]).stderr
    m = json.loads(medir[medir.rindex("{"): medir.rindex("}") + 1])
    ln = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
          f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    salida = RAIZ / "public" / "reels" / a.slug / "manuel.mp4"
    salida.parent.mkdir(parents=True, exist_ok=True)
    sh(["ffmpeg", "-y", "-v", "error", "-i", str(tmp), "-c:v", "copy", "-af", ln + ",aresample=48000", "-c:a", "aac", "-b:a", "256k", str(salida)])

    dur = duracion(salida)
    reel_p = RAIZ / "reels" / a.slug / "reel.json"
    reel = leer(reel_p) if reel_p.exists() else {"broll": [], "golpes": [], "pasos": [], "sfx": []}
    reel.update({
        "slug": a.slug,
        "duracion": round(dur, 3),
        "manuel": f"reels/{a.slug}/manuel.mp4",
        "cortes": marcas,
        "palabras": pal_new,
        "subs": bloques(pal_new),
    })
    escribir(reel_p, reel)
    print(f"Duración final: {dur:.1f} s  (bruto {total:.1f} s, {len(unidos)} cortes)")
    if dur > 60:
        print("AVISO: pasa de 60 s. No se recorta contenido; avisar a Manuel la duración final.")
    print(f"→ {salida.relative_to(RAIZ)}\n→ {reel_p.relative_to(RAIZ)}")


if __name__ == "__main__":
    main()
