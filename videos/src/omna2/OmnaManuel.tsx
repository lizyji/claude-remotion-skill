import React, { createContext, useContext } from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { omna } from "../omna/omnaTheme";
import { BrandField, BrandGrain } from "../omna/components/Brand";
import { LowerThird } from "../omna/components/LowerThird";
import { makeCaptions, type Word } from "../mnc/captionsCore";
import { Icon } from "../mnc/components/Icons";
import words from "./words.json";

// "Nuestra forma de trabajar" — Manuel Guerrero, CEO de OMNA (1920×1080).
// One continuous take (orientation fixed and pauses trimmed in omna2-prepare.sh).
// Manuel stays on screen the whole time: for each idea the camera eases to the
// left and a frosted OMNA panel explains it on the right, then he comes back
// full frame. Styled only with the OMNA Design System (Claude Design).

export const OMNA2_FPS = 30;
const SRC = "omna2/clips/base.mp4";
const BASE_DUR = 101.72;
const END = 3.0;
export const OMNA2_TOTAL_F = Math.round((BASE_DUR + END) * OMNA2_FPS);

const KEYWORDS: string[][] = [
  ["agentes", "de", "ia"],
  ["el", "cerebro"],
  ["tiempo", "real"],
  ["última", "milla"],
  ["software", "a", "la", "medida"],
  ["llena", "el", "formulario"],
  ["diagnóstico"],
  ["sistemas"],
  ["whatsapp"],
  ["estrategia"],
  ["hablemos"],
];
const { CHUNKS, at } = makeCaptions(words as Word[], KEYWORDS, { maxWords: 9, maxChars: 52, maxMerged: 62, minDur: 0.6 });

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const useT = () => useCurrentFrame() / useVideoConfig().fps;

// ---------------- camera ----------------
// full: the original frame · close: gentle punch on the face · side: Manuel eased
// to the left third so a panel can live on the right (he is never covered).
type Frame = { s: number; x: number; y: number };
const CAM: Record<"full" | "close" | "side", Frame> = {
  full: { s: 1, x: 0, y: 0 },
  close: { s: 1.14, x: -10, y: 20 },
  side: { s: 1.3, x: -280, y: 10 },
};
// [time, framing, cut?] — joins of the trimmed take land on a framing change, so the
// edit reads as a deliberate camera switch instead of a jump cut.
const KEYS: [number, keyof typeof CAM, boolean?][] = [
  [0, "full"],
  [2.0, "side"],
  [13.3, "full"],
  [14.5, "side"],
  [21.1, "full"],
  [22.8, "close"],
  [26.12, "side", true],
  [37.25, "close"],
  [39.4, "side"],
  [61.25, "full"],
  [64.0, "side"],
  [80.39, "full", true],
  [84.3, "close"],
  [88.38, "full", true],
  [93.65, "side", true],
];
const TRANS = 0.7;
const camAt = (t: number): Frame => {
  let i = 0;
  while (i + 1 < KEYS.length && KEYS[i + 1][0] <= t) i++;
  const [t0, m, cut] = KEYS[i];
  const cur = CAM[m];
  if (i === 0 || cut) return cur;
  const prev = CAM[KEYS[i - 1][1]];
  const k = interpolate(t, [t0, t0 + TRANS], [0, 1], { easing: omna.ease.inOut, ...clamp });
  return { s: prev.s + (cur.s - prev.s) * k, x: prev.x + (cur.x - prev.x) * k, y: prev.y + (cur.y - prev.y) * k };
};

const Camera: React.FC = () => {
  const t = useT();
  const f = camAt(Math.min(t, BASE_DUR - 0.05));
  const drift = Math.sin(t / 3.2) * 4; // barely-there handheld life
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: omna.colors.ink }}>
      <OffthreadVideo
        src={staticFile(SRC)}
        muted
        style={{
          position: "absolute",
          width: 1920,
          height: 1080,
          transform: `translateX(${f.x + drift}px) translateY(${f.y}px) scale(${f.s})`,
          transformOrigin: "50% 50%",
        }}
      />
      {/* readability: ink falloff at the bottom (captions) and on the right (panels) */}
      <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(22,2,33,0.62) 0%, rgba(22,2,33,0.22) 20%, rgba(22,2,33,0) 38%)" }} />
      <AbsoluteFill
        style={{
          background: "linear-gradient(90deg, rgba(22,2,33,0) 45%, rgba(22,2,33,0.55) 70%, rgba(22,2,33,0.72) 100%)",
          opacity: interpolate(-f.x, [0, 280], [0, 1], clamp),
        }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 45% 42%, rgba(22,2,33,0) 60%, rgba(22,2,33,0.28) 100%)" }} />
    </AbsoluteFill>
  );
};

