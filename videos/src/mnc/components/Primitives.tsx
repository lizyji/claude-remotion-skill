import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { mnc } from "../mncTheme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Spring progress for an element that enters `delay` seconds into its Sequence.
export const useEnter = (delay = 0, config: keyof typeof mnc.spring = "smooth") => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - Math.round(delay * fps), fps, config: mnc.spring[config] });
};

// Fast exit at the end of the parent Sequence (exits are quicker than entrances).
export const useExit = (len = 0.3) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  return interpolate(frame, [durationInFrames - Math.round(len * fps), durationInFrames], [0, 1], {
    easing: mnc.ease.in,
    ...clamp,
  });
};

// fade + rise + scale — the standard entrance
export const rise = (p: number, dist = 36, exit = 0): React.CSSProperties => ({
  opacity: p * (1 - exit),
  transform: `translateY(${interpolate(p, [0, 1], [dist, 0]) - exit * 24}px) scale(${interpolate(p, [0, 1], [0.94, 1])})`,
});

// "manuel <nocode>" — Readex Pro Regular, right-anchored at X=984. FIJA.
export const BrandMark: React.FC<{ color?: string; shadow?: boolean }> = ({
  color = mnc.colors.white,
  shadow,
}) => (
  <div
    style={{
      position: "absolute",
      right: 1080 - mnc.safe.right,
      top: mnc.layout.brandTop,
      display: "flex",
      alignItems: "flex-start",
      gap: 6,
      fontFamily: mnc.fonts.body,
      fontWeight: mnc.weight.regular,
      color,
      lineHeight: 1,
      textShadow: shadow ? "0 1px 10px rgba(0,0,0,0.55)" : undefined,
    }}
  >
    <span style={{ fontSize: 42 }}>manuel</span>
    <span style={{ fontSize: 18, marginTop: 2 }}>{"<nocode>"}</span>
  </div>
);

// Signature six-point orange spark (rounded rays). Draws in ray by ray, then breathes.
export const Spark: React.FC<{ size: number; delay?: number; style?: React.CSSProperties }> = ({
  size,
  delay = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - Math.round(delay * fps), fps, config: mnc.spring.pop });
  const rot = interpolate(p, [0, 1], [-60, 0]) + Math.sin(frame / 40) * 4;
  return (
    <svg
      width={size}
      height={size}
      viewBox="-50 -50 100 100"
      style={{ transform: `rotate(${rot}deg) scale(${p})`, overflow: "visible", ...style }}
    >
      {[0, 60, 120].map((a, i) => {
        const rp = spring({ frame: frame - Math.round(delay * fps) - i * 2, fps, config: mnc.spring.snappy });
        return (
          <line
            key={a}
            x1={0}
            y1={-44 * rp}
            x2={0}
            y2={44 * rp}
            stroke={mnc.colors.accent}
            strokeWidth={15}
            strokeLinecap="round"
            transform={`rotate(${a})`}
          />
        );
      })}
    </svg>
  );
};

// Hand-drawn orange arrow: a slightly wobbly path that draws itself on.
export const HandArrow: React.FC<{
  d: string; // path in a 0..w × 0..h box
  w: number;
  h: number;
  delay?: number;
  head: [number, number, number]; // x, y, angle (deg) of the tip
  style?: React.CSSProperties;
}> = ({ d, w, h, delay = 0, head, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(frame - Math.round(delay * fps), [0, Math.round(fps * 0.45)], [0, 1], {
    easing: mnc.ease.out,
    ...clamp,
  });
  const headP = interpolate(frame - Math.round(delay * fps), [Math.round(fps * 0.35), Math.round(fps * 0.55)], [0, 1], clamp);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible", ...style }}>
      <path
        d={d}
        fill="none"
        stroke={mnc.colors.accent}
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - p}
      />
      <g transform={`translate(${head[0]} ${head[1]}) rotate(${head[2]})`} opacity={headP}>
        <path d="M -24 -16 L 0 0 L -24 16" fill="none" stroke={mnc.colors.accent} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
};

// Eyebrow label (UPPERCASE, wide tracking, orange) + sentence-case Poppins title.
export const SectionHeader: React.FC<{
  label: string;
  title?: React.ReactNode;
  delay?: number;
  size?: number;
}> = ({ label, title, delay = 0, size = 76 }) => {
  const exit = useExit(0.25);
  const l = useEnter(delay, "snappy");
  const t = useEnter(delay + 0.12, "smooth");
  return (
    <div style={{ position: "absolute", left: mnc.safe.left, right: 1080 - mnc.safe.right, top: mnc.layout.labelTop }}>
      <div
        style={{
          fontFamily: mnc.fonts.body,
          fontWeight: mnc.weight.semibold,
          fontSize: 30,
          letterSpacing: mnc.tracking.label,
          textTransform: "uppercase",
          color: mnc.colors.accent,
          ...rise(l, 18, exit),
        }}
      >
        {label}
      </div>
      {title ? (
        <div
          style={{
            marginTop: 18,
            fontFamily: mnc.fonts.title,
            fontWeight: mnc.weight.bold,
            fontSize: size,
            lineHeight: 1.06,
            letterSpacing: mnc.tracking.title,
            color: mnc.colors.white,
            ...rise(t, 40, exit),
          }}
        >
          {title}
        </div>
      ) : null}
    </div>
  );
};

export const Hl: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ color: mnc.colors.accent }}>{children}</span>
);

// White card that floats on black — the MNC way to show a thing/capture.
export const Card: React.FC<{
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ style, children }) => (
  <div
    style={{
      background: mnc.colors.card,
      borderRadius: mnc.radius.card,
      color: mnc.colors.ink,
      boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
      ...style,
    }}
  >
    {children}
  </div>
);

// Card with a line icon on top and a short label — the building block of diagrams.
export const NodeCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  x: number;
  y: number;
  w?: number;
  delay?: number;
  accent?: boolean;
}> = ({ icon, label, x, y, w = 300, delay = 0, accent }) => {
  const p = useEnter(delay, "pop");
  const exit = useExit(0.22);
  const frame = useCurrentFrame();
  const float = Math.sin(frame / 26 + x / 90) * 3;
  return (
    <Card
      style={{
        position: "absolute",
        left: x,
        top: y + float,
        width: w,
        padding: "32px 24px 30px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        border: accent ? `4px solid ${mnc.colors.accent}` : undefined,
        ...rise(p, 40, exit),
      }}
    >
      <div style={{ width: 88, height: 88, color: mnc.colors.accent }}>{icon}</div>
      <div
        style={{
          fontFamily: mnc.fonts.title,
          fontWeight: mnc.weight.semibold,
          fontSize: 36,
          lineHeight: 1.1,
          textAlign: "center",
          letterSpacing: mnc.tracking.title,
        }}
      >
        {label}
      </div>
    </Card>
  );
};

// Orange pill / chip.
export const Chip: React.FC<{
  label: string;
  x: number;
  y: number;
  delay?: number;
  filled?: boolean;
}> = ({ label, x, y, delay = 0, filled = true }) => {
  const p = useEnter(delay, "pop");
  const exit = useExit(0.2);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        padding: "14px 26px",
        borderRadius: mnc.radius.chip,
        background: filled ? mnc.colors.accent : "transparent",
        border: `3px solid ${mnc.colors.accent}`,
        color: filled ? mnc.colors.black : mnc.colors.accent,
        fontFamily: mnc.fonts.body,
        fontWeight: mnc.weight.semibold,
        fontSize: 30,
        whiteSpace: "nowrap",
        ...rise(p, 24, exit),
      }}
    >
      {label}
    </div>
  );
};
