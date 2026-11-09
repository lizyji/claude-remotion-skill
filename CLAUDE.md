# CLAUDE.md

This repo holds the `remotion-motion-graphics` skill and a Remotion project for making videos with it.

- `.claude/skills/remotion-motion-graphics/` — the skill Claude Code loads. It is a copy of
  `remotion-motion-graphics/` (the published source). After editing the source, re-copy it here
  and run `scripts/build-skill.sh` to rebuild the `.skill` zip.
- `videos/` — **where new videos go.** Remotion 4 + React 19 + TypeScript.
- `examples/` — reference compositions from the skill author. Don't add new work here.

## Always
Read `.claude/skills/remotion-motion-graphics/SKILL.md` before writing any Remotion code, and follow
its render → inspect frames → fix → re-render loop. Never deliver an unverified render.

## videos/ layout
- `src/index.ts` → `src/Root.tsx` (one `<Composition>` per video, timing from `fps`)
- `src/scenes/*.tsx` — one file per video/scene; `src/components/Layers.tsx` (BgMesh, Grade,
  Grain, Vignette) and `src/components/Motion.tsx` (Entrance, WordReveal, SceneExit, Spark)
- `src/theme.ts` — the single theme; no inline colors or easings
- `public/` — user assets, loaded with `staticFile()`

## Commands (run in `videos/`)
```bash
npm run typecheck
npx remotion compositions src/index.ts
npx remotion render src/index.ts <CompId> out/<name>.mp4 --codec h264 --crf 17
npx remotion still src/index.ts <CompId> out/check_<f>.png --frame <f>
```
`out/` is gitignored. Send renders to the user as files rather than committing them, unless asked.

## Claude Code on the web quirks
- **Browser:** `remotion.config.ts` points Remotion at Playwright's
  `/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell` automatically.
  No `--browser-executable` flag needed.
- **Fonts:** the render browser can't fetch Google Fonts through the session proxy
  (`ERR_CERT_AUTHORITY_INVALID`), so `@remotion/google-fonts` fails. Self-host instead:
  download the `.woff2` with `curl` into `public/fonts/` and load it with `loadFont` from
  `@remotion/fonts` in `Root.tsx` (see existing Space Grotesk / Inter setup).
- **ffmpeg** is installed system-wide; `ffprobe` works for reading clip duration/fps.
- Dependencies are installed by `.claude/hooks/session-start.sh` at session start.

## Projects in videos/
- **OmnaBienvenida** (`src/omna/`) — 57 s client welcome video for OMNA, built from the Drive
  footage "INTRO AL EQUIPO OMNA" and the "OMNA Design System" folder. Media is gitignored;
  run `npm run omna:prepare` (downloads from Drive, cuts/flips/upscales the six clips,
  synthesizes the music), then `npm run render:omna`.
  - Edit decisions: `src/omna/timeline.json` (clip lengths + joins), `src/omna/captions.json`
    (verbatim phrases, seconds relative to each clip), names/roles in `OmnaBienvenida.tsx`.
  - Brand tokens live in `src/omna/omnaTheme.ts`. The SFT Schrifted Sans files are the foundry
    TRIAL build — a licensed copy is needed before publishing.
- **OmnaManuelCeo** (`src/omna2/`) — 1920×1080 video of Manuel Guerrero (CEO de Omna), styled with the
  OMNA Design System in Claude Design (artifact "OMNA Design System (Remix)"; same tokens as `omnaTheme.ts`).
  `npm run omna2:prepare`: downloads the take, fixes its orientation (`transpose=2,hflip` — the phone
  stored it rotated AND mirrored; check the "omna" shirt print reads correctly), keeps the good take from
  12.5 s and trims the long pauses (segment list in `scripts/omna2-prepare.sh`), and synthesizes the
  music bed (`gen-omna-music.mjs` with `MUSIC_SPEC`). Then `npm run render:omna2`.
  - `words.json` = the client's reference transcript aligned to the audio, remapped onto the cut.
  - Camera framings full / close / side (`KEYS`); in "side" Manuel eases left and a frosted OMNA panel
    explains the idea on the right, so he is never covered. Joins of the trimmed take land on a framing cut.
