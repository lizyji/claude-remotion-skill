#!/usr/bin/env python3
"""Arma la edición de "50 años: no llegaste tarde a la IA" sobre reel.json (después de preparar.py).

Todos los tiempos salen de las palabras exactas de Manuel (W(i) = inicio de la palabra i).
Uso:  python3 reels/50-no-es-tarde/armar.py
"""
import json, sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI.parent.parent / "scripts"))
from comun import escribir, leer, norm  # noqa: E402

P = AQUI / "reel.json"
reel = leer(P)
pal = reel["palabras"]
VOZ = reel.get("duracionVoz", reel["duracion"])
reel["duracionVoz"] = VOZ
COLA = 2.0  # frase de firma sin voz


def W(i):
    return pal[i]["start"]


def E(i):
    return pal[i]["end"]


# ───────── Subtítulos: bloques a mano (≤5 palabras / 24 car., cortes naturales) ─────────
# (desde, hasta, [palabras clave en naranja])
BLOQUES = [
    (0, 2, ["crees"]), (3, 6, ["50"]), (7, 11, ["tarde", "IA"]), (12, 15, ["difícil"]), (16, 17, ["conseguir"]),
    (18, 20, ["oportunidades"]), (21, 23, ["IA"]), (24, 25, ["tres"]),
    (26, 27, ["técnico"]), (28, 30, ["fondo"]), (31, 32, ["industria"]), (33, 36, ["sistemas"]),
    (37, 39, ["técnico"]), (40, 43, ["fácil"]), (44, 46, ["aprender"]),
    (47, 50, ["industria"]), (51, 55, ["años"]),
    (56, 59, ["esto"]), (60, 62, ["uno"]), (63, 66, ["documento"]), (67, 68, ["quién"]), (69, 70, ["experiencia"]),
    (71, 73, ["gusta"]), (74, 76, ["no"]), (77, 80, ["estilo"]), (81, 84, ["tiempo"]), (85, 87, ["dedicar"]),
    (88, 92, ["dos"]), (93, 97, ["IA"]), (98, 100, ["negocio"]), (101, 104, ["partir"]),
    (105, 109, ["último"]), (110, 110, ["validando"]), (111, 115, ["sentido"]),
    (116, 118, ["necesitas"]), (119, 121, ["definido"]), (122, 125, ["IA"]), (126, 127, ["definirlo"]),
    (128, 130, ["esto"]), (131, 133, ["olvide"]), (134, 135, ["clave"]), (136, 139, ["conocimiento"]), (140, 141, ["nicho"]),
    (142, 145, ["ejemplo"]), (146, 149, ["fábrica"]), (150, 153, ["IA"]), (154, 158, ["fábricas"]), (159, 160, ["digitalizarse"]),
    (161, 163, ["contador"]), (164, 166, ["haciendo"]), (167, 169, ["contabilidad"]), (170, 174, ["todas"]), (175, 177, ["industrias"]),
    (178, 179, ["personas"]), (180, 182, ["IA"]), (183, 184, ["conozcan"]), (185, 186, ["negocios"]),
    (187, 189, ["ayuden"]), (190, 191, ["implementar"]), (192, 194, ["negocio"]), (195, 196, ["conocimiento"]), (197, 199, ["específico"]),
    (200, 202, ["años"]), (203, 205, ["industria"]), (206, 207, ["leo"]), (208, 210, ["comentarios"]), (211, 214, ["guarda"]),
]
assert BLOQUES[-1][1] == len(pal) - 1


def limpia(w):
    return w.rstrip(".,;:")


