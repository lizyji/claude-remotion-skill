#!/usr/bin/env python3
"""Arma la edición del reel "tendencia" sobre reel.json (después de preparar.py).
B-rolls, golpes y subtítulos sincronizados con las palabras exactas de Manuel (el audio manda)."""
import json, sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(RAIZ / "scripts"))
from bloques import limpiar  # noqa: E402

p = RAIZ / "reels" / "tendencia" / "reel.json"
reel = json.loads(p.read_text())
P = reel["palabras"]
DUR = reel["duracion"]
A = "reels/tendencia/"


def at(texto, tras=0.0):
    """inicio de la primera palabra `texto` que empieza en o después de `tras` segundos"""
    return next(w["start"] for w in P if limpiar(w["w"]).lower() == texto.lower() and w["start"] >= tras)


# ── Subtítulos (≤5 palabras / 24 car., *clave en naranja), siguen el audio ──
GRUPOS = """Hay una *tendencia|en la *IA|que casi *nadie|está pelando|y para mí es|lo más *importante|que está pasando|este año
Casi todo el *mundo|sigue usando la *IA igual|abres *Claude o ChatGPT|le *preguntas algo|te contesta|y tú haces el *trabajo|es un *chat
Pero las personas|más *adelante|están en otra cosa|asistentes *personales|En agosto salió|*Grok Bot|en octubre *Anthropic|sacó *Duet|y así siguen|saliendo *más
La *diferencia es que|no *esperan|a que les preguntes|revisan tu *correo|y tu *calendario|te *avisan que necesita|tu *atención|y hacen *tareas|por su cuenta|en su propia|*computadora en la nube|aunque tú no *estés
Y a mí esto|es lo que me voló|la *cabeza|no es|para *programadores|*Grok Bot por ejemplo|es tan *fácil|como usar *WhatsApp|Son *apps que bajas|en tu *celular|y el que *empiece|a usarlas *hoy|en un *año|va a *trabajar|con un *asistente|que ya lo *conoce|mientras los demás|siguen haciendo|*preguntas en un chat
Así que si no sabes|cómo implementar *IA|en tu negocio|esta cuenta es para ti"""
subs, i = [], 0
for g in GRUPOS.replace("\n", "|").split("|"):
    toks = g.split()
    ws = []
    for tk in toks:
        w = P[i]
        assert limpiar(w["w"]).lower() == tk.lstrip("*").lower(), (tk, w["w"])
        ws.append({"w": limpiar(w["w"]), "start": w["start"], **({"key": True} if tk.startswith("*") else {})})
        i += 1
    txt = " ".join(x["w"] for x in ws)
    assert len(ws) <= 5 and len(txt) <= 24, txt
    subs.append({"start": ws[0]["start"], "end": P[i - 1]["end"], "words": ws})
for a, b in zip(subs, subs[1:]):
    a["end"] = b["start"] if b["start"] - a["end"] < 0.6 else a["end"] + 0.25
subs[-1]["end"] = min(DUR, subs[-1]["end"] + 0.3)
reel["subs"] = subs

# ── B-rolls (panel de arriba). Cambian cada 2–4 s; dentro de clips largos entra algo nuevo cada 1–2 s ──
def E(id_, s, e, escena, fuente=None, **props):
    b = {"tipo": "escena", "id": id_, "start": round(s, 3), "end": round(e, 3), "escena": escena, "props": props}
    if fuente:
        b["fuente"] = fuente
    return b


