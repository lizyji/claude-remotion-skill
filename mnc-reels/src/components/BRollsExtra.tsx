// B-rolls animados extra. Los tiempos "t" vienen ABSOLUTOS (segundos del reel) para
// sincronizar cada elemento con la palabra exacta de Manuel; aquí se pasan a cuadros
// relativos al inicio del clip (cada B-roll vive dentro de un <Sequence>).
import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import type { BRoll } from "../reel/types";
import { Check, Pildora, Tarjeta } from "./Base";

const { color, font } = theme;

const useRel = (start: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = (t: number, preset: keyof typeof theme.spring = "suave") =>
    spring({ frame: frame - Math.round((t - start) * fps), fps, config: theme.spring[preset] });
  const lin = (t: number, dur = 0.35) =>
    interpolate(frame, [Math.round((t - start) * fps), Math.round((t - start + dur) * fps)], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: theme.ease.out,
    });
  return { frame, fps, at, lin };
};

const T: React.FC<{ children: React.ReactNode; size?: number; c?: string; style?: React.CSSProperties }> = ({ children, size = 60, c = color.negro, style }) => (
  <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: size, lineHeight: 1.1, color: c, ...style }}>{children}</div>
);

// Línea de tachado naranja que se dibuja de izquierda a derecha
const Tacha: React.FC<{ p: number; grosor?: number }> = ({ p, grosor = 12 }) => (
  <div
    style={{
      position: "absolute",
      left: -14,
      top: "52%",
      height: grosor,
      width: `calc(${p * 100}% + ${28 * p}px)`,
      background: color.naranja,
      borderRadius: grosor,
      transform: "translateY(-50%) rotate(-4deg)",
      transformOrigin: "left center",
    }}
  />
);

// X naranja (dos trazos)
const Equis: React.FC<{ p: number; size?: number }> = ({ p, size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ flexShrink: 0, transform: `scale(${0.6 + 0.4 * p}) rotate(${(1 - p) * -25}deg)`, opacity: Math.min(1, p * 2) }}>
    <circle cx="50" cy="50" r="46" fill={color.naranja} stroke={color.negro} strokeWidth="4" />
    <path d="M32 32 L68 68 M68 32 L32 68" stroke={color.blanco} strokeWidth="11" strokeLinecap="round" />
  </svg>
);

const Logo: React.FC<{ src: string; h?: number; style?: React.CSSProperties }> = ({ src, h = 70, style }) => (
  <Img src={staticFile(src)} style={{ height: h, objectFit: "contain", ...style }} />
);

// ── B1 · logos en fila + etiqueta de precio que cae del primer lugar ──────────────
const Logos: React.FC<{ b: Extract<BRoll, { tipo: "logos" }> }> = ({ b }) => {
  const { at, lin } = useRel(b.start);
  const r = b.ranking;
  const pr = r ? at(r.t) : 0;
  const cae = r ? lin(r.cae, 0.55) : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34, width: 960 }}>
      {b.titulo ? <T size={50} style={{ textAlign: "center" }}>{b.titulo}</T> : null}
      <Tarjeta style={{ width: 960, padding: "34px 30px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px 20px", alignItems: "center", justifyItems: "center" }}>
        {b.logos.map((l, i) => {
          const p = at(l.t, "golpe");
          return (
            <div key={i} style={{ height: 120, display: "flex", alignItems: "center", opacity: Math.min(1, p * 1.6), transform: `scale(${interpolate(p, [0, 1], [0.5, 1])})` }}>
              <Logo src={l.src} h={l.src.includes("ford") ? 120 : 76} style={{ maxWidth: 380 }} />
            </div>
          );
        })}
      </Tarjeta>
      {r ? (
        <div style={{ position: "relative", height: 170, width: 960, opacity: pr }}>
          {/* podio del primer lugar */}
          <div style={{ position: "absolute", left: 250, top: 18, display: "flex", alignItems: "center", gap: 22 }}>
            <div style={{ width: 110, height: 110, borderRadius: 22, background: color.negro, color: color.blanco, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.titulo, fontWeight: 700, fontSize: 64 }}>1º</div>
            <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 64, color: color.gris, opacity: cae, transform: `scale(${0.7 + 0.3 * cae})` }}>?</div>
          </div>
          {/* etiqueta de precio */}
          <div
            style={{
              position: "absolute",
              left: 400,
              top: 18,
              transform: `translate(${cae * 150}px, ${cae * 140 + interpolate(pr, [0, 1], [-60, 0])}px) rotate(${cae * 18}deg)`,
              opacity: 1 - cae * 0.75,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14, background: color.naranja, border: theme.card.border, borderRadius: "18px 60px 60px 18px", padding: "16px 40px 16px 26px", color: color.blanco, fontFamily: font.titulo, fontWeight: 700, fontSize: 60 }}>
              <span style={{ width: 22, height: 22, borderRadius: 99, background: color.verde, border: `3px solid ${color.negro}` }} />
              {r.texto}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

