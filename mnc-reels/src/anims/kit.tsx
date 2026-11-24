// Piezas reutilizables para animaciones MNC: tiempos absolutos, íconos de línea y cajas.
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

const { color, font } = theme;

// Tiempos en segundos ABSOLUTOS del video recortado (los de reel.json → palabras).
export const useReloj = (start: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = start + frame / fps;
  // resorte que arranca en el segundo `s` (absoluto)
  const sp = (s: number, preset: keyof typeof theme.spring = "suave") =>
    spring({ frame: Math.round((t - s) * fps), fps, config: theme.spring[preset] });
  // rampa lineal 0→1 entre a y b (absolutos)
  const rampa = (a: number, b: number, ease = theme.ease.out) =>
    interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return { t, frame, fps, sp, rampa };
};

// Aparece con resorte (opacidad + subida + escala)
export const Pop: React.FC<{ p: number; children: React.ReactNode; style?: React.CSSProperties; dy?: number }> = ({ p, children, style, dy = 30 }) => (
  <div
    style={{
      opacity: Math.min(1, p * 1.4),
      transform: `translateY(${interpolate(p, [0, 1], [dy, 0])}px) scale(${interpolate(p, [0, 1], [0.8, 1])})`,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Texto: React.FC<{ size?: number; peso?: number; c?: string; titulo?: boolean; style?: React.CSSProperties; children: React.ReactNode }> = ({
  size = 44,
  peso,
  c = color.negro,
  titulo,
  style,
  children,
}) => (
  <div
    style={{
      fontFamily: titulo ? font.titulo : font.texto,
      fontWeight: peso ?? (titulo ? 700 : 600),
      fontSize: size,
      color: c,
      lineHeight: 1.12,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Caja: React.FC<{ children: React.ReactNode; fondo?: string; style?: React.CSSProperties }> = ({ children, fondo = color.blanco, style }) => (
  <div
    style={{
      background: fondo,
      border: theme.card.border,
      borderRadius: 22,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxSizing: "border-box",
      ...style,
    }}
  >
    {children}
  </div>
);

// ---------- Íconos de línea negra con acento naranja ----------

// Reloj de arena; giro: 0–1 (media vuelta), arena: 0–1 (cuánta arena cayó)
export const RelojArena: React.FC<{ size?: number; giro?: number; arena?: number }> = ({ size = 70, giro = 0, arena = 0.5 }) => {
  const a = Math.max(0, Math.min(1, arena));
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" style={{ transform: `rotate(${giro * 180}deg)`, flexShrink: 0 }}>
      <line x1="14" y1="6" x2="46" y2="6" stroke={color.negro} strokeWidth="4" strokeLinecap="round" />
      <line x1="14" y1="54" x2="46" y2="54" stroke={color.negro} strokeWidth="4" strokeLinecap="round" />
      {/* arena arriba */}
      <path d={`M${18 + 12 * a} ${10 + 18 * a} L${42 - 12 * a} ${10 + 18 * a} L30 29 Z`} fill={color.naranja} />
      {/* arena abajo */}
      <path d={`M${30 - 12 * a} ${50 - 14 * a} L${30 + 12 * a} ${50 - 14 * a} L42 50 L18 50 Z`} fill={color.naranja} opacity={a > 0.02 ? 1 : 0} />
      <path d="M18 8 C18 22 27 25 27 30 C27 35 18 38 18 52 M42 8 C42 22 33 25 33 30 C33 35 42 38 42 52" fill="none" stroke={color.negro} strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
};

// Fólder de solicitud
export const Folder: React.FC<{ size?: number }> = ({ size = 220 }) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 120 96">
    <path d="M6 18 Q6 12 12 12 L42 12 L50 22 L108 22 Q114 22 114 28 L114 84 Q114 90 108 90 L12 90 Q6 90 6 84 Z" fill={color.blanco} stroke={color.negro} strokeWidth="3.5" strokeLinejoin="round" />
    <rect x="18" y="4" width="64" height="44" rx="3" fill={color.blanco} stroke={color.negro} strokeWidth="3" transform="rotate(-6 50 26)" />
    <line x1="26" y1="16" x2="66" y2="12" stroke={color.gris} strokeWidth="3" strokeLinecap="round" />
    <line x1="27" y1="26" x2="72" y2="21" stroke={color.gris} strokeWidth="3" strokeLinecap="round" />
    <path d="M6 36 L114 36 L114 84 Q114 90 108 90 L12 90 Q6 90 6 84 Z" fill={color.naranja} stroke={color.negro} strokeWidth="3.5" strokeLinejoin="round" />
    <rect x="44" y="52" width="32" height="10" rx="5" fill={color.blanco} stroke={color.negro} strokeWidth="2.5" />
  </svg>
);

// Pila de papeles
export const Papeles: React.FC<{ size?: number; n?: number }> = ({ size = 160, n = 5 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    {Array.from({ length: n }).map((_, i) => (
      <g key={i} transform={`translate(${(i % 2) * 4 - 2} ${80 - i * 13}) rotate(${(i % 3) - 1 * 2})`}>
        <rect x="14" y="0" width="72" height="12" rx="2" fill={i === n - 1 ? color.naranja : color.blanco} stroke={color.negro} strokeWidth="3" />
      </g>
    ))}
  </svg>
);

// X naranja que se dibuja (p: 0–1)
export const Tache: React.FC<{ size?: number; p?: number }> = ({ size = 120, p = 1 }) => {
  const a = Math.min(1, p * 2);
  const b = Math.max(0, p * 2 - 1);
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" style={{ flexShrink: 0 }}>
      <circle cx="30" cy="30" r="27" fill={color.naranja} stroke={color.negro} strokeWidth="3" style={{ transform: `scale(${Math.min(1, p * 3)})`, transformOrigin: "30px 30px" }} />
      <line x1="19" y1="19" x2={19 + 22 * a} y2={19 + 22 * a} stroke={color.blanco} strokeWidth="6" strokeLinecap="round" opacity={a > 0 ? 1 : 0} />
      <line x1="41" y1="19" x2={41 - 22 * b} y2={19 + 22 * b} stroke={color.blanco} strokeWidth="6" strokeLinecap="round" opacity={b > 0 ? 1 : 0} />
    </svg>
  );
};

// Flecha horizontal
export const Flecha: React.FC<{ w?: number; p?: number; c?: string }> = ({ w = 60, p = 1, c = color.negro }) => (
  <svg width={w} height={30} viewBox={`0 0 ${w} 30`} style={{ flexShrink: 0, opacity: p }}>
    <line x1="2" y1="15" x2={2 + (w - 12) * p} y2="15" stroke={c} strokeWidth="4" strokeLinecap="round" />
    <path d={`M${w - 14} 6 L${w - 3} 15 L${w - 14} 24`} fill="none" stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity={p > 0.8 ? 1 : 0} />
  </svg>
);

// Calendario
export const Calendario: React.FC<{ size?: number }> = ({ size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 60 60">
    <rect x="6" y="10" width="48" height="44" rx="6" fill={color.blanco} stroke={color.negro} strokeWidth="3.5" />
    <path d="M6 16 Q6 10 12 10 L48 10 Q54 10 54 16 L54 22 L6 22 Z" fill={color.naranja} stroke={color.negro} strokeWidth="3.5" strokeLinejoin="round" />
    <line x1="19" y1="5" x2="19" y2="15" stroke={color.negro} strokeWidth="4" strokeLinecap="round" />
    <line x1="41" y1="5" x2="41" y2="15" stroke={color.negro} strokeWidth="4" strokeLinecap="round" />
  </svg>
);

// Compartir (avión de papel)
export const Compartir: React.FC<{ size?: number }> = ({ size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 60 60">
    <circle cx="30" cy="30" r="28" fill={color.naranja} stroke={color.negro} strokeWidth="3" />
    <path d="M14 29 L46 16 L37 46 L29 34 Z" fill={color.blanco} stroke={color.negro} strokeWidth="3" strokeLinejoin="round" />
    <line x1="29" y1="34" x2="46" y2="16" stroke={color.negro} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// Globo de comentario
export const Comentario: React.FC<{ size?: number }> = ({ size = 60 }) => (
  <svg width={size} height={size} viewBox="0 0 60 60">
    <path d="M8 12 Q8 6 14 6 L46 6 Q52 6 52 12 L52 36 Q52 42 46 42 L26 42 L14 53 L16 42 L14 42 Q8 42 8 36 Z" fill={color.blanco} stroke={color.negro} strokeWidth="3.5" strokeLinejoin="round" />
    <circle cx="20" cy="24" r="3.5" fill={color.naranja} />
    <circle cx="30" cy="24" r="3.5" fill={color.naranja} />
    <circle cx="40" cy="24" r="3.5" fill={color.naranja} />
  </svg>
);
