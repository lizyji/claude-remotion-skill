import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile } from "remotion";
import { mnc } from "../mnc/mncTheme";
import { makeCaptions, type Word } from "../mnc/captionsCore";
import { Captions } from "../mnc/components/Captions";
import { Card } from "../mnc/components/Primitives";
import { Icon } from "../mnc/components/Icons";
import { Cam, HoldFrame, In, Pill, Sfx, Statement, Trail, Win, useT, type SfxKind, type Shot } from "../mnc4/Kit";
import words from "./words.json";

// "Sistemas y procesos" — MNC reel. The source (1080×1920) already has burned-in
// captions in a fixed band (never above y≈1366). Instead of erasing them, the
// frame is cropped: the footage shows from the top down to PANEL_TOP and an
// MNC black panel takes the rest — that is where the new captions and every
// graphic live, so the face and the screens above stay completely clear.

export const MNC7_FPS = 30;
const SRC = "mnc7/clips/base.mp4";
const BASE_DUR = 89.4;
const END_HOLD = 0.8;
export const MNC7_TOTAL_F = Math.round((BASE_DUR + END_HOLD) * MNC7_FPS);

const KEYWORDS: string[][] = [
  ["base", "de", "datos"],
  ["núcleo", "central"],
  ["punto", "central"],
  ["tiempo", "real"],
  ["excel", "en", "esteroides"],
  ["sistemas"],
  ["sistema"],
  ["procesos"],
  ["proceso"],
  ["airtable"],
  ["centralizado"],
  ["crm"],
  ["dashboards"],
  ["sígueme"],
];
const { CHUNKS, at } = makeCaptions(words as Word[], KEYWORDS);

// ---------------- grid (same for every shot) ----------------
const PANEL_TOP = 1350; // crop line: hides the burned-in captions (they start ≥1366)
const CAP = 1374; // new captions, 2 lines max
const CAP_SIZE = 50;
const LOW = 1506; // section label row
const G0 = LOW + 42; // graphics
// graphics end by ~1745 and stay within x 96–954 (IG bottom UI / action icons)

// one continuous take, already tightly cut: native framing everywhere
const SHOTS: Shot[] = [{ from: 0, to: BASE_DUR, y: 0, scale: 1 }];
const NO_CAPTION: [number, number][] = [
  [0, 2.15],
  [87.5, BASE_DUR + END_HOLD],
];

// ---------------- parts ----------------
const Eyebrow: React.FC<{ label: string; at: number }> = ({ label, at: a }) => (
  <In at={a} dist={10} kind="snappy" style={{ left: 96, top: LOW }}>
    <div
      style={{
        fontFamily: mnc.fonts.body,
        fontWeight: mnc.weight.semibold,
        fontSize: 24,
        letterSpacing: mnc.tracking.label,
        textTransform: "uppercase",
        color: mnc.colors.accent,
      }}
    >
      {label}
    </div>
  </In>
);

// three disconnected processes (the example), one card per process
const Silos: React.FC = () => {
  const t = useT();
  const cards: [string, string, number][] = [
    ["Conseguir clientes", "Excel o CRM", at("conseguir")],
    ["Cotizar", "Otro Excel u otra herramienta", at("cotizar")],
    ["Operaciones", "Un documento aparte", at("documento")],
  ];
  const xs = [96, 386, 676];
  return (
    <>
      {cards.map(([h, tool, s], i) => (
        <In key={h} at={s - 0.1} dist={20} kind="pop" style={{ left: xs[i], top: G0, width: 278 }}>
          <Card style={{ padding: "12px 16px 14px", opacity: t >= at("centralizado") ? 0.45 : 1 }}>
            <div style={{ fontFamily: mnc.fonts.title, fontWeight: mnc.weight.bold, fontSize: 24, lineHeight: 1.1, color: mnc.colors.ink }}>{h}</div>
            <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8, fontFamily: mnc.fonts.body, fontWeight: mnc.weight.medium, fontSize: 19, color: "#6B6B6B", lineHeight: 1.15 }}>
              <div style={{ width: 22, height: 22, flex: "none", color: mnc.colors.accent }}>{Icon.doc}</div>
              {tool}
            </div>
          </Card>
        </In>
      ))}
    </>
  );
};

