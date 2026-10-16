import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile } from "remotion";
import { mnc } from "../mnc/mncTheme";
import { makeCaptions, type Word } from "../mnc/captionsCore";
import { Captions } from "../mnc/components/Captions";
import { Card } from "../mnc/components/Primitives";
import { Icon } from "../mnc/components/Icons";
import { Arrow, Cam, Eyebrow, HoldFrame, In, Pill, Sfx, Stat, Statement, Trail, Win, useT, type SfxKind, type Shot } from "../mnc4/Kit";
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
const cam = (from: number, to: number, punch?: [number, number]): Shot => ({ from, to, y: -300, scale: 1.1, punch });
// screens: zoom from the bottom so the browser chrome falls off the top
const scr = (from: number, to: number, scale = 1.12): Shot => ({ from, to, y: 0, scale, origin: "50% 100%", fade: "screen" });
const SHOTS: Shot[] = [
  scr(0, 3.7, 1.06),
  cam(3.7, 10.967),
  cam(10.967, 14.1, [11.3, 1.06]),
  scr(14.1, 16.267, 1.1),
  scr(16.267, 19.133, 1.1),
  scr(19.133, 21.9, 1.1),
  scr(21.9, 29.633, 1.14),
  cam(29.633, 37.1),
  cam(37.1, 56.267, [43.4, 1.06]),
  scr(56.267, 62.5, 1.2),
  scr(62.5, 65.667, 1.2),
  cam(65.667, 68.933),
  cam(68.933, 76.967, [70.8, 1.06]),
  scr(76.967, 81.067, 1.1),
  cam(81.067, 96.367),
  cam(96.367, BASE_DUR, [101.9, 1.05]),
];
const capTop = (t: number) => (SHOTS.find((x) => t >= x.from && t < x.to)?.fade === "screen" ? 1470 : 1380);
const NO_CAPTION: [number, number][] = [[0, 3.7]];
const BAND = 250;

// ---------------- parts ----------------
const Label: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = mnc.colors.white }) => (
  <div style={{ fontFamily: mnc.fonts.body, fontWeight: mnc.weight.semibold, fontSize: 28, letterSpacing: mnc.tracking.label, color, textShadow: "0 1px 10px rgba(0,0,0,0.7)" }}>
    {children}
  </div>
);

