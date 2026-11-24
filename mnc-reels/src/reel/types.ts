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
  // último recurso; items = píldoras genéricas que entran en "tiempos" (s relativos al inicio del clip)
  | { tipo: "pendiente"; start: number; end: number; id: string; items?: string[]; tiempos?: number[]; ilumina?: boolean; fuente?: Fuente }
  | { tipo: "imagen"; start: number; end: number; src: string; fit?: "contain" | "cover"; fuente?: Fuente; zoom?: [number, number]; foco?: [number, number] }
  | { tipo: "video"; start: number; end: number; src: string; desde?: number; fit?: "contain" | "cover"; fuente?: Fuente; recorte?: { x: number; y: number; w: number; h: number } }
  | { tipo: "logo"; start: number; end: number; src: string; etiqueta?: string; fuente?: Fuente }
  | { tipo: "contador"; start: number; end: number; valor: number; prefijo?: string; sufijo?: string; etiqueta: string; decimales?: number; fuente?: Fuente }
  | { tipo: "lista"; start: number; end: number; titulo?: string; items: string[]; cada?: number; tiempos?: number[]; check?: boolean; fuente?: Fuente }
  // Animaciones genéricas extra (tiempos "...En" en s relativos al inicio del clip)
  | { tipo: "reloj"; start: number; end: number; valor: string; etiqueta: string; antes?: string; numeroEn?: number; etiquetaEn?: number; fuente?: Fuente }
  | { tipo: "pila"; start: number; end: number; valor: number; etiqueta: string; llegaEn?: number; fuente?: Fuente }
  | { tipo: "lupa"; start: number; end: number; items: string[]; titulo?: string; itemsEn?: number; cada?: number; fuente?: Fuente }
  | { tipo: "calendario"; start: number; end: number; hasta: number; etiqueta: string; llegaEn?: number; fuente?: Fuente }
  | { tipo: "flecha"; start: number; end: number; de: string; a: string; extra?: string; aEn?: number; extraEn?: number; tachar?: boolean; deSize?: number; aSize?: number; fuente?: Fuente }
  | { tipo: "texto"; start: number; end: number; texto: string; resalta?: string; fuente?: Fuente }
  | { tipo: "verifica"; start: number; end: number; titulo: string; texto?: string; fuente?: Fuente }
  | { tipo: "tarjeta"; start: number; end: number; pildora?: string; titulo: string; texto?: string; fuente?: Fuente }
  // Composición B/C: stock de PERSONAS a pantalla completa + Manuel recortado (matte con alfa).
  | { tipo: "silueta"; start: number; end: number; src: string; desde?: number; fuente?: Fuente };

export type Golpe =
  | { tipo: "jugada"; start: number; end: number }
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
  // false = sin whoosh automático en cada cambio de clip (se ponen a mano en "sfx")
  whooshAuto?: boolean;
  portada?: { frase?: string; cuadro: number };
};

export const FRASE_CIERRE =
  "Si todavía no sabes cómo implementar IA en tu negocio, esta cuenta es para ti.";
