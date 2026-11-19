// Animaciones genéricas MNC (sin marcas): colores planos, líneas negras con acentos naranja,
// tarjetas blancas con borde negro. Cada una vive dentro de un <Sequence> (frame 0 = inicio del clip).
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { Check, ConIA, Pildora, Tarjeta } from "./Base";

const { color, font } = theme;
const N = color.negro;
const O = color.naranja;
const B = color.blanco;
const G = color.gris;

const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, fps, t: frame / fps };
};

// Resorte que arranca en el segundo `en` (relativo al clip)
const useResorte = (en: number, preset: keyof typeof theme.spring = "suave") => {
  const { frame, fps } = useT();
  return spring({ frame: frame - Math.round(en * fps), fps, config: theme.spring[preset] });
};

const Golpe: React.FC<{ p: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ p, children, style }) => (
  <div style={{ opacity: Math.min(1, p * 1.6), transform: `scale(${interpolate(p, [0, 1], [1.5, 1])})`, ...style }}>{children}</div>
);

const Titulo: React.FC<{ children: React.ReactNode; size?: number; style?: React.CSSProperties }> = ({ children, size = 54, style }) => (
  <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: size, lineHeight: 1.12, color: N, textAlign: "center", ...style }}>{children}</div>
);

// ───────────────────────────── Tormenta ─────────────────────────────
export const Tormenta: React.FC<{ etiqueta?: string; etiquetaEn?: number }> = ({ etiqueta, etiquetaEn = 0.6 }) => {
  const { frame, t } = useT();
  const pe = useResorte(etiquetaEn, "golpe");
  // relámpago: destellos en 0.35 s y 1.4 s
  const flash = [0.35, 1.4, 2.6].reduce((m, x) => Math.max(m, interpolate(t, [x, x + 0.05, x + 0.25], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })), 0);
  const balanceo = Math.sin(frame / 14) * 8;
  const gotas = Array.from({ length: 16 }, (_, i) => i);
  return (
    <div style={{ position: "relative", width: 900, height: 600, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <svg width="760" height="480" viewBox="0 0 760 480" style={{ overflow: "visible" }}>
        {/* lluvia */}
        {gotas.map((i) => {
          const x = 170 + (i % 8) * 60 + (i > 7 ? 30 : 0);
          const ciclo = ((frame * 9 + i * 37) % 200) / 200;
          const y = 300 + ciclo * 170;
          return <line key={i} x1={x} y1={y} x2={x - 14} y2={y + 34} stroke={N} strokeWidth={7} strokeLinecap="round" opacity={1 - ciclo * 0.6} />;
        })}
        {/* rayo */}
        <path d="M400 250 L350 360 L395 360 L360 460 L470 320 L420 320 L455 250 Z" fill={O} stroke={N} strokeWidth={6} strokeLinejoin="round" opacity={0.35 + 0.65 * Math.max(flash, 0.55)} transform={`scale(${1 + flash * 0.08})`} style={{ transformOrigin: "400px 350px" }} />
        {/* nube */}
        <g transform={`translate(${balanceo} 0)`}>
          <path
            d="M190 290 C120 290 100 210 160 185 C150 110 250 80 300 130 C330 50 470 50 500 140 C560 100 650 150 620 220 C680 235 670 300 600 300 Z"
            fill={flash > 0.3 ? color.verde : B}
            stroke={N}
            strokeWidth={9}
            strokeLinejoin="round"
          />
          <path d="M250 235 C290 255 340 255 370 232" fill="none" stroke={N} strokeWidth={6} strokeLinecap="round" opacity={0.5} />
        </g>
      </svg>
      {etiqueta ? (
        <Golpe p={pe} style={{ position: "absolute", bottom: 0 }}>
          <Pildora tono="negro" style={{ fontSize: 44, padding: "14px 38px" }}>{etiqueta}</Pildora>
        </Golpe>
      ) : null}
    </div>
  );
};

// ───────────────────────────── Íconos ─────────────────────────────
const Icono: React.FC<{ tipo: "agua" | "linterna" | "pilas" }> = ({ tipo }) => {
  const { frame } = useT();
  if (tipo === "agua")
    return (
      <svg width="170" height="230" viewBox="0 0 170 230">
        <rect x="62" y="8" width="46" height="26" rx="6" fill={O} stroke={N} strokeWidth="6" />
        <path d="M58 34 H112 L130 70 V210 Q130 222 118 222 H52 Q40 222 40 210 V70 Z" fill={B} stroke={N} strokeWidth="7" strokeLinejoin="round" />
        <path d={`M44 ${130 + Math.sin(frame / 6) * 4} Q85 ${118 - Math.sin(frame / 6) * 4} 126 ${130 + Math.sin(frame / 6) * 4} V208 Q126 218 116 218 H54 Q44 218 44 208 Z`} fill={color.verde} />
        <path d="M70 160 Q85 140 100 160 Q100 178 85 178 Q70 178 70 160 Z" fill={O} stroke={N} strokeWidth="5" />
      </svg>
    );
  if (tipo === "linterna") {
    const haz = 0.55 + 0.45 * Math.abs(Math.sin(frame / 9));
    return (
      <svg width="230" height="230" viewBox="0 0 230 230">
        <path d="M150 70 L225 30 V200 L150 160 Z" fill={O} opacity={0.35 * haz} />
        <rect x="20" y="88" width="90" height="54" rx="10" fill={B} stroke={N} strokeWidth="7" />
        <path d="M108 80 L150 66 V164 L108 150 Z" fill={B} stroke={N} strokeWidth="7" strokeLinejoin="round" />
        <rect x="48" y="104" width="30" height="22" rx="5" fill={O} stroke={N} strokeWidth="5" />
      </svg>
    );
  }
  return (
    <svg width="200" height="230" viewBox="0 0 200 230">
      {[0, 1].map((i) => (
        <g key={i} transform={`translate(${30 + i * 76} 20)`}>
          <rect x="18" y="0" width="24" height="16" rx="4" fill={N} />
          <rect x="0" y="14" width="60" height="180" rx="12" fill={B} stroke={N} strokeWidth="7" />
          <rect x="4" y="18" width="52" height="60" rx="8" fill={O} />
          <path d="M22 110 h16 M30 102 v16" stroke={N} strokeWidth="6" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
};

export const Iconos: React.FC<{ titulo?: string; items: { icono: "agua" | "linterna" | "pilas"; texto: string; en: number }[] }> = ({ titulo, items }) => {
  const { frame, fps } = useT();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
      {titulo ? <Titulo size={60}>{titulo}</Titulo> : null}
      <div style={{ display: "flex", gap: 30 }}>
        {items.map((it, i) => {
          const p = spring({ frame: frame - Math.round(it.en * fps), fps, config: theme.spring.golpe });
          return (
            <Tarjeta key={i} style={{ width: 290, height: 380, padding: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", opacity: Math.min(1, p * 1.5), transform: `translateY(${interpolate(p, [0, 1], [60, 0])}px) scale(${interpolate(p, [0, 1], [0.7, 1])})` }}>
              <div style={{ height: 250, display: "flex", alignItems: "center" }}>
                <Icono tipo={it.icono} />
              </div>
              <Pildora tono="negro" style={{ fontSize: 34 }}>{it.texto}</Pildora>
            </Tarjeta>
          );
        })}
      </div>
    </div>
  );
};

// ───────────────────────────── Anaquel ─────────────────────────────
const CAJAS = 3 * 6;
export const Anaquel: React.FC<{ modo: "vaciar" | "llenar"; titulo?: string; pregunta?: boolean; etiqueta?: string; dur: number }> = ({ modo, titulo, pregunta, etiqueta, dur }) => {
  const { frame, fps, t } = useT();
  const fin = dur * 0.55; // la animación de cajas ocupa el 55% del clip
  const pq = spring({ frame: frame - Math.round((fin + 0.05) * fps), fps, config: theme.spring.golpe });
  const pe = spring({ frame: frame - Math.round((fin + 0.1) * fps), fps, config: theme.spring.golpe });
  const W = 820;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
      {titulo ? <Titulo size={54}>{titulo}</Titulo> : null}
      <div style={{ position: "relative" }}>
        <svg width={W} height={470} viewBox={`0 0 ${W} 470`}>
          <rect x="6" y="6" width={W - 12} height="458" rx="22" fill={B} stroke={N} strokeWidth="7" />
          {[0, 1, 2].map((r) => (
            <line key={r} x1="6" x2={W - 6} y1={150 + r * 150} y2={150 + r * 150} stroke={N} strokeWidth="9" />
          ))}
          {Array.from({ length: CAJAS }, (_, i) => {
            const r = Math.floor(i / 6);
            const c = i % 6;
            // orden: vaciar de arriba-izq a abajo-der; llenar de abajo a arriba
            const orden = modo === "vaciar" ? i : CAJAS - 1 - i;
            const ti = 0.15 + (orden / CAJAS) * fin;
            const k = interpolate(t, [ti, ti + 0.18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.out });
            const vis = modo === "vaciar" ? 1 - k : k;
            const x = 34 + c * 128;
            const y = 40 + r * 150;
            const dy = modo === "vaciar" ? -k * 30 : (1 - k) * -40;
            return (
              <g key={i} opacity={vis} transform={`translate(0 ${dy})`}>
                <rect x={x} y={y} width="104" height="104" rx="12" fill={(r + c) % 3 === 0 ? O : B} stroke={N} strokeWidth="6" />
                <line x1={x + 22} x2={x + 82} y1={y + 52} y2={y + 52} stroke={N} strokeWidth="6" strokeLinecap="round" opacity={0.6} />
              </g>
            );
          })}
        </svg>
        {pregunta ? (
          <Golpe p={pq} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 230, height: 230, borderRadius: 999, background: O, border: `7px solid ${N}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.titulo, fontWeight: 700, fontSize: 190, color: B, lineHeight: 1, paddingBottom: 12, boxSizing: "border-box" }}>?</div>
          </Golpe>
        ) : null}
        {etiqueta ? (
          <Golpe p={pe} style={{ position: "absolute", left: 0, right: 0, bottom: -26, display: "flex", justifyContent: "center", gap: 16, alignItems: "center" }}>
            <Check size={70} p={pe} />
            <Pildora tono="negro" style={{ fontSize: 40 }}>{etiqueta}</Pildora>
          </Golpe>
        ) : null}
      </div>
    </div>
  );
};

// ───────────────────────────── Barras x7 ─────────────────────────────
export const Barras: React.FC<{ titulo?: string; subeEn: number; valor: string; etiqueta?: string }> = ({ titulo, subeEn, valor, etiqueta }) => {
  const { frame, fps, t } = useT();
  const base = [1, 1.15, 0.9, 1.05, 1, 0.95];
  const H1 = 52; // altura de "1×"
  const sube = interpolate(t, [subeEn - 0.6, subeEn], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.out });
  const pv = spring({ frame: frame - Math.round(subeEn * fps), fps, config: theme.spring.golpe });
  return (
    <Tarjeta style={{ width: 920, padding: "34px 44px" }}>
      {titulo ? <Titulo size={46} style={{ marginBottom: 10 }}>{titulo}</Titulo> : null}
      <svg width="830" height="440" viewBox="0 0 830 440">
        <line x1="20" x2="810" y1="400" y2="400" stroke={N} strokeWidth="6" strokeLinecap="round" />
        {base.map((v, i) => {
          const entra = interpolate(t, [0.1 + i * 0.07, 0.45 + i * 0.07], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.out });
          const x = 40 + i * 112;
          const h = v * H1 * entra;
          return <rect key={i} x={x} y={400 - h} width="80" height={h} rx="8" fill={color.verde} stroke={N} strokeWidth="5" />;
        })}
        {(() => {
          const x = 40 + 6 * 112 + 18;
          const h = H1 * (1 + 6 * sube) * Math.min(1, t / 0.4);
          return (
            <g>
              <rect x={x} y={400 - h} width="96" height={h} rx="10" fill={O} stroke={N} strokeWidth="6" />
              <g opacity={Math.min(1, pv * 1.5)} transform={`translate(${x - 24} ${400 - h + 100}) scale(${interpolate(pv, [0, 1], [1.6, 1])})`}>
                <text x="0" y="0" textAnchor="end" fontFamily="Readex Pro" fontWeight={700} fontSize="120" fill={O} stroke={N} strokeWidth="0">{valor}</text>
              </g>
            </g>
          );
        })()}
      </svg>
      {etiqueta ? (
        <div style={{ fontFamily: font.texto, fontWeight: 600, fontSize: 36, color: N, textAlign: "center" }}>
          <ConIA texto={etiqueta} />
        </div>
      ) : null}
    </Tarjeta>
  );
};

// ───────────────────────────── Camión → tienda ─────────────────────────────
export const Camion: React.FC<{ carga?: string; tienda?: string; dur: number }> = ({ carga = "Pop-Tarts", tienda = "TIENDA", dur }) => {
  const { frame, fps, t } = useT();
  const llega = Math.min(dur * 0.6, 1.6);
  const x = interpolate(t, [0, llega], [-520, 70], { extrapolateRight: "clamp", easing: theme.ease.out });
  const rueda = (frame * 14) % 360 * (t < llega ? 1 : 0);
  const pc = spring({ frame: frame - Math.round((llega + 0.1) * fps), fps, config: theme.spring.golpe });
  const lineas = (frame * 22) % 120;
  return (
    <div style={{ position: "relative", width: 960, height: 600 }}>
      <svg width="960" height="600" viewBox="0 0 960 600">
        {/* tienda genérica */}
        <g transform="translate(600 120)">
          <rect x="0" y="80" width="330" height="310" fill={B} stroke={N} strokeWidth="7" />
          <rect x="-10" y="40" width="350" height="56" rx="8" fill={N} />
          <text x="165" y="80" textAnchor="middle" fontFamily="Readex Pro" fontWeight={700} fontSize="38" fill={B}>{tienda}</text>
          {Array.from({ length: 7 }, (_, i) => (
            <path key={i} d={`M${i * 47.1} 96 h47.1 v34 q-23.5 18 -47.1 0 Z`} fill={i % 2 ? B : O} stroke={N} strokeWidth="5" />
          ))}
          <rect x="120" y="250" width="90" height="140" fill={color.verde} stroke={N} strokeWidth="6" />
          <rect x="30" y="180" width="70" height="70" fill={color.verde} stroke={N} strokeWidth="6" />
          <rect x="230" y="180" width="70" height="70" fill={color.verde} stroke={N} strokeWidth="6" />
        </g>
        {/* camino */}
        <line x1="0" x2="960" y1="520" y2="520" stroke={N} strokeWidth="7" />
        {Array.from({ length: 10 }, (_, i) => (
          <line key={i} x1={i * 120 - lineas * (t < llega ? 1 : 0)} x2={i * 120 + 60 - lineas * (t < llega ? 1 : 0)} y1="560" y2="560" stroke={G} strokeWidth="7" strokeLinecap="round" />
        ))}
        {/* camión genérico */}
        <g transform={`translate(${x} 0)`}>
          <rect x="0" y="300" width="360" height="190" rx="12" fill={B} stroke={N} strokeWidth="7" />
          <text x="180" y="410" textAnchor="middle" fontFamily="Readex Pro" fontWeight={700} fontSize="46" fill={O}>{carga}</text>
          <path d="M360 360 H440 L490 420 V490 H360 Z" fill={N} stroke={N} strokeWidth="7" strokeLinejoin="round" />
          <path d="M378 376 H432 L466 418 H378 Z" fill={color.verde} />
          {[70, 280, 440].map((cx) => (
            <g key={cx} transform={`translate(${cx} 495) rotate(${rueda})`}>
              <circle r="36" fill={N} />
              <circle r="14" fill={B} />
              <line x1="-14" x2="14" y1="0" y2="0" stroke={N} strokeWidth="5" />
            </g>
          ))}
        </g>
      </svg>
      <Golpe p={pc} style={{ position: "absolute", top: 24, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 16 }}>
        <Check size={72} p={pc} />
        <Pildora tono="negro" style={{ fontSize: 42 }}>Antes de la tormenta</Pildora>
      </Golpe>
    </div>
  );
};

// ───────────────────────────── Tachado ─────────────────────────────
export const Tachado: React.FC<{ antes: string; despues: string; tachaEn: number; despuesEn: number; extra?: string; extraEn?: number }> = ({ antes, despues, tachaEn, despuesEn, extra, extraEn = 99 }) => {
  const { t } = useT();
  const tacha = interpolate(t, [tachaEn, tachaEn + 0.35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.out });
  const pd = useResorte(despuesEn, "golpe");
  const px = useResorte(extraEn, "golpe");
  const sube = interpolate(pd, [0, 1], [0, -40]);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
      <div style={{ position: "relative", transform: `translateY(${sube}px)`, opacity: interpolate(pd, [0, 1], [1, 0.55]) }}>
        <Tarjeta style={{ padding: "26px 56px" }}>
          <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 110, color: tacha > 0.5 ? G : N, lineHeight: 1.05 }}>{antes}</div>
        </Tarjeta>
        <div style={{ position: "absolute", left: -20, top: "50%", height: 16, width: `calc(${tacha * 100}% + 40px)`, background: O, border: `3px solid ${N}`, borderRadius: 999, transform: "rotate(-6deg)", transformOrigin: "left center" }} />
      </div>
      <Golpe p={pd}>
        <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 104, color: O, lineHeight: 1.05, textAlign: "center" }}>{despues}</div>
      </Golpe>
      {extra ? (
        <Golpe p={px}>
          <Pildora tono="negro" style={{ fontSize: 42 }}>{extra}</Pildora>
        </Golpe>
      ) : null}
    </div>
  );
};

// ───────────────────────────── Exporta → IA ─────────────────────────────
export const Exporta: React.FC<{ hoja: string; iaEn: number }> = ({ hoja, iaEn }) => {
  const { frame, fps, t } = useT();
  const pia = spring({ frame: frame - Math.round(iaEn * fps), fps, config: theme.spring.golpe });
  const flecha = interpolate(t, [iaEn - 0.5, iaEn], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
      <Tarjeta style={{ width: 560, padding: "26px 28px" }}>
        <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 40, color: N, marginBottom: 16 }}>{hoja}</div>
        {Array.from({ length: 7 }, (_, r) => {
          const pr = interpolate(t, [0.1 + r * 0.12, 0.35 + r * 0.12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={r} style={{ display: "flex", gap: 10, marginBottom: 10, opacity: pr, transform: `translateX(${(1 - pr) * 30}px)` }}>
              {[150, 120, 200].map((w, c) => (
                <div key={c} style={{ width: w, height: 34, borderRadius: 8, border: `3px solid ${N}`, background: r === 0 ? N : c === 2 && r % 3 === 1 ? O : color.verde }} />
              ))}
            </div>
          );
        })}
      </Tarjeta>
      <svg width="120" height="80" viewBox="0 0 120 80">
        <line x1="6" y1="40" x2={6 + 90 * flecha} y2="40" stroke={N} strokeWidth="10" strokeLinecap="round" />
        {flecha > 0.9 ? <path d="M78 14 L110 40 L78 66" fill="none" stroke={N} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" /> : null}
      </svg>
      <Golpe p={pia}>
        <div style={{ width: 220, height: 220, borderRadius: 999, background: O, border: `7px solid ${N}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.titulo, fontWeight: 700, fontSize: 110, color: B }}>IA</div>
      </Golpe>
    </div>
  );
};

// ───────────────────────────── Calendario ─────────────────────────────
export const Calendario: React.FC<{ titulo?: string; tituloEn?: number; etiquetas: { texto: string; en: number }[] }> = ({ titulo, tituloEn = 0, etiquetas }) => {
  const { frame, fps } = useT();
  const pt = useResorte(tituloEn);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
      {titulo ? (
        <Titulo size={54} style={{ opacity: pt, transform: `translateY(${(1 - pt) * 30}px)` }}>{titulo}</Titulo>
      ) : null}
      <div style={{ display: "flex", gap: 26 }}>
        {etiquetas.map((e, i) => {
          const p = spring({ frame: frame - Math.round(e.en * fps), fps, config: theme.spring.golpe });
          const activo = p > 0.5;
          return (
            <div key={i} style={{ width: 290, transform: `scale(${interpolate(p, [0, 1], [0.92, 1])})` }}>
              <div style={{ border: theme.card.border, borderRadius: 24, overflow: "hidden", background: B }}>
                <div style={{ height: 64, background: activo ? O : N, display: "flex", justifyContent: "center", alignItems: "center", gap: 70 }}>
                  <div style={{ width: 16, height: 16, borderRadius: 999, background: B }} />
                  <div style={{ width: 16, height: 16, borderRadius: 999, background: B }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, padding: 20 }}>
                  {Array.from({ length: 15 }, (_, k) => (
                    <div key={k} style={{ height: 30, borderRadius: 6, border: `3px solid ${N}`, background: activo && k === 7 + i ? O : color.verde }} />
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "center", marginTop: 18, opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 30}px)` }}>
                <Pildora tono={activo ? "naranja" : "negro"} style={{ fontSize: 33, padding: "12px 22px", whiteSpace: "nowrap" }}>{e.texto}</Pildora>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ───────────────────────────── Comentario ─────────────────────────────
export const Comentario: React.FC<{ texto: string }> = ({ texto }) => {
  const { t } = useT();
  const n = Math.round(interpolate(t, [0.15, 0.8], [0, texto.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
      <Pildora tono="negro" style={{ fontSize: 40 }}>Comentarios</Pildora>
      <Tarjeta style={{ width: 900, display: "flex", gap: 28, alignItems: "center" }}>
        <div style={{ width: 110, height: 110, borderRadius: 999, background: O, border: `5px solid ${N}`, flexShrink: 0 }} />
        <div style={{ fontFamily: font.texto, fontWeight: 600, fontSize: 50, color: N, lineHeight: 1.2 }}>
          {texto.slice(0, n)}
          <span style={{ opacity: Math.floor(t * 3) % 2 ? 1 : 0, color: O }}>|</span>
        </div>
      </Tarjeta>
    </div>
  );
};
