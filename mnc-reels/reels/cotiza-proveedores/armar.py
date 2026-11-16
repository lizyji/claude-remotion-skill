#!/usr/bin/env python3
"""Arma broll, golpes, pasos, sfx y subtítulos del reel "cotiza-proveedores".

Todo se sincroniza con las palabras exactas de Manuel (reel.json → palabras), no con los
segundos del guion. Correr después de scripts/preparar.py:
  python3 reels/cotiza-proveedores/armar.py
"""
import json, re, sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI.parent.parent / "scripts"))
from comun import norm  # noqa: E402

P = AQUI / "reel.json"
reel = json.loads(P.read_text(encoding="utf-8"))
W = reel["palabras"]
SLUG = "reels/cotiza-proveedores"


def at(frase, desde=0.0, fin=False):
    """Inicio (o fin) de la primera aparición de `frase` a partir de `desde`."""
    toks = [norm(x) for x in frase.split()]
    for i in range(len(W)):
        if W[i]["start"] < desde - 1e-6:
            continue
        seq = []
        j = i
        while j < len(W) and len(" ".join(seq).split()) < len(toks):
            seq.append(norm(W[j]["w"]))
            j += 1
        if " ".join(seq).split()[: len(toks)] == toks:
            return W[j - 1]["end"] if fin else W[i]["start"]
    raise SystemExit(f"No encontré: {frase!r} desde {desde}")


G = 0.05  # respiro entre clips
FUENTE_XAI = "Fuente: xAI, ago 2026 · x.ai/bot"
FUENTE_AT = "Fuente: Airtable, captura oficial · support.airtable.com"

t_cot = at("cotiza este pedido")
t_y_el = at("y él lo va")
t_yes = at("Y es que en compras")
t_pers = at("Persigues")
t_final = at("y al final pasas")
t_para = at("Para automatizarlo")
t_tienes = at("Tienes que tener")
t_yo = at("Yo utilizo Airtable")
t_osea = at("O sea")
t_coneso = at("Con eso le paso")
t_trabaja = at("que trabaja en su propia")
t_revisa = at("Revisa en mi tabla")
t_escribe = at("le escribe el correo")
t_junta = at("junta las respuestas")
t_arma = at("me arma la comparativa")
t_precio = at("Precio")
t_clave = at("Y para que funcione")
t_agente = at("El agente es tan bueno")
t_sino = at("Si no sabes quién")
t_decision = at("Y la decisión")
t_primero = at("Primero ordena")
t_luego = at("luego ponle")
t_cierre = at("Y si todavía no sabes")
dur = reel["duracion"]

