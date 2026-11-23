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

export type BRoll = { id?: string } & (
  | { tipo: "cita"; start: number; end: number; titular: string; medio?: string; fuente: Fuente } // plan B
  | { tipo: "pendiente"; start: number; end: number; id: string } // último recurso
  | { tipo: "imagen"; start: number; end: number; src: string; fit?: "contain" | "cover"; fuente?: Fuente; zoom?: [number, number]; foco?: [number, number] }
  | { tipo: "video"; start: number; end: number; src: string; desde?: number; fit?: "contain" | "cover"; fuente?: Fuente; recorte?: { x: number; y: number; w: number; h: number } }
  | { tipo: "logo"; start: number; end: number; src: string; etiqueta?: string; fuente?: Fuente }
  | { tipo: "contador"; start: number; end: number; valor: number; prefijo?: string; sufijo?: string; etiqueta: string; decimales?: number; desde?: number; fuente?: Fuente }
  | { tipo: "lista"; start: number; end: number; titulo?: string; items: string[]; cada?: number; check?: boolean; fuente?: Fuente }
  | { tipo: "tarjeta"; start: number; end: number; pildora?: string; titulo: string; texto?: string; textoEn?: number; tono?: "naranja" | "negro"; fuente?: Fuente }
  // Texto grande con golpe de zoom (arriba: línea chica opcional)
  | { tipo: "texto"; start: number; end: number; titulo: string; arriba?: string; abajo?: string; size?: number; tono?: "naranja" | "negro"; fuente?: Fuente }
  // "antes" aparece en antesEn s, se tacha en tachaEn s y entra "despues" (naranja)
  | { tipo: "tacha"; start: number; end: number; pildora?: string; antes: string; despues: string; antesEn?: number; tachaEn: number; fuente?: Fuente }
  // Ficha de cotización GENÉRICA (colores MNC, sin imitar ninguna bolsa) con gráfica que sube
  | { tipo: "cotizacion"; start: number; end: number; mercado: string; clave: string; dato: string; fuente?: Fuente }
  // Número que se escribe dígito por dígito a partir de "desde" s
  | { tipo: "digitos"; start: number; end: number; valor: string; arriba?: string; etiqueta?: string; desde?: number; fuente?: Fuente }
  // Aviso en recuadro gris
  | { tipo: "aviso"; start: number; end: number; texto: string; fuente?: Fuente }
  // Mosaico de oficinas genéricas (íconos) que se encienden una a una
  | { tipo: "mosaico"; start: number; end: number; etiqueta: string; n?: number; cada?: number; fuente?: Fuente }
  // Composición B/C: stock de PERSONAS a pantalla completa + Manuel recortado (matte con alfa).
  | { tipo: "silueta"; start: number; end: number; src: string; desde?: number; fuente?: Fuente });

export type Golpe = { id?: string } & (
  | { tipo: "jugada"; start: number; end: number; arriba?: string; abajo?: string }
  | { tipo: "numero"; start: number; end: number; valor: string; etiqueta?: string; fuente?: Fuente }
  // frase: por defecto FRASE_CIERRE; lineas = palabras por línea; nota = línea chica abajo
  | { tipo: "cierre"; start: number; end: number; frase?: string; lineas?: number[]; clave?: string[]; nota?: string });

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
  whooshAuto?: boolean; // false = sin whoosh automático en cada cambio de clip (ponlos a mano en sfx)
  sfx?: { t: number; s: "whoosh" | "pop" | "click" | "tick" | "bass" }[];
  portada?: { frase?: string; cuadro: number };
};

export const FRASE_CIERRE =
  "Si todavía no sabes cómo implementar IA en tu negocio, esta cuenta es para ti.";
