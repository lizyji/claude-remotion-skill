#!/usr/bin/env python3
"""Decisión de edición del reel Walmart / Pop-Tarts (B-rolls, golpes, subtítulos, portada).
Corre después de scripts/preparar.py:  python3 reels/walmart/editar.py
"""
import json, sys
from pathlib import Path

R = Path(__file__).resolve().parent / "reel.json"
reel = json.loads(R.read_text(encoding="utf-8"))
P = reel["palabras"]
D = "reels/walmart/"

NYT = "Fuente: The New York Times, 14 nov 2004 · nytimes.com"
COM = "Fuente: Wikimedia Commons"
VOA = "Fuente: Voice of America vía Wikimedia Commons · Walmart, Chicago"
GMA = "Fuente: ABC News (Good Morning America), 27 ago 2011 · goodmorningamerica.com"

# ── Subtítulos: re-partir bloques y fijar palabras clave (1–2 por bloque, siguen el audio)
def words(*ws):
    return ws
subs = reel["subs"]
nuevos = []
for b in subs:
    txt = " ".join(w["w"] for w in b["words"])
    if txt.startswith("Siete veces más y estaba"):
        ws = b["words"]
        t_y = next(p["start"] for p in P if p["w"] == "y" and p["start"] > 44.5)
        nuevos.append({"start": b["start"], "end": t_y, "words": [{**w, "key": w["w"] == "Siete"} for w in ws[:3]]})
        nuevos.append({"start": t_y, "end": b["end"], "words": [{**w, "key": False} for w in ws[3:]]})
        continue
    nuevos.append(b)
# fusiona "y estaba" + "en sus datos"
fus = []
for b in nuevos:
    txt = " ".join(w["w"] for w in b["words"])
    if txt == "en sus datos" and fus and " ".join(w["w"] for w in fus[-1]["words"]) == "y estaba":
        fus[-1] = {"start": fus[-1]["start"], "end": b["end"], "words": fus[-1]["words"] + b["words"]}
        continue
    fus.append(b)
CLAVE = {"obvio": 1, "eso": 1, "acaba": 1, "gente": 1, "vende": 1, "Buen": 1, "Fin": 1, "datos": 1, "Walmart": 1, "huracán": 1, "fresa": 1}
for b in fus:
    if not any(w.get("key") for w in b["words"]):
        for w in b["words"]:
            if w["w"].strip(".,¿?") in CLAVE:
                w["key"] = True
    if " ".join(w["w"] for w in b["words"]).startswith("Walmart descubrió"):
        for w in b["words"]:
            w["key"] = w["w"] == "Walmart"
reel["subs"] = fus

