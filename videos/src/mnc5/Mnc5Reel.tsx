import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { mnc } from "../mnc/mncTheme";
import { makeCaptions, type Word } from "../mnc/captionsCore";
import { Captions } from "../mnc/components/Captions";
import { Card } from "../mnc/components/Primitives";
import { Icon } from "../mnc/components/Icons";
import { Arrow, Cam, HoldFrame, In, Pill, Sfx, Statement, Win, useAnim, useT, type SfxKind, type Shot } from "../mnc4/Kit";
import words from "./words.json";

// "Crea tu propio cotizador con IA (sin programar)" — MNC tutorial reel.
// The source is one jump-cut vertical take: Manuel on camera + a phone filming the
// monitor (Google Sheets, Apps Script, Gemini) and the finished app on a phone.
// Tutorial shots stay full-screen (zoomed from the bottom so the browser chrome is
// cropped off); overlays sit where each screen has empty space.

export const MNC5_FPS = 30;
const SRC = "mnc5/clips/base.mp4";
const BASE_DUR = 113.76;
const END_HOLD = 1.0;
export const MNC5_TOTAL_F = Math.round((BASE_DUR + END_HOLD) * MNC5_FPS);

const KEYWORDS: string[][] = [
  ["google", "sheets"],
  ["apps", "script"],
  ["nueva", "implementación"],
  ["catálogo"],
  ["cotizaciones"],
  ["cotizador"],
  ["códigogs"],
  ["index"],
  ["implementar"],
  ["precios"],
  ["automáticamente"],
  ["coti"],
  ["html"],
  ["extensiones"],
  ["prompt"],
  ["prompts"],
  ["programación"],
  ["producto"],
  ["fecha"],
  ["ia"],
  ["guía"],
];
const { CHUNKS, at } = makeCaptions(words as Word[], KEYWORDS);

// ---------------- shots (cuts measured on the source) ----------------
const cam = (from: number, to: number, punch?: [number, number]): Shot => ({ from, to, y: 0, punch });
// screens: zoom from the bottom edge so the tabs / URL bar fall off the top
const scr = (from: number, to: number, scale = 1.14): Shot => ({ from, to, y: 0, scale, origin: "50% 100%", fade: "screen" });
const SHOTS: Shot[] = [
  scr(0, 4.3, 1.04),
  cam(4.3, 8.167, [6.3, 1.06]),
  scr(8.167, 10.3, 1.06),
  scr(10.3, 15.3, 1.06),
  scr(15.3, 21.667),
  scr(21.667, 26.1),
  cam(26.1, 29.4),
  scr(29.4, 33.167, 1.12),
  scr(33.167, 46.3, 1.16),
  scr(46.3, 51.367, 1.12),
  cam(51.367, 53.433, [51.8, 1.06]),
  scr(53.433, 60.333, 1.14),
  scr(60.333, 64.6, 1.18),
  scr(64.6, 68.933, 1.26),
  scr(68.933, 70.4, 1.18),
  scr(70.4, 75.2, 1.12),
  scr(75.2, 77.333, 1.12),
  scr(77.333, 80, 1.1),
  scr(80, 94.867, 1.04),
  cam(94.867, 98.133),
  scr(98.133, 102.567, 1.08),
  cam(102.567, BASE_DUR, [110.5, 1.06]),
];

// caption band per shot type: under the chin on camera, low on screens,
// at the top while the phone with the app fills the lower frame
const capTop = (t: number) => {
  if (t < 4.3) return 250;
  if (t >= 80 && t < 94.867) return 320;
  const s = SHOTS.find((x) => t >= x.from && t < x.to);
  return s?.fade === "screen" ? 1470 : 1380;
};
// the "05" banner already says "tu cotizador, listo"
const NO_CAPTION: [number, number][] = [
  [at("listo.") - 0.3, at("listo.") + 0.5],
  [105.3, BASE_DUR + END_HOLD],
];

