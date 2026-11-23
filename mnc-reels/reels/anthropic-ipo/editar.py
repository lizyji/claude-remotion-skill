#!/usr/bin/env python3
"""Decisión de edición del reel "Anthropic sale a la bolsa" (B1–B14, golpes, subtítulos, sfx).

Corre después de scripts/preparar.py. Sincroniza todo con las palabras de Manuel (audio manda).
Uso:  python3 reels/anthropic-ipo/editar.py
"""
import json, re, sys
from pathlib import Path

AQUI = Path(__file__).parent
sys.path.insert(0, str(AQUI.parent.parent / "scripts"))
from comun import norm  # noqa: E402

reel = json.loads((AQUI / "reel.json").read_text(encoding="utf-8"))
P = reel["palabras"]
DUR = reel["duracion"]


def idx(frase, desde=0):
    """Índice de la primera palabra de `frase` (secuencia exacta) a partir de `desde`."""
    toks = [norm(x) for x in frase.split()]
    for i in range(desde, len(P) - len(toks) + 1):
        if all(norm(P[i + k]["w"]) == toks[k] for k in range(len(toks))):
            return i
    raise SystemExit(f"No encontré: {frase}")


def at(frase, desde=0):
    return P[idx(frase, desde)]["start"]


def r(x):
    return round(x, 3)


# ---------- Subtítulos a mano (≤5 palabras / 24 car., cortes por frase, 1–2 claves) ----------
# Cada bloque: texto tal como se oye (con correcciones del guion), "*palabra*" = naranja.
BLOQUES = [
    "*Anthropic*, la empresa", "que hace *Claude*", "acaba de salir", "a la *bolsa*", "y podría valer",
    "hasta *1.4 billones*", "de dólares", "Puso el precio", "entre *70 y 78*", "dólares por acción",
    "y va a cotizar", "en el *Nasdaq*", "con la clave *ANT*", "Y para que te des", "una idea,",
    "*1.4 billones* es", "*1,400,000*", "millones de dólares,", "pero el *dato*", "que a mí me importa",
    "no es el *precio*", "Es este:", "en solo *6 meses*", "vendió más de", "*16,000 millones*",
    "de dólares", "Ojo, también reportó", "*pérdidas* enormes", "en buena parte", "*contables*",
    "Ojo, y esto no es", "*recomendación*", "de *inversión*", "Y a mí esto", "es lo que me voló",
    "la *cabeza*", "*Wall Street* ya no", "está preguntando", "si la *IA* sirve,", "está preguntando",
    "*cuánto vale*", "Y esas *ventas*", "salen de miles", "de *empresas*", "que ya la *pagan*",
    "para trabajar con ella", "Entonces, esto nos", "deja pensando", "en la *pregunta*", "para tu *negocio*:",
    "ya no es si usar *IA*", "es en *qué parte*", "la vas a usar", "*primero*",
]


def construir_subs():
    subs, i = [], 0
    for j, b in enumerate(BLOQUES):
        toks = b.split()
        words, n_pal = [], 0
        start = P[i]["start"]
        for tk in toks:
            limpio = tk.replace("*", "")
            words.append({"w": re.sub(r"[.,;:]+$", "", limpio) if not limpio.endswith(":") else limpio[:-1], "start": P[i]["start"], **({"key": True} if "*" in tk else {})})
        # avanzar sobre las palabras transcritas que cubre el bloque
        texto = norm(" ".join(t.replace("*", "") for t in toks)).replace(" ", "")
        acum = ""
        while i < len(P) and acum != texto:
            acum += norm(P[i]["w"]).replace(" ", "")
            for w in words:
                pass
            i += 1
            n_pal += 1
            if len(acum) > len(texto):
                raise SystemExit(f"Bloque no cuadra con el audio: {b!r} vs {acum!r}")
        # tiempo de aparición de cada palabra
        k0 = i - n_pal
        ws_audio = P[k0:i]
        pos = 0
        for w in words:
            w["start"] = ws_audio[min(pos, len(ws_audio) - 1)]["start"]
            pos += max(1, len(w["w"].split()))
        fin = P[i - 1]["end"] + 0.2
        if i < len(P) and P[i]["start"] - P[i - 1]["end"] < 0.6:
            fin = P[i]["start"]
        subs.append({"start": r(start), "end": r(fin), "words": words})
    return subs, i


subs, usadas = construir_subs()
fin_subs = P[usadas]["start"] if usadas < len(P) else DUR
subs[-1]["end"] = min(subs[-1]["end"], fin_subs)

# ---------- Tiempos de cada toma (palabras exactas de Manuel) ----------
t_puso = at("Puso el precio")
t_y_va = at("y va a cotizar")
t_y_para = at("Y para que te")
t_1400 = at("1,400,000")
t_pero = at("pero el dato")
t_es_este = at("Es este")
t_6m = at("en solo 6")
t_ojo1 = at("Ojo, también")
t_contables = at("contables.")
t_ojo2 = at("Ojo, y esto")
t_ya_mi = at("Y a mí esto")
t_wall = at("Wall Street")
t_cuanto = at("está preguntando cuánto")
t_y_esas = at("Y esas ventas")
t_miles = at("miles de empresas")
t_entonces = at("Entonces,")
t_ya_no_es = at("ya no es si")
t_es_en = at("es en qué parte")
t_tu = at("¿Tú en qué")
t_podria = at("y podría valer")

G = 0.04  # respiro entre clips

FUENTE_DECRYPT = "Fuente: Decrypt, 10 nov 2026 · decrypt.co"
FUENTE_TNW = "Fuente: The Next Web / Bloomberg, 18 nov 2026 · thenextweb.com"
FUENTE_S1 = "Fuente: S-1 de Anthropic, 26 oct 2026 · vía TheWrap"

