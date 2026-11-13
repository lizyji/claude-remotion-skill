// Animaciones de texto propias de MNC (colores planos, sin logos de terceros).
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { Check, Pildora, Tache, Tarjeta } from "./Base";

const { color, font } = theme;

// "Fiscal" vs. "Real": dos barras lado a lado y un "?" naranja con golpe de zoom (genérico, sin cifras).
export const FiscalReal: React.FC<{ golpe: number }> = ({ golpe }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: frame - 4, fps, config: theme.spring.suave });
  const b = spring({ frame: frame - 12, fps, config: theme.spring.suave });
  const q = spring({ frame: frame - Math.round(golpe * fps), fps, config: theme.spring.golpe });
  const col = (etq: string, tono: "negro" | "naranja", alto: number, p: number) => (
    <Tarjeta style={{ width: 340, height: 480, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "36px 30px" }}>
      <Pildora tono={tono} style={{ fontSize: 44, fontFamily: font.titulo, fontWeight: 700 }}>{etq}</Pildora>
      <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 54, color: color.negro }}>$ ???</div>
      <div style={{ width: 150, height: 220, display: "flex", alignItems: "flex-end" }}>
        <div style={{ width: "100%", height: alto * p, background: tono === "naranja" ? color.naranja : color.gris, border: theme.card.border, borderRadius: 14, boxSizing: "border-box" }} />
      </div>
    </Tarjeta>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      {col("Fiscal", "negro", 90, a)}
      <div style={{ width: 200, textAlign: "center", fontFamily: font.titulo, fontWeight: 700, fontSize: 240, lineHeight: 1, color: color.naranja, opacity: Math.min(1, q * 1.5), transform: `scale(${interpolate(q, [0, 1], [2.2, 1])}) rotate(${interpolate(q, [0, 1], [-20, 0])}deg)` }}>?</div>
      {col("Real", "naranja", 210, b)}
    </div>
  );
};

// Sello "Hecha para el SAT" cayendo sobre un documento genérico (sin logo del SAT).
export const Sello: React.FC<{ texto: string; cae: number; renglones?: { t: number; texto: string; ok: boolean }[] }> = ({ texto, cae, renglones }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - Math.round(cae * fps), fps, config: theme.spring.golpe });
  const temblor = frame >= cae * fps && frame < cae * fps + 6 ? Math.sin(frame * 3) * 4 : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 36, transform: `translateX(${temblor}px)` }}>
      <div style={{ position: "relative" }}>
        <Tarjeta style={{ width: 400, height: 520, padding: "40px 36px" }}>
          <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 36, color: color.negro, marginBottom: 26 }}>Contabilidad</div>
          {[0.9, 0.7, 0.85, 0.6, 0.8, 0.5, 0.75].map((w, i) => (
            <div key={i} style={{ height: 16, width: `${w * 100}%`, background: color.verde, borderRadius: 8, margin: "0 0 22px" }} />
          ))}
        </Tarjeta>
        <div
          style={{
            position: "absolute",
            left: -30,
            top: 170,
            width: 460,
            padding: "18px 10px",
            border: `8px solid ${color.naranja}`,
            borderRadius: 18,
            background: color.blanco,
            color: color.naranja,
            fontFamily: font.titulo,
            fontWeight: 700,
            fontSize: 50,
            lineHeight: 1.05,
            textAlign: "center",
            textTransform: "uppercase",
            opacity: Math.min(1, s * 2),
            transform: `rotate(-12deg) scale(${interpolate(s, [0, 1], [2.6, 1])})`,
          }}
        >
          {texto}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
        {(renglones ?? []).map((r, i) => {
          const p = spring({ frame: frame - Math.round(r.t * fps), fps, config: theme.spring.suave });
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, opacity: p, transform: `translateX(${interpolate(p, [0, 1], [30, 0])}px)` }}>
              {r.ok ? <Check p={p} size={60} /> : <Tache p={p} size={60} />}
              <span style={{ fontFamily: font.texto, fontWeight: 600, fontSize: 44, color: color.negro }}>{r.texto}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