t_grok, t_anth = at("grok"), at("anthropic")
t_pero, t_en_ago = at("pero"), at("en", 17)
broll = [
    E("T1_B1_tendencia", 0.0, at("y") - 0.02, "tipeo", texto="La tendencia que nadie está viendo", signo="?", cps=21),
    E("T1_B2_radar", at("y") - 0.02, at("casi", 5) - 0.02, "radar", detecta=at("importante") - at("y") + 0.02, etiqueta="Para mí, lo más importante del año"),
    E("T2_B3_chat", at("casi", 5) - 0.02, at("contesta") + 0.42, "chat", pregunta="¿Me ayudas a escribir un correo?", respuesta="Claro, aquí tienes un borrador…",
      dTipeo=at("abres") - at("casi", 5), dPregunta=at("preguntas") - at("casi", 5), dRespuesta=at("contesta") - at("casi", 5)),
    E("T2_B4_preguntas_respuestas", at("contesta") + 0.42, t_pero - 0.02, "trabajo", etiqueta="Preguntas → respuestas", texto="Tú haces el trabajo", dPersona=0.3),
    E("T3_B4b_asistentes", t_pero - 0.02, at("en", 17) - 0.04, "revela", pildora="Los que van más adelante", texto="están en otra cosa:",
      dTexto=at("están") - t_pero, titulo="Asistentes personales", dTitulo=at("asistentes") - t_pero),
    E("T3_B5_grok_bot", at("en", 17) - 0.04, t_anth - 0.1, "linea", fuente="Fuente: xAI, 11 ago 2026 · x.ai",
      nuevo=0, dNuevo=t_grok - at("en", 17) - 0.1, puntos=[{"fecha": "Ago 2026", "nombre": "Grok Bot", "logo": A + "grokbot_logo.png", "alto": 150}]),
    E("T3_B6_claude_duet", t_anth - 0.1, at("así") - 0.04, "linea", fuente="Fuente: Anthropic, 21 oct 2026 · claude.com",
      nuevo=1, dNuevo=0.12, puntos=[{"fecha": "Ago 2026", "nombre": "Grok Bot", "logo": A + "grokbot_logo.png", "alto": 150},
                                     {"fecha": "Oct 2026", "nombre": "Claude Duet", "logo": A + "claudeduet_logo.png", "alto": 250}]),
    E("T3_B7_titular_techcrunch", at("así") - 0.04, at("diferencia") + 0.25, "captura", fuente="Fuente: TechCrunch, 22 oct 2026 · techcrunch.com",
      src=A + "techcrunch_titular.png", traduccion="“Claude Duet: la apuesta de Anthropic por los agentes”", dTrad=0.7),
    E("T4_B7b_no_esperan", at("diferencia") + 0.25, at("revisan") - 0.04, "revela", pildora="La diferencia", titulo="No esperan a que les preguntes",
      dTitulo=at("no", 24.5) - at("diferencia") - 0.35),
    E("T4_B8_correo", at("revisan") - 0.04, at("te", 28) - 0.04, "iconos", etiqueta="Revisa", enciende=[0.05, at("calendario") - at("revisan"), None]),
    E("T4_B9_calendario", at("te", 28) - 0.04, at("y", 30) - 0.04, "aviso", etiqueta="Te avisa", aviso="Esto necesita tu atención", dAviso=at("necesita") - at("te", 28)),
    E("T4_B10_nube", at("y", 30) - 0.04, at("y", 35) - 0.02, "nube", tareas=["Preparar propuesta", "Contestar correos", "Agendar junta"],
      cada=0.85, dEtiqueta=at("aunque") - at("y", 30), etiqueta="Aunque tú no estés"),
    E("T5_B11b_no_programadores", at("no", 37) - 0.04, at("grok", 38) - 0.06, "noprog", titulo="No es para programadores"),
    {"tipo": "logo", "id": "T5_B11c_grok_facil", "start": round(at("grok", 38) - 0.06, 3), "end": round(at("son") - 0.04, 3),
     "src": A + "grokbot_logo.png", "etiqueta": "Tan fácil como usar WhatsApp", "fuente": "Fuente: xAI · x.ai/bot"},
    E("T5_B11d_celular", at("son") - 0.04, at("en", 44) - 0.04, "celular", etiqueta="a tu celular", dEtiqueta=at("bajas") - at("son") - 0.1),
    E("T5_B12_chat_vs_asistente", at("en", 44) - 0.04, at("así", 50) - 0.04, "columnas", arriba="En un año",
      cols=[{"titulo": "Asistente", "flecha": "el trabajo avanza solo", "d": at("asistente") - at("en", 44) - 0.1, "dFlecha": at("conoce") - at("en", 44) - 0.1, "destaca": True},
            {"titulo": "Chat", "flecha": "tú haces el trabajo", "d": at("los", 47) - at("en", 44) - 0.1, "dFlecha": at("preguntas", 48) - at("en", 44) - 0.1}],
      dDestaca=at("chat", 49) - at("en", 44) + 0.15),
]
reel["broll"] = broll

reel["golpes"] = [
    {"tipo": "frase", "id": "T5_B11_me_volo_la_cabeza", "start": round(at("y", 35) - 0.04, 3), "end": round(at("no", 37) - 0.04, 3), "arriba": "Y a mí esto", "abajo": "me voló\nla cabeza"},
    {"tipo": "cierre", "id": "T6_B14_frase_cierre", "start": round(at("así", 50) - 0.04, 3), "end": DUR},
]
# Fuera del corte final (Manuel no lo dice; se entrega suelto): B13
reel["extras"] = [E("T6_B13_siguiente_video", 0, 3.0, "tipeo", texto="Siguiente video: Claude Duet por dentro", cps=24)]
reel["pasos"] = []
reel["sfx"] = [{"t": round(broll[1]["start"] + broll[1]["props"]["detecta"], 3), "s": "pop"},
               {"t": round(at("revisan"), 3), "s": "tick"}, {"t": round(at("calendario"), 3), "s": "tick"},
               {"t": round(at("necesita"), 3), "s": "pop"}]
reel["sfx"] += [{"t": round(broll[11]["start"] + 0.4 + k * 0.85, 3), "s": "tick"} for k in range(3)]
reel["musica"] = A + "musica.wav"
reel["caraYFuente"] = 0.60
reel["portada"] = {"cuadro": 3.5}
p.write_text(json.dumps(reel, ensure_ascii=False, indent=1))
for b in broll + reel["golpes"]:
    print(f'{b["start"]:6.2f}–{b["end"]:6.2f} ({b["end"]-b["start"]:.1f}s) {b["id"]}')
