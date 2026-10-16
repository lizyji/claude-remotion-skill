import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { mnc } from "../mncTheme";
import { Chip, Hl, NodeCard, rise, Spark, useEnter, useExit } from "../components/Primitives";
import { Icon } from "../components/Icons";
import { Flow } from "../components/Flow";
import { Core } from "./Operativos";

type S = { t0: number };
const R = (t0: number) => (t: number) => Math.max(0, t - t0);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Title: React.FC<{ children: React.ReactNode; delay?: number; size?: number; top?: number }> = ({
  children,
  delay = 0,
  size = 76,
  top = 352,
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
        lineHeight: 1.04,
        letterSpacing: mnc.tracking.title,
        color: mnc.colors.white,
        ...rise(p, 40, exit),
      }}
    >
      {children}
    </div>
  );
};

// Section opener: "Casos de uso de análisis".
export const AnalisisOpener: React.FC<S> = () => (
  <AbsoluteFill>
    <Title delay={0.05} size={104} top={560}>
      Casos de uso de <Hl>análisis</Hl>
    </Title>
    <div style={{ position: "absolute", left: 810, top: 420 }}>
      <Spark size={130} delay={0.35} />
    </div>
  </AbsoluteFill>
);

// Sources → Cerebro (filtra · unifica · categoriza)
export const BrainSources: React.FC<S & { tCerebro: number; tFuentes: number; tFiltra: number; tUnifica: number; tCat: number }> = ({
  t0,
  tCerebro,
  tFuentes,
  tFiltra,
  tUnifica,
  tCat,
}) => {
  const r = R(t0);
  const core: [number, number] = [750, 960];
  // source names as shown on Manuel's own slide ("Tus fuentes")
  const src: [React.ReactNode, string][] = [
    [Icon.database, "Sistemas"],
    [Icon.mail, "Bandejas de entrada"],
    [Icon.doc, "Documentos"],
    [Icon.sensor, "Sensores"],
  ];
  return (
    <AbsoluteFill>
      <Title delay={0.05}>
        El <Hl>cerebro</Hl>
      </Title>
      <Core x={core[0]} y={core[1]} label="Cerebro" delay={r(tCerebro) - 0.1} size={300} />
      {src.map(([ic, l], i) => (
        <React.Fragment key={l}>
          <SourceRow icon={ic} label={l} y={660 + i * 150} delay={r(tFuentes) - 0.5 + i * 0.12} />
          <Flow from={[420, 710 + i * 150]} to={[core[0] - 150, core[1] + (i - 1.5) * 40]} bend={(i - 1.5) * -18} delay={r(tFuentes) - 0.2 + i * 0.12} dots={1} period={1.1} />
        </React.Fragment>
      ))}
      <Chip label="Se filtra" x={96} y={1290} delay={r(tFiltra)} />
      <Chip label="Se unifica" x={372} y={1290} delay={r(tUnifica)} />
      <Chip label="Se categoriza" x={672} y={1290} delay={r(tCat)} />
    </AbsoluteFill>
  );
};

const SourceRow: React.FC<{ icon: React.ReactNode; label: string; y: number; delay: number }> = ({ icon, label, y, delay }) => {
  const p = useEnter(delay, "pop");
  const exit = useExit(0.22);
  return (
    <div
      style={{
        position: "absolute",
        left: 96,
        top: y,
        width: 324,
        height: 100,
        borderRadius: 20,
        background: mnc.colors.card,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "0 20px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        ...rise(p, 26, exit),
      }}
    >
      <div style={{ width: 52, height: 52, color: mnc.colors.accent, flex: "none" }}>{icon}</div>
      <div style={{ fontFamily: mnc.fonts.title, fontWeight: mnc.weight.semibold, fontSize: 27, lineHeight: 1.08, color: mnc.colors.ink }}>{label}</div>
    </div>
  );
};

// Cerebro → solutions built on top of it
export const BrainSolutions: React.FC<S & { tPron: number; tConc: number; tAlert: number }> = ({ t0, tPron, tConc, tAlert }) => {
  const r = R(t0);
  const core: [number, number] = [290, 980];
  const out: [React.ReactNode, string, number][] = [
    [Icon.chart, "Pronóstico y planeación", tPron],
    [Icon.check, "Conciliación", tConc],
    [Icon.bell, "Alertas", tAlert],
  ];
  return (
    <AbsoluteFill>
      <Title delay={0.05}>
        Soluciones arriba del <Hl>cerebro</Hl>
      </Title>
      <Core x={core[0]} y={core[1]} label="Cerebro" delay={0.05} size={280} />
      {out.map(([ic, l, t], i) => (
        <React.Fragment key={l}>
          <OutRow icon={ic} label={l} y={690 + i * 210} delay={r(t) - 0.2} />
          <Flow from={[core[0] + 140, core[1] + (i - 1) * 60]} to={[560, 750 + i * 210]} bend={(i - 1) * 20} delay={r(t) - 0.05} dots={1} period={1} />
        </React.Fragment>
      ))}
    </AbsoluteFill>
  );
};

const OutRow: React.FC<{ icon: React.ReactNode; label: string; y: number; delay: number }> = ({ icon, label, y, delay }) => {
  const p = useEnter(delay, "pop");
  const exit = useExit(0.22);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const glow = interpolate(frame - Math.round(delay * fps), [0, 8, 30], [0, 1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 560,
        top: y,
        width: 424,
        minHeight: 120,
        borderRadius: 22,
        background: mnc.colors.card,
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "16px 22px",
        boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 ${40 * glow}px rgba(253,102,35,${0.5 * glow})`,
        ...rise(p, 30, exit),
      }}
    >
      <div style={{ width: 64, height: 64, color: mnc.colors.accent, flex: "none" }}>{icon}</div>
      <div style={{ fontFamily: mnc.fonts.title, fontWeight: mnc.weight.semibold, fontSize: 32, lineHeight: 1.1, color: mnc.colors.ink }}>{label}</div>
    </div>
  );
};

// Cerebro → tu IA favorita (shared memory for the team)
export const BrainToAI: React.FC<S & { tIA: number }> = ({ t0, tIA }) => {
  const r = R(t0);
  return (
    <AbsoluteFill>
      <Title delay={0.05}>
        Conectado a tu <Hl>IA favorita</Hl>
      </Title>
      <Core x={290} y={990} label="Cerebro" delay={0.05} size={280} />
      <NodeCard icon={Icon.sparkle} label="Tu IA favorita" x={624} y={883} w={360} delay={r(tIA) - 0.3} accent />
      <Flow from={[430, 990]} to={[624, 990]} delay={r(tIA)} both dots={2} />
    </AbsoluteFill>
  );
};

// Overlay over the camera: "memoria compartida" + team, top band (above the head).
export const MemoryChip: React.FC<{ delay: number }> = ({ delay }) => {
  const p = useEnter(delay, "pop");
  const exit = useExit(0.25);
  return (
    <div
      style={{
        position: "absolute",
        left: mnc.safe.left,
        top: 300,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "14px 26px 14px 18px",
        borderRadius: 999,
        background: mnc.colors.accent,
        color: mnc.colors.black,
        fontFamily: mnc.fonts.body,
        fontWeight: mnc.weight.semibold,
        fontSize: 32,
        ...rise(p, 20, exit),
      }}
    >
      <div style={{ width: 44, height: 44 }}>{Icon.team}</div>
      Memoria compartida
    </div>
  );
};
