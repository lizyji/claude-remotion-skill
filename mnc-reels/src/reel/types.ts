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
  | { tipo: "imagen"; start: number; end: number; src: string; fit?: "contain" | "cover"; fuente?: Fuente; zoom?: [number, number]; foco?: [number, number]; pildora?: string; pildoraEn?: number; fondo?: string }
  | { tipo: "video"; start: number; end: number; src: string; desde?: number; fit?: "contain" | "cover"; fuente?: Fuente; recorte?: { x: number; y: number; w: number; h: number }; pildora?: string; pildoraEn?: number }
  | { tipo: "logo"; start: number; end: number; src: string; etiqueta?: string; fuente?: Fuente; etiquetaEn?: number; arriba?: string }
  // Animaciones genéricas (sin marcas). Los tiempos "en" son segundos relativos al inicio del clip.
  | { tipo: "tormenta"; start: number; end: number; etiqueta?: string; etiquetaEn?: number; fuente?: Fuente }
  | { tipo: "iconos"; start: number; end: number; titulo?: string; items: { icono: "agua" | "linterna" | "pilas"; texto: string; en: number }[]; fuente?: Fuente }
  | { tipo: "anaquel"; start: number; end: number; modo: "vaciar" | "llenar"; titulo?: string; pregunta?: boolean; etiqueta?: string; fuente?: Fuente }
  | { tipo: "barras"; start: number; end: number; titulo?: string; subeEn: number; valor: string; etiqueta?: string; fuente?: Fuente }
  | { tipo: "camion"; start: number; end: number; carga?: string; tienda?: string; fuente?: Fuente }
  | { tipo: "tachado"; start: number; end: number; antes: string; despues: string; tachaEn: number; despuesEn: number; extra?: string; extraEn?: number; fuente?: Fuente }
  | { tipo: "exporta"; start: number; end: number; hoja: string; iaEn: number; fuente?: Fuente }
  | { tipo: "calendario"; start: number; end: number; titulo?: string; tituloEn?: number; etiquetas: { texto: string; en: number }[]; fuente?: Fuente }
  | { tipo: "comentario"; start: number; end: number; texto: string; fuente?: Fuente }
  | { tipo: "contador"; start: number; end: number; valor: number; prefijo?: string; sufijo?: string; etiqueta: string; decimales?: number; fuente?: Fuente }
  | { tipo: "lista"; start: number; end: number; titulo?: string; items: string[]; cada?: number; check?: boolean; fuente?: Fuente }
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
  duracionManuel?: number; // si el reel sigue después de la voz (p. ej. frase de cierre añadida), hasta dónde dura el video de Manuel
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
