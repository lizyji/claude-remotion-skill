import React, { createContext, useContext } from "react";
import { Audio, Freeze, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { mnc } from "../mnc/mncTheme";

// Reusable MNC reel kit. Everything is timed in ABSOLUTE seconds of the reel
// (straight from the word timings), so overlays never need Sequence offsets:
// <Win from to> mounts a block, <In at> animates one element inside it, and
// every element leaves together at the window's end.

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const WinCtx = createContext({ from: 0, to: Infinity });

export const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

export const Win: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const t = useT();
  if (t < from || t >= to) return null;
  return <WinCtx.Provider value={{ from, to }}>{children}</WinCtx.Provider>;
};

// spring progress since `at` (s) and the shared exit of the current window
export const useAnim = (at: number, kind: keyof typeof mnc.spring = "smooth") => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { to } = useContext(WinCtx);
  const p = spring({ frame: frame - Math.round(at * fps), fps, config: mnc.spring[kind] });
  const exit = interpolate(frame / fps, [to - 0.22, to], [0, 1], { easing: mnc.ease.in, ...clamp });
  return { p, exit };
};

export const In: React.FC<{
  at: number;
  dist?: number;
  kind?: keyof typeof mnc.spring;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ at, dist = 30, kind = "smooth", style, children }) => {
  const { p, exit } = useAnim(at, kind);
  return (
    <div
      style={{
        position: "absolute",
        opacity: p * (1 - exit),
        transform: `translateY(${(1 - p) * dist - exit * 20}px) scale(${0.94 + 0.06 * p})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ---------------- footage ----------------
export type Shot = { from: number; to: number; y?: number; scale?: number; punch?: [number, number] };

// Manuel's camera, framed so the face sits between the top band and the captions.
export const Cam: React.FC<{ src: string; shots: Shot[] }> = ({ src, shots }) => {
  const t = useT();
  const s = shots.find((x) => t >= x.from && t < x.to);
  if (!s) return null;
  const punch = s.punch ? interpolate(t, [s.punch[0], s.punch[0] + 0.25], [1, s.punch[1]], { easing: mnc.ease.out, ...clamp }) : 1;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <OffthreadVideo
        src={staticFile(src)}
        muted
        style={{
          position: "absolute",
          width: 1080,
          height: 1920,
          transform: `translateY(${s.y ?? -200}px) scale(${(s.scale ?? 1) * punch})`,
          transformOrigin: "50% 40%",
        }}
      />
      {/* legibility: soft falloff behind the top band and the captions, solid under the IG UI */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 64%, rgba(0,0,0,0.55) 71%, rgba(0,0,0,0.82) 78%, #000 88%)",
        }}
      />
    </div>
  );
};

// A real screen capture (dashboard, website) as an MNC capture card; `crop` hides
// the browser chrome (source pixels from the top).
export const CaptureCard: React.FC<{ src: string; from: number; crop: number; top?: number; h?: number; x?: number }> = ({
  src,
  from,
  crop,
  top = 420,
  h = 960,
  x = 0,
}) => {
  const { p, exit } = useAnim(from, "smooth");
  const k = 888 / 1080;
  return (
    <div
      style={{
        position: "absolute",
        left: 96,
        top,
        width: 888,
        height: h,
        borderRadius: 28,
        overflow: "hidden",
        border: `4px solid ${mnc.colors.white}`,
        boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
        opacity: p * (1 - exit),
        transform: `translateY(${(1 - p) * 60}px) scale(${0.95 + 0.05 * p})`,
      }}
    >
      <OffthreadVideo
        src={staticFile(src)}
        muted
        style={{ position: "absolute", left: -x * k, top: -crop * k, width: 1080 * k, height: 1920 * k }}
      />
    </div>
  );
};

// Last frame of the take held under the end card.
export const HoldFrame: React.FC<{ src: string; frame: number; y?: number }> = ({ src, frame, y = -200 }) => (
  <Freeze frame={frame}>
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <OffthreadVideo src={staticFile(src)} muted style={{ position: "absolute", width: 1080, height: 1920, transform: `translateY(${y}px)` }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 64%, rgba(0,0,0,0.55) 71%, rgba(0,0,0,0.82) 78%, #000 88%)" }} />
    </div>
  </Freeze>
);

// ---------------- type ----------------
const shadow = "5px 7px 10px rgba(0,0,0,0.45)";
const coverLine: React.CSSProperties = {
  fontFamily: mnc.fonts.body,
  fontWeight: mnc.weight.medium,
  color: mnc.colors.white,
  lineHeight: 1,
  textShadow: shadow,
  whiteSpace: "nowrap",
};

// The cover-style statement: small white lead, giant orange line, white line on
// an orange plate. Same look as the reel's cover, used for hook / key lines / CTA.
export const Statement: React.FC<{
  lead: string;
  big: string;
  plate?: string;
  at: [number, number, number?];
  top: number;
  bigSize?: number;
}> = ({ lead, big, plate, at, top, bigSize = 190 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", flexDirection: "column", alignItems: "center" }}>
    <Line at={at[0]}>
      <div style={{ ...coverLine, fontSize: 70, letterSpacing: "-0.03em" }}>{lead}</div>
    </Line>
    <Line at={at[1]} kind="pop">
      <div style={{ ...coverLine, fontSize: bigSize, letterSpacing: "-0.05em", color: mnc.colors.accent, marginTop: -bigSize * 0.12 }}>{big}</div>
    </Line>
    {plate ? (
      <Line at={at[2] ?? at[1]} kind="pop">
        <div style={{ marginTop: -bigSize * 0.08, background: mnc.colors.accent, padding: "4px 36px 16px" }}>
          <div style={{ ...coverLine, fontSize: 76, letterSpacing: "-0.035em" }}>{plate}</div>
        </div>
      </Line>
    ) : null}
  </div>
);

const Line: React.FC<{ at: number; kind?: keyof typeof mnc.spring; children: React.ReactNode }> = ({ at, kind = "smooth", children }) => {
  const { p, exit } = useAnim(at, kind);
  return (
    <div style={{ opacity: p * (1 - exit), transform: `translateY(${(1 - p) * 40 - exit * 20}px) scale(${1.08 - 0.08 * p})` }}>{children}</div>
  );
};

// Case eyebrow pinned top-left, on the brand's row: "01 · PEDIDOS".
export const Eyebrow: React.FC<{ label: string; at: number }> = ({ label, at }) => (
  <In at={at} dist={14} kind="snappy" style={{ left: mnc.safe.left, top: 204 }}>
    <div
      style={{
        fontFamily: mnc.fonts.body,
        fontWeight: mnc.weight.semibold,
        fontSize: 28,
        letterSpacing: mnc.tracking.label,
        textTransform: "uppercase",
        color: mnc.colors.accent,
        textShadow: "0 1px 8px rgba(0,0,0,0.5)",
      }}
    >
      {label}
    </div>
  </In>
);

// Poppins title for full-screen graphic beats.
export const Title: React.FC<{ at: number; top?: number; size?: number; children: React.ReactNode }> = ({ at, top = 300, size = 72, children }) => (
  <In at={at} dist={36} style={{ left: mnc.safe.left, right: 1080 - mnc.safe.right, top }}>
    <div
      style={{
        fontFamily: mnc.fonts.title,
        fontWeight: mnc.weight.bold,
        fontSize: size,
        lineHeight: 1.06,
        letterSpacing: mnc.tracking.title,
        color: mnc.colors.white,
      }}
    >
      {children}
    </div>
  </In>
);

// Case opener: giant orange number + title.
export const CaseIntro: React.FC<{ n: string; title: React.ReactNode; at: number }> = ({ n, title, at }) => (
  <>
    <In at={at} dist={50} kind="pop" style={{ left: mnc.safe.left, top: 560 }}>
      <div style={{ fontFamily: mnc.fonts.title, fontWeight: mnc.weight.extrabold, fontSize: 300, lineHeight: 1, letterSpacing: "-0.04em", color: mnc.colors.accent }}>
        {n}
      </div>
    </In>
    <In at={at + 0.12} dist={40} style={{ left: mnc.safe.left, right: 1080 - mnc.safe.right, top: 900 }}>
      <div style={{ fontFamily: mnc.fonts.title, fontWeight: mnc.weight.bold, fontSize: 110, lineHeight: 1.02, letterSpacing: "-0.025em", color: mnc.colors.white }}>
        {title}
      </div>
    </In>
  </>
);

// ---------------- diagram parts ----------------
// White pill with an orange line icon. `on` lights it with an orange ring
// (the step being described), `dim` greys it (the old, manual way).
export const Pill: React.FC<{ icon?: React.ReactNode; label: string; on?: boolean; dim?: boolean; size?: number; dark?: boolean }> = ({
  icon,
  label,
  on,
  dim,
  size = 30,
  dark,
}) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: size * 0.4,
      padding: `${size * 0.42}px ${size * 0.8}px ${size * 0.42}px ${icon ? size * 0.55 : size * 0.8}px`,
      borderRadius: mnc.radius.chip,
      background: dark ? mnc.colors.accent : mnc.colors.card,
      color: dark ? mnc.colors.white : mnc.colors.ink,
      boxShadow: on ? `0 0 0 5px ${mnc.colors.accent}, 0 16px 40px rgba(0,0,0,0.45)` : "0 16px 40px rgba(0,0,0,0.45)",
      opacity: dim ? 0.42 : 1,
      fontFamily: mnc.fonts.body,
      fontWeight: mnc.weight.semibold,
      fontSize: size,
      whiteSpace: "nowrap",
    }}
  >
    {icon ? <div style={{ width: size * 1.3, height: size * 1.3, color: dark ? mnc.colors.white : mnc.colors.accent, flex: "none" }}>{icon}</div> : null}
    {label}
  </div>
);

export const Arrow: React.FC<{ dir?: "right" | "down"; size?: number; dim?: boolean }> = ({ dir = "right", size = 40, dim }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{ transform: dir === "down" ? "rotate(90deg)" : undefined, opacity: dim ? 0.45 : 1, flex: "none" }}>
    <path d="M6 20h26M22 10l10 10-10 10" fill="none" stroke={mnc.colors.accent} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Big number on a white card: "8 pasos".
export const Stat: React.FC<{ value: string; label: string; w?: number; size?: number }> = ({ value, label, w = 420, size = 130 }) => (
  <div
    style={{
      width: w,
      padding: "22px 30px 26px",
      borderRadius: mnc.radius.card,
      background: mnc.colors.card,
      boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
    }}
  >
    <div style={{ fontFamily: mnc.fonts.title, fontWeight: mnc.weight.extrabold, fontSize: size, lineHeight: 1, letterSpacing: "-0.04em", color: mnc.colors.accent }}>
      {value}
    </div>
    <div style={{ marginTop: 8, fontFamily: mnc.fonts.body, fontWeight: mnc.weight.semibold, fontSize: 32, color: mnc.colors.ink }}>{label}</div>
  </div>
);

// light up a step once it is spoken
export const useOn = (at: number) => useT() >= at;

// ---------------- sound ----------------
// Subtle UI sound effects (scripts/gen-sfx.sh), placed at absolute seconds and kept
// well under the voice: whooshes on scene changes, pops/clicks on key entrances.
export type SfxKind = "whoosh" | "swoosh-soft" | "pop" | "click";
const SFX_VOL: Record<SfxKind, number> = { whoosh: 0.22, "swoosh-soft": 0.2, pop: 0.2, click: 0.16 };

export const Sfx: React.FC<{ cues: [number, SfxKind][] }> = ({ cues }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {cues.map(([t, k], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(t * fps) - (k === "whoosh" ? 6 : 0))} durationInFrames={Math.round(fps * 0.7)} layout="none">
          <Audio src={staticFile(`sfx/${k}.wav`)} volume={SFX_VOL[k]} />
        </Sequence>
      ))}
    </>
  );
};
