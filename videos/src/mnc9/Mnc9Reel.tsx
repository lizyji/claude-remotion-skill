import React, { createContext, useContext } from "react";
import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { makeCaptions, type Word } from "../mnc/captionsCore";
import { mnc } from "../mnc/mncTheme";
import { Sfx, Win, useT, type SfxKind } from "../mnc4/Kit";
import { k9 } from "./k9Theme";
import words from "./words.json";

// "UPS: una milla al día" — Manuel NoCode reel, split screen (B-roll top, Manuel bottom),
// captions on the boundary. Real material: B1 is a free Pexels clip (generic trucks, no
// UPS branding), B5 a real FreightWaves headline capture with its source. Maps, routes,
// numbers and icons are generic animations. Numbers exactly as in the script.

export const MNC9_FPS = 30;
const SRC = "mnc9/clips/base.mp4";
const MUSIC = "mnc9/audio/music.wav";
const CAP = (f: string) => staticFile(`mnc9/captures/${f}`);
const BASE_DUR = 71.47;
const END_HOLD = 1.2;
export const MNC9_TOTAL_F = Math.round((BASE_DUR + END_HOLD) * MNC9_FPS);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const C = k9.c;
const SRC_UPS = "Fuente: proyecciones de UPS";

const KEYWORDS: string[][] = [
  ["50", "millones"],
  ["100", "millones"],
  ["una", "sola", "milla"],
  ["una", "milla"],
  ["100", "entregas"],
  ["ninguna", "persona"],
  ["mejor", "le", "parecía"],
  ["orion"],
  ["mejor", "ruta"],
  ["jugada"],
  ["camiones"],
  ["choferes"],
  ["escondido"],
  ["datos"],
  ["ups"],
  ["repartes"],
  ["vendedores"],
  ["fabricas"],
  ["ia"],
  ["paradas"],
  ["horarios"],
  ["tráfico"],
  ["todo"],
];
const { CHUNKS, at } = makeCaptions(words as Word[], KEYWORDS, { maxWords: 5, maxChars: 24, maxMerged: 28 });

// ---------------- timeline (s on the trimmed take) ----------------
const T = {
  b2: at("una") - 0.12,
  full1: at("50") - 0.1,
  full1end: at("año.") + 0.45,
  b3: at("Piensa") - 0.1,
  b4: at("formas") - 0.1,
  b5: at("Entonces") - 0.1,
  b6: at("Toma") - 0.1,
  b7: at("UPS", 0, 34) - 0.1,
  full2: at("100", 0, 37) - 0.1,
  full2end: at("año.", 0, 38.5) + 0.45,
  b8: at("Pero") - 0.1,
  b9: at("UPS", 0, 41) - 0.1,
  b10: at("Y", 0, 51) - 0.1,
  b11: at("Pedidos,") - 0.12,
  b12: at("Una", 0, 64) - 0.1,
  b13: at("Si", 0, 66.5) - 0.12,
  end: BASE_DUR + END_HOLD,
};
const FULL: [number, number][] = [
  [T.full1, T.full1end],
  [T.full2, T.full2end],
  [T.b12, T.b13],
];
// joins of the trimmed take (s on the cut) — the camera alternates framing on each one
const SEGS = [9.236, 8.859, 3.5, 3.682, 9.469, 6.529, 10.258, 8.738, 4.598, 6.602];
const JOINS = SEGS.slice(0, -1).map((_, i) => SEGS.slice(0, i + 1).reduce((a, b) => a + b, 0));

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
    const inn = interpolate(t, [a, a + 0.28], [0, 1], { easing: k9.ease.out, ...clamp });
    const out = interpolate(t, [b - 0.3, b], [1, 0], { easing: k9.ease.inOut, ...clamp });
    if (t >= a - 0.01 && t < b) f = Math.max(f, Math.min(inn, out));
  }
  return f;
};
const Panel: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useFullness();
  const h = k9.panelH + (1920 - k9.panelH) * f;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: h, background: C.green, overflow: "hidden" }}>
      <PanelCtx.Provider value={h}>{children}</PanelCtx.Provider>
    </div>
  );
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
// content box: below the IG top UI, above the footer; in full screen it centres in the whole frame
const Stage: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 24 }) => {
  const h = usePanelH();
  const bottom = h > 1200 ? 300 : h - k9.footerTop + 20;
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: k9.contentTop, bottom, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap }}>
      {children}
    </div>
  );
};
const Footer: React.FC<{ text: string }> = ({ text }) => {
  const h = usePanelH();
  const top = h > 1200 ? 1700 : k9.footerTop;
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top, textAlign: "center", fontFamily: k9.f.body, fontWeight: k9.w.medium, fontSize: 24, color: C.gray }}>
      {text}
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
    }}
  >
    {children}
  </div>
);
// counts up to `to` between s0 and s1, Spanish formatting with thin spaces off
const useCount = (to: number, s0: number, s1: number) => {
  const t = useT();
  return interpolate(t, [s0, s1], [0, to], { easing: k9.ease.out, ...clamp });
};

