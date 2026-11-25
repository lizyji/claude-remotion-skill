#!/usr/bin/env python3
"""Decisión de edición del reel pedido-espera: B-rolls, golpes, subtítulos a mano, SFX y portada.
Corre después de scripts/preparar.py (usa las palabras ya re-mapeadas de reel.json)."""
import json
from pathlib import Path
p = Path(__file__).with_name("reel.json")
R = json.loads(p.read_text())
P = R["palabras"]
FUENTE_HBR = "Fuente: Michael Hammer, Harvard Business Review, 1990"

B = [  # (clave, nombre de entrega, inicio, fin)
    ("B1", "T1_B1_dias_vs_minutos", 0.0, 3.3),
    ("B2", "T1_B2_donde_se_va", 3.3, 4.3),
    ("B3", "T2_B3_caso_aseguradora", 4.3, 7.9),
    ("B4", "T2_B4_cita_hbr", 7.9, 12.6),
    ("B5", "T3_B5_ventas_correo_aprobacion", 12.6, 18.25),
    ("B6", "T3_B6_escritorio_fulano", 18.25, 21.5),
    ("B7", "T3_B7_espera", 21.5, 25.05),
    ("B8", "T4_B8_trabajar_mas_rapido", 26.1, 28.7),
    ("B9", "T4_B9_comprar_otro_sistema", 28.7, 32.45),
    ("B10", "T5_B10_una_semana", 32.45, 35.0),
    ("B11", "T5_B11_tabla_area_entra_sale", 35.0, 39.6),
    ("B12", "T5_B12_aqui_se_queda_parado", 39.6, 44.5),
]
R["broll"] = [
    {"tipo": "anim", "id": f"pedido/{k}", "nombre": n, "start": s, "end": e, **({"fuente": FUENTE_HBR} if k == "B4" else {}),
     **({"sale": False} if k == "B11" else {}), **({"entra": False} if k == "B12" else {})}
    for k, n, s, e in B
]
R["golpes"] = [{"tipo": "pregunta", "id": "pedido/B13", "nombre": "T6_B13_pregunta_cierre", "start": 44.2, "end": R["duracion"]}]
R["pasos"] = []
R["musica"] = "reels/pedido-espera/musica.wav"
R["caraYFuente"] = 0.57
# "Y aquí está la jugada": se queda en el audio, sin texto en pantalla
R["sinSubs"] = [{"start": 25.05, "end": 26.15}]
R["whooshAuto"] = False
R["sfxAuto"] = False
R["sfx"] = (
    # whoosh solo 3 veces: entrada a "en tu empresa", a "la postura" y al cierre
    [{"t": 12.52, "s": "whoosh"}, {"t": 26.02, "s": "whoosh"}, {"t": 44.12, "s": "whoosh"}]
    # efectos de elemento: solo 6 en todo el video, en los momentos clave
    + [
        {"t": 2.7, "s": "tick", "vol": 0.45},    # rayita "Minutos"
        {"t": 10.6, "s": "tick", "vol": 0.45},   # "17 minutos"
        {"t": 27.85, "s": "click", "vol": 0.5},  # X "Trabajar más rápido"
        {"t": 29.7, "s": "click", "vol": 0.5},   # X "Comprar otro sistema"
        {"t": 41.2, "s": "bass", "vol": 0.4},    # "Aquí se queda parado"
        {"t": 46.8, "s": "pop", "vol": 0.45},    # compartir
    ]
)

# Subtítulos a mano (≤5 palabras / 24 car., sin terminar en artículo/preposición). (i_inicio, i_fin, palabras clave)
CORTES = [
    (0, 3, {"días"}), (4, 5, set()), (6, 9, {"trabajo"}), (10, 11, {"minutos"}), (12, 16, {"resto"}),
    (17, 19, {"caso"}), (20, 22, {"90s"}), (23, 25, {"aseguradora"}), (26, 29, set()),
    (30, 32, {"tardaba"}), (33, 35, {"semanas"}), (36, 39, set()), (40, 41, {"minutos"}), (42, 45, {"esperar"}),
    (46, 49, {"empresa"}), (50, 52, set()),
    (53, 56, {"Ventas"}), (57, 60, {"correo"}), (61, 63, {"aprobación"}),
    (64, 67, {"escritorio"}), (68, 69, set()), (70, 71, {"almacén"}), (72, 73, {"facturación"}),
    (74, 77, {"minutos"}), (78, 81, set()), (82, 86, {"pase"}), (87, 88, set()),
    (94, 97, set()), (98, 101, {"rápido"}), (102, 105, {"nada"}),
    (106, 109, {"sistema"}), (110, 110, set()), (111, 114, set()), (115, 118, {"esperando"}),
    (119, 123, set()), (124, 125, {"primero"}), (126, 128, {"semana"}), (129, 130, set()),
    (131, 134, {"entra"}), (135, 139, {"sale"}), (140, 144, set()), (145, 148, {"Excel"}),
    (149, 153, set()), (154, 157, {"parado"}), (158, 162, {"primero"}), (163, 166, set()), (167, 167, {"automatizar"}),
]
limpia = lambda w: w.strip(".,;:")
subs = []
for j, (a, b, keys) in enumerate(CORTES):
    ws = P[a : b + 1]
    nxt = P[CORTES[j + 1][0]]["start"] if j + 1 < len(CORTES) else None
    fin = ws[-1]["end"] + 0.25
    if nxt is not None and nxt - ws[-1]["end"] < 0.6:
        fin = nxt
    words = []
    for w in ws:
        txt = limpia(w["w"])
        k = any(txt.lower().endswith(x.lower()) or txt.lower() == x.lower() for x in keys)
        words.append({"w": txt, "start": w["start"], **({"key": True} if k else {})})
    subs.append({"start": round(ws[0]["start"], 3), "end": round(fin, 3), "words": words})
# "pase de un área a otra" pasa de 24 car. → partirlo
R["subs"] = subs
for s in subs:
    txt = " ".join(w["w"] for w in s["words"])
    assert len(s["words"]) <= 5 and len(txt) <= 24, txt
    assert s["words"][-1]["w"].lower() not in {"el","la","de","en","a","un","una","y","que","pero","por","con","durante","los","se"} or len(s["words"])==1, txt
    print(f'{s["start"]:6.2f}  ' + " ".join(("*" + w["w"] + "*") if w.get("key") else w["w"] for w in s["words"]), len(txt))

R["portada"] = {"cuadro": 39.0, "frase": "Tu pedido tarda días en salir, pero el trabajo real son minutos", "naranja": ["días", "minutos"], "size": 92, "provisional": True}
p.write_text(json.dumps(R, ensure_ascii=False, indent=2))
