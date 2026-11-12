import type { Reel } from "./types";

export const activo = <T extends { start: number; end: number }>(items: T[] | undefined, t: number) =>
  (items ?? []).find((x) => t >= x.start && t < x.end);

// Intervalos con B-roll en panel (los "silueta" van a pantalla completa, no cuentan)
const intervalosPanel = (reel: Reel) => {
  const xs = reel.broll
    .filter((b) => b.tipo !== "silueta")
    .map((b) => [b.start, b.end] as [number, number])
    .sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const x of xs) {
    const last = merged[merged.length - 1];
    if (last && x[0] - last[1] < 0.6) last[1] = Math.max(last[1], x[1]);
    else merged.push([...x]);
  }
  return merged;
};

// 0 = Manuel a pantalla completa, 1 = panel arriba + Manuel abajo (con transición suave)
export const mezclaPanel = (reel: Reel, t: number, rampa = 0.3) => {
  let m = 0;
  for (const [a, b] of intervalosPanel(reel)) {
    const up = Math.min(1, Math.max(0, (t - a + rampa) / rampa));
    const down = Math.min(1, Math.max(0, (b - t) / rampa));
    m = Math.max(m, Math.min(up, down));
  }
  // ease in-out
  return m < 0.5 ? 4 * m * m * m : 1 - Math.pow(-2 * m + 2, 3) / 2;
};

// Encuadre alterno 100% / 112% en cada corte de silencio
export const zoomCorte = (reel: Reel, t: number) => {
  const n = reel.cortes.filter((c) => c <= t).length;
  return n % 2 === 0 ? 1 : 1.12;
};