// ---------------- the city map (generic) ----------------
// deterministic pseudo-random stops on a street grid, inside the panel content zone
const rnd = (() => {
  let s = 20260611;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
})();
const MAP = { x0: 70, y0: 196, w: 940, h: 600 };
const STOPS: [number, number][] = Array.from({ length: 112 }, () => [MAP.x0 + 30 + rnd() * (MAP.w - 60), MAP.y0 + 30 + rnd() * (MAP.h - 60)]);
const TANGLE = [...STOPS.keys()].sort(() => rnd() - 0.5);
const dist = (a: number, b: number) => Math.hypot(STOPS[a][0] - STOPS[b][0], STOPS[a][1] - STOPS[b][1]);
const ROUTE = (() => {
  // nearest neighbour from the depot (left-most stop), then 2-opt until no crossing gain
  const left = STOPS.reduce((bi, p, i) => (p[0] < STOPS[bi][0] ? i : bi), 0);
  const rest = new Set(STOPS.keys());
  const r = [left];
  rest.delete(left);
  while (rest.size) {
    const last = r[r.length - 1];
    let best = -1;
    for (const j of rest) if (best < 0 || dist(last, j) < dist(last, best)) best = j;
    r.push(best);
    rest.delete(best);
  }
  for (let pass = 0, improved = true; improved && pass < 40; pass++) {
    improved = false;
    for (let i = 1; i < r.length - 2; i++)
      for (let k = i + 1; k < r.length - 1; k++) {
        const d = dist(r[i - 1], r[k]) + dist(r[i], r[k + 1]) - dist(r[i - 1], r[i]) - dist(r[k], r[k + 1]);
        if (d < -0.01) {
          r.splice(i, k - i + 1, ...r.slice(i, k + 1).reverse());
          improved = true;
        }
      }
  }
  return r;
})();
const pathOf = (order: number[]) => order.map((i, n) => `${n ? "L" : "M"}${STOPS[i][0].toFixed(1)},${STOPS[i][1].toFixed(1)}`).join(" ");
const lenOf = (order: number[]) => order.slice(1).reduce((s, i, n) => s + dist(order[n], i), 0);
const TANGLE_D = pathOf(TANGLE);
const TANGLE_L = lenOf(TANGLE);
const ROUTE_D = pathOf(ROUTE);
const ROUTE_L = lenOf(ROUTE);

