#!/usr/bin/env python3
"""Genera un reel DEMO de punta a punta, sin material real, para probar la plantilla:

  1. Crea una "toma en bruto" falsa (figura de reemplazo + audio sintético con silencios).
  2. La pasa por preparar.py (recorte de silencios, −14 LUFS, subtítulos).
  3. Coloca B-rolls, golpes y pasos sincronizados con las palabras.

Uso:  python3 scripts/demo.py   →  luego  npx remotion studio src/index.ts
NO es material de Manuel: solo sirve para revisar layout, tiempos y estilo.
"""
import math, random, struct, wave
from pathlib import Path
from comun import RAIZ, escribir, leer, sh

FRASES = [
    "Así automaticé mis ideas de contenido con IA.",
    "Antes perdía tres horas cada semana.",
    "Pero aquí está la jugada.",
    "Paso uno: guardo cada idea en Airtable.",
    "Paso dos: Claude la convierte en guion.",
    "Y ahora publico el doble.",
    "Si todavía no sabes cómo implementar IA en tu negocio, esta cuenta es para ti.",
]
SR = 48000
work = RAIZ / "reels" / "demo" / "raw"
work.mkdir(parents=True, exist_ok=True)

# 1) palabras con tiempos + audio "tipo voz" (ruido modulado) y silencios entre frases
random.seed(7)
palabras, t = [], 0.6
for f in FRASES:
    for w in f.split():
        d = 0.16 + 0.045 * len(w.strip(".,:"))
        palabras.append({"w": w, "start": round(t, 3), "end": round(t + d, 3), "prob": 0.95})
        t += d + 0.06
    t += random.choice([0.7, 0.9, 1.1])  # respiración/silencio que preparar.py debe quitar
total = t + 0.5
muestras = [0.0] * int(total * SR)
for p in palabras:
    a, b = int(p["start"] * SR), int(p["end"] * SR)
    f0 = random.uniform(110, 160)
    for i in range(a, b):
        x = (i - a) / (b - a)
        env = math.sin(math.pi * x) ** 0.6
        s = sum(math.sin(2 * math.pi * f0 * k * i / SR) / k for k in range(1, 6))
        muestras[i] = 0.18 * env * (s * 0.6 + random.uniform(-0.4, 0.4))
wav = work / "voz.wav"
with wave.open(str(wav), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, s)) * 32767)) for s in muestras))
escribir(work / "palabras_raw.json", palabras)

# 2) video de reemplazo: fondo gris, "cuerpo" y "cabeza" (cara a ~38% del alto) + reloj
font = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
vf = (
    "drawbox=x=290:y=880:w=500:h=1100:color=0x2d2d2d:t=fill,"
    "drawbox=x=400:y=560:w=280:h=330:color=0xc9a184:t=fill,"
    "drawbox=x=470:y=690:w=40:h=20:color=0x141414:t=fill,drawbox=x=570:y=690:w=40:h=20:color=0x141414:t=fill,"
    f"drawtext=fontfile={font}:text='TOMA DE MANUEL (DEMO)':x=(w-tw)/2:y=1500:fontsize=54:fontcolor=white,"
    f"drawtext=fontfile={font}:text='%{{pts\\:hms}}':x=(w-tw)/2:y=1580:fontsize=44:fontcolor=0xFD6623"
)
raw = work / "toma_demo.mp4"
sh(["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i", f"color=c=0x8a9a8f:s=1080x1920:r=30:d={total:.2f}",
    "-i", str(wav), "-vf", vf, "-c:v", "libx264", "-crf", "20", "-c:a", "aac", "-shortest", str(raw)])

# 3) recorte + normalización + subtítulos
sh(["python3", str(RAIZ / "scripts" / "preparar.py"), str(raw), "--slug", "demo", "--palabras", str(work / "palabras_raw.json")], cwd=RAIZ)

reel_p = RAIZ / "reels" / "demo" / "reel.json"
reel = leer(reel_p)
P = reel["palabras"]


def at(texto, n=0):
    """inicio de la n-ésima palabra que empieza con `texto`"""
    hits = [p for p in P if p["w"].lower().strip(".,:").startswith(texto.lower())]
    return hits[n]["start"]


def fin_frase(texto):
    i = next(k for k, p in enumerate(P) if p["w"].lower().startswith(texto.lower()))
    while not P[i]["w"].endswith((".", "?", "!")):
        i += 1
    return P[i]["end"]


reel["caraYFuente"] = 725 / 1920
reel["musica"] = "musica-demo.wav"
reel["broll"] = [
    {"tipo": "tarjeta", "start": at("Así"), "end": at("Antes") - 0.05, "pildora": "Caso real", "titulo": "Mis ideas de contenido, en piloto automático con IA"},
    {"tipo": "contador", "start": at("Antes"), "end": at("Pero") - 0.05, "valor": 3, "sufijo": " h", "etiqueta": "perdidas cada semana"},
    {"tipo": "cita", "start": at("guardo"), "end": at("Paso", 1) - 0.05, "medio": "Plan B", "titular": "Así se ve la tarjeta de cita cuando una página no abre", "fuente": "Fuente: Ejemplo, 11 nov 2026 · ejemplo.com"},
    {"tipo": "lista", "start": at("Paso", 1), "end": at("Y") - 0.05, "titulo": "Claude convierte la idea en:", "items": ["Gancho", "Guion toma por toma", "Lista de B-rolls"], "cada": 0.6},
    {"tipo": "pendiente", "start": at("Y"), "end": fin_frase("Y") + 0.15, "id": "B6"},
]
reel["golpes"] = [
    {"tipo": "jugada", "start": at("Pero"), "end": fin_frase("Pero") + 0.2},
    {"tipo": "cierre", "start": at("Si"), "end": reel["duracion"]},
]
reel["pasos"] = [
    {"start": at("Paso", 0), "end": at("Paso", 1) - 0.05, "n": 1},
    {"start": at("Paso", 1), "end": at("Y") - 0.05, "n": 2},
]
reel["portada"] = {"frase": "Así automaticé mis ideas con IA..", "cuadro": 2}
escribir(reel_p, reel)
print("Demo lista →", reel_p.relative_to(RAIZ))
