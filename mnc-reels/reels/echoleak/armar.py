#!/usr/bin/env python3
"""Decisiones de edición del reel EchoLeak: B-rolls, golpes, SFX y subtítulos curados.

Corre después de scripts/preparar.py (que deja duracion, cortes y palabras en reel.json).
Uso:  python3 reels/echoleak/armar.py
"""
import json, re
from pathlib import Path

P = Path(__file__).with_name("reel.json")
r = json.loads(P.read_text(encoding="utf-8"))
pal = r["palabras"]


def at(palabra, n=1, desde=0.0):
    """Inicio de la n-ésima aparición de `palabra` a partir de `desde` (s)."""
    k = 0
    for w in pal:
        if w["start"] >= desde and re.sub(r"[.,;:?!]+$", "", w["w"]).lower() == palabra.lower():
            k += 1
            if k == n:
                return w["start"]
    raise SystemExit(f"No encontré '{palabra}' (#{n}) desde {desde}")


FUENTE_THN = "Fuente: The Hacker News, 12 jun 2025 · thehackernews.com"
FUENTE_AIM = "Fuente: Aim Security / Microsoft, junio 2025"
DUR = r["duracion"]

t_en = at("En")                      # inicio toma 2
t_el = at("El", desde=14)            # "El correo traía…"
t_la = at("La", desde=19)            # "La falla…"
t_y = at("Y", desde=24)              # "Y para que esto no te pase"
t_si = at("Si")                      # "Si lo conectas…"
t_asi2 = at("Así", 2)                # "Así que comenta brújula"

cortes = {
    "B1": 0.0, "B2": at("Así"), "B3": t_en - 0.06, "B3b": at("que", desde=10.5) + 0.12,
    "B4": t_el - 0.06, "B5": at("con", desde=17) + 0.2, "B6": t_la - 0.04,
    "B7": at("y", desde=23) - 0.1, "B8": t_y, "B9": at("tiempo", desde=28.5) - 0.05,
    "B10": at("información", desde=36) - 0.05, "B11": at("a", desde=38) + 0.1,
    "G": t_asi2 - 0.05, "B12": at("el", desde=42.5) + 0.0, "B13": at("con", desde=45.8) - 0.04,
}

broll = [
    {"tipo": "anim", "anim": "sobre", "start": cortes["B1"], "end": cortes["B2"], "marcas": [at("un")]},
    {"tipo": "anim", "anim": "alto", "start": cortes["B2"], "end": cortes["B3"],
     "marcas": [at("antes"), at("tu"), at("a", desde=5.8), at("mira")]},
    {"tipo": "imagen", "src": "reels/echoleak/thn_titular.png", "start": cortes["B3"], "end": cortes["B3b"],
     "fit": "contain", "zoom": [1.0, 1.07], "foco": [50, 10], "fuente": FUENTE_THN},
    {"tipo": "imagen", "src": "reels/echoleak/thn_titular.png", "start": cortes["B3b"], "end": cortes["B4"],
     "fit": "contain", "zoom": [1.45, 1.7], "foco": [40, 85], "fuente": FUENTE_THN},
    {"tipo": "anim", "anim": "lupa", "start": cortes["B4"], "end": cortes["B5"], "marcas": [at("escondidas")], "fuente": FUENTE_AIM},
    {"tipo": "anim", "anim": "asistente", "start": cortes["B5"], "end": cortes["B6"],
     "marcas": [at("leyera"), at("usuario"), at("otra")], "fuente": FUENTE_AIM},
    {"tipo": "anim", "anim": "medidor", "start": cortes["B6"], "end": cortes["B7"], "marcas": [at("9.3")], "fuente": FUENTE_AIM},
    {"tipo": "anim", "anim": "sello", "start": cortes["B7"], "end": cortes["B8"], "marcas": [at("corrigió")], "fuente": FUENTE_AIM},
    {"tipo": "anim", "anim": "regla", "start": cortes["B8"], "end": cortes["B9"], "marcas": [at("clave"), at("tres")]},
    {"tipo": "anim", "anim": "circulos", "start": cortes["B9"], "end": cortes["B10"],
     "marcas": [at("No", desde=31), at("datos", desde=33), at("contenido"), at("capacidad") + 0.1]},
    {"tipo": "anim", "anim": "juntos", "start": cortes["B10"], "end": cortes["B11"]},
    {"tipo": "anim", "anim": "borradores", "start": cortes["B11"], "end": cortes["G"],
     "marcas": [at("borradores"), at("revises")]},
    {"tipo": "anim", "anim": "brujula", "start": cortes["B12"], "end": cortes["B13"], "marcas": [at("link"), at("agentes", desde=44)]},
    {"tipo": "anim", "anim": "clases", "start": cortes["B13"], "end": DUR,
     "marcas": [at("gratis"), at("cada", desde=46), at("guarda")]},
]
r["clips"] = [
    "T1_B1_sobre_1_correo", "T1_B2_antes_de_conectar", "T2_B3_titular_echoleak", "T2_B3b_titular_zoom",
    "T2_B4_instrucciones_ocultas", "T2_B5_asistente_lee_correo", "T3_B6_medidor_9_3", "T3_B7_corregido",
    "T4_B8_regla_3_permisos", "T4_B9_tres_permisos", "T4_B10_nunca_los_tres", "T5_B11_borradores",
    "T6_B12_comenta_brujula", "T6_B13_clases_gratis",
]
r["broll"] = [{k: (round(v, 3) if isinstance(v, float) else v) for k, v in b.items()} for b in broll]
r["golpes"] = [{"tipo": "brujula", "start": round(cortes["G"], 3), "end": round(cortes["B12"], 3)}]
r["pasos"] = []
r["whoosh"] = [round(cortes["B3"], 3), round(cortes["B8"], 3), round(cortes["G"], 3)]  # solo 3, repartidos
r["musica"] = "reels/echoleak/musica.wav"
r["caraYFuente"] = 0.56

