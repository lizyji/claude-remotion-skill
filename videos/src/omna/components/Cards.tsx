import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { omna } from "../omnaTheme";
import { BrandField } from "./Brand";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Eyebrow: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({
  children,
  color = omna.colors.orange,
  style,
}) => (
  <div
    style={{
      fontFamily: omna.fonts.sans,
      fontWeight: omna.weight.bold,
      fontSize: 22,
      letterSpacing: omna.tracking.wider,
      textTransform: "uppercase",
      color,
      ...style,
    }}
  >
    {children}
  </div>
);

// Brand open: the official gradient field, the white omna lockup resolving out
// of a soft blur, tagline underneath. Exits quickly into the first speaker.
export const IntroCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const logo = spring({ frame: frame - Math.round(fps * 0.12), fps, config: omna.spring.soft });
  const tag = spring({ frame: frame - Math.round(fps * 0.5), fps, config: omna.spring.calm });
  const exitLen = Math.round(fps * 0.35);
  const exit = interpolate(frame, [durationInFrames - exitLen, durationInFrames], [0, 1], {
    easing: omna.ease.in,
    ...clamp,
  });
  const breathe = 1 + Math.sin(frame / 18) * 0.004;
  return (
    <AbsoluteFill>
      <BrandField dim={0.45} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 28 }}>
        <Img
          src={staticFile("omna/brand/logos/omna-logo-white.png")}
          style={{
            width: 520,
            opacity: logo * (1 - exit),
            filter: `blur(${interpolate(logo, [0, 1], [10, 0])}px) drop-shadow(0 0 40px ${omna.colors.glowViolet})`,
            transform: `translateY(${interpolate(logo, [0, 1], [18, 0]) - exit * 12}px) scale(${interpolate(logo, [0, 1], [0.95, 1]) * breathe})`,
          }}
        />
        <Eyebrow
          color={omna.colors.lilac}
          style={{
            opacity: tag * (1 - exit),
            transform: `translateY(${interpolate(tag, [0, 1], [12, 0])}px)`,
          }}
        >
          Tecnología Omnipresente
        </Eyebrow>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// End card: left-anchored per the brand layout — eyebrow, two-beat sentence
// case headline with ONE gradient word, lockup below a hairline divider.
export const OutroCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = (s: number) => Math.round(fps * s);
  const enter = (delay: number) => spring({ frame: frame - delay, fps, config: omna.spring.calm });
  const rise = (p: number, d = 30): React.CSSProperties => ({
    opacity: p,
    transform: `translateY(${interpolate(p, [0, 1], [d, 0])}px)`,
  });
  const eyebrow = enter(at(0.45));
  const l1 = enter(at(0.6));
  const l2 = enter(at(0.78));
  const rule = enter(at(1.05));
  const logo = enter(at(1.2));
  const float = Math.sin(frame / 30) * 2;
  return (
    <AbsoluteFill>
      <BrandField src="omna/brand/gradients/omna-gradient-2.jpg" dim={0.3} />
      <div
        style={{
          position: "absolute",
          left: 160,
          top: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          transform: `translateY(${float}px)`,
        }}
      >
        <Eyebrow style={rise(eyebrow, 16)}>Siguiente paso</Eyebrow>
        <div
          style={{
            marginTop: 28,
            fontFamily: omna.fonts.sans,
            fontWeight: omna.weight.bold,
            fontSize: 104,
            lineHeight: 1.02,
            letterSpacing: omna.tracking.tight,
            color: omna.colors.white,
          }}
        >
          <div style={rise(l1)}>Agenda tu llamada</div>
          <div style={rise(l2)}>
            de{" "}
            <span
              style={{
                background: omna.gradient.text,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              inicio
            </span>
            .
          </div>
        </div>
        <div
          style={{
            marginTop: 56,
            width: 520,
            height: 1,
            background: omna.colors.borderSubtle,
            transformOrigin: "0% 50%",
            transform: `scaleX(${rule})`,
          }}
        />
        <div style={{ marginTop: 40, display: "flex", alignItems: "center", gap: 28, ...rise(logo, 14) }}>
          <Img src={staticFile("omna/brand/logos/omna-logo-white.png")} style={{ width: 230 }} />
          <div style={{ width: 1, height: 44, background: omna.colors.borderSubtle }} />
          <Eyebrow color={omna.colors.lilac} style={{ fontSize: 18, fontWeight: omna.weight.medium }}>
            Tecnología Omnipresente
          </Eyebrow>
        </div>
      </div>
    </AbsoluteFill>
  );
};
