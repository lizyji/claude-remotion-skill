import React from "react";
import { AbsoluteFill } from "remotion";
import { theme } from "./theme";
import type { Reel } from "./reel/types";
import { BRollView } from "./components/BRolls";
import { GolpeView } from "./components/Golpes";

// Un B-roll suelto para la carpeta de entrega: panel de arriba (1080×960) o golpe a pantalla completa (1080×1920).
export type SueltoProps = { reel: Reel; tipo: "broll" | "golpe"; i: number };

export const duracionSuelto = ({ reel, tipo, i }: SueltoProps) => {
  const x = tipo === "broll" ? reel.broll[i] : reel.golpes[i];
  return { durationInFrames: Math.max(1, Math.round((x.end - x.start) * 30)), width: 1080, height: tipo === "broll" ? 960 : 1920 };
};

export const BRollSuelto: React.FC<SueltoProps> = ({ reel, tipo, i }) => (
  <AbsoluteFill style={{ background: theme.color.verde }}>
    {tipo === "broll" ? <BRollView b={reel.broll[i]} /> : <GolpeView g={reel.golpes[i]} palabras={reel.palabras} />}
  </AbsoluteFill>
);
