import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, staticFile } from "remotion";
import { theme } from "./theme";
import type { Reel } from "./reel/types";
import { ConIA } from "./components/Base";

const { color, font, layout } = theme;

// Pinta de naranja las palabras indicadas (la frase NO cambia, solo el color)
const Destacada: React.FC<{ texto: string; palabras: string[] }> = ({ texto, palabras }) => {
  const re = new RegExp(`(${palabras.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  return (
    <>
      {texto.split(re).map((part, i) =>
        palabras.includes(part) ? (
          <span key={i} style={{ color: color.naranja }}>{part}</span>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  );
};

// Portada provisional (el brief con el estilo completo de Klarna/UPS llegó cortado).
// Foto: cuadro del video con la cara grande y centrada. Frase EXACTA como la da Manuel.
export const Portada: React.FC<{ reel: Reel }> = ({ reel }) => {
  const frase = reel.portada?.frase ?? "[FALTA LA FRASE DE PORTADA]";
  const caraY = (reel.caraYFuente ?? 0.38) * layout.H;
  const zoom = 1.25;
  return (
    <AbsoluteFill style={{ background: color.verde }}>
      {reel.portada?.foto ? (
        // cuadro exacto exportado del video (ffmpeg), más fiable que buscar el cuadro en un still
        <Img
          src={staticFile(reel.portada.foto)}
          style={{ position: "absolute", width: layout.W, height: layout.H, objectFit: "cover", transformOrigin: `50% ${caraY}px`, transform: `translateY(${1250 - caraY}px) scale(${zoom})` }}
        />
      ) : (
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
      )}
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
        {(reel.portada?.destacar ?? []).length ? <Destacada texto={frase} palabras={reel.portada!.destacar!} /> : <ConIA texto={frase} />}
      </div>
    </AbsoluteFill>
  );
};
