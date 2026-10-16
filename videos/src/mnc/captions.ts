import words from "./words.json";
import { makeCaptions, type Word } from "./captionsCore";

export type { Word, Chunk } from "./captionsCore";

// Concepts that get the orange accent (1 per chunk, multi-word phrases first).
const KEYWORDS: string[][] = [
  ["memoria", "compartida"],
  ["google", "maps"],
  ["flujos", "con", "ia"],
  ["agentes", "internos"],
  ["inteligencia", "artificial"],
  ["dashboard"],
  ["whatsapp"],
  ["crm"],
  ["leads"],
  ["rutear"],
  ["automatizaciones"],
  ["automatizar"],
  ["agentes"],
  ["apps"],
  ["zapier"],
  ["análisis"],
  ["cerebro"],
  ["pronóstico"],
  ["planeación"],
  ["conciliar"],
  ["alertas"],
  ["ficha"],
  ["cotizadores"],
  ["programación"],
  ["ia"],
  ["profundidad"],
];

export const { CHUNKS, WORDS, at } = makeCaptions(words as Word[], KEYWORDS);
