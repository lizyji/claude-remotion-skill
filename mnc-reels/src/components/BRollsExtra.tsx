// B-rolls animados extra (genéricos, sin marcas): reloj, pila, lupa, calendario, flecha,
// texto grande, ícono con palomita y "pendiente" enriquecido. Colores planos MNC únicamente.
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { Check, Pildora, Tarjeta } from "./Base";

const { color, font } = theme;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const useSp = (delaySec: number, preset: keyof typeof theme.spring = "suave") => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - Math.round(delaySec * fps), fps, config: theme.spring[preset] });
};

const Big: React.FC<{ children: React.ReactNode; size?: number; c?: string; style?: React.CSSProperties }> = ({ children, size = 150, c = color.naranja, style }) => (
  <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: size, lineHeight: 1, color: c, ...style }}>{children}</div>
);

const Etiqueta: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 46 }) => (
  <div style={{ fontFamily: font.texto, fontWeight: 600, fontSize: size, color: color.negro, textAlign: "center" }}>{children}</div>
);

// Documento genérico (hoja blanca con renglones)
export const Hoja: React.FC<{ w?: number; h?: number; titulo?: string; style?: React.CSSProperties; renglones?: number }> = ({ w = 220, h = 290, titulo, style, renglones = 6 }) => (
  <div style={{ width: w, height: h, background: color.blanco, border: `3px solid ${color.negro}`, borderRadius: 16, padding: w * 0.1, boxSizing: "border-box", ...style }}>
    {titulo ? <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: w * 0.11, color: color.negro, marginBottom: h * 0.05 }}>{titulo}</div> : null}
    {Array.from({ length: renglones }).map((_, i) => (
      <div key={i} style={{ height: h * 0.028, background: i === 0 && !titulo ? color.negro : color.gris, opacity: i === 0 && !titulo ? 1 : 0.35, borderRadius: 4, marginBottom: h * 0.06, width: `${[100, 88, 94, 70, 90, 60, 82, 76][i % 8]}%` }} />
    ))}
  </div>
);

// B1 · Número gigante contra un reloj que gira rápido
export const Reloj: React.FC<{ valor: string; etiqueta: string; antes?: string; numeroEn?: number; etiquetaEn?: number }> = ({ valor, etiqueta, antes, numeroEn = 0.25, etiquetaEn }) => {
  const frame = useCurrentFrame();
  const g = useSp(numeroEn, "golpe");
  const e = useSp(etiquetaEn ?? numeroEn + 0.3);
  const pa = useSp(0.1);
  const ang = frame * 24; // minutero muy rápido
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      <svg width={230} height={230} viewBox="0 0 230 230" style={{ transform: `scale(${interpolate(useSp(0), [0, 1], [0.6, 1])})` }}>
        <circle cx="115" cy="115" r="104" fill={color.blanco} stroke={color.negro} strokeWidth="6" />
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1="115" y1="22" x2="115" y2={i % 3 === 0 ? 42 : 34} stroke={color.negro} strokeWidth={i % 3 === 0 ? 6 : 3} transform={`rotate(${i * 30} 115 115)`} strokeLinecap="round" />
        ))}
        <line x1="115" y1="115" x2="115" y2="62" stroke={color.negro} strokeWidth="8" strokeLinecap="round" transform={`rotate(${ang / 12} 115 115)`} />
        <line x1="115" y1="115" x2="115" y2="38" stroke={color.naranja} strokeWidth="6" strokeLinecap="round" transform={`rotate(${ang} 115 115)`} />
        <circle cx="115" cy="115" r="10" fill={color.negro} />
      </svg>
      <div style={{ position: "relative", height: 170, display: "flex", alignItems: "center", justifyContent: "center", width: 960 }}>
        {antes ? (
          <div style={{ position: "absolute", opacity: pa * (1 - Math.min(1, g * 2)), transform: `scale(${interpolate(pa, [0, 1], [0.8, 1])})` }}>
            <Big size={96} c={color.negro}>{antes}</Big>
          </div>
        ) : null}
        <Big size={170} style={{ transform: `scale(${interpolate(g, [0, 1], [1.5, 1])})`, opacity: Math.min(1, g * 1.4) }}>{valor}</Big>
      </div>
      <div style={{ opacity: e, transform: `translateY(${interpolate(e, [0, 1], [24, 0])}px)` }}>
        <Etiqueta size={56}>{etiqueta}</Etiqueta>
      </div>
    </div>
  );
};

