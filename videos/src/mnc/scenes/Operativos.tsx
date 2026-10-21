import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { mnc } from "../mncTheme";
import { Card, Chip, HandArrow, Hl, NodeCard, rise, SectionHeader, Spark, useEnter, useExit } from "../components/Primitives";
import { Icon } from "../components/Icons";
import { Flow } from "../components/Flow";

// Every scene receives `t0` (its absolute start, s) and positions its beats
// with `r(t)` = time relative to the scene, taken from the word timings.
type S = { t0: number };
const R = (t0: number) => (t: number) => Math.max(0, t - t0);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Title: React.FC<{ children: React.ReactNode; delay?: number; top?: number; size?: number }> = ({
  children,
  delay = 0,
  top = 352,
  size = 76,
}) => {
  const p = useEnter(delay, "smooth");
  const exit = useExit(0.22);
  return (
    <div
      style={{
        position: "absolute",
        left: mnc.safe.left,
        right: 1080 - mnc.safe.right,
        top,
        fontFamily: mnc.fonts.title,
        fontWeight: mnc.weight.bold,
        fontSize: size,
        lineHeight: 1.06,
        letterSpacing: mnc.tracking.title,
        color: mnc.colors.white,
        ...rise(p, 40, exit),
      }}
    >
      {children}
    </div>
  );
};

// Persistent section eyebrow (stays while its sub-scenes change underneath).
export const SectionLabel: React.FC<{ label: string }> = ({ label }) => <SectionHeader label={label} />;

// ---------------- Overview: the four families of use cases ----------------
export const Overview: React.FC<S & { tTodos: number }> = ({ t0, tTodos }) => {
  const r = R(t0);
  const items: [React.ReactNode, string][] = [
    [Icon.bolt, "Automatizaciones"],
    [Icon.sparkle, "Flujos con IA"],
    [Icon.user, "Agentes de IA"],
    [Icon.apps, "Apps"],
  ];
  return (
    <AbsoluteFill>
      <Title delay={0.05}>
        Todos los <Hl>casos de uso</Hl>
      </Title>
      {items.map(([ic, l], i) => (
        <NodeCard
          key={l}
          icon={ic}
          label={l}
          x={i % 2 === 0 ? 96 : 552}
          y={i < 2 ? 700 : 960}
          w={432}
          delay={r(tTodos) + i * 0.12}
        />
      ))}
      <div style={{ position: "absolute", left: 880, top: 610 }}>
        <Spark size={90} delay={r(tTodos) + 0.6} />
      </div>
    </AbsoluteFill>
  );
};

// ---------------- 01 Automatizaciones ----------------
export const Transfer: React.FC<S> = ({ t0 }) => (
  <AbsoluteFill>
    <Title delay={0.05}>
      Transferir <Hl>datos</Hl>
    </Title>
    <NodeCard icon={Icon.database} label="Datos" x={96} y={860} w={320} delay={0.15} />
    <NodeCard icon={Icon.portal} label="Plataforma" x={664} y={860} w={320} delay={0.3} />
    <Flow from={[416, 967]} to={[664, 967]} bend={-70} delay={0.45} dots={3} period={1.1} />
  </AbsoluteFill>
);

export const Sync: React.FC<S & { tWa: number; tCrm: number }> = ({ t0, tWa, tCrm }) => {
  const r = R(t0);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pulse = (t: number) => {
    const f = frame - Math.round(r(t) * fps);
    return interpolate(f, [0, 6, 18], [1, 1.08, 1], clamp);
  };
  return (
    <AbsoluteFill>
      <Title delay={0.05}>
        Sincronizar <Hl>datos</Hl>
      </Title>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${pulse(tWa)})`, transformOrigin: "256px 967px" }}>
        <NodeCard icon={Icon.chat} label="WhatsApp" x={96} y={860} w={320} delay={0.15} />
      </div>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${pulse(tCrm)})`, transformOrigin: "824px 967px" }}>
        <NodeCard icon={Icon.crm} label="CRM" x={664} y={860} w={320} delay={0.3} />
      </div>
      <Flow from={[416, 925]} to={[664, 925]} bend={-50} delay={0.45} dots={2} />
      <Flow from={[664, 1010]} to={[416, 1010]} bend={-50} delay={0.6} dots={2} />
    </AbsoluteFill>
  );
};

