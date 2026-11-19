// Animaciones de datos genéricas (sin marcas): cronómetro, barra de proporción, filas que se
// reacomodan, premio, texto tachado, tabla de ventas → ofertas. Colores planos MNC.
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import type { BRoll } from "../reel/types";
import { Check, Pildora, Tarjeta } from "./Base";

const { color, font } = theme;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const useResorte = (delaySec: number, preset: keyof typeof theme.spring = "suave") => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - Math.round(delaySec * fps), fps, config: theme.spring[preset] });
};

const Titulo: React.FC<{ children: React.ReactNode; size?: number; style?: React.CSSProperties }> = ({ children, size = 60, style }) => (
  <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: size, lineHeight: 1.1, color: color.negro, ...style }}>{children}</div>
);

// Sello rotado que entra con golpe de zoom (sobre una tarjeta con position: relative)
export const Sello: React.FC<{ texto: string; delay?: number }> = ({ texto, delay = 18 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const g = spring({ frame: frame - delay, fps, config: theme.spring.golpe });
  return (
    <div
      style={{
        position: "absolute",
        right: -24,
        bottom: -48,
        border: `6px solid ${color.naranja}`,
        background: color.blanco,
        color: color.naranja,
        fontFamily: font.titulo,
        fontWeight: 700,
        fontSize: 46,
        padding: "12px 28px",
        borderRadius: 16,
        textTransform: "uppercase",
        opacity: Math.min(1, g * 1.4),
        transform: `rotate(-8deg) scale(${interpolate(g, [0, 1], [2.2, 1])})`,
      }}
    >
      {texto}
    </div>
  );
};

// ── Cronómetro: la aguja corre y marca la zona 60–90 s ──────────────────────────────
const Cronometro: React.FC<{ desde: number; hasta: number; etiqueta?: string; dur: number }> = ({ desde, hasta, etiqueta }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seg = interpolate(frame, [6, 6 + fps * 1.8], [0, hasta], { ...clamp, easing: theme.ease.inOut });
  const R = 150;
  const C = 2 * Math.PI * R;
  const zonaA = desde / 120;
  const zonaB = hasta / 120;
  const enZona = seg >= desde;
  const g = useResorte(0.2 + 1.8, "golpe");
  const e = useResorte(2.3);
  const mm = Math.floor(seg / 60);
  const ss = Math.floor(seg % 60).toString().padStart(2, "0");
  const ang = (seg / 120) * 360;
  return (
    <Tarjeta style={{ width: 920, display: "flex", alignItems: "center", gap: 40, padding: "40px 44px" }}>
      <svg width={360} height={390} viewBox="-180 -210 360 390" style={{ flexShrink: 0 }}>
        <rect x={-26} y={-205} width={52} height={30} rx={8} fill={color.negro} />
        <rect x={-8} y={-180} width={16} height={22} fill={color.negro} />
        <circle r={R + 14} fill={color.blanco} stroke={color.negro} strokeWidth={8} />
        <circle r={R} fill="none" stroke={color.verde} strokeWidth={26} />
        {/* zona 60–90 s */}
        <circle
          r={R}
          fill="none"
          stroke={color.naranja}
          strokeWidth={26}
          strokeDasharray={`${C * (zonaB - zonaA)} ${C}`}
          strokeDashoffset={-C * zonaA}
          transform="rotate(-90)"
          opacity={enZona ? 1 : 0.35}
        />
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1={0} y1={-R + 22} x2={0} y2={-R + 40} stroke={color.negro} strokeWidth={5} strokeLinecap="round" transform={`rotate(${i * 30})`} />
        ))}
        <line x1={0} y1={18} x2={0} y2={-R + 30} stroke={enZona ? color.naranja : color.negro} strokeWidth={10} strokeLinecap="round" transform={`rotate(${ang})`} />
        <circle r={14} fill={color.negro} />
        <text y={78} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={44} fill={color.negro}>
          {mm}:{ss}
        </text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Titulo size={100} style={{ whiteSpace: "nowrap", color: color.naranja, transform: `scale(${interpolate(g, [0, 1], [0.6, 1])})`, opacity: Math.min(1, g * 1.5), transformOrigin: "left center" }}>
          {desde}–{hasta} s
        </Titulo>
        {etiqueta ? (
          <div style={{ fontFamily: font.texto, fontWeight: 600, fontSize: 40, color: color.negro, opacity: e, lineHeight: 1.2 }}>{etiqueta}</div>
        ) : null}
      </div>
    </Tarjeta>
  );
};