// ---------------- timing helpers (absolute seconds) ----------------
const WinCtx = createContext({ from: 0, to: Infinity });
const Win: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < Math.round(from * fps) || frame >= Math.round(to * fps)) return null;
  return <WinCtx.Provider value={{ from, to }}>{children}</WinCtx.Provider>;
};
const useAnim = (a: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { to } = useContext(WinCtx);
  const p = spring({ frame: frame - Math.round(a * fps), fps, config: omna.spring.calm });
  const exit = interpolate(frame / fps, [to - 0.3, to], [0, 1], { easing: omna.ease.in, ...clamp });
  return { p, exit };
};
const In: React.FC<{ at: number; dist?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ at: a, dist = 24, style, children }) => {
  const { p, exit } = useAnim(a);
  return (
    <div style={{ opacity: p * (1 - exit), transform: `translateY(${(1 - p) * dist - exit * 10}px)`, ...style }}>{children}</div>
  );
};
const useOn = (a: number) => useT() >= a;

// ---------------- type ----------------
const Grad: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ background: omna.gradient.text, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{children}</span>
);
const Eyebrow: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = omna.colors.orange }) => (
  <div
    style={{
      fontFamily: omna.fonts.sans,
      fontWeight: omna.weight.demibold,
      fontSize: 20,
      letterSpacing: omna.tracking.wider,
      textTransform: "uppercase",
      color,
    }}
  >
    {children}
  </div>
);

// ---------------- panel (frosted ink card on the right) ----------------
const PANEL = { left: 1130, top: 150, width: 700 };
const Panel: React.FC<{ eyebrow: string; title: React.ReactNode; at: number; children: React.ReactNode }> = ({ eyebrow, title, at: a, children }) => {
  const { p, exit } = useAnim(a);
  return (
    <div
      style={{
        position: "absolute",
        ...PANEL,
        borderRadius: omna.radius.card,
        background: "rgba(22, 2, 33, 0.72)",
        backdropFilter: "blur(18px)",
        border: `1px solid ${omna.colors.borderSubtle}`,
        boxShadow: `0 30px 80px rgba(22,2,33,0.55), 0 0 60px ${omna.colors.glowViolet}`,
        padding: "44px 48px",
        overflow: "hidden",
        opacity: p * (1 - exit),
        transform: `translateX(${(1 - p) * 60 + exit * 30}px) scale(${0.97 + 0.03 * p})`,
      }}
    >
      {/* top hairline in the brand gradient */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 4, background: omna.gradient.brand }} />
      <In at={a + 0.15} dist={12}>
        <Eyebrow>{eyebrow}</Eyebrow>
      </In>
      <In at={a + 0.25} dist={18} style={{ marginTop: 16 }}>
        <div
          style={{
            fontFamily: omna.fonts.sans,
            fontWeight: omna.weight.bold,
            fontSize: 50,
            lineHeight: 1.06,
            letterSpacing: omna.tracking.tight,
            color: omna.colors.white,
          }}
        >
          {title}
        </div>
      </In>
      <div style={{ position: "relative", marginTop: 34 }}>{children}</div>
      <BrandGrain opacity={0.08} />
    </div>
  );
};

// soft-square icon tile (isotipo echo)
const Tile: React.FC<{ icon: React.ReactNode; size?: number; hot?: boolean }> = ({ icon, size = 64, hot }) => (
  <div
    style={{
      width: size,
      height: size,
      flex: "none",
      borderRadius: 14,
      border: `1px solid ${hot ? omna.colors.orange : "rgba(223,195,244,0.32)"}`,
      background: hot ? "rgba(254,101,29,0.12)" : "rgba(223,195,244,0.06)",
      padding: size * 0.2,
      color: omna.colors.orange,
    }}
  >
    {icon}
  </div>
);

