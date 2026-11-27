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
  | { tipo: "imagen"; start: number; end: number; src: string; fit?: "contain" | "cover"; fuente?: Fuente; zoom?: [number, number]; foco?: [number, number]; logo?: string; pildora?: string }
  | { tipo: "video"; start: number; end: number; src: string; desde?: number; fit?: "contain" | "cover"; fuente?: Fuente; recorte?: { x: number; y: number; w: number; h: number }; pildora?: string }
  | { tipo: "logo"; start: number; end: number; src: string; etiqueta?: string; fuente?: Fuente }
  | { tipo: "contador"; start: number; end: number; valor: number; prefijo?: string; sufijo?: string; etiqueta: string; decimales?: number; fuente?: Fuente }
  // tiempos: segundos (absolutos del reel) en que entra cada item, para empatar con la palabra exacta
  | { tipo: "lista"; start: number; end: number; titulo?: string; items: string[]; cada?: number; tiempos?: number[]; check?: boolean | "pendiente"; pildora?: string; fuente?: Fuente }
  // Bandeja de entrada genérica (sin marca): un correo entrante con asunto y remitente
  | { tipo: "bandeja"; start: number; end: number; asunto: string; remitente: string; etiqueta?: string }
  // Dos competidores; el primero en responder gana la palomita naranja
  | { tipo: "carrera"; start: number; end: number; a: string; b: string; ganador: string; perdedor: string; t?: number }
  // Archivos que se suben a una zona de carga genérica (sin simular ninguna app real)
  | { tipo: "subida"; start: number; end: number; titulo: string; archivos: { nombre: string; tipo: string; t: number }[]; pildora?: string }
  // Tabla que se arma columna por columna (t = segundos absolutos en que aparece cada encabezado)
  | { tipo: "tabla"; start: number; end: number; columnas: { titulo: string; t: number }[]; filas: string[][]; pildora?: string }
  // Documento (borrador) con formato propio
  | { tipo: "documento"; start: number; end: number; titulo: string; lineas: string[]; sello?: string; pildora?: string }
  // Sello naranja con golpe
  | { tipo: "sello"; start: number; end: number; texto: string; arriba?: string }
  // Texto animado grande (dos partes, la segunda en naranja)
  | { tipo: "texto"; start: number; end: number; linea1: string; linea2?: string; t2?: number; pildora?: string }
  | { tipo: "tarjeta"; start: number; end: number; pildora?: string; titulo: string; texto?: string; fuente?: Fuente }
  // Composición B/C: stock de PERSONAS a pantalla completa + Manuel recortado (matte con alfa).
  | { tipo: "silueta"; start: number; end: number; src: string; desde?: number; fuente?: Fuente };

export type Golpe =
  | { tipo: "jugada"; start: number; end: number }
  | { tipo: "numero"; start: number; end: number; valor: string; etiqueta?: string; fuente?: Fuente }
  | { tipo: "cierre"; start: number; end: number }
  // CTA final a pantalla completa ("Comenta BRÚJULA"), para videos sin frase de firma
  | { tipo: "cta"; start: number; end: number; antes: string; palabra: string; tPalabra?: number; lineas?: { texto: string; t: number }[] };

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
  // false = sin whoosh automático en cada cambio de clip (se ponen a mano en sfx)
  whooshAuto?: boolean;
  portada?: { frase?: string; cuadro: number };
};

export const FRASE_CIERRE =
  "Si todavía no sabes cómo implementar IA en tu negocio, esta cuenta es para ti.";
