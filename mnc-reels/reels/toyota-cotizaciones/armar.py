#!/usr/bin/env python3
"""Decisión de edición del reel "toyota-cotizaciones" (tiempos = video ya recortado).
Corre después de scripts/preparar.py:  python3 reels/toyota-cotizaciones/armar.py
"""
import json
from pathlib import Path

P = Path(__file__).parent / "reel.json"
reel = json.loads(P.read_text())
pal = reel["palabras"]

# ── Subtítulos: siguen el audio. "*" = palabra clave naranja, "~" = se dice pero NO va en
# pantalla (nombre de la empresa sin fuente confirmada).
BLOQUES = """Una empresa del grupo | Toyota pide *cotizaciones | a *proveedores mexicanos | y a veces *nadie | les *contesta.
Lo dijo ~el ~Ematec en el *Congreso | de la Industria *Automotriz.
El que *contesta primero | y bien ya lleva *ventaja. | Así *preparas | tu respuesta | el *mismo día | sin saber *programar.
*Primero abre un proyecto | en *Claude y súbele | tu lista de *precios, | tus *tiempos de entrega | y una *cotización tuya | que haya quedado bien. | Eso se hace | una *sola vez.
*Después, cuando llegue | una *solicitud, | súbela completa | con el *PDF o el plano | y pídele que saque | *piezas, | *cantidades, | *especificaciones | y *fecha requerida | y que arme el *borrador | con tu *formato.
Y por *último, | pídele la *lista | de lo que no pudo | *resolver | para que tú lo *completes. | *Nunca le dejes | inventar un *precio.
Y la *realidad es | que la *IA no va | a terminar *cotizando | por ti. | Te quita la hora | de *capturar | para que tú *revises | y *contestes | el *mismo día.
*Comenta brújula | y te mando el link | para entrar a mi comunidad | donde damos clases gratis | cada semana | y guarda este video."""

subs, i = [], 0
for linea in BLOQUES.split("\n"):
    for bl in linea.split("|"):
        words, ws = [], []
        for tok in bl.split():
            p = pal[i]
            limpio = tok.lstrip("*~")
            assert p["w"] == limpio, (p["w"], limpio, i)
            i += 1
            ws.append(p)
            if tok.startswith("~"):
                continue
            words.append({"w": limpio, "start": p["start"], **({"key": True} if tok.startswith("*") else {})})
        subs.append({"start": ws[0]["start"], "end": ws[-1]["end"], "words": words})
assert i == len(pal), (i, len(pal))
for a, b in zip(subs, subs[1:]):
    a["end"] = b["start"] if b["start"] - a["end"] < 0.6 else a["end"] + 0.25
subs[-1]["end"] = reel["duracion"]
reel["subs"] = subs

DATOS = "Ejemplo con datos ficticios"
CLAUDE = "Fuente: Anthropic, 25 jun 2024 · anthropic.com"
R = "reels/toyota-cotizaciones/"

