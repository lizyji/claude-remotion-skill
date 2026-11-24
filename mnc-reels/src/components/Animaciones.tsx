// Animaciones genéricas MNC: tablas, bloques, prompt y gráfica con DATOS FICTICIOS.
// No imitan la interfaz de Excel ni de Claude: son tarjetas blancas con borde negro,
// píldoras y colores planos de la marca.
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { Pildora, Tarjeta } from "./Base";

const { color, font } = theme;

const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, fps, t: frame / fps };
};
const sp = (frame: number, fps: number, at: number, preset: keyof typeof theme.spring = "suave") =>
  spring({ frame: frame - Math.round(at * fps), fps, config: theme.spring[preset] });
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Celda: React.FC<{ children?: React.ReactNode; w: number; style?: React.CSSProperties; head?: boolean }> = ({ children, w, style, head }) => (
  <div
    style={{
      width: w,
      height: 72,
      boxSizing: "border-box",
      borderRight: `2px solid ${color.negro}`,
      display: "flex",
      alignItems: "center",
      padding: "0 18px",
      fontFamily: font.texto,
      fontWeight: head ? 700 : 500,
      fontSize: 34,
      color: head ? color.blanco : color.negro,
      background: head ? color.negro : "transparent",
      whiteSpace: "nowrap",
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

const Fila: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; last?: boolean }> = ({ children, style, last }) => (
  <div style={{ display: "flex", borderBottom: last ? "none" : `2px solid ${color.negro}`, ...style }}>{children}</div>
);

const Tabla: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: color.blanco, border: theme.card.border, borderRadius: 22, overflow: "hidden", ...style }}>{children}</div>
);

// ───────── B1 · Hoja desordenada que tiembla y se limpia de golpe ─────────
const SUCIA = [
  ["cafe luna", "3/13/26", "$1,200"],
  ["Café Luna ", "", "980"],
  ["FERRETERIA SOL", "2026-3-5", "$ 2.340"],
  ["Textiles rio", "13 mzo", ""],
  ["Ferreteria Sol", "05/03/2026", "1500"],
];
const LIMPIA = [
  ["Café Luna", "$2,180"],
  ["Ferretería Sol", "$3,840"],
  ["Textiles Río", "$1,450"],
];

export const Hoja: React.FC<{ limpiaEn: number }> = ({ limpiaEn }) => {
  const { frame, fps, t } = useT();
  const limpio = t >= limpiaEn;
  const g = sp(frame, fps, limpiaEn, "golpe");
  const caos = limpio ? 0 : interpolate(t, [0, limpiaEn], [0.5, 1.4], clamp);
  const flash = interpolate(t, [limpiaEn - 0.05, limpiaEn, limpiaEn + 0.18], [0, 1, 0], clamp);
  if (!limpio) {
    return (
      <Tabla style={{ width: 940 }}>
        <Fila>
          <Celda w={350} head>Cliente</Celda>
          <Celda w={300} head>Fecha</Celda>
          <Celda w={290} head style={{ borderRight: "none" }}>Venta</Celda>
        </Fila>
        {SUCIA.map((r, i) => {
          const dx = Math.sin(frame * 1.7 + i * 2.1) * 7 * caos;
          const rot = Math.sin(frame * 1.3 + i) * 1.4 * caos;
          return (
            <Fila key={i} last={i === SUCIA.length - 1} style={{ transform: `translateX(${dx}px) rotate(${rot}deg)` }}>
              {r.map((c, j) => (
                <Celda
                  key={j}
                  w={[350, 300, 290][j]}
                  style={{
                    borderRight: j === 2 ? "none" : undefined,
                    justifyContent: j === 2 ? "flex-end" : j === 1 && i % 2 ? "flex-end" : "flex-start",
                    background: c === "" ? color.verde : undefined,
                    fontStyle: i % 3 === 1 ? "italic" : undefined,
                  }}
                >
                  {c}
                </Celda>
              ))}
            </Fila>
          );
        })}
      </Tabla>
    );
  }
  const max = 3840;
  return (
    <div style={{ display: "flex", gap: 30, alignItems: "stretch", transform: `scale(${interpolate(g, [0, 1], [1.08, 1])})` }}>
      <Tabla style={{ width: 540, outline: flash > 0 ? `${8 * flash}px solid ${color.naranja}` : undefined }}>
        <Fila>
          <Celda w={310} head>Cliente</Celda>
          <Celda w={230} head style={{ borderRight: "none", justifyContent: "flex-end" }}>Ventas</Celda>
        </Fila>
        {LIMPIA.map((r, i) => (
          <Fila key={i} last={i === LIMPIA.length - 1}>
            <Celda w={310}>{r[0]}</Celda>
            <Celda w={230} style={{ borderRight: "none", justifyContent: "flex-end", fontWeight: 700 }}>{r[1]}</Celda>
          </Fila>
        ))}
      </Tabla>
      <Tarjeta style={{ width: 330, padding: "24px 30px", display: "flex", alignItems: "flex-end", gap: 26 }}>
        {[2180, 3840, 1450].map((v, i) => {
          const pb = sp(frame, fps, limpiaEn + 0.1 + i * 0.1, "golpe");
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: (v / max) * 220 * Math.min(1, pb),
                background: i === 1 ? color.naranja : color.negro,
                borderRadius: "10px 10px 0 0",
              }}
            />
          );
        })}
      </Tarjeta>
    </div>
  );
};