// B2 · Pila de contratos que crece + contador
export const Pila: React.FC<{ valor: number; etiqueta: string; llegaEn?: number }> = ({ valor, etiqueta, llegaEn = 1.8 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const N = 9;
  const k = interpolate(frame, [4, Math.max(5, fps * llegaEn)], [0, 1], { ...clamp, easing: theme.ease.out });
  const cuenta = Math.round(valor * k);
  const g = spring({ frame: frame - Math.round(fps * llegaEn), fps, config: theme.spring.golpe });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 50 }}>
      <div style={{ position: "relative", width: 260, height: 470 }}>
        {Array.from({ length: N }).map((_, i) => {
          const pi = spring({ frame: frame - 3 - Math.round((i * fps * llegaEn) / N), fps, config: theme.spring.rapido });
          return (
            <div key={i} style={{ position: "absolute", left: (i % 2) * 14, bottom: i * 22, opacity: pi, transform: `translateY(${interpolate(pi, [0, 1], [-120, 0])}px) rotate(${(i % 3) - 1}deg)` }}>
              <Hoja w={240} h={300} renglones={i === N - 1 ? 6 : 2} />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <Big size={140} style={{ transform: `scale(${1 + 0.08 * Math.sin(Math.min(1, g) * Math.PI)})`, transformOrigin: "left center" }}>
          {cuenta.toLocaleString("en-US")}
        </Big>
        <Etiqueta size={46}>{etiqueta}</Etiqueta>
      </div>
    </div>
  );
};

// B3 · Lupa que pasa sobre un contrato y saca 3 datos clave
export const Lupa: React.FC<{ items: string[]; titulo?: string; itemsEn?: number; cada?: number }> = ({ items, titulo, itemsEn = 0.6, cada = 0.75 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const y = interpolate(frame, [0, fps * (itemsEn + cada * items.length)], [40, 300], { ...clamp, easing: theme.ease.inOut });
  const x = 70 + 40 * Math.sin(frame / 7);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 46 }}>
      <div style={{ position: "relative" }}>
        <Hoja w={330} h={450} titulo={titulo ?? "Contrato"} renglones={8} />
        <svg width={190} height={190} viewBox="0 0 190 190" style={{ position: "absolute", left: x, top: y - 40 }}>
          <circle cx="78" cy="78" r="58" fill={color.blanco} fillOpacity="0.35" stroke={color.negro} strokeWidth="10" />
          <line x1="122" y1="122" x2="176" y2="176" stroke={color.naranja} strokeWidth="18" strokeLinecap="round" />
        </svg>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        {items.map((it, i) => {
          const pi = spring({ frame: frame - Math.round((itemsEn + i * cada) * fps), fps, config: theme.spring.golpe });
          return (
            <div key={i} style={{ opacity: Math.min(1, pi * 1.3), transform: `translateX(${interpolate(pi, [0, 1], [-80, 0])}px) scale(${interpolate(pi, [0, 1], [0.6, 1])})` }}>
              <Pildora tono={i === 0 ? "naranja" : "negro"} style={{ fontSize: 42, padding: "16px 34px" }}>{it}</Pildora>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// B4 · Calendario que avanza año por año hasta N
export const Calendario: React.FC<{ hasta: number; etiqueta: string; llegaEn?: number }> = ({ hasta, etiqueta, llegaEn = 3.3 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = interpolate(frame, [6, Math.max(7, fps * llegaEn)], [0, 1], { ...clamp, easing: Easing2 });
  const n = Math.max(1, Math.round(1 + (hasta - 1) * k));
  const llego = n >= hasta;
  const g = spring({ frame: frame - Math.round(fps * llegaEn), fps, config: theme.spring.golpe });
  const flip = (frame % 4) / 4;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
      <div style={{ width: 380, background: color.blanco, border: `3px solid ${color.negro}`, borderRadius: 28, overflow: "hidden", transform: `scale(${1 + 0.07 * Math.sin(Math.min(1, g) * Math.PI)})` }}>
        <div style={{ background: color.naranja, height: 80, borderBottom: `3px solid ${color.negro}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 120 }}>
          <div style={{ width: 20, height: 20, borderRadius: 10, background: color.blanco, border: `3px solid ${color.negro}` }} />
          <div style={{ width: 20, height: 20, borderRadius: 10, background: color.blanco, border: `3px solid ${color.negro}` }} />
        </div>
        <div style={{ height: 250, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: llego ? undefined : `translateY(${-6 * flip}px)` }}>
          <Big size={150} c={llego ? color.naranja : color.negro}>{n}</Big>
          <div style={{ fontFamily: font.texto, fontWeight: 600, fontSize: 40, color: color.gris }}>{n === 1 ? "año" : "años"}</div>
        </div>
      </div>
      <div style={{ opacity: llego ? Math.min(1, g * 1.4) : 0, transform: `scale(${interpolate(g, [0, 1], [0.7, 1])})` }}>
        <Etiqueta size={56}>{etiqueta}</Etiqueta>
      </div>
    </div>
  );
};
const Easing2 = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

// B6 · "A → B" y abajo un renglón con palomita
export const Flecha: React.FC<{ de: string; a: string; extra?: string; aEn?: number; extraEn?: number; tachar?: boolean; deSize?: number; aSize?: number }> = ({ de, a, extra, aEn = 0.45, extraEn = 1.4, tachar = true, deSize = 92, aSize = 130 }) => {
  const p1 = useSp(0.05);
  const p2 = useSp(aEn, "golpe");
  const p3 = useSp(extraEn, "golpe");
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tachado = tachar ? interpolate(frame, [fps * (aEn - 0.1), fps * (aEn + 0.15)], [0, 100], clamp) : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
      <Tarjeta style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "36px 56px", width: 900 }}>
        <div style={{ position: "relative", opacity: p1 }}>
          <Big size={deSize} c={color.gris} style={{ textAlign: "center" }}>{de}</Big>
          <div style={{ position: "absolute", left: 0, top: "52%", height: 8, width: `${tachado}%`, background: color.negro, borderRadius: 4 }} />
        </div>
        <div style={{ height: interpolate(Math.min(1, p2), [0, 1], [0, 90 + aSize * 1.1]), overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <svg width={80} height={70} viewBox="0 0 80 70" style={{ opacity: p2, flexShrink: 0 }}>
          <path d="M40 4 V58 M16 36 L40 62 L64 36" stroke={color.negro} strokeWidth="9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <Big size={aSize} style={{ textAlign: "center", transform: `scale(${interpolate(p2, [0, 1], [1.5, 1])})`, opacity: Math.min(1, p2 * 1.4), whiteSpace: "nowrap" }}>{a}</Big>
        </div>
      </Tarjeta>
      {extra ? (
        <div style={{ display: "flex", alignItems: "center", gap: 20, opacity: Math.min(1, p3 * 1.4), transform: `scale(${interpolate(p3, [0, 1], [0.6, 1])})` }}>
          <Check size={74} p={p3} />
          <Big size={64} c={color.negro}>{extra}</Big>
        </div>
      ) : null}
    </div>
  );
};

// B9 · Texto grande (resalta una parte en naranja)
export const TextoGrande: React.FC<{ texto: string; resalta?: string }> = ({ texto, resalta }) => {
  const words = texto.split(" ");
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const res = new Set((resalta ?? "").split(" "));
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 0.26em", fontFamily: font.titulo, fontWeight: 700, fontSize: 112, lineHeight: 1.1, textAlign: "center", width: 940 }}>
      {words.map((w, i) => {
        const p = spring({ frame: frame - i * 3, fps, config: theme.spring.golpe });
        return (
          <span key={i} style={{ display: "inline-block", color: res.has(w) ? color.naranja : color.negro, opacity: Math.min(1, p * 1.4), transform: `translateY(${interpolate(p, [0, 1], [50, 0])}px) scale(${interpolate(p, [0, 1], [0.7, 1])})` }}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

// B11 · Ícono de lupa + palomita + texto
export const Verifica: React.FC<{ titulo: string; texto?: string }> = ({ titulo, texto }) => {
  const p = useSp(0);
  const c = useSp(0.5, "golpe");
  const frame = useCurrentFrame();
  return (
    <Tarjeta style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, width: 820, padding: "48px 48px" }}>
      <div style={{ position: "relative", width: 260, height: 230, transform: `scale(${interpolate(p, [0, 1], [0.6, 1])}) rotate(${4 * Math.sin(frame / 10)}deg)` }}>
        <svg width={230} height={230} viewBox="0 0 230 230">
          <circle cx="95" cy="95" r="72" fill={color.verde} stroke={color.negro} strokeWidth="12" />
          <line x1="148" y1="148" x2="210" y2="210" stroke={color.naranja} strokeWidth="22" strokeLinecap="round" />
        </svg>
        <div style={{ position: "absolute", left: 47, top: 47 }}>
          <Check size={96} p={c} />
        </div>
      </div>
      <Big size={92} c={color.negro}>{titulo}</Big>
      {texto ? <Etiqueta size={38}>{texto}</Etiqueta> : null}
    </Tarjeta>
  );
};

// Plan B enriquecido para grabaciones que faltan: tarjeta verde claro "[Grabación pendiente: B#]"
// y, debajo, píldoras genéricas (sin interfaz de ningún producto) que se iluminan una por una.
export const PendienteItems: React.FC<{ id: string; items?: string[]; tiempos?: number[]; cada?: number; ilumina?: boolean }> = ({ id, items = [], tiempos, cada = 0.9, ilumina }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
      <Tarjeta fondo={color.verde} style={{ width: 860, textAlign: "center", padding: "30px 40px" }}>
        <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 52, color: color.gris }}>[Grabación pendiente: {id}]</div>
      </Tarjeta>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 18, width: 960 }}>
        {items.map((it, i) => {
          const ts = (k: number) => Math.round((tiempos?.[k] ?? 0.3 + k * cada) * fps);
          const t0 = ilumina ? 0 : ts(i);
          const pi = spring({ frame: frame - t0, fps, config: theme.spring.golpe });
          // ilumina: todas visibles; se pinta de naranja la que Manuel está diciendo
          const on = ilumina ? frame >= ts(i) && (i === items.length - 1 || frame < ts(i + 1)) : true;
          return (
            <div key={i} style={{ opacity: Math.min(1, pi * 1.4), transform: `scale(${interpolate(pi, [0, 1], [0.6, 1])})` }}>
              <span style={{ display: "inline-block", fontFamily: font.texto, fontWeight: 600, fontSize: 40, padding: "16px 30px", borderRadius: 999, border: `3px solid ${color.negro}`, background: on ? color.naranja : color.blanco, color: on ? color.blanco : color.negro }}>
                {it}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// B7 · Subes tus documentos: 3 hojas genéricas que caen en una bandeja de carga (sin interfaz de ningún producto)
export const Subida: React.FC<{ items: string[]; tiempos?: number[]; titulo?: string }> = ({ items, tiempos, titulo = "Subes tus documentos" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p0 = useSp(0);
  const flecha = Math.sin(frame / 5) * 6;
  return (
    <Tarjeta style={{ width: 940, padding: "30px 36px 34px", display: "flex", flexDirection: "column", alignItems: "center", gap: 22, transform: `scale(${interpolate(p0, [0, 1], [0.95, 1])})` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <svg width={56} height={56} viewBox="0 0 56 56" style={{ transform: `translateY(${flecha}px)` }}>
          <path d="M28 40 V10 M14 23 L28 9 L42 23" stroke={color.naranja} strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 38 V48 H48 V38" stroke={color.negro} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 52, color: color.negro }}>{titulo}</div>
      </div>
      <div style={{ width: "100%", height: 360, border: `3px dashed ${color.gris}`, borderRadius: 22, background: color.verde, display: "flex", alignItems: "center", justifyContent: "center", gap: 34 }}>
        {items.map((it, i) => {
          const t0 = Math.round((tiempos?.[i] ?? 0.3 + i * 0.9) * fps);
          const pi = spring({ frame: frame - t0, fps, config: theme.spring.golpe });
          const listo = spring({ frame: frame - t0 - 10, fps, config: theme.spring.rapido });
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: Math.min(1, pi * 1.5), transform: `translateY(${interpolate(pi, [0, 1], [-260, 0])}px) rotate(${interpolate(pi, [0, 1], [(i - 1) * 14, 0])}deg)` }}>
              <div style={{ position: "relative" }}>
                <Hoja w={190} h={240} renglones={5} />
                <div style={{ position: "absolute", right: -18, bottom: -18 }}>
                  <Check size={58} p={listo} />
                </div>
              </div>
              <Pildora tono={i === items.length - 1 ? "naranja" : "negro"} style={{ fontSize: 28, padding: "8px 20px" }}>{it}</Pildora>
            </div>
          );
        })}
      </div>
    </Tarjeta>
  );
};

// B8 · Tabla que se arma (datos ficticios) y columnas que se iluminan en naranja una por una
export const Tabla: React.FC<{ columnas: string[]; filas: string[][]; tiempos?: number[] }> = ({ columnas, filas, tiempos }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anchos = [230, 190, 240, 260];
  const ts = (k: number) => Math.round((tiempos?.[k] ?? 0.5 + k * 0.7) * fps);
  const activa = columnas.findIndex((_, k) => frame >= ts(k) && (k === columnas.length - 1 || frame < ts(k + 1)));
  const celda = (txt: string, k: number, head: boolean, key: string, op = 1) => {
    const on = k === activa;
    return (
      <div
        key={key}
        style={{
          width: anchos[k] ?? 220,
          boxSizing: "border-box",
          padding: head ? "18px 14px" : "16px 14px",
          fontFamily: head ? font.titulo : font.texto,
          fontWeight: head ? 700 : on ? 600 : 400,
          fontSize: head ? 30 : 28,
          color: head ? (on ? color.blanco : color.negro) : on ? color.naranja : color.negro,
          background: head ? (on ? color.naranja : color.verde) : color.blanco,
          borderLeft: k ? `2px solid ${color.negro}` : undefined,
          opacity: op,
          whiteSpace: "nowrap",
        }}
      >
        {txt}
      </div>
    );
  };
  return (
    <div style={{ width: 924, background: color.blanco, border: `3px solid ${color.negro}`, borderRadius: 24, overflow: "hidden", position: "relative" }}>
      <div style={{ display: "flex", borderBottom: `3px solid ${color.negro}` }}>{columnas.map((c, k) => celda(c, k, true, `h${k}`))}</div>
      {filas.map((f, j) => {
        const pj = spring({ frame: frame - 4 - j * 5, fps, config: theme.spring.rapido });
        return (
          <div key={j} style={{ display: "flex", borderTop: j ? `2px solid ${color.negro}` : undefined, transform: `translateY(${interpolate(pj, [0, 1], [24, 0])}px)` }}>
            {f.map((c, k) => celda(c, k, false, `${j}-${k}`, Math.min(1, pj * 1.4)))}
          </div>
        );
      })}
      {activa >= 0 ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: anchos.slice(0, activa).reduce((a, b) => a + b, 0),
            width: anchos[activa],
            border: `5px solid ${color.naranja}`,
            boxSizing: "border-box",
            pointerEvents: "none",
          }}
        />
      ) : null}
    </div>
  );
};