- **MncDashboardWhatsApp** (`src/mnc/`) — 1080×1920 Reel for Manuel NoCode, styled only with the
  MNC Carousel Design System (Manual Maestro MNC, `ds-mnc` skill): variante negro, Poppins titles,
  Readex Pro body/brand/captions, accent #FD6623, white cards, 6-point sparks, hand-drawn arrows.
  `npm run mnc:prepare` downloads the Drive source and builds `public/mnc/clips/base.mp4`
  (one aside removed), then `npm run render:mnc`.
  - `src/mnc/transcript.txt` is the verbatim script; `words.json` holds its word timings on the
    base cut. Captions (`captions.ts`) chunk it by clause and highlight one keyword per chunk.
  - Footage modes and scene beats live in `MncReel.tsx` (`CUTS`, `at("word")` timings).
  - Reel safe area: brand at Y=200, captions at Y≈1450–1600 (IG UI covers top ~200 / bottom ~320).
- **Mnc4CosasAMano** (`src/mnc4/`) — 1080×1920 Reel "4 cosas que tu empresa sigue haciendo a mano
  que la IA ya hace", same MNC system. `npm run mnc4:prepare` (download + loudnorm, no cuts — the
  source is already jump-cut), then `npm run render:mnc4`. Cover: `Mnc4Portada` still.
  - `src/mnc4/Kit.tsx` is the reusable reel kit, timed in absolute seconds: `Win`/`In` (mount +
    animate), `Cam` (shots list, face lifted with y=-150), `CaptureCard` (screen capture with the
    browser chrome cropped), `Statement` (cover-style 3-line text), `Eyebrow`, `CaseIntro`, `Pill`,
    `Arrow`, `Stat`. Start the next reel from it.
  - Captions come from `src/mnc/captionsCore.ts` (`makeCaptions(words, keywords)`), shared by all reels.
  - Layout (client feedback): captions at Y=1380 just under the chin (face lifted with `Cam` y=-200);
    overlays over Manuel go UNDER the captions (Y≈1548–1810) on the bottom black falloff.
  - SFX: `scripts/gen-sfx.sh` synthesizes `public/sfx/*.wav` (click, pop, whoosh, swoosh-soft);
    `<Sfx cues>` in Kit places them at low volume — whoosh on scene changes, pop/click on key numbers.
  - Covers: `MncPortada` takes props (photo, lead, big, plate, spark) — one `<Composition>` per video.
- **Mnc5Cotizador** (`src/mnc5/`) — tutorial Reel "crea tu cotizador con IA (sin programar)", built on
  the mnc4 kit. `npm run mnc5:prepare` (download, loudnorm, upscale 720→1080), `npm run render:mnc5`.
  Cover: `Mnc5Portada`. Screen shots are full-screen, zoomed from the bottom (`scr()` in SHOTS) so the
  browser chrome falls off the top; captions move per shot (`capTop`). Steps 01–06 use `Step`
  (banner → eyebrow), `Trail` (pills that grow as items are named, in narration order) and `Checklist`.
  No top-right brand mark in the video (latest client preference).
- **Mnc6AgentesGrokBot** (`src/mnc6/`) — Reel "cómo crear agentes de IA extremadamente fácil" about
  **Grok Bot** (xAI's agent product — the on-screen UI says "Grok Bot"; whisper mis-hears it as Clawdbot /
  Glockbot, fixed in `words.json`). No verified official logo could be downloaded (x.ai is behind
  Cloudflare), so the name is set as type only. `npm run mnc6:prepare`, `npm run render:mnc6`; cover
  `Mnc6Portada`. Camera framing `y=-380, scale=1.1`; screen shots lifted (`y=-250`, origin top)
  so the chrome falls off and the UI sits in the content zone. ONE grid for every shot: content 0–1250 →
  captions `CAP`=1262 (52 px) → section label `LOW`=1404 → all graphics from `G0` to ~1740, x 96–954. The agent team is shown as a PLAN, the 15 → 50–60
  pieces as a META. Kit now exports `Trail`, and `Statement`/`MncPortada` take `plateSize`; SFX adds `tick`.