const Streets: React.FC = () => (
  <g stroke={C.white} strokeWidth={10} strokeLinecap="round">
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <line key={`h${i}`} x1={MAP.x0} x2={MAP.x0 + MAP.w} y1={MAP.y0 + 20 + i * 93} y2={MAP.y0 + 20 + i * 93 + (i % 2 ? 18 : -12)} />
    ))}
    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
      <line key={`v${i}`} y1={MAP.y0} y2={MAP.y0 + MAP.h} x1={MAP.x0 + 30 + i * 110} x2={MAP.x0 + 30 + i * 110 + (i % 3 === 0 ? 30 : -10)} />
    ))}
    <path d={`M${MAP.x0} ${MAP.y0 + 470} C ${MAP.x0 + 300} ${MAP.y0 + 380}, ${MAP.x0 + 600} ${MAP.y0 + 560}, ${MAP.x0 + MAP.w} ${MAP.y0 + 420}`} strokeWidth={22} fill="none" />
  </g>
);
const CityMap: React.FC<{ dots: number; tangle?: number; tangleOpacity?: number; route?: number; children?: React.ReactNode }> = ({ dots, tangle = 0, tangleOpacity = 1, route = 0, children }) => (
  <svg width={1080} height={960} viewBox="0 0 1080 960" style={{ position: "absolute", left: 0, top: 0 }}>
    <rect x={MAP.x0} y={MAP.y0} width={MAP.w} height={MAP.h} rx={22} fill={C.green} stroke={C.black} strokeWidth={2} />
    <Streets />
    {tangle > 0 && (
      <path d={TANGLE_D} fill="none" stroke={C.black} strokeWidth={2.2} strokeLinejoin="round" strokeDasharray={`${TANGLE_L * tangle} ${TANGLE_L}`} opacity={tangleOpacity} />
    )}
    {route > 0 && <path d={ROUTE_D} fill="none" stroke={C.orange} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={`${ROUTE_L * route} ${ROUTE_L}`} />}
    {STOPS.slice(0, Math.floor(dots)).map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={7.5} fill={C.orange} stroke={C.black} strokeWidth={1.6} />
    ))}
    {children}
  </svg>
);

// ---------------- B-rolls ----------------
// T1 · B1 — truck on a highway (free Pexels clip, generic trucks, no UPS branding)
const B1: React.FC = () => (
  <>
    <OffthreadVideo src={staticFile("mnc9/stock/b1_truck.mp4")} muted style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 960 }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 760, display: "flex", justifyContent: "center" }}>
      <Chip dark size={26}>
        Video: Pexels (licencia libre)
      </Chip>
    </div>
  </>
);

