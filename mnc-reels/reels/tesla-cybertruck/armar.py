#!/usr/bin/env python3
"""Arma la edición del reel Tesla / Cybertruck sobre reel.json (después de preparar.py).

Subtítulos por frase natural (a mano), B-rolls y golpes sincronizados con las palabras de Manuel.
Uso:  python3 reels/tesla-cybertruck/armar.py
"""
import json, re, sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI.parent.parent / "scripts"))
from comun import norm  # noqa: E402

R = AQUI / "reel.json"
reel = json.loads(R.read_text(encoding="utf-8"))
P = reel["palabras"]
D = "reels/tesla-cybertruck/"

# ── Subtítulos: grupos por frase; *palabra* = clave en naranja ─────────────────
GRUPOS = """Tesla va a *dejar
de *fabricar
el *Cybertruck
y lo va a *cambiar
por un *carro
que no tiene *volante
Lo anunció *Elon *Musk
esta *semana
A *mediados
del próximo año
la fábrica de *Texas
deja de hacer
el *Cybertruck
para hacerle un *espacio
más al *Cybercab
Un carro *autónomo
de *dos asientos
sin *volante
y sin *pedales
*¿Por *qué?
Porque el *Cybertruck
no se *vendió
El año pasado *vendieron
unos *20 *mil
en Estados Unidos
casi la *mitad
que el año anterior
y esa *fábrica se hizo
para producir
*250 *mil al año
Y el *Cybercab ya existe
Empezaron a *fabricarlo
en *abril
y desde *septiembre
ya *cobran viajes
en *Austin
con un servicio
de *robotaxi
Todavía es
un programa *chico
pero ahí es donde
Tesla quiere su *fábrica
Y a mí esto
es lo que me voló
la cabeza
Tesla no *esperó
a que el *Cybertruck
se muriera *solo
Dejó de *alimentar
lo que no *vendía
para meterle *todo
a su *apuesta de *IA
Y eso es
lo que casi *ningún
negocio se *atreve
a hacer
En tu *negocio
también hay
un *Cybertruck
algo que te *quita
*tiempo *gente
y *dinero
y ya no
te deja *nada
Si todavía no sabes
cómo implementar IA
en tu negocio
esta cuenta es para ti""".splitlines()

limpia = lambda w: re.sub(r"[.,;:]+$", "", w)
subs, i = [], 0
for g in GRUPOS:
    toks = g.split()
    ws = []
    for tk in toks:
        # "implementar IA" viene como una sola palabra en la transcripción
        if ws and ws[-1]["w"] == "implementar IA" and tk == "IA":
            continue
        p = P[i]
        assert norm(p["w"]).split()[0] == norm(tk.strip("*")), (g, tk, p["w"])
        ws.append({"w": limpia(p["w"]), "start": p["start"], **({"key": True} if tk.startswith("*") else {})})
        i += 1
    subs.append({"start": ws[0]["start"], "words": ws, "_fin": P[i - 1]["end"]})
assert i == len(P), (i, len(P))
for j, s in enumerate(subs):
    sig = subs[j + 1]["start"] if j + 1 < len(subs) else None
    fin = s.pop("_fin") + 0.25
    if sig is not None and sig - (fin - 0.25) < 0.6:
        fin = sig
    s["end"] = round(fin, 3)
    s["start"] = round(s["start"], 3)
    s["words"] = [{k: v for k, v in w.items()} for w in s["words"]]
reel["subs"] = subs


# ── Tiempos de palabras (para sincronizar) ─────────────────────────────────────
def t(palabra, n=1, desde=0.0):
    """Inicio de la n-ésima aparición de `palabra` a partir de `desde` s."""
    k = 0
    for p in P:
        if p["start"] >= desde and norm(p["w"]).startswith(norm(palabra)):
            k += 1
            if k == n:
                return p["start"]
    raise KeyError(palabra)


