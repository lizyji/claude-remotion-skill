#!/usr/bin/env python3
"""Arma subs, B-rolls y golpes de reel.json sincronizados con las palabras de Manuel.
Uso: python3 reels/muse-mexico/armar.py   (después de scripts/preparar.py)"""
import json, re, unicodedata
from pathlib import Path
R = Path(__file__).parent / "reel.json"
reel = json.loads(R.read_text())
P = reel["palabras"]

# "implementar IA" viene como una sola palabra: se parte en dos
for i, p in enumerate(P):
    if p["w"] == "implementar IA":
        mid = round((p["start"] + p["end"]) / 2, 3)
        P[i:i + 1] = [{**p, "w": "implementar", "end": mid}, {**p, "w": "IA", "start": mid}]
        break

norm = lambda s: re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFD", s.lower()).encode("ascii", "ignore").decode())
limpiar = lambda w: re.sub(r"[.,;:]+$", "", w)

# Bloques a mano (máx 5 palabras / 24 car.); *palabra* = naranja
BLOQUES = """Muse ya llegó a *México*
Es el nuevo *agente*
de *Meta*
que manda *correos*
llena *formularios*
y hasta *compra* por ti
Y sigue *trabajando*
aunque *cierres* la app
Suena *increíble*
pero ¿te da *miedo*
darle *acceso* a tu correo
o a tu *tarjeta?*
*Normal*
Ningún *dueño* quiere
un agente que le *mande*
un correo *mal*
a un *cliente*
o que *compre* algo
que nadie *autorizó*
Lo *interesante* aquí
es cómo lo *armaron*
Según *Meta*
Muse tiene *tres* *reglas*
*Uno* antes de mandar
un correo o comprar algo
te pide *permiso*
*Dos* tú *decides*
a qué *entra*
y qué puede *hacer*
Por *ejemplo*
solo *leer* tu correo
o también *mandar*
*Tres* te enseña todo
lo que *hizo*
y lo que *piensa* hacer
Y a mí esto
me voló la *cabeza*
Tiene un *segundo* agente
que no hace nada más
que *vigilar* al primero
Nada sale a *internet*
si ese *vigilante*
no lo *aprueba*
Esa es la *lección*
para tu *negocio*
Antes de darle *trabajo*
a un *agente*
define *tres* cosas
¿Qué puede *tocar?*
¿Qué *necesita*
tu *visto* *bueno?*
¿Y dónde queda
el *registro?*
Y *empieza*
con que solo *lea*
que *mande* después
Y si todavía no sabes
cómo implementar IA
en tu negocio
esta cuenta es para ti""".splitlines()

subs, k = [], 0
grupos = []
for linea in BLOQUES:
    toks = linea.split()
    g = []
    for tk in toks:
        p = P[k]
        assert norm(tk) == norm(p["w"]), (linea, tk, p["w"])
        g.append({"w": limpiar(p["w"]), "start": p["start"], **({"key": True} if tk.startswith("*") else {}), "_end": p["end"]})
        k += 1
    grupos.append(g)
assert k == len(P), (k, len(P))
for j, g in enumerate(grupos):
    sig = grupos[j + 1][0]["start"] if j + 1 < len(grupos) else None
    fin = g[-1]["_end"] + 0.25
    if sig is not None and sig - g[-1]["_end"] < 0.6:
        fin = sig
    for w in g:
        w.pop("_end")
    assert len(" ".join(w["w"] for w in g)) <= 24 and len(g) <= 5, g
    subs.append({"start": g[0]["start"], "end": round(fin, 3), "words": g})

def t(frase, n=0):
    """Inicio de la n-ésima aparición de la frase (palabras consecutivas)."""
    ws = [norm(x) for x in frase.split()]
    hits = [i for i in range(len(P)) if [norm(P[i + j]["w"]) for j in range(len(ws)) if i + j < len(P)] == ws]
    return P[hits[n]]["start"]

FM = "Fuente: Meta, 8 sep 2026 · about.fb.com"
cierre = t("Y si todavía")
b = []
def add(**x):
    b.append({k: (round(v, 3) if isinstance(v, float) else v) for k, v in x.items()})

