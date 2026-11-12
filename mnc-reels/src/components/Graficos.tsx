// Gráficos animados genéricos (barras, línea de tiempo, fábrica dividida, texto grande).
// Colores planos MNC, sin degradados. Todos los tiempos "en" son segundos relativos al clip.
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { Pildora, Tarjeta } from "./Base";

const { color, font } = theme;
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

const useP = (en: number, preset: keyof typeof theme.spring = "suave") => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - Math.round(en * fps), fps, config: theme.spring[preset] });
};

const TituloG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 46, color: color.negro, lineHeight: 1.1, marginBottom: 18 }}>{children}</div>
);

// ───────────────────────── Barras ─────────────────────────
type Barra = { etiqueta: string; valor: number; en: number; tono?: "negro" | "naranja" | "gris" };
const tonos = { negro: color.negro, naranja: color.naranja, gris: color.gris };

const BarraV: React.FC<{ b: Barra; maximo: number; alto: number; ancho: number }> = ({ b, maximo, alto, ancho }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - Math.round(b.en * fps), fps, config: { damping: 22, stiffness: 90, mass: 1 } });
  const cuenta = interpolate(frame, [b.en * fps, b.en * fps + fps * 0.9], [0, b.valor], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: theme.ease.out,
  });
  const h = Math.max(4, (b.valor / maximo) * alto * p);
  const tono = tonos[b.tono ?? "negro"];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", width: ancho, opacity: Math.min(1, p * 3) }}>
      <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 46, color: tono, marginBottom: 10 }}>{fmt(cuenta)}</div>
      <div style={{ width: ancho * 0.72, height: h, background: tono, border: theme.card.border, borderRadius: "16px 16px 0 0", boxSizing: "border-box" }} />
      <div style={{ fontFamily: font.texto, fontWeight: 600, fontSize: 32, color: color.negro, marginTop: 12, textAlign: "center", lineHeight: 1.1 }}>
        {b.etiqueta}
      </div>
    </div>
  );
};

export const Barras: React.FC<{
  titulo?: string;
  barras: Barra[];
  maximo: number;
  reescala?: { maximo: number; en: number };
  delta?: { texto: string; en: number };
}> = ({ titulo, barras, maximo, reescala, delta }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const r = reescala ? spring({ frame: frame - Math.round(reescala.en * fps), fps, config: { damping: 24, stiffness: 70, mass: 1 } }) : 0;
  const max = reescala ? interpolate(r, [0, 1], [maximo, reescala.maximo]) : maximo;
  const pd = useP(delta?.en ?? 999, "golpe");
  const alto = titulo ? 300 : 360;
  const ancho = Math.min(280, 820 / barras.length);
  return (
    <Tarjeta style={{ width: 940, height: 600, position: "relative", display: "flex", flexDirection: "column" }}>
      {titulo ? <TituloG>{titulo}</TituloG> : null}
      <div style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "space-around", borderBottom: `3px solid ${color.negro}`, paddingBottom: 0 }}>
        {barras.map((b, i) => (
          <BarraV key={i} b={b} maximo={max} alto={alto} ancho={ancho} />
        ))}
      </div>
      {delta ? (
        <div
          style={{
            position: "absolute",
            right: 40,
            top: titulo ? 110 : 40,
            opacity: Math.min(1, pd * 2),
            transform: `scale(${interpolate(pd, [0, 1], [1.8, 1])}) rotate(-4deg)`,
          }}
        >
          <Pildora style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 64, padding: "10px 34px", border: theme.card.border }}>{delta.texto}</Pildora>
        </div>
      ) : null}
    </Tarjeta>
  );
};

// ───────────────────────── Línea de tiempo ─────────────────────────
export const Linea: React.FC<{ titulo?: string; hitos: { cuando: string; texto: string; en: number; final?: boolean }[]; nota?: { texto: string; en: number } }> = ({ titulo, hitos, nota }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const W = 760;
  const xs = hitos.map((_, i) => (hitos.length === 1 ? W / 2 : 50 + (i * (W - 100)) / (hitos.length - 1)));
  // la línea avanza hasta el último hito que ya entró
  let avance = 0;
  hitos.forEach((h, i) => {
    const p = interpolate(frame, [h.en * fps - 8, h.en * fps + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.inOut });
    if (p > 0) avance = i === 0 ? xs[0] * p : xs[i - 1] + (xs[i] - xs[i - 1]) * p;
  });
  return (
    <Tarjeta style={{ width: 940, height: 600, position: "relative" }}>
      {titulo ? <TituloG>{titulo}</TituloG> : null}
      <div style={{ position: "absolute", left: 60, top: 250, width: W + 60, height: 8, background: color.verde, borderRadius: 4 }} />
      <div style={{ position: "absolute", left: 60, top: 250, width: avance, height: 8, background: color.negro, borderRadius: 4 }} />
      {hitos.map((h, i) => {
        const p = spring({ frame: frame - Math.round(h.en * fps), fps, config: theme.spring.golpe });
        const on = Math.min(1, p * 1.5);
        const naranja = h.final;
        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: "absolute",
                left: 60 + xs[i] - 120,
                width: 240,
                top: 150,
                textAlign: "center",
                opacity: on,
                transform: `translateY(${interpolate(on, [0, 1], [24, 0])}px)`,
              }}
            >
              <Pildora tono={naranja ? "naranja" : "negro"} style={{ fontSize: 30, padding: "8px 22px", whiteSpace: "nowrap" }}>{h.cuando}</Pildora>
            </div>
            <div
              style={{
                position: "absolute",
                left: 60 + xs[i] - 26,
                top: 228,
                width: 52,
                height: 52,
                borderRadius: 26,
                background: naranja ? color.naranja : color.blanco,
                border: `5px solid ${color.negro}`,
                boxSizing: "border-box",
                transform: `scale(${p})`,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 60 + xs[i] - 135,
                width: 270,
                top: 310,
                textAlign: "center",
                fontFamily: font.texto,
                fontWeight: 600,
                fontSize: 34,
                lineHeight: 1.18,
                color: naranja ? color.naranja : color.negro,
                opacity: on,
                transform: `translateY(${interpolate(on, [0, 1], [24, 0])}px)`,
              }}
            >
              {h.texto}
            </div>
          </React.Fragment>
        );
      })}
      {nota
        ? (() => {
            const pn = spring({ frame: frame - Math.round(nota.en * fps), fps, config: theme.spring.golpe });
            return (
              <div style={{ position: "absolute", left: 0, right: 0, top: 470, textAlign: "center", opacity: Math.min(1, pn * 2), transform: `scale(${interpolate(pn, [0, 1], [1.4, 1])})` }}>
                <Pildora tono="negro" style={{ fontSize: 34 }}>{nota.texto}</Pildora>
              </div>
            );
          })()
        : null}
    </Tarjeta>
  );
};

