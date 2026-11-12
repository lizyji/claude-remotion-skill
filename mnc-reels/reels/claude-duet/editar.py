#!/usr/bin/env python3
"""Decisión de edición del reel "Claude Duet": B-rolls, golpes y subtítulos sincronizados con
las palabras EXACTAS de Manuel (tiempos del video ya recortado, en reel.json → "palabras").

Uso (después de scripts/preparar.py):  python3 reels/claude-duet/editar.py
"""
import json, re, sys, unicodedata
from pathlib import Path

AQUI = Path(__file__).resolve().parent
P = AQUI / "reel.json"
reel = json.loads(P.read_text(encoding="utf-8"))
W = reel["palabras"]


def n(s):
    s = unicodedata.normalize("NFD", s.lower())
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in s if unicodedata.category(c) != "Mn"))


def t(frase, desde=0.0, fin=False):
    """Inicio (o fin) de la primera aparición de `frase` a partir de `desde` segundos."""
    toks = [n(x) for x in frase.split()]
    for i in range(len(W) - len(toks) + 1):
        if W[i]["start"] < desde - 0.01:
            continue
        if all(n(W[i + k]["w"]) == toks[k] for k in range(len(toks))):
            return round(W[i + len(toks) - 1]["end"] if fin else W[i]["start"], 3)
    sys.exit(f"No encontré «{frase}» después de {desde}")


FONDO_CAP = "#FAF9F5"  # fondo propio de las capturas de claude.com (para que no se vea el borde)
F_ANUNCIO = "Fuente: Anthropic, 21 oct 2026 · claude.com"
F_PRODUCTO = "Fuente: Anthropic · claude.com/product/claude-duet"
R = "reels/claude-duet/"

# ---- marcas de tiempo (palabras exactas) ----
T = {
    "seLlama": t("Se llama"),
    "esUna": t("es una app"),
    "laConectas": t("la conectas"),
    "revisa": t("Revisa"),
    "imaginate": t("Imagínate"),
    "lePides": t("le pides"),
    "yEl": t("y él sigue"),
    "yLoQue": t("Y lo que me gustó"),
    "teTieneLaUltima": t("y tú sigues"),
    "yAMi": t("Y a mí"),
    "noLe": t("no le delegues"),
    "todoEsto": t("todo esto que"),
    "importante": t("importante", 38),
    "porAhora": t("Por ahora"),
    "si": t("Si todavía"),
}
D = reel["duracion"]
rel = lambda frase, b0, desde=None: round(t(frase, desde if desde is not None else b0) - b0, 3)

broll = []
# TOMA 1 · Gancho
b0, b1 = 0.0, t("te dice")
broll.append({"tipo": "logo", "start": b0, "end": b1, "src": R + "B1_logo_claude_duet.png", "nombre": "Claude Duet", "etiqueta": "Nuevo de Anthropic", "fuente": F_PRODUCTO})
b0, b1 = b1, T["seLlama"]
broll.append({"tipo": "imagen", "start": b0, "end": b1, "src": R + "B2_titular.png", "fit": "contain", "fondo": FONDO_CAP, "zoom": [1, 1.06],
              "etiqueta": "21 oct 2026", "etiquetaEn": 0.5, "fuente": F_ANUNCIO})
# TOMA 2 · Qué es
b0, b1 = T["seLlama"], T["esUna"]
broll.append({"tipo": "imagen", "start": b0, "end": b1, "src": R + "B3_producto.png", "fit": "contain", "fondo": FONDO_CAP, "zoom": [1, 1.08], "foco": [30, 30], "fuente": F_PRODUCTO})
b0, b1 = T["esUna"], T["laConectas"]
broll.append({"tipo": "imagen", "start": b0, "end": b1, "src": R + "B3_app_resumen.png", "fit": "cover", "fondo": FONDO_CAP, "zoom": [1.0, 1.1], "foco": [50, 0],
              "etiqueta": "App aparte · celular y compu", "etiquetaEn": 0.3, "fuente": F_PRODUCTO})
b0, b1 = T["laConectas"], T["revisa"]
broll.append({"tipo": "conectar", "start": b0, "end": b1, "centro": "Claude Duet", "centroImg": R + "B1_logo_claude_duet.png",
              "items": [{"icono": "correo", "texto": "Correo", "en": rel("correo", b0)},
                        {"icono": "calendario", "texto": "Calendario", "en": rel("calendario", b0)},
                        {"icono": "herramientas", "texto": "Herramientas", "en": rel("herramientas", b0)}],
              "final": {"texto": "Tu asistente", "en": rel("asistente", b0)}})
