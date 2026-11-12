import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { theme } from "./theme";
import type { Reel } from "./reel/types";
import { ConIA } from "./components/Base";

const { color, font, layout } = theme;

// Portada provisional (el brief con el estilo completo de Klarna/UPS llegó cortado).
// Foto: cuadro del video con la cara grande y centrada. Frase EXACTA como la da Manuel.
export const Portada: React.FC<{ reel: Reel }> = ({ reel }) => {
  const frase = reel.portada?.frase ?? "[FALTA LA FRASE DE PORTADA]";
  const caraY = (reel.caraYFuente ?? 0.38) * layout.H;
  const zoom = 1.25;
  return (
    <AbsoluteFill style={{ background: color.verde }}>
      <OffthreadVideo
        src={staticFile(reel.manuel)}
        muted
        startFrom={Math.round((reel.portada?.cuadro ?? 1) * 30)}
        style={{
          position: "absolute",
          width: layout.W,
          height: layout.H,
          objectFit: "cover",
          transformOrigin: `50% ${caraY}px`,
          transform: `translateY(${1250 - caraY}px) scale(${zoom})`,
        }}
      />
      <AbsoluteFill
        style={{
          height: 1000,
          background: color.verde,
          WebkitMaskImage: "linear-gradient(to bottom, #000 760px, transparent 1000px)",
          maskImage: "linear-gradient(to bottom, #000 760px, transparent 1000px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 260,
          left: 70,
          right: 70,
          textAlign: "center",
          fontFamily: font.titulo,
          fontWeight: 700,
          fontSize: 104,
          lineHeight: 1.08,
          color: color.negro,
        }}
      >
        <ConIA texto={frase} />
      </div>
    </AbsoluteFill>
  );
};