export const Route: React.FC<S & { tLeads: number }> = ({ t0, tLeads }) => {
  const r = R(t0);
  const ys = [660, 910, 1160];
  return (
    <AbsoluteFill>
      <Title delay={0.05}>
        Rutear <Hl>información</Hl>
      </Title>
      <NodeCard icon={Icon.lead} label="Leads" x={96} y={910} w={300} delay={0.15} accent />
      {ys.map((y, i) => (
        <React.Fragment key={y}>
          <NodeCard icon={Icon.user} label={`Asesor ${i + 1}`} x={704} y={y} w={280} delay={r(tLeads) - 0.4 + i * 0.12} />
          <Flow from={[396, 1017]} to={[704, y + 107]} bend={i === 1 ? 0 : i === 0 ? 40 : -40} delay={r(tLeads) + i * 0.15} dots={1} period={1.4} />
        </React.Fragment>
      ))}
    </AbsoluteFill>
  );
};

// ---------------- 02 Flujos con IA ----------------
export const Summarize: React.FC<S & { tRes: number; tExt: number }> = ({ t0, tRes, tExt }) => {
  const r = R(t0);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = interpolate(frame, [Math.round(r(tRes) * fps), Math.round((r(tRes) + 0.8) * fps)], [0, 1], {
    easing: mnc.ease.inOut,
    ...clamp,
  });
  const p = useEnter(0.15, "pop");
  const exit = useExit(0.22);
  const lines = [1, 0.92, 0.97, 0.84, 0.95, 0.7, 0.9, 0.6];
  return (
    <AbsoluteFill>
      <Title delay={0.05}>
        <Hl>Flujos</Hl> con IA
      </Title>
      <Card style={{ position: "absolute", left: 96, top: 720, width: 540, padding: 40, ...rise(p, 40, exit) }}>
        <div style={{ width: 64, height: 64, color: mnc.colors.accent, marginBottom: 20 }}>{Icon.doc}</div>
        {lines.map((w, i) => {
          const keep = i < 3;
          const h = keep ? 14 : interpolate(k, [0, 1], [14, 0]);
          return (
            <div
              key={i}
              style={{
                height: h,
                marginBottom: keep ? 14 : interpolate(k, [0, 1], [14, 0]),
                width: `${w * 100}%`,
                borderRadius: 7,
                background: keep && k > 0.5 ? mnc.colors.accent : mnc.colors.gray,
                opacity: keep ? 1 : 1 - k,
              }}
            />
          );
        })}
      </Card>
      <Chip label="Resumir" x={680} y={760} delay={r(tRes)} />
      <Chip label="Extraer" x={680} y={880} delay={r(tExt)} filled={false} />
      <Chip label="Generar" x={680} y={1000} delay={r(tExt) + 0.2} filled={false} />
    </AbsoluteFill>
  );
};

