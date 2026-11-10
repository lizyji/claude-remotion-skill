import React, { createContext, useContext } from "react";
import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { makeCaptions, type Word } from "../mnc/captionsCore";
import { mnc } from "../mnc/mncTheme";
import { Sfx, Win, useT, type SfxKind } from "../mnc4/Kit";
import { k9 } from "../mnc9/k9Theme";
import words from "./words.json";

// "Presentaciones de venta (Gong)" — Manuel NoCode reel. Built on the Mnc9 reference style
// (captions, palette, type, rhythm, SFX) plus the client's new creative rules:
//   · more REAL B-roll (free Pexels clips with no visible brands, the real Gong page),
//   · less literal split screen: the top panel FADES into Manuel ("split"), and some beats put
//     the real B-roll full-frame behind Manuel framed in the foreground ("bg").
// Real material only as real captures with the source underneath; numbers as in the script.

export const MNC10_FPS = 30;
const SRC = "mnc10/clips/base.mp4";
const MUSIC = "mnc10/audio/music.wav";
const CAP = (f: string) => staticFile(`mnc10/captures/${f}`);
const STOCK = (f: string) => staticFile(`mnc10/stock/${f}.mp4`);
const BASE_DUR = 65.6;
const END_HOLD = 1.2;
export const MNC10_TOTAL_F = Math.round((BASE_DUR + END_HOLD) * MNC10_FPS);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const C = k9.c;
const SRC_GONG = "Fuente: Gong · gong.io/blog/sales-demos";

const KEYWORDS: string[][] = [
  ["mejor", "momento"],
  ["cómo", "terminó"],
  ["67", "mil"],
  ["76", "segundos"],
  ["casi", "de", "nada"],
  ["qué", "problema"],
  ["sus", "palabras"],
  ["resultado", "final"],
  ["dos", "o", "tres"],
  ["jugada"],
  ["sus", "datos"],
  ["genérico"],
  ["minutos"],
  ["ia"],
  ["sus", "números"],
  ["cállate"],
  ["tu", "equipo"],
  ["alguna", "pregunta"],
  ["siguiente", "junta"],
  ["gong"],
  ["vendedor"],
  ["40"],
  ["historia"],
];
const { CHUNKS, at } = makeCaptions(words as Word[], KEYWORDS, { maxWords: 5, maxChars: 24, maxMerged: 28 });

// ---------------- timeline (s on the trimmed take) ----------------
const T = {
  b2: at("tu", 0, 3) - 0.1, // "…de tu presentación de ventas"
  b3: at("Gong,") - 0.1,
  b4: at("revisó") - 0.1,
  sSales: at("que", 0, 13.8) - 0.1, // "…que terminara en venta donde el vendedor hablara"
  b5: at("más", 0, 16) - 0.1, // "más de 76 segundos seguidos"
  sNotes: at("Entonces,") - 0.1,
  b6: at("hasta") - 0.1,
  b7: at("Dos,", 0, 22) - 0.1,
  b8: at("Tres,") - 0.1,
  b9: at("Y", 0, 30.5) - 0.1,
  b10: at("Pero") - 0.1,
  b11: at("El", 0, 37.5) - 0.1,
  sTyping: at("Le") - 0.1,
  b12: at("Y", 0, 49) - 0.1,
  sTeam: at("¿qué", 0, 51.5) - 0.1,
  b13: at("Y", 0, 54.5) - 0.05,
  b14: at("Si") - 0.12,
  end: BASE_DUR + END_HOLD,
};
const FULL: [number, number][] = [
  [T.b5, T.sNotes],
  [T.b10, T.b11],
];
// windows where real B-roll fills the frame behind Manuel (composition "bg")
const BG: [number, number, string][] = [
  [0, T.b2, "presenter"],
  [T.sTyping, T.b12, "typing"],
  [T.sTeam, T.b13, "team"],
];
// step number pinned top-left while Manuel explains it
const STEPS: [number, number, string][] = [
  [at("uno,") - 0.1, T.b7, "1"],
  [T.b7, T.b8, "2"],
  [T.b8, T.b9, "3"],
  [T.b9, T.b10, "4"],
];
const SEGS = [7.74, 10.26, 1.01, 9.58, 2.61, 4.71, 18.71, 10.85];
const JOINS = SEGS.slice(0, -1).map((_, i) => SEGS.slice(0, i + 1).reduce((a, b) => a + b, 0));

