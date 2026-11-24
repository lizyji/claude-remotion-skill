import React from "react";
import { AbsoluteFill } from "remotion";
import { theme } from "./theme";
import type { Reel } from "./reel/types";
import { BRollView } from "./components/BRolls";
import { GolpeView } from "./components/Golpes";

// Un B-roll suelto para la entrega: los del panel en 1080×960 (mitad de arriba),
// los golpes a pantalla completa en 1080×1920. i = índice en [...broll, ...golpes].
export const BRollSuelto: React.FC<{ reel: Reel; i: number }> = ({ reel, i }) => {
  const n = reel.broll.length;
  if (i >= n) {
    const g = reel.golpes[i - n];
    return (
      <AbsoluteFill style={{ background: theme.color.verde }}>
        <GolpeView g={g} palabras={reel.palabras} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ background: theme.color.verde }}>
      {/* el panel vive entre y≈200 y y≈860 del lienzo vertical: se sube 40 px para centrarlo en 960 */}
      <AbsoluteFill style={{ transform: "translateY(-40px)" }}>
        <BRollView b={reel.broll[i]} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