// ---------------- parts ----------------
// Step banner: big orange number + title on a black plate, then it settles into the eyebrow.
const Step: React.FC<{ n: string; title: string; from: number; hold?: number }> = ({ n, title, from, hold = 1.8 }) => {
  const t = useT();
  const big = t < from + hold;
  const { p } = useAnim(from, "pop");
  return big ? (
    <div
      style={{
        position: "absolute",
        left: mnc.safe.left,
        top: 230,
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "18px 34px 18px 26px",
        borderRadius: mnc.radius.card,
        background: mnc.colors.black,
        boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        opacity: p,
        transform: `translateY(${(1 - p) * 30}px) scale(${0.94 + 0.06 * p})`,
      }}
    >
      <span style={{ fontFamily: mnc.fonts.title, fontWeight: mnc.weight.extrabold, fontSize: 96, lineHeight: 1, color: mnc.colors.accent, letterSpacing: "-0.04em" }}>{n}</span>
      <span style={{ fontFamily: mnc.fonts.title, fontWeight: mnc.weight.bold, fontSize: 50, lineHeight: 1.05, color: mnc.colors.white, maxWidth: 560 }}>{title}</span>
    </div>
  ) : (
    <In at={from + hold} dist={10} kind="snappy" style={{ left: mnc.safe.left, top: 200 }}>
      <div
        style={{
          padding: "10px 20px",
          borderRadius: mnc.radius.chip,
          background: mnc.colors.black,
          fontFamily: mnc.fonts.body,
          fontWeight: mnc.weight.semibold,
          fontSize: 26,
          letterSpacing: mnc.tracking.label,
          textTransform: "uppercase",
          color: mnc.colors.accent,
        }}
      >
        {n} · {title}
      </div>
    </In>
  );
};

// A row of pills that grows as Manuel names each item (centered, wraps).
const Trail: React.FC<{ items: [string, number, React.ReactNode?][]; top: number; size?: number; arrows?: boolean; dark?: number[] }> = ({
  items,
  top,
  size = 34,
  arrows = true,
  dark = [],
}) => {
  const t = useT();
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top, display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", rowGap: 16, columnGap: 10 }}>
      {items.map(([l, s, ic], i) => (
        <React.Fragment key={l}>
          {arrows && i > 0 ? (
            <Slot at={s}>
              <Arrow size={34} />
            </Slot>
          ) : null}
          <Slot at={s}>
            <Pill icon={ic} label={l} size={size} dark={dark.includes(i)} on={t >= s && t < s + 0.9} />
          </Slot>
        </React.Fragment>
      ))}
    </div>
  );
};

const Slot: React.FC<{ at: number; children: React.ReactNode }> = ({ at: a, children }) => (
  <div style={{ position: "relative", display: "flex" }}>
    <In at={a} dist={18} kind="pop" style={{ position: "relative" }}>
      {children}
    </In>
  </div>
);

// Checklist card: items tick as they are said.
const Checklist: React.FC<{ items: [string, number][]; top: number; title: string; from: number }> = ({ items, top, title, from }) => {
  const t = useT();
  return (
    <In at={from} dist={30} style={{ left: 120, right: 120, top }}>
      <Card style={{ padding: "26px 34px 22px" }}>
        <div style={{ fontFamily: mnc.fonts.body, fontWeight: mnc.weight.semibold, fontSize: 26, letterSpacing: mnc.tracking.label, color: "#8A8A8A" }}>{title}</div>
        {items.map(([l, s], i) => {
          const on = t >= s;
          return (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 16, opacity: on ? 1 : 0.35 }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  flex: "none",
                  borderRadius: "50%",
                  background: on ? mnc.colors.accent : "#E6E6E6",
                  color: mnc.colors.white,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: mnc.fonts.title,
                  fontWeight: mnc.weight.bold,
                  fontSize: 26,
                }}
              >
                {i + 1}
              </div>
              <div style={{ fontFamily: mnc.fonts.title, fontWeight: mnc.weight.semibold, fontSize: 36, color: mnc.colors.ink }}>{l}</div>
            </div>
          );
        })}
      </Card>
    </In>
  );
};

// Google Sheets ⇄ Cotizador link card (over Manuel, under the captions)
const Linked: React.FC<{ from: number; top: number; lines?: [string, string, number][] }> = ({ from, top, lines = [] }) => (
  <>
    <In at={from} dist={24} kind="pop" style={{ left: 0, right: 0, top, display: "flex", justifyContent: "center", alignItems: "center", gap: 18 }}>
      <Pill icon={Icon.grid} label="Google Sheets" size={36} />
      <svg width={70} height={40} viewBox="0 0 70 40">
        <path d="M8 13h50M48 4l10 9-10 9M62 27H12M22 18l-10 9 10 9" fill="none" stroke={mnc.colors.accent} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <Pill icon={Icon.calculator} label="Cotizador" size={36} dark />
    </In>
    {lines.map(([a, b, s], i) => (
      <In key={a} at={s} dist={18} kind="pop" style={{ left: 0, right: 0, top: top + 104 + i * 90, display: "flex", justifyContent: "center", alignItems: "center", gap: 12 }}>
        <Pill label={a} size={30} />
        <Arrow size={32} />
        <Pill label={b} size={30} dark />
      </In>
    ))}
  </>
);

