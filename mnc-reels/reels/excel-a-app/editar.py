#!/usr/bin/env python3
"""Decisiones de edición del reel excel-a-app → reel.json (corre después de preparar.py)."""
import json, re
from pathlib import Path
P = Path(__file__).with_name("reel.json")
r = json.loads(P.read_text())
W = r["palabras"]

# Subtítulos a mano: (índice inicial, índice final, palabras clave en naranja). Siguen el audio.
B = [(0,3,["Excel"]),(4,7,["app"]),(8,9,["programar"]),(10,12,["inventarios"]),(13,14,["pedidos","cobranza"]),
 (15,17,["compras"]),(18,22,["interesar"]),(23,26,["proceso"]),(27,30,["sistema"]),(31,33,["candidato"]),
 (34,37,["paso","uno"]),(38,41,["Excel"]),(42,42,["Airtable"]),(43,45,["Glide","Softr"]),(46,46,["Cualquiera"]),
 (47,49,["herramientas"]),(50,50,["funciona"]),(51,54,["escoge"]),(55,56,["adapta"]),(57,59,["necesidades"]),
 (60,62,["describes"]),(63,65,["IA"]),(66,69,["escogiste"]),(70,73,["sistema"]),(74,75,["construyera"]),
 (76,79,["contexto"]),(80,84,["mandaste"]),(85,88,["sorprender"]),(89,91,["resultado"]),(92,94,["compartes"]),
 (95,97,["equipo"]),(98,102,["acabó"]),(103,105,["nadie"]),(106,110,["recomiendo"]),(111,115,["esto"]),
 (116,118,["Claude"]),(119,120,["Porque"]),(121,123,["herramientas"]),(124,128,["quitar"]),(129,131,["miedo"]),
 (132,136,["tener"]),(137,139,["certidumbre"]),(140,141,["construyendo"]),(142,145,[]),
 # Toma 5: el guion pide no destacar "protegido"/"seguridad" en pantalla → van sin naranja
 (146,148,[]),(149,152,[]),(153,155,[]),(156,158,["pagando"]),(159,160,["suscripción"]),(161,163,["herramienta"]),
 (164,166,["avanzar"]),(167,168,["miedo"]),(169,172,["aportar"]),(173,174,["valor"]),(175,179,["mejor"]),
 (180,183,["aprender"]),(184,185,["funciona"]),(186,189,["base","datos"]),(190,192,["tecnicismos"]),
 (193,197,["idea"]),(198,199,["validada"]),(200,204,[]),(205,205,["conocimiento"]),(206,207,[]),
 (208,209,["suscripciones"]),(210,211,["caras"]),(212,214,["hacerlo"]),(215,219,["medida","Claude"]),
 (220,222,["cliente"]),(223,225,["dueño"]),(226,229,["técnico"]),(230,233,["ERP"]),(234,237,["brújula"]),
 (238,242,["link"]),(243,244,["entrar"]),(245,247,["comunidad"]),(248,251,[]),(252,253,["gratis"]),(254,255,["semana"]),
 (256,259,["guarda"])]
limpia = lambda w: re.sub(r"[.,]$", "", w)
subs = []
for k, (a, b, keys) in enumerate(B):
    ws = W[a:b+1]
    words = []
    for x in ws:
        for parte in x["w"].split(" "):
            p = limpia(parte)
            if p.lower() == "¿y": p = "¿Y"
            words.append({"w": p, **({"key": True} if limpia(parte).strip("¿?") in keys else {})})
    txt = " ".join(w["w"] for w in words)
    assert len(words) <= 5 and len(txt) <= 26, txt
    end = W[B[k+1][0]]["start"] if k + 1 < len(B) else r["duracion"]
    subs.append({"start": ws[0]["start"], "end": end, "words": words})
r["subs"] = subs

A = lambda i, a, b, f=None: {"tipo": "anim", "id": i, "start": a, "end": b, **({"fuente": f} if f else {})}
SOFTR = "Fuente: Softr, video oficial «Create application with AI» · softr.io"
r["broll"] = [
 A("B1", 0.0, 3.10), A("B2", 3.10, 7.32), A("B3", 7.32, 11.04),
 A("B6", 11.04, 12.38), A("B4", 12.38, 15.20, "Logos oficiales: airtable.com · glideapps.com · softr.io"),
 A("B5", 15.20, 17.66), A("B7a", 17.66, 20.95, SOFTR), A("B7b", 20.95, 24.80, SOFTR),
 A("B8a", 24.80, 26.92), A("B8b", 26.92, 29.04),
 A("B9", 29.04, 32.14), A("B10", 32.14, 35.10), A("B11", 35.10, 38.20), A("B11b", 38.20, 42.98), A("B12", 42.98, 46.36),
 A("B13", 46.36, 50.12), A("B13b", 50.12, 53.00), A("B14", 53.00, 57.08), A("B15", 57.08, 61.16),
 A("B16", 61.16, 64.10), A("B17", 64.10, 65.86),
]
r["golpes"] = [{"tipo": "cta", "start": 65.86, "end": r["duracion"] + 1.3, "palabra": "BRÚJULA", "nota": "Guarda este video", "notaDesde": 0.42}]
r["cola"] = 1.3
r["pasos"] = [{"start": 11.04, "end": 17.66, "n": 1}, {"start": 17.66, "end": 24.80, "n": 2}, {"start": 24.80, "end": 29.04, "n": 3}]
r["whooshAuto"] = False
r["musica"] = None  # sin música (pedido explícito)
# SFX: solo 3 whoosh (cambios de bloque: cómo se hace · por qué no Claude · lección) + pops/clicks sutiles
r["sfx"] = [{"t": t, "s": "whoosh"} for t in (10.96, 28.96, 46.28)] + \
 [{"t": t, "s": "pop"} for t in (1.1, 2.15, 3.32, 3.98, 4.52, 5.10, 8.9, 9.25, 9.6, 10.22, 11.16, 12.38, 13.06, 13.35,
                                  25.05, 25.35, 25.65, 47.0, 51.07, 53.1, 53.5, 55.6, 60.26, 61.76, 64.6)] + \
 [{"t": t, "s": "tick"} for t in (14.0, 16.0, 27.14, 43.43)] + [{"t": 61.16, "s": "bass"}]
r["caraYFuente"] = 0.53
r["portada"] = {"frase": "Tu Excel se puede convertir en una app sin programar", "cuadro": 6.9, "naranja": ["Excel", "app"]}
P.write_text(json.dumps(r, ensure_ascii=False, indent=1))
print("ok", len(subs), "subs,", len(r["broll"]), "b-rolls")
