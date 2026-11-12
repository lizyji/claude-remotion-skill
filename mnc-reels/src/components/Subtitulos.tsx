import React from "react";
import { interpolate } from "remotion";
import { theme } from "../theme";
import type { BloqueSub } from "../reel/types";

const { color, font, sub, layout } = theme;

// Subtítulos: Poppins ExtraBold 72 px, blancos con contorno negro ~9 px, centrados en y=960.
// El contorno se dibuja en una capa de atrás para que no se coma el relleno ni los espacios.
export const Subtitulos: React.FC<{ bloque: BloqueSub; t: number }> = ({ bloque, t }) => {
  const p = interpolate(t, [bloque.start, bloque.start + sub.popSec], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: theme.ease.out,
  });
  const linea = (stroke: boolean) => (
    <div
      style={{
        position: stroke ? "absolute" : "relative",
        inset: 0,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        columnGap: sub.wordGap,
        fontFamily: font.texto,
        fontWeight: 800,
        fontSize: sub.size,
        lineHeight: 1.12,
        textAlign: "center",
      }}
    >
      {bloque.words.map((w, i) => (
        <span
          key={i}
          style={
            stroke
              ? { color: color.negro, WebkitTextStroke: `${sub.stroke * 2}px ${color.negro}`, strokeLinejoin: "round" }
              : { color: w.key ? color.naranja : color.blanco }
          }
        >
          {w.w}
        </span>
      ))}
    </div>
  );
  return (
    <div
      style={{
        position: "absolute",
        left: 20,
        right: 20,
        top: layout.subY,
        transform: `translateY(-50%) scale(${interpolate(p, [0, 1], [0.7, 1])})`,
        opacity: p,
      }}
    >
      <div style={{ position: "relative" }}>
        {linea(true)}
        {linea(false)}
      </div>
    </div>
  );
};

// Número del paso arriba a la izquierda (cuadro naranja), dentro de la zona segura
export const Paso: React.FC<{ n: number; p: number }> = ({ n, p }) => (
  <div
    style={{
      position: "absolute",
      left: 60,
      top: 214,
      width: 112,
      height: 112,
      borderRadius: 22,
      background: color.naranja,
      border: theme.card.border,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: font.titulo,
      fontWeight: 700,
      fontSize: 68,
      color: color.blanco,
      opacity: p,
      transform: `scale(${interpolate(p, [0, 1], [0.6, 1])}) rotate(${interpolate(p, [0, 1], [-8, 0])}deg)`,
      zIndex: 5,
    }}
  >
    {n}
  </div>
);