broll = [
    # TOMA 1 · Gancho
    {"tipo": "tarjeta", "start": 0.0, "end": t_cot - 1.25 - G, "pildora": "Compras con IA",
     "titulo": "Automatiza las compras de tu empresa"},
    # B1 · chat "Cotiza este pedido" (entra justo antes de que lo diga)
    {"tipo": "chat", "start": t_cot - 1.25, "end": t_y_el - G, "texto": "Cotiza este pedido",
     "respuesta": "Escribiendo a tus proveedores", "escribe": 0.9},
    # B2 · sobres hacia 4 proveedores
    {"tipo": "sobres", "start": t_y_el, "end": t_yes - G, "titulo": "Cotización enviada",
     "destinos": ["Proveedor A", "Proveedor B", "Proveedor C", "Proveedor D"], "cada": 0.4,
     "fuente": "Ejemplo ilustrativo"},
    # TOMA 2 · B3 bandeja
    {"tipo": "bandeja", "start": t_yes, "end": t_final - G, "cada": (at("esperas") - t_yes) / 6,
     "pendienteEn": t_pers - t_yes + 0.2,
     "filas": [
         {"de": "Proveedor A", "asunto": "Re: cotización"},
         {"de": "Proveedor B", "asunto": "Re: Re: cotización"},
         {"de": "Proveedor C", "asunto": "Re: cotización (precio)"},
         {"de": "Proveedor D", "asunto": "Re: cotización", "pendiente": True},
         {"de": "Proveedor A", "asunto": "Re: Re: cotización"},
         {"de": "Proveedor E", "asunto": "Re: cotización urgente"},
     ],
     "fuente": "Ejemplo ilustrativo"},
    # B4 · hoja a medio llenar
    {"tipo": "hoja", "start": t_final, "end": t_para - G, "cada": 0.08,
     "columnas": ["Producto", "Prov. A", "Prov. B", "Prov. C"],
     "filas": [["Cajas", "$12", None, "$11"], ["Cinta", None, "$4", None], ["Etiquetas", "$2", None, "$3"], ["Bolsas", None, "$6", None]],
     "fuente": "Ejemplo ilustrativo"},
    # Frase nueva del audio: "el truco empieza antes de la IA"
    {"tipo": "tarjeta", "start": t_para, "end": t_tienes - G, "pildora": "El truco",
     "titulo": "Empieza antes de la IA"},
    # Frase nueva del audio: info "ordenada y ligada entre sí" → diagrama genérico
    {"tipo": "diagrama", "start": t_tienes, "end": t_yo - G, "titulo": "Proveedor ↔ Productos",
     "izq": {"titulo": "Proveedores", "items": ["Proveedor A", "Proveedor B", "Proveedor C"]},
     "der": {"titulo": "Productos", "items": ["Cajas", "Cinta", "Etiquetas"]},
     "ligas": [[0, 0], [0, 1], [1, 1], [2, 2]], "fuente": "Datos de ejemplo"},
    # TOMA 3 · B5: grabación de Manuel pendiente → captura oficial de Airtable (campo ligado)
    {"tipo": "imagen", "start": t_yo, "end": t_osea - G, "src": f"{SLUG}/airtable_ligado.png", "fit": "cover",
     "zoom": [1.0, 1.75], "foco": [70, 42], "etiqueta": "Campo ligado en Airtable", "fuente": FUENTE_AT},
    # Ficha de proveedor (datos de ejemplo)
    {"tipo": "lista", "start": t_osea, "end": t_coneso - G, "titulo": "Proveedor A · ejemplo",
     "items": ["Me surte: cajas y cinta", "Correo", "Contacto"], "cada": (at("contacto", t_osea) - t_osea - 0.35) / 2,
     "fuente": "Datos de ejemplo"},
    # TOMA 4 · B6: grabación pendiente → capturas oficiales de Grok Bot (x.ai/bot)
    {"tipo": "imagen", "start": t_coneso, "end": t_trabaja - G, "src": f"{SLUG}/grokbot_app.png", "fit": "cover",
     "zoom": [1.0, 1.08], "foco": [50, 20], "etiqueta": "Grok Bot", "fuente": FUENTE_XAI},
    {"tipo": "imagen", "start": t_trabaja, "end": t_revisa - G, "src": f"{SLUG}/grokbot_computadora.png", "fit": "cover",
     "zoom": [1.0, 1.06], "foco": [50, 30], "etiqueta": "Su propia computadora en la nube", "fuente": FUENTE_XAI},
    # Lo que hace el agente, paso a paso (sincronizado con cada frase)
    {"tipo": "lista", "start": t_revisa, "end": t_precio - G, "titulo": "El agente:",
     "items": ["Revisa tu tabla", "Escribe a cada proveedor", "Junta las respuestas", "Arma la comparativa"],
     "cada": None},
    # B7 · comparativa (tabla de ejemplo con leyenda)
    {"tipo": "comparativa", "start": t_precio, "end": t_clave - G, "cada": 0.45,
     "columnas": ["Proveedor", "Precio", "Entrega", "Estado"],
     "filas": [
         {"celdas": ["Proveedor A", "$1,240", "3 días"], "estado": "ok"},
         {"celdas": ["Proveedor B", "$1,180", "5 días"], "estado": "ok", "mejor": True},
         {"celdas": ["Proveedor C", "—", "—"], "estado": "falta"},
     ],
     "fuente": "Tabla de ejemplo"},
    # TOMA 5 · B9
    {"tipo": "tarjeta", "start": t_agente, "end": t_sino - G, "pildora": "La clave",
     "titulo": "El agente es tan bueno como tu tabla"},
    {"tipo": "tarjeta", "start": t_sino, "end": t_decision - G, "pildora": "Sin tabla ordenada",
     "titulo": "Ni la mejor IA te va a salvar"},
    {"tipo": "boton", "start": t_decision, "end": t_primero - G, "arriba": "La decisión sigue siendo tuya",
     "texto": "Tú decides", "clic": at("tuya", t_decision) - t_decision},
    # TOMA 6 · B10
    {"tipo": "lista", "start": t_primero, "end": t_cierre - G, "check": False,
     "items": ["Ordena", "Automatiza"], "cada": t_luego - t_primero},
]

# Lista del agente: "cada" uniforme no empata; repartir con el promedio entre frases
inicios = [t_revisa, t_escribe, t_junta, t_arma]
broll[11]["cada"] = round((inicios[-1] - inicios[0]) / 3 - 0.15, 3)  # cada paso entra cuando lo dice

