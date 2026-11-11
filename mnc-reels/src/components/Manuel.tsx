import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { theme } from "../theme";

const { layout } = theme;

// Encuadre de Manuel. mezcla: 0 = pantalla completa, 1 = cara centrada en la mitad de abajo.
// zoom: 1 / 1.12 alterno en cada corte. El origen de la escala es la cara, así no "brinca".
export const encuadre = (mezcla: number, caraYFuente: number) => {
  const caraFuentePx = caraYFuente * layout.H;
  const dy = (layout.caraY - caraFuentePx) * mezcla;
  return { dy, origenY: caraFuentePx };
};

export const Manuel: React.FC<{
  src: string;
  mezcla: number;
  zoom: number;
  caraYFuente: number;
  transparent?: boolean;
  muted?: boolean;
}> = ({ src, mezcla, zoom, caraYFuente, transparent, muted }) => {
  const { dy, origenY } = encuadre(mezcla, caraYFuente);
  return (
    <AbsoluteFill>
      <OffthreadVideo
        src={staticFile(src)}
        muted={muted}
        transparent={transparent}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: layout.W,
          height: layout.H,
          objectFit: "cover",
          transformOrigin: `50% ${origenY}px`,
          transform: `translateY(${dy}px) scale(${zoom})`,
        }}
      />
    </AbsoluteFill>
  );
};
