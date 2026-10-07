import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { mnc } from "../mnc/mncTheme";
import { makeCaptions, type Word } from "../mnc/captionsCore";
import { Captions } from "../mnc/components/Captions";
import { BrandMark, Card } from "../mnc/components/Primitives";
import { Icon } from "../mnc/components/Icons";
import { Flow } from "../mnc/components/Flow";
import words from "./words.json";
import { Arrow, CaptureCard, CaseIntro, Cam, Eyebrow, HoldFrame, In, Pill, Stat, Statement, Title, Win, useOn, useT, type Shot } from "./Kit";

// "4 cosas que tu empresa sigue haciendo a mano que la IA ya hace" — MNC reel.
// The source is one already jump-cut take (selfie camera + phone pointed at a
// monitor). Camera shots stay on screen with overlays in the top band; monitor
// slides are rebuilt as MNC graphics; real dashboards/sites become capture cards.

export const MNC4_FPS = 30;
const SRC = "mnc4/clips/base.mp4";
const BASE_DUR = 116.33;
const END_HOLD = 1.6;
export const MNC4_TOTAL_F = Math.round((BASE_DUR + END_HOLD) * MNC4_FPS);

const KEYWORDS: string[][] = [
  ["8", "pasos"],
  ["4", "personas"],
  ["1", "y", "4", "horas"],
  ["soy", "galo"],
  ["planeación", "de", "compras"],
  ["capital", "parado"],
  ["pierdes", "ventas"],
  ["materias", "primas"],
  ["flujo", "de", "caja"],
  ["rutas", "y", "entregas"],
  ["dinero", "diario"],
  ["a", "mano"],
  ["pedidos"],
  ["agente"],
  ["inventario"],
  ["confirmación"],
  ["excel"],
  ["margen"],
  ["tendencias"],
  ["sellout"],
  ["proveedores"],
  ["tablero"],
  ["cobranza"],
  ["banco"],
  ["depósitos"],
  ["recordatorios"],
  ["vencimiento"],
  ["portal"],
  ["rastreador"],
  ["comentarios"],
  ["ia"],
  ["whatsapp"],
  ["datos"],
];
const { CHUNKS, at } = makeCaptions(words as Word[], KEYWORDS);

// camera shots (cuts measured on the source); y lifts the face above the captions
const SHOTS: Shot[] = [
  { from: 0, to: 4.333 },
  { from: 6.2, to: 22.667 },
  { from: 24.367, to: 37.4 },
  { from: 41.933, to: 44.167, punch: [42.2, 1.07] },
  { from: 46.167, to: 50.467 },
  { from: 79.867, to: 83.233 },
  { from: 94.433, to: 99.9 },
  { from: 104.1, to: 109.5 },
  { from: 113.267, to: BASE_DUR, punch: [113.3, 1.05] },
];

// times where a Statement already says the line → no caption
const NO_CAPTION: [number, number][] = [
  [0, 4.333],
  [56.3, 57.9],
  [79.867, 83.233],
  [113.267, BASE_DUR + END_HOLD],
];

// ---------------- band (overlays above Manuel's head) ----------------
const BAND = 270;