// ---------------- shared helpers ----------------
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
  <Sequence from={Math.round(from * MNC10_FPS)} layout="none">
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

// ---------------- B-rolls ----------------
// T1 · B1 — real presentation in a meeting room (bg) with slides flying past and fading
const SlideCard: React.FC<{ w: number; dark?: boolean; lit?: boolean; label?: string }> = ({ w, dark, lit, label }) => (
  <div
    style={{
      width: w,
      height: w * 0.58,
      background: lit ? C.orange : dark ? C.black : C.white,
      border: `2px solid ${C.black}`,
      borderRadius: 12,
      padding: w * 0.08,
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap: w * 0.04,
    }}
  >
    {label ? (
      <div style={{ fontFamily: k9.f.title, fontWeight: k9.w.bold, fontSize: w * 0.13, lineHeight: 1.05, color: C.white, textAlign: "center" }}>{label}</div>
    ) : (
      [0.7, 0.9, 0.5].map((f, i) => <div key={i} style={{ width: `${f * 100}%`, height: w * 0.045, borderRadius: 99, background: dark ? C.white : C.gray, opacity: dark ? 0.7 : 0.35 }} />)
    )}
  </div>
);
const B1: React.FC = () => {
  const t = useT();
  return (
    <>
      {Array.from({ length: 9 }).map((_, i) => {
        const s = 0.25 + i * 0.26;
        const x = interpolate(t, [s, s + 1.3], [1100, -420], clamp);
        const o = interpolate(t, [s, s + 0.2, s + 0.9, s + 1.3], [0, 1, 0.6, 0], clamp);
        return (
          <div key={i} style={{ position: "absolute", left: x, top: 560 + (i % 3) * 110, opacity: o, transform: `rotate(${(i % 2 ? -1 : 1) * 3}deg)` }}>
            <SlideCard w={300} dark={i % 3 === 1} />
          </div>
        );
      })}
    </>
  );
};

// T1 · B2 — all slides fade; only "Mejor momento" and "Final" stay lit
const B2: React.FC = () => {
  const t = useT();
  const fade = interpolate(t, [T.b2 + 0.4, at("dos") - 0.1], [1, 0.18], clamp);
  const best = usePop(at("mejor") - 0.1, "pop");
  const fin = usePop(at("terminó.") - 0.15, "pop");
  const lit: Record<number, [number, string]> = { 4: [best, "Mejor momento"], 11: [fin, "Final"] };
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top: 230, display: "grid", gridTemplateColumns: "repeat(4, 210px)", gap: 14, justifyContent: "center" }}>
      {Array.from({ length: 12 }).map((_, i) => {
        const l = lit[i];
        const p = l ? l[0] : 0;
        return (
          <div key={i} style={{ opacity: l ? Math.max(fade, p) : fade, transform: `scale(${1 + 0.12 * p})`, zIndex: l ? 2 : 1 }}>
            <SlideCard w={210} lit={p > 0.05} label={p > 0.05 ? l?.[1] : undefined} dark={!l && i % 5 === 2} />
          </div>
        );
      })}
    </div>
  );
};

// T2 · B3 — real Gong page: logo + article headline (source underneath)
const B3: React.FC = () => (
  <>
    <Stage gap={30}>
      <Rise at={T.b3 + 0.02} kind="pop">
        <div style={{ background: C.white, border: `2px solid ${C.black}`, borderRadius: 18, padding: "16px 26px" }}>
          <Img src={CAP("gong_logo.svg")} style={{ height: 110, display: "block" }} />
        </div>
      </Rise>
      <Rise at={at("analiza") - 0.1} kind="snappy">
        <Shot src="b3_gong_head.png" w={900} />
      </Rise>
      <Rise at={at("llamadas") - 0.1}>
        <Chip dark>Analiza llamadas de venta</Chip>
      </Rise>
    </Stage>
    <Footer text={SRC_GONG} />
  </>
);

