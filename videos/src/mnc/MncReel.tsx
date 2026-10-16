import React from "react";
import {
  AbsoluteFill,
  Audio,
  Freeze,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { mnc } from "./mncTheme";
import { at } from "./captions";
import { BrandMark, HandArrow, Hl, rise, SectionHeader, Spark, useEnter, useExit } from "./components/Primitives";
import { Captions } from "./components/Captions";
import {
  Agents,
  Apps,
  Ficha,
  Internos,
  Maps,
  Overview,
  Route,
  Summarize,
  Sync,
  Transfer,
  ZapierIntro,
} from "./scenes/Operativos";
import { AnalisisOpener, BrainSolutions, BrainSources, BrainToAI, MemoryChip } from "./scenes/Analisis";

export const MNC_FPS = 30;
const BASE = "mnc/clips/base.mp4";
const BASE_DUR = 116.966; // s — voice track after removing the aside
const END_DUR = 2.5;
export const MNC_TOTAL_F = Math.round((BASE_DUR + END_DUR) * MNC_FPS);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---------------- footage modes (scene cuts measured on base.mp4) ----------------
// The source alternates selfie camera and a phone pointed at a monitor. Monitor
// stretches are rebuilt as MNC graphics; the camera and the Zapier site stay.
type Mode =
  | { kind: "hook" }
  | { kind: "hidden" }
  | { kind: "zapier" }
  | { kind: "cam"; scale: number; y: number; punch?: [number, number] };
const CUTS: [number, Mode][] = [
  [0, { kind: "hook" }],
  [4.833, { kind: "hidden" }],
  [64.9, { kind: "zapier" }],
  [71.7, { kind: "cam", scale: 1.1, y: -150, punch: [at("programación"), 1.06] }], // chin sat on the caption band
  [79.6, { kind: "hidden" }],
  [81.967, { kind: "cam", scale: 1.04, y: 0, punch: [at("para", 0, 84), 1.08] }],
  [85.9, { kind: "hidden" }],
  [107.467, { kind: "cam", scale: 1.0, y: 0 }],
  [111.2, { kind: "cam", scale: 1.0, y: 0, punch: [at("Voy"), 1.08] }],
];
const modeAt = (t: number): [Mode, number] => {
  let m = CUTS[0];
  for (const c of CUTS) if (t >= c[0]) m = c;
  return [m[1], m[0]];
};

const T = {
  zapierCard: at("aquí", 0, 67) - 0.02, // after the logo has settled above
};

// Hide the browser chrome (tabs + bookmarks bar) in the handheld zapier.com shot.
// The phone drifts, so the cut line follows the measured bottom of the bookmarks
// bar (+ margin), in source pixels.
const ZAP_CROP: [number, number][] = [
  [67.4, 215], [67.9, 165], [68.4, 105], [68.9, 110], [69.4, 105],
  [69.9, 120], [70.4, 140], [70.9, 205], [71.2, 245], [71.45, 260], [71.7, 275],
];
const zapierCrop = (t: number) =>
  interpolate(t, ZAP_CROP.map((k) => k[0]), ZAP_CROP.map((k) => k[1]), { easing: mnc.ease.inOut, ...clamp });

const Footage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const [mode] = modeAt(t);
  // picture only — the voice plays from one continuous <Audio> track
  const video = (style: React.CSSProperties) => <OffthreadVideo src={staticFile(BASE)} muted style={style} />;

  if (mode.kind === "cam") {
    const punch = mode.punch
      ? interpolate(t, [mode.punch[0], mode.punch[0] + 0.25], [1, mode.punch[1]], { easing: mnc.ease.out, ...clamp })
      : 1;
    return (
      <AbsoluteFill style={{ overflow: "hidden" }}>
        {video({
          width: 1080,
          height: 1920,
          transform: `translateY(${mode.y}px) scale(${mode.scale * punch})`,
          transformOrigin: "50% 45%",
        })}
        {/* legibility: soft dark falloff behind brand (top) and captions (bottom) */}
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 16%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.62) 82%, rgba(0,0,0,0.72) 100%)" }} />
      </AbsoluteFill>
    );
  }
  if (mode.kind === "hook") {
    // Manuel framed inside an MNC card under the hook title; leaves fast at the cut
    const enter = interpolate(frame, [0, Math.round(fps * 0.35)], [0, 1], { easing: mnc.ease.out, ...clamp });
    const exit = interpolate(t, [4.55, 4.833], [0, 1], { easing: mnc.ease.in, ...clamp });
    const s = 888 / 1080;
    return (
      <div
        style={{
          position: "absolute",
          left: 96,
          top: 650,
          width: 888,
          height: 760,
          borderRadius: 32,
          overflow: "hidden",
          opacity: enter * (1 - exit),
          transform: `translateY(${(1 - enter) * 60 + exit * 40}px) scale(${0.96 + enter * 0.04 - exit * 0.06})`,
          boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
        }}
      >
        {video({ position: "absolute", left: 0, top: -380 * s, width: 888, height: 1920 * s })}
      </div>
    );
  }
  if (mode.kind === "zapier") {
    // the real zapier.com capture, shown as an MNC capture card
    const p = interpolate(t, [T.zapierCard, T.zapierCard + 0.4], [0, 1], { easing: mnc.ease.out, ...clamp });
    const exit = interpolate(t, [71.45, 71.7], [0, 1], { easing: mnc.ease.in, ...clamp });
    const s = 888 / 1080;
    return (
      <div
        style={{
          position: "absolute",
          left: 96,
          top: 520,
          width: 888,
          height: 880,
          borderRadius: 28,
          overflow: "hidden",
          border: `4px solid ${mnc.colors.white}`,
          ...rise(p, 60, exit),
        }}
      >
        {video({ position: "absolute", left: 0, top: -zapierCrop(t) * s, width: 888, height: 1920 * s })}
      </div>
    );
  }
  return null; // monitor stretches: rebuilt as MNC graphics
};

