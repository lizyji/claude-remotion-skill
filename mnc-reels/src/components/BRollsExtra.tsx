// B-rolls animados genéricos (sin marcas ni pantallas de productos reales), estilo MNC:
// tarjetas blancas con borde negro, píldoras, íconos de líneas negras con acentos naranja.
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import type { BRoll } from "../reel/types";
import { Check, Pildora, Tarjeta } from "./Base";

const { color, font } = theme;

// Progreso de un resorte que arranca en el segundo absoluto `t` (el B-roll empieza en `inicio`)
const useDesde = (inicio: number, t: number, preset: keyof typeof theme.spring = "suave") => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - Math.round((t - inicio) * fps), fps, config: theme.spring[preset] });
};

const Aparece: React.FC<{ p: number; children: React.ReactNode; dx?: number; dy?: number; style?: React.CSSProperties }> = ({ p, children, dx = 0, dy = 24, style }) => (
  <div style={{ opacity: Math.min(1, p * 1.4), transform: `translate(${dx * (1 - p)}px, ${dy * (1 - p)}px) scale(${interpolate(p, [0, 1], [0.92, 1])})`, ...style }}>
    {children}
  </div>
);

// Ícono de documento: líneas negras, esquina doblada, etiqueta naranja con el tipo
export const IconoDoc: React.FC<{ tipo: string; size?: number }> = ({ tipo, size = 96 }) => (
  <svg width={size} height={size * 1.2} viewBox="0 0 80 96" style={{ flexShrink: 0 }}>
    <path d="M6 4 H52 L74 26 V92 H6 Z" fill={color.blanco} stroke={color.negro} strokeWidth="4" strokeLinejoin="round" />
    <path d="M52 4 V26 H74" fill="none" stroke={color.negro} strokeWidth="4" strokeLinejoin="round" />
    <rect x="12" y="52" width="56" height="24" rx="6" fill={color.naranja} />
    <text x="40" y="70" textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight={800} fontSize={tipo.length > 3 ? 13 : 16} fill={color.blanco}>
      {tipo}
    </text>
  </svg>
);