const Row: React.FC<{ icon: React.ReactNode; label: React.ReactNode; at: number; hot?: boolean; dim?: boolean; note?: string }> = ({
  icon,
  label,
  at: a,
  hot,
  dim,
  note,
}) => (
  <In at={a} dist={18}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 22,
        padding: "16px 20px",
        borderRadius: 16,
        border: `1px solid ${hot ? "rgba(254,101,29,0.55)" : omna.colors.borderSubtle}`,
        background: hot ? "rgba(254,101,29,0.08)" : "rgba(223,195,244,0.04)",
        opacity: dim ? 0.38 : 1,
        transition: "none",
      }}
    >
      <Tile icon={icon} size={56} hot={hot} />
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: omna.fonts.sans, fontWeight: omna.weight.demibold, fontSize: 30, color: omna.colors.white, lineHeight: 1.1 }}>{label}</div>
        {note ? (
          <div style={{ marginTop: 4, fontFamily: omna.fonts.sans, fontWeight: omna.weight.regular, fontSize: 20, color: omna.colors.textMuted }}>{note}</div>
        ) : null}
      </div>
    </div>
  </In>
);

const Arrow: React.FC<{ at: number; dir?: "down" | "right" }> = ({ at: a, dir = "down" }) => (
  <In at={a} dist={8} style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
    <svg width={40} height={40} viewBox="0 0 40 40" style={{ transform: dir === "right" ? "rotate(-90deg)" : undefined }}>
      <path d="M20 6v26M10 22l10 10 10-10" fill="none" stroke={omna.colors.orange} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </In>
);

// ---------------- the explanations ----------------
// 1 · keep what you have; new layers are built around it
const KeepWhatYouHave: React.FC = () => {
  const t = useT();
  const around = at("alrededor");
  const ring = interpolate(t, [around - 0.3, around + 0.9], [0, 1], { easing: omna.ease.out, ...clamp });
  return (
    <Panel eyebrow="Tu operación hoy" title={<>Te quedas con lo que <Grad>ya tienes</Grad>.</>} at={2.2}>
      <div style={{ position: "relative", height: 440 }}>
        {/* the new layer, drawn around the existing systems */}
        <svg width={604} height={430} style={{ position: "absolute", left: 0, top: 10 }}>
          <defs>
            <linearGradient id="ring" x1="0" y1="0" x2="1" y2="0.3">
              <stop offset="0" stopColor="#954ACC" />
              <stop offset="0.6" stopColor="#D6418B" />
              <stop offset="1" stopColor="#FE651D" />
            </linearGradient>
          </defs>
          <rect x={8} y={8} width={588} height={414} rx={28} fill="none" stroke="url(#ring)" strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ring} />
        </svg>
        <div style={{ position: "absolute", left: 44, right: 44, top: 60, display: "flex", gap: 22 }}>
          {(
            [
              [Icon.database, "ERP", at("ERP")],
              [Icon.apps, "Tus sistemas", at("sistemas")],
            ] as [React.ReactNode, string, number][]
          ).map(([ic, l, s]) => (
            <In key={l} at={s - 0.1} style={{ flex: 1 }}>
              <div style={{ padding: "26px 22px", borderRadius: 18, background: "rgba(223,195,244,0.08)", border: `1px solid ${omna.colors.borderSubtle}` }}>
                <Tile icon={ic} size={60} />
                <div style={{ marginTop: 16, fontFamily: omna.fonts.sans, fontWeight: omna.weight.bold, fontSize: 32, color: omna.colors.white }}>{l}</div>
                <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8, fontFamily: omna.fonts.sans, fontSize: 20, color: omna.colors.lilac }}>
                  <div style={{ width: 22, height: 22, color: omna.colors.lilac }}>{Icon.check}</div>
                  Se mantiene
                </div>
              </div>
            </In>
          ))}
        </div>
        <In at={around} dist={14} style={{ position: "absolute", left: 0, right: 0, top: 360, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              padding: "10px 22px",
              borderRadius: omna.radius.pill,
              background: omna.colors.ink,
              border: `1px solid ${omna.colors.orange}`,
              fontFamily: omna.fonts.sans,
              fontWeight: omna.weight.demibold,
              fontSize: 22,
              letterSpacing: omna.tracking.wide,
              color: omna.colors.white,
            }}
          >
            Construimos <Grad>alrededor</Grad>
          </div>
        </In>
      </div>
    </Panel>
  );
};