export const Maps: React.FC<S & { tMaps: number; tDir: number; tTel: number; tCal: number }> = ({
  t0,
  tMaps,
  tDir,
  tTel,
  tCal,
}) => {
  const r = R(t0);
  const p = useEnter(r(tMaps) - 0.3, "pop");
  const exit = useExit(0.22);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pins: [number, number][] = [
    [120, 140],
    [300, 90],
    [230, 260],
  ];
  const rows = [0, 1, 2];
  return (
    <AbsoluteFill>
      <Title delay={0.05}>
        Extraer de <Hl>Google Maps</Hl>
      </Title>
      {/* stylised map: street grid in neutral grey, pins in orange */}
      <Card style={{ position: "absolute", left: 96, top: 700, width: 440, height: 520, overflow: "hidden", ...rise(p, 40, exit) }}>
        <svg width={440} height={520} style={{ position: "absolute", inset: 0 }}>
          {[60, 150, 250, 340].map((y) => (
            <line key={`h${y}`} x1={0} y1={y} x2={420} y2={y + 30} stroke={mnc.colors.gray} strokeWidth={10} strokeOpacity={0.35} />
          ))}
          {[90, 210, 330].map((x) => (
            <line key={`v${x}`} x1={x} y1={0} x2={x - 40} y2={420} stroke={mnc.colors.gray} strokeWidth={10} strokeOpacity={0.35} />
          ))}
        </svg>
        {pins.map(([x, y], i) => {
          const pp = useEnterAt(frame, fps, r(tMaps) + 0.1 + i * 0.12);
          return (
            <div key={i} style={{ position: "absolute", left: x - 28, top: y - 56, width: 56, height: 56, color: mnc.colors.accent, transform: `translateY(${(1 - pp) * -30}px) scale(${pp})` }}>
              {Icon.pin}
            </div>
          );
        })}
      </Card>
      <Flow from={[536, 860]} to={[600, 860]} delay={r(tDir)} dots={1} period={0.9} />
      {rows.map((i) => {
        const pr = useEnterAt(frame, fps, r(tDir) + i * 0.14);
        const pt = useEnterAt(frame, fps, r(tTel) + i * 0.14);
        return (
          <Card
            key={i}
            style={{
              position: "absolute",
              left: 600,
              top: 700 + i * 150,
              width: 384,
              padding: "18px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              ...rise(pr, 30, exit),
            }}
          >
            <Row icon={Icon.pin} w={0.85} />
            <div style={{ opacity: pt }}>
              <Row icon={Icon.phone} w={0.6} />
            </div>
          </Card>
        );
      })}
      <Chip label="Leads calificados" x={600} y={1160} delay={r(tCal)} />
    </AbsoluteFill>
  );
};

const useEnterAt = (frame: number, fps: number, delay: number) =>
  interpolate(frame - Math.round(delay * fps), [0, Math.round(fps * 0.35)], [0, 1], { easing: mnc.ease.out, ...clamp });

const Row: React.FC<{ icon: React.ReactNode; w: number }> = ({ icon, w }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
    <div style={{ width: 34, height: 34, color: mnc.colors.accent, flex: "none" }}>{icon}</div>
    <div style={{ height: 12, borderRadius: 6, background: mnc.colors.gray, width: `${w * 100}%` }} />
  </div>
);

export const Ficha: React.FC<S & { tCtx: number; tFicha: number }> = ({ t0, tCtx, tFicha }) => {
  const r = R(t0);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = useEnter(r(tFicha) - 0.2, "pop");
  const exit = useExit(0.22);
  const typed = interpolate(frame, [Math.round(r(tFicha) * fps), Math.round((r(tFicha) + 1) * fps)], [0, 1], clamp);
  const ctx: [React.ReactNode, number][] = [
    [Icon.chat, 720],
    [Icon.mail, 900],
    [Icon.doc, 1080],
  ];
  return (
    <AbsoluteFill>
      <Title delay={0.05}>
        Generar una <Hl>ficha</Hl>
      </Title>
      {ctx.map(([ic, y], i) => {
        const pc = useEnterAt(frame, fps, r(tCtx) + i * 0.12);
        return (
          <Card key={y} style={{ position: "absolute", left: 96, top: y, width: 140, height: 140, padding: 32, color: mnc.colors.accent, ...rise(pc, 30, exit) }}>
            {ic}
          </Card>
        );
      })}
      {[790, 970, 1150].map((y, i) => (
        <Flow key={y} from={[236, y]} to={[470, 960]} bend={i === 1 ? 0 : i === 0 ? -30 : 30} delay={r(tCtx) + 0.3 + i * 0.1} dots={1} period={1} />
      ))}
      <Card style={{ position: "absolute", left: 470, top: 780, width: 514, padding: 38, ...rise(p, 40, exit) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 26 }}>
          <div style={{ width: 84, height: 84, color: mnc.colors.accent }}>{Icon.idcard}</div>
          <div style={{ fontFamily: mnc.fonts.title, fontWeight: mnc.weight.bold, fontSize: 40, letterSpacing: mnc.tracking.title }}>Ficha</div>
        </div>
        {[0.9, 0.7, 0.8, 0.55].map((w, i) => (
          <div key={i} style={{ height: 14, marginBottom: 16, borderRadius: 7, background: i === 0 ? mnc.colors.accent : mnc.colors.gray, width: `${Math.max(0, Math.min(1, typed * 4 - i)) * w * 100}%` }} />
        ))}
      </Card>
    </AbsoluteFill>
  );
};

