import React, { createContext, useContext } from "react";
import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { makeCaptions, type Word } from "../mnc/captionsCore";
import { mnc } from "../mnc/mncTheme";
import { Sfx, Win, useT, type SfxKind } from "../mnc4/Kit";
import { k9 } from "../mnc9/k9Theme";
import words from "./words.json";

// "Grok Bot: un agente con su propia computadora" — Manuel NoCode reel on the Mnc11 structure (fading top
// panel, Mnc9 captions/palette/rhythm/SFX). Real xAI material only as real captures with source (x.ai/bot,
// x.ai/news/introducing-grok-bot). Green-screen rule v2: Manuel is cut out ONLY over the two real-people
// Pexels clips (worker at his computer, new employee welcomed); everywhere else he keeps his background.

export const MNC12_FPS = 30;
const SRC = "mnc12/clips/base.mp4";
const MUSIC = "mnc12/audio/music.wav";
const STOCK = (f: string) => staticFile(`mnc12/stock/${f}.mp4`);
const CAP = (f: string) => staticFile(`mnc12/captures/${f}`);
const MNC11_FPS = 30; // helpers shared with Mnc11 use this name
const BASE_DUR = 68.3;
const END_HOLD = 1.2;
export const MNC12_TOTAL_F = Math.round((BASE_DUR + END_HOLD) * MNC12_FPS);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const C = k9.c;
const SRC_XAI = "Fuente: xAI · x.ai/bot";

const KEYWORDS: string[][] = [
  ["agente", "de", "ia"],
  ["chat", "de", "whatsapp"],
  ["grok", "bot"],
  ["propia", "compu"],
  ["navegador"],
  ["herramientas"],
  ["cotización"],
  ["crm"],
  ["paso", "por", "paso"],
  ["por", "código"],
  ["él", "también"],
  ["jugada"],
  ["acceso"],
  ["una", "sola", "tarea"],
  ["empleado", "nuevo"],
  ["del", "chat"],
  ["skills"],
  ["programación"],
  ["haga", "el", "trabajo"],
  ["conteste"],
];
const { CHUNKS, at } = makeCaptions(words as Word[], KEYWORDS, { maxWords: 5, maxChars: 24, maxMerged: 28 });

// ---------------- timeline (s on the trimmed take) ----------------
const T = {
  app: at("es", 0, 2.5) - 0.1, // "es como si tuvieras un chat de WhatsApp con muchas IAs…" → real app view
  b2: at("Se") - 0.1, // "Se llama Grok Bot" → real launch headline
  c1: at("es", 0, 10) - 0.1, // cut-out over a real worker: "es como contratar a alguien que tiene su propia compu"
  b3: at("en", 0, 13) - 0.1, // "en la nube con navegador … herramientas que tú ya usas"
  b5: at("Le", 0, 17) - 0.1,
  b6: at("y", 0, 24.6) - 0.1, // "y lo hace paso por paso en tus propias herramientas"
  b7: at("Lo", 0, 28) - 0.1,
  b8: at("si", 0, 32) - 0.1,
  b9: at("Pero") - 0.1,
  b10: at("no", 0, 37.5) - 0.1,
  c2: at("Como", 0, 44.9) - 0.1, // cut-out over a real new hire being welcomed: "como si fuera un empleado nuevo"
  cfg: at("Para", 0, 47.5) - 0.1, // "Para configurarlo, todo es a través del chat…"
  b11: at("Ya", 0, 58.9) - 0.1,
  close: at("Si", 0, 63) - 0.12,
  end: BASE_DUR + END_HOLD,
};
const FULL: [number, number][] = [[T.b9, T.b10]];
// green-screen beats: [from, to, cutout file, its start (s)] — real people footage only (rule v2)
const CUTOUT: [number, number, string, number][] = [
  [T.c1, T.b3, "compu", 10.1],
  [T.c2, T.cfg, "empleado", 44.7],
];
const SEGS = [10.38, 7.05, 11.23, 7.26, 11.7, 11.54, 9.14];
const JOINS = SEGS.slice(0, -1).map((_, i) => SEGS.slice(0, i + 1).reduce((a, b) => a + b, 0));

const PanelCtx = createContext(960);
const SoloCtx = createContext(false); // separate B-roll files: plain 1080×960 panel
const usePanelH = () => useContext(PanelCtx);
const inWin = <W extends [number, number, ...unknown[]]>(t: number, ws: W[]): W | undefined => ws.find(([a, b]) => t >= a && t < b);
const ramp = (t: number, a: number, b: number, d = 0.25) =>
  Math.min(interpolate(t, [a, a + d], [0, 1], clamp), interpolate(t, [b - d, b], [1, 0], clamp));