subs = []
for k, (a, b, claves) in enumerate(BLOQUES):
    ws = pal[a : b + 1]
    sig = W(BLOQUES[k + 1][0]) if k + 1 < len(BLOQUES) else None
    fin = E(b) + 0.25
    if sig is not None and sig - E(b) < 0.6:
        fin = sig
    cl = {norm(c) for c in claves}
    subs.append({
        "start": round(W(a), 3),
        "end": round(min(fin, VOZ), 3),
        "words": [{"w": limpia(w["w"]), "start": w["start"], **({"key": True} if norm(w["w"]) in cl else {})} for w in ws],
    })
    texto = " ".join(x["w"] for x in subs[-1]["words"])
    assert len(ws) <= 5 and len(texto) <= 24, texto
reel["subs"] = subs

# ───────── B-rolls ─────────
def esc(id_, nombre, start, end, **props):
    return {"tipo": "escena", "id": id_, "nombre": nombre, "start": round(start, 3), "end": round(end, 3), "props": props}


T_B2 = W(12)          # "tienes"
T2 = W(18)            # "Para crear oportunidades"
T_B4 = W(37)          # "Y lo técnico…"
T_B5 = W(47)          # "Lo de tu industria…"
T_HAZ = W(56)         # "Así que haz esto"
T3 = W(60)            # "Paso número uno"
T_P2 = W(88)          # "El paso dos"
T_P3 = W(105)         # "El último paso"
T4 = W(116)           # "No necesitas…"
T5 = W(128)           # "Y esto, no se te olvide"
T_B11 = W(142)        # "Por ejemplo"
T_B12 = W(161)        # "Mi contador"
T_B13 = W(178)        # "Necesitan personas…"
T6 = W(200)           # "¿Cuántos años…?"

broll = [
    esc("T1_B1_50-tarde", "escribe", 0.0, T_B2, texto="¿50 años y ya es tarde para la IA?", desde=0.05, hasta=E(11)),
    esc("T2_B3_tres-cosas", "tarjetas", T2, T_B4, titulo="Para crear oportunidades con IA necesitas:",
        items=[{"texto": "Lo técnico", "at": W(26)}, {"texto": "Conocer tu industria", "at": W(28)}, {"texto": "Pensar en sistemas", "at": W(34)}]),
    esc("T2_B4_lo-tecnico", "etiqueta", T_B4, T_B5, titulo="Lo técnico", pildora="lo más fácil de aprender hoy", at=W(43), tono="negro"),
    esc("T2_B5_tu-industria", "etiqueta", T_B5, T_HAZ, titulo="Tu industria", pildora="solo se gana con años", at=W(51), tono="naranja",
        calendario={"desde": W(47) + 0.1, "hasta": E(55), "anios": 25}),
    {"tipo": "tarjeta", "id": "T3_B6a_haz-esto", "start": round(T_HAZ, 3), "end": round(T3, 3), "pildora": "3 pasos", "titulo": "Así que haz esto:"},
    esc("T3_B6_documento", "documento", T3, T_P2, encabezado="Paso 1 · Escribe quién eres",
        titulo={"texto": "Quién soy", "at": W(67)},
        items=[{"texto": "Experiencia", "at": W(70)}, {"texto": "Qué me gusta y qué no", "at": W(71)},
               {"texto": "Estilo de vida", "at": W(78)}, {"texto": "Tiempo", "at": W(84)}]),
    esc("T3_B7_chat-ia", "chat", T_P2, T_P3, encabezado="Paso 2 · Dáselo a la IA", envia=W(92),
        pide={"texto": "Dame oportunidades de negocio", "at": W(97)}, opciones=[W(98), W(98) + 0.3, W(98) + 0.6]),
    esc("T3_B8_valida", "validar", T_P3, T4, encabezado="Paso 3 · Valida las que te hagan sentido",
        taches=[W(110), W(110) + 0.4], ok=W(114), elegida=1),
    esc("T4_B9_negocio-definido", "tachado", T4, T5, antes="Negocio definido", tacha=W(120), despues="La IA te ayuda a definirlo", at=W(122)),
    esc("T5_B10_clave-nicho", "clave", T5, T_B11, previa="No se te olvide:", clave={"texto": "La clave", "at": W(135)},
        frase={"texto": "tu conocimiento de nicho", "at": W(139)}, subraya=W(141)),
    esc("T5_B11_fabricas", "fabricas", T_B11, T_B12, etiqueta={"texto": "Fábrica automotriz", "at": W(149)}, ia=W(152),
        flechas=W(155), otras=[W(157), W(157) + 0.15, W(158)], final={"texto": "Ayuda a otras a digitalizarse", "at": W(160)}),
    esc("T5_B12_contador", "contabilidad", T_B12, T_B13, titulo={"texto": "Contabilidad", "at": W(161) + 0.2},
        pildora={"texto": "Mi contador ya lo hace", "at": W(164)},
        industrias={"texto": "Todas las industrias lo necesitan", "at": W(174), "iconos": [W(176), W(176) + 0.15, W(176) + 0.3, W(176) + 0.45]}),
    esc("T5_B13_formula", "formula", T_B13, T6, encabezado="Necesitan personas que:", a={"texto": "Sabes IA", "at": W(181)},
        b={"texto": "Conoces el negocio", "at": W(184)}, r={"texto": "Lo que todas las industrias necesitan", "at": W(190)},
        extra={"texto": "con conocimiento específico", "at": W(196)}),
    esc("T6_B14_pregunta", "pregunta", T6, VOZ, pregunta="¿Cuántos años llevas en tu industria?", resalta="años",
        comenta={"texto": "Te leo en comentarios", "at": W(206)}, guarda={"texto": "Guárdalo", "at": W(212)}),
]
reel["broll"] = broll

