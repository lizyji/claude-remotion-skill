# Reel CIIAM 2026 · "Las armadoras ya no compran solo por precio"

Duración final: 55.0 s (bruto 56.9 s). Voz a −14 LUFS. 1080×1920, 30 fps.

## Audio contra guion
- El audio coincide con el guion casi palabra por palabra. Diferencias: "dijeron **que** revisan" (sin acento en el audio), "el Ematec del grupo Toyota" (el guion dice "[empresa por confirmar]").
- Se quitó la "M" del final (cuadro 56.31 s del bruto en adelante).

## Material real
| Archivo | Qué es | De dónde |
|---|---|---|
| `titular_factor.png` | Titular real "CIIAM 2026: Ford, KIA, Stellantis y PACCAR amplían la evaluación de proveedores automotrices más allá del precio" (recorte, sin menús ni anuncios) | factorautomotor.com/ciiam-2026-proveedores-automotrices/ (Antonio Toledo, 1 oct 2026) |
| `foto_panel_ciiam.jpg` | Foto real del panel de Compras (Ford, KIA, Stellantis, PACCAR, ISGO, INA) | Imagen principal de la misma nota |
| `logo_kia_bn.png` | Logo KIA, capturado del encabezado de kia.com/mx | Sitio oficial |
| `logo_stellantis_bn.png` | Logo Stellantis (SVG del encabezado de stellantis.com) | Sitio oficial |
| `logo_paccar_bn.png` | Logo PACCAR (PNG del encabezado de paccar.com, escalado ×6) | Sitio oficial |
| `logo_ford_bn.png` | Logo Ford (óvalo oficial) | **Plan B:** ford.mx bloquea el acceso (403); archivo del logo oficial en Wikimedia Commons |

Los cuatro logos van en blanco y negro (#141414), como pide el guion.

## Plan B y decisiones
- **Logo Ford:** el sitio oficial no abrió, así que usé el archivo del logo oficial de Wikimedia Commons.
- **Fecha de la fuente:** la nota de Factor Automotor dice **1 oct 2026** (el guion dice 30 sep). En pantalla puse "Fuente: CIIAM 2026 · Factor Automotor, 1 oct 2026". Si prefieren el 30 sep, es un cambio de una línea en `armar.py`.
- **Frase de Ford "la calidad está pasando…":** no aparece en la nota. No se pone en pantalla: tampoco en subtítulos (24.6–29 s). En su lugar va el checklist con "Calidad" subiendo al #1 y un golpe a pantalla completa "#1 Calidad", sin comillas ni atribución.
- **Empresa del grupo Toyota:** no aparece en la nota. B11 dice "Una empresa del grupo Toyota busca proveedores mexicanos", sin logo y sin fuente. En los subtítulos se omite "el Ematec".
- **"Y aquí está la jugada":** se queda en el audio, sin texto en pantalla y sin subtítulos (Manuel a pantalla completa 35.0–36.6 s).
- **Frecuencia de las clases:** el CTA solo dice "Clases gratis". El final del audio va bajo el CTA a pantalla completa, así que "cada dos semanas" no sale escrito.
- **Whoosh:** solo 3 (14.5 s Ford, 36.6 s lección, 49.9 s CTA). En el resto de los elementos van pop/tick/click.
- **Música:** instrumental sintetizada para este video (propia, sin letra, libre de derechos), a ≈ −23 dB bajo la voz.
- **Portada:** la frase no venía en el brief. Usé una **provisional**, tomada de la "idea en una frase": "Las armadoras ya no compran solo por precio". Mándenme la frase exacta y la reemplazo.

## Lo que faltó
- B-roll en video de plantas o líneas de las armadoras: las salas de prensa (Ford, Stellantis, PACCAR) bloquean el acceso y Wikimedia limitó las descargas. El guion no lo pedía; el material de "agencias y personas" quedó cubierto con los logos oficiales, el titular y la foto real del panel con los cuatro directivos.
- Recortes individuales de Bruno Mendoza / Ivan Morgan: el pie de foto no dice el orden de izquierda a derecha, así que no recorté a nadie para no identificar mal a una persona. Bruno Mendoza aparece por nombre y cargo en el checklist de Ford (dato verificado en la nota).

## B-rolls (carpeta `out/brolls/`, 1080×960)
T1_B1_logos_precio · T2_B2_titular_panel · T2_B3_tmec_revision · T2_B4_solo_precio · T3_B5_resiliencia_calidad · T3_B6_velocidad_logistica · T3_B7_estabilidad_madurez · T3_B8_calidad_1 · T4_B9_pieza_barata · T4_B10_ciclo_de_vida · T5_B11_grupo_toyota · T5_B12_cotizacion_sin_respuesta · T5_B13_responder_rapido · T5_B14_procesos_sistemas · T6_B15_comenta_brujula