# TOMA 1
add(id="T1_B1_titular_expansion", tipo="imagen", start=0.0, end=t("que manda correos"), src="reels/muse-mexico/expansion_titular.png",
    alto=464, zoom=[1, 1.04], encima="Muse ya llegó a México", fuente="Fuente: Expansión, 5 nov 2026 · expansion.mx")
add(id="T1_B2_video_meta", tipo="video", start=t("que manda correos"), end=t("pero te da"), src="reels/muse-mexico/muse_shopping.mp4",
    desde=5.6, recorte={"x": 0.222, "y": 0.42, "w": 0.557, "h": 0.40}, fuente="Fuente: Meta, 8 sep 2026 · video oficial Muse_Shopping")
# TOMA 2
s = t("pero te da")
add(id="T2_B3_acceso_correo_tarjeta", tipo="pregunta", start=s, end=t("Ningún dueño"),
    items=[{"icono": "sobre", "texto": "¿Acceso a tu correo?"}, {"icono": "tarjeta", "texto": "¿A tu tarjeta?"}],
    tiempos=[t("acceso") - s - 0.1, t("tarjeta") - s - 0.25])
s = t("Ningún dueño")
add(id="T2_B4_correo_error_carrito", tipo="correo", start=s, end=t("Lo interesante"), carritoEn=t("o que compre") - s, fuente="Ejemplo ilustrativo")
# TOMA 3
s = t("Lo interesante")
add(id="T3_B5_titular_meta", tipo="imagen", start=s, end=t("Uno antes"), src="reels/muse-mexico/meta_titular.png", alto=372,
    zoom=[1, 1.05], pildora={"texto": "Según Meta: 3 reglas", "en": t("tres reglas") - s}, fuente=FM)
add(id="T3_B6_regla1_permiso", tipo="regla", start=t("Uno antes"), end=t("Dos tú"), n=1, titulo="Te pide permiso antes de mandar o comprar", extra="permiso", fuente=FM)
add(id="T3_B7_regla2_accesos", tipo="regla", start=t("Dos tú"), end=t("Tres te"), n=2, titulo="Tú decides a qué entra: leer o también mandar", extra="accesos", fuente=FM)
add(id="T3_B8_regla3_historial", tipo="regla", start=t("Tres te"), end=t("Y a mí"), n=3, titulo="Te enseña todo lo que hizo", extra="historial", fuente=FM)
# TOMA 4
add(id="T4_B11_agente_vigila", tipo="texto", start=t("Y a mí"), end=t("Tiene un segundo"), lineas=["Un agente", "que vigila", "al otro"], naranja=["vigila"], cada=0.35, size=110)
s = t("Tiene un segundo")
add(id="T4_B9_B10_diagrama", tipo="diagrama", start=s, end=t("Esa es la"), alto=t("vigilar al primero") - s + 0.2, aprueba=t("aprueba") - s, fuente=FM)
# TOMA 5
s = t("Antes de darle trabajo")
add(id="T5_B12_B13_checklist", tipo="lista", start=s, end=t("Y empieza"), titulo="Antes de darle trabajo a un agente:",
    items=["Qué puede tocar", "Qué necesita tu visto bueno", "Dónde queda el registro"],
    tiempos=[t("Qué puede tocar") - s, t("Qué necesita") - s, t("Y dónde queda") - s])
s = t("Y empieza")
add(id="T5_B14_primero_lea", tipo="texto", start=s, end=cierre, lineas=["Primero que lea.", "Después que mande."], naranja=["lea.", "mande."],
    cada=t("que mande") - s - 0.1, size=92)

reel["palabras"] = P
reel["subs"] = subs
reel["broll"] = b
reel["golpes"] = [{"tipo": "cierre", "start": cierre, "end": reel["duracion"]}]
reel["pasos"] = []
reel["musica"] = "reels/muse-mexico/musica.wav"
reel["caraYFuente"] = 0.66
reel.setdefault("portada", {"cuadro": 1.0})
R.write_text(json.dumps(reel, ensure_ascii=False, indent=2))
for x in b:
    print(f'{x["start"]:6.2f}-{x["end"]:6.2f} ({x["end"]-x["start"]:.1f}s) {x["id"]}')
print("cierre", cierre, "→", reel["duracion"])