// T2 · B4 — "67,149 demos" counting up + the real sentence from Gong's article
const B4: React.FC = () => {
  const t = useT();
  const v = interpolate(t, [T.b4 + 0.2, at("demos") + 0.2], [0, 67149], { easing: k9.ease.out, ...clamp });
  return (
    <>
      <Stage gap={18}>
        <div style={{ fontFamily: k9.f.title, fontWeight: k9.w.bold, fontSize: 170, lineHeight: 1, letterSpacing: "-0.03em", color: C.orange, fontVariantNumeric: "tabular-nums" }}>
          {Math.round(v).toLocaleString("en-US")}
        </div>
        <Title size={64}>demos analizadas</Title>
        <Rise at={at("no", 0, 12.4) - 0.1}>
          <Shot src="b4_gong_67149.png" w={860} />
        </Rise>
      </Stage>
      <Footer text={SRC_GONG} />
    </>
  );
};

// T2 · real salesman talking to a customer ("donde el vendedor hablara…")
const SSales: React.FC = () => <StockFill name="salesman" from={T.sSales} label="El vendedor hablando…" />;

// T2 · B5 — stopwatch that stops at 76 s, red line "máximo hablando seguido" (full screen)
const B5: React.FC = () => {
  const t = useT();
  const stop = at("segundos") + 0.1;
  const v = interpolate(t, [T.b5 + 0.1, stop], [0, 76], { easing: k9.ease.out, ...clamp });
  const h = usePanelH();
  const k = interpolate(h, [960, 1920], [0.85, 1.15]);
  const R = 150 * k;
  const ang = (v / 120) * 360;
  const line = usePop(at("seguidos.") - 0.1, "pop");
  return (
    <>
      <Stage gap={26}>
        <svg width={2 * R + 40} height={2 * R + 70} viewBox={`${-R - 20} ${-R - 50} ${2 * R + 40} ${2 * R + 70}`}>
          <rect x={-22} y={-R - 48} width={44} height={30} rx={6} fill={C.black} />
          <circle r={R} fill={C.white} stroke={C.black} strokeWidth={8} />
          <path d={`M0 0 L0 ${-R + 14} A ${R - 14} ${R - 14} 0 ${ang > 180 ? 1 : 0} 1 ${(R - 14) * Math.sin((ang * Math.PI) / 180)} ${-(R - 14) * Math.cos((ang * Math.PI) / 180)} Z`} fill={C.orange} opacity={0.9} />
          <text y={R * 0.18} textAnchor="middle" fontFamily={k9.f.title} fontWeight={700} fontSize={R * 0.62} fill={C.black}>
            {Math.round(v)} s
          </text>
        </svg>
        <div style={{ position: "relative", opacity: line }}>
          <div style={{ position: "absolute", left: -20, right: -20, top: "50%", height: 8, background: C.orange, transform: `scaleX(${line})` }} />
          <div style={{ position: "relative", background: C.black, borderRadius: 999, padding: "10px 30px" }}>
            <Body size={36 * k} color={C.white} weight={k9.w.semibold}>
              máximo hablando seguido
            </Body>
          </div>
        </div>
        <Rise at={at("seguidos.") + 0.1}>
          <Shot src="b5_gong_76s.png" w={860} />
        </Rise>
      </Stage>
      <Footer text={SRC_GONG} />
    </>
  );
};

// T3 · real meeting, someone taking notes ("no presentes nada hasta saber qué problema tiene")
const SNotes: React.FC = () => <StockFill name="notes" from={T.sNotes} />;

// T3 · B6 — "1 · Primero el problema": a magnifier over a notepad
const B6: React.FC = () => {
  const t = useT();
  const mx = interpolate(t, [T.b6, at("problema") + 0.2], [-140, 60], { easing: k9.ease.inOut, ...clamp });
  return (
    <Stage gap={28} top={300}>
      <div style={{ position: "relative", width: 520, height: 330 }}>
        <Card style={{ position: "absolute", inset: 0, padding: "34px 40px", display: "flex", flexDirection: "column", gap: 22 }}>
          {[0.9, 0.7, 0.85, 0.5].map((f, i) => (
            <div key={i} style={{ width: `${f * 100}%`, height: 16, borderRadius: 99, background: i === 2 ? C.orange : C.gray, opacity: i === 2 ? 1 : 0.35 }} />
          ))}
        </Card>
        <svg width={220} height={220} viewBox="0 0 120 120" style={{ position: "absolute", left: 200 + mx, top: 70 }}>
          <circle cx={48} cy={48} r={34} fill={C.white} fillOpacity={0.35} stroke={C.black} strokeWidth={9} />
          <path d="M74 74 L108 108" stroke={C.black} strokeWidth={14} strokeLinecap="round" />
        </svg>
      </div>
      <Rise at={at("problema") - 0.15} kind="pop">
        <Title size={70}>
          Primero <O>el problema</O>
        </Title>
      </Rise>
    </Stage>
  );
};

