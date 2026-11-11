// MNC Carousel Design System. Colores planos únicamente; nada de degradados (salvo el
// fundido de composición entre panel y Manuel), morados, rosas ni azules.
import { Easing, continueRender, delayRender, staticFile } from "remotion";

// Fuentes locales (public/fonts, licencia OFL): el render no depende de la red.
const FUENTES: [string, string, string][] = [
  ["Poppins", "fonts/Poppins-Regular.ttf", "400"],
  ["Poppins", "fonts/Poppins-SemiBold.ttf", "600"],
  ["Poppins", "fonts/Poppins-ExtraBold.ttf", "800"],
  ["Readex Pro", "fonts/ReadexPro.ttf", "100 900"],
];
if (typeof document !== "undefined") {
  const h = delayRender("Cargando fuentes MNC");
  Promise.all(
    FUENTES.map(([family, src, weight]) => {
      const f = new FontFace(family, `url(${staticFile(src)})`, { weight });
      document.fonts.add(f);
      return f.load();
    }),
  )
    .then(() => continueRender(h))
    .catch((e) => {
      console.error(e);
      continueRender(h);
    });
}

export const theme = {
  color: {
    verde: "#E5EAE5",
    negro: "#141414",
    gris: "#4A4A4A",
    naranja: "#FD6623",
    blanco: "#FFFFFF",
  },
  font: {
    titulo: "'Readex Pro', sans-serif", // Readex Pro Bold
    texto: "Poppins, sans-serif", // Poppins
  },
  // Geometría del lienzo 1080×1920 (zonas seguras de Instagram: ~200 arriba, ~320 abajo)
  layout: {
    W: 1080,
    H: 1920,
    panelTop: 200, // inicio del contenido del panel
    panelBottom: 820, // fin del contenido del panel
    fuenteY: 836, // línea de "Fuente: …"
    subY: 960, // centro vertical de los subtítulos (unión panel/Manuel)
    fadeFrom: 900, // el panel es sólido hasta aquí…
    fadeTo: 1080, // …y se funde hacia Manuel hasta aquí
    caraY: 1440, // centro de la mitad inferior: ahí cae la cara de Manuel
  },
  card: {
    border: "3px solid #141414",
    radius: 28,
  },
  spring: {
    suave: { damping: 18, stiffness: 120, mass: 0.9 },
    golpe: { damping: 9, stiffness: 220, mass: 0.6 }, // "golpe de zoom"
    rapido: { damping: 20, stiffness: 300, mass: 0.5 },
  },
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1),
    inOut: Easing.bezier(0.65, 0, 0.35, 1),
  },
  sub: {
    size: 72,
    stroke: 9,
    wordGap: "calc(0.14em + 18px)", // 0.14 em visibles entre contornos (2 × 9 px)
    popSec: 0.14,
  },
} as const;

export type Theme = typeof theme;