C = "Wikimedia Commons"
CORTES = {
    "B1": 0.0,
    "B2": t("y", 1, 1.9),             # "y lo va a cambiar por un carro…"
    "B3": t("Lo", 1, 4.0),            # "Lo anunció Elon Musk…"
    "B3b": t("la", 1, 7.5),           # "la fábrica de Texas deja de hacer el Cybertruck"
    "B3c": t("para", 1, 9.7),         # "para hacerle un espacio más al Cybercab"
    "B4": t("Un", 1, 12.0),           # "Un carro autónomo de dos asientos…"
    "B5a": t("¿Por", 1, 16.0),        # "¿Por qué? Porque el Cybertruck no se vendió"
    "B5": t("El", 1, 18.7),           # "El año pasado vendieron…"
    "B6": t("y", 1, 23.6),            # "y esa fábrica se hizo para producir 250 mil…"
    "B7a": t("Y", 1, 27.6),           # "Y el Cybercab ya existe"
    "B7": t("Empezaron"),
    "B8": t("Y", 1, 39.0),            # "Y a mí esto es lo que me voló la cabeza"
    "B8b": t("Tesla", 1, 41.5),       # "Tesla no esperó…"
    "B9": t("Dejó"),
    "MANUEL": t("Y", 1, 48.9),        # "Y eso es lo que casi ningún negocio…" → Manuel solo
    "B10": t("En", 1, 51.5),
    "B10b": t("algo"),
    "B11": t("Si", 1, 57.0),
}
c = CORTES
rel = lambda palabra, clip, n=1: round(t(palabra, n, c[clip]) - c[clip], 2)

