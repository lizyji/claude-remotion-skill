// Animaciones a la medida (B-roll tipo "anim"). Todas viven en el panel de arriba (960×620,
// y 200–820), con colores planos MNC, íconos de línea negra con acentos naranja.
// Cada una recibe `m`: los frames (relativos al inicio del clip) en que entra cada elemento.
import React from "react";
import { Img, OffthreadVideo, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { Pildora, Tarjeta } from "./Base";

const { color, font } = theme;
const N = color.negro;
const O = color.naranja;
const G = color.gris;
const W = color.blanco;

type P = { m: number[]; dur: number; src?: string[] };

const useSpr = (desde: number, preset: keyof typeof theme.spring = "suave") => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - desde, fps, config: theme.spring[preset] });
};

// Golpe de zoom: 1 → 1.12 → 1 cuando entra
const golpe = (p: number) => 1 + 0.12 * Math.sin(Math.min(1, p) * Math.PI);

const Aparece: React.FC<{ en: number; children: React.ReactNode; style?: React.CSSProperties; dy?: number; preset?: keyof typeof theme.spring }> = ({
  en,
  children,
  style,
  dy = 30,
  preset = "suave",
}) => {
  const p = useSpr(en, preset);
  return (
    <div style={{ opacity: Math.min(1, p * 1.4), transform: `translateY(${interpolate(p, [0, 1], [dy, 0])}px) scale(${interpolate(p, [0, 1], [0.9, 1])})`, ...style }}>
      {children}
    </div>
  );
};

const H: React.FC<{ size?: number; c?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ size = 64, c = N, children, style }) => (
  <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: size, lineHeight: 1.08, color: c, ...style }}>{children}</div>
);

