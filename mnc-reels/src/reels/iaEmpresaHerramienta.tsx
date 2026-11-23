// Reel "La IA en una empresa: no empieces por la herramienta" (B1–B11; B12 es el golpe "pregunta").
// Todo son animaciones propias, colores planos MNC, sin logos de herramientas reales.
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { Check, Pildora, Tarjeta } from "../components/Base";
import type { CustomProps } from "./index";

const { color, font } = theme;
const N = color.negro;
const O = color.naranja;
const G = color.gris;
const W = color.blanco;

// Progreso de resorte desde el cuadro `at`
const useP = (at: number | undefined, preset: keyof typeof theme.spring = "suave") => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - (at ?? 0), fps, config: theme.spring[preset] });
};

const aparece = (p: number, dy = 30, s0 = 0.9): React.CSSProperties => ({
  opacity: Math.min(1, p * 1.3),
  transform: `translateY(${interpolate(p, [0, 1], [dy, 0])}px) scale(${interpolate(p, [0, 1], [s0, 1])})`,
});

const T: React.FC<{ size?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ size = 72, children, style }) => (
  <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: size, lineHeight: 1.08, color: N, textAlign: "center", ...style }}>{children}</div>
);
const Txt: React.FC<{ size?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ size = 40, children, style }) => (
  <div style={{ fontFamily: font.texto, fontWeight: 600, fontSize: size, lineHeight: 1.25, color: N, textAlign: "center", ...style }}>{children}</div>
);

// Figura de persona: cabeza + torso, trazo negro
export const Persona: React.FC<{ fill: string; size?: number; style?: React.CSSProperties }> = ({ fill, size = 120, style }) => (
  <svg width={size} height={size * 1.3} viewBox="0 0 100 130" style={style}>
    <circle cx="50" cy="32" r="22" fill={fill} stroke={N} strokeWidth="3.5" />
    <path d="M8 130 V104 Q8 64 50 64 Q92 64 92 104 V130 Z" fill={fill} stroke={N} strokeWidth="3.5" strokeLinejoin="round" />
  </svg>
);

// ───────────── B1 · contador +150 proyectos ─────────────
// marcas: [llega a 150, "proyectos", "de IA en empresas"]
const B1: React.FC<CustomProps> = ({ marcas }) => {
  const frame = useCurrentFrame();
  const v = Math.round(interpolate(frame, [2, marcas[0]], [0, 150], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.out }));
  const golpe = useP(marcas[0], "golpe");
  const s = 1 + 0.1 * Math.sin(Math.min(1, golpe) * Math.PI);
  const p1 = useP(marcas[1]);
  const p2 = useP(marcas[2]);
  // cuadritos de proyectos que se llenan con el contador (15 × 10 = 150)
  return (
    <Tarjeta style={{ width: 900, padding: "36px 40px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 200, lineHeight: 1, color: O, transform: `scale(${s})` }}>+{v}</div>
      <T size={70} style={{ marginTop: 6, ...aparece(p1) }}>proyectos</T>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(25, 22px)", gap: 7, marginTop: 26 }}>
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} style={{ width: 22, height: 22, borderRadius: 5, border: `2px solid ${N}`, background: i < v / 3 ? O : W }} />
        ))}
      </div>
      <div style={{ marginTop: 26, ...aparece(p2) }}>
        <Pildora tono="negro">
          de <span style={{ color: O }}>IA</span> en empresas
        </Pildora>
      </div>
    </Tarjeta>
  );
};

