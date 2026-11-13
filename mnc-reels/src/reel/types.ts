// Decisión de edición de un reel (reels/<slug>/reel.json). Todos los tiempos en segundos
// sobre el video YA recortado (sin silencios).

export type Palabra = { w: string; start: number; end: number };

export type BloqueSub = {
  start: number;
  end: number;
  // palabras del bloque; key=true las pinta de naranja (1–2 por bloque)
  words: { w: string; key?: boolean; start?: number }[];
};

export type Recorte = { x: number; y: number; w: number; h: number };
export type Fuente = string; // "Fuente: Reuters, 12 may 2026 · reuters.com"

export type BRoll =
  | { tipo: "cita"; start: number; end: number; titular: string; medio?: string; fuente: Fuente } // plan B
  | { tipo: "pendiente"; start: number; end: number; id: string } // último recurso
  | { tipo: "imagen"; start: number; end: number; src: string; fit?: "contain" | "cover"; fuente?: Fuente; zoom?: [number, number]; foco?: [number, number] }
  // recorte → recorteFin: paneo/zoom lento entre dos recortes (x,y,w,h en 0–1 del cuadro fuente).
  // etiqueta: píldora naranja sobre la tarjeta ("1 · Audita"); leyenda: aviso legible dentro de la tarjeta.
  | { tipo: "video"; start: number; end: number; src: string; desde?: number; fit?: "contain" | "cover"; fuente?: Fuente; recorte?: Recorte; recorteFin?: Recorte; etiqueta?: string; leyenda?: string }
  | { tipo: "logo"; start: number; end: number; src: string; etiqueta?: string; fuente?: Fuente }
  | { tipo: "contador"; start: number; end: number; valor: number; prefijo?: string; sufijo?: string; etiqueta: string; decimales?: number; fuente?: Fuente }
  | { tipo: "lista"; start: number; end: number; titulo?: string; items: string[]; cada?: number; tiempos?: number[]; check?: boolean; tache?: boolean; fuente?: Fuente }
  // Animaciones de texto propias (tiempos relativos al inicio del clip)
  | { tipo: "fiscalReal"; start: number; end: number; golpe: number }
  | { tipo: "sello"; start: number; end: number; texto: string; cae: number; renglones?: { t: number; texto: string; ok: boolean }[] }
  | { tipo: "frases"; start: number; end: number; pildora?: string; lineas: { t: number; texto: string; tono?: "negro" | "naranja" | "gris"; tachado?: number; size?: number }[] }
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
  portada?: { frase?: string; cuadro: number };
};

export const FRASE_CIERRE =
  "Si todavía no sabes cómo implementar IA en tu negocio, esta cuenta es para ti.";