const Sobre: React.FC<{ size?: number }> = ({ size = 84 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" style={{ flexShrink: 0 }}>
    <rect x="4" y="12" width="56" height="40" rx="6" fill={color.blanco} stroke={color.negro} strokeWidth="4" />
    <path d="M6 16 L32 36 L58 16" fill="none" stroke={color.negro} strokeWidth="4" strokeLinejoin="round" />
    <circle cx="54" cy="14" r="9" fill={color.naranja} stroke={color.negro} strokeWidth="3" />
  </svg>
);

export const BRollExtra: React.FC<{ b: BRoll }> = ({ b }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ini = b.start;
  const tAbs = ini + frame / fps;

  switch (b.tipo) {
    case "bandeja": {
      const pIn = useDesde(ini, ini + 0.15, "golpe");
      const pTag = useDesde(ini, ini + 1.0);
      const parpadeo = 0.5 + 0.5 * Math.sin(frame / 4);
      return (
        <Tarjeta style={{ width: 940, padding: "36px 40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 26 }}>
            <Sobre size={70} />
            <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 52, color: color.negro }}>Bandeja de entrada</div>
          </div>
          <Aparece p={pIn} dx={120} dy={0}>
            <div style={{ border: theme.card.border, borderRadius: 20, padding: "26px 30px", background: color.verde, display: "flex", alignItems: "center", gap: 22 }}>
              <div style={{ width: 22, height: 22, borderRadius: 11, background: color.naranja, opacity: 0.4 + 0.6 * parpadeo, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: font.texto, fontWeight: 800, fontSize: 46, color: color.negro, lineHeight: 1.15 }}>{b.asunto}</div>
                <div style={{ fontFamily: font.texto, fontWeight: 600, fontSize: 34, color: color.gris, marginTop: 6 }}>{b.remitente}</div>
              </div>
            </div>
          </Aparece>
          {b.etiqueta ? (
            <Aparece p={pTag} style={{ marginTop: 26 }}>
              <Pildora tono="negro">{b.etiqueta}</Pildora>
            </Aparece>
          ) : null}
        </Tarjeta>
      );
    }
    case "carrera": {
      const tGana = ini + (b.t ?? 0.9);
      const pA = useDesde(ini, ini + 0.1);
      const pB = useDesde(ini, ini + 0.25);
      const pG = useDesde(ini, tGana, "golpe");
      const Fila: React.FC<{ nombre: string; gana: boolean; p: number }> = ({ nombre, gana, p }) => {
        const barra = gana
          ? interpolate(tAbs, [ini + 0.2, tGana], [0.05, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.out })
          : interpolate(tAbs, [ini + 0.3, b.end], [0.05, 0.38], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <Aparece p={p}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, margin: "18px 0" }}>
              <div style={{ width: 300, fontFamily: font.texto, fontWeight: 800, fontSize: 40, color: color.negro }}>{nombre}</div>
              <div style={{ flex: 1, height: 54, borderRadius: 27, border: theme.card.border, background: color.verde, overflow: "hidden" }}>
                <div style={{ width: `${barra * 100}%`, height: "100%", background: gana ? color.naranja : color.gris }} />
              </div>
              <div style={{ width: 84, display: "flex", justifyContent: "center" }}>
                {gana ? <Check p={pG} size={78} /> : null}
              </div>
            </div>
            <div style={{ marginLeft: 320, fontFamily: font.texto, fontWeight: 600, fontSize: 32, color: gana ? color.naranja : color.gris, opacity: gana ? pG : interpolate(tAbs, [tGana, tGana + 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
              {gana ? b.ganador : b.perdedor}
            </div>
          </Aparece>
        );
      };
      return (
        <Tarjeta style={{ width: 960, padding: "40px 40px" }}>
          <Fila nombre={b.a} gana p={pA} />
          <Fila nombre={b.b} gana={false} p={pB} />
        </Tarjeta>
      );
    }
    case "subida": {
      const pP = useDesde(ini, ini + 0.5);
      return (
        <Tarjeta style={{ width: 940, padding: "36px 40px" }}>
          <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 50, color: color.negro, marginBottom: 22 }}>{b.titulo}</div>
          <div style={{ border: `3px dashed ${color.negro}`, borderRadius: 22, background: color.verde, padding: "26px 24px", display: "flex", justifyContent: "center", gap: 36, minHeight: 230 }}>
            {b.archivos.map((a, i) => {
              const p = useDesde(ini, a.t, "golpe");
              return (
                <Aparece key={i} p={p} dy={-140} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: 250 }}>
                  <IconoDoc tipo={a.tipo} size={110} />
                  <div style={{ fontFamily: font.texto, fontWeight: 600, fontSize: 28, color: color.negro, textAlign: "center", lineHeight: 1.2 }}>{a.nombre}</div>
                </Aparece>
              );
            })}
          </div>
          {b.pildora ? (
            <Aparece p={pP} style={{ marginTop: 22, textAlign: "center" }}>
              <Pildora tono="negro" style={{ fontSize: 28 }}>{b.pildora}</Pildora>
            </Aparece>
          ) : null}
        </Tarjeta>
      );
    }
    case "tabla": {
      const n = b.columnas.length;
      const ultima = b.columnas[n - 1].t;
      const pP = useDesde(ini, ini + 0.3);
      return (
        <Tarjeta style={{ width: 980, padding: "30px 26px" }}>
          <div style={{ display: "grid", gridTemplateColumns: `1.1fr 0.8fr 1.5fr 0.9fr`, border: theme.card.border, borderRadius: 18, overflow: "hidden" }}>
            {b.columnas.map((c, i) => {
              const p = useDesde(ini, c.t, "golpe");
              return (
                <div key={`h${i}`} style={{ background: color.negro, color: color.blanco, fontFamily: font.texto, fontWeight: 800, fontSize: 30, padding: "16px 12px", textAlign: "center", opacity: Math.min(1, p * 1.4), transform: `scale(${interpolate(p, [0, 1], [0.7, 1])})` }}>
                  {c.titulo}
                </div>
              );
            })}
            {b.filas.map((fila, r) =>
              fila.map((celda, i) => {
                // las celdas se llenan en cascada, en cuanto aparece su columna
                const tc = Math.max(b.columnas[i].t, ultima - 0.6) + 0.12 * r + 0.06 * i;
                const p = useDesde(ini, Math.min(tc, b.end - 0.8));
                return (
                  <div key={`c${r}-${i}`} style={{ background: r % 2 ? color.verde : color.blanco, fontFamily: font.texto, fontWeight: 600, fontSize: 28, color: color.negro, padding: "16px 10px", textAlign: "center", borderTop: `2px solid ${color.negro}`, opacity: p }}>
                    {celda}
                  </div>
                );
              }),
            )}
          </div>
          {b.pildora ? (
            <Aparece p={pP} style={{ marginTop: 18, textAlign: "center" }}>
              <Pildora tono="negro" style={{ fontSize: 26 }}>{b.pildora}</Pildora>
            </Aparece>
          ) : null}
        </Tarjeta>
      );
    }
    case "documento": {
      const pS = useDesde(ini, ini + 1.0, "golpe");
      return (
        <div style={{ position: "relative" }}>
          <Tarjeta style={{ width: 760, padding: "36px 44px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `3px solid ${color.negro}`, paddingBottom: 18, marginBottom: 20 }}>
              <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 52, color: color.negro }}>{b.titulo}</div>
              <div style={{ width: 70, height: 70, borderRadius: 16, background: color.naranja, border: theme.card.border }} />
            </div>
            {b.lineas.map((l, i) => {
              const p = useDesde(ini, ini + 0.2 + i * 0.18);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, margin: "14px 0", opacity: p }}>
                  <div style={{ fontFamily: font.texto, fontWeight: 600, fontSize: 30, color: color.negro, width: 330 }}>{l}</div>
                  <div style={{ flex: 1, height: 16, borderRadius: 8, background: color.verde, border: `2px solid ${color.gris}`, transformOrigin: "left", transform: `scaleX(${p})` }} />
                </div>
              );
            })}
            {b.pildora ? (
              <div style={{ marginTop: 16 }}>
                <Pildora tono="negro" style={{ fontSize: 26 }}>{b.pildora}</Pildora>
              </div>
            ) : null}
          </Tarjeta>
          {b.sello ? (
            <div style={{ position: "absolute", right: -40, top: -30, transform: `rotate(-10deg) scale(${interpolate(pS, [0, 1], [2, 1])})`, opacity: Math.min(1, pS * 2) }}>
              <Pildora style={{ fontSize: 40, padding: "14px 34px", border: theme.card.border }}>{b.sello}</Pildora>
            </div>
          ) : null}
        </div>
      );
    }
    case "sello": {
      const p = useDesde(ini, ini + 0.2, "golpe");
      const pA = useDesde(ini, ini + 0.05);
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
          {b.arriba ? (
            <Aparece p={pA}>
              <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 56, color: color.negro }}>{b.arriba}</div>
            </Aparece>
          ) : null}
          <div
            style={{
              border: `10px solid ${color.naranja}`,
              borderRadius: 34,
              padding: "34px 54px",
              background: color.blanco,
              transform: `rotate(-6deg) scale(${interpolate(p, [0, 1], [2.4, 1])})`,
              opacity: Math.min(1, p * 2.5),
              textAlign: "center",
              boxShadow: `0 0 0 4px ${color.blanco}, 0 0 0 7px ${color.naranja}`,
            }}
          >
            <div style={{ fontFamily: font.titulo, fontWeight: 800, fontSize: 92, lineHeight: 1.0, color: color.naranja, letterSpacing: 2 }}>{b.texto.toUpperCase()}</div>
          </div>
        </div>
      );
    }
    case "texto": {
      const p1 = useDesde(ini, ini + 0.05);
      const p2 = useDesde(ini, b.t2 ?? ini + 0.6, "golpe");
      const pP = useDesde(ini, ini + 0.0);
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14 }}>
          {b.pildora ? (
            <Aparece p={pP} style={{ marginBottom: 14 }}>
              <Pildora tono="negro">{b.pildora}</Pildora>
            </Aparece>
          ) : null}
          <Aparece p={p1}>
            <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 96, lineHeight: 1.05, color: color.negro }}>{b.linea1}</div>
          </Aparece>
          {b.linea2 ? (
            <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 110, lineHeight: 1.05, color: color.naranja, opacity: Math.min(1, p2 * 1.5), transform: `scale(${interpolate(p2, [0, 1], [1.5, 1])})` }}>
              {b.linea2}
            </div>
          ) : null}
        </div>
      );
    }
    default:
      return null;
  }
};