golpes = [
    # B8 adaptado al audio: "Y para que funcione esta es la clave" (no dice "me voló la cabeza")
    {"tipo": "frase", "start": t_clave, "end": t_agente - G, "arriba": "Esta es", "abajo": "la clave"},
    # B11 · frase de cierre a pantalla completa
    {"tipo": "cierre", "start": t_cierre, "end": dur},
]

pasos = [
    {"start": t_primero, "end": t_luego - G, "n": 1},
    {"start": t_luego, "end": t_cierre - G, "n": 2},
]

# SFX extra (los automáticos están en Reel.tsx)
sfx = []
b1 = broll[1]
for k in range(6):
    sfx.append({"t": round(b1["start"] + 0.35 + k * 0.15, 3), "s": "tick"})
sfx.append({"t": round(b1["start"] + 0.35 + 0.9 + 0.25, 3), "s": "click"})
b2 = broll[2]
for i in range(4):
    sfx.append({"t": round(b2["start"] + 0.45 + i * 0.4 + 0.55, 3), "s": "pop"})
b3 = broll[3]
for i in range(6):
    sfx.append({"t": round(b3["start"] + 0.2 + i * b3["cada"], 3), "s": "tick"})
sfx.append({"t": round(b3["start"] + b3["pendienteEn"], 3), "s": "pop"})
b7 = broll[12]
for i in range(3):
    sfx.append({"t": round(b7["start"] + 0.3 + i * 0.45, 3), "s": "tick"})
sfx.append({"t": round(b7["start"] + 0.3 + 3 * 0.45 + 0.2, 3), "s": "pop"})
bb = broll[15]
sfx.append({"t": round(bb["start"] + bb["clic"], 3), "s": "click"})

for b in broll:
    b["start"], b["end"] = round(b["start"], 3), round(b["end"], 3)
    assert b["end"] > b["start"], b

# Subtítulos: comillas en el pedido y palabras clave revisadas a mano
CLAVES = {norm(x) for x in [
    "automatizar", "compras", "un agente", "cotiza", "proveedores", "cotizar", "Excel", "esperas", "Persigues",
    "truco", "IA", "implementar IA", "ordenada", "ligada", "Airtable", "ligadas", "correo", "Grok", "Bot", "nube",
    "tabla", "comparativa", "entrega", "contestar", "clave", "salvar", "decisión", "tuya", "ordena", "toda",
    "exactamente", "contacto", "respuestas", "producto", "proveedor", "negocio", "Precio", "comparar", "Simplemente",
]}
# "quién (me|te) surte qué" no se parte: el "qué" sube al bloque anterior
subs = reel["subs"]
for k in range(1, len(subs)):
    ws, prev = subs[k]["words"], subs[k - 1]["words"]
    if ws and norm(ws[0]["w"]) == "que" and norm(prev[-1]["w"]) == "surte" and len(ws) > 1:
        prev.append(ws.pop(0))
        subs[k]["start"] = ws[0]["start"]
        subs[k - 1]["end"] = ws[0]["start"]
        prev[-1]["w"] = prev[-1]["w"].rstrip(",") or prev[-1]["w"]

for s in reel["subs"]:
    ws = s["words"]
    for i, w in enumerate(ws):  # el pedido va entre comillas, como lo dicta Manuel
        if w["w"] == "cotiza" and i + 2 < len(ws) and ws[i + 2]["w"].startswith("pedido"):
            w["w"], ws[i + 2]["w"] = "“Cotiza", "pedido”"
    for w in ws:
        w.pop("key", None)
    marcadas = 0
    for w in ws:
        if norm(w["w"]) in CLAVES and marcadas < 2:
            w["key"] = True
            marcadas += 1
    if marcadas == 0:
        largas = [w for w in ws if len(norm(w["w"])) >= 6]
        if largas:
            max(largas, key=lambda w: len(w["w"]))["key"] = True

reel.update({
    "broll": broll, "golpes": golpes, "pasos": pasos, "sfx": sfx,
    "musica": f"{SLUG}/musica.wav", "caraYFuente": 0.6,
    "portada": {"cuadro": 2.6},
})
P.write_text(json.dumps(reel, ensure_ascii=False, indent=2), encoding="utf-8")
print("broll", len(broll), "golpes", len(golpes), "duración", dur)
for b in broll + golpes:
    print(f'{b["start"]:6.2f}-{b["end"]:6.2f} {b["tipo"]}')