// T3 · B7 — "2 · Empieza con sus palabras": the client's bubble (example) beats your company's story
const B7: React.FC = () => {
  const t = useT();
  const strike = interpolate(t, [at("historia") - 0.05, at("historia") + 0.3], [0, 1], clamp);
  return (
    <Stage gap={26} top={300}>
      <Rise at={at("empieza") - 0.1} kind="pop" style={{ alignSelf: "flex-start", marginLeft: 120 }}>
        <div style={{ background: C.white, border: `2px solid ${C.black}`, borderRadius: 30, borderBottomLeftRadius: 6, padding: "20px 30px" }}>
          <Body size={40} weight={k9.w.semibold}>
            “Quiero entregar <O>más rápido</O>”
          </Body>
        </div>
        <Body size={22} color={C.gray}>
          (ejemplo)
        </Body>
      </Rise>
      <Rise at={at("resultado") - 0.1}>
        <Title size={62}>
          Empieza con <O>sus palabras</O>
        </Title>
      </Rise>
      <Rise at={at("historia") - 0.2}>
        <div style={{ position: "relative", opacity: 1 - 0.5 * strike }}>
          <Chip>La historia de tu empresa</Chip>
          <div style={{ position: "absolute", left: -10, top: "50%", height: 8, width: `calc(${strike * 100}% + 20px)`, background: C.orange }} />
        </div>
      </Rise>
    </Stage>
  );
};

// T4 · B8 — "3 · Resultado primero": a finished dashboard screen (generic)
const B8: React.FC = () => {
  const t = useT();
  const g = interpolate(t, [T.b8 + 0.2, at("primero.", 0, 29) + 0.3], [0, 1], { easing: k9.ease.out, ...clamp });
  const bars = [0.35, 0.5, 0.45, 0.7, 0.8, 1];
  return (
    <Stage gap={26} top={290}>
      <Card style={{ width: 760, padding: 26, display: "flex", gap: 22 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
          {[C.orange, C.black, C.gray].map((c, i) => (
            <div key={i} style={{ background: C.green, borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ width: 70, height: 10, borderRadius: 99, background: C.gray, opacity: 0.4 }} />
              <div style={{ marginTop: 8, width: 110 * g, height: 22, borderRadius: 6, background: c }} />
            </div>
          ))}
        </div>
        <div style={{ flex: 2, background: C.green, borderRadius: 12, padding: 18, display: "flex", alignItems: "flex-end", gap: 16, height: 250 }}>
          {bars.map((b, i) => (
            <div key={i} style={{ flex: 1, height: `${b * 100 * g}%`, background: i === bars.length - 1 ? C.orange : C.black, borderRadius: 6 }} />
          ))}
        </div>
      </Card>
      <Rise at={T.b8 + 0.1} kind="pop">
        <Title size={66}>
          <O>Resultado</O> primero
        </Title>
      </Rise>
    </Stage>
  );
};

// T4 · B9 — "4 · 2 o 3 cosas, no 40": 40 cards collapse to 3
const B9: React.FC = () => {
  const t = useT();
  const cut = interpolate(t, [at("dos", 0, 31) - 0.1, at("tres", 0, 32) + 0.3], [0, 1], { easing: k9.ease.inOut, ...clamp });
  const keep = new Set([5, 18, 27]);
  return (
    <Stage gap={26} top={290}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 64px)", gap: 10 }}>
        {Array.from({ length: 40 }).map((_, i) => {
          const k = keep.has(i);
          return (
            <div
              key={i}
              style={{
                width: 64,
                height: 46,
                borderRadius: 8,
                border: `2px solid ${C.black}`,
                background: k && cut > 0.5 ? C.orange : C.white,
                opacity: k ? 1 : 1 - cut * 0.9,
                transform: `scale(${k ? 1 + 0.35 * cut : 1 - 0.4 * cut})`,
              }}
            />
          );
        })}
      </div>
      <Rise at={at("dos", 0, 31) - 0.1} kind="pop">
        <Title size={68}>
          <O>2 o 3 cosas</O>, no 40
        </Title>
      </Rise>
    </Stage>
  );
};

// T5 · B10 — "Aquí está la jugada", zoom hit (full screen beat)
const B10: React.FC = () => {
  const p = usePop(at("jugada.") - 0.12, "pop");
  const pre = usePop(T.b10 + 0.02);
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

// T5 · B11 — side by side: "Ejemplo genérico" (gray) vs "Con sus datos" (orange); then "en minutos"
const Screen: React.FC<{ title: string; on?: boolean }> = ({ title, on }) => (
  <div style={{ width: 400, background: C.white, border: `2px solid ${on ? C.orange : C.gray}`, borderRadius: 18, overflow: "hidden" }}>
    <div style={{ background: on ? C.orange : C.gray, color: C.white, fontFamily: k9.f.body, fontWeight: k9.w.semibold, fontSize: 30, padding: "10px 18px" }}>{title}</div>
    <div style={{ padding: 18, display: "flex", alignItems: "flex-end", gap: 12, height: 190 }}>
      {(on ? [0.4, 0.62, 0.55, 0.85, 1] : [0.5, 0.5, 0.5, 0.5, 0.5]).map((b, i) => (
        <div key={i} style={{ flex: 1, height: `${b * 100}%`, background: on ? (i === 4 ? C.orange : C.black) : C.gray, opacity: on ? 1 : 0.35, borderRadius: 5 }} />
      ))}
    </div>
  </div>
);
const B11: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 0, right: 0, top: 250, display: "flex", justifyContent: "center", gap: 30 }}>
      <Rise at={at("genérico.") - 0.3}>
        <Screen title="Ejemplo genérico" />
      </Rise>
      <Rise at={at("datos,", 0, 39) - 0.15} kind="pop">
        <Screen title="Con sus datos" on />
      </Rise>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 590, display: "flex", justifyContent: "center" }}>
      <Rise at={at("minutos.") - 0.3} kind="pop">
        <Chip orange size={36}>
          Se prepara en minutos
        </Chip>
      </Rise>
    </div>
  </>
);

