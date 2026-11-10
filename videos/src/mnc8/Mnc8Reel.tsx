import React, { createContext, useContext } from "react";
import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { makeCaptions, type Word } from "../mnc/captionsCore";
import { mnc } from "../mnc/mncTheme";
import { Icon } from "../mnc/components/Icons";
import { Sfx, Win, useT, type SfxKind } from "../mnc4/Kit";
import { k8 } from "./k8Theme";
import words from "./words.json";
import europe from "./europe.json";

// "Klarna: IA + personas" — Manuel NoCode reel, split screen (B-roll top, Manuel bottom),
// captions on the boundary. Real logos/pages/headlines appear ONLY as real captures
// (public/mnc8/captures, made by scripts/mnc8-captures.js) with their source underneath;
// everything else is a generic animation. Numbers exactly as in the script.

export const MNC8_FPS = 30;
const SRC = "mnc8/clips/base.mp4";
const CAP = (f: string) => staticFile(`mnc8/captures/${f}`);
const BASE_DUR = 64.6;
const END_HOLD = 1.2;
export const MNC8_TOTAL_F = Math.round((BASE_DUR + END_HOLD) * MNC8_FPS);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const KEYWORDS: string[][] = [
  ["23", "millones"],
  ["dos", "terceras", "partes"],
  ["700", "agentes"],
  ["700", "personas"],
  ["contratar", "humanos"],
  ["otra", "vez"],
  ["en", "partes"],
  ["europa"],
  ["asistente", "de", "ia"],
  ["ejemplo"],
  ["pasó", "algo"],
  ["ahorrar"],
  ["calidad"],
  ["jugada"],
  ["no", "dejó"],
  ["repetitivo"],
  ["difícil"],
  ["quejas"],
  ["casos", "raros"],
  ["molestos"],
  ["humanos"],
  ["importa"],
  ["repite"],
  ["correr", "gente"],
  ["meter", "ia"],
  ["completo"],
];
const { CHUNKS, at } = makeCaptions(words as Word[], KEYWORDS, { maxWords: 5, maxChars: 24, maxMerged: 28 });

// ---------------- timeline ----------------
const T = {
  b2: at("el") - 0.05,
  b4: at("Klarna", 1) - 0.08,
  b3: at("Es", 0, 9) - 0.1,
  b5: at("En", 0, 12) - 0.1,
  b6: at("En", 0, 15.3) - 0.1,
  full2: at("2.3") - 0.08,
  full2end: at("conversaciones,") + 0.25,
  b7: at("dos") - 0.1,
  b8: at("y", 0, 22) - 0.1,
  b9: at("Todo") - 0.1,
  b10: at("El", 0, 28) - 0.1,
  b11: at("y", 0, 33.9) - 0.1,
  b12: at("Pero", 1) - 0.1,
  b13: at("Klarna", 0, 39) - 0.1,
  b14: at("No", 0, 47.5) - 0.1,
  b15: at("Si") - 0.12,
  b16: at("Si", 1) - 0.12,
  end: BASE_DUR + END_HOLD,
};
const FULL: [number, number][] = [
  [0, 1.45],
  [T.full2, T.full2end],
];
// joins of the trimmed take (s on the cut) — the camera alternates framing on each one
const JOINS = [6.355, 12.174, 19.269, 26.12, 37.739, 38.671, 39.849, 45.244, 53.552];

// ---------------- panel (top half, may go full screen) ----------------
const PanelCtx = createContext(960);
const SoloCtx = createContext(false); // separate B-roll files never go full screen
const usePanelH = () => useContext(PanelCtx);
const useFullness = () => {
  const t = useT();
  const solo = useContext(SoloCtx);
  if (solo) return 0;
  let f = 0;
  for (const [a, b] of FULL) {
    const inn = a === 0 ? 1 : interpolate(t, [a, a + 0.28], [0, 1], { easing: k8.ease.out, ...clamp });
    const out = interpolate(t, [b - 0.3, b], [1, 0], { easing: k8.ease.inOut, ...clamp });
    if (t >= a - 0.01 && t < b) f = Math.max(f, Math.min(inn, out));
  }
  return f;
};

const Panel: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useFullness();
  const h = k8.panelH + (1920 - k8.panelH) * f;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: h, background: k8.c.green, overflow: "hidden" }}>
      <PanelCtx.Provider value={h}>{children}</PanelCtx.Provider>
    </div>
  );
};

