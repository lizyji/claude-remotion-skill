import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

const { color, font, card, layout } = theme;

// Progreso de entrada (resorte) y salida (más rápida) de un elemento que vive [0, durFrames)
export const useEntradaSalida = (durFrames: number, delay = 0, preset: keyof typeof theme.spring = "suave") => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - delay, fps, config: theme.spring[preset] });
  const exitLen = Math.round(fps * 0.22);
  const exit = interpolate(frame, [durFrames - exitLen, durFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: theme.ease.inOut,
  });
  return Math.min(enter, exit);
};

// Entrada de 3 propiedades (opacidad + subida + escala) + respiración suave en reposo
export const Entra: React.FC<{ p: number; children: React.ReactNode; style?: React.CSSProperties; respira?: boolean }> = ({
  p,
  children,
  style,
  respira = true,
}) => {
  const frame = useCurrentFrame();
  const breathe = respira ? 1 + 0.004 * Math.sin(frame / 22) : 1;
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [46, 0])}px) scale(${interpolate(p, [0, 1], [0.92, 1]) * breathe})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Tarjeta: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; fondo?: string }> = ({
  children,
  style,
  fondo = color.blanco,
}) => (
  <div
    style={{
      background: fondo,
      border: card.border,
      borderRadius: card.radius,
      padding: "44px 48px",
      boxSizing: "border-box",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Pildora: React.FC<{ children: React.ReactNode; tono?: "negro" | "naranja"; style?: React.CSSProperties }> = ({
  children,
  tono = "naranja",
  style,
}) => (
  <span
    style={{
      display: "inline-block",
      background: tono === "naranja" ? color.naranja : color.negro,
      color: color.blanco,
      fontFamily: font.texto,
      fontWeight: 600,
      fontSize: 34,
      padding: "12px 30px",
      borderRadius: 999,
      ...style,
    }}
  >
    {children}
  </span>
);

// "Fuente: [medio o empresa], [fecha] · [sitio]" — gris, 24 px, y≈836
export const FuentePie: React.FC<{ texto?: string; p?: number }> = ({ texto, p = 1 }) =>
  texto ? (
    <div
      style={{
        position: "absolute",
        top: layout.fuenteY,
        left: 60,
        right: 60,
        textAlign: "center",
        fontFamily: font.texto,
        fontWeight: 400,
        fontSize: 24,
        color: color.gris,
        opacity: p,
      }}
    >
      {texto.startsWith("Fuente") ? texto : `Fuente: ${texto}`}
    </div>
  ) : null;

// Palomita: círculo naranja con trazo blanco
export const Check: React.FC<{ size?: number; p?: number }> = ({ size = 52, p = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 52 52" style={{ flexShrink: 0, transform: `scale(${p})` }}>
    <circle cx="26" cy="26" r="24" fill={color.naranja} stroke={color.negro} strokeWidth="2.5" />
    <path
      d="M15 27 L23 35 L38 18"
      fill="none"
      stroke={color.blanco}
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="40"
      strokeDashoffset={40 * (1 - p)}
    />
  </svg>
);

// Resalta "IA" en naranja dentro de un texto
export const ConIA: React.FC<{ texto: string }> = ({ texto }) => (
  <>
    {texto.split(/(\bIA\b)/g).map((part, i) =>
      part === "IA" ? (
        <span key={i} style={{ color: color.naranja }}>
          IA
        </span>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      ),
    )}
  </>
);