b0, b1 = T["revisa"], T["imaginate"]
broll.append({"tipo": "lista", "start": b0, "end": b1, "items": ["Revisa", "Te avisa", "Hace tareas"],
              "en": [0.1, rel("avisa", b0) - 0.1, rel("hace", b0) - 0.1]})
# TOMA 3 · Cómo se ve un día
b0, b1 = T["imaginate"], T["lePides"]
broll.append({"tipo": "notificacion", "start": b0, "end": b1,
              "antes": {"icono": "sol", "texto": "Te despiertas…", "en": rel("despiertas", b0) - 0.2},
              "titulo": "Esto necesita tu atención hoy", "tituloEn": rel("lo importante", b0),
              "items": [{"icono": "correo", "texto": "Correo urgente", "en": rel("correo", b0)},
                        {"icono": "junta", "texto": "Junta de hoy", "en": rel("junta", b0)},
                        {"icono": "pendiente", "texto": "Pendiente", "en": rel("quedó", b0)}]})
b0, b1 = T["lePides"], T["yEl"]
broll.append({"tipo": "junta", "start": b0, "end": b1, "pedido": "Prepárame algo", "salida": "Te vas a tu junta",
              "salidaEn": rel("te vas", b0), "barra": "Claude trabajando…"})
b0, b1 = T["yEl"], T["yLoQue"]
broll.append({"tipo": "nube", "start": b0, "end": b1, "titulo": "En su propia compu en la nube",
              "items": ["Revisa", "Prepara", "Termina"], "en": [0.5, rel("computadora", b0), rel("nube", b0)]})
# TOMA 4 · Lo que no hace solo
b0, b1 = T["yLoQue"], T["teTieneLaUltima"]
broll.append({"tipo": "candados", "start": b0, "end": b1,
              "items": [{"texto": "Mandar", "en": rel("mandar", b0)}, {"texto": "Pagar", "en": rel("pagar", b0)},
                        {"texto": "Firmar", "en": rel("firmar", b0)}, {"texto": "Borrar", "en": rel("borrar", b0)}],
              "sello": "Te pide permiso", "selloEn": rel("te pide", b0)})
b0, b1 = T["teTieneLaUltima"], T["yAMi"]
broll.append({"tipo": "imagen", "start": b0, "end": b1, "src": R + "B9_aprobar.png", "fit": "contain", "fondo": FONDO_CAP, "zoom": [1, 1.05],
              "marco": {"w": 860, "h": 540}, "etiqueta": "Tú tienes la última palabra", "etiquetaEn": rel("última", b0), "fuente": F_PRODUCTO})
# TOMA 5 · Lo que me voló la cabeza (B10 = golpe a pantalla completa, abajo)
b0, b1 = T["noLe"], T["todoEsto"]
broll.append({"tipo": "contraste", "start": b0, "end": b1, "pildora": "Mi consejo",
              "no": "Las decisiones", "noEn": rel("decisiones", b0), "si": "La revisada", "siEn": rel("delégale", b0)})
b0, b1 = T["importante"], T["porAhora"]
broll.append({"tipo": "columnas", "start": b0, "end": b1,
              "izq": {"titulo": "Claude revisa", "en": 0.0,
                      "items": [{"icono": "correo", "texto": "Correos", "en": rel("correos", b0)},
                                {"icono": "pendiente", "texto": "Pendientes", "en": rel("pendientes", b0)},
                                {"icono": "campana", "texto": "Avisos", "en": rel("avisos", b0)}]},
              "der": {"titulo": "Tú decides", "en": rel("y tú te quedas", b0),
                      "items": [{"icono": "ojo", "texto": "Lo que necesita tu criterio", "en": rel("necesita", b0)}]}})
# TOMA 6 · Cierre
b0, b1 = T["porAhora"], T["si"]
broll.append({"tipo": "imagen", "start": b0, "end": b1, "src": R + "B12_lista_espera.png", "fit": "contain", "fondo": FONDO_CAP, "zoom": [1, 1.06],
              "marco": {"w": 960, "h": 420}, "etiqueta": "Lista de espera", "etiquetaEn": rel("lista", b0), "fuente": F_ANUNCIO})