s = lambda t, x: {"t": round(t, 3), "s": x}
r["sfx"] = [
    s(at("un") + 0.05, "pop"), s(cortes["B2"] + 0.05, "pop"),
    s(at("escondidas"), "tick"), s(cortes["B5"] + 0.12, "pop"), s(at("leyera"), "click"), s(at("usuario"), "pop"),
    s(at("9.3") + 0.1, "tick"), s(at("corrigió"), "pop"), s(at("tres"), "pop"),
    s(at("No", desde=31), "pop"), s(at("datos", desde=33), "pop"), s(at("contenido"), "pop"), s(at("capacidad") + 0.1, "pop"),
    s(cortes["B10"] + 0.45, "bass"), s(at("borradores"), "pop"), s(at("revises") + 0.45, "click"),
    s(at("agentes", desde=44), "pop"), s(at("gratis"), "pop"), s(at("guarda"), "click"),
]

# ── Subtítulos curados (siguen el audio): (n.º de palabras, palabras clave en naranja)
GRUPOS = [
    (4, ["Microsoft"]), (2, ["datos"]), (4, ["correo"]),
    (3, []), (4, ["conectar"]), (5, ["IA"]), (3, ["video"]),
    (3, ["2025"]), (3, ["Aim", "Security"]), (1, ["descubrieron"]), (4, ["Copilot"]),
    (3, ["sacar"]), (2, ["confidencial"]), (4, ["correo"]),
    (3, ["correo"]), (2, ["escondidas"]), (2, ["bastaba"]), (3, ["Copilot"]), (2, ["leyera"]),
    (3, ["usuario"]), (4, ["otra", "cosa"]),
    (4, ["falla"]), (4, ["9.3"]), (2, ["gravedad"]), (2, ["Microsoft"]), (3, ["corrigió"]),
    (4, []), (3, ["pase"]), (3, ["clave"]), (4, ["permiso"]), (3, ["tres"]), (3, ["mismo", "tiempo"]),
    (2, ["agentes"]), (2, ["inteligencia"]), (1, ["artificial"]),
    (3, []), (3, ["mismo", "tiempo"]), (3, ["agente"]), (3, ["privados"]), (3, ["fuera"]), (3, ["capacidad"]), (3, ["mandar"]),
    (3, ["conectas"]), (3, ["correo"]), (3, ["solamente"]), (4, ["borradores", "revises"]),
    (4, ["brújula"]), (5, ["link"]), (2, []), (3, ["comunidad"]), (2, []), (3, ["agentes"]), (2, ["riesgos"]),
    (3, ["gratis"]), (2, ["semana"]), (4, ["guarda"]),
]
assert sum(n for n, _ in GRUPOS) == len(pal), (sum(n for n, _ in GRUPOS), len(pal))
limpio = lambda w: re.sub(r"[.,;:]+$", "", w)
subs, i = [], 0
grupos = []
for n, keys in GRUPOS:
    grupos.append((pal[i:i + n], keys))
    i += n
for j, (g, keys) in enumerate(grupos):
    sig = grupos[j + 1][0][0]["start"] if j + 1 < len(grupos) else None
    fin = g[-1]["end"] + 0.25
    if sig is not None and sig - g[-1]["end"] < 0.6:
        fin = sig
    texto = " ".join(limpio(w["w"]) for w in g)
    assert len(texto) <= 24, texto
    subs.append({
        "start": round(g[0]["start"], 3), "end": round(min(fin, DUR), 3),
        "words": [{"w": limpio(w["w"]), "start": w["start"], **({"key": True} if limpio(w["w"]) in keys else {})} for w in g],
    })
r["subs"] = subs
r["portada"] = {"cuadro": 5.2}  # frase pendiente: llega después
P.write_text(json.dumps(r, ensure_ascii=False, indent=2), encoding="utf-8")
for b, c in zip(r["broll"], r["clips"]):
    print(f'{b["start"]:6.2f}–{b["end"]:6.2f}  {c}')
print("golpe", r["golpes"], "whoosh", r["whoosh"])
for x in subs:
    print(f'{x["start"]:6.2f}  ' + " ".join(("*" + w["w"] + "*") if w.get("key") else w["w"] for w in x["words"]))
