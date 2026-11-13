# Arma broll/golpes de reels/monthly/reel.json (tiempos en el video ya recortado).
import json
R = 'reels/monthly/reel.json'
r = json.load(open(R))
VW, VH = 1440, 900
def crop(cx, cy, W):
    w = W / VW
    return {"x": round((cx - W / 2) / VW, 4), "y": round((cy - W / 1.6 / 2) / VH, 4), "w": round(w, 4), "h": round(w, 4)}
REC = "reels/monthly/rec/"
F = "Fuente: demo comercial de Monthly · monthly-demo.netlify.app"
FC = "Fuente: caso de cliente reportado por Monthly · monthly-demo.netlify.app"
ANCHO = crop(720, 428, 1267)
v = lambda s, e, src, desde, c0, c1=None, **kw: {"tipo": "video", "start": s, "end": e, "src": REC + src, "desde": desde, "recorte": c0, **({"recorteFin": c1} if c1 else {}), "fuente": kw.pop("fuente", F), **kw}
broll = [
  # Toma 1 · gancho (Manuel a pantalla completa 0–1.4 s)
  v(1.40, 4.92, "portada.mp4", 0.5, ANCHO, crop(560, 430, 1100)),
  v(4.92, 8.72, "plataforma.mp4", 0.2, crop(880, 520, 940), crop(900, 540, 760)),
  {"tipo": "fiscalReal", "start": 8.72, "end": 12.20, "golpe": 2.1},
  # Toma 2 · el problema
  {"tipo": "sello", "start": 12.20, "end": 17.22, "texto": "Hecha para el SAT", "cae": 2.1,
   "renglones": [{"t": 3.3, "texto": "Pagar impuestos", "ok": True}, {"t": 4.05, "texto": "Decidir", "ok": False}]},
  {"tipo": "lista", "start": 17.22, "end": 21.80, "titulo": "Lo que no te muestra:", "items": ["Sin efectivo", "Con gastos de socios"], "tiempos": [0.75, 3.4], "tache": True},
  v(21.80, 25.30, "procesamiento.mp4", 2.0, crop(485, 640, 770), crop(560, 650, 640), etiqueta="Inversión como gasto"),
  v(25.30, 28.62, "problema.mp4", 3.2, crop(372, 518, 640), leyenda="Ejemplo ilustrativo de Monthly con cifras ficticias"),
  # Toma 3 · cómo lo resuelven
  v(28.62, 31.50, "portada.mp4", 1.0, crop(330, 330, 620), crop(330, 300, 520)),
  v(31.50, 34.66, "portada.mp4", 2.7, crop(360, 520, 600), crop(300, 560, 440), etiqueta="Así se presenta"),
  v(34.66, 38.44, "conexion.mp4", 1.0, crop(485, 555, 760), crop(420, 560, 640), etiqueta="Sin cambiar de contador"),
  v(38.44, 42.90, "procesamiento.mp4", 1.8, crop(490, 520, 820), crop(700, 520, 820), etiqueta="1 · Audita"),
  v(42.90, 46.20, "procesamiento.mp4", 6.0, crop(490, 520, 820), crop(700, 520, 820), etiqueta="2 · Limpia"),
  v(46.20, 49.62, "conexion.mp4", 4.5, crop(1110, 505, 600), crop(1110, 560, 480), etiqueta="24 h después del cierre"),
  v(49.62, 52.00, "plataforma.mp4", 2.6, crop(720, 520, 1100), crop(880, 520, 820), etiqueta="3 · Te dice cómo vas"),
  v(52.00, 54.34, "plataforma.mp4", 6.8, crop(700, 560, 960), crop(940, 580, 620), etiqueta="3 · Te dice cómo vas"),
  v(54.34, 56.80, "plataforma.mp4", 9.0, crop(942, 580, 560), crop(942, 600, 420), etiqueta="AskMara"),
  {"tipo": "frases", "start": 56.80, "end": 59.02, "pildora": "AskMara", "lineas": [
     {"t": 0.05, "texto": "Como ChatGPT…", "tono": "negro", "size": 76},
     {"t": 0.75, "texto": "con todo tu contexto financiero", "tono": "naranja", "size": 66}]},
  # Caso real (la toma 4 del guion no se grabó: el audio manda)
  v(59.02, 62.36, "casos.mp4", 0.7, ANCHO, crop(800, 560, 900), fuente=FC),
  v(64.20, 65.90, "casos.mp4", 4.0, crop(1062, 410, 600), crop(1062, 400, 540), fuente=FC),
  # Toma 5 · la lección
  {"tipo": "frases", "start": 65.90, "end": 68.76, "pildora": "La lección", "lineas": [
     {"t": 0.05, "texto": "Así usan la IA", "size": 84},
     {"t": 1.75, "texto": "los negocios que van adelante", "tono": "naranja", "size": 64}]},
  {"tipo": "frases", "start": 68.76, "end": 72.62, "lineas": [
     {"t": 0.05, "texto": "Más reportes", "tono": "gris", "tachado": 0.85, "size": 88},
     {"t": 1.45, "texto": "Por fin,", "size": 88},
     {"t": 2.75, "texto": "visibilidad.", "tono": "naranja", "size": 104}]},
]
golpes = [
  {"tipo": "numero", "start": 62.40, "end": 64.20, "valor": "75%", "etiqueta": "del volumen en solo 2 clientes", "fuente": "Caso de cliente reportado por Monthly"},
  {"tipo": "cierre", "start": 72.66, "end": r["duracion"]},
]
r.update({"broll": broll, "golpes": golpes, "pasos": [], "sfx": [], "musica": "reels/monthly/musica.wav", "caraYFuente": 0.58})
json.dump(r, open(R, "w"), ensure_ascii=False, indent=2)
print(len(broll), "b-rolls")
