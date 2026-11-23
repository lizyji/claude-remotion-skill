// B-rolls sueltos para entregar: un clip del panel (1080×960) o un golpe a pantalla completa.
import React from "react";
import { AbsoluteFill } from "remotion";
import { theme } from "./theme";
import type { Reel } from "./reel/types";
import { BRollView } from "./components/BRolls";
import { GolpeView } from "./components/Golpes";

export const BRollSuelto: React.FC<{ reel: Reel; i: number }> = ({ reel, i }) => {
  const b = reel.broll[i];
  const conPaso = (reel.pasos ?? []).some((s) => s.start < b.end && s.end > b.start);
  return (
    <AbsoluteFill style={{ background: theme.color.verde, overflow: "hidden" }}>
      <BRollView b={b} conPaso={conPaso} />
    </AbsoluteFill>
  );
};

export const GolpeSuelto: React.FC<{ reel: Reel; i: number }> = ({ reel, i }) => (
  <AbsoluteFill style={{ background: theme.color.verde }}>
    <GolpeView g={reel.golpes[i]} palabras={reel.palabras} />
  </AbsoluteFill>
);