// T5 · real hands typing (bg) + the flow "info de tu cliente → IA → ejemplo con sus números"
const STyping: React.FC = () => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", justifyContent: "center", alignItems: "center", gap: 14 }}>
    <Rise at={at("información") - 0.15} kind="pop">
      <Chip>Info de tu cliente</Chip>
    </Rise>
    <Rise at={at("información") + 0.1}>
      <Body size={40} color={C.white} weight={k9.w.bold}>
        →
      </Body>
    </Rise>
    <Rise at={at("pides") - 0.15} kind="pop">
      <Chip orange>IA</Chip>
    </Rise>
    <Rise at={at("pides") + 0.1}>
      <Body size={40} color={C.white} weight={k9.w.bold}>
        →
      </Body>
    </Rise>
    <Rise at={at("números.") - 0.2} kind="pop">
      <Chip dark>Ejemplo con sus números</Chip>
    </Rise>
  </div>
);

// T5 · B12 — "cállate y pregunta" → the question big (over the real team clip)
const B12: React.FC = () => (
  <Stage gap={26}>
    <Rise at={at("cállate") - 0.12} kind="pop">
      <Title size={110}>
        Cállate<O>…</O>
      </Title>
    </Rise>
    <Rise at={at("pregúntale,") - 0.1}>
      <Title size={70}>
        y <O>pregunta</O>
      </Title>
    </Rise>
  </Stage>
);
const STeam: React.FC = () => (
  <div style={{ position: "absolute", left: 70, right: 70, top: 300, display: "flex", justifyContent: "center" }}>
    <Rise at={T.sTeam + 0.05} kind="pop">
      <Card style={{ padding: "26px 40px", borderRadius: 28 }}>
        <Title size={70}>
          ¿Qué cambiaría esto en <O>tu equipo</O>?
        </Title>
      </Card>
    </Rise>
  </div>
);