const useFullness = () => {
  const t = useT();
  const solo = useContext(SoloCtx);
  if (solo) return 0;
  const w = inWin(t, FULL);
  if (!w) return 0;
  const [a, b] = w;
  return Math.min(interpolate(t, [a, a + 0.28], [0, 1], { easing: k9.ease.out, ...clamp }), interpolate(t, [b - 0.3, b], [1, 0], { easing: k9.ease.inOut, ...clamp }));
};
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
const Stage: React.FC<{ children: React.ReactNode; gap?: number; top?: number }> = ({ children, gap = 24, top = k9.contentTop }) => {
  const h = usePanelH();
  const bottom = h > 1200 ? 300 : h - k9.footerTop + 20;
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top, bottom, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap }}>
      {children}
    </div>
  );
};
const Footer: React.FC<{ text: string; light?: boolean }> = ({ text, light }) => {
  const h = usePanelH();
  const top = h > 1200 ? 1700 : k9.footerTop;
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: k9.f.body,
          fontWeight: k9.w.medium,
          fontSize: 24,
          color: light ? C.white : C.gray,
          background: light ? C.black : undefined,
          borderRadius: 999,
          padding: light ? "4px 16px" : 0,
        }}
      >
        {text}
      </div>
    </div>
  );
};
const Title: React.FC<{ children: React.ReactNode; size?: number; color?: string }> = ({ children, size = 76, color = C.black }) => (
  <div style={{ fontFamily: k9.f.title, fontWeight: k9.w.bold, fontSize: size, lineHeight: 1.05, letterSpacing: "-0.02em", color, textAlign: "center" }}>{children}</div>
);
const Body: React.FC<{ children: React.ReactNode; size?: number; color?: string; weight?: number }> = ({ children, size = 34, color = C.black, weight = k9.w.medium }) => (
  <div style={{ fontFamily: k9.f.body, fontWeight: weight, fontSize: size, lineHeight: 1.2, color, textAlign: "center" }}>{children}</div>
);
const O: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={{ color: C.orange }}>{children}</span>;
const Chip: React.FC<{ children: React.ReactNode; dark?: boolean; orange?: boolean; size?: number }> = ({ children, dark, orange, size = 32 }) => (
  <div
    style={{
      background: orange ? C.orange : dark ? C.black : C.white,
      color: orange || dark ? C.white : C.black,
      border: `2px solid ${orange ? C.orange : C.black}`,
      borderRadius: 999,
      padding: "10px 26px",
      fontFamily: k9.f.body,
      fontWeight: k9.w.semibold,
      fontSize: size,
      whiteSpace: "nowrap",
      display: "flex",
      alignItems: "center",
      gap: 12,
    }}
  >
    {children}
  </div>
);
const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: C.white, border: `2px solid ${C.black}`, borderRadius: 20, ...style }}>{children}</div>
);
const Shot: React.FC<{ src: string; w: number }> = ({ src, w }) => (
  <div style={{ width: w, background: C.white, border: `2px solid ${C.black}`, borderRadius: 18, overflow: "hidden" }}>
    <Img src={CAP(src)} style={{ width: "100%", display: "block" }} />
  </div>
);
// a stock clip that starts playing at `from` (s) — windows are timed in absolute seconds
const StockVid: React.FC<{ name: string; from: number; style: React.CSSProperties }> = ({ name, from, style }) => (
  <Sequence from={Math.round(from * MNC11_FPS)} layout="none">
    <OffthreadVideo src={STOCK(name)} muted style={style} />
  </Sequence>
);
// a real stock clip filling the panel (in "split" it fades into Manuel with the panel mask)
const StockFill: React.FC<{ name: string; from: number; label?: string }> = ({ name, from, label }) => (
  <>
    <StockVid name={name} from={from} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1060, objectFit: "cover" }} />
    {label ? (
      <div style={{ position: "absolute", left: 0, right: 0, top: 720, display: "flex", justifyContent: "center" }}>
        <Chip dark>{label}</Chip>
      </div>
    ) : null}
  </>
);


