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
  | { tipo: "imagen"; start: number; end: number; src: string; fit?: "contain" | "cover"; fuente?: Fuente; zoom?: [number, number]; foco?: [number, number]; alto?: number; pie?: string }
  | { tipo: "video"; start: number; end: number; src: string; desde?: number; fit?: "contain" | "cover"; fuente?: Fuente; recorte?: { x: number; y: number; w: number; h: number } }
  | { tipo: "logo"; start: number; end: number; src: string; etiqueta?: string; fuente?: Fuente }
  | { tipo: "contador"; start: number; end: number; valor: number; prefijo?: string; sufijo?: string; etiqueta: string; decimales?: number; fuente?: Fuente }
  | { tipo: "lista"; start: number; end: number; titulo?: string; items: string[]; cada?: number; check?: boolean; fuente?: Fuente }
  | { tipo: "tarjeta"; start: number; end: number; pildora?: string; titulo: string; texto?: string; fuente?: Fuente }
  // Tipos extra (tiempos t ABSOLUTOS, en segundos del reel, para sincronizar con la palabra exacta)
  | { tipo: "logos"; start: number; end: number; titulo?: string; logos: { src: string; t: number; alt?: string }[]; ranking?: { texto: string; t: number; cae: number }; fuente?: Fuente }
  | { tipo: "sello"; start: number; end: number; pildora?: string; titulo: string; sello: string; tSello: number; fuente?: Fuente }
  | { tipo: "tachado"; start: number; end: number; pildora?: string; logo?: string; antes: string; tTacha: number; despues?: string; tDespues?: number; fuente?: Fuente }
  | { tipo: "checklist"; start: number; end: number; titulo: string; logo?: string; subtitulo?: string; items: { texto: string; nota?: string; t: number }[]; subeA1?: { indice: number; t: number; etiqueta?: string }; fuente?: Fuente }
  | { tipo: "linea"; start: number; end: number; titulo: string; logo?: string; items: { texto: string; t: number }[]; fuente?: Fuente }
  | { tipo: "bandeja"; start: number; end: number; asunto: string; de?: string; tSinRespuesta: number; fuente?: Fuente }
  | { tipo: "ecuacion"; start: number; end: number; partes: { texto: string; t: number; naranja?: boolean; signo?: string }[]; fuente?: Fuente }
  // Composición B/C: stock de PERSONAS a pantalla completa + Manuel recortado (matte con alfa).
  | { tipo: "silueta"; start: number; end: number; src: string; desde?: number; fuente?: Fuente };

export type Golpe =
  | { tipo: "jugada"; start: number; end: number }
  | { tipo: "numero"; start: number; end: number; valor: string; etiqueta?: string; fuente?: Fuente }
  | { tipo: "cierre"; start: number; end: number }
  // CTA a pantalla completa cuando Manuel no dice la frase de firma: "Comenta BRÚJULA"
  | { tipo: "cta"; start: number; end: number; antes: string; palabra: string; pie?: string; icono?: "brujula" };

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
  whooshAuto?: boolean; // false = sin whoosh automático en cada cambio de clip (se ponen a mano en sfx)
  portada?: { frase?: string; cuadro: number; foto?: string; destacar?: string[]; provisional?: boolean };
};

export const FRASE_CIERRE =
  "Si todavía no sabes cómo implementar IA en tu negocio, esta cuenta es para ti.";
