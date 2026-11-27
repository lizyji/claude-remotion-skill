import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { theme } from "./theme";
import type { Reel } from "./reel/types";
import { BRollView } from "./components/BRolls";
import { GolpeView } from "./components/Golpes";

// Solo el panel de B-roll (mitad de arriba, 1080×960) para entregar los clips sueltos.
// Los golpes a pantalla completa se dibujan en 1080×1920 y se escalan a la mitad.
export const Panel: React.FC<{ reel: Reel }> = ({ reel }) => {
  const { fps } = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);
  return (
    <AbsoluteFill style={{ background: theme.color.verde, overflow: "hidden" }}>
      {reel.broll
        .filter((b) => b.tipo !== "silueta")
        .map((b, i) => (
          <Sequence key={i} from={f(b.start)} durationInFrames={Math.max(1, f(b.end) - f(b.start))} layout="none">
            <BRollView b={b} />
          </Sequence>
        ))}
      {reel.golpes.map((g, i) => (
        <Sequence key={`g${i}`} from={f(g.start)} durationInFrames={Math.max(1, f(g.end) - f(g.start))}>
          <AbsoluteFill style={{ width: 1080, height: 1920, transform: "scale(0.5)", transformOrigin: "50% 0", left: 0 }}>
            <GolpeView g={g} palabras={reel.palabras} />
          </AbsoluteFill>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
