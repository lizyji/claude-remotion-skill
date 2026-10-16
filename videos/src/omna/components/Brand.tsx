import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { omna } from "../omnaTheme";

// Brand grain — "the grain is the brand". Procedural fractal noise with film
// flicker; heavier on gradient fields, barely there over footage.
export const BrandGrain: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();
  const noise = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        backgroundImage: noise,
        backgroundSize: "240px",
        backgroundPosition: `${(frame * 37) % 240}px ${(frame * 53) % 240}px`,
        opacity,
        mixBlendMode: "overlay",
      }}
    />
  );
};

// Full-bleed OMNA gradient field (official degradado texture) on the ink
// ground, drifting slowly. Used for the brand open and the end card.
export const BrandField: React.FC<{ src?: string; dim?: number }> = ({
  src = "omna/brand/gradients/omna-gradient-1.jpg",
  dim = 0.35,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], {
    easing: omna.ease.inOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ background: omna.colors.ink, overflow: "hidden" }}>
      <Img
        src={staticFile(src)}
        style={{
          position: "absolute",
          width: "112%",
          height: "112%",
          left: "-6%",
          top: "-6%",
          objectFit: "cover",
          transform: `scale(${interpolate(p, [0, 1], [1, 1.07])}) translateX(${interpolate(p, [0, 1], [0, -36])}px)`,
        }}
      />
      {/* ink scrim keeps type readable and the field "lights-off" premium */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(90deg, ${omna.colors.ink} 0%, rgba(22,2,33,${0.55 + dim * 0.4}) 38%, rgba(22,2,33,${dim}) 100%)`,
        }}
      />
      <BrandGrain opacity={0.32} />
    </AbsoluteFill>
  );
};

// Readability + unification layer over footage: bottom ink scrim (captions,
// lower thirds) and a soft edge falloff. No violet tint on people — the
// design system forbids tinting photography to make it "on-brand".
export const FootageGrade: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(0deg, rgba(22,2,33,0.72) 0%, rgba(22,2,33,0.38) 22%, rgba(22,2,33,0) 44%)",
      }}
    />
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 50% 42%, rgba(22,2,33,0) 58%, rgba(22,2,33,0.32) 100%)",
      }}
    />
  </AbsoluteFill>
);