// ───────── B2 · "=SUMA()" tachada + "Sin fórmulas" ─────────
export const Tachado: React.FC<{ formula: string; titulo: string }> = ({ formula, titulo }) => {
  const { frame, fps } = useT();
  const raya = interpolate(frame, [Math.round(0.2 * fps), Math.round(0.5 * fps)], [0, 1], { ...clamp, easing: theme.ease.out });
  const g = sp(frame, fps, 0.42, "golpe");
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
      <Tarjeta style={{ padding: "26px 44px", position: "relative" }}>
        <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 70, color: color.gris }}>{formula}</span>
        <div
          style={{
            position: "absolute",
            left: 30,
            top: "50%",
            height: 12,
            width: `calc(${raya * 100}% - ${60 * raya}px)`,
            background: color.naranja,
            borderRadius: 6,
            transform: "rotate(-4deg)",
          }}
        />
      </Tarjeta>
      <div
        style={{
          fontFamily: font.titulo,
          fontWeight: 700,
          fontSize: 150,
          lineHeight: 1,
          color: color.naranja,
          opacity: Math.min(1, g * 1.4),
          transform: `scale(${interpolate(g, [0, 1], [1.5, 1])})`,
        }}
      >
        {titulo}
      </div>
    </div>
  );
};

// ───────── B3 · Tres bloques que se juntan ─────────
export const Bloques: React.FC<{ items: { txt: string; en: number; naranja?: boolean }[]; juntaEn: number }> = ({ items, juntaEn }) => {
  const { frame, fps, t } = useT();
  const j = interpolate(t, [juntaEn, juntaEn + 0.35], [0, 1], { ...clamp, easing: theme.ease.inOut });
  const gj = sp(frame, fps, juntaEn + 0.3, "golpe");
  const golpe = 1 + 0.06 * Math.sin(Math.min(1, gj) * Math.PI) * (t > juntaEn ? 1 : 0);
  return (
    <div style={{ display: "flex", alignItems: "center", transform: `scale(${golpe})` }}>
      {items.map((it, i) => {
        const p = sp(frame, fps, it.en, "golpe");
        const ult = i === items.length - 1;
        return (
          <React.Fragment key={i}>
            <div
              style={{
                opacity: Math.min(1, p * 1.5),
                transform: `translateY(${interpolate(p, [0, 1], [-60, 0])}px) scale(${interpolate(p, [0, 1], [0.6, 1])})`,
                background: it.naranja ? color.naranja : color.blanco,
                color: it.naranja ? color.blanco : color.negro,
                border: theme.card.border,
                borderRadius: interpolate(j, [0, 1], [26, 0]),
                borderTopLeftRadius: i === 0 ? 26 : interpolate(j, [0, 1], [26, 0]),
                borderBottomLeftRadius: i === 0 ? 26 : interpolate(j, [0, 1], [26, 0]),
                borderTopRightRadius: ult ? 26 : interpolate(j, [0, 1], [26, 0]),
                borderBottomRightRadius: ult ? 26 : interpolate(j, [0, 1], [26, 0]),
                marginLeft: i === 0 ? 0 : -3 * j,
                padding: "40px 34px",
                fontFamily: font.titulo,
                fontWeight: 700,
                fontSize: 66,
                whiteSpace: "nowrap",
              }}
            >
              {it.txt}
            </div>
            {!ult ? (
              <div
                style={{
                  width: interpolate(j, [0, 1], [74, 0]),
                  overflow: "hidden",
                  textAlign: "center",
                  fontFamily: font.titulo,
                  fontWeight: 700,
                  fontSize: 70,
                  color: color.naranja,
                  opacity: (1 - j) * Math.min(1, sp(frame, fps, items[i + 1].en)),
                }}
              >
                +
              </div>
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ───────── B5 · Prompt que se escribe (tarjeta MNC, no la interfaz de Claude) ─────────
export const Prompt: React.FC<{ texto: string; pildora?: string }> = ({ texto, pildora }) => {
  const { frame, fps, t } = useT();
  const n = Math.round(interpolate(t, [0.25, 1.35], [0, texto.length], clamp));
  const cursor = Math.floor(frame / (fps * 0.25)) % 2 === 0;
  return (
    <Tarjeta style={{ width: 920, padding: "40px 46px" }}>
      {pildora ? <Pildora tono="negro" style={{ marginBottom: 26 }}>{pildora}</Pildora> : null}
      <div style={{ fontFamily: font.texto, fontWeight: 600, fontSize: 46, lineHeight: 1.35, color: color.negro, minHeight: 190 }}>
        {texto.slice(0, n)}
        <span style={{ display: "inline-block", width: 5, height: 48, marginLeft: 4, background: cursor ? color.naranja : "transparent", verticalAlign: "middle" }} />
      </div>
    </Tarjeta>
  );
};

// ───────── B6 · Base con errores que se corrige, con etiquetas naranjas ─────────
// Cada error: fila marcada + etiqueta; 0.45 s después la celda queda corregida.
const ERRORES = [
  { antes: ["cafe luna", "13/03/2026", "$980"], despues: ["Café Luna", "13/03/2026", "$980"], col: 0 },
  { antes: ["Ferretería Sol", "2026-3-5", "$2,340"], despues: ["Ferretería Sol", "05/03/2026", "$2,340"], col: 1 },
  { antes: ["Textiles Río", "18/03/2026", ""], despues: ["Textiles Río", "18/03/2026", "$1,450"], col: 2 },
];
const COLS = [340, 300, 240];

export const Errores: React.FC<{ etiquetas: { txt: string; en: number }[] }> = ({ etiquetas }) => {
  const { frame, fps, t } = useT();
  return (
    <div style={{ position: "relative" }}>
      <Tabla style={{ width: 880 }}>
        <Fila>
          {["Cliente", "Fecha", "Venta"].map((h, j) => (
            <Celda key={j} w={COLS[j]} head style={{ borderRight: j === 2 ? "none" : undefined }}>{h}</Celda>
          ))}
        </Fila>
        {ERRORES.map((e, i) => {
          const et = etiquetas[i];
          const on = et ? t >= et.en : false;
          const fixed = et ? t >= et.en + 0.45 : false;
          const row = fixed ? e.despues : e.antes;
          return (
            <Fila key={i} last={i === ERRORES.length - 1}>
              {row.map((c, j) => {
                const marca = j === e.col && on;
                return (
                  <Celda
                    key={j}
                    w={COLS[j]}
                    style={{
                      borderRight: j === 2 ? "none" : undefined,
                      justifyContent: j === 2 ? "flex-end" : "flex-start",
                      background: marca && !fixed ? color.naranja : marca && fixed ? color.verde : undefined,
                      color: marca && !fixed ? color.blanco : color.negro,
                      fontWeight: marca && fixed ? 700 : 500,
                    }}
                  >
                    {c}
                  </Celda>
                );
              })}
            </Fila>
          );
        })}
      </Tabla>
      {/* Etiquetas naranjas sobre cada tipo de error */}
      <div style={{ display: "flex", gap: 22, justifyContent: "center", marginTop: 30 }}>
        {etiquetas.map((e, i) => {
          const p = sp(frame, fps, e.en, "golpe");
          return (
            <div key={i} style={{ opacity: Math.min(1, p * 1.5), transform: `scale(${interpolate(p, [0, 1], [0.5, 1])})` }}>
              <Pildora style={{ fontSize: 38, padding: "12px 34px", border: `3px solid ${color.negro}` }}>{e.txt}</Pildora>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ───────── B7–B8 · Ventas por cliente (tabla) + gráfica ─────────
const VENTAS = [
  ["Ferretería Sol", 3840],
  ["Café Luna", 2180],
  ["Textiles Río", 1450],
  ["Papelería Norte", 960],
] as const;

export const Ventas: React.FC<{ tablaEn: number; graficaEn: number }> = ({ tablaEn, graficaEn }) => {
  const { frame, fps } = useT();
  const max = VENTAS[0][1];
  return (
    <div style={{ display: "flex", gap: 26, alignItems: "stretch" }}>
      <Tabla style={{ width: 500 }}>
        <Fila>
          <Celda w={300} head>Cliente</Celda>
          <Celda w={200} head style={{ borderRight: "none", justifyContent: "flex-end" }}>Ventas</Celda>
        </Fila>
        {VENTAS.map(([c, v], i) => {
          const p = sp(frame, fps, tablaEn + i * 0.14);
          return (
            <Fila key={i} last={i === VENTAS.length - 1} style={{ opacity: p, transform: `translateX(${interpolate(p, [0, 1], [-30, 0])}px)` }}>
              <Celda w={300} style={{ fontSize: 31 }}>{c}</Celda>
              <Celda w={200} style={{ borderRight: "none", justifyContent: "flex-end", fontWeight: 700, fontSize: 31 }}>
                ${v.toLocaleString("en-US")}
              </Celda>
            </Fila>
          );
        })}
      </Tabla>
      <Tarjeta style={{ width: 430, padding: "24px 28px", display: "flex", flexDirection: "column" }}>
        <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 32, color: color.negro, opacity: sp(frame, fps, graficaEn) }}>
          Ventas por cliente
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 22, borderBottom: `3px solid ${color.negro}`, marginTop: 10 }}>
          {VENTAS.map(([, v], i) => {
            const p = sp(frame, fps, graficaEn + i * 0.1, "golpe");
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: (v / max) * 230 * Math.max(0, Math.min(1.04, p)),
                  background: i === 0 ? color.naranja : color.negro,
                  borderRadius: "10px 10px 0 0",
                }}
              />
            );
          })}
        </div>
      </Tarjeta>
    </div>
  );
};