// ───────────────────────── Íconos de línea ─────────────────────────
const sw = 7;
export const IconoBomba: React.FC<{ s?: number; giro?: number }> = ({ s = 170, giro = 0 }) => (
  <svg width={s} height={s} viewBox="0 0 120 120" fill="none" stroke={N} strokeWidth={sw / 1.4} strokeLinecap="round" strokeLinejoin="round">
    <rect x="14" y="88" width="92" height="12" rx="4" />
    <circle cx="52" cy="58" r="28" fill={W} />
    <g transform={`rotate(${giro} 52 58)`}>
      <path d="M52 58 L52 36 M52 58 L71 69 M52 58 L33 69" stroke={O} />
    </g>
    <path d="M80 50 H106 V40" />
    <path d="M24 58 H8" />
  </svg>
);
export const IconoVentilador: React.FC<{ s?: number; giro?: number }> = ({ s = 170, giro = 0 }) => (
  <svg width={s} height={s} viewBox="0 0 120 120" fill="none" stroke={N} strokeWidth={sw / 1.4} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="60" cy="56" r="44" fill={W} />
    <g transform={`rotate(${giro} 60 56)`} fill={O} stroke={N}>
      <path d="M60 56 C52 40 52 24 60 16 C70 22 70 40 60 56Z" />
      <path d="M60 56 C76 50 90 54 96 64 C88 72 72 68 60 56Z" />
      <path d="M60 56 C56 72 46 84 34 84 C30 72 44 62 60 56Z" />
    </g>
    <circle cx="60" cy="56" r="6" fill={N} />
    <path d="M44 104 H76 M60 100 V108" />
  </svg>
);
export const IconoTorre: React.FC<{ s?: number; ola?: number }> = ({ s = 170, ola = 0 }) => (
  <svg width={s} height={s} viewBox="0 0 120 120" fill="none" stroke={N} strokeWidth={sw / 1.4} strokeLinecap="round" strokeLinejoin="round">
    <path d="M30 104 C40 80 40 56 34 34 H86 C80 56 80 80 90 104 Z" fill={W} />
    <path d="M30 104 H90" />
    <path d={`M40 ${24 - ola * 4} c6 -6 10 6 16 0 s10 6 16 0`} stroke={O} />
    <path d={`M48 ${14 - ola * 4} c6 -6 10 6 16 0`} stroke={O} />
    <path d="M44 70 H76" stroke={G} />
  </svg>
);
const IconoCompresor: React.FC<{ s?: number }> = ({ s = 90 }) => (
  <svg width={s} height={s} viewBox="0 0 120 120" fill="none" stroke={N} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round">
    <rect x="18" y="44" width="70" height="46" rx="20" fill={W} />
    <circle cx="94" cy="34" r="14" fill={W} />
    <path d="M94 34 l6 -6" stroke={O} />
    <path d="M30 90 v12 M76 90 v12 M88 66 h16" />
    <path d="M36 62 h34" stroke={O} />
  </svg>
);
const IconoHorno: React.FC<{ s?: number }> = ({ s = 90 }) => (
  <svg width={s} height={s} viewBox="0 0 120 120" fill="none" stroke={N} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round">
    <rect x="16" y="18" width="88" height="86" rx="10" fill={W} />
    <path d="M16 40 H104" />
    <rect x="30" y="52" width="60" height="38" rx="6" />
    <circle cx="34" cy="29" r="4" fill={O} stroke="none" />
    <circle cx="52" cy="29" r="4" fill={O} stroke="none" />
    <path d="M42 80 c4 -8 8 -2 12 -10 c4 8 8 2 12 10" stroke={O} />
  </svg>
);
const IconoRefri: React.FC<{ s?: number }> = ({ s = 90 }) => (
  <svg width={s} height={s} viewBox="0 0 120 120" fill="none" stroke={N} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round">
    <rect x="28" y="10" width="64" height="100" rx="10" fill={W} />
    <path d="M28 46 H92 M40 26 V36 M40 58 V72" />
    <path d="M66 72 l0 22 M56 78 l20 10 M56 88 l20 -10" stroke={O} />
  </svg>
);
const IconoChip: React.FC<{ s?: number; brillo?: number }> = ({ s = 260, brillo = 0 }) => (
  <svg width={s} height={s} viewBox="0 0 120 120" fill="none" stroke={N} strokeWidth={4} strokeLinecap="round">
    {[34, 50, 66, 82].map((v) => (
      <g key={v}>
        <path d={`M${v} 8 V22 M${v} 98 V112 M8 ${v} H22 M98 ${v} H112`} />
      </g>
    ))}
    <rect x="22" y="22" width="76" height="76" rx="12" fill={O} />
    <rect x="36" y="36" width="48" height="48" rx="6" fill={W} opacity={0.15 + 0.25 * brillo} stroke="none" />
    <text x="60" y="71" textAnchor="middle" fontFamily="Readex Pro" fontWeight={700} fontSize="30" fill={W} stroke="none">
      IA
    </text>
  </svg>
);