// Caja de herramientas genérica
const Caja: React.FC<{ size?: number }> = ({ size = 360 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 240 180">
    {/* llave saliendo */}
    <path d="M150 62 L178 14" stroke={N} strokeWidth="12" strokeLinecap="round" />
    <circle cx="182" cy="10" r="14" fill={W} stroke={N} strokeWidth="4" />
    <rect x="176" y="0" width="12" height="12" fill={W} />
    {/* desarmador */}
    <path d="M78 64 L62 22" stroke={O} strokeWidth="14" strokeLinecap="round" />
    <path d="M62 22 L56 6" stroke={N} strokeWidth="5" strokeLinecap="round" />
    {/* asa */}
    <path d="M86 58 V36 Q86 28 94 28 H146 Q154 28 154 36 V58" fill="none" stroke={N} strokeWidth="8" />
    {/* caja */}
    <rect x="14" y="58" width="212" height="112" rx="16" fill={W} stroke={N} strokeWidth="5" />
    <line x1="14" y1="96" x2="226" y2="96" stroke={N} strokeWidth="5" />
    <rect x="102" y="86" width="36" height="22" rx="5" fill={O} stroke={N} strokeWidth="4" />
  </svg>
);

// X naranja que se dibuja con golpe
const XNaranja: React.FC<{ p: number; size?: number }> = ({ p, size = 340 }) => {
  const d1 = interpolate(p, [0, 0.5], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const d2 = interpolate(p, [0.35, 0.85], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ position: "absolute", transform: `scale(${interpolate(p, [0, 1], [1.5, 1])})`, opacity: p > 0.01 ? 1 : 0 }}>
      {[
        ["M30 30 L170 170", d1],
        ["M170 30 L30 170", d2],
      ].map(([d, o], i) => (
        <React.Fragment key={i}>
          <path d={d as string} stroke={N} strokeWidth="38" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={o as number} />
          <path d={d as string} stroke={O} strokeWidth="26" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={o as number} />
        </React.Fragment>
      ))}
    </svg>
  );
};

// ───────────── B2 · Error #1 + X sobre la caja de herramientas ─────────────
// marcas: ["no es técnico", "empezar", "herramienta"]
const B2: React.FC<CustomProps> = ({ marcas }) => {
  const p0 = useP(0, "golpe");
  const p1 = useP(marcas[0]);
  const p2 = useP(marcas[1]);
  const px = useP(marcas[2], "rapido");
  const frame = useCurrentFrame();
  const tiembla = frame > marcas[2] && frame < marcas[2] + 8 ? Math.sin(frame * 3) * 6 : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
      <div style={{ ...aparece(p0, 20, 1.3), display: "flex", alignItems: "baseline", gap: 20 }}>
        <T size={120}>Error</T>
        <T size={150} style={{ color: O }}>#1</T>
      </div>
      <div style={{ ...aparece(p1), position: "relative" }}>
        <Pildora tono="negro" style={{ background: G, fontSize: 38 }}>no es técnico</Pildora>
        <div style={{ position: "absolute", left: -10, right: -10, top: "50%", height: 6, background: N, transformOrigin: "left", transform: `scaleX(${p1})` }} />
      </div>
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", height: 300, width: 420, transform: `translateX(${tiembla}px)`, ...aparece(p2, 40, 0.8) }}>
        <Caja size={380} />
        <XNaranja p={px} size={330} />
      </div>
    </div>
  );
};

// Globo de chat
const Globo: React.FC<{ texto: string; lado: "izq" | "der"; naranja?: boolean; p: number }> = ({ texto, lado, naranja, p }) => (
  <div style={{ alignSelf: lado === "izq" ? "flex-start" : "flex-end", position: "relative", ...aparece(p, 30, 0.7), transformOrigin: lado === "izq" ? "left bottom" : "right bottom" }}>
    <div
      style={{
        background: naranja ? O : W,
        color: naranja ? W : N,
        border: theme.card.border,
        borderRadius: 40,
        padding: "34px 46px",
        fontFamily: font.titulo,
        fontWeight: 700,
        fontSize: 62,
        lineHeight: 1.1,
        maxWidth: 720,
      }}
    >
      “{texto}”
    </div>
    <svg width="60" height="44" viewBox="0 0 60 44" style={{ position: "absolute", bottom: -38, [lado === "izq" ? "left" : "right"]: 50, transform: lado === "der" ? "scaleX(-1)" : undefined }}>
      <path d="M2 0 L4 40 L44 0" fill={naranja ? O : W} stroke={N} strokeWidth="3" strokeLinejoin="round" />
      <rect x="4" y="0" width="40" height="3.5" fill={naranja ? O : W} />
    </svg>
  </div>
);

