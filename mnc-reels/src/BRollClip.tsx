import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { theme } from "./theme";
import type { BRoll, Reel } from "./reel/types";
import { BRollView } from "./components/BRolls";
import { GolpeView } from "./components/Golpes";

// Un B-roll suelto para la entrega: mitad de arriba (1080×960), fondo verde claro.
// --props='{"reel": …, "i": <índice en reel.broll>}'  o  "golpe": <índice en reel.golpes> (pantalla completa recortada)
export const BRollClip: React.FC<{ reel: Reel; i?: number; golpe?: number }> = ({ reel, i, golpe }) => {
  const { durationInFrames } = useVideoConfig();
  if (golpe !== undefined) {
    const g = reel.golpes[golpe];
    return (
      <AbsoluteFill style={{ background: theme.color.verde, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: -480, width: 1080, height: 1920 }}>
          <GolpeView g={{ ...g, start: g.start, end: g.start + durationInFrames / 30 }} palabras={reel.palabras} />
        </div>
      </AbsoluteFill>
    );
  }
  const b = reel.broll[i ?? 0] as BRoll;
  return (
    <AbsoluteFill style={{ background: theme.color.verde, overflow: "hidden" }}>
      <Sequence layout="none">
        <BRollView b={b} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const duracionClip = (reel: Reel, i?: number, golpe?: number) => {
  const x = golpe !== undefined ? reel.golpes[golpe] : reel.broll[i ?? 0];
  return Math.max(1, Math.round((Math.min(x.end, reel.duracion) - x.start) * 30));
};
