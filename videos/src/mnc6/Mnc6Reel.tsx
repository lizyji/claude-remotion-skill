import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile } from "remotion";
import { mnc } from "../mnc/mncTheme";
import { makeCaptions, type Word } from "../mnc/captionsCore";
import { Captions } from "../mnc/components/Captions";
import { Card } from "../mnc/components/Primitives";
import { Icon } from "../mnc/components/Icons";
import { Arrow, Cam, HoldFrame, In, Pill, Sfx, Stat, Statement, Trail, Win, useT, type SfxKind, type Shot } from "../mnc4/Kit";
import words from "./words.json";

// "Cómo crear agentes de IA extremadamente fácil" — MNC reel about Grok Bot.
// One jump-cut vertical take: Manuel on camera (most of it) + phone shots of the
// monitor (Grok Bot's own UI, Airtable). Overlays live in the band above his head;
// captions sit under the chin. Everything about the agent team is framed as a PLAN.

export const MNC6_FPS = 30;
const SRC = "mnc6/clips/base.mp4";
const BASE_DUR = 109.2;
const END_HOLD = 1.0;
export const MNC6_TOTAL_F = Math.round((BASE_DUR + END_HOLD) * MNC6_FPS);

const KEYWORDS: string[][] = [
  ["agentes", "de", "ia"],
  ["asistente", "personal"],
  ["agente", "coordinador"],
  ["cazador", "de", "ideas", "virales"],
  ["agente", "filtrador"],
  ["15", "piezas"],
  ["grok", "bot"],
  ["grokbot"],
  ["airtable"],
  ["equipo"],
  ["copy"],
  ["pipeline"],
  ["whatsapp"],
  ["60"],
  ["tips"],
];
const { CHUNKS, at } = makeCaptions(words as Word[], KEYWORDS);

// ---------------- shots (cuts measured on the source) ----------------
// camera: face lifted so captions fit under the chin and the band above the head is free
const cam = (from: number, to: number, punch?: [number, number]): Shot => ({ from, to, y: -380, scale: 1.1, punch });
// screens: zoom from the bottom so the browser chrome falls off the top
const scr = (from: number, to: number, scale = 1.0): Shot => ({ from, to, y: -250, scale, origin: "50% 0%" });
const SHOTS: Shot[] = [
  scr(0, 3.7, 1.0),
  cam(3.7, 10.967),
  cam(10.967, 14.1, [11.3, 1.06]),
  scr(14.1, 16.267, 1.04),
  scr(16.267, 19.133, 1.04),
  scr(19.133, 21.9, 1.04),
  scr(21.9, 29.633, 1.06),
  cam(29.633, 37.1),
  cam(37.1, 56.267, [43.4, 1.06]),
  scr(56.267, 62.5, 1.12),
  scr(62.5, 65.667, 1.12),
  cam(65.667, 68.933),
  cam(68.933, 76.967, [70.8, 1.06]),
  scr(76.967, 81.067, 1.0),
  cam(81.067, 96.367),
  cam(96.367, BASE_DUR, [101.9, 1.05]),
];
// Protected-face layout: face (top) → captions just under the chin → graphics in the low zone.
// Screens keep their captions low (no face there), except where the team chart sits at the bottom.
// ONE grid for the whole reel, camera and screen shots alike:
// content (face / UI) 0–1250 → captions CAP → every graphic in the low zone LOW…LOW_END.
const CAP = 1262;
const CAP_SIZE = 52;
const LOW = 1404; // section label row
const G0 = LOW + 46; // graphics start under the label row
const LOW_END = 1740; // IG bottom UI starts below this
const capTop = () => CAP;
const NO_CAPTION: [number, number][] = [[0, 3.7]];

// ---------------- parts ----------------
// Section label, first row of the low zone (was the top-left eyebrow).
const Eyebrow: React.FC<{ label: string; at: number }> = ({ label, at: a }) => (
  <In at={a} dist={10} kind="snappy" style={{ left: 96, top: LOW }}>
    <div
      style={{
        fontFamily: mnc.fonts.body,
        fontWeight: mnc.weight.semibold,
        fontSize: 26,
        letterSpacing: mnc.tracking.label,
        textTransform: "uppercase",
        color: mnc.colors.accent,
        textShadow: "0 1px 8px rgba(0,0,0,0.6)",
      }}
    >
      {label}
    </div>
  </In>
);
const Label: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = mnc.colors.white }) => (
  <div style={{ fontFamily: mnc.fonts.body, fontWeight: mnc.weight.semibold, fontSize: 28, letterSpacing: mnc.tracking.label, color, textShadow: "0 1px 10px rgba(0,0,0,0.7)" }}>
    {children}
  </div>
);

