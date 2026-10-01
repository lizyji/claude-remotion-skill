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
- Google Drive downloads need `drive.google.com` and `drive.usercontent.google.com` in the
  environment's network allowlist; transcription (faster-whisper) needs `huggingface.co`.
- Rendered files over ~30 MB can't be sent in chat: encode a delivery copy (2-pass ~3.5 Mbps).