const Chain: React.FC<{ steps: [React.ReactNode, string, number][]; perRow: number; top?: number }> = ({ steps, perRow, top = BAND }) => {
  const t = useT();
  const rows: (typeof steps)[] = [];
  for (let i = 0; i < steps.length; i += perRow) rows.push(steps.slice(i, i + perRow));
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
      {rows.map((r, ri) => (
        <div key={ri} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {r.map(([ic, l, s], i) => {
            const last = ri * perRow + i === steps.length - 1;
            return (
              <React.Fragment key={l}>
                <InFlow at={s}>
                  <Pill icon={ic} label={l} size={30} on={t >= s && t < s + 0.9} />
                </InFlow>
                {!last ? (
                  <InFlow at={s + 0.15}>
                    <Arrow size={34} />
                  </InFlow>
                ) : null}
              </React.Fragment>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// inline (flex) variant of <In>
const InFlow: React.FC<{ at: number; children: React.ReactNode }> = ({ at: a, children }) => (
  <div style={{ position: "relative", display: "flex" }}>
    <In at={a} dist={20} kind="pop" style={{ position: "relative" }}>
      {children}
    </In>
  </div>
);

// ---------------- case 1 · pedidos ----------------
const Antes = (): [React.ReactNode, string, number][] => [
  [Icon.chat, "WhatsApp / correo", at("correo,") - 0.1],
  [Icon.form, "Captura", at("captura,")],
  [Icon.warehouse, "Almacén", at("almacén")],
  [Icon.box, "Existencias", at("existencias,")],
  [Icon.tag, "Ventas", at("ventas")],
  [Icon.user, "Cliente", at("cliente.")],
];

const Versus: React.FC<{ t0: number }> = ({ t0 }) => {
  const old = ["WhatsApp / correo", "Captura", "Almacén", "Existencias", "Ventas", "Cliente"];
  const ia: [React.ReactNode, string][] = [
    [Icon.chat, "Pedido"],
    [Icon.sparkle, "Agente IA"],
    [Icon.box, "Inventario"],
    [Icon.check, "Confirmación"],
  ];
  const col = (x: number, label: string, a: number) => (
    <In at={a} dist={16} kind="snappy" style={{ left: x, top: 330 }}>
      <div style={{ fontFamily: mnc.fonts.body, fontWeight: mnc.weight.semibold, fontSize: 30, letterSpacing: mnc.tracking.label, color: mnc.colors.gray }}>
        {label}
      </div>
    </In>
  );
  return (
    <>
      {col(96, "ANTES", t0)}
      {col(590, "CON IA", t0 + 0.2)}
      {old.map((l, i) => (
        <In key={l} at={t0 + i * 0.05} dist={16} style={{ left: 96, top: 410 + i * 120 }}>
          <Pill label={l} dim size={28} />
        </In>
      ))}
      <In at={t0 + 0.3} dist={16} style={{ left: 96, top: 1150 }}>
        <div style={{ fontFamily: mnc.fonts.body, fontWeight: mnc.weight.medium, fontSize: 30, color: mnc.colors.gray }}>8 pasos · 4 personas</div>
      </In>
      {ia.map(([ic, l], i) => (
        <React.Fragment key={l}>
          <In at={t0 + 0.35 + i * 0.14} dist={24} kind="pop" style={{ left: 590, top: 410 + i * 190 }}>
            <Pill icon={ic} label={l} size={32} dark={i === 1} />
          </In>
          {i < 3 ? (
            <In at={t0 + 0.45 + i * 0.14} dist={10} style={{ left: 640, top: 500 + i * 190 }}>
              <Arrow dir="down" size={56} />
            </In>
          ) : null}
        </React.Fragment>
      ))}
    </>
  );
};

const IaFlowBand: React.FC = () => (
  <Chain
    perRow={2}
    steps={[
      [Icon.chat, "Pedido", at("pedido,", 0, 24)],
      [Icon.sparkle, "Agente IA", at("agente")],
      [Icon.box, "Inventario", at("inventario")],
      [Icon.check, "Confirmación", at("confirmación.")],
    ]}
  />
);

const DataBand: React.FC = () => {
  const items: [string, number][] = [
    ["Quién compra", at("quién", 0, 30)],
    ["Cuánto compra", at("cuánto", 0, 30)],
    ["Clientes atrasados", at("pasaron")],
    ["Qué venderles", at("sugerir")],
  ];
  return (
    <>
      <In at={at("datos") - 0.1} dist={14} kind="snappy" style={{ left: 0, right: 0, top: BAND, textAlign: "center" }}>
        <div style={{ fontFamily: mnc.fonts.body, fontWeight: mnc.weight.semibold, fontSize: 28, letterSpacing: mnc.tracking.label, color: mnc.colors.white, textShadow: "0 1px 10px rgba(0,0,0,0.6)" }}>
          DATOS QUE AHORA TIENES
        </div>
      </In>
      {items.map(([l, s], i) => (
        <In key={l} at={s} dist={20} kind="pop" style={{ left: i % 2 ? 556 : 96, top: BAND + 60 + Math.floor(i / 2) * 100 }}>
          <Pill icon={Icon.chart} label={l} size={28} />
        </In>
      ))}
    </>
  );
};

// ---------------- case 2 · planeación ----------------
const ExcelBand: React.FC = () => {
  const t0 = at("Excel,") - 0.2;
  const t = useT();
  const tick = at("producto", 0, 47);
  return (
    <In at={t0} dist={30} style={{ left: 250, top: BAND }}>
      <Card style={{ width: 580, padding: "18px 22px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: mnc.fonts.body, fontWeight: mnc.weight.semibold, fontSize: 26 }}>
          <div style={{ width: 34, height: 34, color: mnc.colors.accent }}>{Icon.grid}</div>
          Excel · promedio por producto
        </div>
        {[0, 1, 2, 3].map((i) => {
          const on = t >= tick + i * 0.28;
          return (
            <div key={i} style={{ display: "flex", gap: 14, marginTop: 12, alignItems: "center" }}>
              <div style={{ height: 20, width: 200, borderRadius: 6, background: "#E6E6E6" }} />
              <div style={{ height: 20, width: 120, borderRadius: 6, background: "#E6E6E6" }} />
              <div style={{ height: 20, flex: 1, borderRadius: 6, background: on ? mnc.colors.accent : "#E6E6E6" }} />
            </div>
          );
        })}
      </Card>
    </In>
  );
};

const Branches: React.FC = () => {
  const row = (y: number, items: [string, number, boolean?][]) =>
    items.map(([l, s, hot], i) => (
      <React.Fragment key={l}>
        <In at={s} dist={24} kind="pop" style={{ left: i ? 500 : 96, top: y }}>
          <Pill label={l} size={30} dark={hot} />
        </In>
      </React.Fragment>
    ));
  const corto = at("corto,");
  const mas = at("más,", 0, 52);
  return (
    <>
      <Title at={50.5}>Si pides con un promedio…</Title>
      <In at={corto - 0.2} dist={16} kind="snappy" style={{ left: 96, top: 560 }}>
        <Label>PIDES POCO</Label>
      </In>
      {row(620, [["Te quedas corto", corto], ["Pierdes ventas", at("pierdes"), true]])}
      <In at={corto + 0.1} style={{ left: 430, top: 632 }}>
        <Arrow size={44} />
      </In>
      <In at={mas - 0.3} dist={16} kind="snappy" style={{ left: 96, top: 860 }}>
        <Label>PIDES DE MÁS</Label>
      </In>
      <In at={at("inventario", 0, 53)} dist={24} kind="pop" style={{ left: 96, top: 920 }}>
        <Pill icon={Icon.box} label="Te sobra inventario" size={30} />
      </In>
      <In at={at("inventario", 0, 53) + 0.2} style={{ left: 140, top: 1020 }}>
        <Arrow dir="down" size={56} />
      </In>
      <In at={at("capital")} dist={24} kind="pop" style={{ left: 96, top: 1100 }}>
        <Pill icon={Icon.warehouse} label="Capital parado en bodega" size={34} dark />
      </In>
    </>
  );
};

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontFamily: mnc.fonts.body, fontWeight: mnc.weight.semibold, fontSize: 28, letterSpacing: mnc.tracking.label, color: mnc.colors.gray }}>{children}</div>
);

const Sources: React.FC = () => {
  const t = useT();
  const src: [React.ReactNode, string, number][] = [
    [Icon.globe, "Tendencias y noticias", at("tendencias")],
    [Icon.chart, "Sell-out de tus clientes", at("sell-out")],
    [Icon.box, "Consumo de productos", at("consumiendo")],
    [Icon.bolt, "Materias primas", at("materias")],
    [Icon.team, "Proveedores", at("proveedores")],
  ];
  const core: [number, number] = [830, 870];
  const tTab = at("tablero");
  return (
    <>
      <Title at={58.0}>
        Con IA: fuentes que antes <span style={{ color: mnc.colors.accent }}>no podías medir</span>
      </Title>
      {src.map(([ic, l, s], i) => (
        <React.Fragment key={l}>
          <In at={s - 0.1} dist={20} kind="pop" style={{ left: 96, top: 560 + i * 128 }}>
            <Pill icon={ic} label={l} size={29} on={t >= s - 0.1 && t < s + 1.2} />
          </In>
          <Win from={s + 0.2} to={76.433}>
            <Flow from={[590, 600 + i * 128]} to={[core[0] - 100, core[1] + (i - 2) * 30]} bend={(i - 2) * -14} dots={1} period={1.1} />
          </Win>
        </React.Fragment>
      ))}
      <In at={at("muchos") - 0.1} dist={16} style={{ left: 96, top: 560 + 5 * 128 }}>
        <div style={{ fontFamily: mnc.fonts.body, fontWeight: mnc.weight.medium, fontSize: 30, color: mnc.colors.gray }}>…y muchos datos más</div>
      </In>
      <In at={at("tendencias") + 0.3} dist={30} kind="pop" style={{ left: core[0] - 100, top: core[1] - 100 }}>
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            border: `5px solid ${mnc.colors.accent}`,
            background: mnc.colors.black,
            boxShadow: "0 0 60px rgba(253,102,35,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: mnc.fonts.title,
            fontWeight: mnc.weight.extrabold,
            fontSize: 76,
            color: mnc.colors.white,
          }}
        >
          IA
        </div>
      </In>
      <In at={tTab - 0.1} dist={10} style={{ left: core[0] - 28, top: core[1] + 120 }}>
        <Arrow dir="down" size={56} />
      </In>
      <In at={tTab} dist={24} kind="pop" style={{ left: 600, top: core[1] + 200 }}>
        <Pill icon={Icon.chart} label="Tablero" size={34} dark />
      </In>
    </>
  );
};

const AnswerChips: React.FC = () => (
  <div style={{ position: "absolute", left: 96, right: 96, top: BAND + 10, display: "flex", gap: 16, justifyContent: "center" }}>
    {(
      [
        ["Qué pedir", at("pedir,", 0, 77)],
        ["Cuánto", at("cuánto", 0, 78)],
        ["A quién", at("quién.", 0, 79)],
      ] as [string, number][]
    ).map(([l, s]) => (
      <InFlow key={l} at={s - 0.1}>
        <Pill icon={Icon.check} label={l} size={30} dark />
      </InFlow>
    ))}
  </div>
);

// ---------------- case 3 · cobranza ----------------
const CobranzaHoy: React.FC = () => (
  <>
    <Title at={83.3}>
      Hoy: alguien revisa el banco <span style={{ color: mnc.colors.accent }}>todos los días</span>
    </Title>
    <In at={at("banco", 0, 83)} dist={24} kind="pop" style={{ left: 96, top: 600 }}>
      <Pill icon={Icon.bank} label="Banco" size={36} />
    </In>
    <In at={at("banco", 0, 83) + 0.3} style={{ left: 150, top: 715 }}>
      <Arrow dir="down" size={60} />
    </In>
    <In at={at("quién", 0, 85)} dist={24} kind="pop" style={{ left: 96, top: 800 }}>
      <Card style={{ padding: "26px 34px", fontFamily: mnc.fonts.title, fontWeight: mnc.weight.bold, fontSize: 52, letterSpacing: mnc.tracking.title }}>
        ¿De quién es este <span style={{ color: mnc.colors.accent }}>pago</span>?
      </Card>
    </In>
    <In at={at("pago", 0, 86) + 0.2} style={{ left: 150, top: 950 }}>
      <Arrow dir="down" size={60} />
    </In>
    <In at={at("pago", 0, 86) + 0.3} dist={24} kind="pop" style={{ left: 96, top: 1035 }}>
      <Pill icon={Icon.user} label="Revisión manual" size={34} dim />
    </In>
    <In at={at("acuerda.") - 0.6} dist={24} kind="pop" style={{ left: 96, top: 1180 }}>
      <Pill icon={Icon.clock} label="Se cobra cuando alguien se acuerda" size={30} dark />
    </In>
  </>
);

const CobranzaIA: React.FC = () => {
  const tC = at("Con", 0, 89.5);
  const tDep = at("depósitos");
  const tPed = at("pedidos.", 0, 92);
  return (
    <>
      <Title at={tC}>
        Con IA: el agente <span style={{ color: mnc.colors.accent }}>concilia</span>
      </Title>
      <In at={tDep - 0.1} dist={24} kind="pop" style={{ left: 96, top: 600 }}>
        <Pill icon={Icon.bank} label="Depósitos" size={34} />
      </In>
      <In at={tPed - 0.2} dist={24} kind="pop" style={{ left: 600, top: 600 }}>
        <Pill icon={Icon.doc} label="Pedidos" size={34} />
      </In>
      <In at={tPed - 0.1} style={{ left: 500, top: 606 }}>
        <div style={{ fontFamily: mnc.fonts.title, fontWeight: mnc.weight.bold, fontSize: 60, color: mnc.colors.accent }}>+</div>
      </In>
      <Win from={tPed} to={94.433}>
        <Flow from={[260, 700]} to={[480, 860]} dots={1} period={0.9} />
        <Flow from={[760, 700]} to={[600, 860]} dots={1} period={0.9} />
      </Win>
      <In at={tPed + 0.1} dist={24} kind="pop" style={{ left: 330, top: 870 }}>
        <Pill icon={Icon.sparkle} label="Agente IA" size={38} dark />
      </In>
      <In at={tPed + 0.35} style={{ left: 510, top: 1000 }}>
        <Arrow dir="down" size={60} />
      </In>
      <In at={tPed + 0.45} dist={24} kind="pop" style={{ left: 310, top: 1080 }}>
        <Pill icon={Icon.check} label="Conciliación" size={38} on />
      </In>
    </>
  );
};

const ReminderBand: React.FC = () => {
  const tA = at("antes", 0, 96);
  const tD = at("después", 0, 96);
  const tV = at("vencimiento");
  return (
    <>
      <In at={at("recordatorios") - 0.1} dist={20} kind="pop" style={{ left: 0, right: 0, top: BAND, display: "flex", justifyContent: "center" }}>
        <Pill icon={Icon.chat} label="Recordatorio por WhatsApp" size={30} dark />
      </In>
      <In at={tA - 0.1} dist={16} style={{ left: 96, right: 96, top: BAND + 110 }}>
        <div style={{ position: "relative", height: 120 }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 30, height: 6, borderRadius: 3, background: mnc.colors.white, opacity: 0.85 }} />
          <Tick x={150} label="Antes" at={tA} />
          <Tick x={444} label="Vencimiento" at={tV} big />
          <Tick x={740} label="Después" at={tD} />
        </div>
      </In>
    </>
  );
};

const Tick: React.FC<{ x: number; label: string; at: number; big?: boolean }> = ({ x, label, at: a, big }) => {
  const on = useOn(a);
  return (
    <div style={{ position: "absolute", left: x - 100, width: 200, top: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div
        style={{
          width: big ? 44 : 34,
          height: big ? 44 : 34,
          marginTop: big ? 11 : 16,
          borderRadius: "50%",
          background: on ? mnc.colors.accent : mnc.colors.white,
          border: `4px solid ${mnc.colors.white}`,
        }}
      />
      <div style={{ fontFamily: mnc.fonts.body, fontWeight: mnc.weight.semibold, fontSize: 28, color: mnc.colors.white, textShadow: "0 1px 10px rgba(0,0,0,0.7)" }}>{label}</div>
    </div>
  );
};

// ---------------- case 4 · rutas ----------------
const CaseBand: React.FC<{ n: string; title: string; at: number }> = ({ n, title, at: a }) => (
  <In at={a} dist={30} kind="pop" style={{ left: mnc.safe.left, top: BAND }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 22, textShadow: "4px 6px 10px rgba(0,0,0,0.45)" }}>
      <span style={{ fontFamily: mnc.fonts.title, fontWeight: mnc.weight.extrabold, fontSize: 130, color: mnc.colors.accent, letterSpacing: "-0.04em" }}>{n}</span>
      <span style={{ fontFamily: mnc.fonts.title, fontWeight: mnc.weight.bold, fontSize: 70, color: mnc.colors.white, letterSpacing: "-0.02em" }}>{title}</span>
    </div>
  </In>
);

const WhereBand: React.FC = () => (
  <>
    <In at={at("dónde") - 0.2} dist={24} kind="pop" style={{ left: 96, top: BAND }}>
      <div
        style={{
          padding: "20px 30px",
          borderRadius: "28px 28px 28px 6px",
          background: mnc.colors.card,
          fontFamily: mnc.fonts.body,
          fontWeight: mnc.weight.medium,
          fontSize: 38,
          color: mnc.colors.ink,
          boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
        }}
      >
        ¿Dónde está mi pedido?
      </div>
    </In>
    <In at={at("nadie")} dist={24} kind="pop" style={{ left: 560, top: BAND + 130 }}>
      <div
        style={{
          padding: "14px 26px",
          borderRadius: mnc.radius.chip,
          border: `3px solid ${mnc.colors.accent}`,
          background: "rgba(0,0,0,0.55)",
          color: mnc.colors.accent,
          fontFamily: mnc.fonts.body,
          fontWeight: mnc.weight.semibold,
          fontSize: 30,
        }}
      >
        Sin respuesta
      </div>
    </In>
  </>
);

const Tracker: React.FC = () => {
  const t = useT();
  const t0 = at("rastreador") - 0.3;
  const states: [React.ReactNode, string][] = [
    [Icon.check, "Pedido recibido"],
    [Icon.box, "En preparación"],
    [Icon.truck, "En ruta"],
    [Icon.pin, "Entregado"],
  ];
  const step = (i: number) => t0 + 0.4 + i * 0.6;
  return (
    <>
      <Title at={109.55}>
        Con IA: un <span style={{ color: mnc.colors.accent }}>rastreador</span> como el de la pizza
      </Title>
      <In at={t0 - 0.2} dist={40} style={{ left: 190, top: 560 }}>
        <Card style={{ width: 700, padding: "34px 40px" }}>
          <div style={{ fontFamily: mnc.fonts.body, fontWeight: mnc.weight.semibold, fontSize: 26, letterSpacing: mnc.tracking.label, color: "#8A8A8A" }}>TU PEDIDO</div>
          {states.map(([ic, l], i) => {
            const on = t >= step(i);
            const now = on && (i === states.length - 1 || t < step(i + 1));
            return (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 30, position: "relative" }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    flex: "none",
                    background: on ? mnc.colors.accent : "#EDEDED",
                    color: on ? mnc.colors.white : "#B8B8B8",
                    padding: 16,
                    boxShadow: now ? "0 0 0 8px rgba(253,102,35,0.25)" : undefined,
                  }}
                >
                  {ic}
                </div>
                <div style={{ fontFamily: mnc.fonts.title, fontWeight: mnc.weight.semibold, fontSize: 40, color: on ? mnc.colors.ink : "#B8B8B8" }}>{l}</div>
                {i < states.length - 1 ? (
                  <div style={{ position: "absolute", left: 33, top: 76, width: 6, height: 30, borderRadius: 3, background: t >= step(i + 1) ? mnc.colors.accent : "#EDEDED" }} />
                ) : null}
              </div>
            );
          })}
        </Card>
      </In>
      <In at={at("notificaciones.") - 0.2} dist={24} kind="pop" style={{ left: 190, top: 1210 }}>
        <Pill icon={Icon.bell} label="Notificaciones automáticas" size={30} dark />
      </In>
    </>
  );
};

// ---------------- composition ----------------
export const Mnc4Reel: React.FC = () => (
  <AbsoluteFill style={{ background: mnc.colors.black }}>
    <Audio src={staticFile(SRC)} />
    <Cam src={SRC} shots={SHOTS} />
    <Win from={BASE_DUR} to={BASE_DUR + END_HOLD}>
      <HoldFrame src={SRC} frame={Math.round((BASE_DUR - 0.05) * MNC4_FPS)} />
    </Win>

    {/* HOOK */}
    <Win from={0} to={4.333}>
      <Statement top={1250} lead="4 cosas que sigues haciendo" big="a mano" plate="que la IA ya hace" at={[0.05, at("mano") - 0.1, at("IA") - 0.1]} />
    </Win>

    {/* 01 · PEDIDOS */}
    <Win from={4.333} to={6.2}>
      <CaseIntro n="01" title="Pedidos" at={4.36} />
    </Win>
    <Win from={6.2} to={44.167}>
      <Eyebrow label="01 · Pedidos" at={6.2} />
    </Win>
    <Win from={6.2} to={at("8") - 0.1}>
      <Chain steps={Antes()} perRow={3} />
    </Win>
    <Win from={at("8") - 0.1} to={at("1") - 0.1}>
      <In at={at("8") - 0.1} kind="pop" style={{ left: 96, top: BAND }}>
        <Stat value="8" label="pasos" w={420} />
      </In>
      <In at={at("4") - 0.1} kind="pop" style={{ left: 564, top: BAND }}>
        <Stat value="4" label="personas" w={420} />
      </In>
    </Win>
    <Win from={at("1") - 0.1} to={22.667}>
      <In at={at("1") - 0.1} kind="pop" style={{ left: 96, top: BAND }}>
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <Stat value="1–4 h" label="para recibir el precio" w={560} size={120} />
          <div style={{ width: 120, height: 120, color: mnc.colors.white, filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.6))" }}>{Icon.clock}</div>
        </div>
      </In>
    </Win>
    <Win from={22.667} to={24.367}>
      <Versus t0={22.69} />
    </Win>
    <Win from={24.367} to={at("datos") - 0.15}>
      <IaFlowBand />
    </Win>
    <Win from={at("datos") - 0.15} to={37.4}>
      <DataBand />
    </Win>
    <Win from={37.4} to={41.933}>
      <CaptureCard src={SRC} from={37.4} crop={330} />
      <In at={at("Soy") - 0.15} kind="pop" style={{ left: 96, top: BAND + 10 }}>
        <Pill icon={Icon.bolt} label="Soy Galo · startup" size={32} dark />
      </In>
    </Win>

    {/* 02 · PLANEACIÓN DE COMPRAS */}
    <Win from={44.167} to={46.167}>
      <CaseIntro n="02" title="Planeación de compras" at={44.19} />
    </Win>
    <Win from={46.167} to={79.867}>
      <Eyebrow label="02 · Planeación de compras" at={46.167} />
    </Win>
    <Win from={46.167} to={50.467}>
      <ExcelBand />
    </Win>
    <Win from={50.467} to={56.3}>
      <Branches />
    </Win>
    <Win from={56.3} to={57.9}>
      <Statement top={700} lead="aquí vive" big="tu margen" at={[56.32, at("vive") + 0.15]} bigSize={200} />
    </Win>
    <Win from={57.9} to={76.433}>
      <Sources />
    </Win>
    <Win from={76.433} to={79.867}>
      <CaptureCard src={SRC} from={76.433} crop={300} top={420} h={980} />
      <AnswerChips />
    </Win>

    {/* 03 · COBRANZA */}
    <Win from={79.867} to={83.233}>
      <Statement top={1270} lead="el que te cuesta" big="dinero diario" plate="03 · cobranza" at={[79.9, at("dinero") - 0.1, at("cobranza.") - 0.1]} bigSize={150} />
    </Win>
    <Win from={83.233} to={104.1}>
      <Eyebrow label="03 · Cobranza" at={83.233} />
    </Win>
    <Win from={83.233} to={at("Con", 0, 89.5) - 0.05}>
      <CobranzaHoy />
    </Win>
    <Win from={at("Con", 0, 89.5) - 0.05} to={94.433}>
      <CobranzaIA />
    </Win>
    <Win from={94.433} to={99.9}>
      <ReminderBand />
    </Win>
    <Win from={99.9} to={104.1}>
      <CaptureCard src={SRC} from={99.9} crop={260} />
      <In at={at("flujo") - 0.15} kind="pop" style={{ left: 96, top: BAND + 10 }}>
        <Pill icon={Icon.chart} label="Flujo de caja enfrente" size={32} dark />
      </In>
    </Win>

    {/* 04 · RUTAS Y ENTREGAS */}
    <Win from={104.1} to={106.15}>
      <CaseBand n="04" title="Rutas y entregas" at={104.15} />
    </Win>
    <Win from={106.15} to={113.267}>
      <Eyebrow label="04 · Rutas y entregas" at={106.15} />
    </Win>
    <Win from={106.15} to={109.5}>
      <WhereBand />
    </Win>
    <Win from={109.5} to={113.267}>
      <Tracker />
    </Win>

    {/* CTA */}
    <Win from={113.267} to={BASE_DUR + END_HOLD}>
      <Statement top={1250} lead="¿qué otro proceso sigues" big="a mano?" plate="te leo en comentarios ↓" at={[113.3, 113.75, at("leo") - 0.1]} bigSize={200} />
    </Win>

    <Captions chunks={CHUNKS} hidden={NO_CAPTION} />
    <BrandMark shadow />
  </AbsoluteFill>
);