// T1 · B2 — "1 milla = hasta $50 millones al año", counting (full screen on the number)
const B2: React.FC = () => {
  const v = useCount(50, at("hasta") - 0.1, at("millones") + 0.15);
  const h = usePanelH();
  const k = interpolate(h, [960, 1920], [1, 1.25]);
  const eq = usePop(at("se", 0, 4.5) - 0.05, "pop");
  return (
    <>
      <Stage gap={10}>
        <Rise at={T.b2 + 0.02} kind="pop">
          <Title size={150 * k}>
            1 <O>milla</O>
          </Title>
        </Rise>
        <div style={{ opacity: eq, transform: `scale(${0.9 + 0.1 * eq})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <Body size={40 * k} weight={k9.w.semibold}>
            = hasta
          </Body>
          <div style={{ fontFamily: k9.f.title, fontWeight: k9.w.bold, fontSize: 132 * k, lineHeight: 1, color: C.orange, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
            ${Math.round(v)} millones
          </div>
          <Body size={40 * k} weight={k9.w.semibold}>
            de dólares al año
          </Body>
        </div>
      </Stage>
      <Footer text={SRC_UPS} />
    </>
  );
};

// T2 · B3 — city map, 100+ orange stops appearing
const B3: React.FC = () => {
  const t = useT();
  const n = interpolate(t, [T.b3 + 0.2, at("entregas") + 0.3], [0, STOPS.length], { easing: k9.ease.out, ...clamp });
  return (
    <>
      <CityMap dots={n} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 820, display: "flex", justifyContent: "center" }}>
        <Rise at={at("100") - 0.1} kind="pop">
          <Chip dark>
            +<O>100</O> entregas al día
          </Chip>
        </Rise>
      </div>
    </>
  );
};

// T2 · B4 — tangled black lines joining the stops at random
const B4: React.FC = () => {
  const t = useT();
  const tg = interpolate(t, [T.b4 + 0.1, at("mejor.") + 0.2], [0, 1], { easing: k9.ease.inOut, ...clamp });
  return (
    <>
      <CityMap dots={STOPS.length} tangle={tg} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 820, display: "flex", justifyContent: "center" }}>
        <Rise at={at("Así") - 0.1} kind="pop">
          <Chip dark>
            Cada chofer: <O>a ojo</O>
          </Chip>
        </Rise>
      </div>
    </>
  );
};

// T3 · B5 — "ORION" + the real FreightWaves headline (source underneath)
const B5: React.FC = () => (
  <>
    <Stage gap={34}>
      <Rise at={at("ORION.") - 0.15} kind="pop">
        <Title size={150}>
          <O>ORION</O>
        </Title>
      </Rise>
      <Rise at={T.b5 + 0.05} kind="snappy">
        <div style={{ width: 900, background: C.white, border: `2px solid ${C.black}`, borderRadius: 18, overflow: "hidden" }}>
          <Img src={CAP("b5_freightwaves.png")} style={{ width: "100%", display: "block" }} />
        </div>
      </Rise>
    </Stage>
    <Footer text="Fuente: FreightWaves, 14 dic 2018" />
  </>
);

// T3 · B6 — data in, tangle out, one clean orange route (key moment)
const B6: React.FC = () => {
  const t = useT();
  const calc = at("calcula") - 0.1;
  const fade = interpolate(t, [calc, calc + 0.6], [1, 0.12], clamp);
  const rt = interpolate(t, [calc + 0.3, at("día.", 0, 34) + 0.2], [0, 1], { easing: k9.ease.inOut, ...clamp });
  return (
    <>
      <CityMap dots={STOPS.length} tangle={1} tangleOpacity={fade} route={rt} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 820, display: "flex", justifyContent: "center", gap: 14 }}>
        <Rise at={at("paradas,") - 0.1} kind="pop">
          <Chip>Paradas</Chip>
        </Rise>
        <Rise at={at("horarios,") - 0.1} kind="pop">
          <Chip>Horarios</Chip>
        </Rise>
        <Rise at={at("tráfico") - 0.1} kind="pop">
          <Chip>Tráfico</Chip>
        </Rise>
        <Rise at={at("mejor", 0, 32) - 0.1} kind="pop">
          <Chip orange>Mejor ruta</Chip>
        </Rise>
      </div>
    </>
  );
};

// T3 · B7 — "100 millones de millas al año" counting (full screen on the number)
const B7: React.FC = () => {
  const v = useCount(100, T.b7 + 0.3, at("millones", 0, 37) + 0.3);
  const h = usePanelH();
  const k = interpolate(h, [960, 1920], [1, 1.3]);
  return (
    <>
      <Stage gap={6}>
        <Rise at={T.b7 + 0.05}>
          <Body size={36 * k} weight={k9.w.semibold}>
            Con el sistema completo
          </Body>
        </Rise>
        <div style={{ fontFamily: k9.f.title, fontWeight: k9.w.bold, fontSize: 190 * k, lineHeight: 1, color: C.orange, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
          {Math.round(v)}
        </div>
        <Title size={64 * k}>millones de millas</Title>
        <Body size={38 * k} weight={k9.w.semibold}>
          al año
        </Body>
      </Stage>
      <Footer text={SRC_UPS} />
    </>
  );
};

// T4 · B8 — "Aquí está la jugada", zoom hit
const B8: React.FC = () => {
  const p = usePop(at("jugada.") - 0.12, "pop");
  const pre = usePop(T.b8 + 0.02);
  return (
    <Stage gap={0}>
      <div style={{ opacity: pre }}>
        <Title size={70}>Aquí está</Title>
      </div>
      <div style={{ transform: `scale(${interpolate(p, [0, 1], [1.8, 1])})`, opacity: Math.min(1, p * 2) }}>
        <Title size={150} color={C.orange}>
          la jugada
        </Title>
      </div>
    </Stage>
  );
};

// T4 · B9 — "No más camiones. No más choferes." struck → "Mejores decisiones con los mismos datos"
const Struck: React.FC<{ at: number; strike: number; children: React.ReactNode }> = ({ at: a, strike, children }) => {
  const t = useT();
  const s = interpolate(t, [strike, strike + 0.35], [0, 1], { easing: k9.ease.out, ...clamp });
  return (
    <Rise at={a} kind="pop">
      <div style={{ position: "relative", opacity: 1 - 0.55 * s }}>
        <Title size={76}>{children}</Title>
        <div style={{ position: "absolute", left: -12, top: "50%", height: 10, width: `calc(${s * 100}% + 24px)`, background: C.orange }} />
      </div>
    </Rise>
  );
};
const B9: React.FC = () => {
  const strike = at("El", 0, 44) - 0.05;
  const good = at("Solo") - 0.1;
  return (
    <Stage gap={22}>
      <Struck at={at("camiones") - 0.15} strike={strike}>
        No más camiones.
      </Struck>
      <Struck at={at("contrató") - 0.15} strike={strike + 0.25}>
        No más choferes.
      </Struck>
      <Rise at={at("escondido") - 0.1}>
        <Body size={34} color={C.gray} weight={k9.w.semibold}>
          El dinero estaba en sus datos
        </Body>
      </Rise>
      <Rise at={good} kind="pop">
        <div style={{ background: C.black, borderRadius: 22, padding: "18px 34px" }}>
          <Title size={58} color={C.white}>
            Mejores decisiones con <O>los mismos datos</O>
          </Title>
        </div>
      </Rise>
    </Stage>
  );
};

// T5 · B10 — three icons: delivery truck · sales rep on the road · factory
const IcoTruck = (
  <svg viewBox="0 0 120 90" width="100%" height="100%" fill="none" stroke={C.black} strokeWidth={6} strokeLinejoin="round">
    <rect x={6} y={14} width={66} height={48} rx={6} fill={C.white} />
    <path d="M72 30h22l18 18v14H72z" fill={C.orange} />
    <circle cx={28} cy={70} r={11} fill={C.white} />
    <circle cx={92} cy={70} r={11} fill={C.white} />
  </svg>
);
const IcoRep = (
  <svg viewBox="0 0 120 120" width="100%" height="100%" fill="none" stroke={C.black} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round">
    <circle cx={46} cy={30} r={16} fill={C.white} />
    <path d="M16 104c0-24 13-40 30-40s30 16 30 40" fill={C.white} />
    <rect x={64} y={70} width={38} height={28} rx={5} fill={C.orange} />
    <path d="M75 70v-7h16v7" />
    <path d="M86 18c-8 0-14 6-14 13 0 10 14 22 14 22s14-12 14-22c0-7-6-13-14-13z" fill={C.orange} />
  </svg>
);
const IcoFactory = (
  <svg viewBox="0 0 120 110" width="100%" height="100%" fill="none" stroke={C.black} strokeWidth={6} strokeLinejoin="round">
    <path d="M8 102V52l28 16V52l28 16V52l28 16V20h18v82z" fill={C.white} />
    <rect x={24} y={80} width={14} height={14} fill={C.orange} />
    <rect x={52} y={80} width={14} height={14} fill={C.orange} />
    <rect x={80} y={80} width={14} height={14} fill={C.orange} />
  </svg>
);
const IconCard: React.FC<{ at: number; icon: React.ReactNode; label: string }> = ({ at: a, icon, label }) => (
  <Rise at={a} kind="pop">
    <div style={{ width: 270, height: 300, background: C.white, border: `2px solid ${C.black}`, borderRadius: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
      <div style={{ width: 150, height: 130 }}>{icon}</div>
      <Body size={30} weight={k9.w.semibold}>
        {label}
      </Body>
    </div>
  </Rise>
);
const B10: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 0, right: 0, top: 230, display: "flex", justifyContent: "center", gap: 26 }}>
      <IconCard at={at("repartes,") - 0.12} icon={IcoTruck} label="Reparto" />
      <IconCard at={at("vendedores") - 0.12} icon={IcoRep} label="Vendedores en ruta" />
      <IconCard at={at("fabricas") - 0.12} icon={IcoFactory} label="Fábrica por pedido" />
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 590, display: "flex", justifyContent: "center" }}>
      <Rise at={at("tiempos") - 0.1} kind="pop">
        <Chip dark size={34}>
          Tiempos de entrega → <O>en tus datos</O>
        </Chip>
      </Rise>
    </div>
  </>
);

// T5 · B11 — an order sheet (generic) that turns into a map with a route
const ROWS: [number, number][] = [
  [180, 260],
  [150, 300],
  [200, 230],
  [170, 280],
  [190, 250],
];
const MINI: [number, number][] = [
  [230, 640],
  [380, 520],
  [520, 600],
  [650, 470],
  [820, 560],
];
const B11: React.FC = () => {
  const t = useT();
  const ia = at("Hoy") - 0.1;
  const morph = interpolate(t, [ia, ia + 0.5], [0, 1], { easing: k9.ease.inOut, ...clamp });
  const rt = interpolate(t, [ia + 0.4, at("leerlos.") + 0.3], [0, 1], { easing: k9.ease.inOut, ...clamp });
  const cols = [at("Pedidos,"), at("direcciones,"), at("horarios.", 0, 60)];
  const d = MINI.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
  return (
    <>
      <div style={{ position: "absolute", left: 140, top: 210, width: 800, opacity: 1 - morph, transform: `scale(${1 - 0.1 * morph})` }}>
        <div style={{ background: C.white, border: `2px solid ${C.black}`, borderRadius: 20, overflow: "hidden" }}>
          <div style={{ display: "flex", background: C.black, color: C.white, fontFamily: k9.f.body, fontWeight: k9.w.semibold, fontSize: 28 }}>
            {["Pedido", "Dirección", "Horario"].map((h, i) => (
              <div key={h} style={{ flex: i === 1 ? 2 : 1, padding: "12px 18px", opacity: interpolate(t, [cols[i] - 0.1, cols[i] + 0.1], [0.25, 1], clamp) }}>
                {h}
              </div>
            ))}
          </div>
          {ROWS.map(([a, b], r) => (
            <div key={r} style={{ display: "flex", borderTop: `2px solid ${C.green}`, padding: "16px 0" }}>
              {[60, b, 110].map((w, i) => (
                <div key={i} style={{ flex: i === 1 ? 2 : 1, padding: "0 18px", opacity: interpolate(t, [cols[i] + r * 0.05, cols[i] + 0.15 + r * 0.05], [0, 1], clamp) }}>
                  <div style={{ width: i === 0 ? 60 : i === 1 ? a + 40 : w, height: 16, borderRadius: 8, background: i === 2 ? C.orange : C.gray, opacity: i === 2 ? 1 : 0.55 }} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <svg width={1080} height={960} style={{ position: "absolute", left: 0, top: 0, opacity: morph }}>
        <rect x={140} y={400} width={800} height={380} rx={22} fill={C.green} stroke={C.black} strokeWidth={2} />
        <g stroke={C.white} strokeWidth={10}>
          {[460, 540, 620, 700].map((y) => (
            <line key={y} x1={140} x2={940} y1={y} y2={y + 10} />
          ))}
          {[260, 420, 580, 740].map((x) => (
            <line key={x} x1={x} x2={x - 15} y1={400} y2={780} />
          ))}
        </g>
        <path d={d} fill="none" stroke={C.orange} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${rt} 1`} />
        {MINI.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={12} fill={C.orange} stroke={C.black} strokeWidth={2.5} />
        ))}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 250, display: "flex", justifyContent: "center", opacity: morph }}>
        <Rise at={at("IA", 0, 62) - 0.1} kind="pop">
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Chip orange size={40}>
              IA
            </Chip>
            <Title size={56}>lee tus datos</Title>
          </div>
        </Rise>
      </div>
    </>
  );
};

