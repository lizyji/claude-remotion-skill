import React, { createContext, useContext } from "react";
import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { makeCaptions, type Word } from "../mnc/captionsCore";
import { mnc } from "../mnc/mncTheme";
import { Sfx, Win, useT, type SfxKind } from "../mnc4/Kit";
import { k9 } from "../mnc9/k9Theme";
import words from "./words.json";

// "Así automaticé mis ideas de contenido" — Manuel NoCode reel. Mnc10 structure (fading top panel,
// Mnc9 captions/palette/rhythm/SFX) + the client's green-screen rule: on three beats the B-roll fills
// the whole frame and Manuel is a REAL cut-out (RobustVideoMatting, scripts/mnc11-matte.py) — no card.
// The screen recordings B1/B5/B6/B8/B9 were not in the Drive folder → "[Grabación pendiente: B#]" cards.

export const MNC11_FPS = 30;
const SRC = "mnc11/clips/base.mp4";
const MUSIC = "mnc11/audio/music.wav";
const STOCK = (f: string) => staticFile(`mnc11/stock/${f}.mp4`);
const CAP = (f: string) => staticFile(`mnc11/captures/${f}`);
const BASE_DUR = 64.6;
const END_HOLD = 1.2;
export const MNC11_TOTAL_F = Math.round((BASE_DUR + END_HOLD) * MNC11_FPS);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const C = k9.c;

const KEYWORDS: string[][] = [
  ["ideas", "de", "contenido"],
  ["sistema", "de", "ia"],
  ["solo", "apruebo"],
  ["hoja", "en", "blanco"],
  ["domingo"],
  ["publicar"],
  ["claude"],
  ["visitas"],
  ["guardados"],
  ["guion", "completo"],
  ["ganchos"],
  ["grabar"],
  ["esta", "sí"],
  ["reescribe"],
  ["producción"],
  ["jugada"],
  ["yo", "decido"],
  ["apruebe"],
  ["criterio"],
  ["cotizaciones"],
  ["pedidos"],
  ["reportes"],
  ["ideas"],
];
const { CHUNKS, at } = makeCaptions(words as Word[], KEYWORDS, { maxWords: 5, maxChars: 24, maxMerged: 28 });

// ---------------- timeline (s on the trimmed take) ----------------
const T = {
  sys: at("Mis", 0, 4) - 0.1, // "Mis ideas … las saca un sistema de IA y yo solo apruebo"
  c1: at("Antes") - 0.1, // cut-out: blank document (B2) → "¿y ahora qué publico?" (B3)
  b3: at("y", 0, 12.5) - 0.1,
  b4: at("Ahora,", 0, 16) - 0.1,
  b5: at("con", 0, 24.6) - 0.1,
  b6: at("Y", 0, 27) - 0.05,
  b7: at("guion") - 0.1,
  yesno: at("Yo", 0, 33) - 0.1,
  b8: at("Si", 0, 36.5) - 0.1,
  b9: at("Y", 0, 41.5) - 0.1,
  b10: at("Pero", 0, 46) - 0.1,
  c2: at("La", 0, 47.5) - 0.1, // cut-out: "La IA propone. Yo decido."
  crit: at("La", 0, 51.5) - 0.1,
  c3: at("Esto") - 0.1, // cut-out: real team clip + Cotizaciones · Pedidos · Reportes
  close: at("Y", 0, 59.7) - 0.05,
  end: BASE_DUR + END_HOLD,
};
const FULL: [number, number][] = [[T.b10, T.c2]];
// green-screen beats: [from, to, cutout file, its start in s]  (cutout_* made by scripts/mnc11-matte.py)
const CUTOUT: [number, number, string, number][] = [
  [T.c1, T.b4, "problema", 9.0],
  [T.c2, T.crit, "jugada", 47.3],
  [T.c3, T.close, "negocio", 54.2],
];
const SEGS = [15.13, 1.27, 8.41, 2.49, 18.89, 8.72, 5.08, 4.61];
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


