// B-rolls sueltos para la entrega (carpeta de B-rolls nombrados por toma).
// BRollSuelto: un B-roll del panel a 1080×960 (mitad de arriba). GolpeSuelto: golpe a 1080×1920.
import React from "react";
import { AbsoluteFill, Audio, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "./theme";
import type { Reel } from "./reel/types";
import { BRollView } from "./components/BRolls";
import { GolpeView } from "./components/Golpes";
import { Paso } from "./components/Subtitulos";

export const BRollSuelto: React.FC<{ reel: Reel; i: number }> = ({ reel, i }) => {
  const b = reel.broll[i];
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = b.start + frame / fps;
  const paso = (reel.pasos ?? []).find((p) => t >= p.start && t < p.end);
  return (
    <AbsoluteFill style={{ background: theme.color.verde, overflow: "hidden" }}>
      <BRollView b={b} conPaso={(reel.pasos ?? []).some((s) => s.start < b.end && s.end > b.start)} />
      {paso ? <Paso n={paso.n} p={spring({ frame: frame - Math.round((paso.start - b.start) * fps), fps, config: theme.spring.golpe })} /> : null}
      {(reel.sfx ?? [])
        .filter((s) => s.t >= b.start - 0.1 && s.t < b.end)
        .map((s, k) => (
          <Sequence key={k} from={Math.max(0, Math.round((s.t - b.start) * fps))} durationInFrames={fps} layout="none">
            <Audio src={staticFile(`sfx/${s.s}.wav`)} volume={0.4} />
          </Sequence>
        ))}
    </AbsoluteFill>
  );
};

export const GolpeSuelto: React.FC<{ reel: Reel; i: number }> = ({ reel, i }) => (
  <AbsoluteFill style={{ background: theme.color.verde }}>
    <GolpeView g={reel.golpes[i]} palabras={reel.palabras} />
  </AbsoluteFill>
);
