import React from "react";
import { theme } from "../theme";
import type { Icono } from "../reel/types";

const { color } = theme;

// Íconos simples de líneas negras con acentos naranja (MNC). viewBox 64×64.
const N = color.negro;
const O = color.naranja;
const sw = 4;

const trazos: Record<Icono, React.ReactNode> = {
  correo: (
    <>
      <rect x="8" y="14" width="48" height="36" rx="6" fill="none" stroke={N} strokeWidth={sw} />
      <path d="M10 18 L32 35 L54 18" fill="none" stroke={O} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  calendario: (
    <>
      <rect x="9" y="13" width="46" height="42" rx="6" fill="none" stroke={N} strokeWidth={sw} />
      <path d="M9 25 H55" stroke={N} strokeWidth={sw} />
      <path d="M21 8 V17 M43 8 V17" stroke={N} strokeWidth={sw} strokeLinecap="round" />
      <rect x="20" y="32" width="10" height="9" rx="2" fill={O} />
    </>
  ),
  herramientas: (
    <>
      <path
        d="M40 10 a12 12 0 0 0 -11 16 L10 45 a5 5 0 0 0 7 7 L36 33 a12 12 0 0 0 16 -11 l-7 7 -8 -2 -2 -8 z"
        fill="none"
        stroke={N}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      <circle cx="15" cy="48" r="3" fill={O} />
    </>
  ),
  campana: (
    <>
      <path d="M16 44 V30 a16 16 0 0 1 32 0 V44 l4 5 H12 z" fill="none" stroke={N} strokeWidth={sw} strokeLinejoin="round" />
      <path d="M26 54 a6 6 0 0 0 12 0" fill="none" stroke={N} strokeWidth={sw} strokeLinecap="round" />
      <circle cx="47" cy="16" r="7" fill={O} />
    </>
  ),
  sol: (
    <>
      <circle cx="32" cy="32" r="11" fill={O} stroke={N} strokeWidth={sw} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <path
          key={a}
          d="M32 8 V14"
          stroke={N}
          strokeWidth={sw}
          strokeLinecap="round"
          transform={`rotate(${a} 32 32)`}
        />
      ))}
    </>
  ),
  junta: (
    <>
      <circle cx="20" cy="22" r="7" fill="none" stroke={N} strokeWidth={sw} />
      <circle cx="44" cy="22" r="7" fill="none" stroke={N} strokeWidth={sw} />
      <path d="M8 50 a12 12 0 0 1 24 0 M32 50 a12 12 0 0 1 24 0" fill="none" stroke={N} strokeWidth={sw} strokeLinecap="round" />
      <path d="M6 54 H58" stroke={O} strokeWidth={sw} strokeLinecap="round" />
    </>
  ),
  pendiente: (
    <>
      <rect x="12" y="10" width="40" height="46" rx="6" fill="none" stroke={N} strokeWidth={sw} />
      <path d="M22 24 H42 M22 34 H42 M22 44 H34" stroke={N} strokeWidth={sw} strokeLinecap="round" />
      <circle cx="46" cy="46" r="8" fill={O} stroke={N} strokeWidth="3" />
    </>
  ),
  candado: (
    <>
      <path d="M21 28 V20 a11 11 0 0 1 22 0 V28" fill="none" stroke={N} strokeWidth={sw} strokeLinecap="round" />
      <rect x="13" y="28" width="38" height="28" rx="6" fill={O} stroke={N} strokeWidth={sw} />
      <circle cx="32" cy="40" r="3.5" fill={color.blanco} />
      <path d="M32 42 V48" stroke={color.blanco} strokeWidth="3.5" strokeLinecap="round" />
    </>
  ),
  check: (
    <>
      <circle cx="32" cy="32" r="24" fill={O} stroke={N} strokeWidth="3" />
      <path d="M21 33 L29 41 L44 24" fill="none" stroke={color.blanco} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  persona: (
    <>
      <circle cx="32" cy="18" r="9" fill="none" stroke={N} strokeWidth={sw} />
      <path d="M14 56 a18 18 0 0 1 36 0" fill="none" stroke={N} strokeWidth={sw} strokeLinecap="round" />
      <path d="M26 38 L32 46 L38 38" fill="none" stroke={O} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  compu: (
    <>
      <rect x="10" y="12" width="44" height="30" rx="4" fill="none" stroke={N} strokeWidth={sw} />
      <path d="M4 50 H60" stroke={N} strokeWidth={sw} strokeLinecap="round" />
      <path d="M24 46 H40" stroke={N} strokeWidth={sw} strokeLinecap="round" />
      <path d="M20 27 L26 32 L36 21" fill="none" stroke={O} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  ojo: (
    <>
      <path d="M4 32 C14 16 50 16 60 32 C50 48 14 48 4 32 z" fill="none" stroke={N} strokeWidth={sw} strokeLinejoin="round" />
      <circle cx="32" cy="32" r="8" fill={O} stroke={N} strokeWidth="3" />
    </>
  ),
};

export const Ico: React.FC<{ n: Icono; size?: number; style?: React.CSSProperties }> = ({ n, size = 64, style }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" style={{ flexShrink: 0, overflow: "visible", ...style }}>
    {trazos[n]}
  </svg>
);
