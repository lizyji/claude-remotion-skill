// Decisión de edición de un reel (reels/<slug>/reel.json). Todos los tiempos en segundos
// sobre el video YA recortado (sin silencios).

export type Palabra = { w: string; start: number; end: number };

export type BloqueSub = {
  start: number;
  end: number;
  // palabras del bloque; key=true las pinta de naranja (1–2 por bloque)
  words: { w: string; key?: boolean; start?: number }[];
};

export type Fuente = string; // "Fuente: Reuters, 12 may 2026 · reuters.com"

export type BRoll =
  | { tipo: "cita"; start: number; end: number; titular: string; medio?: string; fuente: Fuente } // plan B
  | { tipo: "pendiente"; start: number; end: number; id: string } // último recurso
  | {
      tipo: "imagen";
      start: number;
      end: number;
      src: string;
      fit?: "contain" | "cover";
      fuente?: Fuente;
      zoom?: [number, number];
      foco?: [number, number];
      // paneo: foco inicial → foco final (en %), para dar movimiento a una foto
      paneo?: [number, number, number, number];
      alto?: number; // alto de la tarjeta (default 600)
      // sello grande sobre la foto (p. ej. "FIN" en naranja), entra en "en" s
      sello?: { texto: string; en: number };
      // píldoras que entran sincronizadas con la voz (segundos relativos al inicio del clip)
      etiquetas?: { texto: string; en: number; tono?: "negro" | "naranja" }[];
      // la foto pierde el color (se "apaga") entre estos segundos relativos
      apaga?: [number, number];
    }
  | { tipo: "video"; start: number; end: number; src: string; desde?: number; fit?: "contain" | "cover"; fuente?: Fuente; recorte?: { x: number; y: number; w: number; h: number } }
  | { tipo: "logo"; start: number; end: number; src: string; etiqueta?: string; fuente?: Fuente }
  | { tipo: "contador"; start: number; end: number; valor: number; prefijo?: string; sufijo?: string; etiqueta: string; decimales?: number; fuente?: Fuente }
  | { tipo: "lista"; start: number; end: number; titulo?: string; items: string[]; cada?: number; tiempos?: number[]; check?: boolean; remate?: { texto: string; en: number }; fuente?: Fuente }
  | { tipo: "tarjeta"; start: number; end: number; pildora?: string; titulo: string; texto?: string; fuente?: Fuente }
  // Gráfica de barras (segundos relativos al inicio del clip en "en")
  | {
      tipo: "barras";
      start: number;
      end: number;
      titulo?: string;
      barras: { etiqueta: string; valor: number; en: number; tono?: "negro" | "naranja" | "gris" }[];
      maximo: number;
      reescala?: { maximo: number; en: number };
      delta?: { texto: string; en: number };
      fuente?: Fuente;
    }
  | { tipo: "linea"; start: number; end: number; titulo?: string; hitos: { cuando: string; texto: string; en: number; final?: boolean }[]; nota?: { texto: string; en: number }; fuente?: Fuente }
  | { tipo: "fabrica"; start: number; end: number; izq: string; der: string; apaga: number; enciende: number }
  | { tipo: "texto"; start: number; end: number; lineas: string[]; resalta?: string[]; size?: number; pildora?: string }
  // Composición B/C: stock de PERSONAS a pantalla completa + Manuel recortado (matte con alfa).
  | { tipo: "silueta"; start: number; end: number; src: string; desde?: number; fuente?: Fuente };

export type Golpe =
  | { tipo: "jugada"; start: number; end: number }
  // Golpe de frase (variante de "jugada" con texto propio): arriba en negro, abajo gigante en naranja
  | { tipo: "frase"; start: number; end: number; arriba: string; abajo: string }
  | { tipo: "numero"; start: number; end: number; valor: string; etiqueta?: string; fuente?: Fuente }
  | { tipo: "cierre"; start: number; end: number };

export type Reel = {
  slug: string;
  duracion: number; // segundos
  manuel: string; // ruta en public/, video recortado y normalizado (-14 LUFS)
  manuelMatte?: string; // ruta en public/, Manuel recortado con alfa (.webm VP9 alfa) para "silueta"
  caraYFuente?: number; // 0–1: altura de la cara dentro del video fuente (default 0.38)
  musica?: string;
  cortes: number[]; // instantes de los cortes de silencio → alterna 100%/112%
  palabras: Palabra[];
  subs: BloqueSub[];
  broll: BRoll[];
  golpes: Golpe[];
  pasos?: { start: number; end: number; n: number }[];
  sfx?: { t: number; s: "whoosh" | "pop" | "click" | "tick" | "bass" }[];
  portada?: { frase?: string; cuadro: number };
};

export const FRASE_CIERRE =
  "Si todavía no sabes cómo implementar IA en tu negocio, esta cuenta es para ti.";