// T6 · B13 — "¿Alguna pregunta?" struck → calendar "Siguiente junta ✓"
const B13: React.FC = () => {
  const t = useT();
  const strike = interpolate(t, [at("guarda") - 0.15, at("guarda") + 0.2], [0, 1], { easing: k9.ease.out, ...clamp });
  const tick = usePop(at("siguiente", 0, 59) - 0.05, "pop");
  const last = usePop(at("últimos") - 0.1, "pop");
  return (
    <Stage gap={26}>
      <Rise at={T.b13 + 0.15} kind="pop">
        <div style={{ position: "relative", opacity: 1 - 0.55 * strike }}>
          <Title size={74}>¿Alguna pregunta?</Title>
          <div style={{ position: "absolute", left: -14, top: "50%", height: 10, width: `calc(${strike * 100}% + 28px)`, background: C.orange }} />
        </div>
      </Rise>
      <Card style={{ width: 560, overflow: "hidden", opacity: last, transform: `translateY(${(1 - last) * 30}px)` }}>
        <div style={{ background: C.black, color: C.white, fontFamily: k9.f.body, fontWeight: k9.w.semibold, fontSize: 28, padding: "10px 20px", display: "flex", justifyContent: "space-between" }}>
          <span>Agenda</span>
          <span style={{ color: C.orange }}>últimos 5 min</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, padding: 16 }}>
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} style={{ height: 52, borderRadius: 10, background: i === 9 ? (tick > 0.05 ? C.orange : C.green) : C.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {i === 9 ? <span style={{ color: C.white, fontFamily: k9.f.title, fontWeight: 700, fontSize: 30, transform: `scale(${tick})` }}>✓</span> : null}
            </div>
          ))}
        </div>
      </Card>
      <div style={{ opacity: tick }}>
        <Chip orange size={34}>
          Siguiente junta ✓
        </Chip>
      </div>
    </Stage>
  );
};

