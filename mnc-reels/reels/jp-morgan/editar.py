#!/usr/bin/env python3
"""Decisiones de edición del reel JP Morgan (se corre después de preparar.py).

Sincroniza cada B-roll con la palabra exacta de Manuel, arma los subtítulos a mano
(≤5 palabras / 24 car., 1–2 claves en naranja) y deja solo 3 whooshes en todo el video.
Uso:  python3 reels/jp-morgan/editar.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "scripts"))
from comun import escribir, leer, norm  # noqa: E402

REEL = Path(__file__).with_name("reel.json")
r = leer(REEL)
P = r["palabras"]
FUENTE = "Fuente: Bloomberg, 28 feb 2017"
FICTICIO = "Ejemplo ilustrativo con datos ficticios"


def at(palabra, n=0):
    """Inicio de la n-ésima aparición de una palabra."""
    hits = [p for p in P if norm(p["w"]) == norm(palabra)]
    return hits[n]["start"]


def r2(x):
    return round(x, 3)


# ---------- Subtítulos (siguen el audio). "*" = palabra clave en naranja ----------
BLOQUES = """JP Morgan revisa | *JP *Morgan
en segundos contratos | *segundos
que a sus abogados | *abogados
les tomaban 360,000 | *360,000
horas al año | *horas
El banco recibe |
unos 12,000 contratos | *12,000
de créditos nuevos | *créditos
al año |
Alguien tenía que leer | *leer
cada uno y sacar |
los datos clave | *datos *clave
Eran 360,000 horas | *360,000
de abogados y oficiales | *abogados
de créditos |
más de 41 años | *41 *años
de trabajo sin parar | *sin *parar
JP Morgan creó | *JP *Morgan
un software llamado COIN | *COIN
que hace esa lectura | *lectura
en segundos | *segundos
y además bajó |
los errores | *errores
porque la mayoría venían |
de interpretar mal | *interpretar
un contrato | *contrato
Te puedes inspirar | *inspirar
en lo que JP Morgan | *JP *Morgan
hizo con su propio software | *software
y hoy lo puedes hacer | *hoy
con Claude | *Claude
Le subes tus contratos | *contratos
tus órdenes de compra | *órdenes
o pólizas | *pólizas
y le pides una tabla | *tabla
con proveedor monto | *proveedor *monto
fecha de vencimiento | *vencimiento
y penalizaciones | *penalizaciones
Y no necesitas | *necesitas
ser JP Morgan | *JP *Morgan
Revisa primero la tabla | *primero
con dos o tres contratos | *dos *tres
que conozcas bien | *conozcas
y luego déjalo trabajar | *trabajar
con el resto | *resto
Y obvio siempre verifica | *verifica
bien todo |
lo que te entrega | *entrega
y a qué lo conectas | *conectas
Así que si todavía no |
sabes cómo implementar |
IA en tu negocio | *IA
esta cuenta es para ti | *cuenta"""

subs, k = [], 0
for linea in BLOQUES.splitlines():
    texto, _, claves = linea.partition("|")
    ws = texto.split()
    keys = {norm(c) for c in claves.split("*") if c.strip()}
    grupo = P[k:k + len(ws)]
    assert [norm(w) for w in ws] == [norm(p["w"]) for p in grupo], (ws, [p["w"] for p in grupo])
    assert len(texto.strip()) <= 27, texto  # 24 car. de texto visible (sin contar la coma)
    k += len(ws)
    subs.append({"start": grupo[0]["start"], "words": [{"w": p["w"].rstrip(".,;:"), "start": p["start"], **({"key": True} if norm(p["w"]) in keys else {})} for p in grupo]})
assert k == len(P), (k, len(P))
for j, s in enumerate(subs):
    ult = P[sum(len(x["words"]) for x in subs[: j + 1]) - 1]["end"]
    sig = subs[j + 1]["start"] if j + 1 < len(subs) else None
    s["end"] = r2(sig if sig is not None and sig - ult < 0.6 else ult + 0.25)
r["subs"] = subs

# ---------- B-rolls (s del video recortado), sincronizados con la frase ----------
t_el = at("El")                     # T2
t_alguien = at("Alguien")
t_eran = at("Eran")
t_de_abog = at("abogados", 1) - 0.2
t_jp2 = at("JP", 1)                 # T3
t_segundos2 = at("en", 1)           # "en segundos" (2a vez)
t_te = at("Te")                     # T4
t_le = at("Le")
t_una = at("una")
t_yno = at("no")
t_revisa = at("Revisa", 1)             # T5
t_luego = at("luego")
t_yobvio = at("obvio")
t_asi = at("Así")                   # T6
E = 0.05  # respiro entre clips

r["broll"] = [
    # T1 · B1 gancho
    {"tipo": "reloj", "start": 0.0, "end": r2(t_el - E), "antes": "JP Morgan", "valor": "360,000", "etiqueta": "horas al año",
     "numeroEn": r2(at("360,000") - 0.1), "etiquetaEn": r2(at("horas")), "fuente": FUENTE, "_id": "T1_B1_360mil_horas"},
    # T2 · B2–B4 problema
    {"tipo": "pila", "start": r2(t_el), "end": r2(t_alguien - E), "valor": 12000, "etiqueta": "contratos al año",
     "llegaEn": r2(at("contratos", 1) - t_el), "fuente": FUENTE, "_id": "T2_B2_pila_contratos"},
    {"tipo": "lupa", "start": r2(t_alguien), "end": r2(t_eran - E), "titulo": "Contrato", "items": ["Monto", "Fecha", "Condiciones"],
     "itemsEn": r2(at("sacar") - t_alguien), "cada": 0.3, "_id": "T2_B3_lupa_datos"},
    {"tipo": "calendario", "start": r2(t_de_abog), "end": r2(t_jp2 - E), "hasta": 41, "etiqueta": "años sin parar",
     "llegaEn": r2(at("41") - t_de_abog + 0.1), "fuente": "Fuente: 360,000 ÷ 8,760 h de un año = 41.1 · Bloomberg, 28 feb 2017", "_id": "T2_B4_41_anos"},
    # T3 · B5–B6 qué hizo JP Morgan
    {"tipo": "imagen", "start": r2(t_jp2), "end": r2(t_segundos2 - E), "src": "reels/jp-morgan/aba_titular.png", "fit": "contain", "zoom": [1.0, 1.2], "foco": [50, 40], "alto": 260, "pildora": "Así lo contó la prensa",
     "texto": "“JPMorgan ahorra 360,000 horas de trabajo de abogados al año”",
     "fuente": "Fuente: Bloomberg, 28 feb 2017 · vía ABA Journal, 2 mar 2017 · abajournal.com", "_id": "T3_B5_titular"},
    {"tipo": "flecha", "start": r2(t_segundos2), "end": r2(t_te - E), "de": "360,000 horas", "a": "segundos", "aEn": 0.3,
     "extra": "Menos errores", "extraEn": r2(at("errores") - t_segundos2), "fuente": FUENTE, "_id": "T3_B6_horas_a_segundos"},
    # T4 · B7–B9 cómo lo haces tú
    {"tipo": "flecha", "start": r2(t_te), "end": r2(t_le - E), "de": "JP Morgan: su propio software", "a": "Hoy: con Claude", "tachar": False,
     "deSize": 64, "aSize": 92, "aEn": r2(at("hoy") - t_te), "_id": "T4_B6b_inspirate"},
    {"tipo": "pendiente", "start": r2(t_le), "end": r2(t_una - E), "id": "B7", "items": ["Contrato", "Orden de compra", "Póliza"],
     "tiempos": [r2(at("contratos", 2) - t_le), r2(at("órdenes") - t_le), r2(at("pólizas") - t_le)], "fuente": FICTICIO, "_id": "T4_B7_subir_documentos"},
    {"tipo": "pendiente", "start": r2(t_una), "end": r2(t_yno - E - 0.03), "id": "B8", "ilumina": True,
     "items": ["Proveedor", "Monto", "Vencimiento", "Penalizaciones"],
     "tiempos": [r2(at("proveedor") - t_una), r2(at("monto") - t_una), r2(at("vencimiento") - t_una), r2(at("penalizaciones") - t_una)],
     "fuente": FICTICIO, "_id": "T4_B8_tabla"},
    {"tipo": "texto", "start": r2(t_yno - 0.03), "end": r2(t_revisa - E), "texto": "No necesitas ser JP Morgan", "resalta": "JP Morgan", "_id": "T4_B9_no_necesitas"},
    # T5 · B10–B11 lección
    {"tipo": "lista", "start": r2(t_revisa), "end": r2(t_yobvio - E - 0.05), "items": ["Prueba con 2–3 contratos que conozcas", "Luego el resto"],
     "tiempos": [0.3, r2(t_luego - t_revisa)], "_id": "T5_B10_checklist"},
    {"tipo": "verifica", "start": r2(t_yobvio - 0.05), "end": r2(t_asi + 0.3), "titulo": "Siempre verifica", "texto": "lo que te entrega y a qué lo conectas", "_id": "T5_B11_verifica"},
]

r["golpes"] = [
    # "360,000" a pantalla completa (1–2 s) cuando lo repite
    {"tipo": "numero", "start": r2(t_eran), "end": r2(t_de_abog), "valor": "360,000", "etiqueta": "horas de abogados", "fuente": FUENTE},
    # T6 · B12 frase de cierre
    {"tipo": "cierre", "start": r2(t_asi), "end": r["duracion"]},
]
r["pasos"] = [
    {"start": r2(t_revisa), "end": r2(t_luego), "n": 1},
    {"start": r2(t_luego), "end": r2(t_yobvio - 0.05), "n": 2},
    {"start": r2(t_yobvio - 0.05), "end": r2(t_asi - E), "n": 3},
]
# Solo 3 whooshes, repartidos: golpe del 360,000 (~13 s), inicio de "cómo lo haces tú" (~26 s), cierre (~49 s)
r["whooshAuto"] = False
r["sfx"] = [{"t": r2(t_eran - 0.08), "s": "whoosh"}, {"t": r2(t_te - 0.08), "s": "whoosh"}, {"t": r2(t_asi - 0.08), "s": "whoosh"}]
r["caraYFuente"] = 0.57
r["musica"] = "reels/jp-morgan/musica.wav"
r.setdefault("portada", {"cuadro": 1.0})
escribir(REEL, r)

for b in r["broll"]:
    print(f'{b["start"]:6.2f}–{b["end"]:6.2f}  {b["end"]-b["start"]:4.1f}s  {b["_id"]}')
for g in r["golpes"]:
    print(f'{g["start"]:6.2f}–{g["end"]:6.2f}  golpe {g["tipo"]}')
print("subs:", len(subs), " duración:", r["duracion"])