reel["broll"] = [
    # TOMA 1 · GANCHO
    {"tipo": "logo", "id": "T1_B1_anthropic", "start": 0.0, "end": r(t_podria - G), "src": "reels/anthropic-ipo/anthropic_logo.png",
     "etiqueta": "Salió a la bolsa", "fuente": "Fuente: Anthropic · anthropic.com"},
    {"tipo": "texto", "id": "T1_B2_valor", "start": r(t_podria), "end": r(t_puso - G), "arriba": "Podría valer hasta", "titulo": "1.4 billones", "abajo": "de dólares (USD)"},
    # TOMA 2 · LA NOTICIA
    {"tipo": "imagen", "id": "T2_B3_titular", "start": r(t_puso), "end": r(t_y_va - G), "src": "reels/anthropic-ipo/decrypt_titular.png",
     "fit": "contain", "zoom": [1.0, 1.05], "foco": [50, 25], "fuente": FUENTE_DECRYPT},
    {"tipo": "cotizacion", "id": "T2_B4_nasdaq_ant", "start": r(t_y_va), "end": r(t_y_para - G), "mercado": "Nasdaq", "clave": "ANT",
     "dato": "70–78 USD por acción", "fuente": FUENTE_DECRYPT},
    {"tipo": "digitos", "id": "T2_B5_billones", "start": r(t_y_para), "end": r(t_pero - G), "arriba": "1.4 billones =",
     "valor": "1,400,000,000,000", "etiqueta": "dólares", "desde": r(t_1400 - t_y_para - 0.25)},
    {"tipo": "tarjeta", "id": "T2_B6_actualizacion", "start": r(t_pero), "end": r(t_es_este - G), "pildora": "Actualización",
     "titulo": "Salió a 83 USD por acción", "texto": "18 nov 2026", "fuente": FUENTE_TNW},
    # TOMA 3 · EL DATO QUE IMPORTA
    {"tipo": "contador", "id": "T3_B7_ventas", "start": r(t_es_este), "end": r(t_ojo1 - G), "valor": 16300, "sufijo": "",
     "etiqueta": "millones USD en 6 meses", "desde": r(t_6m - t_es_este), "fuente": FUENTE_S1},
    {"tipo": "tarjeta", "id": "T3_B8_perdida", "start": r(t_ojo1), "end": r(t_ojo2 - G), "pildora": "Pérdida", "tono": "negro",
     "titulo": "80,700 millones USD", "texto": "72,400 millones son ajuste contable (no salió dinero)", "textoEn": r(t_contables - t_ojo1 - 0.3),
     "fuente": FUENTE_S1},
    {"tipo": "aviso", "id": "T3_B9_aviso", "start": r(t_ojo2), "end": r(t_ya_mi + 0.3), "texto": "No es recomendación de inversión"},
    # TOMA 4 · (B10 va como golpe a pantalla completa)
    {"tipo": "tacha", "id": "T4_B11_cuanto_vale", "start": r(t_wall), "end": r(t_y_esas - G), "pildora": "Wall Street ya no pregunta",
     "antes": "¿Sirve la IA?", "despues": "¿Cuánto vale?", "antesEn": 0.1, "tachaEn": r(t_cuanto - t_wall)},
    {"tipo": "mosaico", "id": "T4_B12_empresas", "start": r(t_y_esas), "end": r(t_entonces - G), "etiqueta": "Miles de empresas que ya pagan",
     "n": 12, "cada": r(max(0.12, (t_miles - t_y_esas + 0.8) / 12))},
    # TOMA 5 · LECCIÓN
    {"tipo": "tacha", "id": "T5_B13_en_que_parte", "start": r(t_entonces), "end": r(t_tu + 0.3), "pildora": "La pregunta para tu negocio",
     "antes": "¿Si uso IA?", "despues": "¿En qué parte empiezo?", "antesEn": r(t_ya_no_es - t_entonces - 0.1), "tachaEn": r(t_es_en - t_entonces)},
]

reel["golpes"] = [
    # (B9 y B13 se extienden 0.3 s bajo el golpe para que el panel no suba antes de él)
    # B10 · "Y a mí esto es lo que me voló la cabeza" (golpe de zoom a pantalla completa)
    {"tipo": "jugada", "id": "T4_B10_volo_la_cabeza", "start": r(t_ya_mi), "end": r(t_wall - G), "arriba": "Esto es lo que me", "abajo": "voló la cabeza"},
    # B14 · pregunta final a pantalla completa (no hay frase de firma en este video)
    {"tipo": "cierre", "id": "T5_B14_pregunta", "start": r(t_tu), "end": DUR, "frase": "¿Tú en qué parte empezarías?", "lineas": [3, 1, 1],
     "clave": ["qué", "parte"], "nota": "Te leo en los comentarios"},
]

# Whoosh: solo 3 en todo el video, en los cambios de toma más fuertes
reel["whooshAuto"] = False
reel["sfx"] = [{"t": r(t_puso - 0.1), "s": "whoosh"}, {"t": r(t_es_este - 0.1), "s": "whoosh"}, {"t": r(t_entonces - 0.1), "s": "whoosh"}]
reel["subs"] = subs
reel["musica"] = "reels/anthropic-ipo/musica.wav"
reel["caraYFuente"] = 0.58
reel["pasos"] = []
reel.setdefault("portada", {"cuadro": 2.0})

(AQUI / "reel.json").write_text(json.dumps(reel, ensure_ascii=False, indent=2), encoding="utf-8")
for b in reel["broll"] + reel["golpes"]:
    print(f'{b["start"]:6.2f}–{b["end"]:6.2f}  {b["end"]-b["start"]:4.1f}s  {b.get("id", b["tipo"])}')
print(f"{len(subs)} bloques de subtítulos · {DUR} s")