// ── Barra: 10 tarjetas, 8 se encienden; luego barra 80/20 ───────────────────────────
const Play: React.FC<{ on: number }> = ({ on }) => (
  <div
    style={{
      width: 112,
      height: 150,
      borderRadius: 16,
      border: `3px solid ${color.negro}`,
      background: on > 0.5 ? color.naranja : color.verde,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transform: `scale(${1 + 0.12 * Math.sin(Math.min(1, on) * Math.PI)})`,
    }}
  >
    <svg width={44} height={44} viewBox="0 0 44 44">
      <path d="M14 9 L35 22 L14 35 Z" fill={on > 0.5 ? color.blanco : color.gris} />
    </svg>
  </div>
);

const Barra: React.FC<{ titulo: string; a: number; etiquetaA: string; etiquetaB: string }> = ({ titulo, a, etiquetaA, etiquetaB }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = Math.round(a / 10);
  const fill = interpolate(frame, [fps * 1.9, fps * 2.8], [0, a], { ...clamp, easing: theme.ease.out });
  const lab = useResorte(2.6);
  return (
    <Tarjeta style={{ width: 940, padding: "40px 44px" }}>
      <Titulo size={60} style={{ marginBottom: 26 }}>
        <span style={{ color: color.naranja }}>8 de cada 10</span> elecciones
      </Titulo>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 112px)", gap: 18, justifyContent: "center", marginBottom: 30 }}>
        {Array.from({ length: 10 }).map((_, i) => {
          const on = i < n ? spring({ frame: frame - Math.round((0.3 + i * 0.16) * fps), fps, config: theme.spring.golpe }) : 0;
          return <Play key={i} on={on} />;
        })}
      </div>
      <div style={{ display: "flex", height: 64, borderRadius: 999, border: `3px solid ${color.negro}`, overflow: "hidden", background: color.blanco }}>
        <div style={{ width: `${fill}%`, background: color.naranja }} />
        <div style={{ flex: 1, background: fill >= a - 0.5 ? color.negro : color.blanco }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, opacity: lab, fontFamily: font.texto, fontWeight: 600, fontSize: 36 }}>
        <span style={{ color: color.naranja }}>
          {Math.round(fill)}% {etiquetaA}
        </span>
        <span style={{ color: color.negro }}>
          {100 - a}% {etiquetaB}
        </span>
      </div>
      <span style={{ display: "none" }}>{titulo}</span>
    </Tarjeta>
  );
};

// ── Filas: entran los datos y las filas de la pantalla se reacomodan ────────────────
const Filas: React.FC<{ datos: string[] }> = ({ datos }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const orden = [
    [2, 0, 1],
    [0, 1, 2],
  ];
  const mezcla = interpolate(frame, [fps * 1.1, fps * 1.7], [0, 1], { ...clamp, easing: theme.ease.inOut });
  const ROW = 104;
  return (
    <Tarjeta style={{ width: 940, padding: "36px 40px" }}>
      <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 28, flexWrap: "wrap" }}>
        {datos.map((d, i) => {
          const p = spring({ frame: frame - Math.round((0.15 + i * 0.4) * fps), fps, config: theme.spring.golpe });
          return (
            <Pildora key={i} tono={i % 2 ? "negro" : "naranja"} style={{ fontSize: 38, opacity: Math.min(1, p * 1.4), transform: `translateY(${interpolate(p, [0, 1], [-40, 0])}px) scale(${p})` }}>
              {d}
            </Pildora>
          );
        })}
      </div>
      <div style={{ position: "relative", height: ROW * 3 }}>
        {[0, 1, 2].map((fila) => {
          const y = interpolate(mezcla, [0, 1], [orden[0][fila], orden[1][fila]]) * ROW;
          const destacada = fila === 2;
          return (
            <div key={fila} style={{ position: "absolute", top: y, left: 0, right: 0, display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 130, height: 16, borderRadius: 8, background: destacada && mezcla > 0.5 ? color.naranja : color.gris }} />
              {Array.from({ length: 5 }).map((_, k) => (
                <div
                  key={k}
                  style={{
                    width: 126,
                    height: 82,
                    borderRadius: 12,
                    border: `3px solid ${color.negro}`,
                    background: destacada && mezcla > 0.5 ? (k < 3 ? color.naranja : color.blanco) : color.verde,
                  }}
                />
              ))}
            </div>
          );
        })}
      </div>
    </Tarjeta>
  );
};