// 2 · diagnosis: a scan over how the company works today
const Diagnosis: React.FC = () => {
  const t = useT();
  const t0 = at("diagnóstico.");
  const scan = interpolate(t, [t0 + 0.6, at("tiempo.") + 0.6], [0, 1], { ...clamp });
  return (
    <Panel eyebrow="Paso 1 · Diagnóstico" title={<>Entendemos cómo opera tu <Grad>empresa</Grad> hoy.</>} at={14.7}>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 16 }}>
        <Row icon={Icon.route} label="Cómo opera hoy" at={at("cómo") - 0.1} />
        <Row icon={Icon.apps} label="Qué herramientas usa tu equipo" at={at("herramientas") - 0.1} />
        <Row icon={Icon.clock} label="Dónde se va su tiempo" at={at("dónde") - 0.1} hot={useOn(at("tiempo."))} />
        {/* scan beam */}
        <div
          style={{
            position: "absolute",
            left: -10,
            right: -10,
            top: `${scan * 100}%`,
            height: 3,
            background: omna.gradient.brand,
            boxShadow: `0 0 24px ${omna.colors.glowOrange}`,
            opacity: scan > 0 && scan < 1 ? 1 : 0,
          }}
        />
      </div>
    </Panel>
  );
};

// 3 · custom software + AI agents connected to what exists; manual work goes away
const BuildOnTop: React.FC = () => {
  const t = useT();
  const tManual = at("manual");
  const tOrden = at("ordenada.");
  return (
    <Panel eyebrow="Paso 2 · Construimos encima" title={<><Grad>Software a la medida</Grad> y agentes de IA.</>} at={26.3}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", gap: 14 }}>
          <div style={{ flex: 1 }}>
            <Row icon={Icon.apps} label="Software a la medida" at={at("Software") - 0.1} />
          </div>
          <div style={{ flex: 1 }}>
            <Row icon={Icon.sparkle} label="Agentes de IA" at={at("agentes") - 0.1} />
          </div>
        </div>
        <ConnectLines at={at("conectado")} />
        <Row icon={Icon.database} label="Tus sistemas actuales" note="Todo conectado entre sí" at={at("Todo") - 0.2} />
        <div style={{ display: "flex", gap: 14, marginTop: 6 }}>
          <In at={tManual - 0.1} style={{ flex: 1 }}>
            <Chip strike={t > tManual + 0.5}>Trabajo manual</Chip>
          </In>
          <In at={tOrden - 0.6} style={{ flex: 1 }}>
            <Chip hot>Información ordenada</Chip>
          </In>
        </div>
      </div>
    </Panel>
  );
};

const ConnectLines: React.FC<{ at: number }> = ({ at: a }) => {
  const t = useT();
  const p = interpolate(t, [a - 0.3, a + 0.4], [0, 1], { easing: omna.ease.out, ...clamp });
  const pulse = (t * 1.2) % 1;
  return (
    <svg width={604} height={46} style={{ display: "block" }}>
      {[150, 452].map((x) => (
        <g key={x}>
          <line x1={x} y1={0} x2={x} y2={46} stroke={omna.colors.orange} strokeWidth={3} strokeDasharray="4 8" opacity={p} />
          <circle cx={x} cy={pulse * 46} r={5} fill={omna.colors.orange} opacity={p} />
        </g>
      ))}
    </svg>
  );
};

const Chip: React.FC<{ children: React.ReactNode; hot?: boolean; strike?: boolean }> = ({ children, hot, strike }) => (
  <div
    style={{
      padding: "14px 18px",
      borderRadius: 14,
      textAlign: "center",
      fontFamily: omna.fonts.sans,
      fontWeight: omna.weight.demibold,
      fontSize: 24,
      color: hot ? omna.colors.white : omna.colors.textMuted,
      background: hot ? "rgba(254,101,29,0.14)" : "rgba(223,195,244,0.05)",
      border: `1px solid ${hot ? omna.colors.orange : omna.colors.borderSubtle}`,
      textDecoration: strike ? "line-through" : undefined,
      opacity: strike ? 0.45 : 1,
    }}
  >
    {children}
  </div>
);

