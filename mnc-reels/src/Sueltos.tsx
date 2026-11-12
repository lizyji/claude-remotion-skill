// B-rolls sueltos para la entrega: cada clip del panel en 1080×960 (mitad de arriba), y los
// golpes a pantalla completa en 1080×1920. Mismo dibujo que en el reel.
import React from "react";
import { AbsoluteFill } from "remotion";
import { theme } from "./theme";
import type { BRoll, Golpe, Palabra } from "./reel/types";
import { BRollView } from "./components/BRolls";
import { GolpeView } from "./components/Golpes";

export const BRollSuelto: React.FC<{ b: BRoll }> = ({ b }) => (
  <AbsoluteFill style={{ background: theme.color.verde, overflow: "hidden" }}>
    <BRollView b={b} />
  </AbsoluteFill>
);

export const GolpeSuelto: React.FC<{ g: Golpe; palabras: Palabra[] }> = ({ g, palabras }) => (
  <AbsoluteFill style={{ background: theme.color.verde }}>
    <GolpeView g={g} palabras={palabras} />
  </AbsoluteFill>
);