broll = [
    {"id": "T1_B1_fin_cybertruck", "tipo": "imagen", "start": c["B1"], "end": c["B2"], "src": D + "ct_hero.jpg",
     "zoom": [1.0, 1.12], "paneo": [40, 55, 55, 50], "sello": {"texto": "FIN", "en": rel("Cybertruck", "B1") - 0.05},
     "fuente": f"Foto: Bill Abbott, CC BY-SA 2.0 · {C}"},
    {"id": "T1_B2_cybercab", "tipo": "imagen", "start": c["B2"], "end": c["B3"], "src": D + "cc_calle.jpg",
     "zoom": [1.04, 1.16], "paneo": [30, 60, 60, 60], "etiquetas": [{"texto": "Sin volante", "en": rel("volante", "B2")}],
     "fuente": f"Foto: Cybercab en San Francisco, jun 2026 · 9yz, CC BY 4.0 · {C}"},
    {"id": "T2_B3_titular_techcrunch", "tipo": "imagen", "start": c["B3"], "end": c["B3b"], "src": D + "techcrunch_titular.png",
     "alto": 502, "zoom": [1.0, 1.5], "foco": [84, 54], "fuente": "Fuente: TechCrunch, 6 nov 2026 · techcrunch.com"},
    {"id": "T2_B3b_cybertruck_en_la_calle", "tipo": "imagen", "start": c["B3b"], "end": c["B3c"], "src": D + "ct_calle_gente.jpg",
     "zoom": [1.0, 1.14], "paneo": [35, 55, 55, 55],
     "etiquetas": [{"texto": "Fábrica de Texas", "en": rel("fábrica", "B3b"), "tono": "negro"},
                   {"texto": "Fin: mediados 2027", "en": rel("Cybertruck", "B3b")}],
     "fuente": f"Foto: Phillip Pessar, CC BY 4.0 · {C}"},
    {"id": "T2_B3c_cybercab_autopista", "tipo": "imagen", "start": c["B3c"], "end": c["B4"], "src": D + "cc_autopista.jpg",
     "zoom": [1.08, 1.2], "paneo": [20, 55, 70, 55], "etiquetas": [{"texto": "Más Cybercab", "en": rel("Cybercab", "B3c")}],
     "fuente": f"Foto: Daniel Lu, CC BY-SA 4.0 · {C}"},
    {"id": "T2_B4_cybercab_sin_volante", "tipo": "imagen", "start": c["B4"], "end": c["B5a"], "src": D + "cc_interior.jpg",
     "zoom": [1.0, 1.1], "paneo": [45, 45, 60, 50],
     "etiquetas": [{"texto": "2 asientos", "en": rel("dos", "B4"), "tono": "negro"},
                   {"texto": "Sin volante", "en": rel("volante", "B4")},
                   {"texto": "Sin pedales", "en": rel("pedales", "B4")}],
     "fuente": f"Foto: Steve Jurvetson, CC BY 2.0 · {C}"},
    {"id": "T3_B5a_no_se_vendio", "tipo": "imagen", "start": c["B5a"], "end": c["B5"], "src": D + "ct_miami.jpg",
     "zoom": [1.12, 1.0], "paneo": [50, 60, 40, 60], "apaga": [rel("Cybertruck", "B5a"), rel("vendió", "B5a") + 0.2],
     "etiquetas": [{"texto": "No se vendió", "en": rel("vendió", "B5a"), "tono": "negro"}],
     "fuente": f"Foto: Phillip Pessar, CC BY 4.0 · {C}"},
    {"id": "T3_B5_ventas", "tipo": "barras", "start": c["B5"], "end": c["B6"], "titulo": "Cybertruck vendidos en EE. UU.",
     "maximo": 40000,
     "barras": [{"etiqueta": "2024", "valor": 38965, "en": 0.15, "tono": "negro"},
                {"etiqueta": "2025", "valor": 20237, "en": rel("20", "B5"), "tono": "naranja"}],
     "delta": {"texto": "−48%", "en": rel("mitad", "B5")},
     "fuente": "Fuente: Kelley Blue Book, vía Fox Business, 6 nov 2026"},
    {"id": "T3_B6_meta_250mil", "tipo": "barras", "start": c["B6"], "end": c["B7a"], "titulo": "Lo que vendió vs. lo que planeó",
     "maximo": 40000, "reescala": {"maximo": 250000, "en": rel("250", "B6") - 0.1},
     "barras": [{"etiqueta": "2024", "valor": 38965, "en": 0, "tono": "negro"},
                {"etiqueta": "2025", "valor": 20237, "en": 0, "tono": "naranja"},
                {"etiqueta": "Plan al año", "valor": 250000, "en": rel("250", "B6") - 0.1, "tono": "gris"}],
     "fuente": "Fuente: Kelley Blue Book; plan de Tesla (2023) · Fox Business, 6 nov 2026"},
    {"id": "T4_B7a_cybercab_ya_existe", "tipo": "imagen", "start": c["B7a"], "end": c["B7"], "src": D + "cc_gente.jpg",
     "zoom": [1.0, 1.12], "paneo": [50, 50, 55, 55], "etiquetas": [{"texto": "Ya existe", "en": rel("existe", "B7a")}],
     "fuente": f"Foto: JustAnotherCarDesigner, CC0 · {C}"},
    {"id": "T4_B7_linea_de_tiempo", "tipo": "linea", "start": c["B7"], "end": c["B8"], "titulo": "Cybercab",
     "hitos": [{"cuando": "Abr 2026", "texto": "Empieza producción", "en": rel("abril", "B7")},
               {"cuando": "Sep 2026", "texto": "Viajes pagados en Austin", "en": rel("septiembre", "B7")},
               {"cuando": "Mediados 2027", "texto": "Adiós Cybertruck", "en": rel("Tesla", "B7"), "final": True}],
     "nota": {"texto": "Todavía es un programa chico", "en": rel("Todavía", "B7")},
     "fuente": "Fuente: Fox Business y TechCrunch, 6 nov 2026; InsideEVs, abr 2026"},
    {"id": "T5_B8b_no_espero", "tipo": "imagen", "start": c["B8b"], "end": c["B9"], "src": D + "ct_toronto.jpg",
     "zoom": [1.0, 1.14], "paneo": [55, 55, 40, 55],
     "etiquetas": [{"texto": "No esperó", "en": rel("esperó", "B8b")}],
     "fuente": f"Foto: Dillan Payne, CC BY-SA 4.0 · {C}"},
    {"id": "T5_B9_fabrica", "tipo": "fabrica", "start": c["B9"], "end": c["MANUEL"], "izq": "Lo que no vende", "der": "La apuesta: IA",
     "apaga": rel("no", "B9"), "enciende": rel("apuesta", "B9")},
    {"id": "T6_B10_cual_es_tu_cybertruck", "tipo": "texto", "start": c["B10"], "end": c["B10b"], "lineas": ["¿Cuál es tu", "Cybertruck?"],
     "resalta": ["Cybertruck"], "size": 120, "pildora": "En tu negocio"},
    {"id": "T6_B10b_te_quita", "tipo": "lista", "start": c["B10b"], "end": c["B11"], "titulo": "Te quita:",
     "items": ["Tiempo", "Gente", "Dinero"], "check": False,
     "tiempos": [rel("tiempo", "B10b"), rel("gente", "B10b"), rel("dinero", "B10b")],
     "remate": {"texto": "…y ya no te deja nada", "en": rel("deja", "B10b")}},
]
golpes = [
    {"id": "T5_B8_me_volo_la_cabeza", "tipo": "frase", "start": c["B8"], "end": c["B8b"], "arriba": "Esto", "abajo": "me voló\nla cabeza"},
    {"id": "T6_B11_frase_de_cierre", "tipo": "cierre", "start": c["B11"], "end": reel["duracion"]},
]
for x in broll + golpes:
    x["start"], x["end"] = round(x["start"], 3), round(x["end"], 3)

