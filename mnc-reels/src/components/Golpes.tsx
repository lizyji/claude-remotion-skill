import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { FRASE_CIERRE, type Golpe, type Palabra } from "../reel/types";
import { FuentePie } from "./Base";

const { color, font } = theme;

// Golpe a pantalla completa (1–3 s). Entra rápido con escala, sale aún más rápido.
const Pantalla: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: theme.spring.rapido });
  const exit = interpolate(frame, [dur - 4, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.inOut });
  const p = Math.min(enter, exit);
  return (
    <AbsoluteFill style={{ background: color.verde, opacity: p, transform: `scale(${interpolate(p, [0, 1], [1.06, 1])})` }}>
      {children}
    </AbsoluteFill>
  );
};

const Jugada: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame, fps, config: theme.spring.suave });
  const b = spring({ frame: frame - 5, fps, config: theme.spring.golpe });
  const respira = 1 + 0.01 * Math.sin(frame / 6);
  return (
    <Pantalla dur={dur}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div
          style={{
            fontFamily: font.titulo,
            fontWeight: 700,
            fontSize: 110,
            color: color.negro,
            opacity: a,
            transform: `translateY(${interpolate(a, [0, 1], [40, 0])}px)`,
          }}
        >
          Aquí está
        </div>
        <div
          style={{
            fontFamily: font.titulo,
            fontWeight: 700,
            fontSize: 230,
            lineHeight: 1,
            color: color.naranja,
            opacity: Math.min(1, b * 1.5),
            transform: `scale(${interpolate(b, [0, 1], [1.6, 1]) * respira})`,
          }}
        >
          la jugada
        </div>
      </AbsoluteFill>
    </Pantalla>
  );
};

const Numero: React.FC<{ dur: number; valor: string; etiqueta?: string; fuente?: string }> = ({ dur, valor, etiqueta, fuente }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const g = spring({ frame, fps, config: theme.spring.golpe });
  const e = spring({ frame: frame - 6, fps, config: theme.spring.suave });
  return (
    <Pantalla dur={dur}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", padding: 60 }}>
        <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 280, lineHeight: 1, color: color.naranja, transform: `scale(${interpolate(g, [0, 1], [1.5, 1])})` }}>
          {valor}
        </div>
        {etiqueta ? (
          <div
            style={{
              fontFamily: font.titulo,
              fontWeight: 700,
              fontSize: 72,
              color: color.negro,
              textAlign: "center",
              marginTop: 24,
              opacity: e,
              transform: `translateY(${interpolate(e, [0, 1], [30, 0])}px)`,
            }}
          >
            {etiqueta}
          </div>
        ) : null}
      </AbsoluteFill>
      {fuente ? <div style={{ position: "absolute", top: 1500, left: 0, right: 0 }}><FuentePie texto={fuente} /></div> : null}
    </Pantalla>
  );
};

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

// Tiempo en que se ilumina cada palabra de la frase de cierre: empata con las palabras
// transcritas; si no encuentra alguna, la interpola entre vecinas.
export const tiemposCierre = (frase: string, palabras: Palabra[], start: number, end: number) => {
  const tokens = frase.split(" ");
  const pool = palabras.filter((p) => p.end > start - 0.2 && p.start < end);
  const res: (number | null)[] = tokens.map(() => null);
  let j = 0;
  tokens.forEach((tk, i) => {
    for (let k = j; k < Math.min(pool.length, j + 3); k++) {
      if (norm(pool[k].w) === norm(tk)) {
        res[i] = pool[k].start;
        j = k + 1;
        break;
      }
    }
  });
  // Anclas: [-1 → start], palabras encontradas, [n → 90% del golpe]
  const n = tokens.length;
  const anclas: [number, number][] = [[-1, start]];
  res.forEach((v, i) => v !== null && anclas.push([i, v]));
  anclas.push([n, start + (end - start) * 0.9]);
  return res.map((v, i) => {
    if (v !== null) return v;
    const ia = [...anclas].reverse().find(([k]) => k < i)!;
    const ib = anclas.find(([k]) => k > i)!;
    return ia[1] + ((ib[1] - ia[1]) * (i - ia[0])) / (ib[0] - ia[0]);
  });
};

// Palabras por línea: "Si todavía no sabes / cómo implementar IA / en tu negocio, / esta cuenta / es para ti."
const LINEAS_CIERRE = [4, 3, 3, 2, 3];

const Cierre: React.FC<{ dur: number; start: number; palabras: Palabra[]; end: number }> = ({ dur, start, end, palabras }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = start + frame / fps;
  const tokens = FRASE_CIERRE.split(" ");
  const tiempos = tiemposCierre(FRASE_CIERRE, palabras, start, end);
  return (
    <Pantalla dur={dur + 10}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: "0 80px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", fontFamily: font.titulo, fontWeight: 700, fontSize: 88, lineHeight: 1.22, textAlign: "center" }}>
          {LINEAS_CIERRE.map((n, li) => (
          <div key={li} style={{ display: "flex", gap: "0 0.28em" }}>
          {tokens.slice(LINEAS_CIERRE.slice(0, li).reduce((a, b) => a + b, 0), LINEAS_CIERRE.slice(0, li + 1).reduce((a, b) => a + b, 0)).map((tk, j) => {
            const i = LINEAS_CIERRE.slice(0, li).reduce((a, b) => a + b, 0) + j;
            const on = interpolate(t, [tiempos[i] - 0.04, tiempos[i] + 0.12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const esIA = tk.replace(/[^A-Za-z]/g, "") === "IA";
            return (
              <span
                key={i}
                style={{
                  color: esIA ? color.naranja : color.negro,
                  opacity: 0.22 + 0.78 * on,
                  transform: `scale(${1 + 0.06 * Math.sin(on * Math.PI)})`,
                  display: "inline-block",
                }}
              >
                {tk}
              </span>
            );
          })}
          </div>
          ))}
        </div>
      </AbsoluteFill>
    </Pantalla>
  );
};

export const GolpeView: React.FC<{ g: Golpe; palabras: Palabra[] }> = ({ g, palabras }) => {
  const { fps } = useVideoConfig();
  const dur = Math.round((g.end - g.start) * fps);
  if (g.tipo === "jugada") return <Jugada dur={dur} />;
  if (g.tipo === "numero") return <Numero dur={dur} valor={g.valor} etiqueta={g.etiqueta} fuente={g.fuente} />;
  return <Cierre dur={dur} start={g.start} end={g.end} palabras={palabras} />;
};