// ───────────────────────── Fábrica dividida ─────────────────────────
const MitadFabrica: React.FC<{ fill: string; ventanas: string; flip?: boolean }> = ({ fill, ventanas, flip }) => (
  <svg width={400} height={290} viewBox="0 0 400 290" style={{ transform: flip ? "scaleX(-1)" : undefined }}>
    {/* chimenea */}
    <rect x={40} y={20} width={44} height={120} fill={fill} stroke={color.negro} strokeWidth={6} />
    {/* techo de dientes de sierra */}
    <path d="M10 280 L10 120 L110 70 L110 120 L210 70 L210 120 L310 70 L310 120 L390 120 L390 280 Z" fill={fill} stroke={color.negro} strokeWidth={6} strokeLinejoin="round" />
    {/* ventanas */}
    {[0, 1, 2].map((i) => (
      <rect key={i} x={50 + i * 110} y={170} width={70} height={56} rx={8} fill={ventanas} stroke={color.negro} strokeWidth={5} />
    ))}
    <rect x={160} y={236} width={60} height={44} fill={color.blanco} stroke={color.negro} strokeWidth={5} />
  </svg>
);

const mezcla = (a: string, b: string, t: number) => {
  const h = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const [x, y] = [h(a), h(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(",")})`;
};

export const Fabrica: React.FC<{ izq: string; der: string; apaga: number; enciende: number }> = ({ izq, der, apaga, enciende }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = interpolate(frame, [apaga * fps, apaga * fps + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const e = spring({ frame: frame - Math.round(enciende * fps), fps, config: theme.spring.golpe });
  const eOn = Math.min(1, Math.max(0, e));
  const pulso = 1 + 0.06 * Math.sin(Math.min(1, e) * Math.PI);
  return (
    <Tarjeta style={{ width: 960, height: 600, padding: "40px 28px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 0, position: "relative" }}>
        <div style={{ opacity: 1 - 0.35 * a }}>
          <MitadFabrica fill={mezcla(color.blanco, color.gris, a)} ventanas={mezcla(color.blanco, color.negro, a)} />
        </div>
        <div style={{ width: 8, height: 300, background: color.negro, margin: "0 18px", borderRadius: 4 }} />
        <div style={{ transform: `scale(${pulso})`, transformOrigin: "50% 100%" }}>
          <MitadFabrica fill={mezcla(color.blanco, color.naranja, eOn)} ventanas={mezcla("#FFFFFF", "#FFFFFF", eOn)} flip />
        </div>
      </div>
      <div style={{ display: "flex", width: "100%", justifyContent: "space-around", marginTop: 30 }}>
        <Pildora tono="negro" style={{ background: mezcla(color.negro, color.gris, a), opacity: 1 - 0.3 * a, fontSize: 36 }}>{izq}</Pildora>
        <Pildora tono={eOn > 0.5 ? "naranja" : "negro"} style={{ fontSize: 36, transform: `scale(${pulso})` }}>{der}</Pildora>
      </div>
    </Tarjeta>
  );
};

// ───────────────────────── Texto grande ─────────────────────────
export const TextoGrande: React.FC<{ lineas: string[]; resalta?: string[]; size?: number; pildora?: string }> = ({ lineas, resalta = [], size = 100, pildora }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const g = spring({ frame: frame - 3, fps, config: theme.spring.golpe });
  const respira = 1 + 0.008 * Math.sin(frame / 8);
  return (
    <div style={{ textAlign: "center", width: 960 }}>
      {pildora ? <Pildora style={{ marginBottom: 26 }}>{pildora}</Pildora> : null}
      {lineas.map((l, i) => (
        <div
          key={i}
          style={{
            fontFamily: font.titulo,
            fontWeight: 700,
            fontSize: size,
            lineHeight: 1.08,
            color: color.negro,
            transform: `scale(${interpolate(g, [0, 1], [1.4, 1]) * respira})`,
            opacity: Math.min(1, g * 2),
          }}
        >
          {l.split(" ").map((w, j) => (
            <span key={j} style={{ color: resalta.some((r) => w.replace(/[¿?¡!.,]/g, "") === r) ? color.naranja : color.negro }}>
              {w}
              {j < l.split(" ").length - 1 ? " " : ""}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};