// ---------------- 03 Agentes de IA ----------------
const Core: React.FC<{ x: number; y: number; label: string; delay?: number; size?: number }> = ({ x, y, label, delay = 0, size = 250 }) => {
  const p = useEnter(delay, "pop");
  const exit = useExit(0.22);
  const frame = useCurrentFrame();
  const breathe = 1 + Math.sin(frame / 20) * 0.02;
  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, ...rise(p, 30, exit) }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: `5px solid ${mnc.colors.accent}`,
          background: mnc.colors.black,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          transform: `scale(${breathe})`,
          boxShadow: `0 0 60px rgba(253,102,35,0.35)`,
        }}
      >
        <Spark size={size * 0.36} delay={delay + 0.1} />
        <div style={{ fontFamily: mnc.fonts.title, fontWeight: mnc.weight.bold, fontSize: size * 0.13, color: mnc.colors.white, textAlign: "center", lineHeight: 1.05 }}>
          {label}
        </div>
      </div>
    </div>
  );
};
export { Core };

export const Agents: React.FC<S & { tConect: number; tWeb: number; tMail: number; tWa: number }> = ({ t0, tConect, tWeb, tMail, tWa }) => {
  const r = R(t0);
  const C: [number, number] = [540, 1000];
  const tools: { icon: React.ReactNode; label: string; x: number; y: number; t: number }[] = [
    { icon: Icon.globe, label: "Web", x: 96, y: 1150, t: tWeb },
    { icon: Icon.mail, label: "Correo", x: 704, y: 1150, t: tMail },
    { icon: Icon.chat, label: "WhatsApp", x: 704, y: 620, t: tWa },
  ];
  return (
    <AbsoluteFill>
      <Title delay={0.05}>
        <Hl>Agentes</Hl> de IA
      </Title>
      <Core x={C[0]} y={C[1]} label="Agente" delay={0.2} />
      <NodeCard icon={Icon.apps} label="Herramientas" x={96} y={620} w={280} delay={r(tConect)} />
      <Flow from={[376, 727]} to={[C[0] - 110, C[1] - 70]} bend={30} delay={r(tConect) + 0.2} both />
      {tools.map((tl) => (
        <React.Fragment key={tl.label}>
          <NodeCard icon={tl.icon} label={tl.label} x={tl.x} y={tl.y} w={280} delay={r(tl.t) - 0.15} />
          <Flow
            from={[C[0] + (tl.x > 500 ? 110 : -110), C[1] + (tl.y > 900 ? 80 : -80)]}
            to={[tl.x + (tl.x > 500 ? 0 : 280), tl.y + 107]}
            bend={tl.x > 500 ? -30 : 30}
            delay={r(tl.t)}
            both
          />
        </React.Fragment>
      ))}
    </AbsoluteFill>
  );
};

export const Internos: React.FC<S & { tVend: number; tProd: number }> = ({ t0, tVend, tProd }) => {
  const r = R(t0);
  return (
    <AbsoluteFill>
      <Title delay={0.05}>
        Agentes <Hl>internos</Hl>
      </Title>
      <Core x={290} y={990} label="Agente" delay={0.15} size={250} />
      <NodeCard icon={Icon.team} label="Vendedores" x={664} y={700} w={320} delay={r(tVend) - 0.2} accent />
      <Flow from={[415, 950]} to={[664, 807]} bend={30} delay={r(tVend)} both />
      <NodeCard icon={Icon.box} label="Productos" x={664} y={1040} w={320} delay={r(tProd) - 0.2} />
      <Flow from={[415, 1040]} to={[664, 1147]} bend={-30} delay={r(tProd)} />
    </AbsoluteFill>
  );
};

