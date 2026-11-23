import React from "react";
import { AbsoluteFill } from "remotion";
import { theme } from "./theme";
import type { Reel } from "./reel/types";
import { BRollView } from "./components/BRolls";
import { GolpeView } from "./components/Golpes";

// B-roll suelto para la carpeta de entrega: panel 1080×960 (o golpe 1080×1920), sin Manuel ni subtítulos.
// Se elige con --props='{"reel": …, "id": "T3_B7_ventas"}'
export const buscarClip = (reel: Reel, id: string) => {
  const b = reel.broll.find((x) => (x as { id?: string }).id === id);
  const g = reel.golpes.find((x) => (x as { id?: string }).id === id);
  return { b, g };
};

export const Clip: React.FC<{ reel: Reel; id: string }> = ({ reel, id }) => {
  const { b, g } = buscarClip(reel, id);
  if (b) {
    const local = { ...b, start: 0, end: b.end - b.start };
    return (
      <AbsoluteFill style={{ background: theme.color.verde }}>
        <BRollView b={local} />
      </AbsoluteFill>
    );
  }
  if (g) {
    // Las palabras se re-basan para que la frase se ilumine en su tiempo
    const palabras = reel.palabras.map((p) => ({ ...p, start: p.start - g.start, end: p.end - g.start }));
    return (
      <AbsoluteFill style={{ background: theme.color.verde }}>
        <GolpeView g={{ ...g, start: 0, end: g.end - g.start }} palabras={palabras} />
      </AbsoluteFill>
    );
  }
  return <AbsoluteFill style={{ background: theme.color.verde }} />;
};
