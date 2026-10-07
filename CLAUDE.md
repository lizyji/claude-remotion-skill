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
- Google Drive downloads need `drive.google.com` and `drive.usercontent.google.com` in the
  environment's network allowlist; transcription (faster-whisper) needs `huggingface.co`.
- Rendered files over ~30 MB can't be sent in chat: encode a delivery copy (2-pass ~3.5 Mbps).

## Client preferences (from feedback)
- **Reels: the speaker on screen ≥45% of the runtime.** Don't replace long stretches with
  graphics-only scenes — prefer graphics layered over the speaker's footage (top band / side
  cards that never cover the face), and use full-screen graphics only as short beats.
- **Crop browser chrome** (tabs, bookmarks bar) from any screen capture.
- **Turnaround matters as much as polish:** keep the quality bar but aim for half the time —
  analyse once, build, verify with one still sheet + one full render, and avoid re-render loops
  for cosmetic tweaks that can be checked on stills.
- **Every video ships with a cover (portada)** in the same style as `MncPortada` (`src/mnc/MncPortada.tsx`):
  speaker photo full-bleed, three-line title — small white lead, giant orange keyword, white line
  on an orange plate — soft offset shadow, "manuel" with "<no code>" tucked right under it, top-right, lowercase, title kept
  inside the 3:4 grid crop. Render it as a still and send it together with the video.
- **Cover decorations:** the orange spark/star is used **only when the video mentions Claude**;
  otherwise no extra shapes or figures at all.
