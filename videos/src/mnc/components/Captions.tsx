import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { mnc } from "../mncTheme";
import { CHUNKS as MNC_CHUNKS } from "../captions";
import type { Chunk } from "../captionsCore";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// MNC subtitles: Readex Pro, white, max two centered lines in the caption band
// (above the Instagram UI, below the speaker's face). One concept per chunk in
// orange. Words not yet spoken sit at reduced opacity so the line reads along
// with the voice — no bouncing, no per-word pops.
export const Captions: React.FC<{ offset?: number; chunks?: Chunk[]; hidden?: [number, number][] }> = ({
  offset = 0,
  chunks = MNC_CHUNKS,
  hidden = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps + offset;
  const c = chunks.find((x) => t >= x.from && t < x.to);
  // statements that already say the line on screen replace the caption
  if (!c || hidden.some(([a, b]) => t >= a && t < b)) return null;
  const local = t - c.from;
  const p = interpolate(local, [0, 0.16], [0, 1], { easing: mnc.ease.out, ...clamp });
  const out = interpolate(t, [c.to - 0.08, c.to], [1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: mnc.safe.left,
        right: 1080 - mnc.safe.right,
        top: mnc.layout.captionTop,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          maxWidth: 860,
          textAlign: "center",
          textWrap: "balance",
          fontFamily: mnc.fonts.body,
          fontWeight: mnc.weight.semibold,
          fontSize: 56,
          lineHeight: 1.16,
          letterSpacing: "-0.005em",
          color: mnc.colors.white,
          textShadow: "0 2px 4px rgba(0,0,0,0.55), 0 0 24px rgba(0,0,0,0.45)",
          opacity: p * out,
          transform: `translateY(${interpolate(p, [0, 1], [14, 0])}px)`,
        }}
      >
        {c.words.map((w, i) => {
          const spoken = interpolate(t, [w.s - 0.05, w.s + 0.08], [0.55, 1], clamp);
          return (
            <React.Fragment key={i}>
              <span style={{ color: w.hl ? mnc.colors.accent : undefined, opacity: spoken }}>{w.w}</span>
              {i < c.words.length - 1 ? " " : null}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