- **Mnc7SistemasProcesos** (`src/mnc7/`) — Reel "sistemas y procesos" from a source that already has
  BURNED-IN captions (band ≈1366–1620). CLIENT RULE: keep the source video, framing and its captions
  exactly as they are — no erasing, masks, black bands, darkening gradients, crops or reframing, and no
  new captions on top. The MNC layer is only small graphics in the strip under the original captions
  (`G0`=1648 … ~1760, x 96–954), never on the face or over screen UI. `Cam`/`HoldFrame` run with
  `fade: "none"` / `plain`. `npm run mnc7:prepare`, `npm run render:mnc7`; cover `Mnc7Portada`.
- **Mnc8Klarna** (`src/mnc8/`) — Reel "Klarna: IA + personas", SPLIT SCREEN (@pablocasasa style): B-roll panel
  on top (0–960, light green #E5EAE5), Manuel below (take shown from y=580, framing alternates 1.0/1.12 on each
  join of the trimmed take), big Poppins captions on a black plate centred on the boundary (y=960). Own flat palette
  in `k8Theme.ts` (green / #141414 / #FD6623 / white — NO gradients, blurs, purples, pinks, blues; titles Readex Pro,
  text Poppins). Hook (logo) and "2.3 millones" go full screen ~1.4 s; fixed full-screen closing card.
  TRUTH RULES: real brands only as REAL captures with the source underneath (`public/mnc8/captures`, scripts and
  provenance in `scripts/mnc8-captures/`); missing ones → "[FALTA CAPTURA: …]" or an MNC quote card, never invented;
  numbers exactly as the script; never say AI "replaced" 700 fired employees. `npm run mnc8:prepare` (download,
  silence trims, upscale, loudnorm), `npm run render:mnc8`; separate B-roll files with `scripts/mnc8-brolls.sh`
  (`Mnc8Broll` comp, windows printed by `mnc8-times.mjs` — keep in sync with `T`). Cover `Mnc8Portada`.
  Gotcha: `at()` matches case-insensitively ("Es" = "es") — always pass an `after` time for common words.
- **Mnc9Ups** (`src/mnc9/`) — Reel "UPS: una milla al día", same split-screen format as Mnc8 (copy its structure).
  Differences: captions white with a black OUTLINE (no plate, `wordSpacing` so the stroke doesn't eat spaces),
  gray #4A4A4A allowed for footers, low synthesized music bed (`gen-omna-music.mjs` with `MUSIC_SPEC`, volume
  0.07). Source take found in the shared Drive folder as `copy_BA2F….MOV` (files there are unnamed — identify
  by transcribing the first seconds). Generic city map: seeded stops, random "tangle" and a 2-opt "clean route".
  B1 = free Pexels clip (no UPS branding), B5 = real FreightWaves headline. Numbers carry
  "Fuente: proyecciones de UPS". `npm run mnc9:prepare`, `npm run render:mnc9`, `scripts/mnc9-brolls.sh`;
  cover `Mnc9Portada`.
- **Mnc10Gong** (`src/mnc10/`) — Reel "presentaciones de venta (Gong)", FIRST video with the creative-evolution
  rules: Mnc9 captions/palette/rhythm, but the top panel FADES into Manuel (CSS mask, no hard 50/50 line) and three
  beats use real Pexels B-roll full-frame behind Manuel framed as a white-bordered card (`BG` windows). Step number
  pinned top-left (`STEPS`). Real Gong captures (logo SVG, headline, the 67,149 and 76 s sentences) with
  "Fuente: Gong · gong.io/blog/sales-demos". Stock: `scripts/mnc10-stock.sh` (clips start at their window via
  `StockVid` = Sequence). Cover `Mnc10Portada` uses the NEW `MncPortadaV2` (client cover reference style).
  `npm run mnc10:prepare`, `npm run render:mnc10`, `scripts/mnc10-brolls.sh`.