// ── B3 · texto + sello "En revisión" ────────────────────────────────────────────────
const Sello: React.FC<{ b: Extract<BRoll, { tipo: "sello" }> }> = ({ b }) => {
  const { at } = useRel(b.start);
  const s = at(b.tSello, "golpe");
  return (
    <Tarjeta style={{ width: 940, padding: "60px 56px", position: "relative", textAlign: "center" }}>
      {b.pildora ? <Pildora tono="negro" style={{ marginBottom: 28 }}>{b.pildora}</Pildora> : null}
      <T size={96}>{b.titulo}</T>
      <div
        style={{
          display: "inline-block",
          marginTop: 40,
          padding: "14px 40px",
          border: `8px solid ${color.naranja}`,
          borderRadius: 18,
          color: color.naranja,
          fontFamily: font.titulo,
          fontWeight: 800,
          fontSize: 70,
          letterSpacing: 4,
          textTransform: "uppercase",
          opacity: Math.min(1, s * 1.5),
          transform: `rotate(-7deg) scale(${interpolate(s, [0, 1], [2.2, 1])})`,
        }}
      >
        {b.sello}
      </div>
    </Tarjeta>
  );
};

// ── B4/B9/B14 · algo tachado → la respuesta en naranja ──────────────────────────────
const Tachado: React.FC<{ b: Extract<BRoll, { tipo: "tachado" }> }> = ({ b }) => {
  const { at, lin } = useRel(b.start);
  const tacha = lin(b.tTacha, 0.3);
  const x = at(b.tTacha + 0.1, "golpe");
  const d = b.tDespues !== undefined ? at(b.tDespues, "golpe") : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30, width: 960 }}>
      <Tarjeta style={{ width: 940, padding: "48px 50px", display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
        {b.logo ? <Logo src={b.logo} h={60} /> : null}
        {b.pildora ? <Pildora tono="negro">{b.pildora}</Pildora> : null}
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ position: "relative", opacity: 1 - 0.45 * tacha }}>
            <T size={b.antes.length > 18 ? 66 : 92} style={{ textAlign: "center" }}>{b.antes}</T>
            <Tacha p={tacha} />
          </div>
          {b.antes.length <= 18 ? <Equis p={x} size={130} /> : null}
        </div>
      </Tarjeta>
      {b.despues ? (
        <div style={{ opacity: Math.min(1, d * 1.4), transform: `scale(${interpolate(d, [0, 1], [1.5, 1])})` }}>
          <div style={{ background: color.naranja, border: theme.card.border, borderRadius: 28, padding: "26px 52px" }}>
            <T size={86} c={color.blanco} style={{ textAlign: "center" }}>{b.despues}</T>
          </div>
        </div>
      ) : null}
    </div>
  );
};

