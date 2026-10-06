// MNC theme — Manual Maestro de Diseño de Carruseles MNC (V1.0, julio 2026),
// variante NEGRO, adaptado de 1080×1350 a reel 1080×1920. Única fuente de
// colores, tipos y movimiento del reel: nunca inline en componentes.
import { Easing } from "remotion";

export const mnc = {
  colors: {
    black: "#000000", // fondo variante negro
    white: "#FFFFFF", // texto principal
    whiteSoft: "#F0F0F0",
    gray: "#B8B8B8", // texto secundario
    ink: "#141414", // texto sobre cards blancas
    accent: "#FD6623", // naranja de acento universal (destacados, sparks, flechas)
    card: "#FFFFFF", // cards / capturas
    hairline: "rgba(255,255,255,0.14)",
    scrim: "rgba(0,0,0,0.62)",
  },
  fonts: {
    title: "Poppins", // titulares
    body: "Readex Pro", // marca, CTA, etiquetas, cuerpo
  },
  weight: { extralight: 200, regular: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800 },
  tracking: { title: "-0.015em", label: "0.08em" },
  radius: { card: 24, chip: 999, sticky: 18 },
  // Canvas 1080×1920. X safe 96–984 (manual); Y adapted to reel UI:
  // top ~200 px and bottom ~320 px are covered by the Instagram interface.
  safe: { left: 96, right: 984, top: 200, bottom: 1600 },
  layout: {
    brandTop: 200,
    labelTop: 300,
    titleTop: 352,
    stageTop: 640, // graphics zone
    stageBottom: 1400,
    captionTop: 1450,
  },
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1),
    inOut: Easing.bezier(0.65, 0, 0.35, 1),
    in: Easing.bezier(0.7, 0, 0.84, 0),
  },
  spring: {
    snappy: { damping: 15, stiffness: 170, mass: 0.6 },
    smooth: { damping: 22, stiffness: 110, mass: 0.9 },
    pop: { damping: 12, stiffness: 180, mass: 0.6 },
  },
} as const;