# Nombres de los B-rolls sueltos (toma_clip_descripcion), en el orden de arriba
IDS = ["T1_B1_logo", "T1_B2_titular", "T2_B3_producto", "T2_B3_app", "T2_B4_conectar", "T2_B4b_revisa_avisa",
       "T3_B5_notificacion", "T3_B6_junta", "T3_B7_nube", "T4_B8_candados", "T4_B9_aprobar",
       "T5_B11a_consejo", "T5_B11_columnas", "T6_B12_lista_espera"]
assert len(IDS) == len(broll)
for b, i in zip(broll, IDS):
    b["id"] = i

golpes = [
    {"tipo": "jugada", "start": T["yAMi"], "end": T["noLe"], "arriba": "Esto me voló", "abajo": "la cabeza", "id": "T5_B10_me_volo_la_cabeza"},
    {"tipo": "cierre", "start": T["si"], "end": D, "id": "T6_B13_frase_cierre"},
]

# ---- subtítulos: bloques a mano por frase natural (≤5 palabras / 24 caracteres) ----
BLOQUES = """
*Anthropic* acaba de sacar
un *Claude* que no espera
que le *preguntes*
te dice qué *necesita*
tu *atención*
antes de que
tú lo *veas*
Se llama *Claude* *Duet*
es una app *aparte*
en el *celular*
y en la *compu*
la *conectas* a tu correo
tu *calendario*
tus *herramientas*
y *Claude* empieza
a trabajar como
un *asistente*
*Revisa* te avisa
y hace *tareas*
*Imagínate*
te *despiertas*
y *Claude* ya te dejó
lo *importante* del día
qué *correo* urge
qué *junta* tienes
qué quedó *pendiente*
le pides que
*prepare* algo
te vas a tu *junta*
y él sigue *trabajando*
en su propia *computadora*
en la *nube*
Y lo que me *gustó*
antes de *mandar*
un mensaje
*pagar* algo
o *firmar*
o *borrar* tu información
te pide *permiso*
y tú sigues teniendo
la última *palabra*
Y a mí esto es
lo que me voló
la cabeza
no le *delegues*
las *decisiones*
*delégale* la *revisada*
todo esto que *revisas*
a *diario*
para ver si hay algo
*importante*
*correos*
*pendientes*
*avisos*
eso es lo *primero*
que le das
y tú te *quedas*
con el que sí necesita
tu *criterio*
Por ahora está
en *prueba*
con lista de *espera*
*apúntate*
y empieza por ahí
Si todavía no sabes
cómo implementar *IA*
en tu negocio
esta cuenta es para ti
"""
subs, i = [], 0
lineas = [l.split() for l in BLOQUES.strip().splitlines()]
for li, toks in enumerate(lineas):
    ws = []
    for tk in toks:
        key = tk.startswith("*")
        txt = tk.strip("*")
        if n(W[i]["w"]) != n(txt):
            sys.exit(f"Subtítulo «{txt}» no coincide con la palabra «{W[i]['w']}» ({W[i]['start']})")
        ws.append({"w": txt, "start": W[i]["start"], **({"key": True} if key else {})})
        i += 1
    texto = " ".join(w["w"] for w in ws)
    if len(ws) > 5 or len(texto) > 24:
        print(f"AVISO: bloque largo ({len(ws)} pal., {len(texto)} car.): {texto}")
    subs.append({"start": ws[0]["start"], "words": ws})
assert i == len(W), f"Sobran palabras sin subtítulo desde «{W[i]['w']}»"
for k, s in enumerate(subs):
    sig = subs[k + 1]["start"] if k + 1 < len(subs) else D
    ult = W[[w["start"] for w in W].index(s["words"][-1]["start"])]["end"]
    s["end"] = round(sig if sig - ult < 0.6 else ult + 0.25, 3)

reel.update({
    "caraYFuente": 0.6,
    "musica": "musica/lofi_mnc.m4a",
    "broll": broll,
    "golpes": golpes,
    "pasos": [],
    "sfx": [],
    "subs": subs,
})
reel.setdefault("portada", {})
reel["portada"]["cuadro"] = 5.0  # Manuel sonriendo, ojos abiertos (la frase aún no llega)
P.write_text(json.dumps(reel, ensure_ascii=False, indent=2), encoding="utf-8")
for b in broll:
    print(f'{b["start"]:6.2f}–{b["end"]:6.2f}  ({b["end"] - b["start"]:.1f} s)  {b["tipo"]}  {b.get("src", "").split("/")[-1]}')
for g in golpes:
    print(f'{g["start"]:6.2f}–{g["end"]:6.2f}  GOLPE {g["tipo"]}')
print(f"{len(subs)} bloques de subtítulos · duración {D} s")