// ── B5–B8 · checklist que se palomea al ritmo de la voz; un criterio sube al 1º ────
const FILA = 76;
const Checklist: React.FC<{ b: Extract<BRoll, { tipo: "checklist" }> }> = ({ b }) => {
  const { at, lin } = useRel(b.start);
  const n = b.items.length;
  const sube = b.subeA1 ? lin(b.subeA1.t, 0.6) : 0;
  const golpe = b.subeA1 ? at(b.subeA1.t + 0.5, "golpe") : 0;
  // orden final: el elegido primero, el resto en su orden
  const k = b.subeA1?.indice ?? -1;
  const pos = (i: number) => {
    if (k < 0) return i;
    const fin = i === k ? 0 : i < k ? i + 1 : i;
    return i + (fin - i) * sube;
  };
  return (
    <Tarjeta style={{ width: 940, padding: "34px 44px 30px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, marginBottom: 14 }}>
        {b.logo ? <Logo src={b.logo} h={70} /> : null}
        <div>
          <T size={48}>{b.titulo}</T>
          {b.subtitulo ? <div style={{ fontFamily: font.texto, fontSize: 26, color: color.gris, marginTop: 4 }}>{b.subtitulo}</div> : null}
        </div>
      </div>
      <div style={{ position: "relative", height: n * FILA }}>
        {b.items.map((it, i) => {
          const p = at(it.t);
          const elegido = i === k;
          const g = elegido ? 1 + 0.08 * Math.sin(Math.min(1, golpe) * Math.PI) : 1;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: pos(i) * FILA,
                height: FILA,
                display: "flex",
                alignItems: "center",
                gap: 20,
                opacity: Math.min(1, p * 1.3),
                transform: `translateX(${interpolate(p, [0, 1], [40, 0])}px) scale(${g})`,
                transformOrigin: "left center",
                zIndex: elegido ? 2 : 1,
              }}
            >
              <Check p={p} size={54} />
              <span style={{ fontFamily: font.texto, fontWeight: 600, fontSize: 42, color: elegido && sube > 0.5 ? color.naranja : color.negro }}>{it.texto}</span>
              {it.nota ? <span style={{ fontFamily: font.texto, fontSize: 26, color: color.gris }}>({it.nota})</span> : null}
              {elegido && b.subeA1?.etiqueta ? (
                <span style={{ opacity: golpe, transform: `scale(${golpe})`, display: "inline-block" }}>
                  <Pildora style={{ fontSize: 30, padding: "6px 22px" }}>{b.subeA1.etiqueta}</Pildora>
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </Tarjeta>
  );
};

// ── B10 · línea de tiempo "Ciclo de vida" con costos que aparecen ───────────────────
const Linea: React.FC<{ b: Extract<BRoll, { tipo: "linea" }> }> = ({ b }) => {
  const { lin, at } = useRel(b.start);
  const traza = lin(b.start + 0.2, 1.2);
  const n = b.items.length;
  return (
    <Tarjeta style={{ width: 940, padding: "40px 40px 46px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 10 }}>
        {b.logo ? <Logo src={b.logo} h={44} /> : null}
      </div>
      <T size={60} style={{ marginBottom: 56 }}>{b.titulo}</T>
      <div style={{ position: "relative", height: 250 }}>
        {/* eje */}
        <div style={{ position: "absolute", left: 20, top: 36, height: 8, borderRadius: 8, width: `calc(${traza} * (100% - 40px))`, background: color.negro }} />
        <div style={{ position: "absolute", left: 6, top: 22, width: 36, height: 36, borderRadius: 99, background: color.negro }} />
        <div style={{ position: "absolute", right: 6, top: 22, width: 36, height: 36, borderRadius: 99, background: color.negro, opacity: traza > 0.98 ? 1 : 0 }} />
        <div style={{ position: "absolute", left: 0, top: 70, fontFamily: font.texto, fontSize: 26, color: color.gris }}>Compra</div>
        <div style={{ position: "absolute", right: 0, top: 70, fontFamily: font.texto, fontSize: 26, color: color.gris, opacity: traza > 0.98 ? 1 : 0 }}>Fin del programa</div>
        {b.items.map((it, i) => {
          const p = at(it.t, "golpe");
          const x = ((i + 1) / (n + 1)) * 100;
          return (
            <div key={i} style={{ position: "absolute", left: `${x}%`, top: 0, transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", opacity: Math.min(1, p * 1.5) }}>
              <div style={{ width: 80, height: 80, borderRadius: 99, background: color.naranja, border: theme.card.border, display: "flex", alignItems: "center", justifyContent: "center", color: color.blanco, fontFamily: font.titulo, fontWeight: 700, fontSize: 44, transform: `scale(${interpolate(p, [0, 1], [0.3, 1])})` }}>$</div>
              <div style={{ marginTop: 74, fontFamily: font.texto, fontWeight: 600, fontSize: 34, color: color.negro, textAlign: "center", width: 240, lineHeight: 1.15, transform: `translateY(${interpolate(p, [0, 1], [20, 0])}px)` }}>{it.texto}</div>
            </div>
          );
        })}
      </div>
    </Tarjeta>
  );
};

// Reloj de líneas cuya manecilla corre
const Reloj: React.FC<{ seg: number; size?: number }> = ({ seg, size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="44" fill={color.blanco} stroke={color.negro} strokeWidth="6" />
    {[0, 1, 2, 3].map((i) => (
      <line key={i} x1="50" y1="12" x2="50" y2="20" stroke={color.negro} strokeWidth="5" strokeLinecap="round" transform={`rotate(${i * 90} 50 50)`} />
    ))}
    <line x1="50" y1="50" x2="50" y2="28" stroke={color.negro} strokeWidth="6" strokeLinecap="round" transform={`rotate(${seg * 30} 50 50)`} />
    <line x1="50" y1="50" x2="50" y2="18" stroke={color.naranja} strokeWidth="4" strokeLinecap="round" transform={`rotate(${seg * 360} 50 50)`} />
    <circle cx="50" cy="50" r="5" fill={color.naranja} />
  </svg>
);

// ── B12 · bandeja con "Solicitud de cotización" sin respuesta + reloj ──────────────
const Bandeja: React.FC<{ b: Extract<BRoll, { tipo: "bandeja" }> }> = ({ b }) => {
  const { frame, fps, at } = useRel(b.start);
  const m = at(b.start + 0.25, "golpe");
  const sr = at(b.tSinRespuesta, "golpe");
  const seg = frame / fps / 1.6;
  const fila = (txt: string, sub: string, activo: boolean, i: number) => (
    <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, padding: "22px 26px", borderTop: i ? `2px solid ${color.verde}` : "none", background: activo ? color.blanco : color.blanco, opacity: activo ? 1 : 0.35 }}>
      <div style={{ width: 18, height: 18, borderRadius: 99, background: activo ? color.naranja : color.gris, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: font.texto, fontWeight: 600, fontSize: activo ? 38 : 30, color: color.negro }}>{txt}</div>
        <div style={{ fontFamily: font.texto, fontSize: 24, color: color.gris }}>{sub}</div>
      </div>
    </div>
  );
  return (
    <div style={{ position: "relative", width: 940 }}>
      <Tarjeta style={{ width: 940, padding: 0, overflow: "hidden" }}>
        <div style={{ background: color.negro, color: color.blanco, padding: "20px 28px", fontFamily: font.texto, fontWeight: 600, fontSize: 30, display: "flex", justifyContent: "space-between" }}>
          <span>Bandeja de entrada</span>
          <span style={{ color: color.naranja }}>1 sin leer</span>
        </div>
        <div style={{ opacity: m, transform: `translateY(${interpolate(m, [0, 1], [-40, 0])}px)` }}>{fila(b.asunto, b.de ?? "Hace 3 días", true, 0)}</div>
        {fila("Boletín semanal", "Hace 4 días", false, 1)}
        {fila("Recordatorio de junta", "Hace 5 días", false, 2)}
      </Tarjeta>
      <div style={{ position: "absolute", right: 24, top: 100, transform: `scale(${m})` }}>
        <Reloj seg={seg} size={130} />
      </div>
      <div style={{ position: "absolute", left: 120, bottom: -40, opacity: Math.min(1, sr * 1.4), transform: `rotate(-4deg) scale(${interpolate(sr, [0, 1], [1.8, 1])})` }}>
        <Pildora style={{ fontSize: 44, padding: "14px 36px", border: theme.card.border }}>Sin respuesta</Pildora>
      </div>
    </div>
  );
};

// ── B13 · ecuación que se arma por partes ───────────────────────────────────────────
const Ecuacion: React.FC<{ b: Extract<BRoll, { tipo: "ecuacion" }> }> = ({ b }) => {
  const { at } = useRel(b.start);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, width: 960 }}>
      {b.partes.map((pt, i) => {
        const p = at(pt.t, "golpe");
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, opacity: Math.min(1, p * 1.5), transform: `scale(${interpolate(p, [0, 1], [0.6, 1])})` }}>
            {pt.signo ? <T size={84} c={color.naranja}>{pt.signo}</T> : null}
            <div style={{ background: pt.naranja ? color.naranja : color.blanco, border: theme.card.border, borderRadius: 26, padding: "20px 40px" }}>
              <T size={pt.naranja ? 92 : 60} c={pt.naranja ? color.blanco : color.negro} style={{ textAlign: "center" }}>{pt.texto}</T>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const BRollExtra: React.FC<{ b: BRoll }> = ({ b }) => {
  switch (b.tipo) {
    case "logos":
      return <Logos b={b} />;
    case "sello":
      return <Sello b={b} />;
    case "tachado":
      return <Tachado b={b} />;
    case "checklist":
      return <Checklist b={b} />;
    case "linea":
      return <Linea b={b} />;
    case "bandeja":
      return <Bandeja b={b} />;
    case "ecuacion":
      return <Ecuacion b={b} />;
    default:
      return null;
  }
};

// Brújula de líneas negras con aguja naranja
export const Brujula: React.FC<{ size?: number; giro?: number }> = ({ size = 220, giro = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="45" fill={color.blanco} stroke={color.negro} strokeWidth="5" />
    <circle cx="50" cy="50" r="36" fill="none" stroke={color.negro} strokeWidth="1.5" strokeDasharray="2 5" />
    {["N", "E", "S", "O"].map((l, i) => (
      <text key={l} x="50" y="20" textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize="9" fill={color.negro} transform={`rotate(${i * 90} 50 50)`}>
        {l}
      </text>
    ))}
    <g transform={`rotate(${giro} 50 50)`}>
      <path d="M50 22 L58 50 L50 50 Z" fill={color.naranja} stroke={color.negro} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M50 22 L42 50 L50 50 Z" fill={color.naranja} stroke={color.negro} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M50 78 L58 50 L42 50 Z" fill={color.blanco} stroke={color.negro} strokeWidth="1.5" strokeLinejoin="round" />
    </g>
    <circle cx="50" cy="50" r="4" fill={color.negro} />
  </svg>
);
