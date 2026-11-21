import React from "react";
import { AbsoluteFill } from "remotion";
import { theme } from "./theme";
import type { Reel as ReelData } from "./reel/types";
import { BRollView } from "./components/BRolls";

// Un B-roll suelto para entregar (mitad de arriba, 1080×960). Props: { reel, i }.
export const BRollSuelto: React.FC<{ reel: ReelData; i: number }> = ({ reel, i }) => (
  <AbsoluteFill style={{ background: theme.color.verde }}>
    <BRollView b={reel.broll[i]} />
  </AbsoluteFill>
);