// 4 · the brain: one layer that joins every source
const Brain: React.FC = () => {
  const t = useT();
  const tName = at("cerebro.");
  const src: [React.ReactNode, string, number][] = [
    [Icon.database, "Sistemas", at("sistemas", 0, 40)],
    [Icon.mail, "Correos", at("correos,")],
    [Icon.doc, "Documentos", at("documentos")],
    [Icon.chat, "Conversaciones", at("conversaciones.")],
  ];
  const named = interpolate(t, [tName - 0.2, tName + 0.5], [0, 1], { easing: omna.ease.out, ...clamp });
  const cx = 302;
  const cy = 330;
  return (
    <Panel eyebrow="Lo mejor" title={<>Una capa que junta <Grad>todos tus datos</Grad>.</>} at={39.6}>
      <div style={{ position: "relative", height: 420 }}>
        <svg width={604} height={466} style={{ position: "absolute", inset: 0 }}>
          {src.map(([, , s], i) => {
            const x = 75 + i * 151;
            const p = interpolate(t, [s, s + 0.5], [0, 1], { easing: omna.ease.out, ...clamp });
            return <line key={i} x1={x} y1={110} x2={x + (cx - x) * p} y2={110 + (cy - 70 - 110) * p} stroke="#954ACC" strokeWidth={2.5} opacity={0.9} />;
          })}
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, display: "flex", justifyContent: "space-between" }}>
          {src.map(([ic, l, s]) => (
            <In key={l} at={s - 0.1} style={{ width: 140, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <Tile icon={ic} size={66} />
              <div style={{ fontFamily: omna.fonts.sans, fontWeight: omna.weight.medium, fontSize: 19, color: omna.colors.lilac }}>{l}</div>
            </In>
          ))}
        </div>
        <In at={at("capa") - 0.1} style={{ position: "absolute", left: cx - 150, top: cy - 70, width: 300 }}>
          <div
            style={{
              height: 140,
              borderRadius: 26,
              background: omna.gradient.brand,
              boxShadow: `0 0 ${30 + 30 * named}px ${omna.colors.glowViolet}, 0 0 ${40 * named}px ${omna.colors.glowOrange}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Img src={staticFile("omna/brand/logos/omna-mark-white.png")} style={{ width: 54, position: "absolute", left: 24, opacity: 0.9 }} />
            <div
              style={{
                fontFamily: omna.fonts.sans,
                fontWeight: omna.weight.bold,
                fontSize: 40,
                color: omna.colors.white,
                marginLeft: 46,
                opacity: named,
                transform: `translateY(${(1 - named) * 10}px)`,
              }}
            >
              El cerebro
            </div>
          </div>
        </In>
      </div>
    </Panel>
  );
};

// 5 · what it shows: new metrics, forecasts, real-time alerts (no figures — nothing invented)
const LiveView: React.FC = () => {
  const t = useT();
  const tMet = at("Métricas");
  const tPron = at("pronósticos");
  const tAlert = at("alertas");
  const tOld = at("reporte");
  const tToday = at("hoy.", 0, 60);
  const line = interpolate(t, [tMet, tMet + 1.2], [0, 1], { easing: omna.ease.out, ...clamp });
  const fc = interpolate(t, [tPron, tPron + 0.8], [0, 1], { easing: omna.ease.out, ...clamp });
  const blink = 0.55 + 0.45 * Math.abs(Math.sin(t * 3));
  return (
    <Panel eyebrow="Lo que te muestra" title={<>Lo que antes era <Grad>imposible ver</Grad>.</>} at={49.4}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <In at={tMet - 0.15}>
          <div style={{ padding: "18px 20px 10px", borderRadius: 18, background: "rgba(223,195,244,0.05)", border: `1px solid ${omna.colors.borderSubtle}` }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Eyebrow color={omna.colors.lilac}>Métricas nuevas</Eyebrow>
              <Eyebrow color={fc > 0 ? omna.colors.orange : "transparent"}>Pronóstico</Eyebrow>
            </div>
            <svg width={560} height={170} viewBox="0 0 560 170" style={{ display: "block", marginTop: 6 }}>
              {[40, 85, 130].map((y) => (
                <line key={y} x1={0} x2={560} y1={y} y2={y} stroke="rgba(223,195,244,0.12)" strokeWidth={1} />
              ))}
              <path d="M0 140 C 60 128, 90 120, 140 112 S 230 96, 280 92 S 350 70, 380 66" fill="none" stroke="#954ACC" strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - line} />
              <path d="M380 66 C 430 58, 480 46, 560 30" fill="none" stroke={omna.colors.orange} strokeWidth={4} strokeLinecap="round" strokeDasharray="3 10" opacity={fc} />
              <circle cx={380} cy={66} r={7} fill={omna.colors.orange} opacity={line} />
            </svg>
          </div>
        </In>
        <In at={tAlert - 0.1}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "16px 20px",
              borderRadius: 16,
              border: `1px solid ${omna.colors.orange}`,
              background: "rgba(254,101,29,0.10)",
            }}
          >
            <div style={{ width: 14, height: 14, borderRadius: 7, background: omna.colors.orange, opacity: blink, boxShadow: `0 0 14px ${omna.colors.glowOrange}` }} />
            <div style={{ width: 34, height: 34, color: omna.colors.orange }}>{Icon.bell}</div>
            <div style={{ fontFamily: omna.fonts.sans, fontWeight: omna.weight.demibold, fontSize: 28, color: omna.colors.white }}>
              Alertas en <Grad>tiempo real</Grad>
            </div>
          </div>
        </In>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
          <In at={tOld - 0.1} style={{ flex: 1 }}>
            <Chip strike={t > tToday}>Reporte de hace 2 semanas</Chip>
          </In>
          <In at={tToday - 0.5}>
            <svg width={40} height={40} viewBox="0 0 40 40">
              <path d="M6 20h26M22 10l10 10-10 10" fill="none" stroke={omna.colors.orange} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </In>
          <In at={tToday - 0.4} style={{ flex: 1 }}>
            <Chip hot>Lo que pasa hoy</Chip>
          </In>
        </div>
      </div>
    </Panel>
  );
};

// 6 · free the time of the people who know the operation best
const FreeTime: React.FC = () => {
  const t = useT();
  const tFree = at("liberas");
  const tGrow = at("crecer");
  const freed = t > tFree + 0.3;
  return (
    <Panel eyebrow="Tu equipo" title={<>Quien mejor conoce tu <Grad>operación</Grad>.</>} at={64.2}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", gap: 14 }}>
          <In at={at("captura") - 0.1} style={{ flex: 1 }}>
            <Chip strike={freed}>Capturar</Chip>
          </In>
          <In at={at("concilia") - 0.1} style={{ flex: 1 }}>
            <Chip strike={freed}>Conciliar</Chip>
          </In>
        </div>
        <In at={tFree} dist={10}>
          <div style={{ textAlign: "center", fontFamily: omna.fonts.sans, fontWeight: omna.weight.medium, fontSize: 24, color: omna.colors.lilac, padding: "6px 0" }}>
            Si le liberas ese tiempo
          </div>
        </In>
        <Arrow at={tFree + 0.3} />
        <In at={tGrow - 0.3}>
          <div
            style={{
              padding: "26px 24px",
              borderRadius: 18,
              background: omna.gradient.brand,
              boxShadow: `0 0 50px ${omna.colors.glowViolet}`,
              display: "flex",
              alignItems: "center",
              gap: 18,
            }}
          >
            <div style={{ width: 52, height: 52, color: omna.colors.white }}>{Icon.chart}</div>
            <div style={{ fontFamily: omna.fonts.sans, fontWeight: omna.weight.bold, fontSize: 32, lineHeight: 1.1, color: omna.colors.white }}>
              Lo que de verdad hace crecer tu negocio.
            </div>
          </div>
        </In>
      </div>
    </Panel>
  );
};

// 7 · strategy: which time to free, and where to move it
const Strategy: React.FC = () => (
  <Panel eyebrow="Más que proveedores de software" title={<>Te acompañamos en la <Grad>estrategia</Grad>.</>} at={at("acompañamos") - 0.3}>
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Row icon={Icon.clock} label="¿Qué tiempo liberar?" at={at("qué", 0, 77.5) - 0.2} />
      <Arrow at={at("liberar") - 0.1} />
      <Row icon={Icon.route} label="¿A dónde moverlo?" at={at("liberar") + 0.1} hot />
    </div>
  </Panel>
);

// CTA: fill the form below; Manuel writes on WhatsApp and you book the call
const Cta: React.FC = () => {
  const t = useT();
  const tAg = at("Agenda");
  const glow = t > tAg ? 0.6 + 0.4 * Math.abs(Math.sin((t - tAg) * 3)) : 0.6;
  return (
    <Panel eyebrow="Hablemos" title={<>Llena el <Grad>formulario</Grad>.</>} at={93.7}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <In at={at("formulario") - 0.1}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              padding: "22px 30px",
              borderRadius: omna.radius.pill,
              background: omna.colors.orange,
              boxShadow: `0 0 ${36 * glow}px ${omna.colors.glowOrange}`,
              fontFamily: omna.fonts.sans,
              fontWeight: omna.weight.bold,
              fontSize: 32,
              color: omna.colors.white,
            }}
          >
            Llena el formulario de aquí abajo
            <svg width={30} height={30} viewBox="0 0 40 40">
              <path d="M20 6v26M10 22l10 10 10-10" fill="none" stroke={omna.colors.white} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </In>
        <Row icon={Icon.chat} label="Te escribo por WhatsApp" note="En menos de 24 horas" at={at("WhatsApp") - 0.3} />
        <Row icon={Icon.check} label="Y agendamos" at={at("agendamos.") - 0.15} hot />
      </div>
    </Panel>
  );
};

// small chip over Manuel for "the first call is free" (said in the video)
const FirstCall: React.FC = () => (
  <In at={at("primera") - 0.1} dist={14} style={{ position: "absolute", left: omna.layout.gutter, top: 96 }}>
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 22px",
        borderRadius: omna.radius.pill,
        background: "rgba(22,2,33,0.7)",
        border: `1px solid ${omna.colors.orange}`,
        fontFamily: omna.fonts.sans,
        fontWeight: omna.weight.demibold,
        fontSize: 26,
        color: omna.colors.white,
      }}
    >
      <div style={{ width: 28, height: 28, color: omna.colors.orange }}>{Icon.phone}</div>
      La primera llamada es sin costo
    </div>
  </In>
);

// ---------------- captions (OMNA plate, one gradient keyword) ----------------
const Captions: React.FC = () => {
  const t = useT();
  const c = CHUNKS.find((x) => t >= x.from && t < x.to);
  if (!c || t >= BASE_DUR) return null;
  const p = interpolate(t - c.from, [0, 0.2], [0, 1], { easing: omna.ease.out, ...clamp });
  const out = interpolate(t, [c.to - 0.1, c.to], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: omna.layout.captionBottom, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          maxWidth: 1240,
          padding: "12px 30px 14px",
          borderRadius: omna.radius.plate,
          background: omna.colors.captionPlate,
          backdropFilter: "blur(10px)",
          border: `1px solid ${omna.colors.borderSubtle}`,
          textAlign: "center",
          textWrap: "balance",
          fontFamily: omna.fonts.sans,
          fontWeight: omna.weight.medium,
          fontSize: 40,
          lineHeight: 1.3,
          color: omna.colors.white,
          opacity: p * out,
          transform: `translateY(${(1 - p) * 10}px)`,
        }}
      >
        {c.words.map((w, i) => (
          <React.Fragment key={i}>
            {w.hl ? <Grad>{w.w}</Grad> : w.w}
            {i < c.words.length - 1 ? " " : null}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// ---------------- brand bits ----------------
const Bug: React.FC = () => {
  const t = useT();
  const o = interpolate(t, [0.4, 1.2, BASE_DUR - 0.6, BASE_DUR], [0, 0.75, 0.75, 0], clamp);
  return <Img src={staticFile("omna/brand/logos/omna-mark-white.png")} style={{ position: "absolute", top: 56, right: omna.layout.gutter, width: 64, opacity: o }} />;
};

const EndCard: React.FC = () => {
  const t = useT() - BASE_DUR;
  const p = interpolate(t, [0, 0.5], [0, 1], { easing: omna.ease.out, ...clamp });
  const r = (d: number) => interpolate(t, [d, d + 0.6], [0, 1], { easing: omna.ease.out, ...clamp });
  const rise = (k: number): React.CSSProperties => ({ opacity: k, transform: `translateY(${(1 - k) * 24}px)` });
  return (
    <AbsoluteFill style={{ opacity: p }}>
      <BrandField src="omna/brand/gradients/omna-gradient-2.jpg" dim={0.3} />
      <div style={{ position: "absolute", left: 160, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={rise(r(0.3))}>
          <Eyebrow>Hablemos</Eyebrow>
        </div>
        <div style={{ marginTop: 26, fontFamily: omna.fonts.sans, fontWeight: omna.weight.bold, fontSize: 104, lineHeight: 1.02, letterSpacing: omna.tracking.tight, color: omna.colors.white }}>
          <div style={rise(r(0.45))}>
            Llena el <Grad>formulario</Grad>.
          </div>
        </div>
        <div style={{ marginTop: 26, fontFamily: omna.fonts.sans, fontWeight: omna.weight.regular, fontSize: 36, color: omna.colors.textSecondary, ...rise(r(0.7)) }}>
          Te escribo por WhatsApp y agendamos.
        </div>
        <div style={{ marginTop: 56, display: "flex", alignItems: "center", gap: 28, ...rise(r(1.0)) }}>
          <Img src={staticFile("omna/brand/logos/omna-logo-white.png")} style={{ width: 230 }} />
          <div style={{ width: 1, height: 44, background: omna.colors.borderSubtle }} />
          <Eyebrow color={omna.colors.lilac}>Tecnología Omnipresente</Eyebrow>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// music bed under the voice: present at the open and the end card, ducked while Manuel talks
const musicVolume = (f: number) => {
  const t = f / OMNA2_FPS;
  if (t < 0.8) return interpolate(t, [0, 0.8], [0.0, 0.16]);
  if (t < BASE_DUR - 0.4) return interpolate(t, [0.8, 1.6], [0.16, 0.07], clamp);
  return interpolate(t, [BASE_DUR - 0.4, BASE_DUR + 0.6, BASE_DUR + END - 0.8, BASE_DUR + END], [0.07, 0.3, 0.3, 0], clamp);
};

// ---------------- composition ----------------
export const OmnaManuel: React.FC = () => (
  <AbsoluteFill style={{ background: omna.colors.ink }}>
    <Audio src={staticFile(SRC)} />
    <Audio src={staticFile("omna2/audio/music.wav")} volume={musicVolume} />
    <Camera />
    <Bug />

    <Win from={0.6} to={5.6}>
      <LowerThirdAbs />
    </Win>

    <Win from={2.2} to={13.3}>
      <KeepWhatYouHave />
    </Win>
    <Win from={14.7} to={21.1}>
      <Diagnosis />
    </Win>
    <Win from={26.3} to={37.25}>
      <BuildOnTop />
    </Win>
    <Win from={39.6} to={49.3}>
      <Brain />
    </Win>
    <Win from={49.4} to={61.25}>
      <LiveView />
    </Win>
    <Win from={64.2} to={at("acompañamos") - 0.4}>
      <FreeTime />
    </Win>
    <Win from={at("acompañamos") - 0.3} to={80.39}>
      <Strategy />
    </Win>
    <Win from={82.6} to={88.38}>
      <FirstCall />
    </Win>
    <Win from={93.7} to={BASE_DUR}>
      <Cta />
    </Win>

    <Captions />
    <Win from={BASE_DUR} to={BASE_DUR + END}>
      <EndCard />
    </Win>
    <BrandGrain opacity={0.05} />
  </AbsoluteFill>
);

// LowerThird animates from its own frame 0 and exits at its sequence end; give it that clock.
const LowerThirdAbs: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <SequenceClock from={Math.round(0.6 * fps)} dur={Math.round(5 * fps)}>
      <LowerThird name="Manuel Guerrero" role="CEO de Omna" />
    </SequenceClock>
  );
};
const SequenceClock: React.FC<{ from: number; dur: number; children: React.ReactNode }> = ({ from, dur, children }) => (
  <Sequence from={from} durationInFrames={dur} layout="none">
    {children}
  </Sequence>
);