// The tool's name, set as plain type: no verified official logo could be downloaded,
// so we never draw one. The real Grok Bot UI appears in Manuel's screen shots.
const BotName: React.FC<{ at: number; sub?: string; subAt?: number }> = ({ at: a, sub, subAt }) => (
  <>
    <In at={a} dist={24} kind="pop" style={{ left: 0, right: 0, top: BAND + 40, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          padding: "18px 44px 22px",
          borderRadius: mnc.radius.card,
          background: mnc.colors.black,
          boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 0 3px ${mnc.colors.accent}`,
          fontFamily: mnc.fonts.title,
          fontWeight: mnc.weight.extrabold,
          fontSize: 92,
          letterSpacing: "-0.03em",
          color: mnc.colors.white,
          lineHeight: 1,
        }}
      >
        Grok Bot
      </div>
    </In>
    {sub ? (
      <In at={subAt ?? a + 0.4} dist={16} kind="pop" style={{ left: 0, right: 0, top: BAND + 200, display: "flex", justifyContent: "center" }}>
        <Pill icon={Icon.user} label={sub} size={34} dark />
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
    <In at={29.7} dist={30} style={{ left: 150, right: 150, top: BAND - 10 }}>
      <Card style={{ padding: "20px 26px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, paddingBottom: 12, borderBottom: "2px solid #EFEFEF" }}>
          <div style={{ width: 44, height: 44, color: mnc.colors.accent }}>{Icon.team}</div>
          <div style={{ fontFamily: mnc.fonts.title, fontWeight: mnc.weight.bold, fontSize: 32, color: mnc.colors.ink }}>Grupo de agentes</div>
          <div style={{ marginLeft: "auto", fontFamily: mnc.fonts.body, fontWeight: mnc.weight.semibold, fontSize: 20, color: "#8A8A8A" }}>Grok Bot</div>
        </div>
        {rows.map(([n, s, lead], i) => {
          const on = t >= s;
          return (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12, opacity: on ? 1 : 0, transform: `translateY(${on ? 0 : 10}px)` }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  flex: "none",
                  background: lead ? mnc.colors.accent : "#141414",
                  color: mnc.colors.white,
                  padding: 9,
                }}
              >
                {lead ? Icon.sparkle : Icon.bolt}
              </div>
              <div style={{ fontFamily: mnc.fonts.body, fontWeight: mnc.weight.semibold, fontSize: 24, color: mnc.colors.ink, width: 170 }}>{n}</div>
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
      <In at={at("insisto,") - 0.1} dist={20} kind="pop" style={{ left: 0, right: 0, top: BAND + 30, display: "flex", justifyContent: "center", alignItems: "center", gap: 18 }}>
        <Pill icon={Icon.user} label="1 asistente" size={36} />
        <div style={{ opacity: k, display: "flex", alignItems: "center", gap: 18 }}>
          <Arrow size={44} />
          <Pill icon={Icon.team} label="Un equipo de agentes" size={36} dark />
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
  const xs = [190, 540, 890];
  return (
    <>
      <In at={70.9} dist={14} kind="snappy" style={{ left: 0, right: 0, top: BAND - 46, textAlign: "center" }}>
        <Label color={mnc.colors.accent}>PLAN · TU EQUIPO DE AGENTES SOBRE TU SISTEMA</Label>
      </In>
      {/* coordinator */}
      <In at={tCoord - 0.2} dist={20} kind="pop" style={{ left: 0, right: 0, top: BAND + 10, display: "flex", justifyContent: "center" }}>
        <Pill icon={Icon.sparkle} label="Agente coordinador" size={38} dark />
      </In>
      {/* connectors */}
      <svg width={1080} height={200} style={{ position: "absolute", left: 0, top: BAND + 96 }}>
        {agents.map(([, , s], i) => {
          const p = line(s);
          const x = xs[i];
          return (
            <path
              key={i}
              d={`M 540 0 C 540 50, ${x} 40, ${x} 96`}
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
        <In key={n} at={s - 0.1} dist={24} kind="pop" style={{ left: xs[i] - 165, top: BAND + 196, width: 330 }}>
          <Card style={{ padding: "16px 18px 18px", boxShadow: t >= s && t < s + 1 ? `0 0 0 5px ${mnc.colors.accent}, 0 20px 50px rgba(0,0,0,0.5)` : "0 20px 50px rgba(0,0,0,0.5)" }}>
            <div style={{ fontFamily: mnc.fonts.title, fontWeight: mnc.weight.extrabold, fontSize: 34, color: mnc.colors.accent, lineHeight: 1 }}>{n}</div>
            <div style={{ marginTop: 6, fontFamily: mnc.fonts.title, fontWeight: mnc.weight.semibold, fontSize: 28, lineHeight: 1.1, color: mnc.colors.ink }}>{l}</div>
          </Card>
        </In>
      ))}
      {/* what the hunter gets and where it writes */}
      <In at={at("fuentes") - 0.1} dist={14} kind="pop" style={{ left: 0, right: 0, top: BAND + 360, display: "flex", justifyContent: "center", alignItems: "center", gap: 12 }}>
        <Pill icon={Icon.globe} label="Fuentes" size={28} />
        <Arrow size={30} />
        <Pill label="Cazador" size={28} />
        {t >= at("filtrador") - 0.1 ? (
          <>
            <Arrow size={30} />
            <Pill label="Filtrador" size={28} />
          </>
        ) : null}
        {t >= at("copy.") - 0.6 ? (
          <>
            <Arrow size={30} />
            <Pill label="Copy" size={28} />
          </>
        ) : null}
        {t >= at("pegue") - 0.1 ? (
          <>
            <Arrow size={30} />
            <Pill icon={Icon.grid} label="Airtable" size={28} dark />
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
      <In at={96.5} dist={14} kind="snappy" style={{ left: 0, right: 0, top: BAND - 46, textAlign: "center" }}>
        <Label color={mnc.colors.accent}>META · PIEZAS A LA SEMANA</Label>
      </In>
      <In at={t15} kind="pop" style={{ left: 96, top: BAND + 10 }}>
        <Stat value="15" label="piezas / semana" w={340} size={110} />
      </In>
      <In at={t60 - 0.2} dist={10} style={{ left: 452, top: BAND + 70 }}>
        <Arrow size={70} />
      </In>
      <In at={t60} kind="pop" style={{ left: 540, top: BAND + 10 }}>
        <Stat value={final ? "50–60" : String(n)} label="piezas / semana" w={444} size={110} />
      </In>
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
    <Win from={BASE_DUR} to={BASE_DUR + END_HOLD}>
      <HoldFrame src={SRC} frame={Math.round((BASE_DUR - 0.05) * MNC6_FPS)} y={-300} />
    </Win>

    {/* HOOK — over the real Grok Bot screen */}
    <Win from={0} to={3.7}>
      <Statement top={1240} lead="crea tu equipo de" big="agentes IA" plate="más fácil de lo que imaginas" at={[0.15, 0.6, 1.8]} bigSize={190} />
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
      <In at={14.2} dist={18} kind="pop" style={{ left: 0, right: 0, top: BAND + 20, display: "flex", justifyContent: "center" }}>
        <Pill icon={Icon.apps} label="Se conecta a tus aplicaciones" size={36} dark />
      </In>
    </Win>
    <Win from={16.267} to={19.133}>
      <In at={16.35} dist={18} kind="pop" style={{ left: 0, right: 0, top: BAND + 20, display: "flex", justifyContent: "center" }}>
        <Pill icon={Icon.bolt} label="Tiene su propia computadora" size={36} dark />
      </In>
    </Win>
    <Win from={19.133} to={21.9}>
      <In at={19.25} dist={18} kind="pop" style={{ left: 0, right: 0, top: BAND + 20, display: "flex", justifyContent: "center" }}>
        <Pill icon={Icon.check} label="Ves cómo la controla" size={36} dark />
      </In>
    </Win>
    <Win from={21.9} to={29.633}>
      <Trail top={BAND + 20} items={[["Bots para tareas específicas", at("bots") - 0.1, Icon.bolt], ["En grupos", at("grupos,") - 0.1, Icon.team]]} dark={[1]} size={34} />
    </Win>
    <Win from={29.633} to={37.1}>
      <GroupChat />
    </Win>

    {/* CASO DE USO — tu proceso de contenido hoy */}
    <Win from={40.1} to={70.7}>
      <Eyebrow label="Caso de uso · Creación de contenido" at={40.1} />
    </Win>
    <Win from={43.3} to={46.5}>
      <OneToTeam />
    </Win>
    <Win from={46.5} to={70.7}>
      <In at={46.6} dist={12} kind="snappy" style={{ left: 0, right: 0, top: BAND - 2, textAlign: "center" }}>
        <Label>SU PROCESO HOY</Label>
      </In>
      <Trail
        top={BAND + 46}
        size={28}
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
      <Statement top={BAND + 10} lead="¿ya estás usando" big="agentes de IA?" plate="comparte tus tips en comentarios" at={[102.0, 102.35, at("tips") - 0.2]} bigSize={140} plateSize={54} />
    </Win>

    <Sfx cues={SFX()} />
    <Captions chunks={CHUNKS} hidden={NO_CAPTION} top={capTop} />
  </AbsoluteFill>
);
