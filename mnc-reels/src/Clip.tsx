// Exporta un B-roll suelto (1080×960) o la frase de cierre (1080×1920) para la carpeta de entrega.
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { theme } from "./theme";
import type { BRoll, Palabra } from "./reel/types";
import { BRollView } from "./components/BRolls";
import { GolpeView } from "./components/Golpes";

// desde: segundos dentro del B-roll donde empieza el clip (para partir un B-roll largo en B12/B13, B9/B10)
export const Clip: React.FC<{ b: BRoll; desde: number; dur: number }> = ({ b, desde }) => (
  <AbsoluteFill style={{ background: theme.color.verde }}>
    <AbsoluteFill style={{ transform: "translateY(-30px)" }}>
      <Sequence from={-Math.round(desde * 30)} layout="none">
        <BRollView b={b} />
      </Sequence>
    </AbsoluteFill>
  </AbsoluteFill>
);

export const CierreSolo: React.FC<{ dur: number; palabras?: Palabra[] }> = ({ dur, palabras = [] }) => (
  <GolpeView g={{ tipo: "cierre", start: 0, end: dur }} palabras={palabras} />
);
