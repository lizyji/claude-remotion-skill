import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { omna } from "../omnaTheme";

export type Cue = { from: number; to: number; text: string }; // absolute frames

// Corporate subtitles: one phrase at a time, max two balanced lines, centered
// low in the frame on a soft frosted ink plate (legible over the white shirt
// logos). Each phrase eases up a few px and fades in; it leaves faster.
// No per-word bouncing, no color highlights.
export const Captions: React.FC<{ cues: Cue[] }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cue = cues.find((c) => frame >= c.from && frame < c.to);
  if (!cue) return null;

  const inLen = Math.round(fps * 0.2);
  const outLen = Math.round(fps * 0.12);
  const local = frame - cue.from;
  const p = interpolate(local, [0, inLen], [0, 1], {
    easing: omna.ease.out,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const out = interpolate(frame, [cue.to - outLen, cue.to], [1, 0], {
    easing: omna.ease.in,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: omna.layout.captionBottom,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          padding: "12px 28px 14px",
          borderRadius: omna.radius.plate,
          background: omna.colors.captionPlate,
          backdropFilter: "blur(10px)",
          border: `1px solid ${omna.colors.borderSubtle}`,
          textAlign: "center",
          textWrap: "balance",
          fontFamily: omna.fonts.sans,
          fontWeight: omna.weight.medium,
          fontSize: 40,
          lineHeight: 1.32,
          letterSpacing: "0.005em",
          color: omna.colors.white,
          textShadow: "0 1px 2px rgba(22,2,33,0.5)",
          opacity: p * out,
          transform: `translateY(${interpolate(p, [0, 1], [10, 0])}px) scale(${interpolate(p, [0, 1], [0.985, 1])})`,
        }}
      >
        {cue.text}
      </div>
    </div>
  );
};
