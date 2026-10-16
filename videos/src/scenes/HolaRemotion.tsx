import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../theme";
import { BgMesh, Grade, Grain, Vignette } from "../components/Layers";
import { Entrance, SceneExit, Spark, WordReveal } from "../components/Motion";

// Setup test composition: spark sting → title words → subtitle → tag line → exit
export const HOLA_TOTAL_S = 5;

export const HolaRemotion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const titleAt = Math.round(fps * 0.5);
  const subAt = Math.round(fps * 1.3);
  const tagAt = Math.round(fps * 1.8);

  const breathe = 1 + Math.sin(frame / 22) * 0.015;
  const float = Math.sin(frame / 30) * 3;
  const line = spring({ frame: frame - tagAt, fps, config: theme.spring.smooth });

  return (
    <AbsoluteFill>
      <BgMesh />
      <SceneExit duration={durationInFrames}>
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 36,
            transform: `translateY(${float}px)`,
          }}
        >
          <div style={{ transform: `scale(${breathe})` }}>
            <Spark size={170} color={theme.colors.accent} glow={theme.colors.accentGlow} />
          </div>
          <WordReveal
            text="Hola, Remotion"
            heroWord="Remotion"
            delay={titleAt}
            per={4}
            style={{
              fontFamily: theme.fonts.display,
              fontWeight: 700,
              fontSize: 150,
              letterSpacing: "-0.03em",
              color: theme.colors.text,
              gap: 36,
            }}
          />
          <Entrance delay={subAt}>
            <div
              style={{
                fontFamily: theme.fonts.body,
                fontSize: 44,
                color: theme.colors.textDim,
              }}
            >
              Videos creados con Claude Code y el skill de motion graphics
            </div>
          </Entrance>
          <Entrance delay={tagAt}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                fontFamily: theme.fonts.body,
                fontSize: 28,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: theme.colors.accent,
              }}
            >
              <div
                style={{
                  width: interpolate(line, [0, 1], [0, 80]),
                  height: 2,
                  background: theme.colors.accent,
                }}
              />
              Prueba de configuración
              <div
                style={{
                  width: interpolate(line, [0, 1], [0, 80]),
                  height: 2,
                  background: theme.colors.accent,
                }}
              />
            </div>
          </Entrance>
        </AbsoluteFill>
      </SceneExit>
      <Grade />
      <Grain />
      <Vignette />
    </AbsoluteFill>
  );
};