// The tool's name, set as plain type: no verified official logo could be downloaded,
// so we never draw one. The real Grok Bot UI appears in Manuel's screen shots.
const BotName: React.FC<{ at: number; sub?: string; subAt?: number }> = ({ at: a, sub, subAt }) => (
  <>
    <In at={a} dist={24} kind="pop" style={{ left: 96, width: 858, top: G0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          padding: "12px 34px 16px",
          borderRadius: mnc.radius.card,
          background: mnc.colors.black,
          boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 0 3px ${mnc.colors.accent}`,
          fontFamily: mnc.fonts.title,
          fontWeight: mnc.weight.extrabold,
          fontSize: 68,
          letterSpacing: "-0.03em",
          color: mnc.colors.white,
          lineHeight: 1,
        }}
      >
        Grok Bot
      </div>
    </In>
    {sub ? (
      <In at={subAt ?? a + 0.4} dist={16} kind="pop" style={{ left: 96, width: 858, top: G0 + 116, display: "flex", justifyContent: "center" }}>
        <Pill icon={Icon.user} label={sub} size={30} dark />
      </In>
    ) : null}
  </>
);

// Group chat of agents (structure only — no invented messages: bubbles are placeholders)
const GroupChat: React.FC = () => {
  const t = useT();
  const rows: [string, number, boolean][] = [
    ["Coordinador", at("Entre") - 0.1, true],
    ["Agente 01", at("coordinando") - 0.1, false],
    ["Agente 02", at("coordinando") + 0.35, false],
    ["Agente 03", at("sí") - 0.1, false],
  ];
  return (
    <In at={29.7} dist={30} style={{ left: 180, right: 200, top: LOW + 6 }}>
      <Card style={{ padding: "14px 22px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 8, borderBottom: "2px solid #EFEFEF" }}>
          <div style={{ width: 36, height: 36, color: mnc.colors.accent }}>{Icon.team}</div>
          <div style={{ fontFamily: mnc.fonts.title, fontWeight: mnc.weight.bold, fontSize: 28, color: mnc.colors.ink }}>Grupo de agentes</div>
          <div style={{ marginLeft: "auto", fontFamily: mnc.fonts.body, fontWeight: mnc.weight.semibold, fontSize: 20, color: "#8A8A8A" }}>Grok Bot</div>
        </div>
        {rows.map(([n, s, lead], i) => {
          const on = t >= s;
          return (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, opacity: on ? 1 : 0, transform: `translateY(${on ? 0 : 10}px)` }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  flex: "none",
                  background: lead ? mnc.colors.accent : "#141414",
                  color: mnc.colors.white,
                  padding: 7,
                }}
              >
                {lead ? Icon.sparkle : Icon.bolt}
              </div>
              <div style={{ fontFamily: mnc.fonts.body, fontWeight: mnc.weight.semibold, fontSize: 22, color: mnc.colors.ink, width: 150 }}>{n}</div>
              <div style={{ flex: 1, height: 18, borderRadius: 9, background: lead ? "rgba(253,102,35,0.25)" : "#ECECEC", maxWidth: 220 - i * 30 }} />
            </div>
          );
        })}
      </Card>
    </In>
  );
};

// From one assistant to a whole team (the idea of the video)
const OneToTeam: React.FC = () => {
  const t = useT();
  const tTeam = at("equipo.") - 0.2;
  const k = interpolate(t, [tTeam, tTeam + 0.6], [0, 1], { easing: mnc.ease.out, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <In at={at("insisto,") - 0.1} dist={20} kind="pop" style={{ left: 96, width: 858, top: G0 + 10, display: "flex", justifyContent: "center", alignItems: "center", gap: 14 }}>
        <Pill icon={Icon.user} label="1 asistente" size={30} />
        <div style={{ opacity: k, display: "flex", alignItems: "center", gap: 18 }}>
          <Arrow size={38} />
          <Pill icon={Icon.team} label="Un equipo de agentes" size={30} dark />
        </div>
      </In>
    </>
  );
};

// Org chart of the PLANNED team, built as Manuel names each role
const Team: React.FC = () => {
  const t = useT();
  const tCoord = at("coordinador");
  const agents: [string, string, number][] = [
    ["01", "Cazador de ideas virales", at("cazador")],
    ["02", "Agente filtrador", at("filtrador")],
    ["03", "Agentes de copy", at("copy.") - 0.6],
  ];
  const line = (s: number) => interpolate(t, [s - 0.1, s + 0.35], [0, 1], { easing: mnc.ease.out, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const xs = [231, 525, 819]; // card centers, 270 wide
  return (
    <>
      <Eyebrow label="Plan · Tu equipo de agentes" at={70.9} />
      {/* coordinator */}
      <In at={tCoord - 0.2} dist={20} kind="pop" style={{ left: 96, width: 858, top: G0 - 4, display: "flex", justifyContent: "center" }}>
        <Pill icon={Icon.sparkle} label="Agente coordinador" size={26} dark />
      </In>
      {/* connectors */}
      <svg width={1080} height={30} style={{ position: "absolute", left: 0, top: G0 + 50 }}>
        {agents.map(([, , s], i) => {
          const p = line(s);
          const x = xs[i];
          return (
            <path
              key={i}
              d={`M 525 0 C 525 16, ${x} 14, ${x} 30`}
              fill="none"
              stroke={mnc.colors.accent}
              strokeWidth={4}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - p}
            />
          );
        })}
      </svg>
      {agents.map(([n, l, s], i) => (
        <In key={n} at={s - 0.1} dist={24} kind="pop" style={{ left: xs[i] - 135, top: G0 + 80, width: 270 }}>
          <Card style={{ padding: "10px 14px 12px", boxShadow: t >= s && t < s + 1 ? `0 0 0 5px ${mnc.colors.accent}, 0 20px 50px rgba(0,0,0,0.5)` : "0 20px 50px rgba(0,0,0,0.5)" }}>
            <div style={{ fontFamily: mnc.fonts.title, fontWeight: mnc.weight.extrabold, fontSize: 26, color: mnc.colors.accent, lineHeight: 1 }}>{n}</div>
            <div style={{ marginTop: 4, fontFamily: mnc.fonts.title, fontWeight: mnc.weight.semibold, fontSize: 23, lineHeight: 1.1, color: mnc.colors.ink }}>{l}</div>
          </Card>
        </In>
      ))}
      {/* what the hunter gets and where it writes */}
      <In at={at("fuentes") - 0.1} dist={14} kind="pop" style={{ left: 96, width: 858, top: G0 + 196, display: "flex", justifyContent: "center", alignItems: "center", gap: 6 }}>
        <Pill icon={Icon.globe} label="Fuentes" size={21} />
        <Arrow size={24} />
        <Pill label="Cazador" size={21} />
        {t >= at("filtrador") - 0.1 ? (
          <>
            <Arrow size={24} />
            <Pill label="Filtrador" size={21} />
          </>
        ) : null}
        {t >= at("copy.") - 0.6 ? (
          <>
            <Arrow size={24} />
            <Pill label="Copy" size={21} />
          </>
        ) : null}
        {t >= at("pegue") - 0.1 ? (
          <>
            <Arrow size={24} />
            <Pill icon={Icon.grid} label="Airtable" size={21} dark />
          </>
        ) : null}
      </In>
    </>
  );
};

// The goal: 15 → 50–60 pieces a week (a target, not a result)
const Goal: React.FC = () => {
  const t = useT();
  const t15 = at("15") - 0.1;
  const t60 = at("50") - 0.1;
  const n = Math.round(interpolate(t, [t60, t60 + 0.7], [15, 60], { easing: mnc.ease.out, extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const final = t >= t60 + 0.7;
  return (
    <>
      <Eyebrow label="Meta · piezas a la semana" at={96.5} />
      <In at={t15} kind="pop" style={{ left: 120, top: G0 }}>
        <Stat value="15" label="piezas / semana" w={290} size={86} />
      </In>
      <In at={t60 - 0.2} dist={10} style={{ left: 428, top: G0 + 48 }}>
        <Arrow size={56} />
      </In>
      <In at={t60} kind="pop" style={{ left: 500, top: G0 }}>
        <Stat value={final ? "50–60" : String(n)} label="piezas / semana" w={400} size={86} />
      </In>
    </>
  );
};

// Content process as it is today: in the top band over the screen shots (no face there),
// in the low zone under the captions while Manuel is on camera.
const ProcessTrail: React.FC = () => {
  return (
    <>
      <Eyebrow label="Su proceso hoy" at={46.6} />
      <Trail
        top={G0}
        left={96}
        right={126}
        size={24}
        dark={[1]}
        items={[
          ["Investigación", at("investigaciones") - 0.1, Icon.globe],
          ["Airtable", at("Airtable.") - 0.1, Icon.grid],
          ["Análisis con IA", at("analizo") - 0.1, Icon.sparkle],
          ["Ideas de contenido", at("ideas", 0, 61) - 0.1],
          ["Pipeline de producción", at("pipeline") - 0.1],
          ["Copies y guiones", at("copies") - 0.1, Icon.doc],
          ["Publicación", at("publicamos.") - 0.1, Icon.check],
        ]}
      />
    </>
  );
};

// ---------------- sound ----------------
const SFX = (): [number, SfxKind][] => [
  [0.3, "whoosh"],
  [at("Grok Bot") - 0.05, "pop"],
  [at("personal.") - 0.3, "click"],
  [14.15, "swoosh-soft"],
  [16.3, "tick"],
  [21.95, "swoosh-soft"],
  [at("grupos,") - 0.1, "click"],
  [29.75, "whoosh"],
  [at("coordinando") - 0.1, "tick"],
  [at("coordinando") + 0.35, "tick"],
  [at("sí") - 0.1, "tick"],
  [at("equipo.") - 0.2, "pop"],
  [at("investigaciones") - 0.1, "click"],
  [56.3, "swoosh-soft"],
  [at("pipeline") - 0.1, "tick"],
  [70.9, "whoosh"],
  [at("coordinador") - 0.2, "pop"],
  [at("cazador") - 0.1, "pop"],
  [at("filtrador") - 0.1, "pop"],
  [at("copy.") - 0.6, "pop"],
  [96.45, "whoosh"],
  [at("15") - 0.1, "click"],
  [at("50") + 0.6, "pop"],
  [102.0, "swoosh-soft"],
];

// ---------------- composition ----------------
export const Mnc6Reel: React.FC = () => (
  <AbsoluteFill style={{ background: mnc.colors.black }}>
    <Audio src={staticFile(SRC)} />
    <Cam src={SRC} shots={SHOTS} />
    {/* falloff behind the captions + graphics rows, same on camera and on screen shots */}
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 61%, rgba(0,0,0,0.6) 66%, rgba(0,0,0,0.85) 73%, #000 86%)" }} />
    <Win from={BASE_DUR} to={BASE_DUR + END_HOLD}>
      <HoldFrame src={SRC} frame={Math.round((BASE_DUR - 0.05) * MNC6_FPS)} y={-300} />
    </Win>

    {/* HOOK — over the real Grok Bot screen */}
    <Win from={0} to={3.7}>
      <Statement top={LOW - 20} lead="crea tu equipo de" big="agentes IA" plate="más fácil de lo que imaginas" at={[0.15, 0.6, 1.8]} bigSize={150} plateSize={52} />
    </Win>

    {/* QUÉ ES GROK BOT */}
    <Win from={3.7} to={10.967}>
      <BotName at={at("Grok Bot") - 0.1} />
    </Win>
    <Win from={10.967} to={14.1}>
      <BotName at={11.0} sub="Asistente personal" subAt={at("asistente") - 0.1} />
    </Win>
    <Win from={11.0} to={29.633}>
      <Eyebrow label="¿Qué es Grok Bot?" at={11.0} />
    </Win>
    <Win from={14.1} to={16.267}>
      <In at={14.2} dist={18} kind="pop" style={{ left: 96, width: 858, top: G0 + 10, display: "flex", justifyContent: "center" }}>
        <Pill icon={Icon.apps} label="Se conecta a tus aplicaciones" size={36} dark />
      </In>
    </Win>
    <Win from={16.267} to={19.133}>
      <In at={16.35} dist={18} kind="pop" style={{ left: 96, width: 858, top: G0 + 10, display: "flex", justifyContent: "center" }}>
        <Pill icon={Icon.bolt} label="Tiene su propia computadora" size={36} dark />
      </In>
    </Win>
    <Win from={19.133} to={21.9}>
      <In at={19.25} dist={18} kind="pop" style={{ left: 96, width: 858, top: G0 + 10, display: "flex", justifyContent: "center" }}>
        <Pill icon={Icon.check} label="Ves cómo la controla" size={36} dark />
      </In>
    </Win>
    <Win from={21.9} to={29.633}>
      <Trail top={G0 + 10} left={96} right={126} items={[["Bots para tareas específicas", at("bots") - 0.1, Icon.bolt], ["En grupos", at("grupos,") - 0.1, Icon.team]]} dark={[1]} size={30} />
    </Win>
    <Win from={29.633} to={37.1}>
      <GroupChat />
    </Win>

    {/* CASO DE USO — tu proceso de contenido hoy */}
    <Win from={40.1} to={46.55}>
      <Eyebrow label="Caso de uso · Creación de contenido" at={40.1} />
    </Win>
    <Win from={43.3} to={46.5}>
      <OneToTeam />
    </Win>
    <Win from={46.5} to={70.7}>
      <ProcessTrail />
    </Win>

    {/* EL EQUIPO DE AGENTES (plan) */}
    <Win from={70.8} to={96.367}>
      <Team />
    </Win>

    {/* LA META */}
    <Win from={96.367} to={101.85}>
      <Goal />
    </Win>

    {/* CIERRE */}
    <Win from={101.9} to={BASE_DUR + END_HOLD}>
      <Statement top={LOW + 4} lead="¿ya estás usando" big="agentes de IA?" plate="comparte tus tips en comentarios" at={[102.0, 102.35, at("tips") - 0.2]} bigSize={100} plateSize={42} />
    </Win>

    <Sfx cues={SFX()} />
    <Captions chunks={CHUNKS} hidden={NO_CAPTION} top={capTop} size={CAP_SIZE} />
  </AbsoluteFill>
);
