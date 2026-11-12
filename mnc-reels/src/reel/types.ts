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
  // marco: tamaño de la caja (default 960×600); fondo: color del fondo de la captura (para que no se vea el borde);
  // etiqueta: píldora que entra en "etiquetaEn" s (relativo al inicio del clip)
  | { tipo: "imagen"; start: number; end: number; src: string; fit?: "contain" | "cover"; fuente?: Fuente; zoom?: [number, number]; foco?: [number, number]; marco?: { w: number; h: number }; fondo?: string; etiqueta?: string; etiquetaEn?: number }
  | { tipo: "video"; start: number; end: number; src: string; desde?: number; fit?: "contain" | "cover"; fuente?: Fuente; recorte?: { x: number; y: number; w: number; h: number } }
  | { tipo: "logo"; start: number; end: number; src: string; etiqueta?: string; nombre?: string; fuente?: Fuente }
  | { tipo: "contador"; start: number; end: number; valor: number; prefijo?: string; sufijo?: string; etiqueta: string; decimales?: number; fuente?: Fuente }
  | { tipo: "lista"; start: number; end: number; titulo?: string; items: string[]; cada?: number; en?: number[]; check?: boolean; fuente?: Fuente }
  | { tipo: "tarjeta"; start: number; end: number; pildora?: string; titulo: string; texto?: string; fuente?: Fuente }
  // Animaciones genéricas MNC (src/components/Animaciones.tsx). "en" = segundos desde el inicio del clip,
  // sincronizados con la palabra exacta de Manuel.
  | { tipo: "conectar"; start: number; end: number; centro: string; centroImg?: string; items: { icono: Icono; texto: string; en: number }[]; final?: { texto: string; en: number }; fuente?: Fuente }
  | { tipo: "notificacion"; start: number; end: number; antes?: { icono: Icono; texto: string; en: number }; titulo: string; tituloEn: number; items: { icono: Icono; texto: string; en: number }[]; fuente?: Fuente }
  | { tipo: "junta"; start: number; end: number; pedido: string; salida: string; salidaEn: number; barra: string; fuente?: Fuente }
  | { tipo: "nube"; start: number; end: number; titulo: string; items: string[]; en: number[]; fuente?: Fuente }
  | { tipo: "candados"; start: number; end: number; items: { texto: string; en: number }[]; sello: string; selloEn: number; fuente?: Fuente }
  | { tipo: "contraste"; start: number; end: number; pildora?: string; no: string; noEn: number; si: string; siEn: number; fuente?: Fuente }
  | { tipo: "columnas"; start: number; end: number; izq: { titulo: string; en: number; items: { icono: Icono; texto: string; en: number }[] }; der: { titulo: string; en: number; items: { icono: Icono; texto: string; en: number }[] }; fuente?: Fuente }
  // Composición B/C: stock de PERSONAS a pantalla completa + Manuel recortado (matte con alfa).
  | { tipo: "silueta"; start: number; end: number; src: string; desde?: number; fuente?: Fuente };

export type Icono = "correo" | "calendario" | "herramientas" | "campana" | "sol" | "junta" | "pendiente" | "candado" | "check" | "persona" | "compu" | "ojo";

export type Golpe =
  // jugada: "Aquí está" (negro) + "la jugada" (naranja gigante). arriba/abajo permiten otra frase del mismo estilo.
  | { tipo: "jugada"; start: number; end: number; arriba?: string; abajo?: string }
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