// ───────────────────────── B1 · −40% + termómetro ─────────────────────────
const Termometro: React.FC<P> = ({ m }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nivel = interpolate(frame, [m[0] + 4, m[0] + 4 + fps * 1.4], [0.9, 0.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.out });
  const n = Math.round(interpolate(frame, [m[0] + 4, m[0] + 4 + fps * 1.0], [0, 40], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.out }));
  const g = useSpr(m[0] + 4 + fps, "golpe");
  const tubo = 380;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 50 }}>
      <Aparece en={m[0]}>
        <svg width={150} height={470} viewBox="0 0 150 470">
          <rect x="45" y="10" width="60" height={tubo} rx="30" fill={W} stroke={N} strokeWidth="6" />
          <circle cx="75" cy="405" r="55" fill={O} stroke={N} strokeWidth="6" />
          <rect x="59" y={30 + (1 - nivel) * (tubo - 40)} width="32" height={nivel * (tubo - 40) + 30} rx="16" fill={O} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path key={i} d={`M112 ${50 + i * 55} h20`} stroke={N} strokeWidth="5" strokeLinecap="round" />
          ))}
          <path d={`M138 ${60 + (1 - nivel) * 200} l0 70 m-12 -14 l12 14 l12 -14`} stroke={O} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={interpolate(frame, [m[0] + 8, m[0] + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
        </svg>
      </Aparece>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <H size={250} c={O} style={{ transform: `scale(${golpe(g)})`, transformOrigin: "left center", lineHeight: 1 }}>
          −{n}%
        </H>
        <Aparece en={m[1] ?? m[0] + 20} style={{ marginTop: 14 }}>
          <Pildora tono="negro" style={{ fontSize: 44, padding: "14px 36px" }}>
            en enfriamiento
          </Pildora>
        </Aparece>
      </div>
    </div>
  );
};

// ───────────────────────── B2 · 0 máquinas nuevas ─────────────────────────
const Carrito: React.FC<P> = ({ m }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = useSpr(m[0], "suave");
  const x = interpolate(entra, [0, 1], [-380, 0]);
  const rueda = interpolate(entra, [0, 1], [-540, 0]);
  const g = useSpr(m[1] ?? m[0] + 15, "golpe");
  const sacude = frame > (m[1] ?? 0) && frame < (m[1] ?? 0) + fps * 0.5 ? Math.sin(frame * 2.2) * 4 : 0;
  return (
    <Tarjeta style={{ width: 920, display: "flex", alignItems: "center", gap: 40, padding: "50px 56px" }}>
      <div style={{ transform: `translateX(${x}px) rotate(${sacude}deg)` }}>
        <svg width={300} height={260} viewBox="0 0 150 130" fill="none" stroke={N} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 14 H26 L42 82 H122 L138 32 H32" fill={W} />
          <path d="M60 50 H120 M48 66 H114" stroke={color.verde} />
          <g transform={`rotate(${rueda} 52 104)`}>
            <circle cx="52" cy="104" r="12" fill={O} />
            <path d="M52 94 V114" stroke={W} strokeWidth="3" />
          </g>
          <g transform={`rotate(${rueda} 112 104)`}>
            <circle cx="112" cy="104" r="12" fill={O} />
            <path d="M112 94 V114" stroke={W} strokeWidth="3" />
          </g>
        </svg>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <H size={230} c={O} style={{ lineHeight: 0.95, opacity: Math.min(1, g * 1.5), transform: `scale(${interpolate(g, [0, 1], [1.5, 1])})`, transformOrigin: "left center" }}>
          0
        </H>
        <Aparece en={(m[1] ?? m[0] + 15) + 5}>
          <H size={60}>máquinas nuevas</H>
        </Aparece>
      </div>
    </Tarjeta>
  );
};

// ───────────────────────── B3 · Pasillo de servidores (genérico) ─────────────────────────
const Servidores: React.FC<P> = ({ m, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const calor = interpolate(frame, [m[1] ?? 20, (m[1] ?? 20) + fps * 1.2], [0.15, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const temp = Math.round(interpolate(calor, [0.15, 1], [24, 41]));
  const racks = [0, 1, 2, 3];
  // perspectiva de pasillo: dos filas que convergen (izquierda y derecha)
  const Rack: React.FC<{ i: number; lado: 1 | -1 }> = ({ i, lado }) => {
    const p = useSpr(m[0] + i * 3);
    const esc = 1 - i * 0.2;
    const x = lado * (330 - i * 70);
    return (
      <div
        style={{
          position: "absolute",
          left: 480 + x - 90 * esc,
          top: 300 - 260 * esc,
          width: 180 * esc,
          height: 520 * esc,
          opacity: p,
          transform: `translateY(${(1 - p) * 40}px)`,
        }}
      >
        <div style={{ width: "100%", height: "100%", background: W, border: `${Math.max(2, 4 * esc)}px solid ${N}`, borderRadius: 10 * esc, boxSizing: "border-box", padding: 10 * esc, display: "flex", flexDirection: "column", gap: 8 * esc }}>
          {Array.from({ length: 9 }).map((_, k) => {
            const on = random(`led${lado}${i}${k}${Math.floor(frame / 5)}`) > 0.45;
            return (
              <div key={k} style={{ flex: 1, background: color.verde, borderRadius: 4 * esc, display: "flex", alignItems: "center", justifyContent: "flex-end", padding: `0 ${6 * esc}px`, gap: 4 * esc }}>
                <div style={{ width: 9 * esc, height: 9 * esc, borderRadius: 99, background: on ? O : G }} />
                <div style={{ width: 9 * esc, height: 9 * esc, borderRadius: 99, background: N, opacity: 0.6 }} />
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  return (
    <div style={{ position: "relative", width: 960, height: 620 }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 20, height: 4, background: N, opacity: 0.25 }} />
      {racks
        .slice()
        .reverse()
        .map((i) => (
          <React.Fragment key={i}>
            <Rack i={i} lado={-1} />
            <Rack i={i} lado={1} />
          </React.Fragment>
        ))}
      {/* ondas de calor que suben por el pasillo */}
      <svg width={960} height={620} style={{ position: "absolute", left: 0, top: 0 }}>
        {[0, 1, 2, 3, 4].map((k) => {
          const ciclo = ((frame + k * 11) % 50) / 50;
          const y = 560 - ciclo * 420;
          const x = 380 + k * 50;
          return (
            <path
              key={k}
              d={`M${x} ${y} c-18 -22 18 -38 0 -60 c-18 -22 18 -38 0 -60`}
              stroke={O}
              strokeWidth={9}
              fill="none"
              strokeLinecap="round"
              opacity={calor * Math.sin(ciclo * Math.PI)}
            />
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, display: "flex", justifyContent: "center" }}>
        <Aparece en={m[1] ?? 20}>
          <Pildora style={{ fontSize: 46, padding: "12px 34px" }}>{temp} °C ↑</Pildora>
        </Aparece>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, display: "flex", justifyContent: "center", opacity: interpolate(frame, [dur - 6, dur], [1, 1]) }}>
        <Aparece en={m[2] ?? 10}>
          <Pildora tono="negro" style={{ fontSize: 40 }}>miles de computadoras</Pildora>
        </Aparece>
      </div>
    </div>
  );
};

// ───────────────────────── B4 · Bomba · ventilador · torre conectados ─────────────────────────
const Enfriamiento: React.FC<P> = ({ m }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [mBomba, mVent, mTorre, mMueve, mTodas] = m;
  // al "mover uno" el ventilador acelera; al "cambian todas" se mueven los tres
  const todas = interpolate(frame, [mTodas, mTodas + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const uno = interpolate(frame, [mMueve, mMueve + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const giroBase = frame * 3;
  const giroVent = giroBase + Math.max(0, frame - mMueve) * 14 * uno;
  const giroBomba = giroBase + Math.max(0, frame - mTodas) * 14 * todas;
  const ola = todas * Math.abs(Math.sin(frame / 3));
  const brinco = (desde: number, act: number) => (act > 0 ? -18 * Math.abs(Math.sin(((frame - desde) / fps) * Math.PI * 3)) * Math.max(0, 1 - (frame - desde) / (fps * 1.2)) : 0);
  const items = [
    { en: mBomba, label: "Bombas", icono: <IconoBomba giro={giroBomba} />, act: todas, desde: mTodas },
    { en: mVent, label: "Ventiladores", icono: <IconoVentilador giro={giroVent} />, act: uno, desde: mMueve },
    { en: mTorre, label: "Torres de agua", icono: <IconoTorre ola={ola} />, act: todas, desde: mTodas },
  ];
  const lineaOn = Math.max(uno * 0.5, todas);
  return (
    <div style={{ position: "relative", width: 960, height: 520 }}>
      {/* conexiones */}
      <svg width={960} height={520} style={{ position: "absolute", inset: 0 }}>
        {[
          [250, 380],
          [580, 710],
        ].map(([a, b], i) => {
          const p = interpolate(frame, [m[i + 1], m[i + 1] + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <g key={i}>
              <path d={`M${a} 200 H${a + (b - a) * p}`} stroke={lineaOn > 0.5 ? O : N} strokeWidth={8} strokeLinecap="round" strokeDasharray="4 18" strokeDashoffset={-frame * 2 * (1 + 3 * lineaOn)} />
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "60px 10px 0" }}>
        {items.map((it, i) => (
          <Aparece key={i} en={it.en} preset="golpe" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, width: 280 }}>
            <div
              style={{
                background: W,
                border: `3px solid ${it.act > 0.5 ? O : N}`,
                borderRadius: 28,
                padding: 30,
                transform: `translateY(${brinco(it.desde, it.act)}px)`,
              }}
            >
              {it.icono}
            </div>
            <Pildora tono={it.act > 0.5 ? "naranja" : "negro"} style={{ fontSize: 34, padding: "10px 26px", whiteSpace: "nowrap" }}>
              {it.label}
            </Pildora>
          </Aparece>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, textAlign: "center", opacity: todas }}>
        <H size={50}>
          Mueves una → <span style={{ color: O }}>cambian todas</span>
        </H>
      </div>
    </div>
  );
};

// ───────────────────────── Clip de stock dentro de tarjeta ─────────────────────────
const VideoCard: React.FC<{ src: string; w?: number; h?: number; desde?: number; children?: React.ReactNode }> = ({ src, w = 960, h = 600, desde = 0, children }) => {
  const frame = useCurrentFrame();
  const z = 1 + frame * 0.0012;
  return (
    <div style={{ width: w, height: h, borderRadius: theme.card.radius, border: theme.card.border, overflow: "hidden", position: "relative", background: N }}>
      <OffthreadVideo src={staticFile(src)} muted startFrom={desde} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${z})` }} />
      {children}
    </div>
  );
};

// ───────────────────────── B5 · Persona con calculadora + números sin parar ─────────────────────────
const Calculadora: React.FC<P> = ({ m, src }) => {
  const frame = useCurrentFrame();
  const paso = Math.floor(frame / 3);
  const num = (k: string, min: number, max: number) => (min + random(`${k}${paso}`) * (max - min)).toFixed(1);
  return (
    <VideoCard src={src![0]}>
      <div style={{ position: "absolute", right: 26, top: 26, display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-end" }}>
        {[
          ["Bomba", num("b", 40, 95), "%"],
          ["Ventilador", num("v", 800, 1900), "rpm"],
          ["Agua", num("a", 14, 29), "°C"],
        ].map(([l, v, u], i) => (
          <Aparece key={i} en={m[0] + i * 4}>
            <div style={{ background: W, border: `3px solid ${N}`, borderRadius: 18, padding: "8px 20px", fontFamily: font.texto, fontWeight: 600, fontSize: 32, color: N, minWidth: 330, display: "flex", justifyContent: "space-between", gap: 16 }}>
              <span style={{ color: G }}>{l}</span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>
                {v} {u}
              </span>
            </div>
          </Aparece>
        ))}
      </div>
      <div style={{ position: "absolute", left: 26, bottom: 26 }}>
        <Aparece en={m[1] ?? 30} preset="golpe">
          <Pildora style={{ fontSize: 48, padding: "14px 36px" }}>⏱ cada minuto</Pildora>
        </Aparece>
      </div>
    </VideoCard>
  );
};

// ───────────────────────── B6 · Titular real del blog de DeepMind ─────────────────────────
const Titular: React.FC<P> = ({ m, dur }) => {
  const frame = useCurrentFrame();
  const z = interpolate(frame, [0, dur], [1, 1.07], { easing: theme.ease.inOut });
  return (
    <Tarjeta style={{ width: 960, padding: "40px 36px", display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
      <Aparece en={m[0]}>
        <Img src={staticFile("reels/google-deepmind/deepmind_logo.svg")} style={{ height: 52 }} />
      </Aparece>
      <div style={{ width: 880, overflow: "hidden", borderRadius: 14 }}>
        <Img src={staticFile("reels/google-deepmind/titular_deepmind.png")} style={{ width: "100%", transform: `scale(${z})` }} />
      </div>
      <Aparece en={m[1] ?? 20}>
        <Pildora style={{ fontSize: 36 }}>Blog de Google DeepMind · 20 jul 2016</Pildora>
      </Aparece>
    </Tarjeta>
  );
};

// ───────────────────────── B7 · Datos → chip IA ─────────────────────────
const Chip: React.FC<P> = ({ m }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const etiquetas = ["Temperaturas", "Consumo de energía", "Velocidad de las bombas"];
  const entraChip = useSpr(0, "suave");
  const absorbidas = etiquetas.filter((_, i) => frame > m[2] + fps * 0.85 + i * 2).length;
  const pulso = 1 + 0.06 * Math.sin(frame / 3) * Math.min(1, absorbidas);
  return (
    <div style={{ position: "relative", width: 960, height: 560 }}>
      <div style={{ position: "absolute", right: 30, top: 140, transform: `scale(${entraChip * pulso})` }}>
        <IconoChip s={290} brillo={absorbidas / 3} />
      </div>
      {etiquetas.map((e, i) => {
        const p = useSpr(m[i], "suave");
        // las tres quedan legibles y vuelan juntas al chip 0.5 s después de la última
        const sale = m[2] + fps * 0.5 + i * 2;
        const vuela = interpolate(frame, [sale, sale + fps * 0.35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.inOut });
        const y0 = 70 + i * 160;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: interpolate(vuela, [0, 1], [10, 640]),
              top: interpolate(vuela, [0, 1], [y0, 260]),
              opacity: Math.min(p, 1 - vuela * 0.95),
              transform: `scale(${interpolate(p, [0, 1], [0.8, 1]) * interpolate(vuela, [0, 1], [1, 0.4])})`,
              transformOrigin: "left center",
            }}
          >
            <Pildora tono="negro" style={{ fontSize: 42, padding: "16px 34px" }}>
              {e}
            </Pildora>
          </div>
        );
      })}
      {/* rastro hacia el chip */}
      <svg width={960} height={560} style={{ position: "absolute", inset: 0 }}>
        <path d="M560 310 H640" stroke={O} strokeWidth={8} strokeLinecap="round" strokeDasharray="6 16" strokeDashoffset={-frame * 3} opacity={absorbidas ? 1 : 0.3} />
      </svg>
    </div>
  );
};

// ───────────────────────── B8 · Misma temperatura, menos energía + gráfica real ─────────────────────────
const Resultado: React.FC<P> = ({ m }) => {
  const g = useSpr(m[1] ?? 20, "golpe");
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
      <Aparece en={m[0]}>
        <Tarjeta style={{ width: 920, padding: "30px 40px", textAlign: "center" }}>
          <H size={64}>
            Misma temperatura,{" "}
            <span style={{ color: O, display: "inline-block", transform: `scale(${golpe(g)})` }}>menos energía</span>
          </H>
        </Tarjeta>
      </Aparece>
      <Aparece en={m[2] ?? 30}>
        <div style={{ width: 860, background: W, border: theme.card.border, borderRadius: 22, overflow: "hidden", position: "relative" }}>
          <Img src={staticFile("reels/google-deepmind/pue_chart.png")} style={{ width: "100%", display: "block" }} />
        </div>
      </Aparece>
    </div>
  );
};

// ───────────────────────── B9 · Mismas máquinas · Mismos sensores ─────────────────────────
const Mismas: React.FC<P> = ({ m }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
    {[
      ["Mismas máquinas", <IconoBomba key="a" s={130} />],
      ["Mismos sensores", <IconoTorre key="b" s={130} />],
    ].map(([t, ic], i) => (
      <Aparece key={i} en={m[i]} style={{ display: "flex", alignItems: "center", gap: 34 }}>
        <div style={{ filter: "grayscale(1)", opacity: 0.85 }}>{ic}</div>
        <H size={84} c={G} style={{ whiteSpace: "nowrap" }}>
          {t}
        </H>
      </Aparece>
    ))}
  </div>
);

// ───────────────────────── B11a · No necesitas ser Google ─────────────────────────
const NoGoogle: React.FC<P> = ({ m }) => {
  const g = useSpr(m[1] ?? 10, "golpe");
  return (
    <Tarjeta style={{ width: 900, padding: "56px 60px", display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
      <Aparece en={m[0]}>
        <H size={84}>No necesitas ser</H>
      </Aparece>
      <div style={{ opacity: Math.min(1, g * 1.4), transform: `scale(${interpolate(g, [0, 1], [1.4, 1])})` }}>
        <Img src={staticFile("reels/google-deepmind/google_logo.svg")} style={{ height: 150 }} />
      </div>
    </Tarjeta>
  );
};

// ───────────────────────── B11b · Compresores · hornos · refrigeración (stock real) ─────────────────────────
const Montaje: React.FC<P> = ({ m, src, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tramos = [
    { label: "Compresores", icono: <IconoCompresor s={64} /> },
    { label: "Hornos", icono: <IconoHorno s={64} /> },
    { label: "Refrigeración", icono: <IconoRefri s={64} /> },
  ];
  const cortes = [0, m[1], m[2], dur];
  const k = cortes.findIndex((c, i) => frame >= c && frame < cortes[i + 1]);
  return (
    <div style={{ width: 960, height: 600, borderRadius: theme.card.radius, border: theme.card.border, overflow: "hidden", position: "relative", background: N }}>
      {tramos.map((_, i) => (
        <Sequence key={i} from={cortes[i]} durationInFrames={cortes[i + 1] - cortes[i]} layout="none">
          <OffthreadVideo src={staticFile(src![i])} muted startFrom={Math.round(fps * 1)} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.04 + (frame - cortes[i]) * 0.002})` }} />
        </Sequence>
      ))}
      {/* fila de íconos: se enciende el que dice Manuel */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 24, display: "flex", justifyContent: "center", gap: 16 }}>
        {tramos.map((t, i) => {
          const on = i <= k;
          const act = i === k;
          const p = spring({ frame: frame - cortes[i], fps, config: theme.spring.golpe });
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: act ? O : W,
                border: `3px solid ${N}`,
                borderRadius: 999,
                padding: "6px 22px 6px 10px",
                opacity: on ? 1 : 0.0,
                transform: `scale(${act ? golpe(p) : 0.92})`,
              }}
            >
              <div style={{ background: W, borderRadius: 999, display: "flex" }}>{t.icono}</div>
              <span style={{ fontFamily: font.texto, fontWeight: 600, fontSize: 34, color: act ? W : N }}>{t.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ───────────────────────── B12 · 12 recibos → gráfica de 12 meses con dos picos ─────────────────────────
// Datos FICTICIOS (ejemplo): consumo mensual en kWh.
const MESES = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const CONSUMO = [52, 50, 58, 66, 96, 70, 64, 92, 62, 56, 50, 54];
const PICOS = [4, 7];

const Recibos: React.FC<P> = ({ m }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [mInicio, mRecibos, mGrafica, mPicos, mPorQue] = m;
  const aGrafica = interpolate(frame, [mGrafica, mGrafica + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.inOut });
  const cabecera = useSpr(mInicio, "golpe");
  return (
    <div style={{ position: "relative", width: 960, height: 620 }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 5, display: "flex", justifyContent: "center", gap: 16, transform: `scale(${golpe(cabecera)})`, opacity: Math.min(1, cabecera * 1.5) }}>
        <Pildora tono="negro" style={{ fontSize: 40 }}>
          Empieza por esto
        </Pildora>
        <Pildora style={{ fontSize: 40, opacity: interpolate(frame, [mRecibos, mRecibos + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          12 recibos de luz
        </Pildora>
      </div>
      {/* recibos que se apilan */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 110, height: 500, overflow: "hidden", opacity: 1 - aGrafica, transform: `scale(${1 - aGrafica * 0.2})` }}>
        {MESES.map((_, i) => {
          const p = spring({ frame: frame - (mRecibos + i * 2), fps, config: theme.spring.rapido });
          const rot = (random(`rot${i}`) - 0.5) * 16;
          const dx = (random(`dx${i}`) - 0.5) * 120;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 480 - 130 + dx,
                top: 40 - i * 3,
                width: 260,
                height: 360,
                background: W,
                border: `3px solid ${N}`,
                borderRadius: 16,
                opacity: Math.min(1, p * 2),
                transform: `translateY(${interpolate(p, [0, 1], [-420, 0])}px) rotate(${rot}deg)`,
                padding: 22,
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <svg width="36" height="36" viewBox="0 0 24 24">
                  <path d="M13 2 L4 14 H11 L10 22 L20 9 H13 Z" fill={O} stroke={N} strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
                <span style={{ fontFamily: font.texto, fontWeight: 600, fontSize: 24, color: N }}>Recibo de luz</span>
              </div>
              <div style={{ height: 10, background: color.verde, borderRadius: 6 }} />
              <div style={{ height: 10, width: "70%", background: color.verde, borderRadius: 6 }} />
              <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 44, color: N, marginTop: 10 }}>Mes {i + 1}</div>
              <div style={{ height: 10, width: "85%", background: color.verde, borderRadius: 6 }} />
              <div style={{ height: 10, width: "55%", background: color.verde, borderRadius: 6 }} />
            </div>
          );
        })}
      </div>
      {/* gráfica de 12 meses */}
      <div style={{ position: "absolute", left: 30, right: 30, top: 100, height: 500, opacity: aGrafica, transform: `translateY(${(1 - aGrafica) * 30}px)` }}>
        <Tarjeta style={{ width: "100%", height: "100%", padding: "28px 34px 18px", position: "relative" }}>
          <div style={{ position: "absolute", left: 34, right: 34, bottom: 70, top: 40, display: "flex", alignItems: "flex-end", gap: 14 }}>
            {CONSUMO.map((v, i) => {
              const crece = interpolate(frame, [mGrafica + 4 + i * 1.2, mGrafica + 14 + i * 1.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.out });
              const pico = PICOS.includes(i);
              const enc = pico ? interpolate(frame, [mPicos, mPicos + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
              const gp = pico ? spring({ frame: frame - mPicos, fps, config: theme.spring.golpe }) : 0;
              return (
                <div key={i} style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", position: "relative" }}>
                  {pico ? (
                    <div style={{ position: "absolute", bottom: `${v * crece + 2}%`, opacity: enc, transform: `scale(${golpe(gp)})`, fontFamily: font.titulo, fontWeight: 700, fontSize: 40, color: O }}>▲</div>
                  ) : null}
                  <div
                    style={{
                      width: "100%",
                      height: `${v * crece * 0.9}%`,
                      background: enc > 0.5 ? O : G,
                      border: `3px solid ${N}`,
                      borderBottom: "none",
                      borderRadius: "10px 10px 0 0",
                      boxSizing: "border-box",
                      opacity: pico ? 1 : 1 - 0.45 * interpolate(frame, [mPicos, mPicos + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div style={{ position: "absolute", left: 34, right: 34, bottom: 66, height: 4, background: N }} />
          <div style={{ position: "absolute", left: 34, right: 34, bottom: 18, display: "flex", gap: 14 }}>
            {MESES.map((x, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center", fontFamily: font.texto, fontWeight: 600, fontSize: 30, color: PICOS.includes(i) && frame > mPicos ? O : N }}>
                {x}
              </div>
            ))}
          </div>
          <div style={{ position: "absolute", right: 30, top: 22 }}>
            <Aparece en={mPorQue}>
              <Pildora style={{ fontSize: 40 }}>¿Por qué?</Pildora>
            </Aparece>
          </div>
        </Tarjeta>
      </div>
    </div>
  );
};

export const ANIMACIONES: Record<string, React.FC<P>> = {
  termometro: Termometro,
  carrito: Carrito,
  servidores: Servidores,
  enfriamiento: Enfriamiento,
  calculadora: Calculadora,
  titular: Titular,
  chip: Chip,
  resultado: Resultado,
  mismas: Mismas,
  nogoogle: NoGoogle,
  montaje: Montaje,
  recibos: Recibos,
};
