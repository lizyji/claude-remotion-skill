import React from "react";
import { AbsoluteFill } from "remotion";
import { theme } from "./theme";
import type { BRoll } from "./reel/types";
import { BRollView } from "./components/BRolls";

// B-roll suelto para la carpeta de entrega: panel verde claro 1080×960 con el clip tal como sale en el reel.
export const BRollSolo: React.FC<{ b: BRoll }> = ({ b }) => (
  <AbsoluteFill style={{ background: theme.color.verde }}>
    <BRollView b={b} />
  </AbsoluteFill>
);