// ───────────── B3 · globos "Compramos tal sistema" / "Queremos un chatbot" ─────────────
// marcas: [segundo globo]
const B3: React.FC<CustomProps> = ({ marcas }) => {
  const p1 = useP(2, "golpe");
  const p2 = useP(marcas[0], "golpe");
  return (
    <div style={{ width: 920, display: "flex", flexDirection: "column", gap: 70 }}>
      <Globo texto="Compramos tal sistema" lado="izq" p={p1} />
      <Globo texto="Queremos un chatbot" lado="der" naranja p={p2} />
    </div>
  );
};

// ───────────── B4 · calendario +6 meses → app con telarañas, 0 usuarios ─────────────
// marcas: [empieza a avanzar ("seis"), "nadie"]
const Telarana: React.FC<{ style: React.CSSProperties; p: number }> = ({ style, p }) => (
  <svg width="150" height="150" viewBox="0 0 100 100" style={{ position: "absolute", opacity: p, ...style }}>
    {[0, 22, 45, 68, 90].map((a) => (
      <line key={a} x1="0" y1="0" x2={100 * Math.cos((a * Math.PI) / 180)} y2={100 * Math.sin((a * Math.PI) / 180)} stroke={G} strokeWidth="2" />
    ))}
    {[30, 55, 80].map((r) => (
      <path key={r} d={`M${r} 0 Q${r * 0.75} ${r * 0.3} ${r * 0.7} ${r * 0.7} Q${r * 0.3} ${r * 0.75} 0 ${r}`} fill="none" stroke={G} strokeWidth="2" />
    ))}
  </svg>
);

