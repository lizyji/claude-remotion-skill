# Reel Monthly · entrega

**Video:** `out/monthly.mp4` · 1080×1920 · 30 fps · **77.6 s** (el bruto dura 80.4 s; casi no había silencios que quitar y no se recortó contenido).
**B-rolls sueltos:** `out/monthly_brolls/` (mitad de arriba 1080×960, nombrados por toma).
**Portada:** pendiente de la frase.

## Audio vs. guion (el audio manda)
- **Nuevo al inicio:** "Esta empresa mexicana está ayudando a que muchas empresas no quiebren. Es una empresa de IA para finanzas y esto es lo que resuelven." Se usó como gancho, con la portada real de la demo y el estado de resultados de la plataforma.
- **No dijo "como Contpaqi"**: el B-roll de conexión sí muestra Contpaqi (está en la demo), pero no hay subtítulo.
- **No se grabó la toma 4** ("me voló la cabeza" / 5.5M → 11.3M). La comparativa fiscal vs. real de la demo sí aparece en "no sabes cuánto ganas de verdad", con la leyenda **"Ejemplo ilustrativo de Monthly con cifras ficticias"** grande y legible. No se sacó el golpe "Esto me voló la cabeza" (B9).
- **Frase nueva:** "Sí, así como si estuvieras utilizando ChatGPT, pero con todo tu contexto financiero." Lleva su propio B-roll (AskMara real y una tarjeta de texto).
- **75% / dos clientes:** se dijo "Un caso real es que…". Va con la grabación real de "Transporte de carga", un golpe a pantalla completa "75%" y el pie "Caso de cliente reportado por Monthly".
- **La lección termina en "tener visibilidad"**, no en "ver sus números de verdad". El texto de B12 se cambió a "~~Más reportes~~ / Por fin, visibilidad."
- **Correcciones de la transcripción:** "IA y para finanzas" → "IA para finanzas"; "la IA a los negocios" → "la IA los negocios" (sílabas fantasma de 20–80 ms).

## Material real
- Demo comercial de Monthly (monthly-demo.netlify.app), grabada sección por sección con el navegador: Portada, El problema (Fiscal → Real), Conexión (recorrido de Contpaqi), Procesamiento (libro mayor → auditoría → limpieza), Plataforma (estado de resultados, métricas, AskMara) y Casos de éxito → Transporte de carga. Va con la fuente al pie.
- **No se grabaron** Inversión (precios) ni la cotización.
- El logo de Monthly aparece como está en su demo, sin recrearlo.

## Plan B y faltantes
- **No venían grabaciones B#.mp4 en Drive** (la carpeta solo tiene los videos en bruto). Todo se grabó de la demo, así que no quedó ningún placeholder.
- **Música:** no conseguí una pista descargable de una biblioteca libre desde este entorno, así que generé una base instrumental original (`scripts/musica.py`), libre de derechos, a ≈ −23 dB bajo la voz. Si prefieres otra pista, se cambia en `reel.json → musica`.
- **monthly.la** se revisó (inglés; trae métricas, el flujo de 3 pasos y un video). No hizo falta tomar material de ahí: la demo ya cubría todo.
- **Colores:** las grabaciones de Monthly conservan su azul/morado y sus degradados porque son material real; todos los gráficos propios usan solo colores MNC planos.

## Para revisar
- "Está ayudando a que muchas empresas no quiebren" no está en las fuentes verificadas del guion. Es una afirmación de Manuel; conviene confirmarla o suavizarla en el caption.
- Duración: 77.6 s, contra un objetivo de 55–60 s.
