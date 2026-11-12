# MNC Reels: editor de reels de Manuel NoCode

Plantilla Remotion (1080×1920, 30 fps) y scripts para editar los reels de @manuelnocode
según [`INSTRUCCIONES.md`](INSTRUCCIONES.md), que es la fuente de verdad del proyecto.

## Cómo está armado

| Pieza | Qué hace |
|---|---|
| `reels/<slug>/reel.json` | La decisión de edición de un reel: video de Manuel, cortes, palabras, subtítulos, B-rolls, golpes, pasos, portada. Todo en segundos del video ya recortado. |
| `src/Reel.tsx` | Compone el reel a partir del `reel.json`: Manuel abajo, panel verde claro arriba con fundido, B-rolls, número de paso, subtítulos, golpes a pantalla completa, música y SFX. |
| `src/Portada.tsx` | Portada (still): cuadro de Manuel con la cara grande y la frase EXACTA de `portada.frase`. |
| `src/theme.ts` | MNC Carousel Design System: colores planos, Readex Pro + Poppins (locales, OFL), zonas seguras, resortes. |
| `src/components/` | `Manuel` (encuadre 100/112 % en cada corte), `BRolls` (tarjeta, cita plan B, pendiente, imagen, video, logo, contador, lista, silueta), `Golpes` ("Aquí está la jugada", número grande, frase de cierre con palabras que se iluminan), `Subtitulos` + `Paso`. |
| `scripts/transcribir.py` | Transcripción con tiempos por palabra (faster-whisper) + `correcciones.json` (Cloud → Claude, el table → Airtable…). Sirve también para identificar la toma correcta (`--primeros 12`) y re-transcribir fragmentos dudosos. |
| `scripts/preparar.py` | Recorta silencios (−38 dB, ≥ 0.3 s, deja 0.10 s / 0.08 s, nunca corta palabras), normaliza a −14 LUFS, re-mapea palabras y genera los bloques de subtítulos. |
| `scripts/bloques.py` | Bloques de ≤ 5 palabras / 24 caracteres, sin terminar en artículo o preposición, 1 palabra clave en naranja. |
| `scripts/hoja_cuadros.py` | Hoja de cuadros de un render para verificar. |
| `scripts/gen_sfx.mjs` | Sintetiza whoosh / pop / click / tick / bass en `public/sfx/`. |
| `scripts/gen_musica.py` | Música instrumental propia (lo-fi sintetizado, sin derechos de terceros) en `public/musica/lofi_mnc.m4a`, normalizada a −14 LUFS. |
| `scripts/exportar_brolls.py` | Corta los B-rolls sueltos (nombrados por toma con `"id"`) del render final y del render `soloBroll`. |
| `reels/<slug>/editar.py` | (Opcional) Arma `broll`, `golpes` y `subs` buscando las palabras exactas de Manuel; así la edición se puede regenerar si cambia el recorte. Ejemplo: `reels/claude-duet/editar.py`. |

## Flujo por pedido

```bash
npm install
npm run audio
pip install faster-whisper
```

1. Descarga el material de Drive en `reels/<slug>/raw/` (no se sube a git).
2. Si hay varios `copy_XXXX.MOV`, identifica la toma:
   ```bash
   python3 scripts/transcribir.py --primeros 12 reels/<slug>/raw/*.MOV
   ```
3. Transcribe la toma y revisa a mano las palabras marcadas:
   ```bash
   python3 scripts/transcribir.py reels/<slug>/raw/copy_1234.MOV -o reels/<slug>/work/palabras_raw.json
   ```
4. Compara audio contra guion (el audio manda). Recorta silencios, errores de lectura (`--quitar`) y normaliza:
   ```bash
   python3 scripts/preparar.py reels/<slug>/raw/copy_1234.MOV --slug <slug> --palabras reels/<slug>/work/palabras_raw.json
   ```
5. Material real en `public/reels/<slug>/` (logos, capturas sin barra del navegador, grabaciones, stock de Pexels/Pixabay) y música instrumental libre de derechos.
6. Llena `broll`, `golpes`, `pasos` y `portada` en `reel.json`, sincronizados con las palabras exactas de Manuel. Revisa las palabras clave (`"key": true`) de los subtítulos.
7. Renderiza y verifica:
   ```bash
   npx remotion render src/index.ts Reel out/<slug>.mp4 --codec h264 --crf 17 --props='{"reel":'"$(cat reels/<slug>/reel.json)"'}'
   ```
   ```bash
   python3 scripts/hoja_cuadros.py out/<slug>.mp4
   ```
   ```bash
   npx remotion still src/index.ts Portada out/<slug>_portada.png --props='{"reel":'"$(cat reels/<slug>/reel.json)"'}'
   ```

Sin `--props` se usa el reel `demo`. Para ver cualquier reel en el Studio: `npm run studio`.

En entornos sin internet, Remotion no puede descargar su Chrome: pasa `--browser-executable=<ruta a chrome-headless-shell>`.

### Notas del flujo

- **Audio desfasado en .MOV del iPhone:** a veces el audio arranca ~0.7 s después del video (`start_time`).
  `transcribir.py` y `preparar.py` alinean el audio al tiempo del video (`aresample=async=1:first_pts=0`),
  así las palabras, los silencios y el recorte usan el mismo reloj.
- **Silencios por energía:** `preparar.py` mide RMS en ventanas de 20 ms (−38 dB, ≥ 0.3 s). Los tiempos de la
  transcripción que invaden un silencio se recortan contra él para que no bloqueen el corte.
- **Animaciones genéricas** (`src/components/Animaciones.tsx`, tipos en `src/reel/types.ts`): `conectar`,
  `notificacion`, `junta`, `nube`, `candados`, `contraste`, `columnas`. Cada elemento entra en `en` segundos
  desde el inicio del clip, sincronizado con la palabra de Manuel. `imagen` acepta `marco`, `fondo` y `etiqueta`;
  `lista` acepta `en`; el golpe `jugada` acepta `arriba`/`abajo` para otra frase con el mismo estilo.
- **B-rolls sueltos:** render con `"soloBroll": true` en las props (sin Manuel, subtítulos, golpes ni audio) y
  luego `python3 scripts/exportar_brolls.py <slug>`.
- En este contenedor Remotion no puede bajar su Chrome: usa
  `--browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`.

## Demo

`npm run demo` genera una toma falsa (figura de reemplazo + audio sintético con silencios), la pasa por
`preparar.py` y coloca B-rolls, golpes y pasos de ejemplo. Sirve para revisar layout, tiempos y estilo.
No es material de Manuel.

## Composición B/C (silueta)

Para `"tipo": "silueta"` hace falta Manuel recortado con alfa en `manuelMatte` (por ejemplo, un `.webm`
VP9 con alfa generado con RobustVideoMatting). Solo sobre video real de personas, nunca sobre gráficos,
interfaces o capturas. Revisa el borde del cabello en cuadros fijos.

## Verificación y entrega (provisional)

Las secciones 11 y 12 del brief no llegaron. Mientras tanto:
- Hoja de cuadros cada 1.5 s + render completo revisado; corregir y re-verificar solo lo que cambió.
- Entregar: `out/<slug>.mp4`, B-rolls sueltos, portada PNG y la lista de lo resuelto con plan B.