# SFX extra (los automáticos ya ponen whoosh en cada cambio y bass en cada golpe)
sfx = []
for b in broll:
    for e in b.get("etiquetas", []):
        sfx.append({"t": round(b["start"] + e["en"], 3), "s": "pop"})
    if "sello" in b:
        sfx.append({"t": round(b["start"] + b["sello"]["en"], 3), "s": "bass"})
    if b["tipo"] == "barras":
        for x in b["barras"]:
            if x["en"] > 0:
                sfx.append({"t": round(b["start"] + x["en"] + 0.9, 3), "s": "tick"})
        if "delta" in b:
            sfx.append({"t": round(b["start"] + b["delta"]["en"], 3), "s": "pop"})
    if b["tipo"] == "linea":
        for h in b["hitos"]:
            sfx.append({"t": round(b["start"] + h["en"], 3), "s": "pop"})
        sfx.append({"t": round(b["start"] + b["nota"]["en"], 3), "s": "click"})
    if b["tipo"] == "fabrica":
        sfx += [{"t": round(b["start"] + b["apaga"], 3), "s": "click"}, {"t": round(b["start"] + b["enciende"], 3), "s": "bass"}]
    if b["tipo"] == "lista" and "remate" in b:
        sfx.append({"t": round(b["start"] + b["remate"]["en"], 3), "s": "pop"})

reel.update({
    "broll": broll,
    "golpes": golpes,
    "pasos": [],
    "sfx": sorted(sfx, key=lambda s: s["t"]),
    "caraYFuente": 0.64,
    "musica": D + "musica.m4a",
    "portada": {**({"frase": reel["portada"]["frase"]} if reel.get("portada", {}).get("frase") else {}), "cuadro": 0.3},
})
R.write_text(json.dumps(reel, ensure_ascii=False, indent=2), encoding="utf-8")
for x in sorted(broll + golpes, key=lambda x: x["start"]):
    print(f'{x["start"]:6.2f}–{x["end"]:6.2f} ({x["end"]-x["start"]:.1f}s)  {x["id"]}')