reel["golpes"] = [
    {"tipo": "texto", "id": "T1_B2_lo-mas-dificil", "start": round(T_B2, 3), "end": round(T2 - 0.05, 3), "arriba": "Tienes", "grande": "lo más difícil"},
    {"tipo": "cierre", "id": "T6_B15_firma", "start": round(VOZ, 3), "end": round(VOZ + COLA, 3), "barrido": 1.0},
]
reel["pasos"] = [
    {"start": round(T3, 3), "end": round(T_P2, 3), "n": 1},
    {"start": round(T_P2, 3), "end": round(T_P3, 3), "n": 2},
    {"start": round(T_P3, 3), "end": round(T4, 3), "n": 3},
]

# ───────── Sonido ─────────
# Whoosh SOLO 3 veces (pedido): entrada a las 3 cosas, giro "No necesitas…", frase de firma.
reel["whooshAuto"] = False
sfx = [{"t": round(T2 - 0.12, 3), "s": "whoosh"}, {"t": round(T4 - 0.12, 3), "s": "whoosh"}, {"t": round(VOZ - 0.1, 3), "s": "whoosh"}]
pops = [W(26), W(28), W(34), W(43), W(51), W(70), W(71), W(78), W(84), W(98), W(98) + 0.3, W(98) + 0.6, W(122), W(135), W(139),
        W(152), W(157), W(157) + 0.15, W(158), W(160), W(176), W(176) + 0.15, W(176) + 0.3, W(176) + 0.45, W(181), W(184), W(190), W(206)]
sfx += [{"t": round(t, 3), "s": "pop"} for t in pops]
sfx += [{"t": round(t, 3), "s": "tick"} for t in [W(110), W(110) + 0.4, W(120), W(164), W(212)]]
sfx += [{"t": round(W(114), 3), "s": "click"}]
reel["sfx"] = sorted(sfx, key=lambda x: x["t"])

reel["musica"] = "musica/50-no-es-tarde.wav"
reel["caraYFuente"] = 0.55
reel["cola"] = COLA
reel["duracion"] = round(VOZ + COLA, 3)
reel.setdefault("portada", {"cuadro": 2.3})

escribir(P, reel)
print(f"duración {reel['duracion']} s · {len(broll)} B-rolls · {len(subs)} bloques de subtítulos · {len(sfx)} SFX")
