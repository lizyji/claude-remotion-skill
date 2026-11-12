# Muse llegó a México · entrega (12 nov 2026)

- **Video final:** `out/muse-mexico.mp4` · 1080×1920 · 30 fps · **61.4 s** · voz −14 LUFS.
  Pasa del objetivo de 56 s: Manuel habla casi sin pausas (solo se quitaron 2.2 s). No se recortó contenido.
- **B-rolls sueltos:** `out/muse-mexico_brolls/` (15 clips, nombrados por toma).
- Se rearma con: `python3 scripts/preparar.py … --quitar 14.84-15.2 --quitar 62.95-63.6`, luego `python3 reels/muse-mexico/armar.py`.

## Audio vs. guion (manda el audio)
- Quitado: "quiere **que** un agente" (tropiezo de lectura) y "¡Gracias!" al final.
- Se queda como lo dijo: "Lo interesante **aquí** es…", "Y a mí esto me voló la cabeza" (sin "es lo que"), "**Y** si todavía no sabes…".

## Material real
| Clip | Material | Fuente al pie |
|---|---|---|
| B1 | Captura real del titular de Expansión ("Muse, el agente de Meta, llega a México y así le puedes sacar el máximo provecho") + "Muse ya llegó a México" | Expansión, 5 nov 2026 · expansion.mx |
| B2 | Video oficial `Muse_Shopping.mp4` (incluye la pantalla de permiso de compra) | Meta, 8 sep 2026 |
| B5 | Captura real del titular "Introducing Muse: The World's First Personal AI Agent Built for Everyone" | Meta, 8 sep 2026 · about.fb.com |

Plan B usado: ninguno para el material real (todo abrió).

## Decisiones de edición
- B11 ("Un agente que vigila al otro") va en "Y a mí esto me voló la cabeza", antes del diagrama, porque Manuel no dejó espacio después.
- B9+B10 son un solo diagrama continuo; se frena en el vigilante con "¿Aprobado?" en "vigilar al primero" y sale la palomita en "aprueba".
- B12+B13: la checklist se queda hasta "el registro"; cada punto entra cuando Manuel lo dice.
- Manuel a pantalla completa en "Esa es la lección para tu negocio" (1.8 s).

## Falta / avisos
- **Música:** los sitios de música libre (Pixabay, FreePD, Incompetech, FMA) están bloqueados por la red. Se usó una base instrumental **original** generada aquí (sin derechos de terceros). Si prefieres otra, se cambia en `reel.json → musica`.
- **Frase de portada:** pendiente.

## Caption
Muse, el agente de Meta que manda correos y compra por ti, ya llegó a México.
Y viene con reglas: te pide permiso, tú eliges a qué entra y te enseña todo lo que hizo. Esas mismas reglas aplican para cualquier agente en tu negocio.
¿Qué es lo primero que le dejarías hacer a un agente en tu empresa?