// T6 · B12 — "1 milla" giant (full screen)
const B12: React.FC = () => {
  const p = usePop(T.b12 + 0.02, "pop");
  const t = useT();
  return (
    <Stage gap={10}>
      <div style={{ transform: `scale(${interpolate(p, [0, 1], [1.6, 1])})`, opacity: Math.min(1, p * 2) }}>
        <Title size={260} color={C.orange}>
          1 milla
        </Title>
      </div>
      <div style={{ opacity: interpolate(t, [at("eso") - 0.1, at("eso") + 0.15], [0, 1], clamp) }}>
        <Title size={84}>al día. Eso fue todo.</Title>
      </div>
    </Stage>
  );
};

// T6 · B13 — fixed closing phrase, full screen
const B13: React.FC = () => {
  const t = useT();
  const p = interpolate(t, [T.b13, T.b13 + 0.3], [0, 1], { easing: k9.ease.out, ...clamp });
  const ws = "Si todavía no sabes cómo implementar IA en tu negocio, esta cuenta es para ti.".split(" ");
  const W = (words as Word[]).filter((w) => w.s >= T.b13 - 0.05);
  return (
    <AbsoluteFill style={{ background: C.green, opacity: p, justifyContent: "center", alignItems: "center", padding: "0 96px" }}>
      <div style={{ fontFamily: k9.f.title, fontWeight: k9.w.bold, fontSize: 92, lineHeight: 1.08, letterSpacing: "-0.02em", color: C.black, textAlign: "center", textWrap: "balance", marginTop: -80 }}>
        {ws.map((w, i) => {
          const s = W[i]?.s ?? T.b13;
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

// ---------------- Manuel (bottom half) ----------------
export const CAM_Y = 520; // first source row shown in the lower half (1080×1920 take)
const Manuel: React.FC = () => {
  const t = useT();
  const k = JOINS.filter((j) => t >= j).length;
  const s = k % 2 === 1 ? 1.12 : 1;
  return (
    <div style={{ position: "absolute", left: 0, top: 960, width: 1080, height: 960, overflow: "hidden", background: C.black }}>
      <div style={{ position: "absolute", left: 0, top: -CAM_Y, width: 1080, height: 1920, transform: `scale(${s})`, transformOrigin: `540px ${CAM_Y + 420}px` }}>
        <OffthreadVideo src={staticFile(SRC)} muted style={{ width: 1080, height: 1920 }} />
      </div>
    </div>
  );
};

// ---------------- captions: big, white with black outline, on the boundary ----------------
const HIDE: [number, number][] = [...FULL, [T.b13 - 0.05, T.end]];
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
  [T.b2, "whoosh"],
  [at("50") - 0.05, "pop"],
  [T.b3, "whoosh"],
  [T.b4, "swoosh-soft"],
  [at("Así") - 0.1, "click"],
  [T.b5, "whoosh"],
  [at("ORION.") - 0.15, "pop"],
  [T.b6, "swoosh-soft"],
  [at("paradas,") - 0.1, "tick"],
  [at("horarios,") - 0.1, "tick"],
  [at("tráfico") - 0.1, "tick"],
  [at("mejor", 0, 32) - 0.1, "pop"],
  [T.b7, "whoosh"],
  [at("millones", 0, 37) + 0.3, "pop"],
  [at("jugada.") - 0.12, "pop"],
  [T.b9, "whoosh"],
  [at("El", 0, 44) - 0.05, "click"],
  [at("Solo") - 0.1, "pop"],
  [T.b10, "whoosh"],
  [at("repartes,") - 0.12, "pop"],
  [at("vendedores") - 0.12, "pop"],
  [at("fabricas") - 0.12, "pop"],
  [T.b11, "swoosh-soft"],
  [at("Hoy") - 0.1, "whoosh"],
  [T.b12, "pop"],
  [T.b13, "whoosh"],
];

// ---------------- composition ----------------
const ROLLS: [number, number, React.FC][] = [
  [0, T.b2, B1],
  [T.b2, T.b3, B2],
  [T.b3, T.b4, B3],
  [T.b4, T.b5, B4],
  [T.b5, T.b6, B5],
  [T.b6, T.b7, B6],
  [T.b7, T.b8, B7],
  [T.b8, T.b9, B8],
  [T.b9, T.b10, B9],
  [T.b10, T.b11, B10],
  [T.b11, T.b12, B11],
  [T.b12, T.b13, B12],
];

export const Mnc9Broll: React.FC<{ i: number }> = ({ i }) => {
  const [from, to, Comp] = ROLLS[i];
  return (
    <AbsoluteFill style={{ background: C.green }}>
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
export const MNC9_ROLLS = ROLLS.map(([a, b]) => [a, b] as [number, number]);
export const MNC9_CLOSING_FROM = T.b13;

export const Mnc9Reel: React.FC = () => {
  // music bed: low under the voice, up a touch on the full-screen beats, out at the end
  const vol = (f: number) => {
    const s = f / MNC9_FPS;
    const full = FULL.some(([a, b]) => s >= a && s < b) ? 0.11 : 0.07;
    return full * interpolate(s, [T.end - 1.0, T.end], [1, 0], clamp);
  };
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <Audio src={staticFile(SRC)} />
      <Audio src={staticFile(MUSIC)} volume={vol} />
      <Manuel />
      <Panel>
        {ROLLS.map(([a, b, Comp], i) => (
          <Win key={i} from={a} to={b}>
            <Comp />
          </Win>
        ))}
      </Panel>
      <BoundaryCaptions />
      <Win from={T.b13} to={T.end}>
        <B13 />
      </Win>
      <Sfx cues={SFX()} />
    </AbsoluteFill>
  );
};