// a real screen clip (public/mnc12/screens) on a white card, starting at `from`, with a slow push-in
const Screen: React.FC<{ name: string; from: number; h?: number; top?: number; zoom?: number }> = ({ name, from, h = 620, top = 200, zoom = 1.06 }) => {
  const t = useT();
  const p = usePop(from, "snappy");
  const z = interpolate(t, [from, from + 5], [1, zoom], clamp);
  return (
    <div style={{ position: "absolute", left: 50, width: 980, top, height: h, borderRadius: 20, overflow: "hidden", border: `3px solid ${C.black}`, background: C.white, opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 24}px)` }}>
      <StockVidRaw src={staticFile(`mnc12/screens/${name}.mp4`)} from={from} style={{ width: 980, transform: `scale(${z})`, transformOrigin: "0% 0%" }} />
    </div>
  );
};
const StockVidRaw: React.FC<{ src: string; from: number; style: React.CSSProperties }> = ({ src, from, style }) => (
  <Sequence from={Math.round(from * MNC11_FPS)} layout="none">
    <OffthreadVideo src={src} muted style={style} />
  </Sequence>
);


// a real capture (public/mnc12/captures) on a white card
const CapCard: React.FC<{ src: string; w: number; at: number; zoom?: [number, number] }> = ({ src, w, at: a, zoom = [1, 1.05] }) => {
  const t = useT();
  const z = interpolate(t, [a, a + 4], zoom, clamp);
  return (
    <Rise at={a} kind="snappy">
      <div style={{ width: w, background: C.white, border: `3px solid ${C.black}`, borderRadius: 20, overflow: "hidden" }}>
        <Img src={CAP(src)} style={{ width: "100%", display: "block", transform: `scale(${z})`, transformOrigin: "50% 40%" }} />
      </div>
    </Rise>
  );
};

// ---------------- B-rolls ----------------
// T1 · B1 — real x.ai/bot header "Meet [logo] Grok Bot", soft zoom
const B1: React.FC = () => (
  <>
    <Stage gap={20}>
      <CapCard src="grok_meet.png" w={960} at={0.05} zoom={[1, 1.08]} />
    </Stage>
    <Footer text={SRC_XAI} />
  </>
);

// T1 · extra — "un chat … con muchas inteligencias artificiales que trabajan para ti": real app view from x.ai/bot
const App: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 0, right: 0, top: 205, display: "flex", justifyContent: "center" }}>
      <CapCard src="grok_app.png" w={980} at={T.app + 0.02} zoom={[1, 1.06]} />
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 760, display: "flex", justifyContent: "center" }}>
      <Rise at={at("muchas") - 0.1} kind="pop">
        <Chip dark size={30}>
          Muchas IAs <O>trabajando para ti</O>
        </Chip>
      </Rise>
    </div>
    <Footer text={SRC_XAI} />
  </>
);

// T1/T2 · B2 — real launch post "Introducing Grok Bot" · Aug 11, 2026
const B2: React.FC = () => (
  <>
    <Stage gap={24}>
      <CapCard src="grok_news.png" w={980} at={T.b2 + 0.02} />
      <Rise at={at("no", 0, 8) - 0.1} kind="pop">
        <div style={{ position: "relative" }}>
          <Chip size={32}>No es un chat de preguntas</Chip>
        </div>
      </Rise>
    </Stage>
    <Footer text="Fuente: xAI, 11 ago 2026 · x.ai/news/introducing-grok-bot" />
  </>
);

// T2 · C1 (full-frame real footage + Manuel cut-out) — a person working at his own computer
const WorkerBg: React.FC = () => (
  <AbsoluteFill>
    <StockVid name="worker" from={T.c1} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, objectFit: "cover", objectPosition: "58% 50%" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 230, display: "flex", justifyContent: "center" }}>
      <Rise at={at("contratar") - 0.1} kind="pop">
        <Chip orange size={34}>
          Como contratar a alguien
        </Chip>
      </Rise>
    </div>
  </AbsoluteFill>
);

// T2 · B3/B4 — a computer in the cloud (generic) with a browser, and the usual tools connecting to it
const Cloud: React.FC<{ w: number }> = ({ w }) => (
  <svg width={w} height={w * 0.62} viewBox="0 0 200 124">
    <path d="M48 110 H160 A34 34 0 0 0 158 42 A44 44 0 0 0 76 30 A30 30 0 0 0 40 58 A26 26 0 0 0 48 110 Z" fill={C.white} stroke={C.black} strokeWidth={4} />
    <rect x={72} y={56} width={58} height={36} rx={4} fill={C.black} />
    <rect x={77} y={61} width={48} height={8} rx={2} fill={C.orange} />
    <rect x={77} y={73} width={30} height={4} rx={2} fill={C.white} opacity={0.7} />
    <rect x={77} y={80} width={40} height={4} rx={2} fill={C.white} opacity={0.7} />
    <rect x={92} y={92} width={18} height={6} fill={C.black} />
  </svg>
);
const ToolIcon: React.FC<{ kind: "mail" | "sheet" | "crm" }> = ({ kind }) => (
  <svg width={92} height={92} viewBox="0 0 60 60">
    <rect x={3} y={3} width={54} height={54} rx={12} fill={C.white} stroke={C.black} strokeWidth={3} />
    {kind === "mail" ? (
      <>
        <rect x={13} y={18} width={34} height={24} rx={3} fill="none" stroke={C.black} strokeWidth={3} />
        <path d="M13 20 L30 33 L47 20" fill="none" stroke={C.orange} strokeWidth={3} />
      </>
    ) : kind === "sheet" ? (
      <>
        <rect x={14} y={14} width={32} height={32} rx={3} fill="none" stroke={C.black} strokeWidth={3} />
        <path d="M14 25 H46 M14 35 H46 M25 14 V46" stroke={C.black} strokeWidth={2.5} />
        <rect x={26} y={26} width={19} height={8} fill={C.orange} />
      </>
    ) : (
      <>
        <circle cx={24} cy={24} r={7} fill={C.orange} />
        <path d="M12 46 C12 36 36 36 36 46" fill="none" stroke={C.black} strokeWidth={3} />
        <path d="M38 22 H48 M38 30 H48 M38 38 H48" stroke={C.black} strokeWidth={3} />
      </>
    )}
  </svg>
);
const B3: React.FC = () => {
  const t = useT();
  const tools: [string, "mail" | "sheet" | "crm", number][] = [
    ["Correo", "mail", at("herramientas", 0, 14) - 0.2],
    ["Hojas", "sheet", at("herramientas", 0, 14) + 0.15],
    ["CRM", "crm", at("ya", 0, 15) - 0.1],
  ];
  const xs = [210, 540, 870];
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 200, display: "flex", justifyContent: "center" }}>
        <Rise at={T.b3 + 0.02} kind="pop">
          <Cloud w={380} />
        </Rise>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 440, display: "flex", justifyContent: "center" }}>
        <Rise at={at("navegador") - 0.1} kind="pop">
          <Chip dark size={28}>
            Su propia compu · con navegador
          </Chip>
        </Rise>
      </div>
      <svg width={1080} height={960} style={{ position: "absolute", left: 0, top: 0 }}>
        {tools.map(([, , s], i) => {
          const p = interpolate(t, [s, s + 0.4], [0, 1], clamp);
          return <line key={i} x1={540} y1={500} x2={540 + (xs[i] - 540) * p} y2={500 + 120 * p} stroke={C.orange} strokeWidth={6} strokeDasharray="14 10" />;
        })}
      </svg>
      {tools.map(([l, k, s], i) => (
        <div key={l} style={{ position: "absolute", left: xs[i] - 70, top: 610, width: 140, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Rise at={s} kind="pop">
            <ToolIcon kind={k} />
          </Rise>
          <Rise at={s + 0.1}>
            <Body size={26} weight={k9.w.semibold}>
              {l}
            </Body>
          </Rise>
        </div>
      ))}
    </>
  );
};

// T3 · B5 — four cards in a row that get ticked: Correo → Cotización → Agenda → CRM
const B5: React.FC = () => {
  const steps: [string, number][] = [
    ["Correo", at("correo") - 0.1],
    ["Cotización", at("cotización,") - 0.1],
    ["Agenda", at("agenda") - 0.1],
    ["CRM", at("CRM") - 0.1],
  ];
  return (
    <Stage gap={30}>
      <Rise at={T.b5 + 0.05}>
        <Body size={32} weight={k9.w.semibold} color={C.gray}>
          Tú le pides:
        </Body>
      </Rise>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {steps.map(([l, s], i) => (
          <React.Fragment key={l}>
            <StepCard label={l} at={s} n={i + 1} />
            {i < 3 ? (
              <Rise at={s + 0.2}>
                <Title size={40}>→</Title>
              </Rise>
            ) : null}
          </React.Fragment>
        ))}
      </div>
    </Stage>
  );
};
const StepCard: React.FC<{ label: string; at: number; n: number }> = ({ label, at: a, n }) => {
  const tick = usePop(a + 0.45, "pop");
  return (
    <Rise at={a} kind="pop">
      <Card style={{ width: 196, height: 210, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, borderRadius: 22 }}>
        <div style={{ width: 62, height: 62, borderRadius: 16, border: `3px solid ${C.black}`, background: tick > 0.05 ? C.orange : C.white, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: k9.f.title, fontWeight: 700, fontSize: 38, color: C.white, transform: `scale(${tick})` }}>✓</span>
        </div>
        <Body size={27} weight={k9.w.semibold}>
          {n}. {label}
        </Body>
      </Card>
    </Rise>
  );
};

// T3 · B6 — Manuel's own test recording (B6.mp4) was not in the Drive folder; instead the REAL product view
// published by xAI (a bot working through a multi-step task), with its source — no simulated Grok Bot screen.
const B6: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 0, right: 0, top: 205, display: "flex", justifyContent: "center" }}>
      <CapCard src="grok_app.png" w={980} at={T.b6 + 0.02} zoom={[1.25, 1.38]} />
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 760, display: "flex", justifyContent: "center" }}>
      <Rise at={at("paso", 0, 25) - 0.1} kind="pop">
        <Chip orange size={30}>
          Paso por paso, en tus herramientas
        </Chip>
      </Rise>
    </div>
    <Footer text={SRC_XAI} />
  </>
);

// T4 · B7 — a generic browser: the cursor moves by itself and signs in (no real brands)
const B7: React.FC = () => {
  const t = useT();
  const s = T.b7 + 0.3;
  const k = (a: number, b: number) => interpolate(t, [s + a, s + b], [0, 1], { easing: k9.ease.inOut, ...clamp });
  const user = "tu.usuario";
  const typed = Math.round(interpolate(t, [s + 0.9, s + 1.7], [0, user.length], clamp));
  const pass = Math.round(interpolate(t, [s + 2.1, s + 2.6], [0, 8], clamp));
  const cx = interpolate(k(0, 0.8), [0, 1], [820, 380]) + interpolate(k(1.8, 2.1), [0, 1], [0, 0]);
  const cy = interpolate(k(0, 0.8), [0, 1], [700, 400]) + interpolate(k(1.8, 2.1), [0, 1], [0, 80]) + interpolate(k(2.8, 3.2), [0, 1], [0, 90]);
  const ok = k(3.3, 3.5);
  return (
    <>
      <div style={{ position: "absolute", left: 90, top: 205, width: 900, height: 560, background: C.white, border: `3px solid ${C.black}`, borderRadius: 20, overflow: "hidden" }}>
        <div style={{ height: 52, background: C.black, display: "flex", alignItems: "center", gap: 10, padding: "0 18px" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: 14, height: 14, borderRadius: 99, background: C.white, opacity: 0.6 }} />
          ))}
          <div style={{ marginLeft: 16, flex: 1, height: 28, borderRadius: 99, background: C.white, opacity: 0.18 }} />
        </div>
        <div style={{ padding: "50px 120px", display: "flex", flexDirection: "column", gap: 22 }}>
          <Title size={44}>Iniciar sesión</Title>
          <div style={{ height: 64, border: `2px solid ${C.black}`, borderRadius: 12, display: "flex", alignItems: "center", padding: "0 20px", fontFamily: k9.f.body, fontSize: 30, color: C.black }}>{user.slice(0, typed)}</div>
          <div style={{ height: 64, border: `2px solid ${C.black}`, borderRadius: 12, display: "flex", alignItems: "center", padding: "0 20px", fontFamily: k9.f.body, fontSize: 30, color: C.black, letterSpacing: 6 }}>{"•".repeat(pass)}</div>
          <div style={{ height: 64, borderRadius: 12, background: ok > 0.5 ? C.orange : C.black, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: k9.f.body, fontWeight: 700, fontSize: 30, color: C.white }}>{ok > 0.5 ? "✓ Dentro" : "Entrar"}</div>
        </div>
      </div>
      <svg width={44} height={56} viewBox="0 0 22 28" style={{ position: "absolute", left: cx, top: cy }}>
        <path d="M2 2 L2 22 L8 17 L12 26 L16 24 L12 15 L20 15 Z" fill={C.white} stroke={C.black} strokeWidth={2} strokeLinejoin="round" />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 790, display: "flex", justifyContent: "center" }}>
        <Rise at={at("código,") - 0.15} kind="pop">
          <Chip dark size={28}>
            Sin conexión por código
          </Chip>
        </Rise>
      </div>
    </>
  );
};

// T4 · B8 — "Si tú puedes entrar, él también"
const B8: React.FC = () => (
  <Stage gap={14}>
    <Rise at={T.b8 + 0.05}>
      <Title size={80}>Si tú puedes entrar,</Title>
    </Rise>
    <Rise at={at("él") - 0.1} kind="pop">
      <Title size={96} color={C.orange}>
        él también
      </Title>
    </Rise>
  </Stage>
);

// T5 · B9 — "Aquí está la jugada", zoom hit (full screen)
const B9: React.FC = () => {
  const p = usePop(at("jugada,") - 0.12, "pop");
  const pre = usePop(T.b9 + 0.02);
  const h = usePanelH();
  const k = interpolate(h, [960, 1920], [1, 1.2]);
  return (
    <Stage gap={0}>
      <div style={{ opacity: pre }}>
        <Title size={70 * k}>Aquí está</Title>
      </div>
      <div style={{ transform: `scale(${interpolate(p, [0, 1], [1.8, 1])})`, opacity: Math.min(1, p * 2) }}>
        <Title size={150 * k} color={C.orange}>
          la jugada
        </Title>
      </div>
    </Stage>
  );
};

// T5 · B10 — a key ring with many keys that shrinks to a single key
const Key: React.FC<{ color: string }> = ({ color }) => (
  <svg width={70} height={150} viewBox="0 0 28 60">
    <circle cx={14} cy={12} r={9} fill="none" stroke={color} strokeWidth={5} />
    <path d="M14 21 V54 M14 40 H21 M14 48 H19" stroke={color} strokeWidth={5} strokeLinecap="round" />
  </svg>
);
const B10: React.FC = () => {
  const t = useT();
  const cut = interpolate(t, [at("empieza") - 0.1, at("tarea", 0, 39.8) + 0.3], [0, 1], { easing: k9.ease.inOut, ...clamp });
  const N = 9;
  return (
    <Stage gap={26}>
      <div style={{ position: "relative", width: 600, height: 330 }}>
        <svg width={600} height={330} style={{ position: "absolute", left: 0, top: 0 }}>
          <circle cx={300} cy={70} r={48} fill="none" stroke={C.black} strokeWidth={10} />
        </svg>
        {Array.from({ length: N }).map((_, i) => {
          const keep = i === 4;
          const ang = (i - (N - 1) / 2) * 15 * (keep ? 1 : 1 + cut);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 265,
                top: 105,
                transformOrigin: "35px -20px",
                transform: `rotate(${keep ? ang * (1 - cut) : ang}deg) translateY(${keep ? 0 : cut * 60}px)`,
                opacity: keep ? 1 : 1 - cut,
              }}
            >
              <Key color={keep ? C.orange : C.black} />
            </div>
          );
        })}
      </div>
      <Rise at={at("cuentas") - 0.15} kind="pop">
        <Chip orange size={34}>
          1 tarea · solo los accesos que necesita
        </Chip>
      </Rise>
    </Stage>
  );
};

// T5 · C2 (full-frame real footage + Manuel cut-out) — a new hire welcomed at the office
const NewHireBg: React.FC = () => (
  <AbsoluteFill>
    <StockVid name="newhire" from={T.c2} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, objectFit: "cover", objectPosition: "68% 50%" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 230, display: "flex", justifyContent: "center" }}>
      <Rise at={at("empleado") - 0.12} kind="pop">
        <Chip orange size={34}>
          Como a un empleado nuevo
        </Chip>
      </Rise>
    </div>
  </AbsoluteFill>
);

// T5 · extra — "para configurarlo, todo es a través del chat… genera sus skills, pide acceso… sin programar"
const Bubble: React.FC<{ at: number; right?: boolean; children: React.ReactNode }> = ({ at: a, right, children }) => (
  <Rise at={a} kind="pop" dist={16} style={{ alignSelf: right ? "flex-end" : "flex-start" }}>
    <div style={{ maxWidth: 620, background: right ? C.black : C.white, color: right ? C.white : C.black, border: `2px solid ${C.black}`, borderRadius: 26, borderBottomRightRadius: right ? 6 : 26, borderBottomLeftRadius: right ? 26 : 6, padding: "16px 24px", fontFamily: k9.f.body, fontWeight: k9.w.medium, fontSize: 30, lineHeight: 1.25 }}>
      {children}
    </div>
  </Rise>
);
const Config: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 110, right: 110, top: 210, display: "flex", flexDirection: "column", gap: 16 }}>
      <Bubble at={at("chat,", 0, 49) - 0.2} right>
        Necesito que…
      </Bubble>
      <Bubble at={at("skills,") - 0.3}>
        <span style={{ fontWeight: 700 }}>Skills nuevas:</span> <O>✓ correo · ✓ cotización</O>
      </Bubble>
      <Bubble at={at("acceso", 0, 53) - 0.15}>¿Me das acceso a esta cuenta?</Bubble>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 690, display: "flex", justifyContent: "center", gap: 14 }}>
      <Rise at={at("chat,", 0, 49) - 0.1} kind="pop">
        <Chip dark size={30}>
          Todo desde el chat
        </Chip>
      </Rise>
      <Rise at={at("programación") - 0.15} kind="pop">
        <Chip orange size={30}>
          Sin programar
        </Chip>
      </Rise>
    </div>
  </>
);

// T6 · B11 — a chat that turns into a ticked task list: "De contestar → a hacer"
const B11: React.FC = () => {
  const t = useT();
  const flip = interpolate(t, [at("se", 0, 61) - 0.1, at("se", 0, 61) + 0.3], [0, 1], { easing: k9.ease.inOut, ...clamp });
  const tasks = ["Cotización enviada", "Llamada agendada", "CRM actualizado"];
  return (
    <Stage gap={26}>
      <div style={{ position: "relative", width: 640, height: 300 }}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - flip, transform: `scale(${1 - 0.1 * flip})`, display: "flex", flexDirection: "column", gap: 14, justifyContent: "center" }}>
          <Bubble at={T.b11 + 0.05} right>
            ¿Cómo hago una cotización?
          </Bubble>
          <Bubble at={T.b11 + 0.4}>Así se hace: paso 1…</Bubble>
        </div>
        <div style={{ position: "absolute", inset: 0, opacity: flip, transform: `scale(${0.9 + 0.1 * flip})`, display: "flex", flexDirection: "column", gap: 14, justifyContent: "center" }}>
          {tasks.map((x, i) => (
            <Card key={x} style={{ padding: "14px 22px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: t > at("trabajo.") - 0.3 + i * 0.12 ? C.orange : C.green, border: `2px solid ${C.black}`, color: C.white, fontWeight: 700, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</div>
              <Body size={30} weight={k9.w.semibold}>
                {x}
              </Body>
            </Card>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Chip size={30}>De contestar</Chip>
        <Title size={44}>→</Title>
        <div style={{ opacity: Math.max(0.3, flip) }}>
          <Chip orange size={30}>
            a hacer
          </Chip>
        </div>
      </div>
    </Stage>
  );
};

// T6 · B12 — fixed closing phrase, full screen
const B12: React.FC = () => {
  const t = useT();
  const p = interpolate(t, [T.close, T.close + 0.3], [0, 1], { easing: k9.ease.out, ...clamp });
  const ws = "Si todavía no sabes cómo implementar IA en tu negocio, esta cuenta es para ti.".split(" ");
  const W = (words as Word[]).filter((w) => w.s >= T.close);
  return (
    <AbsoluteFill style={{ background: C.green, opacity: p, justifyContent: "center", alignItems: "center", padding: "0 96px" }}>
      <div style={{ fontFamily: k9.f.title, fontWeight: k9.w.bold, fontSize: 92, lineHeight: 1.08, letterSpacing: "-0.02em", color: C.black, textAlign: "center", textWrap: "balance", marginTop: -80 }}>
        {ws.map((w, i) => {
          const s = W[i]?.s ?? T.close;
          const o = interpolate(t, [s - 0.08, s + 0.06], [0.18, 1], clamp);
          return (
            <React.Fragment key={i}>
              <span style={{ color: w === "IA" ? C.orange : undefined, opacity: o }}>{w}</span>{" "}
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------- layers ----------------
// ---------------- layers ----------------
export const CAM_Y = 520; // first source row shown at y=960 (face in the lower half)
const useCamScale = () => {
  const t = useT();
  const k = JOINS.filter((j) => t >= j).length;
  return k % 2 === 1 ? 1.12 : 1;
};
// Manuel full width under the top panel; the panel's lower edge fades into him
const ManuelSplit: React.FC = () => {
  const s = useCamScale();
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, overflow: "hidden", background: C.black }}>
      <div style={{ position: "absolute", left: 0, top: 960 - CAM_Y, width: 1080, height: 1920, transform: `scale(${s})`, transformOrigin: `540px ${CAM_Y + 420}px` }}>
        <OffthreadVideo src={staticFile(SRC)} muted style={{ width: 1080, height: 1920 }} />
      </div>
    </div>
  );
};
// Manuel cut out (alpha WebM), placed exactly where he sits in the split layout
const CutoutLayer: React.FC = () => {
  const t = useT();
  const s = useCamScale();
  const w = inWin(t, CUTOUT);
  if (!w) return null;
  const [, , name, start] = w;
  return (
    <Sequence from={Math.round(start * MNC11_FPS)} layout="none">
      <div style={{ position: "absolute", left: 0, top: 960 - CAM_Y, width: 1080, height: 1920, transform: `scale(${s})`, transformOrigin: `540px ${CAM_Y + 420}px` }}>
        <OffthreadVideo src={staticFile(`mnc12/clips/cutout_${name}.webm`)} transparent muted style={{ width: 1080, height: 1920 }} />
      </div>
    </Sequence>
  );
};
// top panel (0–1060) with a soft fade into Manuel; grows to full screen on number beats
const Panel: React.FC<{ children: React.ReactNode; transparent?: boolean }> = ({ children, transparent }) => {
  const f = useFullness();
  const solo = useContext(SoloCtx);
  const h = 1060 + (1920 - 1060) * f;
  const fadeFrom = h - 200 * (1 - f);
  const mask = solo || f > 0.99 ? undefined : `linear-gradient(to bottom, #000 0px, #000 ${fadeFrom}px, transparent ${h}px)`;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1080,
        height: solo ? 960 : h,
        background: transparent ? undefined : C.green,
        overflow: "hidden",
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    >
      <PanelCtx.Provider value={solo ? 960 : Math.max(960, h - 100)}>{children}</PanelCtx.Provider>
    </div>
  );
};

// ---------------- captions: big, white with black outline, on the boundary ----------------
const HIDE: [number, number][] = [...FULL, [T.close - 0.05, T.end]];
const BoundaryCaptions: React.FC = () => {
  const t = useT();
  const c = CHUNKS.find((x) => t >= x.from && t < x.to);
  if (!c || HIDE.some(([a, b]) => t >= a && t < b)) return null;
  const p = interpolate(t - c.from, [0, 0.14], [0, 1], { easing: k9.ease.out, ...clamp });
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 960, display: "flex", justifyContent: "center", transform: "translateY(-50%)" }}>
      <div
        style={{
          maxWidth: 960,
          textAlign: "center",
          textWrap: "balance",
          fontFamily: k9.f.body,
          fontWeight: k9.w.extrabold,
          fontSize: 72,
          lineHeight: 1.1,
          color: C.white,
          WebkitTextStroke: `9px ${C.black}`,
          wordSpacing: "0.14em",
          paintOrder: "stroke fill",
          opacity: p,
          transform: `scale(${0.92 + 0.08 * p})`,
        }}
      >
        {c.words.map((w, i) => (
          <React.Fragment key={i}>
            <span style={{ color: w.hl ? C.orange : undefined }}>{w.w}</span>
            {i < c.words.length - 1 ? " " : null}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};



// ---------------- sound ----------------
const SFX = (): [number, SfxKind][] => [
  [0.1, "whoosh"],
  [T.app, "swoosh-soft"],
  [at("muchas") - 0.1, "pop"],
  [T.b2, "whoosh"],
  [T.c1, "whoosh"],
  [at("contratar") - 0.1, "pop"],
  [T.b3, "swoosh-soft"],
  [at("herramientas", 0, 14) - 0.2, "tick"],
  [at("ya", 0, 15) - 0.1, "tick"],
  [T.b5, "whoosh"],
  [at("correo") + 0.35, "tick"],
  [at("cotización,") + 0.35, "tick"],
  [at("agenda") + 0.35, "tick"],
  [at("CRM") + 0.35, "tick"],
  [T.b6, "swoosh-soft"],
  [T.b7, "whoosh"],
  [T.b7 + 3.6, "pop"],
  [T.b8, "swoosh-soft"],
  [at("él") - 0.1, "pop"],
  [at("jugada,") - 0.12, "pop"],
  [T.b10, "whoosh"],
  [at("cuentas") - 0.15, "pop"],
  [T.c2, "whoosh"],
  [T.cfg, "swoosh-soft"],
  [at("skills,") - 0.3, "pop"],
  [at("acceso", 0, 53) - 0.15, "pop"],
  [at("programación") - 0.15, "click"],
  [T.b11, "whoosh"],
  [at("trabajo.") - 0.3, "tick"],
  [T.close, "whoosh"],
];

// ---------------- composition ----------------
const ROLLS: [number, number, React.FC, ("cut" | undefined)?][] = [
  [0, T.app, B1],
  [T.app, T.b2, App],
  [T.b2, T.c1, B2],
  [T.c1, T.b3, WorkerBg, "cut"],
  [T.b3, T.b5, B3],
  [T.b5, T.b6, B5],
  [T.b6, T.b7, B6],
  [T.b7, T.b8, B7],
  [T.b8, T.b9, B8],
  [T.b9, T.b10, B9],
  [T.b10, T.c2, B10],
  [T.c2, T.cfg, NewHireBg, "cut"],
  [T.cfg, T.b11, Config],
  [T.b11, T.close, B11],
];

export const Mnc12Broll: React.FC<{ i: number }> = ({ i }) => {
  const [from, to, Comp] = ROLLS[i];
  return (
    <AbsoluteFill style={{ background: C.green, overflow: "hidden" }}>
      <SoloCtx.Provider value>
        <Panel>
          <Win from={from} to={to}>
            <Comp />
          </Win>
        </Panel>
      </SoloCtx.Provider>
    </AbsoluteFill>
  );
};
export const MNC12_ROLLS = ROLLS.map(([a, b]) => [a, b] as [number, number]);

export const Mnc12Reel: React.FC = () => {
  const vol = (f: number) => {
    const s = f / MNC12_FPS;
    const full = FULL.some(([a, b]) => s >= a && s < b) ? 0.11 : 0.07;
    return full * interpolate(s, [T.end - 1.0, T.end], [1, 0], clamp);
  };
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <Audio src={staticFile(SRC)} />
      <Audio src={staticFile(MUSIC)} volume={vol} />
      <ManuelSplit />
      {ROLLS.map(([a, b, Comp, mode], i) => (
        <Win key={i} from={a} to={b}>
          {mode === "cut" ? (
            <>
              <Comp />
              <CutoutLayer />
            </>
          ) : (
            <Panel>
              <Comp />
            </Panel>
          )}
        </Win>
      ))}
      <BoundaryCaptions />
      <Win from={T.close} to={T.end}>
        <B12 />
      </Win>
      <Sfx cues={SFX()} />
    </AbsoluteFill>
  );
};
