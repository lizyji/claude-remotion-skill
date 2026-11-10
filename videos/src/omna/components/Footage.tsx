import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { omna } from "../omnaTheme";

// One pre-processed talking-head clip. A slow eased push-in keeps the frame
// alive; `zoom` offsets the base scale so jump cuts within the same person
// read as an intentional punch-in. Fade joins cross-dissolve over `fadeIn`
// frames with a slight scale settle (opacity + scale, never a lone fade).
export const Footage: React.FC<{
  src: string;
  zoom?: number;
  origin?: string;
  fadeIn?: number;
}> = ({ src, zoom = 1, origin = "50% 38%", fadeIn = 0 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const push = interpolate(frame, [0, durationInFrames], [1, 1.025], {
    easing: omna.ease.inOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const enter =
    fadeIn > 0
      ? interpolate(frame, [0, fadeIn], [0, 1], {
          easing: omna.ease.out,
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;
  const settle = interpolate(enter, [0, 1], [1.015, 1]);
  return (
    <AbsoluteFill style={{ opacity: enter, overflow: "hidden" }}>
      <OffthreadVideo
        src={staticFile(src)}
        // voice ramps in with the picture so cross-dissolves never click
        volume={(f) =>
          fadeIn > 0
            ? interpolate(f, [0, fadeIn * 0.6], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            : 1
        }
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${push * zoom * settle})`,
          transformOrigin: origin,
        }}
      />
    </AbsoluteFill>
  );
};

// Brand light sweep for person-to-person dissolves: a soft violet→orange
// glow drifting across the cut. Peaks at ~0.16 opacity — felt, not seen.
export const LightSweep: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, duration], [0, 1], {
    easing: omna.ease.inOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const o = interpolate(p, [0, 0.5, 1], [0, 0.16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity: o,
        mixBlendMode: "screen",
        background: `radial-gradient(40% 70% at ${interpolate(p, [0, 1], [-10, 110])}% 45%, ${omna.colors.amethyst}, ${omna.colors.magenta} 40%, ${omna.colors.orange} 62%, rgba(0,0,0,0) 80%)`,
      }}
    />
  );
};
