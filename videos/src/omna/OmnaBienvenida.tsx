import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { omna } from "./omnaTheme";
import captionData from "./captions.json";
import {
  CLIP_STARTS,
  CLIPS,
  FPS,
  INTRO_F,
  OUTRO_F,
  OUTRO_FADE_F,
  OUTRO_START,
  Person,
} from "./timeline";
import { BrandGrain, FootageGrade } from "./components/Brand";
import { Footage, LightSweep } from "./components/Footage";
import { LowerThird } from "./components/LowerThird";
import { Captions, Cue } from "./components/Captions";
import { IntroCard, OutroCard } from "./components/Cards";

export { TOTAL_F as OMNA_TOTAL_F } from "./timeline";

// Names and roles come from the client brief (the speakers only say their
// first names on camera). `at`/`dur` are seconds relative to the clip.
const PEOPLE: Record<Person, { name: string; role: string; clip: string; at: number; dur: number }> = {
  manuel: { name: "Manuel Guerrero", role: "CEO y Fundador", clip: "s1", at: 1.9, dur: 4.6 },
  pamela: { name: "Pamela Guerrero", role: "Operaciones y Finanzas", clip: "s3", at: 0.6, dur: 4.4 },
  lizy: { name: "Lizy Jiménez", role: "Marketing y Contenido", clip: "s4", at: 0.7, dur: 4.2 },
  joel: { name: "Joel Suro", role: "Cofundador", clip: "s5", at: 0.5, dur: 4.5 },
};

// Framing per clip. Same-person jump cuts get a punch-in so they read as
// intentional; Joel is reframed from the top so his shirt logo drops below
// the caption line instead of sitting behind the subtitles.
const FRAMING: Record<string, { zoom: number; origin?: string }> = {
  s2: { zoom: 1.07 },
  s5: { zoom: 1.07, origin: "50% 4%" },
  s6: { zoom: 1.13, origin: "50% 4%" },
};

const CUES: Cue[] = (captionData as { clip: string; from: number; to: number; text: string }[]).map(
  (c) => ({
    from: CLIP_STARTS[c.clip] + Math.round(c.from * FPS),
    to: CLIP_STARTS[c.clip] + Math.round(c.to * FPS),
    text: c.text,
  }),
);

// Music ducking: full under the brand open / end card, low in pauses, and
// well under every spoken phrase, with ~0.4s look-ahead/release ramps.
const MUSIC = { open: 0.9, gap: 0.26, duck: 0.11, ramp: Math.round(FPS * 0.4) };
const musicVolume = (f: number) => {
  let d = Infinity;
  for (const c of CUES) {
    if (f >= c.from && f < c.to) {
      d = 0;
      break;
    }
    d = Math.min(d, Math.abs(f - c.from), Math.abs(f - c.to));
  }
  const open = f < INTRO_F || f >= OUTRO_START + OUTRO_FADE_F ? MUSIC.open : MUSIC.gap;
  const k = interpolate(d, [2, 2 + MUSIC.ramp], [0, 1], {
    easing: omna.ease.inOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return MUSIC.duck + (open - MUSIC.duck) * k;
};

// Small white isotipo, top-right, while the team is on screen.
const Bug: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const o = interpolate(
    frame,
    [0, fps * 0.6, durationInFrames - fps * 0.4, durationInFrames],
    [0, 0.7, 0.7, 0],
    { easing: omna.ease.inOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <Img
      src={staticFile("omna/brand/logos/omna-mark-white.png")}
      style={{ position: "absolute", top: 64, right: omna.layout.gutter, width: 70, opacity: o }}
    />
  );
};

export const OmnaBienvenida: React.FC = () => {
  const footageFrom = CLIP_STARTS[CLIPS[0].id];
  const footageTo = OUTRO_START + OUTRO_FADE_F;
  return (
    <AbsoluteFill style={{ background: omna.colors.ink }}>
      {/* 1 · background: brand open */}
      <Sequence durationInFrames={INTRO_F}>
        <IntroCard />
      </Sequence>

      {/* 2 · footage, in timeline order (later clips stack above for dissolves) */}
      {CLIPS.map((c) => (
        <Sequence key={c.id} from={CLIP_STARTS[c.id]} durationInFrames={c.frames}>
          <Footage
            src={c.src}
            zoom={FRAMING[c.id]?.zoom ?? 1}
            origin={FRAMING[c.id]?.origin}
            fadeIn={c.join === "fade" ? (c.joinFrames ?? 0) : 0}
          />
        </Sequence>
      ))}
      {CLIPS.filter((c, i) => c.join === "fade" && i > 0).map((c) => (
        <Sequence
          key={`sweep-${c.id}`}
          from={CLIP_STARTS[c.id] - (c.joinFrames ?? 0)}
          durationInFrames={(c.joinFrames ?? 0) * 3}
        >
          <LightSweep duration={(c.joinFrames ?? 0) * 3} />
        </Sequence>
      ))}

      {/* 3 · graphics over footage: grade/scrim, bug, lower thirds, captions */}
      <Sequence from={footageFrom} durationInFrames={footageTo - footageFrom}>
        <FootageGrade />
        <Bug />
      </Sequence>
      {Object.values(PEOPLE).map((p) => (
        <Sequence
          key={p.name}
          from={CLIP_STARTS[p.clip] + Math.round(p.at * FPS)}
          durationInFrames={Math.round(p.dur * FPS)}
        >
          <LowerThird name={p.name} role={p.role} />
        </Sequence>
      ))}
      <Captions cues={CUES} />

      {/* end card dissolves in over the last clip */}
      <Sequence from={OUTRO_START} durationInFrames={OUTRO_F}>
        <OutroFadeIn>
          <OutroCard />
        </OutroFadeIn>
      </Sequence>

      {/* 4–5 · film grain over everything (brand) */}
      <BrandGrain opacity={0.06} />

      <Audio src={staticFile("omna/audio/music.wav")} volume={musicVolume} />
    </AbsoluteFill>
  );
};

const OutroFadeIn: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, OUTRO_FADE_F], [0, 1], {
    easing: omna.ease.out,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ opacity: p, transform: `scale(${interpolate(p, [0, 1], [1.02, 1])})` }}>
      {children}
    </AbsoluteFill>
  );
};
