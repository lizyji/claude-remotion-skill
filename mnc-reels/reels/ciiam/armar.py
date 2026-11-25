#!/usr/bin/env python3
"""Arma reels/ciiam/reel.json: B-rolls, golpes, SFX y subtítulos sincronizados con la voz.
Correr después de scripts/preparar.py.  python3 reels/ciiam/armar.py"""
import json, sys
from pathlib import Path
RAIZ = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(RAIZ / "scripts"))
from comun import leer, escribir, norm
from bloques import bloques

P = RAIZ / "reels/ciiam/reel.json"
r = leer(P)
R = "reels/ciiam/"
F = "Fuente: CIIAM 2026 · Factor Automotor, 1 oct 2026"

r["caraYFuente"] = 0.56
r["musica"] = R + "musica.wav"
r["whooshAuto"] = False
r["sfx"] = [{"t": 14.48, "s": "whoosh"}, {"t": 36.57, "s": "whoosh"}, {"t": 49.88, "s": "whoosh"}]  # solo 3

r["broll"] = [
    # TOMA 1 · gancho
    {"tipo": "logos", "start": 0.0, "end": 6.72, "titulo": "Los de Compras de…",
     "logos": [{"src": R + "logo_ford_bn.png", "t": 0.98}, {"src": R + "logo_kia_bn.png", "t": 1.42},
               {"src": R + "logo_stellantis_bn.png", "t": 1.78}, {"src": R + "logo_paccar_bn.png", "t": 2.44}],
     "ranking": {"texto": "Precio", "t": 4.92, "cae": 5.78}},
    # TOMA 2 · contexto
    {"tipo": "imagen", "start": 6.80, "end": 8.28, "src": R + "titular_factor.png", "fit": "contain", "alto": 330, "zoom": [1, 1.03], "fuente": F},
    {"tipo": "imagen", "start": 8.30, "end": 9.70, "src": R + "foto_panel_ciiam.jpg", "fit": "cover", "alto": 520, "zoom": [1.0, 1.07], "pie": "Panel de Compras · CIIAM 2026", "fuente": F},
    {"tipo": "sello", "start": 9.72, "end": 11.98, "pildora": "CDMX", "titulo": "T-MEC", "sello": "En revisión", "tSello": 11.40, "fuente": F},
    {"tipo": "tachado", "start": 12.00, "end": 14.50, "antes": "Solo precio", "tTacha": 13.16, "despues": "Ya no alcanza", "tDespues": 13.76, "fuente": F},
    # TOMA 3 · Ford
    {"tipo": "checklist", "start": 14.56, "end": 27.20, "logo": R + "logo_ford_bn.png", "titulo": "Lo que revisa Ford",
     "subtitulo": "Bruno Mendoza · Procurement Director, Ford México",
     "items": [{"texto": "Resiliencia", "nota": "resuelves cuando algo falla", "t": 16.36},
               {"texto": "Calidad", "t": 18.42}, {"texto": "Velocidad de reacción", "t": 19.08},
               {"texto": "Capacidad logística", "t": 20.28}, {"texto": "Estabilidad laboral", "t": 21.68},
               {"texto": "Madurez técnica", "t": 23.10}],
     "subeA1": {"indice": 1, "t": 25.00, "etiqueta": "#1"}, "fuente": F},
    # TOMA 4 · Stellantis
    {"tipo": "tachado", "start": 29.04, "end": 32.04, "logo": R + "logo_stellantis_bn.png", "pildora": "Ya no pregunta", "antes": "¿Qué pieza sale más barata?", "tTacha": 31.75, "fuente": F},
    {"tipo": "linea", "start": 32.08, "end": 35.00, "logo": R + "logo_stellantis_bn.png", "titulo": "Mide el costo de todo el ciclo de vida",
     "items": [{"texto": "Mala calidad", "t": 32.82}, {"texto": "Paros", "t": 33.46}, {"texto": "Cambios de ingeniería", "t": 34.10}], "fuente": F},
    # TOMA 5 · lección ("Y aquí está la jugada" 35.05–36.6: sin texto en pantalla, Manuel completo)
    {"tipo": "tarjeta", "start": 36.65, "end": 40.00, "pildora": "Grupo Toyota", "titulo": "Una empresa del grupo Toyota busca proveedores mexicanos"},
    {"tipo": "bandeja", "start": 40.02, "end": 42.42, "asunto": "Solicitud de cotización", "de": "Cliente · hace 3 días", "tSinRespuesta": 41.31},
    {"tipo": "ecuacion", "start": 42.46, "end": 46.34, "partes": [{"texto": "Responder rápido", "t": 42.46},
        {"texto": "Datos de calidad a la mano", "t": 44.00, "signo": "+"}, {"texto": "Ventaja", "t": 45.58, "signo": "=", "naranja": True}]},
    {"tipo": "tachado", "start": 46.38, "end": 49.92, "pildora": "No se resuelve con", "antes": "Más gente", "tTacha": 47.20, "despues": "Procesos y sistemas", "tDespues": 48.38},
]
r["golpes"] = [
    {"tipo": "numero", "start": 27.24, "end": 28.98, "valor": "#1", "etiqueta": "Calidad"},
    {"tipo": "cta", "start": 49.96, "end": r["duracion"], "antes": "Comenta", "palabra": "BRÚJULA", "pie": "Clases gratis", "icono": "brujula"},
]
r["pasos"] = []
r["portada"] = {"frase": "Las armadoras ya no compran solo por precio", "destacar": ["precio"], "cuadro": 2.0, "foto": R + "portada_cuadro.png", "provisional": True}

# Subtítulos: siguen el audio, salvo lo que el guion pide NO poner en pantalla hasta confirmar:
#  · frase de Ford sobre la calidad (24.68–28.9) · "Y aquí está la jugada" · nombre de la empresa de Toyota
OCULTAR = [(24.6, 28.95), (35.0, 36.6), (36.6, 37.15)]
vis = [p for p in r["palabras"] if not any(a <= p["start"] < b for a, b in OCULTAR)]
subs = bloques(vis)
CLAVES = {"compras", "precio", "primero", "congreso", "tmec", "revision", "alcanza", "ford", "resiliencia", "falla",
          "calidad", "velocidad", "logistica", "laboral", "tecnica", "stellantis", "barata", "ciclo", "toyota",
          "proveedores", "cotizaciones", "responden", "rapido", "ventaja", "gente", "procesos", "sistemas", "comenta", "brujula"}
for s in subs:
    ks = [w for w in s["words"] if norm(w["w"]).replace(" ", "") in CLAVES][:2]
    if ks:
        for w in s["words"]:
            w.pop("key", None)
        for w in ks:
            w["key"] = True
    # no dejar un bloque cruzando una zona oculta
    for a, b in OCULTAR:
        if s["start"] < a < s["end"]:
            s["end"] = min(s["end"], a)
r["subs"] = subs
escribir(P, r)
for s in subs:
    print(f'{s["start"]:6.2f}-{s["end"]:6.2f}  ' + " ".join(("*" + w["w"] + "*") if w.get("key") else w["w"] for w in s["words"]))