- Google Drive downloads need `drive.google.com` and `drive.usercontent.google.com` in the
  environment's network allowlist; transcription (faster-whisper) needs `huggingface.co`.
- Mnc4CosasAMano ships WITHOUT the top-right brand mark (client request). Where a brand mark is used,
  keep the original lockup (gap 6 after "manuel") but drop "<nocode>" just below
  the baseline of "manuel" — stepped down, not centered or right-aligned under it.
- Window/shot timing in the reel kit compares whole frames (`Math.round(s * fps)`), so cuts never leak
  a stray source frame.
- Rendered files over ~30 MB can't be sent in chat: encode a delivery copy (2-pass ~3.5 Mbps).

## Client preferences (from feedback)
- **REFERENCE STYLE for every new Manuel NoCode video = `Mnc9Ups` (`src/mnc9/Mnc9Reel.tsx`).** The client
  approved its style and format: start each new MNC video by copying that file's structure and only adapt the
  content (B-rolls, keywords, timings). Keep:
  - **Format:** 1080×1920, 30 fps, split screen 50/50 — B-roll panel on top (0–960, flat light green #E5EAE5),
    Manuel below (take upscaled to 1080×1920, shown from `CAM_Y`≈520 so the face sits in the lower half; framing
    alternates 1.0/1.12 on every join of the trimmed take). Full screen only for short beats (hook/big numbers,
    1–3 s) and the fixed closing card.
  - **Captions:** Poppins ExtraBold 72 px, white, 9 px black outline (`WebkitTextStroke` + `paintOrder`),
    `wordSpacing` 0.14em, centred ON the boundary (top 960, translateY −50%), max 5 words / 24 chars per chunk,
    1–2 keywords in orange #FD6623, quick 0.14 s scale-in, hidden during full-screen beats and the closing card.
  - **Rhythm:** silences/breaths trimmed (0.10 s kept after a phrase, 0.08 s before the next), never cut words;
    top clip changes every 3–4 s (or a new element enters every 1–2 s inside longer clips), each B-roll synced
    to Manuel's phrase.
  - **Graphics:** MNC flat palette only (green #E5EAE5, black #141414, gray #4A4A4A, orange #FD6623, white) — no
    gradients/blurs/purples/pinks/blues, nothing OMNA. Titles Readex Pro Bold, text Poppins. White cards / black
    or orange chips with 2 px black borders; content in the panel between y 200 (IG UI) and ~820; source footer
    "Fuente: …" at y 836 in gray 24 px. Real brands only as real captures/licensed footage with source; numbers
    exactly as the script; generic maps/counters/icons are animated.
  - **Sound:** voice −14 LUFS, low synthesized music bed (0.07, 0.11 on full-screen beats), subtle SFX
    (whoosh on clip changes, pop/click/tick on reveals).
  - **Close + cover:** fixed closing phrase full screen (green bg, black Readex Pro, "IA" in orange), words lighting
    up as spoken; cover with `MncPortada`; separate B-roll files named by take (`T#_B#_name.mp4`).
  - **Before delivering:** check on a still sheet + the full render that every caption reads clearly (no clipped
    words, spaces visible, not over busy graphics) and that no graphic covers Manuel's face or screen content.
- **CREATIVE EVOLUTION (feedback after Mnc9, applies to every NEW MNC video; never re-edit old ones):** keep the
  Mnc9 quality, branding, rhythm, captions, animations and SFX, but:
  - **More real B-roll, with purpose:** brands mentioned → their OFFICIAL logo briefly; business processes → licensed
    stock of people working, teams, offices, warehouses, operations, tech (Pexels/Pixabay, free licence, no other
    brands visible); tools/platforms → their real interface, logo or a related visual. Balance Manuel + real
    B-roll + interfaces + logos + animated graphics — not everything as animated graphics.
  - **Less literal split screen:** pick per scene (not all in one video) between A) soft fade/feathered edge between
    B-roll and Manuel instead of a hard 50/50 line, B) full-frame B-roll background with Manuel in the foreground,
    C) Manuel cut out (background removed when technically viable) over videos/interfaces/graphics, D) layered
    compositions with masks, opacity and soft transitions. Note: the client explicitly allows a soft fade here even
    though MNC graphics stay flat (no colour gradients/blurs in the graphics themselves).
  - **Same composition rules:** Manuel on screen ≈45%; never cover his face, screen recordings or interfaces;
    captions always legible; graphics/pop-ups below the captions; IG safe zones; MNC Carousel Design System only.
  - **Efficiency:** prefer reusable stock, official logos and simple masks/fades over complex effects.