// spring entrance in absolute seconds + the shared exit of the current <Win>
const usePop = (s: number, kind: keyof typeof mnc.spring = "smooth") => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - Math.round(s * fps), fps, config: mnc.spring[kind] });
};
const Rise: React.FC<{ at: number; style?: React.CSSProperties; dist?: number; kind?: keyof typeof mnc.spring; children: React.ReactNode }> = ({
  at: a,
  style,
  dist = 26,
  kind = "smooth",
  children,
}) => {
  const p = usePop(a, kind);
  return <div style={{ opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * dist}px) scale(${0.95 + 0.05 * p})`, ...style }}>{children}</div>;
};

// content box inside the panel: below the IG top UI, above the footer
const Stage: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 24 }) => {
  const h = usePanelH();
  const bottom = h > 1200 ? 260 : h - k8.footerTop + 20;
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: k8.contentTop, bottom, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap }}>
      {children}
    </div>
  );
};

const Footer: React.FC<{ text: string; at?: number }> = ({ text, at: a = 0 }) => {
  const h = usePanelH();
  const t = useT();
  const o = interpolate(t, [a, a + 0.25], [0, 1], clamp) * interpolate(h, [960, 1100], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: k8.footerTop, textAlign: "center", fontFamily: k8.f.body, fontWeight: k8.w.medium, fontSize: 22, color: k8.c.black, opacity: o * 0.72 }}>
      {text}
    </div>
  );
};

const Title: React.FC<{ children: React.ReactNode; size?: number; color?: string }> = ({ children, size = 76, color = k8.c.black }) => (
  <div style={{ fontFamily: k8.f.title, fontWeight: k8.w.bold, fontSize: size, lineHeight: 1.05, letterSpacing: "-0.02em", color, textAlign: "center" }}>{children}</div>
);
const Body: React.FC<{ children: React.ReactNode; size?: number; color?: string; weight?: number }> = ({ children, size = 34, color = k8.c.black, weight = k8.w.medium }) => (
  <div style={{ fontFamily: k8.f.body, fontWeight: weight, fontSize: size, lineHeight: 1.2, color, textAlign: "center" }}>{children}</div>
);
const O: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={{ color: k8.c.orange }}>{children}</span>;

// a real capture on a white card (flat, hairline border, no shadow blur)
const Shot: React.FC<{ src: string; w: number; style?: React.CSSProperties }> = ({ src, w, style }) => (
  <div style={{ width: w, background: k8.c.white, borderRadius: 18, overflow: "hidden", border: `2px solid ${k8.c.black}`, ...style }}>
    <Img src={CAP(src)} style={{ width: "100%", display: "block" }} />
  </div>
);

// ---------------- B-rolls ----------------
// T1 · B1 — Klarna logo (official SVG from klarna.com), zoom
const B1: React.FC = () => {
  const t = useT();
  const s = interpolate(t, [0, T.b2], [1.0, 1.18]);
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 260, height: 520, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ transform: `scale(${s})` }}>
          <Img src={CAP("klarna_logo.svg")} style={{ width: 560, display: "block" }} />
        </div>
      </div>
      <Footer text="Fuente: logo de klarna.com" />
    </>
  );
};

// T1 · B2 — real headline of Klarna's press release (27 feb 2024)
const B2: React.FC = () => {
  const t = useT();
  const s = interpolate(t, [T.b2, T.b4], [1, 1.06]);
  return (
    <>
      <Stage>
        <Rise at={T.b2} kind="snappy" style={{ transform: `scale(${s})` }}>
          <Shot src="b2_klarna_press.png" w={760} />
        </Rise>
        <Rise at={at("700") - 0.1}>
          <Body size={30}>Comunicado de prensa de Klarna</Body>
        </Rise>
      </Stage>
      <Footer text="Fuente: Klarna, 27 feb 2024 · klarna.com" />
    </>
  );
};

// T2 · B4 — Europe map (generic), pulsing dot on Sweden
const B4: React.FC = () => {
  const t = useT();
  const p = usePop(T.b4 + 0.05);
  const dotP = usePop(at("Europa.") - 0.6, "pop");
  const pulse = ((t - T.b4) % 1.1) / 1.1;
  const scale = 0.75;
  const [sx, sy] = europe.sweden as [number, number];
  return (
    <>
      <div style={{ position: "absolute", left: (1080 - europe.w * scale) / 2, top: 175, width: europe.w * scale, height: europe.h * scale, opacity: p, borderRadius: 18, overflow: "hidden", border: `2px solid ${k8.c.black}`, background: k8.c.green }}>
        <svg viewBox={`0 0 ${europe.w} ${europe.h}`} width="100%" height="100%">
          {europe.countries.map((c) => (
            <path key={c.n} d={c.d} fill={c.n === "Sweden" ? k8.c.orange : k8.c.white} stroke={k8.c.black} strokeWidth={0.9} strokeLinejoin="round" opacity={c.n === "Sweden" ? dotP : 1} />
          ))}
          {c(sx, sy, pulse, dotP)}
        </svg>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", justifyContent: "center" }}>
        <Rise at={at("Europa.") - 0.45} kind="pop">
          <div style={{ background: k8.c.black, color: k8.c.white, borderRadius: 999, padding: "12px 30px", fontFamily: k8.f.body, fontWeight: k8.w.semibold, fontSize: 36 }}>
            Klarna · <span style={{ color: k8.c.orange }}>Suecia</span>
          </div>
        </Rise>
      </div>
    </>
  );
};
const c = (x: number, y: number, pulse: number, p: number) => (
  <g opacity={p}>
    <circle cx={x} cy={y} r={10 + pulse * 40} fill="none" stroke={k8.c.orange} strokeWidth={4} opacity={1 - pulse} />
    <circle cx={x} cy={y} r={11} fill={k8.c.black} stroke={k8.c.white} strokeWidth={3} />
  </g>
);

// T2 · B3 — klarna.com (México) scrolled to "pagar en 4 plazos" (real full-page capture)
const B3: React.FC = () => {
  const t = useT();
  const W = 880;
  const H = 600;
  const y = interpolate(t, [T.b3 + 0.2, at("partes.") - 0.1], [0, 640], { easing: k8.ease.inOut, ...clamp });
  const p = usePop(T.b3);
  return (
    <>
      <div style={{ position: "absolute", left: (1080 - W) / 2, top: 200, width: W, height: H, borderRadius: 18, overflow: "hidden", border: `2px solid ${k8.c.black}`, background: k8.c.white, opacity: p }}>
        <Img src={CAP("b3_klarna_mx.png")} style={{ width: W, display: "block", transform: `translateY(${-y}px)` }} />
      </div>
      <Footer text="Fuente: klarna.com/mx" />
    </>
  );
};

// T3 · B5 — chat bubbles (generic) + "asistente de IA"
const Bubble: React.FC<{ at: number; right?: boolean; lines: number[] }> = ({ at: a, right, lines }) => (
  <Rise at={a} kind="pop" dist={18} style={{ alignSelf: right ? "flex-end" : "flex-start" }}>
    <div
      style={{
        background: right ? k8.c.black : k8.c.white,
        border: `2px solid ${k8.c.black}`,
        borderRadius: 26,
        borderBottomRightRadius: right ? 6 : 26,
        borderBottomLeftRadius: right ? 26 : 6,
        padding: "20px 26px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {lines.map((w, i) => (
        <div key={i} style={{ width: w, height: 14, borderRadius: 7, background: right ? k8.c.white : k8.c.black, opacity: right ? 0.85 : 0.22 }} />
      ))}
    </div>
  </Rise>
);
const B5: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 140, right: 140, top: 210, display: "flex", flexDirection: "column", gap: 16 }}>
      <Bubble at={T.b5 + 0.05} right lines={[300, 200]} />
      <Bubble at={at("anunciaron") + 0.1} lines={[380, 320, 240]} />
      <Bubble at={at("asistente") - 0.1} right lines={[260]} />
      <Bubble at={at("IA.") - 0.1} lines={[340, 280]} />
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", justifyContent: "center", gap: 14 }}>
      <Rise at={at("asistente") - 0.1} kind="pop">
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: k8.c.orange, color: k8.c.white, borderRadius: 999, padding: "12px 28px", fontFamily: k8.f.body, fontWeight: k8.w.semibold, fontSize: 34 }}>
          <div style={{ width: 34, height: 34 }}>{Icon.chat}</div>
          Asistente de IA
        </div>
      </Rise>
      <Rise at={at("febrero") - 0.05} kind="pop">
        <div style={{ background: k8.c.black, color: k8.c.white, borderRadius: 999, padding: "12px 28px", fontFamily: k8.f.body, fontWeight: k8.w.semibold, fontSize: 34 }}>Feb 2024</div>
      </Rise>
    </div>
  </>
);

// T3 · B6 — "2.3 millones" counting up (full screen for ~1.4 s)
const B6: React.FC = () => {
  const t = useT();
  const v = interpolate(t, [T.b6 + 0.3, at("millones") + 0.1], [0, 2.3], { easing: k8.ease.out, ...clamp });
  const h = usePanelH();
  const size = interpolate(h, [960, 1920], [170, 230]);
  return (
    <>
      <Stage gap={8}>
        <Rise at={T.b6 + 0.05}>
          <Body size={36} weight={k8.w.semibold}>
            En su primer mes
          </Body>
        </Rise>
        <div style={{ fontFamily: k8.f.title, fontWeight: k8.w.bold, fontSize: size, lineHeight: 1, letterSpacing: "-0.03em", color: k8.c.orange, fontVariantNumeric: "tabular-nums" }}>
          {v.toFixed(1)}
        </div>
        <Title size={size * 0.42}>millones</Title>
        <Rise at={at("conversaciones,") - 0.2}>
          <Body size={36}>conversaciones en un mes</Body>
        </Rise>
      </Stage>
      <Footer text="Fuente: Klarna, 27 feb 2024" />
    </>
  );
};

// T3 · B7 — donut 2/3 orange, "2 de cada 3 chats"
const B7: React.FC = () => {
  const t = useT();
  const fill = interpolate(t, [T.b7 + 0.15, at("partes", 0, 19) + 0.3], [0, 2 / 3], { easing: k8.ease.inOut, ...clamp });
  const R = 150;
  const C = 2 * Math.PI * R;
  return (
    <>
      <Stage gap={26}>
        <div style={{ display: "flex", alignItems: "center", gap: 50 }}>
          <svg width={2 * R + 70} height={2 * R + 70} viewBox={`0 0 ${2 * R + 70} ${2 * R + 70}`}>
            <circle cx={R + 35} cy={R + 35} r={R} fill="none" stroke={k8.c.white} strokeWidth={62} />
            <circle
              cx={R + 35}
              cy={R + 35}
              r={R}
              fill="none"
              stroke={k8.c.orange}
              strokeWidth={62}
              strokeDasharray={`${C * fill} ${C}`}
              transform={`rotate(-90 ${R + 35} ${R + 35})`}
            />
            <text x={R + 35} y={R + 58} textAnchor="middle" fontFamily={k8.f.title} fontWeight={700} fontSize={76} fill={k8.c.black}>
              2/3
            </text>
          </svg>
          <Rise at={at("chats") - 0.15} style={{ width: 340 }}>
            <Title size={64}>
              <O>2</O> de cada <O>3</O> chats
            </Title>
            <div style={{ height: 12 }} />
            <Body size={28}>de servicio al cliente</Body>
          </Rise>
        </div>
      </Stage>
      <Footer text="Fuente: Klarna, 27 feb 2024" />
    </>
  );
};

// T3 · B8 — person-icon grid, "= 700 agentes"
const Person: React.FC<{ color: string }> = ({ color }) => (
  <svg width={44} height={52} viewBox="0 0 44 52">
    <circle cx={22} cy={13} r={11} fill={color} />
    <path d="M2 52c0-13 9-22 20-22s20 9 20 22z" fill={color} />
  </svg>
);
const B8: React.FC = () => {
  const t = useT();
  const N = 70;
  const shown = Math.floor(interpolate(t, [T.b8 + 0.1, at("agentes") + 0.1], [0, N], clamp));
  return (
    <>
      <Stage gap={30}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(14, 44px)", gap: "12px 14px" }}>
          {Array.from({ length: N }).map((_, i) => (
            <div key={i} style={{ opacity: i < shown ? 1 : 0.12 }}>
              <Person color={k8.c.black} />
            </div>
          ))}
        </div>
        <Rise at={at("700", 1) - 0.1} kind="pop">
          <Title size={84}>
            = <O>700</O> agentes
          </Title>
        </Rise>
        <Rise at={at("completo.") - 0.1}>
          <Body size={30}>de tiempo completo</Body>
        </Rise>
      </Stage>
      <Footer text="Fuente: Klarna, 27 feb 2024" />
    </>
  );
};

// T4 · B9 — "Pero después pasó algo…" typing out
const Typing: React.FC<{ text: string; from: number; to: number; size: number; color?: string }> = ({ text, from, to, size, color = k8.c.black }) => {
  const t = useT();
  const n = Math.round(interpolate(t, [from, to], [0, text.length], clamp));
  const caret = t >= from && Math.floor(t * 2.4) % 2 === 0;
  return (
    <div style={{ fontFamily: k8.f.title, fontWeight: k8.w.bold, fontSize: size, lineHeight: 1.1, color, textAlign: "center", letterSpacing: "-0.02em" }}>
      {text.slice(0, n)}
      <span style={{ opacity: caret ? 1 : 0, color: k8.c.orange }}>|</span>
    </div>
  );
};
const B9: React.FC = () => {
  const t = useT();
  const pero = at("pero", 0, 27) - 0.05;
  const dim = interpolate(t, [pero - 0.1, pero + 0.2], [1, 0.3], clamp);
  return (
    <Stage gap={36}>
      <Rise at={T.b9 + 0.05} style={{ opacity: dim }}>
        <Body size={40} weight={k8.w.semibold}>
          Todo el mundo lo puso de ejemplo
        </Body>
      </Rise>
      <Typing text="Pero después pasó algo…" from={pero} to={at("algo.") + 0.25} size={80} />
    </Stage>
  );
};

// T4 · B10 — real 2025 headlines stacking (Finextra blocked the capture → quote card)
const QuoteCard: React.FC<{ w: number }> = ({ w }) => (
  <div style={{ width: w, background: k8.c.white, border: `2px solid ${k8.c.black}`, borderRadius: 18, padding: "22px 30px", boxSizing: "border-box", display: "flex", gap: 18 }}>
    <div style={{ fontFamily: k8.f.title, fontWeight: k8.w.bold, fontSize: 90, lineHeight: 0.8, color: k8.c.orange }}>“</div>
    <div>
      <div style={{ fontFamily: k8.f.body, fontWeight: k8.w.semibold, fontSize: 30, lineHeight: 1.2, color: k8.c.black }}>
        Klarna takes foot off AI gas as CEO acknowledges importance of human customer service
      </div>
      <div style={{ marginTop: 8, fontFamily: k8.f.body, fontWeight: k8.w.medium, fontSize: 20, color: k8.c.black, opacity: 0.7 }}>Titular de Finextra (cita)</div>
    </div>
  </div>
);
const B10: React.FC = () => {
  const a1 = T.b10 + 0.05;
  const a2 = at("reconoció") - 0.1;
  const a3 = at("enfocado") - 0.1;
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 185, display: "flex", justifyContent: "center", paddingRight: 110 }}>
        <Rise at={a1} kind="snappy" dist={40} style={{ transform: "rotate(-1.2deg)" }}>
          <Shot src="b10_entrepreneur.png" w={700} />
        </Rise>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 425, display: "flex", justifyContent: "center", paddingLeft: 160 }}>
        <Rise at={a2} kind="snappy" dist={40} style={{ transform: "rotate(1deg)" }}>
          <Shot src="b10_techco.png" w={640} />
        </Rise>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 615, display: "flex", justifyContent: "center" }}>
        <Rise at={a3} kind="snappy" dist={40} style={{ transform: "rotate(-0.6deg)" }}>
          <QuoteCard w={860} />
        </Rise>
      </div>
      <Footer text="Fuentes: Entrepreneur, 9 may 2025 · Tech.co, 20 may 2025 · Finextra" />
    </>
  );
};

// T4 · B11 — headset icon, "contratando personas otra vez"
const Headset: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" stroke={k8.c.black} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 70V58a42 42 0 0 1 84 0v12" />
    <rect x={12} y={64} width={22} height={34} rx={9} fill={k8.c.orange} stroke={k8.c.black} />
    <rect x={86} y={64} width={22} height={34} rx={9} fill={k8.c.orange} stroke={k8.c.black} />
    <path d="M97 98c0 10-10 14-24 14h-9" />
  </svg>
);
const B11: React.FC = () => {
  const t = useT();
  const wob = Math.sin((t - T.b11) * 7) * interpolate(t, [T.b11, T.b11 + 0.8], [6, 0], clamp);
  return (
    <Stage gap={28}>
      <Rise at={T.b11 + 0.05} kind="pop" style={{ transform: `rotate(${wob}deg)` }}>
        <Headset size={230} />
      </Rise>
      <Rise at={at("empezaron") - 0.1}>
        <Title size={62}>
          Contratando personas <O>otra vez</O>
        </Title>
      </Rise>
      <Rise at={at("atención") - 0.1}>
        <Body size={30}>para la atención al cliente</Body>
      </Rise>
    </Stage>
  );
};

// T5 · B12 — "Aquí está la jugada", zoom hit
const B12: React.FC = () => {
  const p = usePop(at("jugada.") - 0.12, "pop");
  const pre = usePop(T.b12 + 0.02);
  return (
    <Stage gap={0}>
      <div style={{ opacity: pre }}>
        <Title size={70}>Aquí está</Title>
      </div>
      <div style={{ transform: `scale(${interpolate(p, [0, 1], [1.8, 1])})`, opacity: Math.min(1, p * 2) }}>
        <Title size={150} color={k8.c.orange}>
          la jugada
        </Title>
      </div>
    </Stage>
  );
};

// T5 · B13 — two columns: IA → lo que se repite / Personas → lo difícil
const Col: React.FC<{ at: number; head: string; dark?: boolean; children: React.ReactNode }> = ({ at: a, head, dark, children }) => (
  <Rise at={a} kind="snappy" style={{ width: 430 }}>
    <div style={{ background: dark ? k8.c.black : k8.c.white, border: `2px solid ${k8.c.black}`, borderRadius: 24, padding: "24px 26px", height: 470, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontFamily: k8.f.title, fontWeight: k8.w.bold, fontSize: 56, color: dark ? k8.c.white : k8.c.orange, lineHeight: 1 }}>{head}</div>
      {children}
    </div>
  </Rise>
);
const Item: React.FC<{ at: number; dark?: boolean; children: React.ReactNode; strong?: boolean }> = ({ at: a, dark, children, strong }) => (
  <Rise at={a} kind="pop" dist={14}>
    <div style={{ fontFamily: k8.f.body, fontWeight: strong ? k8.w.semibold : k8.w.medium, fontSize: 34, lineHeight: 1.2, color: dark ? k8.c.white : k8.c.black, display: "flex", gap: 10 }}>
      <span style={{ color: k8.c.orange }}>→</span>
      <span>{children}</span>
    </div>
  </Rise>
);
const B13: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 0, right: 0, top: 210, display: "flex", justifyContent: "center", gap: 28 }}>
      <Col at={at("La", 0, 40.9) - 0.1} head="IA">
        <Item at={at("repetitivo") - 0.15} strong>
          Preguntas que se repiten
        </Item>
      </Col>
      <Col at={at("personas", 0, 43) - 0.1} head="Personas" dark>
        <Item at={at("difícil.") - 0.1} dark strong>
          Quejas y casos difíciles
        </Item>
        <Item at={at("Quejas,") - 0.05} dark>
          Quejas
        </Item>
        <Item at={at("casos", 0, 45) - 0.05} dark>
          Casos raros
        </Item>
        <Item at={at("clientes", 0, 46) - 0.05} dark>
          Clientes molestos
        </Item>
      </Col>
    </div>
  </>
);

// T5 · B14 — "IA o humanos" → "IA + personas"
const B14: React.FC = () => {
  const t = useT();
  const fue = at("Fue", 0, 49.5) - 0.05;
  const strike = interpolate(t, [at("humanos.", 0, 48) + 0.1, at("humanos.", 0, 48) + 0.4], [0, 1], { easing: k8.ease.out, ...clamp });
  const swap = interpolate(t, [fue, fue + 0.25], [0, 1], { easing: k8.ease.out, ...clamp });
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 230, height: 200, display: "flex", justifyContent: "center", alignItems: "center", opacity: 1 - swap }}>
        <div style={{ position: "relative" }}>
          <Title size={110}>IA o humanos</Title>
          <div style={{ position: "absolute", left: -10, top: "52%", height: 12, width: `${strike * 104}%`, background: k8.c.orange }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 230, height: 200, display: "flex", justifyContent: "center", alignItems: "center", opacity: swap, transform: `scale(${0.9 + 0.1 * swap})` }}>
        <Title size={130}>
          IA <O>+</O> personas
        </Title>
      </div>
      <div style={{ position: "absolute", left: 120, right: 120, top: 500, display: "flex", justifyContent: "space-between" }}>
        <Rise at={at("repite") - 0.15} kind="pop">
          <div style={{ background: k8.c.white, border: `2px solid ${k8.c.black}`, borderRadius: 999, padding: "14px 28px", fontFamily: k8.f.body, fontWeight: k8.w.semibold, fontSize: 32, color: k8.c.black }}>
            <O>IA</O> → lo que se repite
          </div>
        </Rise>
      </div>
      <div style={{ position: "absolute", left: 120, right: 120, top: 610, display: "flex", justifyContent: "flex-end" }}>
        <Rise at={at("importa.") - 0.15} kind="pop">
          <div style={{ background: k8.c.black, borderRadius: 999, padding: "14px 28px", fontFamily: k8.f.body, fontWeight: k8.w.semibold, fontSize: 32, color: k8.c.white }}>
            Personas → <span style={{ color: k8.c.orange }}>lo que importa</span>
          </div>
        </Rise>
      </div>
    </>
  );
};

// T6 · B15 — task checklist ticked with "IA"
const Task: React.FC<{ label: string; show: number; tick: number }> = ({ label, show, tick }) => {
  const p = usePop(tick, "pop");
  return (
    <Rise at={show} dist={16}>
      <div style={{ width: 820, display: "flex", alignItems: "center", gap: 20, background: k8.c.white, border: `2px solid ${k8.c.black}`, borderRadius: 20, padding: "16px 22px", boxSizing: "border-box" }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, border: `3px solid ${k8.c.black}`, display: "flex", alignItems: "center", justifyContent: "center", background: p > 0.05 ? k8.c.orange : k8.c.white }}>
          <div style={{ width: 30, height: 30, color: k8.c.white, transform: `scale(${p})` }}>{Icon.check}</div>
        </div>
        <div style={{ flex: 1, fontFamily: k8.f.body, fontWeight: k8.w.semibold, fontSize: 32, color: k8.c.black }}>{label}</div>
        <div style={{ opacity: p, transform: `scale(${0.6 + 0.4 * p})`, background: k8.c.orange, color: k8.c.white, borderRadius: 999, padding: "6px 18px", fontFamily: k8.f.title, fontWeight: k8.w.bold, fontSize: 28 }}>IA</div>
      </div>
    </Rise>
  );
};
const B15: React.FC = () => {
  const t = useT();
  const no = at("no", 0, 55) - 0.05;
  const empieza = at("Empieza") - 0.05;
  const xOut = interpolate(t, [empieza - 0.1, empieza + 0.15], [1, 0], clamp);
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 205, display: "flex", justifyContent: "center", height: 80, alignItems: "center" }}>
        <Rise at={no} kind="pop" style={{ opacity: xOut, position: "absolute" }}>
          <div style={{ position: "relative", fontFamily: k8.f.title, fontWeight: k8.w.bold, fontSize: 56, color: k8.c.black }}>
            ✕ Correr gente
            <div style={{ position: "absolute", left: -8, right: -8, top: "50%", height: 8, background: k8.c.orange }} />
          </div>
        </Rise>
        <div style={{ position: "absolute", opacity: 1 - xOut }}>
          <Title size={56}>
            Empieza por <O>lo repetitivo</O>
          </Title>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 320, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <Task label="Contestar preguntas frecuentes" show={T.b15 + 0.1} tick={empieza + 0.15} />
        <Task label="Dar seguimiento a pedidos" show={T.b15 + 0.35} tick={at("quitarle") + 0.05} />
        <Task label="Capturar datos a mano" show={T.b15 + 0.6} tick={at("equipo") + 0.05} />
        <Task label="Agendar citas" show={T.b15 + 0.85} tick={at("repetitivo.", 0, 58) + 0.05} />
      </div>
    </>
  );
};

// T6 · B16 — fixed closing phrase, full screen
const B16: React.FC = () => {
  const t = useT();
  const p = interpolate(t, [T.b16, T.b16 + 0.3], [0, 1], { easing: k8.ease.out, ...clamp });
  const ws = "Si todavía no sabes cómo implementar IA en tu negocio, esta cuenta es para ti.".split(" ");
  const W = (words as Word[]).filter((w) => w.s >= T.b16 - 0.05);
  return (
    <AbsoluteFill style={{ background: k8.c.green, opacity: p, justifyContent: "center", alignItems: "center", padding: "0 96px" }}>
      <div style={{ fontFamily: k8.f.title, fontWeight: k8.w.bold, fontSize: 92, lineHeight: 1.08, letterSpacing: "-0.02em", color: k8.c.black, textAlign: "center", textWrap: "balance", marginTop: -80 }}>
        {ws.map((w, i) => {
          const s = W[i]?.s ?? T.b16;
          const o = interpolate(t, [s - 0.08, s + 0.06], [0.18, 1], clamp);
          return (
            <React.Fragment key={i}>
              <span style={{ color: w === "IA" ? k8.c.orange : undefined, opacity: o }}>{w}</span>{" "}
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------- Manuel (bottom half) ----------------
const Manuel: React.FC = () => {
  const t = useT();
  // the 1080×1920 take is shown from y 580 (hair room) — face in the middle of the lower half
  const k = JOINS.filter((j) => t >= j).length;
  const s = k % 2 === 1 ? 1.12 : 1;
  return (
    <div style={{ position: "absolute", left: 0, top: 960, width: 1080, height: 960, overflow: "hidden", background: k8.c.black }}>
      <div style={{ position: "absolute", left: 0, top: -580, width: 1080, height: 1920, transform: `scale(${s})`, transformOrigin: "540px 1000px" }}>
        <OffthreadVideo src={staticFile(SRC)} muted style={{ width: 1080, height: 1920 }} />
      </div>
    </div>
  );
};

// ---------------- captions on the boundary ----------------
const HIDE: [number, number][] = [...FULL.slice(1), [T.b16 - 0.05, T.end]];
const BoundaryCaptions: React.FC = () => {
  const t = useT();
  const c = CHUNKS.find((x) => t >= x.from && t < x.to);
  if (!c || HIDE.some(([a, b]) => t >= a && t < b)) return null;
  const p = interpolate(t - c.from, [0, 0.14], [0, 1], { easing: k8.ease.out, ...clamp });
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 960, display: "flex", justifyContent: "center", transform: "translateY(-50%)" }}>
      <div
        style={{
          maxWidth: 940,
          background: k8.c.black,
          borderRadius: 20,
          padding: "12px 30px 16px",
          textAlign: "center",
          textWrap: "balance",
          fontFamily: k8.f.body,
          fontWeight: k8.w.bold,
          fontSize: 64,
          lineHeight: 1.12,
          color: k8.c.white,
          opacity: p,
          transform: `scale(${0.92 + 0.08 * p})`,
        }}
      >
        {c.words.map((w, i) => (
          <React.Fragment key={i}>
            <span style={{ color: w.hl ? k8.c.orange : undefined }}>{w.w}</span>
            {i < c.words.length - 1 ? " " : null}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// ---------------- sound ----------------
const SFX = (): [number, SfxKind][] => [
  [0.05, "pop"],
  [T.b2, "whoosh"],
  [T.b4, "swoosh-soft"],
  [at("Europa.") - 0.6, "pop"],
  [T.b3, "whoosh"],
  [T.b5, "swoosh-soft"],
  [at("asistente") - 0.1, "pop"],
  [T.b6, "whoosh"],
  [at("millones") + 0.1, "pop"],
  [T.b7, "swoosh-soft"],
  [T.b8, "swoosh-soft"],
  [at("700", 1) - 0.1, "pop"],
  [T.b9, "whoosh"],
  [T.b10, "click"],
  [at("reconoció") - 0.1, "click"],
  [at("enfocado") - 0.1, "click"],
  [T.b11, "whoosh"],
  [at("jugada.") - 0.12, "pop"],
  [T.b13, "whoosh"],
  [at("personas", 0, 43) - 0.1, "click"],
  [T.b14, "swoosh-soft"],
  [at("Fue", 0, 49.5) - 0.05, "pop"],
  [T.b15, "whoosh"],
  [at("Empieza") + 0.1, "tick"],
  [at("quitarle") + 0.05, "tick"],
  [at("equipo") + 0.05, "tick"],
  [at("repetitivo.", 0, 58) + 0.05, "tick"],
  [T.b16, "whoosh"],
];

// ---------------- composition ----------------
const ROLLS: [number, number, React.FC][] = [
  [0, T.b2, B1],
  [T.b2, T.b4, B2],
  [T.b4, T.b3, B4],
  [T.b3, T.b5, B3],
  [T.b5, T.b6, B5],
  [T.b6, T.b7, B6],
  [T.b7, T.b8, B7],
  [T.b8, T.b9, B8],
  [T.b9, T.b10, B9],
  [T.b10, T.b11, B10],
  [T.b11, T.b12, B11],
  [T.b12, T.b13, B12],
  [T.b13, T.b14, B13],
  [T.b14, T.b15, B14],
  [T.b15, T.b16, B15],
];

// one B-roll alone (for the separate B-roll files): same panel, no Manuel, no captions
export const Mnc8Broll: React.FC<{ i: number }> = ({ i }) => {
  const [from, to, C] = ROLLS[i];
  return (
    <AbsoluteFill style={{ background: k8.c.green }}>
      <SoloCtx.Provider value>
        <Panel>
          <Win from={from} to={to}>
            <C />
          </Win>
        </Panel>
      </SoloCtx.Provider>
    </AbsoluteFill>
  );
};
export const ROLL_TIMES = ROLLS.map(([a, b]) => [a, b] as [number, number]);
export const CLOSING_FROM = T.b16;

export const Mnc8Reel: React.FC = () => (
  <AbsoluteFill style={{ background: k8.c.black }}>
    <Audio src={staticFile(SRC)} />
    <Manuel />
    <Panel>
      {ROLLS.map(([a, b, C], i) => (
        <Win key={i} from={a} to={b}>
          <C />
        </Win>
      ))}
    </Panel>
    <BoundaryCaptions />
    <Win from={T.b16} to={T.end}>
      <B16 />
    </Win>
    <Sfx cues={SFX()} />
  </AbsoluteFill>
);