// ── Premio: trofeo + $1,000,000 + año + extra ───────────────────────────────────────
const Trofeo: React.FC<{ p: number }> = ({ p }) => (
  <svg width={210} height={230} viewBox="0 0 210 230" style={{ transform: `scale(${p}) rotate(${interpolate(p, [0, 1], [-14, 0])}deg)`, flexShrink: 0 }}>
    <path d="M55 20 H155 V80 C155 120 130 140 105 140 C80 140 55 120 55 80 Z" fill={color.naranja} stroke={color.negro} strokeWidth={7} strokeLinejoin="round" />
    <path d="M55 38 H22 C22 80 40 96 60 98 M155 38 H188 C188 80 170 96 150 98" fill="none" stroke={color.negro} strokeWidth={7} strokeLinecap="round" />
    <rect x={92} y={140} width={26} height={36} fill={color.negro} />
    <rect x={58} y={176} width={94} height={30} rx={6} fill={color.blanco} stroke={color.negro} strokeWidth={7} />
    <path d="M90 60 L100 50 V110" fill="none" stroke={color.blanco} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Premio: React.FC<{ monto: number; anio: string; extra?: string }> = ({ monto, anio, extra }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = useResorte(0.05, "golpe");
  const cuenta = interpolate(frame, [6, 6 + fps * 1.1], [0, monto], { ...clamp, easing: theme.ease.out });
  const a = useResorte(1.3, "golpe");
  const x = useResorte(3.3, "golpe");
  return (
    <Tarjeta style={{ width: 940, padding: "40px 44px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
        <Trofeo p={t} />
        <div>
          <Titulo size={104} style={{ color: color.naranja }}>
            ${Math.round(cuenta).toLocaleString("en-US")}
          </Titulo>
          <div style={{ marginTop: 14, transform: `scale(${a})`, transformOrigin: "left center" }}>
            <Pildora tono="negro" style={{ fontSize: 44 }}>
              Premio · {anio}
            </Pildora>
          </div>
        </div>
      </div>
      {extra ? (
        <div
          style={{
            marginTop: 30,
            display: "flex",
            alignItems: "center",
            gap: 18,
            opacity: Math.min(1, x * 1.4),
            transform: `translateY(${interpolate(x, [0, 1], [30, 0])}px)`,
            fontFamily: font.texto,
            fontWeight: 600,
            fontSize: 44,
            color: color.negro,
          }}
        >
          <Check p={x} size={60} />
          {extra}
        </div>
      ) : null}
    </Tarjeta>
  );
};

// ── Tachado: el texto se tacha con una línea naranja ────────────────────────────────
const Tachado: React.FC<{ texto: string; pildora?: string }> = ({ texto, pildora }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const linea = interpolate(frame, [fps * 0.7, fps * 1.15], [0, 1], { ...clamp, easing: theme.ease.out });
  return (
    <Tarjeta style={{ width: 920, padding: "56px 56px", textAlign: "center" }}>
      {pildora ? <Pildora tono="negro" style={{ marginBottom: 28, fontSize: 40 }}>{pildora}</Pildora> : null}
      <div style={{ position: "relative", display: "inline-block" }}>
        <Titulo size={70} style={{ whiteSpace: "nowrap", color: linea > 0.9 ? color.gris : color.negro }}>{texto}</Titulo>
        <div
          style={{
            position: "absolute",
            left: -16,
            top: "50%",
            height: 14,
            borderRadius: 7,
            width: `calc(${linea * 100}% + 32px)`,
            background: color.naranja,
            transform: "rotate(-4deg)",
          }}
        />
      </div>
    </Tarjeta>
  );
};

// ── Tabla de ventas (genérica) → ofertas por cliente ────────────────────────────────
const FILAS_VENTAS = [
  ["Cliente A", "Café 1 kg", "cada semana"],
  ["Cliente B", "Galletas", "hace 4 meses"],
  ["Cliente C", "Té verde", "cada mes"],
  ["Cliente D", "Azúcar", "cada 2 semanas"],
];

const Tabla: React.FC<{ fase: "tabla" | "ofertas"; nota?: string }> = ({ fase, nota }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (fase === "tabla") {
    return (
      <Tarjeta style={{ width: 940, padding: "34px 36px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <Titulo size={50}>Historial de ventas</Titulo>
          {nota ? <Pildora tono="negro" style={{ fontSize: 26, padding: "8px 20px" }}>{nota}</Pildora> : null}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.25fr", fontFamily: font.texto, fontSize: 31, whiteSpace: "nowrap" }}>
          {["Cliente", "Producto", "Compra"].map((h) => (
            <div key={h} style={{ fontWeight: 600, color: color.blanco, background: color.negro, padding: "12px 18px" }}>
              {h}
            </div>
          ))}
          {FILAS_VENTAS.map((r, i) => {
            const p = spring({ frame: frame - Math.round((0.3 + i * 0.3) * fps), fps, config: theme.spring.suave });
            const resalta = frame > fps * 1.7 && (i === 0 || i === 1);
            return r.map((c, k) => (
              <div
                key={`${i}${k}`}
                style={{
                  padding: "14px 18px",
                  borderBottom: `2px solid ${color.verde}`,
                  opacity: p,
                  transform: `translateX(${interpolate(p, [0, 1], [30, 0])}px)`,
                  background: resalta ? (i === 0 ? color.naranja : color.verde) : color.blanco,
                  color: resalta && i === 0 ? color.blanco : color.negro,
                  fontWeight: k === 0 ? 600 : 400,
                }}
              >
                {c}
              </div>
            ));
          })}
        </div>
      </Tarjeta>
    );
  }
  const items = [
    { c: "Cliente A", t: "ofrécele X", tono: color.naranja },
    { c: "Cliente B", t: "ya no te compra Y", tono: color.negro },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 34, width: 940 }}>
      {items.map((it, i) => {
        const p = spring({ frame: frame - Math.round((0.1 + i * 0.9) * fps), fps, config: theme.spring.golpe });
        return (
          <Tarjeta
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 26,
              padding: "40px 44px",
              opacity: Math.min(1, p * 1.3),
              transform: `translateX(${interpolate(p, [0, 1], [i ? 80 : -80, 0])}px)`,
            }}
          >
            <Pildora tono={i ? "negro" : "naranja"} style={{ fontSize: 36, whiteSpace: "nowrap" }}>{it.c}</Pildora>
            <svg width={70} height={40} viewBox="0 0 70 40">
              <path d="M4 20 H60 M44 6 L62 20 L44 34" fill="none" stroke={color.negro} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <Titulo size={50} style={{ color: it.tono, whiteSpace: "nowrap" }}>{it.t}</Titulo>
          </Tarjeta>
        );
      })}
      {nota ? (
        <div style={{ textAlign: "center" }}>
          <Pildora tono="negro" style={{ fontSize: 26, padding: "8px 20px" }}>{nota}</Pildora>
        </div>
      ) : null}
    </div>
  );
};


// ── Riesgo: tras 1:30 sin encontrar nada, el medidor sube a "alto" ──────────────────
const Riesgo: React.FC<{ titulo: string; etiqueta: string }> = ({ titulo, etiqueta }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const N = 10;
  const nivel = interpolate(frame, [fps * 0.6, fps * 2.0], [0, N], { ...clamp, easing: theme.ease.inOut });
  const alto = useResorte(2.05, "golpe");
  const t = useResorte(0.05);
  return (
    <Tarjeta style={{ width: 940, padding: "44px 48px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, opacity: t, marginBottom: 34 }}>
        <svg width={70} height={70} viewBox="0 0 70 70" style={{ flexShrink: 0 }}>
          <circle cx={35} cy={38} r={27} fill={color.blanco} stroke={color.negro} strokeWidth={6} />
          <rect x={29} y={2} width={12} height={8} rx={2} fill={color.negro} />
          <path d="M35 38 L35 22" stroke={color.naranja} strokeWidth={6} strokeLinecap="round" />
        </svg>
        <Titulo size={58}>{titulo}</Titulo>
      </div>
      <div style={{ fontFamily: font.texto, fontWeight: 600, fontSize: 40, color: color.negro, marginBottom: 18 }}>{etiqueta}</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 190 }}>
        {Array.from({ length: N }).map((_, i) => {
          const on = Math.min(1, Math.max(0, nivel - i));
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: 50 + i * 14,
                borderRadius: 10,
                border: `3px solid ${color.negro}`,
                background: on > 0.5 ? (i >= 6 ? color.naranja : color.negro) : color.verde,
                transform: `scaleY(${1 + 0.15 * Math.sin(on * Math.PI)})`,
                transformOrigin: "bottom",
              }}
            />
          );
        })}
        <div style={{ marginLeft: 16, alignSelf: "center", transform: `scale(${alto})` }}>
          <Pildora style={{ fontSize: 44, whiteSpace: "nowrap" }}>↑ Alto</Pildora>
        </div>
      </div>
    </Tarjeta>
  );
};

export const BRollExtra: React.FC<{ b: BRoll; dur: number }> = ({ b, dur }) => {
  switch (b.tipo) {
    case "cronometro":
      return <Cronometro desde={b.desde} hasta={b.hasta} etiqueta={b.etiqueta} dur={dur} />;
    case "barra":
      return <Barra titulo={b.titulo} a={b.a} etiquetaA={b.etiquetaA} etiquetaB={b.etiquetaB} />;
    case "filas":
      return <Filas datos={b.datos} />;
    case "premio":
      return <Premio monto={b.monto} anio={b.anio} extra={b.extra} />;
    case "tachado":
      return <Tachado texto={b.texto} pildora={b.pildora} />;
    case "riesgo":
      return <Riesgo titulo={b.titulo} etiqueta={b.etiqueta} />;
    case "tabla":
      return <Tabla fase={b.fase} nota={b.nota} />;
    default:
      return null;
  }
};