reel["broll"] = [
    # TOMA 1 · GANCHO
    {"tipo": "bandeja", "start": 0.0, "end": 2.85, "asunto": "Solicitud de cotización", "remitente": "Una empresa del grupo Toyota"},  # B1
    {"tipo": "video", "start": 2.85, "end": 4.40, "src": R + "stock_fabrica.mp4", "desde": 2, "pildora": "Proveedores mexicanos"},  # B1b stock
    {"tipo": "contador", "start": 4.40, "end": 6.41, "valor": 6, "sufijo": " días", "etiqueta": "sin respuesta"},  # B2
    {"tipo": "imagen", "start": 6.41, "end": 10.01, "src": R + "ciiam_salon.jpg", "zoom": [1.0, 1.14], "foco": [62, 55],
     "pildora": "CIIAM 2026 · CDMX", "fuente": "Fuente: Cluster Industrial (foto), 29 sep 2026 · clusterindustrial.com.mx"},
    # TOMA 2 · LA VENTAJA
    {"tipo": "carrera", "start": 10.01, "end": 12.99, "a": "Proveedor A", "b": "Proveedor B", "ganador": "Respondió el mismo día", "perdedor": "Sin respuesta", "t": 0.9},  # B3
    {"tipo": "video", "start": 12.99, "end": 14.63, "src": R + "stock_laptop.mp4", "desde": 3},
    {"tipo": "texto", "start": 14.63, "end": 16.34, "linea1": "Mismo día", "linea2": "sin programar", "t2": 15.35},  # B4
    # TOMA 3 · PASO 1
    {"tipo": "imagen", "start": 16.34, "end": 18.26, "src": R + "claude_proyecto.png", "zoom": [1.0, 1.1], "foco": [80, 30],
     "logo": R + "claude_logo.svg", "pildora": "Proyecto en Claude", "fuente": CLAUDE},  # B5 (plan B)
    {"tipo": "subida", "start": 18.26, "end": 21.78, "titulo": "Súbele a tu proyecto:", "pildora": DATOS,
     "archivos": [{"nombre": "Lista de precios", "tipo": "XLS", "t": 18.36}, {"nombre": "Tiempos de entrega", "tipo": "PDF", "t": 19.26},
                  {"nombre": "Cotización modelo", "tipo": "PDF", "t": 20.28}]},  # B6 (plan B)
    {"tipo": "texto", "start": 21.78, "end": 23.80, "linea1": "Se hace", "linea2": "una sola vez", "t2": 22.62},  # B7
    # TOMA 4 · PASO 2
    {"tipo": "subida", "start": 23.80, "end": 27.89, "titulo": "Llega una solicitud:", "pildora": DATOS,
     "archivos": [{"nombre": "Solicitud de cotización", "tipo": "PDF", "t": 25.16}, {"nombre": "Plano de la pieza", "tipo": "PLANO", "t": 27.36}]},  # B8 (plan B)
    {"tipo": "tabla", "start": 27.89, "end": 32.26, "pildora": DATOS,
     "columnas": [{"titulo": "Pieza", "t": 28.64}, {"titulo": "Cantidad", "t": 29.20}, {"titulo": "Especificación", "t": 30.05}, {"titulo": "Fecha", "t": 31.30}],
     "filas": [["Soporte A-12", "500", "Acero 1018 zincado", "15 ene"], ["Buje B-07", "1,200", "Nylon 6/6", "22 ene"], ["Placa C-30", "300", "Aluminio 6061", "29 ene"]]},  # B9 (plan B)
    {"tipo": "documento", "start": 32.26, "end": 34.31, "titulo": "Cotización", "sello": "Borrador", "pildora": "Con tu formato",
     "lineas": ["Cliente", "Piezas y cantidades", "Precio de tu lista", "Tiempo de entrega", "Condiciones"]},  # B10 (plan B)
    # TOMA 5 · PASO 3 Y POSTURA
    {"tipo": "lista", "start": 34.31, "end": 38.29, "titulo": "Pendientes para ti", "check": "pendiente", "pildora": DATOS,
     "items": ["Precio de la placa C-30", "Tratamiento del buje B-07", "Fecha de entrega en planta"], "tiempos": [35.83, 36.83, 37.60]},  # B11 (plan B)
    {"tipo": "sello", "start": 38.29, "end": 40.30, "texto": "Nunca inventa precios"},  # B12
    {"tipo": "texto", "start": 40.30, "end": 42.98, "linea1": "La IA no cotiza", "linea2": "por ti", "t2": 42.56},
    {"tipo": "video", "start": 42.98, "end": 44.40, "src": R + "stock_teclado.mp4", "desde": 2, "pildora": "La hora de capturar"},
    {"tipo": "texto", "start": 44.40, "end": 46.96, "linea1": "La IA captura", "linea2": "Tú revisas y contestas", "t2": 44.92},  # B13
]
reel["golpes"] = [
    {"tipo": "cta", "start": 46.96, "end": reel["duracion"], "antes": "Comenta", "palabra": "BRÚJULA", "tPalabra": 47.40,
     "lineas": [{"texto": "Clases gratis cada semana", "t": 50.08}, {"texto": "Guarda este video", "t": 51.78}]},  # B14
]
reel["pasos"] = [{"start": 16.34, "end": 23.80, "n": 1}, {"start": 23.80, "end": 34.31, "n": 2}, {"start": 34.31, "end": 40.30, "n": 3}]
# Solo 3 whooshes en todo el video: entrada a la ventaja, paso 2 y CTA
reel["whooshAuto"] = False
reel["sfx"] = [{"t": 9.93, "s": "whoosh"}, {"t": 23.72, "s": "whoosh"}, {"t": 46.88, "s": "whoosh"}]
reel["musica"] = R + "musica.wav"
reel["caraYFuente"] = 0.54
# Frase PROPUESTA (no vino en el brief): reemplazar por la frase exacta de Manuel/Lizzy.
reel["portada"] = {"frase": "Contesta\ncotizaciones\nel mismo día\ncon IA", "cuadro": 40.2}
P.write_text(json.dumps(reel, ensure_ascii=False, indent=2))
print("ok", len(subs), "bloques,", len(reel["broll"]), "B-rolls")