// ---------------- hook ----------------
const HookTitle: React.FC = () => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const exit = useExit(0.28);
  const lines: React.ReactNode[][] = [
    ["Tu", <Hl key="d">dashboard</Hl>],
    ["está", "en", "tu"],
    [<span key="w" style={{ position: "relative", color: mnc.colors.accent }}>WhatsApp.</span>],
  ];
  let k = 0;
  const underline = interpolate(frame, [Math.round(at("WhatsApp.") * fps), Math.round((at("WhatsApp.") + 0.4) * fps)], [0, 1], {
    easing: mnc.ease.out,
    ...clamp,
  });
  return (
    <div style={{ position: "absolute", left: mnc.safe.left, top: 300 }}>
      {lines.map((ln, i) => (
        <div key={i} style={{ display: "flex", gap: 24, height: 104 }}>
          {ln.map((w) => {
            const p = useEnterWord(frame, fps, (k++) * 2);
            return (
              <span
                key={k}
                style={{
                  fontFamily: mnc.fonts.title,
                  fontWeight: mnc.weight.extrabold,
                  fontSize: 100,
                  lineHeight: 1.02,
                  letterSpacing: "-0.025em",
                  color: mnc.colors.white,
                  display: "inline-block",
                  opacity: p * (1 - exit),
                  transform: `translateY(${(1 - p) * 50 - exit * 60}px) scale(${1.12 - 0.12 * p})`,
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
      ))}
      {/* hand-drawn underline under WhatsApp, synced to the spoken word */}
      <svg width={520} height={40} style={{ position: "absolute", left: 0, top: 3 * 104 - 6, opacity: 1 - exit }}>
        <path d="M 6 24 C 140 10, 320 30, 500 14" fill="none" stroke={mnc.colors.accent} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - underline} />
      </svg>
      <div style={{ position: "absolute", left: 760, top: -40, opacity: 1 - exit }}>
        <Spark size={120} delay={0.35} />
      </div>
    </div>
  );
};
const useEnterWord = (frame: number, fps: number, delayFrames: number) =>
  interpolate(frame - delayFrames, [0, Math.round(fps * 0.3)], [0, 1], { easing: mnc.ease.out, ...clamp });

// ---------------- end card: hand-off to the next video ----------------
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shrink = interpolate(frame, [0, Math.round(fps * 0.5)], [0, 1], { easing: mnc.ease.inOut, ...clamp });
  const title = useEnter(0.25, "smooth");
  const s = 888 / 1080;
  // Manuel's last frame shrinks from full screen into a card below the CTA
  const w = interpolate(shrink, [0, 1], [1080, 520]);
  const left = interpolate(shrink, [0, 1], [0, 464]);
  const top = interpolate(shrink, [0, 1], [0, 860]);
  const h = interpolate(shrink, [0, 1], [1920, 560]);
  const radius = interpolate(shrink, [0, 1], [0, 28]);
  return (
    <AbsoluteFill style={{ background: mnc.colors.black }}>
      <div style={{ position: "absolute", left, top, width: w, height: h, borderRadius: radius, overflow: "hidden" }}>
        <Freeze frame={Math.round((BASE_DUR - 0.1) * fps)}>
          <OffthreadVideo
            src={staticFile(BASE)}
            muted
            style={{ position: "absolute", left: 0, top: interpolate(shrink, [0, 1], [0, -300 * s]), width: w, height: w * (1920 / 1080) }}
          />
        </Freeze>
      </div>
      <div
        style={{
          position: "absolute",
          left: mnc.safe.left,
          top: 330,
          width: 760,
          fontFamily: mnc.fonts.title,
          fontWeight: mnc.weight.extrabold,
          fontSize: 92,
          lineHeight: 1.04,
          letterSpacing: "-0.02em",
          color: mnc.colors.white,
          ...rise(title, 50),
        }}
      >
        Síguenos para <Hl>parte 2</Hl>
      </div>
      <div style={{ position: "absolute", left: 150, top: 700 }}>
        <HandArrow w={300} h={300} d="M 20 10 C 0 140, 120 260, 290 250" head={[290, 250, 0]} delay={0.6} />
      </div>
      <div style={{ position: "absolute", left: 860, top: 250 }}>
        <Spark size={110} delay={0.45} />
      </div>
    </AbsoluteFill>
  );
};

// ---------------- composition ----------------
const Seg: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const { fps } = useVideoConfig();
  const a = Math.round(from * fps);
  return (
    <Sequence from={a} durationInFrames={Math.max(1, Math.round(to * fps) - a)} layout="none">
      {children}
    </Sequence>
  );
};

export const MncReel: React.FC = () => {
  // beats (s) straight from the word timings
  const b = {
    todos: at("todos", 0, 5),
    wa1: at("WhatsApp", 0, 15),
    crm: at("CRM,"),
    leads: at("leads", 0, 19),
    resumir: at("resumir"),
    extraer: at("extraer,"),
    maps: at("Google"),
    dir: at("direcciones"),
    tel: at("teléfonos"),
    cal: at("calificados"),
    ctx: at("contexto,"),
    ficha: at("ficha."),
    conectas: at("conectas"),
    web: at("web,"),
    correo: at("correo"),
    wa2: at("WhatsApp,", 0, 46),
    vend: at("vendedores"),
    prod: at("productos"),
    form: at("formularios,"),
    cli: at("clientes,"),
    prov: at("proveedores,"),
    cot: at("cotizadores"),
    todo: at("todo", 0, 62),
    zapier: at("Zapier,"),
    cerebro: at("cerebro"),
    fuentes: at("fuentes"),
    filtra: at("filtra,"),
    unifica: at("unifica"),
    categoriza: at("categoriza."),
    pron: at("pronóstico"),
    conc: at("conciliar"),
    alert: at("Alertas"),
    ia: at("inteligencia", 0, 105),
    memoria: at("memoria"),
  };
  return (
    <AbsoluteFill style={{ background: mnc.colors.black }}>
      <Audio src={staticFile(BASE)} />
      <Seg from={0} to={BASE_DUR}>
        <Footage />
      </Seg>

      {/* hook */}
      <Seg from={0} to={4.833}>
        <HookTitle />
      </Seg>

      {/* section eyebrows persist while sub-scenes change below them */}
      <Seg from={4.833} to={10.24}><SectionHeader label="Casos de uso" /></Seg>
      <Seg from={10.24} to={22.66}><SectionHeader label="01 · Automatizaciones" /></Seg>
      <Seg from={22.66} to={38.92}><SectionHeader label="02 · Flujos con IA" /></Seg>
      <Seg from={38.92} to={53.54}><SectionHeader label="03 · Agentes de IA" /></Seg>
      <Seg from={53.54} to={64.76}><SectionHeader label="04 · Apps" /></Seg>
      <Seg from={64.76} to={71.7}><SectionHeader label="Punto de partida" /></Seg>
      <Seg from={79.6} to={81.967}><SectionHeader label="05 · Análisis" /></Seg>
      <Seg from={85.9} to={107.467}><SectionHeader label="05 · Análisis" /></Seg>

      <Seg from={4.833} to={10.24}><Overview t0={4.833} tTodos={b.todos} /></Seg>
      <Seg from={10.24} to={13.6}><Transfer t0={10.24} /></Seg>
      <Seg from={13.6} to={17.9}><Sync t0={13.6} tWa={b.wa1} tCrm={b.crm} /></Seg>
      <Seg from={17.9} to={22.66}><Route t0={17.9} tLeads={b.leads} /></Seg>
      <Seg from={22.66} to={27.1}><Summarize t0={22.66} tRes={b.resumir} tExt={b.extraer} /></Seg>
      <Seg from={27.1} to={34.0}><Maps t0={27.1} tMaps={b.maps} tDir={b.dir} tTel={b.tel} tCal={b.cal} /></Seg>
      <Seg from={34.0} to={38.92}><Ficha t0={34.0} tCtx={b.ctx} tFicha={b.ficha} /></Seg>
      <Seg from={38.92} to={47.8}><Agents t0={38.92} tConect={b.conectas} tWeb={b.web} tMail={b.correo} tWa={b.wa2} /></Seg>
      <Seg from={47.8} to={53.54}><Internos t0={47.8} tVend={b.vend} tProd={b.prod} /></Seg>
      <Seg from={53.54} to={64.76}><Apps t0={53.54} tForm={b.form} tCli={b.cli} tProv={b.prov} tCot={b.cot} tTodo={b.todo} /></Seg>
      <Seg from={64.76} to={71.7}><ZapierIntro t0={64.76} tZap={b.zapier} /></Seg>
      <Seg from={71.7} to={79.6}><ZapierBadge /></Seg>
      <Seg from={79.6} to={81.967}><AnalisisOpener t0={79.6} /></Seg>
      <Seg from={85.9} to={92.74}><BrainSources t0={85.9} tCerebro={b.cerebro} tFuentes={b.fuentes} tFiltra={b.filtra} tUnifica={b.unifica} tCat={b.categoriza} /></Seg>
      <Seg from={92.74} to={103.2}><BrainSolutions t0={92.74} tPron={b.pron} tConc={b.conc} tAlert={b.alert} /></Seg>
      <Seg from={103.2} to={107.467}><BrainToAI t0={103.2} tIA={b.ia} /></Seg>
      <Seg from={b.memoria - 0.15} to={111.2}><MemoryChip delay={0} /></Seg>

      <Captions />

      <Seg from={BASE_DUR} to={BASE_DUR + END_DUR}>
        <EndCard />
      </Seg>

      <BrandMark shadow />
    </AbsoluteFill>
  );
};

// Small official Zapier logo above Manuel while he explains why to start there.
const ZapierBadge: React.FC = () => {
  const p = useEnter(0.1, "smooth");
  const exit = useExit(0.25);
  return (
    <div style={{ position: "absolute", left: mnc.safe.left, top: 196, ...rise(p, 16, exit) }}>
      <Img src={staticFile("mnc/brand/logos/zapier-logo_frost.svg")} style={{ width: 210, height: "auto", filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.5))" }} />
    </div>
  );
};
