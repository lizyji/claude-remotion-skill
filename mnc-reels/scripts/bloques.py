#!/usr/bin/env python3
"""Agrupa palabras en bloques de subtítulos MNC.

Reglas: máx. 5 palabras / 24 caracteres, corte por frase natural (puntuación o pausa),
ninguna línea termina en artículo, preposición o conjunción, 1 palabra clave (naranja)
por bloque. La palabra clave es una sugerencia: revísala en reel.json ("key": true).

Uso suelto:  python3 scripts/bloques.py reels/<slug>/reel.json   (re-genera "subs")
"""
import re, sys
from pathlib import Path
from comun import escribir, leer, norm

MAX_PAL, MAX_CAR, PAUSA = 5, 24, 0.45
NO_FINAL = set("el la los las lo un una unos unas de del a al en con por para sin sobre entre hasta desde hacia y e o u ni que mi mis tu tus su sus se me te le les nos como pero si muy más mas tan cada este esta estos estas ese esa".split())
CLAVES = {"ia", "claude", "airtable", "make", "chatgpt", "grok", "bot", "gratis", "automatizar", "automatice", "automatizacion", "dinero", "clientes", "jugada", "negocio"}


def limpiar(w):
    return re.sub(r"[.,;:]+$", "", w)


def elegir_clave(ws):
    for w in ws:  # números, %, $
        if re.search(r"\d", w["w"]):
            return w
    for w in ws:
        if norm(w["w"]) in CLAVES:
            return w
    largas = [w for w in ws if len(norm(w["w"])) >= 6 and norm(w["w"]) not in NO_FINAL]
    return max(largas, key=lambda w: len(w["w"])) if largas else None


def bloques(palabras):
    grupos, cur = [], []
    for i, p in enumerate(palabras):
        texto = " ".join(limpiar(x["w"]) for x in cur + [p])
        pausa = cur and p["start"] - cur[-1]["end"] > PAUSA
        if cur and (len(cur) >= MAX_PAL or len(texto) > MAX_CAR or pausa):
            # no terminar en artículo/preposición: pasa esa palabra al siguiente bloque
            arrastre = []
            while len(cur) > 1 and norm(cur[-1]["w"]) in NO_FINAL and not pausa:
                arrastre.insert(0, cur.pop())
            grupos.append(cur)
            cur = arrastre
        cur.append(p)
        if re.search(r"[.?!;:]$", p["w"]) or (re.search(r",$", p["w"]) and len(cur) >= 3):
            grupos.append(cur)
            cur = []
    if cur:
        grupos.append(cur)

    subs = []
    for j, g in enumerate(grupos):
        clave = elegir_clave(g)
        sig = grupos[j + 1][0]["start"] if j + 1 < len(grupos) else None
        fin = g[-1]["end"] + 0.25
        if sig is not None and sig - g[-1]["end"] < 0.6:
            fin = sig
        subs.append({
            "start": round(g[0]["start"], 3),
            "end": round(fin, 3),
            "words": [{"w": limpiar(w["w"]), "start": w["start"], **({"key": True} if w is clave else {})} for w in g],
        })
    return subs


if __name__ == "__main__":
    p = Path(sys.argv[1])
    r = leer(p)
    r["subs"] = bloques(r["palabras"])
    escribir(p, r)
    for s in r["subs"]:
        print(f'{s["start"]:6.2f}  ' + " ".join(("*" + w["w"] + "*") if w.get("key") else w["w"] for w in s["words"]))