const B4: React.FC<CustomProps> = ({ marcas }) => {
  const frame = useCurrentFrame();
  const mes = Math.round(interpolate(frame, [marcas[0], marcas[0] + 18], [0, 6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const pc = useP(0, "golpe");
  const pa = useP(marcas[1], "golpe");
  const salida = interpolate(pa, [0, 1], [0, 1]);
  const flip = frame >= marcas[0] && frame < marcas[0] + 20 ? Math.abs(Math.sin(((frame - marcas[0]) / 3.3) * Math.PI)) : 0;
  return (
    <div style={{ position: "relative", width: 960, height: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* calendario */}
      <div style={{ position: "absolute", opacity: 1 - salida, transform: `translateX(${-260 * salida}px) scale(${interpolate(pc, [0, 1], [0.8, 1]) * (1 - 0.35 * salida)})` }}>
        <div style={{ width: 460, borderRadius: 32, border: theme.card.border, background: W, overflow: "hidden" }}>
          <div style={{ background: O, height: 90, borderBottom: theme.card.border, display: "flex", alignItems: "center", justifyContent: "center", gap: 70 }}>
            {[0, 1].map((i) => (
              <div key={i} style={{ width: 22, height: 50, borderRadius: 11, background: N, marginTop: -60 }} />
            ))}
          </div>
          <div style={{ height: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scaleY(${1 - 0.5 * flip})` }}>
            <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 170, lineHeight: 1, color: N }}>+{mes}</div>
            <Txt size={52}>{mes === 1 ? "mes" : "meses"}</Txt>
          </div>
        </div>
      </div>
      {/* app abandonada */}
      <div style={{ position: "absolute", opacity: Math.min(1, pa * 1.3), transform: `scale(${interpolate(pa, [0, 1], [0.7, 1])})` }}>
        <div style={{ position: "relative", width: 640, height: 470, borderRadius: 32, border: theme.card.border, background: W, overflow: "hidden" }}>
          <div style={{ height: 64, background: N, display: "flex", alignItems: "center", padding: "0 28px" }}>
            <div style={{ width: 200, height: 18, borderRadius: 9, background: G }} />
          </div>
          <div style={{ padding: "30px 36px", display: "flex", flexDirection: "column", gap: 18 }}>
            {[420, 340, 380].map((w, i) => (
              <div key={i} style={{ width: w, height: 22, borderRadius: 11, background: color.verde }} />
            ))}
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 44, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 130, lineHeight: 1, color: O }}>0</div>
            <Txt size={50}>usuarios</Txt>
          </div>
          <Telarana p={interpolate(pa, [0.5, 1], [0, 1], { extrapolateLeft: "clamp" })} style={{ right: -4, top: 60, transform: "scaleX(-1)" }} />
          <Telarana p={interpolate(pa, [0.6, 1], [0, 1], { extrapolateLeft: "clamp" })} style={{ left: -4, bottom: -4, transform: "scaleY(-1)" }} />
        </div>
      </div>
    </div>
  );
};

// ───────────── B5 · "Al revés" con flecha que da la vuelta ─────────────
// marcas: ["empieza", "al revés"]
const B5: React.FC<CustomProps> = ({ marcas }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p0 = useP(2);
  const p1 = useP(marcas[0]);
  const draw = interpolate(frame, [marcas[0], marcas[1] + 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.inOut });
  const pr = useP(marcas[1], "golpe");
  const giro = spring({ frame: frame - marcas[1], fps, config: theme.spring.suave });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Txt size={50} style={{ color: G, ...aparece(p0) }}>
        Lo que funciona…
      </Txt>
      <div style={{ transform: `perspective(900px) rotateY(${interpolate(giro, [0, 1], [180, 0])}deg) scale(${interpolate(pr, [0, 1], [0.6, 1])})`, opacity: pr > 0.02 ? 1 : 0, marginTop: 18 }}>
        <T size={104}>
          empieza <span style={{ color: O }}>al revés</span>
        </T>
      </div>
      <svg width="900" height="270" viewBox="0 0 900 270" style={{ marginTop: 10, ...aparece(p1, 20, 0.95) }}>
        <path d="M130 220 H640 Q790 220 790 140 Q790 60 640 60 H300" fill="none" stroke={N} strokeWidth="24" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={draw} />
        <path d="M350 10 L285 60 L350 110" fill="none" stroke={O} strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" opacity={draw < 0.05 ? 1 : 0} />
      </svg>
    </div>
  );
};

// ───────────── B6 · 1 Dolor: Cotizar · Cobrar · Capturar pedidos ─────────────
// marcas: ["proceso", "cada semana", "cotizar", "cobrar", "capturar"]
const B6: React.FC<CustomProps> = ({ marcas }) => {
  const p0 = useP(0, "golpe");
  const p1 = useP(marcas[0]);
  const p2 = useP(marcas[1]);
  const tags = ["Cotizar", "Cobrar", "Capturar pedidos"];
  const pt = [useP(marcas[2], "golpe"), useP(marcas[3], "golpe"), useP(marcas[4], "golpe")];
  const dias = ["L", "M", "M", "J", "V"];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24, ...aparece(p0, 20, 1.3) }}>
        {/* rayo de dolor */}
        <svg width="80" height="96" viewBox="0 0 80 96">
          <path d="M46 2 L8 54 H38 L30 94 L72 36 H42 Z" fill={O} stroke={N} strokeWidth="4" strokeLinejoin="round" />
        </svg>
        <T size={110}>Dolor</T>
      </div>
      <Txt size={42} style={aparece(p1)}>
        un proceso que les duele
      </Txt>
      <div style={{ display: "flex", gap: 14, alignItems: "center", ...aparece(p2) }}>
        {dias.map((d, i) => (
          <div key={i} style={{ width: 70, height: 70, borderRadius: 14, border: theme.card.border, background: p2 > 0.5 && i === 0 ? O : W, color: p2 > 0.5 && i === 0 ? W : N, fontFamily: font.texto, fontWeight: 800, fontSize: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {d}
          </div>
        ))}
        <Txt size={36} style={{ marginLeft: 12 }}>cada semana</Txt>
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
        {tags.map((t, i) => (
          <div key={t} style={aparece(pt[i], 26, 0.6)}>
            <Pildora style={{ fontSize: 40, padding: "14px 30px" }}>
              {t}
            </Pildora>
          </div>
        ))}
      </div>
    </div>
  );
};

// ───────────── B7 · 2 Medir con cronómetro ─────────────
// marcas: ["midan", "cuánto", "hoy"]
const B7: React.FC<CustomProps> = ({ marcas }) => {
  const frame = useCurrentFrame();
  const p0 = useP(0, "golpe");
  const pc = useP(marcas[0], "golpe");
  const pq = useP(marcas[1]);
  const ph = useP(marcas[2], "golpe");
  const corre = Math.max(0, frame - marcas[0]);
  const ang = corre * 9; // la aguja gira
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 50 }}>
      <div style={{ ...aparece(pc, 20, 0.6) }}>
        <svg width="330" height="370" viewBox="0 0 200 224">
          <rect x="84" y="2" width="32" height="22" rx="5" fill={O} stroke={N} strokeWidth="5" />
          <path d="M160 52 L176 36" stroke={N} strokeWidth="10" strokeLinecap="round" />
          <circle cx="100" cy="128" r="90" fill={W} stroke={N} strokeWidth="7" />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * Math.PI) / 6;
            return <line key={i} x1={100 + 72 * Math.sin(a)} y1={128 - 72 * Math.cos(a)} x2={100 + 82 * Math.sin(a)} y2={128 - 82 * Math.cos(a)} stroke={N} strokeWidth={i % 3 === 0 ? 6 : 3} strokeLinecap="round" />;
          })}
          <path d={`M100 128 L${100 + 64 * Math.sin((ang * Math.PI) / 180)} ${128 - 64 * Math.cos((ang * Math.PI) / 180)}`} stroke={O} strokeWidth="8" strokeLinecap="round" />
          <circle cx="100" cy="128" r="10" fill={N} />
        </svg>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 22 }}>
        <T size={110} style={{ textAlign: "left", ...aparece(p0, 20, 1.3) }}>Medir</T>
        <Txt size={46} style={{ textAlign: "left", ...aparece(pq) }}>
          ¿Cuánto tiempo
          <br />
          les toma?
        </Txt>
        <div style={aparece(ph, 20, 0.6)}>
          <Pildora style={{ fontSize: 44 }}>Hoy</Pildora>
        </div>
      </div>
    </div>
  );
};

// ───────────── B8 · 3 Herramienta: una sola persona la prueba antes que el equipo ─────────────
// marcas: ["buscan", "construyen", "prueban", "una sola persona", "dársela a todos"]
const B8: React.FC<CustomProps> = ({ marcas }) => {
  const frame = useCurrentFrame();
  const p0 = useP(0, "golpe");
  const pb = useP(marcas[0], "golpe");
  const pc = useP(marcas[1], "golpe");
  const pf = useP(marcas[2]);
  const p1 = useP(marcas[3], "golpe");
  const pt = useP(marcas[4]);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
        <T size={96} style={aparece(p0, 20, 1.3)}>Herramienta</T>
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <div style={aparece(pb, 20, 0.6)}>
          <Pildora tono="negro">búscala</Pildora>
        </div>
        <Txt size={38} style={{ ...aparece(pc), color: G }}>
          o
        </Txt>
        <div style={aparece(pc, 20, 0.6)}>
          <Pildora tono="negro">constrúyela</Pildora>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 18, marginTop: 6, ...aparece(pf, 30, 0.9) }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", transform: `translateY(${-14 * p1}px) scale(${1 + 0.12 * p1})`, transformOrigin: "bottom" }}>
          <svg width="70" height="56" viewBox="0 0 70 56" style={{ marginBottom: 4, opacity: p1 }}>
            <rect x="3" y="3" width="64" height="44" rx="8" fill={W} stroke={N} strokeWidth="4" />
            <rect x="14" y="14" width="42" height="8" rx="4" fill={O} />
            <rect x="14" y="28" width="28" height="8" rx="4" fill={G} />
          </svg>
          <Persona fill={O} size={96} />
        </div>
        <div style={{ width: 4, height: 120, background: N, borderRadius: 2, marginBottom: 6, opacity: 1 - pt }} />
        {[0, 1, 2, 3].map((i) => {
          const pi = spring({ frame: frame - marcas[4] - i * 3, fps: 30, config: theme.spring.golpe });
          return (
            <div key={i} style={{ position: "relative" }}>
              <Persona fill={pi > 0.5 ? O : G} size={84} style={{ opacity: 0.55 + 0.45 * pi }} />
              <div style={{ position: "absolute", top: -8, right: -10 }}>
                <Check size={44} p={pi} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={aparece(p1, 20, 0.8)}>
        <Pildora style={{ fontSize: 38 }}>{pt > 0.5 ? "…y luego a todos" : "Prueba con 1 persona"}</Pildora>
      </div>
    </div>
  );
};

// ───────────── B9 · "Sistemas" (gris) vs "Quien lo hace todos los días" (naranja) ─────────────
// marcas: ["quien más sabe", "casi nunca", "es quien lo hace"]
const B9: React.FC<CustomProps> = ({ marcas }) => {
  const p0 = useP(0, "golpe");
  const pq = useP(marcas[0]);
  const ps = useP(marcas[1], "golpe");
  const po = useP(marcas[2], "golpe");
  const Lado: React.FC<{ p: number; fill: string; label: React.ReactNode; marca: React.ReactNode; fondo: string }> = ({ p, fill, label, marca, fondo }) => (
    <div style={{ ...aparece(p, 30, 0.7), width: 430, height: 360, borderRadius: 28, border: theme.card.border, background: fondo, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", padding: "0 20px 26px", boxSizing: "border-box", position: "relative" }}>
      <div style={{ position: "absolute", top: 18, right: 18 }}>{marca}</div>
      <Persona fill={fill} size={120} />
      <div style={{ marginTop: 14, minHeight: 100, display: "flex", alignItems: "center" }}>{label}</div>
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
      <div style={aparece(p0, 20, 1.3)}>
        <Pildora style={{ fontSize: 40 }}>Esto es importante</Pildora>
      </div>
      <T size={60} style={aparece(pq)}>
        ¿Quién sabe más del <span style={{ color: O }}>proceso</span>?
      </T>
      <div style={{ display: "flex", gap: 28 }}>
        <Lado
          p={ps}
          fill={G}
          fondo={color.verde}
          marca={
            <svg width="48" height="48" viewBox="0 0 48 48">
              <path d="M10 10 L38 38 M38 10 L10 38" stroke={G} strokeWidth="8" strokeLinecap="round" />
            </svg>
          }
          label={<T size={52} style={{ color: G }}>Sistemas</T>}
        />
        <Lado
          p={po}
          fill={O}
          fondo={W}
          marca={<Check size={52} p={po} />}
          label={
            <T size={40} style={{ color: O }}>
              Quien lo hace
              <br />
              todos los días
            </T>
          }
        />
      </div>
    </div>
  );
};

// ───────────── B10 · esa persona se sienta en la mesa · "Desde el día uno" ─────────────
// marcas: ["siéntenlo", "desde el día uno"]
const B10: React.FC<CustomProps> = ({ marcas }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pm = useP(0);
  const sienta = spring({ frame: frame - marcas[0], fps, config: { damping: 16, stiffness: 90, mass: 1 } });
  const pd = useP(marcas[1], "golpe");
  // la persona naranja camina desde la derecha y baja a su lugar
  const x = interpolate(sienta, [0, 1], [330, 0]);
  const y = interpolate(sienta, [0.55, 1], [-40, 0], { extrapolateLeft: "clamp" });
  const brinco = sienta < 0.6 ? -Math.abs(Math.sin(frame / 3)) * 14 : 0;
  const lugares = [-300, -100, 100, 300];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ position: "relative", width: 960, height: 340, ...aparece(pm, 20, 0.95) }}>
        {/* personas sentadas detrás de la mesa */}
        {lugares.map((lx, i) =>
          i === 3 ? (
            <div key={i} style={{ position: "absolute", left: 480 + lx - 60 + x, top: 40 + y + brinco }}>
              <Persona fill={O} size={120} />
            </div>
          ) : (
            <div key={i} style={{ position: "absolute", left: 480 + lx - 55, top: 54 }}>
              <Persona fill={i === 1 ? N : G} size={110} />
            </div>
          ),
        )}
        {/* lugar vacío punteado (se llena) */}
        <div style={{ position: "absolute", left: 480 + 300 - 60, top: 40, width: 120, height: 156, border: `4px dashed ${G}`, borderRadius: 24, opacity: 1 - sienta }} />
        {/* mesa */}
        <div style={{ position: "absolute", left: 60, right: 60, top: 196, height: 46, background: N, borderRadius: 14 }} />
        <div style={{ position: "absolute", left: 120, top: 240, width: 26, height: 96, background: N, borderRadius: 6 }} />
        <div style={{ position: "absolute", right: 120, top: 240, width: 26, height: 96, background: N, borderRadius: 6 }} />
      </div>
      <T size={92} style={aparece(pd, 20, 1.3)}>
        Desde el <span style={{ color: O }}>día uno</span>
      </T>
    </div>
  );
};

// ───────────── B11 · DOLOR → MEDIDA → HERRAMIENTA (en el panel; se completa en el golpe) ─────────────
// marcas: ["dolor", "medida", "herramienta"]
const B11: React.FC<CustomProps> = ({ marcas }) => {
  const items = ["DOLOR", "MEDIDA", "HERRAMIENTA"];
  const ps = [useP(marcas[0], "golpe"), useP(marcas[1], "golpe"), useP(marcas[2], "golpe")];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      {items.map((it, i) => (
        <React.Fragment key={it}>
          {i > 0 ? (
            <svg width="60" height="60" viewBox="0 0 90 90" style={{ opacity: ps[i] }}>
              <path d="M45 8 V70 M20 48 L45 74 L70 48" fill="none" stroke={O} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : null}
          <div style={{ display: "flex", alignItems: "center", gap: 22, opacity: 0.15 + 0.85 * Math.min(1, ps[i] * 1.3), transform: `scale(${interpolate(ps[i], [0, 1], [0.85, 1])})` }}>
            <div style={{ width: 76, height: 76, borderRadius: 18, background: ps[i] > 0.3 ? O : G, border: theme.card.border, color: W, fontFamily: font.titulo, fontWeight: 700, fontSize: 46, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
            <T size={112}>{it}</T>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export const IA_EMPRESA_HERRAMIENTA: Record<string, React.FC<CustomProps>> = {
  "iaemp-B1": B1,
  "iaemp-B2": B2,
  "iaemp-B3": B3,
  "iaemp-B4": B4,
  "iaemp-B5": B5,
  "iaemp-B6": B6,
  "iaemp-B7": B7,
  "iaemp-B8": B8,
  "iaemp-B9": B9,
  "iaemp-B10": B10,
  "iaemp-B11": B11,
};