# ── B-rolls (tiempos del video recortado, sincronizados con la frase de Manuel)
reel["broll"] = [
    # TOMA 1 · GANCHO
    {"tipo": "video", "start": 0.0, "end": 1.62, "src": D + "wm_fachada.mp4", "pildora": "Walmart", "pildoraEn": 0.15, "fuente": VOA},
    {"tipo": "tormenta", "start": 1.62, "end": 3.0, "etiqueta": "Antes de un huracán", "etiquetaEn": 0.1},
    {"tipo": "imagen", "start": 4.55, "end": 6.6, "src": D + "poptarts.jpg", "fit": "contain", "zoom": [1.0, 1.1], "pildora": "Nadie lo adivinó", "pildoraEn": 0.25, "fuente": COM},
    # TOMA 2 · EL PROBLEMA
    {"tipo": "iconos", "start": 6.6, "end": 10.05, "titulo": "Lo obvio:", "items": [
        {"icono": "agua", "texto": "Agua", "en": 2.2}, {"icono": "linterna", "texto": "Linternas", "en": 2.5}, {"icono": "pilas", "texto": "Pilas", "en": 3.2}]},
    {"tipo": "imagen", "start": 10.05, "end": 12.05, "src": D + "wm_agua_milton.jpg", "zoom": [1.05, 1.2], "foco": [30, 55], "pildora": "Se acaba", "pildoraEn": 1.4,
     "fuente": "Fuente: Wikimedia Commons · Walmart Avon Park, antes del huracán Milton (2024)"},
    {"tipo": "anaquel", "start": 12.05, "end": 14.2, "modo": "vaciar", "pregunta": True, "titulo": "¿Y lo que de verdad compran?"},
    # TOMA 3 · LO QUE HICIERON
    {"tipo": "video", "start": 14.2, "end": 16.4, "src": D + "wm_fachada2.mp4", "pildora": "2004", "pildoraEn": 0.1, "fuente": VOA},
    {"tipo": "video", "start": 16.4, "end": 17.75, "src": D + "wm_pasillo.mp4", "fuente": VOA},
    {"tipo": "imagen", "start": 17.75, "end": 19.2, "src": D + "wm_cajas.jpg", "zoom": [1.0, 1.08], "pildora": "Antes de cada huracán", "pildoraEn": 0.05, "fuente": COM},
    {"tipo": "barras", "start": 19.2, "end": 23.2, "titulo": "Ventas antes de un huracán", "subeEn": 1.94, "valor": "x7", "etiqueta": "Pop-Tarts de fresa vs. lo normal", "fuente": NYT},
    {"tipo": "imagen", "start": 23.2, "end": 25.45, "src": D + "gma_titular.png", "fit": "contain", "zoom": [1.0, 1.06], "pildora": "No se cocinan · duran", "pildoraEn": 0.9, "fuente": GMA},
    {"tipo": "imagen", "start": 25.45, "end": 27.6, "src": D + "wm_camion.jpg", "zoom": [1.0, 1.12], "foco": [60, 50], "pildora": "Desde entonces", "pildoraEn": 0.05, "fuente": COM},
    {"tipo": "camion", "start": 27.6, "end": 30.25, "carga": "Pop-Tarts", "tienda": "TIENDA"},
    # TOMA 4 · LA JUGADA
    {"tipo": "tachado", "start": 31.62, "end": 34.72, "antes": "Corazonada", "despues": "Sus ventas de siempre", "tachaEn": 0.1, "despuesEn": 1.36, "extra": "Solo había que leerlo", "extraEn": 2.2},
    {"tipo": "logo", "start": 34.72, "end": 36.4, "src": D + "walmart_logo.svg", "arriba": "No necesitas ser", "etiqueta": "Tu negocio también puede", "etiquetaEn": 0.9},
    # TOMA 5 · TU NEGOCIO
    {"tipo": "exporta", "start": 36.4, "end": 39.25, "hoja": "Tus ventas · últimos 2 años", "iaEn": 2.48},
    {"tipo": "calendario", "start": 39.25, "end": 43.9, "titulo": "¿Qué se vende más antes de…?", "tituloEn": 0.7, "etiquetas": [
        {"texto": "Buen Fin", "en": 1.99}, {"texto": "Regreso a clases", "en": 2.67}, {"texto": "Lluvias", "en": 3.91}]},
    # TOMA 6 · CIERRE
    {"tipo": "anaquel", "start": 45.0, "end": 47.95, "modo": "llenar", "titulo": "Estaba en sus datos", "etiqueta": "A tiempo"},
    {"tipo": "comentario", "start": 47.95, "end": 49.3, "texto": "¿Qué se te dispara en temporada?"},
]

FIN_VOZ = reel["duracion"]
reel["duracionManuel"] = FIN_VOZ
reel["duracion"] = round(FIN_VOZ + 3.5, 3)
reel["golpes"] = [
    {"tipo": "numero", "start": 3.0, "end": 4.55, "valor": "x7", "etiqueta": "Pop-Tarts de fresa", "fuente": NYT},
    {"tipo": "jugada", "start": 30.25, "end": 31.62},
    {"tipo": "numero", "start": 43.9, "end": 45.0, "valor": "x7", "etiqueta": "y estaba en sus datos", "fuente": NYT},
    {"tipo": "cierre", "start": round(FIN_VOZ + 0.05, 3), "end": reel["duracion"]},
]
reel["pasos"] = []
reel["sfx"] = [{"t": 21.14, "s": "tick"}, {"t": 31.72, "s": "click"}, {"t": 33.0, "s": "pop"}, {"t": 38.88, "s": "pop"},
               {"t": 41.24, "s": "pop"}, {"t": 41.92, "s": "pop"}, {"t": 43.16, "s": "pop"}, {"t": 28.0, "s": "whoosh"}]
reel["musica"] = D + "musica.wav"
reel["caraYFuente"] = 0.56
reel.setdefault("portada", {"cuadro": 4.0})
R.write_text(json.dumps(reel, ensure_ascii=False, indent=2), encoding="utf-8")
print("duración", reel["duracion"], "· broll", len(reel["broll"]))