- **Content on top → captions → ALL graphics at the bottom, 100% of the video.** Manuel's face AND his
  screen recordings are protected zones: no graphic, label, sticker or animation above the captions, in
  any shot or during entrances/exits (section labels too). Shrink graphics or show them in sequence
  rather than move them up; keep the low zone inside the IG safe area.
- **Reels: the speaker on screen ≥45% of the runtime.** Don't replace long stretches with
  graphics-only scenes — prefer graphics layered over the speaker's footage (top band / side
  cards that never cover the face), and use full-screen graphics only as short beats.
- **Crop browser chrome** (tabs, bookmarks bar) from any screen capture.
- **Never hide burned-in captions with bands, masks, blur or crops.** If the source has its own captions,
  keep them untouched and put graphics in the free space below them.
- **Scripts/storyboards are a guide, not a rule:** when Manuel's audio differs from the script, the
  subtitles follow the AUDIO; script timings are approximate — fit B-rolls to what he says and trim
  silences as needed.
- **Turnaround matters as much as polish:** keep the quality bar but aim for half the time —
  analyse once, build, verify with one still sheet + one full render, and avoid re-render loops
  for cosmetic tweaks that can be checked on stills.
- **COVER REFERENCE STYLE (latest, overrides the older MncPortada look):** `videos/reference/portadas/ref_klarna.png`
  and `ref_ups.png` (client-made). When a video edit comes with a cover phrase, also make a cover in this style:
  - **Photo:** a well-chosen frame from the video (eyes open, good expression), zoomed so Manuel's face is large and
    centred; the title never covers the face.
  - **Text:** the client's phrase EXACTLY as given (casing too — e.g. "IA" uppercase, sentence case, ".." joins) —
    never invent or reword it; WAIT for the phrase before making the cover. Split it into a top block and/or a bottom
    block around the face. Readex Pro, heavy, very large, soft drop shadow. Two treatments, mixed:
    white text on a FLAT ORANGE (#FD6623) full-width band/plate, and giant orange text with no plate.
  - **Brand logo:** if the phrase or video mentions a big company (Klarna, UPS…), include its CORRECT official logo,
    large and integrated — e.g. Klarna wordmark in white sitting on top of the orange band, UPS shield in its
    real colours at the frame edge beside the face (may bleed off-canvas), never over the face.
  - "manuel <no code>" small, white, semi-transparent, top-right. No gradients; spark only if Claude is mentioned.
- **Every video ships with a cover (portada)** in the same style as `MncPortada` (`src/mnc/MncPortada.tsx`):
  speaker photo full-bleed, three-line title — small white lead, giant orange keyword, white line
  on an orange plate — soft offset shadow, "manuel <no code>" top-right, lowercase, title kept
  inside the 3:4 grid crop. Render it as a still and send it together with the video.
- **Cover decorations:** the orange spark/star is used **only when the video mentions Claude**;
  otherwise no extra shapes or figures at all.