// ---------------- sound ----------------
const SFX = (): [number, SfxKind][] => [
  [0.4, "pop"],
  [8.2, "whoosh"],
  [at("Catálogo"), "click"],
  [at("Cotizaciones,"), "click"],
  [29.45, "whoosh"],
  [at("Apps"), "click"],
  [46.35, "whoosh"],
  [at("COTI"), "pop"],
  [at("Código.gs"), "click"],
  [64.65, "whoosh"],
  [at("Implementar.") - 0.1, "click"],
  [at("listo.") - 0.3, "whoosh"],
  [94.9, "whoosh"],
  [at("automáticamente") - 0.1, "pop"],
  [105.4, "whoosh"],
  [at("COTI", 1) - 0.1, "pop"],
];

// ---------------- composition ----------------
export const Mnc5Reel: React.FC = () => (
  <AbsoluteFill style={{ background: mnc.colors.black }}>
    <Audio src={staticFile(SRC)} />
    <Cam src={SRC} shots={SHOTS} />
    <Win from={BASE_DUR} to={BASE_DUR + END_HOLD}>
      <HoldFrame src={SRC} frame={Math.round((BASE_DUR - 0.05) * MNC5_FPS)} y={0} />
    </Win>

    {/* HOOK — the finished app in hand, then Manuel */}
    <Win from={0} to={4.3}>
      <Statement top={1240} lead="crea tu cotizador" big="con IA" plate="sin saber programar" at={[0.1, 0.45, 1.6]} bigSize={210} />
    </Win>

    {/* 01 · GOOGLE SHEETS */}
    <Win from={8.167} to={29.4}>
      <Step n="01" title="Prepara tu Google Sheets" from={8.2} />
    </Win>
    <Win from={10.3} to={15.3}>
      <Trail top={1200} arrows={false} items={[["Catálogo", at("Catálogo") - 0.1, Icon.grid], ["Cotizaciones", at("Cotizaciones,") - 0.1, Icon.grid]]} />
    </Win>
    <Win from={15.3} to={21.667}>
      <In at={15.5} dist={14} kind="snappy" style={{ left: 0, right: 0, top: 1130, textAlign: "center" }}>
        <Label>PESTAÑA CATÁLOGO</Label>
      </In>
      <Trail top={1190} arrows={false} items={[["Producto", at("Producto,") - 0.1], ["Categoría", at("Categoría") - 0.1], ["Precio", at("Precio.") - 0.1]]} />
    </Win>
    <Win from={21.667} to={26.1}>
      <In at={21.8} dist={14} kind="snappy" style={{ left: 0, right: 0, top: 1130, textAlign: "center" }}>
        <Label>PESTAÑA COTIZACIONES</Label>
      </In>
      <Trail
        top={1190}
        arrows={false}
        items={[["Fecha", at("Fecha,") - 0.1], ["Cliente", at("Cliente,") - 0.1], ["Productos", at("Productos,") - 0.1], ["Total", at("Total") - 0.1]]}
      />
    </Win>

    {/* 02 · APPS SCRIPT */}
    <Win from={29.4} to={46.3}>
      <Step n="02" title="Configura Apps Script" from={29.45} />
    </Win>
    <Win from={29.4} to={33.167}>
      <Trail top={1200} items={[["Extensiones", at("Extensiones,") - 0.1], ["Apps Script", at("Apps") - 0.1]]} dark={[1]} />
    </Win>
    <Win from={33.167} to={46.3}>
      <Checklist
        top={1010}
        from={33.3}
        title="EN APPS SCRIPT"
        items={[
          ["Borra el código de Código.gs", at("borrar.") - 0.2],
          ["+  →  HTML", at("HTML,") - 0.1],
          ["Nómbralo Index", at("Index") - 0.1],
          ["Borra su contenido", at("borramos.") - 0.3],
        ]}
      />
    </Win>

    {/* 03 · CÓDIGO CON IA */}
    <Win from={46.3} to={64.6}>
      <Step n="03" title="Genera el código con IA" from={46.35} />
    </Win>
    <Win from={46.3} to={51.367}>
      <Trail top={1250} items={[["Tu IA favorita", at("favorita,") - 0.1, Icon.sparkle], ["Prompt + Enter", at("Enter") - 0.1, Icon.doc]]} dark={[0]} size={34} />
    </Win>
    <Win from={51.367} to={53.433}>
      <In at={at("COTI") - 0.15} dist={20} kind="pop" style={{ left: 0, right: 0, top: 1548, display: "flex", justifyContent: "center" }}>
        <Pill icon={Icon.chat} label="Comenta COTI" size={38} dark />
      </In>
    </Win>
    <Win from={53.433} to={60.333}>
      <Trail top={1250} arrows={false} items={[["Código.gs", at("Código.gs") - 0.1, Icon.doc], ["Index.html", at("Index.") - 0.1, Icon.doc]]} dark={[0, 1]} size={36} />
    </Win>
    <Win from={60.333} to={64.6}>
      <Trail top={1250} items={[["Copia", at("copiar") - 0.1], ["Pega en su archivo", at("pegar") - 0.1]]} dark={[1]} />
    </Win>

    {/* 04 · IMPLEMENTA */}
    <Win from={64.6} to={86.9}>
      <Step n="04" title="Implementa tu app" from={64.65} />
    </Win>
    <Win from={64.6} to={70.4}>
      <Trail top={330} items={[["Implementar", at("Implementar,") - 0.1], ["Nueva implementación", at("Nueva") - 0.1], ["⚙  App web", at("tuerquita,") - 0.1]]} size={32} />
    </Win>
    <Win from={70.4} to={75.2}>
      <Trail top={330} arrows={false} items={[["Ejecutar como: Yo", at("yo") - 0.1], ["Acceso: Solo yo", at("solo") - 0.1], ["Implementar", at("Implementar.") - 0.1]]} dark={[2]} size={32} />
    </Win>
    <Win from={75.2} to={80}>
      <Trail top={330} items={[["Autoriza el acceso", at("accesos") - 0.1], ["App web: Copiar", at("copiar.") - 0.3]]} dark={[1]} size={32} />
    </Win>
    <Win from={80} to={86.9}>
      <Trail top={460} items={[["Navegador", at("navegador") - 0.1, Icon.globe], ["Pegar", at("Pegar,") - 0.1], ["Ir", at("Ir") - 0.1]]} dark={[2]} size={32} />
    </Win>

    {/* 05 · RESULTADO — the real app, few overlays */}
    <Win from={at("listo.") - 0.3} to={94.867}>
      <Step n="05" title="Tu cotizador, listo" from={at("listo.") - 0.3} hold={0.8} />
    </Win>
    <Win from={87.1} to={94.867}>
      <Trail top={460} items={[["Selecciona productos", at("seleccionar") - 0.1], ["Ve el total", at("ver") - 0.1], ["Guarda", at("guardar") - 0.1]]} dark={[2]} size={30} />
    </Win>

    {/* 06 · TODO CONECTADO */}
    <Win from={94.867} to={105.3}>
      <Step n="06" title="Todo está conectado" from={94.9} />
    </Win>
    <Win from={94.867} to={98.133}>
      <Linked from={at("ligado") - 0.1} top={1548} />
    </Win>
    <Win from={98.133} to={102.567}>
      <Trail top={330} items={[["Cambias el precio", at("cambias") - 0.1], ["Se actualiza en la app", at("automáticamente") - 0.1]]} dark={[1]} size={32} />
    </Win>
    <Win from={102.567} to={105.3}>
      <In at={at("agregar") - 0.1} dist={18} kind="pop" style={{ left: 0, right: 0, top: 1548, display: "flex", justifyContent: "center", alignItems: "center", gap: 12 }}>
        <Pill label="Agregas un producto" size={32} />
        <Arrow size={34} />
        <Pill label="Aparece en la app" size={32} dark />
      </In>
    </Win>

    {/* CTA */}
    <Win from={105.3} to={BASE_DUR + END_HOLD}>
      <Statement top={1250} lead="comenta" big="COTI" plate="recibe la guía + los prompts" at={[105.4, 105.75, 106.4]} bigSize={230} />
    </Win>

    <Sfx cues={SFX()} />
    <Captions chunks={CHUNKS} hidden={NO_CAPTION} top={capTop} />
  </AbsoluteFill>
);

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontFamily: mnc.fonts.body, fontWeight: mnc.weight.semibold, fontSize: 28, letterSpacing: mnc.tracking.label, color: mnc.colors.white, textShadow: "0 1px 10px rgba(0,0,0,0.7)" }}>
    {children}
  </div>
);