// "[Grabación pendiente: B#]" — the client's plan B when a screen recording is missing
const Pending: React.FC<{ id: string; what: string }> = ({ id, what }) => (
  <Stage gap={22}>
    <div
      style={{
        width: 860,
        minHeight: 420,
        border: `4px dashed ${C.black}`,
        borderRadius: 28,
        background: C.green,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        padding: 40,
        boxSizing: "border-box",
      }}
    >
      <Title size={58}>[Grabación pendiente: {id}]</Title>
      <Body size={30} color={C.gray}>
        {what}
      </Body>
    </div>
  </Stage>
);

// ---------------- B-rolls ----------------
// T1 · B1 — real board "Aprobar ideas" (missing → placeholder)
const B1: React.FC = () => <Pending id="B1" what="Tablero “Aprobar ideas” lleno de tarjetas, scroll rápido" />;

// T1 · extra — "un sistema de IA … y yo solo apruebo": ideas flow into an approval check
const Sys: React.FC = () => {
  const t = useT();
  const ok = usePop(at("apruebo.") - 0.15, "pop");
  return (
    <Stage gap={26}>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <Rise at={T.sys + 0.1} kind="pop">
          <Chip orange size={38}>
            Sistema de IA
          </Chip>
        </Rise>
        <Rise at={T.sys + 0.5}>
          <Title size={56}>→</Title>
        </Rise>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[0, 1, 2].map((i) => {
            const s = at("contenido", 0, 5.5) + i * 0.25;
            const p = interpolate(t, [s, s + 0.25], [0, 1], clamp);
            return (
              <div key={i} style={{ opacity: p, transform: `translateX(${(1 - p) * 30}px)` }}>
                <Card style={{ width: 300, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: i === 0 && ok > 0.05 ? C.orange : C.green, border: `2px solid ${C.black}`, color: C.white, fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {i === 0 && ok > 0.05 ? "✓" : ""}
                  </div>
                  <div style={{ flex: 1, height: 12, borderRadius: 99, background: C.gray, opacity: 0.35 }} />
                </Card>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ opacity: ok, transform: `scale(${0.9 + 0.1 * ok})` }}>
        <Title size={72}>
          Yo solo <O>apruebo</O>
        </Title>
      </div>
    </Stage>
  );
};

// T2 · B2/B3 (full-frame background behind Manuel's cut-out) — blank document at Sunday night,
// then "¿y ahora qué publico?" typed and erased twice
const BlankDoc: React.FC = () => {
  const t = useT();
  const caret = Math.floor(t * 2.2) % 2 === 0;
  const q = "¿y ahora qué publico?";
  const s0 = T.b3 + 0.1;
  const cycle = 1.6;
  const k = t - s0;
  let n = 0;
  if (k > 0) {
    const c = Math.min(2, Math.floor(k / cycle));
    const r = k - c * cycle;
    n = c >= 2 ? q.length : r < 0.9 ? Math.round((r / 0.9) * q.length) : Math.round(((cycle - r) / 0.7) * q.length);
    n = Math.max(0, Math.min(q.length, n));
  }
  return (
    <AbsoluteFill style={{ background: C.green }}>
      <div style={{ position: "absolute", left: 90, right: 90, top: 150, height: 1900, background: C.white, border: `2px solid ${C.black}`, borderRadius: 26 }}>
        <div style={{ position: "absolute", right: 34, top: 30, fontFamily: k9.f.body, fontWeight: k9.w.semibold, fontSize: 30, color: C.gray }}>Domingo 11:47 p.m.</div>
        <div style={{ position: "absolute", left: 60, top: 150, fontFamily: k9.f.body, fontWeight: k9.w.semibold, fontSize: 56, color: C.black, whiteSpace: "nowrap" }}>
          {q.slice(0, n)}
          <span style={{ display: "inline-block", width: 5, height: 62, marginLeft: 4, verticalAlign: "-10px", background: C.orange, opacity: caret ? 1 : 0 }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// T3 · B4 — generic video thumbnails, view counters rising, orange ring on the top one
const VIEWS = [12, 48, 7, 310, 22, 95, 18, 160, 31];
const B4: React.FC = () => {
  const t = useT();
  const grow = interpolate(t, [T.b4 + 0.2, at("visitas") + 0.4], [0, 1], { easing: k9.ease.out, ...clamp });
  const ring = usePop(at("visitas") - 0.1, "pop");
  const save = usePop(at("guardados") - 0.1, "pop");
  const top = VIEWS.indexOf(Math.max(...VIEWS));
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 200, display: "grid", gridTemplateColumns: "repeat(3, 230px)", gap: 18, justifyContent: "center" }}>
        {VIEWS.map((v, i) => (
          <Rise key={i} at={T.b4 + 0.05 + i * 0.06} dist={14}>
            <div style={{ position: "relative", height: 178, background: i % 2 ? C.black : C.white, border: `2px solid ${C.black}`, borderRadius: 16, overflow: "visible" }}>
              <div style={{ position: "absolute", left: "50%", top: "42%", transform: "translate(-50%,-50%)", width: 0, height: 0, borderLeft: `26px solid ${i % 2 ? C.white : C.black}`, borderTop: "16px solid transparent", borderBottom: "16px solid transparent" }} />
              <div style={{ position: "absolute", left: 12, bottom: 10, fontFamily: k9.f.body, fontWeight: k9.w.semibold, fontSize: 24, color: i % 2 ? C.white : C.black }}>
                ▶ {Math.round(v * grow)}K
              </div>
              {i === top ? (
                <div style={{ position: "absolute", inset: -14, borderRadius: 26, border: `7px solid ${C.orange}`, opacity: ring, transform: `scale(${1.15 - 0.15 * ring})` }} />
              ) : null}
            </div>
          </Rise>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 818, display: "flex", justifyContent: "center", gap: 14, opacity: Math.max(ring, save) }}>
        <Chip dark size={28}>
          Más visitas
        </Chip>
        <div style={{ opacity: save }}>
          <Chip orange size={28}>
            Más guardados
          </Chip>
        </div>
      </div>
    </>
  );
};

// T3 · B5 — Claude with the idea list and each source (missing → placeholder)
const B5: React.FC = () => <Pending id="B5" what="Claude con la lista de ideas y la fuente de cada una" />;

// T4 · B6 — idea card with the full script in Airtable (missing → placeholder); B7 tags over it
const B6: React.FC = () => <Pending id="B6" what="Tarjeta abierta en Airtable con el guion (scroll lento)" />;
const B7: React.FC = () => (
  <>
    <Pending id="B6" what="Tarjeta abierta en Airtable con el guion (scroll lento)" />
    <div style={{ position: "absolute", left: 0, right: 0, top: 690, display: "flex", justifyContent: "center", gap: 14 }}>
      <Rise at={at("guion") - 0.1} kind="pop">
        <Chip orange>Guion ✓</Chip>
      </Rise>
      <Rise at={at("ganchos") - 0.1} kind="pop">
        <Chip orange>Ganchos ✓</Chip>
      </Rise>
      <Rise at={at("grabar.") - 0.25} kind="pop">
        <Chip orange>Qué grabar ✓</Chip>
      </Rise>
    </div>
  </>
);

// T5 · extra — "esta sí, esta no": two idea cards, one approved, one discarded
const YesNo: React.FC = () => {
  const t = useT();
  const yes = usePop(at("sí,") - 0.1, "pop");
  const no = interpolate(t, [at("no.", 0, 35.5) - 0.1, at("no.", 0, 35.5) + 0.3], [0, 1], { easing: k9.ease.out, ...clamp });
  const card = (label: string, p: number, ok: boolean, x: number) => (
    <div style={{ transform: `translate(${x}px, ${ok ? 0 : no * 60}px) rotate(${ok ? 0 : no * 8}deg)`, opacity: ok ? 1 : 1 - 0.6 * no }}>
      <Card style={{ width: 340, padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
        {[0.9, 0.7, 0.8].map((f, i) => (
          <div key={i} style={{ width: `${f * 100}%`, height: 14, borderRadius: 99, background: C.gray, opacity: 0.35 }} />
        ))}
        <div style={{ alignSelf: "flex-start", opacity: p }}>
          <Chip orange={ok} dark={!ok} size={28}>
            {label}
          </Chip>
        </div>
      </Card>
    </div>
  );
  return (
    <Stage gap={30}>
      <div style={{ display: "flex", gap: 30 }}>
        {card("✓ Esta sí", yes, true, 0)}
        {card("✕ Esta no", no, false, 0)}
      </div>
      <Rise at={at("decido,") - 0.15}>
        <Title size={66}>
          Yo nada más <O>decido</O>
        </Title>
      </Rise>
    </Stage>
  );
};

// T5 · B8 — change request rewritten by the system (missing → placeholder)
const B8: React.FC = () => <Pending id="B8" what="Pedido en “Cambios al copy” y la tarjeta ya reescrita" />;
// T5 · B9 — approve → pipeline (key moment, missing → placeholder held ≥ 3 s)
const B9: React.FC = () => <Pending id="B9" what="Tarjeta a “✅ Aprobada” y aparece en el pipeline (“Banco de ideas”)" />;

// T6 · B10 — "Aquí está la jugada", zoom hit (full screen)
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

// T6 · B11 (full-frame background behind Manuel's cut-out) — "La IA propone → Yo decido"
const Spark = (
  <svg width={46} height={46} viewBox="-50 -50 100 100">
    {[0, 60, 120].map((a) => (
      <line key={a} x1={0} y1={-42} x2={0} y2={42} stroke={C.white} strokeWidth={14} strokeLinecap="round" transform={`rotate(${a})`} />
    ))}
  </svg>
);
const DecideBg: React.FC = () => (
  <AbsoluteFill style={{ background: C.green }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 250, display: "flex", justifyContent: "center", alignItems: "center", gap: 22 }}>
      <Rise at={at("propone,") - 0.15} kind="pop">
        <div style={{ display: "flex", alignItems: "center", gap: 16, background: C.orange, border: `3px solid ${C.black}`, borderRadius: 26, padding: "20px 30px" }}>
          {Spark}
          <Title size={58} color={C.white}>
            La IA propone
          </Title>
        </div>
      </Rise>
      <Rise at={at("pero", 0, 48.3) - 0.1}>
        <Title size={64}>→</Title>
      </Rise>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 410, display: "flex", justifyContent: "center" }}>
      <Rise at={at("decido.") - 0.15} kind="pop">
        <div style={{ display: "flex", alignItems: "center", gap: 16, background: C.black, border: `3px solid ${C.black}`, borderRadius: 26, padding: "20px 30px" }}>
          <Title size={58} color={C.orange}>
            ✓
          </Title>
          <Title size={58} color={C.white}>
            Yo decido
          </Title>
        </div>
      </Rise>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 590, display: "flex", justifyContent: "center" }}>
      <Rise at={at("Nada", 0, 49) - 0.1}>
        <Chip size={34}>Nada se publica sin aprobación</Chip>
      </Rise>
    </div>
  </AbsoluteFill>
);

// T6 · extra — "me quitó la hoja en blanco, pero no el criterio"
const Criterio: React.FC = () => {
  const t = useT();
  const strike = interpolate(t, [at("blanco,", 0, 52) - 0.05, at("blanco,", 0, 52) + 0.3], [0, 1], clamp);
  return (
    <Stage gap={30}>
      <Rise at={T.crit + 0.05}>
        <div style={{ position: "relative", opacity: 1 - 0.5 * strike }}>
          <Title size={74}>Hoja en blanco</Title>
          <div style={{ position: "absolute", left: -14, top: "50%", height: 10, width: `calc(${strike * 100}% + 28px)`, background: C.orange }} />
        </div>
      </Rise>
      <Rise at={at("criterio.") - 0.2} kind="pop">
        <div style={{ background: C.black, borderRadius: 24, padding: "16px 36px" }}>
          <Title size={74} color={C.white}>
            Criterio <O>✓</O>
          </Title>
        </div>
      </Rise>
    </Stage>
  );
};

// T7 · B12 (full-frame real team clip behind Manuel's cut-out) — Cotizaciones · Pedidos · Reportes
const BizBg: React.FC = () => {
  const items: [string, number][] = [
    ["Cotizaciones", at("cotizaciones,")],
    ["Pedidos", at("pedidos")],
    ["Reportes", at("reportes.")],
  ];
  return (
    <AbsoluteFill>
      <StockVid name="team" from={T.c3} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, objectFit: "cover" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 260, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <Rise at={T.c3 + 0.1}>
          <Chip dark size={30}>
            Esto mismo, para:
          </Chip>
        </Rise>
        {items.map(([l, s]) => (
          <Rise key={l} at={s - 0.12} kind="pop">
            <Card style={{ padding: "14px 44px", borderRadius: 22 }}>
              <Title size={62}>{l}</Title>
            </Card>
          </Rise>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// T7 · B13 — fixed closing phrase, full screen
const B13: React.FC = () => {
  const t = useT();
  const p = interpolate(t, [T.close, T.close + 0.3], [0, 1], { easing: k9.ease.out, ...clamp });
  const ws = "Si todavía no sabes cómo implementar IA en tu negocio, esta cuenta es para ti.".split(" ");
  const W = (words as Word[]).filter((w) => w.s >= at("si", 0, 59.9) - 0.05);
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
        <OffthreadVideo src={staticFile(`mnc11/clips/cutout_${name}.webm`)} transparent muted style={{ width: 1080, height: 1920 }} />
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
  [0.15, "whoosh"],
  [T.sys, "swoosh-soft"],
  [at("apruebo.") - 0.15, "pop"],
  [T.c1, "whoosh"],
  [T.b3, "tick"],
  [T.b4, "whoosh"],
  [at("visitas") - 0.1, "pop"],
  [at("guardados") - 0.1, "pop"],
  [T.b5, "swoosh-soft"],
  [T.b6, "swoosh-soft"],
  [at("guion") - 0.1, "tick"],
  [at("ganchos") - 0.1, "tick"],
  [at("grabar.") - 0.25, "tick"],
  [T.yesno, "whoosh"],
  [at("sí,") - 0.1, "pop"],
  [T.b8, "swoosh-soft"],
  [T.b9, "whoosh"],
  [at("jugada.") - 0.12, "pop"],
  [T.c2, "whoosh"],
  [at("decido.") - 0.15, "pop"],
  [T.crit, "swoosh-soft"],
  [at("criterio.") - 0.2, "pop"],
  [T.c3, "whoosh"],
  [at("cotizaciones,") - 0.12, "click"],
  [at("pedidos") - 0.12, "click"],
  [at("reportes.") - 0.12, "click"],
  [T.close, "whoosh"],
];

// ---------------- composition ----------------
// top-panel B-rolls; cut-out windows use a full-frame background instead of the panel
const ROLLS: [number, number, React.FC, ("cut" | undefined)?][] = [
  [0, T.sys, B1],
  [T.sys, T.c1, Sys],
  [T.c1, T.b4, BlankDoc, "cut"],
  [T.b4, T.b5, B4],
  [T.b5, T.b6, B5],
  [T.b6, T.b7, B6],
  [T.b7, T.yesno, B7],
  [T.yesno, T.b8, YesNo],
  [T.b8, T.b9, B8],
  [T.b9, T.b10, B9],
  [T.b10, T.c2, B10],
  [T.c2, T.crit, DecideBg, "cut"],
  [T.crit, T.c3, Criterio],
  [T.c3, T.close, BizBg, "cut"],
];

export const Mnc11Broll: React.FC<{ i: number }> = ({ i }) => {
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
export const MNC11_ROLLS = ROLLS.map(([a, b]) => [a, b] as [number, number]);

export const Mnc11Reel: React.FC = () => {
  const vol = (f: number) => {
    const s = f / MNC11_FPS;
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
        <B13 />
      </Win>
      <Sfx cues={SFX()} />
    </AbsoluteFill>
  );
};