// T6 · B14 — fixed closing phrase, full screen
const B14: React.FC = () => {
  const t = useT();
  const p = interpolate(t, [T.b14, T.b14 + 0.3], [0, 1], { easing: k9.ease.out, ...clamp });
  const ws = "Si todavía no sabes cómo implementar IA en tu negocio, esta cuenta es para ti.".split(" ");
  const W = (words as Word[]).filter((w) => w.s >= T.b14 - 0.05);
  return (
    <AbsoluteFill style={{ background: C.green, opacity: p, justifyContent: "center", alignItems: "center", padding: "0 96px" }}>
      <div style={{ fontFamily: k9.f.title, fontWeight: k9.w.bold, fontSize: 92, lineHeight: 1.08, letterSpacing: "-0.02em", color: C.black, textAlign: "center", textWrap: "balance", marginTop: -80 }}>
        {ws.map((w, i) => {
          const s = W[i]?.s ?? T.b14;
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
// "bg" composition: real B-roll fills the frame, Manuel framed in the foreground below the captions
const BgLayer: React.FC = () => {
  const t = useT();
  const w = inWin(t, BG);
  const s = useCamScale();
  if (!w) return null;
  const [a, b, name] = w;
  const o = ramp(t, a, b, a === 0 ? 0.001 : 0.3);
  const local = t - a;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <StockVid name={name} from={a} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, objectFit: "cover", transform: `scale(${1.04 + local * 0.01})` }} />
      <div style={{ position: "absolute", left: 70, top: 1010, width: 940, height: 800, borderRadius: 40, overflow: "hidden", border: `5px solid ${C.white}`, background: C.black }}>
        <div style={{ position: "absolute", left: -70, top: -(CAM_Y + 60), width: 1080, height: 1920, transform: `scale(${s})`, transformOrigin: `540px ${CAM_Y + 420}px` }}>
          <OffthreadVideo src={staticFile(SRC)} muted style={{ width: 1080, height: 1920 }} />
        </div>
      </div>
    </AbsoluteFill>
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
const StepBadge: React.FC = () => {
  const t = useT();
  const w = inWin(t, STEPS);
  if (!w) return null;
  const [a, b, n] = w;
  const p = ramp(t, a, b, 0.2);
  return (
    <div style={{ position: "absolute", left: 60, top: 214, width: 96, height: 96, borderRadius: 20, background: C.orange, border: `3px solid ${C.black}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: p, transform: `scale(${0.8 + 0.2 * p})` }}>
      <span style={{ fontFamily: k9.f.title, fontWeight: k9.w.bold, fontSize: 64, color: C.white, lineHeight: 1 }}>{n}</span>
    </div>
  );
};

// ---------------- captions: big, white with black outline, on the boundary ----------------
const HIDE: [number, number][] = [...FULL, [T.b14 - 0.05, T.end]];
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
  [0.2, "whoosh"],
  [T.b2, "swoosh-soft"],
  [at("mejor") - 0.1, "pop"],
  [at("terminó.") - 0.15, "pop"],
  [T.b3, "whoosh"],
  [T.b4, "swoosh-soft"],
  [at("demos") + 0.2, "pop"],
  [T.sSales, "whoosh"],
  [T.b5, "whoosh"],
  [at("segundos") + 0.1, "click"],
  [T.sNotes, "swoosh-soft"],
  [T.b6, "swoosh-soft"],
  [T.b7, "whoosh"],
  [at("empieza") - 0.1, "pop"],
  [at("historia") - 0.05, "click"],
  [T.b8, "whoosh"],
  [T.b9, "whoosh"],
  [at("dos", 0, 31) - 0.1, "tick"],
  [at("jugada.") - 0.12, "pop"],
  [at("datos,", 0, 39) - 0.15, "pop"],
  [at("minutos.") - 0.3, "tick"],
  [T.sTyping, "whoosh"],
  [at("pides") - 0.15, "pop"],
  [T.b12, "swoosh-soft"],
  [T.sTeam, "whoosh"],
  [T.b13, "swoosh-soft"],
  [at("guarda") - 0.15, "click"],
  [at("siguiente", 0, 59) - 0.05, "pop"],
  [T.b14, "whoosh"],
];

// ---------------- composition ----------------
// top-panel B-rolls; "transparent" windows let the bg layer (real B-roll behind Manuel) show through
const ROLLS: [number, number, React.FC, boolean?][] = [
  [0, T.b2, B1, true],
  [T.b2, T.b3, B2],
  [T.b3, T.b4, B3],
  [T.b4, T.sSales, B4],
  [T.sSales, T.b5, SSales],
  [T.b5, T.sNotes, B5],
  [T.sNotes, T.b6, SNotes],
  [T.b6, T.b7, B6],
  [T.b7, T.b8, B7],
  [T.b8, T.b9, B8],
  [T.b9, T.b10, B9],
  [T.b10, T.b11, B10],
  [T.b11, T.sTyping, B11],
  [T.sTyping, T.b12, STyping, true],
  [T.b12, T.sTeam, B12],
  [T.sTeam, T.b13, STeam, true],
  [T.b13, T.b14, B13],
];

export const Mnc10Broll: React.FC<{ i: number }> = ({ i }) => {
  const [from, to, Comp, transparent] = ROLLS[i];
  const bg = BG.find(([a]) => a === from);
  return (
    <AbsoluteFill style={{ background: C.green }}>
      <SoloCtx.Provider value>
        <Panel>
          <Win from={from} to={to}>
            {transparent && bg ? <StockFill name={bg[2]} from={from} /> : null}
            <Comp />
          </Win>
        </Panel>
      </SoloCtx.Provider>
    </AbsoluteFill>
  );
};
export const MNC10_ROLLS = ROLLS.map(([a, b]) => [a, b] as [number, number]);

export const Mnc10Reel: React.FC = () => {
  const vol = (f: number) => {
    const s = f / MNC10_FPS;
    const full = FULL.some(([a, b]) => s >= a && s < b) ? 0.11 : 0.07;
    return full * interpolate(s, [T.end - 1.0, T.end], [1, 0], clamp);
  };
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <Audio src={staticFile(SRC)} />
      <Audio src={staticFile(MUSIC)} volume={vol} />
      <ManuelSplit />
      {ROLLS.map(([a, b, Comp, transparent], i) => (
        <Win key={i} from={a} to={b}>
          {transparent ? (
            <>
              <BgLayer />
              <Panel transparent>
                <Comp />
              </Panel>
            </>
          ) : (
            <Panel>
              <Comp />
            </Panel>
          )}
        </Win>
      ))}
      <StepBadge />
      <BoundaryCaptions />
      <Win from={T.b14} to={T.end}>
        <B14 />
      </Win>
      <Sfx cues={SFX()} />
    </AbsoluteFill>
  );
};
