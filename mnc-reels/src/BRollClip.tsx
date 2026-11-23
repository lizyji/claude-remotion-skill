import React from "react";
import { AbsoluteFill } from "remotion";
import { theme } from "./theme";
import type { Reel } from "./reel/types";
import { BRollView } from "./components/BRolls";

// Un B-roll suelto (1080×960, mitad de arriba) para la carpeta de entrega.
// El panel del reel vive entre y≈200 y y≈870; aquí se centra en 960 px de alto.
export const BRollClip: React.FC<{ reel: Reel; i: number }> = ({ reel, i }) => (
  <AbsoluteFill style={{ background: theme.color.verde }}>
    <AbsoluteFill style={{ transform: "translateY(-60px)" }}>
      <BRollView b={reel.broll[i]} />
    </AbsoluteFill>
  </AbsoluteFill>
);