// ---------------- 04 Apps ----------------
export const Apps: React.FC<S & { tForm: number; tCli: number; tProv: number; tCot: number; tTodo: number }> = ({
  t0,
  tForm,
  tCli,
  tProv,
  tCot,
  tTodo,
}) => {
  const r = R(t0);
  const cards: [React.ReactNode, string, number][] = [
    [Icon.form, "Formularios", tForm],
    [Icon.portal, "Portal para clientes", tCli],
    [Icon.portal, "Portal para proveedores", tProv],
    [Icon.calculator, "Cotizadores", tCot],
  ];
  return (
    <AbsoluteFill>
      <Title delay={0.05}>
        <Hl>Apps</Hl> creadas con IA
      </Title>
      {/* all four are present (dimmed) from the start; each lights up when mentioned */}
      {cards.map(([ic, l, t], i) => (
        <AppSlot key={l} t={r(t)}>
          <NodeCard icon={ic} label={l} x={i % 2 === 0 ? 96 : 552} y={i < 2 ? 680 : 960} w={432} delay={0.35 + i * 0.1} />
        </AppSlot>
      ))}
      <div style={{ position: "absolute", left: 870, top: 1190 }}>
        <Spark size={100} delay={r(tTodo)} />
      </div>
    </AbsoluteFill>
  );
};

const AppSlot: React.FC<{ t: number; children: React.ReactNode }> = ({ t, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const on = interpolate(frame, [Math.round((t - 0.1) * fps), Math.round((t + 0.15) * fps)], [0, 1], { easing: mnc.ease.out, ...clamp });
  const bump = interpolate(frame, [Math.round((t - 0.1) * fps), Math.round((t + 0.1) * fps), Math.round((t + 0.4) * fps)], [1, 1.05, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: 0.32 + 0.68 * on, transform: `scale(${bump})`, filter: on < 1 ? `grayscale(${1 - on})` : undefined }}>
      {children}
    </AbsoluteFill>
  );
};

// ---------------- Zapier: concrete starting point ----------------
export const ZapierIntro: React.FC<S & { tZap: number }> = ({ t0, tZap }) => {
  const r = R(t0);
  const p = useEnter(r(tZap) - 0.1, "pop");
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // logo settles above the capture card once the site footage starts
  const up = interpolate(frame, [Math.round((r(tZap) + 0.15) * fps), Math.round((r(tZap) + 0.5) * fps)], [0, 1], {
    easing: mnc.ease.inOut,
    ...clamp,
  });
  const lead = useEnter(0.1, "smooth");
  const leadOut = interpolate(frame, [Math.round((r(tZap) - 0.25) * fps), Math.round(r(tZap) * fps)], [0, 1], clamp);
  return (
    <AbsoluteFill>
      {/* his own words lead into the reveal: "...por donde puedes empezar es Zapier" */}
      <div
        style={{
          position: "absolute",
          left: mnc.safe.left,
          right: 1080 - mnc.safe.right,
          top: 640,
          fontFamily: mnc.fonts.title,
          fontWeight: mnc.weight.extrabold,
          fontSize: 104,
          lineHeight: 1.02,
          letterSpacing: "-0.02em",
          color: mnc.colors.white,
          ...rise(lead, 40, leadOut),
        }}
      >
        Por donde puedes <Hl>empezar</Hl>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: interpolate(up, [0, 1], [880, 368]),
          display: "flex",
          justifyContent: "center",
          opacity: p,
          transform: `scale(${interpolate(p, [0, 1], [0.9, 1]) * interpolate(up, [0, 1], [1, 0.62])})`,
        }}
      >
        {/* official Zapier logo (frost variant for dark backgrounds), never recolored */}
        <Img src={staticZapier} style={{ width: 620, height: "auto" }} />
      </div>
    </AbsoluteFill>
  );
};
const staticZapier = staticFile("mnc/brand/logos/zapier-logo_frost.svg");

export const ZapierHand: React.FC<{ delay: number }> = ({ delay }) => (
  <div style={{ position: "absolute", left: 760, top: 470 }}>
    <HandArrow w={200} h={160} d="M 180 10 C 120 0, 40 30, 30 140" head={[30, 140, 95]} delay={delay} />
  </div>
);
