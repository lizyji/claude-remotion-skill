import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { omna } from "../omnaTheme";

// Premium lower third: a gradient rule draws in, the NAME rises out of a mask,
// the role follows a few frames later; everything drifts a few px while held
// and leaves faster than it arrived. Lives inside a <Sequence> sized to its
// on-screen duration.
export const LowerThird: React.FC<{ name: string; role: string }> = ({
  name,
  role,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const stagger = Math.round(fps * 0.17);
  const exitLen = Math.round(fps * 0.4);

  const rule = spring({ frame, fps, config: omna.spring.calm });
  const nameIn = spring({ frame: frame - stagger, fps, config: omna.spring.calm });
  const roleIn = spring({ frame: frame - stagger * 2, fps, config: omna.spring.calm });

  const exit = interpolate(
    frame,
    [durationInFrames - exitLen, durationInFrames - 1],
    [0, 1],
    { easing: omna.ease.in, extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const drift = interpolate(frame, [0, durationInFrames], [0, 6], {
    easing: omna.ease.inOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const reveal = (p: number, dist: number): React.CSSProperties => ({
    display: "block",
    opacity: p * (1 - exit),
    transform: `translateY(${interpolate(p, [0, 1], [dist, 0]) - exit * 10}px)`,
  });

  return (
    <div
      style={{
        position: "absolute",
        left: omna.layout.gutter,
        bottom: omna.layout.lowerThirdBottom,
        display: "flex",
        alignItems: "stretch",
        gap: 24,
        transform: `translateX(${drift}px)`,
      }}
    >
      <div
        style={{
          width: 4,
          borderRadius: omna.radius.pill,
          background: omna.gradient.rule,
          boxShadow: `0 0 18px ${omna.colors.glowViolet}`,
          transformOrigin: "50% 100%",
          transform: `scaleY(${rule * (1 - exit)})`,
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", paddingTop: 4, paddingBottom: 6 }}>
        <div style={{ overflow: "hidden", paddingBottom: 6 }}>
          <span
            style={{
              ...reveal(nameIn, 64),
              fontFamily: omna.fonts.sans,
              fontWeight: omna.weight.bold,
              fontSize: 58,
              lineHeight: 1.05,
              letterSpacing: omna.tracking.snug,
              color: omna.colors.white,
              textShadow: "0 2px 24px rgba(22,2,33,0.55)",
            }}
          >
            {name}
          </span>
        </div>
        <div style={{ overflow: "hidden", marginTop: 8 }}>
          <span
            style={{
              ...reveal(roleIn, 34),
              fontFamily: omna.fonts.sans,
              fontWeight: omna.weight.medium,
              fontSize: 22,
              letterSpacing: omna.tracking.wider,
              textTransform: "uppercase",
              color: omna.colors.lilac,
              textShadow: "0 1px 14px rgba(22,2,33,0.6)",
            }}
          >
            {role}
          </span>
        </div>
      </div>
    </div>
  );
};