// the same processes connected to one central database
const Hub: React.FC = () => {
  const t = useT();
  const tHub = at("centralizado") - 0.1;
  const tCon = at("conectar") - 0.1;
  const p = interpolate(t, [tCon, tCon + 0.5], [0, 1], { easing: mnc.ease.out, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const xs = [235, 525, 815];
  return (
    <>
      <In at={tHub} dist={16} kind="pop" style={{ left: 96, width: 858, top: G0 - 4, display: "flex", justifyContent: "center" }}>
        <Pill icon={Icon.database} label="Núcleo central: tu base de datos" size={26} dark />
      </In>
      <svg width={1080} height={40} style={{ position: "absolute", left: 0, top: G0 + 54 }}>
        {xs.map((x) => (
          <path key={x} d={`M 525 0 C 525 20, ${x} 18, ${x} 40`} fill="none" stroke={mnc.colors.accent} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
        ))}
      </svg>
      <In at={tCon} dist={14} kind="pop" style={{ left: 96, width: 858, top: G0 + 98, display: "flex", justifyContent: "space-between", padding: "0 20px" }}>
        <Pill label="Clientes" size={24} />
        <Pill label="Cotizaciones" size={24} />
        <Pill label="Operaciones" size={24} />
      </In>
      <In at={at("facilitaría") - 0.1} dist={12} kind="pop" style={{ left: 96, width: 858, top: G0 + 168, display: "flex", justifyContent: "center" }}>
        <Pill icon={Icon.check} label="Te facilita la vida" size={24} dark />
      </In>
    </>
  );
};

// ---------------- sound ----------------
const SFX = (): [number, SfxKind][] => [
  [0.4, "pop"],
  [at("definamos") - 0.1, "whoosh"],
  [at("tareas") - 0.1, "tick"],
  [at("B.") - 0.1, "click"],
  [at("objetivo.") - 0.1, "click"],
  [18.95, "swoosh-soft"],
  [at("organizada,") - 0.4, "pop"],
  [at("central") - 0.1, "tick"],
  [at("conseguir") - 0.1, "click"],
  [at("cotizar") - 0.1, "click"],
  [at("documento") - 0.1, "click"],
  [at("centralizado") - 0.1, "whoosh"],
  [at("conectar") - 0.1, "tick"],
  [70.85, "swoosh-soft"],
  [at("Airtable,") - 0.1, "pop"],
  [at("esteroides.") - 0.3, "click"],
  [at("dashboards") - 0.1, "tick"],
  [87.55, "whoosh"],
  [at("sígueme.") - 0.1, "pop"],
];

// ---------------- composition ----------------
export const Mnc7Reel: React.FC = () => (
  <AbsoluteFill style={{ background: mnc.colors.black }}>
    <Audio src={staticFile(SRC)} />
    <Cam src={SRC} shots={SHOTS} />
    <Win from={BASE_DUR} to={BASE_DUR + END_HOLD}>
      <HoldFrame src={SRC} frame={Math.round((BASE_DUR - 0.05) * MNC7_FPS)} y={0} />
    </Win>
    {/* the crop: MNC black panel from PANEL_TOP down (soft edge only over the shirt / desk) */}
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, rgba(0,0,0,0) ${((PANEL_TOP - 70) / 1920) * 100}%, ${mnc.colors.black} ${(PANEL_TOP / 1920) * 100}%)`,
      }}
    />

    {/* HOOK */}
    <Win from={0} to={2.15}>
      <Statement top={CAP - 10} lead="construir sistemas es" big="mejor" plate="que construir procesos" at={[0.1, at("mejor") - 0.1, at("procesos.") - 0.2]} bigSize={130} plateSize={48} />
    </Win>

    {/* PROCESO VS. SISTEMA */}
    <Win from={6.3} to={18.9}>
      <Eyebrow label="Proceso vs. sistema" at={6.3} />
    </Win>
    <Win from={9.1} to={14.1}>
      <Trail
        top={G0}
        left={96}
        right={126}
        size={24}
        dark={[4]}
        items={[
          ["A", at("A") - 0.6],
          ["Tarea", at("tareas") - 0.1],
          ["Tarea", at("relacionadas") - 0.1],
          ["Tarea", at("orden") - 0.1],
          ["B", at("B.") - 0.1],
        ].map(([l, s], i) => [`${l}${l === "Tarea" ? ` ${i}` : ""}`, s as number] as [string, number])}
      />
      <In at={at("específico") - 0.1} dist={10} style={{ left: 96, width: 858, top: G0 + 74, textAlign: "center" }}>
        <div style={{ fontFamily: mnc.fonts.body, fontWeight: mnc.weight.medium, fontSize: 24, color: mnc.colors.gray }}>Proceso: tareas en un orden específico</div>
      </In>
    </Win>
    <Win from={14.1} to={18.9}>
      <Trail
        top={G0}
        left={96}
        right={126}
        size={24}
        dark={[3]}
        arrows={false}
        items={[
          ["Elemento", at("combinación") - 0.1, Icon.box],
          ["Elemento ", at("elementos") - 0.1, Icon.box],
          ["Elemento  ", at("funcionan") - 0.1, Icon.box],
          ["Objetivo", at("objetivo.") - 0.1, Icon.check],
        ]}
      />
      <In at={at("juntos") - 0.1} dist={10} style={{ left: 96, width: 858, top: G0 + 74, textAlign: "center" }}>
        <div style={{ fontFamily: mnc.fonts.body, fontWeight: mnc.weight.medium, fontSize: 24, color: mnc.colors.gray }}>Sistema: elementos que funcionan juntos</div>
      </In>
    </Win>

    {/* EL SECRETO */}
    <Win from={18.9} to={35.2}>
      <Eyebrow label="El secreto" at={18.95} />
    </Win>
    <Win from={18.9} to={27.53}>
      <Trail
        top={G0}
        left={96}
        right={126}
        size={24}
        dark={[0]}
        items={[
          ["Base de datos organizada", at("organizada,") - 0.4, Icon.database],
          ["Reciclas tareas", at("reciclar") - 0.1],
          ["En diferentes procesos", at("diferentes") - 0.1],
        ]}
      />
    </Win>
    <Win from={27.53} to={35.2}>
      <Trail
        top={G0}
        left={96}
        right={126}
        size={24}
        dark={[0, 2]}
        items={[
          ["Base de datos = punto central", at("central") - 0.2, Icon.database],
          ["Procesos conectados", at("conectar") - 0.1],
          ["Tu objetivo", at("objetivo", 0, 33) - 0.1, Icon.check],
        ]}
      />
    </Win>

    {/* EJEMPLO */}
    <Win from={35.2} to={56.6}>
      <Eyebrow label="Ejemplo · hoy, procesos separados" at={35.3} />
      <Silos />
    </Win>
    <Win from={56.6} to={70.8}>
      <Eyebrow label="Con un sistema" at={56.65} />
      <Hub />
    </Win>

    {/* HERRAMIENTAS NO-CODE */}
    <Win from={70.8} to={87.5}>
      <Eyebrow label="Herramientas no-code" at={70.85} />
    </Win>
    <Win from={70.8} to={80.27}>
      <Trail
        top={G0}
        left={96}
        right={126}
        size={24}
        dark={[0]}
        items={[
          ["Airtable", at("Airtable,") - 0.1, Icon.grid],
          ["Bases de datos relacionales", at("relacionales") - 0.1, Icon.database],
          ["Un Excel en esteroides", at("esteroides.") - 0.4],
        ]}
      />
    </Win>
    <Win from={80.27} to={87.5}>
      <Trail
        top={G0}
        left={96}
        right={126}
        size={24}
        dark={[3]}
        items={[
          ["Dashboards en tiempo real", at("dashboards") - 0.1, Icon.chart],
          ["Diferentes vistas", at("vistas") - 0.1],
          ["Un sistema", at("sistema", 0, 84) - 0.1, Icon.database],
          ["Ejecuta diferentes procesos", at("ejecutar") - 0.1, Icon.bolt],
        ]}
      />
    </Win>

    {/* CIERRE */}
    <Win from={87.5} to={BASE_DUR + END_HOLD}>
      <Statement top={CAP - 6} lead="si quieres saber más" big="sígueme" plate="sobre estos temas" at={[87.6, at("sígueme.") - 0.15, 88.0]} bigSize={130} plateSize={46} />
    </Win>

    <Sfx cues={SFX()} />
    <Captions chunks={CHUNKS} hidden={NO_CAPTION} top={CAP} size={CAP_SIZE} />
  </AbsoluteFill>
);

