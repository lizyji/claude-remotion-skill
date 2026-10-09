import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { mnc } from "../mncTheme";

type P = [number, number];
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const bez = (a: P, c: P, b: P, t: number): P => [
  (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t ** 2 * b[0],
  (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t ** 2 * b[1],
];

// A connection between two diagram nodes: an orange line that draws itself,
// then small "data" squares travelling along it (one direction or both).
// Rendered in a full-frame SVG so coordinates are canvas pixels.
export const Flow: React.FC<{
  from: P;
  to: P;
  bend?: number; // perpendicular offset of the curve's control point
  delay?: number; // s, relative to the parent Sequence
  dots?: number;
  period?: number; // s for one dot to travel the line
  both?: boolean;
  dim?: boolean;
}> = ({ from, to, bend = 0, delay = 0, dots = 2, period = 1.3, both, dim }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const f = frame - Math.round(delay * fps);
  const draw = interpolate(f, [0, Math.round(fps * 0.45)], [0, 1], { easing: mnc.ease.out, ...clamp });
  const exit = interpolate(frame, [durationInFrames - Math.round(fps * 0.2), durationInFrames], [1, 0], clamp);
  const mx = (from[0] + to[0]) / 2;
  const my = (from[1] + to[1]) / 2;
  const len = Math.hypot(to[0] - from[0], to[1] - from[1]) || 1;
  const c: P = [mx - ((to[1] - from[1]) / len) * bend, my + ((to[0] - from[0]) / len) * bend];
  const d = `M ${from[0]} ${from[1]} Q ${c[0]} ${c[1]} ${to[0]} ${to[1]}`;
  const travel = (k: number, rev: boolean) => {
    const t = ((f / fps - 0.35) / period + k / dots) % 1;
    if (f / fps < 0.35 + (k / dots) * period * 0) return null;
    const tt = rev ? 1 - t : t;
    const [x, y] = bez(from, c, to, tt);
    const fade = Math.sin(Math.PI * t);
    return <rect key={`${rev}-${k}`} x={x - 9} y={y - 9} width={18} height={18} rx={5} fill={mnc.colors.accent} opacity={fade * draw} />;
  };
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: exit * (dim ? 0.45 : 1) }}>
      <path
        d={d}
        fill="none"
        stroke={mnc.colors.accent}
        strokeOpacity={0.55}
        strokeWidth={4}
        strokeDasharray="2 12"
        strokeLinecap="round"
        pathLength={undefined}
        style={{ clipPath: undefined }}
        strokeDashoffset={-f * 0.6}
        opacity={draw}
      />
      {f > fps * 0.35 && Array.from({ length: dots }).map((_, k) => travel(k, false))}
      {both && f > fps * 0.35 && Array.from({ length: dots }).map((_, k) => travel(k + 0.5, true))}
    </svg>
  );
};
