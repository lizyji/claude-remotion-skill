import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { mnc } from "../mnc/mncTheme";
import { makeCaptions, type Word } from "../mnc/captionsCore";
import { Card } from "../mnc/components/Primitives";
import { Icon } from "../mnc/components/Icons";
import { Arrow, Cam, HoldFrame, In, Pill, Sfx, Trail, Win, useT, type SfxKind, type Shot } from "../mnc4/Kit";
import words from "./words.json";

// "Sistemas y procesos" — MNC reel. The source (1080×1920) already has its own
// burned-in captions; client rule: keep the video, its framing and those captions
// exactly as they are (no crop, no mask, no bands, no new captions). The MNC layer
// is small graphics in the free strip UNDER the original captions (they end ≤ y≈1620),
// never on the face or over the screen recordings.

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
const { at } = makeCaptions(words as Word[], KEYWORDS); // word timings for the graphics

// ---------------- grid ----------------
const G0 = 1648; // under the original captions (their lowest line ends ≈1620)
// one row (two at most for the cards), ends by ~1760, inside x 96–954

// one continuous take, already tightly cut: native framing everywhere
const SHOTS: Shot[] = [{ from: 0, to: BASE_DUR, y: 0, scale: 1, fade: "none" }]; // untouched footage: no grade, no bands

// ---------------- parts ----------------
const Row: React.FC<{ at: number; children: React.ReactNode }> = ({ at: a, children }) => (
  <In at={a} dist={14} kind="pop" style={{ left: 96, width: 858, top: G0, display: "flex", justifyContent: "center", alignItems: "center", gap: 10 }}>
    {children}
  </In>
);
const T: React.FC<{ items: [string, number, React.ReactNode?][]; dark?: number[]; arrows?: boolean }> = ({ items, dark, arrows }) => (
  <Trail top={G0} left={96} right={126} size={24} dark={dark} arrows={arrows} items={items} />
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
          <Card style={{ padding: "8px 14px 10px", opacity: t >= at("centralizado") ? 0.45 : 1 }}>
            <div style={{ fontFamily: mnc.fonts.title, fontWeight: mnc.weight.bold, fontSize: 21, lineHeight: 1.1, color: mnc.colors.ink }}>{h}</div>
            <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 8, fontFamily: mnc.fonts.body, fontWeight: mnc.weight.medium, fontSize: 17, color: "#6B6B6B", lineHeight: 1.15 }}>
              <div style={{ width: 22, height: 22, flex: "none", color: mnc.colors.accent }}>{Icon.doc}</div>
              {tool}
            </div>
          </Card>
        </In>
      ))}
    </>
  );
};

// the same processes connected to one central database — one row
const Hub: React.FC = () => (
  <T
    dark={[3]}
    items={[
      ["Clientes", at("centralizado") - 0.1],
      ["Cotizaciones", at("centralizado") + 0.2],
      ["Operaciones", at("centralizado") + 0.5],
      ["Núcleo central", at("conectar") - 0.1, Icon.database],
    ]}
  />
);

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
      <HoldFrame src={SRC} frame={Math.round((BASE_DUR - 0.05) * MNC7_FPS)} y={0} plain />
    </Win>

    {/* HOOK */}
    <Win from={0} to={6.0}>
      <Row at={at("procesos.") - 0.3}>
        <Pill label="Procesos" size={24} />
        <Arrow size={30} />
        <Pill icon={Icon.database} label="Sistemas" size={24} dark />
      </Row>
    </Win>

    {/* PROCESO VS. SISTEMA */}
    <Win from={9.1} to={14.1}>
      <T
        dark={[4]}
        items={[
          ["A", at("A") - 0.6],
          ["Tarea 1", at("tareas") - 0.1],
          ["Tarea 2", at("relacionadas") - 0.1],
          ["Tarea 3", at("orden") - 0.1],
          ["B", at("B.") - 0.1],
        ]}
      />
    </Win>
    <Win from={14.1} to={18.9}>
      <T
        dark={[3]}
        arrows={false}
        items={[
          ["Elemento", at("combinación") - 0.1, Icon.box],
          ["Elemento ", at("elementos") - 0.1, Icon.box],
          ["Elemento  ", at("funcionan") - 0.1, Icon.box],
          ["Objetivo", at("objetivo.") - 0.1, Icon.check],
        ]}
      />
    </Win>

    {/* EL SECRETO */}
    <Win from={18.9} to={27.53}>
      <T
        dark={[0]}
        items={[
          ["Base de datos organizada", at("organizada,") - 0.4, Icon.database],
          ["Reciclas tareas", at("reciclar") - 0.1],
          ["Diferentes procesos", at("diferentes") - 0.1],
        ]}
      />
    </Win>
    <Win from={27.53} to={35.2}>
      <T
        dark={[0, 2]}
        items={[
          ["Punto central", at("central") - 0.2, Icon.database],
          ["Procesos", at("conectar") - 0.1],
          ["Tu objetivo", at("objetivo", 0, 33) - 0.1, Icon.check],
        ]}
      />
    </Win>

    {/* EJEMPLO */}
    <Win from={35.2} to={56.6}>
      <Silos />
    </Win>
    <Win from={56.6} to={70.8}>
      <Hub />
    </Win>

    {/* HERRAMIENTAS NO-CODE */}
    <Win from={70.8} to={80.27}>
      <T
        dark={[0]}
        items={[
          ["Airtable", at("Airtable,") - 0.1, Icon.grid],
          ["Bases relacionales", at("relacionales") - 0.1, Icon.database],
          ["Excel en esteroides", at("esteroides.") - 0.4],
        ]}
      />
    </Win>
    <Win from={80.27} to={87.5}>
      <T
        dark={[2]}
        items={[
          ["Dashboards", at("dashboards") - 0.1, Icon.chart],
          ["Vistas", at("vistas") - 0.1],
          ["Un sistema → procesos", at("ejecutar") - 0.1, Icon.bolt],
        ]}
      />
    </Win>

    {/* CIERRE */}
    <Win from={87.5} to={BASE_DUR + END_HOLD}>
      <Row at={at("sígueme.") - 0.15}>
        <Pill icon={Icon.user} label="Sígueme" size={26} dark />
      </Row>
    </Win>

    <Sfx cues={SFX()} />
  </AbsoluteFill>
);
